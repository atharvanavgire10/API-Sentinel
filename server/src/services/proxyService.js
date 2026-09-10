const { randomUUID } = require('crypto');
const serviceRegistry = require('./serviceRegistry');
const { recordRequest } = require('./metricsService');

// Hop-by-hop headers that should not be forwarded
const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'host',
  'content-length'
]);

/**
 * Filter headers for upstream forwarding
 */
const buildForwardHeaders = (incomingHeaders, requestId) => {
  const forwardHeaders = {};

  for (const [key, value] of Object.entries(incomingHeaders)) {
    const lowerKey = key.toLowerCase();

    if (!HOP_BY_HOP_HEADERS.has(lowerKey)) {
      forwardHeaders[lowerKey] = value;
    }
  }

  // Ensure tracing header is propagated
  forwardHeaders['x-request-id'] = requestId;

  return forwardHeaders;
};

/**
 * Core Proxy Service
 * Forwards requests to registered upstream services and maps failures.
 */
class ProxyService {
  async forward(req, res) {
    const serviceName = req.params.service;
    const service = serviceRegistry.get(serviceName);

    // 1. Validate service existence (SSRF Protection)
    if (!service) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Service '${serviceName}' is not registered`
      });
    }

    // 2. Resolve or generate Request ID
    const requestId = req.headers['x-request-id'] || randomUUID();

    res.setHeader('X-Request-ID', requestId);

    // 3. Extract target path and query parameters
    const prefix = `/api/proxy/${serviceName}`;

    const targetPath =
      req.originalUrl.substring(
        req.originalUrl.indexOf(prefix) + prefix.length
      ) || '/';

    const normalizedPath =
      targetPath.split('?')[0] || '/';

    const targetUrl =
      `${service.baseUrl}${targetPath.startsWith('/') ? '' : '/'}${targetPath}`;

    // 4. Construct request options
    const timeoutMs = service.timeoutMs || 5000;

    const controller = new AbortController();

    const timeoutHandle = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    const forwardHeaders = buildForwardHeaders(
      req.headers,
      requestId
    );

    const fetchOptions = {
      method: req.method,
      headers: forwardHeaders,
      signal: controller.signal
    };

    // 5. Attach body for applicable HTTP methods
    const hasBody =
      !['GET', 'HEAD'].includes(req.method.toUpperCase());

    if (hasBody && req.body !== undefined) {
      if (
        typeof req.body === 'object' &&
        Object.keys(req.body).length > 0
      ) {
        fetchOptions.body = JSON.stringify(req.body);

        if (!forwardHeaders['content-type']) {
          forwardHeaders['content-type'] = 'application/json';
        }
      } else if (
        typeof req.body === 'string' &&
        req.body.length > 0
      ) {
        fetchOptions.body = req.body;
      }
    }

    // Start high-resolution latency timer
    const startTime = process.hrtime.bigint();

    try {
      // 6. Execute upstream fetch
      const upstreamResponse = await fetch(
        targetUrl,
        fetchOptions
      );

      clearTimeout(timeoutHandle);

      // Calculate latency
      const latencyMs =
        Number(process.hrtime.bigint() - startTime) /
        1_000_000;

      // 7. Record request metrics
      recordRequest({
        service: serviceName,
        method: req.method,
        path: normalizedPath,
        statusCode: upstreamResponse.status,
        latencyMs
      });

      // 8. Forward safe upstream response headers
      upstreamResponse.headers.forEach(
        (value, name) => {
          const lowerName = name.toLowerCase();

          if (!HOP_BY_HOP_HEADERS.has(lowerName)) {
            res.setHeader(name, value);
          }
        }
      );

      // Always maintain X-Request-ID
      res.setHeader(
        'X-Request-ID',
        requestId
      );

      // 9. Forward status and body
      const buffer = Buffer.from(
        await upstreamResponse.arrayBuffer()
      );

      return res
        .status(upstreamResponse.status)
        .send(buffer);

    } catch (err) {
      clearTimeout(timeoutHandle);

      // Calculate latency even when gateway fails
      const latencyMs =
        Number(process.hrtime.bigint() - startTime) /
        1_000_000;

      // 10. Handle Timeout (HTTP 504)
      if (
        err.name === 'AbortError' ||
        controller.signal.aborted
      ) {
        recordRequest({
          service: serviceName,
          method: req.method,
          path: normalizedPath,
          statusCode: 504,
          latencyMs
        });

        return res.status(504).json({
          error: 'Gateway Timeout',
          message: `Upstream service '${serviceName}' timed out`
        });
      }

      // 11. Handle Upstream Unavailable (HTTP 502)
      recordRequest({
        service: serviceName,
        method: req.method,
        path: normalizedPath,
        statusCode: 502,
        latencyMs
      });

      return res.status(502).json({
        error: 'Bad Gateway',
        message: `Upstream service '${serviceName}' is unavailable`
      });
    }
  }
}

module.exports = new ProxyService();