import { Inject, Injectable } from '@nestjs/common';
import { RedisProvider } from '../../shared/redis/redis.provider';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(RedisProvider) private readonly redisProvider: RedisProvider,
  ) {}

  liveness() {
    return {
      status: 'ok',
      service: 'api',
      timestamp: new Date().toISOString(),
    };
  }

  async readiness() {
    const checks = {
      postgres: await this.checkPostgres(),
      redis: await this.checkRedis(),
    };

    const status = Object.values(checks).every((check) => check === 'ok') ? 'ok' : 'degraded';

    return {
      status,
      service: 'api',
      checks,
      timestamp: new Date().toISOString(),
    };
  }

  private async checkPostgres(): Promise<'ok' | 'down'> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return 'ok';
    } catch {
      return 'down';
    }
  }

  private async checkRedis(): Promise<'ok' | 'down'> {
    try {
      await this.redisProvider.ping();
      return 'ok';
    } catch {
      return 'down';
    }
  }
}
