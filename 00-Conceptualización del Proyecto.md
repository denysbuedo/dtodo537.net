# Plataforma Digital de Showrooms Comerciales Multi-Negocio

**Documento de conceptualización**  
**Versión:** 0.1  
**Dominio previsto:** `dtodo537.net`  
**Nombre comercial:** Por definir  
**Estado:** Conceptualización inicial

---

## 1. Resumen ejecutivo

Se propone desarrollar una plataforma digital multi-negocio orientada a emprendedores, trabajadores por cuenta propia, pequeñas y medianas empresas y otros negocios que necesiten disponer de una presencia comercial profesional en Internet sin asumir la complejidad de desarrollar y mantener una tienda electrónica.

La plataforma permitirá que cada negocio disponga de su propio **showroom digital**, accesible mediante un subdominio independiente dentro de `dtodo537.net`, con identidad visual personalizada, catálogo de productos, fotografías, precios, ofertas, información comercial, ubicación, contactos, redes sociales y comunicación directa mediante WhatsApp.

Ejemplos:

`mueblesxyz.dtodo537.net`

`tecnocaribe.dtodo537.net`

`dulcesana.dtodo537.net`

La solución **no funcionará inicialmente como una tienda electrónica**. No gestionará pagos, carrito de compra, pedidos, facturación ni logística.

Su objetivo será conectar digitalmente la oferta de los negocios con potenciales clientes.

La plataforma contará además con un portal general:

`dtodo537.net`

Este portal funcionará como espacio de **descubrimiento comercial**, permitiendo encontrar negocios, productos, categorías, novedades y ofertas publicadas por todos los showrooms alojados en la plataforma.

De esta manera, la solución combina dos propuestas de valor:

1. proporcionar a cada negocio un showroom digital profesional;
2. construir un espacio común donde los consumidores puedan descubrir ofertas de múltiples negocios.

---

# 2. Problema que se pretende resolver

Muchos pequeños negocios utilizan actualmente redes sociales y aplicaciones de mensajería como principal mecanismo para mostrar sus productos.

Aunque estas herramientas facilitan la comunicación, presentan limitaciones para mantener un catálogo comercial organizado.

Entre los principales problemas se encuentran:

- productos dispersos entre publicaciones;
- dificultad para mantener precios actualizados;
- dificultad para organizar productos por categorías;
- poca capacidad de búsqueda;
- información comercial fragmentada;
- dependencia de una red social determinada;
- dificultad para compartir directamente un producto;
- poca presencia en buscadores;
- ausencia de estadísticas comerciales propias;
- necesidad de conocimientos técnicos para crear un sitio web profesional;
- costos y complejidad innecesarios asociados a plataformas completas de comercio electrónico.

Muchos negocios no necesitan inicialmente una tienda electrónica.

Necesitan fundamentalmente:

**mostrar, organizar, promocionar, ser encontrados y recibir consultas.**

La plataforma propuesta pretende cubrir precisamente ese espacio.

---

# 3. Visión del producto

Crear una plataforma digital sencilla que permita a cualquier negocio disponer de un showroom comercial profesional en pocos minutos, sin conocimientos técnicos, y al mismo tiempo formar parte de un ecosistema común donde sus productos y ofertas puedan ser descubiertos por nuevos clientes.

La visión puede resumirse mediante:

**Publica. Muestra. Descubre. Contacta.**

---

# 4. Principios del producto

## 4.1. Simplicidad

La plataforma debe poder ser utilizada por personas sin conocimientos de desarrollo web.

El usuario no construirá páginas.

El usuario:

1. registra su negocio;
2. selecciona una plantilla;
3. selecciona colores;
4. carga su logotipo;
5. completa sus datos;
6. crea categorías;
7. publica productos;
8. publica su showroom.

La complejidad tecnológica debe permanecer completamente oculta.

---

## 4.2. Showroom, no e-commerce

La plataforma no procesará inicialmente transacciones comerciales.

No se implementarán en el MVP:

- carrito;
- pasarela de pago;
- pedidos;
- facturación;
- logística;
- envíos;
- control avanzado de inventario.

La negociación y eventual transacción se realizará directamente entre cliente y negocio.

---

## 4.3. Identidad propia para cada negocio

