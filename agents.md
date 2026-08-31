# AGENTS.MD - Estado del Proyecto Huellitas & Cía

## 📌 Resumen General
**Huellitas & Cía** es una aplicación web de e-commerce de pet shop desarrollada con React (Vite) en el frontend y Node.js + Express + SQLite en el backend. 

---

## 🛠️ Stack Tecnológico

- **Frontend**:
  - React 19 + Vite
  - Tailwind CSS v4 (`@tailwindcss/vite` nativo)
  - React Router DOM v7
  - Lucide React (Iconos)
  - `ClientAuthContext` (Sesión JWT única persistida en `localStorage`, con rol)
  - `CartContext` (Carrito persistido en `localStorage`)
- **Backend**:
  - Node.js (ES Modules `"type": "module"`)
  - Express.js (Puerto `5000`)
  - CORS habilitado
  - SQLite3 (`server/database.db`) con queries portables a MySQL
- **Servidores Dev**:
  - Frontend: `http://localhost:5173/`
  - Backend: `http://localhost:5000/`

---

## 🗄️ Estructura de la Base de Datos (SQLite / MySQL Compatible)

1. **`categorias`**: `id` (PK AUTO), `nombre` (UNIQUE)
2. **`productos`**: `id` (PK AUTO), `nombre`, `descripcion`, `precio`, `stock`, `categoria`, `imagen_url`, `activo`, `destacado`, `orden` (INTEGER)
3. **`clientes`**: `id` (PK AUTO), `nombre`, `email` (UNIQUE), `password_hash`, `rol` (`cliente` | `admin`), `fecha_registro`
4. **`pedidos`**: `id` (PK AUTO), `cliente_id`, `fecha`, `total`, `estado` (`pendiente` | `enviado` | `completado`)
5. **`pedido_items`**: `id` (PK AUTO), `pedido_id`, `producto_id`, `oferta_id` (nullable), `cantidad`, `precio_unitario`
6. **`mensajes`**: `id` (PK AUTO), `pedido_id`, `remitente` (`cliente` | `admin`), `contenido`, `fecha`, `leido`, `hilo_id`, `tipo` (`mensaje` | `sistema`), `cerrado`
7. **`ofertas`**: `id` (PK AUTO), `nombre`, `producto_ids` (JSON Array), `descuento_o_precio_paquete`, `tipo_descuento` (`'precio_paquete'` | `'porcentaje'`), `prioridad`, `activa`, `desactivada_por_stock`, `producto_sin_stock_id`, `producto_sin_stock_nombre`

---

## 🔑 Credenciales y Autenticación

- **Login único**: clientes y administradores ingresan desde `/login` mediante `POST /api/clients/login`.
- **Superusuario de pruebas**: usuario `Admin`, contraseña `Admin`, email interno `admin@huellitas.local`, `rol = admin`.
- **Usuarios nuevos**: se crean con `rol = cliente` por defecto.
- **Sesión frontend**: JWT persistido en `huellitas_client_token`; el campo `user.role` determina si se muestra el acceso al panel.
- **Autorización admin**: los endpoints administrativos validan el JWT y requieren `role = admin`.

---

## 🌐 Endpoints de la API Backend (`http://localhost:5000/api`)

### Autenticación Clientes
- `POST /api/clients/register` -> Body: `{ name, email, password }` -> Resp: `{ token, user, message }`, crea rol `cliente`
- `POST /api/clients/login` -> Body: `{ email, password }` (también acepta usuario admin) -> Resp: `{ token, user, message }` con `user.role`
- `GET /api/clients/verify` -> **Protegido Cliente** -> Resp: `{ valid: true, user }`
- `GET /api/clients/orders` -> **Protegido Cliente** -> Retorna pedidos del cliente autenticado con sus items
- `GET /api/orders/:id/messages` -> **Protegido** -> Retorna el hilo si el usuario es dueño del pedido o admin
- `POST /api/orders/:id/messages` -> **Protegido** -> Body: `{ contenido }`; registra remitente automáticamente como `cliente` o `admin`
- `PATCH /api/orders/:id/messages/read` -> **Protegido** -> Body opcional: `{ remitente: 'cliente' | 'admin' }`; marca mensajes del hilo como leídos
- `PATCH /api/orders/:id/messages/close` -> **Protegido Admin** -> Cierra el hilo activo e inserta un mensaje de sistema; el cliente puede abrir un hilo nuevo
- `PATCH /api/orders/:id/messages/reopen` -> **Protegido Cliente** -> Crea un nuevo hilo abierto e inserta un mensaje de sistema con el nombre del cliente

