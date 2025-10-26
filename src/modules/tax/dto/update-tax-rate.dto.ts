import { IsNotEmpty, IsNumber, Min, Max } from 'class-validator';

export class UpdateTaxRateDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  tax_rate: number;
}