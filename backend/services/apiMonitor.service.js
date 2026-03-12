const cron = require('node-cron');
const config = require('../utils/config');
const { isDbConfigured } = require('../utils/db');
const apiModel = require('../models/api.model');
const logger = require('./logger.service');
const { triggerEvent } = require('./automation.service');

const pingApi = async (api) => {
  const startedAt = Date.now();
  let status = 0;
  let ok = false;
  let errorMessage = null;

  try {
    const response = await fetch(api.url, {
      method: api.method || 'GET'
    });

    status = response.status;
    ok = status === api.expectedStatus;
  } catch (err) {
    errorMessage = err.message || 'Network error';
  }

  const responseTimeMs = Date.now() - startedAt;

  await apiModel.updateApiStatus(api.id, {
    status,
    responseTimeMs,
    ok
  });

  await apiModel.createApiLog({
    apiId: api.id,
    status,
    responseTimeMs,
    ok,
    errorMessage
  });

  return {
    apiId: api.id,
    status,
    responseTimeMs,
    ok,
    errorMessage
  };
};

const runMonitorOnce = async () => {
  if (!isDbConfigured) {
    logger.warn('API monitor skipped because DATABASE_URL is not configured.');
    return [];
  }

  const apis = await apiModel.listApis();

  if (apis.length === 0) {
    logger.info('API monitor ran with no registered APIs.');
    return [];
  }

  const results = [];

  for (const api of apis) {
    try {
      const result = await pingApi(api);
      results.push(result);

      if (!result.ok) {
        logger.warn('API check failed', result);
        await triggerEvent('api_failed', {
          apiId: api.id,
          status: result.status,
          responseTimeMs: result.responseTimeMs,
          errorMessage: result.errorMessage
        });
      }
    } catch (err) {
      logger.error('API check crashed', { apiId: api.id, error: err.message });
    }
  }

  return results;
};

const startApiMonitor = () => {
  if (!config.apiMonitor.enabled) {
    logger.info('API monitor disabled by configuration.');
    return;
  }

  if (!isDbConfigured) {
    logger.warn('API monitor is enabled but DATABASE_URL is not configured.');
  }

  cron.schedule(config.apiMonitor.schedule, () => {
    runMonitorOnce().catch((err) => {
      logger.error('API monitor run failed', { error: err.message });
    });
  });

  logger.info('API monitor scheduled', { schedule: config.apiMonitor.schedule });
};

module.exports = {
  startApiMonitor,
  runMonitorOnce
};
