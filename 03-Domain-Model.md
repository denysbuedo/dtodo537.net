# 03 — Domain Model

**Proyecto:** Plataforma Digital de Showrooms Comerciales Multi-Negocio  
**Dominio previsto:** `dtodo537.net`  
**Nombre comercial:** Por definir  
**Versión:** 0.1  
**Estado:** Modelo de dominio propuesto para aprobación

---

# 1. Propósito

Este documento define el modelo de dominio de la plataforma `dtodo537.net`.

Su objetivo es establecer:

- conceptos principales;
- entidades;
- relaciones;
- límites de responsabilidad;
- reglas de negocio;
- estados;
- invariantes;
- vocabulario común para diseño e implementación.

Este documento constituye una referencia funcional y técnica para:

- arquitectura;
- base de datos;
- API;
- frontend;
- seguridad;
- multi-tenancy;
- implementación con Codex.

---

# 2. Lenguaje ubicuo

El proyecto utilizará los siguientes términos de manera consistente.

## Tenant

Unidad lógica de aislamiento dentro de la plataforma.

Representa una cuenta empresarial o espacio administrativo independiente.

Un Tenant posee:

- usuarios;
- negocios;
- configuración;
- plan;
- límites;
- datos aislados.

El Tenant no representa necesariamente un establecimiento comercial visible.

---

## Business

Representa un negocio, marca o establecimiento comercial.

Ejemplos:

- Muebles La Habana;
- ClimaCaribe;
- Dulces Ana.

Un Tenant podrá administrar uno o varios Business en futuras versiones.

En el MVP, normalmente:

```text
1 Tenant → 1 Business
```

pero el modelo no deberá imponer esa restricción estructuralmente.

---

## Showroom

Representación pública digital de un Business.

Ejemplo:

```text
muebleslahabana.dtodo537.net
```

El Showroom contiene la experiencia pública:

- portada;
- identidad visual;
- catálogo;
- ofertas;
- información comercial;
- contacto.

Conceptualmente:

```text
Business
   │
   └── Showroom
```

---

## Product

Producto, servicio o elemento comercial publicado por un Business.

No implica necesariamente disponibilidad en inventario ni capacidad de compra electrónica.

---

## Category

Clasificación utilizada para organizar productos.

---

## Offer

Condición promocional temporal o especial aplicada a un Product.

---

## Theme

Plantilla visual proporcionada por la plataforma.

---

## ThemeConfiguration

Personalización concreta de un Theme para un Showroom.

---

## User

Persona autenticada que accede al sistema administrativo.

---

## Membership

Relación entre User y Tenant.

Permite asignar roles y permisos dentro de un Tenant.

---

## Subscription

Relación contractual o lógica entre un Tenant y un SubscriptionPlan.

---

# 3. Contextos principales

El modelo se divide conceptualmente en varios dominios.

```text
Identity
Tenant Management
Business
Catalog
Commerce Presentation
Media
Themes
Communication
Analytics
Subscription
Platform Administration
```

---

# 4. Vista general

```text
User
 │
 └── Membership
         │
         ▼
       Tenant
         │
         ├── Business
         │      │
         │      ├── Showroom
         │      │      └── ThemeConfiguration
         │      │
         │      ├── Category
         │      │
         │      ├── Product
         │      │      ├── ProductImage
         │      │      ├── ProductAttribute
         │      │      ├── ProductVariant
         │      │      ├── ProductTag
         │      │      └── Offer
         │      │
         │      ├── BusinessLocation
         │      ├── ContactChannel
         │      └── SocialProfile
         │
         ├── Subscription
         └── AuditLog
```

---

# 5. Tenant

## Responsabilidad

Representa la frontera lógica principal de aislamiento.

## Atributos conceptuales

```text
Tenant
------
id
name
slug
status
createdAt
updatedAt
deletedAt
```

## Estado

```text
PENDING
ACTIVE
SUSPENDED
BLOCKED
CLOSED
```

## Reglas

- Cada Tenant deberá tener UUID único.
- Un Tenant no podrá acceder a datos privados pertenecientes a otro Tenant.
- Todo dato empresarial dependiente deberá poder asociarse inequívocamente a un Tenant.
- Suspender un Tenant deberá impedir acciones administrativas y, según política, ocultar sus showrooms públicos.

---

# 6. User

Representa una identidad global dentro de la plataforma.

```text
User
----
id
email
passwordHash
firstName
lastName
status
emailVerifiedAt
lastLoginAt
createdAt
updatedAt
```

## Estado

```text
PENDING
ACTIVE
SUSPENDED
BLOCKED
```

Un User podrá, en el futuro, pertenecer a más de un Tenant.

Por tanto:

```text
User != Tenant User
```

La relación se realizará mediante Membership.

---

# 7. Membership

Relaciona un User con un Tenant.

```text
Membership
----------
id
tenantId
userId
role
status
createdAt
updatedAt
```

Ejemplo:

```text
User: juan@example.com
Tenant: Muebles Habana
Role: BUSINESS_OWNER
```

## Roles iniciales

```text
BUSINESS_OWNER
BUSINESS_MANAGER
```

Los administradores globales no deberían depender necesariamente de Membership.

---

