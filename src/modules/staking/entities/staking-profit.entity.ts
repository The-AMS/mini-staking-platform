import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { StakingRound } from './staking-round.entity';

@Entity('staking_profits')
export class StakingProfit {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { eager: true })
    user: User;

    @ManyToOne(() => StakingRound, { eager: true })
    staking_round: StakingRound;

    @Column('decimal', { precision: 10, scale: 2 })
    average_balance: number;

    @Column('decimal', { precision: 10, scale: 2 })
    profit_amount: number;

    @Column()
    days_active: number;

    @CreateDateColumn()
    created_at: Date;
}