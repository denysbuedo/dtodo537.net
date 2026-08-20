import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { PrismaClient } from '@prisma/client';
import { Queue, QueueEvents, Worker } from 'bullmq';
import sharp from 'sharp';
import {
  createLogger,
  createRedisClient,
  loadConfig,
  validateRedisConnection,
} from '@dtodo/config';

const config = loadConfig('worker');
const logger = createLogger({ service: 'worker' });
const prisma = new PrismaClient();
const queuePrefix = 'dtodo';
const technicalQueueName = 'm0-technical-check';
const mediaQueueName = 'media-processing';
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
const eventConnection = createRedisClient({
  url: config.REDIS_URL ?? '',
  service: 'worker-events',
  maxRetriesPerRequest: null,
  logger,
});
const storage = new S3Client({
  endpoint: config.S3_ENDPOINT,
  forcePathStyle: true,
  region: 'us-east-1',
  credentials: {
    accessKeyId: config.S3_ACCESS_KEY,
    secretAccessKey: config.S3_SECRET_KEY,
  },
});

const technicalQueue = new Queue(technicalQueueName, {
  connection: queueConnection,
  prefix: queuePrefix,
});
const technicalQueueEvents = new QueueEvents(technicalQueueName, {
  connection: eventConnection,
  prefix: queuePrefix,
});
const mediaQueueEvents = new QueueEvents(mediaQueueName, {
  connection: eventConnection,
  prefix: queuePrefix,
});
const technicalWorker = new Worker(
  technicalQueueName,
  async (job) => {
    await Promise.resolve();
    logger.info({
      jobId: job.id,
      jobName: job.name,
      message: 'Processing technical test job',
    });

    return { processedAt: new Date().toISOString() };
  },
  { connection: workerConnection, prefix: queuePrefix },
);
const mediaWorker = new Worker(
  mediaQueueName,
  async (job: { id?: string; data: { mediaAssetId?: string } }) => {
    const mediaAssetId = job.data.mediaAssetId;

    if (!mediaAssetId) {
      throw new Error('mediaAssetId is required');
    }

    await processImage(mediaAssetId);
    return { processedAt: new Date().toISOString() };
  },
  { connection: workerConnection, prefix: queuePrefix },
);

async function processImage(mediaAssetId: string) {
  const media = await prisma.mediaAsset.findUnique({ where: { id: mediaAssetId } });

  if (!media || media.deletedAt || media.type !== 'IMAGE') {
    logger.warn({ mediaAssetId, message: 'Media asset skipped' });
    return;
  }

  await prisma.mediaAsset.update({
    where: { id: media.id },
    data: { status: 'PROCESSING', errorMessage: null },
  });

  try {
    const object = await storage.send(
      new GetObjectCommand({
        Bucket: media.bucket,
        Key: media.objectKey,
      }),
    );
    const source = await streamToBuffer(object.Body);
    const metadata = await sharp(source).metadata();
    const variants = [
      { kind: 'THUMBNAIL' as const, width: 240 },
      { kind: 'CARD' as const, width: 720 },
      { kind: 'LARGE' as const, width: 1400 },
    ];

    await Promise.all(
      variants.map(async (variant) => {
        const output = await sharp(source)
          .rotate()
          .resize({ width: variant.width, withoutEnlargement: true })
          .webp({ quality: 82 })
          .toBuffer({ resolveWithObject: true });
        const objectKey = media.objectKey
          .replace('/original/', `/variants/${variant.kind.toLowerCase()}-`)
          .replace(/\.[^.]+$/, '.webp');

        await storage.send(
          new PutObjectCommand({
            Bucket: media.bucket,
            Key: objectKey,
            Body: output.data,
            ContentType: 'image/webp',
          }),
        );

        await prisma.mediaVariant.upsert({
          where: { mediaAssetId_kind: { mediaAssetId: media.id, kind: variant.kind } },
          create: {
            tenantId: media.tenantId,
            mediaAssetId: media.id,
            kind: variant.kind,
            bucket: media.bucket,
            objectKey,
            mimeType: 'image/webp',
            size: output.data.length,
            width: output.info.width,
            height: output.info.height,
          },
          update: {
            bucket: media.bucket,
            objectKey,
            mimeType: 'image/webp',
            size: output.data.length,
            width: output.info.width,
            height: output.info.height,
          },
        });
      }),
    );

    await prisma.mediaAsset.update({
      where: { id: media.id },
      data: {
        status: 'READY',
        width: metadata.width ?? null,
        height: metadata.height ?? null,
      },
    });
    logger.info({ mediaAssetId: media.id, message: 'Image processed' });
  } catch (error) {
    await prisma.mediaAsset.update({
      where: { id: media.id },
      data: {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown media processing error',
      },
    });
    throw error;
  }
}

async function streamToBuffer(body: unknown) {
  if (!body || typeof body !== 'object') {
    throw new Error('S3 object body is empty');
  }

  if ('transformToByteArray' in body && typeof body.transformToByteArray === 'function') {
    return Buffer.from(await body.transformToByteArray());
  }

  if (!('on' in body)) {
    throw new Error('S3 object body is not readable');
  }

  const chunks: Buffer[] = [];
  const stream = body as NodeJS.ReadableStream;

  return new Promise<Buffer>((resolve, reject) => {
    stream.on('data', (chunk: Buffer | string) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

async function start() {
  await validateRedisConnection(queueConnection);
  await validateRedisConnection(workerConnection);
  await technicalQueueEvents.waitUntilReady();
  await mediaQueueEvents.waitUntilReady();
  await technicalWorker.waitUntilReady();
  await mediaWorker.waitUntilReady();
  await technicalQueue.add(
    'technical-check',
    { source: 'm0' },
    { jobId: `technical-check-${Date.now()}`, removeOnComplete: true, removeOnFail: true },
  );
  logger.info({ message: 'Worker started' });
}

async function shutdown(signal: NodeJS.Signals) {
  logger.info({ signal, message: 'Worker shutting down' });
  await mediaWorker.close();
  await technicalWorker.close();
  await mediaQueueEvents.close();
  await technicalQueueEvents.close();
  await technicalQueue.close();
  await prisma.$disconnect();
  queueConnection.disconnect(false);
  workerConnection.disconnect(false);
  eventConnection.disconnect(false);
  process.exit(0);
}

process.on('SIGTERM', (signal) => {
  void shutdown(signal);
});

process.on('SIGINT', (signal) => {
  void shutdown(signal);
});

technicalWorker.on('completed', (job) => {
  logger.info({ jobId: job.id, message: 'Technical test job completed' });
});

mediaWorker.on('completed', (job) => {
  logger.info({ jobId: job.id, message: 'Media job completed' });
});

technicalQueueEvents.on('completed', ({ jobId }) => {
  logger.info({ jobId, message: 'Technical queue event completed' });
});

mediaQueueEvents.on('completed', ({ jobId }) => {
  logger.info({ jobId, message: 'Media queue event completed' });
});

mediaWorker.on('failed', (job, error) => {
  logger.error({ jobId: job?.id, err: error, message: 'Media job failed' });
});

technicalWorker.on('failed', (job, error) => {
  logger.error({ jobId: job?.id, err: error, message: 'Technical test job failed' });
});

start().catch((error: unknown) => {
  logger.error({ err: error, message: 'Worker failed to start' });
  process.exit(1);
});
