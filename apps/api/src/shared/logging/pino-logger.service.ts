import { Injectable, LoggerService } from '@nestjs/common';
import { createLogger } from '@dtodo/config';

@Injectable()
export class PinoLoggerService implements LoggerService {
  private readonly logger = createLogger({
    service: 'api',
    level: process.env.LOG_LEVEL === 'debug' ? 'debug' : 'info',
  });

  log(message: unknown, context?: string) {
    this.logger.info({ context, message });
  }

  error(message: unknown, trace?: string, context?: string) {
    this.logger.error({ context, trace, message });
  }

  warn(message: unknown, context?: string) {
    this.logger.warn({ context, message });
  }

  debug(message: unknown, context?: string) {
    this.logger.debug({ context, message });
  }

  verbose(message: unknown, context?: string) {
    this.logger.trace({ context, message });
  }
}