Aunque todos los negocios utilicen una misma plataforma tecnológica, cada uno deberá percibirse como un espacio comercial independiente.

Cada showroom podrá disponer de:

- subdominio;
- logotipo;
- colores corporativos;
- imágenes de portada;
- plantilla visual;
- datos comerciales;
- redes sociales;
- WhatsApp;
- catálogo propio.

---

## 4.4. Diseño controlado mediante plantillas

No se implementará un constructor web libre.

La plataforma ofrecerá un conjunto limitado de plantillas profesionales optimizadas para diferentes tipos de negocios.

Ejemplos:

- Minimalista;
- Boutique;
- Moda;
- Gastronomía;
- Tecnología;
- Hogar;
- Industrial;
- Clásica.

Cada plantilla permitirá personalizar determinados elementos:

- logotipo;
- color principal;
- color secundario;
- imagen de portada;
- distribución de determinadas secciones;
- tipografía dentro de un catálogo permitido.

Esto permitirá mantener calidad visual, accesibilidad, seguridad, rendimiento y compatibilidad móvil.

---

# 5. Modelo funcional

La plataforma tendrá dos grandes espacios.

## 5.1. Portal general

Disponible en:

`dtodo537.net`

Será el punto central de descubrimiento.

Permitirá visualizar y buscar:

- negocios;
- productos;
- categorías;
- ofertas;
- productos destacados;
- negocios destacados;
- productos recientemente publicados;
- tendencias;
- negocios por categoría;
- eventualmente negocios por ubicación.

Un usuario podría buscar:

**aire acondicionado**

y obtener resultados pertenecientes a diferentes negocios.

Cada resultado conducirá al showroom correspondiente.

Ejemplo:

`climacaribe.dtodo537.net/productos/split-midea-12000`

---

## 5.2. Showroom del negocio

Cada negocio tendrá su espacio independiente.

Ejemplo:

`climacaribe.dtodo537.net`

El showroom incluirá como mínimo:

- portada;
- información del negocio;
- catálogo;
- categorías;
- productos;
- ofertas;
- productos destacados;
- contacto;
- WhatsApp;
- redes sociales;
- ubicación;
- horarios.

---

# 6. Catálogo de productos

Cada producto podrá contener:

- nombre;
- slug;
- descripción corta;
- descripción completa;
- categoría;
- precio;
- precio anterior;
- moneda;
- estado;
- etiquetas;
- características;
- fotografía principal;
- galería de fotografías;
- condición de oferta;
- condición de destacado;
- disponibilidad;
- información adicional.

Estados iniciales:

- Disponible;
- Agotado;
- Consultar disponibilidad.

La plataforma deberá admitir productos sin precio visible cuando el negocio decida utilizar:

**Consultar precio**

---

# 7. WhatsApp como canal de conversión

WhatsApp será considerado un componente funcional del producto y no simplemente una red social adicional.

Cada producto podrá disponer de una acción:

**Consultar por WhatsApp**

Al seleccionarla, la plataforma generará un mensaje contextual.

Ejemplo:

> Hola. Estoy interesado en el producto Split Midea 12 000 BTU publicado en su showroom. ¿Podría darme más información?

El mensaje podrá incluir automáticamente el enlace al producto.

Antes de realizar la redirección hacia WhatsApp, la plataforma podrá registrar el evento.

Esto permitirá generar indicadores como:

- visualizaciones del producto;
- clics hacia WhatsApp;
- productos más consultados;
- productos con mayor conversión;
- origen de determinadas consultas.

La plataforma no necesita acceder al contenido de la conversación de WhatsApp.

---

# 8. Descubrimiento comercial

El portal general constituye una de las principales ventajas competitivas del proyecto.

Un negocio no obtiene solamente una página web.

Obtiene presencia dentro de un ecosistema comercial.

El usuario podrá navegar desde dos perspectivas:

### Desde el negocio

`negocio.dtodo537.net`

### Desde el producto

`dtodo537.net/buscar?q=cafetera`

Esto permitirá descubrir productos pertenecientes a negocios que el consumidor desconocía previamente.

La plataforma evoluciona así desde un sistema de creación de catálogos hacia un **motor de descubrimiento de oferta comercial**.

---

# 9. Buscador

El buscador será un componente fundamental.

Inicialmente deberá permitir buscar por:

