const express = require('express');
const {
  register,
  login,
  me,
  listUsers,
  updateUserRole,
  resetPassword
} = require('../controllers/auth.controller');
const { optionalAuth, requireAuth, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/register', optionalAuth, register);
router.post('/login', login);
router.get('/me', requireAuth, me);
router.get('/users', requireAuth, requireRole(['admin']), listUsers);
router.patch('/users/:id/role', requireAuth, requireRole(['admin']), updateUserRole);
router.patch('/users/:id/password', requireAuth, requireRole(['admin']), resetPassword);

module.exports = router;
