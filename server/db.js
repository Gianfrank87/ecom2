import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const normalizeQuery = (sql, params = []) => {
  if (!sql || /\$\d+/.test(sql)) {
    return { sql, params };
  }

  let index = 0;
  const normalizedSql = sql.replace(/\?/g, () => {
    index += 1;
    return `$${index}`;
  });

  return { sql: normalizedSql, params };
};

export const dbRun = async (sql, params = []) => {
  const { sql: normalizedSql, params: normalizedParams } = normalizeQuery(sql, params);
  const client = await pool.connect();

  try {
    const result = await client.query(normalizedSql, normalizedParams);

    let lastID = null;
    if (result.rows && result.rows.length > 0) {
      const row = result.rows[0];
      lastID = row.id ?? row.lastid ?? row.last_val ?? null;
    }

    if (lastID === null && /^\s*INSERT\b/i.test(sql)) {
      const sequenceResult = await client.query('SELECT lastval() AS id');
      lastID = sequenceResult.rows?.[0]?.id ?? null;
    }

    return {
      lastID,
      changes: result.rowCount,
      rowCount: result.rowCount,
      rows: result.rows,
    };
  } finally {
    client.release();
  }
};

export const dbAll = async (sql, params = []) => {
  const { sql: normalizedSql, params: normalizedParams } = normalizeQuery(sql, params);
  const client = await pool.connect();

  try {
    const result = await client.query(normalizedSql, normalizedParams);
    return result.rows;
  } finally {
    client.release();
  }
};

export const dbGet = async (sql, params = []) => {
  const { sql: normalizedSql, params: normalizedParams } = normalizeQuery(sql, params);
  const client = await pool.connect();

  try {
    const result = await client.query(normalizedSql, normalizedParams);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
};
