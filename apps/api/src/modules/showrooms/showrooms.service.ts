import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type { Business, ContactChannel, Showroom, SocialProfile, Theme, ThemeConfiguration, WhatsAppConfiguration } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { RedisProvider } from '../../shared/redis/redis.provider';
import { AuthService } from '../auth/auth.service';
import type { UpdateBusinessProfileDto } from './dto/update-business-profile.dto';
import type { UpdateThemeDto } from './dto/update-theme.dto';
import type { UpdateContactDto } from './dto/update-contact.dto';

const PUBLIC_RESOLVER_CACHE_PREFIX = 'tenant-resolver:subdomain:';

@Injectable()
export class ShowroomsService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(RedisProvider) private readonly redisProvider: RedisProvider,
    @Inject(AuthService) private readonly authService: AuthService,
  ) {}

  async listThemes() {
    const themes = await this.prisma.theme.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { code: 'asc' },
    });

    return {
      themes: themes.map((theme) => this.toThemeResponse(theme)),
    };
  }

  async getManageState(sessionToken: string | undefined, showroomId: string) {
    const showroom = await this.requireShowroomAccess(sessionToken, showroomId);
    return this.toShowroomResponse(showroom);
  }

  async updateProfile(
    sessionToken: string | undefined,
    showroomId: string,
    dto: UpdateBusinessProfileDto,
  ) {
    const showroom = await this.requireShowroomAccess(sessionToken, showroomId);
    await this.prisma.business.update({
      where: { id: showroom.businessId },
      data: {
        name: this.cleanOptional(dto.name) ?? undefined,
        description: this.cleanOptional(dto.description) ?? undefined,
        shortDescription: this.cleanOptional(dto.shortDescription) ?? undefined,
        address: this.cleanOptional(dto.address) ?? undefined,
        phone: this.cleanOptional(dto.phone) ?? undefined,
        email: this.cleanOptional(dto.email) ?? undefined,
        timezone: this.cleanOptional(dto.timezone) ?? undefined,
        logoUrl: this.cleanOptional(dto.logoUrl) ?? undefined,
        coverImageUrl: this.cleanOptional(dto.coverImageUrl) ?? undefined,
      },
      include: this.businessInclude(),
    });

    await this.invalidatePublicCache(showroom.subdomain);

    return this.getManageState(sessionToken, showroomId);
  }

  async updateContact(sessionToken: string | undefined, showroomId: string, dto: UpdateContactDto) {
    const showroom = await this.requireShowroomAccess(sessionToken, showroomId);
    const contactRows = this.buildContactRows(showroom, dto);
    const socialRows = this.buildSocialRows(showroom, dto);

    await this.prisma.$transaction([
      this.prisma.business.update({
        where: { id: showroom.businessId },
        data: {
          phone: this.cleanOptional(dto.phone) ?? undefined,
          email: this.cleanOptional(dto.email) ?? undefined,
        },
      }),
      this.prisma.contactChannel.deleteMany({ where: { businessId: showroom.businessId } }),
      this.prisma.socialProfile.deleteMany({ where: { businessId: showroom.businessId } }),
      ...(contactRows.length > 0 ? [this.prisma.contactChannel.createMany({ data: contactRows })] : []),
      ...(socialRows.length > 0 ? [this.prisma.socialProfile.createMany({ data: socialRows })] : []),
      this.syncWhatsapp(showroom, dto),
    ]);

    await this.invalidatePublicCache(showroom.subdomain);

    return this.getManageState(sessionToken, showroomId);
  }

  async updateTheme(sessionToken: string | undefined, showroomId: string, dto: UpdateThemeDto) {
    const showroom = await this.requireShowroomAccess(sessionToken, showroomId);
    const theme = await this.prisma.theme.findUnique({ where: { code: dto.themeCode } });

    if (!theme || theme.status !== 'ACTIVE') {
      throw new BadRequestException('El theme seleccionado no está disponible.');
    }

    await this.prisma.$transaction([
      this.prisma.showroom.update({
        where: { id: showroom.id },
        data: { themeId: theme.id },
      }),
      this.prisma.themeConfiguration.upsert({
        where: { showroomId: showroom.id },
        create: {
          tenantId: showroom.tenantId,
          showroomId: showroom.id,
          themeId: theme.id,
          primaryColor: dto.primaryColor ?? '#0f766e',
          secondaryColor: dto.secondaryColor ?? '#1d1d1b',
          accentColor: dto.accentColor ?? '#f59e0b',
          fontFamily: this.cleanOptional(dto.fontFamily) ?? 'Inter',
          coverStyle: 'solid',
          productCardStyle: 'compact',
          configuration: { borderRadius: '8px' },
        },
        update: {
          themeId: theme.id,
          primaryColor: dto.primaryColor ?? undefined,
          secondaryColor: dto.secondaryColor ?? undefined,
          accentColor: dto.accentColor ?? undefined,
          fontFamily: this.cleanOptional(dto.fontFamily) ?? undefined,
        },
      }),
    ]);

    await this.invalidatePublicCache(showroom.subdomain);

    return this.getManageState(sessionToken, showroomId);
  }

  async setPublication(sessionToken: string | undefined, showroomId: string, publish: boolean) {
    const showroom = await this.requireShowroomAccess(sessionToken, showroomId);

    if (!publish) {
      await this.prisma.$transaction([
        this.prisma.showroom.update({
          where: { id: showroom.id },
          data: { status: 'DRAFT', publishedAt: null },
        }),
        this.prisma.business.update({
          where: { id: showroom.businessId },
          data: { status: 'DRAFT', publishedAt: null },
        }),
      ]);
      await this.invalidatePublicCache(showroom.subdomain);
      return this.getManageState(sessionToken, showroomId);
    }

    this.assertPublishable(showroom);
    const publishedAt = new Date();

    await this.prisma.$transaction([
      this.prisma.showroom.update({
        where: { id: showroom.id },
        data: { status: 'PUBLISHED', publishedAt },
      }),
      this.prisma.business.update({
        where: { id: showroom.businessId },
        data: { status: 'PUBLISHED', publishedAt },
      }),
    ]);

    await this.invalidatePublicCache(showroom.subdomain);
    return this.getManageState(sessionToken, showroomId);
  }

  async preview(sessionToken: string | undefined, showroomId: string) {
    const showroom = await this.requireShowroomAccess(sessionToken, showroomId);
    return {
      indexable: false,
      showroom: this.toShowroomResponse(showroom),
    };
  }

  async publicBySubdomain(subdomain: string) {
    const showroom = await this.prisma.showroom.findUnique({
      where: { subdomain: subdomain.trim().toLowerCase() },
      include: this.showroomInclude(),
    });

    if (
      !showroom ||
      showroom.deletedAt ||
      showroom.status !== 'PUBLISHED' ||
      showroom.tenant.status !== 'ACTIVE' ||
      showroom.tenant.deletedAt ||
      showroom.business.status !== 'PUBLISHED' ||
      showroom.business.deletedAt
    ) {
      throw new NotFoundException('El showroom solicitado no existe.');
    }

    return {
      indexable: true,
      showroom: this.toShowroomResponse(showroom),
    };
  }

  private async requireShowroomAccess(sessionToken: string | undefined, showroomId: string) {
    const user = await this.authService.currentUser(sessionToken);

    if (!user) {
      throw new UnauthorizedException('No autenticado.');
    }

    const showroom = await this.prisma.showroom.findUnique({
      where: { id: showroomId },
      include: this.showroomInclude(),
    });

    if (!showroom || showroom.deletedAt || showroom.tenant.deletedAt) {
      throw new NotFoundException('El showroom solicitado no existe.');
    }

    const membership = await this.prisma.membership.findFirst({
      where: {
        tenantId: showroom.tenantId,
        userId: user.id,
        status: 'ACTIVE',
      },
    });

    if (!membership) {
      throw new ForbiddenException('No tienes acceso a ese showroom.');
    }

    return showroom;
  }

  private assertPublishable(showroom: ShowroomWithRelations) {
    if (showroom.status === 'SUSPENDED') {
      throw new BadRequestException('Un showroom suspendido no puede publicarse.');
    }

    if (!showroom.theme || showroom.theme.status !== 'ACTIVE' || !showroom.themeConfiguration) {
      throw new BadRequestException('Selecciona un theme activo antes de publicar.');
    }

    if (!showroom.business.description || showroom.business.description.trim().length < 10) {
      throw new BadRequestException('Completa la descripción del negocio antes de publicar.');
    }

    const hasContact =
      showroom.business.contactChannels.length > 0 ||
      Boolean(
        showroom.business.whatsappConfiguration?.enabled &&
          showroom.business.whatsappConfiguration.phoneNumber,
      );

    if (!hasContact) {
      throw new BadRequestException('Configura al menos un contacto antes de publicar.');
    }
  }

  private buildContactRows(showroom: ShowroomWithRelations, dto: UpdateContactDto) {
    const rows: Array<{
      tenantId: string;
      businessId: string;
      type: 'PHONE' | 'EMAIL';
      value: string;
      label: string;
      isPrimary: boolean;
    }> = [];
    const phone = this.cleanOptional(dto.phone);
    const email = this.cleanOptional(dto.email);

    if (phone) {
      rows.push({
        tenantId: showroom.tenantId,
        businessId: showroom.businessId,
        type: 'PHONE',
        value: phone,
        label: 'Teléfono',
        isPrimary: true,
      });
    }

    if (email) {
      rows.push({
        tenantId: showroom.tenantId,
        businessId: showroom.businessId,
        type: 'EMAIL',
        value: email,
        label: 'Correo',
        isPrimary: rows.length === 0,
      });
    }

    return rows;
  }

  private buildSocialRows(showroom: ShowroomWithRelations, dto: UpdateContactDto) {
    const rows: Array<{
      tenantId: string;
      businessId: string;
      type: 'INSTAGRAM' | 'FACEBOOK' | 'WEBSITE';
      url: string;
    }> = [];
    const instagramUrl = this.cleanOptional(dto.instagramUrl);
    const facebookUrl = this.cleanOptional(dto.facebookUrl);
    const websiteUrl = this.cleanOptional(dto.websiteUrl);

    if (instagramUrl) {
      rows.push({
        tenantId: showroom.tenantId,
        businessId: showroom.businessId,
        type: 'INSTAGRAM',
        url: instagramUrl,
      });
    }

    if (facebookUrl) {
      rows.push({
        tenantId: showroom.tenantId,
        businessId: showroom.businessId,
        type: 'FACEBOOK',
        url: facebookUrl,
      });
    }

    if (websiteUrl) {
      rows.push({
        tenantId: showroom.tenantId,
        businessId: showroom.businessId,
        type: 'WEBSITE',
        url: websiteUrl,
      });
    }

    return rows;
  }

  private syncWhatsapp(showroom: ShowroomWithRelations, dto: UpdateContactDto) {
    const phoneNumber = this.cleanOptional(dto.whatsappPhone);

    if (!phoneNumber) {
      return this.prisma.whatsAppConfiguration.deleteMany({
        where: { businessId: showroom.businessId },
      });
    }

    return this.prisma.whatsAppConfiguration.upsert({
      where: { businessId: showroom.businessId },
      create: {
        tenantId: showroom.tenantId,
        businessId: showroom.businessId,
        phoneNumber,
        defaultMessage: this.cleanOptional(dto.whatsappMessage),
        enabled: dto.whatsappEnabled ?? true,
      },
      update: {
        phoneNumber,
        defaultMessage: this.cleanOptional(dto.whatsappMessage),
        enabled: dto.whatsappEnabled ?? true,
      },
    });
  }

  private async invalidatePublicCache(subdomain: string) {
    await this.redisProvider.del(`${PUBLIC_RESOLVER_CACHE_PREFIX}${subdomain}`);
  }

  private cleanOptional(value: string | undefined) {
    if (typeof value !== 'string') {
      return undefined;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private toShowroomResponse(showroom: ShowroomWithRelations) {
    return {
      id: showroom.id,
      tenantId: showroom.tenantId,
      businessId: showroom.businessId,
      subdomain: showroom.subdomain,
      status: showroom.status,
      publishedAt: showroom.publishedAt?.toISOString() ?? null,
      theme: showroom.theme ? this.toThemeResponse(showroom.theme) : null,
      themeConfiguration: showroom.themeConfiguration
        ? this.toThemeConfigurationResponse(showroom.themeConfiguration)
        : null,
      business: this.toBusinessResponse(showroom.business),
      contacts: showroom.business.contactChannels.map((contact) => ({
        id: contact.id,
        type: contact.type,
        value: contact.value,
        label: contact.label,
        isPrimary: contact.isPrimary,
      })),
      socialProfiles: showroom.business.socialProfiles.map((profile) => ({
        id: profile.id,
        type: profile.type,
        url: profile.url,
      })),
      whatsapp: showroom.business.whatsappConfiguration
        ? {
            phoneNumber: showroom.business.whatsappConfiguration.phoneNumber,
            defaultMessage: showroom.business.whatsappConfiguration.defaultMessage,
            enabled: showroom.business.whatsappConfiguration.enabled,
          }
        : null,
    };
  }

  private toBusinessResponse(business: BusinessWithType) {
    return {
      id: business.id,
      name: business.name,
      slug: business.slug,
      status: business.status,
      description: business.description,
      shortDescription: business.shortDescription,
      address: business.address,
      phone: business.phone,
      email: business.email,
      timezone: business.timezone,
      logoUrl: business.logoUrl,
      coverImageUrl: business.coverImageUrl,
      businessType: business.businessType
        ? {
            code: business.businessType.code,
            name: business.businessType.name,
          }
        : null,
    };
  }

  private toThemeResponse(theme: Theme) {
    return {
      code: theme.code,
      name: theme.name,
      description: theme.description,
      version: theme.version,
      status: theme.status,
    };
  }

  private toThemeConfigurationResponse(configuration: ThemeConfiguration) {
    return {
      primaryColor: configuration.primaryColor,
      secondaryColor: configuration.secondaryColor,
      accentColor: configuration.accentColor,
      fontFamily: configuration.fontFamily,
      coverStyle: configuration.coverStyle,
      productCardStyle: configuration.productCardStyle,
    };
  }

  private showroomInclude() {
    return {
      tenant: true,
      theme: true,
      themeConfiguration: true,
      business: {
        include: this.businessInclude(),
      },
    } as const;
  }

  private businessInclude() {
    return {
      businessType: true,
      contactChannels: true,
      socialProfiles: true,
      whatsappConfiguration: true,
    } as const;
  }
}

type BusinessWithType = Business & {
  businessType: {
    code: string;
    name: string;
  } | null;
  contactChannels: ContactChannel[];
  socialProfiles: SocialProfile[];
  whatsappConfiguration: WhatsAppConfiguration | null;
};

type ShowroomWithRelations = Showroom & {
  tenant: {
    id: string;
    status: string;
    deletedAt: Date | null;
  };
  business: BusinessWithType;
  theme: Theme | null;
  themeConfiguration: ThemeConfiguration | null;
};
