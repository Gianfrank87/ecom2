# Entorno local MariaDB

Los comandos activos usan MariaDB 10.6, aislada en 127.0.0.1:55433/nigdiz_local.
No usan la base de Towebs ni modifican .env. Los datos antiguos de PostgreSQL
permanecen en .local/postgres como respaldo, fuera del flujo activo. La base SQLite
anterior se conserva en .local/legacy/sqlite/database.db; no la usa el backend.

## Preparacion en Windows

Instalar dependencias con npm install en la raiz y npm install dentro de server/.
Descomprimir la distribucion ZIP oficial de MariaDB 10.6.28 en:

.local/mariadb-bin/mariadb-10.6.28-winx64/

Alternativamente definir LOCAL_MARIADB_BIN con el directorio bin de MariaDB.
El script necesita mariadbd.exe y mariadb-install-db.exe. No descarga ni instala
servicios de Windows. En otros sistemas, inicializar primero .local/mariadb con
las herramientas oficiales de MariaDB y credenciales del archivo local.

```bash
npm run local:setup
npm run dev:local
```

- Frontend: http://localhost:5173 (proxy /api hacia puerto 5000).
- Backend: http://localhost:5000.
- Credenciales locales: .local/ACCESOS-MARIADB.md.
- Passwords generados: .local/mariadb-settings.json, ignorado por Git.
- Datos persistentes: .local/mariadb/.
- Logs del motor: .local/mariadb-process.log y el archivo .err del directorio de datos.

La primera ejecucion prepara el esquema, cinco categorias y un admin/cliente local.
No crea productos ni pedidos. Las siguientes ejecuciones conservan los registros.
Mercado Pago y el proveedor de email estan desactivados en este flujo local;
ninguna compra de desarrollo realiza una llamada de pago real.

npm run dev:server:local levanta solo la API. npm run local:stop detiene el motor
sin borrar datos, despues de verificar que @@datadir pertenece a este proyecto.
Detener primero el proceso dev para cerrar API/Vite.

## Pruebas de integracion

```bash
npm run local:setup
npm run test:mariadb
```

Las pruebas requieren el motor local activo en 55433. Verifican @@datadir y crean
una base nigdiz_test_<pid>_<aleatorio> exclusiva, que eliminan al finalizar.
No aceptan DB_* ni DATABASE_URL del entorno como destino. Levantan otra API en
un puerto libre, con configuracion de produccion, credenciales ficticias y un
mock de Mercado Pago exclusivo del proceso de pruebas. No usan el frontend.

Para validar la configuracion real del backend sin modificar datos, usar
npm run db:check con DB_* definidos en el .env privado de la raiz. Para Towebs,
seguir TOWEBS.md. No publicar .local, .env ni comprobantes privados.
