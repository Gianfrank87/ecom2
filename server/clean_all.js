import pg from 'pg';
import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

async function clean() {
  const targetEmail = 'gianfrank87@gmail.com';
  console.log(`Eliminando referencias de '${targetEmail}'...`);

  // 1. PostgreSQL Local
  try {
    const settings = JSON.parse(fs.readFileSync('../.local/settings.json', 'utf8'));
    const client = new pg.Client({
      host: '127.0.0.1',
      port: 55432,
      user: 'nigdiz_local',
      password: settings.pgPassword,
      database: 'nigdiz_local'
    });
    await client.connect();
    
    // Obtener id del cliente
    const cRes = await client.query('SELECT id FROM clientes WHERE lower(email) = lower($1)', [targetEmail]);
    for (const row of cRes.rows) {
      await client.query('DELETE FROM carritos WHERE cliente_id = $1', [row.id]);
      await client.query('DELETE FROM pedidos WHERE cliente_id = $1', [row.id]);
    }
    const res = await client.query('DELETE FROM clientes WHERE lower(email) = lower($1)', [targetEmail]);
    console.log(`[PG LOCAL] Eliminadas ${res.rowCount} cuenta(s).`);
    await client.end();
  } catch (err) {
    console.error('[PG LOCAL ERROR]', err.message);
  }

  // 2. SQLite local database.db
  try {
    if (fs.existsSync('./database.db')) {
      const db = new DatabaseSync('./database.db');
      db.exec('PRAGMA foreign_keys = OFF;');
      const stmt = db.prepare('DELETE FROM clientes WHERE lower(email) = lower(?)');
      const res = stmt.run(targetEmail);
      db.exec('PRAGMA foreign_keys = ON;');
      db.close();
      console.log(`[SQLITE] Eliminadas ${res.changes} cuenta(s).`);
    }
  } catch (err) {
    console.error('[SQLITE ERROR]', err.message);
  }

  console.log('¡Limpieza realizada con éxito!');
}

clean();