# 8. PlatformUser

Los administradores globales pertenecen al contexto de administración de plataforma.

Podrán modelarse mediante:

```text
User
+
PlatformRole
```

Ejemplo:

```text
PLATFORM_ADMIN
PLATFORM_MODERATOR
PLATFORM_SUPPORT
```

Esta separación evita confundir permisos globales con permisos dentro de un Tenant.

---

# 9. Business

Business representa la entidad comercial publicada.

```text
Business
--------
id
tenantId
name
slug
legalName
description
shortDescription
businessType
logoMediaId
coverMediaId
status
publishedAt
createdAt
updatedAt
deletedAt
```

## Estados

```text
DRAFT
PENDING
PUBLISHED
SUSPENDED
ARCHIVED
```

---

# 10. Tenant versus Business

Esta diferencia será obligatoria.

Incorrecto:

```text
Tenant = Tienda
```

Correcto:

```text
Tenant
  │
  └── Business
```

Razón:

Un mismo propietario podría posteriormente gestionar:

```text
Tenant: Grupo Comercial XYZ

Business 1:
Muebles XYZ

Business 2:
Decoración XYZ

Business 3:
Electro XYZ
```

Sin necesidad de cambiar el modelo fundamental.

---

# 11. Showroom

Showroom representa la configuración pública del Business.

```text
Showroom
--------
id
tenantId
businessId
subdomain
customDomain
status
themeId
seoTitle
seoDescription
publishedAt
createdAt
updatedAt
```

## Regla

Un Business tendrá inicialmente un Showroom activo.

```text
Business 1 ─── 1 Showroom
```

El modelo podrá admitir posteriormente versiones, idiomas o múltiples escaparates.

---

# 12. Subdomain

El subdominio forma parte del Showroom.

Ejemplo:

```text
mueblesxyz
```

produce:

```text
mueblesxyz.dtodo537.net
```

## Reglas

- debe ser único globalmente;
- debe normalizarse;
- solo podrá contener caracteres permitidos;
- no podrá utilizar palabras reservadas;
- deberá comprobarse antes de crear el showroom;
- los cambios deberán auditarse.

---

# 13. BusinessType

Clasificación general del negocio.

Ejemplos:

```text
Moda
Gastronomía
Tecnología
Hogar
Belleza
Servicios
Artesanía
Construcción
Automotriz
Otros
```

Podrá ser administrada globalmente.

No deberá confundirse con las categorías internas de productos.

---

# 14. Category

Categoría interna del catálogo.

```text
Category
--------
id
tenantId
businessId
parentId
name
slug
description
imageMediaId
position
status
createdAt
updatedAt
deletedAt
```

## Jerarquía

Podrán existir categorías y subcategorías.

```text
Electrónica
   ├── Televisores
   ├── Audio
   └── Climatización
```

Durante el MVP podrá limitarse la profundidad para simplificar UX.

---

# 15. Product

Entidad central del catálogo.

```text
Product
-------
id
tenantId
businessId
categoryId
name
slug
shortDescription
description
price
previousPrice
currency
priceMode
availabilityStatus
publicationStatus
featured
position
publishedAt
createdAt
updatedAt
deletedAt
```

---

# 16. Product no representa inventario

Product representa una oferta informativa.

No deberá asumir:

- stock numérico;
- almacenes;
- reservas;
- pedidos;
- checkout.

La plataforma podrá informar disponibilidad, pero no administrar inventario en el MVP.

---

# 17. PriceMode

Un producto podrá manejar diferentes modalidades.

```text
FIXED
FROM
CONTACT
FREE
```

Ejemplos:

```text
FIXED
35 000 CUP

FROM
Desde 15 000 CUP

CONTACT
Consultar precio

FREE
Gratis
```

Esto permite manejar también servicios y productos sin precio público.

---

# 18. Money

Los precios nunca deberán almacenarse utilizando tipos de coma flotante.

Modelo conceptual:

```text
amount DECIMAL
currency CHAR(3)
```

Ejemplo:

```text
25000.00 CUP
150.00 USD
```

---

# 19. AvailabilityStatus

```text
AVAILABLE
OUT_OF_STOCK
ON_REQUEST
COMING_SOON
UNAVAILABLE
```

La disponibilidad es informativa.

No constituye control de inventario.

---

# 20. PublicationStatus

```text
DRAFT
PUBLISHED
UNPUBLISHED
ARCHIVED
```

Un Product puede existir administrativamente sin estar visible públicamente.

---

# 21. ProductImage

Representa una imagen asociada al producto.

```text
ProductImage
------------
id
tenantId
productId
mediaId
position
isPrimary
altText
createdAt
```

## Reglas

- un Product podrá tener múltiples imágenes;
- solamente una deberá ser primaria;
- el orden será configurable;
- cada imagen utilizará Media Asset.

---

# 22. MediaAsset

Se propone una entidad genérica para gestionar archivos.

```text
MediaAsset
----------
id
tenantId
type
storageProvider
bucket
objectKey
mimeType
size
width
height
status
createdAt
deletedAt
```

## Tipos

```text
IMAGE
DOCUMENT
```

Inicialmente el proyecto utilizará fundamentalmente IMAGE.

---

