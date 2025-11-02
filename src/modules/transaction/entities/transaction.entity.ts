import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TransactionType } from '../enums/transaction-type.enum';
import { TransactionStatus } from '../enums/transaction-status.enum';

@Entity('transactions')
export class Transaction {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { eager: true })
    user: User;

    @Column({
        type: 'enum',
        enum: TransactionType,
    })
    type: TransactionType;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column('decimal', { precision: 5, scale: 2 })
    tax_rate_applied: number;

    @Column('decimal', { precision: 10, scale: 2 })
    tax_amount: number;

    @Column('decimal', { precision: 10, scale: 2 })
    final_amount: number;

    @Column({
        type: 'enum',
        enum: TransactionStatus,
        default: TransactionStatus.PENDING,
    })
    status: TransactionStatus;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @Column({ type: 'timestamp', nullable: true })
    approved_at: Date;
}