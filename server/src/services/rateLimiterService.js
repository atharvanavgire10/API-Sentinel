const {
  connectRedis,
  isRedisConnected
} = require('./redisService');

const config = require('../config');

/**
 * Redis-backed distributed rate limiter.
 *
 * Each client gets a counter for the configured time window.
 * Redis makes the counter shared across multiple Sentinel instances.
 */
async function checkRateLimit(clientKey) {
  const redis = await connectRedis();

  const windowMs = config.rateLimitWindowMs;
  const maxRequests = config.rateLimitMaxRequests;

  const windowSeconds = Math.ceil(
    windowMs / 1000
  );

  const key = `rate-limit:${clientKey}`;

  const currentCount = await redis.incr(key);

  // Set expiration only when the key is created.
  if (currentCount === 1) {
    await redis.expire(
      key,
      windowSeconds
    );
  }

  const ttlSeconds = await redis.ttl(key);

  const allowed =
    currentCount <= maxRequests;

  return {
    allowed,
    limit: maxRequests,
    remaining: Math.max(
      0,
      maxRequests - currentCount
    ),
    retryAfter: Math.max(
      0,
      ttlSeconds
    ),
    currentCount
  };
}

module.exports = {
  checkRateLimit
};