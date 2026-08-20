import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import * as argon2 from 'argon2';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  it('registers a pending user with a hashed password', async () => {
    const create = vi.fn().mockImplementation(({ data }) => ({
      id: 'user-1',
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      passwordHash: data.passwordHash,
      status: 'PENDING',
      emailVerifiedAt: null,
    }));
    const prisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue(null),
        create,
      },
    };
    const service = new AuthService(prisma as never);

    const result = await service.register({
      firstName: 'Ana',
      lastName: 'Perez',
      email: 'ANA@EXAMPLE.COM',
      password: 'very-secure-password',
    });

    expect(result.user.email).toBe('ana@example.com');
    expect(create).toHaveBeenCalledOnce();
    const passwordHash = create.mock.calls[0]?.[0].data.passwordHash as string;
    expect(passwordHash).not.toBe('very-secure-password');
    await expect(argon2.verify(passwordHash, 'very-secure-password')).resolves.toBe(true);
  });

  it('rejects invalid login without revealing which field failed', async () => {
    const service = new AuthService({
      user: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
    } as never);

    await expect(
      service.login({
        email: 'missing@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rejects password reset requests without email as bad requests', async () => {
    const service = new AuthService({} as never);

    await expect(service.requestPasswordReset(undefined as never)).rejects.toThrow(
      BadRequestException,
    );
  });
});
