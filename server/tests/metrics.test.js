const request = require('supertest');

const app = require('../src/app');

const {
  resetMetrics,
  calculatePercentile,
} = require('../src/services/metricsService');

describe('Metrics API', () => {
  beforeEach(() => {
    resetMetrics();
  });

  test('returns zero metrics initially', async () => {
    const response = await request(app)
      .get('/api/metrics')
      .expect(200);

    expect(response.body).toEqual({
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      clientErrorRequests: 0,
      serverErrorRequests: 0,
      averageLatency: 0,
      p50Latency: 0,
      p95Latency: 0,
      p99Latency: 0,
    });
  });

  test('calculates percentiles', () => {
    const samples = [10, 20, 30, 40, 50];

    expect(calculatePercentile(samples, 50)).toBe(30);
    expect(calculatePercentile(samples, 95)).toBe(50);
    expect(calculatePercentile(samples, 99)).toBe(50);
  });
});