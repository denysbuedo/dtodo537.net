# 06 — MVP Specification

**Proyecto:** Plataforma Digital de Showrooms Comerciales Multi-Negocio  
**Dominio previsto:** `dtodo537.net`  
**Nombre comercial:** Por definir  
**Versión:** 0.1  
**Estado:** Especificación funcional del MVP propuesta para aprobación

---

# 1. Propósito

Este documento define el alcance funcional del **Producto Mínimo Viable (MVP)** de `dtodo537.net`.

Su objetivo es establecer con claridad:

- qué funcionalidades forman parte de la primera versión;
- qué funcionalidades quedan fuera;
- qué actores participarán;
- qué flujos deben funcionar de extremo a extremo;
- qué condiciones mínimas determinan que el MVP está listo para una beta real;
- qué métricas permitirán valorar si el producto resuelve el problema identificado.

Este documento será la referencia principal para evitar crecimiento descontrolado del alcance durante la implementación.

---

# 2. Objetivo del MVP

El MVP deberá demostrar que un emprendedor puede:

1. crear una cuenta;
2. crear su negocio;
3. seleccionar un subdominio;
4. escoger una plantilla;
5. personalizar colores y logotipo;
6. configurar información comercial;
7. publicar productos con fotografías y precios;
8. compartir su showroom;
9. recibir consultas mediante WhatsApp;
10. consultar estadísticas básicas.

Al mismo tiempo, un visitante deberá poder:

1. entrar a `dtodo537.net`;
2. buscar productos u ofertas;
3. descubrir negocios;
4. abrir un producto;
5. visitar el showroom del negocio;
6. contactar directamente por WhatsApp.

---

# 3. Hipótesis principal

La hipótesis de producto a validar es:

> Un número significativo de pequeños negocios necesita una presencia comercial digital profesional y sencilla, pero no requiere inicialmente las funciones complejas de un comercio electrónico completo.

La segunda hipótesis es:

> El valor del producto aumenta cuando los showrooms individuales forman parte de un portal común de descubrimiento comercial.

---

# 4. Principio rector

El MVP no será evaluado por la cantidad de funcionalidades implementadas.

Será evaluado por su capacidad para resolver correctamente dos tareas:

**Publicar fácilmente una oferta comercial.**

y

**Descubrir fácilmente una oferta comercial.**

---

# 5. Actores del MVP

Se contemplan cuatro actores.

## 5.1. Visitante

Persona que navega por el portal y los showrooms sin autenticarse.

## 5.2. Propietario del negocio

Persona que crea y administra un negocio.

Rol:

`BUSINESS_OWNER`

## 5.3. Gestor del negocio

Usuario autorizado por el propietario para gestionar determinados contenidos.

Rol:

`BUSINESS_MANAGER`

Su incorporación puede limitarse durante la primera beta si es necesario.

## 5.4. Administrador de plataforma

Gestiona globalmente:

- tenants;
- negocios;
- usuarios;
- categorías generales;
- plantillas;
- moderación;
- configuración.

Rol:

`PLATFORM_ADMIN`

---

# 6. Flujo principal del propietario

El flujo crítico será:

```text
Registro
   ↓
Crear negocio
   ↓
Elegir subdominio
   ↓
Seleccionar plantilla
   ↓
Configurar identidad
   ↓
Configurar WhatsApp
   ↓
Crear primer producto
   ↓
Subir fotografías
   ↓
Vista previa
   ↓
Publicar showroom
```

Este flujo deberá ser funcional de principio a fin antes de ampliar el producto.

---

# 7. Objetivo de onboarding

Un usuario sin conocimientos técnicos deberá poder publicar un showroom básico en:

**menos de 10 minutos**

si ya dispone de:

- nombre del negocio;
- logotipo;
- WhatsApp;
- fotografía de al menos un producto.

---

# 8. Registro

El MVP incluirá:

- registro mediante correo electrónico;
- contraseña;
- confirmación de contraseña;
- aceptación de términos;
- verificación de correo;
- login;
- logout;
- recuperación de contraseña.

---

# 9. Datos mínimos de registro

Se solicitarán únicamente los datos imprescindibles.

Ejemplo:

```text
Nombre
Apellidos
Correo electrónico
Contraseña
```

No deberán solicitarse datos empresariales durante el registro personal.

---

# 10. Creación del Tenant

Después del registro, el usuario podrá crear su espacio.

El sistema creará:

```text
Tenant
Membership OWNER
Subscription inicial
```

---

# 11. Creación del Business

Durante onboarding se solicitará:

- nombre comercial;
- descripción breve;
- tipo de negocio;
- ubicación básica;
- teléfono o WhatsApp.

No se deberá exigir información legal compleja durante el MVP.

---

# 12. Selección de subdominio

