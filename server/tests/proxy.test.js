const http = require('http');
const request = require('supertest');
const app = require('../src/app');
const { serviceRegistry } = require('../src/services');
const demoApp = require('../../demo-backend/src/app');

describe('API Sentinel Server - Reverse Proxy Gateway', () => {
  let demoServer;
  let demoPort;

  beforeAll(async () => {
    // Spin up an in-memory demo backend server on a dynamic port
    demoServer = http.createServer(demoApp);
    await new Promise((resolve) => demoServer.listen(0, resolve));
    demoPort = demoServer.address().port;

    // Register demo service pointing to the live test instance
    serviceRegistry.register('demo', {
      baseUrl: `http://localhost:${demoPort}`,
      timeoutMs: 5000
    });

    // Register a service with an intentionally short timeout for 504 testing
    serviceRegistry.register('timed-out-service', {
      baseUrl: `http://localhost:${demoPort}`,
      timeoutMs: 150
    });

    // Register a service pointing to an unallocated port for 502 testing
    serviceRegistry.register('offline-service', {
      baseUrl: 'http://127.0.0.1:59999',
      timeoutMs: 2000
    });
  });

  afterAll(async () => {
    if (demoServer) {
      await new Promise((resolve) => demoServer.close(resolve));
    }
  });

  it('1. GET /api/proxy/demo/api/products returns 200 and products from demo backend', async () => {
    const res = await request(app)
      .get('/api/proxy/demo/api/products')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('name');
    expect(res.headers).toHaveProperty('x-request-id');
  });

  it('2. GET /api/proxy/demo/api/orders returns 200 and orders from demo backend', async () => {
    const res = await request(app)
      .get('/api/proxy/demo/api/orders')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('customer');
  });

  it('3. GET /api/proxy/demo/api/users returns 200 and users from demo backend', async () => {
    const res = await request(app)
      .get('/api/proxy/demo/api/users')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('email');
  });

  it('4. Query parameters are preserved across the proxy', async () => {
    const res = await request(app)
      .get('/api/proxy/demo/api/products?category=Security')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].category).toBe('Security');
  });

  it('5. POST request forwarding works with payload and returns 201', async () => {
    const newProduct = {
      name: 'Proxied Sentinel Shield',
      category: 'Security',
      price: 249.99,
      stock: 12
    };

    const res = await request(app)
      .post('/api/proxy/demo/api/products')
      .send(newProduct)
      .expect('Content-Type', /json/)
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Proxied Sentinel Shield');
    expect(res.body.price).toBe(249.99);
  });

  it('6. Upstream 500 response is correctly forwarded', async () => {
    const res = await request(app)
      .get('/api/proxy/demo/api/error')
      .expect('Content-Type', /json/)
      .expect(500);

    expect(res.body).toEqual({
      error: 'Internal Server Error',
      message: 'Simulated demo backend failure for testing and resilience monitoring'
    });
  });

  it('7. Unknown service returns 404 with safe JSON', async () => {
    const res = await request(app)
      .get('/api/proxy/unknown/api/products')
      .expect('Content-Type', /json/)
      .expect(404);

    expect(res.body).toEqual({
      error: 'Not Found',
      message: "Service 'unknown' is not registered"
    });
  });

  it('8. Upstream unavailable returns 502 Bad Gateway', async () => {
    const res = await request(app)
      .get('/api/proxy/offline-service/api/products')
      .expect('Content-Type', /json/)
      .expect(502);

    expect(res.body).toEqual({
      error: 'Bad Gateway',
      message: "Upstream service 'offline-service' is unavailable"
    });
  });

  it('9. Upstream timeout returns 504 Gateway Timeout', async () => {
    const res = await request(app)
      .get('/api/proxy/timed-out-service/api/slow')
      .expect('Content-Type', /json/)
      .expect(504);

    expect(res.body).toEqual({
      error: 'Gateway Timeout',
      message: "Upstream service 'timed-out-service' timed out"
    });
  }, 4000);

  it('10. X-Request-ID is generated if missing and preserved if supplied', async () => {
    // Case A: Missing header -> gateway generates UUID
    const resAuto = await request(app)
      .get('/api/proxy/demo/api/products')
      .expect(200);

    const generatedId = resAuto.headers['x-request-id'];
    expect(generatedId).toBeDefined();
    expect(typeof generatedId).toBe('string');
    expect(generatedId.length).toBeGreaterThan(10);

    // Case B: Supplied header -> gateway preserves client header
    const customId = 'custom-trace-uuid-98765';
    const resCustom = await request(app)
      .get('/api/proxy/demo/api/products')
      .set('X-Request-ID', customId)
      .expect(200);

    expect(resCustom.headers['x-request-id']).toBe(customId);
  });
});

