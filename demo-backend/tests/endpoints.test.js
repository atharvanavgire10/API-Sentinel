const request = require('supertest');
const app = require('../src/app');

describe('Demo Backend - Static Sample Endpoints', () => {
  it('GET /api/products should return list of products', async () => {
    const res = await request(app)
      .get('/api/products')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('name');
    expect(res.body[0]).toHaveProperty('price');
  });

  it('GET /api/orders should return list of orders', async () => {
    const res = await request(app)
      .get('/api/orders')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('customer');
  });

  it('GET /api/users should return list of users', async () => {
    const res = await request(app)
      .get('/api/users')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('email');
  });

  it('GET /api/products with query parameter filters by category', async () => {
    const res = await request(app)
      .get('/api/products?category=Security')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].category).toBe('Security');
  });

  it('POST /api/products creates a product and returns 201', async () => {
    const payload = {
      name: 'Custom Gateway Shield',
      category: 'Security',
      price: 199.99,
      stock: 20
    };

    const res = await request(app)
      .post('/api/products')
      .send(payload)
      .expect('Content-Type', /json/)
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Custom Gateway Shield');
    expect(res.body.price).toBe(199.99);
  });
});

