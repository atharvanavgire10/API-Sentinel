require('dotenv').config();

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  proxyTimeoutMs: parseInt(process.env.PROXY_TIMEOUT_MS, 10) || 5000,
  services: {
    demo: {
      name: 'demo',
      baseUrl: process.env.DEMO_BACKEND_URL || 'http://localhost:5001',
      timeoutMs: parseInt(process.env.PROXY_TIMEOUT_MS, 10) || 5000
    }
  }
};

module.exports = config;

