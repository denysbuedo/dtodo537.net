import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class RequestPasswordResetDto {
  @ApiProperty({ type: String, example: 'usuario@example.com' })
  @IsEmail()
  email!: string;
}
