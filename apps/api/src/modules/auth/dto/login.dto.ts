import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ type: String, example: 'usuario@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ type: String, example: 'Password123!' })
  @IsString()
  @MinLength(1)
  password!: string;
}
