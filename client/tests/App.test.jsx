import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

import App from '../src/App';

import {
  fetchGlobalMetrics,
  fetchEndpointMetrics,
  fetchServiceMetrics
} from '../src/services/metricsApi';

vi.mock('../src/services/metricsApi', () => ({
  fetchGlobalMetrics: vi.fn(),
  fetchEndpointMetrics: vi.fn(),
  fetchServiceMetrics: vi.fn()
}));

const mockGlobalMetrics = {
  totalRequests: 5,
  successfulRequests: 4,
  failedRequests: 1,
  clientErrorRequests: 0,
  serverErrorRequests: 1,
  averageLatency: 14.16,
  p50Latency: 5.31,
  p95Latency: 50.55,
  p99Latency: 50.55
};

const mockEndpointMetrics = [
  {
    service: 'demo',
    method: 'GET',
    path: '/api/products',
    totalRequests: 2,
    successfulRequests: 2,
    failedRequests: 0,
    clientErrorRequests: 0,
    serverErrorRequests: 0,
    averageLatency: 28.05,
    p50Latency: 5.55,
    p95Latency: 50.55,
    p99Latency: 50.55
  },
  {
    service: 'demo',
    method: 'GET',
    path: '/api/error',
    totalRequests: 1,
    successfulRequests: 0,
    failedRequests: 1,
    clientErrorRequests: 0,
    serverErrorRequests: 1,
    averageLatency: 4.28,
    p50Latency: 4.28,
    p95Latency: 4.28,
    p99Latency: 4.28
  }
];

const mockServiceMetrics = {
  service: 'demo',
  endpoints: mockEndpointMetrics
};

describe('API Sentinel Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    fetchGlobalMetrics.mockResolvedValue(
      mockGlobalMetrics
    );

    fetchEndpointMetrics.mockResolvedValue(
      mockEndpointMetrics
    );

    fetchServiceMetrics.mockResolvedValue(
      mockServiceMetrics
    );
  });

  it('renders the dashboard with API metrics', async () => {
    render(<App />);

    expect(
      screen.getByText('Loading metrics...')
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: 'API Sentinel'
        })
      ).toBeInTheDocument();
    });

    expect(
  screen.getAllByText('Total Requests').length
).toBeGreaterThanOrEqual(1);

    expect(
      screen.getByText('Success Rate')
    ).toBeInTheDocument();

    expect(
      screen.getByText('80.0%')
    ).toBeInTheDocument();

    expect(
      screen.getByText('14.16 ms')
    ).toBeInTheDocument();
  });

  it('renders endpoint performance data', async () => {
    render(<App />);

    await waitFor(() => {
      expect(
        screen.getByText('/api/products')
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText('/api/error')
    ).toBeInTheDocument();

    expect(
      screen.getByText('Endpoint Performance')
    ).toBeInTheDocument();

    expect(
      screen.getByText('Service Performance')
    ).toBeInTheDocument();
  });

  it('displays an error state when metrics loading fails', async () => {
    fetchGlobalMetrics.mockRejectedValue(
      new Error('Metrics API unavailable')
    );

    render(<App />);

    await waitFor(() => {
      expect(
        screen.getByText('Metrics API unavailable')
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole('button', {
        name: 'Retry'
      })
    ).toBeInTheDocument();
  });
});