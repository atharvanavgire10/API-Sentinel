import React from 'react';
import Header from './components/Header';
import HealthStatus from './components/HealthStatus';
import MetricShell from './components/MetricShell';
import './App.css';

export default function App() {
  return (
    <div className="app-container">
      <Header />
      <main style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <HealthStatus />
        <MetricShell />
      </main>
      <footer className="app-footer">
        <span>API Sentinel v1.0.0-phase1</span>
        <span>Environment: Foundation Architecture</span>
      </footer>
    </div>
  );
}

