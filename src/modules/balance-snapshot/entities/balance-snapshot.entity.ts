import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('balance_snapshots')
@Index(['user', 'snapshot_date'])
export class BalanceSnapshot {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User)
    user: User;

    @Column('decimal', { precision: 10, scale: 2 })
    balance: number;

    @Column({ type: 'date' })
    snapshot_date: Date;

    @CreateDateColumn()
    created_at: Date;
}