# 23. MediaVariant

Las variantes generadas podrán representarse mediante:

```text
MediaVariant
------------
id
mediaAssetId
variant
objectKey
width
height
format
size
```

Ejemplo:

```text
ORIGINAL
THUMBNAIL
SMALL
MEDIUM
LARGE
```

---

# 24. ProductAttribute

Permite describir características del producto.

```text
ProductAttribute
----------------
id
tenantId
productId
name
value
position
```

Ejemplo:

```text
Material    Madera
Color       Roble
Capacidad   6 personas
```

No se utilizará inicialmente para cálculos de inventario.

---

# 25. ProductVariant

Se contempla desde el modelo, aunque puede quedar simplificado en el MVP.

```text
ProductVariant
--------------
id
tenantId
productId
name
sku
price
availabilityStatus
status
```

Ejemplos:

```text
Talla M
Talla L

128 GB
256 GB

Rojo
Azul
```

No implica gestión de stock.

---

# 26. Tag

Etiquetas flexibles.

```text
Tag
---
id
tenantId
businessId
name
slug
```

Relación:

```text
Product N ─── N Tag
```

Ejemplos:

```text
nuevo
verano
hogar
regalo
premium
```

---

# 27. ProductTag

Tabla asociativa:

```text
ProductTag
----------
productId
tagId
```

---

# 28. Offer

Una oferta representa una condición promocional.

```text
Offer
-----
id
tenantId
businessId
productId
name
description
offerPrice
startAt
endAt
status
createdAt
updatedAt
```

## Estados

```text
DRAFT
SCHEDULED
ACTIVE
EXPIRED
CANCELLED
```

---

# 29. Regla temporal de Offer

Una oferta estará activa cuando:

```text
status = ACTIVE
AND
startAt <= now
AND
(endAt IS NULL OR endAt >= now)
```

Los jobs podrán cambiar estados automáticamente.

---

# 30. Offer versus previousPrice

`previousPrice` podrá utilizarse para mostrar referencia comercial sencilla.

`Offer` representará una promoción estructurada.

En el MVP deberá evitarse duplicar lógica innecesaria.

Puede establecerse que:

```text
Product.price
Product.previousPrice
```

resuelva descuentos simples, mientras Offer se reserve para promociones con fechas.

---

# 31. Featured

Determinados elementos podrán marcarse como destacados.

Ejemplo:

```text
Product.featured
Business.featured
```

Sin embargo, los destacados globales de plataforma deberán gestionarse independientemente para evitar que cualquier negocio se autopromocione en el portal general.

---

# 32. PlatformPromotion

Se contempla conceptualmente:

```text
PlatformPromotion
-----------------
id
entityType
entityId
placement
startAt
endAt
priority
status
```

Permitirá en el futuro manejar:

- negocios destacados;
- productos patrocinados;
- campañas.

No es requisito obligatorio del MVP inicial.

---

# 33. BusinessLocation

```text
BusinessLocation
----------------
id
tenantId
businessId
name
addressLine
municipality
province
country
latitude
longitude
isPrimary
status
```

El modelo podrá admitir múltiples ubicaciones.

---

# 34. BusinessHours

```text
BusinessHours
-------------
id
tenantId
businessId
dayOfWeek
openTime
closeTime
closed
```

Podrán existir posteriormente rangos múltiples por día.

---

# 35. ContactChannel

Representa medios de contacto.

```text
ContactChannel
--------------
id
tenantId
businessId
type
value
label
isPrimary
enabled
position
```

Tipos iniciales:

```text
PHONE
EMAIL
WHATSAPP
TELEGRAM
OTHER
```

---

# 36. WhatsApp

Aunque puede representarse como ContactChannel, WhatsApp tendrá configuración funcional adicional.

```text
WhatsAppConfiguration
---------------------
id
tenantId
businessId
phoneNumber
defaultMessage
enabled
trackClicks
```

De esta manera no se mezcla un simple número de contacto con el comportamiento de conversión.

---

# 37. SocialProfile

```text
SocialProfile
-------------
id
tenantId
businessId
network
url
username
enabled
position
```

## Redes iniciales

```text
FACEBOOK
INSTAGRAM
TIKTOK
X
YOUTUBE
LINKEDIN
TELEGRAM
OTHER
```

---

# 38. Theme

Theme es administrado por la plataforma.

```text
Theme
-----
id
code
name
description
previewMediaId
version
status
createdAt
updatedAt
```

Ejemplo:

```text
minimal
boutique
commercial
```

---

# 39. ThemeConfiguration

```text
ThemeConfiguration
------------------
id
tenantId
showroomId
themeId
primaryColor
secondaryColor
accentColor
fontFamily
coverStyle
productCardStyle
configuration
updatedAt
```

`configuration` podrá contener parámetros adicionales controlados mediante JSON estructurado.

No deberá almacenar HTML arbitrario.

---

# 40. ThemeVersion

Las plantillas deberán poder evolucionar.

Conceptualmente:

```text
Theme
  │
  └── version
```

La implementación deberá evitar que una actualización rompa configuraciones existentes.

---

# 41. SEOConfiguration

Podrá modelarse como parte de Showroom o entidad independiente.

