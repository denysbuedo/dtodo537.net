import { Queue, QueueEvents, Worker } from 'bullmq';
import {
  createLogger,
  createRedisClient,
  loadConfig,
  validateRedisConnection,
} from '@dtodo/config';

const config = loadConfig('worker');
const logger = createLogger({ service: 'worker' });
const queueConnection = createRedisClient({
  url: config.REDIS_URL ?? '',
  service: 'worker-queue',
  logger,
});
const workerConnection = createRedisClient({
  url: config.REDIS_URL ?? '',
  service: 'worker-processor',
  maxRetriesPerRequest: null,
  logger,
});

const queueName = 'm0-technical-check';
const queuePrefix = 'dtodo';
const queue = new Queue(queueName, { connection: queueConnection, prefix: queuePrefix });
const queueEvents = new QueueEvents(queueName, {
  connection: createRedisClient({
    url: config.REDIS_URL ?? '',
    service: 'worker-events',
    maxRetriesPerRequest: null,
    logger,
  }),
  prefix: queuePrefix,
});
const worker = new Worker(
  queueName,
  async (job) => {
    await Promise.resolve();

    logger.info({
      jobId: job.id,
      jobName: job.name,
      message: 'Processing technical test job',
    });

    return {
      processedAt: new Date().toISOString(),
    };
  },
  { connection: workerConnection, prefix: queuePrefix },
);

async function start() {
  await validateRedisConnection(queueConnection);
  await validateRedisConnection(workerConnection);
  await queueEvents.waitUntilReady();
  await worker.waitUntilReady();
  await queue.add(
    'technical-check',
    { source: 'm0' },
    { jobId: `technical-check-${Date.now()}`, removeOnComplete: true, removeOnFail: true },
  );
  logger.info({ message: 'Worker started' });
}

async function shutdown(signal: NodeJS.Signals) {
  logger.info({ signal, message: 'Worker shutting down' });
  await worker.close();
  await queueEvents.close();
  await queue.close();
  queueConnection.disconnect(false);
  workerConnection.disconnect(false);
  process.exit(0);
}

process.on('SIGTERM', (signal) => {
  void shutdown(signal);
});

process.on('SIGINT', (signal) => {
  void shutdown(signal);
});

worker.on('completed', (job) => {
  logger.info({ jobId: job.id, message: 'Technical test job completed' });
});

queueEvents.on('completed', ({ jobId }) => {
  logger.info({ jobId, message: 'Queue event completed' });
});

worker.on('failed', (job, error) => {
  logger.error({ jobId: job?.id, err: error, message: 'Technical test job failed' });
});

start().catch((error: unknown) => {
  logger.error({ err: error, message: 'Worker failed to start' });
  process.exit(1);
});
