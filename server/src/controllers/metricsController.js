const {
  getGlobalMetrics,
  getEndpointMetrics,
  getServiceMetrics,
} = require('../services/metricsService');

function getMetrics(req, res) {
  res.json(getGlobalMetrics());
}

function getEndpointMetricsHandler(req, res) {
  res.json({
    endpoints: getEndpointMetrics(),
  });
}

function getServiceMetricsHandler(req, res) {
  const metrics = getServiceMetrics(req.params.service);

  res.json({
    service: req.params.service,
    endpoints: metrics,
  });
}

module.exports = {
  getMetrics,
  getEndpointMetricsHandler,
  getServiceMetricsHandler,
};