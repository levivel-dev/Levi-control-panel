const { AppError } = require('./errors');

const requireString = (value, fieldName) => {
  if (!value || typeof value !== 'string' || value.trim().length === 0) {
    throw new AppError(`${fieldName} is required`, 400);
  }

  return value.trim();
};

const requireUrl = (value, fieldName) => {
  const trimmed = requireString(value, fieldName);

  try {
    new URL(trimmed);
  } catch (err) {
    throw new AppError(`${fieldName} must be a valid URL`, 400);
  }

  return trimmed;
};

module.exports = {
  requireString,
  requireUrl
};