```text
SEOConfiguration
----------------
id
tenantId
showroomId
title
description
keywords
socialImageMediaId
indexable
```

Para MVP puede formar parte de Showroom.

---

# 42. Slug

Entidades públicas utilizarán slug.

Ejemplo:

```text
product.name =
Mesa de Comedor Milano

product.slug =
mesa-comedor-milano
```

## Reglas

Los slugs deberán ser únicos dentro de su ámbito.

Ejemplo:

```text
UNIQUE(business_id, slug)
```

No necesitan ser globalmente únicos.

---

# 43. SubscriptionPlan

Plan comercial de plataforma.

```text
SubscriptionPlan
----------------
id
code
name
description
status
price
currency
billingPeriod
createdAt
updatedAt
```

Ejemplos:

```text
FREE
BASIC
PRO
BUSINESS
```

---

# 44. PlanFeature

Las características de los planes no deberán codificarse únicamente mediante condicionales dispersos.

```text
PlanFeature
-----------
id
planId
feature
value
```

Ejemplos:

```text
MAX_PRODUCTS = 20
MAX_IMAGES_PER_PRODUCT = 5
ANALYTICS = BASIC
CUSTOM_DOMAIN = false
MAX_USERS = 1
```

---

# 45. Subscription

```text
Subscription
------------
id
tenantId
planId
status
startAt
endAt
trialEndAt
createdAt
updatedAt
```

Estados:

```text
TRIAL
ACTIVE
PAST_DUE
SUSPENDED
CANCELLED
EXPIRED
```

Aunque los pagos no se implementen inicialmente, la estructura permitirá gestionar planes manualmente.

---

# 46. Feature Entitlements

La aplicación deberá consultar capacidades y no realizar lógica del tipo:

```text
if plan == PRO
```

Preferible:

```text
canUseFeature(tenant, CUSTOM_DOMAIN)
```

Esto facilitará evolución de los planes.

---

# 47. AnalyticsEvent

Representa eventos de comportamiento.

```text
AnalyticsEvent
--------------
id
tenantId
businessId
showroomId
productId
eventType
sessionId
source
metadata
occurredAt
```

`tenantId` podrá ser nullable para determinados eventos generales del portal.

---

# 48. EventType

Inicialmente:

```text
SHOWROOM_VIEW
PRODUCT_VIEW
WHATSAPP_CLICK
PHONE_CLICK
SOCIAL_CLICK
PRODUCT_SHARE
QR_VISIT
SEARCH
SEARCH_RESULT_CLICK
```

---

# 49. Analytics privacy

No deberá almacenarse más información personal de la necesaria para generar métricas.

La analítica estará orientada a:

- actividad;
- conversión;
- descubrimiento.

No a crear perfiles invasivos de usuarios.

---

# 50. SearchEvent

Podrá inicialmente registrarse dentro de AnalyticsEvent.

Ejemplo metadata:

```json
{
  "query": "aire acondicionado",
  "results": 15
}
```

Esto permitirá posteriormente conocer:

- qué buscan los usuarios;
- búsquedas sin resultados;
- categorías demandadas.

---

# 51. Inquiry

Se deja prevista una entidad conceptual:

```text
Inquiry
-------
id
tenantId
businessId
productId
channel
status
createdAt
```

Sin embargo, dado que WhatsApp ocurre fuera de la plataforma, no deberá interpretarse cada clic como una consulta confirmada.

Para el MVP:

```text
WhatsAppClick
```

es una conversión medible.

No necesariamente:

```text
Inquiry
```

---

# 52. QRCode

Los códigos QR podrán generarse de forma determinista a partir de una URL y no necesitan necesariamente una entidad persistente.

Si se requiere trazabilidad:

```text
QRCode
------
id
tenantId
entityType
entityId
code
targetUrl
createdAt
```

Esto permitirá diferenciar accesos provenientes de QR.

---

# 53. ShareLink

Podrán generarse enlaces propios para medición.

Ejemplo:

```text
dtodo537.net/r/abc123
```

Entidad conceptual:

```text
TrackedLink
-----------
id
tenantId
businessId
productId
type
target
code
createdAt
```

Tipos:

```text
WHATSAPP
QR
CAMPAIGN
SHARE
```

---

# 54. AuditLog

Registra acciones administrativas sensibles.

```text
AuditLog
--------
id
tenantId
userId
action
entityType
entityId
metadata
ipAddress
userAgent
createdAt
```

Ejemplos:

```text
PRODUCT_CREATED
PRODUCT_DELETED
BUSINESS_UPDATED
TENANT_SUSPENDED
USER_ROLE_CHANGED
SUBDOMAIN_CHANGED
```

---

# 55. Notification

Se contempla para operaciones administrativas.

```text
Notification
------------
id
tenantId
userId
type
title
message
readAt
createdAt
```

No es esencial para el primer MVP.

---

# 56. Domain Event

Los eventos de dominio no deberán confundirse con AnalyticsEvent.

Ejemplo de evento de dominio:

```text
ProductPublished
```

Ejemplo de evento analítico:

```text
ProductView
```

El primero representa un cambio en el sistema.

El segundo representa comportamiento del visitante.

---

# 57. Domain Events principales