### Productos
- `GET /api/products` -> Público (retorna productos activos ordenados por `orden ASC`)
- `GET /api/products/:id` -> Público
- `POST /api/products` -> **Protegido Admin**
- `PUT /api/products/:id` -> **Protegido Admin**
- `PATCH /api/products/reorder` -> **Protegido Admin** (recibe `{ ids: [...] }` para reordenar la posición `orden` de los productos)
- `PATCH /api/products/:id/stock` -> **Protegido Admin** (recibe `{ delta: 1 | -1 }`, ajusta una unidad y desactiva ofertas si el stock llega a cero)
- `DELETE /api/products/:id` -> **Protegido Admin**

### Categorías
- `GET /api/categories` -> Público

### Ofertas
- `GET /api/offers/active` -> Público (retorna ofertas activas ordenadas por prioridad `DESC` con sus productos anidados y `vendidos`; excluye ofertas con productos eliminados o sin stock)
- `GET /api/offers` -> **Protegido Admin** (incluye campo `vendidos` por oferta)
- `POST /api/offers` -> **Protegido Admin**
- `PUT /api/offers/:id` -> **Protegido Admin** (la UI muestra confirmación explícita si la oferta incluye productos sin stock)
- `PATCH /api/offers/:id/toggle` -> **Protegido Admin** (activa/desactiva)
- `DELETE /api/offers/:id` -> **Protegido Admin**

### Pedidos
- `POST /api/orders` -> **Protegido Cliente** -> Crea pedido, inserta `pedido_items` con `oferta_id` opcional y descuenta stock -> Resp: `{ orderId, message }`
- `GET /api/orders` -> **Protegido Admin** -> Lista todos los pedidos con datos de cliente e items
- `PATCH /api/orders/:id/status` -> **Protegido Admin** -> Cambia estado del pedido
- `GET /api/messages` -> **Protegido Admin** -> Lista hilos agrupados por pedido con `no_leidos` para la bandeja del panel

---

## 🎨 Sistema de Diseño y Dirección Visual (E-Commerce Pet Shop Real)

- **Tipografía Principal**: `Plus Jakarta Sans` (Google Fonts, pesos 300 a 800) en sustitución de Inter/system-ui.
- **Paleta de Colores Corporativa**:
  - **Rojo E-Commerce Principal (CTA & Acentos)**: `#e52521` (Hover: `#c91d19`, Active: `#b01714`)
  - **Navy / Slate Oscuro (Headers & Barra de Beneficios)**: `#0f172a` y `#1e293b`
  - **Fondo de Página**: `#f8fafc` (Gris neutro ultra limpio sin sombras ni gradientes turbios)
  - **Dorado / Amber Promocional**: `#f59e0b` y `#fbbf24`
  - **Verde Beneficios / Stock**: `#10b981` y `#84cc16`
- **Estilo Visual**:
  - Estructuras limpias y estructuradas con bordes de 1px (`border-gray-200`) y acentos de alto contraste en estado hover.
  - Eliminación total de esquinas curvas exageraas tipo "SaaS genérico" y gradientes violetas.
  - Fotografía real de producto en marcos blancos cuadrados con padding (`object-contain`).

---

## 🎨 Componentes y Páginas del Frontend (`src/`)

