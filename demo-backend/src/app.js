const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Upstream Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'demo-backend'
  });
});

// Static Datasets
const sampleProducts = [
  { id: 'prod-101', name: 'Load Balancer Appliance', category: 'Networking', price: 499.99, stock: 15 },
  { id: 'prod-102', name: 'SSL Certificate Pro', category: 'Security', price: 79.99, stock: 100 },
  { id: 'prod-103', name: 'API Rate Limiter Key', category: 'Infrastructure', price: 129.50, stock: 42 }
];

const sampleOrders = [
  { id: 'ord-5001', customer: 'Acme Enterprise', total: 999.98, status: 'fulfilled', createdAt: '2026-09-01T10:00:00Z' },
  { id: 'ord-5002', customer: 'Globex Corp', total: 129.50, status: 'pending', createdAt: '2026-09-02T14:30:00Z' }
];

const sampleUsers = [
  { id: 'usr-1', name: 'Alice Smith', email: 'alice@example.com', role: 'DevOps Lead' },
  { id: 'usr-2', name: 'Bob Jones', email: 'bob@example.com', role: 'SRE Specialist' }
];

// Demo Endpoints
app.get('/api/products', (req, res) => {
  const { category } = req.query;
  if (category) {
    const filtered = sampleProducts.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
    return res.status(200).json(filtered);
  }
  res.status(200).json(sampleProducts);
});

app.post('/api/products', (req, res) => {
  const newProduct = {
    id: `prod-${Date.now()}`,
    name: req.body?.name || 'New Demo Product',
    category: req.body?.category || 'General',
    price: Number(req.body?.price) || 0,
    stock: Number(req.body?.stock) || 0
  };
  res.status(201).json(newProduct);
});

app.get('/api/orders', (req, res) => {
  res.status(200).json(sampleOrders);
});

app.get('/api/users', (req, res) => {
  res.status(200).json(sampleUsers);
});

/**
 * DEVELOPMENT/TESTING ONLY: Simulated Slow Endpoint
 * Delays response by approximately 1000ms to test latency monitoring and timeouts.
 */
app.get('/api/slow', async (req, res) => {
  const delayMs = 1000;
  await new Promise((resolve) => setTimeout(resolve, delayMs));
  res.status(200).json({
    status: 'ok',
    message: 'Slow response completed successfully',
    delayMs
  });
});

/**
 * DEVELOPMENT/TESTING ONLY: Simulated Error Endpoint
 * Responds with HTTP 500 to test error tracking, circuit breaking, and resilience handling.
 */
app.get('/api/error', (req, res) => {
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Simulated demo backend failure for testing and resilience monitoring'
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Centralized Error Handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    error: err.name || 'InternalServerError',
    message: err.message || 'Demo backend encountered an unexpected error'
  });
});

module.exports = app;

