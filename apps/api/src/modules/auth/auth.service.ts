import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { randomBytes, createHash } from 'node:crypto';
import * as argon2 from 'argon2';
import type { User } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';
import type { AuthUserResponse } from './auth.types';

const SESSION_TTL_MS = 1000 * 60 * 60 * 12;
const EMAIL_VERIFICATION_TTL_MS = 1000 * 60 * 60 * 24;
const PASSWORD_RESET_TTL_MS = 1000 * 60 * 30;

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(dto: RegisterDto) {
    const email = this.normalizeEmail(dto.email);
    const existingUser = await this.prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      throw new BadRequestException('Ya existe una cuenta con ese correo.');
    }

    const passwordHash = await argon2.hash(dto.password, { type: argon2.argon2id });
    const token = this.createToken();

    const user = await this.prisma.user.create({
      data: {
        email,
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        passwordHash,
        emailVerificationTokens: {
          create: {
            tokenHash: this.hashToken(token),
            expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS),
          },
        },
      },
    });

    return {
      user: this.toAuthUser(user),
      ...this.devToken(token),
    };
  }

  async login(dto: LoginDto) {
    const email = this.normalizeEmail(dto.email);
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !(await argon2.verify(user.passwordHash, dto.password))) {
      throw new UnauthorizedException('Correo o contraseña incorrectos.');
    }

    if (user.status === 'SUSPENDED' || user.status === 'BLOCKED') {
      throw new UnauthorizedException('La cuenta no puede iniciar sesión.');
    }

    const sessionToken = this.createToken();
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

    await this.prisma.$transaction([
      this.prisma.session.create({
        data: {
          userId: user.id,
          tokenHash: this.hashToken(sessionToken),
          expiresAt,
        },
      }),
      this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      }),
    ]);

    return {
      sessionToken,
      expiresAt,
      user: this.toAuthUser(user),
    };
  }

  async logout(sessionToken: string | undefined) {
    if (!sessionToken) {
      return;
    }

    await this.prisma.session.updateMany({
      where: {
        tokenHash: this.hashToken(sessionToken),
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  async currentUser(sessionToken: string | undefined): Promise<AuthUserResponse | null> {
    if (!sessionToken) {
      return null;
    }

    const session = await this.prisma.session.findUnique({
      where: { tokenHash: this.hashToken(sessionToken) },
      include: { user: true },
    });

    if (!session || session.revokedAt || session.expiresAt <= new Date()) {
      return null;
    }

    if (session.user.status === 'SUSPENDED' || session.user.status === 'BLOCKED') {
      return null;
    }

    return this.toAuthUser(session.user);
  }

  async requestEmailVerification(sessionToken: string | undefined) {
    const user = await this.requireUserBySession(sessionToken);
    const token = this.createToken();

    await this.prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashToken(token),
        expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS),
      },
    });

    return {
      message: 'Si la cuenta existe, recibirá instrucciones.',
      ...this.devToken(token),
    };
  }

  async verifyEmail(token: string) {
    const tokenHash = this.hashToken(token);
    const storedToken = await this.prisma.emailVerificationToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!storedToken || storedToken.usedAt || storedToken.expiresAt <= new Date()) {
      throw new BadRequestException('El token de verificación no es válido.');
    }

    const user = await this.prisma.$transaction(async (tx) => {
      await tx.emailVerificationToken.update({
        where: { id: storedToken.id },
        data: { usedAt: new Date() },
      });

      return tx.user.update({
        where: { id: storedToken.userId },
        data: {
          status: 'ACTIVE',
          emailVerifiedAt: storedToken.user.emailVerifiedAt ?? new Date(),
        },
      });
    });

    return { user: this.toAuthUser(user) };
  }

  async requestPasswordReset(emailInput: string) {
    const email = this.normalizeEmail(emailInput);
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { message: 'Si la cuenta existe, recibirá instrucciones.' };
    }

    const token = this.createToken();
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashToken(token),
        expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
      },
    });

    return {
      message: 'Si la cuenta existe, recibirá instrucciones.',
      ...this.devToken(token),
    };
  }

  async resetPassword(token: string, password: string) {
    const tokenHash = this.hashToken(token);
    const storedToken = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!storedToken || storedToken.usedAt || storedToken.expiresAt <= new Date()) {
      throw new BadRequestException('El token de recuperación no es válido.');
    }

    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

    await this.prisma.$transaction([
      this.prisma.passwordResetToken.update({
        where: { id: storedToken.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: storedToken.userId },
        data: { passwordHash },
      }),
      this.prisma.session.updateMany({
        where: { userId: storedToken.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    return { message: 'La contraseña fue actualizada.' };
  }

  private async requireUserBySession(sessionToken: string | undefined): Promise<User> {
    if (!sessionToken) {
      throw new UnauthorizedException('No autenticado.');
    }

    const session = await this.prisma.session.findUnique({
      where: { tokenHash: this.hashToken(sessionToken) },
      include: { user: true },
    });

    if (!session || session.revokedAt || session.expiresAt <= new Date()) {
      throw new UnauthorizedException('No autenticado.');
    }

    return session.user;
  }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private createToken() {
    return randomBytes(32).toString('base64url');
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private toAuthUser(user: User): AuthUserResponse {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      status: user.status,
      emailVerifiedAt: user.emailVerifiedAt?.toISOString() ?? null,
    };
  }

  private devToken(token: string) {
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      return { devToken: token };
    }

    return {};
  }
}
