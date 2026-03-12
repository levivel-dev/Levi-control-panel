const fileModel = require('../models/file.model');
const apiModel = require('../models/api.model');
const botModel = require('../models/bot.model');
const { AppError } = require('../utils/errors');
const { triggerEvent } = require('../services/automation.service');
const storage = require('../storage');
const logger = require('../services/logger.service');

const allowedWorkspaceTypes = ['api', 'bot', 'general'];

const resolveWorkspace = async (workspaceType, workspaceId) => {
  if (!workspaceType) {
    return { workspaceType: null, workspaceId: null };
  }

  if (!allowedWorkspaceTypes.includes(workspaceType)) {
    throw new AppError('workspaceType must be api, bot, or general', 400);
  }

  if (workspaceType === 'general') {
    return { workspaceType: null, workspaceId: null };
  }

  if (!workspaceId || !Number.isInteger(workspaceId)) {
    throw new AppError('workspaceId is required for api or bot workspace', 400);
  }

  if (workspaceType === 'api') {
    const api = await apiModel.getApiById(workspaceId);
    if (!api) {
      throw new AppError('API workspace not found', 404);
    }
  }

  if (workspaceType === 'bot') {
    const bot = await botModel.getBotById(workspaceId);
    if (!bot) {
      throw new AppError('Bot workspace not found', 404);
    }
  }

  return { workspaceType, workspaceId };
};

const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('file is required', 400);
    }

    const workspaceTypeRaw = req.body.workspaceType || null;
    const workspaceIdRaw = req.body.workspaceId ? Number(req.body.workspaceId) : null;
    const { workspaceType, workspaceId } = await resolveWorkspace(workspaceTypeRaw, workspaceIdRaw);

    let metadata = null;
    if (req.body.metadata) {
      try {
        metadata = JSON.parse(req.body.metadata);
      } catch (err) {
        metadata = { raw: req.body.metadata };
      }
    }

    const stored = await storage.saveFile({
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      workspaceType,
      workspaceId
    });

    const record = await fileModel.createFile({
      filename: stored.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      sizeBytes: stored.sizeBytes,
      storagePath: stored.storagePath,
      storageProvider: stored.storageProvider,
      storageBucket: stored.storageBucket,
      workspaceType,
      workspaceId,
      metadata
    });

    const publicUrl = storage.getPublicUrl(record);

    logger.info('File uploaded', {
      fileId: record.id,
      workspaceType,
      workspaceId
    });

    await triggerEvent('file_uploaded', {
      fileId: record.id,
      filename: record.filename,
      sizeBytes: record.sizeBytes
    });

    res.status(201).json({ data: { ...record, publicUrl } });
  } catch (err) {
    next(err);
  }
};

const listFiles = async (req, res, next) => {
  try {
    const workspaceTypeRaw = req.query.workspaceType || null;
    const workspaceIdRaw = req.query.workspaceId ? Number(req.query.workspaceId) : null;
    let workspaceType = null;
    let workspaceId = null;

    if (workspaceTypeRaw) {
      if (!allowedWorkspaceTypes.includes(workspaceTypeRaw)) {
        throw new AppError('workspaceType must be api, bot, or general', 400);
      }

      workspaceType = workspaceTypeRaw;
      workspaceId = workspaceIdRaw || null;
    }

    const files = await fileModel.listFiles({ workspaceType, workspaceId });
    const data = files.map((file) => ({
      ...file,
      publicUrl: storage.getPublicUrl(file)
    }));

    res.json({ data });
  } catch (err) {
    next(err);
  }
};

const deleteFile = async (req, res, next) => {
  try {
    const fileId = Number(req.params.id);
    const file = await fileModel.getFileById(fileId);

    if (!file) {
      throw new AppError('File not found', 404);
    }

    await storage.deleteFile(file);
    await fileModel.deleteFileById(fileId);

    logger.warn('File deleted', { fileId });

    res.json({ data: { id: fileId } });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  uploadFile,
  listFiles,
  deleteFile
};
