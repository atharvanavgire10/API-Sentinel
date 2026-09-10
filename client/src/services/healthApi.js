const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5000';

async function fetchJson(endpoint) {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`
  );

  if (!response.ok) {
    throw new Error(
      `Health API request failed: ${response.status}`
    );
  }

  return response.json();
}

export async function fetchHealthStatus() {
  const data = await fetchJson(
    '/api/health/services'
  );

  return data.services || [];
}