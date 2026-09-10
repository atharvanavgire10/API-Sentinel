import { useCallback, useEffect, useState } from 'react';

import {
  fetchGlobalMetrics,
  fetchEndpointMetrics,
  fetchServiceMetrics
} from '../services/metricsApi';

const DEFAULT_METRICS = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  clientErrorRequests: 0,
  serverErrorRequests: 0,
  averageLatency: 0,
  p50Latency: 0,
  p95Latency: 0,
  p99Latency: 0
};

export default function useMetrics(service = 'demo') {
  const [globalMetrics, setGlobalMetrics] =
    useState(DEFAULT_METRICS);

  const [endpointMetrics, setEndpointMetrics] =
    useState([]);

  const [serviceMetrics, setServiceMetrics] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadMetrics = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        const [
          global,
          endpoints,
          serviceData
        ] = await Promise.all([
          fetchGlobalMetrics(),
          fetchEndpointMetrics(),
          fetchServiceMetrics(service)
        ]);

        setGlobalMetrics(global);
        setEndpointMetrics(endpoints);
        setServiceMetrics(serviceData);
      } catch (err) {
        setError(
          err.message || 'Failed to load metrics.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [service]
  );

  useEffect(() => {
    loadMetrics();

    const interval = setInterval(() => {
      loadMetrics(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [loadMetrics]);

  return {
    globalMetrics,
    endpointMetrics,
    serviceMetrics,
    loading,
    refreshing,
    error,
    refresh: () => loadMetrics(true)
  };
}