El usuario podrá seleccionar:

```text
minombre.dtodo537.net
```

El sistema deberá:

- sugerir slug;
- validar formato;
- comprobar disponibilidad;
- impedir palabras reservadas;
- gestionar concurrencia;
- mostrar inmediatamente la URL resultante.

---

# 13. Subdominio sugerido

Ejemplo:

```text
Nombre del negocio:
Muebles El Roble

Sugerencia:
muebles-el-roble.dtodo537.net
```

El usuario podrá modificarlo mientras esté disponible.

---

# 14. Plantillas del MVP

Se implementarán inicialmente **tres plantillas**.

## Minimal

Pensada para negocios generales.

Características:

- limpia;
- mucho espacio visual;
- producto como protagonista.

## Boutique

Pensada para:

- moda;
- belleza;
- artesanía;
- regalos.

## Comercial

Pensada para:

- tecnología;
- ferretería;
- electrodomésticos;
- comercios con catálogos amplios.

Tres plantillas serán suficientes para validar el sistema.

---

# 15. Personalización

El MVP permitirá:

- seleccionar plantilla;
- color principal;
- color secundario;
- logotipo;
- imagen de portada.

Opcional si existe tiempo:

- tipografía de una lista controlada.

No habrá editor visual libre.

---

# 16. Vista previa

Antes de publicar, el usuario deberá poder visualizar:

- portada;
- colores;
- logotipo;
- productos;
- versión móvil.

La preview no deberá indexarse.

---

# 17. Perfil del negocio

Cada Business podrá configurar:

- nombre;
- descripción;
- logo;
- portada;
- teléfono;
- WhatsApp;
- correo comercial;
- dirección;
- municipio;
- provincia;
- horarios;
- redes sociales.

---

# 18. Redes sociales MVP

Inicialmente:

```text
Facebook
Instagram
TikTok
Telegram
YouTube
```

y un campo opcional genérico:

```text
Otro enlace
```

---

# 19. Ubicación

Durante el MVP se almacenará:

- dirección textual;
- municipio;
- provincia;
- país.

Las coordenadas geográficas no serán obligatorias.

---

# 20. Mapas

La integración completa con mapas queda fuera del MVP inicial.

Podrá incorporarse posteriormente.

---

# 21. Categorías del negocio

El propietario podrá:

- crear;
- editar;
- ordenar;
- desactivar;
- eliminar lógicamente categorías.

Ejemplo:

```text
Electrodomésticos
Climatización
Cocina
Accesorios
```

---

# 22. Profundidad de categorías

Durante el MVP se recomienda:

**máximo dos niveles**

Ejemplo:

```text
Electrónica
   ├── Televisores
   └── Audio
```

Esto simplifica:

- UX;
- navegación;
- administración.

---

# 23. Producto

Cada producto deberá soportar:

- nombre;
- slug automático;
- categoría;
- descripción corta;
- descripción completa;
- precio;
- moneda;
- modalidad de precio;
- disponibilidad;
- imágenes;
- destacado;
- estado de publicación.

---

# 24. Modalidades de precio

MVP:

```text
Precio fijo
Desde
Consultar precio
Gratis
```

---

# 25. Monedas

La arquitectura soportará múltiples monedas.

Para la primera etapa deberán poder configurarse al menos:

```text
CUP
USD
EUR
```

sin impedir añadir otras.

---

# 26. Producto sin precio

Debe permitirse:

**Consultar precio**

Esto es importante para determinados negocios y servicios.

---

# 27. Disponibilidad

Estados MVP:

```text
Disponible
Agotado
Consultar disponibilidad
Próximamente
```

No existirá inventario numérico.

---

# 28. Publicación

Los productos tendrán:

```text
DRAFT
PUBLISHED
UNPUBLISHED
ARCHIVED
```

Crear un producto no debe publicarlo automáticamente.

---

# 29. Fotografías

Cada producto podrá tener varias imágenes.

Funciones MVP:

- carga múltiple;
- fotografía principal;
- cambiar orden;
- eliminar;
- optimización automática.

---

# 30. Límite de imágenes

Se definirá un límite inicial configurable.

Propuesta:

**máximo 3 imágenes por producto**

para el plan inicial del MVP.

---

# 31. Procesamiento

La plataforma deberá:

- validar;
- redimensionar;
- optimizar;
- generar variantes;
- eliminar metadata innecesaria.

El proceso podrá ejecutarse mediante worker.

---

# 32. Carga móvil

La experiencia de subida desde teléfono será requisito crítico.

Debe permitir:

```text
Añadir producto
→ Tomar foto
→ Subir
→ Precio
→ Publicar
```

con pocos pasos.

---

# 33. Atributos del producto

El MVP podrá permitir pares simples:

```text
Nombre → Valor
```

Ejemplo:

