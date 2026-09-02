import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('Falta DATABASE_URL. Definila antes de ejecutar esta migración.');
}

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const newCategories = ['collares', 'correas', 'alimentos', 'juguetes', 'consejos'];
const oldCategories = ['accesorios', 'higiene', 'salud'];

const client = await pool.connect();

try {
  await client.query('BEGIN');

  const references = await client.query(
    `SELECT DISTINCT p.id, p.nombre
     FROM productos p
     INNER JOIN pedido_items pi ON pi.producto_id = p.id
     WHERE p.categoria = ANY($1::text[])`,
    [oldCategories]
  );

  await client.query(
    `WITH current_max AS (
       SELECT COALESCE(MAX(id), 0) AS id FROM categorias
     ),
     requested (nombre, position) AS (
       SELECT nombre, position
       FROM unnest($1::text[]) WITH ORDINALITY AS values(nombre, position)
     )
     INSERT INTO categorias (id, nombre)
     SELECT current_max.id + requested.position, requested.nombre
     FROM current_max CROSS JOIN requested
     ON CONFLICT (nombre) DO NOTHING`,
    [newCategories]
  );

  if (references.rows.length > 0) {
    await client.query(
      `UPDATE productos
       SET categoria = 'consejos', activo = FALSE
       WHERE id = ANY($1::bigint[])`,
      [references.rows.map((product) => product.id)]
    );
  }

  const deletedProducts = await client.query(
    `DELETE FROM productos
     WHERE categoria = ANY($1::text[])
       AND activo = TRUE
     RETURNING id, nombre`,
    [oldCategories]
  );


  await client.query(
    `SELECT setval(
       'public.categorias_id_seq',
       COALESCE((SELECT MAX(id) FROM categorias), 1),
       true
     )`
  );
  await client.query(
    'DELETE FROM categorias WHERE nombre = ANY($1::text[])',
    [oldCategories]
  );

  await client.query('COMMIT');
  console.log(`Migración completada. Productos eliminados: ${deletedProducts.rowCount}. Productos archivados por historial: ${references.rows.length}. Categorías activas: ${newCategories.join(', ')}.`);
} catch (error) {
  await client.query('ROLLBACK');
  console.error(error.message);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
