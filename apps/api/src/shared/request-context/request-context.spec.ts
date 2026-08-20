import { describe, expect, it } from 'vitest';
import { RequestContextService } from './request-context.service';

describe('RequestContextService', () => {
  it('stores request context in async local storage', () => {
    RequestContextService.run({ requestId: 'test-request' }, () => {
      expect(RequestContextService.current()?.requestId).toBe('test-request');
    });
  });
});