```text
Marca → Samsung
Modelo → A55
Color → Negro
```

No se implementará un sistema complejo de atributos por categoría.

---

# 34. Variantes

`ProductVariant` estará contemplado en el dominio, pero **queda fuera del MVP inicial**, salvo que durante beta se compruebe que es imprescindible.

No se implementarán inicialmente:

- tallas complejas;
- combinaciones;
- SKUs por variante;
- precios por variante.

---

# 35. Ofertas

El MVP incluirá ofertas simples.

El propietario podrá definir:

- precio normal;
- precio de oferta;
- fecha de inicio;
- fecha de fin.

---

# 36. Visualización de oferta

La interfaz podrá mostrar:

```text
45 000 CUP
35 000 CUP
```

con el precio anterior marcado visualmente.

---

# 37. Expiración

Cuando llegue `endAt`, la oferta dejará de mostrarse automáticamente.

---

# 38. Producto destacado

El propietario podrá marcar determinados productos como destacados dentro de su showroom.

Esto no implica destacarlos globalmente en `dtodo537.net`.

---

# 39. Showroom público

Cada showroom deberá incluir como mínimo:

- header;
- logotipo;
- portada;
- presentación del negocio;
- categorías;
- destacados;
- catálogo;
- ofertas;
- contacto;
- redes sociales;
- WhatsApp.

---

# 40. Home del showroom

La página principal deberá ser sencilla.

Ejemplo:

```text
Portada
↓
Negocio
↓
Productos destacados
↓
Categorías
↓
Ofertas
↓
Productos recientes
↓
Contacto
```

---

# 41. Ficha de producto

La ficha incluirá:

- nombre;
- fotografías;
- precio;
- disponibilidad;
- descripción;
- atributos;
- negocio;
- botón WhatsApp;
- botón compartir.

---

# 42. Acción principal

El CTA predominante será:

**Consultar por WhatsApp**

No:

**Comprar**

---

# 43. WhatsApp

El propietario configurará su número.

La plataforma generará automáticamente:

```text
https://wa.me/...
```

con mensaje contextual.

---

# 44. Mensaje contextual

Ejemplo:

```text
Hola. Estoy interesado en el producto Mesa Milano publicado en su showroom de dtodo537.net. ¿Podría darme más información?

https://muebles.dtodo537.net/productos/mesa-milano
```

---

# 45. Tracking WhatsApp

Antes de redirigir se registrará:

```text
WHATSAPP_CLICK
```

No se registrará ni leerá la conversación.

---

# 46. Portal general

`dtodo537.net` tendrá una página principal de descubrimiento.

Mínimo:

- buscador;
- categorías principales;
- negocios destacados administrativamente;
- productos recientes;
- ofertas;
- acceso a negocios.

---

# 47. Buscador global

Permitirá buscar:

- nombre del producto;
- descripción;
- negocio;
- categoría;
- etiquetas.

---

# 48. Resultados

Cada resultado mostrará:

- foto;
- producto;
- precio;
- negocio;
- disponibilidad;
- etiqueta de oferta cuando corresponda.

---

# 49. Destino de resultados

El resultado conducirá a la URL canónica del showroom.

Ejemplo:

```text
muebles.dtodo537.net/productos/mesa-milano
```

---

# 50. Filtros del MVP

Inicialmente:

- categoría;
- negocio;
- oferta;
- disponibilidad.

Si resulta sencillo:

- precio mínimo;
- precio máximo.

---

# 51. Ordenamiento

Inicialmente:

```text
Relevancia
Más recientes
Precio menor
Precio mayor
```

---

# 52. Categorías generales

La plataforma dispondrá de categorías de descubrimiento global.

Ejemplo:

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

Serán administradas globalmente.

---

# 53. Clasificación de productos

Un producto podrá asociarse a:

- categoría interna del negocio;
- categoría global.

Esto permitirá encontrarlo en el portal.

---

# 54. Negocios destacados

Durante el MVP serán seleccionados manualmente por administración.

No se implementará algoritmo comercial complejo.

---

# 55. Productos destacados globales

También podrán ser gestionados manualmente.

Esto permitirá experimentar con la home sin construir todavía un sistema publicitario.

---

# 56. SEO

El MVP deberá incluir SEO desde el inicio.

No se pospone.

---

# 57. SEO de negocio

Cada showroom deberá generar:

- title;
- description;
- canonical;
- Open Graph;
- sitemap.

---

# 58. SEO de producto

Cada ficha deberá incluir:

- title;
- meta description;
- canonical;
- imagen;
- Open Graph;
- Schema.org Product.

---

# 59. Schema.org

MVP:

```text
Organization / LocalBusiness
Product
Offer
BreadcrumbList
```

cuando corresponda.

---

# 60. Sitemap

Se generará:

