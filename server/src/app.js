const express = require('express');
const cors = require('cors');

const routes = require('./routes');

const notFoundHandler = require('./middleware/notFoundHandler');
const errorHandler = require('./middleware/errorHandler');
const securityHeaders = require('./middleware/securityHeaders');

const app = express();

const METHODS_WITH_BODY = new Set([
  'POST',
  'PUT',
  'PATCH',
  'DELETE'
]);

// Core middleware
app.use(cors());
app.use(securityHeaders);

// Parse JSON only for HTTP methods that can carry request bodies
app.use((req, res, next) => {
  if (!METHODS_WITH_BODY.has(req.method)) {
    return next();
  }

  return express.json({ limit: '1mb' })(req, res, next);
});

// API routes
app.use('/api', routes);

// 404 handler for unmatched routes
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

module.exports = app;
