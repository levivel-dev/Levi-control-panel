const db = require('../utils/db');

const createBot = async ({ name, botType, status, config }) => {
  const query = `
    INSERT INTO bots (name, bot_type, status, config, created_at, updated_at)
    VALUES ($1, $2, $3, $4, NOW(), NOW())
    RETURNING id,
      name,
      bot_type AS "botType",
      status,
      config,
      last_seen_at AS "lastSeenAt",
      created_at AS "createdAt",
      updated_at AS "updatedAt";
  `;

  const { rows } = await db.query(query, [name, botType, status, config]);
  return rows[0];
};

const listBots = async () => {
  const query = `
    SELECT id,
      name,
      bot_type AS "botType",
      status,
      config,
      last_seen_at AS "lastSeenAt",
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM bots
    ORDER BY created_at DESC;
  `;

  const { rows } = await db.query(query);
  return rows;
};

const getBotById = async (id) => {
  const query = `
    SELECT id,
      name,
      bot_type AS "botType",
      status,
      config,
      last_seen_at AS "lastSeenAt",
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM bots
    WHERE id = $1;
  `;

  const { rows } = await db.query(query, [id]);
  return rows[0];
};

const updateBotStatus = async (id, status) => {
  const query = `
    UPDATE bots
    SET status = $2,
        last_seen_at = NOW(),
        updated_at = NOW()
    WHERE id = $1
    RETURNING id,
      name,
      bot_type AS "botType",
      status,
      config,
      last_seen_at AS "lastSeenAt",
      created_at AS "createdAt",
      updated_at AS "updatedAt";
  `;

  const { rows } = await db.query(query, [id, status]);
  return rows[0];
};

const createBotLog = async ({ botId, level, message }) => {
  const query = `
    INSERT INTO bot_logs (bot_id, level, message, created_at)
    VALUES ($1, $2, $3, NOW())
    RETURNING id;
  `;

  const { rows } = await db.query(query, [botId, level, message]);
  return rows[0];
};

const getBotLogs = async (botId, limit = 50) => {
  const query = `
    SELECT id,
      bot_id AS "botId",
      level,
      message,
      created_at AS "createdAt"
    FROM bot_logs
    WHERE bot_id = $1
    ORDER BY created_at DESC
    LIMIT $2;
  `;

  const { rows } = await db.query(query, [botId, limit]);
  return rows;
};

module.exports = {
  createBot,
  listBots,
  getBotById,
  updateBotStatus,
  createBotLog,
  getBotLogs
};
