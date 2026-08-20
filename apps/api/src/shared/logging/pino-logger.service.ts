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
    if (message instanceof Error) {
      this.logger.error({ context, trace, err: message }, message.message);
      return;
    }

    if (typeof message === 'object' && message !== null) {
      this.logger.error({ context, trace, ...message });
      return;
    }

    this.logger.error({ context, trace }, String(message));
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
