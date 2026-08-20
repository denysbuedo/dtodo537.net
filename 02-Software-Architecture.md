# 02 — Software Architecture

**Proyecto:** Plataforma Digital de Showrooms Comerciales Multi-Negocio  
**Dominio previsto:** `dtodo537.net`  
**Nombre comercial:** Por definir  
**Versión:** 0.1  
**Estado:** Arquitectura propuesta para aprobación

---

# 1. Propósito

Este documento define la arquitectura de software inicial de la plataforma `dtodo537.net`.

La solución se concibe como una plataforma SaaS multi-tenant que permitirá a múltiples negocios disponer de showrooms digitales independientes y personalizados, mientras comparten una misma infraestructura tecnológica.

La arquitectura deberá garantizar:

- simplicidad para el usuario final;
- aislamiento entre negocios;
- escalabilidad;
- seguridad;
- rendimiento;
- buena indexación en buscadores;
- facilidad de evolución;
- facilidad de operación;
- capacidad de crecimiento sin rediseños estructurales tempranos.

La plataforma no será inicialmente un sistema de comercio electrónico transaccional.

No procesará:

- pagos;
- pedidos;
- facturación;
- logística;
- entrega de productos.

Su función será:

**publicar, organizar, descubrir y conectar.**

---

# 2. Principios arquitectónicos

La arquitectura seguirá los siguientes principios.

## 2.1. Modularidad

Cada dominio funcional deberá estar claramente separado.

Ejemplos:

- tenants;
- usuarios;
- negocios;
- productos;
- categorías;
- plantillas;
- imágenes;
- ofertas;
- búsqueda;
- analítica;
- administración.

---

## 2.2. Multi-tenancy desde el núcleo

El aislamiento entre negocios no será añadido posteriormente.

Todo el sistema será diseñado desde el principio considerando:

`tenant_id`

como elemento central del modelo de dominio.

---

## 2.3. Simplicidad operacional

Se evitará introducir componentes distribuidos innecesarios durante el MVP.

No se utilizarán microservicios inicialmente.

Se utilizará un enfoque:

**Modular Monolith**

con separación clara de dominios internos.

Esto permitirá evolucionar determinados módulos hacia servicios independientes en el futuro, si el crecimiento lo requiere.

---

# 3. Decisión tecnológica principal

Se adopta el siguiente stack.

| Componente | Tecnología |
|---|---|
| Frontend | Next.js |
| Lenguaje frontend | TypeScript |
| Backend | NestJS |
| Lenguaje backend | TypeScript |
| API | REST |
| Base de datos | PostgreSQL |
| ORM | Prisma |
| Cache | Redis |
| Jobs | BullMQ |
| Imágenes | S3 compatible |
| Desarrollo local S3 | MinIO opcional |
| Reverse Proxy | HAProxy / Nginx |
| Sistema operativo | Ubuntu Server |
| Observabilidad | Prometheus/Grafana + logs |
| CI/CD | Git + pipeline automatizado |

---

# 4. Justificación de Next.js

Next.js será utilizado para construir toda la capa web pública y los paneles de usuario.

Permitirá manejar:

- portal general;
- showrooms;
- páginas de productos;
- onboarding;
- dashboard del negocio;
- administración.

Su principal ventaja en este proyecto es combinar:

- Server Side Rendering;
- Server Components;
- caching;
- generación dinámica;
- optimización de imágenes;
- SEO;
- routing;
- buen rendimiento.

---

# 5. Justificación de NestJS

Se adopta **NestJS** como backend principal.

La decisión responde especialmente a:

- TypeScript de extremo a extremo;
- arquitectura modular;
- Dependency Injection;
- guards;
- interceptors;
- middleware;
- decorators;
- validaciones;
- integración sencilla con Redis;
- integración con BullMQ;
- testing;
- Swagger/OpenAPI;
- buena estructuración de dominios.

La plataforma tendrá suficiente lógica empresarial como para justificar un backend independiente.

Ejemplos:

- aislamiento multi-tenant;
- roles y permisos;
- publicación;
- planes;
- ofertas;
- estadísticas;
- eventos;
- moderación;
- procesamiento de imágenes;
- administración global.

