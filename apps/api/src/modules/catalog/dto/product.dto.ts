import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductAvailabilityStatus, ProductPriceMode } from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProductAttributeDto {
  @ApiProperty({ type: String, example: 'Material' })
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  name!: string;

  @ApiProperty({ type: String, example: 'Madera' })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  value!: string;
}

export class CreateProductDto {
  @ApiProperty({ type: String, example: 'Sofá moderno' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({ type: String, example: 'sofa-moderno' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  slug?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ type: String, example: 'Sofá de madera y tela.' })
  @IsOptional()
  @IsString()
  @MaxLength(240)
  shortDescription?: string;

  @ApiPropertyOptional({ type: String, example: 'Diseñado para salas compactas.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ type: Number, example: 25000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ type: Number, example: 30000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  previousPrice?: number;

  @ApiPropertyOptional({ type: String, example: 'CUP' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional({ enum: ProductPriceMode })
  @IsOptional()
  @IsEnum(ProductPriceMode)
  priceMode?: ProductPriceMode;

  @ApiPropertyOptional({ enum: ProductAvailabilityStatus })
  @IsOptional()
  @IsEnum(ProductAvailabilityStatus)
  availabilityStatus?: ProductAvailabilityStatus;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @ApiPropertyOptional({ type: [ProductAttributeDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductAttributeDto)
  attributes?: ProductAttributeDto[];
}

export class UpdateProductDto extends CreateProductDto {}

export class QuickUpdateProductDto {
  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ enum: ProductPriceMode })
  @IsOptional()
  @IsEnum(ProductPriceMode)
  priceMode?: ProductPriceMode;

  @ApiPropertyOptional({ enum: ProductAvailabilityStatus })
  @IsOptional()
  @IsEnum(ProductAvailabilityStatus)
  availabilityStatus?: ProductAvailabilityStatus;
}

export class PublishProductDto {
  @ApiProperty({ type: Boolean })
  @IsBoolean()
  publish!: boolean;
}

export class ReorderProductImagesDto {
  @ApiProperty({ type: [String] })
  @IsString({ each: true })
  imageIds!: string[];
}