- nombre de producto;
- descripción;
- categoría;
- etiquetas;
- nombre del negocio.

Posteriormente podrá incorporar:

- ubicación;
- rango de precios;
- disponibilidad;
- ofertas;
- popularidad;
- relevancia;
- búsqueda semántica.

La arquitectura deberá permitir evolucionar posteriormente hacia motores especializados de búsqueda sin que esto sea necesario para el MVP.

---

# 10. Código QR

Cada negocio dispondrá automáticamente de un código QR asociado a su showroom.

Ejemplo:

`dtodo537.net → QR → negocio.dtodo537.net`

También podrán generarse códigos QR para productos específicos.

Esto permitirá utilizar el showroom digital en:

- establecimientos físicos;
- ferias;
- exposiciones;
- tarjetas de presentación;
- carteles;
- etiquetas;
- materiales promocionales;
- catálogos impresos.

---

# 11. Panel de administración del negocio

Cada negocio dispondrá de un panel extremadamente sencillo.

Estructura conceptual:

**Inicio**

**Mi negocio**

**Productos**

**Categorías**

**Ofertas**

**Diseño**

**Imágenes**

**Contactos**

**Redes sociales**

**WhatsApp**

**Estadísticas**

**Usuarios**

**Configuración**

El dashboard inicial deberá priorizar acciones y no configuraciones técnicas.

Ejemplo:

**Añadir producto**

**Crear oferta**

**Cambiar portada**

**Ver mi showroom**

**Compartir showroom**

---

# 12. Onboarding

El onboarding debe ser uno de los componentes mejor diseñados de la solución.

Objetivo:

**crear un showroom funcional en menos de 10 minutos.**

Flujo:

Registro

→ Crear negocio

→ Nombre del negocio

→ Seleccionar subdominio

→ Seleccionar tipo de negocio

→ Seleccionar plantilla

→ Subir logotipo

→ Seleccionar colores

→ Configurar WhatsApp

→ Añadir primer producto

→ Vista previa

→ Publicar

El usuario nunca deberá enfrentarse a conceptos como:

- DNS;
- hosting;
- base de datos;
- HTML;
- CSS;
- SSL;
- SEO técnico.

---

# 13. Arquitectura tecnológica conceptual

La plataforma se desarrollará como una aplicación **SaaS multi-tenant**.

No existirá una instalación independiente por negocio.

Arquitectura conceptual:

```text
                         INTERNET
                             │
                             ▼
                       dtodo537.net
                             │
                 ┌───────────┴───────────┐
                 │                       │
          Portal general          *.dtodo537.net
                 │                       │
                 └───────────┬───────────┘
                             │
                         Frontend
                         Next.js
                             │
                             ▼
                      Tenant Resolver
                             │
                             ▼
                           API
                             │
             ┌───────────────┼───────────────┐
             │               │               │
             ▼               ▼               ▼
        PostgreSQL         Redis        Object Storage
                                           │
                                           ▼
                                        Imágenes
```

---

# 14. Frontend

Se adopta **Next.js con TypeScript** como tecnología principal de frontend.

Su utilización permitirá:

- renderizado optimizado;
- buen rendimiento;
- SEO;
- generación de páginas públicas;
- optimización de imágenes;
- rutas dinámicas;
- soporte adecuado para Server Side Rendering;
- integración con APIs;
- reutilización de componentes;
- desarrollo responsive.

El SEO constituye un requisito relevante porque productos y negocios deberán poder ser encontrados desde buscadores externos.

---

# 15. Backend

El backend deberá exponer una API independiente del frontend.

Tecnologías candidatas:

- NestJS;
- FastAPI.

La selección definitiva se realizará durante el diseño de arquitectura.

El backend gestionará:

- autenticación;
- autorización;
- tenants;
- usuarios;
- negocios;
- productos;
- categorías;
- imágenes;
- configuración;
- plantillas;
- eventos;
- analítica;
- administración.

---

# 16. Base de datos

Se utilizará PostgreSQL.

El modelo inicial será multi-tenant mediante base de datos compartida.

Las entidades dependientes del negocio contendrán:

`tenant_id`

Ejemplo conceptual:

