import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateContactDto {
  @ApiPropertyOptional({ type: String, example: '+5355555555' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @ApiPropertyOptional({ type: String, example: 'ventas@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ type: String, example: '+5355555555' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  whatsappPhone?: string;

  @ApiPropertyOptional({ type: String, example: 'Hola, me interesa conocer más sobre su showroom.' })
  @IsOptional()
  @IsString()
  @MaxLength(240)
  whatsappMessage?: string;

  @ApiPropertyOptional({ type: Boolean, example: true })
  @IsOptional()
  @IsBoolean()
  whatsappEnabled?: boolean;

  @ApiPropertyOptional({ type: String, example: 'https://instagram.com/muebleshabana' })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  instagramUrl?: string;

  @ApiPropertyOptional({ type: String, example: 'https://facebook.com/muebleshabana' })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  facebookUrl?: string;

  @ApiPropertyOptional({ type: String, example: 'https://muebleshabana.example.com' })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  websiteUrl?: string;
}
