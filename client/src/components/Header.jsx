import React from 'react';

export default function Header() {
  return (
    <header className="app-header">
      <div className="brand-wrapper">
        <div className="brand-icon" aria-hidden="true">
          S
        </div>
        <h1 className="brand-title">API Sentinel</h1>
        <span className="phase-badge">Phase 1 Foundation</span>
      </div>
      <p className="brand-description">
        API reliability gateway and monitoring platform.
      </p>
    </header>
  );
}

