import { pino, stdTimeFunctions } from 'pino';

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LoggerOptions {
  service: string;
  level?: LogLevel;
}

export function createLogger(options: LoggerOptions) {
  return pino({
    level: options.level ?? 'info',
    base: {
      service: options.service,
    },
    timestamp: stdTimeFunctions.isoTime,
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'password',
        'passwordHash',
        'session',
        'token',
        '*.secret',
        '*.key',
      ],
      censor: '[REDACTED]',
    },
    messageKey: 'message',
  });
}
