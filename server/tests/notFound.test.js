const request = require('supertest');
const app = require('../src/app');

describe('API Sentinel Server - 404 Handler', () => {
  it('GET /api/unknown-endpoint should return 404 JSON', async () => {
    const res = await request(app)
      .get('/api/unknown-endpoint')
      .expect('Content-Type', /json/)
      .expect(404);

    expect(res.body).toEqual({
      error: 'Not Found',
      message: 'Cannot GET /api/unknown-endpoint'
    });
  });

  it('POST /unregistered-route should return 404 JSON', async () => {
    const res = await request(app)
      .post('/unregistered-route')
      .expect('Content-Type', /json/)
      .expect(404);

    expect(res.body).toEqual({
      error: 'Not Found',
      message: 'Cannot POST /unregistered-route'
    });
  });
});