- sitemap general;
- productos publicados;
- negocios publicados.

La estrategia exacta podrá simplificarse durante la primera implementación.

---

# 61. Compartir producto

Cada producto deberá poder compartirse mediante:

- copiar enlace;
- WhatsApp.

Opcional:

- Facebook;
- Telegram.

---

# 62. QR

El MVP incluirá:

- QR del showroom;
- QR de producto.

---

# 63. QR del showroom

El propietario podrá descargar un QR que apunte a:

```text
https://negocio.dtodo537.net
```

---

# 64. QR del producto

Apuntará a:

```text
https://negocio.dtodo537.net/productos/slug
```

---

# 65. QR tracking

Se recomienda que el QR utilice una URL intermedia propia si no complica significativamente el MVP.

Ejemplo:

```text
https://dtodo537.net/r/abc123
```

permitiendo registrar:

```text
QR_VISIT
```

---

# 66. Analítica del negocio

Dashboard básico:

```text
Visitas al showroom
Vistas de productos
Clics en WhatsApp
Producto más visto
Producto más consultado
```

---

# 67. Periodos

Inicialmente:

```text
Últimos 7 días
Últimos 30 días
```

---

# 68. Gráficos

Solo se utilizarán gráficos realmente útiles.

Ejemplo:

```text
Visitas por día
```

No se construirá un sistema de BI complejo.

---

# 69. Eventos analíticos MVP

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

# 70. Dashboard principal

Al entrar, el emprendedor debe encontrar acciones antes que estadísticas complejas.

Ejemplo:

```text
Añadir producto

Ver showroom

Crear oferta

Compartir showroom
```

y debajo:

```text
Visitas
Vistas
WhatsApp
```

---

# 71. Administración de productos

Funciones:

- listar;
- buscar;
- filtrar;
- crear;
- editar;
- publicar;
- despublicar;
- archivar.

---

# 72. Cambio rápido de precio

Debe existir una forma sencilla de modificar precio.

Idealmente:

```text
Productos
→ producto
→ cambiar precio
→ guardar
```

sin atravesar un formulario extenso.

---

# 73. Cambio rápido de disponibilidad

Igualmente:

```text
Disponible
Agotado
Consultar
```

debe ser una operación muy sencilla.

---

# 74. Administración del negocio

Permitirá editar:

- perfil;
- identidad visual;
- contactos;
- redes;
- horarios;
- showroom.

---

# 75. Usuarios del negocio

Para el MVP se implementará como mínimo:

- OWNER.

`BUSINESS_MANAGER` podrá incorporarse en el MVP si la implementación base de Membership ya lo hace sencillo.

No debe retrasar la beta inicial.

---

# 76. Invitaciones

Si se incorpora BUSINESS_MANAGER:

- propietario introduce email;
- se genera invitación;
- usuario acepta;
- recibe Membership.

---

# 77. Plan inicial

El MVP deberá soportar el concepto de SubscriptionPlan.

Sin embargo, no necesita cobrar automáticamente.

---

# 78. Plan gratuito beta

Se recomienda comenzar con:

```text
BETA
```

o:

```text
FREE
```

y asignarlo automáticamente.

---

# 79. Límites iniciales

Propuesta configurable:

```text
1 Business
100 productos
8 imágenes por producto
1 propietario
1 gestor adicional opcional
```

Durante beta pueden ser generosos.

---

# 80. Pagos por suscripción

Quedan fuera del MVP.

Los planes podrán asignarse manualmente desde administración.

---

# 81. Backoffice

`admin.dtodo537.net`

deberá permitir como mínimo:

- listar tenants;
- listar negocios;
- ver usuarios;
- suspender tenant;
- suspender negocio;
- administrar categorías globales;
- administrar plantillas;
- marcar negocios destacados;
- marcar productos destacados.

---

# 82. Vista administrativa

Debe mostrar:

- estado;
- fecha de registro;
- número de productos;
- subdominio;
- propietario;
- plan.

---

# 83. Moderación

El MVP utilizará moderación simple.

Un negocio podrá publicar normalmente una vez habilitado.

La plataforma podrá:

- suspender;
- despublicar;
- bloquear.

---

# 84. Aprobación previa

Se decidirá durante beta si todo negocio necesita aprobación manual.

Arquitectónicamente deberá soportarse.

Para facilitar crecimiento, la recomendación inicial es:

```text
Registro
→ onboarding
→ publicación
```

con capacidad administrativa de suspensión posterior.

---

# 85. Seguridad

Las siguientes funcionalidades son obligatorias en MVP:

- Argon2id;
- sesiones HttpOnly;
- autorización;
- TenantContext;
- aislamiento multi-tenant;
- validación;
- rate limiting;
- protección de uploads;
- TLS;
- security headers;
- audit básico.

