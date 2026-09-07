const express = require('express');
const healthRoutes = require('./healthRoutes');

const router = express.Router();

// Mount health routes
router.use('/health', healthRoutes);

module.exports = router;

