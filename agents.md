# AGENTS.md - Estado actual del proyecto NigDiz

Ultima actualizacion: 2026-09-26.

NigDiz es una tienda online para mascotas. El frontend esta hecho con React + Vite y el backend con Node.js + Express + PostgreSQL. La marca visible es NigDiz, aunque todavia quedan nombres historicos internos como `huellitas_*`, `huellitas-server` y algunos textos heredados en codigo o localStorage.

Este archivo resume el estado real del repo y debe mantenerse como guia operativa para futuras sesiones de trabajo.

## Stack

- Frontend:
  - React 19, Vite 8, React Router DOM 7.
  - Tailwind CSS v4 mediante `@tailwindcss/vite`.
  - Lucide React para iconos.
  - `ClientAuthContext` para sesion JWT unica con rol.
  - `CartContext` para carrito persistido, toast y drawer lateral.
- Backend:
  - Node.js con ES Modules.
  - Express 5.
  - PostgreSQL mediante `pg` y `DATABASE_URL`.
  - JWT con `jsonwebtoken`.
  - Password hashing con `bcryptjs`.
  - Rate limiting con `express-rate-limit`.
  - Upload privado de comprobantes con `multer`.
  - Mercado Pago SDK v3 para preferencias, pagos y webhook.
  - Email de bienvenida con Resend o SMTP via `nodemailer`.
- Desarrollo local:
  - Frontend: `http://localhost:5173`.
  - Backend: `http://localhost:5000`.
  - PostgreSQL local aislado: `127.0.0.1:55432/nigdiz_local`.

## Comandos

Desde la raiz del proyecto:

- `npm run dev:local`: flujo recomendado para pruebas completas. Prepara/inicia PostgreSQL local aislado, backend y Vite.
- `npm run local:setup`: prepara la base local sin levantar la web.
- `npm run dev:server:local`: levanta solo el backend contra la base local.
- `npm run local:stop`: detiene PostgreSQL local y conserva datos.
- `npm run dev`: levanta solo Vite desde `client`.
- `npm run dev:server`: levanta `server/index.js` usando `.env` de la raiz.
- `npm run build`: compila el frontend.
- `npm run lint`: ejecuta `oxlint client/src`.

Detalles del entorno local estan en `ENTORNO-LOCAL.md`. Las credenciales de prueba generadas viven en `.local/ACCESOS.md`; esa carpeta no se sube a Git.

## Estructura principal

- `client/`: aplicacion React.
- `server/`: API Express, migraciones y servicios.
- `server/local/schema.sql`: esquema usado por el entorno local aislado.
- `scripts/local-environment.mjs`: orquestador de PostgreSQL local, backend y Vite.
- `.local/`: datos y secretos locales ignorados por Git.
- `dist/`: build generado.

## Base de datos

Tablas principales:

- `categorias`: `id`, `nombre`.
- `clientes`: `id`, `nombre`, `email`, `password_hash`, `rol`, `fecha_registro`.
- `productos`: `id`, `nombre`, `descripcion`, `precio`, `stock`, `categoria`, `imagen_url`, `imagenes`, `activo`, `destacado`, `orden`.
- `pedidos`: `id`, `cliente_id`, `fecha`, `total`, `estado`, `metodo_pago`, `recargo_aplicado`, datos de entrega/envio, metadata Mercado Pago (`mp_payment_id`, `mp_payment_status`, `mp_payment_status_detail`, `mp_merchant_order_id`, `mp_preference_id`, `mp_approved_at`, `mp_last_webhook_at`), `comprobante_url`.
- `pedido_items`: `id`, `pedido_id`, `producto_id`, `oferta_id`, `cantidad`, `precio_unitario`.
- `ofertas`: `id`, `nombre`, `producto_ids`, `descuento_o_precio_paquete`, `tipo_descuento`, `prioridad`, `activa`, `desactivada_por_stock`, `producto_sin_stock_id`, `producto_sin_stock_nombre`.
- `mensajes`: `id`, `pedido_id`, `remitente`, `contenido`, `fecha`, `leido`, `hilo_id`, `tipo`, `cerrado`.
- `configuraciones`: `clave`, `valor`.

`configuraciones` guarda datos bancarios (`banco_alias`, `banco_cbu`, `banco_titular`), datos generales de tienda (`tienda_nombre`, `tienda_whatsapp`, `tienda_email_contacto`, `tienda_instagram_url`, `tienda_direccion`, `tienda_horarios`, `tienda_footer_texto`) y bloques de contenido editables como `content_home_hero`.

