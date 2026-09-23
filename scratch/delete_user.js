import pg from 'pg';
import fs from 'fs';

async function run() {
  const settings = JSON.parse(fs.readFileSync('.local/settings.json', 'utf8'));
  const client = new pg.Client({
    host: '127.0.0.1',
    port: 55432,
    user: 'nigdiz_local',
    password: settings.pgPassword,
    database: 'nigdiz_local'
  });

  await client.connect();
  const res = await client.query('DELETE FROM clientes WHERE lower(email) = lower($1)', ['gianfrank87@gmail.com']);
  console.log(`[EXITO] Eliminadas ${res.rowCount} cuenta(s) con email gianfrank87@gmail.com de la base de datos local.`);
  await client.end();
}

run().catch(console.error);
