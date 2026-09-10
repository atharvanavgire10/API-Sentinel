const express = require('express');

const {
  getMetrics,
  getEndpointMetricsHandler,
  getServiceMetricsHandler,
} = require('../controllers/metricsController');

const router = express.Router();

router.get('/', getMetrics);
router.get('/endpoints', getEndpointMetricsHandler);
router.get('/services/:service', getServiceMetricsHandler);

module.exports = router;