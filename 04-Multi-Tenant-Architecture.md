# 04 — Multi-Tenant Architecture

**Proyecto:** Plataforma Digital de Showrooms Comerciales Multi-Negocio  
**Dominio previsto:** `dtodo537.net`  
**Nombre comercial:** Por definir  
**Versión:** 0.1  
**Estado:** Arquitectura multi-tenant propuesta para aprobación

---

# 1. Propósito

Este documento define la arquitectura multi-tenant de `dtodo537.net`.

Su objetivo es garantizar que múltiples negocios compartan una misma plataforma tecnológica sin comprometer:

- aislamiento de datos;
- seguridad;
- rendimiento;
- mantenibilidad;
- escalabilidad;
- experiencia de usuario;
- administración centralizada.

La multi-tenencia será una característica estructural de la solución y no una funcionalidad añadida posteriormente.

---

# 2. Modelo de multi-tenancy seleccionado

Se adopta el modelo:

**Shared Database + Shared Schema + `tenant_id`**

Es decir:

- una base PostgreSQL;
- un esquema lógico compartido;
- tablas comunes;
- aislamiento mediante `tenant_id`.

Ejemplo:

```text
products
--------
id
tenant_id
business_id
name
...
```

---

# 3. Razones para esta decisión

Este modelo ofrece el mejor equilibrio para el MVP entre:

- simplicidad operacional;
- coste de infraestructura;
- facilidad de mantenimiento;
- creación rápida de nuevos tenants;
- estadísticas globales;
- escalabilidad razonable.

Se descartan inicialmente:

- una base de datos por tenant;
- un esquema PostgreSQL por tenant;
- una aplicación independiente por negocio.

Estas opciones añadirían complejidad prematura.

---

# 4. Frontera de seguridad

El `Tenant` constituye la frontera principal de aislamiento administrativo.

Conceptualmente:

```text
Tenant A
 ├── Business A1
 ├── Users
 ├── Products
 └── Analytics

Tenant B
 ├── Business B1
 ├── Users
 ├── Products
 └── Analytics
```

Ningún usuario de Tenant A podrá acceder a información privada de Tenant B.

---

# 5. Tenant Resolver

Cada solicitud deberá determinar primero el contexto de tenant cuando corresponda.

Flujo conceptual:

```text
Request
   │
   ▼
Hostname
   │
   ▼
Subdomain Resolver
   │
   ▼
Tenant Lookup
   │
   ▼
TenantContext
```

---

# 6. Resolución por hostname

Ejemplo:

```text
muebles.dtodo537.net
```

se interpreta como:

```text
subdomain = muebles
```

y se resuelve contra:

```text
Showroom.subdomain
```

para obtener:

```text
business_id
tenant_id
showroom_id
```

---

# 7. Dominios del sistema

Se reservan inicialmente:

```text
dtodo537.net
www.dtodo537.net
app.dtodo537.net
admin.dtodo537.net
api.dtodo537.net
```

Estos dominios no se resolverán como tenants públicos.

---

# 8. Dominios de showroom

Los restantes subdominios válidos podrán representar showrooms:

```text
muebles.dtodo537.net
cafe.dtodo537.net
electro.dtodo537.net
```

---

# 9. Lista de subdominios reservados

Como mínimo:

```text
www
app
admin
api
cdn
assets
static
media
mail
smtp
imap
pop
ftp
status
docs
help
support
blog
auth
login
account
accounts
dashboard
system
root
localhost
```

La lista deberá ser configurable desde administración global.

---

# 10. Normalización

Los subdominios deberán normalizarse antes de validarse.

Reglas iniciales:

- minúsculas;
- sin espacios;
- sin caracteres especiales;
- sin acentos;
- longitud controlada;
- compatible con DNS;
- no comenzar ni terminar con guion;
- no contener dobles puntos;
- no pertenecer a lista reservada.

Ejemplo:

```text
Muebles Habana
```

podría sugerir:

```text
muebles-habana
```

---

# 11. Unicidad

El subdominio deberá ser único globalmente.

Constraint:

```text
UNIQUE(showroom.subdomain)
```

Dos tenants nunca podrán compartir:

```text
muebles.dtodo537.net
```

---

# 12. TenantContext

Se define un contexto interno:

```typescript
interface TenantContext {
  tenantId: string;
  businessId?: string;
  showroomId?: string;
  subdomain?: string;
  tenantStatus: string;
}
```

No todos los campos estarán presentes en todas las rutas.

---

# 13. Tipos de contexto

Se distinguen tres escenarios.

## Contexto público de showroom

```text
tenantId
businessId
showroomId
subdomain
```

## Contexto administrativo

```text
tenantId
userId
membership
permissions
```

## Contexto global

Para:

```text
dtodo537.net
admin.dtodo537.net
```

puede no existir tenant específico.

---

# 14. El tenant nunca será confiado desde el cliente

Regla crítica:

El cliente no podrá seleccionar arbitrariamente:

```text
tenantId
```

mediante request body, query string o header público.

Incorrecto:

```json
{
  "tenantId": "uuid-del-tenant",
  "name": "Producto"
}
```

Correcto:

