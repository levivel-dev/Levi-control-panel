const crypto = require('crypto');
const path = require('path');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const config = require('../utils/config');

let client = null;

const getClient = () => {
  if (client) {
    return client;
  }

  client = new S3Client({
    region: config.storage.s3.region,
    credentials: {
      accessKeyId: config.storage.s3.accessKeyId,
      secretAccessKey: config.storage.s3.secretAccessKey
    }
  });

  return client;
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

const buildKey = (originalName, workspaceType, workspaceId) => {
  const prefix = config.storage.s3.prefix || 'uploads';
  const workspaceKey = buildWorkspaceKey(workspaceType, workspaceId);
  const fileName = buildFilename(originalName);
  return `${prefix}/${workspaceKey}/${fileName}`;
};

const saveFile = async ({ buffer, originalName, mimeType, workspaceType, workspaceId }) => {
  const bucket = config.storage.s3.bucket;
  if (!bucket) {
    throw new Error('S3_BUCKET is not configured');
  }

  const key = buildKey(originalName, workspaceType, workspaceId);
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: mimeType || 'application/octet-stream'
  });

  await getClient().send(command);

  return {
    filename: key,
    storagePath: `s3://${bucket}/${key}`,
    sizeBytes: buffer.length,
    storageProvider: 's3',
    storageBucket: bucket,
    mimeType
  };
};

const deleteFile = async (fileRecord) => {
  const bucket = fileRecord.storageBucket || config.storage.s3.bucket;
  if (!bucket) {
    return;
  }

  const key = fileRecord.filename;
  if (!key) {
    return;
  }

  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key
  });

  await getClient().send(command);
};

const getPublicUrl = (fileRecord) => {
  if (config.storage.s3.publicUrl) {
    return `${config.storage.s3.publicUrl}/${fileRecord.filename}`;
  }

  const bucket = fileRecord.storageBucket || config.storage.s3.bucket;
  const region = config.storage.s3.region || 'us-east-1';
  return `https://${bucket}.s3.${region}.amazonaws.com/${fileRecord.filename}`;
};

module.exports = {
  saveFile,
  deleteFile,
  getPublicUrl
};
