import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const defaults = [
  ['banco_alias', ''],
  ['banco_cbu', ''],
  ['banco_titular', ''],
];

const migrate = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`
      CREATE TABLE IF NOT EXISTS configuraciones (
        clave VARCHAR(100) PRIMARY KEY,
        valor TEXT NOT NULL DEFAULT ''
      )
    `);
    for (const [key, value] of defaults) {
      await client.query(
        'INSERT INTO configuraciones (clave, valor) VALUES ($1, $2) ON CONFLICT (clave) DO NOTHING',
        [key, value]
      );
    }
    await client.query('COMMIT');
    console.log('Migración de configuración bancaria aplicada correctamente.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('No se pudo aplicar la migración de configuración bancaria.');
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
};

migrate();
