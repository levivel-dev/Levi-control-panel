const { createClient } = require('redis');
const config = require('./config');

let client = null;

const connectRedis = async () => {
  if (!config.redis.url) {
    return null;
  }

  if (client) {
    return client;
  }

  client = createClient({ url: config.redis.url });

  client.on('error', (err) => {
    console.error('[redis] Client error', err);
  });

  await client.connect();
  console.log('[redis] Connected');
  return client;
};

const getRedisClient = () => client;

module.exports = {
  connectRedis,
  getRedisClient
};