`server/index.js` ejecuta una sincronizacion chica al arrancar: agrega `productos.imagenes` si falta y ajusta los estados permitidos de `pedidos`. Las migraciones historicas siguen existiendo y se ejecutan manualmente cuando corresponda:

- `server/migrate-payment-method.js`
- `server/migrate-bank-config.js`
- `server/migrate-offers-columns.js`
- `server/migrate-categories.js`

No ejecutar migraciones ni scripts de datos contra produccion sin confirmar el destino. `migrar-datos.js` y scripts de limpieza pueden borrar datos.

## Autenticacion y roles

- Login unico en `/login`, usando `POST /api/clients/login`.
- Los clientes nuevos se registran con rol `cliente`.
- El rol `admin` se lee del JWT y protege endpoints administrativos.
- El token se guarda en `localStorage` con la clave historica `huellitas_client_token`.
- El carrito se guarda en `localStorage` con la clave historica `huellitas_cart`.
- No documentar credenciales reales ni superusuarios en el repo.

## API backend

Base local: `http://localhost:5000/api`.

Autenticacion:

- `POST /api/clients/register`: crea cliente, hashea password y dispara email de bienvenida en segundo plano.
- `POST /api/clients/login`: login de cliente o admin.
- `GET /api/clients/verify`: valida token.
- `GET /api/clients/orders`: pedidos del cliente autenticado.

Productos y categorias:

- `GET /api/products`: publico, productos activos ordenados por `orden`.
- `GET /api/products/:id`: publico.
- `POST /api/products`: admin.
- `PUT /api/products/:id`: admin.
- `PATCH /api/products/reorder`: admin, reordena productos.
- `PATCH /api/products/:id/stock`: admin, suma/resta una unidad y desactiva ofertas si corresponde.
- `DELETE /api/products/:id`: admin.
- `GET /api/categories`: publico.

Ofertas:

- `GET /api/offers/active`: publico, solo ofertas activas, completas y con stock.
- `GET /api/offers`: admin, incluye ventas por oferta.
- `POST /api/offers`: admin.
- `PUT /api/offers/:id`: admin.
- `PATCH /api/offers/:id/toggle`: admin.
- `DELETE /api/offers/:id`: admin.

Pedidos, pagos y comprobantes:

- `GET /api/orders`: admin, lista pedidos con cliente e items.
- `POST /api/orders`: cliente, recalcula precios en backend, valida stock y exige direccion de entrega.
- `PATCH /api/orders/:id/status`: admin.
- `POST /api/orders/:id/comprobante`: cliente propietario, sube JPEG/PNG/PDF de hasta 5 MB y valida firma binaria.
- `GET /api/orders/:id/comprobante`: cliente propietario o admin, sirve archivo privado.
- `PATCH /api/admin/orders/:id/approval`: admin, aprueba o rechaza pago por transferencia.
- `POST /api/webhooks/mercadopago`: webhook publico de Mercado Pago; valida firma con `MP_WEBHOOK_SECRET`, obligatorio cuando `NODE_ENV=production`.

Mensajes y reclamos:

- `GET /api/orders/:id/messages`: cliente propietario o admin.
- `POST /api/orders/:id/messages`: cliente propietario o admin.
- `PATCH /api/orders/:id/messages/read`: marca mensajes como leidos.
- `PATCH /api/orders/:id/messages/close`: admin, cierra el hilo activo.
- `PATCH /api/orders/:id/messages/reopen`: cliente, abre un nuevo hilo.
- `GET /api/messages`: admin, bandeja agrupada por pedido.

Configuracion y contenido:

- `GET /api/config/banco`: publico.
- `PUT /api/admin/config/banco`: admin.
- `GET /api/config/store`: publico, datos generales de tienda.
- `PUT /api/admin/config/store`: admin, edita datos generales de tienda.
- `GET /api/content/:key`: publico, solo claves permitidas. Actualmente `home-hero`.
- `PUT /api/admin/content/:key`: admin.

Envios:

- `GET /api/shipping/localities?q=...`: publico, autocompletado de localidades.
- `POST /api/shipping/quote`: publico, cotiza por `destinationId`.

La cotizacion de envio es un simulador en `server/services/shippingService.js`, con origen fijo en Gualeguaychu, Entre Rios. El checkout exige seleccionar una localidad, el backend recalcula la cotizacion por `destinationId`, suma el envio al total confiable y guarda datos de entrega/envio en `pedidos`.

## Pagos y checkout

