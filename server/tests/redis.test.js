const {
  connectRedis,
  isRedisConnected,
  disconnectRedis
} = require('../src/services/redisService');

describe('Redis Service', () => {
  afterAll(async () => {
    await disconnectRedis();
  });

  it('connects to Redis successfully', async () => {
    await connectRedis();

    expect(isRedisConnected()).toBe(true);
  });
});