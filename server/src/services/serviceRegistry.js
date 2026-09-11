const config = require('../config');

class ServiceRegistry {
  constructor() {
    this.services = new Map();

    // Initialize registered services from config
    if (config.services) {
      for (const [key, svc] of Object.entries(config.services)) {
        this.register(key, svc);
      }
    }
  }

  /**
   * Register or update a service
   * @param {string} name - Normalized service identifier
   * @param {Object} serviceConfig - Service configuration { baseUrl, timeoutMs }
   */
  register(name, serviceConfig) {
    if (!name || typeof name !== 'string') {
      throw new Error('Service name must be a non-empty string');
    }

    if (!serviceConfig || !serviceConfig.baseUrl) {
      throw new Error(
        'Service configuration must contain a valid baseUrl'
      );
    }

    let parsedBaseUrl;

    try {
      parsedBaseUrl = new URL(serviceConfig.baseUrl);
    } catch {
      throw new Error(
        'Service baseUrl must be a valid URL'
      );
    }

    if (!['http:', 'https:'].includes(parsedBaseUrl.protocol)) {
      throw new Error(
        'Service baseUrl must use HTTP or HTTPS'
      );
    }

    const normalizedName = name.toLowerCase().trim();

    this.services.set(normalizedName, {
      name: normalizedName,
      baseUrl: serviceConfig.baseUrl.replace(/\/+$/, ''),
      timeoutMs:
        serviceConfig.timeoutMs ||
        config.proxyTimeoutMs ||
        5000
    });
  }

  /**
   * Retrieve service configuration by name
   * @param {string} name
   * @returns {Object|null}
   */
  get(name) {
    if (!name || typeof name !== 'string') {
      return null;
    }

    return (
      this.services.get(name.toLowerCase().trim()) ||
      null
    );
  }

  /**
   * Check if a service is registered
   * @param {string} name
   * @returns {boolean}
   */
  has(name) {
    if (!name || typeof name !== 'string') {
      return false;
    }

    return this.services.has(
      name.toLowerCase().trim()
    );
  }

  /**
   * List all registered services
   * @returns {Array<Object>}
   */
  list() {
    return Array.from(this.services.values());
  }
}

// Singleton instance
const serviceRegistry = new ServiceRegistry();

module.exports = serviceRegistry;