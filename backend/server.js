const http = require('http');
const app = require('./app');
const config = require('./utils/config');
const logger = require('./services/logger.service');
const { initSocket } = require('./services/socket.service');
const { startApiMonitor } = require('./services/apiMonitor.service');
const { startAutomationScheduler } = require('./services/automation.service');

const server = http.createServer(app);

initSocket(server);

server.listen(config.port, () => {
  logger.info(`${config.appName} backend running`, {
    port: config.port,
    env: config.env
  });

  startApiMonitor();
  startAutomationScheduler();
});
