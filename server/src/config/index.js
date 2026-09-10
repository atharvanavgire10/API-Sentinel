require('dotenv').config();

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,

  nodeEnv:
    process.env.NODE_ENV || 'development',

  clientUrl:
    process.env.CLIENT_URL ||
    'http://localhost:5173',

  proxyTimeoutMs:
    parseInt(process.env.PROXY_TIMEOUT_MS, 10) ||
    5000,

  // Phase 4 - Redis
  redisUrl:
    process.env.REDIS_URL ||
    'redis://localhost:6379',

  // Phase 4 - Rate Limiting
  rateLimitWindowMs:
    parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) ||
    60000,

  rateLimitMaxRequests:
    parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) ||
    100,

  healthCheckIntervalMs:
  parseInt(
    process.env.HEALTH_CHECK_INTERVAL_MS,
    10
  ) || 30000,

  services: {
    demo: {
      name: 'demo',

      baseUrl:
        process.env.DEMO_BACKEND_URL ||
        'http://localhost:5001',

      timeoutMs:
        parseInt(process.env.PROXY_TIMEOUT_MS, 10) ||
        5000
    }
  }
};

module.exports = config;