```text
TenantCreated
TenantActivated
BusinessCreated
BusinessPublished
ShowroomPublished
SubdomainChanged
ProductCreated
ProductPublished
ProductUpdated
ProductArchived
OfferActivated
OfferExpired
ThemeChanged
SubscriptionChanged
```

---

# 58. Aggregate Roots

Se identifican inicialmente los siguientes aggregate roots.

```text
Tenant
User
Business
Product
Subscription
Theme
```

---

# 59. Business Aggregate

Conceptualmente:

```text
Business
 ├── Showroom
 ├── Locations
 ├── BusinessHours
 ├── Contacts
 └── SocialProfiles
```

No significa necesariamente que todo deba cargarse o actualizarse en una única transacción.

---

# 60. Product Aggregate

```text
Product
 ├── Images
 ├── Attributes
 ├── Variants
 ├── Tags
 └── Offers
```

Product será responsable de determinadas invariantes propias.

---

# 61. Invariantes de Product

Ejemplos:

- un producto publicado debe tener nombre;
- debe pertenecer a un Business;
- debe pertenecer al mismo Tenant que el Business;
- no puede tener precio negativo;
- solamente una imagen puede ser principal;
- slug debe ser único dentro del Business;
- una oferta no puede pertenecer a otro producto;
- fecha final de oferta no puede ser anterior a fecha inicial.

---

# 62. Invariantes de Showroom

- debe pertenecer a un Business;
- Business y Showroom deben pertenecer al mismo Tenant;
- subdomain debe ser único;
- subdomain debe ser válido;
- subdomain no puede estar reservado;
- Theme debe estar activo;
- un Showroom suspendido no debe publicarse.

---

# 63. Invariantes de Membership

- User debe existir;
- Tenant debe existir;
- combinación User + Tenant debe ser única;
- un Membership suspendido no concede permisos;
- un Tenant debe conservar al menos un Business Owner salvo operación administrativa explícita.

---

# 64. Tenant ownership

Todas las entidades dependientes deberán tener una ruta inequívoca hacia Tenant.

Ejemplo:

```text
Product
   │
   ├── tenant_id
   └── business_id
```

Aunque Business ya tenga tenant_id, Product conservará tenant_id.

Esto permitirá:

- aislamiento explícito;
- consultas eficientes;
- índices;
- seguridad;
- auditoría.

---

# 65. Redundancia deliberada de tenant_id

Esta redundancia es intencional.

Ejemplo:

```text
product.tenant_id
product.business_id
```

Deberá garantizarse:

```text
product.tenant_id == business.tenant_id
```

La aplicación deberá proteger esta invariante.

---

# 66. Entidades globales

No todas las entidades tendrán tenant_id.

Ejemplos:

```text
Theme
BusinessType
SubscriptionPlan
PlatformCategory
```

Estas pertenecen a la plataforma.

---

# 67. Categorías globales versus categorías del negocio

Se distinguen dos conceptos.

## PlatformCategory

Utilizada para descubrimiento general.

Ejemplos:

```text
Tecnología
Moda
Gastronomía
Hogar
Servicios
```

## Category

Organización interna de productos dentro del Business.

Ejemplo:

```text
Business:
TecnoCaribe

Categories:
Laptops
Monitores
Accesorios
```

Esto permitirá mantener una clasificación global coherente sin limitar la organización interna.

---

# 68. Product Classification

Product podrá relacionarse con:

```text
Category
```

del negocio y opcionalmente con:

```text
PlatformCategory
```

para descubrimiento global.

La asignación podrá ser manual inicialmente.

---

# 69. SearchDocument

No será entidad de dominio principal.

Será una representación derivada.

Ejemplo:

```text
SearchDocument
--------------
productId
businessId
tenantId
title
description
tags
category
price
location
```

Podrá implementarse inicialmente mediante PostgreSQL y posteriormente sincronizarse con otro motor.

---

# 70. Soft Delete

Las entidades principales incluirán:

```text
deletedAt
```

cuando sea apropiado.

Ejemplos:

```text
Tenant
Business
Product
Category
User
```

Eliminación lógica permitirá:

- auditoría;
- restauración;
- conservación temporal;
- evitar referencias rotas.

---

# 71. Timestamps

Las entidades persistentes deberán utilizar, cuando corresponda:

```text
createdAt
updatedAt
```

En UTC.

---

# 72. Optimistic Concurrency

No será obligatoria para todo el MVP, pero se deja prevista para entidades con edición concurrente.

Ejemplo:

```text
version
```

o control por:

```text
updatedAt
```

Especialmente útil si varios gestores administran un mismo negocio.

---

# 73. Identificadores públicos

Nunca se expondrá la lógica interna exclusivamente mediante IDs secuenciales.

Las URLs públicas utilizarán:

- subdomain;
- slug;
- códigos opacos cuando corresponda.

Ejemplo:

```text
muebles.dtodo537.net/productos/mesa-milano
```

---

# 74. UUID

Se recomienda UUID v7 cuando el stack y librerías seleccionadas lo soporten adecuadamente.

Ventajas:

- unicidad distribuida;
- orden temporal aproximado;
- mejores características de índice que UUID completamente aleatorios.

