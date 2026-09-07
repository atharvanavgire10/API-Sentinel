import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import App from '../src/App';

describe('API Sentinel Dashboard Client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders API Sentinel branding and description', async () => {
    // Mock successful health response
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'ok', service: 'api-sentinel' })
    });

    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: /API Sentinel/i })).toBeInTheDocument();
    expect(
      screen.getByText(/API reliability gateway and monitoring platform\./i)
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Observability Shell/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('health-badge')).toHaveTextContent(/● Connected/i);
    });
  });

  it('displays "● Connected" when the health endpoint returns ok', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'ok', service: 'api-sentinel' })
    });

    render(<App />);

    await waitFor(() => {
      const badge = screen.getByTestId('health-badge');
      expect(badge).toHaveTextContent(/Backend:/i);
      expect(badge).toHaveTextContent(/● Connected/i);
    });
  });

  it('displays "● Unavailable" when the backend health check fails', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Connection refused'));

    render(<App />);

    await waitFor(() => {
      const badge = screen.getByTestId('health-badge');
      expect(badge).toHaveTextContent(/Backend:/i);
      expect(badge).toHaveTextContent(/● Unavailable/i);
    });
  });
});