- **`src/services/api.js`**: Cliente `fetch` centralizado con inyección automática de headers de auth.
- **`src/context/ClientAuthContext.jsx`**: Manejo global de la sesión única (JWT), usuario y `isAdmin`.
- **`src/context/CartContext.jsx`**: Carrito de compras, cantidades y tostadas de notificación.
- **`src/components/`**:
  - `Navbar.jsx`: Barra superior de beneficios (Envíos Gratis, 10% OFF Transferencia, Opiniones 4.9/5, Entrega 24/48hs estilo MisPichos) + Buscador centralizado (estilo MiVetShop) + Carrito con badge flotante.
  - `Hero.jsx`: Banner promocional de alto impacto con código de cupón de descuento destacado (`HUELLITAS10`) + Banner inferior de regalo de $10.000 (estilo MiVetShop).
  - `FeaturedCategories.jsx`: Grilla de tarjetas blancas circulares limpias con iconos y contador.
  - `ProductCard.jsx`: Card retail con acento superior rojo, fotografía contenida, badges de variantes/peso (`1.5kg`, `3kg`, `7.5kg`), precio destacado y botón CTA rojo sólido "Comprar Ahora".
  - `OfertaCard.jsx`: Card de pack en oferta con badges de % OFF, ahorro destacado y botón de compra rápido.
  - `Footer.jsx`: Pie de página profesional con medios de pago aceptados (VISA, Mastercard, Mercado Pago, Transferencia), datos de contacto y derechos reservados.
- **`src/pages/`**:
  - `Home.jsx`: Muestra Barra de Beneficios, Hero Promocional, Categorías, Grilla de Marcas Destacadas ("Seleccioná tu marca"), Sección de Ofertas y Productos Destacados en orden de prioridad.
  - `Catalog.jsx`: Banner de Ofertas, filtro de búsqueda integrado con la URL (`?search=...`), filtros por categoría estilo botones pills y selector de ordenamiento por defecto en base al campo `orden`.
  - `ProductDetail.jsx`: Vista detallada de producto con selector de cantidad y stock.
  - `Cart.jsx`: Tabla de items del carrito, modificación de cantidades, subtotal/total y checkout real integrado con la API de pedidos.
  - `ClientLogin.jsx`: Formulario de inicio de sesión para clientes.
  - `ClientRegister.jsx`: Formulario de registro con confirmación de contraseña.
  - `ClientOrders.jsx`: Vista `/mis-pedidos` con historial de pedidos del cliente y botón para abrir un hilo de mensajes por pedido.
  - `Admin.jsx`: Panel Admin con tabs de Productos (Drag & drop `@dnd-kit/core`), Ofertas, Ventas y Mensajes agrupados por pedido.
  - `Navbar.jsx`: El menú de perfil admin ofrece accesos a Pendientes, Ventas y Mensajes con badge de no leídos; los clientes conservan Mis Pedidos.

---

## 🚀 Próximos Pasos Pendientes
1. ~~**Autenticación y Registro de Clientes**: Implementar registro, login, contraseñas hasheadas y perfil para los usuarios compradores (`clientes`).~~ (Completado)
2. ~~**Sistema de Pedidos / Compras Real**: Conectar el checkout del carrito a las tablas `pedidos` y `pedido_items` en la base de datos.~~ (Completado)
3. ~~**Panel de Ventas en Admin**: Crear pestaña en el panel admin para ver los pedidos realizados por los clientes y cambiar su estado (`pendiente`, `enviado`, `completado`).~~ (Completado)
4. ~~**BUG CRÍTICO - Ofertas en el carrito**: Solucionado el precio de ofertas en carrito agrupando productos bajo un solo item `isOffer` y guardando el historial con `oferta_id` en la BD.~~ (Completado)
5. ~~**Registro de clientes**: Añadida validación de confirmar contraseña y redirección al login (sin auto-login). (Email de confirmación pendiente)~~ (Completado)
6. ~~**Panel Admin - Filtro de stock**: Añadidos selectores para filtrar por nivel de stock y ordenar de forma ascendente/descendente.~~ (Completado)
7. ~~**Panel Admin - Notificaciones de ventas**: Mostrado badge de notificaciones de nuevos pedidos no leídos en el tab de Ventas mediante un timestamp en localStorage.~~ (Completado)
8. ~~**Panel Admin - Ofertas vendidas**: Añadido contador de ofertas vendidas consultando a la base de datos la cantidad de compras realizadas de esa oferta.~~ (Completado)
9. ~~**Perfil de cliente / Mis Pedidos**: Menú desplegable en el Navbar (desktop + mobile) con "Mis Pedidos" y "Cerrar Sesión". Vista `/mis-pedidos` con historial de pedidos, estado, productos e imágenes.~~ (Completado)
10. ~~**Fix badge de notificaciones de Ventas**: Badge ahora muestra cantidad real de pedidos en estado `pendiente` (no por timestamp). Tab Ventas tiene subvistas "No resueltos" (pendientes, por defecto) y "Resueltos" (enviados/completados). Se eliminó la lógica de `localStorage`/timestamp.~~ (Completado)
11. ~~**Ordenamiento manual de productos (Drag & Drop en Admin y Web Pública)**: Campo `orden` en tabla productos, endpoint `PATCH /api/products/reorder`, drag & drop en Admin con `@dnd-kit/core`, y catálogo/home mostrando productos por defecto en base a `orden` (ascendente).~~ (Completado)
12. ~~**Rediseño de Frontend estilo Pet Shop Real**: Integración de referencias de e-commerce reales de Argentina (MiVetShop, MisPichos, Timberline). Barra de beneficios superior, buscador centralizado, Hero promocional con cupones destacados, grilla de marcas oficiales, tarjetas de productos con variantes y botones CTA rojos de alto contraste, y tipografía `Plus Jakarta Sans` en toda la web.~~ (Completado)