---

# 86. Row Level Security

RLS deberá aplicarse al menos a las entidades tenant-aware críticas antes de producción.

---

# 87. Auditoría

Acciones mínimas:

```text
LOGIN_SUCCESS
LOGIN_FAILURE
BUSINESS_CREATED
BUSINESS_UPDATED
PRODUCT_CREATED
PRODUCT_PUBLISHED
PRODUCT_DELETED
SUBDOMAIN_CHANGED
TENANT_SUSPENDED
ROLE_CHANGED
```

---

# 88. Logs

Aplicación deberá producir logs estructurados con:

```text
requestId
tenantId
userId
module
status
duration
```

cuando corresponda.

---

# 89. Observabilidad

MVP productivo deberá tener:

- health check;
- logs;
- métricas básicas;
- alertas de disponibilidad.

---

# 90. Health endpoints

Ejemplo:

```text
/api/v1/health
/api/v1/health/ready
```

No deberán revelar detalles sensibles.

---

# 91. Responsive design

Toda la plataforma debe ser responsive.

Especial prioridad:

- showroom;
- producto;
- buscador;
- dashboard;
- carga de producto.

---

# 92. Mobile first

La creación de producto se probará específicamente en teléfono.

Este flujo es criterio de aceptación.

---

# 93. Accesibilidad

Objetivo mínimo:

- navegación por teclado;
- contraste correcto;
- labels;
- alt text;
- semántica HTML;
- estados de foco.

No debe tratarse como tarea final posterior.

---

# 94. Performance

Páginas públicas deberán ser rápidas incluso con conexiones limitadas.

Prioridad:

- Server Components;
- imágenes optimizadas;
- cache;
- poco JavaScript;
- paginación.

---

# 95. Objetivo de rendimiento

Como referencia para páginas públicas:

```text
LCP < 2.5 s
CLS < 0.1
INP < 200 ms
```

en condiciones razonables, buscando buena puntuación Core Web Vitals.

No se considerarán garantías contractuales del MVP.

---

# 96. Paginación

Catálogos, resultados y dashboards usarán paginación.

No se cargarán cientos de productos innecesariamente.

---

# 97. Estados vacíos

La UX deberá explicar qué hacer cuando no existen datos.

Ejemplo:

```text
Todavía no tienes productos.

Añade tu primer producto para comenzar a construir tu showroom.
```

---

# 98. Errores

Mensajes comprensibles.

No:

```text
PrismaClientKnownRequestError P2002
```

Sí:

```text
Ese subdominio ya está siendo utilizado.
Prueba con otro nombre.
```

---

# 99. Autosave

No será requisito del MVP.

Los formularios deberán evitar pérdida accidental cuando sea razonable.

---

# 100. Draft

Productos podrán guardarse como borrador.

Esto reduce necesidad de autosave inicial.

---

# 101. Preview

Producto DRAFT podrá verse mediante preview autenticada.

No deberá ser accesible públicamente sin control.

---

# 102. Emails del MVP

Como mínimo:

- verificar correo;
- recuperar contraseña;
- invitación, si se habilitan gestores.

No se implementarán campañas de marketing.

---

# 103. Notificaciones internas

Quedan fuera inicialmente.

---

# 104. Importación CSV/Excel

Fuera del MVP.

Se incorporará después de validar creación manual.

---

# 105. Dominio personalizado

Fuera del MVP.

Inicialmente todo negocio usará:

```text
*.dtodo537.net
```

---

# 106. PWA

Fuera del MVP.

---

# 107. App móvil nativa

Fuera del MVP.

La experiencia móvil será web responsive.

---

# 108. Carrito

Fuera del MVP.

---

# 109. Checkout

Fuera del MVP.

---

# 110. Pagos de productos

Fuera del MVP.

---

# 111. Pedidos

Fuera del MVP.

---

# 112. Facturación

Fuera del MVP.

---

# 113. Inventario

Fuera del MVP.

---

# 114. Delivery

Fuera del MVP.

---

# 115. Gestión logística

Fuera del MVP.

---

# 116. Chat interno

Fuera del MVP.

WhatsApp será el canal de comunicación inicial.

---

# 117. Reviews y valoraciones

Fuera del MVP.

No se implementarán:

- estrellas;
- comentarios;
- reputación.

---

# 118. Favoritos

Fuera del MVP inicial.

Podrá evaluarse después según comportamiento de usuarios.

---

# 119. Cuentas de consumidores

No serán necesarias en el MVP.

Los visitantes podrán descubrir y contactar sin registrarse.

Esto reduce fricción.

---

# 120. Comparador

Fuera del MVP.

Los usuarios podrán abrir varios resultados, pero no existirá herramienta formal de comparación.

---

# 121. Recomendaciones personalizadas

Fuera del MVP.