```json
{
  "name": "Producto"
}
```

y:

```text
tenantId = TenantContext
```

---

# 15. Tenant en rutas administrativas

Para `app.dtodo537.net`, el tenant se determinará mediante la sesión autenticada y Membership.

Ejemplo:

```text
User
  ↓
Membership
  ↓
Tenant
```

Si el usuario pertenece a varios tenants, podrá existir posteriormente un selector explícito.

Ese selector no concederá acceso por sí mismo: deberá validarse Membership.

---

# 16. Usuarios con varios tenants

El modelo permite:

```text
User A
 ├── Tenant 1
 └── Tenant 2
```

En ese escenario, la sesión podrá almacenar:

```text
activeTenantId
```

pero este valor siempre deberá validarse contra Membership.

---

# 17. Aislamiento en aplicación

Toda operación tenant-aware deberá pasar por una capa que aplique TenantContext.

Ejemplo conceptual:

```text
Controller
   ↓
Application Service
   ↓
Tenant Guard
   ↓
Repository
   ↓
Database
```

---

# 18. NestJS Guards

NestJS utilizará Guards para:

- autenticación;
- estado del tenant;
- membership;
- roles;
- permisos.

Ejemplo:

```text
AuthGuard
TenantGuard
MembershipGuard
PermissionGuard
```

---

# 19. Middleware versus Guard

Middleware podrá identificar hostname y construir información preliminar.

Guards validarán seguridad y autorización.

Conceptualmente:

```text
Middleware
→ ¿qué tenant parece ser?

Guard
→ ¿puede esta petición operar sobre él?
```

---

# 20. Request Scope

TenantContext deberá estar disponible durante toda la solicitud.

Puede implementarse mediante:

- request-scoped provider;
- AsyncLocalStorage;
- contexto explícito en services.

Se recomienda evitar depender de variables globales mutables.

---

# 21. AsyncLocalStorage

NestJS puede utilizar `AsyncLocalStorage` para propagar de forma segura:

```text
requestId
tenantId
userId
```

a través de la ejecución asíncrona.

Esto facilitará:

- logging;
- auditoría;
- repositorios;
- tracing.

---

# 22. Tenant-aware repositories

Los repositorios tenant-aware deberán exigir contexto.

Ejemplo conceptual:

```typescript
productRepository.findById(productId, tenantContext)
```

o usar contexto inyectado.

No deberán ofrecer métodos ambiguos del tipo:

```typescript
findById(productId)
```

para entidades tenant-aware.

---

# 23. Consultas Prisma

Toda consulta tenant-aware deberá filtrar por tenant.

Ejemplo:

```typescript
prisma.product.findFirst({
  where: {
    id: productId,
    tenantId: ctx.tenantId,
  },
});
```

---

# 24. No usar `findUnique` de forma insegura

Aunque `id` sea globalmente único, para operaciones tenant-aware no deberá asumirse que conocer el UUID implica autorización.

Ejemplo problemático:

```typescript
findUnique({
  where: { id: productId }
})
```

Preferible:

```typescript
findFirst({
  where: {
    id: productId,
    tenantId: ctx.tenantId
  }
})
```

---

# 25. Composite constraints

Cuando resulte apropiado, se utilizarán constraints compuestos.

Ejemplo:

```text
UNIQUE(
  tenant_id,
  business_id,
  slug
)
```

Esto refuerza consistencia.

---

# 26. Integridad Business-Tenant

Si Product contiene:

```text
tenant_id
business_id
```

deberá garantizarse que el Business pertenezca al mismo Tenant.

No deberá permitirse:

```text
Product.tenantId = Tenant A
Product.businessId = Business de Tenant B
```

---

# 27. Validación en servicio

El Application Service deberá validar esta relación al crear o modificar entidades.

---

# 28. Refuerzo en base de datos

Cuando sea viable, se podrán utilizar claves compuestas o constraints para reforzar invariantes.

Ejemplo conceptual:

```text
Business:
UNIQUE(id, tenant_id)
```

y Product referenciar:

```text
(business_id, tenant_id)
```

Esto proporciona protección adicional.

---

# 29. Row Level Security

PostgreSQL RLS se considera recomendable como defensa adicional.

No será la única protección.

Modelo:

```text
Application isolation
+
Database isolation
```

---

# 30. Estrategia RLS

Para tablas tenant-aware se podrá definir:

```sql
tenant_id = current_setting('app.tenant_id')::uuid
```

La aplicación establecerá el tenant en cada transacción o conexión.

---

# 31. Ventaja de RLS

Aunque exista un error en una consulta de aplicación, PostgreSQL puede impedir devolver filas de otro tenant.

Esto reduce el impacto de errores como:

```sql
SELECT * FROM products;
```

---

# 32. RLS y Prisma

La integración con Prisma deberá diseñarse cuidadosamente debido al pooling de conexiones.

Nunca deberá asumirse que una variable de sesión permanecerá asociada a una petición.

Se recomienda utilizar:

```text
SET LOCAL
```

dentro de una transacción.

---

# 33. Estrategia propuesta

Para operaciones sensibles:

