const http = require('http');

const {
  checkService,
  checkAllServices,
  getHealthStatus,
  getServiceHealth,
  clearHealthStatus
} = require('../src/services/healthMonitorService');

const serviceRegistry = require('../src/services/serviceRegistry');

describe('Health Monitor Service', () => {
  let testServer;
  let testPort;

  beforeAll(async () => {
    testServer = http.createServer((req, res) => {
      if (req.url === '/health') {
        res.writeHead(200, {
          'Content-Type': 'application/json'
        });

        res.end(
          JSON.stringify({
            status: 'ok'
          })
        );

        return;
      }

      res.writeHead(404);
      res.end();
    });

    await new Promise((resolve) => {
      testServer.listen(0, resolve);
    });

    testPort = testServer.address().port;

    serviceRegistry.register('health-test', {
      baseUrl: `http://localhost:${testPort}`,
      timeoutMs: 1000
    });
  });

  beforeEach(() => {
    clearHealthStatus();
  });

  afterAll(async () => {
    await new Promise((resolve) => {
      testServer.close(resolve);
    });
  });

  it('marks a healthy service as healthy', async () => {
    const result = await checkService(
      'health-test',
      serviceRegistry.get('health-test')
    );

    expect(result.service).toBe('health-test');
    expect(result.status).toBe('healthy');
    expect(result.statusCode).toBe(200);
    expect(result.latency).toBeGreaterThanOrEqual(0);
    expect(result.lastChecked).toBeDefined();
  });

  it('marks an unavailable service as unhealthy', async () => {
    const result = await checkService(
      'offline-test',
      {
        name: 'offline-test',
        baseUrl: 'http://127.0.0.1:59999',
        timeoutMs: 500
      }
    );

    expect(result.service).toBe('offline-test');
    expect(result.status).toBe('unhealthy');
    expect(result.statusCode).toBeNull();
    expect(result.lastChecked).toBeDefined();
  });

  it('stores and retrieves service health status', async () => {
    await checkService(
      'health-test',
      serviceRegistry.get('health-test')
    );

    const status = getServiceHealth(
      'health-test'
    );

    expect(status).not.toBeNull();
    expect(status.status).toBe('healthy');
  });

  it('checks all registered services', async () => {
    const results = await checkAllServices();

    expect(Array.isArray(results)).toBe(true);

    const healthTest = results.find(
      (service) =>
        service.service === 'health-test'
    );

    expect(healthTest).toBeDefined();
    expect(healthTest.status).toBe('healthy');
  });

  it('clears stored health status', async () => {
    await checkService(
      'health-test',
      serviceRegistry.get('health-test')
    );

    expect(
      getHealthStatus().length
    ).toBeGreaterThan(0);

    clearHealthStatus();

    expect(
      getHealthStatus()
    ).toHaveLength(0);
  });
});