const request = require('supertest');
const app = require('../src/app');

describe('Proxy Method Guard', () => {
  it('rejects unsupported HTTP methods', async () => {
    const response = await request(app)
      .trace('/api/proxy/demo/api/products')
      .expect(405);

    expect(response.body.error).toBe('Method Not Allowed');

    expect(response.headers.allow).toBe(
      'GET, POST, PUT, PATCH, DELETE'
    );
  });
});