---

# 6. Arquitectura general

```text
                                 INTERNET
                                     │
                                     ▼
                               DNS dtodo537.net
                                     │
                     ┌───────────────┴───────────────┐
                     │                               │
               dtodo537.net                  *.dtodo537.net
                     │                               │
                     └───────────────┬───────────────┘
                                     │
                                     ▼
                              HAProxy / Nginx
                                     │
                    ┌────────────────┴────────────────┐
                    │                                 │
                    ▼                                 ▼
               NEXT.JS WEB                        NESTJS API
                    │                                 │
                    │                         ┌───────┼────────┐
                    │                         │       │        │
                    ▼                         ▼       ▼        ▼
               Server Rendering         PostgreSQL Redis    S3
                                             │       │
                                             │       ▼
                                             │     BullMQ
                                             │
                                             ▼
                                       Datos de negocio
```

---

# 7. Arquitectura lógica

La solución se dividirá en cuatro grandes capas.

```text
Presentation Layer
       │
       ▼
Application Layer
       │
       ▼
Domain Layer
       │
       ▼
Infrastructure Layer
```

---

# 8. Presentation Layer

Responsable de la experiencia del usuario.

Contendrá:

### Portal general

`dtodo537.net`

### Showrooms

`negocio.dtodo537.net`

### Dashboard

Administración del negocio.

### Backoffice

Administración global.

Tecnología:

**Next.js**

---

# 9. Application Layer

Contendrá los casos de uso del sistema.

Ejemplos:

```text
CreateTenant
RegisterBusiness
CreateProduct
UpdateProduct
PublishProduct
CreateOffer
PublishShowroom
TrackProductView
GenerateWhatsappLink
ChangeTheme
SuspendTenant
```

Esta capa coordinará las operaciones sin contener detalles específicos de infraestructura.

---

# 10. Domain Layer

Contendrá las reglas de negocio.

Principales dominios:

```text
Identity
Tenant
Business
Catalog
Product
Offer
Theme
Media
Search
Analytics
Subscription
Administration
```

Cada módulo deberá mantener límites funcionales claramente definidos.

---

# 11. Infrastructure Layer

Gestionará:

- PostgreSQL;
- Redis;
- almacenamiento S3;
- correo;
- jobs;
- logs;
- métricas;
- servicios externos.

---

# 12. Modular Monolith

No se implementarán microservicios en el MVP.

NestJS se organizará como un **monolito modular**.

Ejemplo:

```text
apps/api/src/modules/

auth/
users/
tenants/
businesses/
catalog/
categories/
products/
offers/
media/
themes/
search/
analytics/
subscriptions/
administration/
audit/
```

Cada módulo tendrá sus:

```text
controller
service
domain
repository
dto
events
tests
```

---

# 13. Arquitectura del frontend

La aplicación Next.js utilizará App Router.

Estructura conceptual:

```text
apps/web/

app/
components/
features/
lib/
services/
hooks/
types/
styles/
themes/
```

---

# 14. Separación de experiencias

No se desarrollarán aplicaciones completamente independientes.

Una sola aplicación Next.js gestionará diferentes experiencias.

```text
Portal general
Showroom
Dashboard
Administración
```

Pero cada una tendrá layouts independientes.

---

# 15. Resolución del dominio

La aplicación deberá interpretar el hostname solicitado.

Ejemplos:

```text
dtodo537.net
www.dtodo537.net

muebles.dtodo537.net
tecnologia.dtodo537.net
dulces.dtodo537.net
```

La aplicación determinará el tenant según el subdominio.

---

# 16. Tenant Resolver

Se implementará un componente central denominado conceptualmente:

**Tenant Resolver**

Responsabilidad:

```text
hostname
   ↓
subdomain
   ↓
tenant
   ↓
TenantContext
```

Ejemplo:

```text
muebles.dtodo537.net
```

produce:

```text
subdomain = muebles
```

y posteriormente:

```text
tenant_id = UUID correspondiente
```

---

# 17. Tenant Context

