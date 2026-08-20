import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ type: String, example: 'Sofás' })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string;

  @ApiPropertyOptional({ type: String, example: 'sofas' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  slug?: string;

  @ApiPropertyOptional({ type: String, example: 'Muebles para sala.' })
  @IsOptional()
  @IsString()
  @MaxLength(240)
  description?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({ type: Number, example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}

export class UpdateCategoryDto extends CreateCategoryDto {}

export class ReorderCategoriesDto {
  @ApiProperty({ type: [String] })
  @IsString({ each: true })
  categoryIds!: string[];
}
