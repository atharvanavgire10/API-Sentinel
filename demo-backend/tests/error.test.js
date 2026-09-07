const request = require('supertest');
const app = require('../src/app');

describe('Demo Backend - Simulated Error Endpoint', () => {
  it('GET /api/error should return 500 with safe JSON error payload', async () => {
    const res = await request(app)
      .get('/api/error')
      .expect('Content-Type', /json/)
      .expect(500);

    expect(res.body).toEqual({
      error: 'Internal Server Error',
      message: 'Simulated demo backend failure for testing and resilience monitoring'
    });
  });
});

