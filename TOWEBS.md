# NigDiz en Towebs

Estado actual (2026-10-15): frontend y API publicados manualmente en Towebs.
La tienda carga y las consultas publicas a MariaDB responden por HTTP. HTTPS esta
pendiente de definir entre Cloudflare y el certificado de Towebs. Las pruebas
locales cubren los flujos de compra; pagos y email reales siguen pendientes.

El backend conserva las rutas `/api` y el contrato del frontend. Usa `mysql2`,
consultas preparadas, InnoDB y transacciones con aislamiento READ COMMITTED.
No requiere PostgreSQL ni Supabase para nuevas operaciones. Se mantiene el
esquema importado, incluido `ofertas.producto_ids`, sin normalizaciones nuevas.

## Subida manual desde el panel

Desde Windows, `npm run package:towebs` genera dos entregas actualizadas:

- `.local/entregas/frontend.zip`: contenido para `domains/nigdiz.com.ar/public_html`.
- `.local/entregas/backend.zip`: contenido para `nigdiz-api`.

Ambos ZIP contienen los archivos directamente, sin carpetas envolventes. Sus
rutas usan `/` y se verifican al generar. No contienen datos privados ni secretos;
el backend incluye solamente `.env.example` como plantilla.

1. Subir el contenido de `server/` directamente a la carpeta `nigdiz-api` de la
   aplicacion Node. No hace falta subir `Base de datos` ni ningun archivo SQL.
   La base real ya esta creada e importada mediante phpMyAdmin.
2. En la aplicacion Node existente, conservar su dominio/ruta publica y configurar
   el arranque con `passenger.cjs` si se subio el contenido de `server/` a
   `nigdiz-api`, o `server/passenger.cjs` si la raiz es el proyecto completo.
   Passenger carga el inicio con require(); este archivo usa import() para
   iniciar index.js, que contiene top-level await. Mantener la configuracion
   de puerto que proporciona Towebs: el backend respeta `PORT`.
3. Instalar las dependencias de **server/package.json**, usando la funcion del
   panel para instalar paquetes en esa carpeta (`npm ci --omit=dev`, si hay
   terminal). Instalar solo el package.json de la raiz no instala el backend.
4. Cargar las variables de abajo en el panel Node o en un `.env` privado en el
   directorio de trabajo de la aplicacion. El ejemplo no contiene secretos reales.
5. Reiniciar la aplicacion desde el panel y revisar sus logs. Debe aparecer
   `Conexion MariaDB y esquema verificados`. Si faltan tablas o no son
   InnoDB, el backend falla al arrancar en lugar de atender con un esquema incompleto.
6. Abrir la URL publica actual del backend con `/api/products` y
   `/api/categories`. Una base vacia devuelve `[]`; no es un error de conexion.

No subir `.env`, `.local`, `node_modules` de Windows ni comprobantes privados al
repositorio. El paquete de entrega se genera sin esos archivos. El esquema ya
importado en `seholaco_ecommerce` no necesita volver a importarse para esta version.

## Variables

```dotenv
DB_HOST=localhost
DB_PORT=3306
DB_NAME=seholaco_ecommerce
DB_USER=USUARIO_DE_LA_BASE_EN_TOWEBS
DB_PASSWORD=PASSWORD_DE_LA_BASE
DB_CONNECTION_LIMIT=5
NODE_ENV=production
JWT_SECRET=SECRETO_ALEATORIO_DE_AL_MENOS_32_CARACTERES
CLIENT_URL=https://nigdiz.com.ar
FRONTEND_URL=https://nigdiz.com.ar
RECEIPTS_STORAGE=local
```

`DB_USER` es el usuario MySQL/MariaDB, que puede ser distinto del nombre de la
base o del usuario del panel. Las variables DB_* tienen prioridad sobre un
DATABASE_URL antiguo. Alternativamente se admite una URL `mysql://` o `mariadb://`
con usuario/password codificados como URL. Una URL PostgreSQL se rechaza.
La conexion a localhost no activa SSL automaticamente por estar en produccion.
Las sesiones SQL y las fechas del driver usan UTC.

Conservar los valores privados de Mercado Pago y email si ya estan configurados.
`MP_NOTIFICATION_URL` debe apuntar a la URL HTTPS publica real del backend en
Towebs, terminada en `/api/webhooks/mercadopago`. `MP_WEBHOOK_SECRET` es obligatorio
en produccion. Tambien hay que cambiar el destino en el dashboard de Mercado Pago;
editar una variable no modifica ese dashboard ni preferencias ya creadas.

`CLIENT_URL` y `FRONTEND_URL` deben apuntar al frontend visible. Mientras se pruebe
por HTTP usar http://nigdiz.com.ar; al activar HTTPS, actualizar ambas variables.

## Comprobantes privados