```text
BEGIN
SET LOCAL app.tenant_id = '...'
queries
COMMIT
```

Al finalizar la transacción, el valor desaparece automáticamente.

---

# 34. RLS en MVP

Se recomienda implementar RLS al menos sobre entidades críticas:

- Business;
- Showroom;
- Product;
- Category;
- Offer;
- MediaAsset;
- Membership;
- Analytics.

La arquitectura de datos detallará la implementación exacta.

---

# 35. Roles de base de datos

Se recomienda separar:

```text
dtodo_app
dtodo_admin
dtodo_migrations
```

## dtodo_app

Usado por la aplicación normal.

Sujeto a RLS.

## dtodo_admin

Operaciones globales controladas.

## dtodo_migrations

Migraciones de esquema.

---

# 36. Bypass RLS

La aplicación normal no deberá tener privilegios:

```text
BYPASSRLS
```

Ese privilegio deberá reservarse para operaciones administrativas muy controladas, si fuese necesario.

---

# 37. Portal general y RLS

El portal global necesita consultar productos publicados de múltiples tenants.

No deberá simplemente deshabilitar el aislamiento general.

Se recomienda exponer consultas públicas controladas.

Ejemplo:

```text
PublicCatalogRepository
```

que consulte solo:

- Business publicados;
- Showroom publicados;
- Products publicados;
- Offers activas.

---

# 38. Public projections

Puede utilizarse una vista lógica:

```text
public_products
```

que contenga únicamente campos públicos.

Esto reduce riesgo de exponer información administrativa.

---

# 39. Global operations

Las operaciones globales deberán estar explícitamente identificadas.

Ejemplos:

```text
GlobalSearchService
PlatformAnalyticsService
PlatformAdminService
```

Nunca deberán reutilizar accidentalmente repositorios tenant-aware sin contexto.

---

# 40. Regla de diseño

Un método deberá ser claramente:

```text
tenant scoped
```

o:

```text
platform scoped
```

Nunca ambiguo.

---

# 41. Acceso público

El acceso público al showroom no requiere autenticación.

Sin embargo, sigue estando limitado al tenant resuelto por hostname.

Ejemplo:

```text
muebles.dtodo537.net/productos/mesa
```

solo puede consultar productos públicos de ese Business/Tenant.

---

# 42. Acceso administrativo

Para administrar un producto se requiere:

```text
Authenticated User
+
Active Membership
+
Tenant Active
+
Permission
```

---

# 43. Estado del tenant

Las reglas podrán ser:

## PENDING

Acceso limitado al onboarding.

## ACTIVE

Operación normal.

## SUSPENDED

Administración bloqueada parcialmente o totalmente.

## BLOCKED

Sin acceso y showroom oculto.

## CLOSED

Cuenta cerrada y pendiente de retención/eliminación.

---

# 44. Estado de Business

Tenant activo no implica automáticamente que todos sus negocios estén publicados.

Business podrá estar:

```text
DRAFT
PENDING
PUBLISHED
SUSPENDED
ARCHIVED
```

---

# 45. Resolución pública completa

Flujo:

```text
Request:
muebles.dtodo537.net

        ↓

Validate hostname

        ↓

Extract:
muebles

        ↓

Lookup Showroom:
subdomain = muebles
status = PUBLISHED

        ↓

Load Business

        ↓

Load Tenant

        ↓

Validate:
Tenant = ACTIVE
Business = PUBLISHED
Showroom = PUBLISHED

        ↓

Create PublicTenantContext
```

---

# 46. Caching del Tenant Resolver

Resolver el tenant en cada request directamente contra PostgreSQL puede ser innecesario.

Se utilizará Redis.

Ejemplo:

```text
tenant:subdomain:muebles
```

valor:

```json
{
  "tenantId": "...",
  "businessId": "...",
  "showroomId": "...",
  "tenantStatus": "ACTIVE",
  "businessStatus": "PUBLISHED"
}
```

---

# 47. TTL

El cache deberá tener TTL moderado.

Ejemplo conceptual:

```text
5–15 minutos
```

pero cambios críticos deberán invalidarlo inmediatamente.

---

# 48. Invalidación

Se invalidará cuando cambie:

- subdominio;
- estado del Tenant;
- estado del Business;
- estado del Showroom;
- publicación;
- suspensión.

---

# 49. Suspensión inmediata

Si un Tenant es bloqueado por seguridad, no puede depender exclusivamente de esperar a que expire Redis.

La operación deberá:

1. modificar PostgreSQL;
2. invalidar cache;
3. opcionalmente publicar evento de invalidación.

---

# 50. Redis key naming

Se utilizarán prefijos consistentes.

Ejemplo:

```text
dtodo:tenant:subdomain:muebles
dtodo:tenant:id:<uuid>
dtodo:showroom:<uuid>
```

---

# 51. Custom domains

No forman parte del MVP inicial, pero el modelo debe soportarlos.

Ejemplo futuro:

```text
www.mueblesxyz.com
```

Resolverá hacia el mismo:

```text
tenantId
businessId
showroomId
```

---

# 52. Domain Resolver

En el futuro se evolucionará de:

```text
SubdomainResolver
```

a:

