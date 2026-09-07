# API Sentinel

> **API Sentinel** is a production-inspired API reliability gateway and monitoring platform designed to provide traffic routing, latency monitoring, circuit breaking, rate limiting, and observability.

---

> [!NOTE]
> **Phase 1 Implementation Notice**:
> This repository is currently in **Phase 1 (Foundation)**. Advanced reliability features—including reverse proxying, Redis caching/rate limiting, MongoDB metrics storage, active circuit breakers, incident alerts, and authentication—are planned for subsequent phases and are **not yet implemented** in this release.

---

## Architecture Overview

API Sentinel uses a three-tier decoupled architecture:

```
[ Client (React + Vite Dashboard) ]
                |
                v
[ API Sentinel Gateway (Node.js + Express) ]
                |
                v (Planned Phase 2+)
[ Demo Backend Service (Upstream Mock Service) ]
```

| Component | Technology | Default Port | Description |
|-----------|------------|--------------|-------------|
| **Server** (`server/`) | Node.js, Express | `5000` | Gateway foundation, health check, 404 & error handlers, graceful shutdown |
| **Demo Backend** (`demo-backend/`) | Node.js, Express | `5001` | Upstream target service with sample datasets & test endpoints |
| **Client** (`client/`) | React 18, Vite | `5173` | Operator dashboard displaying gateway connection status and metric shells |

Detailed architectural diagrams and component descriptions can be found in [docs/architecture.md](docs/architecture.md).

---

## Current Phase 1 Scope

- **API Sentinel Server**:
  - Express server scaffold with modular architecture (`config/`, `controllers/`, `middleware/`, `models/`, `routes/`, `services/`).
  - `GET /api/health` returning operational status JSON.
  - Centralized JSON error handler and 404 handler.
  - Graceful shutdown signal handling for `SIGINT` and `SIGTERM`.
  - Zero placeholder business logic.
- **Demo Backend**:
  - Standalone Express service representing an upstream target.
  - `GET /health` service health check.
  - Static demo resources: `GET /api/products`, `GET /api/orders`, `GET /api/users`.
  - Development & testing simulation endpoints:
    - `GET /api/slow`: Artificially delayed (~1000ms) endpoint for latency testing.
    - `GET /api/error`: Predictable HTTP 500 error for failure handling verification.
- **API Sentinel Dashboard**:
  - Clean React + Vite interface with accessible branding and styling.
  - Dynamic backend connection indicator querying `GET /api/health`:
    - `Backend: ● Connected`
    - `Backend: ● Unavailable`
  - Recheck button and timestamp display.
  - Extensible dashboard metric shells outlining future observability metrics.
- **Automated Testing**:
  - Jest + Supertest suites for backend and demo backend.
  - Vitest + Testing Library suite for frontend rendering and mock resolution.

---

## Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **OS**: Windows, macOS, or Linux

---

## Local Setup & Installation

Install dependencies across all three workspaces:

```bash
# 1. Install API Sentinel backend dependencies
cd server
npm install
cd ..

# 2. Install Demo backend dependencies
cd demo-backend
npm install
cd ..

# 3. Install Frontend dashboard dependencies
cd client
npm install
cd ..
```

---

## Environment Variables

Copy the `.env.example` file in each directory to `.env` if custom configuration is desired:

### Server (`server/.env.example`)
```env
# Port on which API Sentinel server listens
PORT=5000

# Environment mode
NODE_ENV=development

# Allowed client origin for CORS
CLIENT_URL=http://localhost:5173
```

### Demo Backend (`demo-backend/.env.example`)
```env
# Port on which Demo backend listens
PORT=5001

# Environment mode
NODE_ENV=development
```

### Client (`client/.env.example`)
```env
# API Gateway URL (without trailing slash)
VITE_API_URL=http://localhost:5000/api
```

---

## Running Each Service

Each service can be run independently using its respective npm scripts:

### Running the API Sentinel Server
```bash
cd server
npm run dev
```
*Runs on `http://localhost:5000` with hot-reload via nodemon.*

### Running the Demo Backend
```bash
cd demo-backend
npm run dev
```
*Runs on `http://localhost:5001` with hot-reload via nodemon.*

### Running the Frontend Dashboard
```bash
cd client
npm run dev
```
*Runs on `http://localhost:5173` via Vite.*

### Convenience Root Scripts
From the root workspace directory:
```bash
# Start individual services from root
npm run dev:server
npm run dev:demo
npm run dev:client
```

---

## Testing

Run tests across each individual service or use the root orchestration script:

### Run All Test Suites
```bash
npm test
```

### Run Service Test Suites Individually
```bash
# API Sentinel Backend Tests (Jest + Supertest)
npm --prefix server test

# Demo Backend Tests (Jest + Supertest)
npm --prefix demo-backend test

# Frontend Dashboard Tests (Vitest + Testing Library)
npm --prefix client test
```

### Production Build Verification
```bash
npm --prefix client run build
```

---

## Upstream Demo Endpoints Reference

The demo backend provides the following endpoints for development and integration:

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Service health status (`{"status":"ok","service":"demo-backend"}`) |
| `GET` | `/api/products` | Static sample product inventory |
| `GET` | `/api/orders` | Static sample customer orders |
| `GET` | `/api/users` | Static sample users list |
| `GET` | `/api/slow` | **Development/Testing Only**: Waits ~1000ms then returns HTTP 200 |
| `GET` | `/api/error` | **Development/Testing Only**: Returns HTTP 500 simulated internal failure |

---

## Planned Future Phases

- [ ] **Phase 2: Reverse Proxy & Request Interception**
  - Dynamic reverse proxying from API Sentinel to upstream services.
  - End-to-end request/response timing and latency capture.
- [ ] **Phase 3: Rate Limiting & Circuit Breaking**
  - Redis token-bucket rate limiting per API key and client IP.
  - Circuit breaker states (Closed, Open, Half-Open) for failing upstreams.
- [ ] **Phase 4: Persistent Observability & Incident Detection**
  - MongoDB timeseries metrics persistence.
  - SLA breach detection, alerting thresholds, and incident log.
- [ ] **Phase 5: Auth & Enterprise Management**
  - API Key issuance, quota tiers, and operator dashboard controls.

