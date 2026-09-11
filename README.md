🛡️ API Sentinel

Production-Inspired API Reliability Gateway & Monitoring Platform

API Sentinel is a production-inspired API reliability platform built with Node.js, Express, Redis, React, and Vite.

It sits between clients and backend services as a gateway, providing:

Reverse proxying

Distributed rate limiting

Request tracing

Real-time observability

Latency percentiles

Service health monitoring

Incident detection and recovery tracking

Security hardening

Failure simulation

Load testing

Live reliability dashboard

The project is designed to demonstrate practical backend engineering, distributed systems, observability, reliability engineering, and production deployment concepts.

🚀 Live Demo

API Sentinel Gateway

https://api-sentinel-gqzi.onrender.com/

Live Dashboard

https://api-sentinel-beta.vercel.app/

Demo Backend

https://api-sentinel-demo-backend.onrender.com/

🏗️ Architecture

                    ┌─────────────────────┐
                    │       Client        │
                    │ Browser / API Tool  │
                    └──────────┬──────────┘
                               │
                               ▼
                  ┌─────────────────────────┐
                  │      API Sentinel       │
                  │                         │
                  │  Reverse Proxy          │
                  │  Rate Limiting          │
                  │  Request IDs            │
                  │  Metrics                │
                  │  Health Monitoring      │
                  │  Incident Detection     │
                  │  Security Headers       │
                  │  Timeout Handling       │
                  └────────────┬────────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
                 ▼                           ▼
        ┌─────────────────┐         ┌─────────────────┐
        │      Redis      │         │  Demo Backend   │
        │                 │         │                 │
        │ Rate Limit      │         │ Products API    │
        │ Shared State    │         │ Health API      │
        └─────────────────┘         │ Failure APIs    │
                                    └─────────────────┘

                  ┌─────────────────────────┐
                  │    React Dashboard     │
                  │                         │
                  │ Metrics                 │
                  │ Endpoint Performance    │
                  │ Service Health          │
                  │ Incidents               │
                  └─────────────────────────┘

✨ Core Features

1. Reverse Proxy Gateway

API Sentinel acts as a gateway between clients and backend services.

Proxy endpoint:

GET /api/proxy/demo/api/products

The gateway:

Resolves the requested service

Builds the upstream URL

Preserves HTTP methods

Preserves query parameters

Forwards safe request headers

Preserves upstream status codes

Streams upstream response bodies

Generates X-Request-ID

Supports client-provided request IDs

Applies upstream timeouts

Handles unavailable services

Prevents unsafe redirects

📊 Observability

API Sentinel collects real request metrics directly from gateway traffic.

Global Metrics

Total requests

Successful requests

Failed requests

Client errors

Server errors

Average latency

P50 latency

P95 latency

P99 latency

Endpoint Metrics

Metrics are tracked using:

Service + HTTP Method + Normalized Path

Query parameters are excluded from endpoint identity.

Available APIs:

GET /api/metrics
GET /api/metrics/endpoints
GET /api/metrics/services/:service

Latency measurements use:

process.hrtime.bigint()

for high-resolution request timing.

🚦 Distributed Rate Limiting

API Sentinel uses Redis for shared rate-limit state.

Default configuration:

100 requests
per 60 seconds
per client

Configuration:

RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

Redis configuration:

REDIS_URL=redis://localhost:6379

Production uses a managed Redis instance.

Rate Limit Headers

Responses include:

X-RateLimit-Limit
X-RateLimit-Remaining
X-RateLimit-Reset

When the limit is exceeded:

HTTP/1.1 429 Too Many Requests

with:

Retry-After

The gateway is designed to fail open if Redis becomes unavailable so that a Redis outage does not automatically take down the API gateway.

🩺 Service Health Monitoring

API Sentinel continuously monitors registered backend services.

For the demo backend:

GET /health

Health monitoring includes:

Service availability

HTTP status

Response latency

