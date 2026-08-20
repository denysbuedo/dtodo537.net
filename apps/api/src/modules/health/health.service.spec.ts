import { describe, expect, it, vi } from 'vitest';
import { HealthService } from './health.service';

describe('HealthService', () => {
  it('returns ok when postgres and redis are reachable', async () => {
    const service = new HealthService(
      { $queryRaw: vi.fn().mockResolvedValue([{ '?column?': 1 }]) } as never,
      { ping: vi.fn().mockResolvedValue(undefined) } as never,
    );

    await expect(service.readiness()).resolves.toMatchObject({
      status: 'ok',
      checks: {
        postgres: 'ok',
        redis: 'ok',
      },
    });
  });

  it('returns degraded when a dependency is down', async () => {
    const service = new HealthService(
      { $queryRaw: vi.fn().mockRejectedValue(new Error('db down')) } as never,
      { ping: vi.fn().mockResolvedValue(undefined) } as never,
    );

    await expect(service.readiness()).resolves.toMatchObject({
      status: 'degraded',
      checks: {
        postgres: 'down',
        redis: 'ok',
      },
    });
  });
});
