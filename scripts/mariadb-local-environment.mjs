import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { spawn, spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const local = path.join(root, '.local');
const data = path.join(local, 'mariadb');
const requireServer = createRequire(path.join(root, 'server/package.json'));
const mysql = requireServer('mysql2/promise');
const command = process.argv[2];
if (!['setup', 'dev', 'server', 'stop'].includes(command)) throw Error('Usar setup, dev, server o stop.');
fs.mkdirSync(local, { recursive: true });
const settingsFile = path.join(local, 'mariadb-settings.json');
if (!fs.existsSync(settingsFile)) {
  if (command === 'stop') process.exit(0);
  fs.writeFileSync(settingsFile, JSON.stringify({
    dbPassword: crypto.randomBytes(24).toString('hex'),
    jwtSecret: crypto.randomBytes(48).toString('hex'),
    adminPassword: crypto.randomBytes(12).toString('base64url'),
    clientPassword: crypto.randomBytes(12).toString('base64url'),
  }, null, 2), { mode: 0o600, flag: 'wx' });
}
const settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
const bin = process.env.LOCAL_MARIADB_BIN || path.join(local, 'mariadb-bin/mariadb-10.6.28-winx64/bin');
const executable = name => path.join(bin, `${name}${process.platform === 'win32' ? '.exe' : ''}`);
const options = { host: '127.0.0.1', port: 55433, user: 'root', password: settings.dbPassword, timezone: 'Z', connectTimeout: 2000 };
const verifyLocal = async connection => {
  const [[row]] = await connection.query('SELECT @@datadir AS location');
  if (path.resolve(row.location).toLowerCase() !== data.toLowerCase()) throw Error('La instancia MariaDB no pertenece a .local/mariadb de este proyecto.');
};

if (command === 'stop') {
  let connection;
  try {
    connection = await mysql.createConnection(options);
    await verifyLocal(connection);
    await connection.query('SHUTDOWN');
    console.log('MariaDB local detenida. Los datos se conservan.');
  } catch (error) {
    if (error.code !== 'ECONNREFUSED') throw error;
  } finally { if (connection) await connection.end(); }
  process.exit(0);
}

if (!fs.existsSync(executable('mariadbd'))) throw Error('Configurar LOCAL_MARIADB_BIN con los binarios MariaDB. Ver ENTORNO-LOCAL.md.');
if (!fs.existsSync(path.join(data, 'mysql'))) {
  if (process.platform !== 'win32') throw Error('Inicializar .local/mariadb con mariadb-install-db antes de continuar en este sistema.');
  const initialized = spawnSync(executable('mariadb-install-db'), [`--datadir=${data}`, `--password=${settings.dbPassword}`, '--port=55433', '--silent'], {
    cwd: root, windowsHide: true, encoding: 'utf8', timeout: 60000,
  });
  if (initialized.error || initialized.status !== 0) throw Error(`No se pudo inicializar MariaDB local: ${initialized.error?.message || initialized.stderr}`);
}
let connection;
try { connection = await mysql.createConnection(options); }
catch (error) {
  if (error.code !== 'ECONNREFUSED') throw error;
  const log = fs.openSync(path.join(local, 'mariadb-process.log'), 'a');
  const server = spawn(executable('mariadbd'), ['--no-defaults', `--basedir=${path.dirname(bin)}`, `--datadir=${data}`, '--bind-address=127.0.0.1', '--port=55433', '--default-time-zone=+00:00'], {
    cwd: root, windowsHide: true, detached: true, stdio: ['ignore', log, log],
  });
  server.unref();
  fs.closeSync(log);
  for (let attempt = 0; attempt < 40; attempt++) {
    await new Promise(resolve => setTimeout(resolve, 250));
    try { connection = await mysql.createConnection(options); break; } catch { /* Wait for startup. */ }
  }
  if (!connection) throw Error('MariaDB local no inicio. Revisar .local/mariadb-process.log.');
}
try {
  await verifyLocal(connection);
  await connection.query('CREATE DATABASE IF NOT EXISTS nigdiz_local CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
} finally { await connection.end(); }
const db = await mysql.createConnection({ ...options, database: 'nigdiz_local', multipleStatements: true });
try {
  await db.query(fs.readFileSync(path.join(root, 'Base de datos/nigdiz_mysql.sql'), 'utf8'));
  for (const category of ['collares', 'correas', 'alimentos', 'juguetes', 'consejos']) {
    await db.execute('INSERT INTO categorias (nombre) VALUES (?) ON DUPLICATE KEY UPDATE nombre = VALUES(nombre)', [category]);
  }
  const bcrypt = requireServer('bcryptjs');
  for (const [name, email, password, role] of [
    ['Admin local', 'admin@nigdiz.test', settings.adminPassword, 'admin'],
    ['Cliente local', 'cliente@nigdiz.test', settings.clientPassword, 'cliente'],
  ]) {
    await db.execute('INSERT INTO clientes (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE email = VALUES(email)', [name, email, await bcrypt.hash(password, 10), role]);
  }
} finally { await db.end(); }
fs.writeFileSync(path.join(local, 'ACCESOS-MARIADB.md'), `# Accesos locales MariaDB\n\nWeb: http://localhost:5173\n\nAdmin: admin@nigdiz.test\nPassword: ${settings.adminPassword}\n\nCliente: cliente@nigdiz.test\nPassword: ${settings.clientPassword}\n\nBase: nigdiz_local en 127.0.0.1:55433. Datos en .local/mariadb.\n`, { mode: 0o600 });
console.log('MariaDB LOCAL: 127.0.0.1:55433/nigdiz_local. Accesos en .local/ACCESOS-MARIADB.md.');
if (command === 'setup') process.exit(0);

const env = {
  ...process.env, NODE_ENV: 'development', DB_HOST: '127.0.0.1', DB_PORT: '55433',
  DB_USER: 'root', DB_PASSWORD: settings.dbPassword, DB_NAME: 'nigdiz_local',
  JWT_SECRET: settings.jwtSecret, PORT: '5000', CLIENT_URL: 'http://localhost:5173',
  FRONTEND_URL: 'http://localhost:5173', RECEIPTS_STORAGE: 'local',
  MP_ACCESS_TOKEN: '', MP_WEBHOOK_SECRET: '', SMTP_PASS: '',
};
const children = [];
let stopping = false;
const shutdown = (code = 0) => {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill();
  process.exitCode = code;
};
const launch = (args, cwd, childEnv) => {
  const child = spawn(process.execPath, args, { cwd, env: childEnv, windowsHide: true, stdio: 'inherit' });
  children.push(child);
  child.on('error', error => { console.error(error.message); shutdown(1); });
  child.on('exit', code => shutdown(code || 0));
};
process.on('SIGINT', () => shutdown());
process.on('SIGTERM', () => shutdown());
launch(['server/index.js'], root, env);
if (command === 'dev') launch([path.join(root, 'node_modules/vite/bin/vite.js'), '--host', '127.0.0.1', '--port', '5173', '--strictPort'], path.join(root, 'client'), { ...process.env, VITE_API_URL: '/api' });
