const express = require('express');

const { handleProxy } = require('../controllers/proxyController');
const rateLimiter = require('../middleware/rateLimiter');
const methodGuard = require('../middleware/methodGuard');

const router = express.Router();

// Match both bare service requests and deep nested subpaths.
// Validate the HTTP method before applying rate limiting
// or forwarding the request upstream.

router.all(
  '/:service',
  methodGuard,
  rateLimiter,
  handleProxy
);

router.all(
  '/:service/*',
  methodGuard,
  rateLimiter,
  handleProxy
);

module.exports = router;