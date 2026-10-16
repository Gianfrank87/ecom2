import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

// Explicit DB_* settings take precedence over an old PostgreSQL DATABASE_URL.
const connectionOptions = () => {
  if (process.env.DB_USER) {
    return {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'seholaco_ecommerce',
    };
  }
  const value = process.env.DATABASE_URL;
  if (!value || !/^(mysql|mariadb):\/\//i.test(value)) {
    throw new Error('Configurar DB_USER, DB_PASSWORD y DB_NAME para MariaDB, o DATABASE_URL con protocolo mysql://. PostgreSQL ya no es compatible con el backend.');
  }
  const url = new URL(value);
  return {
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.slice(1)),
  };
};

const pool = mysql.createPool({
  ...connectionOptions(),
  charset: 'utf8mb4',
  timezone: 'Z',
  supportBigNumbers: true,
  bigNumberStrings: true,
  jsonStrings: true,
  typeCast(field, next) {
    if (field.type === 'TINY' && field.length === 1) {
      const value = field.string();
      return value === null ? null : value !== '0';
    }
    return next();
  },
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 5),
  connectTimeout: 10_000,
  multipleStatements: false,
});

const getConnection = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.query("SET time_zone = '+00:00'");
    return connection;
  } catch (error) {
    connection.release();
    throw error;
  }
};

const execute = async (connection, sql, params = []) => {
  const [result] = await connection.execute(sql, params.map(value => value === undefined ? null : value));
  return result;
};

const run = async (connection, sql, params) => {
  const result = await execute(connection, sql, params);
  return {
    lastID: result.insertId ? String(result.insertId) : null,
    changes: result.affectedRows || 0,
    rowCount: result.affectedRows || 0,
    rows: [],
  };
};

const withConnection = async callback => {
  const connection = await getConnection();
  try {
    return await callback(connection);
  } finally {
    connection.release();
  }
};

export const dbRun = (sql, params = []) => withConnection(connection => run(connection, sql, params));
export const dbAll = (sql, params = []) => withConnection(connection => execute(connection, sql, params));
export const dbGet = async (sql, params = []) => (await dbAll(sql, params))[0] || null;
export const closeDatabase = () => pool.end();

export const withTransaction = async callback => {
  const connection = await getConnection();
  const transaction = {
    run: (sql, params = []) => run(connection, sql, params),
    all: (sql, params = []) => execute(connection, sql, params),
    get: async (sql, params = []) => (await execute(connection, sql, params))[0] || null,
  };
  try {
    // Match PostgreSQL's READ COMMITTED behavior; avoid stale offer/stock reads.
    await connection.query('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');
    await connection.beginTransaction();
    const result = await callback(transaction);
    await connection.commit();
    return result;
  } catch (error) {
    try { await connection.rollback(); } catch { /* Preserve the original error. */ }
    throw error;
  } finally {
    connection.release();
  }
};
