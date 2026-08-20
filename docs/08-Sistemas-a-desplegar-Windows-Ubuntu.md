# Sistemas a desplegar para dtodo537.net

Este documento lista los sistemas necesarios para ejecutar `dtodo537.net` en desarrollo local sobre Windows y en servidor Ubuntu 22.04.

La arquitectura vigente no usa Docker, Kubernetes, microservicios, GraphQL, Kafka, RabbitMQ ni Elasticsearch.

## 1. Componentes de la plataforma

| Componente | Uso | Obligatorio |
| --- | --- | --- |
| Node.js 22 LTS | Runtime para Web, API y Worker | Sí |
| Corepack + pnpm 9.x | Package manager del monorepo | Sí |
| PostgreSQL 15+ | Base de datos principal | Sí |
| Prisma | ORM y migraciones | Sí |
| Redis 7+ | Cache y backend de BullMQ | Sí |
| BullMQ | Cola de jobs para worker | Sí |
| S3-compatible storage | Imágenes y media assets | Sí desde M4 |
| Git | Versionado y despliegue desde repo | Sí |
| Reverse proxy | Exposición HTTP/HTTPS en servidor | Sí en producción |
| systemd | Gestión de procesos en Ubuntu | Sí en producción |

## 2. Aplicaciones propias

Estas tres aplicaciones salen del monorepo y deben ejecutarse como procesos separados:

| App | Ruta | Puerto/proceso |
| --- | --- | --- |
| Web Next.js | `apps/web` | `3000` |
| API NestJS | `apps/api` | `3001` |
| Worker BullMQ | `apps/worker` | Sin puerto HTTP |

Comandos de desarrollo:

```bash
corepack pnpm --filter @dtodo/web dev
corepack pnpm --filter @dtodo/api dev
corepack pnpm --filter @dtodo/worker dev
```

## 3. Windows local

Windows debe usarse como entorno de desarrollo. La forma más estable es ejecutar Node/pnpm desde Windows y servicios auxiliares desde Windows o WSL, pero evitando mezclar instalaciones dentro del mismo proceso.

### 3.1 Obligatorio en Windows

| Sistema | Recomendación |
| --- | --- |
| Node.js | Node.js 22 LTS para Windows |
| pnpm | Usar `corepack pnpm`, no depender de un shim global roto |
| Git | Git for Windows |
| PostgreSQL | Instalación Windows o PostgreSQL en WSL |
| Redis | Preferible en WSL Ubuntu |
| S3-compatible | MinIO binario para Windows o MinIO en WSL |

### 3.2 PostgreSQL local

Base recomendada:

```text
database: dtodo537_dev
user: dtodo537_app
```

En tu entorno actual PostgreSQL acepta conexiones locales con `postgres`. Puedes crear la base y usuario de app o seguir usando la configuración local existente mientras no sea producción.

Variable:

```text
DATABASE_URL=postgresql://dtodo537_app:<password>@localhost:5432/dtodo537_dev?schema=public
```

### 3.3 Redis local

Redis debe responder:

```bash
redis-cli ping
```

Respuesta esperada:

```text
PONG
```

Redis 6.0.16 funciona para pruebas, pero BullMQ recomienda Redis 6.2+. Para estabilidad de M4 en adelante, usar Redis 7+.

Variable:

```text
REDIS_URL=redis://localhost:6379
```

### 3.4 S3-compatible local

Desde M4, subir imágenes requiere un servicio S3-compatible activo.

Recomendación local sin Docker:

| Opción | Uso |
| --- | --- |
| MinIO Windows binary | Simple si todo corre en Windows |
| MinIO dentro de WSL Ubuntu | Simple si Redis/PostgreSQL también están en WSL |

Debe existir el bucket:

```text
dtodo537-dev
```

Variables:

```text
S3_ENDPOINT=http://localhost:9000
S3_BUCKET=dtodo537-dev
S3_ACCESS_KEY=<local-access-key>
S3_SECRET_KEY=<local-secret-key>
```

Si `localhost:9000` no responde, el upload de imágenes fallará con storage no disponible.

## 4. Ubuntu Server 22.04

Ubuntu 22.04 es el objetivo de despliegue productivo según la arquitectura aprobada.

### 4.1 Sistemas base

