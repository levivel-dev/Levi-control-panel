const cron = require('node-cron');
const automationModel = require('../models/automation.model');
const { enqueueJob } = require('./queue.service');
const logger = require('./logger.service');

// Track cron tasks so we can reschedule updates safely.
const scheduledTasks = new Map();

const buildJobPayload = (automation, trigger) => ({
  automationId: automation.id,
  actionType: automation.actionType,
  actionPayload: automation.actionPayload,
  trigger
});

const enqueueAutomationRun = async (automation, trigger) => {
  const run = await automationModel.createAutomationRun(automation.id, 'queued');
  const job = {
    id: `${automation.id}:${run.id}:${Date.now()}`,
    type: 'automation.run',
    runId: run.id,
    payload: buildJobPayload(automation, trigger)
  };

  await enqueueJob(job);

  logger.info('Automation queued', {
    automationId: automation.id,
    runId: run.id,
    trigger
  });

  return run;
};

const scheduleAutomation = (automation) => {
  if (!automation.scheduleCron) {
    return;
  }

  if (scheduledTasks.has(automation.id)) {
    scheduledTasks.get(automation.id).stop();
  }

  const task = cron.schedule(automation.scheduleCron, () => {
    enqueueAutomationRun(automation, { type: 'schedule', cron: automation.scheduleCron }).catch((err) => {
      logger.error('Failed to enqueue scheduled automation', {
        automationId: automation.id,
        error: err.message
      });
    });
  });

  scheduledTasks.set(automation.id, task);
};

const startAutomationScheduler = async () => {
  try {
    const automations = await automationModel.listAutomations({
      enabled: true,
      triggerType: 'schedule'
    });

    automations.forEach(scheduleAutomation);

    logger.info('Automation scheduler started', {
      scheduledCount: automations.length
    });
  } catch (err) {
    logger.error('Automation scheduler failed to start', { error: err.message });
  }
};

const triggerEvent = async (eventName, payload) => {
  const automations = await automationModel.listAutomationsByEvent(eventName);

  if (automations.length === 0) {
    return [];
  }

  const runs = [];

  for (const automation of automations) {
    const run = await enqueueAutomationRun(automation, {
      type: 'event',
      event: eventName,
      payload
    });

    runs.push(run);
  }

  return runs;
};

module.exports = {
  enqueueAutomationRun,
  scheduleAutomation,
  startAutomationScheduler,
  triggerEvent
};
