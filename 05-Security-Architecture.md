# 05 — Security Architecture

**Proyecto:** Plataforma Digital de Showrooms Comerciales Multi-Negocio  
**Dominio previsto:** `dtodo537.net`  
**Nombre comercial:** Por definir  
**Versión:** 0.1  
**Estado:** Arquitectura de seguridad propuesta para aprobación

---

# 1. Propósito

Este documento define la arquitectura de seguridad de `dtodo537.net`.

El objetivo es proteger:

- usuarios;
- tenants;
- negocios;
- productos;
- imágenes;
- datos administrativos;
- sesiones;
- infraestructura;
- APIs;
- operaciones globales;
- integridad del sistema multi-tenant.

La seguridad será considerada una propiedad transversal de toda la plataforma.

No será implementada como un conjunto aislado de controles al final del desarrollo.

---

# 2. Objetivos de seguridad

La arquitectura deberá garantizar:

- confidencialidad;
- integridad;
- disponibilidad;
- autenticidad;
- trazabilidad;
- aislamiento multi-tenant;
- mínimo privilegio;
- defensa en profundidad;
- capacidad de auditoría.

---

# 3. Activos principales

Se consideran activos críticos:

```text
Credenciales de usuarios
Sesiones
Datos privados de tenants
Configuraciones
Productos no publicados
Información administrativa
Audit logs
Secretos de infraestructura
Base de datos
Object Storage
Backups
APIs
Panel administrativo global
```

---

# 4. Clasificación de información

## Pública

Puede exponerse sin autenticación.

Ejemplos:

- nombre comercial;
- logo;
- productos publicados;
- precios públicos;
- fotografías;
- horarios;
- contactos comerciales;
- redes sociales.

## Interna

Visible solo para usuarios autorizados del negocio.

Ejemplos:

- borradores;
- estadísticas;
- configuraciones;
- usuarios del tenant;
- datos de suscripción.

## Sensible

Requiere protección reforzada.

Ejemplos:

- contraseñas;
- tokens;
- sesiones;
- secretos;
- claves API;
- credenciales de servicios.

## Crítica

Compromiso con impacto transversal.

Ejemplos:

- credenciales administrativas globales;
- claves de firma;
- acceso PostgreSQL privilegiado;
- acceso Object Storage;
- backups.

---

# 5. Principios

## 5.1. Zero Trust interno

No se asumirá confianza únicamente por origen de red.

Cada operación deberá validar:

- identidad;
- contexto;
- permisos;
- scope.

---

## 5.2. Least Privilege

Usuarios, servicios y procesos tendrán únicamente los privilegios necesarios.

---

## 5.3. Secure by Default

Los valores por defecto deberán favorecer seguridad.

Ejemplos:

- producto nuevo = DRAFT;
- tenant nuevo = PENDING;
- sesión segura;
- uploads restringidos;
- permisos mínimos.

---

## 5.4. Defense in Depth

La protección no dependerá de un solo control.

Ejemplo multi-tenant:

```text
Session
  ↓
Membership
  ↓
Permission
  ↓
Tenant-aware Repository
  ↓
PostgreSQL RLS
```

---

# 6. Threat Model resumido

Principales amenazas:

```text
Credential theft
Session hijacking
Cross-tenant access
Broken access control
XSS
CSRF
SQL injection
Malicious uploads
SSRF
Brute force
Credential stuffing
Abuse of public APIs
Privilege escalation
Admin account compromise
Cache poisoning
Data leakage
Object storage exposure
Secret leakage
Supply-chain attacks
Dependency vulnerabilities
Denial of Service
```

---

# 7. Riesgo crítico: cross-tenant access

Cualquier acceso no autorizado entre tenants será tratado como severidad:

**CRITICAL**

Ejemplos:

- Tenant A visualiza borradores de Tenant B.
- Tenant A modifica productos de Tenant B.
- Tenant A elimina imágenes de Tenant B.
- estadísticas mezcladas entre tenants.

---

# 8. Identidad

`User` representa la identidad autenticada.

La autenticación se realizará inicialmente mediante:

- correo electrónico;
- contraseña.

Posteriormente podrá añadirse:

- OAuth;
- passkeys;
- MFA.

---

# 9. Contraseñas

Nunca se almacenarán contraseñas en texto plano.

Se recomienda:

**Argon2id**

como algoritmo preferido.

Alternativa aceptable:

**bcrypt** con factor adecuado.

---

# 10. Política de contraseña

La política deberá evitar requisitos artificiales excesivos.

Se priorizará:

- longitud mínima;
- bloqueo de contraseñas comprometidas cuando sea posible;
- rate limiting;
- MFA futuro.

Longitud mínima recomendada:

```text
12 caracteres
```

Para administradores globales:

```text
14 o más
```

---

# 11. Password hashing

Configuración Argon2id deberá calibrarse según infraestructura.

El hash deberá incluir:

- salt aleatorio;
- parámetros de coste.

Nunca se reutilizarán salts manualmente.

---

# 12. Password reset

Flujo:

