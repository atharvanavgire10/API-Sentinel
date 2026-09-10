const metrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  clientErrorRequests: 0,
  serverErrorRequests: 0,
  latencySamples: [],
};

const endpointMetrics = new Map();

function calculatePercentile(samples, percentile) {
  if (!samples.length) {
    return 0;
  }

  const sorted = [...samples].sort((a, b) => a - b);

  const index = Math.ceil((percentile / 100) * sorted.length) - 1;

  return sorted[Math.max(0, index)];
}

function calculateAverage(samples) {
  if (!samples.length) {
    return 0;
  }

  const total = samples.reduce((sum, value) => sum + value, 0);

  return Math.round((total / samples.length) * 100) / 100;
}

function classifyStatus(statusCode) {
  if (statusCode >= 200 && statusCode < 400) {
    return 'success';
  }

  if (statusCode >= 400 && statusCode < 500) {
    return 'clientError';
  }

  if (statusCode >= 500) {
    return 'serverError';
  }

  return 'other';
}

function recordRequest({
  service,
  method,
  path,
  statusCode,
  latencyMs,
}) {
  const safeLatency = Math.max(0, Number(latencyMs) || 0);
  const status = Number(statusCode);

  metrics.totalRequests += 1;
  metrics.latencySamples.push(safeLatency);

  const classification = classifyStatus(status);

  if (classification === 'success') {
    metrics.successfulRequests += 1;
  } else if (classification === 'clientError') {
    metrics.failedRequests += 1;
    metrics.clientErrorRequests += 1;
  } else if (classification === 'serverError') {
    metrics.failedRequests += 1;
    metrics.serverErrorRequests += 1;
  }

  const endpointKey = `${service}:${method}:${path}`;

  if (!endpointMetrics.has(endpointKey)) {
    endpointMetrics.set(endpointKey, {
      service,
      method,
      path,
      requestCount: 0,
      successCount: 0,
      errorCount: 0,
      clientErrorCount: 0,
      serverErrorCount: 0,
      latencySamples: [],
    });
  }

  const endpoint = endpointMetrics.get(endpointKey);

  endpoint.requestCount += 1;
  endpoint.latencySamples.push(safeLatency);

  if (classification === 'success') {
    endpoint.successCount += 1;
  } else if (classification === 'clientError') {
    endpoint.errorCount += 1;
    endpoint.clientErrorCount += 1;
  } else if (classification === 'serverError') {
    endpoint.errorCount += 1;
    endpoint.serverErrorCount += 1;
  }
}

function formatMetrics(source) {
  return {
    totalRequests: source.requestCount ?? metrics.totalRequests,
    successfulRequests:
      source.successCount ?? metrics.successfulRequests,
    failedRequests:
      source.errorCount ?? metrics.failedRequests,
    clientErrorRequests:
      source.clientErrorCount ?? metrics.clientErrorRequests,
    serverErrorRequests:
      source.serverErrorCount ?? metrics.serverErrorRequests,
    averageLatency: calculateAverage(source.latencySamples ?? metrics.latencySamples),
    p50Latency: calculatePercentile(
      source.latencySamples ?? metrics.latencySamples,
      50
    ),
    p95Latency: calculatePercentile(
      source.latencySamples ?? metrics.latencySamples,
      95
    ),
    p99Latency: calculatePercentile(
      source.latencySamples ?? metrics.latencySamples,
      99
    ),
  };
}

function getGlobalMetrics() {
  return formatMetrics(metrics);
}

function getEndpointMetrics() {
  return Array.from(endpointMetrics.values()).map((endpoint) => ({
    service: endpoint.service,
    method: endpoint.method,
    path: endpoint.path,
    ...formatMetrics(endpoint),
  }));
}

function getServiceMetrics(serviceName) {
  return Array.from(endpointMetrics.values())
    .filter((endpoint) => endpoint.service === serviceName)
    .map((endpoint) => ({
      service: endpoint.service,
      method: endpoint.method,
      path: endpoint.path,
      ...formatMetrics(endpoint),
    }));
}

function resetMetrics() {
  metrics.totalRequests = 0;
  metrics.successfulRequests = 0;
  metrics.failedRequests = 0;
  metrics.clientErrorRequests = 0;
  metrics.serverErrorRequests = 0;
  metrics.latencySamples.length = 0;
  endpointMetrics.clear();
}

module.exports = {
  recordRequest,
  getGlobalMetrics,
  getEndpointMetrics,
  getServiceMetrics,
  resetMetrics,
  calculatePercentile,
};