Cada solicitud asociada a un negocio deberá tener un contexto de tenant.

Conceptualmente:

```typescript
TenantContext {
  tenantId
  slug
  status
  plan
}
```

Este contexto deberá propagarse durante toda la ejecución.

Nunca deberá confiarse exclusivamente en un `tenant_id` recibido desde el cliente.

---

# 18. Seguridad multi-tenant

El cliente nunca determinará libremente qué tenant consultar.

El tenant deberá derivarse de:

- hostname;
- sesión;
- contexto autenticado.

Las consultas deberán incorporar siempre el tenant correspondiente.

Ejemplo:

Incorrecto:

```sql
SELECT * FROM products WHERE id = ?
```

Correcto:

```sql
SELECT *
FROM products
WHERE id = ?
AND tenant_id = ?
```

---

# 19. Defensa en profundidad

El aislamiento deberá aplicarse en diferentes capas.

```text
Hostname
   ↓
Tenant Resolver
   ↓
Authentication
   ↓
Authorization
   ↓
Application Service
   ↓
Repository
   ↓
Database
```

Nunca deberá depender de una sola comprobación.

---

# 20. PostgreSQL

PostgreSQL será la base de datos transaccional principal.

Se utilizará inicialmente una sola base compartida.

Modelo:

```text
Shared Database
Shared Schema
tenant_id
```

Ventajas:

- operación sencilla;
- menor consumo de infraestructura;
- consultas globales;
- estadísticas;
- mantenimiento centralizado;
- incorporación sencilla de nuevos negocios.

---

# 21. Identificadores

Las entidades utilizarán UUID.

Ejemplo:

```text
tenant_id UUID
product_id UUID
user_id UUID
```

Los slugs se utilizarán únicamente para URLs y referencias públicas.

Nunca como identificador interno principal.

---

# 22. Prisma

Se utilizará Prisma como ORM.

Permitirá:

- migraciones;
- modelado;
- TypeScript types;
- seguridad de tipos;
- consultas estructuradas;
- mantenimiento del esquema.

Deberán implementarse mecanismos internos para evitar consultas sin tenant cuando correspondan.

---

# 23. Redis

Redis tendrá inicialmente cuatro funciones principales.

## Cache

Por ejemplo:

```text
tenant configuration
popular products
categories
showroom configuration
```

## Rate limiting

Control de abuso.

## Sesiones o tokens auxiliares

Cuando corresponda.

## BullMQ

Procesamiento asíncrono.

---

# 24. BullMQ

BullMQ utilizará Redis como infraestructura de colas.

Permitirá procesar tareas que no deberían bloquear una petición web.

Ejemplos:

```text
procesar fotografía
generar thumbnails
generar QR
enviar correo
regenerar sitemap
procesar estadísticas
limpiar archivos
```

---

# 25. Arquitectura de imágenes

Las fotografías no se almacenarán directamente en PostgreSQL.

Se almacenarán en Object Storage.

Conceptualmente:

```text
business-media/
    tenant-id/
        products/
            product-id/
                original/
                optimized/
                thumbnails/
```

---

# 26. Procesamiento de imágenes

Flujo:

```text
Usuario
   │
   ▼
Upload
   │
   ▼
Validación
   │
   ▼
Object Storage
   │
   ▼
Queue
   │
   ▼
Image Processor
   │
   ├── Resize
   ├── Thumbnail
   ├── WebP/AVIF
   └── Optimization
```

El usuario deberá recibir una experiencia rápida aunque el procesamiento se complete asíncronamente.

---

# 27. Formatos de imágenes

Se conservará opcionalmente un original controlado.

Para publicación se priorizarán:

- WebP;
- AVIF.

Se generarán diferentes dimensiones.

Ejemplo:

```text
320 px
640 px
1024 px
1600 px
```

---

# 28. API

El backend expondrá una API REST.

Base conceptual:

```text
/api/v1
```

Ejemplos:

```text
GET    /api/v1/products
POST   /api/v1/products

GET    /api/v1/products/:id
PATCH  /api/v1/products/:id
DELETE /api/v1/products/:id
```