```text
Usuario solicita recuperación
  ↓
Generar token aleatorio
  ↓
Guardar hash del token
  ↓
Enviar enlace temporal
  ↓
Validar expiración
  ↓
Cambiar contraseña
  ↓
Invalidar token
  ↓
Revocar sesiones existentes
```

---

# 13. Tokens de recuperación

Características:

- aleatorios criptográficamente;
- de un solo uso;
- expiración corta;
- almacenados hasheados;
- auditados.

---

# 14. Verificación de correo

Los tokens de verificación seguirán el mismo principio:

- un solo uso;
- expiración;
- hash en base;
- no reutilización.

---

# 15. Sesiones

Para navegador se utilizarán sesiones mediante cookies seguras.

Preferencia:

```text
HttpOnly
Secure
SameSite=Lax o Strict
```

según flujo.

---

# 16. Evitar localStorage para secretos

No se almacenarán tokens de autenticación de larga duración en:

```text
localStorage
```

por el riesgo asociado a XSS.

---

# 17. Session ID

El identificador deberá ser:

- impredecible;
- aleatorio;
- suficientemente largo;
- rotado cuando corresponda.

---

# 18. Session storage

Podrá utilizarse Redis para sesiones.

Esto permite:

- revocación;
- expiración;
- escalamiento horizontal;
- control centralizado.

---

# 19. Expiración

Se definirán:

```text
idle timeout
absolute timeout
```

Ejemplo conceptual:

```text
Idle: 30 minutos
Absolute: 12 horas
```

Los valores exactos se ajustarán según UX.

---

# 20. Remember me

Si se implementa:

- será opcional;
- usará token independiente;
- se almacenará hasheado;
- será revocable;
- tendrá expiración mayor.

---

# 21. Session rotation

El session ID deberá regenerarse:

- después de login;
- tras cambios de privilegios;
- tras cambio de contraseña;
- después de MFA futuro.

---

# 22. Logout

Debe invalidar la sesión en servidor.

No basta con eliminar cookie local.

---

# 23. Revocación global

El usuario podrá cerrar todas las sesiones.

Los administradores podrán revocar sesiones en incidentes.

---

# 24. MFA

No será obligatorio para todo usuario en el MVP.

Sí deberá estar previsto.

Prioridad futura:

```text
TOTP
Passkeys
```

---

# 25. MFA para administración global

Para `admin.dtodo537.net`, MFA deberá considerarse requisito de producción tan pronto como esté disponible.

---

# 26. RBAC

Roles tenant iniciales:

```text
BUSINESS_OWNER
BUSINESS_MANAGER
```

Roles globales:

```text
PLATFORM_ADMIN
PLATFORM_MODERATOR
PLATFORM_SUPPORT
```

---

# 27. Permissions

Se recomienda autorización basada en permisos.

Ejemplos:

```text
products:create
products:update
products:delete
products:publish

business:update
theme:update

analytics:view

users:view
users:invite
users:manage
```

---

# 28. Role mapping

Los roles deberán mapear a permisos.

No deberá dispersarse lógica como:

```text
if role == OWNER
```

por toda la aplicación.

Preferible:

```text
hasPermission(user, "products:publish")
```

---

# 29. Scope de permisos

Los permisos tendrán contexto:

```text
PLATFORM
TENANT
BUSINESS
```

Nunca se deberá interpretar un permiso fuera de su scope.

---

# 30. Autorización por recurso

Además del permiso general deberá validarse ownership.

Ejemplo:

```text
products:update
+
product.tenantId == TenantContext.tenantId
```

---

# 31. 403 versus 404

Para prevenir enumeración entre tenants:

si el recurso existe pero pertenece a otro tenant, la respuesta preferida será:

```text
404
```

cuando sea razonable.

---

# 32. IDs no constituyen autorización

Conocer un UUID no concede acceso.

Toda operación deberá validar contexto.

---

# 33. CSRF

Si la autenticación usa cookies, las operaciones mutables deberán protegerse contra CSRF.

Medidas:

- SameSite;
- CSRF token;
- validación Origin/Referer;
- métodos correctos.

---

# 34. GET sin efectos secundarios

Nunca se utilizará GET para operaciones como:

- eliminar;
- publicar;
- suspender;
- cambiar contraseña.

---

# 35. CORS

La API utilizará una allowlist explícita.

Ejemplos:

```text
https://dtodo537.net
https://app.dtodo537.net
https://admin.dtodo537.net
https://*.dtodo537.net
```

Wildcard dinámico deberá validarse cuidadosamente.

No usar:

```text
Access-Control-Allow-Origin: *
```

para endpoints autenticados.

---

# 36. Validación de Origin

Para subdominios dinámicos se validará:

- protocolo HTTPS;
- suffix `.dtodo537.net`;
- hostname permitido;
- ausencia de dominios engañosos.

Incorrecto:

```text
dtodo537.net.attacker.com
```

---

# 37. Input validation

Toda entrada externa deberá validarse.

Incluye:

- body;
- params;
- query;
- headers;
- archivos;
- datos importados;
- callbacks futuros.

---

# 38. DTO validation

NestJS utilizará validación centralizada.

Ejemplos:

- tipos;
- longitud;
- formatos;
- enums;
- límites.

---

# 39. Unknown properties

Se recomienda:

```text
whitelist = true
forbidNonWhitelisted = true
```

cuando resulte apropiado.

Esto evita aceptar campos inesperados.

---

# 40. SQL Injection

Prisma utilizará consultas parametrizadas.

No deberán construirse queries mediante concatenación de strings con entradas del usuario.

Raw SQL deberá utilizarse excepcionalmente y con parametrización.

---

# 41. XSS

El contenido introducido por negocios puede convertirse en contenido no confiable.

Ejemplos:

- nombre;
- descripción;
- atributos;
- información comercial.

---

# 42. React escaping

React escapa contenido por defecto.

No se deberá utilizar:

```text
dangerouslySetInnerHTML
```

salvo necesidad justificada y sanitización explícita.

---

# 43. Rich Text

Si se incorpora editor enriquecido:

- utilizar schema restringido;
- sanitizar;
- prohibir scripts;
- prohibir iframes arbitrarios;
- limitar atributos.

---

# 44. No HTML arbitrario en themes

Un tenant no podrá introducir:

- HTML;
- JavaScript;
- CSS arbitrario.

La personalización se realizará mediante Design Tokens.

---

# 45. CSP

Se implementará Content Security Policy.

Objetivo:

- limitar scripts;
- limitar estilos;
- limitar imágenes;
- limitar conexiones;
- prevenir inline script innecesario.

---

# 46. CSP base conceptual

Ejemplo:

```text
default-src 'self'
script-src 'self'
object-src 'none'
base-uri 'self'
frame-ancestors 'none'
```

La política exacta deberá adaptarse a Next.js y servicios utilizados.

---

# 47. Nonces

Si Next.js requiere scripts inline, se preferirá el uso de:

```text
nonce
```

en lugar de habilitar ampliamente:

```text
'unsafe-inline'
```

---

# 48. Security Headers

Como mínimo:

```text
Strict-Transport-Security
X-Content-Type-Options
Referrer-Policy
Permissions-Policy
Content-Security-Policy
```

---

# 49. HSTS

En producción:

```text
Strict-Transport-Security
```

con periodo adecuado.

La inclusión de subdominios deberá evaluarse después de confirmar que todos usan HTTPS.

---

# 50. Clickjacking

Se utilizará:

```text
frame-ancestors
```

en CSP.

`X-Frame-Options` puede mantenerse como compatibilidad adicional.

---

# 51. HTTPS obligatorio

No se permitirá tráfico HTTP de aplicación.

HTTP redirigirá a HTTPS.

---

# 52. TLS

Se deshabilitarán protocolos y suites obsoletas.

Objetivo:

```text
TLS 1.2+
```

preferencia:

```text
TLS 1.3
```

---

# 53. Cookies

Cookies sensibles:

```text
Secure
HttpOnly
```

No deberán compartir dominio más amplio del necesario.

---

# 54. Cookie Domain

Debe evitarse definir indiscriminadamente:

```text
Domain=.dtodo537.net
```

para sesiones si no es necesario.

Esto reduce superficie entre subdominios.

---

# 55. Dashboard y showroom

Idealmente, cookies administrativas estarán limitadas a:

```text
app.dtodo537.net
```

y cookies globales administrativas a:

```text
admin.dtodo537.net
```

---

# 56. Subdomain takeover interno

Como los showrooms usan wildcard DNS, la aplicación debe controlar qué subdominios son válidos.

Un hostname no registrado deberá retornar:

```text
404 / showroom no encontrado
```

No contenido por defecto accidental.

---

# 57. Homograph / nombres engañosos

La política de subdominios deberá limitar caracteres a ASCII seguro.

Esto evita problemas con caracteres visualmente similares.

---

# 58. Upload security

Las imágenes constituyen uno de los principales vectores de entrada.

Cada upload deberá validar:

- tamaño;
- tipo real;
- dimensiones;
- extensión;
- contenido;
- cuota;
- ownership.

---

# 59. MIME sniffing

No se confiará exclusivamente en:

```text
Content-Type
```

enviado por navegador.

El servidor deberá inspeccionar magic bytes.

---

# 60. Formatos permitidos

MVP:

```text
JPEG
PNG
WebP
AVIF
```

Podrá excluirse SVG inicialmente por riesgos de scripting.

---

# 61. SVG

Si se admite en el futuro:

- sanitización estricta;
- eliminación de scripts;
- eliminación de referencias externas;
- procesamiento seguro.

---

# 62. Tamaño de archivo

Debe existir límite global y por plan.

Ejemplo inicial:

```text
10 MB por imagen
```

a ajustar durante pruebas.

---

# 63. Dimensiones máximas

También deberá limitarse resolución.

Esto evita imágenes tipo decompression bomb.

---

# 64. Image processing isolation

El worker de imágenes deberá ejecutarse con permisos limitados.

No deberá tener acceso innecesario a:

- secretos;
- base completa;
- servicios administrativos.

---

# 65. Re-encoding

Cuando sea posible, las imágenes publicadas deberán decodificarse y volver a codificarse.

