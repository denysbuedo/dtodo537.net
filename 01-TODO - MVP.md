# TODO — Implementación MVP dtodo537.net

**Proyecto:** Plataforma de Showrooms Comerciales  
**Dominio:** `dtodo537.net`  
**Versión:** 0.1  
**Objetivo:** Definir la secuencia inicial de diseño e implementación antes de iniciar el desarrollo con Codex.

---

# FASE 0 — Definición

- [x] Definir concepto general del producto.
- [x] Establecer modelo showroom en lugar de e-commerce.
- [x] Definir arquitectura multi-negocio.
- [x] Establecer portal general de descubrimiento.
- [x] Establecer showrooms mediante subdominios.
- [x] Seleccionar Next.js como frontend.
- [x] Adoptar sistema de plantillas.
- [x] Establecer WhatsApp como canal principal de conversión.
- [x] Definir enfoque mobile-first.
- [ ] Definir nombre comercial.
- [ ] Definir identidad visual general de `dtodo537.net`.
- [ ] Definir público objetivo inicial.
- [ ] Definir modelo inicial de planes.
- [ ] Definir reglas de moderación.

---

# FASE 1 — Arquitectura

- [ ] Elaborar arquitectura general.
- [ ] Definir arquitectura multi-tenant.
- [ ] Definir estrategia de resolución por subdominio.
- [ ] Definir modelo de autenticación.
- [ ] Definir modelo RBAC.
- [ ] Seleccionar backend: NestJS o FastAPI.
- [ ] Diseñar PostgreSQL.
- [ ] Diseñar estrategia de aislamiento de tenants.
- [ ] Definir Redis.
- [ ] Definir almacenamiento S3 compatible.
- [ ] Diseñar procesamiento de imágenes.
- [ ] Definir estrategia de caché.
- [ ] Definir estrategia SEO.
- [ ] Definir observabilidad.
- [ ] Definir logging.
- [ ] Definir auditoría.
- [ ] Definir backup.
- [ ] Definir seguridad.
- [ ] Definir ambientes DEV/STAGING/PROD.
- [ ] Definir CI/CD.

---

# FASE 2 — Modelo de dominio

- [ ] Tenant.
- [ ] BusinessProfile.
- [ ] User.
- [ ] Role.
- [ ] Permission.
- [ ] Category.
- [ ] Product.
- [ ] ProductImage.
- [ ] ProductAttribute.
- [ ] ProductVariant.
- [ ] Tag.
- [ ] Offer.
- [ ] SocialNetwork.
- [ ] ContactChannel.
- [ ] BusinessLocation.
- [ ] Theme.
- [ ] ThemeConfiguration.
- [ ] AnalyticsEvent.
- [ ] SubscriptionPlan.
- [ ] Subscription.
- [ ] AuditLog.

---

# FASE 3 — Infraestructura de dominio

- [ ] Configurar `dtodo537.net`.
- [ ] Configurar wildcard DNS `*.dtodo537.net`.
- [ ] Configurar TLS.
- [ ] Configurar frontend.
- [ ] Configurar API.
- [ ] Configurar PostgreSQL.
- [ ] Configurar Redis.
- [ ] Configurar almacenamiento de objetos.
- [ ] Configurar reverse proxy.
- [ ] Configurar backups.
- [ ] Configurar logs.
- [ ] Configurar monitorización.

---

# FASE 4 — Núcleo multi-tenant

- [ ] Crear tenants.
- [ ] Resolver tenant mediante hostname.
- [ ] Implementar TenantContext.
- [ ] Implementar aislamiento de datos.
- [ ] Validar subdominios.
- [ ] Reservar subdominios del sistema.
- [ ] Implementar estado del tenant.
- [ ] Implementar suspensión.
- [ ] Implementar eliminación lógica.
- [ ] Crear pruebas automatizadas de aislamiento.

---

# FASE 5 — Autenticación y usuarios

- [ ] Registro.
- [ ] Login.
- [ ] Logout.
- [ ] Recuperación de contraseña.
- [ ] Verificación de correo.
- [ ] Gestión de sesiones.
- [ ] Propietario del negocio.
- [ ] Gestores.
- [ ] Administrador global.
- [ ] RBAC.
- [ ] Auditoría de operaciones sensibles.

---

# FASE 6 — Onboarding

- [ ] Diseñar wizard.
- [ ] Crear negocio.
- [ ] Seleccionar subdominio.
- [ ] Validar disponibilidad.
- [ ] Seleccionar categoría del negocio.
- [ ] Seleccionar plantilla.
- [ ] Subir logotipo.
- [ ] Seleccionar colores.
- [ ] Configurar WhatsApp.
- [ ] Configurar redes sociales.
- [ ] Crear primer producto.
- [ ] Mostrar vista previa.
- [ ] Publicar showroom.