---

# 122. IA

Las funciones de IA quedan fuera del MVP inicial.

Ejemplos posteriores:

- redactar descripción;
- sugerir categorías;
- generar etiquetas;
- optimizar SEO;
- búsqueda semántica.

La arquitectura deberá permitir incorporarlas posteriormente.

---

# 123. API pública para terceros

Fuera del MVP.

---

# 124. Webhooks

Fuera del MVP.

---

# 125. Marketplace transaccional

Fuera del MVP.

`dtodo537.net` será un ecosistema de descubrimiento, no un intermediario de ventas.

---

# 126. Casos de uso críticos

El MVP no podrá considerarse terminado si fallan alguno de estos casos.

## UC-01

Registrar usuario.

## UC-02

Crear negocio.

## UC-03

Registrar subdominio.

## UC-04

Personalizar showroom.

## UC-05

Crear producto.

## UC-06

Subir fotografías.

## UC-07

Publicar producto.

## UC-08

Publicar showroom.

## UC-09

Abrir showroom público.

## UC-10

Buscar producto globalmente.

## UC-11

Abrir ficha de producto.

## UC-12

Contactar mediante WhatsApp.

## UC-13

Consultar estadísticas.

## UC-14

Suspender negocio desde administración.

---

# 127. Historia crítica 1

**Como emprendedor**, quiero crear un showroom sin conocimientos técnicos para publicar mis productos rápidamente.

Criterios:

- no necesito configurar DNS;
- no necesito tocar código;
- no necesito contratar hosting;
- puedo hacerlo desde móvil;
- obtengo una URL funcional.

---

# 128. Historia crítica 2

**Como emprendedor**, quiero publicar un producto con fotografía, precio y WhatsApp para comenzar a recibir consultas.

---

# 129. Historia crítica 3

**Como consumidor**, quiero buscar un producto en `dtodo537.net` para descubrir qué negocios lo ofrecen.

---

# 130. Historia crítica 4

**Como consumidor**, quiero contactar directamente con el negocio desde la ficha del producto.

---

# 131. Historia crítica 5

**Como propietario**, quiero saber qué productos generan mayor interés para decidir qué promocionar.

---

# 132. Historia crítica 6

**Como administrador**, quiero suspender un negocio problemático para impedir que continúe publicando contenido.

---

# 133. Criterio de éxito del onboarding

Durante pruebas beta:

Al menos el **80 %** de usuarios seleccionados deberá poder crear un showroom básico sin intervención técnica directa.

---

# 134. Criterio de éxito móvil

Un negocio deberá poder completar:

```text
crear producto
+
subir fotografía
+
poner precio
+
publicar
```

desde un teléfono.

---

# 135. Criterio de éxito de descubrimiento

Una búsqueda razonable deberá devolver productos relevantes de diferentes negocios cuando existan.

---

# 136. Criterio de éxito de contacto

Los clics WhatsApp deberán:

- registrarse;
- abrir correctamente WhatsApp;
- contener contexto del producto.

---

# 137. Criterio de aislamiento

Pruebas cross-tenant:

**100 % deben pasar.**

No se aceptará ningún fallo conocido de aislamiento para release.

---

# 138. Criterio de seguridad

No podrán existir vulnerabilidades conocidas:

```text
CRITICAL
```

o:

```text
HIGH explotables
```

sin mitigación antes de producción.

---

# 139. Criterio SEO

Los showrooms y productos publicados deberán:

- producir metadata;
- ser indexables;
- disponer de canonical;
- renderizar correctamente Open Graph.

---

# 140. Criterio de disponibilidad

El MVP productivo deberá tener health monitoring y recuperación documentada.

No se establece todavía un SLA contractual.

---

# 141. Beta cerrada

Antes del lanzamiento público se realizará una beta con negocios reales.

Propuesta:

```text
10–20 negocios
```

de diferentes sectores.

---

# 142. Sectores de beta

Conviene incluir variedad:

- gastronomía;
- moda;
- tecnología;
- hogar;
- servicios;
- artesanía.

Esto permitirá comprobar si las plantillas y modelo de producto son suficientemente generales.

---

# 143. Datos a observar durante beta

```text
Tiempo de onboarding
Productos creados
Fotografías por producto
Cambios de precio
Búsquedas
Visitas
WhatsApp clicks
Errores
Abandonos
Soporte requerido
```

---

# 144. Feedback cualitativo

Preguntas principales:

```text
¿Qué fue difícil?
¿Qué esperabas encontrar y no estaba?
¿Qué paso parecía innecesario?
¿Pudiste hacerlo desde el teléfono?
¿Te sería útil utilizarlo de manera permanente?
```

---

# 145. Métrica North Star inicial

Una métrica interesante será:

**Contactos generados hacia negocios a partir de productos descubiertos en la plataforma.**

