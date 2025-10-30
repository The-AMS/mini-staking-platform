import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StakingService } from './staking.service';
import { StakingController } from './staking.controller';
import { StakingCron } from './staking.cron';
import { StakingRound } from './entities/staking-round.entity';
import { StakingProfit } from './entities/staking-profit.entity';
import { User } from '../users/entities/user.entity';
import { BalanceSnapshotModule } from '../balance-snapshot/balance-snapshot.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StakingRound, StakingProfit, User]),
    BalanceSnapshotModule,
  ],
  controllers: [StakingController],
  providers: [StakingService, StakingCron],
  exports: [StakingService],
})
export class StakingModule { }