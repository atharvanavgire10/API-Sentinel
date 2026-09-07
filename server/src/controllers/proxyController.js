const { proxyService } = require('../services');

/**
 * Proxy Controller
 * Handles requests routed to /api/proxy/:service/*
 */
const handleProxy = async (req, res, next) => {
  try {
    await proxyService.forward(req, res);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleProxy
};

