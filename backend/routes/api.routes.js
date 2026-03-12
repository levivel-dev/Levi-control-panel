const express = require('express');
const {
  registerApi,
  getApiStatus,
  getApiById,
  getApiLogs
} = require('../controllers/api.controller');
const { requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

// Legacy routes
router.post('/register-api', requireRole(['admin', 'operator']), registerApi);
router.get('/api-status', requireRole(['admin', 'operator', 'viewer']), getApiStatus);

// RESTful routes
router.post('/apis', requireRole(['admin', 'operator']), registerApi);
router.get('/apis', requireRole(['admin', 'operator', 'viewer']), getApiStatus);
router.get('/apis/:id', requireRole(['admin', 'operator', 'viewer']), getApiById);
router.get('/apis/:id/logs', requireRole(['admin', 'operator', 'viewer']), getApiLogs);

module.exports = router;
