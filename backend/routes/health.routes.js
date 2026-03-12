const express = require('express');
const { healthCheck } = require('../controllers/health.controller');

const router = express.Router();

router.get('/health-check', healthCheck);

module.exports = router;