---

# 29. Versionado

La API deberá versionarse desde el inicio.

```text
/api/v1
```

Esto permitirá introducir cambios futuros sin romper clientes existentes.

---

# 30. OpenAPI

NestJS generará documentación OpenAPI.

Se utilizará para:

- documentación;
- validación;
- integración;
- desarrollo frontend;
- testing.

---

# 31. Autenticación

Se recomienda utilizar autenticación mediante:

- email;
- contraseña;
- sesiones seguras.

Para navegador se priorizarán cookies:

```text
HttpOnly
Secure
SameSite
```

sobre almacenamiento de tokens sensibles en `localStorage`.

---

# 32. Autorización

Se aplicará RBAC.

Roles iniciales:

```text
PLATFORM_ADMIN
BUSINESS_OWNER
BUSINESS_MANAGER
```

Posteriormente podrán introducirse permisos granulares.

Ejemplo:

```text
products:create
products:update
products:delete
analytics:view
business:update
users:manage
```

---

# 33. Portal público

El portal general deberá estar optimizado para SEO y descubrimiento.

Rutas conceptuales:

```text
/
buscar
productos
ofertas
negocios
categorias
```

Ejemplos:

```text
dtodo537.net/ofertas
dtodo537.net/categoria/electronica
dtodo537.net/buscar?q=televisor
```

---

# 34. Showroom público

Ejemplo:

```text
mueblesxyz.dtodo537.net
```

Rutas:

```text
/
productos
productos/[slug]
categorias/[slug]
ofertas
contacto
```

---

# 35. Dashboard

El dashboard se mantendrá dentro del dominio principal.

Propuesta:

```text
app.dtodo537.net
```

Ejemplos:

```text
app.dtodo537.net/dashboard
app.dtodo537.net/products
app.dtodo537.net/design
app.dtodo537.net/analytics
```

Esto evita mezclar administración con las rutas públicas de los showrooms.

---

# 36. Backoffice

Se reservará:

```text
admin.dtodo537.net
```

para administración de plataforma.

Nunca podrá ser utilizado como subdominio de negocio.

---

# 37. Subdominios reservados

Deberá mantenerse una lista como:

```text
www
api
app
admin
static
assets
cdn
mail
status
support
help
blog
docs
```

Estos nombres no podrán ser registrados por tenants.

---

# 38. Personalización

Cada showroom utilizará un Theme.

Ejemplo:

```text
theme = minimal
```

y una configuración:

```json
{
  "primaryColor": "...",
  "secondaryColor": "...",
  "fontFamily": "...",
  "coverStyle": "...",
  "productCardStyle": "..."
}
```

---

# 39. Design Tokens

No se almacenarán páginas personalizadas.

Se almacenarán **Design Tokens**.

Ejemplos:

```text
--primary-color
--secondary-color
--surface-color
--font-family
--border-radius
```

Next.js utilizará estos tokens para renderizar la plantilla correspondiente.

---

# 40. Templates como código

Las plantillas serán componentes mantenidos dentro del repositorio.

Ejemplo:

```text
themes/

minimal/
boutique/
commercial/
```

Esto permitirá:

- versionarlas;
- probarlas;
- optimizarlas;
- mantener seguridad;
- mantener accesibilidad.

---

# 41. Search Architecture — MVP

Durante el MVP no se introducirá Elasticsearch/OpenSearch.

Se utilizará PostgreSQL.

Funciones iniciales:

- índices;
- Full Text Search;
- trigram;
- filtros.

Esto será suficiente para validar el producto.

---

# 42. Evolución de búsqueda

Si el volumen lo justifica podrá incorporarse posteriormente:

```text
Meilisearch
Typesense
OpenSearch
```

sin modificar el modelo de dominio principal.

---

# 43. Analítica

No se utilizarán servicios externos como dependencia fundamental del producto.

La plataforma tendrá eventos propios.

Ejemplo:

```text
SHOWROOM_VIEW
PRODUCT_VIEW
WHATSAPP_CLICK
PHONE_CLICK
SOCIAL_CLICK
SHARE
QR_VISIT
```