13. ~~**BUG CRÍTICO - Contraste de botones**: Auditoria completa de todos los botones e interacciones. Se reemplazaron clases de Tailwind que dependían de variables `@theme` (`bg-accent-500`, `bg-primary-500`, `bg-sage-500`) por valores hexadecimales directos (`#e52521`, `#0f172a`, `#059669`) en `Admin.jsx`, `Cart.jsx` y `Navbar.jsx`. El login de admin, tabs de navegación, botones de formulario y acciones del carrito ahora tienen contraste WCAG AA garantizado.~~ (Completado)

14. ~~**Buscador con autocompletado en Header**: `Navbar.jsx` precarga todos los productos al montar. Con debounce de 250ms filtra nombre, descripción y categoría. El desplegable muestra hasta 6 resultados con imagen, nombre, categoría y precio. Funciona en desktop (dropdown overlay) y mobile (lista dentro del drawer). Click en resultado navega directamente a `/product/:id`. Click fuera cierra el desplegable vía `ref` + `mousedown` listener.~~ (Completado)

15. ~~**Modal flotante para edición de productos en Admin**: Eliminado el `window.scrollTo({ top: 0 })` del trigger de edición. Al hacer click en "Editar" en la tabla de productos, se abre un overlay `fixed inset-0` con backdrop semitransparente. El modal contiene el `ProductForm` precargado con los datos del producto. Se cierra con el botón X, con "Cancelar" o al guardar los cambios. El scroll de la página no se pierde.~~ (Completado)
16. ~~**Login único con roles**: Se eliminó el login público separado de admin. `clientes` incorpora `rol`, el superusuario `Admin/Admin` se guarda como `admin`, el JWT incluye el rol y el middleware protege el panel y sus endpoints. El ícono de admin sólo se muestra a usuarios administradores.~~ (Completado)
17. ~~**Sincronización de ofertas con stock**: Al eliminar un producto, al descontar stock por una venta o al llevarlo a cero desde Admin, las ofertas activas que lo contienen se desactivan sin borrarse y registran `Desactivada: producto sin stock` junto con el producto responsable. El endpoint público filtra ofertas incompletas o sin stock y la reactivación sólo ocurre mediante una acción manual del admin.~~ (Completado)
18. ~~**Ajuste rápido de stock en Admin**: Se agregaron botones `+/-` en cada fila de productos y el endpoint `PATCH /api/products/:id/stock` para aplicar cambios inmediatos de una unidad, incluyendo la desactivación automática de ofertas y su notificación visible en la pestaña Ofertas.~~ (Completado)
19. ~~**Fricción consciente para ofertas sin stock**: Al crear o editar una oferta con productos agotados, o reactivar una oferta desactivada automáticamente por falta de stock, el Admin debe confirmar explícitamente mediante un modal con las opciones "Cancelar" / "Activar igual" y el listado de productos afectados.~~ (Completado)
20. ~~**Advertencia persistente de stock irregular**: Las ofertas activas forzadas por el Admin muestran en el listado de Ofertas el badge `Stock irregular` y los nombres exactos de los productos sin stock. Estas ofertas continúan excluidas de `GET /api/offers/active`, por lo que nunca se publican ni se pueden comprar desde el catálogo.~~ (Completado)
21. ~~**Confirmación al reactivar ofertas con stock irregular**: El toggle de activación evalúa tanto `desactivada_por_stock` como el stock actual de todos los productos asociados. Si alguno está en `0`, muestra el modal con el listado de productos y las acciones `Cancelar` / `Activar igual`; las ofertas sin problemas se activan directamente.~~ (Completado)
22. ~~**UX de checkboxes en Admin**: Los checkboxes de destacar productos, seleccionar productos de ofertas y activar ofertas ahora se pueden cambiar haciendo click en el recuadro, el texto o la fila completa de cada opción.~~ (Completado)
23. ~~**Mensajes y reclamos por pedido**: Se agregó la tabla `mensajes` y endpoints protegidos para consultar, enviar y marcar mensajes como leídos. Los clientes pueden contactar desde `/mis-pedidos`; Admin tiene una pestaña de Mensajes agrupada por pedido, con respuestas y badge de no leídos. El menú de perfil admin reemplaza Mis Pedidos por accesos a Pendientes, Ventas y Mensajes.~~ (Completado)
24. ~~**Validación transaccional de stock en checkout**: `POST /api/orders` valida dentro de una transacción `BEGIN IMMEDIATE` la cantidad total solicitada de cada producto, incluyendo componentes de ofertas, antes de crear el pedido o descontar stock. Si algún producto no alcanza, responde HTTP 409 con el nombre y stock disponible y ejecuta rollback. La compra excedida fue probada y no creó ningún pedido.~~ (Completado)
25. ~~**UX de stock desactualizado en carrito**: Cuando el checkout recibe un rechazo por stock insuficiente, el cliente muestra el producto, las unidades disponibles y ajusta automáticamente la cantidad y el stock del item en el carrito para evitar repetir la compra inválida.~~ (Completado)
26. ~~**UX de mensajería y notificaciones**: El hilo del Admin permanece abierto al responder y refresca la conversación; los perfiles muestran un badge con el conteo real de mensajes sin leer, que se actualiza al marcar el hilo como leído. En `Mis Pedidos`, el botón cambia de `Contactar sobre este pedido` a `Abrir chat` cuando ya existe conversación.~~ (Completado)
27. ~~**Cierre y reapertura de reclamos**: El Admin puede cerrar el hilo; se agrega un mensaje de sistema visible al cliente, se bloquea la escritura del hilo cerrado y el cliente puede abrir un reclamo nuevo para el mismo pedido sin mezclar conversaciones.~~ (Completado)
28. ~~**Reapertura real de reclamos**: La reapertura usa un endpoint propio que crea un nuevo `hilo_id`, agrega el mensaje de sistema `[cliente] reabrió el reclamo` y deja el hilo escribible. El Admin puede volver a cerrarlo definitivamente desde el mismo chat.~~ (Completado)
29. ~~**Indicador de cierre en Mensajes**: Cada hilo cerrado muestra el badge `Cerrado` en gris en el listado del panel Admin, diferenciándolo de los reclamos abiertos.~~ (Completado)
30. ~~**Notificaciones visibles de mensajes**: El contador real de mensajes sin leer se muestra como una burbuja roja superpuesta fuera del botón/avatar de perfil, tanto para admin como para cliente, y se actualiza al marcar conversaciones como leídas.~~ (Completado)

---

## 🔜 Siguiente Bloque Grande: Sistema de Pagos

A implementar en la próxima sesión con prompt dedicated:

- **Dos precios por producto/oferta**: precio con transferencia (con descuento) vs precio con QR/efectivo (precio completo). Requiere nuevos campos en `productos` y `ofertas`.
- **Flujo transferencia**: mostrar alias bancario al cliente, permitir subir comprobante (imagen/PDF), pedido queda en estado `esperando_aprobacion`.
- **Admin - Revisión de comprobantes**: nueva pestaña para ver comprobantes subidos y aprobar/rechazar el pago manualmente.
- **Cliente - Seguimiento del pedido**: vista de pasos estilo stepper (Pedido realizado → Comprobante subido → Pago aprobado → Enviado → Completado).
- **Email de confirmación de registro**: pendiente de configurar servicio de mail (ej. Resend, Nodemailer + SMTP).
