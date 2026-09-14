import dotenv from 'dotenv';
import pg from 'pg';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '.env') });

if (!process.env.DATABASE_URL) {
  console.error('Error: Falta DATABASE_URL en el archivo .env');
  process.exit(1);
}

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function resetTestData() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Borrar mensajes
    const messages = await client.query('DELETE FROM mensajes');

    // 2. Borrar items de pedidos
    const items = await client.query('DELETE FROM pedido_items');

    // 3. Borrar pedidos
    const orders = await client.query('DELETE FROM pedidos');

    // 4. Borrar usuarios de prueba que no sean administradores
    const users = await client.query(
      "DELETE FROM clientes WHERE rol != 'admin' AND email NOT IN ('gianfrank87@gmail.com', 'admin@huellitas.local')"
    );

    // 5. Reiniciar secuencias de ID de pedidos, items y mensajes a 1
    await client.query("SELECT setval('pedidos_id_seq', 1, false)");
    await client.query("SELECT setval('pedido_items_id_seq', 1, false)");
    await client.query("SELECT setval('mensajes_id_seq', 1, false)");
    await client.query(
      "SELECT setval('clientes_id_seq', COALESCE((SELECT MAX(id) FROM clientes), 1), true)"
    );

    await client.query('COMMIT');

    console.log('✅ Base de datos limpiada con éxito:');
    console.log(`   - Mensajes eliminados: ${messages.rowCount}`);
    console.log(`   - Items de pedidos eliminados: ${items.rowCount}`);
    console.log(`   - Pedidos/Ventas eliminados: ${orders.rowCount}`);
    console.log(`   - Cuentas de clientes de prueba eliminadas: ${users.rowCount}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error al resetear los datos:', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

resetTestData();

