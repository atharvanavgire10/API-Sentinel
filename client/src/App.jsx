import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import './App.css';
import useMetrics from './hooks/useMetrics';

function MetricCard({ label, value, suffix = '' }) {
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
    refresh
  } = useMetrics();

  const successRate =
    globalMetrics.totalRequests > 0
      ? (
          (globalMetrics.successfulRequests /
            globalMetrics.totalRequests) *
          100
        ).toFixed(1)
      : '0.0';

  const errorRate =
    globalMetrics.totalRequests > 0
      ? (
          (globalMetrics.failedRequests /
            globalMetrics.totalRequests) *
          100
        ).toFixed(1)
      : '0.0';

  const chartData = endpointMetrics.map((endpoint) => ({
    name: endpoint.path,
    requests: endpoint.totalRequests
  }));

  if (loading) {
    return (
      <div className="dashboard-state">
        Loading metrics...
      </div>
    );
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
          <p className="eyebrow">
            API RELIABILITY MONITOR
          </p>

          <h1>API Sentinel</h1>

          <p className="dashboard-subtitle">
            Real-time gateway performance and
            reliability metrics.
          </p>
        </div>

        <div className="header-actions">
          <span className="refresh-status">
            {refreshing
              ? 'Updating...'
              : 'Auto-refresh: 10s'}
          </span>

          <button
            className="refresh-button"
            onClick={refresh}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </section>

      <section className="metric-grid">
        <MetricCard
          label="Total Requests"
          value={globalMetrics.totalRequests}
        />

        <MetricCard
          label="Success Rate"
          value={successRate}
          suffix="%"
        />

        <MetricCard
          label="Error Rate"
          value={errorRate}
          suffix="%"
        />

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
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>Request Volume</h2>
            <p>
              Requests recorded by endpoint.
            </p>
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="empty-state">
            No request volume recorded yet.
          </div>
        ) : (
          <div className="chart-container">
            <ResponsiveContainer
              width="100%"
              height={300}
            >
              <BarChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 20,
                  left: 0,
                  bottom: 10
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                />

                <Tooltip />

                <Bar
                  dataKey="requests"
                  name="Requests"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>Endpoint Performance</h2>
            <p>
              Latency and reliability by endpoint.
            </p>
          </div>
        </div>

        {endpointMetrics.length === 0 ? (
          <div className="empty-state">
            No endpoint traffic recorded yet.
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="endpoint-table">
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
                      <span className="method-badge">
                        {endpoint.method}
                      </span>
                    </td>

                    <td className="endpoint-path">
                      {endpoint.path}
                    </td>

                    <td>{endpoint.totalRequests}</td>
                    <td>{endpoint.successfulRequests}</td>
                    <td>{endpoint.failedRequests}</td>

                    <td>
                      {endpoint.averageLatency.toFixed(2)} ms
                    </td>

                    <td>
                      {endpoint.p95Latency.toFixed(2)} ms
                    </td>

                    <td>
                      {endpoint.p99Latency.toFixed(2)} ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>Service Performance</h2>
            <p>
              Aggregated metrics for the registered service.
            </p>
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
              <strong>
                {serviceMetrics.endpoints?.length || 0}
              </strong>
            </div>

            <div>
              <span>Total Requests</span>
              <strong>
                {serviceMetrics.endpoints?.reduce(
                  (total, endpoint) =>
                    total + endpoint.totalRequests,
                  0
                ) || 0}
              </strong>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            No service metrics available.
          </div>
        )}
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>Latency Distribution</h2>
            <p>
              Gateway latency percentiles across all requests.
            </p>
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