Esto elimina contenido embebido innecesario y reduce riesgos.

---

# 66. EXIF

Se recomienda eliminar metadatos EXIF innecesarios.

Esto:

- reduce tamaño;
- protege privacidad;
- evita ubicación incrustada accidentalmente.

---

# 67. Object Storage

Buckets no deberán ser públicos por defecto.

Acceso público se habilitará de forma controlada para objetos publicados.

---

# 68. Object key

El cliente nunca decidirá directamente el object key definitivo.

Debe generarlo el backend.

---

# 69. Signed URLs

Uploads directos utilizarán URLs firmadas de corta duración.

---

# 70. Download URLs

Recursos privados usarán URLs firmadas.

Los públicos podrán servirse mediante CDN/endpoint público.

---

# 71. SSRF

Especial atención si en el futuro se permite importar imágenes desde URL.

El MVP deberá preferir upload directo.

Si se incorpora importación remota:

- bloquear localhost;
- bloquear RFC1918;
- bloquear metadata endpoints;
- limitar redirects;
- validar DNS;
- limitar tamaño;
- timeout.

---

# 72. Rate limiting

Se aplicará al menos sobre:

```text
login
register
password reset
email verification resend
search
uploads
analytics events
public APIs
```

---

# 73. Brute-force protection

Login deberá combinar:

- limitación por IP;
- limitación por identidad;
- retraso progresivo;
- alertas cuando corresponda.

---

# 74. Credential stuffing

Medidas:

- rate limiting;
- passwords fuertes;
- detección de patrones;
- MFA futuro;
- monitoreo.

---

# 75. Account lockout

No se recomienda bloqueo indefinido fácil de provocar.

Preferible:

- backoff;
- temporal lock;
- challenge futuro.

---

# 76. Registration abuse

Registro deberá protegerse contra:

- spam;
- bots;
- creación masiva;
- nombres reservados.

CAPTCHA podrá incorporarse si existe abuso real.

---

# 77. Search abuse

El buscador público tendrá:

- límites;
- paginación;
- tamaño máximo de query;
- timeout.

---

# 78. Analytics abuse

El endpoint de analytics público podrá recibir tráfico automatizado.

Los eventos no deberán considerarse datos absolutamente confiables.

Se aplicará:

- rate limiting;
- deduplicación;
- filtrado básico de bots.

---

# 79. API versioning

Endpoints:

```text
/api/v1
```

La seguridad deberá ser consistente entre versiones.

No se mantendrán versiones antiguas inseguras indefinidamente.

---

# 80. API errors

Nunca devolver:

- stack traces;
- SQL;
- rutas internas;
- secretos;
- detalles de infraestructura.

---

# 81. Error response

Ejemplo:

```json
{
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "El producto solicitado no existe",
    "requestId": "..."
  }
}
```

---

# 82. Logging seguro

Logs podrán incluir:

```text
requestId
tenantId
businessId
userId
action
status
latency
```

---

# 83. Nunca loguear

No deberán aparecer:

- contraseña;
- passwordHash;
- session token;
- JWT completo;
- API key completa;
- signed URL completa si incluye credenciales;
- secretos;
- datos de autenticación.

---

# 84. Log injection

Los valores provenientes del usuario deberán estructurarse y escaparse.

Preferir logs JSON estructurados.

---

# 85. Audit logs

Acciones críticas deberán generar audit event.

Ejemplos:

```text
LOGIN_SUCCESS
LOGIN_FAILURE
PASSWORD_CHANGED
USER_INVITED
ROLE_CHANGED
PRODUCT_DELETED
BUSINESS_SUSPENDED
TENANT_BLOCKED
SUBDOMAIN_CHANGED
ADMIN_ACTION
```

---

# 86. Audit immutability

Usuarios del negocio no podrán editar ni borrar AuditLog.

---

# 87. Retención

La política de retención de logs se definirá según:

- seguridad;
- almacenamiento;
- privacidad;
- operación.

---

# 88. Seguridad del backoffice

`admin.dtodo537.net` tendrá controles reforzados.

Como mínimo:

- roles globales;
- sesiones separadas;
- auditoría;
- rate limiting;
- MFA futuro obligatorio.

---

# 89. Acceso administrativo

No deberán compartirse cuentas administrativas.

Cada operador tendrá identidad individual.

---

# 90. Platform support

Rol SUPPORT no deberá tener automáticamente permisos destructivos.

---

# 91. Admin destructive actions

Acciones como:

- bloquear tenant;
- eliminar datos;
- cambiar ownership;

deberán requerir:

- permiso específico;
- confirmación;
- auditoría.

---

# 92. Reautenticación

Para operaciones altamente sensibles podrá exigirse reautenticación.

Ejemplos futuros:

- cambio de email;
- cambio de contraseña;
- eliminar tenant;
- generar API keys.

---

# 93. Secrets management

Secretos nunca se guardarán en repositorio Git.

Ejemplos:

```text
DATABASE_URL
REDIS_PASSWORD
SESSION_SECRET
S3_SECRET_KEY
SMTP_PASSWORD
```

---

# 94. Environment variables