```text
DomainResolver
```

que acepte:

```text
*.dtodo537.net
custom domains
```

---

# 53. Custom domain ownership

Antes de activar un dominio personalizado deberá verificarse propiedad mediante algún mecanismo como:

- DNS TXT;
- CNAME;
- archivo/verificación HTTP.

---

# 54. HTTPS custom domains

Los dominios personalizados requerirán certificados individuales automatizados.

Esto no afecta el certificado wildcard principal.

---

# 55. API y multi-tenancy

La API administrativa no aceptará tenant arbitrario.

Ejemplo:

```text
POST /api/v1/products
```

resuelve TenantContext desde la sesión.

---

# 56. API pública de showroom

Puede utilizar:

```text
GET /api/v1/public/products/:slug
```

pero el tenant deberá venir del dominio/contexto, no de un parámetro libre no validado.

---

# 57. API global

Para el portal general existirán endpoints explícitos.

Ejemplo:

```text
GET /api/v1/public/search
GET /api/v1/public/offers
GET /api/v1/public/businesses
```

Estos endpoints operan sobre proyecciones públicas globales.

---

# 58. Headers internos

Si Next.js y NestJS están detrás de un reverse proxy, podrá propagarse internamente información resuelta.

Ejemplo:

```text
X-Dtodo-Host
X-Request-ID
```

Pero NestJS deberá volver a validar el contexto cuando exista riesgo de manipulación.

---

# 59. Headers de tenant

No se confiará en un header enviado directamente por navegador como:

```text
X-Tenant-ID
```

salvo que sea eliminado y recreado por infraestructura confiable.

---

# 60. Next.js y Tenant Resolution

Next.js deberá identificar el hostname para:

- elegir layout;
- obtener configuración;
- renderizar showroom.

Pero la autorización de datos permanecerá en backend.

El frontend no será frontera de seguridad.

---

# 61. Middleware Next.js

El middleware puede distinguir:

```text
main
app
admin
showroom
```

según hostname.

Ejemplo:

```text
dtodo537.net → portal
app.dtodo537.net → dashboard
admin.dtodo537.net → backoffice
*.dtodo537.net → showroom
```

---

# 62. Rewrites

Next.js podrá utilizar rewrites internas.

Ejemplo conceptual:

```text
muebles.dtodo537.net/productos/mesa
```

internamente:

```text
/_sites/muebles/productos/mesa
```

sin cambiar la URL del navegador.

---

# 63. Seguridad de rewrites

El slug de subdominio resuelto por frontend nunca sustituirá la validación backend.

---

# 64. Media isolation

Los archivos deberán mantenerse organizados por tenant.

Ejemplo:

```text
tenant/<tenant-id>/business/<business-id>/products/...
```

---

# 65. Object keys

Nunca se confiará en una ruta completa proporcionada por el usuario.

El backend generará object keys.

---

# 66. Media authorization

Para archivos privados o temporales deberán generarse URLs firmadas.

Los archivos públicos publicados podrán servirse desde CDN/Object Storage según política.

---

# 67. Eliminación de archivos

Un Tenant no deberá poder eliminar object keys pertenecientes a otro tenant.

Toda operación de media validará:

```text
media.tenantId == TenantContext.tenantId
```

---

# 68. Jobs multi-tenant

Los jobs asíncronos deberán contener contexto explícito.

Ejemplo:

```json
{
  "tenantId": "...",
  "businessId": "...",
  "productId": "...",
  "mediaId": "..."
}
```

---

# 69. Validación en workers

Un worker nunca deberá confiar únicamente en los IDs recibidos.

Debe verificar que las entidades pertenecen al tenant indicado.

---

# 70. Colas

Podrán existir colas por tipo de trabajo:

```text
media-processing
analytics
email
maintenance
```

No se necesita una cola independiente por tenant.

---

# 71. Analítica tenant-aware

Los eventos tendrán:

```text
tenantId
businessId
```

cuando correspondan.

Esto permite dashboards por negocio y estadísticas globales.

---

# 72. Eventos globales

Ejemplo:

```text
SEARCH
```

en portal general puede no tener Tenant específico.

Sin embargo, un:

```text
PRODUCT_VIEW
```

sí debe poder atribuirse al tenant/producto.

---

# 73. Auditoría multi-tenant

AuditLog deberá registrar:

```text
tenantId
userId
action
entityType
entityId
requestId
```

Esto permite reconstruir acciones dentro de cada espacio.

---

# 74. Logging

Los logs estructurados deberán incorporar:

```text
requestId
tenantId
businessId
userId
hostname
```

cuando estén disponibles.

---

# 75. No filtrar secretos

El contexto de tenant no deberá contener secretos ni credenciales.

---

# 76. Search y aislamiento

El buscador global solo indexará información pública.

Nunca deberá indexar:

- borradores;
- datos internos;
- usuarios;
- configuraciones;
- auditoría.

---

# 77. Índice futuro externo

Si se incorpora OpenSearch/Meilisearch/Typesense, cada documento deberá contener:

```text
tenantId
businessId
publicationStatus
```

y la sincronización deberá respetar publicación/despublicación.

---

