import { closeDatabase } from './db.js';
import { validateDatabaseSchema } from './schema.js';

try {
  const identity = await validateDatabaseSchema();
  console.log(`Conexion y esquema correctos: ${identity.name} (${identity.version}). No se modificaron datos.`);
} catch (error) {
  console.error(`No se pudo validar MariaDB: ${error.code || error.message}`);
  process.exitCode = 1;
} finally {
  await closeDatabase();
}
