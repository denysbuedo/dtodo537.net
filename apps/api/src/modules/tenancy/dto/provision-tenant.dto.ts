import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ProvisionTenantDto {
  @ApiProperty({ type: String, example: 'Muebles Habana' })
  @IsString()
  @MinLength(2)
  businessName!: string;

  @ApiProperty({ type: String, example: 'retail' })
  @IsString()
  @MinLength(2)
  businessTypeCode!: string;

  @ApiProperty({ type: String, example: 'muebles-habana' })
  @IsString()
  @MinLength(3)
  subdomain!: string;
}
