require('dotenv').config();
const app = require('./app');

const PORT = parseInt(process.env.PORT, 10) || 5001;
const NODE_ENV = process.env.NODE_ENV || 'development';

const server = app.listen(PORT, () => {
  console.log(`[Demo Backend Service] running in ${NODE_ENV} mode on port ${PORT}`);
});

/**
 * Graceful shutdown handler
 */
const gracefulShutdown = (signal) => {
  console.log(`\n[Demo Backend Service] Received ${signal}. Starting graceful shutdown...`);

  server.close((err) => {
    if (err) {
      console.error('[Demo Backend Service] Error while closing HTTP server:', err);
      process.exit(1);
    }
    console.log('[Demo Backend Service] HTTP server closed gracefully.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('[Demo Backend Service] Could not close connections in time, forcefully terminating.');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = server;

