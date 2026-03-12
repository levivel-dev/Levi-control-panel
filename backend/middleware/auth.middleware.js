const jwt = require('jsonwebtoken');
const config = require('../utils/config');
const { AppError } = require('../utils/errors');

const getTokenFromHeader = (req) => {
  const header = req.headers.authorization || '';
  const [type, token] = header.split(' ');

  if (type !== 'Bearer' || !token) {
    return null;
  }

  return token;
};

const verifyToken = (token) => {
  return jwt.verify(token, config.auth.jwtSecret);
};

const requireAuth = (req, res, next) => {
  try {
    const token = getTokenFromHeader(req);
    if (!token) {
      throw new AppError('Unauthorized', 401);
    }

    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (err) {
    next(new AppError('Unauthorized', 401));
  }
};

const optionalAuth = (req, res, next) => {
  const token = getTokenFromHeader(req);
  if (!token) {
    return next();
  }

  try {
    const payload = verifyToken(token);
    req.user = payload;
    return next();
  } catch (err) {
    return next(new AppError('Unauthorized', 401));
  }
};

const requireRole = (roles = []) => (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Unauthorized', 401));
  }

  if (!roles.includes(req.user.role)) {
    return next(new AppError('Forbidden', 403));
  }

  return next();
};

module.exports = {
  requireAuth,
  optionalAuth,
  requireRole
};
