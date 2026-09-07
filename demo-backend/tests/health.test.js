const request = require('supertest');
const app = require('../src/app');

describe('Demo Backend - Health Check', () => {
  it('GET /health should return 200 with service info', async () => {
    const res = await request(app)
      .get('/health')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(res.body).toEqual({
      status: 'ok',
      service: 'demo-backend'
    });
  });
});

