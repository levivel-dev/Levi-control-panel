const config = require('../utils/config');
const { connectRedis, getRedisClient } = require('../utils/redis');
const logger = require('./logger.service');

// Single Redis list used as a lightweight queue.
const QUEUE_NAME = config.queue.name;

const getQueueClient = async () => {
  await connectRedis();
  const client = getRedisClient();

  if (!client) {
    throw new Error('REDIS_URL is not configured.');
  }

  return client;
};

const enqueueJob = async (job) => {
  let client;

  try {
    client = await getQueueClient();
  } catch (err) {
    logger.warn('Queue is unavailable. Job was not enqueued.', { error: err.message, jobType: job.type });
    return null;
  }

  await client.lPush(QUEUE_NAME, JSON.stringify(job));
  return job;
};

const dequeueJob = async () => {
  const client = await getQueueClient();
  const result = await client.brPop(QUEUE_NAME, 0);

  if (!result || !result.element) {
    return null;
  }

  return JSON.parse(result.element);
};

module.exports = {
  enqueueJob,
  dequeueJob,
  QUEUE_NAME
};
