# NigDiz

Tienda online para mascotas: React + Vite y Node.js + Express + MariaDB 10.6.

La migracion mantiene las tablas, rutas y respuestas de la API. El backend usa
mysql2 y archivos privados locales para comprobantes; PostgreSQL y Supabase ya
no son necesarios para nuevas operaciones. El frontend esta preparado para la
API de Towebs; su publicacion manual se describe en TOWEBS.md.

## Towebs

La base ya importada es seholaco_ecommerce en localhost:3306. Las instrucciones
para subir manualmente, instalar dependencias, configurar variables y reiniciar
estan en [TOWEBS.md](TOWEBS.md). Ejemplo sin secretos: [server/.env.example](server/.env.example).

El backend verifica conexion, tablas y motor InnoDB directamente en MariaDB al
arrancar, sin aplicar DDL ni leer archivos SQL. Subir el contenido de server/ a
nigdiz-api; no hace falta subir Base de datos/. Instalar las dependencias de
server/package.json. La estructura MariaDB importada no requiere cambios para
esta version. Los cambios futuros de estructura se aplican con migraciones
explicitas y destino confirmado.

## Desarrollo y comprobaciones

Ver [ENTORNO-LOCAL.md](ENTORNO-LOCAL.md) para MariaDB aislada y sus binarios.

```bash
npm run local:setup
npm run dev:local
npm run test:mariadb
npm run build
npm run lint
npm run package:towebs
npm run local:stop
```

Con variables MariaDB configuradas en el .env privado de la raiz:

```bash
npm run db:check
npm run dev:server
```

Desde server/, el equivalente es npm run db:check y npm start con las variables
del panel o un .env en el directorio de trabajo.

`npm run package:towebs` compila el frontend y genera `.local/entregas/frontend.zip`
y `.local/entregas/backend.zip`. Requiere Windows/PowerShell y verifica que las
rutas ZIP usen `/` para que Towebs extraiga las carpetas correctamente. Las
entregas incluyen solo archivos necesarios, sin secretos ni datos privados.

## Frontend y servicios externos

VITE_API_URL es la unica variable de API del frontend, incluye /api y se incorpora
al compilar. El valor predeterminado es /api: produccion consulta
https://nigdiz.com.ar/api y Vite proxifica /api a http://127.0.0.1:5000 en desarrollo.
client/public/.htaccess excluye /api del fallback y permite abrir rutas React
directamente en Apache; el build lo copia junto al index.html. El panel debe
montar Passenger en /api conservando la carpeta privada nigdiz-api.
Ver TOWEBS.md para el procedimiento completo y las verificaciones.

La sesion usa JWT en Authorization: Bearer, sin cookies. CLIENT_URL define el
retorno de Mercado Pago si no hay un Origin permitido, FRONTEND_URL el enlace de
los emails y CORS_ORIGINS agrega origenes permitidos separados por comas.

MP_NOTIFICATION_URL y el dashboard de Mercado Pago deben apuntar al webhook
https://nigdiz.com.ar/api/webhooks/mercadopago. Mantener MP_WEBHOOK_SECRET en produccion.
El proveedor de email sigue usando SMTP/Resend; sin SMTP_PASS se simula el envio.

Los secretos, datos locales y comprobantes privados quedan fuera de Git.
server/uploads/comprobantes debe persistir y respaldarse en el hosting, fuera de
las carpetas publicas. Antes de publicar, ejecutar build y revisar git status.
