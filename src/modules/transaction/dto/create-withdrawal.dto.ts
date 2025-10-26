import { IsNotEmpty, IsNumber, IsPositive, Min } from 'class-validator';

export class CreateWithdrawalDto {
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    @Min(0.01)
    amount: number;
}