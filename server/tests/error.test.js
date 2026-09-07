const express = require('express');
const request = require('supertest');
const errorHandler = require('../src/middleware/errorHandler');

describe('API Sentinel Server - Centralized Error Handler', () => {
  let testApp;

  beforeAll(() => {
    testApp = express();
    testApp.use(express.json());

    // Route that explicitly triggers an error
    testApp.get('/test-error', (req, res, next) => {
      const error = new Error('Simulated internal failure');
      error.status = 500;
      next(error);
    });

    // Route with custom status code
    testApp.get('/test-bad-request', (req, res, next) => {
      const error = new Error('Invalid request payload');
      error.statusCode = 400;
      next(error);
    });

    // Attach errorHandler
    testApp.use(errorHandler);
  });

  it('should format uncaught errors as JSON with status 500', async () => {
    const res = await request(testApp)
      .get('/test-error')
      .expect('Content-Type', /json/)
      .expect(500);

    expect(res.body).toHaveProperty('error');
    expect(res.body.message).toBe('Simulated internal failure');
  });

  it('should respect custom status codes passed on error object', async () => {
    const res = await request(testApp)
      .get('/test-bad-request')
      .expect('Content-Type', /json/)
      .expect(400);

    expect(res.body).toHaveProperty('error');
    expect(res.body.message).toBe('Invalid request payload');
  });
});

