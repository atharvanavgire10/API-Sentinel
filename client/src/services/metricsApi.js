const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5000';

async function fetchJson(endpoint) {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`
  );

  if (!response.ok) {
    throw new Error(
      `Metrics API request failed: ${response.status}`
    );
  }

  return response.json();
}

export async function fetchGlobalMetrics() {
  return fetchJson('/api/metrics');
}

export async function fetchEndpointMetrics() {
  const data = await fetchJson(
    '/api/metrics/endpoints'
  );

  return data.endpoints || [];
}

export async function fetchServiceMetrics(service) {
  return fetchJson(
    `/api/metrics/services/${encodeURIComponent(service)}`
  );
}