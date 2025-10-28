import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export enum UserRole {
    USER = 'user',
    ADMIN = 'admin',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    username: string;

    @Column()
    password: string;

    @Column({ unique: true })
    email: string;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    balance: number;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER,
    })
    role: UserRole;

}