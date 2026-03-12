const automationModel = require('../models/automation.model');
const { enqueueAutomationRun, scheduleAutomation, triggerEvent } = require('../services/automation.service');
const { requireString } = require('../utils/validate');
const { AppError } = require('../utils/errors');

const createAutomation = async (req, res, next) => {
  try {
    const name = requireString(req.body.name, 'name');
    const triggerType = requireString(req.body.triggerType, 'triggerType');
    const actionType = requireString(req.body.actionType, 'actionType');
    const enabled = req.body.enabled !== false;
    const triggerEventName = req.body.triggerEvent || null;
    const scheduleCron = req.body.scheduleCron || null;
    const actionPayload = req.body.actionPayload || null;

    if (!['event', 'schedule'].includes(triggerType)) {
      throw new AppError('triggerType must be event or schedule', 400);
    }

    if (triggerType === 'event' && !triggerEventName) {
      throw new AppError('triggerEvent is required for event triggers', 400);
    }

    if (triggerType === 'schedule' && !scheduleCron) {
      throw new AppError('scheduleCron is required for schedule triggers', 400);
    }

    const automation = await automationModel.createAutomation({
      name,
      triggerType,
      triggerEvent: triggerEventName,
      scheduleCron,
      actionType,
      actionPayload,
      enabled
    });

    if (automation.enabled && automation.triggerType === 'schedule') {
      scheduleAutomation(automation);
    }

    res.status(201).json({ data: automation });
  } catch (err) {
    next(err);
  }
};

const listAutomations = async (req, res, next) => {
  try {
    const automations = await automationModel.listAutomations();
    res.json({ data: automations });
  } catch (err) {
    next(err);
  }
};

const getAutomation = async (req, res, next) => {
  try {
    const automation = await automationModel.getAutomationById(Number(req.params.id));

    if (!automation) {
      throw new AppError('Automation not found', 404);
    }

    res.json({ data: automation });
  } catch (err) {
    next(err);
  }
};

const runAutomation = async (req, res, next) => {
  try {
    const automation = await automationModel.getAutomationById(Number(req.params.id));

    if (!automation) {
      throw new AppError('Automation not found', 404);
    }

    const run = await enqueueAutomationRun(automation, { type: 'manual' });

    res.status(202).json({ data: run });
  } catch (err) {
    next(err);
  }
};

const triggerAutomationEvent = async (req, res, next) => {
  try {
    const eventName = requireString(req.body.eventName, 'eventName');
    const payload = req.body.payload || {};
    const runs = await triggerEvent(eventName, payload);

    res.status(202).json({ data: runs });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createAutomation,
  listAutomations,
  getAutomation,
  runAutomation,
  triggerAutomationEvent
};
