# NigDiz

Tienda online para mascotas hecha con React + Vite en el frontend y Node.js + Express + PostgreSQL en el backend.

## Desarrollo local

```bash
npm run dev:local
```

Ese comando prepara PostgreSQL local aislado en `127.0.0.1:55432/nigdiz_local`, levanta la API en `http://localhost:5000` y abre Vite en `http://localhost:5173`.

## Comandos útiles

```bash
npm run local:setup
npm run dev:server:local
npm run local:stop
npm run build
npm run lint
```

Los secretos, datos locales y comprobantes privados quedan fuera de Git mediante `.gitignore`.

## Dominios y despliegue

La API permite `https://nigdiz.com.ar`, `https://www.nigdiz.com.ar` y
`https://ecomlau-mauve.vercel.app`, ademas de los origenes locales existentes.
La sesion usa JWT en `Authorization: Bearer`; no requiere cookies ni CORS con credenciales.
Las llamadas del frontend estan centralizadas en `client/src/services/api.js`.

Variables en **Render**:

```env
CLIENT_URL=https://nigdiz.com.ar
FRONTEND_URL=https://nigdiz.com.ar
CORS_ORIGINS=https://nigdiz.com.ar,https://www.nigdiz.com.ar,https://ecomlau-mauve.vercel.app
MP_NOTIFICATION_URL=https://ecommercelaura.onrender.com/api/webhooks/mercadopago
```

`CLIENT_URL` debe ser una sola URL y es el retorno de Mercado Pago cuando no hay un
Origin permitido en la solicitud. Las compras iniciadas desde cualquiera de los
dominios permitidos vuelven al mismo dominio, para conservar acceso a su sesion y
carrito. `FRONTEND_URL` controla el enlace de los emails. `CORS_ORIGINS` agrega
origenes separados por comas; los tres dominios anteriores ya estan permitidos
sin depender de esta variable. `CORS_ORIGIN` tambien sigue siendo compatible.
Mantener `NODE_ENV=production` y los secretos actuales; no copiarlos al frontend.

En **Vercel**, configurar en el proyecto que sirve los dominios, para Production:

```env
VITE_API_URL=https://ecommercelaura.onrender.com/api
```

Debe incluir `/api`, usar HTTPS y apuntar al backend. `VITE_BACKEND_URL` no se usa.
Vite incorpora esta variable al compilar, por lo que cambiarla requiere redeploy.
Sin la variable, el build de produccion usa esa misma API HTTPS; desarrollo usa
localhost o `/api` con el proxy del flujo `dev:local`. No sustituir los hosts
locales de los scripts de desarrollo ni del proxy de Vite por hosts de produccion.

Desplegar el backend para resolver el bloqueo CORS actual y el frontend para
incorporar la normalizacion de la URL y el nuevo valor predeterminado. El dominio
raiz actualmente redirige a `www`; conservar ambos en Vercel y en la allowlist.
Comprobar GET `/api/products` y OPTIONS con `Authorization` desde los tres origenes.

No hay Supabase Auth ni recuperacion de password ni callbacks OAuth en este
proyecto: login y registro usan Express/JWT y rutas relativas. Supabase se usa
desde el backend para PostgreSQL/Storage privado, por lo que este cambio no exige
modificar Site URL, Redirect URLs ni politicas del bucket en Supabase Dashboard.
Nunca exponer su clave secreta mediante variables `VITE_*`.

Mercado Pago mantiene el webhook en Render; no trasladarlo a Vercel. Los retornos
se generan en cada nueva preferencia desde el backend; preferencias anteriores
pueden conservar sus URLs anteriores. Resend no necesita cambios por el dominio
web: solo si se cambia `SMTP_FROM` a una direccion `@nigdiz.com.ar`, verificar ese
dominio en Resend y configurar los registros DNS que indique antes de usarlo.
La sesion y el carrito en localStorage son propios de cada dominio: no se
transfieren automaticamente entre el dominio anterior y el nuevo.
