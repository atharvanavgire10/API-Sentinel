const express = require('express');

const {
  getAllIncidents,
  getOpenIncidentsController,
  getSingleIncident
} = require('../controllers/incidentController');

const router = express.Router();

router.get('/', getAllIncidents);

router.get(
  '/open',
  getOpenIncidentsController
);

router.get(
  '/:id',
  getSingleIncident
);

module.exports = router;