# 78. Search dentro de showroom

Cuando el usuario busca dentro de:

```text
muebles.dtodo537.net
```

la búsqueda deberá aplicar:

```text
businessId = showroom.businessId
```

---

# 79. Portal general

Cuando busca desde:

```text
dtodo537.net
```

puede consultar múltiples businesses, pero solo datos públicos y elegibles.

---

# 80. Subscription isolation

Los límites del plan se aplican al Tenant.

Ejemplo:

```text
MAX_PRODUCTS
MAX_USERS
MAX_STORAGE
```

Un Tenant no podrá consumir cuota de otro.

---

# 81. Contadores

Para cuotas deberán existir consultas fiables.

Ejemplo:

```text
COUNT products
WHERE tenant_id = currentTenant
AND deleted_at IS NULL
```

---

# 82. Storage quotas

Todo MediaAsset tendrá:

```text
tenantId
size
```

permitiendo calcular almacenamiento utilizado.

---

# 83. Rate limiting por tenant

Además de limitar por IP, podrá aplicarse:

```text
tenantId
```

a operaciones administrativas y APIs.

Esto evita que un Tenant abuse de recursos compartidos.

---

# 84. Fair use

La plataforma deberá poder protegerse de un tenant que genere consumo desproporcionado.

Controles futuros:

- rate limit;
- storage quota;
- product limit;
- job limit;
- bandwidth controls.

---

# 85. Noisy neighbor

Riesgo:

Un Tenant con catálogo o tráfico muy alto puede degradar a otros.

Medidas:

- Redis cache;
- índices;
- rate limiting;
- worker queues;
- paginación;
- límites;
- monitorización.

---

# 86. Consultas siempre paginadas

Listados administrativos y públicos deberán paginarse.

Nunca:

```text
SELECT todos los productos del tenant
```

sin límite.

---

# 87. Índices

Se priorizarán índices como:

```text
(tenant_id)
(tenant_id, business_id)
(tenant_id, publication_status)
(business_id, slug)
(showroom.subdomain)
```

---

# 88. Métricas por tenant

Se recomienda medir:

- requests;
- errores;
- almacenamiento;
- productos;
- media;
- jobs;
- visitas.

Esto ayudará a detectar anomalías.

---

# 89. Backups

El backup será inicialmente de base compartida.

Por tanto, la restauración individual de un tenant no será trivial.

Deberá contemplarse una estrategia de exportación lógica por tenant para casos específicos.

---

# 90. Restore completo

PostgreSQL:

```text
backup global
```

restaura todos los tenants.

---

# 91. Export tenant

Se podrá implementar posteriormente:

```text
ExportTenantService
```

para:

- migración;
- soporte;
- cumplimiento;
- recuperación selectiva.

---

# 92. Eliminación de tenant

El proceso deberá encontrar todos los recursos relacionados:

- Business;
- Products;
- Categories;
- Media;
- Analytics;
- Memberships;
- Subscription;
- Audit metadata según política.

---

# 93. Cascadas

No se recomienda depender de cascadas destructivas automáticas para eliminar completamente un Tenant.

Debe existir un proceso explícito y auditable.

---

# 94. Soft delete

El primer paso será:

```text
Tenant.status = CLOSED
deletedAt = timestamp
```

No destrucción inmediata.

---

# 95. Tenant provisioning

Crear Tenant deberá ejecutar:

```text
Tenant
  ↓
Owner Membership
  ↓
Business
  ↓
Showroom
  ↓
Default Theme
  ↓
Subscription
  ↓
Initial Configuration
```

---

# 96. Provisioning transaction

Los componentes esenciales deberán crearse dentro de una transacción.

Si falla un elemento crítico:

```text
ROLLBACK
```

---

# 97. Subdomain reservation

La reserva del subdominio deberá ocurrir de forma atómica para evitar carreras.

Ejemplo:

Dos usuarios intentan registrar:

```text
muebles
```

simultáneamente.

Solo uno puede obtenerlo.

---

# 98. Race condition

La protección real será el constraint UNIQUE en PostgreSQL.

Una comprobación previa de disponibilidad mejora UX pero no sustituye el constraint.

---

# 99. Cambio de subdominio

Proceso:

```text
Validate new slug
  ↓
Check reserved
  ↓
Attempt unique update
  ↓
Invalidate Redis
  ↓
Revalidate pages
  ↓
Audit
```

---

# 100. URL anterior

En versiones futuras podrá mantenerse redirección temporal desde el subdominio anterior.

No es requisito del MVP.

---

# 101. Domain events

Eventos relevantes:

```text
TenantCreated
TenantActivated
TenantSuspended
TenantClosed
BusinessCreated
ShowroomPublished
SubdomainChanged
SubscriptionChanged
```

---

# 102. Cache invalidation events

Ejemplo:

```text
SubdomainChanged
     │
     ├── invalidate old subdomain
     ├── cache new subdomain
     └── revalidate Next.js
```

---

# 103. Testing multi-tenant

Los tests de aislamiento serán obligatorios.

No opcionales.

---

# 104. Test básico de lectura