- Metodos soportados: `transferencia`, `efectivo`, `mercadopago`.
- El backend nunca acepta totales ni precios del frontend como fuente de verdad.
- Para transferencia:
  - El pedido nace en `esperando_aprobacion`.
  - El cliente puede subir comprobante.
  - El admin aprueba o rechaza desde Ventas.
- Para efectivo:
  - El pedido nace en `pendiente`.
  - El stock se descuenta en la transaccion de creacion.
- Para Mercado Pago:
  - El pedido nace en `pendiente_pago`.
  - Se valida stock al crear el pedido, pero no se descuenta hasta webhook aprobado.
  - Se genera una preferencia con `external_reference = orderId`.
  - El recargo se calcula con factor neto `0.934`.
  - Guarda metadata operativa del pago: `mp_payment_id`, estado, detalle, merchant order, preference id, fecha de aprobacion y ultimo webhook.
  - El webhook aprobado descuenta stock de forma idempotente y pasa el pedido a `aprobado`.
  - Si Mercado Pago informa `rejected` o `cancelled` mientras el pedido sigue en `pendiente_pago`, se marca como `pago_rechazado`.

El frontend conserva el carrito al redirigir a Mercado Pago. Si el pago falla o queda pendiente y vuelve a `/cart`, permite reintentar. Si vuelve aprobado a `/mis-pedidos`, limpia el carrito.

## Frontend

Rutas:

- `/`: Home.
- `/catalog`: catalogo con busqueda y filtros.
- `/product/:id`: detalle de producto.
- `/cart`: carrito y checkout.
- `/login`: login unico.
- `/registro`: registro de cliente.
- `/mis-pedidos`: historial, comprobantes y reclamos del cliente.
- `/admin`: panel administrativo.

Componentes relevantes:

- `Navbar.jsx`: barra superior, buscador con autocompletado, menu de usuario/admin, badge de mensajes y acceso al carrito.
- `CartDrawer.jsx`: drawer lateral persistente del carrito.
- `Hero.jsx`: hero editable por admin mediante `content_home_hero`.
- `ProductCard.jsx`: tarjeta de producto.
- `OfertaCard.jsx`: tarjeta de oferta/pack.
- `ReceiptUpload.jsx`: carga de comprobantes.
- `FeaturedProductSection.jsx`, `FeaturedCategories.jsx`, `AboutNigdizSection.jsx`, `HowToBuySection.jsx`, `SizeGuideSection.jsx`, `ContactSection.jsx`, `Footer.jsx`: secciones de Home/contenido.

Paginas relevantes:

- `Home.jsx`: hero, categorias, productos destacados, ofertas y secciones de contenido.
- `Catalog.jsx`: listado publico, busqueda por URL, filtros y ordenamiento.
- `ProductDetail.jsx`: detalle, galeria/imagenes y selector de cantidad.
- `Cart.jsx`: checkout con datos de contacto, direccion obligatoria, cotizador de envio, pagos y comprobante.
- `ClientOrders.jsx`: seguimiento de pedidos, comprobantes y chat/reclamos.
- `Admin.jsx`: tabs `products`, `offers`, `sales`, `messages`, `config`.

## Panel admin

El panel admin permite:

- Crear, editar, eliminar y reordenar productos con drag and drop.
- Administrar multiples imagenes por producto; la primera es portada.
- Ajustar stock con botones rapidos `+/-`.
- Crear, editar, activar/desactivar y eliminar ofertas.
- Mostrar advertencias de stock irregular para ofertas.
- Revisar ventas, separar pendientes/resueltas, cambiar estados y aprobar/rechazar comprobantes.
- Ver y responder mensajes por pedido; cerrar hilos de reclamo.
- Editar datos generales de tienda y datos bancarios desde Configuracion.
- Editar el contenido del hero desde el propio Home si el usuario es admin.

## Diseno visual

- Marca visible: NigDiz.
- Paleta actual:
  - Dorado CTA/acento: `#d3ad2f`, hover `#f0dc78`, activo `#b89420`.
  - Marron oscuro: `#352820`.
  - Marrones de apoyo: `#4b382b`, `#a78665`.
  - Celeste/turquesa para superficies y estados positivos.
- Mantener estilo de pet shop real: producto visible, fondos claros, estructura limpia, bordes definidos y fotografia real o imagen de producto contenida.
- Evitar reintroducir rojo como color de marca para CTA, hover, focus, enlaces o gradientes. Puede haber clases heredadas todavia visibles en codigo; antes de cambiar UI revisar `client/src/index.css`.
- Evitar gradientes violetas, estilos SaaS genericos y esquinas exageradas si no corresponden al diseno existente.

