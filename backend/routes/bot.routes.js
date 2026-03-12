const express = require('express');
const {
  createBot,
  listBots,
  getBot,
  startBot,
  stopBot,
  getBotLogs
} = require('../controllers/bot.controller');
const { requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/bots', requireRole(['admin', 'operator']), createBot);
router.get('/bots', requireRole(['admin', 'operator', 'viewer']), listBots);
router.get('/bots/:id', requireRole(['admin', 'operator', 'viewer']), getBot);
router.post('/bots/:id/start', requireRole(['admin', 'operator']), startBot);
router.post('/bots/:id/stop', requireRole(['admin', 'operator']), stopBot);
router.get('/bots/:id/logs', requireRole(['admin', 'operator', 'viewer']), getBotLogs);

module.exports = router;
