import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './modules/app.module';
import { AllExceptionsFilter } from './shared/errors/all-exceptions.filter';
import { PinoLoggerService } from './shared/logging/pino-logger.service';
import { loadRuntimeConfig } from './shared/config/runtime-config';

async function bootstrap() {
  const config = loadRuntimeConfig();
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  const logger = app.get(PinoLoggerService);

  app.useLogger(logger);
  app.setGlobalPrefix('api/v1');
  app.enableShutdownHooks();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter(logger));

  if (config.ENABLE_OPENAPI) {
    const documentConfig = new DocumentBuilder()
      .setTitle('dtodo537 API')
      .setDescription('M0 Foundation API')
      .setVersion('0.1.0')
      .build();
    const document = SwaggerModule.createDocument(app, documentConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
  logger.log(`API listening on port ${port}`);
}

void bootstrap();
