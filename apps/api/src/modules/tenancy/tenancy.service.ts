import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type { Business, BusinessType, Showroom, Tenant } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { RedisProvider } from '../../shared/redis/redis.provider';
import { AuthService } from '../auth/auth.service';
import type { ProvisionTenantDto } from './dto/provision-tenant.dto';
import { normalizeSubdomain } from './subdomain';

const TENANT_RESOLVER_CACHE_TTL_SECONDS = 300;
const TENANT_RESOLVER_CACHE_PREFIX = 'tenant-resolver:subdomain:';

@Injectable()
export class TenancyService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(RedisProvider) private readonly redisProvider: RedisProvider,
    @Inject(AuthService) private readonly authService: AuthService,
  ) {}

  async provision(sessionToken: string | undefined, dto: ProvisionTenantDto) {
    const user = await this.requireActiveUser(sessionToken);
    const subdomain = normalizeSubdomain(dto.subdomain);
    const businessName = this.requireString(dto.businessName, 'El nombre del negocio es obligatorio.');
    const businessTypeCode = this.requireString(
      dto.businessTypeCode,
      'El tipo de negocio es obligatorio.',
    ).toLowerCase();

    const existingShowroom = await this.prisma.showroom.findUnique({ where: { subdomain } });

    if (existingShowroom) {
      throw new ConflictException('Ese subdominio no está disponible.');
    }

    const businessType = await this.prisma.businessType.findUnique({
      where: { code: businessTypeCode },
    });

    if (!businessType) {
      throw new BadRequestException('El tipo de negocio no es válido.');
    }

    const plan = await this.prisma.subscriptionPlan.findUnique({ where: { code: 'free' } });

    if (!plan) {
      throw new BadRequestException('El plan inicial no está configurado.');
    }

    const theme = await this.prisma.theme.findUnique({ where: { code: 'minimal' } });

    if (!theme) {
      throw new BadRequestException('El theme inicial no está configurado.');
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const tenant = await tx.tenant.create({
          data: {
            name: businessName,
            slug: subdomain,
            status: 'ACTIVE',
          },
        });

        const membership = await tx.membership.create({
          data: {
            tenantId: tenant.id,
            userId: user.id,
            role: 'BUSINESS_OWNER',
            status: 'ACTIVE',
          },
        });

        const business = await tx.business.create({
          data: {
            tenantId: tenant.id,
            businessTypeId: businessType.id,
            name: businessName,
            slug: subdomain,
            status: 'DRAFT',
          },
        });

        const showroom = await tx.showroom.create({
          data: {
            tenantId: tenant.id,
            businessId: business.id,
            subdomain,
            themeId: theme.id,
            status: 'DRAFT',
          },
        });

        await tx.themeConfiguration.create({
          data: {
            tenantId: tenant.id,
            showroomId: showroom.id,
            themeId: theme.id,
            primaryColor: '#0f766e',
            secondaryColor: '#1d1d1b',
            accentColor: '#f59e0b',
            fontFamily: 'Inter',
            coverStyle: 'solid',
            productCardStyle: 'compact',
            configuration: { borderRadius: '8px' },
          },
        });

        const subscription = await tx.subscription.create({
          data: {
            tenantId: tenant.id,
            planId: plan.id,
            status: 'TRIALING',
          },
        });

        return { tenant, membership, business, showroom, subscription, plan, businessType };
      });

      await this.invalidateSubdomain(subdomain);

      return {
        tenant: this.toTenantResponse(result.tenant),
        membership: {
          id: result.membership.id,
          role: result.membership.role,
          status: result.membership.status,
        },
        business: this.toBusinessResponse(result.business, result.businessType),
        showroom: this.toShowroomResponse(result.showroom),
        subscription: {
          id: result.subscription.id,
          status: result.subscription.status,
          plan: {
            code: result.plan.code,
            name: result.plan.name,
          },
        },
      };
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException('Ese subdominio no está disponible.');
      }

      throw error;
    }
  }

  async listForSession(sessionToken: string | undefined) {
    const user = await this.requireUser(sessionToken);
    const memberships = await this.prisma.membership.findMany({
      where: {
        userId: user.id,
        status: 'ACTIVE',
        tenant: {
          deletedAt: null,
        },
      },
      include: {
        tenant: {
          include: {
            businesses: {
              where: { deletedAt: null },
              include: { businessType: true, showroom: true },
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return {
      tenants: memberships.map((membership) => ({
        tenant: this.toTenantResponse(membership.tenant),
        membership: {
          id: membership.id,
          role: membership.role,
          status: membership.status,
        },
        businesses: membership.tenant.businesses.map((business) =>
          this.toBusinessResponse(business, business.businessType),
        ),
      })),
    };
  }

  async resolveBySubdomain(subdomainInput: string) {
    const subdomain = normalizeSubdomain(subdomainInput);
    const cacheKey = this.cacheKey(subdomain);
    const cached = await this.redisProvider.get(cacheKey);

    if (cached) {
      return JSON.parse(cached) as TenantResolutionResponse;
    }

    const showroom = await this.prisma.showroom.findUnique({
      where: { subdomain },
      include: {
        tenant: true,
        business: {
          include: { businessType: true },
        },
      },
    });

    if (
      !showroom ||
      showroom.deletedAt ||
      showroom.tenant.deletedAt ||
      showroom.tenant.status !== 'ACTIVE'
    ) {
      throw new NotFoundException('El tenant solicitado no existe.');
    }

    const response = {
      tenant: this.toTenantResponse(showroom.tenant),
      business: this.toBusinessResponse(showroom.business, showroom.business.businessType),
      showroom: this.toShowroomResponse(showroom),
    };

    await this.redisProvider.setJson(cacheKey, response, TENANT_RESOLVER_CACHE_TTL_SECONDS);

    return response;
  }

  async resolveContext(sessionToken: string | undefined, tenantId: string | undefined) {
    const user = await this.requireUser(sessionToken);

    if (!tenantId) {
      throw new BadRequestException('El tenant activo es obligatorio.');
    }

    const membership = await this.prisma.membership.findFirst({
      where: {
        tenantId,
        userId: user.id,
        status: 'ACTIVE',
        tenant: {
          status: 'ACTIVE',
          deletedAt: null,
        },
      },
      include: {
        tenant: {
          include: {
            businesses: {
              where: { deletedAt: null },
              include: { showroom: true, businessType: true },
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('No tienes acceso a ese tenant.');
    }

    return {
      tenant: this.toTenantResponse(membership.tenant),
      membership: {
        id: membership.id,
        role: membership.role,
        status: membership.status,
      },
      businesses: membership.tenant.businesses.map((business) =>
        this.toBusinessResponse(business, business.businessType),
      ),
    };
  }

  private async requireActiveUser(sessionToken: string | undefined) {
    const user = await this.requireUser(sessionToken);

    if (user.status !== 'ACTIVE') {
      throw new ForbiddenException('La cuenta debe estar activa para crear un tenant.');
    }

    return user;
  }

  private async requireUser(sessionToken: string | undefined) {
    const user = await this.authService.currentUser(sessionToken);

    if (!user) {
      throw new UnauthorizedException('No autenticado.');
    }

    return user;
  }

  private requireString(value: unknown, message: string) {
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new BadRequestException(message);
    }

    return value.trim();
  }

  private async invalidateSubdomain(subdomain: string) {
    await this.redisProvider.del(this.cacheKey(subdomain));
  }

  private cacheKey(subdomain: string) {
    return `${TENANT_RESOLVER_CACHE_PREFIX}${subdomain}`;
  }

  private isUniqueConstraintError(error: unknown) {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: unknown }).code === 'P2002'
    );
  }

  private toTenantResponse(tenant: TenantShape) {
    return {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      status: tenant.status,
    };
  }

  private toBusinessResponse(business: BusinessShape, businessType: BusinessTypeShape | null) {
    return {
      id: business.id,
      tenantId: business.tenantId,
      name: business.name,
      slug: business.slug,
      status: business.status,
      businessType: businessType
        ? {
            code: businessType.code,
            name: businessType.name,
          }
        : null,
      showroom:
        'showroom' in business && business.showroom
          ? {
              id: business.showroom.id,
              subdomain: business.showroom.subdomain,
              status: business.showroom.status,
            }
          : null,
    };
  }

  private toShowroomResponse(showroom: ShowroomShape) {
    return {
      id: showroom.id,
      tenantId: showroom.tenantId,
      businessId: showroom.businessId,
      subdomain: showroom.subdomain,
      status: showroom.status,
    };
  }
}

type TenantShape = Tenant;
type BusinessShape = Business & {
  showroom?: {
    id: string;
    subdomain: string;
    status: string;
  } | null;
};
type BusinessTypeShape = BusinessType;
type ShowroomShape = Showroom;

interface TenantResolutionResponse {
  tenant: {
    id: string;
    name: string;
    slug: string;
    status: Tenant['status'];
  };
  business: {
    id: string;
    tenantId: string;
    name: string;
    slug: string;
    status: Business['status'];
    businessType: {
      code: string;
      name: string;
    } | null;
  };
  showroom: {
    id: string;
    tenantId: string;
    businessId: string;
    subdomain: string;
    status: Showroom['status'];
  };
}
