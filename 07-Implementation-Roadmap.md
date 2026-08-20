# 07 — Implementation Roadmap

**Proyecto:** Plataforma Digital de Showrooms Comerciales Multi-Negocio  
**Dominio previsto:** `dtodo537.net`  
**Nombre comercial:** Por definir  
**Versión:** 0.1  
**Estado:** Roadmap de implementación para ejecución con Codex

---

# 1. Propósito

Este documento define el orden de implementación del MVP de `dtodo537.net`.

Su función es traducir los documentos conceptuales y arquitectónicos previamente aprobados en una secuencia ejecutable de trabajo.

Este roadmap deberá utilizarse como referencia para Codex y para cualquier desarrollador que participe en el proyecto.

Los documentos de referencia son:

- `00-Conceptualizacion-del-Proyecto.md`
- `01-TODO-MVP.md`
- `02-Software-Architecture.md`
- `03-Domain-Model.md`
- `04-Multi-Tenant-Architecture.md`
- `05-Security-Architecture.md`
- `06-MVP-Specification.md`

Ante cualquier contradicción, deberá detenerse la implementación de ese punto y revisarse la decisión arquitectónica correspondiente antes de introducir cambios estructurales.

---

# 2. Principio de implementación

El proyecto se desarrollará mediante **incrementos verticales funcionales**.

No se construirán primero todas las tablas, después todas las APIs y finalmente todas las interfaces.

Cada incremento deberá producir una capacidad utilizable de extremo a extremo.

Ejemplo:

```text
Base de datos
   ↓
Domain/Application
   ↓
API
   ↓
Frontend
   ↓
Tests
   ↓
Documentación
```

---

# 3. Regla fundamental

Codex deberá:

1. leer los documentos del proyecto;
2. identificar el hito activo;
3. implementar solamente el alcance de ese hito;
4. ejecutar pruebas;
5. documentar decisiones;
6. informar cambios realizados;
7. no comenzar el siguiente hito hasta que el actual esté funcional.

---

# 4. Restricciones arquitectónicas

Durante el MVP no se podrá cambiar unilateralmente:

- Next.js;
- NestJS;
- TypeScript;
- PostgreSQL;
- Prisma;
- Redis;
- BullMQ;
- Object Storage S3-compatible;
- arquitectura Modular Monolith;
- monorepo;
- multi-tenancy Shared Database + `tenant_id`;
- REST + OpenAPI;
- despliegue Ubuntu + systemd;
- enfoque sin Docker/Kubernetes.

Cualquier propuesta de modificación deberá documentarse primero como decisión arquitectónica.

---

