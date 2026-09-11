# 🛡️ API Sentinel

> Production-inspired API reliability gateway and monitoring platform built with Node.js, Express, Redis, React, and Vite.

API Sentinel is a lightweight reliability gateway that sits between clients and upstream APIs.

Instead of simply forwarding requests, it provides a centralized layer for:

- 🔀 Reverse proxying
- 📊 Real-time API observability
- 🚦 Distributed rate limiting
- ❤️ Service health monitoring
- 🚨 Incident detection and deduplication
- 🔐 Security hardening
- ⚡ Performance testing
- 📈 Real-time reliability dashboards

The project was designed to explore how production API gateways handle traffic, failures, latency, observability, and distributed state.

---

## 🌐 Live Demo

| Component | URL |
|---|---|
| 📊 Dashboard | https://api-sentinel-beta.vercel.app/ |
| 🛡️ API Sentinel | https://api-sentinel-gqzi.onrender.com/ |
| 🧪 Demo Backend | https://api-sentinel-demo-backend.onrender.com/ |

> **Note:** The current backend uses Render's free tier, which may spin down after inactivity. This is a hosting-tier limitation and does not affect the gateway's functionality.

---

# 🏗️ Architecture

```text
                         ┌─────────────────────────┐
                         │      React Dashboard     │
                         │          Vercel         │
                         └────────────┬────────────┘
                                      │
                                      │ Metrics / Health
                                      ▼
┌───────────────┐           ┌─────────────────────────┐
│    Client     │ ────────► │      API Sentinel       │
└───────────────┘           │         Express         │
                            │                         │
                            │  Security Headers       │
                            │  CORS                   │
                            │  Rate Limiting          │
                            │  Request IDs            │
                            │  Reverse Proxy          │
                            │  Metrics                │
                            │  Health Monitoring      │
                            │  Incident Detection     │
                            └────────────┬────────────┘
                                         │
                           ┌─────────────┴─────────────┐
                           │                           │
                           ▼                           ▼
                  ┌──────────────────┐       ┌──────────────────┐
                  │   Upstash Redis  │       │  Demo Backend    │
                  │ Distributed State│       │     Express      │
                  └──────────────────┘       └──────────────────┘
🚀 Core Features
1. Reverse Proxy Gateway

API Sentinel forwards requests to registered upstream services.

Example:

GET /api/proxy/demo/api/products

is forwarded to:

https://<demo-backend>/api/products

The gateway preserves:

HTTP methods
Query parameters
Request bodies
Upstream status codes
Relevant request headers

It also generates or preserves:

X-Request-ID
Gateway failure handling
Scenario	Response
Unknown service	404
Upstream unavailable	502
Upstream timeout	504
Upstream 4xx	Forwarded
Upstream 5xx	Forwarded

Upstream response bodies are streamed where possible to avoid unnecessary response buffering.

📊 2. Real-Time API Observability

API Sentinel records metrics directly from gateway traffic.

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

Endpoints are aggregated using:

service + HTTP method + normalized path

Query parameters are excluded from endpoint aggregation.

For example:

/api/products?page=1
/api/products?page=2

are both recorded as:

/api/products
Metrics API
GET /api/metrics
GET /api/metrics/endpoints
GET /api/metrics/services/:service
🚦 3. Redis-Backed Distributed Rate Limiting

API Sentinel uses Redis to maintain shared rate-limit state.

Default configuration:

Window:       60 seconds
Maximum:      100 requests/client/window
Storage:      Redis

Responses include:

X-RateLimit-Limit
X-RateLimit-Remaining
X-RateLimit-Reset
Retry-After

When the limit is exceeded:

429 Too Many Requests

Example response:

{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Please try again later.",
  "retryAfter": 42
}
Fail-Open Behavior

If Redis becomes unavailable, the gateway allows requests to continue instead of taking the entire API gateway offline.

This is an intentional reliability trade-off:

Redis failure
     ↓
Rate limiter unavailable
     ↓
Allow request
     ↓
Gateway remains available
❤️ 4. Service Health Monitoring

API Sentinel periodically checks registered upstream services.

Default health-check interval:

30 seconds

The demo backend exposes:

GET /health

Health APIs:

GET /api/health
GET /api/health/services
GET /api/health/services/check
GET /api/health/services/:service

Health information includes:

Service status
HTTP status code
Response latency
Last checked timestamp
Error information when unavailable
🚨 5. Incident Detection

Health failures automatically create incidents.

The incident system supports:

Open/resolved states
Severity
Start time
Resolution time
Status code
Latency
Occurrence count
Duplicate suppression
Incident Lifecycle
Healthy
   │
   │ health check fails
   ▼
Incident Created
   │
   │ repeated failures
   ▼
Occurrence Count Updated
   │
   │ service recovers
   ▼
Incident Resolved
Incident Deduplication

Repeated failures for the same:

service + incident type

do not create hundreds of separate incidents.

Instead, the existing open incident is updated:

occurrenceCount++
Incident APIs
GET /api/incidents
GET /api/incidents/open
GET /api/incidents/:id
🔐 6. Security Hardening

API Sentinel includes production-oriented security controls.

Security Headers
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: no-referrer
Content-Security-Policy: default-src 'none'; frame-ancestors 'none'
CORS

Only the configured frontend origin is permitted.

CLIENT_URL

is used to control the allowed browser origin.

HTTP Method Protection

Supported methods:

GET
POST
PUT
PATCH
DELETE

Unsupported methods return:

405 Method Not Allowed

with an appropriate:

Allow

header.

Request Body Protection

JSON request bodies are limited to:

1 MB
Upstream URL Validation

Registered services must use valid:

http://
https://

URLs.

Unsupported URL schemes are rejected.

Redirect Handling

The proxy uses manual redirect handling:

redirect: "manual"

to avoid blindly following upstream redirects.

🧪 7. Failure Simulation

The demo backend provides controlled failure scenarios for testing reliability behavior.

Internal Server Error
GET /api/failure/500

Returns:

500 Internal Server Error
Not Found
GET /api/failure/404

Returns:

404 Not Found
Slow Upstream
GET /api/failure/slow?delay=6000

The default gateway timeout is:

5000 ms

Therefore a 6-second upstream request produces:

504 Gateway Timeout

This allows the reliability pipeline to be tested end-to-end:

Failure
  ↓
Gateway
  ↓
HTTP error
  ↓
Metrics
  ↓
Dashboard
📈 8. Real-Time Reliability Dashboard

The React dashboard provides visibility into the gateway.

Dashboard KPIs
Total requests
Success rate
Error rate
Average latency
P95 latency
P99 latency
Open incidents
Service Health

Displays:

Service name
Current health status
Status code
Health-check latency
Last checked time
Endpoint Performance

Displays:

HTTP method
Endpoint
Request count
Successful requests
Errors
Average latency
P95 latency
P99 latency
Additional Views
Request volume
Service performance
Latency distribution
Incident history

The dashboard automatically refreshes every:

10 seconds
⚡ 9. Performance Testing

API Sentinel includes a configurable load-testing script.

node scripts/load-test.js

The script measures:

Throughput
Total requests
Concurrency
Average latency
P50
P95
P99
Status-code distribution
Success rate
Benchmark

A sustained local benchmark was performed with:

Requests:       5,000
Concurrency:    50

Results:

Throughput:     ~1,220 requests/sec
Success:        5,000 / 5,000
Success Rate:   100%
Average:        ~39.97 ms
P50:            ~35.14 ms
P95:            ~58.11 ms
P99:            ~88.25 ms

For comparison, direct requests to the demo backend achieved approximately:

Throughput:     ~2,974 requests/sec
Average:        ~15.96 ms
P50:            ~12.71 ms
P95:            ~28.88 ms
P99:            ~75.78 ms

These results are environment-dependent and should be interpreted as engineering benchmarks rather than universal capacity guarantees.

🛠️ Tech Stack
Backend
Node.js
Express
Redis
node-redis
Jest
Supertest
Frontend
React
Vite
Recharts
Vitest
Testing Library
Infrastructure
GitHub
Render
Vercel
Upstash Redis
📁 Project Structure
api-sentinel/
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.js
│   │
│   ├── scripts/
│   │   └── load-test.js
│   │
│   ├── tests/
│   ├── .env.example
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── ...
│   │
│   ├── tests/
│   ├── .env.example
│   └── package.json
│
├── demo-backend/
│   ├── src/
│   ├── tests/
│   └── package.json
│
├── docs/
├── .gitignore
├── package.json
└── README.md
💻 Local Development
Prerequisites

Install:

Node.js 20+
Redis 7+
Git
Clone the Repository
git clone https://github.com/atharvanavgire10/API-Sentinel.git
cd API-Sentinel
Install Dependencies
API Sentinel
cd server
npm install
Demo Backend
cd ../demo-backend
npm install
Dashboard
cd ../client
npm install
⚙️ Environment Variables
API Sentinel

Create:

server/.env

using:

server/.env.example

Example:

PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

DEMO_BACKEND_URL=http://localhost:5001

PROXY_TIMEOUT_MS=5000

REDIS_URL=redis://localhost:6379

RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

HEALTH_CHECK_INTERVAL_MS=30000
Dashboard

Create:

client/.env

Example:

VITE_API_BASE_URL=http://localhost:5000

Never commit real secrets or production credentials to Git.

▶️ Running Locally
Start Demo Backend
cd demo-backend
npm start

Runs on:

http://localhost:5001
Start API Sentinel
cd server
npm start

Runs on:

http://localhost:5000
Start Dashboard
cd client
npm run dev

Runs on:

http://localhost:5173
🔌 API Examples
Proxy
curl http://localhost:5000/api/proxy/demo/api/products
Gateway Health
curl http://localhost:5000/api/health
Global Metrics
curl http://localhost:5000/api/metrics
Endpoint Metrics
curl http://localhost:5000/api/metrics/endpoints
Service Health
curl http://localhost:5000/api/health/services
Incidents
curl http://localhost:5000/api/incidents
🧪 Testing
Backend Tests
cd server
npm test

Backend tests cover:

Reverse proxy behavior
Request forwarding
Error handling
Timeouts
Metrics
Rate limiting
Health monitoring
Incident detection
Security headers
HTTP method validation
Frontend Tests
cd client
npm test

Frontend tests cover dashboard behavior and API-driven rendering.

Production Build
cd client
npm run build
🧠 Reliability Engineering Decisions

API Sentinel intentionally models several real-world reliability trade-offs.

Fail-Open Rate Limiting

Redis is an external dependency.

If Redis fails, blocking every API request could create a larger outage than the original Redis failure.

Therefore:

Redis unavailable
       ↓
Rate limiter fails
       ↓
Request allowed
       ↓
Gateway stays available
Gateway Timeout

An upstream service should not be allowed to hold gateway resources indefinitely.

The configurable timeout:

PROXY_TIMEOUT_MS=5000

limits how long the gateway waits.

Percentile Latency

Average latency alone can hide tail latency.

API Sentinel therefore tracks:

P50
P95
P99

to expose slow requests and tail behavior.

Incident Deduplication

A single failing service can generate many health-check failures.

Instead of creating one incident per failure:

Failure
Failure
Failure
Failure

API Sentinel maintains one open incident and increments:

occurrenceCount

until recovery.

🚀 Deployment

Current deployment:

Frontend
   ↓
Vercel

API Sentinel
   ↓
Render

Demo Backend
   ↓
Render

Distributed Rate Limit State
   ↓
Upstash Redis

Production environment variables are configured through the hosting providers rather than committed to the repository.

🔭 Future Improvements

Potential future enhancements include:

Persistent metrics storage
MongoDB-backed historical analytics
Atomic Redis rate-limit operations using Lua/MULTI
Sliding-window or token-bucket rate limiting
Authentication and API keys
Role-based dashboard access
Alert notifications
Prometheus/OpenTelemetry integration
Multi-service registration API
Distributed health-monitoring coordination
Advanced traffic shaping
Historical latency charts
Horizontal gateway deployment
Kubernetes deployment
🎯 Engineering Goals

API Sentinel was built to explore practical backend engineering concepts beyond basic CRUD APIs:

HTTP Networking
      ↓
Reverse Proxying
      ↓
Failure Handling
      ↓
Observability
      ↓
Distributed State
      ↓
Health Monitoring
      ↓
Incident Management
      ↓
Security
      ↓
Load Testing
      ↓
Production Deployment

The focus is on understanding how backend systems behave under:

Failure
Latency
Traffic
Distributed execution
Dependency outages
👨‍💻 Author

Atharva Navgire

GitHub:
https://github.com/atharvanavgire10