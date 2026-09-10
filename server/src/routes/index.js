const express = require('express');
const healthRoutes = require('./healthRoutes');
const proxyRoutes = require('./proxyRoutes');
const metricsRoutes = require('./metricsRoutes');
const incidentRoutes = require('./incidentRoutes');

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/proxy', proxyRoutes);
router.use('/metrics', metricsRoutes);
router.use('/incidents', incidentRoutes);

module.exports = router;