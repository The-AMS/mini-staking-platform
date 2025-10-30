import { IsNotEmpty, IsNumber, Min, Max } from 'class-validator';

export class SetProfitRateDto {
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    @Max(100)
    profit_rate: number;
}