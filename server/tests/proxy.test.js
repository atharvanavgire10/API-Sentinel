const http = require('http');
const request = require('supertest');
const app = require('../src/app');
const { serviceRegistry } = require('../src/services');
const demoApp = require('../../demo-backend/src/app');

const {
  getGlobalMetrics,
  getEndpointMetrics,
  resetMetrics,
} = require('../src/services/metricsService');

describe('API Sentinel Server - Reverse Proxy Gateway', () => {
  let demoServer;
  let demoPort;

  beforeAll(async () => {
    // Spin up an in-memory demo backend server on a dynamic port
    demoServer = http.createServer(demoApp);

    await new Promise((resolve) => {
      demoServer.listen(0, resolve);
    });

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

  beforeEach(() => {
    // Keep every test isolated from previous metric data
    resetMetrics();
  });

  afterAll(async () => {
    if (demoServer) {
      await new Promise((resolve) => {
        demoServer.close(resolve);
      });
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

  // ------------------------------------------------------------
  // Phase 3 - Metrics Tests
  // ------------------------------------------------------------

  it('11. Successful proxied request is recorded in global metrics', async () => {
    await request(app)
      .get('/api/proxy/demo/api/products')
      .expect(200);

    const metrics = getGlobalMetrics();

    expect(metrics.totalRequests).toBe(1);
    expect(metrics.successfulRequests).toBe(1);
    expect(metrics.failedRequests).toBe(0);
    expect(metrics.clientErrorRequests).toBe(0);
    expect(metrics.serverErrorRequests).toBe(0);

    expect(metrics.averageLatency).toBeGreaterThanOrEqual(0);
    expect(metrics.p50Latency).toBeGreaterThanOrEqual(0);
    expect(metrics.p95Latency).toBeGreaterThanOrEqual(0);
    expect(metrics.p99Latency).toBeGreaterThanOrEqual(0);
  });

  it('12. Upstream 5xx response is recorded as a server error metric', async () => {
    await request(app)
      .get('/api/proxy/demo/api/error')
      .expect(500);

    const metrics = getGlobalMetrics();

    expect(metrics.totalRequests).toBe(1);
    expect(metrics.successfulRequests).toBe(0);
    expect(metrics.failedRequests).toBe(1);
    expect(metrics.clientErrorRequests).toBe(0);
    expect(metrics.serverErrorRequests).toBe(1);
  });

  it('13. Endpoint metrics are recorded correctly', async () => {
  await request(app)
    .get('/api/proxy/demo/api/products')
    .expect(200);

  const endpoints = getEndpointMetrics();

  const productsEndpoint = endpoints.find(
    (item) =>
      item.service === 'demo' &&
      item.method === 'GET' &&
      item.path === '/api/products'
  );

  expect(productsEndpoint).toBeDefined();

  expect(productsEndpoint.totalRequests).toBe(1);
  expect(productsEndpoint.successfulRequests).toBe(1);
  expect(productsEndpoint.failedRequests).toBe(0);

  expect(productsEndpoint.averageLatency).toBeGreaterThanOrEqual(0);
  expect(productsEndpoint.p50Latency).toBeGreaterThanOrEqual(0);
  expect(productsEndpoint.p95Latency).toBeGreaterThanOrEqual(0);
  expect(productsEndpoint.p99Latency).toBeGreaterThanOrEqual(0);
});

  it('14. Query parameters are excluded from endpoint metric identity', async () => {
  await request(app)
    .get('/api/proxy/demo/api/products?category=Security')
    .expect(200);

  await request(app)
    .get('/api/proxy/demo/api/products?category=Networking')
    .expect(200);

  const endpoints = getEndpointMetrics();

  const productsEndpoints = endpoints.filter(
    (item) =>
      item.service === 'demo' &&
      item.method === 'GET' &&
      item.path === '/api/products'
  );

  expect(productsEndpoints).toHaveLength(1);
  expect(productsEndpoints[0].totalRequests).toBe(2);
  expect(productsEndpoints[0].successfulRequests).toBe(2);
  expect(productsEndpoints[0].failedRequests).toBe(0);
});

  it('15. Multiple requests are aggregated in global metrics', async () => {
    await request(app)
      .get('/api/proxy/demo/api/products')
      .expect(200);

    await request(app)
      .get('/api/proxy/demo/api/orders')
      .expect(200);

    await request(app)
      .get('/api/proxy/demo/api/users')
      .expect(200);

    const metrics = getGlobalMetrics();

    expect(metrics.totalRequests).toBe(3);
    expect(metrics.successfulRequests).toBe(3);
    expect(metrics.failedRequests).toBe(0);
  });

  it('16. Gateway 502 response is recorded in metrics', async () => {
  await request(app)
    .get('/api/proxy/offline-service/api/products')
    .expect(502);

  const metrics = getGlobalMetrics();

  expect(metrics.totalRequests).toBe(1);
  expect(metrics.failedRequests).toBe(1);
  expect(metrics.serverErrorRequests).toBe(1);

  const endpoints = getEndpointMetrics();

  const offlineEndpoint = endpoints.find(
    (item) =>
      item.service === 'offline-service' &&
      item.method === 'GET' &&
      item.path === '/api/products'
  );

  expect(offlineEndpoint).toBeDefined();
  expect(offlineEndpoint.totalRequests).toBe(1);
  expect(offlineEndpoint.failedRequests).toBe(1);
  expect(offlineEndpoint.serverErrorRequests).toBe(1);
});

  it('17. Gateway 504 response is recorded in metrics', async () => {
  await request(app)
    .get('/api/proxy/timed-out-service/api/slow')
    .expect(504);

  const metrics = getGlobalMetrics();

  expect(metrics.totalRequests).toBe(1);
  expect(metrics.failedRequests).toBe(1);
  expect(metrics.serverErrorRequests).toBe(1);

  const endpoints = getEndpointMetrics();

  const timeoutEndpoint = endpoints.find(
    (item) =>
      item.service === 'timed-out-service' &&
      item.method === 'GET' &&
      item.path === '/api/slow'
  );

  expect(timeoutEndpoint).toBeDefined();
  expect(timeoutEndpoint.totalRequests).toBe(1);
  expect(timeoutEndpoint.failedRequests).toBe(1);
  expect(timeoutEndpoint.serverErrorRequests).toBe(1);
}, 4000);
});