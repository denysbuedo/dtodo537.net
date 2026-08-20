import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { MediaVariantKind } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { StorageService } from './storage.service';

@Injectable()
export class MediaService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(StorageService) private readonly storage: StorageService,
  ) {}

  async readPublicImage(mediaId: string, kind: MediaVariantKind) {
    const media = await this.prisma.mediaAsset.findUnique({
      where: { id: mediaId },
      include: { variants: true },
    });

    if (!media || media.deletedAt || !['UPLOADED', 'PROCESSING', 'READY'].includes(media.status)) {
      throw new NotFoundException('La imagen solicitada no existe.');
    }

    const variant = media.variants.find((item) => item.kind === kind);
    const objectKey = variant?.objectKey ?? media.objectKey;
    const mimeType = variant?.mimeType ?? media.mimeType;
    const result = await this.storage.getObject({ objectKey });

    return {
      body: result.Body,
      mimeType,
    };
  }
}
