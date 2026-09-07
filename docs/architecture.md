# API Sentinel Architecture (Phase 1)

## Overview

API Sentinel is an API reliability gateway and monitoring platform designed to provide traffic routing, latency monitoring, circuit breaking, rate limiting, and observability.

Phase 1 establishes the baseline multi-tier topology and developer workflow.

## Component Topology

```
+-------------------------------------------------------------+
|                     Client Application                      |
|                  (React + Vite Dashboard)                   |
|                    http://localhost:5173                    |
+-------------------------------------------------------------+
                              |
                              | Health Check & Management
                              v
+-------------------------------------------------------------+
|                     API Sentinel Core                       |
|               (Express Reliability Gateway)                 |
|                    http://localhost:5000                    |
+-------------------------------------------------------------+
                              |
                              | Proxied Requests (Phase 2+)
                              v
+-------------------------------------------------------------+
|                    Demo Backend Service                     |
|                  (Upstream Sample Service)                  |
|                    http://localhost:5001                    |
+-------------------------------------------------------------+
```

## Service Breakdown

### 1. API Sentinel Core Backend (`server/`)
- **Role**: Core gateway and control plane entrypoint.
- **Port**: `5000` (configurable via `PORT`).
- **Phase 1 Scope**:
  - Express application setup with centralized JSON error handling and 404 handling.
  - `GET /api/health` endpoint returning operational status.
  - Graceful termination signal handling (`SIGINT`, `SIGTERM`).
  - Modular project layout (`config/`, `controllers/`, `middleware/`, `models/`, `routes/`, `services/`).

### 2. Demo Backend Service (`demo-backend/`)
- **Role**: Upstream API service used as a real-world target for Sentinel to monitor, proxy, and protect in future phases.
- **Port**: `5001` (configurable via `PORT`).
- **Phase 1 Scope**:
  - `GET /health`: Upstream health endpoint.
  - `GET /api/products`: Static product catalog.
  - `GET /api/orders`: Static order collection.
  - `GET /api/users`: Static user collection.
  - `GET /api/slow`: Simulated high-latency endpoint (1000ms delay) for testing latency monitoring and timeout policies.
  - `GET /api/error`: Simulated failure endpoint (HTTP 500) for testing error rate tracking and circuit breaking.

### 3. API Sentinel Dashboard (`client/`)
- **Role**: Operator UI providing visibility into gateway health and system metrics.
- **Port**: `5173` (Vite dev server default).
- **Phase 1 Scope**:
  - Clean, responsive dashboard shell.
  - Real-time health polling of the API Sentinel gateway (`GET /api/health`).
  - Visual status indicator (`● Connected` vs `● Unavailable`).
  - Shell metrics cards outlining Phase 2 observability instrumentation.

---

## Evolution Roadmap

- **Phase 2**: Reverse Proxy Routing, Request/Response Interceptor, Latency Tracking.
- **Phase 3**: Redis-backed Rate Limiting, Circuit Breaking, Fault Injection Handling.
- **Phase 4**: MongoDB Metrics Storage, Incident Detection, Alerting Engine.
- **Phase 5**: Authentication, Role-based API Key Management, Operator Controls.

