const app = require('./app');
const config = require('./config');

const server = app.listen(config.port, () => {
  console.log(`[API Sentinel Server] running in ${config.nodeEnv} mode on port ${config.port}`);
});

/**
 * Graceful shutdown handler
 * Closes the HTTP server cleanly on termination signals (SIGINT, SIGTERM).
 */
const gracefulShutdown = (signal) => {
  console.log(`\n[API Sentinel Server] Received ${signal}. Starting graceful shutdown...`);

  server.close((err) => {
    if (err) {
      console.error('[API Sentinel Server] Error while closing HTTP server:', err);
      process.exit(1);
    }
    console.log('[API Sentinel Server] HTTP server closed gracefully.');
    process.exit(0);
  });

  // Force close if graceful shutdown hangs
  setTimeout(() => {
    console.error('[API Sentinel Server] Could not close connections in time, forcefully terminating.');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = server;

