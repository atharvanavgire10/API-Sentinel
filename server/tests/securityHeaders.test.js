const request = require('supertest');

const app = require('../src/app');

describe('Security Headers', () => {
  it('adds baseline security headers', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    expect(
      response.headers['x-content-type-options']
    ).toBe('nosniff');

    expect(
      response.headers['x-frame-options']
    ).toBe('DENY');

    expect(
      response.headers['referrer-policy']
    ).toBe('no-referrer');

    expect(
      response.headers['content-security-policy']
    ).toBe(
      "default-src 'none'; frame-ancestors 'none'"
    );
  });
});