Si se desea máxima simplicidad inicial, UUID estándar sigue siendo válido.

La decisión final puede fijarse en arquitectura de datos.

---

# 75. Business ownership de productos

Todo Product deberá pertenecer directamente a un Business.

No se permitirán productos huérfanos.

```text
Business 1 ─── N Product
```

---

# 76. Business ownership de categorías

```text
Business 1 ─── N Category
```

Cada negocio administra sus propias categorías.

---

# 77. Showroom ownership

```text
Business 1 ─── 1 Showroom
```

Para el MVP.

No se impondrá necesariamente como restricción irreversible en el dominio futuro.

---

# 78. Tenant ownership

```text
Tenant 1 ─── N Business
```

Aunque durante el MVP normalmente:

```text
Tenant 1 ─── 1 Business
```

---

# 79. User membership

```text
User N ─── N Tenant
```

mediante:

```text
Membership
```

Esto permitirá escenarios futuros de gestores que trabajen para varios negocios.

---

# 80. Relación simplificada completa

```text
                    User
                      │
                      │
                      ▼
                 Membership
                      │
                      ▼
                    Tenant
                      │
                 1    │    N
                      ▼
                   Business
                      │
         ┌────────────┼─────────────┐
         │            │             │
         ▼            ▼             ▼
      Showroom     Category      Product
         │                          │
         ▼                 ┌────────┼────────┐
 ThemeConfiguration        │        │        │
                           ▼        ▼        ▼
                        Images   Attributes Offers
                           │
                           ▼
                       MediaAsset
```

---

# 81. Portal general

El portal general no será un Tenant.

`dtodo537.net`

representa la plataforma.

Mostrará información pública derivada de múltiples tenants.

Esto es importante para seguridad.

El portal global podrá consultar:

```text
PUBLISHED Businesses
PUBLISHED Products
ACTIVE Offers
```

pero nunca datos administrativos privados de los tenants.

---

# 82. Public Projection

Se recomienda conceptualmente separar:

```text
modelo administrativo
```

de:

```text
proyección pública
```

aunque inicialmente ambos residan en PostgreSQL.

Ejemplo:

Un Product puede contener información administrativa no destinada al portal público.

Las consultas públicas deberán seleccionar exclusivamente campos autorizados.

---

# 83. ModerationStatus

Para determinados elementos públicos podrá existir:

```text
PENDING
APPROVED
REJECTED
BLOCKED
```

No necesariamente será necesario aplicar moderación manual a cada producto durante el MVP.

La arquitectura deberá permitirlo.

---

# 84. Product moderation

Una estrategia inicial razonable:

- negocios aprobados publican directamente;
- plataforma puede despublicar contenido;
- usuarios pueden reportar contenido posteriormente.

Esto reduce carga operacional.

---

# 85. ContentReport

Futuro:

```text
ContentReport
-------------
id
reporterReference
entityType
entityId
reason
description
status
createdAt
```

No es requisito del MVP inicial.

---

# 86. Business verification

Podrá incorporarse:

```text
UNVERIFIED
PENDING
VERIFIED
REJECTED
```

La verificación no deberá confundirse con publicación.

Un negocio puede estar:

```text
PUBLISHED + UNVERIFIED
```

si la política lo permite.

---

# 87. Domain boundaries

Los módulos no deberán manipular directamente tablas pertenecientes a otros dominios sin pasar por contratos definidos.

Ejemplo:

Catalog no debería modificar ThemeConfiguration.

Analytics no debería modificar Product.

Subscription podrá consultar capacidades mediante un servicio:

```text
EntitlementService
```

---

# 88. Servicios de dominio candidatos

```text
TenantProvisioningService
SubdomainService
ProductPublishingService
OfferService
ThemeService
EntitlementService
BusinessPublishingService
TrackedLinkService
```

---

# 89. TenantProvisioning

Crear un nuevo Tenant implicará conceptualmente:

```text
Create Tenant
      │
      ├── Create Membership OWNER
      ├── Create Business
      ├── Create Showroom
      ├── Assign Default Theme
      ├── Assign Subscription
      └── Seed Basic Configuration
```

Esta operación deberá ser transaccional o compensable.

---

# 90. Business publication

Para publicar un negocio podrán existir requisitos mínimos:

- nombre;
- descripción;
- subdominio válido;
- contacto;
- theme;
- estado activo.

No se deberá exigir innecesariamente información que impida un onboarding sencillo.

---

# 91. Product publication

Requisitos mínimos sugeridos:

- nombre;
- descripción corta o completa;
- categoría opcional o requerida según UX;
- al menos una fotografía recomendada;
- disponibilidad;
- precio o modalidad CONTACT.

La política exacta deberá favorecer simplicidad.

---

# 92. Imagen como recomendación fuerte

Aunque técnicamente un producto podría existir sin fotografía en modo DRAFT, para publicación pública se recomienda exigir al menos una imagen.

Motivo:

el producto es un showroom visual.

---

# 93. Search visibility

Un producto será elegible para el portal general si:

```text
Tenant.status = ACTIVE
Business.status = PUBLISHED
Showroom.status = PUBLISHED
Product.publicationStatus = PUBLISHED
```

y no existe restricción de moderación.

