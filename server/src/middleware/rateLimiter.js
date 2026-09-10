const {
  checkRateLimit
} = require('../services/rateLimiterService');

/**
 * Redis-backed rate limiting middleware.
 *
 * The client IP is used as the rate-limit identity.
 */
async function rateLimiter(req, res, next) {
  const clientKey =
    req.ip ||
    req.socket.remoteAddress ||
    'unknown';

  try {
    const result =
      await checkRateLimit(clientKey);

    // Standard rate-limit headers
    res.setHeader(
      'X-RateLimit-Limit',
      result.limit
    );

    res.setHeader(
      'X-RateLimit-Remaining',
      result.remaining
    );

    res.setHeader(
      'X-RateLimit-Reset',
      result.retryAfter
    );

    // Request exceeded the limit
    if (!result.allowed) {
      res.setHeader(
        'Retry-After',
        result.retryAfter
      );

      return res.status(429).json({
        error: 'Too Many Requests',
        message:
          'Rate limit exceeded. Please try again later.',
        retryAfter: result.retryAfter
      });
    }

    return next();
  } catch (err) {
    console.error(
      '[RateLimiter] Redis error:',
      err.message
    );

    /*
     * Fail open:
     *
     * If Redis is unavailable, do not bring
     * the API gateway down.
     */
    return next();
  }
}

module.exports = rateLimiter;