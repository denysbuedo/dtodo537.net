import { Injectable, OnModuleDestroy } from '@nestjs/common';
import {
  closeRedisConnection,
  createLogger,
  createRedisClient,
  validateRedisConnection,
} from '@dtodo/config';
import type Redis from 'ioredis';
import { loadRuntimeConfig } from '../config/runtime-config';

@Injectable()
export class RedisProvider implements OnModuleDestroy {
  private readonly logger = createLogger({ service: 'api' });
  private readonly redis: Redis;

  constructor() {
    const config = loadRuntimeConfig();
    this.redis = createRedisClient({
      url: config.REDIS_URL ?? '',
      service: 'api',
      logger: this.logger,
    });
  }

  onModuleDestroy() {
    closeRedisConnection(this.redis);
  }

  async ping() {
    await validateRedisConnection(this.redis);
  }

  get client() {
    return this.redis;
  }
}
