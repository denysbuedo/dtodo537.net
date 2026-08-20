import { Controller, Get, Inject, Param, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { MediaService } from './media.service';

@ApiTags('media')
@Controller('media')
export class MediaController {
  constructor(@Inject(MediaService) private readonly mediaService: MediaService) {}

  @Get(':mediaId/:kind')
  async readImage(
    @Param('mediaId') mediaId: string,
    @Param('kind') kind: 'ORIGINAL' | 'THUMBNAIL' | 'CARD' | 'LARGE',
    @Res() response: Response,
  ) {
    const image = await this.mediaService.readPublicImage(mediaId, kind);
    response.setHeader('Content-Type', image.mimeType);
    response.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    if (!image.body || typeof image.body !== 'object' || !('pipe' in image.body)) {
      response.status(404).end();
      return;
    }

    image.body.pipe(response);
  }
}
