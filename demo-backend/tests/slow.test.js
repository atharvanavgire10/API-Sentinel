const request = require('supertest');
const app = require('../src/app');

describe('Demo Backend - Simulated Slow Endpoint', () => {
  it('GET /api/slow should delay and return 200 with timing data', async () => {
    const startTime = Date.now();
    const res = await request(app)
      .get('/api/slow')
      .expect('Content-Type', /json/)
      .expect(200);

    const elapsed = Date.now() - startTime;
    // Verify that approximately 1000ms delay took place (with reasonable margin)
    expect(elapsed).toBeGreaterThanOrEqual(950);
    expect(res.body).toEqual({
      status: 'ok',
      message: 'Slow response completed successfully',
      delayMs: 1000
    });
  }, 5000);
});

