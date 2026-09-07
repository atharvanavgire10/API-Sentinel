const request = require('supertest');
const app = require('../src/app');

describe('API Sentinel Server - Health Check Endpoint', () => {
  it('GET /api/health should return 200 with service info', async () => {
    const res = await request(app)
      .get('/api/health')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body).toEqual({
      status: 'ok',
      service: 'api-sentinel'
    });
  });
});