Proxy inicial:

```text
WHATSAPP_CLICK
```

---

# 146. Métricas de producto

## Supply

```text
Negocios activos
Productos publicados
Ofertas activas
```

## Demand

```text
Visitantes
Búsquedas
ProductViews
```

## Conversion

```text
WhatsAppClick / ProductView
```

---

# 147. Métrica de activación

Un negocio se considerará activado cuando haya:

```text
showroom publicado
+
al menos 3 productos publicados
+
WhatsApp configurado
```

El valor exacto podrá ajustarse durante beta.

---

# 148. Retención

Posteriormente se medirá:

```text
negocios que vuelven y actualizan productos/precios
```

porque la utilidad real depende de mantener el catálogo actualizado.

---

# 149. Freshness

Se recomienda registrar:

```text
Product.updatedAt
Business.lastActivityAt
```

para poder estudiar posteriormente frescura del catálogo.

---

# 150. Producto desactualizado

No se implementará lógica automática de expiración en MVP.

Pero la arquitectura permitirá recordar al negocio posteriormente:

```text
Hace 60 días que no actualizas este producto.
```

---

# 151. Feature flags

Funciones no completamente maduras podrán habilitarse para determinados tenants beta.

Ejemplo:

```text
ENABLE_QR_TRACKING
ENABLE_MANAGER_USERS
```

---

# 152. Definición de Done funcional

Una funcionalidad se considera terminada cuando:

- backend implementado;
- frontend implementado;
- validaciones;
- autorización;
- multi-tenancy;
- manejo de errores;
- tests;
- responsive;
- documentación mínima.

---

# 153. Definition of Done de seguridad

Además:

- no secretos;
- TenantContext correcto;
- permisos;
- validación;
- tests negativos;
- logging seguro.

---

# 154. Definition of Done de UI

Además:

- móvil;
- desktop;
- loading;
- empty state;
- error state;
- accesibilidad básica.

---

# 155. Prioridades MoSCoW

## MUST

- autenticación;
- tenant;
- negocio;
- subdominio;
- showroom;
- theme;
- producto;
- imagen;
- precio;
- WhatsApp;
- búsqueda;
- portal global;
- seguridad;
- administración mínima.

## SHOULD

- ofertas;
- QR;
- analítica;
- categorías globales;
- SEO estructurado;
- gestores adicionales.

## COULD

- filtros avanzados;
- social sharing adicional;
- tracking QR avanzado.

## WON'T — MVP

- pagos;
- pedidos;
- inventario;
- app móvil;
- dominios personalizados;
- IA;
- API pública.

---

# 156. MVP mínimo ejecutable

Si fuera necesario reducir alcance para llegar a beta, nunca se eliminarán:

```text
Tenant
Business
Showroom
Product
Image
Price
WhatsApp
Portal
Search
Security
```

---

# 157. Elementos reducibles

Si fuese necesario recortar:

```text
ProductVariant
Gestores múltiples
QR tracking
Filtros avanzados
Analítica gráfica
Oferta programada compleja
```

---

# 158. No comprometer arquitectura por velocidad

Reducir una funcionalidad no significa eliminar sus límites conceptuales.

Ejemplo:

Aunque Subscription no cobre automáticamente, el modelo seguirá existiendo.

Aunque solo exista un Business por Tenant en beta, la relación seguirá siendo 1:N.

---

# 159. Dependencias críticas

Antes del desarrollo funcional deben estar operativos:

```text
Next.js
NestJS
PostgreSQL
Redis
Object Storage
TenantContext
Authentication
```

---

# 160. Orden funcional del MVP

Secuencia recomendada:

```text
Foundation
  ↓
Authentication
  ↓
Tenant
  ↓
Business
  ↓
Showroom
  ↓
Theme
  ↓
Product
  ↓
Media
  ↓
Publication
  ↓
WhatsApp
  ↓
Portal
  ↓
Search
  ↓
Analytics
  ↓
Admin
  ↓
Beta
```

---

# 161. Hito MVP-0 — Foundation

Debe incluir:

- monorepo;
- CI;
- environments;
- DB;
- Redis;
- logging;
- API;
- web;
- health.

---

# 162. Hito MVP-1 — Identity

- register;
- verify email;
- login;
- logout;
- recovery;
- secure sessions.

---

# 163. Hito MVP-2 — Tenant & Business

- tenant;
- membership;
- business;
- subdomain;
- TenantContext.

---

# 164. Hito MVP-3 — Showroom

- theme;
- ThemeConfiguration;
- perfil;
- portada;
- contactos;
- redes.

---

# 165. Hito MVP-4 — Catalog

- categorías;
- productos;
- imágenes;
- precios;
- disponibilidad;
- publicación.

---