```text
Tenant A:
Product A

Tenant B:
Product B

User A consulta Product B

Expected:
404 o 403
```

Preferentemente 404 cuando no sea conveniente revelar existencia.

---

# 105. Test de actualización

```text
User A intenta PATCH Product B

Expected:
404/403

Product B unchanged
```

---

# 106. Test de eliminación

```text
User A intenta DELETE Product B

Expected:
404/403
```

---

# 107. Test de media

```text
Tenant A intenta eliminar MediaAsset de Tenant B

Expected:
denied
```

---

# 108. Test de categorías

```text
Product Tenant A
Category Tenant B

Intento de asociación

Expected:
validation failure
```

---

# 109. Test de Business

```text
Tenant A intenta crear Product
para Business Tenant B

Expected:
validation failure
```

---

# 110. Test de Membership

```text
User pertenece a Tenant A

Envía activeTenantId = Tenant B

Expected:
access denied
```

---

# 111. Test de subdomain

```text
Showroom A = tienda1

Tenant B intenta registrar tienda1

Expected:
unique conflict
```

---

# 112. Test de cache

Suspender un tenant debe provocar:

```text
previous cached public response
→ invalidated
→ showroom unavailable
```

---

# 113. Test RLS

Crear deliberadamente una consulta sin `tenant_id`.

PostgreSQL deberá impedir devolver filas de otro tenant cuando RLS esté activo.

---

# 114. CI

La suite multi-tenant deberá ejecutarse automáticamente en cada Pull Request.

Un fallo de aislamiento bloqueará merge.

---

# 115. Security regression tests

Toda vulnerabilidad multi-tenant corregida deberá generar un test de regresión.

---

# 116. 403 versus 404

Regla general:

Si revelar la existencia del recurso puede filtrar información entre tenants:

```text
404
```

es preferible.

Ejemplo:

Tenant A consulta UUID real de Product B.

Respuesta:

```text
404 Product not found
```

---

# 117. IDs no son seguridad

UUID dificulta enumeración, pero no constituye mecanismo de autorización.

La autorización deberá funcionar incluso si el atacante conoce un ID válido.

---

# 118. Portal general como excepción controlada

El portal global necesita mezclar ofertas de múltiples tenants.

Esto deberá considerarse una **proyección pública explícita**, no una ruptura del aislamiento.

---

# 119. Public eligibility

Un Product podrá aparecer globalmente si:

```text
Tenant = ACTIVE
Business = PUBLISHED
Showroom = PUBLISHED
Product = PUBLISHED
Moderation != BLOCKED
```

---

# 120. Datos permitidos globalmente

Como mínimo:

- nombre comercial;
- logo;
- producto;
- fotografía;
- precio;
- disponibilidad;
- categoría pública;
- subdominio;
- descripción pública;
- ubicación pública.

---

# 121. Datos prohibidos globalmente

Nunca:

- usuarios administrativos;
- emails privados de cuenta;
- memberships;
- audit logs;
- subscription interna;
- configuraciones sensibles;
- tokens;
- métricas privadas.

---

# 122. Seguridad en administración global

`admin.dtodo537.net` tendrá privilegios transversales.

Este entorno requiere controles adicionales:

- MFA futuro;
- auditoría obligatoria;
- roles globales;
- rate limiting;
- sesiones más restrictivas.

---

# 123. Impersonation

No se implementará inicialmente la capacidad de que un administrador “entre como” un usuario.

Si se incorpora en el futuro deberá ser:

- explícita;
- temporal;
- altamente auditada;
- visible.

---

# 124. Soporte técnico

Los operadores de soporte no deberán recibir acceso global por defecto.

Se utilizará principio de mínimo privilegio.

---

# 125. Data ownership

El tenant será propietario lógico de sus datos empresariales dentro de la plataforma.

La plataforma administra infraestructura y proyecciones públicas.

---

# 126. No duplicar datos por tenant innecesariamente

Entidades globales se compartirán.

Ejemplos:

```text
Theme
SubscriptionPlan
BusinessType
PlatformCategory
```

No se copiarán en cada tenant.

---

# 127. Feature flags

Podrán existir flags:

```text
global
plan-based
tenant-specific
```

Ejemplo:

```text
SEMANTIC_SEARCH
CUSTOM_DOMAIN
AI_DESCRIPTION
```

---

# 128. TenantFeatureOverride

Futuro:

```text
tenantId
feature
value
```

permitirá pilotos o excepciones sin modificar planes.

---

# 129. Migraciones

Una migración de base de datos afectará el esquema compartido para todos los tenants.

Por eso las migraciones deberán ser:

- backward compatible cuando sea posible;
- automatizadas;
- probadas;
- reversibles cuando sea razonable.

---

# 130. Despliegues

No se desplegará una versión diferente de aplicación por tenant.

Todos usarán el mismo código de plataforma.

---

# 131. Personalización sin fork

Nunca se creará:

```text
branch-muebles
branch-cafe
branch-tecnologia
```

La personalización será mediante datos y ThemeConfiguration.

---

# 132. Principio crítico

**Un tenant nunca genera una versión propia del software.**

Genera una configuración propia del software.

---

# 133. Escalamiento futuro