**Objetivo UX:** showroom funcional en menos de 10 minutos.

---

# FASE 7 — Perfil comercial

- [ ] Nombre.
- [ ] Descripción.
- [ ] Logotipo.
- [ ] Portada.
- [ ] Teléfono.
- [ ] WhatsApp.
- [ ] Correo.
- [ ] Dirección.
- [ ] Horarios.
- [ ] Ubicación.
- [ ] Facebook.
- [ ] Instagram.
- [ ] TikTok.
- [ ] Telegram.
- [ ] Otras redes.

---

# FASE 8 — Sistema de plantillas

- [ ] Diseñar arquitectura Theme.
- [ ] Diseñar ThemeConfiguration.
- [ ] Crear tokens visuales.
- [ ] Implementar selector de plantilla.
- [ ] Implementar selector de colores.
- [ ] Implementar selector de tipografía.
- [ ] Implementar portada.
- [ ] Implementar vista previa.
- [ ] Garantizar responsive design.
- [ ] Garantizar accesibilidad.
- [ ] Crear primera plantilla Minimal.
- [ ] Crear segunda plantilla Boutique.
- [ ] Crear tercera plantilla Comercial.

No permitir HTML o CSS arbitrario.

---

# FASE 9 — Catálogo

- [ ] CRUD de categorías.
- [ ] CRUD de productos.
- [ ] Slugs.
- [ ] Descripción corta.
- [ ] Descripción completa.
- [ ] Precio.
- [ ] Precio anterior.
- [ ] Moneda.
- [ ] Consultar precio.
- [ ] Disponibilidad.
- [ ] Etiquetas.
- [ ] Características.
- [ ] Productos destacados.
- [ ] Ordenamiento.
- [ ] Publicar/despublicar.
- [ ] Vista previa.

---

# FASE 10 — Fotografías

- [ ] Carga desde móvil.
- [ ] Carga múltiple.
- [ ] Validación MIME.
- [ ] Validación de tamaño.
- [ ] Redimensionamiento.
- [ ] Miniaturas.
- [ ] Optimización web.
- [ ] Fotografía principal.
- [ ] Orden de galería.
- [ ] Eliminación.
- [ ] Límites por tenant.

---

# FASE 11 — Ofertas

- [ ] Precio normal.
- [ ] Precio de oferta.
- [ ] Fecha inicial.
- [ ] Fecha final.
- [ ] Activación automática.
- [ ] Desactivación automática.
- [ ] Etiqueta visual.
- [ ] Listado de ofertas.
- [ ] Ofertas destacadas en portal general.

---

# FASE 12 — WhatsApp

- [ ] Configurar número del negocio.
- [ ] Generar enlace.
- [ ] Crear mensajes contextuales.
- [ ] Incorporar producto.
- [ ] Incorporar URL.
- [ ] Registrar clic.
- [ ] Redirigir a WhatsApp.
- [ ] Mostrar estadísticas.

---

# FASE 13 — Showroom público

- [ ] Portada.
- [ ] Identidad visual.
- [ ] Información comercial.
- [ ] Categorías.
- [ ] Productos.
- [ ] Ofertas.
- [ ] Productos destacados.
- [ ] Ficha del producto.
- [ ] Galería.
- [ ] WhatsApp.
- [ ] Redes sociales.
- [ ] Ubicación.
- [ ] Horarios.
- [ ] Compartir.
- [ ] QR.
- [ ] Responsive.

---

# FASE 14 — Portal general dtodo537.net

- [ ] Home.
- [ ] Buscador principal.
- [ ] Negocios destacados.
- [ ] Productos destacados.
- [ ] Ofertas.
- [ ] Nuevos productos.
- [ ] Categorías.
- [ ] Resultados de búsqueda.
- [ ] Filtros.
- [ ] Página pública del negocio.
- [ ] Navegación hacia showrooms.
- [ ] SEO.

---

# FASE 15 — Búsqueda

MVP:

- [ ] Productos.
- [ ] Negocios.
- [ ] Categorías.
- [ ] Descripción.
- [ ] Etiquetas.
- [ ] Ofertas.
- [ ] Orden por relevancia.

Posterior:

- [ ] Autocompletado.
- [ ] Sinónimos.
- [ ] Búsqueda geográfica.
- [ ] Búsqueda semántica.
- [ ] Recomendaciones.

---

# FASE 16 — QR

- [ ] QR del showroom.
- [ ] QR de producto.
- [ ] Descarga del QR.
- [ ] Vista para impresión.
- [ ] Registro de acceso mediante QR.

---

# FASE 17 — Analítica

Registrar:

- [ ] PageView.
- [ ] ShowroomView.
- [ ] ProductView.
- [ ] WhatsAppClick.
- [ ] PhoneClick.
- [ ] SocialClick.
- [ ] Share.
- [ ] QRVisit.

