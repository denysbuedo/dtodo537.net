# Sizing de servidor cloud para dtodo537.net

Este documento define una guía práctica para contratar infraestructura cloud para `dtodo537.net` según el estado actual del proyecto, incluyendo Web, API, Worker, PostgreSQL, Redis, BullMQ y storage S3-compatible.

La arquitectura vigente no usa Docker ni Kubernetes. El despliegue objetivo es Ubuntu Server 22.04 con `systemd` y reverse proxy.

## 1. Resumen ejecutivo

Para un MVP real con todos los servicios en un solo servidor, la recomendación inicial es:

```text
4 vCPU
16 GB RAM
250 GB SSD/NVMe
Ubuntu Server 22.04 LTS
Backups externos
Object Storage preferiblemente separado
```

Configuración mínima aceptable para pruebas:

```text
2 vCPU
8 GB RAM
120-160 GB SSD
```

No recomiendo iniciar producción real con menos de 8 GB RAM si se van a ejecutar juntos:

- Next.js;
- NestJS;
- Worker;
- PostgreSQL;
- Redis;
- S3-compatible local;
- reverse proxy.

## 2. Escenarios recomendados

### 2.1 Desarrollo remoto / demo técnica

Uso:

- pruebas internas;
- demo con pocos usuarios;
- catálogo pequeño;
- pocas imágenes;
- sin alta disponibilidad.

Recomendación:

| Recurso | Valor |
| --- | --- |
| CPU | 2 vCPU |
| RAM | 8 GB |
| Disco | 120-160 GB SSD |
| SO | Ubuntu Server 22.04 |
| PostgreSQL | mismo servidor |
| Redis | mismo servidor |
| S3-compatible | mismo servidor o externo |
| Backups | manuales o programados básicos |

Riesgo:

- si el worker procesa muchas imágenes grandes, puede consumir CPU/RAM;
- si el storage S3-compatible está en el mismo disco, las imágenes pueden llenar el servidor.

### 2.2 MVP inicial recomendado

Uso:

- beta cerrada;
- primeros negocios reales;
- catálogos con imágenes;
- tráfico bajo/medio;
- operación más estable.

Recomendación:

| Recurso | Valor |
| --- | --- |
| CPU | 4 vCPU |
| RAM | 16 GB |
| Disco | 250 GB SSD/NVMe |
| SO | Ubuntu Server 22.04 |
| PostgreSQL | mismo servidor inicialmente |
| Redis | mismo servidor inicialmente |
| S3-compatible | preferiblemente externo |
| Backups | diarios, fuera del servidor |

Esta es la opción recomendada para empezar sin sobredimensionar.

### 2.3 Producción inicial con margen

Uso:

- más negocios;
- más imágenes;
- worker activo;
- necesidad de mejor margen operativo.

Recomendación:

| Recurso | Valor |
| --- | --- |
| CPU | 6-8 vCPU |
| RAM | 24-32 GB |
| Disco | 500 GB SSD/NVMe |
| SO | Ubuntu Server 22.04 |
| PostgreSQL | mismo servidor o gestionado |
| Redis | mismo servidor o gestionado |
| S3-compatible | externo recomendado |
| Backups | diarios + retención |

Esta opción conviene cuando ya haya uso real y crecimiento de media.

## 3. Distribución de recursos por servicio

### 3.1 Next.js Web

Proceso:

```text
apps/web
```

Consumo estimado:

| Recurso | Estimado inicial |
| --- | --- |
| RAM | 300 MB - 1 GB |
| CPU | bajo/medio |
| Disco | bajo |

Notas:

- Next.js puede correr como servidor Node.js.
- Debe estar detrás de un reverse proxy.
- No exponer directamente el puerto `3000`.

### 3.2 NestJS API

Proceso:

```text
apps/api
```

Consumo estimado:

| Recurso | Estimado inicial |
| --- | --- |
| RAM | 300 MB - 1 GB |
| CPU | bajo/medio |
| Disco | bajo |

Notas:

- Expone REST/OpenAPI.
- Debe estar detrás de reverse proxy.
- No exponer directamente el puerto `3001`.

### 3.3 Worker BullMQ

Proceso:

```text
apps/worker
```

Consumo estimado:

| Recurso | Estimado inicial |
| --- | --- |
| RAM | 500 MB - 2 GB |
| CPU | medio/alto durante procesamiento |
| Disco | bajo si media está en S3 |

Notas:

- El procesamiento de imágenes con `sharp` consume CPU.
- Si se suben muchas imágenes simultáneamente, el worker será el primer componente a escalar.
- En el futuro se puede correr más de un worker, pero no hace falta al inicio.

### 3.4 PostgreSQL

Consumo estimado:

| Recurso | Estimado inicial |
| --- | --- |
| RAM | 2-6 GB reservables |
| CPU | medio |
| Disco | 50-150 GB iniciales |

Recomendación inicial:

- en MVP puede correr en el mismo servidor;
- activar backups diarios;
- monitorear crecimiento;
- separar a PostgreSQL gestionado cuando haya clientes reales o necesidad de alta disponibilidad.

### 3.5 Redis

Uso:

- cache;
- BullMQ;
- colas;
- locks/eventos internos.

Consumo estimado:

| Recurso | Estimado inicial |
| --- | --- |
| RAM | 512 MB - 2 GB |
| CPU | bajo |
| Disco | bajo, salvo persistencia |

Recomendación:

- Redis 7+;
- no usar Redis 6.0.x para producción;
- configurar persistencia si las colas no deben perderse ante reinicio;
- no exponer `6379` a Internet.