```text
Tenant
 ├── Users
 ├── BusinessProfile
 ├── Categories
 ├── Products
 │    ├── ProductImages
 │    ├── ProductAttributes
 │    └── ProductVariants
 ├── SocialNetworks
 ├── Locations
 ├── ThemeConfiguration
 └── Analytics
```

La arquitectura deberá garantizar aislamiento lógico estricto entre tenants.

Un usuario perteneciente a un negocio nunca podrá acceder a información privada de otro negocio.

---

# 17. Resolución de tenants

El subdominio determinará el negocio solicitado.

Ejemplo:

`muebles.dtodo537.net`

El sistema resolverá:

`subdomain = muebles`

y determinará:

`tenant = negocio correspondiente`

Posteriormente cargará:

- identidad visual;
- configuración;
- productos;
- categorías;
- contactos;
- redes;
- plantilla.

Se configurará DNS wildcard:

`*.dtodo537.net`

y certificado TLS compatible con los subdominios.

---

# 18. Gestión de imágenes

Las imágenes constituyen uno de los elementos fundamentales de la plataforma.

No deberán almacenarse directamente como objetos binarios en PostgreSQL.

Se utilizará almacenamiento de objetos compatible con S3.

La plataforma deberá realizar:

- validación;
- redimensionamiento;
- optimización;
- generación de miniaturas;
- formatos web optimizados;
- eliminación controlada;
- límites según plan.

La carga de imágenes debe ser extremadamente sencilla desde dispositivos móviles.

---

# 19. Personalización visual

La personalización utilizará un sistema basado en:

**Theme + ThemeConfiguration**

Una plantilla definirá la estructura.

La configuración del negocio definirá variables como:

```text
primaryColor
secondaryColor
logo
coverImage
fontFamily
borderStyle
productCardStyle
```

No se almacenará código HTML/CSS proporcionado libremente por el usuario.

---

# 20. Analítica

Desde la primera versión se registrarán eventos básicos.

Como mínimo:

- visita al showroom;
- visualización de producto;
- clic en WhatsApp;
- clic en teléfono;
- clic en red social;
- producto compartido.

Esto permitirá mostrar indicadores básicos al negocio.

Ejemplo:

```text
Visitas al showroom            4 521
Productos visualizados         8 740
Consultas por WhatsApp           327
Producto más consultado        Cafetera X
```

Esta información puede convertirse posteriormente en un elemento diferenciador de los planes comerciales.

---

# 21. Modelo SaaS

La arquitectura deberá permitir establecer diferentes planes.

Conceptualmente:

### Plan inicial

- subdominio;
- catálogo limitado;
- plantilla básica;
- WhatsApp;
- redes sociales.

### Plan profesional

- mayor cantidad de productos;
- más plantillas;
- estadísticas;
- ofertas;
- QR;
- mayor almacenamiento.

### Plan avanzado

- dominio personalizado;
- múltiples usuarios;
- analítica avanzada;
- mayor personalización;
- posicionamiento comercial.

Los límites definitivos se determinarán posteriormente.

El sistema deberá estar preparado para planes y suscripciones aunque la monetización no forme necesariamente parte del primer MVP.

---

# 22. Roles

Inicialmente se contemplan:

### Administrador de plataforma

Gestiona toda la solución.

### Propietario del negocio

Administra completamente su showroom.

### Gestor del negocio

Puede administrar determinados elementos según permisos.

### Visitante

Consulta información pública.

La arquitectura deberá permitir evolucionar hacia un modelo RBAC más granular.

---

# 23. Administración global

La plataforma necesitará un backoffice independiente para gestionar:

- negocios;
- usuarios;
- productos reportados;
- categorías generales;
- planes;
- suscripciones;
- plantillas;
- estadísticas globales;
- contenidos;
- moderación;
- configuración;
- auditoría.

---

# 24. Seguridad

Desde la primera versión deberán considerarse:

- aislamiento multi-tenant;
- autenticación segura;
- autorización;
- RBAC;
- validación de archivos;
- protección contra carga maliciosa;
- rate limiting;
- protección contra abuso;
- auditoría;
- gestión segura de secretos;
- headers de seguridad;
- CSP;
- protección CSRF cuando corresponda;
- validación de entradas;
- protección contra inyección;
- registro de eventos administrativos.

La seguridad multi-tenant será un requisito crítico.

---

# 25. SEO

Cada negocio y producto deberá generar metadatos adecuados.

