import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateBusinessProfileDto {
  @ApiPropertyOptional({ type: String, example: 'Muebles Habana' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({ type: String, example: 'Muebles de madera para hogares y negocios.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ type: String, example: 'Muebles a medida en La Habana.' })
  @IsOptional()
  @IsString()
  @MaxLength(240)
  shortDescription?: string;

  @ApiPropertyOptional({ type: String, example: 'Calle 23, Vedado, La Habana' })
  @IsOptional()
  @IsString()
  @MaxLength(240)
  address?: string;

  @ApiPropertyOptional({ type: String, example: '+5355555555' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @ApiPropertyOptional({ type: String, example: 'ventas@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ type: String, example: 'America/Havana' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  timezone?: string;

  @ApiPropertyOptional({ type: String, example: 'https://example.com/logo.png' })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  logoUrl?: string;

  @ApiPropertyOptional({ type: String, example: 'https://example.com/cover.jpg' })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  coverImageUrl?: string;
}
