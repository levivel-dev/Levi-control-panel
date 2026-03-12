const botModel = require('../models/bot.model');
const { requireString } = require('../utils/validate');
const { AppError } = require('../utils/errors');
const logger = require('../services/logger.service');

const createBot = async (req, res, next) => {
  try {
    const name = requireString(req.body.name, 'name');
    const botType = req.body.botType || null;
    const status = req.body.status || 'stopped';
    const config = req.body.config || null;

    const bot = await botModel.createBot({ name, botType, status, config });
    await botModel.createBotLog({ botId: bot.id, level: 'info', message: 'Bot registered' });

    logger.info('Bot registered', { botId: bot.id, status: bot.status });

    res.status(201).json({ data: bot });
  } catch (err) {
    next(err);
  }
};

const listBots = async (req, res, next) => {
  try {
    const bots = await botModel.listBots();
    res.json({ data: bots });
  } catch (err) {
    next(err);
  }
};

const getBot = async (req, res, next) => {
  try {
    const bot = await botModel.getBotById(Number(req.params.id));

    if (!bot) {
      throw new AppError('Bot not found', 404);
    }

    res.json({ data: bot });
  } catch (err) {
    next(err);
  }
};

const startBot = async (req, res, next) => {
  try {
    const bot = await botModel.updateBotStatus(Number(req.params.id), 'running');

    if (!bot) {
      throw new AppError('Bot not found', 404);
    }

    await botModel.createBotLog({ botId: bot.id, level: 'info', message: 'Bot started' });
    logger.info('Bot started', { botId: bot.id });

    res.json({ data: bot });
  } catch (err) {
    next(err);
  }
};

const stopBot = async (req, res, next) => {
  try {
    const bot = await botModel.updateBotStatus(Number(req.params.id), 'stopped');

    if (!bot) {
      throw new AppError('Bot not found', 404);
    }

    await botModel.createBotLog({ botId: bot.id, level: 'warn', message: 'Bot stopped' });
    logger.warn('Bot stopped', { botId: bot.id });

    res.json({ data: bot });
  } catch (err) {
    next(err);
  }
};

const getBotLogs = async (req, res, next) => {
  try {
    const botId = Number(req.params.id);
    const limit = Number(req.query.limit || 50);

    if (!Number.isInteger(limit) || limit <= 0 || limit > 500) {
      throw new AppError('limit must be a number between 1 and 500', 400);
    }

    const bot = await botModel.getBotById(botId);
    if (!bot) {
      throw new AppError('Bot not found', 404);
    }

    const logs = await botModel.getBotLogs(botId, limit);
    res.json({ data: logs });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createBot,
  listBots,
  getBot,
  startBot,
  stopBot,
  getBotLogs
};
