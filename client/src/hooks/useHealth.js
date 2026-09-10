import {
  useCallback,
  useEffect,
  useState
} from 'react';

import {
  fetchHealthStatus
} from '../services/healthApi';

export default function useHealth() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadHealth = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        const data = await fetchHealthStatus();

        setServices(data);
      } catch (err) {
        setError(
          err.message ||
            'Failed to load service health.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadHealth();

    const interval = setInterval(() => {
      loadHealth(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [loadHealth]);

  return {
    services,
    loading,
    refreshing,
    error,
    refresh: () => loadHealth(true)
  };
}