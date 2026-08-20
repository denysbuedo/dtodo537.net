import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsHexColor, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateThemeDto {
  @ApiProperty({ type: String, example: 'minimal' })
  @IsString()
  @MaxLength(40)
  themeCode!: string;

  @ApiPropertyOptional({ type: String, example: '#0f766e' })
  @IsOptional()
  @IsHexColor()
  primaryColor?: string;

  @ApiPropertyOptional({ type: String, example: '#1d1d1b' })
  @IsOptional()
  @IsHexColor()
  secondaryColor?: string;

  @ApiPropertyOptional({ type: String, example: '#f59e0b' })
  @IsOptional()
  @IsHexColor()
  accentColor?: string;

  @ApiPropertyOptional({ type: String, example: 'Inter' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  fontFamily?: string;
}
