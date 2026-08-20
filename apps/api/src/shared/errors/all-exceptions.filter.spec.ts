import { InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import type { ArgumentsHost } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { RequestContextService } from '../request-context/request-context.service';

describe('AllExceptionsFilter', () => {
  it('returns a safe error envelope', () => {
    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    const host = {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
      }),
    } as unknown as ArgumentsHost;
    const logger = { error: vi.fn() } as never;
    const filter = new AllExceptionsFilter(logger);

    RequestContextService.run({ requestId: 'request-1' }, () => {
      filter.catch(new InternalServerErrorException('sensitive'), host);
    });

    expect(json).toHaveBeenCalledWith({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Se produjo un error interno',
        requestId: 'request-1',
      },
    });
  });

  it('normalizes not found errors', () => {
    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    const host = {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
      }),
    } as unknown as ArgumentsHost;
    const logger = { error: vi.fn() } as never;
    const filter = new AllExceptionsFilter(logger);

    RequestContextService.run({ requestId: 'request-404' }, () => {
      filter.catch(new NotFoundException('Cannot GET /private-path'), host);
    });

    expect(json).toHaveBeenCalledWith({
      error: {
        code: 'NOT_FOUND',
        message: 'El recurso solicitado no existe',
        requestId: 'request-404',
      },
    });
  });

  it('preserves unauthorized errors as client errors', () => {
    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    const host = {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
      }),
    } as unknown as ArgumentsHost;
    const logger = { error: vi.fn() } as never;
    const filter = new AllExceptionsFilter(logger);

    RequestContextService.run({ requestId: 'request-401' }, () => {
      filter.catch(new UnauthorizedException('No autenticado.'), host);
    });

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({
      error: {
        code: 'UNAUTHORIZED',
        message: 'No autenticado.',
        requestId: 'request-401',
      },
    });
  });
});
