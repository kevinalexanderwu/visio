const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

async function initializeDatabase() {
  await pool.query(`CREATE TABLE IF NOT EXISTS simulations (
    id BIGSERIAL PRIMARY KEY,
    minus NUMERIC(4,2) NOT NULL CHECK (minus BETWEEN -10 AND 0),
    plus NUMERIC(4,2) NOT NULL CHECK (plus BETWEEN 0 AND 10),
    cylinder NUMERIC(4,2) NOT NULL CHECK (cylinder BETWEEN -6 AND 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
}

module.exports = { pool, initializeDatabase };