Se contemplarán:

- title;
- description;
- Open Graph;
- sitemap;
- robots;
- canonical URL;
- datos estructurados;
- URLs amigables;
- imágenes optimizadas.

Ejemplo:

`mueblesxyz.dtodo537.net/productos/mesa-comedor-milano`

Los enlaces deberán poder compartirse correctamente mediante WhatsApp y redes sociales mostrando fotografía, nombre y descripción del producto.

---

# 26. Diseño responsive

La plataforma será diseñada bajo un enfoque **mobile first**.

Esto resulta especialmente importante tanto para clientes como para emprendedores.

Las operaciones fundamentales deberán poder realizarse cómodamente desde un teléfono:

- crear producto;
- tomar/subir fotografía;
- modificar precio;
- activar oferta;
- cambiar disponibilidad;
- compartir producto;
- consultar estadísticas.

---

# 27. MVP

La primera versión deberá concentrarse en validar el concepto.

Incluye:

- registro;
- autenticación;
- creación de negocio;
- multi-tenancy;
- subdominios;
- perfil comercial;
- plantillas;
- personalización básica;
- categorías;
- productos;
- fotografías;
- precios;
- ofertas;
- disponibilidad;
- WhatsApp;
- redes sociales;
- portal general;
- buscador;
- productos destacados;
- negocios destacados;
- QR;
- estadísticas básicas;
- administración global;
- responsive design;
- SEO.

---

# 28. Fuera del MVP

Se excluyen inicialmente:

- carrito de compras;
- pagos electrónicos;
- procesamiento de pedidos;
- facturación;
- logística;
- delivery;
- integración con transportistas;
- ERP;
- contabilidad;
- gestión avanzada de inventario;
- chat interno;
- marketplace transaccional.

Estas funcionalidades solamente se evaluarán posteriormente si existe una necesidad real de negocio.

---

# 29. Evolución futura

La arquitectura deberá permitir incorporar posteriormente:

### Dominios personalizados

`www.negocio.com`

### Geolocalización

Descubrimiento de ofertas cercanas.

### Analítica avanzada

Tendencias, productos, conversiones y comportamiento.

### Recomendaciones

Productos relacionados y descubrimiento personalizado.

### Búsqueda semántica

Consultas naturales como:

“Busco una mesa de madera para seis personas.”

### Asistencia mediante IA

Generación asistida de:

- descripciones;
- etiquetas;
- títulos;
- publicaciones;
- optimización de fotografías.

### Importación masiva

Excel/CSV.

### Integraciones

APIs externas y sistemas empresariales.

---

# 30. Criterio fundamental de desarrollo

Toda decisión funcional y tecnológica deberá responder a una pregunta:

**¿Esto hace más sencillo que un emprendedor publique y mantenga su negocio?**

Si una funcionalidad introduce complejidad significativa sin aportar valor inmediato, deberá posponerse.

La plataforma deberá ocultar su complejidad tecnológica y ofrecer una experiencia similar a gestionar una red social.

Crear un producto deberá ser casi tan sencillo como crear una publicación.

---

# 31. Propuesta de valor

## Para el negocio

**Tu negocio en Internet sin tener que construir una tienda online.**

Obtiene:

- presencia digital;
- catálogo profesional;
- identidad propia;
- subdominio;
- fotografías;
- precios;
- ofertas;
- posicionamiento;
- WhatsApp;
- estadísticas;
- descubrimiento de nuevos clientes.

## Para el consumidor

**Un lugar donde descubrir qué están ofreciendo diferentes negocios.**

Puede:

- buscar;
- descubrir;
- comparar;
- consultar;
- contactar directamente.

---

# 32. Definición conceptual

La solución se define como:

> **Plataforma SaaS multi-tenant de showrooms y catálogos comerciales digitales que permite a negocios publicar y gestionar su oferta mediante espacios personalizados, mientras proporciona un portal común para el descubrimiento de productos, ofertas y negocios, facilitando el contacto directo entre consumidores y vendedores sin intervenir inicialmente en la transacción comercial.**

---

# 33. Principio rector

**La plataforma no vende productos.**

**La plataforma hace visibles los productos y conecta al cliente con quien los vende.**

Este principio deberá mantenerse como referencia durante el diseño del MVP.