const request = require('supertest');

const app = require('../src/app');

const {
  connectRedis,
  getRedisClient,
  disconnectRedis
} = require('../src/services/redisService');

const config = require('../src/config');

describe('Rate Limiter Middleware', () => {
  let redis;
  let originalMaxRequests;

  beforeAll(async () => {
    await connectRedis();
    redis = getRedisClient();

    originalMaxRequests = config.rateLimitMaxRequests;
  });

  beforeEach(async () => {
    const keys = await redis.keys('rate-limit:*');

    if (keys.length > 0) {
      await redis.del(keys);
    }

    // Use a very small limit for testing.
    config.rateLimitMaxRequests = 2;
  });

  afterAll(async () => {
    config.rateLimitMaxRequests = originalMaxRequests;

    const keys = await redis.keys('rate-limit:*');

    if (keys.length > 0) {
      await redis.del(keys);
    }

    await disconnectRedis();
  });

  it('allows requests and returns rate-limit headers', async () => {
    const response = await request(app)
      .get('/api/proxy/demo/api/products')
      .set('X-Forwarded-For', '10.10.10.1')
      .expect(200);

    expect(
      response.headers['x-ratelimit-limit']
    ).toBeDefined();

    expect(
      response.headers['x-ratelimit-remaining']
    ).toBeDefined();

    expect(
      response.headers['x-ratelimit-reset']
    ).toBeDefined();
  });

  it('returns 429 when the rate limit is exceeded', async () => {
    const clientIp = '10.10.10.2';

    // Request 1
    await request(app)
      .get('/api/proxy/demo/api/products')
      .set('X-Forwarded-For', clientIp)
      .expect(200);

    // Request 2
    await request(app)
      .get('/api/proxy/demo/api/products')
      .set('X-Forwarded-For', clientIp)
      .expect(200);

    // Request 3 should be blocked
    const response = await request(app)
      .get('/api/proxy/demo/api/products')
      .set('X-Forwarded-For', clientIp)
      .expect(429);

    expect(response.body.error).toBe(
      'Too Many Requests'
    );

    expect(response.body.message).toBe(
      'Rate limit exceeded. Please try again later.'
    );

    expect(response.body.retryAfter).toBeGreaterThanOrEqual(0);

    expect(
      response.headers['retry-after']
    ).toBeDefined();
  });
});