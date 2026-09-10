const { createClient } = require('redis');
const config = require('../config');

let client = null;
let isConnected = false;

async function connectRedis() {
  if (client && isConnected) {
    return client;
  }

  if (!client) {
    client = createClient({
      url: config.redisUrl
    });

    client.on('error', (err) => {
      console.error(
        '[Redis] Client error:',
        err.message
      );

      isConnected = false;
    });

    client.on('connect', () => {
      console.log('[Redis] Connecting...');
    });

    client.on('ready', () => {
      console.log('[Redis] Ready');
      isConnected = true;
    });

    client.on('end', () => {
      console.log('[Redis] Connection closed');
      isConnected = false;
    });
  }

  if (!client.isOpen) {
    await client.connect();
  }

  isConnected = true;

  return client;
}

function getRedisClient() {
  return client;
}

function isRedisConnected() {
  return Boolean(
    client &&
    client.isOpen &&
    isConnected
  );
}

async function disconnectRedis() {
  if (client && client.isOpen) {
    await client.quit();
  }

  isConnected = false;
  client = null;
}

module.exports = {
  connectRedis,
  getRedisClient,
  isRedisConnected,
  disconnectRedis
};