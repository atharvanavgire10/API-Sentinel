const incidents = new Map();

function createIncident({
  service,
  type,
  status,
  message,
  statusCode = null,
  latency = null
}) {
  const key = `${service}:${type}`;

  const existingIncident = Array.from(
    incidents.values()
  ).find(
    (incident) =>
      incident.service === service &&
      incident.type === type &&
      incident.status === 'open'
  );

  // Deduplicate only an already-open incident.
  if (existingIncident) {
    existingIncident.occurrenceCount += 1;

    return existingIncident;
  }

  const incident = {
    id: `INC-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    service,
    type,
    status: 'open',
    severity:
      status === 'unhealthy'
        ? 'critical'
        : 'warning',
    message,
    statusCode,
    latency,
    startedAt: new Date().toISOString(),
    resolvedAt: null,
    occurrenceCount: 1
  };

  incidents.set(incident.id, {
    ...incident,
    key
  });

  return incident;
}

function resolveIncident(service, type) {
  const incident = Array.from(
    incidents.values()
  ).find(
    (item) =>
      item.service === service &&
      item.type === type &&
      item.status === 'open'
  );

  if (!incident) {
    return null;
  }

  incident.status = 'resolved';
  incident.resolvedAt =
    new Date().toISOString();

  incidents.set(incident.id, incident);

  return incident;
}

function getIncidents() {
  return Array.from(
    incidents.values()
  )
    .map(({ key, ...incident }) => incident)
    .sort(
      (a, b) =>
        new Date(b.startedAt) -
        new Date(a.startedAt)
    );
}

function getOpenIncidents() {
  return getIncidents().filter(
    (incident) =>
      incident.status === 'open'
  );
}

function getIncident(id) {
  const incident = incidents.get(id);

  if (!incident) {
    return null;
  }

  const {
    key,
    ...result
  } = incident;

  return result;
}

function clearIncidents() {
  incidents.clear();
}

module.exports = {
  createIncident,
  resolveIncident,
  getIncidents,
  getOpenIncidents,
  getIncident,
  clearIncidents
};