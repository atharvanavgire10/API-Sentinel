const {
  checkAllServices,
  getHealthStatus,
  getServiceHealth
} = require('../services/healthMonitorService');

async function checkAllServicesHealth(req, res) {
  try {
    const results = await checkAllServices();

    return res.status(200).json({
      services: results
    });
  } catch (error) {
    console.error(
      '[HealthController] Health check failed:',
      error.message
    );

    return res.status(500).json({
      error: 'Health check failed'
    });
  }
}

function getAllServicesHealth(req, res) {
  return res.status(200).json({
    services: getHealthStatus()
  });
}

function getSingleServiceHealth(req, res) {
  const serviceName = req.params.service;

  const health = getServiceHealth(serviceName);

  if (!health) {
    return res.status(404).json({
      error: 'Service health status not found'
    });
  }

  return res.status(200).json(health);
}

module.exports = {
  checkAllServicesHealth,
  getAllServicesHealth,
  getSingleServiceHealth
};