import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import "./App.css";
import useMetrics from "./hooks/useMetrics";
import useHealth from "./hooks/useHealth";
import { useIncidents } from "./hooks/useIncidents";

function MetricCard({ label, value, suffix = "" }) {
  return (
    <div className="metric-card">
      <span className="metric-label">{label}</span>

      <strong className="metric-value">
        {value}
        {suffix}
      </strong>
    </div>
  );
}

function Dashboard() {
  const {
    globalMetrics,
    endpointMetrics,
    serviceMetrics,
    loading,
    refreshing,
    error,
    refresh,
  } = useMetrics();

  const { services: healthServices, error: healthError } = useHealth();

  const {
    incidents,
    openIncidents,
    loading: incidentsLoading,
    error: incidentsError,
  } = useIncidents();

  const successRate =
    globalMetrics.totalRequests > 0
      ? (
          (globalMetrics.successfulRequests / globalMetrics.totalRequests) *
          100
        ).toFixed(1)
      : "0.0";

  const errorRate =
    globalMetrics.totalRequests > 0
      ? (
          (globalMetrics.failedRequests / globalMetrics.totalRequests) *
          100
        ).toFixed(1)
      : "0.0";

  const chartData = endpointMetrics.map((endpoint) => ({
    name: endpoint.path,
    requests: endpoint.totalRequests,
  }));

  if (loading) {
    return <div className="dashboard-state">Loading metrics...</div>;
  }

  if (error) {
    return (
      <div className="dashboard-state error-state">
        <p>{error}</p>

        <button onClick={refresh}>Retry</button>
      </div>
    );
  }

  return (
    <main className="dashboard">
      <section className="dashboard-header">
        <div>
          <p className="eyebrow">API RELIABILITY MONITOR</p>

          <h1>API Sentinel</h1>

          <p className="dashboard-subtitle">
            Real-time gateway performance and reliability metrics.
          </p>
        </div>

        <div className="header-actions">
          <span className="refresh-status">
            {refreshing ? "Updating..." : "Auto-refresh: 10s"}
          </span>

          <button
            className="refresh-button"
            onClick={refresh}
            disabled={refreshing}
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </section>

      {/* KPI Metrics */}

      <section className="metric-grid">
        <MetricCard
          label="Total Requests"
          value={globalMetrics.totalRequests}
        />

        <MetricCard label="Success Rate" value={successRate} suffix="%" />

        <MetricCard label="Error Rate" value={errorRate} suffix="%" />

        <MetricCard
          label="Average Latency"
          value={globalMetrics.averageLatency.toFixed(2)}
          suffix=" ms"
        />

        <MetricCard
          label="P95 Latency"
          value={globalMetrics.p95Latency.toFixed(2)}
          suffix=" ms"
        />

        <MetricCard
          label="P99 Latency"
          value={globalMetrics.p99Latency.toFixed(2)}
          suffix=" ms"
        />

        <MetricCard
          label="Open Incidents"
          value={incidentsLoading ? "—" : openIncidents.length}
        />
      </section>

      {/* Service Health */}

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>Service Health</h2>

            <p>Live health status of registered upstream services.</p>
          </div>
        </div>

        {healthError ? (
          <div className="empty-state">{healthError}</div>
        ) : healthServices.length === 0 ? (
          <div className="empty-state">No health data available yet.</div>
        ) : (
          <div className="health-grid">
            {healthServices.map((service) => (
              <div className="health-card" key={service.service}>
                <div className="health-card-header">
                  <div>
                    <span className="metric-label">Service</span>

                    <strong className="health-service-name">
                      {service.service}
                    </strong>
                  </div>

                  <span
                    className={`health-status ${
                      service.status === "healthy" ? "healthy" : "unhealthy"
                    }`}
                  >
                    {service.status}
                  </span>
                </div>

                <div className="health-details">
                  <div>
                    <span>Status Code</span>

                    <strong>{service.statusCode ?? "N/A"}</strong>
                  </div>

                  <div>
                    <span>Latency</span>

                    <strong>{service.latency.toFixed(2)} ms</strong>
                  </div>

                  <div>
                    <span>Last Checked</span>

                    <strong>
                      {new Date(service.lastChecked).toLocaleTimeString()}
                    </strong>
                  </div>
                </div>

                {service.error && (
                  <p className="health-error">{service.error}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Incidents */}

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>Incidents</h2>

            <p>Reliability incidents detected by API Sentinel.</p>
          </div>
        </div>

        {incidentsError ? (
          <div className="empty-state">{incidentsError}</div>
        ) : incidentsLoading ? (
          <div className="empty-state">Loading incidents...</div>
        ) : incidents.length === 0 ? (
          <div className="empty-state">No incidents detected.</div>
        ) : (
          <div className="table-wrapper">
            <table className="incident-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Severity</th>
                  <th>Service</th>
                  <th>Type</th>
                  <th>Message</th>
                  <th>Occurrences</th>
                  <th>Started</th>
                  <th>Resolved</th>
                </tr>
              </thead>

              <tbody>
                {incidents.map((incident) => (
                  <tr key={incident.id}>
                    <td>
                      <span className={`incident-status ${incident.status}`}>
                        {incident.status}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`incident-severity ${incident.severity}`}
                      >
                        {incident.severity}
                      </span>
                    </td>

                    <td>{incident.service}</td>

                    <td>{incident.type}</td>

                    <td className="incident-message">{incident.message}</td>

                    <td>{incident.occurrenceCount}</td>

                    <td>{new Date(incident.startedAt).toLocaleString()}</td>

                    <td>
                      {incident.resolvedAt
                        ? new Date(incident.resolvedAt).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Request Volume */}

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>Request Volume</h2>

            <p>Requests recorded by endpoint.</p>
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="empty-state">No request volume recorded yet.</div>
        ) : (
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 20,
                  left: 0,
                  bottom: 10,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="name" tick={{ fontSize: 12 }} />

                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />

                <Tooltip />

                <Bar dataKey="requests" name="Requests" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Endpoint Performance */}

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>Endpoint Performance</h2>

            <p>Latency and reliability by endpoint.</p>
          </div>
        </div>

        {endpointMetrics.length === 0 ? (
          <div className="empty-state">No endpoint traffic recorded yet.</div>
        ) : (
          <div className="table-wrapper">
            <table className="incident-table">
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Endpoint</th>
                  <th>Requests</th>
                  <th>Success</th>
                  <th>Errors</th>
                  <th>Avg</th>
                  <th>P95</th>
                  <th>P99</th>
                </tr>
              </thead>

              <tbody>
                {endpointMetrics.map((endpoint) => (
                  <tr
                    key={`${endpoint.service}-${endpoint.method}-${endpoint.path}`}
                  >
                    <td>
                      <span className="method-badge">{endpoint.method}</span>
                    </td>

                    <td className="endpoint-path">{endpoint.path}</td>

                    <td>{endpoint.totalRequests}</td>

                    <td>{endpoint.successfulRequests}</td>

                    <td>{endpoint.failedRequests}</td>

                    <td>{endpoint.averageLatency.toFixed(2)} ms</td>

                    <td>{endpoint.p95Latency.toFixed(2)} ms</td>

                    <td>{endpoint.p99Latency.toFixed(2)} ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Service Performance */}

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>Service Performance</h2>

            <p>Aggregated metrics for the registered service.</p>
          </div>
        </div>

        {serviceMetrics ? (
          <div className="service-summary">
            <div>
              <span>Service</span>

              <strong>{serviceMetrics.service}</strong>
            </div>

            <div>
              <span>Endpoints</span>

              <strong>{serviceMetrics.endpoints?.length || 0}</strong>
            </div>

            <div>
              <span>Total Requests</span>

              <strong>
                {serviceMetrics.endpoints?.reduce(
                  (total, endpoint) => total + endpoint.totalRequests,
                  0,
                ) || 0}
              </strong>
            </div>
          </div>
        ) : (
          <div className="empty-state">No service metrics available.</div>
        )}
      </section>

      {/* Latency Distribution */}

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>Latency Distribution</h2>

            <p>Gateway latency percentiles across all requests.</p>
          </div>
        </div>

        <div className="latency-grid">
          <MetricCard
            label="P50"
            value={globalMetrics.p50Latency.toFixed(2)}
            suffix=" ms"
          />

          <MetricCard
            label="P95"
            value={globalMetrics.p95Latency.toFixed(2)}
            suffix=" ms"
          />

          <MetricCard
            label="P99"
            value={globalMetrics.p99Latency.toFixed(2)}
            suffix=" ms"
          />
        </div>
      </section>
    </main>
  );
}

export default function App() {
  return (
    <div className="app-container">
      <Dashboard />

      <footer className="app-footer">
        <span>API Sentinel v1.0.0</span>

        <span>Environment: Monitoring</span>
      </footer>
    </div>
  );
}