Last successful check

Last failed check

Current health state

Default interval:

HEALTH_CHECK_INTERVAL_MS=30000

Health APIs:

GET /api/health
GET /api/health/services
GET /api/health/services/check
GET /api/health/services/:service

🚨 Incident Detection

Health failures automatically generate incidents.

Incident detection supports:

Service identification

Incident type

Severity

Start time

Resolution time

Occurrence count

Open/resolved state

Deduplication

Repeated failures for the same service and incident type are grouped into the same incident instead of creating unlimited duplicate incidents.

When the service recovers, the incident is automatically resolved.

APIs:

GET /api/incidents
GET /api/incidents/open
GET /api/incidents/:id

Example lifecycle:

Service Healthy
      │
      ▼
Health Check Fails
      │
      ▼
Incident Created
      │
      ▼
Repeated Failures
      │
      ▼
Occurrence Count Increases
      │
      ▼
Service Recovers
      │
      ▼
Incident Resolved

🔐 Security Hardening

The gateway includes several production-inspired security controls.

Security Headers

X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: no-referrer
Content-Security-Policy: default-src 'none'; frame-ancestors 'none'

CORS

Production CORS is restricted to the configured frontend origin.

CLIENT_URL=https://api-sentinel-beta.vercel.app

HTTP Method Protection

Supported methods:

GET
POST
PUT
PATCH
DELETE

Unsupported methods return:

405 Method Not Allowed

with an appropriate Allow header.

Service URL Validation

Registered upstream services must:

Have a valid URL

Use HTTP or HTTPS

Use normalized service names

Unsafe URL schemes are rejected.

Redirect Protection

Upstream redirects are handled manually instead of being automatically followed.

💥 Failure Simulation

The demo backend contains dedicated failure endpoints for reliability testing.

500 Error

GET /api/failure/500

Returns:

500 Internal Server Error

404 Error

GET /api/failure/404

Returns:

404 Not Found

Slow Response

GET /api/failure/slow?delay=1000

The response is intentionally delayed.

Default proxy timeout:

PROXY_TIMEOUT_MS=5000

A request exceeding the timeout results in:

504 Gateway Timeout

📈 Reliability Dashboard

The frontend is built using:

React

Vite

Recharts

The dashboard provides live visibility into gateway behavior.

Dashboard Sections

KPI Cards

Displays:

Total Requests

Success Rate

Error Rate

Average Latency

P95 Latency

P99 Latency

Open Incidents

Request Volume

Visualizes request traffic over time.

Endpoint Performance

Shows:

HTTP method

Endpoint

Request count

Successful requests

Errors

Average latency

P95

P99

Service Performance

Displays service-level reliability information.

Latency Distribution

Provides visibility into request latency.

Service Health

Shows:

Service status

HTTP status

Response latency

Health state

Incidents

Displays:

Incident type

Service

Severity

Status

Occurrence count

Started time

Resolved time

The dashboard automatically refreshes metrics every:

10 seconds

⚡ Performance Testing

API Sentinel includes a configurable load-testing script.

Location:

server/scripts/load-test.js

Supported configuration:

TARGET_URL
TOTAL_REQUESTS
CONCURRENCY
OUTPUT_FILE

Example:

TARGET_URL=http://localhost:5000/api/proxy/demo/api/products \
TOTAL_REQUESTS=5000 \
CONCURRENCY=50 \
node server/scripts/load-test.js

🏎️ Benchmark

A sustained gateway benchmark was performed with:

Requests:       5,000
Concurrency:    50
Success:        100%

Results:

Metric

Result

Throughput

~1,220 req/sec

Average Latency

39.97 ms

P50

35.14 ms

P95

58.11 ms

P99

88.25 ms

Successful Requests

5,000

Failed Requests

0

Direct demo-backend benchmark:

Metric

Result

Throughput

~2,974 req/sec

Average Latency

15.96 ms

P50

