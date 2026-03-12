const express = require('express');
const cors = require('cors');
const config = require('./utils/config');
const logger = require('./services/logger.service');
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const apiRoutes = require('./routes/api.routes');
const automationRoutes = require('./routes/automation.routes');
const botRoutes = require('./routes/bot.routes');
const fileRoutes = require('./routes/file.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const logRoutes = require('./routes/log.routes');
const { notFoundHandler, errorHandler } = require('./utils/errors');
const { requireAuth } = require('./middleware/auth.middleware');
const storage = require('./storage');

const app = express();

app.use(cors({
  origin: config.corsOrigin
}));
app.use(express.json({ limit: '5mb' }));

app.use((req, res, next) => {
  logger.http(`${req.method} ${req.originalUrl}`, { ip: req.ip });
  next();
});

if (storage.getProvider() === 'local') {
  app.use('/uploads', express.static(storage.getLocalDir()));
}

app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);

app.use('/api', requireAuth);
app.use('/api', apiRoutes);
app.use('/api', automationRoutes);
app.use('/api', botRoutes);
app.use('/api', fileRoutes);
app.use('/api', analyticsRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', logRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
