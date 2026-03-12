const express = require('express');
const { getLogs } = require('../controllers/log.controller');
const { requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/logs', requireRole(['admin', 'operator', 'viewer']), getLogs);

module.exports = router;