## Seguridad y datos sensibles

- `JWT_SECRET` es obligatorio y debe tener al menos 32 caracteres.
- `DATABASE_URL`, `JWT_SECRET`, tokens de Mercado Pago, SMTP/Resend y cualquier secreto deben vivir solo en entorno.
- `.env`, `.env*`, `.local/` y `server/uploads/comprobantes/` no deben subirse.
- Los comprobantes nuevos usan un bucket privado de Supabase Storage cuando estan configuradas las variables del servidor. La base guarda una referencia `supabase:` y la descarga sigue pasando por el endpoint autenticado, que valida propietario/admin. En desarrollo sin Storage se usa `server/uploads/comprobantes`; los archivos locales anteriores siguen siendo compatibles durante la transicion.
- CORS esta allowlisteado para localhost y dominios configurados en `server/index.js`.
- El backend desactiva `x-powered-by` y agrega headers basicos: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`.
- Login/registro tienen rate limit.
- En desarrollo, si `MP_WEBHOOK_SECRET` no existe, el webhook avisa y omite validacion de firma. En produccion (`NODE_ENV=production`) rechaza el webhook si falta el secreto.

## Email

Al registrarse un cliente, `sendWelcomeEmail` corre en segundo plano:

- Si `SMTP_PASS` no esta configurado o contiene placeholder, simula el envio en consola.
- Si `SMTP_PASS` empieza con `re_`, usa la API HTTP de Resend.
- Si no, usa SMTP con `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`.

Hay textos internos heredados de Huellitas en el template. Revisar antes de activar email real de marca.

## Checklist de mejoras

### 1. Comprobantes privados persistentes

- [x] Integrar el backend con un bucket privado de Supabase Storage.
- [x] Mantener validacion de propietario/admin antes de descargar.
- [x] Validar MIME, firma binaria y limite de 5 MB antes de almacenar.
- [x] Reemplazar el comprobante anterior sin dejar objetos nuevos huerfanos si falla la base de datos.
- [x] Mantener lectura compatible de comprobantes locales anteriores durante la transicion.
- [ ] Crear en Supabase el bucket privado `comprobantes`, con limite de 5 MB y MIME JPEG, PNG y PDF.
- [ ] Configurar en Render `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (o `SUPABASE_SECRET_KEY`) y `SUPABASE_RECEIPTS_BUCKET=comprobantes`.
- [ ] Desplegar y probar una carga, descarga y reemplazo reales. En produccion no existe fallback al disco volatil.

### 2. Configuracion general

- [x] Conectar los datos generales de tienda al Footer.
- [ ] Conectar `GET /api/config/store` a ContactSection y templates de email.
- [ ] Hacer editables los metodos de pago visibles, instrucciones de transferencia y textos de estados de pago.

### 3. Contenido administrable

- [ ] Ampliar los bloques editables: Como comprar, Sobre NigDiz, contacto, politicas de envio/cambios y franja promocional.

### 4. Mercado Pago en produccion

- [ ] Configurar el webhook real en el dashboard de Mercado Pago apuntando a `/api/webhooks/mercadopago`.
- [ ] Confirmar `MP_WEBHOOK_SECRET` en Render y ejecutar una compra real controlada.
- [ ] Verificar cambio de estado, metadata e impacto de stock despues del pago.

### 5. Emails

- [ ] Limpiar branding heredado de Huellitas en los templates.
- [ ] Activar y probar el proveedor real Resend/SMTP.
- [ ] Incorporar datos de tienda configurables en los emails.

### 6. Limpieza tecnica y visual

- [ ] Revisar nombres internos heredados de Huellitas en codigo, paquetes y localStorage.
- [ ] Revisar colores rojos heredados puntuales para alinear completamente la UI con NigDiz.
- [ ] Resolver advertencias actuales de lint.
- [ ] Dividir el bundle principal cuando el crecimiento de la aplicacion lo justifique.

### 7. Envios reales

- [ ] Integrar una API real de envios cuando deje de alcanzar el simulador local.

## Reglas de trabajo para futuras sesiones

- No tocar ni publicar secretos.
- No ejecutar scripts destructivos o migraciones sobre produccion sin confirmacion explicita.
- No revertir cambios del usuario.
- Para cambios visuales, respetar la paleta y direccion de NigDiz.
- Para pagos, stock y roles, la fuente de verdad siempre es el backend.
- Antes de publicar, correr al menos `npm run build` y revisar que `.local/`, `.env*` y comprobantes privados no aparezcan en Git.
