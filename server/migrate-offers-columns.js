import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const migrateOffers = async () => {
  const client = await pool.connect();
  try {
    console.log('Verificando tabla ofertas...');

    // Comprobar si la tabla existe
    const tableExists = await client.query(
      `SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'ofertas'
      )`
    );

    if (!tableExists.rows[0].exists) {
      console.log('❌ Tabla ofertas no existe. Créala primero en tu base de datos.');
      return;
    }

    // Comprobar y agregar columna desactivada_por_stock
    const col1 = await client.query(
      `SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ofertas' AND column_name = 'desactivada_por_stock'
      )`
    );

    if (!col1.rows[0].exists) {
      console.log('Agregando columna desactivada_por_stock...');
      await client.query(
        `ALTER TABLE ofertas ADD COLUMN desactivada_por_stock BOOLEAN DEFAULT FALSE`
      );
      console.log('✅ Columna desactivada_por_stock agregada');
    } else {
      console.log('✓ Columna desactivada_por_stock ya existe');
    }

    // Comprobar y agregar columna producto_sin_stock_id
    const col2 = await client.query(
      `SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ofertas' AND column_name = 'producto_sin_stock_id'
      )`
    );

    if (!col2.rows[0].exists) {
      console.log('Agregando columna producto_sin_stock_id...');
      await client.query(
        `ALTER TABLE ofertas ADD COLUMN producto_sin_stock_id INTEGER`
      );
      console.log('✅ Columna producto_sin_stock_id agregada');
    } else {
      console.log('✓ Columna producto_sin_stock_id ya existe');
    }

    // Comprobar y agregar columna producto_sin_stock_nombre
    const col3 = await client.query(
      `SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ofertas' AND column_name = 'producto_sin_stock_nombre'
      )`
    );

    if (!col3.rows[0].exists) {
      console.log('Agregando columna producto_sin_stock_nombre...');
      await client.query(
        `ALTER TABLE ofertas ADD COLUMN producto_sin_stock_nombre VARCHAR(255)`
      );
      console.log('✅ Columna producto_sin_stock_nombre agregada');
    } else {
      console.log('✓ Columna producto_sin_stock_nombre ya existe');
    }

    console.log('\n✅ Migración de ofertas completada exitosamente');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error durante la migración:', err.message);
    process.exit(1);
  } finally {
    client.release();
    pool.end();
  }
};

migrateOffers();
