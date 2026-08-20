import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { RequestContextService } from '../request-context/request-context.service';
import { PinoLoggerService } from '../logging/pino-logger.service';

const HTTP_BAD_REQUEST = Number(HttpStatus.BAD_REQUEST);
const HTTP_INTERNAL_SERVER_ERROR = Number(HttpStatus.INTERNAL_SERVER_ERROR);
const HTTP_NOT_FOUND = Number(HttpStatus.NOT_FOUND);

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const requestContext = RequestContextService.current();
    const status =
      exception instanceof HttpException ? exception.getStatus() : HTTP_INTERNAL_SERVER_ERROR;

    const code = status >= 500 ? 'INTERNAL_ERROR' : this.resolveErrorCode(exception, status);
    const message =
      status >= 500 ? 'Se produjo un error interno' : this.resolveErrorMessage(exception, status);

    if (status >= 500) {
      this.logger.error({
        err: exception,
        requestId: requestContext?.requestId,
        message: 'Unhandled API exception',
      });
    }

    response.status(status).json({
      error: {
        code,
        message,
        requestId: requestContext?.requestId,
      },
    });
  }

  private resolveErrorCode(exception: unknown, status: number): string {
    if (status === HTTP_NOT_FOUND) {
      return 'NOT_FOUND';
    }

    if (status === HTTP_BAD_REQUEST) {
      return 'BAD_REQUEST';
    }

    if (!(exception instanceof HttpException)) {
      return 'INTERNAL_ERROR';
    }

    return exception.name.replace(/Exception$/, '').toUpperCase() || 'REQUEST_ERROR';
  }

  private resolveErrorMessage(exception: unknown, status: number): string {
    if (status === HTTP_NOT_FOUND) {
      return 'El recurso solicitado no existe';
    }

    if (!(exception instanceof HttpException)) {
      return 'La solicitud no pudo procesarse';
    }

    const response = exception.getResponse();

    if (typeof response === 'object' && response !== null && 'message' in response) {
      const value = (response as { message: unknown }).message;
      return Array.isArray(value) ? value.join(', ') : String(value);
    }

    return exception.message;
  }
}
