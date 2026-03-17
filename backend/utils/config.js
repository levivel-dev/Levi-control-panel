const path = require('path');

require('dotenv').config({
  path: process.env.DOTENV_PATH || path.join(__dirname, '..', '.env')
});

const normalizeOrigins = (value) => {
  if (!value || value === '*') {
    return '*';
  }

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const config = {
  env: process.env.NODE_ENV || 'development',
  appName: process.env.APP_NAME || 'Levi Developer Control Panel',
  port: Number(process.env.PORT || 4000),
  corsOrigin: normalizeOrigins(process.env.CORS_ORIGIN),
  publicBaseUrl: process.env.PUBLIC_BASE_URL || 'http://localhost:4000',
  pg: {
    connectionString: process.env.DATABASE_URL || ''
  },
  redis: {
    url: process.env.REDIS_URL || ''
  },
  apiMonitor: {
    enabled: process.env.API_MONITOR_ENABLED !== 'false',
    schedule: process.env.API_MONITOR_SCHEDULE || '*/1 * * * *'
  },
  queue: {
    name: process.env.QUEUE_NAME || 'automation_jobs'
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '12h',
    bcryptRounds: Number(process.env.BCRYPT_ROUNDS || 12)
  },
  storage: {
    provider: process.env.STORAGE_PROVIDER || 'local',
    localDir: process.env.LOCAL_UPLOAD_DIR || path.join(__dirname, '..', 'uploads'),
    maxUploadMb: Number(process.env.MAX_UPLOAD_MB || 25),
    s3: {
      bucket: process.env.S3_BUCKET || '',
      region: process.env.S3_REGION || '',
      accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
      prefix: process.env.S3_PREFIX || 'uploads',
      publicUrl: process.env.S3_PUBLIC_URL || ''
    }
  }
};

module.exports = config;
