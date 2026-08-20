-- CreateEnum
CREATE TYPE "CategoryStatus" AS ENUM ('ACTIVE', 'ARCHIVED');
CREATE TYPE "ProductPriceMode" AS ENUM ('FIXED', 'FROM', 'CONTACT', 'FREE');
CREATE TYPE "ProductAvailabilityStatus" AS ENUM ('AVAILABLE', 'OUT_OF_STOCK', 'ON_REQUEST', 'COMING_SOON', 'UNAVAILABLE');
CREATE TYPE "ProductPublicationStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'UNPUBLISHED', 'ARCHIVED');
CREATE TYPE "MediaAssetType" AS ENUM ('IMAGE', 'DOCUMENT');
CREATE TYPE "StorageProvider" AS ENUM ('S3');
CREATE TYPE "MediaAssetStatus" AS ENUM ('PENDING_UPLOAD', 'UPLOADED', 'PROCESSING', 'READY', 'FAILED', 'DELETED');
CREATE TYPE "MediaVariantKind" AS ENUM ('ORIGINAL', 'THUMBNAIL', 'CARD', 'LARGE');

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "parentId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "imageMediaId" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "status" "CategoryStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "categoryId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortDescription" TEXT,
    "description" TEXT,
    "price" DECIMAL(12,2),
    "previousPrice" DECIMAL(12,2),
    "currency" CHAR(3) NOT NULL DEFAULT 'CUP',
    "priceMode" "ProductPriceMode" NOT NULL DEFAULT 'CONTACT',
    "availabilityStatus" "ProductAvailabilityStatus" NOT NULL DEFAULT 'AVAILABLE',
    "publicationStatus" "ProductPublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "product_attributes" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_attributes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "media_assets" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" "MediaAssetType" NOT NULL DEFAULT 'IMAGE',
    "storageProvider" "StorageProvider" NOT NULL DEFAULT 'S3',
    "bucket" TEXT NOT NULL,
    "objectKey" TEXT NOT NULL,
    "originalName" TEXT,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "status" "MediaAssetStatus" NOT NULL DEFAULT 'PENDING_UPLOAD',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "media_variants" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "mediaAssetId" TEXT NOT NULL,
    "kind" "MediaVariantKind" NOT NULL,
    "storageProvider" "StorageProvider" NOT NULL DEFAULT 'S3',
    "bucket" TEXT NOT NULL,
    "objectKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_variants_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "product_images" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "altText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_businessId_slug_key" ON "categories"("businessId", "slug");
CREATE INDEX "categories_tenantId_idx" ON "categories"("tenantId");
CREATE INDEX "categories_businessId_idx" ON "categories"("businessId");
CREATE INDEX "categories_parentId_idx" ON "categories"("parentId");
CREATE INDEX "categories_imageMediaId_idx" ON "categories"("imageMediaId");

CREATE UNIQUE INDEX "products_businessId_slug_key" ON "products"("businessId", "slug");
CREATE INDEX "products_tenantId_idx" ON "products"("tenantId");
CREATE INDEX "products_businessId_idx" ON "products"("businessId");
CREATE INDEX "products_categoryId_idx" ON "products"("categoryId");
CREATE INDEX "products_publicationStatus_idx" ON "products"("publicationStatus");

CREATE INDEX "product_attributes_tenantId_idx" ON "product_attributes"("tenantId");
CREATE INDEX "product_attributes_productId_idx" ON "product_attributes"("productId");

CREATE INDEX "media_assets_tenantId_idx" ON "media_assets"("tenantId");
CREATE INDEX "media_assets_status_idx" ON "media_assets"("status");

CREATE UNIQUE INDEX "media_variants_mediaAssetId_kind_key" ON "media_variants"("mediaAssetId", "kind");
CREATE INDEX "media_variants_tenantId_idx" ON "media_variants"("tenantId");
CREATE INDEX "media_variants_mediaAssetId_idx" ON "media_variants"("mediaAssetId");

CREATE UNIQUE INDEX "product_images_productId_mediaId_key" ON "product_images"("productId", "mediaId");
CREATE INDEX "product_images_tenantId_idx" ON "product_images"("tenantId");
CREATE INDEX "product_images_productId_idx" ON "product_images"("productId");
CREATE INDEX "product_images_mediaId_idx" ON "product_images"("mediaId");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "categories" ADD CONSTRAINT "categories_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "categories" ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "categories" ADD CONSTRAINT "categories_imageMediaId_fkey" FOREIGN KEY ("imageMediaId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "products" ADD CONSTRAINT "products_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "products" ADD CONSTRAINT "products_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "product_attributes" ADD CONSTRAINT "product_attributes_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "product_attributes" ADD CONSTRAINT "product_attributes_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "media_variants" ADD CONSTRAINT "media_variants_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "media_variants" ADD CONSTRAINT "media_variants_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "media_assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "product_images" ADD CONSTRAINT "product_images_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RLS foundation for M4 tenant-aware tables.
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product_attributes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "media_assets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "media_variants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product_images" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_tenant_isolation" ON "categories"
  USING ("tenantId" = current_setting('app.current_tenant_id', true));

CREATE POLICY "products_tenant_isolation" ON "products"
  USING ("tenantId" = current_setting('app.current_tenant_id', true));

CREATE POLICY "product_attributes_tenant_isolation" ON "product_attributes"
  USING ("tenantId" = current_setting('app.current_tenant_id', true));

CREATE POLICY "media_assets_tenant_isolation" ON "media_assets"
  USING ("tenantId" = current_setting('app.current_tenant_id', true));

CREATE POLICY "media_variants_tenant_isolation" ON "media_variants"
  USING ("tenantId" = current_setting('app.current_tenant_id', true));

CREATE POLICY "product_images_tenant_isolation" ON "product_images"
  USING ("tenantId" = current_setting('app.current_tenant_id', true));
