const config = require('../config');

/**
 * Centralized error handling middleware.
 * Formats errors as clean JSON and avoids leaking internal stack traces in production.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;
  const response = {
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected error occurred'
  };

  if (config.nodeEnv === 'development' && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;

