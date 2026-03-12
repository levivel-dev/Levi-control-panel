const apiModel = require('../models/api.model');
const { requireString, requireUrl } = require('../utils/validate');
const { AppError } = require('../utils/errors');

const registerApi = async (req, res, next) => {
  try {
    const name = requireString(req.body.name, 'name');
    const url = requireUrl(req.body.url, 'url');
    const method = (req.body.method || 'GET').toUpperCase();
    const expectedStatus = Number(req.body.expectedStatus || 200);

    if (!Number.isInteger(expectedStatus) || expectedStatus < 100) {
      throw new AppError('expectedStatus must be a valid HTTP status code', 400);
    }

    const api = await apiModel.createApi({
      name,
      url,
      method,
      expectedStatus
    });

    res.status(201).json({
      data: api
    });
  } catch (err) {
    next(err);
  }
};

const getApiStatus = async (req, res, next) => {
  try {
    const apis = await apiModel.listApis();
    res.json({
      data: apis
    });
  } catch (err) {
    next(err);
  }
};

const getApiById = async (req, res, next) => {
  try {
    const api = await apiModel.getApiById(Number(req.params.id));

    if (!api) {
      throw new AppError('API not found', 404);
    }

    res.json({ data: api });
  } catch (err) {
    next(err);
  }
};

const getApiLogs = async (req, res, next) => {
  try {
    const apiId = Number(req.params.id);
    const limit = Number(req.query.limit || 50);

    if (!Number.isInteger(limit) || limit <= 0 || limit > 500) {
      throw new AppError('limit must be a number between 1 and 500', 400);
    }

    const api = await apiModel.getApiById(apiId);
    if (!api) {
      throw new AppError('API not found', 404);
    }

    const logs = await apiModel.getApiLogs(apiId, limit);
    res.json({ data: logs });
  } catch (err) {
    next(err);
  }
};

const getApiAnalytics = async (req, res, next) => {
  try {
    const hours = Number(req.query.hours || 24);

    if (!Number.isInteger(hours) || hours <= 0 || hours > 168) {
      throw new AppError('hours must be a number between 1 and 168', 400);
    }

    const analytics = await apiModel.getApiAnalytics(hours);
    res.json({ data: analytics });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerApi,
  getApiStatus,
  getApiById,
  getApiLogs,
  getApiAnalytics
};
