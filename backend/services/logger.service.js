const { emitLog } = require('./socket.service');

const nowIso = () => new Date().toISOString();

const inferScope = (level, meta) => {
  if (meta && meta.scope) {
    return meta.scope;
  }

  if (meta) {
    if (meta.apiId) return 'api';
    if (meta.botId) return 'bot';
    if (meta.automationId || meta.runId) return 'automation';
    if (meta.fileId) return 'file';
  }

  if (level === 'http') {
    return 'http';
  }

  return 'system';
};

const inferEntityId = (meta) => {
  if (!meta) return null;
  return meta.apiId || meta.botId || meta.automationId || meta.runId || meta.fileId || null;
};

const writeConsole = (level, message, meta) => {
  const prefix = `[${level.toUpperCase()}]`;
  if (level === 'error') {
    console.error(prefix, message, meta || '');
    return;
  }

  if (level === 'warn') {
    console.warn(prefix, message, meta || '');
    return;
  }

  console.log(prefix, message, meta || '');
};

const log = (level, message, meta = null) => {
  const scope = inferScope(level, meta);
  const entityId = inferEntityId(meta);

  const payload = {
    level,
    scope,
    entityId,
    message,
    meta,
    timestamp: nowIso()
  };

  writeConsole(level, message, meta);
  emitLog(payload);
  return payload;
};

const info = (message, meta) => log('info', message, meta);
const warn = (message, meta) => log('warn', message, meta);
const error = (message, meta) => log('error', message, meta);
const http = (message, meta) => log('http', message, meta);

module.exports = {
  log,
  info,
  warn,
  error,
  http
};
