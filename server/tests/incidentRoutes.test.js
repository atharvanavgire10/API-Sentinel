const request = require('supertest');

const app = require('../src/app');

const {
  createIncident,
  clearIncidents
} = require('../src/services/incidentService');

describe('Incident API', () => {
  beforeEach(() => {
    clearIncidents();
  });

  it('GET /api/incidents returns all incidents', async () => {
    createIncident({
      service: 'demo',
      type: 'health',
      status: 'unhealthy',
      message: 'Demo service is unavailable'
    });

    const response = await request(app)
      .get('/api/incidents')
      .expect(200);

    expect(Array.isArray(response.body.incidents))
      .toBe(true);

    expect(response.body.incidents).toHaveLength(1);

    expect(response.body.incidents[0].service)
      .toBe('demo');
  });

  it('GET /api/incidents/open returns only open incidents', async () => {
    const incident = createIncident({
      service: 'demo',
      type: 'health',
      status: 'unhealthy',
      message: 'Demo service is unavailable'
    });

    expect(incident.status).toBe('open');

    const response = await request(app)
      .get('/api/incidents/open')
      .expect(200);

    expect(response.body.incidents)
      .toHaveLength(1);

    expect(response.body.incidents[0].status)
      .toBe('open');
  });

  it('GET /api/incidents/:id returns a single incident', async () => {
    const incident = createIncident({
      service: 'demo',
      type: 'health',
      status: 'unhealthy',
      message: 'Demo service is unavailable'
    });

    const response = await request(app)
      .get(`/api/incidents/${incident.id}`)
      .expect(200);

    expect(response.body.id)
      .toBe(incident.id);

    expect(response.body.service)
      .toBe('demo');

    expect(response.body.type)
      .toBe('health');
  });

  it('GET /api/incidents/:id returns 404 for unknown incident', async () => {
    const response = await request(app)
      .get('/api/incidents/INC-does-not-exist')
      .expect(404);

    expect(response.body.error)
      .toBe('Incident not found');
  });

  it('GET /api/incidents/open returns empty array when no incidents exist', async () => {
    const response = await request(app)
      .get('/api/incidents/open')
      .expect(200);

    expect(response.body.incidents)
      .toEqual([]);
  });
});