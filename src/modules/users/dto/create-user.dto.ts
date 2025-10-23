import { IsString, IsNotEmpty, MinLength, IsEnum, IsOptional, IsEmpty, IsEmail } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @IsEmail()
    email: string;

    @IsEmpty()
    role: UserRole;
}