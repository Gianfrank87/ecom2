import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const migrate = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`
      DO $$
      BEGIN
        CREATE TYPE metodo_pago_enum AS ENUM ('transferencia', 'efectivo', 'mercadopago');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await client.query(`
      ALTER TABLE pedidos
        ADD COLUMN IF NOT EXISTS metodo_pago metodo_pago_enum NOT NULL DEFAULT 'transferencia',
        ADD COLUMN IF NOT EXISTS recargo_aplicado NUMERIC(12, 2) NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS comprobante_url TEXT;
    `);
    await client.query(`
      DO $$
      DECLARE
        estado_constraint TEXT;
        estado_type TEXT;
      BEGIN
        SELECT t.typname INTO estado_type
        FROM pg_attribute a
        JOIN pg_class c ON c.oid = a.attrelid
        JOIN pg_type t ON t.oid = a.atttypid
        WHERE c.relname = 'pedidos' AND a.attname = 'estado' AND t.typtype = 'e';
        IF estado_type IS NOT NULL THEN
          EXECUTE format('ALTER TYPE %I ADD VALUE IF NOT EXISTS ''esperando_aprobacion''', estado_type);
          EXECUTE format('ALTER TYPE %I ADD VALUE IF NOT EXISTS ''pago_rechazado''', estado_type);
        ELSE
          FOR estado_constraint IN
            SELECT conname
            FROM pg_constraint
            WHERE conrelid = 'pedidos'::regclass
              AND contype = 'c'
              AND pg_get_constraintdef(oid) ILIKE '%estado%'
          LOOP
            EXECUTE format('ALTER TABLE pedidos DROP CONSTRAINT %I', estado_constraint);
          END LOOP;
          ALTER TABLE pedidos
            ADD CONSTRAINT pedidos_estado_check
            CHECK (estado IN ('pendiente', 'esperando_aprobacion', 'pago_rechazado', 'enviado', 'completado'));
        END IF;
      END $$;
    `);
    await client.query(`
      DO $$
      BEGIN
        ALTER TABLE pedidos
          ADD CONSTRAINT pedidos_recargo_aplicado_no_negativo
          CHECK (recargo_aplicado >= 0);
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await client.query('COMMIT');
    console.log('Migración de métodos de pago aplicada correctamente.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('No se pudo aplicar la migración de métodos de pago.');
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
};

migrate();
