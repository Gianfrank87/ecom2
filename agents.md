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
  - `AuthContext` (Token Admin persistido en `localStorage`)
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
2. **`productos`**: `id` (PK AUTO), `nombre`, `descripcion`, `precio`, `stock`, `categoria`, `imagen_url`, `activo`, `destacado`
3. **`clientes`**: `id` (PK AUTO), `nombre`, `email` (UNIQUE), `password_hash`, `fecha_registro`
4. **`pedidos`**: `id` (PK AUTO), `cliente_id`, `fecha`, `total`, `estado` (`pendiente` | `enviado` | `completado`)
5. **`pedido_items`**: `id` (PK AUTO), `pedido_id`, `producto_id`, `oferta_id` (nullable), `cantidad`, `precio_unitario`
6. **`ofertas`**: `id` (PK AUTO), `nombre`, `producto_ids` (JSON Array), `descuento_o_precio_paquete`, `tipo_descuento` (`'precio_paquete'` | `'porcentaje'`), `prioridad`, `activa`

---

## 🔑 Credenciales y Autenticación Admin

- **Usuario Admin**: `Admin`
- **Contraseña Admin**: `Admin`
- **Token Admin Fijo (Dev)**: `huellitas-admin-secret-token-2024`
- **Header para llamadas protegidas**: `Authorization: Bearer huellitas-admin-secret-token-2024`
- **Llave LocalStorage Frontend**: `huellitas_admin_token`

---

## 🌐 Endpoints de la API Backend (`http://localhost:5000/api`)

### Autenticación Admin
- `POST /api/admin/login` -> Body: `{ username, password }` -> Resp: `{ token, message }`
- `GET /api/admin/verify` -> Protected -> Resp: `{ valid: true }`

### Autenticación Clientes
- `POST /api/clients/register` -> Body: `{ name, email, password }` -> Resp: `{ token, user, message }`
- `POST /api/clients/login` -> Body: `{ email, password }` -> Resp: `{ token, user, message }`
- `GET /api/clients/verify` -> **Protegido Cliente** -> Resp: `{ valid: true, user }`
- `GET /api/clients/orders` -> **Protegido Cliente** -> Retorna pedidos del cliente autenticado con sus items

### Productos
- `GET /api/products` -> Público (retorna productos activos mapeados a camelCase)
- `GET /api/products/:id` -> Público
- `POST /api/products` -> **Protegido Admin**
- `PUT /api/products/:id` -> **Protegido Admin**
- `DELETE /api/products/:id` -> **Protegido Admin**

### Categorías
- `GET /api/categories` -> Público

### Ofertas
- `GET /api/offers/active` -> Público (retorna ofertas activas ordenadas por prioridad `DESC` con sus productos anidados y `vendidos`)
- `GET /api/offers` -> **Protegido Admin** (incluye campo `vendidos` por oferta)
- `POST /api/offers` -> **Protegido Admin**
- `PUT /api/offers/:id` -> **Protegido Admin**
- `PATCH /api/offers/:id/toggle` -> **Protegido Admin** (activa/desactiva)
- `DELETE /api/offers/:id` -> **Protegido Admin**

### Pedidos
- `POST /api/orders` -> **Protegido Cliente** -> Crea pedido, inserta `pedido_items` con `oferta_id` opcional y descuenta stock -> Resp: `{ orderId, message }`
- `GET /api/orders` -> **Protegido Admin** -> Lista todos los pedidos con datos de cliente e items
- `PATCH /api/orders/:id/status` -> **Protegido Admin** -> Cambia estado del pedido

---

## 🎨 Componentes y Páginas del Frontend (`src/`)

- **`src/services/api.js`**: Cliente `fetch` centralizado con inyección automática de headers de auth.
- **`src/context/AuthContext.jsx`**: Manejo global del estado admin y sesión.
- **`src/context/ClientAuthContext.jsx`**: Manejo global del estado de sesión de clientes (JWT).
- **`src/context/CartContext.jsx`**: Carrito de compras, cantidades y tostadas de notificación.
- **`src/components/`**:
  - `Navbar.jsx`: Header responsivo con badge del carrito, acceso admin, y menú desplegable de usuario ("Mis Pedidos" + "Cerrar Sesión") responsive.
  - `Hero.jsx`: Banner principal con estética cálida pastel/tierra.
  - `FeaturedCategories.jsx`: Grid de categorías con enlaces al catálogo.
  - `ProductCard.jsx`: Card de producto con botón de agregado rápido y badge sin stock.
  - `OfertaCard.jsx`: Card de oferta (badge `🔥 OFERTA`, lista de productos del pack, cálculo de descuento, agrega la oferta como item único `isOffer` al carrito).
  - `Footer.jsx`: Pie de página informativo.
- **`src/pages/`**:
  - `Home.jsx`: Muestra Hero, Categorías, Sección "Ofertas del Momento" (si hay activas) y "Productos Destacados".
  - `Catalog.jsx`: Muestra banner de Ofertas Activas, buscador en tiempo real, filtro por categoría y ordenamiento por precio/nombre.
  - `ProductDetail.jsx`: Vista detallada de producto con selector de cantidad y stock.
  - `Cart.jsx`: Tabla de items del carrito, modificación de cantidades, subtotal/total y checkout real integrado con la API de pedidos.
  - `ClientLogin.jsx`: Formulario de inicio de sesión para clientes (muestra mensajes de redireccionamiento del registro).
  - `ClientRegister.jsx`: Formulario de registro con campo de confirmación de contraseña; redirige al login sin auto-login.
  - `ClientOrders.jsx`: Vista `/mis-pedidos` con historial de pedidos del cliente: estado visual, fecha, productos con imágenes y totales colapsables.
  - `Admin.jsx`: Login Admin + Dashboard con Tabs:
    - **Productos**: CRUD completo, filtro por nivel de stock (todos/bajo/agotado) y ordenamiento (menor/mayor stock).
    - **Ofertas**: CRUD, activar/desactivar, contador de unidades vendidas por oferta.
    - **Ventas**: Lista de pedidos con selector de estado + badge animado en el tab para pedidos no leídos.

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

---

## 🔜 Siguiente Bloque Grande: Sistema de Pagos

A implementar en la próxima sesión con prompt dedicado:

- **Dos precios por producto/oferta**: precio con transferencia (con descuento) vs precio con QR/efectivo (precio completo). Requiere nuevos campos en `productos` y `ofertas`.
- **Flujo transferencia**: mostrar alias bancario al cliente, permitir subir comprobante (imagen/PDF), pedido queda en estado `esperando_aprobacion`.
- **Admin - Revisión de comprobantes**: nueva pestaña para ver comprobantes subidos y aprobar/rechazar el pago manualmente.
- **Cliente - Seguimiento del pedido**: vista de pasos estilo stepper (Pedido realizado → Comprobante subido → Pago aprobado → Enviado → Completado).
- **Email de confirmación de registro**: pendiente de configurar servicio de mail (ej. Resend, Nodemailer + SMTP).
