import { randomUUID } from 'node:crypto';
import { z } from 'zod';

export const requestIdSchema = z
  .string()
  .trim()
  .min(8)
  .max(128)
  .regex(/^[A-Za-z0-9._:-]+$/);

export function normalizeRequestId(input: unknown): string {
  const result = requestIdSchema.safeParse(input);

  if (result.success) {
    return result.data;
  }

  return randomUUID();
}
