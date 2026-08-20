import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { TenancyModule } from './tenancy/tenancy.module';
import { ShowroomsModule } from './showrooms/showrooms.module';
import { MediaModule } from './media/media.module';
import { CatalogModule } from './catalog/catalog.module';
import { RequestContextMiddleware } from '../shared/request-context/request-context.middleware';
import { InfrastructureModule } from '../shared/infrastructure.module';

@Module({
  imports: [
    InfrastructureModule,
    HealthModule,
    AuthModule,
    TenancyModule,
    ShowroomsModule,
    MediaModule,
    CatalogModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
