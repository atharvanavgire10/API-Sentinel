const request = require('supertest');
const app = require('../src/app');

// your existing tests...

it('simulates a 500 failure', async () => {
  const response = await request(app)
    .get('/api/failure/500')
    .expect(500);

  expect(response.body.error).toBe(
    'Simulated Internal Server Error'
  );
});

it('simulates a 404 failure', async () => {
  const response = await request(app)
    .get('/api/failure/404')
    .expect(404);

  expect(response.body.error).toBe(
    'Simulated Not Found'
  );
});

it('simulates a slow response', async () => {
  const start = Date.now();

  const response = await request(app)
    .get('/api/failure/slow?delay=100')
    .expect(200);

  const elapsed = Date.now() - start;

  expect(response.body.simulatedDelay).toBe(100);
  expect(elapsed).toBeGreaterThanOrEqual(90);
});