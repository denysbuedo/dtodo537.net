import { BadRequestException } from '@nestjs/common';

const RESERVED_SUBDOMAINS = new Set([
  'admin',
  'api',
  'app',
  'assets',
  'cdn',
  'docs',
  'login',
  'register',
  'support',
  'www',
]);

const SUBDOMAIN_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])$/;

export function normalizeSubdomain(input: unknown) {
  if (typeof input !== 'string') {
    throw new BadRequestException('El subdominio es obligatorio.');
  }

  const subdomain = input.trim().toLowerCase();

  if (!SUBDOMAIN_PATTERN.test(subdomain)) {
    throw new BadRequestException(
      'El subdominio debe tener entre 3 y 63 caracteres y usar solo letras, números o guiones.',
    );
  }

  if (RESERVED_SUBDOMAINS.has(subdomain)) {
    throw new BadRequestException('Ese subdominio está reservado.');
  }

  return subdomain;
}
