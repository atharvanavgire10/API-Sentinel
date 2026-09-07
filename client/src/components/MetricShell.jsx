import React from 'react';

const SHELL_METRICS = [
  {
    id: 'latency',
    title: 'P95 Latency',
    phase: 'Phase 2',
    placeholder: '-- ms',
    caption: 'Dynamic gateway transit & upstream response distribution'
  },
  {
    id: 'error-rate',
    title: 'Error Rate',
    phase: 'Phase 2',
    placeholder: '-- %',
    caption: 'HTTP 5xx failure ratio and incident trigger threshold'
  },
  {
    id: 'services',
    title: 'Upstream Services',
    phase: 'Phase 2',
    placeholder: '1 Configured',
    caption: 'Registered targets: demo-backend (ready for reverse proxy)'
  },
  {
    id: 'rate-limiting',
    title: 'Rate Limit Capacity',
    phase: 'Phase 2',
    placeholder: '-- req/s',
    caption: 'Redis-backed token bucket & burst management status'
  }
];

export default function MetricShell() {
  return (
    <section className="dashboard-shell" aria-label="Observability Dashboard Foundation">
      <div className="shell-header">
        <h2 className="shell-title">Observability Shell</h2>
        <span className="shell-note">Metrics instrumentation enabled in Phase 2</span>
      </div>

      <div className="metrics-grid">
        {SHELL_METRICS.map((metric) => (
          <article key={metric.id} className="metric-card">
            <div className="metric-card-header">
              <span className="metric-card-title">{metric.title}</span>
              <span className="metric-card-tag">{metric.phase}</span>
            </div>
            <div className="metric-placeholder-value">{metric.placeholder}</div>
            <p className="metric-placeholder-caption">{metric.caption}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

