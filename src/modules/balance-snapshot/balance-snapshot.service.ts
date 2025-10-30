import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BalanceSnapshot } from './entities/balance-snapshot.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class BalanceSnapshotService {
  private readonly logger = new Logger(BalanceSnapshotService.name);

  constructor(
    @InjectRepository(BalanceSnapshot)
    private balanceSnapshotRepository: Repository<BalanceSnapshot>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }

  async createDailySnapshot(): Promise<void> {
    this.logger.log('Starting daily balance snapshot...');

    const users = await this.userRepository.find();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const snapshots = users.map((user) =>
      this.balanceSnapshotRepository.create({
        user,
        balance: user.balance || 0,
        snapshot_date: today,
      }),
    );

    await this.balanceSnapshotRepository.save(snapshots);

    this.logger.log(
      `Daily snapshot completed: ${snapshots.length} users recorded`,
    );
  }

  async getMonthlySnapshots(
    userId: number,
    month: string,
  ): Promise<BalanceSnapshot[]> {
    const [year, monthNum] = month.split('-');
    const startDate = new Date(`${year}-${monthNum}-01`);
    const endDate = new Date(
      parseInt(year),
      parseInt(monthNum),
      0,
    ); // Last day of month

    return await this.balanceSnapshotRepository.find({
      where: {
        user: { id: userId },
      },
      order: { snapshot_date: 'ASC' },
    });
  }

  async getSnapshotsForRound(
    startDate: Date,
    endDate: Date,
  ): Promise<BalanceSnapshot[]> {
    return await this.balanceSnapshotRepository
      .createQueryBuilder('snapshot')
      .leftJoinAndSelect('snapshot.user', 'user')
      .where('snapshot.snapshot_date >= :startDate', { startDate })
      .andWhere('snapshot.snapshot_date <= :endDate', { endDate })
      .orderBy('snapshot.snapshot_date', 'ASC')
      .getMany();
  }
}