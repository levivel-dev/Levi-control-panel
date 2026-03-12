const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../utils/config');
const userModel = require('../models/user.model');
const { requireString } = require('../utils/validate');
const { AppError } = require('../utils/errors');
const logger = require('../services/logger.service');

const allowedRoles = ['admin', 'operator', 'viewer'];

const isValidEmail = (email) => /.+@.+\..+/.test(email);

const signToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    config.auth.jwtSecret,
    { expiresIn: config.auth.jwtExpiresIn }
  );
};

const register = async (req, res, next) => {
  try {
    const name = requireString(req.body.name, 'name');
    const email = requireString(req.body.email, 'email').toLowerCase();
    const password = requireString(req.body.password, 'password');
    const requestedRole = req.body.role || 'operator';

    if (!isValidEmail(email)) {
      throw new AppError('email must be valid', 400);
    }

    const userCount = await userModel.countUsers();
    const isFirstUser = userCount === 0;

    if (!isFirstUser) {
      if (!req.user || req.user.role !== 'admin') {
        throw new AppError('Only admins can create new users', 403);
      }
    }

    const existing = await userModel.getUserByEmail(email);
    if (existing) {
      throw new AppError('email already exists', 409);
    }

    const role = isFirstUser ? 'admin' : requestedRole;
    if (!allowedRoles.includes(role)) {
      throw new AppError('role must be admin, operator, or viewer', 400);
    }

    const passwordHash = await bcrypt.hash(password, config.auth.bcryptRounds);
    const user = await userModel.createUser({ name, email, passwordHash, role });
    const token = signToken(user);

    logger.info('User created', {
      scope: 'audit',
      actorId: req.user ? req.user.id : user.id,
      targetUserId: user.id,
      role: user.role,
      email: user.email
    });

    res.status(201).json({ data: user, token });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const email = requireString(req.body.email, 'email').toLowerCase();
    const password = requireString(req.body.password, 'password');

    const user = await userModel.getUserByEmail(email);
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = signToken(user);

    logger.info('User login', {
      scope: 'audit',
      userId: user.id,
      email: user.email
    });

    res.json({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      },
      token
    });
  } catch (err) {
    next(err);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await userModel.getUserById(req.user.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({ data: user });
  } catch (err) {
    next(err);
  }
};

const listUsers = async (req, res, next) => {
  try {
    const users = await userModel.listUsers();
    res.json({ data: users });
  } catch (err) {
    next(err);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    const role = requireString(req.body.role, 'role');

    if (!allowedRoles.includes(role)) {
      throw new AppError('role must be admin, operator, or viewer', 400);
    }

    if (req.user.id === userId && role !== req.user.role) {
      throw new AppError('Admins cannot change their own role', 400);
    }

    const user = await userModel.updateUserRole(userId, role);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    logger.warn('User role updated', {
      scope: 'audit',
      actorId: req.user.id,
      targetUserId: user.id,
      role: user.role
    });

    res.json({ data: user });
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    const password = requireString(req.body.password, 'password');

    const passwordHash = await bcrypt.hash(password, config.auth.bcryptRounds);
    const user = await userModel.updateUserPassword(userId, passwordHash);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    logger.warn('User password reset', {
      scope: 'audit',
      actorId: req.user.id,
      targetUserId: user.id
    });

    res.json({ data: { id: user.id } });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  me,
  listUsers,
  updateUserRole,
  resetPassword
};
