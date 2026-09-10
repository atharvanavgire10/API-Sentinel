const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const notFoundHandler = require('./middleware/notFoundHandler');
const errorHandler = require('./middleware/errorHandler');
const securityHeaders = require('./middleware/securityHeaders');

const app = express();

// Core middleware
app.use(cors());
app.use(securityHeaders);
app.use(express.json({ limit: '1mb' }));

// API routes
app.use('/api', routes);

// 404 handler for unmatched routes
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

module.exports = app;

