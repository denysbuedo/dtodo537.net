import { Injectable } from '@nestjs/common';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { loadRuntimeConfig } from '../../shared/config/runtime-config';

@Injectable()
export class StorageService {
  private readonly bucket: string;
  private readonly client: S3Client;

  constructor() {
    const config = loadRuntimeConfig();
    this.bucket = config.S3_BUCKET;
    this.client = new S3Client({
      endpoint: config.S3_ENDPOINT,
      forcePathStyle: true,
      region: 'us-east-1',
      credentials: {
        accessKeyId: config.S3_ACCESS_KEY,
        secretAccessKey: config.S3_SECRET_KEY,
      },
    });
  }

  getBucket() {
    return this.bucket;
  }

  async putObject(input: { objectKey: string; body: Buffer; contentType: string }) {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: input.objectKey,
        Body: input.body,
        ContentType: input.contentType,
      }),
    );
  }

  async getObject(input: { objectKey: string }) {
    return this.client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: input.objectKey,
      }),
    );
  }
}
