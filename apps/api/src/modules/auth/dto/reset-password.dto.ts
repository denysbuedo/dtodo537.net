import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ type: String, example: 'token-dev-o-token-recibido-por-email' })
  @IsString()
  token!: string;

  @ApiProperty({ type: String, minLength: 12, example: 'NuevaPassword123!' })
  @IsString()
  @MinLength(12)
  password!: string;
}
