import { describe, expect, it } from 'vitest';
import { normalizeRequestId } from './request-id.js';

describe('normalizeRequestId', () => {
  it('reuses valid ids', () => {
    expect(normalizeRequestId('request-123')).toBe('request-123');
  });

  it('generates a new id for unsafe values', () => {
    expect(normalizeRequestId('bad header value')).not.toBe('bad header value');
  });
});
