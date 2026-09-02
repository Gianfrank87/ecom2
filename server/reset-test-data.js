import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('Falta DATABASE_URL.');
}

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();

try {
  await client.query('BEGIN');

  const messages = await client.query('DELETE FROM mensajes');
  const items = await client.query('DELETE FROM pedido_items');
  const orders = await client.query('DELETE FROM pedidos');
  const users = await client.query(
    "DELETE FROM clientes WHERE email NOT IN ('gianfrank87@gmail.com', 'admin@huellitas.local')"
  );

  await client.query("SELECT setval('pedidos_id_seq', 1, false)");
  await client.query("SELECT setval('pedido_items_id_seq', 1, false)");
  await client.query("SELECT setval('mensajes_id_seq', 1, false)");
  await client.query(
    "SELECT setval('clientes_id_seq', COALESCE((SELECT MAX(id) FROM clientes), 1), true)"
  );

  await client.query('COMMIT');
  console.log({
    mensajesEliminados: messages.rowCount,
    itemsEliminados: items.rowCount,
    pedidosEliminados: orders.rowCount,
    cuentasEliminadas: users.rowCount,
  });
} catch (error) {
  await client.query('ROLLBACK');
  console.error(error.message);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