El modelo Shared Database podrá mantenerse mientras el volumen sea razonable.

Si determinados tenants crecieran excepcionalmente, puede evolucionarse hacia un modelo híbrido.

---

# 134. Hybrid tenancy futuro

Ejemplo:

```text
Tenant normales
→ Shared Database

Tenant Enterprise
→ Dedicated Database
```

La lógica de dominio no debería depender directamente de una única conexión fija.

---

# 135. DataSourceResolver futuro

Podrá existir:

```text
TenantContext
      ↓
DataSourceResolver
      ↓
Shared DB / Dedicated DB
```

No se implementará en el MVP, pero la arquitectura modular facilita esta evolución.

---

# 136. Sharding futuro

No es requisito actual.

No deberá introducirse complejidad para soportarlo prematuramente.

---

# 137. Riesgos principales

## Riesgo 1 — Consulta sin tenant

Mitigación:

- repositories tenant-aware;
- RLS;
- tests.

## Riesgo 2 — Manipulación de IDs

Mitigación:

- autorización contextual;
- no confiar en UUID.

## Riesgo 3 — Cache cruzado

Mitigación:

- keys con tenant/business;
- validación estricta.

## Riesgo 4 — Media cruzada

Mitigación:

- object key generado;
- MediaAsset tenant-aware.

## Riesgo 5 — Jobs cruzados

Mitigación:

- tenant context explícito;
- validación worker.

## Riesgo 6 — Administración global excesiva

Mitigación:

- RBAC global;
- auditoría;
- mínimo privilegio.

---

# 138. Cache poisoning multi-tenant

Nunca utilizar keys ambiguas como:

```text
product:123
```

Preferible:

```text
tenant:<tenantId>:product:<productId>
```

o para contenido público:

```text
business:<businessId>:product:<slug>
```

---

# 139. CDN

Cuando se incorpore CDN, la URL del asset deberá ser globalmente única.

Los assets no deben depender solo de nombres proporcionados por usuario.

---

# 140. URLs firmadas

Para uploads directos:

```text
Client
  ↓
API requests signed upload
  ↓
API validates tenant/quota
  ↓
Signed URL
  ↓
Object Storage
```

---

# 141. Upload completion

Después de upload directo, el backend deberá confirmar:

- object existe;
- tamaño;
- tipo;
- tenant ownership;
- procesamiento.

---

# 142. Anti-abuse

El aislamiento también implica proteger la plataforma del uso abusivo de un tenant.

Por tenant:

```text
upload rate
storage
number of products
number of users
API calls
jobs
```

---

# 143. Dashboard queries

Todas las consultas de dashboard deberán partir de TenantContext.

Ejemplo:

```text
analyticsService.getDashboard(ctx)
```

No:

```text
getDashboard(tenantIdFromQuery)
```

---

# 144. Business selector

Si Tenant administra múltiples Business:

```text
TenantContext
+
businessId selection
```

El `businessId` sí puede venir de UI, pero debe validarse:

```text
Business.tenantId == TenantContext.tenantId
```

---

# 145. Scope hierarchy

Conceptualmente:

```text
Platform
   ↓
Tenant
   ↓
Business
   ↓
Showroom/Product
```

Cada operación deberá conocer su scope.

---

# 146. Scope enum

Puede definirse internamente:

```text
PLATFORM
TENANT
BUSINESS
PUBLIC
```

para permisos y servicios.

---

# 147. Auditoría de cambios de scope

Operaciones como:

```text
move business between tenants
```

no se permitirán inicialmente.

Si alguna vez se requieren, serán procesos administrativos especiales.

---

# 148. Exportación

Una exportación tenant-aware deberá filtrar explícitamente por tenant y verificar identidad antes de producir el archivo.

---

# 149. Imports

Una importación masiva futura jamás podrá aceptar `tenant_id` desde CSV.

El tenant será el contexto de la importación.

---

# 150. Webhooks futuros

Si se incorporan integraciones, cada webhook deberá asociarse inequívocamente a un tenant mediante credencial o endpoint seguro.

---

# 151. API keys futuras

Las API keys serán tenant-aware.

Ejemplo:

```text
api_key
  ↓
tenantId
permissions
```

---

# 152. Admin jobs

Jobs globales deberán declararse expresamente.

Ejemplo:

```text
ExpireOffersJob
```

puede recorrer múltiples tenants, pero lo hará desde un servicio de sistema autorizado.

---

# 153. Scheduled jobs

Para tareas globales:

```text
Scheduler
   ↓
batch tenants
   ↓
tenant-scoped processing
```

Esto facilita aislamiento y trazabilidad.

---

# 154. Batching

No se procesarán millones de filas en una única transacción.

Los trabajos globales deberán usar lotes.

---

# 155. Observabilidad por tenant

No necesariamente se expondrán todas las métricas al negocio.

Pero operaciones internas podrán identificar:

```text
tenant generating high error rate
tenant generating excessive uploads
tenant with slow queries
```

---

# 156. SLA futuro

El modelo permite posteriormente diferenciar planes empresariales sin alterar multi-tenancy.

---

# 157. Restricciones de diseño