Dashboard:

- [ ] Visitas.
- [ ] Productos vistos.
- [ ] Productos populares.
- [ ] Clics WhatsApp.
- [ ] Evolución temporal.
- [ ] Principales fuentes.

---

# FASE 18 — SEO

- [ ] Metadata dinámica.
- [ ] Open Graph.
- [ ] Twitter/X cards.
- [ ] Sitemap global.
- [ ] Sitemap por showroom.
- [ ] robots.txt.
- [ ] canonical.
- [ ] Schema.org.
- [ ] URLs amigables.
- [ ] optimización de imágenes.
- [ ] previews para WhatsApp.

---

# FASE 19 — Administración global

- [ ] Dashboard.
- [ ] Negocios.
- [ ] Usuarios.
- [ ] Productos.
- [ ] Categorías.
- [ ] Plantillas.
- [ ] Planes.
- [ ] Estadísticas.
- [ ] Moderación.
- [ ] Suspensiones.
- [ ] Auditoría.
- [ ] Configuración global.

---

# FASE 20 — Seguridad

- [ ] Threat model.
- [ ] Tenant isolation tests.
- [ ] RBAC.
- [ ] Rate limiting.
- [ ] Validación de entrada.
- [ ] Validación de archivos.
- [ ] CSP.
- [ ] Security headers.
- [ ] Gestión de secretos.
- [ ] Protección contra abuso.
- [ ] Logs de seguridad.
- [ ] Auditoría.
- [ ] Política de contraseñas.
- [ ] Pruebas OWASP.

---

# FASE 21 — Calidad

- [ ] Unit tests.
- [ ] Integration tests.
- [ ] E2E tests.
- [ ] Multi-tenant tests.
- [ ] Security tests.
- [ ] Responsive tests.
- [ ] Accessibility tests.
- [ ] Performance tests.
- [ ] SEO tests.

---

# FASE 22 — MVP Beta

Seleccionar un pequeño grupo de negocios reales.

- [ ] Crear tenants.
- [ ] Acompañar onboarding.
- [ ] Medir tiempo de configuración.
- [ ] Medir publicación de productos.
- [ ] Analizar dificultades.
- [ ] Recoger feedback.
- [ ] Medir visitas.
- [ ] Medir consultas WhatsApp.
- [ ] Corregir UX.
- [ ] Ajustar funcionalidades.

---

# FASE 23 — Criterios de éxito del MVP

El MVP deberá demostrar que:

- [ ] un emprendedor puede crear su showroom sin asistencia técnica;
- [ ] puede hacerlo desde un teléfono;
- [ ] puede publicar productos fácilmente;
- [ ] puede modificar precios rápidamente;
- [ ] puede compartir productos;
- [ ] recibe consultas mediante WhatsApp;
- [ ] los consumidores pueden descubrir productos desde el portal general;
- [ ] los productos pueden encontrarse mediante buscadores;
- [ ] múltiples negocios funcionan correctamente sobre una misma plataforma;
- [ ] los datos permanecen aislados entre tenants;
- [ ] la plataforma mantiene buen rendimiento.

---

# FASE 24 — Funcionalidades posteriores al MVP

- [ ] Dominios personalizados.
- [ ] Importación Excel/CSV.
- [ ] Geolocalización.
- [ ] Mapas.
- [ ] Analítica avanzada.
- [ ] Recomendaciones.
- [ ] Búsqueda semántica.
- [ ] IA para descripción de productos.
- [ ] IA para generación de etiquetas.
- [ ] IA para SEO.
- [ ] Procesamiento inteligente de fotografías.
- [ ] API pública.
- [ ] Integraciones externas.
- [ ] PWA.
- [ ] Notificaciones.
- [ ] Campañas.
- [ ] Productos patrocinados.
- [ ] Negocios destacados.
- [ ] Dominios propios.

---

# REGLA DE IMPLEMENTACIÓN

Codex no deberá intentar construir todas las fases simultáneamente.

Cada fase deberá:

1. diseñarse;
2. documentarse;
3. implementarse;
4. probarse;
5. revisarse;
6. aprobarse antes de introducir cambios arquitectónicos significativos.

Ninguna decisión estructural importante deberá modificarse unilateralmente durante la implementación.

---

# PRIORIDAD INMEDIATA

Antes de comenzar a generar código de producción deberán completarse:

1. arquitectura del sistema;
2. selección definitiva del backend;
3. modelo multi-tenant;
4. modelo de dominio;
5. arquitectura de seguridad;
6. arquitectura de datos;
7. estrategia de subdominios;
8. arquitectura del sistema de plantillas;
9. estrategia de almacenamiento de imágenes;
10. estructura de repositorios;
11. estrategia de despliegue;
12. definición exacta del MVP.

**Después de aprobar estas decisiones comenzará la implementación con Codex.**