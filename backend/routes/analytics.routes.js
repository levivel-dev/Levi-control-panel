const express = require('express');
const {
  getApiUptimeSeries,
  getAutomationAnalytics,
  getBotAnalytics,
  getFileAnalytics
} = require('../controllers/analytics.controller');
const { getApiAnalytics } = require('../controllers/api.controller');
const { requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/analytics/apis', requireRole(['admin', 'operator', 'viewer']), getApiAnalytics);
router.get('/analytics/api-uptime', requireRole(['admin', 'operator', 'viewer']), getApiUptimeSeries);
router.get('/analytics/automations', requireRole(['admin', 'operator', 'viewer']), getAutomationAnalytics);
router.get('/analytics/bots', requireRole(['admin', 'operator', 'viewer']), getBotAnalytics);
router.get('/analytics/files', requireRole(['admin', 'operator', 'viewer']), getFileAnalytics);

module.exports = router;