No se permitirá:

- tenantId confiado desde frontend;
- consultas tenant-aware sin scope;
- caches sin namespace;
- uploads sin ownership;
- jobs sin contexto;
- admin global implícito;
- forks de aplicación por negocio.

---

# 158. Checklist para nuevos módulos

Todo módulo nuevo deberá responder:

```text
¿Es global o tenant-aware?

Si es tenant-aware:
- ¿cómo obtiene TenantContext?
- ¿todas las consultas filtran tenant?
- ¿RLS aplica?
- ¿cache incluye tenant?
- ¿jobs incluyen tenant?
- ¿media incluye tenant?
- ¿tests cruzados existen?
- ¿logs incluyen tenant?
```

---

# 159. Checklist de Code Review

Antes de aprobar código tenant-aware:

- [ ] No acepta `tenantId` confiado desde request.
- [ ] Valida Business contra Tenant.
- [ ] Filtra queries por Tenant.
- [ ] No usa `findUnique(id)` como autorización.
- [ ] No genera cache keys ambiguas.
- [ ] No accede a media de otro Tenant.
- [ ] Tiene pruebas de aislamiento.
- [ ] Registra contexto en logs.
- [ ] Respeta permisos.
- [ ] No expone datos internos en DTO público.

---

# 160. Criterio de fallo

Cualquier vulnerabilidad que permita acceso entre tenants se considerará:

**CRITICAL**

independientemente del tipo de información expuesta.

---

# 161. Decisiones cerradas

### MT-001

Modelo:

**Shared Database + Shared Schema + tenant_id**

### MT-002

Tenant se resolverá por contexto confiable, nunca por dato arbitrario del cliente.

### MT-003

Showrooms se resolverán inicialmente mediante subdominios.

### MT-004

Dashboard obtendrá TenantContext desde sesión + Membership.

### MT-005

Repositories tenant-aware deberán exigir contexto.

### MT-006

Se utilizará defensa en profundidad.

### MT-007

Se recomienda PostgreSQL Row Level Security en tablas críticas.

### MT-008

Redis utilizará keys namespaced por tenant/business.

### MT-009

Media y jobs serán tenant-aware.

### MT-010

El portal general será una proyección pública multi-tenant controlada.

### MT-011

Las pruebas de aislamiento multi-tenant serán obligatorias en CI.

### MT-012

Las vulnerabilidades cross-tenant tendrán severidad crítica.

### MT-013

La aplicación será única para todos los tenants; la diferenciación se realizará mediante configuración y datos.

---

# 162. Flujo administrativo completo

```text
User
  │
  ▼
app.dtodo537.net
  │
  ▼
Authentication
  │
  ▼
Session
  │
  ▼
Membership
  │
  ▼
TenantContext
  │
  ▼
Permission Guard
  │
  ▼
Application Service
  │
  ▼
Tenant-aware Repository
  │
  ▼
PostgreSQL + RLS
```

---

# 163. Flujo público completo

```text
Visitor
  │
  ▼
muebles.dtodo537.net
  │
  ▼
DNS Wildcard
  │
  ▼
HAProxy / Nginx
  │
  ▼
Next.js
  │
  ▼
Hostname Resolver
  │
  ▼
Redis Tenant Lookup
  │
  ├── hit → TenantContext
  │
  └── miss → PostgreSQL → Redis
                     │
                     ▼
               Public API
                     │
                     ▼
             Public Projection
                     │
                     ▼
               Render Showroom
```

---

# 164. Flujo de seguridad ante ataque

Supuesto:

Un usuario de Tenant A obtiene accidentalmente el UUID de un producto de Tenant B.

Intenta:

```text
PATCH /api/v1/products/<product-b-id>
```

Resultado esperado:

```text
Auth
 ↓
TenantContext = Tenant A
 ↓
Repository query:
id = Product B
AND tenant_id = Tenant A
 ↓
0 results
 ↓
404
```

Además, si por error una consulta olvidase tenant:

```text
PostgreSQL RLS
 ↓
Product B invisible
```

Este es el comportamiento esperado de la defensa en profundidad.

---

# 165. Principio rector

La arquitectura multi-tenant seguirá una regla fundamental:

> **El tenant no es un parámetro de una operación; es el contexto de seguridad dentro del cual la operación existe.**

Esto significa que ningún módulo deberá preguntarse únicamente:

```text
¿Qué tenantId me enviaron?
```

sino:

```text
¿Dentro de qué TenantContext autenticado y validado se está ejecutando esta operación?
```

---

# 166. Resultado esperado

Con esta arquitectura, `dtodo537.net` podrá alojar desde decenas hasta miles de negocios sobre una misma plataforma manteniendo:

- código único;
- infraestructura compartida;
- datos correctamente aislados;
- showrooms independientes;
- operación centralizada;
- capacidad de crecimiento.

El objetivo no será simplemente “poner un `tenant_id` en las tablas”.

El objetivo será construir una plataforma donde el aislamiento multi-tenant esté presente en:

**DNS, contexto, autenticación, autorización, servicios, repositorios, PostgreSQL, cache, media, jobs, búsqueda, logs, auditoría y testing.**