const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const config = require('../utils/config');

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const getLocalDir = () => {
  const configured = config.storage.localDir;
  return path.isAbsolute(configured) ? configured : path.join(__dirname, '..', configured);
};

const buildFilename = (originalName) => {
  const ext = path.extname(originalName);
  const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9-_]/g, '_');
  const id = crypto.randomUUID();
  return `${id}_${baseName}${ext}`;
};

const buildWorkspaceKey = (workspaceType, workspaceId) => {
  if (workspaceType && workspaceId) {
    return `${workspaceType}/${workspaceId}`;
  }

  return 'general';
};

const saveFile = async ({ buffer, originalName, mimeType, workspaceType, workspaceId }) => {
  const localDir = getLocalDir();
  const workspaceKey = buildWorkspaceKey(workspaceType, workspaceId);
  const fileName = buildFilename(originalName);
  const relativeKey = path.posix.join(workspaceKey, fileName);

  const storagePath = path.join(localDir, ...relativeKey.split('/'));
  ensureDir(path.dirname(storagePath));

  await fs.promises.writeFile(storagePath, buffer);

  return {
    filename: relativeKey,
    storagePath,
    sizeBytes: buffer.length,
    storageProvider: 'local',
    storageBucket: null,
    mimeType
  };
};

const deleteFile = async (fileRecord) => {
  if (!fileRecord.storagePath) {
    return;
  }

  if (fs.existsSync(fileRecord.storagePath)) {
    await fs.promises.unlink(fileRecord.storagePath);
  }
};

const getPublicUrl = (fileRecord) => {
  return `${config.publicBaseUrl}/uploads/${fileRecord.filename}`;
};

module.exports = {
  saveFile,
  deleteFile,
  getPublicUrl,
  getLocalDir
};
