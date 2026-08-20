import { Redis } from 'ioredis';
import type { Redis as RedisClient } from 'ioredis';
import type { Logger } from 'pino';

export interface RedisConnectionOptions {
  url: string;
  service: string;
  maxRetriesPerRequest?: number | null;
  logger: Pick<Logger, 'info' | 'error' | 'warn'>;
}

export function createRedisClient(options: RedisConnectionOptions): RedisClient {
  const redis = new Redis(options.url, {
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest:
      options.maxRetriesPerRequest === undefined ? 3 : options.maxRetriesPerRequest,
    connectionName: options.service,
    retryStrategy: () => null,
  });

  redis.on('connect', () => {
    options.logger.info({ message: 'Redis connection established' });
  });

  redis.on('error', (error: Error) => {
    options.logger.error({ err: error, message: 'Redis connection error' });
  });

  redis.on('close', () => {
    options.logger.warn({ message: 'Redis connection closed' });
  });

  return redis;
}

export async function validateRedisConnection(redis: RedisClient): Promise<void> {
  if (redis.status === 'wait' || redis.status === 'end') {
    await redis.connect();
  }

  if (redis.status === 'connecting' || redis.status === 'connect') {
    await new Promise<void>((resolve, reject) => {
      redis.once('ready', () => resolve());
      redis.once('error', (error: Error) => reject(error));
    });
  }

  await redis.ping();
}

export function closeRedisConnection(redis: RedisClient): void {
  if (redis.status !== 'end') {
    redis.disconnect(false);
  }
}