---

# 94. Offer visibility

Una Offer será visible si:

```text
Product visible
AND Offer.status = ACTIVE
AND fecha válida
```

---

# 95. Public URLs

## Business

```text
https://muebles.dtodo537.net
```

## Product

```text
https://muebles.dtodo537.net/productos/mesa-milano
```

## Category

```text
https://muebles.dtodo537.net/categorias/comedor
```

## Offer

Puede reutilizar Product.

No es obligatorio crear URL separada para cada Offer.

---

# 96. Canonical URLs

Cada entidad pública deberá tener una URL canónica.

Esto evitará duplicados cuando un producto aparezca también en:

```text
dtodo537.net/buscar
dtodo537.net/ofertas
dtodo537.net/categoria/...
```

La canonical debería apuntar normalmente al showroom:

```text
negocio.dtodo537.net/productos/slug
```

---

# 97. Domain DTO versus Persistence Model

Las entidades de dominio no deberán acoplarse innecesariamente a:

- Prisma;
- HTTP;
- Next.js;
- DTO de API.

Deberá mantenerse una separación conceptual entre:

```text
Domain Model
Persistence Model
API Contract
UI Model
```

Aunque la implementación pragmática pueda compartir tipos cuando sea seguro.

---

# 98. Entidades del MVP obligatorio

Las siguientes entidades sí deberán formar parte del MVP:

```text
User
Tenant
Membership
Business
Showroom
BusinessType
PlatformCategory
Category
Product
ProductImage
MediaAsset
ContactChannel
WhatsAppConfiguration
SocialProfile
Theme
ThemeConfiguration
AnalyticsEvent
AuditLog
SubscriptionPlan
Subscription
```

---

# 99. Entidades que pueden simplificarse inicialmente

Pueden posponerse o simplificarse:

```text
ProductVariant
MediaVariant como entidad independiente
PlanFeature avanzado
PlatformPromotion
ContentReport
Notification
TrackedLink genérico
Business verification
```

El diseño debe permitir añadirlas sin ruptura.

---

# 100. Orden de implementación del dominio

Se recomienda implementar en este orden:

```text
1. User
2. Tenant
3. Membership
4. Business
5. Showroom
6. Theme
7. ThemeConfiguration
8. Category
9. Product
10. MediaAsset
11. ProductImage
12. Contacts
13. WhatsApp
14. SocialProfiles
15. Offers
16. Analytics
17. Subscription
18. Audit
```

---

# 101. Regla crítica de seguridad

Para cualquier entidad tenant-aware:

```text
tenant_id
```

nunca será considerado un dato confiable simplemente porque venga en el request.

El TenantContext autenticado será la autoridad.

Ejemplo incorrecto:

```text
POST /products

{
  "tenantId": "..."
}
```

Preferible:

```text
POST /products

{
  "name": "...",
  ...
}
```

y:

```text
tenantId = TenantContext
```

---

# 102. API pública versus administrativa

Los modelos públicos y administrativos deberán diferenciarse.

Ejemplo:

## PublicProduct

```text
name
description
price
images
availability
business
```

## AdminProduct

incluye además:

```text
status
createdAt
updatedAt
audit metadata
internal configuration
```

Esto reduce exposición accidental.

---

# 103. No exposición de tenant_id

Los consumidores públicos no necesitan conocer `tenant_id`.

Para navegación pública utilizarán:

- subdomain;
- slug;
- IDs públicos opacos cuando sea necesario.

---

# 104. Reglas sobre Tenant deletion

Eliminar un Tenant es una operación crítica.

No deberá ejecutar inmediatamente:

```text
DELETE FROM ...
```

Proceso recomendado:

```text
ACTIVE
  ↓
CLOSED
  ↓
Retention Period
  ↓
Permanent Deletion
```

La eliminación definitiva deberá realizarse mediante job administrativo controlado.

---

# 105. Reglas sobre Product deletion

Eliminar un Product:

```text
PUBLISHED
   ↓
ARCHIVED
```

o soft delete.

Esto permite:

- evitar enlaces rotos inmediatos;
- auditoría;
- restauración.

---

# 106. URLs de productos eliminados

Cuando un producto deje de existir públicamente deberá definirse posteriormente estrategia SEO:

- 404;
- 410;
- redirección a categoría.

La decisión dependerá del motivo de eliminación.

---

# 107. Currency

Se utilizarán códigos ISO 4217 cuando corresponda.

Ejemplos:

```text
CUP
USD
EUR
```

No se codificarán símbolos como identificadores de moneda.

---

# 108. Locale

La primera versión utilizará:

```text
es
```

pero los modelos de negocio no deberán depender estructuralmente del idioma español.

Los contenidos ingresados sí serán inicialmente monolingües.

---

# 109. Timezone

Los timestamps persistentes serán UTC.

Cada Business podrá incorporar posteriormente:

```text
timezone
```

para:

- horarios;
- ofertas;
- estadísticas.

---

# 110. Business timezone

Se recomienda añadir desde el inicio:

```text
Business.timezone
```

aunque inicialmente pueda tomar un valor por defecto.

Esto evita problemas futuros con:

```text
Offer.startAt
Offer.endAt
BusinessHours
```

