const logModel = require('../models/log.model');

const getLogs = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit || 60), 200);
    const scope = req.query.scope || null;
    const entityId = req.query.entityId || null;

    const logs = await logModel.listLogs({
      limit,
      scope,
      entityId
    });

    res.json({ data: logs });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getLogs
};
