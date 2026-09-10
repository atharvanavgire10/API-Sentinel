const config = require('../config');

/**
 * Centralized error handling middleware.
 * Returns safe JSON responses without exposing internal
 * stack traces or filesystem paths to API clients.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;

  if (config.nodeEnv === 'development') {
    console.error('[ErrorHandler]', err);
  }

  const response = {
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected error occurred'
  };

  res.status(statusCode).json(response);
};

module.exports = errorHandler;