const express = require('express');

const {
  checkAllServicesHealth,
  getAllServicesHealth,
  getSingleServiceHealth
} = require('../controllers/healthController');

const router = express.Router();

// Existing gateway health endpoint
router.get('/', (req, res) => {
  return res.status(200).json({
    status: 'ok',
    service: 'api-sentinel'
  });
});

// Health monitoring endpoints
router.get(
  '/services/check',
  checkAllServicesHealth
);

router.get(
  '/services',
  getAllServicesHealth
);

router.get(
  '/services/:service',
  getSingleServiceHealth
);

module.exports = router;