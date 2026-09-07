/**
 * 404 Not Found middleware
 * Responds with JSON for unmatched routes.
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
};

module.exports = notFoundHandler;

