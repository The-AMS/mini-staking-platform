import { Column, PrimaryGeneratedColumn } from "typeorm";

export enum UserRole {
    USER = "user",
    ADMIN = "admin",
}

export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    email: string;

    @Column()
    password: string;

    @Column()
    role: UserRole;

    @Column()
    createdAt: Date;

    @Column()
    updatedAt: Date;

    // Balance

    // Profit
}
