# dtodo537.net

Plataforma SaaS multi-tenant de showrooms y catalogos comerciales digitales.

Este repositorio implementa el MVP por hitos. El estado actual corresponde a **M0 - Foundation**: monorepo, aplicaciones base, infraestructura tecnica, health checks, logging, configuracion, Prisma, Redis, BullMQ, tests y CI.

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

## Configuracion

```bash
cp .env.example .env
```

Edita `.env` con credenciales locales. No guardes secretos reales en Git.

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