# 166. Hito MVP-5 — Conversion

- WhatsApp;
- tracking;
- share;
- QR básico.

---

# 167. Hito MVP-6 — Discovery

- portal general;
- categorías globales;
- search;
- ofertas;
- destacados.

---

# 168. Hito MVP-7 — Analytics & Admin

- estadísticas;
- backoffice;
- suspensión;
- auditoría.

---

# 169. Hito MVP-8 — Hardening

- security tests;
- multi-tenant tests;
- performance;
- SEO;
- accessibility;
- backup/restore.

---

# 170. Hito MVP-9 — Beta

- negocios reales;
- feedback;
- correcciones;
- decisión sobre lanzamiento.

---

# 171. Lo que no debe hacer Codex

Durante implementación Codex no deberá:

- introducir microservicios;
- cambiar stack;
- sustituir PostgreSQL;
- cambiar NestJS;
- añadir Docker/Kubernetes;
- convertir el producto en e-commerce;
- introducir pagos;
- modificar el modelo multi-tenant;
- añadir un constructor HTML libre;
- alterar estructura de repositorios sin aprobación.

---

# 172. Regla de control de alcance

Ante cualquier funcionalidad nueva se preguntará:

```text
¿Es necesaria para validar el MVP?
```

Si la respuesta es no:

```text
POST-MVP
```

---

# 173. Regla de simplicidad

Ante dos soluciones funcionalmente válidas, se priorizará la que haga más sencilla la experiencia del emprendedor.

---

# 174. Regla de descubrimiento

El portal global no será considerado funcionalmente secundario.

Es parte del MVP porque constituye uno de los elementos diferenciadores de `dtodo537.net`.

---

# 175. Regla de WhatsApp

WhatsApp tampoco será tratado como integración posterior.

Forma parte del ciclo principal:

```text
Descubrir
→ Ver
→ Contactar
```

---

# 176. Regla de SEO

SEO no será una tarea posterior al lanzamiento.

El carácter público del catálogo exige diseñarlo desde el inicio.

---

# 177. Regla de datos

Todo elemento público deberá tener un propietario inequívoco:

```text
Tenant
→ Business
→ Showroom/Product
```

---

# 178. Regla de calidad

No se considerará funcional una pantalla que solo trabaje en desktop.

Móvil forma parte del MVP.

---

# 179. Regla de beta

No se abrirá registro público masivo antes de realizar pruebas con negocios reales.

---

# 180. Resultado esperado

Al completar este MVP deberá existir una experiencia completa como la siguiente:

```text
Emprendedor
    │
    ▼
dtodo537.net
    │
    ▼
Crear cuenta
    │
    ▼
Crear negocio
    │
    ▼
muebles-el-roble.dtodo537.net
    │
    ▼
Elegir plantilla
    │
    ▼
Añadir productos
    │
    ▼
Publicar
```

Mientras un consumidor podrá:

```text
Consumidor
    │
    ▼
dtodo537.net
    │
    ▼
Buscar "mesa comedor"
    │
    ▼
Ver resultados de varios negocios
    │
    ▼
Abrir Mesa Milano
    │
    ▼
muebles-el-roble.dtodo537.net/productos/mesa-milano
    │
    ▼
Consultar por WhatsApp
```

Si ambos recorridos funcionan de forma sencilla, rápida y segura, el MVP habrá cumplido su propósito.

---

# 181. Decisiones cerradas del MVP

### MVP-001

El portal general de descubrimiento forma parte del MVP.

### MVP-002

Cada negocio tendrá un showroom mediante `*.dtodo537.net`.

### MVP-003

El MVP utilizará tres plantillas iniciales.

### MVP-004

WhatsApp será el CTA comercial principal.

### MVP-005

No habrá transacciones comerciales dentro de la plataforma.

### MVP-006

No habrá cuentas obligatorias para consumidores.

### MVP-007

No habrá gestión de inventario.

### MVP-008

No habrá dominio personalizado durante el MVP.

### MVP-009

SEO será obligatorio desde la primera versión.

### MVP-010

El producto deberá poder administrarse desde teléfono.

### MVP-011

La beta se realizará con negocios reales antes del lanzamiento abierto.

### MVP-012

El portal global y los showrooms usarán la misma plataforma multi-tenant.

### MVP-013

Los planes existirán conceptualmente, pero no habrá cobro automatizado en el MVP.

### MVP-014

La seguridad multi-tenant es criterio de release, no funcionalidad posterior.

---

# 182. Principio final

El MVP deberá demostrar una idea sencilla:

> **Un emprendedor puede tener un showroom profesional sin saber crear sitios web, y un consumidor puede descubrir sus productos sin conocer previamente el negocio.**

Si una funcionalidad no contribuye directamente a validar esa idea, deberá esperar a una etapa posterior.