12.71 ms

P95

28.88 ms

P99

75.78 ms

These benchmarks were performed locally and are intended to demonstrate gateway overhead and behavior under concurrent traffic.

🧰 Tech Stack

Backend

Node.js

Express.js

Redis

node-redis

Native Fetch API

Node.js Streams

Frontend

React

Vite

Recharts

CSS

Testing

Jest

Supertest

Vitest

Infrastructure

Render

Vercel

Upstash Redis

Development

Git

GitHub

WSL

Redis CLI

📁 Project Structure

api-sentinel/
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   │   ├── healthController.js
│   │   │   ├── incidentController.js
│   │   │   └── metricsController.js
│   │   ├── middleware/
│   │   │   ├── errorHandler.js
│   │   │   ├── methodGuard.js
│   │   │   ├── rateLimiter.js
│   │   │   └── securityHeaders.js
│   │   ├── routes/
│   │   │   ├── healthRoutes.js
│   │   │   ├── incidentRoutes.js
│   │   │   ├── metricsRoutes.js
│   │   │   └── proxyRoutes.js
│   │   ├── services/
│   │   │   ├── healthMonitorService.js
│   │   │   ├── incidentService.js
│   │   │   ├── metricsService.js
│   │   │   ├── proxyService.js
│   │   │   ├── rateLimiterService.js
│   │   │   ├── redisService.js
│   │   │   └── serviceRegistry.js
│   │   ├── app.js
│   │   └── server.js
│   ├── scripts/
│   │   └── load-test.js
│   ├── tests/
│   ├── .env.example
│   └── package.json
│
├── demo-backend/
│   ├── src/
│   ├── tests/
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── App.css
│   ├── tests/
│   ├── .env.example
│   └── package.json
│
├── docs/
├── .gitignore
├── package.json
└── README.md

🛠️ Local Development

Prerequisites

Install:

Node.js 20+

npm

Redis

Git

Verify:

node --version
npm --version
redis-cli --version

📥 Clone Repository

git clone https://github.com/atharvanavgire10/API-Sentinel.git
cd API-Sentinel

📦 Install Dependencies

Server

cd server
npm install

Demo Backend

cd ../demo-backend
npm install

Client

cd ../client
npm install

⚙️ Environment Configuration

Server

Create:

server/.env

Example:

PORT=5000

DEMO_BACKEND_URL=http://localhost:5001

PROXY_TIMEOUT_MS=5000

REDIS_URL=redis://localhost:6379

RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

HEALTH_CHECK_INTERVAL_MS=30000

CLIENT_URL=http://localhost:5173

Client

Create:

client/.env

Example:

VITE_API_BASE_URL=http://localhost:5000

▶️ Run Locally

Start Redis:

redis-server

Start the demo backend:

cd demo-backend
npm start

Start API Sentinel:

cd server
npm start

Start the frontend:

cd client
npm run dev

The applications will be available at:

API Sentinel:
http://localhost:5000

Demo Backend:
http://localhost:5001

Dashboard:
http://localhost:5173

🔌 API Examples

Gateway Health

GET /api/health

Example:

{
  "status": "ok",
  "service": "api-sentinel"
}

Proxy Request

GET /api/proxy/demo/api/products

Metrics

GET /api/metrics

Endpoint Metrics

GET /api/metrics/endpoints

Service Metrics

GET /api/metrics/services/demo

Service Health

GET /api/health/services

Run Health Check

GET /api/health/services/check

Incidents

GET /api/incidents

Open Incidents

GET /api/incidents/open

🧪 Testing

API Sentinel contains automated backend, frontend, and demo-backend tests.

Backend

npm --prefix server test

Demo Backend

npm --prefix demo-backend test

Frontend

npm --prefix client test

Frontend Production Build

npm --prefix client run build

🧠 Reliability Engineering Decisions

Fail Open Rate Limiting

