jest.mock('../src/services/rateLimiterService', () => ({
  checkRateLimit: jest
    .fn()
    .mockRejectedValue(
      new Error('Redis unavailable')
    )
}));

const rateLimiter = require('../src/middleware/rateLimiter');

describe('Rate Limiter Redis Failure', () => {
  it('fails open when Redis is unavailable', async () => {
    const req = {
      ip: '10.10.10.50',
      socket: {
        remoteAddress: '127.0.0.1'
      }
    };

    const res = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const next = jest.fn();

    await rateLimiter(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);

    expect(res.status).not.toHaveBeenCalled();

    expect(res.json).not.toHaveBeenCalled();
  });
});