Con `RECEIPTS_STORAGE=local` se guardan en `server/uploads/comprobantes`, incluso en
produccion. La carpeta debe tener permisos de escritura para Node, persistir entre
subidas/reinicios e incluirse en los backups. No borrarla al actualizar el codigo.
Mantener `server/` y sus uploads fuera del directorio publico servido directamente
por el hosting. Los archivos se descargan exclusivamente por el endpoint con JWT
y validacion de propietario/admin. Se conservan limite de 5 MB y firma JPEG/PNG/PDF.

El lector de referencias antiguas `supabase:` se conserva por compatibilidad.
Para seguir usando Supabase de forma opcional se requiere explicitamente
`RECEIPTS_STORAGE=supabase` y sus variables privadas; no es necesario en Towebs.

## Validacion y categorias iniciales

Si el panel permite ejecutar comandos dentro de `server/`:

```bash
npm run db:check
npm run db:bootstrap
```

El primero valida conexion, tablas y motor sin escribir datos. El segundo
muestra el destino y las categorias faltantes en dry-run. Para agregarlas,
confirmando expresamente la base:

```bash
npm run db:bootstrap -- --apply --database=seholaco_ecommerce
```

Solo agrega las categorias usadas por la aplicacion y conserva las existentes.
No crea usuarios, productos ni pedidos. Si el panel solo ofrece phpMyAdmin,
seleccionar primero **seholaco_ecommerce** y ejecutar este equivalente:

```sql
SELECT DATABASE() AS destino;
INSERT INTO categorias (nombre)
VALUES ('collares'), ('correas'), ('alimentos'), ('juguetes'), ('consejos')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);
```

Sin estas categorias, una base importada sin registros no puede aceptar productos
que las referencien. El SQL del repositorio es una referencia para bases vacias y
pruebas locales; no se sube al hosting ni se sincroniza al arrancar.

## Verificacion realizada y pendiente

Se importo el mismo SQL en MariaDB **10.6.28** local aislada y se probaron las rutas
HTTP con `NODE_ENV=production`: registro/login/roles, productos, ofertas, precios
calculados por el servidor, configuracion, comprobantes privados, mensajes,
estados y auditoria. Tambien compras concurrentes de la ultima unidad, rollback,
reserva de 30 minutos, vencimiento concurrente, rechazo/cancelacion repetidos,
aprobacion tardia con/sin stock y reactivacion de packs al devolver stock.
Mercado Pago se simulo en el proceso de pruebas: no se hicieron pagos reales.

El usuario verifico el backend en Towebs por HTTP con respuestas 200 y [] en
/api/products y /api/categories. Se usa passenger.cjs y schema.js sin lectura de
SQL. El frontend tambien carga por HTTP. Quedan HTTPS, webhook real y otras
pruebas del despliegue.

## Frontend estatico en Towebs

Ejecutar `npm run build` desde la raiz del proyecto. El resultado esta en
`client/dist/`, no en server ni en la carpeta dist de la raiz. El destino de API
predeterminado es `//api.nigdiz.com.ar/api`: sigue HTTP/HTTPS del frontend y deja
de depender de Render. VITE_API_URL, si esta definida, sigue teniendo prioridad.

Antes de probar desde HTTP, agregar en las variables del panel Node:

```dotenv
CORS_ORIGINS=http://nigdiz.com.ar,http://www.nigdiz.com.ar
CLIENT_URL=http://nigdiz.com.ar
FRONTEND_URL=http://nigdiz.com.ar
```

Si CORS_ORIGINS ya contiene otros origenes necesarios, conservarlos y agregar los
dos HTTP. Los origenes HTTPS de NigDiz ya estan permitidos por el backend. Guardar
y reiniciar la aplicacion Node tras cambiar estas variables.

Subir **el contenido** de `client/dist/` al directorio publico de `nigdiz.com.ar`;
en este panel suele ser `domains/nigdiz.com.ar/public_html`. Confirmar el directorio
en el administrador de archivos antes de sobrescribir archivos existentes. No
subirlo a nigdiz-api ni al directorio publico de api.nigdiz.com.ar. La estructura
en el directorio publico debe ser:

```text
index.html
.htaccess
assets/
```

El archivo .htaccess puede estar oculto en el administrador. Si ya existe uno en
el hosting, revisar su contenido antes de reemplazarlo: puede contener reglas de
Towebs. La regla incluida conserva archivos/directorios existentes y envia rutas
React a index.html; no fuerza HTTPS ni cambia la configuracion de Passenger.
Referencia: https://httpd.apache.org/docs/2.4/rewrite/remapping.html

Abrir `http://nigdiz.com.ar`, revisar la solicitud a la API y recargar /catalog.
Con la base vacia el catalogo puede estar sin productos/categorias. El paquete
contiene solo el build publico; no contiene .env, backend ni comprobantes.

HTTPS sigue pendiente: servir el frontend por HTTPS requiere que la API tambien
responda correctamente por HTTPS. Cuando el certificado este listo, ajustar CLIENT_URL
y FRONTEND_URL a HTTPS. La URL predeterminada del frontend seguira ese protocolo
sin recompilar.
