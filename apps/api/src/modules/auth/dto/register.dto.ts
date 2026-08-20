import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ type: String, example: 'Usuario' })
  @IsString()
  @MinLength(1)
  firstName!: string;

  @ApiProperty({ type: String, example: 'Prueba' })
  @IsString()
  @MinLength(1)
  lastName!: string;

  @ApiProperty({ type: String, example: 'usuario@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ type: String, minLength: 12, example: 'Password123!' })
  @IsString()
  @MinLength(12)
  password!: string;
}
