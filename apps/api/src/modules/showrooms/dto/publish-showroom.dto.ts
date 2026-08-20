import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class PublishShowroomDto {
  @ApiProperty({ type: Boolean, example: true })
  @IsBoolean()
  publish!: boolean;
}