---

# 44. Event Tracking

Los eventos públicos no deberán ralentizar el frontend.

Flujo:

```text
Browser
   │
   ▼
Analytics Endpoint
   │
   ▼
Queue
   │
   ▼
Event Processor
   │
   ▼
PostgreSQL
```

Posteriormente podría utilizarse una base analítica especializada.

---

# 45. Click hacia WhatsApp

El flujo recomendado será:

```text
Cliente
   │
   ▼
Botón WhatsApp
   │
   ▼
dtodo537.net/r/whatsapp/...
   │
   ├── registra evento
   │
   ▼
Redirect 302
   │
   ▼
wa.me/...
```

Esto permitirá medir conversión sin acceder a la conversación.

---

# 46. QR

Los QR apuntarán a URLs propias.

No directamente a WhatsApp.

Ejemplo:

```text
https://muebles.dtodo537.net/p/mesa-milano
```

Esto permitirá mantener trazabilidad y cambiar comportamientos posteriormente.

---

# 47. SEO Architecture

Next.js deberá generar metadatos dinámicamente.

Para cada producto:

```text
title
description
canonical
OpenGraph
structured data
```

---

# 48. Schema.org

Se utilizarán cuando corresponda:

```text
Organization
LocalBusiness
Product
Offer
BreadcrumbList
```

Esto mejorará la comprensión de las páginas por buscadores.

---

# 49. Sitemap

Se generarán:

```text
sitemap general
sitemaps por negocios
sitemaps de productos
```

Su generación podrá trasladarse a jobs cuando el volumen crezca.

---

# 50. Cache

No todo deberá consultar PostgreSQL en cada petición.

Se cachearán elementos como:

```text
tenant lookup
business profile
theme
categories
popular products
```

Next.js podrá utilizar también sus mecanismos de caching y revalidation.

---

# 51. Invalidación

Cuando el emprendedor cambie:

- precio;
- producto;
- plantilla;
- logo;
- negocio;

deberá invalidarse la información correspondiente.

Se evitarán TTL excesivamente largos para información comercial dinámica.

---

# 52. Arquitectura de despliegue inicial

La arquitectura será compatible con máquinas virtuales Ubuntu Server.

Propuesta inicial:

```text
                INTERNET
                    │
                    ▼
                  HAProxy
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
     VM WEB                  VM API
    Next.js                  NestJS
                                │
                    ┌───────────┼───────────┐
                    │           │           │
                    ▼           ▼           ▼
               PostgreSQL     Redis       S3/MinIO
```

En una primera etapa de desarrollo o beta, algunos servicios podrían compartir infraestructura si fuese necesario.

La arquitectura lógica permanecerá separada.

---

# 53. Escalamiento horizontal

La solución deberá ser stateless siempre que resulte posible.

Así podrán añadirse posteriormente:

```text
WEB-01
WEB-02
WEB-03
```

y:

```text
API-01
API-02
API-03
```

detrás del balanceador.

---

# 54. Sesiones y escalamiento

La aplicación no deberá depender de sesiones almacenadas exclusivamente en memoria local del proceso.

Esto permitiría balancear peticiones entre diferentes instancias.

---

# 55. Alta disponibilidad futura

Arquitectura futura:

```text
                       HAProxy
                          │
             ┌────────────┴────────────┐
             ▼                         ▼
          WEB-01                    WEB-02

             ┌─────────────────────────┐
             ▼                         ▼
          API-01                    API-02

                       Redis HA

                    PostgreSQL HA

                    Object Storage
```

No será requisito del MVP, pero la arquitectura no deberá impedirlo.

---

# 56. Gestión de procesos

En servidores Linux se utilizará:

**systemd**

para administrar los servicios.

Ejemplo:

```text
dtodo-web.service
dtodo-api.service
dtodo-worker.service
```

---

# 57. Puertos internos conceptuales

Ejemplo:

```text
Next.js       3000
NestJS        3001
PostgreSQL    5432
Redis         6379
```

Los puertos de aplicación no deberán exponerse directamente a Internet.

---

# 58. HTTPS

