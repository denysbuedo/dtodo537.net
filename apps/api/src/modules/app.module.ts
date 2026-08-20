import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { RequestContextMiddleware } from '../shared/request-context/request-context.middleware';
import { InfrastructureModule } from '../shared/infrastructure.module';

@Module({
  imports: [InfrastructureModule, HealthModule, AuthModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