Se utilizarán variables de entorno o mecanismo de secretos.

Archivos `.env` de producción no deberán versionarse.

---

# 95. Secret rotation

La arquitectura deberá permitir rotar:

- credenciales DB;
- claves Redis;
- secretos de sesión;
- claves S3;
- SMTP.

---

# 96. Diferenciación por ambiente

Development, staging y production tendrán credenciales independientes.

Nunca reutilizar secretos de producción en desarrollo.

---

# 97. Database security

PostgreSQL:

- no expuesto a Internet;
- acceso por red interna;
- usuarios separados;
- privilegios mínimos;
- TLS interno cuando corresponda.

---

# 98. Database roles

Como definido anteriormente:

```text
dtodo_app
dtodo_admin
dtodo_migrations
```

---

# 99. RLS

`dtodo_app` estará sujeto a Row Level Security cuando aplique.

No tendrá:

```text
BYPASSRLS
```

---

# 100. Migrations user

`dtodo_migrations` tendrá permisos de esquema solo durante despliegue.

No será utilizado por aplicación runtime.

---

# 101. Redis security

Redis:

- no expuesto públicamente;
- autenticación;
- bind a red interna;
- ACL si corresponde.

---

# 102. Redis data

No guardar secretos innecesarios.

Las sesiones pueden almacenarse, pero identificadores deberán ser seguros.

---

# 103. BullMQ security

Los workers confiarán únicamente en colas internas.

Payloads deberán validarse igualmente.

---

# 104. Job tampering

Aunque BullMQ sea interno:

- validar IDs;
- validar tenant;
- validar estado de recurso.

---

# 105. Infrastructure network

Arquitectura conceptual:

```text
Internet
   │
   ▼
HAProxy / Nginx
   │
   ├── Web
   └── API
        │
        ├── PostgreSQL
        ├── Redis
        └── Object Storage
```

Solo proxy/web necesarios estarán expuestos públicamente.

---

# 106. Firewall

Se aplicará allowlist por servicio.

Ejemplo:

```text
PostgreSQL 5432
→ solo API / administración autorizada

Redis 6379
→ solo API / worker
```

---

# 107. SSH

Acceso administrativo:

- claves SSH;
- no password login;
- usuario individual cuando sea posible;
- sudo controlado.

---

# 108. Root login

Deshabilitado remotamente.

---

# 109. Fail2ban

Puede utilizarse como defensa adicional para SSH y servicios expuestos cuando corresponda.

---

# 110. OS hardening

Ubuntu Server deberá mantenerse con:

- actualizaciones de seguridad;
- servicios mínimos;
- paquetes innecesarios removidos;
- permisos correctos.

---

# 111. systemd security

Servicios deberán usar usuarios específicos.

Ejemplo:

```text
dtodo-web
dtodo-api
dtodo-worker
```

No ejecutar como root.

---

# 112. systemd sandboxing

Cuando sea posible:

```text
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
```

ajustado según necesidades.

---

# 113. File permissions

Secretos y configuraciones:

```text
600
```

o permisos equivalentes restrictivos.

---

# 114. Reverse proxy

HAProxy/Nginx será responsable de:

- TLS termination;
- redirect HTTP→HTTPS;
- headers;
- límites;
- routing.

---

# 115. Request size

Se limitará tamaño máximo de requests.

Uploads tendrán endpoints específicamente configurados.

---

# 116. Header size

También se limitarán headers anormalmente grandes.

---

# 117. Slow requests

Proxy y backend utilizarán timeouts para reducir Slowloris y recursos bloqueados.

---

# 118. Denial of Service

No se pretende resolver DDoS masivo únicamente en aplicación.

Controles:

- proxy;
- rate limiting;
- cache;
- CDN futuro;
- límites;
- upstream protection futura.

---

# 119. Dependency security

Next.js/NestJS implican cadena de dependencias amplia.

Se aplicará:

- lockfile;
- revisión de actualizaciones;
- vulnerability scanning;
- Dependabot/Renovate;
- auditoría CI.

---

# 120. pnpm lock

`pnpm-lock.yaml` deberá versionarse.

Los builds de producción deberán respetar versiones fijadas.

---

# 121. Supply-chain attacks

No se instalarán dependencias sin revisión.

Especialmente paquetes:

- poco mantenidos;
- recién creados;
- con scripts postinstall innecesarios.

---

# 122. npm lifecycle scripts

Se revisarán scripts de instalación de dependencias sensibles.

---

# 123. SBOM

Se recomienda generar posteriormente SBOM de releases.

Formato:

```text
CycloneDX
```

o SPDX.

---

# 124. SAST

Pipeline deberá incorporar análisis estático.

Ejemplos:

- ESLint security rules;
- CodeQL;
- Semgrep.

---

# 125. Dependency scanning

CI deberá detectar vulnerabilidades conocidas.

No toda vulnerabilidad bloqueará release automáticamente; dependerá de:

- severidad;
- explotabilidad;
- componente;
- exposición.

---

# 126. Secret scanning

Repositorios deberán escanear:

- contraseñas;
- tokens;
- private keys;
- API keys.

---

# 127. Container scanning

