const fs = require('fs');
const path = require('path');
const db = require('./db');
const logger = require('../services/logger.service');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');

const ensureMigrationsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await db.query(query);
};

const getAppliedMigrations = async () => {
  const { rows } = await db.query('SELECT filename FROM schema_migrations ORDER BY filename;');
  return new Set(rows.map((row) => row.filename));
};

const getMigrationFiles = () => {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    return [];
  }

  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort();
};

const applyMigration = async (filename) => {
  const filepath = path.join(MIGRATIONS_DIR, filename);
  const sql = fs.readFileSync(filepath, 'utf-8');

  await db.query('BEGIN');

  try {
    await db.query(sql);
    await db.query('INSERT INTO schema_migrations (filename) VALUES ($1);', [filename]);
    await db.query('COMMIT');
    logger.info('Migration applied', { filename });
  } catch (err) {
    await db.query('ROLLBACK');
    throw err;
  }
};

const runMigrations = async () => {
  if (!db.isDbConfigured) {
    throw new Error('DATABASE_URL is not set. Cannot run migrations.');
  }

  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();
  const files = getMigrationFiles();

  if (files.length === 0) {
    logger.info('No migrations found.');
    return;
  }

  for (const file of files) {
    if (applied.has(file)) {
      continue;
    }

    await applyMigration(file);
  }

  logger.info('Migrations complete.');
};

runMigrations().catch((err) => {
  logger.error('Migration failed', { error: err.message });
  process.exitCode = 1;
});
