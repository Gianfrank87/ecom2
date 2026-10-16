# NigDiz en Towebs: API bajo el mismo dominio

Preparado localmente el 2026-10-16. Segun lo confirmado por el usuario, el dominio
principal tiene SSL valido. El destino es **https://nigdiz.com.ar/api**; el montaje
en Towebs y los pagos reales deben verificarse despues del despliegue.
Esta migracion no requiere cambios de esquema, importaciones SQL ni migraciones de datos.

## Preparar las entregas

Desde la raiz del proyecto, en Windows:

```bash
npm run lint
npm run build
npm run test:mariadb
npm run package:towebs
```

Las pruebas usan exclusivamente MariaDB local aislada en el puerto 55433; ver
[ENTORNO-LOCAL.md](ENTORNO-LOCAL.md) para iniciarla si fuera necesario.
El empaquetador compila y genera dos ZIP sin carpetas envolventes:

- `.local/entregas/frontend.zip`: contenido de `client/dist/`, incluido `.htaccess`.
- `.local/entregas/backend.zip`: contenido para la carpeta privada `nigdiz-api`.

Las rutas internas usan `/`. Se excluyen secretos, `.local`, `node_modules`, pruebas
y uploads privados; solo se incluye `.env.example` como plantilla del backend.
No subir los ZIP a Git. Antes de publicar, revisar `git status --short` y que
`git ls-files -- .env '.env.*' 'client/.env*' 'server/.env*' .local server/uploads/comprobantes`
solo muestre las plantillas `.env.example` permitidas.

El frontend usa `/api` por defecto. Eliminar overrides antiguos de `VITE_API_URL`
en el entorno de compilacion y en `client/.env*`, o establecer `VITE_API_URL=/api`
antes de compilar. Es una variable de build: cambiarla en el panel Node no cambia
un frontend ya compilado. Se conserva el override para otros destinos explicitos.
En desarrollo Vite sigue en localhost:5173 y proxifica `/api` a
`http://127.0.0.1:5000`, conservando la ruta completa.

## Configuracion manual exacta en Towebs/cPanel

1. Respaldar el `.htaccess` remoto y la configuracion de la aplicacion Node
   (incluidas sus variables privadas). Respaldar los comprobantes persistentes.
   No eliminar la aplicacion ni su entorno para cambiar la URL.
2. Abrir la aplicacion existente en **Setup Node.js App** / gestor de aplicaciones
   Node del panel. Conservar la version de Node que ya funciona y configurar:

   | Campo | Valor |
   | --- | --- |
   | Application root | `nigdiz-api` (misma carpeta privada actual, relativa al home) |
   | Application URL: dominio | `nigdiz.com.ar` |
   | Application URL: ruta / URI | `/api` (o `api` si el campo agrega la barra) |
   | Application mode | `Production` |
   | Application startup file | `passenger.cjs` |

   Si hay un unico campo URL, el resultado debe ser `https://nigdiz.com.ar/api`.
   No usar `/api/api` ni montar Node en `/`, porque la raiz sirve el frontend.
   Si el panel no permite editar dominio/URI, pedir a soporte Towebs que cambie
   el montaje existente a `/api` conservando root, variables y uploads. Esto no
   se configura desde React ni solamente con el `.htaccess` del repositorio.
3. Extraer `backend.zip` **dentro de la carpeta privada existente `nigdiz-api`**.
   Deben quedar `nigdiz-api/passenger.cjs`, `nigdiz-api/index.js`, `config/`,
   `services/` y el package.json del backend. Conservar `.env` privado y
   `uploads/comprobantes/`; no borrar la carpeta al actualizar ni copiarla al
   directorio publico. No mover el backend a `public_html/api`.
4. Instalar dependencias de ese package.json con **Run NPM Install** del panel;
   con terminal y el entorno Node del panel activado, usar `npm ci --omit=dev`
   dentro de `nigdiz-api`. No instalar el paquete raiz del frontend en su lugar.
   Passenger usa `passenger.cjs` como puente CommonJS hacia el modulo ES con
   top-level await; cargar index.js directamente con require falla.
