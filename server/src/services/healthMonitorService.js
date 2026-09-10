const http = require('http');
const https = require('https');

const serviceRegistry = require('./serviceRegistry');

const {
  createIncident,
  resolveIncident
} = require('./incidentService');

const healthStatus = new Map();

function checkService(serviceName, service) {
  return new Promise((resolve) => {
    const startTime = process.hrtime.bigint();

    try {
      const targetUrl = new URL(
  `${service.baseUrl}/health`
);

      const client =
        targetUrl.protocol === 'https:'
          ? https
          : http;

      const request = client.request(
        targetUrl,
        {
          method: 'GET',
          timeout: service.timeoutMs || 5000
        },
        (response) => {
          response.resume();

          response.on('end', () => {
            const latency =
              Number(
                process.hrtime.bigint() -
                  startTime
              ) / 1e6;

            healthStatus.set(serviceName, {
              service: serviceName,
              status:
                response.statusCode >= 200 &&
                response.statusCode < 500
                  ? 'healthy'
                  : 'unhealthy',
              statusCode:
                response.statusCode,
              latency: Number(
                latency.toFixed(2)
              ),
              lastChecked:
                new Date().toISOString()
            });

            const health = healthStatus.get(
  serviceName
);

if (health.status === 'unhealthy') {
  createIncident({
    service: serviceName,
    type: 'health',
    status: 'unhealthy',
    message:
      `Service ${serviceName} returned HTTP ${response.statusCode}`,
    statusCode: response.statusCode,
    latency: health.latency
  });
} else {
  resolveIncident(
    serviceName,
    'health'
  );
}

            resolve(
              healthStatus.get(serviceName)
            );
          });
        }
      );

      request.on('timeout', () => {
        request.destroy(
          new Error('Health check timeout')
        );
      });

      request.on('error', (error) => {
  const latency =
    Number(
      process.hrtime.bigint() -
        startTime
    ) / 1e6;

  healthStatus.set(serviceName, {
    service: serviceName,
    status: 'unhealthy',
    statusCode: null,
    latency: Number(
      latency.toFixed(2)
    ),
    lastChecked:
      new Date().toISOString(),
    error:
      error.code ||
      error.message ||
      'Health check request failed'
  });

  createIncident({
  service: serviceName,
  type: 'health',
  status: 'unhealthy',
  message:
    healthStatus.get(serviceName).error ||
    `Service ${serviceName} is unreachable`,
  statusCode: null,
  latency
});

  resolve(
    healthStatus.get(serviceName)
  );
});

      request.end();
    } catch (error) {
      healthStatus.set(serviceName, {
        service: serviceName,
        status: 'unhealthy',
        statusCode: null,
        latency: 0,
        lastChecked:
          new Date().toISOString(),
        error: error.message
      });

      resolve(
        healthStatus.get(serviceName)
      );
    }
  });
}

async function checkAllServices() {
  const services = serviceRegistry.list();

  const results = await Promise.all(
    services.map((service) =>
      checkService(
        service.name,
        service
      )
    )
  );

  return results;
}

function getHealthStatus() {
  return Array.from(
    healthStatus.values()
  );
}

function getServiceHealth(serviceName) {
  return (
    healthStatus.get(serviceName) ||
    null
  );
}

function clearHealthStatus() {
  healthStatus.clear();
}

let monitoringInterval = null;

function startHealthMonitoring(intervalMs = 30000) {
  if (monitoringInterval) {
    return;
  }

  // Run an initial check immediately.
  checkAllServices().catch((error) => {
    console.error(
      '[HealthMonitor] Initial health check failed:',
      error.message
    );
  });

  monitoringInterval = setInterval(() => {
    checkAllServices().catch((error) => {
      console.error(
        '[HealthMonitor] Scheduled health check failed:',
        error.message
      );
    });
  }, intervalMs);

  console.log(
    `[HealthMonitor] Started with ${intervalMs}ms interval`
  );
}

function stopHealthMonitoring() {
  if (!monitoringInterval) {
    return;
  }

  clearInterval(monitoringInterval);
  monitoringInterval = null;

  console.log('[HealthMonitor] Stopped');
}

module.exports = {
  checkService,
  checkAllServices,
  getHealthStatus,
  getServiceHealth,
  clearHealthStatus,
  startHealthMonitoring,
  stopHealthMonitoring
};