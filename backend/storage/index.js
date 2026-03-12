const config = require('../utils/config');
const localStorage = require('./local.storage');
const s3Storage = require('./s3.storage');

const getProvider = () => (config.storage.provider || 'local').toLowerCase();

const getStorage = () => {
  const provider = getProvider();

  if (provider === 's3') {
    return s3Storage;
  }

  return localStorage;
};

const saveFile = async (file) => {
  return getStorage().saveFile(file);
};

const deleteFile = async (fileRecord) => {
  return getStorage().deleteFile(fileRecord);
};

const getPublicUrl = (fileRecord) => {
  return getStorage().getPublicUrl(fileRecord);
};

const getLocalDir = () => {
  return localStorage.getLocalDir();
};

module.exports = {
  getProvider,
  saveFile,
  deleteFile,
  getPublicUrl,
  getLocalDir
};
