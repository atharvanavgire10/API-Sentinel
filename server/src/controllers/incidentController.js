const {
  getIncidents,
  getOpenIncidents,
  getIncident
} = require('../services/incidentService');

function getAllIncidents(req, res) {
  return res.status(200).json({
    incidents: getIncidents()
  });
}

function getOpenIncidentsController(req, res) {
  return res.status(200).json({
    incidents: getOpenIncidents()
  });
}

function getSingleIncident(req, res) {
  const incident = getIncident(req.params.id);

  if (!incident) {
    return res.status(404).json({
      error: 'Incident not found'
    });
  }

  return res.status(200).json(incident);
}

module.exports = {
  getAllIncidents,
  getOpenIncidentsController,
  getSingleIncident
};