const db = require('../utils/db');

const createApi = async ({ name, url, method, expectedStatus }) => {
  const query = `
    INSERT INTO apis (name, url, method, expected_status, created_at, updated_at)
    VALUES ($1, $2, $3, $4, NOW(), NOW())
    RETURNING id,
      name,
      url,
      method,
      expected_status AS "expectedStatus",
      created_at AS "createdAt",
      updated_at AS "updatedAt";
  `;

  const { rows } = await db.query(query, [name, url, method, expectedStatus]);
  return rows[0];
};

const listApis = async () => {
  const query = `
    SELECT id,
      name,
      url,
      method,
      expected_status AS "expectedStatus",
      last_status AS "lastStatus",
      last_response_time_ms AS "lastResponseTimeMs",
      last_ok AS "lastOk",
      last_checked_at AS "lastCheckedAt",
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM apis
    ORDER BY created_at DESC;
  `;

  const { rows } = await db.query(query);
  return rows;
};

const getApiById = async (id) => {
  const query = `
    SELECT id,
      name,
      url,
      method,
      expected_status AS "expectedStatus",
      last_status AS "lastStatus",
      last_response_time_ms AS "lastResponseTimeMs",
      last_ok AS "lastOk",
      last_checked_at AS "lastCheckedAt",
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM apis
    WHERE id = $1;
  `;

  const { rows } = await db.query(query, [id]);
  return rows[0];
};

const updateApiStatus = async (id, { status, responseTimeMs, ok }) => {
  const query = `
    UPDATE apis
    SET last_status = $2,
        last_response_time_ms = $3,
        last_ok = $4,
        last_checked_at = NOW(),
        updated_at = NOW()
    WHERE id = $1
    RETURNING id,
      name,
      url,
      method,
      expected_status AS "expectedStatus",
      last_status AS "lastStatus",
      last_response_time_ms AS "lastResponseTimeMs",
      last_ok AS "lastOk",
      last_checked_at AS "lastCheckedAt",
      created_at AS "createdAt",
      updated_at AS "updatedAt";
  `;

  const { rows } = await db.query(query, [id, status, responseTimeMs, ok]);
  return rows[0];
};

const createApiLog = async ({ apiId, status, responseTimeMs, ok, errorMessage }) => {
  const query = `
    INSERT INTO api_logs (api_id, status, response_time_ms, ok, error_message, checked_at)
    VALUES ($1, $2, $3, $4, $5, NOW())
    RETURNING id;
  `;

  const { rows } = await db.query(query, [
    apiId,
    status,
    responseTimeMs,
    ok,
    errorMessage || null
  ]);

  return rows[0];
};

const getApiLogs = async (apiId, limit = 50) => {
  const query = `
    SELECT id,
      api_id AS "apiId",
      status,
      response_time_ms AS "responseTimeMs",
      ok,
      error_message AS "errorMessage",
      checked_at AS "checkedAt"
    FROM api_logs
    WHERE api_id = $1
    ORDER BY checked_at DESC
    LIMIT $2;
  `;

  const { rows } = await db.query(query, [apiId, limit]);
  return rows;
};

const getApiAnalytics = async (hours = 24) => {
  const query = `
    SELECT
      apis.id AS "apiId",
      apis.name AS "apiName",
      COUNT(api_logs.id)::int AS "checks",
      COALESCE(SUM(CASE WHEN api_logs.ok THEN 1 ELSE 0 END), 0)::int AS "successes",
      COALESCE(AVG(api_logs.response_time_ms), 0)::float AS "avgResponseTimeMs"
    FROM apis
    LEFT JOIN api_logs
      ON apis.id = api_logs.api_id
      AND api_logs.checked_at >= NOW() - ($1 || ' hours')::interval
    GROUP BY apis.id
    ORDER BY apis.created_at DESC;
  `;

  const { rows } = await db.query(query, [hours]);
  return rows;
};

module.exports = {
  createApi,
  listApis,
  getApiById,
  updateApiStatus,
  createApiLog,
  getApiLogs,
  getApiAnalytics
};
