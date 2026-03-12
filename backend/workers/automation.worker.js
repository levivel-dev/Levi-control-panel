const { dequeueJob } = require('../services/queue.service');
const automationModel = require('../models/automation.model');
const logger = require('../services/logger.service');

// Long-running worker that processes automation jobs from Redis.
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const performAction = async (job) => {
  const { actionType, actionPayload } = job.payload;

  switch (actionType) {
    case 'notify':
      logger.info('Automation notify', { payload: actionPayload, trigger: job.payload.trigger });
      return { message: 'Notification simulated', payload: actionPayload };

    case 'webhook':
      if (!actionPayload || !actionPayload.url) {
        throw new Error('Webhook action requires actionPayload.url');
      }

      const response = await fetch(actionPayload.url, {
        method: actionPayload.method || 'POST',
        headers: actionPayload.headers || { 'Content-Type': 'application/json' },
        body: actionPayload.body ? JSON.stringify(actionPayload.body) : null
      });

      return { status: response.status };

    case 'run_script':
      logger.info('Automation run_script', { payload: actionPayload, trigger: job.payload.trigger });
      await sleep(500);
      return { message: 'Script execution simulated' };

    default:
      throw new Error(`Unknown actionType: ${actionType}`);
  }
};

const processJob = async (job) => {
  const startedAt = new Date().toISOString();
  await automationModel.updateAutomationRun(job.runId, {
    status: 'running',
    startedAt,
    finishedAt: null,
    errorMessage: null,
    output: null
  });

  try {
    const output = await performAction(job);
    const finishedAt = new Date().toISOString();

    await automationModel.updateAutomationRun(job.runId, {
      status: 'success',
      startedAt,
      finishedAt,
      errorMessage: null,
      output
    });

    logger.info('Automation run success', { runId: job.runId, automationId: job.payload.automationId });
  } catch (err) {
    const finishedAt = new Date().toISOString();

    await automationModel.updateAutomationRun(job.runId, {
      status: 'failed',
      startedAt,
      finishedAt,
      errorMessage: err.message,
      output: null
    });

    logger.error('Automation run failed', { runId: job.runId, error: err.message });
  }
};

const startWorker = async () => {
  logger.info('Automation worker started');

  while (true) {
    try {
      const job = await dequeueJob();

      if (!job) {
        continue;
      }

      await processJob(job);
    } catch (err) {
      logger.error('Worker loop error', { error: err.message });
      await sleep(1000);
    }
  }
};

startWorker();
