import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { RequestContextMiddleware } from '../shared/request-context/request-context.middleware';
import { InfrastructureModule } from '../shared/infrastructure.module';

@Module({
  imports: [InfrastructureModule, HealthModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
