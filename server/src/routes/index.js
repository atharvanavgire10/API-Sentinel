const express = require('express');
const healthRoutes = require('./healthRoutes');
const proxyRoutes = require('./proxyRoutes');

const router = express.Router();

// Mount routes
router.use('/health', healthRoutes);
router.use('/proxy', proxyRoutes);

module.exports = router;

