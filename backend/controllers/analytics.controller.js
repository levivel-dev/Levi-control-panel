const db = require('../utils/db');
const { AppError } = require('../utils/errors');

const parseDays = (value) => {
  const days = Number(value || 7);
  if (!Number.isInteger(days) || days <= 0 || days > 90) {
    throw new AppError('days must be a number between 1 and 90', 400);
  }
  return days;
};

const getApiUptimeSeries = async (req, res, next) => {
  try {
    const days = parseDays(req.query.days);
    const query = `
      SELECT date_trunc('day', checked_at) AS day,
        COALESCE(AVG(CASE WHEN ok THEN 1 ELSE 0 END), 0) * 100 AS value
      FROM api_logs
      WHERE checked_at >= NOW() - ($1 || ' days')::interval
      GROUP BY day
      ORDER BY day;
    `;

    const { rows } = await db.query(query, [days]);
    const data = rows.map((row) => ({
      date: row.day.toISOString().slice(0, 10),
      value: Number(row.value.toFixed(1))
    }));

    res.json({ data });
  } catch (err) {
    next(err);
  }
};

const getAutomationAnalytics = async (req, res, next) => {
  try {
    const days = parseDays(req.query.days);
    const query = `
      SELECT date_trunc('day', created_at) AS day,
        COUNT(*)::int AS value
      FROM automation_runs
      WHERE created_at >= NOW() - ($1 || ' days')::interval
      GROUP BY day
      ORDER BY day;
    `;

    const { rows } = await db.query(query, [days]);
    const data = rows.map((row) => ({
      date: row.day.toISOString().slice(0, 10),
      value: row.value
    }));

    res.json({ data });
  } catch (err) {
    next(err);
  }
};

const getBotAnalytics = async (req, res, next) => {
  try {
    const days = parseDays(req.query.days);
    const query = `
      SELECT date_trunc('day', created_at) AS day,
        COUNT(*)::int AS value
      FROM bot_logs
      WHERE created_at >= NOW() - ($1 || ' days')::interval
      GROUP BY day
      ORDER BY day;
    `;

    const { rows } = await db.query(query, [days]);
    const data = rows.map((row) => ({
      date: row.day.toISOString().slice(0, 10),
      value: row.value
    }));

    res.json({ data });
  } catch (err) {
    next(err);
  }
};

const getFileAnalytics = async (req, res, next) => {
  try {
    const days = parseDays(req.query.days);
    const query = `
      SELECT date_trunc('day', uploaded_at) AS day,
        COUNT(*)::int AS value
      FROM files
      WHERE uploaded_at >= NOW() - ($1 || ' days')::interval
      GROUP BY day
      ORDER BY day;
    `;

    const { rows } = await db.query(query, [days]);
    const data = rows.map((row) => ({
      date: row.day.toISOString().slice(0, 10),
      value: row.value
    }));

    res.json({ data });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getApiUptimeSeries,
  getAutomationAnalytics,
  getBotAnalytics,
  getFileAnalytics
};
