const {
  createIncident,
  resolveIncident,
  getIncidents,
  getOpenIncidents,
  getIncident,
  clearIncidents
} = require('../src/services/incidentService');

describe('Incident Service', () => {
  beforeEach(() => {
    clearIncidents();
  });

  it('creates a new incident', () => {
    const incident = createIncident({
      service: 'demo',
      type: 'health',
      status: 'unhealthy',
      message: 'Demo service is unhealthy',
      statusCode: null
    });

    expect(incident.service).toBe('demo');
    expect(incident.type).toBe('health');
    expect(incident.status).toBe('open');
    expect(incident.severity).toBe('critical');
    expect(incident.startedAt).toBeDefined();
    expect(incident.resolvedAt).toBeNull();
    expect(incident.occurrenceCount).toBe(1);
  });

  it('deduplicates repeated open incidents', () => {
    const first = createIncident({
      service: 'demo',
      type: 'health',
      status: 'unhealthy',
      message: 'Demo service is unhealthy'
    });

    const second = createIncident({
      service: 'demo',
      type: 'health',
      status: 'unhealthy',
      message: 'Demo service is still unhealthy'
    });

    expect(second.id).toBe(first.id);
    expect(getIncidents()).toHaveLength(1);
    expect(getOpenIncidents()).toHaveLength(1);
  });

  it('allows a new incident after the previous one is resolved', () => {
    const first = createIncident({
      service: 'demo',
      type: 'health',
      status: 'unhealthy',
      message: 'Demo service is unhealthy'
    });

    const resolved = resolveIncident(
      'demo',
      'health'
    );

    expect(resolved.id).toBe(first.id);
    expect(resolved.status).toBe('resolved');
    expect(resolved.resolvedAt).toBeDefined();

    const second = createIncident({
      service: 'demo',
      type: 'health',
      status: 'unhealthy',
      message: 'Demo service became unhealthy again'
    });

    expect(second.id).not.toBe(first.id);
    expect(getIncidents()).toHaveLength(2);
    expect(getOpenIncidents()).toHaveLength(1);
  });

  it('returns an incident by id', () => {
    const incident = createIncident({
      service: 'demo',
      type: 'health',
      status: 'unhealthy',
      message: 'Demo service is unhealthy'
    });

    const result = getIncident(incident.id);

    expect(result).not.toBeNull();
    expect(result.id).toBe(incident.id);
  });

  it('returns null when resolving a non-existent incident', () => {
    const result = resolveIncident(
      'unknown-service',
      'health'
    );

    expect(result).toBeNull();
  });

  it('clears all incidents', () => {
    createIncident({
      service: 'demo',
      type: 'health',
      status: 'unhealthy',
      message: 'Demo service is unhealthy'
    });

    expect(getIncidents()).toHaveLength(1);

    clearIncidents();

    expect(getIncidents()).toHaveLength(0);
    expect(getOpenIncidents()).toHaveLength(0);
  });
});