No aplica inicialmente porque el despliegue no utilizará contenedores.

---

# 128. IaC security

Si se incorporan scripts Ansible/Terraform posteriormente, también deberán revisarse.

---

# 129. CI/CD security

Pipeline deberá usar credenciales con mínimo privilegio.

No deberán exponerse secretos en logs.

---

# 130. Branch protection

Rama principal deberá requerir:

- Pull Request;
- tests;
- revisión;
- checks de seguridad.

---

# 131. No deploy from workstation

Producción deberá desplegarse mediante proceso controlado.

Evitar:

```text
scp manual
```

como mecanismo permanente.

---

# 132. Artifact integrity

Los artefactos de build deberán provenir del commit aprobado.

---

# 133. Environment separation

Staging no debe compartir:

- DB;
- Redis;
- S3;
- claves;
- cookies;

con producción.

---

# 134. Backup security

Backups contienen datos completos.

Por tanto deben considerarse información crítica.

---

# 135. Backup access

Solo cuentas administrativas autorizadas.

---

# 136. Backup encryption

Se recomienda cifrado:

- en tránsito;
- en reposo.

---

# 137. Backup retention

Política definida y documentada.

---

# 138. Restore testing

Un backup no se considera válido hasta que se pruebe restauración periódicamente.

---

# 139. Backup deletion

Eliminación de tenant no implica necesariamente desaparición inmediata de backups históricos.

Esto deberá quedar reflejado en política de retención.

---

# 140. Monitoring security

Se deberán generar alertas para:

- múltiples logins fallidos;
- errores 403/404 anormales;
- spikes de uploads;
- errores cross-tenant;
- admin actions críticas;
- fallos de servicios.

---

# 141. Security events

Podrá existir categoría específica:

```text
SECURITY_EVENT
```

en logs.

---

# 142. Request ID

Toda petición tendrá `requestId`.

Debe aparecer en:

- logs;
- errores;
- auditoría.

---

# 143. Incident investigation

Con `requestId`, `tenantId`, `userId` deberá poder seguirse una operación completa.

---

# 144. Privacy by design

Solo se almacenará información necesaria.

No se recopilará información personal del consumidor si no existe propósito claro.

---

# 145. Analytics privacy

Para estadísticas básicas no se necesita identificar personalmente al visitante.

---

# 146. IP addresses

Si se almacenan temporalmente para seguridad o antiabuso:

- limitar retención;
- justificar finalidad;
- restringir acceso.

---

# 147. User enumeration

Login y password reset no deberán revelar innecesariamente si un correo existe.

Ejemplo:

```text
Si la cuenta existe, recibirás instrucciones.
```

---

# 148. Email verification abuse

Resend deberá tener rate limit.

---

# 149. Invitation security

Invitaciones a gestores:

- token de un solo uso;
- expiración;
- asociadas a email;
- asociadas a Tenant.

---

# 150. Ownership transfer

Cambiar BUSINESS_OWNER será operación crítica.

No se implementará de forma informal mediante cambio de role.

Deberá existir flujo específico futuro.

---

# 151. Business content

El sistema debe considerar contenido malicioso o ilegal como posible abuso.

Se requiere capacidad de:

- despublicar;
- suspender;
- bloquear.

---

# 152. Moderation actions

Toda acción de moderación global deberá auditarse.

---

# 153. External links

URLs sociales deberán validarse.

No permitir esquemas como:

```text
javascript:
data:
```

cuando no correspondan.

---

# 154. URL allowlist

Links aceptados:

```text
https://
http://
```

aunque públicamente se preferirá HTTPS.

---

# 155. WhatsApp URL

La URL hacia WhatsApp será generada por la plataforma.

No se almacenará HTML proporcionado por negocio.

---

# 156. Phone validation

Número WhatsApp se almacenará en formato normalizado, preferiblemente E.164 cuando sea posible.

---

# 157. Redirect security

Tracked links como:

```text
/r/...
```

no deberán convertirse en open redirect arbitrario.

---

# 158. Open redirect

El destino deberá derivarse de configuración validada o allowlist.

Nunca:

```text
/r?url=https://attacker.com
```

sin controles.

---

# 159. QR security

QR apuntará a URLs propias controladas.

No contendrá secretos.

---

# 160. Search indexing

No deberán indexarse páginas:

- administrativas;
- login;
- borradores;
- preview privado.

---

# 161. Preview links

Si se implementan previews privadas:

- token temporal;
- difícil de adivinar;
- expiración;
- no indexable.

---

# 162. robots.txt no es seguridad

`robots.txt` solo controla indexación voluntaria.

No sustituye autenticación.

---

# 163. Cache security

Nunca cachear contenido privado en cache pública compartida.

---

# 164. Cache key isolation

Keys incluirán:

```text
tenant
business
scope
```

cuando corresponda.

---

# 165. CDN cache

Si se incorpora CDN, cookies/autorización deberán considerarse para evitar servir contenido privado a terceros.

---

# 166. SSR security

Next.js Server Components no deberán exponer secretos al cliente.

Debe distinguirse claramente:

```text
server-only
client
```

---

