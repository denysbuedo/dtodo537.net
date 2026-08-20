import { Body, Controller, Get, Inject, Param, Patch, Req } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { parse } from 'cookie';
import { SESSION_COOKIE_NAME } from '../auth/auth.constants';
import { ShowroomsService } from './showrooms.service';
import { UpdateBusinessProfileDto } from './dto/update-business-profile.dto';
import { UpdateThemeDto } from './dto/update-theme.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { PublishShowroomDto } from './dto/publish-showroom.dto';

@ApiTags('showrooms')
@Controller()
export class ShowroomsController {
  constructor(@Inject(ShowroomsService) private readonly showroomsService: ShowroomsService) {}

  @Get('themes')
  listThemes() {
    return this.showroomsService.listThemes();
  }

  @Get('showrooms/:showroomId/manage')
  manage(@Req() request: Request, @Param('showroomId') showroomId: string) {
    return this.showroomsService.getManageState(this.readSessionCookie(request), showroomId);
  }

  @Patch('showrooms/:showroomId/profile')
  @ApiBody({ type: UpdateBusinessProfileDto })
  updateProfile(
    @Req() request: Request,
    @Param('showroomId') showroomId: string,
    @Body() dto: UpdateBusinessProfileDto,
  ) {
    return this.showroomsService.updateProfile(this.readSessionCookie(request), showroomId, dto);
  }

  @Patch('showrooms/:showroomId/contact')
  @ApiBody({ type: UpdateContactDto })
  updateContact(
    @Req() request: Request,
    @Param('showroomId') showroomId: string,
    @Body() dto: UpdateContactDto,
  ) {
    return this.showroomsService.updateContact(this.readSessionCookie(request), showroomId, dto);
  }

  @Patch('showrooms/:showroomId/theme')
  @ApiBody({ type: UpdateThemeDto })
  updateTheme(
    @Req() request: Request,
    @Param('showroomId') showroomId: string,
    @Body() dto: UpdateThemeDto,
  ) {
    return this.showroomsService.updateTheme(this.readSessionCookie(request), showroomId, dto);
  }

  @Patch('showrooms/:showroomId/publication')
  @ApiBody({ type: PublishShowroomDto })
  setPublication(
    @Req() request: Request,
    @Param('showroomId') showroomId: string,
    @Body() dto: PublishShowroomDto,
  ) {
    return this.showroomsService.setPublication(
      this.readSessionCookie(request),
      showroomId,
      dto.publish,
    );
  }

  @Get('showrooms/:showroomId/preview')
  preview(@Req() request: Request, @Param('showroomId') showroomId: string) {
    return this.showroomsService.preview(this.readSessionCookie(request), showroomId);
  }

  @Get('public/showrooms/:subdomain')
  publicShowroom(@Param('subdomain') subdomain: string) {
    return this.showroomsService.publicBySubdomain(subdomain);
  }

  private readSessionCookie(request: Request): string | undefined {
    const cookieHeader = request.headers.cookie;

    if (!cookieHeader) {
      return undefined;
    }

    return parse(cookieHeader)[SESSION_COOKIE_NAME];
  }
}
