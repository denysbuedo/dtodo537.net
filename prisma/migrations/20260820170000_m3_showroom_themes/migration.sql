-- CreateEnum
CREATE TYPE "ThemeStatus" AS ENUM ('ACTIVE', 'DISABLED');
CREATE TYPE "ContactChannelType" AS ENUM ('PHONE', 'EMAIL');
CREATE TYPE "SocialProfileType" AS ENUM ('FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'X', 'LINKEDIN', 'WEBSITE');

-- AlterTable
ALTER TABLE "businesses"
  ADD COLUMN "address" TEXT,
  ADD COLUMN "phone" TEXT,
  ADD COLUMN "email" TEXT,
  ADD COLUMN "timezone" TEXT,
  ADD COLUMN "logoUrl" TEXT,
  ADD COLUMN "coverImageUrl" TEXT;

ALTER TABLE "showrooms"
  ADD COLUMN "customDomain" TEXT,
  ADD COLUMN "themeId" TEXT,
  ADD COLUMN "seoTitle" TEXT,
  ADD COLUMN "seoDescription" TEXT,
  ADD COLUMN "publishedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "themes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "previewMediaId" TEXT,
    "version" TEXT NOT NULL,
    "status" "ThemeStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "themes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "theme_configurations" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "showroomId" TEXT NOT NULL,
    "themeId" TEXT NOT NULL,
    "primaryColor" TEXT NOT NULL,
    "secondaryColor" TEXT NOT NULL,
    "accentColor" TEXT NOT NULL,
    "fontFamily" TEXT NOT NULL,
    "coverStyle" TEXT NOT NULL,
    "productCardStyle" TEXT NOT NULL,
    "configuration" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "theme_configurations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "contact_channels" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "type" "ContactChannelType" NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_channels_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "social_profiles" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "type" "SocialProfileType" NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_profiles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "whatsapp_configurations" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "defaultMessage" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_configurations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "themes_code_key" ON "themes"("code");
CREATE UNIQUE INDEX "theme_configurations_showroomId_key" ON "theme_configurations"("showroomId");
CREATE INDEX "theme_configurations_tenantId_idx" ON "theme_configurations"("tenantId");
CREATE INDEX "theme_configurations_themeId_idx" ON "theme_configurations"("themeId");
CREATE INDEX "showrooms_themeId_idx" ON "showrooms"("themeId");
CREATE INDEX "contact_channels_tenantId_idx" ON "contact_channels"("tenantId");
CREATE INDEX "contact_channels_businessId_idx" ON "contact_channels"("businessId");
CREATE INDEX "social_profiles_tenantId_idx" ON "social_profiles"("tenantId");
CREATE INDEX "social_profiles_businessId_idx" ON "social_profiles"("businessId");
CREATE UNIQUE INDEX "whatsapp_configurations_businessId_key" ON "whatsapp_configurations"("businessId");
CREATE INDEX "whatsapp_configurations_tenantId_idx" ON "whatsapp_configurations"("tenantId");

-- AddForeignKey
ALTER TABLE "showrooms" ADD CONSTRAINT "showrooms_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "themes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "theme_configurations" ADD CONSTRAINT "theme_configurations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "theme_configurations" ADD CONSTRAINT "theme_configurations_showroomId_fkey" FOREIGN KEY ("showroomId") REFERENCES "showrooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "theme_configurations" ADD CONSTRAINT "theme_configurations_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "themes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "contact_channels" ADD CONSTRAINT "contact_channels_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "contact_channels" ADD CONSTRAINT "contact_channels_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "social_profiles" ADD CONSTRAINT "social_profiles_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "social_profiles" ADD CONSTRAINT "social_profiles_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "whatsapp_configurations" ADD CONSTRAINT "whatsapp_configurations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "whatsapp_configurations" ADD CONSTRAINT "whatsapp_configurations_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Seed platform themes.
INSERT INTO "themes" ("id", "code", "name", "description", "version", "updatedAt") VALUES
  ('30000000-0000-4000-8000-000000000001', 'minimal', 'Minimal', 'Plantilla clara y directa para showrooms pequeños.', '1.0.0', CURRENT_TIMESTAMP),
  ('30000000-0000-4000-8000-000000000002', 'boutique', 'Boutique', 'Plantilla editorial para marcas visuales y comercios cuidados.', '1.0.0', CURRENT_TIMESTAMP),
  ('30000000-0000-4000-8000-000000000003', 'commercial', 'Commercial', 'Plantilla práctica para negocios con prioridad en contacto y conversión.', '1.0.0', CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;

UPDATE "showrooms"
SET "themeId" = '30000000-0000-4000-8000-000000000001'
WHERE "themeId" IS NULL;

INSERT INTO "theme_configurations" (
  "id",
  "tenantId",
  "showroomId",
  "themeId",
  "primaryColor",
  "secondaryColor",
  "accentColor",
  "fontFamily",
  "coverStyle",
  "productCardStyle",
  "configuration",
  "updatedAt"
)
SELECT
  ('40000000-0000-4000-8000-' || lpad(row_number() OVER (ORDER BY s."id")::text, 12, '0')),
  s."tenantId",
  s."id",
  '30000000-0000-4000-8000-000000000001',
  '#0f766e',
  '#1d1d1b',
  '#f59e0b',
  'Inter',
  'solid',
  'compact',
  '{"borderRadius":"8px"}'::jsonb,
  CURRENT_TIMESTAMP
FROM "showrooms" s
WHERE NOT EXISTS (
  SELECT 1 FROM "theme_configurations" tc WHERE tc."showroomId" = s."id"
);

-- RLS foundation for new tenant-aware tables.
ALTER TABLE "theme_configurations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contact_channels" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "social_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "whatsapp_configurations" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "theme_configurations_tenant_isolation" ON "theme_configurations"
  USING ("tenantId" = current_setting('app.current_tenant_id', true));

CREATE POLICY "contact_channels_tenant_isolation" ON "contact_channels"
  USING ("tenantId" = current_setting('app.current_tenant_id', true));

CREATE POLICY "social_profiles_tenant_isolation" ON "social_profiles"
  USING ("tenantId" = current_setting('app.current_tenant_id', true));

CREATE POLICY "whatsapp_configurations_tenant_isolation" ON "whatsapp_configurations"
  USING ("tenantId" = current_setting('app.current_tenant_id', true));