Toda comunicación pública deberá utilizar HTTPS.

Los subdominios utilizarán certificado wildcard:

```text
*.dtodo537.net
```

y certificado correspondiente para:

```text
dtodo537.net
```

---

# 59. Comunicación WEB → API

El navegador no necesita conocer necesariamente la topología interna.

Podrá utilizarse:

```text
https://api.dtodo537.net
```

o routing interno a través del reverse proxy.

La decisión definitiva podrá tomarse durante despliegue.

---

# 60. Repositorio

Se recomienda **monorepo**.

Estructura:

```text
dtodo537/
│
├── apps/
│   ├── web/
│   ├── api/
│   └── worker/
│
├── packages/
│   ├── ui/
│   ├── config/
│   ├── types/
│   ├── validation/
│   └── eslint-config/
│
├── prisma/
│
├── docs/
│
├── scripts/
│
├── infrastructure/
│
└── tests/
```

---

# 61. Justificación del monorepo

El frontend y backend compartirán:

- tipos;
- contratos;
- validaciones;
- componentes;
- reglas;
- configuración.

El monorepo simplificará:

- coordinación;
- CI;
- refactoring;
- versionado;
- testing.

---

# 62. Package Manager

Se recomienda:

**pnpm**

con workspaces.

---

# 63. Organización propuesta

```text
apps/web
```

Next.js.

```text
apps/api
```

NestJS.

```text
apps/worker
```

procesamiento asíncrono.

```text
packages/ui
```

Design System.

```text
packages/types
```

tipos compartidos.

```text
packages/validation
```

esquemas compartidos cuando corresponda.

---

# 64. Design System

Se desarrollará un pequeño Design System común.

Componentes:

```text
Button
Input
Select
Card
Dialog
Tabs
Table
Badge
ImageUploader
ProductCard
BusinessCard
```

El sistema de plantillas deberá reutilizar sus fundamentos sin perder diferenciación visual.

---

# 65. Seguridad de archivos

No se confiará en:

- extensión;
- nombre;
- MIME declarado por navegador.

El backend deberá validar efectivamente los archivos.

Se impondrán límites de:

- tamaño;
- dimensiones;
- formato;
- cantidad.

---

# 66. Content Security Policy

Las páginas públicas deberán utilizar CSP para reducir riesgos asociados a:

- XSS;
- recursos externos;
- scripts no autorizados.

La personalización no permitirá scripts de tenants.

---

# 67. Rate Limiting

Se aplicará especialmente sobre:

```text
login
register
password recovery
search
analytics
uploads
public API
```

---

# 68. Auditoría

Operaciones sensibles deberán generar audit logs.

Ejemplos:

```text
usuario creado
rol modificado
negocio suspendido
producto eliminado
configuración modificada
tenant eliminado
```

---

# 69. Soft Delete

Entidades comerciales importantes utilizarán inicialmente eliminación lógica.

Ejemplos:

```text
Product
Business
Tenant
User
```

Posteriormente podrán ejecutarse procesos de eliminación definitiva según política de retención.

---

# 70. Observabilidad

Se deberán disponer al menos:

### Logs

Logs estructurados.

### Metrics

- request rate;
- latency;
- error rate;
- CPU;
- memoria;
- conexiones;
- jobs.

### Health checks

Ejemplo:

```text
/api/v1/health
```

---

# 71. Logging

Los logs deberán incluir contexto cuando sea aplicable:

```text
request_id
tenant_id
user_id
module
action
```

Nunca deberán registrar:

- contraseñas;
- tokens;
- datos sensibles innecesarios.

---

# 72. Correlation ID

Cada petición tendrá un identificador.

Ejemplo:

```text
X-Request-ID
```

permitiendo rastrear una operación entre frontend, backend y workers.

---

# 73. Gestión de errores

La API utilizará una estructura consistente.

Ejemplo conceptual:

```json
{
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "El producto solicitado no existe",
    "requestId": "..."
  }
}
```

No deberán exponerse excepciones internas al cliente.

---

# 74. Configuración

Toda configuración variable deberá obtenerse del entorno.

Ejemplos:

