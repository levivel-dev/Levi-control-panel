const db = require('../utils/db');

const createAutomation = async ({
  name,
  triggerType,
  triggerEvent,
  scheduleCron,
  actionType,
  actionPayload,
  enabled
}) => {
  const query = `
    INSERT INTO automations (
      name,
      trigger_type,
      trigger_event,
      schedule_cron,
      action_type,
      action_payload,
      enabled,
      created_at,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
    RETURNING
      id,
      name,
      trigger_type AS "triggerType",
      trigger_event AS "triggerEvent",
      schedule_cron AS "scheduleCron",
      action_type AS "actionType",
      action_payload AS "actionPayload",
      enabled,
      created_at AS "createdAt",
      updated_at AS "updatedAt";
  `;

  const { rows } = await db.query(query, [
    name,
    triggerType,
    triggerEvent,
    scheduleCron,
    actionType,
    actionPayload,
    enabled
  ]);

  return rows[0];
};

const listAutomations = async ({ enabled, triggerType } = {}) => {
  const filters = [];
  const params = [];

  if (typeof enabled === 'boolean') {
    params.push(enabled);
    filters.push(`enabled = $${params.length}`);
  }

  if (triggerType) {
    params.push(triggerType);
    filters.push(`trigger_type = $${params.length}`);
  }

  const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

  const query = `
    SELECT
      id,
      name,
      trigger_type AS "triggerType",
      trigger_event AS "triggerEvent",
      schedule_cron AS "scheduleCron",
      action_type AS "actionType",
      action_payload AS "actionPayload",
      enabled,
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM automations
    ${whereClause}
    ORDER BY created_at DESC;
  `;

  const { rows } = await db.query(query, params);
  return rows;
};

const getAutomationById = async (id) => {
  const query = `
    SELECT
      id,
      name,
      trigger_type AS "triggerType",
      trigger_event AS "triggerEvent",
      schedule_cron AS "scheduleCron",
      action_type AS "actionType",
      action_payload AS "actionPayload",
      enabled,
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM automations
    WHERE id = $1;
  `;

  const { rows } = await db.query(query, [id]);
  return rows[0];
};

const listAutomationsByEvent = async (eventName) => {
  const query = `
    SELECT
      id,
      name,
      trigger_type AS "triggerType",
      trigger_event AS "triggerEvent",
      schedule_cron AS "scheduleCron",
      action_type AS "actionType",
      action_payload AS "actionPayload",
      enabled,
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM automations
    WHERE enabled = TRUE
      AND trigger_type = 'event'
      AND trigger_event = $1
    ORDER BY created_at DESC;
  `;

  const { rows } = await db.query(query, [eventName]);
  return rows;
};

const createAutomationRun = async (automationId, status) => {
  const query = `
    INSERT INTO automation_runs (automation_id, status, created_at)
    VALUES ($1, $2, NOW())
    RETURNING id,
      automation_id AS "automationId",
      status,
      created_at AS "createdAt";
  `;

  const { rows } = await db.query(query, [automationId, status]);
  return rows[0];
};

const updateAutomationRun = async (runId, { status, startedAt, finishedAt, errorMessage, output }) => {
  const query = `
    UPDATE automation_runs
    SET status = $2,
        started_at = $3,
        finished_at = $4,
        error_message = $5,
        output = $6
    WHERE id = $1
    RETURNING id,
      automation_id AS "automationId",
      status,
      started_at AS "startedAt",
      finished_at AS "finishedAt",
      error_message AS "errorMessage",
      output,
      created_at AS "createdAt";
  `;

  const { rows } = await db.query(query, [
    runId,
    status,
    startedAt,
    finishedAt,
    errorMessage,
    output
  ]);

  return rows[0];
};

module.exports = {
  createAutomation,
  listAutomations,
  getAutomationById,
  listAutomationsByEvent,
  createAutomationRun,
  updateAutomationRun
};
