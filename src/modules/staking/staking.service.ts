import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StakingRound } from './entities/staking-round.entity';
import { StakingProfit } from './entities/staking-profit.entity';
import { User } from '../users/entities/user.entity';
import { BalanceSnapshotService } from '../balance-snapshot/balance-snapshot.service';
import { SetProfitRateDto } from './dto/set-profit-rate.dto';
import { RoundStatus } from './enums/round-status.enum';

@Injectable()
export class StakingService {
  private readonly logger = new Logger(StakingService.name);

  constructor(
    @InjectRepository(StakingRound)
    private stakingRoundRepository: Repository<StakingRound>,
    @InjectRepository(StakingProfit)
    private stakingProfitRepository: Repository<StakingProfit>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private balanceSnapshotService: BalanceSnapshotService,
  ) { }

  async createNewRound(): Promise<StakingRound> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const monthKey = `${year}-${month}`;

    // Check if round already exists
    const existing = await this.stakingRoundRepository.findOne({
      where: { month: monthKey },
    });
    if (existing) {
      this.logger.warn(`Round ${monthKey} already exists`);
      return existing;
    }

    const startDate = new Date(year, now.getMonth(), 1);
    const endDate = new Date(year, now.getMonth() + 1, 0);

    const round = this.stakingRoundRepository.create({
      month: monthKey,
      year,
      start_date: startDate,
      end_date: endDate,
      status: RoundStatus.ACTIVE,
      profit_rate: 2.0, // Default rate
    });

    const saved = await this.stakingRoundRepository.save(round);
    this.logger.log(`Created new staking round: ${monthKey}`);
    return saved;
  }

  async completeCurrentRound(): Promise<void> {
    const activeRound = await this.stakingRoundRepository.findOne({
      where: { status: RoundStatus.ACTIVE },
    });

    if (activeRound) {
      activeRound.status = RoundStatus.COMPLETED;
      await this.stakingRoundRepository.save(activeRound);
      this.logger.log(`Completed round: ${activeRound.month}`);
    }
  }

  async getActiveRound(): Promise<StakingRound | null> {
    return await this.stakingRoundRepository.findOne({
      where: { status: RoundStatus.ACTIVE },
    });
  }

  async getCurrentRound(): Promise<StakingRound> {
    const activeRound = await this.getActiveRound();
    if (!activeRound) {
      throw new NotFoundException('No active staking round');
    }
    return activeRound;
  }

  async getAllRounds(page: number = 1, limit: number = 10) {
    const [data, total] = await this.stakingRoundRepository.findAndCount({
      order: { start_date: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async getRoundById(id: number): Promise<StakingRound> {
    const round = await this.stakingRoundRepository.findOne({
      where: { id },
    });

    if (!round) {
      throw new NotFoundException('Staking round not found');
    }

    return round;
  }

  async setProfitRateAndDistribute(
    roundId: number,
    setProfitRateDto: SetProfitRateDto,
  ): Promise<StakingRound> {
    const round = await this.getRoundById(roundId);

    if (round.status !== RoundStatus.COMPLETED) {
      throw new BadRequestException(
        'Can only set profit rate for completed rounds',
      );
    }

    if (round.status as RoundStatus === RoundStatus.PAID) {
      throw new BadRequestException('Profits already distributed for this round');
    }

    // Update profit rate
    round.profit_rate = setProfitRateDto.profit_rate;
    await this.stakingRoundRepository.save(round);

    // Calculate and distribute profits
    await this.calculateAndDistributeProfits(round);

    // Mark as paid
    round.status = RoundStatus.PAID;
    return await this.stakingRoundRepository.save(round);
  }

  private async calculateAndDistributeProfits(
    round: StakingRound,
  ): Promise<void> {
    this.logger.log(`Calculating profits for round: ${round.month}`);

    const snapshots = await this.balanceSnapshotService.getSnapshotsForRound(
      round.start_date,
      round.end_date,
    );

    // Group snapshots by user
    const userSnapshots = new Map<number, number[]>();
    snapshots.forEach((snapshot) => {
      const userId = snapshot.user.id;
      if (!userSnapshots.has(userId)) {
        userSnapshots.set(userId, []);
      }
      const userBalances = userSnapshots.get(userId);
      if (userBalances) {
        userBalances.push(Number(snapshot.balance));
      }
    });

    let totalProfitDistributed = 0;

    // Calculate profit for each user
    for (const [userId, balances] of userSnapshots.entries()) {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) continue;

      const daysActive = balances.length;
      const sumBalances = balances.reduce((sum, bal) => sum + bal, 0);
      const averageBalance = sumBalances / daysActive;
      const profitAmount = (averageBalance * round.profit_rate) / 100;

      // Credit profit to user balance
      user.balance = Number(user.balance) + profitAmount;
      await this.userRepository.save(user);

      // Save profit record
      const stakingProfit = this.stakingProfitRepository.create({
        user,
        staking_round: round,
        average_balance: averageBalance,
        profit_amount: profitAmount,
        days_active: daysActive,
      });
      await this.stakingProfitRepository.save(stakingProfit);

      totalProfitDistributed += profitAmount;
    }

    // Update round total
    round.total_profit_distributed = totalProfitDistributed;
    await this.stakingRoundRepository.save(round);

    this.logger.log(
      `Distributed ${totalProfitDistributed} in profits for round ${round.month}`,
    );
  }

  async getUserProfits(userId: number, page: number = 1, limit: number = 10) {
    const [data, total] = await this.stakingProfitRepository.findAndCount({
      where: { user: { id: userId } },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async getRoundProfits(roundId: number) {
    const round = await this.getRoundById(roundId);

    const profits = await this.stakingProfitRepository.find({
      where: { staking_round: { id: roundId } },
      order: { profit_amount: 'DESC' },
    });

    return {
      round,
      profits,
      total_users: profits.length,
    };
  }
}