```text
DATABASE_URL
REDIS_URL
S3_ENDPOINT
S3_BUCKET
JWT_SECRET
SESSION_SECRET
```

No deberán almacenarse secretos dentro del repositorio.

---

# 75. Ambientes

Se manejarán:

```text
development
staging
production
```

Cada ambiente deberá tener:

- base de datos independiente;
- configuración independiente;
- credenciales independientes;
- almacenamiento independiente.

---

# 76. Migraciones

Las modificaciones de PostgreSQL se realizarán mediante migraciones controladas.

Nunca deberán aplicarse cambios manuales no documentados a producción.

---

# 77. Seed Data

Existirá un mecanismo para cargar:

- roles;
- categorías base;
- plantillas;
- configuración inicial;
- usuario administrativo inicial cuando corresponda.

---

# 78. Testing

La arquitectura deberá soportar:

### Unit tests

Reglas de negocio.

### Integration tests

PostgreSQL, Redis, API.

### E2E

Flujos completos.

Especialmente:

```text
registro
crear negocio
crear producto
publicar
visualizar
WhatsApp
```

---

# 79. Tests multi-tenant

Serán obligatorios.

Ejemplo:

```text
Tenant A crea Product A

Tenant B intenta acceder a Product A

Resultado esperado:

403 o 404
```

Estos tests deberán formar parte del pipeline de CI.

---

# 80. Performance

Objetivos iniciales para páginas públicas:

- rápido First Contentful Paint;
- imágenes optimizadas;
- mínimo JavaScript innecesario;
- SSR/Server Components cuando sea posible;
- caching;
- consultas indexadas.

---

# 81. Mobile First

Las principales acciones administrativas deberán estar optimizadas para teléfono.

Especialmente:

```text
crear producto
tomar fotografía
subir fotografía
cambiar precio
activar oferta
compartir
```

---

# 82. PWA

No será requisito del MVP.

Sin embargo, la arquitectura de frontend no deberá impedir incorporar posteriormente capacidades PWA.

---

# 83. Internacionalización

La primera versión será completamente en español.

No obstante, los textos de interfaz deberán evitar quedar dispersos y codificados directamente en cientos de componentes.

Se recomienda estructurarlos de forma que posteriormente pueda incorporarse i18n.

---

# 84. Monedas

No se fijará una única moneda a nivel de código.

El modelo deberá soportar un código monetario.

Ejemplo:

```text
CUP
USD
EUR
```

El negocio determinará las monedas permitidas según las reglas futuras de la plataforma.

---

# 85. Fechas

Las fechas se almacenarán en UTC.

La representación se realizará según timezone correspondiente.

---

# 86. Moderación

La arquitectura deberá permitir:

```text
ACTIVE
PENDING
SUSPENDED
BLOCKED
```

para negocios y, cuando sea necesario, productos.

---

# 87. Estado de publicación

Los productos podrán disponer de:

```text
DRAFT
PUBLISHED
UNPUBLISHED
ARCHIVED
```

Esto permitirá editar sin afectar inmediatamente el showroom público.

---

# 88. Eventos de dominio

Los módulos podrán publicar eventos internos.

Ejemplos:

```text
ProductPublished
ProductUpdated
OfferCreated
BusinessPublished
ThemeChanged
```

Estos eventos permitirán desacoplar tareas secundarias.

Ejemplo:

```text
ProductPublished
      │
      ├── limpiar cache
      ├── actualizar búsqueda
      └── actualizar sitemap
```

---

# 89. Event Bus

Durante el MVP no se utilizará Kafka/RabbitMQ.

Los eventos podrán manejarse internamente y las tareas asíncronas mediante BullMQ.

La arquitectura deberá permitir introducir un bus externo posteriormente si el volumen lo requiere.

---

# 90. Dependencias externas

Las integraciones externas deberán estar encapsuladas mediante adapters.

Ejemplo:

```text
StorageAdapter
EmailAdapter
AnalyticsAdapter
MessagingAdapter
```

Esto evitará acoplar la lógica de negocio a un proveedor específico.

---

# 91. Deuda tecnológica a evitar