---

# 111. Domain metadata

Campos flexibles mediante JSON deberán utilizarse con moderación.

Adecuados para:

```text
ThemeConfiguration.configuration
AnalyticsEvent.metadata
AuditLog.metadata
```

No deberán sustituir un modelo relacional bien definido.

---

# 112. Índices esperados

La arquitectura de datos deberá contemplar índices como:

```text
Tenant.slug
Showroom.subdomain
Business.tenantId
Product.tenantId
Product.businessId
Product.slug
Product.publicationStatus
Category.businessId
Offer.productId
AnalyticsEvent.businessId
AnalyticsEvent.occurredAt
```

Los detalles se definirán en el documento de arquitectura de datos.

---

# 113. Unique constraints esperados

Ejemplos:

```text
User.email

Showroom.subdomain

Membership:
userId + tenantId

Category:
businessId + slug

Product:
businessId + slug

Tag:
businessId + slug
```

---

# 114. Relaciones principales

| Entidad | Relación |
|---|---|
| Tenant | 1:N Business |
| Tenant | 1:N Membership |
| User | 1:N Membership |
| Business | 1:1 Showroom MVP |
| Business | 1:N Category |
| Business | 1:N Product |
| Business | 1:N ContactChannel |
| Business | 1:N SocialProfile |
| Product | 1:N ProductImage |
| Product | 1:N ProductAttribute |
| Product | 1:N Offer |
| Product | N:N Tag |
| Showroom | N:1 Theme |
| Showroom | 1:1 ThemeConfiguration |
| Tenant | 1:1 Active Subscription |

---

# 115. Diagrama conceptual final

```text
                            USER
                              │
                              │ N
                              ▼
                         MEMBERSHIP
                              │
                              │ N
                              ▼
                           TENANT
                              │
                     ┌────────┴────────┐
                     │                 │
                     ▼                 ▼
                SUBSCRIPTION       BUSINESS
                                       │
                        ┌──────────────┼──────────────┐
                        │              │              │
                        ▼              ▼              ▼
                    SHOWROOM       CATEGORY        PRODUCT
                        │                             │
                        ▼                    ┌────────┼────────┐
                      THEME                   │        │        │
                        │                     ▼        ▼        ▼
                        ▼                   IMAGE   ATTRIBUTE  OFFER
                THEME CONFIGURATION
                                                      │
                                                      ▼
                                                    TAGS

BUSINESS
   │
   ├── LOCATIONS
   ├── BUSINESS HOURS
   ├── CONTACT CHANNELS
   ├── WHATSAPP CONFIGURATION
   └── SOCIAL PROFILES

TENANT / BUSINESS / PRODUCT
            │
            ▼
      ANALYTICS EVENTS

USER / TENANT
      │
      ▼
   AUDIT LOG
```

---

# 116. Decisiones de dominio cerradas

Se consideran decisiones propuestas para aprobación:

### DM-001

`Tenant` y `Business` serán entidades diferentes.

### DM-002

Un Tenant podrá contener múltiples Business aunque el MVP utilice normalmente uno.

### DM-003

Un Business tendrá inicialmente un Showroom.

### DM-004

User será una identidad global.

### DM-005

User y Tenant se relacionarán mediante Membership.

### DM-006

Product pertenece directamente a Business y Tenant.

### DM-007

El catálogo no gestionará inventario en el MVP.

### DM-008

WhatsApp será modelado como capacidad funcional y no solo como enlace social.

### DM-009

Theme será global y ThemeConfiguration será tenant-aware.

### DM-010

Categorías globales de descubrimiento y categorías internas del Business serán conceptos separados.

### DM-011

AnalyticsEvent y DomainEvent serán conceptos diferentes.

### DM-012

Subscription y Plan existirán desde el modelo aunque la facturación automática pueda posponerse.

### DM-013

La eliminación será lógica para entidades principales.

### DM-014

Las URLs públicas utilizarán subdominio y slug, no identificadores internos.

---

# 117. Principio rector del modelo

El modelo deberá poder responder correctamente a estas preguntas:

```text
¿Quién administra?
→ User + Membership

¿A qué espacio administrativo pertenece?
→ Tenant

¿Qué negocio se está mostrando?
→ Business

¿Qué experiencia pública tiene?
→ Showroom

¿Qué vende o promociona?
→ Product

¿Cómo se organiza?
→ Category

¿Cómo se presenta visualmente?
→ Theme + ThemeConfiguration

¿Cómo contactan al negocio?
→ ContactChannel + WhatsAppConfiguration

¿Cómo sabemos qué genera interés?
→ AnalyticsEvent

¿Qué puede hacer según su plan?
→ Subscription + Entitlements
```

---

# 118. Criterio final

El modelo deberá permanecer suficientemente simple para construir el MVP, pero suficientemente bien separado para evitar que conceptos distintos terminen representados por una misma tabla o entidad.

La decisión más importante de este documento es:

> **Tenant representa la frontera administrativa y de seguridad; Business representa el negocio comercial; Showroom representa su presencia pública.**

Esta separación permitirá evolucionar la plataforma sin rediseñar su fundamento cuando un mismo cliente necesite administrar múltiples negocios, marcas o showrooms.