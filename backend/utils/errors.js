class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

const notFoundHandler = (req, res, next) => {
  const err = new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404);
  next(err);
};

const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;
  const payload = {
    error: err.message || 'Unexpected error',
    details: err.details || null
  };

  if (status >= 500) {
    console.error('[error]', err);
  }

  res.status(status).json(payload);
};

module.exports = {
  AppError,
  notFoundHandler,
  errorHandler
};