No deberán introducirse durante el MVP:

- microservicios innecesarios;
- Kubernetes;
- Event Sourcing;
- CQRS generalizado;
- Elasticsearch prematuro;
- bases de datos por tenant;
- personalización mediante HTML;
- lógica de negocio dentro de componentes React;
- acceso directo a base de datos desde frontend.

---

# 92. Decisiones cerradas

A partir de este documento se consideran propuestas para aprobación las siguientes decisiones:

### ADR-001

Frontend:

**Next.js + TypeScript**

### ADR-002

Backend:

**NestJS + TypeScript**

### ADR-003

Arquitectura backend:

**Modular Monolith**

### ADR-004

Base de datos:

**PostgreSQL**

### ADR-005

ORM:

**Prisma**

### ADR-006

Multi-tenancy:

**Shared Database + tenant_id**

### ADR-007

Cache y jobs:

**Redis + BullMQ**

### ADR-008

Archivos:

**S3-compatible Object Storage**

### ADR-009

Repositorio:

**Monorepo**

### ADR-010

Package manager:

**pnpm**

### ADR-011

API:

**REST + OpenAPI**

### ADR-012

Deployment:

**Linux/Ubuntu + systemd + reverse proxy**

---

# 93. Flujo completo de una visita

Ejemplo:

```text
1. Usuario abre:

   muebles.dtodo537.net

2. DNS wildcard resuelve dominio.

3. HAProxy/Nginx recibe petición.

4. Petición llega a Next.js.

5. Middleware identifica hostname.

6. Tenant Resolver determina:

   tenant = Muebles XYZ

7. Next.js solicita datos públicos.

8. NestJS valida TenantContext.

9. Datos se obtienen desde cache/PostgreSQL.

10. Next.js renderiza Theme correspondiente.

11. Página se devuelve optimizada.

12. Usuario consulta un producto.

13. Se registra ProductView.

14. Usuario pulsa WhatsApp.

15. Se registra WhatsAppClick.

16. Navegador redirige hacia WhatsApp.
```

---

# 94. Flujo de publicación

```text
Emprendedor
    │
    ▼
app.dtodo537.net
    │
    ▼
Login
    │
    ▼
TenantContext
    │
    ▼
Crear producto
    │
    ├── Datos → PostgreSQL
    │
    └── Fotos → Object Storage
                   │
                   ▼
                 Queue
                   │
                   ▼
                Worker
                   │
                   ▼
          versiones optimizadas
                   │
                   ▼
                Publicar
                   │
            ┌──────┼───────┐
            ▼      ▼       ▼
          Cache  Search  Sitemap
```

---

# 95. Escenario de crecimiento

El diseño permitirá evolucionar desde:

```text
1 Web
1 API
1 Worker
1 PostgreSQL
1 Redis
```

hasta:

```text
N Web
N API
N Workers
PostgreSQL HA
Redis HA
Object Storage distribuido
Search Engine
Analytics Store
CDN
```

sin modificar el modelo fundamental del producto.

---

# 96. Conclusión arquitectónica

La arquitectura propuesta busca equilibrar:

- simplicidad;
- robustez;
- crecimiento;
- seguridad;
- mantenibilidad.

No se pretende diseñar desde el inicio una infraestructura para millones de usuarios.

Se pretende diseñar correctamente los límites y componentes fundamentales para que el producto pueda crecer sin tener que ser reconstruido.

La decisión principal será mantener inicialmente una arquitectura:

> **Next.js + NestJS + PostgreSQL + Redis + S3, implementada como SaaS multi-tenant mediante un monolito modular, con separación clara entre portal público, showrooms, dashboard empresarial y administración global.**

---

# 97. Principio arquitectónico rector

La sofisticación tecnológica deberá permanecer detrás de la plataforma.

Para el emprendedor, la experiencia deberá seguir siendo:

```text
Entrar
  ↓
Publicar producto
  ↓
Subir fotografías
  ↓
Poner precio
  ↓
Publicar
```

La arquitectura existe para hacer posible esa simplicidad, no para trasladar su complejidad al usuario.