import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { normalizeRequestId } from '@dtodo/validation';
import { RequestContextService } from './request-context.service';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction) {
    const requestId = normalizeRequestId(request.header('x-request-id'));
    response.setHeader('X-Request-ID', requestId);

    RequestContextService.run({ requestId }, next);
  }
}
