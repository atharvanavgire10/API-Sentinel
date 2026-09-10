const request = require('supertest');
const app = require('../src/app');

describe('Security Headers', () => {
  it('adds baseline security headers', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    expect(response.headers['x-content-type-options']).toBe(
      'nosniff'
    );

    expect(response.headers['x-frame-options']).toBe('DENY');

    expect(response.headers['referrer-policy']).toBe(
      'no-referrer'
    );

    expect(response.headers['content-security-policy']).toBe(
      "default-src 'none'; frame-ancestors 'none'"
    );
  });

  it('rejects JSON payloads larger than 1mb', async () => {
    const largePayload = {
      data: 'x'.repeat(1024 * 1024 + 1)
    };

    const response = await request(app)
      .post('/api/proxy/demo/api/products')
      .send(largePayload);

    expect(response.status).toBe(413);
  });

  it('does not expose stack traces for oversized payloads', async () => {
    const largePayload = {
      data: 'x'.repeat(1024 * 1024 + 1)
    };

    const response = await request(app)
      .post('/api/proxy/demo/api/products')
      .send(largePayload)
      .expect(413);

    expect(response.body.error).toBe('PayloadTooLargeError');
    expect(response.body.message).toBe(
      'request entity too large'
    );
    expect(response.body.stack).toBeUndefined();
  });
});