import { Global, Module } from '@nestjs/common';
import { PinoLoggerService } from './logging/pino-logger.service';
import { PrismaService } from './prisma/prisma.service';
import { RedisProvider } from './redis/redis.provider';
import { RequestContextService } from './request-context/request-context.service';

@Global()
@Module({
  providers: [RequestContextService, PinoLoggerService, PrismaService, RedisProvider],
  exports: [RequestContextService, PinoLoggerService, PrismaService, RedisProvider],
})
export class InfrastructureModule {}
