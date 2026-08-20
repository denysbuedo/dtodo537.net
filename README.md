# dtodo537.net

Plataforma SaaS multi-tenant de showrooms y catalogos comerciales digitales.

Este repositorio implementa el MVP por hitos. El estado actual de esta rama corresponde a **M3 - Showroom & Themes**, construido sobre M0, M1 y M2.

## Requisitos

- Node.js 22 o superior. Recomendado: Node.js 22 LTS.
- pnpm 9.x mediante Corepack.
- PostgreSQL 15 o superior.
- Redis 7 o superior.
- Un servicio S3-compatible para etapas posteriores. En M0 solo se valida configuracion.

No se usa Docker ni Kubernetes.

## Instalacion

```bash
corepack enable
corepack prepare pnpm@9.15.4 --activate
pnpm install
```

Si Windows no permite crear el shim global de `pnpm`, usa `corepack pnpm` en lugar de `pnpm`.

## Configuracion

```bash
cp .env.example .env
```

Edita `.env` con credenciales locales. No guardes secretos reales en Git.

Ejemplo de conexion local para desarrollo:

```text
DATABASE_URL=postgresql://dtodo537_app:<local-password>@localhost:5432/dtodo537_dev?schema=public
```

Variables principales:

- `DATABASE_URL`: conexion PostgreSQL para Prisma y API.
- `REDIS_URL`: conexion Redis para API y worker.
- `APP_BASE_DOMAIN`: dominio base de la plataforma.
- `WEB_URL`: URL local o publica del frontend.
- `API_URL`: URL versionada de la API.
- `SESSION_SECRET`: secreto futuro de sesiones.
- `S3_*`: preparacion para object storage compatible con S3.

## Prisma

```bash
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed
```

Las migraciones actuales cubren foundation, identidad/sesiones, Tenant & Business y Showroom & Themes. La API valida PostgreSQL mediante `SELECT 1`.

## Ejecucion

Frontend:

```bash
pnpm --filter @dtodo/web dev
```

API:

```bash
pnpm --filter @dtodo/api dev
```

Worker:

```bash
pnpm --filter @dtodo/worker dev
```

Todos los procesos:

```bash
pnpm dev
```

Puertos por defecto:

- Web: `http://localhost:3000`
- API: `http://localhost:3001`
- OpenAPI: `http://localhost:3001/api/docs` si `ENABLE_OPENAPI=true`

## Health checks

```bash
curl http://localhost:3001/api/v1/health
curl http://localhost:3001/api/v1/health/ready
```

`/health/ready` comprueba PostgreSQL y Redis sin exponer cadenas de conexion ni secretos.

## Identity local

M1 agrega identidad y sesiones server-side sin introducir tenants ni negocios.

Pantallas:

- `http://localhost:3000/register`
- `http://localhost:3000/login`
- `http://localhost:3000/account`

Endpoints:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/email/verification/request`
- `POST /api/v1/auth/email/verify`
- `POST /api/v1/auth/password/reset/request`
- `POST /api/v1/auth/password/reset`

En `development` y `test`, los endpoints de verificacion y recuperacion pueden devolver `devToken` para probar el flujo sin servicio de correo. No se debe usar ese comportamiento en produccion.

## Tenant & Business local

M2 agrega el núcleo multi-tenant funcional: `Tenant`, `Membership`, `Business`, `Showroom`, `BusinessType`, `SubscriptionPlan` y `Subscription`.

Pantallas:

- `http://localhost:3000/onboarding`
- `http://localhost:3000/account`

Endpoints:

- `POST /api/v1/tenants/provision`
- `GET /api/v1/tenants`
- `GET /api/v1/tenant-context`
- `GET /api/v1/tenants/resolve/{subdomain}`

`POST /api/v1/tenants/provision` requiere sesión autenticada y usuario `ACTIVE`.

Body:

```json
{
  "businessName": "Muebles Habana",
  "businessTypeCode": "retail",
  "subdomain": "muebles-habana"
}
```

El provisioning crea transaccionalmente Tenant, Membership `BUSINESS_OWNER`, Business, Showroom y Subscription inicial. El `tenantId` recibido desde UI solo se usa como selector y siempre se valida contra `Membership`.

## Showroom & Themes local

M3 agrega edición de identidad pública del negocio, contactos, redes, WhatsApp técnico, selector de theme, preview y publicación básica.

Pantallas:

- `http://localhost:3000/manage/showrooms/{showroomId}`
- `http://localhost:3000/preview/showrooms/{showroomId}`
- `http://localhost:3000/showrooms/{subdomain}`

Endpoints:

- `GET /api/v1/themes`
- `GET /api/v1/showrooms/{showroomId}/manage`
- `PATCH /api/v1/showrooms/{showroomId}/profile`
- `PATCH /api/v1/showrooms/{showroomId}/contact`
- `PATCH /api/v1/showrooms/{showroomId}/theme`
- `PATCH /api/v1/showrooms/{showroomId}/publication`
- `GET /api/v1/showrooms/{showroomId}/preview`
- `GET /api/v1/public/showrooms/{subdomain}`

Themes iniciales:

- `minimal`
- `boutique`
- `commercial`

Logo y portada se configuran por URL en M3. Upload, procesamiento de imágenes y media pipeline quedan para el hito de catálogo/media.

## Calidad

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Estructura

```text
apps/
  web/
  api/
  worker/
packages/
  config/
  types/
  validation/
  ui/
  eslint-config/
prisma/
tests/
docs/
scripts/
infrastructure/
```

## Alcance actual

M3 no implementa catálogo, productos, media upload/procesamiento, portal de descubrimiento, analytics ni administración global. Esos módulos pertenecen a hitos posteriores.