### 3.6 S3-compatible storage

Uso:

- imágenes originales;
- thumbnails;
- variantes WebP;
- media del catálogo.

Opciones:

| Opción | Recomendación |
| --- | --- |
| Object Storage gestionado | Recomendado para producción |
| MinIO en el mismo servidor | Aceptable para demo/MVP pequeño |
| MinIO en servidor separado | Mejor si se quiere controlar storage |

Para iniciar, lo más práctico es contratar un Object Storage S3-compatible gestionado. Evita que las imágenes llenen el disco principal y reduce trabajo operativo.

Si se usa MinIO en el mismo VPS:

- reservar disco suficiente;
- hacer backups externos;
- no considerarlo alta disponibilidad;
- no exponerlo sin TLS/reverse proxy/reglas de acceso.

## 4. Disco recomendado

### 4.1 Mínimo

```text
120-160 GB SSD
```

Suficiente para:

- sistema operativo;
- app;
- PostgreSQL pequeño;
- logs;
- pocas imágenes.

### 4.2 Recomendado para MVP

```text
250 GB SSD/NVMe
```

Distribución conceptual:

| Uso | Espacio |
| --- | --- |
| Sistema operativo | 30-50 GB |
| App/builds/logs | 20-40 GB |
| PostgreSQL | 50-100 GB |
| Redis/persistencia/logs | 10-20 GB |
| margen operativo | 50+ GB |

Si las imágenes viven en el mismo servidor, sumar media:

```text
productos x imágenes x tamaño promedio x variantes
```

Ejemplo:

```text
100 negocios
50 productos por negocio
3 imágenes por producto
1 MB promedio procesado por imagen incluyendo variantes
= 15 GB aproximados
```

Ese cálculo crece rápido. Por eso media debe ir preferiblemente a Object Storage externo.

## 5. Recomendación de contratación inicial

### Opción recomendada

Contratar:

```text
1 VPS Ubuntu 22.04
4 vCPU
16 GB RAM
250 GB SSD/NVMe
1 Object Storage S3-compatible externo
Backups automáticos
```

Servicios en el VPS:

- Web;
- API;
- Worker;
- PostgreSQL;
- Redis;
- reverse proxy;
- systemd services.

Servicios externos:

- Object Storage S3-compatible;
- backups.

Esta opción balancea costo, simplicidad y margen.

### Opción más barata aceptable

```text
2 vCPU
8 GB RAM
160 GB SSD
Object Storage externo
```

Usarla solo para:

- pruebas;
- beta pequeña;
- bajo tráfico;
- pocas imágenes.

No la usaría para producción pública seria.

### Opción más robusta

```text
8 vCPU
32 GB RAM
500 GB SSD/NVMe
Object Storage externo
PostgreSQL gestionado opcional
Redis gestionado opcional
```

Usarla cuando:

- haya más negocios reales;
- crezca el catálogo;
- el worker procese muchas imágenes;
- se requiera mejor disponibilidad.

## 6. Red y seguridad

Abrir públicamente solo:

```text
80/tcp
443/tcp
22/tcp restringido
```

No exponer públicamente:

```text
3000
3001
5432
6379
9000
```

Recomendado:

- firewall activo;
- SSH con llave;
- deshabilitar password login SSH;
- backups fuera del servidor;
- certificados TLS;
- logs rotados;
- variables de entorno fuera de Git;
- usuario Linux dedicado para la app.

## 7. Servicios systemd esperados

```text
dtodo-web.service
dtodo-api.service
dtodo-worker.service
```

Cada proceso debe tener:

- restart policy;
- variables de entorno;
- working directory;
- usuario no-root;
- logs por journald;
- graceful shutdown.

## 8. Cuándo escalar

Escalar CPU si:

- el worker tarda mucho procesando imágenes;
- el API empieza a responder lento;
- hay picos al publicar o subir media.

Escalar RAM si:

- PostgreSQL usa swap;
- Redis se acerca al límite;
- builds o procesos Node son inestables;
- el worker falla procesando imágenes grandes.

Escalar disco si:

- PostgreSQL crece;
- logs crecen;
- media está en el mismo servidor;
- backups locales ocupan demasiado.

Separar servicios cuando:

- PostgreSQL necesita alta disponibilidad;
- Redis/BullMQ se vuelve crítico;
- las imágenes crecen más rápido que la app;
- el servidor único se vuelve punto de falla inaceptable.

## 9. Recomendación final para contratar hoy

Para este proyecto en su etapa actual:

```text
Ubuntu Server 22.04 LTS
4 vCPU
16 GB RAM
250 GB SSD/NVMe
Object Storage S3-compatible externo
Backups diarios
```

Si el presupuesto está muy ajustado:

```text
2 vCPU
8 GB RAM
160 GB SSD
Object Storage externo obligatorio
```

Si se quiere ir con más margen desde el inicio:

```text
8 vCPU
32 GB RAM
500 GB SSD/NVMe
Object Storage externo
```

## 10. Fuentes técnicas consultadas

- Next.js Self-Hosting: https://nextjs.org/docs/app/guides/self-hosting
- Next.js Deploying Node.js server: https://nextjs.org/docs/app/getting-started/deploying
- PostgreSQL requirements: https://www.postgresql.org/docs/16/install-requirements.html
- Redis hardware requirements: https://redis.io/docs/latest/operate/rs/7.22/installing-upgrading/install/plan-deployment/hardware-requirements/
- MinIO recommended hardware reference: https://www.min.io/product/reference-hardware
