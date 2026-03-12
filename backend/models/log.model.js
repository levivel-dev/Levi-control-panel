const db = require('../utils/db');

const listLogs = async ({ limit = 60, scope, entityId } = {}) => {
  const params = [limit];
  let scopeFilter = '';
  let entityFilter = '';

  if (scope) {
    params.push(scope);
    scopeFilter = `AND logs.scope = $${params.length}`;
  }

  if (entityId) {
    params.push(`%${entityId}%`);
    entityFilter = `AND CAST(logs.entity_id AS TEXT) ILIKE $${params.length}`;
  }

  const query = `
    SELECT
      logs.id,
      logs.scope,
      logs.level,
      logs.message,
      logs.entity_id AS "entityId",
      logs.timestamp
    FROM (
      SELECT
        api_logs.id,
        'api' AS scope,
        CASE WHEN api_logs.ok THEN 'info' ELSE 'error' END AS level,
        CONCAT(
          COALESCE(apis.name, 'API'),
          ' ',
          CASE WHEN api_logs.ok THEN 'healthy' ELSE 'failed' END,
          CASE WHEN api_logs.status IS NOT NULL THEN CONCAT(' (', api_logs.status, ')') ELSE '' END
        ) AS message,
        api_logs.api_id AS entity_id,
        api_logs.checked_at AS timestamp
      FROM api_logs
      LEFT JOIN apis ON apis.id = api_logs.api_id

      UNION ALL

      SELECT
        bot_logs.id,
        'bot' AS scope,
        bot_logs.level AS level,
        CONCAT(COALESCE(bots.name, 'Bot'), ': ', bot_logs.message) AS message,
        bot_logs.bot_id AS entity_id,
        bot_logs.created_at AS timestamp
      FROM bot_logs
      LEFT JOIN bots ON bots.id = bot_logs.bot_id

      UNION ALL

      SELECT
        automation_runs.id,
        'automation' AS scope,
        CASE
          WHEN automation_runs.status = 'failed' THEN 'error'
          WHEN automation_runs.status = 'running' THEN 'warn'
          ELSE 'info'
        END AS level,
        CONCAT(COALESCE(automations.name, 'Automation'), ' ', automation_runs.status) AS message,
        automation_runs.automation_id AS entity_id,
        COALESCE(automation_runs.finished_at, automation_runs.started_at, automation_runs.created_at) AS timestamp
      FROM automation_runs
      LEFT JOIN automations ON automations.id = automation_runs.automation_id

      UNION ALL

      SELECT
        files.id,
        'file' AS scope,
        'info' AS level,
        CONCAT('File uploaded: ', files.original_name) AS message,
        files.id AS entity_id,
        files.uploaded_at AS timestamp
      FROM files
    ) AS logs
    WHERE 1 = 1
    ${scopeFilter}
    ${entityFilter}
    ORDER BY logs.timestamp DESC
    LIMIT $1;
  `;

  const { rows } = await db.query(query, params);
  return rows;
};

module.exports = {
  listLogs
};
