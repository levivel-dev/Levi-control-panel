const { Pool } = require('pg');
const config = require('./config');

const isDbConfigured = Boolean(config.pg.connectionString);
const pool = isDbConfigured
  ? new Pool({
      connectionString: config.pg.connectionString
    })
  : null;

if (pool) {
  pool.on('error', (err) => {
    console.error('[db] Unexpected error on idle client', err);
  });
}

const query = async (text, params) => {
  if (!pool) {
    throw new Error('DATABASE_URL is not set. Configure PostgreSQL to use the API monitor.');
  }

  return pool.query(text, params);
};

module.exports = {
  pool,
  query,
  isDbConfigured
};
