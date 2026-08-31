import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('Falta DATABASE_URL en el .env.');
}

const pool = new Pool({ connectionString: DATABASE_URL });

const statements = [
  `ALTER TABLE productos ALTER COLUMN activo TYPE BOOLEAN USING CASE WHEN CAST(activo AS TEXT) IN ('1', 't', 'true', 'yes', 'y') THEN TRUE ELSE FALSE END;`,
  `ALTER TABLE productos ALTER COLUMN destacado TYPE BOOLEAN USING CASE WHEN CAST(destacado AS TEXT) IN ('1', 't', 'true', 'yes', 'y') THEN TRUE ELSE FALSE END;`,
  `ALTER TABLE ofertas ALTER COLUMN activa TYPE BOOLEAN USING CASE WHEN CAST(activa AS TEXT) IN ('1', 't', 'true', 'yes', 'y') THEN TRUE ELSE FALSE END;`,
  `ALTER TABLE ofertas ALTER COLUMN desactivada_por_stock TYPE BOOLEAN USING CASE WHEN CAST(desactivada_por_stock AS TEXT) IN ('1', 't', 'true', 'yes', 'y') THEN TRUE ELSE FALSE END;`,
  `ALTER TABLE mensajes ALTER COLUMN leido TYPE BOOLEAN USING CASE WHEN CAST(leido AS TEXT) IN ('1', 't', 'true', 'yes', 'y') THEN TRUE ELSE FALSE END;`,
  `ALTER TABLE mensajes ALTER COLUMN cerrado TYPE BOOLEAN USING CASE WHEN CAST(cerrado AS TEXT) IN ('1', 't', 'true', 'yes', 'y') THEN TRUE ELSE FALSE END;`,
];

const main = async () => {
  for (const sql of statements) {
    await pool.query(sql);
  }

  console.log('✅ Columnas booleanas corregidas en PostgreSQL.');
};

main()
  .then(() => pool.end())
  .catch((error) => {
    console.error('❌ Error al corregir booleanos:', error);
    pool.end();
    process.exit(1);
  });
