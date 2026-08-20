-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'BLOCKED', 'CLOSED');
CREATE TYPE "MembershipRole" AS ENUM ('BUSINESS_OWNER', 'BUSINESS_MANAGER');
CREATE TYPE "MembershipStatus" AS ENUM ('ACTIVE', 'SUSPENDED');
CREATE TYPE "BusinessStatus" AS ENUM ('DRAFT', 'PENDING', 'PUBLISHED', 'SUSPENDED', 'ARCHIVED');
CREATE TYPE "ShowroomStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'SUSPENDED');
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELED');

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "TenantStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "memberships" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "MembershipRole" NOT NULL,
    "status" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "memberships_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "business_types" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_types_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "businesses" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "businessTypeId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "legalName" TEXT,
    "description" TEXT,
    "shortDescription" TEXT,
    "logoMediaId" TEXT,
    "coverMediaId" TEXT,
    "status" "BusinessStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "businesses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "showrooms" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "subdomain" TEXT NOT NULL,
    "status" "ShowroomStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "showrooms_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "subscription_plans" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIALING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");
CREATE UNIQUE INDEX "memberships_userId_tenantId_key" ON "memberships"("userId", "tenantId");
CREATE INDEX "memberships_tenantId_idx" ON "memberships"("tenantId");
CREATE UNIQUE INDEX "business_types_code_key" ON "business_types"("code");
CREATE UNIQUE INDEX "businesses_tenantId_slug_key" ON "businesses"("tenantId", "slug");
CREATE INDEX "businesses_tenantId_idx" ON "businesses"("tenantId");
CREATE INDEX "businesses_businessTypeId_idx" ON "businesses"("businessTypeId");
CREATE UNIQUE INDEX "showrooms_businessId_key" ON "showrooms"("businessId");
CREATE UNIQUE INDEX "showrooms_subdomain_key" ON "showrooms"("subdomain");
CREATE INDEX "showrooms_tenantId_idx" ON "showrooms"("tenantId");
CREATE UNIQUE INDEX "subscription_plans_code_key" ON "subscription_plans"("code");
CREATE INDEX "subscriptions_tenantId_idx" ON "subscriptions"("tenantId");
CREATE INDEX "subscriptions_planId_idx" ON "subscriptions"("planId");

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_businessTypeId_fkey" FOREIGN KEY ("businessTypeId") REFERENCES "business_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "showrooms" ADD CONSTRAINT "showrooms_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "showrooms" ADD CONSTRAINT "showrooms_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Seed required platform lookup rows for M2 provisioning.
INSERT INTO "business_types" ("id", "code", "name", "updatedAt") VALUES
  ('10000000-0000-4000-8000-000000000001', 'general', 'General', CURRENT_TIMESTAMP),
  ('10000000-0000-4000-8000-000000000002', 'retail', 'Comercio minorista', CURRENT_TIMESTAMP),
  ('10000000-0000-4000-8000-000000000003', 'services', 'Servicios', CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;

INSERT INTO "subscription_plans" ("id", "code", "name", "updatedAt") VALUES
  ('20000000-0000-4000-8000-000000000001', 'free', 'Free', CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;

-- RLS foundation. Policies are intentionally tenant-setting based and not forced yet.
ALTER TABLE "memberships" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "businesses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "showrooms" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "memberships_tenant_isolation" ON "memberships"
  USING ("tenantId" = current_setting('app.current_tenant_id', true));

CREATE POLICY "businesses_tenant_isolation" ON "businesses"
  USING ("tenantId" = current_setting('app.current_tenant_id', true));

CREATE POLICY "showrooms_tenant_isolation" ON "showrooms"
  USING ("tenantId" = current_setting('app.current_tenant_id', true));

CREATE POLICY "subscriptions_tenant_isolation" ON "subscriptions"
  USING ("tenantId" = current_setting('app.current_tenant_id', true));