# 167. Environment variables Next.js

Solo variables explícitamente públicas podrán usar prefijo equivalente a:

```text
NEXT_PUBLIC_
```

Nunca secretos.

---

# 168. Source maps

En producción deberán gestionarse para no exponer información innecesaria públicamente.

Pueden conservarse internamente para observabilidad.

---

# 169. Error pages

No mostrar:

- stack;
- filesystem path;
- ORM queries.

---

# 170. Admin URL

Que el backoffice esté en:

```text
admin.dtodo537.net
```

no constituye seguridad.

Todos los controles deberán funcionar aunque el atacante conozca la URL.

---

# 171. Security testing

La estrategia incluirá:

- unit;
- integration;
- E2E;
- tenant isolation;
- SAST;
- dependency scanning;
- manual review.

---

# 172. OWASP

El desarrollo tendrá como referencia:

**OWASP Top 10**

y especialmente:

- Broken Access Control;
- Cryptographic Failures;
- Injection;
- Insecure Design;
- Security Misconfiguration;
- Vulnerable Components;
- Authentication Failures;
- Software/Data Integrity;
- Logging/Monitoring Failures;
- SSRF.

---

# 173. OWASP ASVS

Se recomienda utilizar **OWASP ASVS** como checklist técnico para seguridad de aplicación.

Objetivo inicial:

alineación práctica con nivel equivalente a **ASVS Level 2** para funciones principales.

---

# 174. Security tests obligatorios

Como mínimo:

- acceso cross-tenant;
- privilege escalation;
- IDOR;
- CSRF;
- upload malicioso;
- XSS almacenado;
- brute-force controls;
- open redirect;
- session fixation;
- logout invalidation.

---

# 175. IDOR

Todo endpoint con identificadores deberá probarse intentando utilizar IDs de otro tenant.

---

# 176. Test XSS

Ejemplo en nombre de producto:

```text
<script>alert(1)</script>
```

Debe mostrarse como texto o ser rechazado, nunca ejecutado.

---

# 177. Test upload

Intentar:

- PHP renombrado JPG;
- HTML renombrado PNG;
- SVG con script;
- imagen excesivamente grande.

Debe ser rechazado o procesado de forma segura.

---

# 178. Test CSRF

Una página externa no deberá poder:

- crear producto;
- modificar negocio;
- eliminar contenido;

usando sesión del usuario.

---

# 179. Test privilege escalation

BUSINESS_MANAGER sin permiso correspondiente intenta:

```text
invite user
change owner
```

Expected:

```text
403
```

---

# 180. Security regression

Toda vulnerabilidad corregida deberá generar test automatizado cuando sea viable.

---

# 181. Vulnerability severity

Clasificación inicial:

```text
CRITICAL
HIGH
MEDIUM
LOW
```

Cross-tenant read/write:

```text
CRITICAL
```

Remote code execution:

```text
CRITICAL
```

Authentication bypass:

```text
CRITICAL
```

---

# 182. Vulnerability handling

Una vulnerabilidad crítica bloqueará release.

---

# 183. Dependency exceptions

Si una dependencia tiene CVE pero no es explotable en nuestro contexto, la excepción deberá documentarse.

No simplemente ignorarse.

---

# 184. Security documentation

El repositorio deberá mantener:

```text
SECURITY.md
```

con:

- políticas;
- reporte de vulnerabilidades;
- procedimientos básicos.

---

# 185. Security checklist de Pull Request

- [ ] No introduce secretos.
- [ ] Valida inputs.
- [ ] Respeta TenantContext.
- [ ] Aplica permisos.
- [ ] No expone datos internos.
- [ ] No utiliza HTML inseguro.
- [ ] No crea redirects abiertos.
- [ ] Uploads están validados.
- [ ] Tiene tests de autorización.
- [ ] Dependencias nuevas justificadas.

---

# 186. Security checklist de release

- [ ] Tests completos OK.
- [ ] Multi-tenant tests OK.
- [ ] Dependency scan revisado.
- [ ] Secret scan OK.
- [ ] Migraciones revisadas.
- [ ] Configuración de producción revisada.
- [ ] Backups verificados.
- [ ] Rollback disponible.
- [ ] Security headers activos.

---

# 187. Security checklist de nuevo endpoint

Todo endpoint deberá responder:

```text
¿Es público o autenticado?
¿Tiene tenant scope?
¿Qué permiso requiere?
¿Qué valida?
¿Qué datos devuelve?
¿Tiene rate limit?
¿Puede modificar recursos?
¿Puede filtrar datos de otro tenant?
¿Debe auditarse?
```

---

# 188. Security checklist de nuevo upload

```text
¿Tipo permitido?
¿Tamaño permitido?
¿Magic bytes?
¿Dimensiones?
¿Quota tenant?
¿Ownership?
¿Re-encoding?
¿Metadata eliminada?
¿Object key generado?
```

---

# 189. Security checklist de nueva integración

```text
¿Qué secretos necesita?
¿Dónde se almacenan?
¿Qué datos envía?
¿Qué datos recibe?
¿Tiene timeout?
¿Puede provocar SSRF?
¿Puede redirigir?
¿Cómo se revoca?
```