If Redis becomes unavailable, the gateway continues processing requests rather than blocking all traffic.

This avoids turning the rate limiter into a single point of failure.

Upstream Timeouts

Backend services cannot hold gateway connections indefinitely.

Requests exceeding the configured timeout return:

504 Gateway Timeout

Request IDs

Each proxied request receives an identifier through:

X-Request-ID

Existing client request IDs are preserved.

This makes requests easier to trace across systems.

Streaming Proxy Responses

Upstream response bodies are streamed instead of fully buffering large responses in memory.

This reduces unnecessary memory usage and improves gateway efficiency.

Normalized Endpoint Metrics

Query parameters are excluded from endpoint metric keys.

For example:

/api/products?page=1
/api/products?page=2
/api/products?page=3

are grouped under:

/api/products

This keeps observability data useful and bounded.

Incident Deduplication

Repeated failures are grouped into the same incident.

Instead of creating a new incident for every failed health check, the system maintains an occurrence count for the existing incident.

Security-First Proxying

The gateway validates upstream service URLs and only permits:

http://
https://

Redirects are handled manually rather than blindly followed.

☁️ Production Deployment

API Sentinel

Deployed on:

Render

Live:

https://api-sentinel-gqzi.onrender.com/

Demo Backend

Deployed on:

Render

Live:

https://api-sentinel-demo-backend.onrender.com/

Frontend

Deployed on:

Vercel

Live:

https://api-sentinel-beta.vercel.app/

Redis

Production rate limiting uses:

Upstash Redis

The production Redis connection string is stored as an environment variable and is not committed to Git.

🔒 Production Environment Variables

Never commit secrets such as:

REDIS_URL

to the repository.

Use platform environment variables instead.

The repository only contains example configuration files:

server/.env.example
client/.env.example

📋 Project Development Roadmap

Phase 1  → Foundation
Phase 2  → Reverse Proxy Gateway
Phase 3  → Real Observability Metrics
Phase 4  → Redis Distributed Rate Limiting
Phase 5  → Reliability Dashboard
Phase 6  → Health Monitoring
Phase 7  → Incident Detection
Phase 8  → Security & Failure Simulation
Phase 9  → Load Testing & Optimization
Phase 10 → Production Readiness & Deployment

🔮 Future Improvements

Potential future enhancements include:

Persistent metrics storage

Historical dashboards

Prometheus integration

OpenTelemetry tracing

Alert notifications

Authentication and API keys

Role-based access control

Multiple production services

Circuit breaker support

Retry policies

Distributed tracing

Configurable rate-limit strategies

Redis Lua-based atomic rate limiting

Containerized deployment

Kubernetes deployment

Horizontal gateway scaling

Advanced incident correlation

Long-term metrics retention

📌 Key Engineering Highlights

API Sentinel demonstrates practical experience with:

Backend API Design
Reverse Proxy Architecture
Distributed Rate Limiting
Redis
HTTP Reliability
Request Tracing
Observability
Latency Percentiles
Health Monitoring
Incident Management
Failure Detection
Security Hardening
Timeout Handling
Streaming
Concurrency
Load Testing
Automated Testing
Production Deployment

📊 Project Results

Gateway Performance

~1,220 requests/sec
5,000 requests
50 concurrent clients
100% successful responses

Observability

P50
P95
P99
Average Latency
Success Rate
Error Rate
Endpoint Metrics
Service Metrics

Reliability

Redis-backed rate limiting
Health monitoring
Incident deduplication
Automatic incident resolution
Upstream timeout protection
Failure simulation

👨‍💻 Author

Atharva Navgire

Information Technology Engineering Student

GitHub:

https://github.com/atharvanavgire10

⭐ Project

If you find this project useful or interesting, consider giving the repository a ⭐ on GitHub.

API Sentinel

Observe. Protect. Detect. Recover.

A production-inspired API reliability gateway designed to demonstrate real-world backend and reliability engineering concepts.