5. Configurar las variables de abajo. Conservar la configuracion de puerto del
   proveedor; no publicar `:5000` ni un proxy al puerto de desarrollo. Guardar,
   **Restart** y revisar logs: `Conexion MariaDB y esquema verificados`.
6. Antes de sustituir el frontend, verificar por HTTPS `/api/products` y
   `/api/categories`: deben responder JSON. Confirmar que Passenger entrega
   `/api/products` a Express con **un solo `/api`**. Las rutas de index.js ya lo
   contienen; no agregar otro `app.use('/api', ...)` ni quitarlo con un rewrite.
7. Extraer **el contenido** de `frontend.zip` al document root de `nigdiz.com.ar`,
   actualmente `domains/nigdiz.com.ar/public_html` (confirmarlo en Dominios del
   panel). Deben quedar `index.html`, `.htaccess` y `assets/` directamente.
   Si existe un `.htaccess` generado por el panel, integrar las reglas React del
   paquete conservando sus bloques Passenger, SSL y otras reglas del proveedor.
   No sobrescribir esos bloques ni un posible `.htaccess` de montaje en `api/`.
8. Probar catalogo, login, checkout, pedidos y descarga privada de comprobantes.
   Si se usa `www`, comprobar que redirige al dominio principal o que tambien
   tiene SSL y el montaje `/api`; una URL relativa usa el host del navegador.

La regla `RewriteRule ^api(?:/|$) - [L]` precede al fallback React: `/api` y sus
subrutas no se convierten en index.html. No altera `/catalog`, `/login` ni `/admin`.
Tampoco crea el montaje Node: si falta configurarlo, Apache puede devolver 404.
Un `GET /api` puede devolver 404 de Express porque no hay endpoint de indice;
no debe devolver la pagina React. Un endpoint desconocido debe devolver 404.

