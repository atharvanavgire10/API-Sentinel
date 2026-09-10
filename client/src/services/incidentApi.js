const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5000';

async function fetchJson(endpoint) {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`
  );

  if (!response.ok) {
    throw new Error(
      `Incident API request failed: ${response.status}`
    );
  }

  return response.json();
}

export async function fetchIncidents() {
  const data = await fetchJson('/api/incidents');

  return data.incidents || [];
}

export async function fetchOpenIncidents() {
  const data = await fetchJson(
    '/api/incidents/open'
  );

  return data.incidents || [];
}

export async function fetchIncident(id) {
  return fetchJson(
    `/api/incidents/${encodeURIComponent(id)}`
  );
}