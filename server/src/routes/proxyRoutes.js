const express = require('express');
const { handleProxy } = require('../controllers/proxyController');

const router = express.Router();

// Match both bare service requests and deep nested subpaths for all HTTP methods
router.all('/:service', handleProxy);
router.all('/:service/*', handleProxy);

module.exports = router;