Referencias oficiales para el montaje en subruta y las reglas Apache:
[Passenger](https://www.phusionpassenger.com/docs/advanced_guides/deployment_and_scaling/apache/deploy/node/)
y [RewriteRule](https://httpd.apache.org/docs/2.4/rewrite/flags.html).
La configuracion concreta generada por Towebs solo puede comprobarse en el hosting.
Si `/api/products` devuelve `Cannot GET /products`, el proxy esta quitando `/api`:
pedir que conserve la URI completa; no cambiar los endpoints a `/api/api/products`.

## Variables del panel Node

Modificar/confirmar estos valores y reiniciar:

```dotenv
NODE_ENV=production
CLIENT_URL=https://nigdiz.com.ar
FRONTEND_URL=https://nigdiz.com.ar
MP_NOTIFICATION_URL=https://nigdiz.com.ar/api/webhooks/mercadopago
CORS_ORIGINS=https://nigdiz.com.ar,https://www.nigdiz.com.ar
RECEIPTS_STORAGE=local
```

Conservar otros origenes necesarios que ya existan en CORS_ORIGINS. La allowlist
ya admite ambos origenes HTTPS y localhost/127.0.0.1:5173; no se elimina CORS ni
se permite `*`. La sesion sigue usando JWT en Authorization, sin cookies.
CLIENT_URL es el retorno por defecto de Mercado Pago; un Origin permitido de la
compra tiene prioridad. FRONTEND_URL se usa en emails. No agregar `/api` a ellas.

**Conservar los valores privados actuales** de DB_HOST, DB_PORT, DB_NAME, DB_USER,
DB_PASSWORD (o DATABASE_URL), JWT_SECRET, MP_ACCESS_TOKEN, MP_WEBHOOK_SECRET y
SMTP/Resend. Ver [server/.env.example](server/.env.example). La base sigue siendo
la MariaDB existente; el arranque valida tablas e InnoDB sin aplicar DDL.
No ejecutar bootstrap/importaciones para esta migracion. JWT_SECRET sigue siendo
obligatorio y de al menos 32 caracteres.

Los comprobantes siguen en `nigdiz-api/uploads/comprobantes`, fuera del document
root, con permisos de escritura, persistencia y backup. No exponerlos como archivos
estaticos. La descarga exige JWT y propietario/admin. Se conserva la compatibilidad
opcional con referencias anteriores de Supabase.

## Mercado Pago y retiro de la URL anterior

1. En Mercado Pago Developers, abrir **Tus integraciones**, seleccionar la misma
   aplicacion de las credenciales actuales y entrar en **Webhooks / Notificaciones**.
2. Editar la URL de produccion a
   `https://nigdiz.com.ar/api/webhooks/mercadopago` y conservar el evento **Pagos / payment**.
   Si se usa tambien un entorno de prueba, actualizar su URL por separado.
3. Guardar y comprobar que la clave de firma coincide con MP_WEBHOOK_SECRET en
   Towebs. No generar ni publicar credenciales en el codigo. Revisar cualquier
   otra configuracion de notificaciones que aun use el host anterior.
4. Enviar una notificacion de prueba desde el dashboard y revisar resultado y
   logs. Realizar una compra controlada con una preferencia nueva: comprobar
   retorno, estado, metadata y stock. Pagos reales requieren verificacion manual.
5. Las preferencias nuevas usan MP_NOTIFICATION_URL; las ya creadas pueden
   conservar el destino anterior. Cambiar la variable o el dashboard no reescribe
   esas preferencias. Revisar pagos pendientes y notificaciones por reintentar
   antes de retirar la direccion vieja; vencer una reserva de stock no garantiza
   que hayan terminado todos los reintentos del proveedor.
6. Tras verificar la nueva URL y resolver esa transicion, retirar el montaje del
   antiguo subdominio y su DNS si ya no tiene otros usos. **No eliminar nigdiz-api**,
   su entorno, base ni uploads: ahora sirven a `/api` del dominio principal.
   Si hace falta mantener temporalmente dos montajes, coordinarlo con soporte;
   no crear procesos con configuraciones divergentes. No confiar en un 301 para
   webhooks POST ni en un redirect para resolver un certificado TLS invalido.

Referencia: [Webhooks de Mercado Pago](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/notifications/webhooks).

## Comprobaciones despues del deploy

Desde PowerShell (curl.exe evita el alias de PowerShell):

```powershell
curl.exe -i https://nigdiz.com.ar/api/products
curl.exe -i https://nigdiz.com.ar/api/categories
curl.exe -i https://nigdiz.com.ar/api/clients/verify
curl.exe -i https://nigdiz.com.ar/api/ruta-inexistente
curl.exe -i https://nigdiz.com.ar/api
curl.exe -I https://nigdiz.com.ar/catalog
curl.exe -I https://nigdiz.com.ar/login
curl.exe -I https://nigdiz.com.ar/admin
```

Esperado: productos/categorias 200 JSON (incluso `[]`), verify 401 JSON sin token,
ruta inexistente e indice API 404 de backend, rutas React 200 HTML. El HTML de un
404 de Express puede decir `Cannot GET`; no debe ser el index.html de Vite.
No usar `-k`: las pruebas deben validar SSL. La autenticacion existente esta en
`/api/clients/login`, `/api/clients/register` y `/api/clients/verify`;
**no hay endpoints `/api/auth/...`**.

En DevTools > Network verificar `/api/products`, `/api/categories` y
`/api/clients/login` sobre https://nigdiz.com.ar, sin doble prefijo ni conexiones
al host anterior. Recargar /catalog, /login y /admin directamente, y comprobar
comprobantes con una sesion propia/admin. El webhook se verifica desde Mercado
Pago con firma valida; un GET al webhook no verifica pagos.

El repositorio prepara codigo y entregas; no cambia el panel, DNS ni Mercado Pago.
El montaje Passenger, TLS, permisos/persistencia de uploads, pagos y emails reales
deben comprobarse en produccion. Las pruebas locales simulan Mercado Pago y no
realizan pagos reales.
