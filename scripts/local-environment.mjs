import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { spawn, spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const local = path.join(root, '.local');
const data = path.join(local, 'postgres');
const settingsFile = path.join(local, 'settings.json');
const requireServer = createRequire(path.join(root, 'server/package.json'));
const command = process.argv[2];
if (!['setup', 'dev', 'server', 'stop'].includes(command)) throw Error('Usar setup, dev, server o stop.');
fs.mkdirSync(local, { recursive: true });
if (!fs.existsSync(settingsFile)) {
  if (command === 'stop') process.exit(0);
  fs.writeFileSync(settingsFile, JSON.stringify({
    pgPassword: crypto.randomBytes(24).toString('hex'),
    jwtSecret: crypto.randomBytes(48).toString('hex'),
    adminPassword: crypto.randomBytes(9).toString('base64url'),
    clientPassword: crypto.randomBytes(9).toString('base64url'),
  }, null, 2), { mode: 0o600, flag: 'wx' });
}
const settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
const pgRoot = 'C:/Program Files/PostgreSQL';
const standardPgBin = fs.existsSync(pgRoot)
  ? path.join(pgRoot, fs.readdirSync(pgRoot).sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))[0], 'bin')
  : '';
const pgBin = process.env.LOCAL_PG_BIN
  || (fs.existsSync('D:/POSTGRESQL/bin') ? 'D:/POSTGRESQL/bin' : standardPgBin);
const executable = name => path.join(pgBin, `${name}${process.platform === 'win32' ? '.exe' : ''}`);
const run = (name, args, allowFailure = false) => {
  const result = spawnSync(executable(name), args, {
    cwd: root, windowsHide: true, encoding: 'utf8', timeout: 60000,
    // PostgreSQL keeps inherited pipe handles open on Windows after pg_ctl exits.
    stdio: name === 'pg_ctl' && args.includes('start') ? 'ignore' : 'pipe',
  });
  if (!allowFailure && (result.error || result.status !== 0)) {
    throw Error(`${name}: ${result.error?.message || result.stderr || result.stdout}`);
  }
  return result;
};

if (command === 'stop') {
  if (fs.existsSync(path.join(data, 'PG_VERSION')) && run('pg_ctl', ['-D', data, 'status'], true).status === 0) {
    run('pg_ctl', ['-D', data, '-m', 'fast', '-w', 'stop']);
  }
  console.log('PostgreSQL de pruebas detenido. Los datos se conservan.');
  process.exit(0);
}

if (!fs.existsSync(path.join(data, 'PG_VERSION'))) {
  const passwordFile = path.join(local, 'init-password');
  fs.writeFileSync(passwordFile, settings.pgPassword, { mode: 0o600 });
  try {
    run('initdb', ['-D', data, '-U', 'nigdiz_local', '--pwfile', passwordFile, '--auth=scram-sha-256', '--encoding=UTF8', '--locale=C']);
  } finally { fs.unlinkSync(passwordFile); }
}
if (run('pg_ctl', ['-D', data, 'status'], true).status !== 0) {
  const start = run('pg_ctl', ['-D', data, '-l', path.join(local, 'postgres.log'), '-o', '-h 127.0.0.1 -p 55432', '-w', 'start'], true);
  if (start.status !== 0) {
    if (process.platform !== 'win32') throw Error(`pg_ctl: ${start.error?.message || start.stderr || start.stdout}`);
    const postgres = spawn(executable('postgres'), ['-D', data, '-h', '127.0.0.1', '-p', '55432'], {
      cwd: root,
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
    });
    postgres.unref();
    await new Promise(resolve => setTimeout(resolve, 1200));
  }
}

const { Client } = requireServer('pg');
const dbOptions = { host: '127.0.0.1', port: 55432, user: 'nigdiz_local', password: settings.pgPassword, connectionTimeoutMillis: 5000 };
const maintenance = new Client({ ...dbOptions, database: 'postgres' });
await maintenance.connect();
try {
  const location = (await maintenance.query('SHOW data_directory')).rows[0].data_directory;
  if (path.resolve(location).toLowerCase() !== data.toLowerCase()) throw Error('La instancia de PostgreSQL no pertenece a este proyecto.');
  if (!(await maintenance.query("SELECT 1 FROM pg_database WHERE datname = 'nigdiz_local'")).rowCount) {
    await maintenance.query('CREATE DATABASE nigdiz_local');
  }
} finally { await maintenance.end(); }

