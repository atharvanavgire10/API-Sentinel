const express = require('express');

const { handleProxy } = require('../controllers/proxyController');
const rateLimiter = require('../middleware/rateLimiter');

const router = express.Router();

// Match both bare service requests and deep nested subpaths
// for all HTTP methods, with Redis-backed rate limiting.

router.all(
  '/:service',
  rateLimiter,
  handleProxy
);

router.all(
  '/:service/*',
  rateLimiter,
  handleProxy
);

module.exports = router;