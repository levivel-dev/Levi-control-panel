const express = require('express');
const { getSummary } = require('../controllers/dashboard.controller');
const { requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/dashboard/summary', requireRole(['admin', 'operator', 'viewer']), getSummary);

module.exports = router;
