import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { parse, serialize } from 'cookie';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

const SESSION_COOKIE_NAME = 'dtodo_session';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Post('register')
  @ApiBody({ type: RegisterDto })
  register(@Body() dto: RegisterDto | undefined) {
    return this.authService.register(this.requireBody(dto));
  }

  @Post('login')
  @ApiBody({ type: LoginDto })
  async login(@Body() dto: LoginDto | undefined, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.login(this.requireBody(dto));
    this.setSessionCookie(response, result.sessionToken, result.expiresAt);

    return { user: result.user };
  }

  @Post('logout')
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    await this.authService.logout(this.readSessionCookie(request));
    this.clearSessionCookie(response);

    return { message: 'Sesión cerrada.' };
  }

  @Get('me')
  async me(@Req() request: Request) {
    const user = await this.authService.currentUser(this.readSessionCookie(request));

    if (!user) {
      throw new UnauthorizedException('No autenticado.');
    }

    return { user };
  }

  @Post('email/verification/request')
  requestEmailVerification(@Req() request: Request) {
    return this.authService.requestEmailVerification(this.readSessionCookie(request));
  }

  @Post('email/verify')
  @ApiBody({ type: VerifyEmailDto })
  verifyEmail(@Body() dto: VerifyEmailDto | undefined) {
    return this.authService.verifyEmail(this.requireBody(dto).token);
  }

  @Post('password/reset/request')
  @ApiBody({ type: RequestPasswordResetDto })
  requestPasswordReset(@Body() dto: RequestPasswordResetDto | undefined) {
    return this.authService.requestPasswordReset(this.requireBody(dto).email);
  }

  @Post('password/reset')
  @ApiBody({ type: ResetPasswordDto })
  resetPassword(@Body() dto: ResetPasswordDto | undefined) {
    const body = this.requireBody(dto);
    return this.authService.resetPassword(body.token, body.password);
  }

  private requireBody<T>(dto: T | undefined): T {
    if (!dto) {
      throw new BadRequestException('El cuerpo de la solicitud es obligatorio.');
    }

    return dto;
  }

  private readSessionCookie(request: Request): string | undefined {
    const cookieHeader = request.headers.cookie;

    if (!cookieHeader) {
      return undefined;
    }

    return parse(cookieHeader)[SESSION_COOKIE_NAME];
  }

  private setSessionCookie(response: Response, token: string, expiresAt: Date) {
    response.setHeader(
      'Set-Cookie',
      serialize(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        expires: expiresAt,
      }),
    );
  }

  private clearSessionCookie(response: Response) {
    response.setHeader(
      'Set-Cookie',
      serialize(SESSION_COOKIE_NAME, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        expires: new Date(0),
      }),
    );
  }
}
