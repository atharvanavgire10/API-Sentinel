/**
 * Health check controller
 * Returns the operational health status of API Sentinel service.
 */
const getHealth = (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'api-sentinel'
  });
};

module.exports = {
  getHealth
};

