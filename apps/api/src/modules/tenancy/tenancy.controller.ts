import { Body, Controller, Get, Headers, Inject, Param, Post, Req } from '@nestjs/common';
import { ApiBody, ApiHeader, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { parse } from 'cookie';
import { SESSION_COOKIE_NAME } from '../auth/auth.constants';
import { TenancyService } from './tenancy.service';
import { ProvisionTenantDto } from './dto/provision-tenant.dto';

@ApiTags('tenancy')
@Controller()
export class TenancyController {
  constructor(@Inject(TenancyService) private readonly tenancyService: TenancyService) {}

  @Post('tenants/provision')
  @ApiBody({ type: ProvisionTenantDto })
  provision(@Req() request: Request, @Body() dto: ProvisionTenantDto) {
    return this.tenancyService.provision(this.readSessionCookie(request), dto);
  }

  @Get('tenants')
  listMine(@Req() request: Request) {
    return this.tenancyService.listForSession(this.readSessionCookie(request));
  }

  @Get('tenant-context')
  @ApiHeader({
    name: 'X-Tenant-ID',
    required: true,
    description: 'Tenant selector validated against the authenticated membership.',
  })
  context(@Req() request: Request, @Headers('x-tenant-id') tenantId: string | undefined) {
    return this.tenancyService.resolveContext(this.readSessionCookie(request), tenantId);
  }

  @Get('tenants/resolve/:subdomain')
  resolve(@Param('subdomain') subdomain: string) {
    return this.tenancyService.resolveBySubdomain(subdomain);
  }

  private readSessionCookie(request: Request): string | undefined {
    const cookieHeader = request.headers.cookie;

    if (!cookieHeader) {
      return undefined;
    }

    return parse(cookieHeader)[SESSION_COOKIE_NAME];
  }
}
