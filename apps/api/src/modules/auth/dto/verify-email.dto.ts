import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({ type: String, example: 'token-dev-o-token-recibido-por-email' })
  @IsString()
  token!: string;
}
