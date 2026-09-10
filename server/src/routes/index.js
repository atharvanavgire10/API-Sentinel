const express = require('express');
const healthRoutes = require('./healthRoutes');
const proxyRoutes = require('./proxyRoutes');
const metricsRoutes = require('./metricsRoutes');

const router = express.Router();

// Mount routes
router.use('/health', healthRoutes);
router.use('/proxy', proxyRoutes);
router.use('/metrics', metricsRoutes);

module.exports = router;