| Sistema | Uso |
| --- | --- |
| Ubuntu Server 22.04 LTS | Sistema operativo |
| systemd | Ejecutar Web, API y Worker como servicios |
| Node.js 22 LTS | Runtime |
| Corepack + pnpm 9.x | Instalación/build |
| PostgreSQL 15+ | Base de datos |
| Redis 7+ | Cache y BullMQ |
| S3-compatible storage | Media |
| Reverse proxy | HTTP/HTTPS hacia Web y API |
| Certbot o proveedor TLS equivalente | Certificados HTTPS |

### 4.2 Procesos systemd esperados

Nombres sugeridos:

```text
dtodo-web.service
dtodo-api.service
dtodo-worker.service
```

Responsabilidades:

| Servicio | Comando conceptual |
| --- | --- |
| `dtodo-web` | `corepack pnpm --filter @dtodo/web start` |
| `dtodo-api` | `corepack pnpm --filter @dtodo/api start` |
| `dtodo-worker` | `corepack pnpm --filter @dtodo/worker start` |

En producción deben ejecutarse contra código compilado:

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm prisma:deploy
corepack pnpm build
```

### 4.3 Puertos internos

| Servicio | Puerto |
| --- | --- |
| Web | `3000` |
| API | `3001` |
| PostgreSQL | `5432` |
| Redis | `6379` |
| S3-compatible | `9000` |

En producción solo el reverse proxy debe exponerse públicamente en `80/443`.

PostgreSQL, Redis y S3 no deben exponerse directamente a Internet.

### 4.4 Reverse proxy

El reverse proxy debe enrutar:

| Ruta/dominio | Destino |
| --- | --- |
| Web principal | `http://127.0.0.1:3000` |
| API `/api/*` | `http://127.0.0.1:3001` |
| OpenAPI si está habilitado | `http://127.0.0.1:3001/api/docs` |

La decisión final entre Nginx, Caddy u otra opción compatible corresponde al hito de despliegue productivo.

## 5. Variables requeridas

Todas las variables deben existir en `.env` o en el entorno systemd:

```text
NODE_ENV
DATABASE_URL
REDIS_URL
APP_BASE_DOMAIN
WEB_URL
API_URL
SESSION_SECRET
S3_ENDPOINT
S3_BUCKET
S3_ACCESS_KEY
S3_SECRET_KEY
ENABLE_OPENAPI
```

No guardar secretos reales en Git.

## 6. Orden recomendado de instalación local

1. Node.js 22 LTS.
2. Corepack/pnpm.
3. PostgreSQL.
4. Redis.
5. S3-compatible storage.
6. Crear base de datos y bucket.
7. Configurar `.env`.
8. Ejecutar migraciones.
9. Levantar API, Worker y Web.

Comandos:

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm prisma:deploy
corepack pnpm --filter @dtodo/api dev
corepack pnpm --filter @dtodo/worker dev
corepack pnpm --filter @dtodo/web dev
```

## 7. Verificaciones mínimas

### PostgreSQL

```bash
corepack pnpm prisma:deploy
```

### Redis

```bash
redis-cli ping
```

### API

```bash
curl http://localhost:3001/api/v1/health/ready
```

Respuesta esperada:

```json
{
  "status": "ok",
  "service": "api",
  "checks": {
    "postgres": "ok",
    "redis": "ok"
  }
}
```

### Web

```text
http://localhost:3000
```

### S3-compatible

Validar que el endpoint responde en:

```text
http://localhost:9000
```

Y que existe el bucket:

```text
dtodo537-dev
```

## 8. Sistemas que no deben desplegarse

No desplegar ni introducir:

- Docker;
- Docker Compose;
- Kubernetes;
- microservicios;
- GraphQL;
- Kafka;
- RabbitMQ;
- Elasticsearch;
- colas adicionales fuera de BullMQ/Redis;
- bases de datos adicionales no aprobadas.

## 9. Estado por hito

| Hito | Sistemas requeridos |
| --- | --- |
| M0 | Node, pnpm, PostgreSQL, Redis |
| M1 | M0 + sesiones en PostgreSQL |
| M2 | M1 + multi-tenant en PostgreSQL |
| M3 | M2 + showroom público |
| M4 | M3 + S3-compatible + worker de imágenes |

Desde M4, S3-compatible deja de ser preparación y pasa a ser requerido para validar upload/procesamiento de imágenes.
