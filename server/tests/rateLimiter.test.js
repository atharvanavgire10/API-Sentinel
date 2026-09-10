const {
  checkRateLimit
} = require('../src/services/rateLimiterService');

const {
  connectRedis,
  getRedisClient,
  disconnectRedis
} = require('../src/services/redisService');

describe('Rate Limiter Service', () => {
  let redis;

  beforeAll(async () => {
    await connectRedis();
    redis = getRedisClient();
  });

  beforeEach(async () => {
    const keys = await redis.keys(
      'rate-limit:test-*'
    );

    if (keys.length > 0) {
      await redis.del(keys);
    }
  });

  afterAll(async () => {
    await disconnectRedis();
  });

  it('allows requests within the configured limit', async () => {
    const result = await checkRateLimit(
      'test-client-1'
    );

    expect(result.allowed).toBe(true);
    expect(result.currentCount).toBe(1);
    expect(result.remaining).toBeGreaterThanOrEqual(0);
    expect(result.limit).toBeGreaterThan(0);
  });

  it('increments the request counter', async () => {
    const first =
      await checkRateLimit(
        'test-client-2'
      );

    const second =
      await checkRateLimit(
        'test-client-2'
      );

    expect(first.currentCount).toBe(1);
    expect(second.currentCount).toBe(2);
  });

  it('tracks different clients independently', async () => {
    const clientA =
      await checkRateLimit(
        'test-client-a'
      );

    const clientB =
      await checkRateLimit(
        'test-client-b'
      );

    expect(clientA.currentCount).toBe(1);
    expect(clientB.currentCount).toBe(1);
  });

  it('sets a positive retry window', async () => {
    const result =
      await checkRateLimit(
        'test-client-3'
      );

    expect(result.retryAfter).toBeGreaterThan(0);
  });
});