import { IsNotEmpty, IsNumber, IsPositive, Min } from 'class-validator';

export class CreateDepositDto {
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    @Min(0.01)
    amount: number;
}