---

# 190. Incident Response básico

Debe existir procedimiento para:

```text
Detect
Contain
Investigate
Eradicate
Recover
Review
```

---

# 191. Containment

Ejemplos:

- revocar sesiones;
- bloquear tenant;
- deshabilitar cuenta;
- rotar secreto;
- desactivar integración.

---

# 192. Security kill switches

La administración global debería poder:

- suspender tenant;
- bloquear usuario;
- despublicar showroom;
- revocar sesiones.

---

# 193. Audit preservation

Durante incidente se deberán preservar logs relevantes.

---

# 194. Post-incident

Toda incidencia deberá producir:

- causa raíz;
- controles correctivos;
- tests de regresión;
- actualización documental.

---

# 195. Threat model evolutivo

El threat model deberá revisarse cuando se incorporen:

- pagos;
- API pública;
- dominios personalizados;
- IA;
- importación por URL;
- integraciones externas.

---

# 196. Riesgos específicos futuros de IA

Si se añaden funciones de IA:

- prompt injection;
- datos sensibles enviados a terceros;
- contenido generado inseguro;
- dependencia de proveedores;
- costes abusivos.

No forman parte del MVP actual.

---

# 197. Riesgos de dominios personalizados

Cuando se implementen:

- domain verification;
- certificate issuance;
- takeover;
- dangling DNS;
- spoofing.

---

# 198. Riesgos de API pública

Cuando se implemente:

- API keys;
- scopes;
- rate limiting;
- revocation;
- audit;
- tenant binding.

---

# 199. Security architecture diagram

```text
                          INTERNET
                              │
                              ▼
                     HAProxy / Nginx
                              │
                    TLS / Rate Limits
                              │
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
           Next.js                         NestJS
              │                               │
              │                      Authentication
              │                               │
              │                           Session
              │                               │
              │                          TenantContext
              │                               │
              │                           RBAC/Policy
              │                               │
              │                      Application Service
              │                               │
              │                     Tenant-aware Repository
              │                               │
              │                         PostgreSQL RLS
              │
              └───────────────┬───────────────┘
                              │
                       Redis / BullMQ
                              │
                           Worker
                              │
                      Object Storage
```

---

# 200. Decisiones cerradas

### SEC-001

Autenticación inicial:

**email + password**

### SEC-002

Password hashing:

**Argon2id**

### SEC-003

Sesiones web:

**server-side session + Secure HttpOnly cookies**

### SEC-004

No almacenar tokens sensibles en localStorage.

### SEC-005

Autorización:

**RBAC + resource ownership + TenantContext**

### SEC-006

MFA previsto, con prioridad para administración global.

### SEC-007

CSP y security headers serán obligatorios.

### SEC-008

Uploads serán tratados como contenido no confiable.

### SEC-009

SVG no será admitido inicialmente.

### SEC-010

Imágenes serán re-procesadas y se eliminarán metadatos innecesarios.

### SEC-011

Todos los endpoints sensibles tendrán rate limiting.

### SEC-012

Secretos nunca se almacenarán en Git.

### SEC-013

PostgreSQL, Redis y Object Storage no estarán expuestos directamente a Internet.

### SEC-014

Servicios Linux no se ejecutarán como root.

### SEC-015

Cross-tenant vulnerabilities tendrán severidad CRITICAL.

### SEC-016

Security testing formará parte del CI/CD.

### SEC-017

OWASP Top 10 y OWASP ASVS serán referencias de control.

### SEC-018

`admin.dtodo537.net` tendrá controles reforzados y auditoría completa.

---

# 201. Prioridades de seguridad para el MVP

## P0 — Obligatorias antes de producción

```text
Tenant isolation
Authentication
Secure sessions
RBAC
Password hashing
Input validation
Upload validation
HTTPS
Security headers
Rate limiting
Secrets management
Database protection
Audit logs críticos
Dependency scanning
Backup protection
```

## P1 — Deben incorporarse muy temprano

```text
RLS completo
MFA admin
SAST
Enhanced monitoring
Session management UI
Advanced anti-abuse
```

## P2 — Evolución

```text
Passkeys
WAF/CDN avanzado
Automated incident workflows
Advanced anomaly detection
```

---

# 202. Principio rector

La seguridad de `dtodo537.net` deberá seguir una regla fundamental:

> **Ningún dato, identidad, archivo, tenant, permiso o contexto recibido desde el exterior será considerado confiable hasta ser validado por el sistema.**

Y para la característica más sensible de la solución:

> **La seguridad multi-tenant deberá fallar siempre de forma cerrada: ante cualquier duda sobre identidad, tenant, ownership o permiso, la operación será rechazada.**

---

# 203. Resultado esperado

Con esta arquitectura se pretende que el crecimiento funcional de `dtodo537.net` no obligue a reconstruir posteriormente sus fundamentos de seguridad.

La protección deberá estar integrada desde el inicio en:

**identidad, sesiones, autorización, multi-tenancy, frontend, API, uploads, base de datos, Redis, jobs, infraestructura, despliegues, logs, auditoría, CI/CD y operación.**