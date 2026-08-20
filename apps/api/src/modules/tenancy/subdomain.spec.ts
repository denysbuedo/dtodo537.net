import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { normalizeSubdomain } from './subdomain';

describe('normalizeSubdomain', () => {
  it('normalizes accepted subdomains', () => {
    expect(normalizeSubdomain('  Muebles-Habana  ')).toBe('muebles-habana');
  });

  it('rejects reserved subdomains', () => {
    expect(() => normalizeSubdomain('admin')).toThrow(BadRequestException);
  });

  it('rejects invalid formats', () => {
    expect(() => normalizeSubdomain('-tienda')).toThrow(BadRequestException);
  });
});
