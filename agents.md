# AGENTS.md - Estado actual del proyecto NigDiz

Ultima actualizacion: 2026-10-16.

NigDiz es una tienda online para mascotas. El frontend esta hecho con React + Vite y el backend con Node.js + Express + MariaDB 10.6. La marca visible y los paquetes internos activos usan NigDiz. Las claves historicas de localStorage se migran automaticamente a `nigdiz_*` y se eliminan en el navegador del usuario.

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
  - MariaDB 10.6 mediante `mysql2`; variables DB_HOST, DB_PORT, DB_USER, DB_PASSWORD y DB_NAME (o DATABASE_URL mysql://).
  - JWT con `jsonwebtoken`.
  - Password hashing con `bcryptjs`.
  - Rate limiting con `express-rate-limit`.
  - Upload privado de comprobantes con `multer`.
  - Mercado Pago SDK v3 para preferencias, pagos y webhook.
  - Email de bienvenida con Resend o SMTP via `nodemailer`.
- Desarrollo local:
  - Frontend: `http://localhost:5173`.
  - Backend: `http://localhost:5000`.
  - MariaDB local aislada: `127.0.0.1:55433/nigdiz_local`. Towebs: localhost:3306/seholaco_ecommerce.

## Comandos

Desde la raiz del proyecto:

- `npm run dev:local`: flujo recomendado para pruebas completas. Prepara/inicia MariaDB local aislada, backend y Vite.
- `npm run local:setup`: prepara la base local sin levantar la web.
- `npm run dev:server:local`: levanta solo el backend contra la base local.
- `npm run local:stop`: detiene MariaDB local y conserva datos.
- `npm run dev`: levanta solo Vite desde `client`.
- `npm run dev:server`: levanta `server/index.js` usando `.env` de la raiz.
- `npm run build`: compila el frontend.
- `npm run package:towebs`: compila y genera frontend.zip y backend.zip en .local/entregas, con rutas ZIP compatibles con Linux. Empaquetador Windows/PowerShell; no incluye secretos, datos ni pruebas.
- `npm run lint`: ejecuta `oxlint client/src`.

Detalles del entorno local estan en `ENTORNO-LOCAL.md`. Las credenciales de prueba generadas viven en `.local/ACCESOS-MARIADB.md`; esa carpeta no se sube a Git.

## Estructura principal

- `client/`: aplicacion React.
- `server/`: API Express, migraciones y servicios.
- `server/passenger.cjs`: archivo de inicio para Towebs/Passenger; puente CommonJS con import() hacia index.js. En el panel usar passenger.cjs si el contenido de server esta en nigdiz-api; require() directo de index.js falla por top-level await.
- `Base de datos/nigdiz_mysql.sql`: referencia del esquema MariaDB para crear bases vacias y preparar pruebas locales; no se necesita en el hosting ni se lee al arrancar.
- `scripts/mariadb-local-environment.mjs`: orquestador de MariaDB local, backend y Vite.
- `scripts/package-towebs.mjs`: unico empaquetador de entregas Towebs; rutas internas de ZIP con / para evitar archivos llamados assets\\index en Linux.
- `.local/`: datos y secretos locales ignorados por Git.
- `client/dist/`: build generado del frontend, con .htaccess para rutas React en Apache. El contenido se sube al directorio publico de nigdiz.com.ar.

## Base de datos

Tablas principales:

- `categorias`: `id`, `nombre`.
- `clientes`: `id`, `nombre`, `email`, `password_hash`, `rol`, `fecha_registro`.
- `productos`: `id`, `nombre`, `descripcion`, `precio`, `stock`, `categoria`, `imagen_url`, `imagenes`, `activo`, `destacado`, `orden`.
- `pedidos`: `id`, `cliente_id`, `fecha`, `total`, `estado`, `metodo_pago`, `recargo_aplicado`, datos de entrega/envio, metadata Mercado Pago (`mp_payment_id`, `mp_payment_status`, `mp_payment_status_detail`, `mp_merchant_order_id`, `mp_preference_id`, `mp_approved_at`, `mp_last_webhook_at`), `comprobante_url`, `pago_rechazo_motivo`.
- `pedido_items`: `id`, `pedido_id`, `producto_id`, `oferta_id`, `cantidad`, `precio_unitario`.
- `ofertas`: `id`, `nombre`, `producto_ids`, `descuento_o_precio_paquete`, `tipo_descuento`, `prioridad`, `activa`, `desactivada_por_stock`, `producto_sin_stock_id`, `producto_sin_stock_nombre`.
- `mensajes`: `id`, `pedido_id`, `remitente`, `contenido`, `fecha`, `leido`, `hilo_id`, `tipo`, `cerrado`.
- `configuraciones`: `clave`, `valor`.

`configuraciones` guarda datos bancarios (`banco_alias`, `banco_cbu`, `banco_titular`), datos generales de tienda (`tienda_nombre`, `tienda_whatsapp`, `tienda_email_contacto`, `tienda_instagram_url`, `tienda_direccion`, `tienda_horarios`, `tienda_footer_texto`) y bloques de contenido editables como `content_home_hero`.

`server/index.js` verifica conexion, tablas y motor InnoDB directamente en MariaDB al arrancar mediante `server/schema.js`, sin leer archivos SQL ni aplicar DDL. Solo completa configuraciones generales faltantes. `npm run db:check` valida conexion/tablas sin escribir datos. `server/bootstrap-mariadb.js` agrega las cinco categorias usadas por la app, con dry-run por defecto y confirmacion explicita `--apply --database=...`. Ver `TOWEBS.md` para subida manual desde el panel. Los futuros cambios de estructura deben aplicarse mediante migraciones explicitas, no sincronizando un SQL con produccion. Las migraciones y herramientas antiguas de PostgreSQL fueron retiradas; los datos locales anteriores se conservan en .local sin formar parte del entorno activo.

No ejecutar migraciones ni scripts de datos contra produccion sin confirmar el destino. No hay scripts destructivos de limpieza o migracion SQLite en el flujo activo. Si se necesita una migracion de datos nueva, crearla con nombre explicito, dry-run y confirmacion del destino.

## Autenticacion y roles

- Login unico en `/login`, usando `POST /api/clients/login`.
- Los clientes nuevos se registran con rol `cliente`.
- El rol `admin` se lee del JWT y protege endpoints administrativos.
- El token se guarda en `localStorage` con la clave `nigdiz_client_token`.
- El carrito se guarda en `localStorage` con la clave `nigdiz_cart`.
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
- `GET /api/config/payment-methods`: publico, devuelve medios activos e instrucciones de pago.
- `PUT /api/admin/config/payment-methods`: admin, edita disponibilidad de transferencia, efectivo y Mercado Pago, y sus instrucciones.
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
  - El backend descuenta y reserva el stock al iniciar el checkout y libera la reserva al vencer, rechazarse o cancelarse el pago.
  - La reserva de Mercado Pago vence a los 30 minutos; se libera mediante una tarea periódica y también antes de procesar nuevas compras.
  - Si el pago se aprueba luego del vencimiento, el backend vuelve a intentar reservar stock de forma atómica; si ya no alcanza, marca `pago_aprobado_sin_stock` para revisión manual.
  - Se genera una preferencia con `external_reference = orderId`.
  - El recargo se calcula con factor neto `0.934`.
  - Guarda metadata operativa del pago: `mp_payment_id`, estado, detalle, merchant order, preference id, fecha de aprobacion y ultimo webhook.
  - El webhook aprobado confirma la reserva existente o vuelve a tomar el stock de forma idempotente y pasa el pedido a `aprobado`.
  - Si Mercado Pago informa `rejected` o `cancelled`, se libera la reserva y se marca como `pago_rechazado`.

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
- Revisar ventas, separar pendientes/resueltas, cambiar estados y aprobar/rechazar comprobantes. Rechazar una transferencia exige un motivo de 5 a 500 caracteres que se muestra al cliente.
- Ver y responder mensajes por pedido; cerrar hilos de reclamo.
- Editar datos generales de tienda y datos bancarios desde Configuracion.
- Configurar medios de pago disponibles e instrucciones editables para transferencia y efectivo; el checkout y backend respetan las opciones activas.
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
- `DB_PASSWORD`, `DATABASE_URL`, `JWT_SECRET`, tokens de Mercado Pago, SMTP/Resend y cualquier secreto deben vivir solo en entorno.
- `.env`, `.env*`, `.local/` y `server/uploads/comprobantes/` no deben subirse.
- Los comprobantes nuevos usan archivos privados persistentes en `server/uploads/comprobantes` por defecto (`RECEIPTS_STORAGE=local`), tambien en produccion. No exponer esta carpeta por HTTP estatico; incluirla en backups de Towebs. La descarga valida propietario/admin. Supabase queda como compatibilidad opcional explicita (`RECEIPTS_STORAGE=supabase`) y lector de referencias anteriores.
- CORS esta allowlisteado mediante `server/config/frontend.js` para localhost, `https://nigdiz.com.ar`, `https://www.nigdiz.com.ar` y dominios configurados con `CLIENT_URL`, `FRONTEND_URL`, `CORS_ORIGIN` o `CORS_ORIGINS`. No usa credenciales/cookies; la sesion usa JWT en Authorization.
- `VITE_API_URL` es el override opcional de URL del frontend y debe incluir `/api`; el fallback es `/api` en produccion y desarrollo. Vite lo proxifica a `http://127.0.0.1:5000` sin reescritura. El destino de produccion es `https://nigdiz.com.ar/api`, con Passenger montado en `/api` y carpeta privada `nigdiz-api`. Las rutas Express ya incluyen `/api`: no duplicarlo. `CLIENT_URL` configura el retorno por defecto de Mercado Pago y `FRONTEND_URL` el enlace de los emails. Las nuevas preferencias vuelven al Origin permitido de la compra. Ver `TOWEBS.md` para despliegue y variables.
- El backend desactiva `x-powered-by` y agrega headers basicos: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`.
- Login/registro tienen rate limit.
- En desarrollo, si `MP_WEBHOOK_SECRET` no existe, el webhook avisa y omite validacion de firma. En produccion (`NODE_ENV=production`) rechaza el webhook si falta el secreto.

## Email

Al registrarse un cliente, `sendWelcomeEmail` corre en segundo plano:

- Si `SMTP_PASS` no esta configurado o contiene placeholder, simula el envio en consola.
- Si `SMTP_PASS` empieza con `re_`, usa la API HTTP de Resend.
- Si no, usa SMTP con `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`.

El template de bienvenida debe mantenerse con branding NigDiz y paleta de la marca.

## Estado de Towebs (2026-10-16)

Frontend y backend publicados previamente por el panel de Towebs, con API verificada por HTTP. El usuario confirma SSL valido en el dominio principal. El codigo local esta preparado para migrar la API a `https://nigdiz.com.ar/api`; falta cambiar el montaje Passenger en el panel, subir el frontend nuevo y verificar HTTPS/API y webhook en produccion. Se conserva `nigdiz-api` como carpeta privada y `passenger.cjs` como startup. El `.htaccess` excluye `/api` del fallback React, pero no configura Passenger. No se han verificado pagos reales ni email real en el hosting. Ver `TOWEBS.md` para el procedimiento y la transicion de preferencias de Mercado Pago existentes. No se modifican automaticamente archivos remotos.

## Checklist de mejoras

### 1. Comprobantes privados persistentes

- [x] Guardar comprobantes privados en archivos persistentes de Towebs mediante RECEIPTS_STORAGE=local.
- [x] Mantener validacion de propietario/admin antes de descargar.
- [x] Validar MIME, firma binaria y limite de 5 MB antes de almacenar.
- [x] Reemplazar el comprobante anterior y limpiar el archivo nuevo si falla la base de datos.
- [x] Conservar compatibilidad opcional con referencias anteriores de Supabase Storage.
- [x] Verificar carga, descarga y permisos en MariaDB local con NODE_ENV=production.
- [ ] Verificar persistencia y backup de comprobantes en el nuevo hosting despues de una actualizacion/reinicio.

### 2. Configuracion general

- [x] Conectar los datos generales de tienda al Footer.
- [x] Conectar `GET /api/config/store` a ContactSection y unificar los valores iniciales de WhatsApp, email, Instagram y direccion con los datos correctos de la seccion Contacto. El nombre del remitente del email ya usa NigDiz como valor predeterminado.
- [x] Hacer editables los medios de pago visibles y las instrucciones de transferencia/efectivo; el checkout y Footer reflejan los medios activos y el backend impide crear pedidos con un método deshabilitado.
- [ ] Hacer editables los textos de estados de pago.

### 3. Contenido administrable

- [ ] Ampliar los bloques editables: Como comprar, Sobre NigDiz, contacto, politicas de envio/cambios y franja promocional.

### 4. Mercado Pago en produccion

- [x] Reservar stock al iniciar un checkout de Mercado Pago por 30 minutos y liberarlo ante vencimiento, rechazo o cancelacion.
- [x] Probar en MariaDB 10.6.28 local la reserva concurrente, liberacion por vencimiento, rechazo repetido y pago aprobado despues de vencer con/sin stock. Mercado Pago simulado; API y MariaDB reales.
- [ ] Configurar el webhook real en el dashboard de Mercado Pago apuntando a `/api/webhooks/mercadopago`.
- [ ] Confirmar `MP_WEBHOOK_SECRET` en Towebs y ejecutar una compra real controlada cuando HTTPS este listo.
- [ ] Verificar cambio de estado, metadata e impacto de stock despues del pago.

### 5. Emails

- [x] Limpiar branding heredado de la marca anterior en los templates.
- [ ] Activar y probar el proveedor real Resend/SMTP.
- [x] Incorporar datos de tienda configurables en los emails.

### 6. Limpieza tecnica y visual

- [x] Revisar nombres internos heredados de la marca anterior en codigo, paquetes y localStorage.
- [ ] Revisar colores rojos heredados puntuales para alinear completamente la UI con NigDiz.
- [x] Resolver advertencias actuales de lint.
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
