import { useCallback, useEffect, useState } from 'react';

import {
  fetchIncidents,
  fetchOpenIncidents
} from '../services/incidentApi';

export function useIncidents() {
  const [incidents, setIncidents] = useState([]);
  const [openIncidents, setOpenIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadIncidents = useCallback(
    async (isInitialLoad = false) => {
      try {
        if (isInitialLoad) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError(null);

        const [
          allIncidents,
          activeIncidents
        ] = await Promise.all([
          fetchIncidents(),
          fetchOpenIncidents()
        ]);

        setIncidents(allIncidents);
        setOpenIncidents(activeIncidents);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadIncidents(true);

    const interval = setInterval(() => {
      loadIncidents(false);
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [loadIncidents]);

  return {
    incidents,
    openIncidents,
    loading,
    refreshing,
    error,
    refresh: () => loadIncidents(false)
  };
}