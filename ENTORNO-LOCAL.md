# Probar localmente y volver a producción

## Arrancar las pruebas

Desde la raíz del proyecto (PowerShell: usar `npm.cmd` si bloquea `npm`):

```sh
npm run dev:local
```

Abre la web en **http://localhost:5173**. El comando prepara/inicia PostgreSQL, el backend en el puerto 5000 y Vite en el 5173. Cerrar antes otro servidor que use esos puertos. `Ctrl+C` detiene la web y el backend. La base sigue disponible; `npm run local:stop` la detiene sin borrar datos.

**Cuentas y contraseñas:** consultar [.local/ACCESOS.md](.local/ACCESOS.md). Hay un administrador y un cliente exclusivos de pruebas; también se pueden registrar clientes nuevos desde la web.

- Base: `nigdiz_local`, en `127.0.0.1:55432`.
- Datos persistentes: `.local/postgres/`.
- Secretos y credenciales de prueba: `.local/settings.json`.
- Productos iniciales: copia de `server/database.db` (SQLite), abierta en modo solo lectura. No se copian clientes ni pedidos de esa base.
- Se importa una sola vez. Reiniciar no repone stock ni borra compras o cambios.
- `npm run local:setup` prepara la base sin iniciar la web.
- `npm run dev:server:local` inicia solo el backend local.
- Requisitos: Node 24+, PostgreSQL instalado y dependencias (`npm ci` y `npm ci --prefix server`). En Windows se detecta `C:/Program Files/PostgreSQL/<versión>/bin`; puede especificarse `LOCAL_PG_BIN`.

La instancia de PostgreSQL que ya estaba instalada en Windows no se modifica: se usan sus ejecutables con otro directorio y puerto. `.local/` está ignorada por Git. No borrar esa carpeta si se quieren conservar las pruebas.

## Qué se puede probar

Registro, login, catálogo, edición de productos y stock, carrito, pedidos, comprobantes, mensajes y administración. Para compras locales usar transferencia/efectivo; los datos bancarios son ficticios y **no hay que transferir dinero**. No se cargan credenciales de Mercado Pago en este modo: no permite probar un cobro real. Imágenes externas siguen necesitando Internet.

En un teléfono conectado al mismo Wi-Fi, abrir `http://IP-DE-LA-PC:5173` con la web en marcha (Windows debe permitir el puerto 5173). Las peticiones `/api` pasan por Vite al backend de esta PC; el teléfono no necesita conectarse directamente a PostgreSQL.

## Volver a la conexión de producción antes de publicar

**No hay que cambiar una URL en el código ni revertir estos archivos.** `dev:local` inyecta la conexión local únicamente en los procesos que arranca; no escribe `.env`, no cambia el hosting y no modifica la base remota.

1. Detener `dev:local` con `Ctrl+C` y, si se desea, ejecutar `npm run local:stop`.
2. Compilar normalmente con `npm run build`. No ejecutar el comando de desarrollo local en producción.
3. Mantener en el hosting las variables existentes: `VITE_API_URL` del frontend apuntando al backend remoto; `DATABASE_URL`, `JWT_SECRET` y las variables de pago del backend según su configuración de producción.
4. Revisar `git status`: `.local/`, `.env*` y comprobantes privados no deben subirse. Publicar solo cuando el usuario lo autorice.

Al preparar este entorno no había archivos `.env` con los valores remotos en este checkout. Esos valores no se inventaron ni se reemplazaron: siguen siendo responsabilidad de la configuración existente del hosting. Para ejecutar **desde esta PC** contra la base remota, primero recuperar esos valores del hosting en archivos ignorados por Git; eso es distinto de probar con la base local.

Si se pide “volver a producción antes de subir”, seguir esta sección, conservar la configuración del hosting y verificar el build. No migrar la base local hacia producción ni ejecutar `migrar-datos.js`: ese script contiene un vaciado de tablas del destino.
