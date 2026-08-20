# dtodo537.net

Plataforma SaaS multi-tenant de showrooms y catalogos comerciales digitales.

Este repositorio implementa el MVP por hitos. El estado actual de esta rama corresponde a **M1 - Identity & Sessions**, construido sobre **M0 - Foundation**.

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

El esquema M0 no crea entidades de dominio. La API valida PostgreSQL mediante `SELECT 1`.

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

M0 no implementa identidad, autenticacion, tenants, negocios, productos, showrooms, WhatsApp ni portal de descubrimiento. Esos modulos pertenecen a hitos posteriores.
