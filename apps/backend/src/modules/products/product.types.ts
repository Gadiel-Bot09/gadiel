import { Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpsertProductDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsString()
  @IsOptional()
  barcode?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;

  @IsBoolean()
  @IsOptional()
  taxable?: boolean;
}
