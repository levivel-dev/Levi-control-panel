const db = require('../utils/db');
const fileModel = require('../models/file.model');

const getSummary = async (req, res, next) => {
  try {
    const [{ rows: apiRows }, { rows: automationRows }, { rows: botRows }] = await Promise.all([
      db.query('SELECT COUNT(*)::int AS count, COALESCE(SUM(CASE WHEN last_ok THEN 1 ELSE 0 END), 0)::int AS healthy FROM apis;'),
      db.query('SELECT COUNT(*)::int AS count, COALESCE(SUM(CASE WHEN enabled THEN 1 ELSE 0 END), 0)::int AS enabled FROM automations;'),
      db.query("SELECT COUNT(*)::int AS count, COALESCE(SUM(CASE WHEN status = 'running' THEN 1 ELSE 0 END), 0)::int AS running FROM bots;")
    ]);

    const fileUsage = await fileModel.getFileUsage();

    const { rows: logRows } = await db.query(`
      SELECT
        (
          COALESCE((SELECT COUNT(*) FROM api_logs WHERE checked_at >= date_trunc('day', NOW())), 0) +
          COALESCE((SELECT COUNT(*) FROM automation_runs WHERE created_at >= date_trunc('day', NOW())), 0) +
          COALESCE((SELECT COUNT(*) FROM bot_logs WHERE created_at >= date_trunc('day', NOW())), 0)
        )::int AS total_logs;
    `);

    res.json({
      data: {
        apis: apiRows[0],
        automations: automationRows[0],
        bots: botRows[0],
        files: fileUsage,
        logsToday: logRows[0].total_logs
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSummary
};