# 5. Estructura objetivo del repositorio

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
│   ├── schema.prisma
│   ├── migrations/
│   └── seed/
│
├── docs/
│
├── scripts/
│
├── infrastructure/
│
├── tests/
│   ├── integration/
│   ├── e2e/
│   └── security/
│
├── pnpm-workspace.yaml
├── package.json
├── pnpm-lock.yaml
└── README.md
```

---

# 6. Estrategia de ramas

Se recomienda:

```text
main
develop
feature/*
fix/*
```

Si se prefiere una estrategia más sencilla:

```text
main
feature/*
```

también será válida.

En cualquier caso:

- no desarrollar directamente sobre `main`;
- utilizar Pull Requests;
- ejecutar CI antes de merge.

---

# 7. Definition of Done global

Una tarea no estará terminada únicamente porque compile.

Deberá cumplir cuando corresponda:

- implementación backend;
- implementación frontend;
- validación;
- autorización;
- multi-tenancy;
- manejo de errores;
- tests;
- responsive;
- accesibilidad básica;
- logging;
- documentación.

---

# 8. Hitos

El MVP se divide en:

```text
M0  Foundation
M1  Identity & Sessions
M2  Tenant & Business
M3  Showroom & Themes
M4  Catalog & Media
M5  Publication & WhatsApp
M6  Portal & Discovery
M7  Offers, QR & Analytics
M8  Platform Administration
M9  Security Hardening
M10 Deployment & Operations
M11 Beta
M12 Release Candidate
```

---

# M0 — FOUNDATION

# 9. Objetivo

Crear una base técnica estable sobre la cual desarrollar el resto de la plataforma.

---

# 10. M0.1 — Inicializar monorepo

Implementar:

```text
pnpm workspace
apps/web
apps/api
apps/worker
packages/*
```

---

# 11. M0.2 — Next.js

Crear `apps/web`.

Configurar:

- Next.js;
- App Router;
- TypeScript;
- lint;
- configuración por entorno;
- estructura de layouts.

---

# 12. M0.3 — NestJS

Crear `apps/api`.

Configurar:

- NestJS;
- TypeScript;
- configuración;
- validation pipe;
- error handling;
- logging;
- API `/api/v1`.

---

# 13. M0.4 — Worker

Crear:

```text
apps/worker
```

Inicialmente deberá poder:

- conectar Redis;
- registrar una cola;
- procesar un job de prueba;
- emitir logs.

---

# 14. M0.5 — PostgreSQL y Prisma

Configurar:

- PostgreSQL;
- Prisma;
- conexión;
- migrations;
- seed inicial.

---

# 15. M0.6 — Redis

Configurar:

- conexión API;
- conexión worker;
- health check.

---

# 16. M0.7 — Configuración

Crear módulo de configuración validada.

Variables iniciales:

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
```

La aplicación deberá fallar al arrancar si falta una variable obligatoria.

---

# 17. M0.8 — Logging

Implementar logs estructurados.

Campos mínimos:

```text
timestamp
level
service
requestId
message
```

---

# 18. M0.9 — Request ID

Cada request API deberá disponer de:

```text
requestId
```

y devolverlo cuando sea útil en respuesta de error.

---

# 19. M0.10 — Health

Endpoints:

```text
GET /api/v1/health
GET /api/v1/health/ready
```

Comprobar:

- API;
- PostgreSQL;
- Redis.

---

# 20. M0.11 — CI inicial

Pipeline mínimo:

```text
install
lint
typecheck
test
build
```

---

# 21. Criterios de aceptación M0

- [ ] Monorepo funcional.
- [ ] `pnpm install` funciona.
- [ ] Next.js arranca.
- [ ] NestJS arranca.
- [ ] Worker arranca.
- [ ] PostgreSQL accesible.
- [ ] Redis accesible.
- [ ] Prisma migration funcional.
- [ ] Health check OK.
- [ ] CI pasa.
- [ ] README permite levantar entorno.

---

# M1 — IDENTITY & SESSIONS

# 22. Objetivo

Implementar una identidad segura y sesiones server-side.

---

# 23. M1.1 — Modelo User

Implementar:

```text
User
EmailVerificationToken
PasswordResetToken
Session
```

---

# 24. M1.2 — Password hashing

Implementar:

**Argon2id**

No permitir ninguna ruta que almacene contraseña sin hash.

---

# 25. M1.3 — Registro

Endpoint:

```text
POST /api/v1/auth/register
```

UI:

```text
/register
```

---

# 26. M1.4 — Verificación de correo

Implementar:

```text
request verification
verify token
resend verification
```

---

# 27. M1.5 — Login

```text
POST /api/v1/auth/login
```

Crear sesión server-side.

Cookie:

```text
Secure
HttpOnly
SameSite
```

---

# 28. M1.6 — Logout

Debe revocar sesión server-side.

---

# 29. M1.7 — Password recovery

Implementar flujo completo.

---

# 30. M1.8 — Current user

```text
GET /api/v1/auth/me
```

---

# 31. M1.9 — Rate limiting

Aplicar al menos a:

- login;
- register;
- recovery;
- resend verification.

---

# 32. M1.10 — Tests

Cubrir:

- registro;
- password hashing;
- login;
- sesión;
- logout;
- token expirado;
- recovery;
- user enumeration.

---

# 33. Criterios de aceptación M1

- [ ] Usuario puede registrarse.
- [ ] Password nunca se almacena en texto plano.
- [ ] Puede verificar email.
- [ ] Puede iniciar sesión.
- [ ] Cookie es HttpOnly.
- [ ] Logout revoca sesión.
- [ ] Recovery funciona.
- [ ] Rate limits básicos funcionan.
- [ ] Tests pasan.

---

# M2 — TENANT & BUSINESS

# 34. Objetivo

Crear el núcleo multi-tenant funcional.

---

# 35. M2.1 — Modelos

Implementar:

```text
Tenant
Membership
Business
Showroom
BusinessType
SubscriptionPlan
Subscription
```

---

# 36. M2.2 — Provisioning

Crear servicio:

```text
TenantProvisioningService
```

Flujo:

```text
Tenant
→ Membership OWNER
→ Business
→ Showroom
→ Subscription
```

---

# 37. M2.3 — Onboarding inicial

UI:

```text
/onboarding
```

Paso inicial:

- nombre negocio;
- tipo;
- subdominio.

---

# 38. M2.4 — Subdomain validator

Implementar:

- normalización;
- validación;
- reservados;
- disponibilidad;
- unique constraint.

---

# 39. M2.5 — Tenant Resolver

Implementar resolución:

```text
hostname
→ showroom
→ tenant
```

---

# 40. M2.6 — TenantContext

Implementar contexto seguro para:

- público;
- dashboard.

---

# 41. M2.7 — Membership

El usuario autenticado deberá operar dentro de TenantContext validado.

---

# 42. M2.8 — Repositories tenant-aware

Crear primera abstracción obligatoria.

Ningún módulo nuevo tenant-aware deberá acceder a Prisma sin aplicar scope correctamente.

---

# 43. M2.9 — Redis tenant cache

Implementar:

```text
subdomain → tenant/business/showroom
```

con invalidación.

---

# 44. M2.10 — RLS foundation

Preparar y aplicar RLS sobre primeras tablas críticas según arquitectura.

---

# 45. M2.11 — Cross-tenant test suite

Crear suite permanente:

```text
tests/security/tenant-isolation
```

---

# 46. Criterios de aceptación M2

- [ ] Usuario crea Tenant.
- [ ] Se crea Membership OWNER.
- [ ] Se crea Business.
- [ ] Se crea Showroom.
- [ ] Subdominio es único.
- [ ] Palabras reservadas son rechazadas.
- [ ] TenantContext funciona.
- [ ] Redis resolver funciona.
- [ ] Tenant A no puede acceder a Tenant B.
- [ ] Tests cross-tenant pasan.

---

# M3 — SHOWROOM & THEMES

# 47. Objetivo

Permitir configurar la identidad pública del negocio.

---

# 48. M3.1 — Business profile

Implementar:

- nombre;
- descripción;
- dirección;
- teléfono;
- correo;
- timezone.

---

# 49. M3.2 — Contact channels

Implementar:

```text
ContactChannel
SocialProfile
WhatsAppConfiguration
```

---

# 50. M3.3 — Theme

Implementar:

```text
Theme
ThemeConfiguration
```

---

# 51. M3.4 — Themes iniciales

Crear:

```text
minimal
boutique
commercial
```

---

# 52. M3.5 — Design tokens

Configurable:

- primary;
- secondary;
- logo;
- portada;
- tipografía si se incluye.

---

# 53. M3.6 — Theme selector

UI muy simple:

```text
Seleccionar plantilla
→ preview
→ aplicar
```

---

# 54. M3.7 — Showroom renderer

El hostname:

```text
negocio.dtodo537.net
```

deberá renderizar la plantilla correspondiente.

---

# 55. M3.8 — Estado de publicación

Implementar:

```text
DRAFT
PUBLISHED
SUSPENDED
```

para showroom.

---

# 56. M3.9 — Preview

Crear preview autenticada y no indexable.

---

# 57. Criterios de aceptación M3

- [ ] Negocio puede editar perfil.
- [ ] Configura WhatsApp.
- [ ] Configura redes sociales.
- [ ] Escoge una de tres plantillas.
- [ ] Cambia colores.
- [ ] Sube logo/portada.
- [ ] Preview funciona.
- [ ] Showroom público funciona por subdominio.
- [ ] Theme de un tenant no afecta otro.

---

# M4 — CATALOG & MEDIA

# 58. Objetivo

Permitir crear y publicar catálogo visual.

---

# 59. M4.1 — Category

CRUD:

```text
create
list
update
reorder
archive
```

---

# 60. M4.2 — Product

Implementar:

- name;
- slug;
- shortDescription;
- description;
- price;
- currency;
- priceMode;
- availabilityStatus;
- publicationStatus;
- featured.

---

# 61. M4.3 — Product attributes

Pares simples:

```text
name/value
```

---

# 62. M4.4 — MediaAsset

Implementar modelo genérico.

---

# 63. M4.5 — S3 adapter

Crear:

```text
StorageAdapter
```

No acoplar dominio a proveedor concreto.

---

# 64. M4.6 — Upload flow

Implementar:

```text
request upload
validate quota
upload
confirm
queue processing
```

---

# 65. M4.7 — Image worker

Procesar:

- validación;
- resize;
- WebP/AVIF cuando corresponda;
- thumbnails;
- EXIF removal.

---

# 66. M4.8 — ProductImage

Permitir:

- varias imágenes;
- principal;
- reordenar;
- eliminar.

---

# 67. M4.9 — Product administration UI

Prioridad absoluta a móvil.

---

# 68. M4.10 — Quick actions

Implementar acciones rápidas:

```text
cambiar precio
cambiar disponibilidad
publicar/despublicar
```

---

# 69. M4.11 — Product public page

Ruta:

```text
/productos/[slug]
```

dentro de showroom.

---

# 70. Criterios de aceptación M4

- [ ] Crear categoría.
- [ ] Crear producto.
- [ ] Subir imagen desde móvil.
- [ ] Procesamiento de imagen funciona.
- [ ] Publicar producto.
- [ ] Modificar precio fácilmente.
- [ ] Modificar disponibilidad.
- [ ] Ver ficha pública.
- [ ] Ninguna media cruza tenants.
- [ ] Tests de uploads pasan.

---

# M5 — PUBLICATION & WHATSAPP

# 71. Objetivo

Completar el ciclo comercial principal:

```text
Publicar
→ descubrir
→ contactar
```

---

# 72. M5.1 — Publication rules

Implementar reglas mínimas para publicar Business, Showroom y Product.

---

# 73. M5.2 — WhatsApp link generator

Crear:

```text
WhatsAppLinkService
```

con mensaje contextual.

---

# 74. M5.3 — Tracked redirect

Endpoint:

```text
/r/whatsapp/:code
```

o equivalente.

Debe:

1. validar destino;
2. registrar evento;
3. redirigir.

---

# 75. M5.4 — Product CTA

Cada ficha pública deberá mostrar:

**Consultar por WhatsApp**

como CTA principal.

---

# 76. M5.5 — Share

Implementar:

- copiar URL;
- compartir por WhatsApp.

---

# 77. M5.6 — Public eligibility

Aplicar:

```text
Tenant ACTIVE
Business PUBLISHED
Showroom PUBLISHED
Product PUBLISHED
```

---

# 78. Criterios de aceptación M5

- [ ] Producto publicado es visible.
- [ ] DRAFT no es visible.
- [ ] CTA abre WhatsApp correctamente.
- [ ] Mensaje contiene producto.
- [ ] Evento queda registrado.
- [ ] No existe open redirect.
- [ ] Tenant suspendido desaparece del público.

---

# M6 — PORTAL & DISCOVERY

# 79. Objetivo

Construir `dtodo537.net` como portal de descubrimiento.

---

# 80. M6.1 — PlatformCategory

Crear categorías globales.

Seed inicial:

```text
Tecnología
Moda
Hogar
Gastronomía
Belleza
Servicios
Construcción
Automotriz
Artesanía
Otros
```

---

# 81. M6.2 — Product classification

Permitir relacionar productos con categoría global.

---

# 82. M6.3 — Portal home

Implementar:

- buscador;
- categorías;
- productos recientes;
- ofertas;
- negocios destacados.

---

# 83. M6.4 — Global search

Inicialmente PostgreSQL:

- Full Text Search;
- trigram;
- índices.

---

# 84. M6.5 — Search endpoint

Ejemplo:

```text
GET /api/v1/public/search?q=
```

---

# 85. M6.6 — Filters

Implementar:

- categoría;
- negocio;
- disponibilidad;
- oferta.

---

# 86. M6.7 — Sorting

Implementar:

- relevancia;
- reciente;
- precio ascendente;
- precio descendente.

---

# 87. M6.8 — Search UI

Debe funcionar especialmente bien desde móvil.

---

# 88. M6.9 — Canonical

Los resultados globales enlazarán a:

```text
negocio.dtodo537.net/productos/slug
```

---

# 89. M6.10 — Search analytics

Registrar:

```text
SEARCH
SEARCH_RESULT_CLICK
```

---

# 90. Criterios de aceptación M6

- [ ] Portal principal operativo.
- [ ] Búsqueda devuelve productos de varios tenants.
- [ ] Solo aparecen productos públicos.
- [ ] Filtros funcionan.
- [ ] Resultados enlazan al showroom.
- [ ] Búsqueda dentro de showroom queda limitada al Business.
- [ ] Rendimiento aceptable.

---

# M7 — OFFERS, QR & ANALYTICS

# 91. Objetivo

Añadir funciones de valor comercial sin convertir la plataforma en e-commerce.

---

# 92. M7.1 — Offer

Implementar:

```text
offerPrice
startAt
endAt
status
```

---

# 93. M7.2 — Offer worker

Activar/expirar ofertas automáticamente.

---

# 94. M7.3 — Ofertas portal

Mostrar ofertas activas en:

```text
dtodo537.net/ofertas
```

y home.

---

# 95. M7.4 — QR

Generar:

- showroom QR;
- product QR.

---

# 96. M7.5 — QR tracking

Registrar `QR_VISIT` si se implementa redirect propio.

---

# 97. M7.6 — AnalyticsEvent

Consolidar:

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

# 98. M7.7 — Analytics worker

No bloquear requests públicos.

---

# 99. M7.8 — Dashboard analytics

Mostrar:

- showroom views;
- product views;
- WhatsApp clicks;
- producto más visto;
- producto con más WhatsApp clicks.

---

# 100. M7.9 — Periodos

```text
7 días
30 días
```

---

# 101. Criterios de aceptación M7

- [ ] Oferta se activa/expira correctamente.
- [ ] QR se genera.
- [ ] Eventos se registran.
- [ ] Dashboard muestra datos del tenant correcto.
- [ ] Métricas de un tenant no se mezclan con otro.

---

# M8 — PLATFORM ADMINISTRATION

# 102. Objetivo

Proporcionar control operacional de la plataforma.

---

# 103. M8.1 — Backoffice

Hostname:

```text
admin.dtodo537.net
```

---

# 104. M8.2 — Platform roles

Implementar:

```text
PLATFORM_ADMIN
PLATFORM_MODERATOR
PLATFORM_SUPPORT
```

según alcance requerido.

---

# 105. M8.3 — Tenant management

Permitir:

- listar;
- buscar;
- ver;
- suspender;
- bloquear;
- reactivar.

---

# 106. M8.4 — Business management

Permitir:

- visualizar;
- suspender;
- despublicar.

---

# 107. M8.5 — Global categories

Administrar `PlatformCategory`.

---

# 108. M8.6 — Themes

Activar/desactivar themes.

---

# 109. M8.7 — Featured content

Seleccionar manualmente:

- negocios destacados;
- productos destacados.

---

# 110. M8.8 — Audit

Todas las acciones globales importantes deberán generar AuditLog.

---

# 111. Criterios de aceptación M8

- [ ] Backoffice separado.
- [ ] Usuario normal no accede.
- [ ] Admin puede suspender tenant.
- [ ] Suspensión se refleja inmediatamente.
- [ ] Admin gestiona categorías globales.
- [ ] Acciones quedan auditadas.

---

# M9 — SECURITY HARDENING

# 112. Objetivo

Realizar revisión de seguridad previa a despliegue beta.

---

# 113. M9.1 — Cross-tenant suite completa

Ejecutar pruebas para:

- read;
- create;
- update;
- delete;
- media;
- analytics;
- membership.

---

# 114. M9.2 — RLS

Completar políticas RLS previstas.

---

# 115. M9.3 — CSRF

Validar todos los endpoints mutables autenticados.

---

# 116. M9.4 — CSP

Implementar política compatible con Next.js.

---

# 117. M9.5 — Security headers

Validar:

```text
HSTS
CSP
X-Content-Type-Options
Referrer-Policy
Permissions-Policy
```

---

# 118. M9.6 — Upload attack tests

Probar:

- MIME falso;
- archivo ejecutable renombrado;
- SVG;
- imagen excesiva;
- decompression bomb.

---

# 119. M9.7 — Authentication tests

Probar:

- brute force;
- session fixation;
- logout invalidation;
- reset token reuse.

---

# 120. M9.8 — Dependency scanning

Integrar y revisar.

---

# 121. M9.9 — Secret scanning

Integrar en CI.

---

# 122. M9.10 — Security checklist

Revisar contra `05-Security-Architecture.md`.

---

# 123. Criterios de aceptación M9

- [ ] 100 % tenant isolation tests.
- [ ] Sin vulnerabilidad CRITICAL conocida.
- [ ] Sin HIGH explotable sin mitigación.
- [ ] Security headers correctos.
- [ ] Upload protections funcionan.
- [ ] Sesiones correctamente revocables.
- [ ] CI security checks activos.

---

# M10 — DEPLOYMENT & OPERATIONS

# 124. Objetivo

Preparar entorno STAGING y posteriormente PROD sobre Ubuntu Server.

---

# 125. M10.1 — systemd

Crear servicios:

```text
dtodo-web.service
dtodo-api.service
dtodo-worker.service
```

---

# 126. M10.2 — Usuarios Linux

Separados y sin root:

```text
dtodo-web
dtodo-api
dtodo-worker
```

---

# 127. M10.3 — Reverse proxy

Configurar HAProxy/Nginx para:

```text
dtodo537.net
www.dtodo537.net
app.dtodo537.net
admin.dtodo537.net
api.dtodo537.net
*.dtodo537.net
```

---

# 128. M10.4 — Wildcard DNS

Configurar:

```text
*.dtodo537.net
```

---

# 129. M10.5 — TLS

Certificados para:

```text
dtodo537.net
*.dtodo537.net
```

---

# 130. M10.6 — PostgreSQL

Configurar:

- usuario app;
- usuario migrations;
- backup;
- acceso interno.

---

# 131. M10.7 — Redis

Configurar:

- ACL/password;
- acceso interno;
- persistencia según necesidad.

---

# 132. M10.8 — Object Storage

Configurar bucket y políticas.

---

# 133. M10.9 — Monitoring

Implementar:

- uptime;
- CPU;
- RAM;
- disk;
- API latency;
- error rate;
- PostgreSQL;
- Redis;
- jobs.

---

# 134. M10.10 — Logs

Centralizar o al menos garantizar conservación y rotación adecuada.

---

# 135. M10.11 — Backup

Configurar:

- PostgreSQL;
- configuración;
- Object Storage según infraestructura.

---

# 136. M10.12 — Restore test

Ejecutar restauración real en entorno controlado.

---

# 137. Criterios de aceptación M10

- [ ] STAGING accesible por HTTPS.
- [ ] Wildcard funciona.
- [ ] Services systemd reinician correctamente.
- [ ] DB/Redis no están expuestos públicamente.
- [ ] Logs disponibles.
- [ ] Monitorización activa.
- [ ] Backup ejecutado.
- [ ] Restore validado.

---

# M11 — BETA

# 138. Objetivo

Validar el producto con negocios reales.

---

# 139. M11.1 — Selección de beta

Objetivo:

```text
10–20 negocios
```

---

# 140. M11.2 — Diversidad

Incluir negocios de:

- tecnología;
- moda;
- gastronomía;
- servicios;
- hogar;
- artesanía.

---

# 141. M11.3 — Onboarding observado

Medir:

```text
tiempo total
pasos con dificultad
soporte requerido
abandono
```

---

# 142. M11.4 — Activación

Negocio activado:

```text
showroom publicado
+
3 productos
+
WhatsApp configurado
```

---

# 143. M11.5 — Métricas

Medir:

- negocios activados;
- productos;
- búsquedas;
- vistas;
- WhatsApp clicks;
- errores;
- tiempos.

---

# 144. M11.6 — Feedback

Registrar:

- problemas;
- solicitudes;
- confusión;
- mejoras.

---

# 145. M11.7 — Scope discipline

Las solicitudes de beta se clasificarán:

```text
BUG
MVP BLOCKER
POST-MVP
```

No todo feedback generará funcionalidad inmediata.

---

# 146. Criterios de aceptación M11

- [ ] Beta ejecutada con negocios reales.
- [ ] Onboarding medido.
- [ ] Problemas críticos corregidos.
- [ ] Aislamiento confirmado.
- [ ] WhatsApp funciona en escenarios reales.
- [ ] Descubrimiento general funciona.
- [ ] Feedback documentado.

---

# M12 — RELEASE CANDIDATE

# 147. Objetivo

Preparar una versión candidata para apertura controlada.

---

# 148. M12.1 — Regression

Ejecutar suite completa.

---

# 149. M12.2 — Performance

Validar:

- portal;
- search;
- showroom;
- product page;
- dashboard.

---

# 150. M12.3 — SEO

Validar:

- metadata;
- canonical;
- sitemap;
- robots;
- Schema.org;
- Open Graph.

---

# 151. M12.4 — Accessibility

Revisar flujos principales.

---

# 152. M12.5 — Security final

Repetir:

- cross-tenant;
- dependency scan;
- secret scan;
- auth tests.

---

# 153. M12.6 — Operations

Verificar:

- backup;
- restore;
- monitoring;
- logs;
- restart;
- rollback.

---

# 154. M12.7 — Documentation

Actualizar:

```text
README
deployment
operations
architecture
known limitations
```

---

# 155. Criterios de aceptación M12

- [ ] No blockers abiertos.
- [ ] No vulnerabilidades críticas conocidas.
- [ ] Core flows E2E pasan.
- [ ] SEO validado.
- [ ] Mobile validado.
- [ ] Backup/restore validado.
- [ ] Release documentado.

---

# 156. Orden obligatorio

Codex deberá respetar:

```text
M0
↓
M1
↓
M2
↓
M3
↓
M4
↓
M5
↓
M6
↓
M7
↓
M8
↓
M9
↓
M10
↓
M11
↓
M12
```

Se podrán adelantar tareas menores sin dependencias, pero no se deberá iniciar un módulo funcional cuyo fundamento no exista.

---

# 157. Dependencias principales

```text
Identity
   ↓
Tenant
   ↓
Business
   ↓
Showroom
   ↓
Catalog
```

y:

```text
Product
  ↓
Publication
  ↓
Discovery
  ↓
Analytics
```

---

# 158. Dependencia de Media

```text
Product
   ↓
MediaAsset
   ↓
Object Storage
   ↓
Worker
```

Por tanto, publicación visual completa no se considera terminada sin procesamiento de media.

---

# 159. Dependencia de seguridad

Security no es únicamente M9.

M9 es hardening.

Los controles correspondientes deberán implementarse en cada hito.

---

# 160. Regla de tests

Cada hito deberá añadir tests correspondientes.

No se dejará toda la automatización para M9.

---

# 161. Regla de migraciones

Todo cambio de esquema deberá incluir:

```text
Prisma schema
migration
tests
```

No realizar cambios manuales únicamente en PostgreSQL.

---

# 162. Regla de seeds

Datos globales versionables deberán cargarse mediante seeds.

Ejemplos:

- roles;
- business types;
- platform categories;
- themes;
- initial plans.

---

# 163. Regla de API

Todo endpoint deberá:

- estar versionado;
- validarse;
- documentarse mediante OpenAPI;
- devolver errores consistentes.

---

# 164. Regla de frontend

Toda pantalla deberá contemplar:

```text
loading
empty
success
error
```

cuando corresponda.

---

# 165. Regla mobile-first

Antes de cerrar una funcionalidad empresarial se deberá probar en viewport móvil.

Especialmente:

- onboarding;
- products;
- images;
- price;
- availability.

---

# 166. Regla de UX

No se expondrán al emprendedor conceptos técnicos como:

```text
Tenant
S3
DNS
RLS
Object Storage
```

La interfaz hablará de:

```text
Mi negocio
Mi showroom
Mis productos
Mis imágenes
Mi dirección web
```

---

# 167. Regla de nombres

El código podrá utilizar lenguaje técnico en inglés.

La interfaz inicial será completamente en español.

---

# 168. Regla de commits

Los commits deberán ser pequeños y coherentes.

Ejemplo:

```text
feat(auth): add server-side sessions
feat(tenant): add tenant provisioning
fix(catalog): enforce tenant scope
test(security): add cross-tenant product access test
```

---

# 169. Regla de documentación

Toda decisión arquitectónica nueva deberá incorporarse a documentación antes de consolidarse.

---

# 170. Architecture Decision Records

Se recomienda crear:

```text
docs/adr/
```

Ejemplo:

```text
ADR-001-nextjs.md
ADR-002-nestjs.md
ADR-003-prisma.md
```

No es obligatorio documentar como ADR cada decisión trivial.

---

# 171. No implementar anticipadamente

Codex no deberá implementar antes de ser necesario:

- microservices;
- Kafka;
- RabbitMQ;
- Elasticsearch;
- OpenSearch;
- Kubernetes;
- Docker;
- GraphQL;
- CQRS generalizado;
- Event Sourcing;
- domain customizado;
- pagos;
- inventario;
- IA.

---

# 172. No sobrearquitecturar

El objetivo es mantener:

```text
simple
testable
secure
modular
```

No construir abstracciones sin una necesidad concreta.

---

# 173. Excepción importante

La simplicidad no justificará omitir:

- TenantContext;
- aislamiento;
- validación;
- seguridad;
- tests;
- observabilidad.

Estas son propiedades fundamentales, no sobrearquitectura.

---

# 174. Formato de entrega de cada hito

Al finalizar un hito Codex deberá producir un resumen:

```text
Hito completado:
M2 — Tenant & Business

Implementado:
- ...
- ...

Migraciones:
- ...

Endpoints:
- ...

Frontend:
- ...

Tests:
- ...

Pendientes:
- ...

Decisiones nuevas:
- ...

Riesgos:
- ...
```

---

# 175. Criterio para detener implementación

Codex deberá detener el avance del hito cuando encuentre una contradicción material con:

- arquitectura;
- dominio;
- multi-tenancy;
- seguridad;
- alcance MVP.

Deberá documentar el conflicto y proponer opciones, no redefinir silenciosamente la arquitectura.

---

# 176. Criterio para bugs críticos

Prioridad inmediata:

```text
P0
```

para:

- fuga cross-tenant;
- pérdida de datos;
- auth bypass;
- RCE;
- corrupción de media;
- publicación privada accidental.

---

# 177. Prioridades

## P0

Bloquea avance/release.

## P1

Debe resolverse dentro del hito.

## P2

Puede programarse en hito cercano.

## P3

Mejora/post-MVP.

---

# 178. Primer incremento demostrable

La primera demo útil debería ocurrir al finalizar M3:

```text
usuario
→ registra negocio
→ obtiene subdominio
→ elige theme
→ publica showroom básico
```

Todavía sin catálogo completo.

---

# 179. Segunda demo

Al finalizar M5:

```text
negocio
→ crea producto
→ sube imagen
→ publica
→ visitante ve producto
→ pulsa WhatsApp
```

Esta será la primera demostración real de la propuesta de valor.

---

# 180. Tercera demo

Al finalizar M6:

```text
visitante
→ entra a dtodo537.net
→ busca producto
→ descubre negocio desconocido
→ entra al showroom
→ contacta
```

Esta demo valida el diferenciador principal de la plataforma.

---

# 181. Punto de no retorno de beta

No iniciar M11 hasta que:

- M0–M10 estén completados;
- no existan P0;
- core flows pasen;
- monitoring esté activo;
- backup/restore esté probado.

---

# 182. Roadmap resumido

```text
M0 Foundation
     ↓
M1 Identity
     ↓
M2 Multi-Tenant Core
     ↓
M3 Showroom
     ↓
M4 Catalog
     ↓
M5 WhatsApp / Conversion
     ↓
M6 Discovery Portal
     ↓
M7 Analytics / Offers / QR
     ↓
M8 Admin
     ↓
M9 Security Hardening
     ↓
M10 Deployment
     ↓
M11 Beta
     ↓
M12 Release Candidate
```

---

# 183. Resultado esperado

Al finalizar este roadmap deberá existir una plataforma capaz de ejecutar de forma segura los dos recorridos fundamentales.

## Emprendedor

```text
Registrar
→ crear negocio
→ personalizar showroom
→ publicar productos
→ actualizar precios
→ recibir consultas
→ consultar interés
```

## Consumidor

```text
Buscar
→ descubrir
→ comparar visualmente
→ abrir producto
→ conocer negocio
→ contactar por WhatsApp
```

---

# 184. Principio final

La ejecución del proyecto deberá seguir una regla:

> **Construir primero el camino completo que genera valor y después ampliar sus capacidades.**

No se medirá el progreso por cantidad de módulos o líneas de código.

Se medirá por la cantidad de flujos de negocio completos que funcionan correctamente, de forma sencilla, segura y mantenible.