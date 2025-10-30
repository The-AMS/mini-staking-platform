import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    UpdateDateColumn,
    CreateDateColumn,
} from 'typeorm';
import { RoundStatus } from '../../../common/enums/round-status.enum';

@Entity('staking_rounds')
export class StakingRound {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    month: string; // Format: "2025-03"

    @Column()
    year: number;

    @Column({ type: 'date' })
    start_date: Date;

    @Column({ type: 'date' })
    end_date: Date;

    @Column('decimal', { precision: 5, scale: 2, nullable: true, default: 2.0 })
    profit_rate: number;

    @Column({
        type: 'enum',
        enum: RoundStatus,
        default: RoundStatus.ACTIVE,
    })
    status: RoundStatus;

    @Column('decimal', { precision: 15, scale: 2, default: 0 })
    total_profit_distributed: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}