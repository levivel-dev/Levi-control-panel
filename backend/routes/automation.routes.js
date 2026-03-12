const express = require('express');
const {
  createAutomation,
  listAutomations,
  getAutomation,
  runAutomation,
  triggerAutomationEvent
} = require('../controllers/automation.controller');
const { requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/automations', requireRole(['admin', 'operator']), createAutomation);
router.get('/automations', requireRole(['admin', 'operator', 'viewer']), listAutomations);
router.get('/automations/:id', requireRole(['admin', 'operator', 'viewer']), getAutomation);
router.post('/automations/:id/run', requireRole(['admin', 'operator']), runAutomation);
router.post('/automations/trigger', requireRole(['admin', 'operator']), triggerAutomationEvent);

module.exports = router;