const db = new Client({ ...dbOptions, database: 'nigdiz_local' });
await db.connect();
try {
  await db.query('BEGIN');
  await db.query(fs.readFileSync(path.join(root, 'server/local/schema.sql'), 'utf8'));
  const seeded = (await db.query("SELECT 1 FROM configuraciones WHERE clave = 'local_seed_v1'")).rowCount;
  if (!seeded) {
    const { DatabaseSync } = await import('node:sqlite');
    const source = new DatabaseSync(path.join(root, 'server/database.db'), { readOnly: true });
    let products;
    try { products = source.prepare('SELECT * FROM productos ORDER BY id').all(); } finally { source.close(); }
    for (const category of new Set(['collares', 'correas', 'alimentos', 'juguetes', 'consejos', ...products.map(p => p.categoria)])) {
      await db.query('INSERT INTO categorias(nombre) VALUES ($1) ON CONFLICT DO NOTHING', [category]);
    }
    for (const p of products) {
      await db.query(`INSERT INTO productos(id,nombre,descripcion,precio,stock,categoria,imagen_url,activo,destacado,orden)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT (id) DO NOTHING`,
      [p.id, p.nombre, p.descripcion, p.precio, p.stock, p.categoria, p.imagen_url, Boolean(p.activo), Boolean(p.destacado), p.orden ?? p.id]);
    }
    await db.query("SELECT setval(pg_get_serial_sequence('productos','id'), COALESCE(MAX(id),1), COUNT(*) > 0) FROM productos");
    const bcrypt = requireServer('bcryptjs');
    for (const [name, email, password, role] of [
      ['Admin Local', 'admin@nigdiz.test', settings.adminPassword, 'admin'],
      ['Cliente Local', 'cliente@nigdiz.test', settings.clientPassword, 'cliente'],
    ]) {
      await db.query('INSERT INTO clientes(nombre,email,password_hash,rol) VALUES ($1,$2,$3,$4) ON CONFLICT (email) DO NOTHING',
        [name, email, await bcrypt.hash(password, 10), role]);
    }
    for (const [key, value] of [['banco_alias', 'PRUEBA.LOCAL.NO.TRANSFERIR'], ['banco_cbu', '0000000000000000000000'], ['banco_titular', 'ENTORNO DE PRUEBAS'], ['local_seed_v1', '1']]) {
      await db.query('INSERT INTO configuraciones(clave,valor) VALUES ($1,$2) ON CONFLICT DO NOTHING', [key, value]);
    }
    console.log(`Importados ${products.length} productos de SQLite. Creadas dos cuentas de prueba.`);
  }
  await db.query('COMMIT');
} catch (error) {
  await db.query('ROLLBACK');
  throw error;
} finally { await db.end(); }

fs.writeFileSync(path.join(local, 'ACCESOS.md'), `# Accesos exclusivos del entorno local\n\nWeb: http://localhost:5173\n\n- Admin: admin@nigdiz.test\n- Contraseña admin: ${settings.adminPassword}\n- Cliente: cliente@nigdiz.test\n- Contraseña cliente: ${settings.clientPassword}\n\nBase: nigdiz_local en 127.0.0.1:55432.\nLos datos persisten en .local/postgres. No subir esta carpeta a Git.\n`, { mode: 0o600 });
console.log('Base LOCAL: 127.0.0.1:55432/nigdiz_local. Accesos en .local/ACCESOS.md.');
if (command === 'setup') process.exit(0);

// Overrides exist only in child processes. Existing .env / hosting secrets stay untouched.
const serverEnvPath = path.join(root, 'server', '.env');
let serverEnvVars = {};
if (fs.existsSync(serverEnvPath)) {
  const envContent = fs.readFileSync(serverEnvPath, 'utf8');
  for (const line of envContent.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.substring(0, idx).trim();
      let val = trimmed.substring(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.substring(1, val.length - 1);
      }
      serverEnvVars[key] = val;
    }
  }
}

const backendEnv = { 
  ...process.env, 
  ...serverEnvVars,
  NODE_ENV: 'development',
  DATABASE_URL: `postgresql://nigdiz_local:${settings.pgPassword}@127.0.0.1:55432/nigdiz_local`,
  JWT_SECRET: settings.jwtSecret, 
  PORT: '5000', 
  CLIENT_URL: 'http://localhost:5173',
  MP_ACCESS_TOKEN: '', 
  MP_WEBHOOK_SECRET: '',
};
const children = [];
const launch = (args, cwd, env) => {
  const child = spawn(process.execPath, args, { cwd, env, stdio: 'inherit', windowsHide: true });
  children.push(child);
  child.on('error', error => { console.error(error.message); shutdown(1); });
  child.on('exit', code => shutdown(code || 0));
};
let stopping = false;
function shutdown(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill();
  process.exitCode = code;
}
process.on('SIGINT', () => shutdown());
process.on('SIGTERM', () => shutdown());
launch(['server/index.js'], root, backendEnv);
if (command === 'dev') {
  // Wait for the API before opening Vite, especially on a cold Windows start.
  let ready = false;
  const deadline = Date.now() + 90000;
  while (!stopping && Date.now() < deadline) {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/products', { signal: AbortSignal.timeout(1500) });
      if (response.ok) { ready = true; break; }
    } catch { /* The backend is still starting. */ }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  if (ready && !stopping) {
    launch([path.join(root, 'node_modules/vite/bin/vite.js'), '--host', '0.0.0.0', '--port', '5173', '--strictPort'],
      path.join(root, 'client'), { ...process.env, VITE_API_URL: '/api' });
  } else if (!stopping) {
    console.error('El backend local no respondió a tiempo. Revisar su salida e intentar nuevamente.');
    shutdown(1);
  }
}
