import React, { useState, useEffect, useCallback } from 'react';

export default function HealthStatus() {
  const [status, setStatus] = useState('checking'); // 'checking' | 'connected' | 'unavailable'
  const [lastChecked, setLastChecked] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const checkHealth = useCallback(async () => {
    setStatus('checking');
    try {
      const response = await fetch(`${apiUrl}/health`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      if (data && data.status === 'ok' && data.service === 'api-sentinel') {
        setStatus('connected');
      } else {
        setStatus('unavailable');
      }
    } catch {
      setStatus('unavailable');
    } finally {
      setLastChecked(new Date().toLocaleTimeString());
    }
  }, [apiUrl]);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  return (
    <section className="health-card" aria-label="Backend Health Status">
      <div className="health-info">
        <span className="health-title">Service Gateway Connection</span>
        <span className="health-target">Target: {apiUrl}/health</span>
        {lastChecked && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Last checked: {lastChecked}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div
          className={`health-status-badge ${status}`}
          data-testid="health-badge"
          role="status"
          aria-live="polite"
        >
          <span style={{ color: 'var(--text-secondary)', marginRight: '0.25rem' }}>
            Backend:
          </span>
          <span className="status-dot" aria-hidden="true"></span>
          <span>
            {status === 'connected' && '● Connected'}
            {status === 'unavailable' && '● Unavailable'}
            {status === 'checking' && '● Checking...'}
          </span>
        </div>

        <button
          type="button"
          onClick={checkHealth}
          className="refresh-btn"
          disabled={status === 'checking'}
          aria-label="Refresh backend health check"
        >
          Recheck
        </button>
      </div>
    </section>
  );
}

