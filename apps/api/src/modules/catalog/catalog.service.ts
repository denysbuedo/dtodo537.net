import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  OnModuleDestroy,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { randomUUID } from 'node:crypto';
import type { Business, Category, MediaAsset, MediaVariant, Product, ProductAttribute, ProductImage } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { RedisProvider } from '../../shared/redis/redis.provider';
import { toSlug } from '../../shared/text/slug';
import { loadRuntimeConfig } from '../../shared/config/runtime-config';
import { ALLOWED_IMAGE_MIME_TYPES, MAX_IMAGE_UPLOAD_BYTES, MEDIA_PROCESSING_QUEUE } from '../media/media.constants';
import { StorageService } from '../media/storage.service';
import type { CreateCategoryDto, ReorderCategoriesDto, UpdateCategoryDto } from './dto/category.dto';
import type {
  CreateProductDto,
  PublishProductDto,
  QuickUpdateProductDto,
  ReorderProductImagesDto,
  UpdateProductDto,
} from './dto/product.dto';

@Injectable()
export class CatalogService implements OnModuleDestroy {
  private readonly mediaQueue: Queue;
  private readonly apiUrl: string;

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(RedisProvider) private readonly redisProvider: RedisProvider,
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(StorageService) private readonly storage: StorageService,
  ) {
    const config = loadRuntimeConfig();
    this.apiUrl = config.API_URL.replace(/\/$/, '');
    this.mediaQueue = new Queue(MEDIA_PROCESSING_QUEUE, {
      connection: this.redisProvider.client,
      prefix: 'dtodo',
    });
  }

  async onModuleDestroy() {
    await this.mediaQueue.close();
  }

  async getBusinessCatalog(sessionToken: string | undefined, businessId: string) {
    const business = await this.requireBusinessAccess(sessionToken, businessId);
    const [categories, products] = await Promise.all([
      this.prisma.category.findMany({
        where: { businessId: business.id, deletedAt: null },
        orderBy: [{ position: 'asc' }, { name: 'asc' }],
      }),
      this.prisma.product.findMany({
        where: { businessId: business.id, deletedAt: null },
        include: this.productInclude(),
        orderBy: [{ featured: 'desc' }, { position: 'asc' }, { updatedAt: 'desc' }],
      }),
    ]);

    return {
      business: this.toBusinessResponse(business),
      categories: categories.map((category) => this.toCategoryResponse(category)),
      products: products.map((product) => this.toProductResponse(product)),
    };
  }

  async createCategory(sessionToken: string | undefined, businessId: string, dto: CreateCategoryDto) {
    const business = await this.requireBusinessAccess(sessionToken, businessId);
    const category = await this.prisma.category.create({
      data: {
        tenantId: business.tenantId,
        businessId: business.id,
        parentId: dto.parentId ?? null,
        name: dto.name.trim(),
        slug: this.normalizedSlug(dto.slug ?? dto.name),
        description: this.cleanOptional(dto.description),
        position: dto.position ?? 0,
      },
    });

    return { category: this.toCategoryResponse(category) };
  }

  async updateCategory(sessionToken: string | undefined, categoryId: string, dto: UpdateCategoryDto) {
    const category = await this.requireCategoryAccess(sessionToken, categoryId);
    const updated = await this.prisma.category.update({
      where: { id: category.id },
      data: {
        parentId: dto.parentId ?? undefined,
        name: dto.name ? dto.name.trim() : undefined,
        slug: dto.slug || dto.name ? this.normalizedSlug(dto.slug ?? dto.name) : undefined,
        description: dto.description === undefined ? undefined : this.cleanOptional(dto.description),
        position: dto.position ?? undefined,
      },
    });

    return { category: this.toCategoryResponse(updated) };
  }

  async reorderCategories(sessionToken: string | undefined, businessId: string, dto: ReorderCategoriesDto) {
    const business = await this.requireBusinessAccess(sessionToken, businessId);
    await this.prisma.$transaction(
      dto.categoryIds.map((id, index) =>
        this.prisma.category.updateMany({
          where: { id, businessId: business.id, tenantId: business.tenantId },
          data: { position: index },
        }),
      ),
    );

    return this.getBusinessCatalog(sessionToken, businessId);
  }

  async archiveCategory(sessionToken: string | undefined, categoryId: string) {
    const category = await this.requireCategoryAccess(sessionToken, categoryId);
    await this.prisma.category.update({
      where: { id: category.id },
      data: { status: 'ARCHIVED', deletedAt: new Date() },
    });

    return { message: 'Categoría archivada.' };
  }

  async createProduct(sessionToken: string | undefined, businessId: string, dto: CreateProductDto) {
    const business = await this.requireBusinessAccess(sessionToken, businessId);
    await this.assertCategoryBelongsToBusiness(business, dto.categoryId);
    const product = await this.prisma.product.create({
      data: {
        tenantId: business.tenantId,
        businessId: business.id,
        categoryId: dto.categoryId ?? null,
        name: dto.name.trim(),
        slug: this.normalizedSlug(dto.slug ?? dto.name),
        shortDescription: this.cleanOptional(dto.shortDescription),
        description: this.cleanOptional(dto.description),
        price: this.toDecimal(dto.price),
        previousPrice: this.toDecimal(dto.previousPrice),
        currency: (dto.currency ?? 'CUP').toUpperCase(),
        priceMode: dto.priceMode ?? 'CONTACT',
        availabilityStatus: dto.availabilityStatus ?? 'AVAILABLE',
        featured: dto.featured ?? false,
        position: dto.position ?? 0,
        attributes: this.attributeCreateMany(business.tenantId, dto.attributes),
      },
      include: this.productInclude(),
    });

    return { product: this.toProductResponse(product) };
  }

  async updateProduct(sessionToken: string | undefined, productId: string, dto: UpdateProductDto) {
    const product = await this.requireProductAccess(sessionToken, productId);
    await this.assertCategoryBelongsToBusiness(product.business, dto.categoryId);
    const updated = await this.prisma.$transaction(async (tx) => {
      const saved = await tx.product.update({
        where: { id: product.id },
        data: {
          categoryId: dto.categoryId === undefined ? undefined : dto.categoryId,
          name: dto.name ? dto.name.trim() : undefined,
          slug: dto.slug || dto.name ? this.normalizedSlug(dto.slug ?? dto.name) : undefined,
          shortDescription: dto.shortDescription === undefined ? undefined : this.cleanOptional(dto.shortDescription),
          description: dto.description === undefined ? undefined : this.cleanOptional(dto.description),
          price: dto.price === undefined ? undefined : this.toDecimal(dto.price),
          previousPrice: dto.previousPrice === undefined ? undefined : this.toDecimal(dto.previousPrice),
          currency: dto.currency ? dto.currency.toUpperCase() : undefined,
          priceMode: dto.priceMode ?? undefined,
          availabilityStatus: dto.availabilityStatus ?? undefined,
          featured: dto.featured ?? undefined,
          position: dto.position ?? undefined,
        },
      });

      if (dto.attributes) {
        await tx.productAttribute.deleteMany({ where: { productId: product.id } });
        await tx.productAttribute.createMany({
          data: dto.attributes.map((attribute, index) => ({
            tenantId: product.tenantId,
            productId: product.id,
            name: attribute.name.trim(),
            value: attribute.value.trim(),
            position: index,
          })),
        });
      }

      return saved;
    });

    return { product: await this.findProductResponse(updated.id) };
  }

  async quickUpdateProduct(sessionToken: string | undefined, productId: string, dto: QuickUpdateProductDto) {
    const product = await this.requireProductAccess(sessionToken, productId);
    await this.prisma.product.update({
      where: { id: product.id },
      data: {
        price: dto.price === undefined ? undefined : this.toDecimal(dto.price),
        priceMode: dto.priceMode ?? undefined,
        availabilityStatus: dto.availabilityStatus ?? undefined,
      },
    });

    return { product: await this.findProductResponse(product.id) };
  }

  async setProductPublication(sessionToken: string | undefined, productId: string, dto: PublishProductDto) {
    const product = await this.requireProductAccess(sessionToken, productId);

    if (dto.publish) {
      this.assertProductPublishable(product);
    }

    await this.prisma.product.update({
      where: { id: product.id },
      data: {
        publicationStatus: dto.publish ? 'PUBLISHED' : 'UNPUBLISHED',
        publishedAt: dto.publish ? new Date() : null,
      },
    });

    return { product: await this.findProductResponse(product.id) };
  }

  async uploadProductImage(
    sessionToken: string | undefined,
    productId: string,
    file: Express.Multer.File | undefined,
  ) {
    const product = await this.requireProductAccess(sessionToken, productId);

    if (!file) {
      throw new BadRequestException('La imagen es obligatoria.');
    }

    this.validateImageUpload(file);
    await this.validateMediaQuota(product.tenantId);

    const objectKey = this.buildObjectKey(product.tenantId, file.originalname, file.mimetype);
    try {
      await this.storage.putObject({
        objectKey,
        body: file.buffer,
        contentType: file.mimetype,
      });
    } catch {
      throw new ServiceUnavailableException(
        'El storage de imágenes no está disponible. Revisa la configuración S3-compatible.',
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const imageCount = await tx.productImage.count({ where: { productId: product.id } });
      const media = await tx.mediaAsset.create({
        data: {
          tenantId: product.tenantId,
          bucket: this.storage.getBucket(),
          objectKey,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          status: 'UPLOADED',
        },
      });

      if (imageCount === 0) {
        await tx.productImage.updateMany({ where: { productId: product.id }, data: { isPrimary: false } });
      }

      const productImage = await tx.productImage.create({
        data: {
          tenantId: product.tenantId,
          productId: product.id,
          mediaId: media.id,
          position: imageCount,
          isPrimary: imageCount === 0,
          altText: product.name,
        },
      });

      return { media, productImage };
    });

    await this.mediaQueue.add(
      'process-image',
      { mediaAssetId: result.media.id },
      { jobId: `media-${result.media.id}`, removeOnComplete: true, removeOnFail: false },
    );

    return {
      image: this.toProductImageResponse({ ...result.productImage, media: { ...result.media, variants: [] } }),
    };
  }

  async reorderProductImages(sessionToken: string | undefined, productId: string, dto: ReorderProductImagesDto) {
    const product = await this.requireProductAccess(sessionToken, productId);
    await this.prisma.$transaction(
      dto.imageIds.map((id, index) =>
        this.prisma.productImage.updateMany({
          where: { id, productId: product.id, tenantId: product.tenantId },
          data: { position: index, isPrimary: index === 0 },
        }),
      ),
    );

    return { product: await this.findProductResponse(product.id) };
  }

  async deleteProductImage(sessionToken: string | undefined, productId: string, imageId: string) {
    const product = await this.requireProductAccess(sessionToken, productId);
    await this.prisma.productImage.deleteMany({
      where: { id: imageId, productId: product.id, tenantId: product.tenantId },
    });

    return { product: await this.findProductResponse(product.id) };
  }

  async publicCatalogBySubdomain(subdomain: string) {
    const showroom = await this.requirePublicShowroom(subdomain);
    const products = await this.prisma.product.findMany({
      where: {
        businessId: showroom.businessId,
        tenantId: showroom.tenantId,
        deletedAt: null,
        publicationStatus: 'PUBLISHED',
      },
      include: this.productInclude(),
      orderBy: [{ featured: 'desc' }, { position: 'asc' }, { publishedAt: 'desc' }],
    });

    return {
      products: products.map((product) => this.toProductResponse(product)),
    };
  }

  async publicProductBySlug(subdomain: string, slug: string) {
    const showroom = await this.requirePublicShowroom(subdomain);
    const product = await this.prisma.product.findFirst({
      where: {
        businessId: showroom.businessId,
        tenantId: showroom.tenantId,
        slug,
        deletedAt: null,
        publicationStatus: 'PUBLISHED',
      },
      include: this.productInclude(),
    });

    if (!product) {
      throw new NotFoundException('El producto solicitado no existe.');
    }

    return { product: this.toProductResponse(product) };
  }

  private async requireBusinessAccess(sessionToken: string | undefined, businessId: string) {
    const user = await this.authService.currentUser(sessionToken);

    if (!user) {
      throw new UnauthorizedException('No autenticado.');
    }

    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      include: { businessType: true, tenant: true },
    });

    if (!business || business.deletedAt || business.tenant.deletedAt) {
      throw new NotFoundException('El negocio solicitado no existe.');
    }

    const membership = await this.prisma.membership.findFirst({
      where: { tenantId: business.tenantId, userId: user.id, status: 'ACTIVE' },
    });

    if (!membership) {
      throw new ForbiddenException('No tienes acceso a ese negocio.');
    }

    return business;
  }

  private async requireCategoryAccess(sessionToken: string | undefined, categoryId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
      include: { business: { include: { businessType: true, tenant: true } } },
    });

    if (!category || category.deletedAt) {
      throw new NotFoundException('La categoría solicitada no existe.');
    }

    await this.requireBusinessAccess(sessionToken, category.businessId);
    return category;
  }

  private async requireProductAccess(
    sessionToken: string | undefined,
    productId: string,
  ): Promise<ProductAccess> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { ...this.productInclude(), business: { include: { businessType: true, tenant: true } } },
    });

    if (!product || product.deletedAt) {
      throw new NotFoundException('El producto solicitado no existe.');
    }

    await this.requireBusinessAccess(sessionToken, product.businessId);
    return product as ProductAccess;
  }

  private async requirePublicShowroom(subdomain: string) {
    const showroom = await this.prisma.showroom.findUnique({
      where: { subdomain: subdomain.trim().toLowerCase() },
      include: { tenant: true, business: true },
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

    return showroom;
  }

  private async assertCategoryBelongsToBusiness(
    business: Business & { tenant: { deletedAt: Date | null }; businessType: unknown },
    categoryId: string | undefined,
  ) {
    if (!categoryId) {
      return;
    }

    const category = await this.prisma.category.findFirst({
      where: { id: categoryId, businessId: business.id, tenantId: business.tenantId, deletedAt: null },
    });

    if (!category) {
      throw new BadRequestException('La categoría no pertenece a este negocio.');
    }
  }

  private assertProductPublishable(product: ProductWithRelations) {
    if (!product.shortDescription && !product.description) {
      throw new BadRequestException('Completa una descripción antes de publicar.');
    }

    if (!['CONTACT', 'FREE'].includes(product.priceMode) && !product.price) {
      throw new BadRequestException('Define un precio o usa la modalidad consultar.');
    }

    if (product.availabilityStatus === 'UNAVAILABLE') {
      throw new BadRequestException('Un producto no disponible no puede publicarse.');
    }

    const hasImage = product.images.some((image) => ['UPLOADED', 'PROCESSING', 'READY'].includes(image.media.status));

    if (!hasImage) {
      throw new BadRequestException('Agrega al menos una imagen antes de publicar.');
    }
  }

  private async validateMediaQuota(tenantId: string) {
    const count = await this.prisma.mediaAsset.count({
      where: { tenantId, deletedAt: null },
    });

    if (count >= 100) {
      throw new BadRequestException('Límite de imágenes alcanzado para este tenant.');
    }
  }

  private validateImageUpload(file: Express.Multer.File) {
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Formato de imagen no permitido.');
    }

    if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
      throw new BadRequestException('La imagen excede el tamaño permitido.');
    }
  }

  private buildObjectKey(tenantId: string, originalName: string, mimeType: string) {
    const extension = this.extensionForMimeType(mimeType) ?? originalName.split('.').pop() ?? 'bin';
    return `tenants/${tenantId}/media/original/${randomUUID()}.${extension}`;
  }

  private extensionForMimeType(mimeType: string) {
    return {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/avif': 'avif',
    }[mimeType];
  }

  private async findProductResponse(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: this.productInclude(),
    });

    if (!product) {
      throw new NotFoundException('El producto solicitado no existe.');
    }

    return this.toProductResponse(product);
  }

  private productInclude() {
    const include = {
      category: true,
      attributes: { orderBy: { position: 'asc' } },
      images: {
        include: { media: { include: { variants: true } } },
        orderBy: [{ isPrimary: 'desc' }, { position: 'asc' }],
      },
    } satisfies Prisma.ProductInclude;

    return include;
  }

  private attributeCreateMany(tenantId: string, attributes: CreateProductDto['attributes']) {
    const rows = (attributes ?? [])
      .filter((attribute) => attribute.name.trim() && attribute.value.trim())
      .map((attribute, index) => ({
        tenantId,
        name: attribute.name.trim(),
        value: attribute.value.trim(),
        position: index,
      }));

    return rows.length > 0 ? { createMany: { data: rows } } : undefined;
  }

  private normalizedSlug(value: string | undefined) {
    const slug = toSlug(value ?? '');

    if (!slug) {
      throw new BadRequestException('El slug no es válido.');
    }

    return slug;
  }

  private cleanOptional(value: string | undefined) {
    if (typeof value !== 'string') {
      return undefined;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  private toDecimal(value: number | undefined) {
    return value === undefined ? undefined : new Prisma.Decimal(value);
  }

  private mediaUrl(mediaId: string, kind: 'ORIGINAL' | 'THUMBNAIL' | 'CARD' | 'LARGE') {
    return `${this.apiUrl}/media/${mediaId}/${kind}`;
  }

  private toBusinessResponse(business: Business & { businessType: { code: string; name: string } | null }) {
    return {
      id: business.id,
      tenantId: business.tenantId,
      name: business.name,
      slug: business.slug,
      status: business.status,
      businessType: business.businessType
        ? { code: business.businessType.code, name: business.businessType.name }
        : null,
    };
  }

  private toCategoryResponse(category: Category) {
    return {
      id: category.id,
      businessId: category.businessId,
      parentId: category.parentId,
      name: category.name,
      slug: category.slug,
      description: category.description,
      position: category.position,
      status: category.status,
    };
  }

  private toProductResponse(product: ProductWithRelations) {
    return {
      id: product.id,
      tenantId: product.tenantId,
      businessId: product.businessId,
      category: product.category ? this.toCategoryResponse(product.category) : null,
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription,
      description: product.description,
      price: product.price?.toString() ?? null,
      previousPrice: product.previousPrice?.toString() ?? null,
      currency: product.currency,
      priceMode: product.priceMode,
      availabilityStatus: product.availabilityStatus,
      publicationStatus: product.publicationStatus,
      featured: product.featured,
      position: product.position,
      publishedAt: product.publishedAt?.toISOString() ?? null,
      attributes: product.attributes.map((attribute) => ({
        id: attribute.id,
        name: attribute.name,
        value: attribute.value,
        position: attribute.position,
      })),
      images: product.images.map((image) => this.toProductImageResponse(image)),
    };
  }

  private toProductImageResponse(image: ProductImageWithMedia) {
    return {
      id: image.id,
      mediaId: image.mediaId,
      position: image.position,
      isPrimary: image.isPrimary,
      altText: image.altText,
      status: image.media.status,
      mimeType: image.media.mimeType,
      width: image.media.width,
      height: image.media.height,
      urls: {
        original: this.mediaUrl(image.mediaId, 'ORIGINAL'),
        thumbnail: this.mediaUrl(image.mediaId, 'THUMBNAIL'),
        card: this.mediaUrl(image.mediaId, 'CARD'),
        large: this.mediaUrl(image.mediaId, 'LARGE'),
      },
    };
  }
}

type ProductImageWithMedia = ProductImage & {
  media: MediaAsset & { variants: MediaVariant[] };
};

type ProductWithRelations = Product & {
  category: Category | null;
  attributes: ProductAttribute[];
  images: ProductImageWithMedia[];
};

type ProductAccess = ProductWithRelations & {
  business: Business & { tenant: { deletedAt: Date | null }; businessType: unknown };
};
