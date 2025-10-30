import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BalanceSnapshotService } from './balance-snapshot.service';
import { BalanceSnapshotCron } from './balance-snapshot.cron';
import { BalanceSnapshot } from './entities/balance-snapshot.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BalanceSnapshot, User])],
  providers: [BalanceSnapshotService, BalanceSnapshotCron],
  exports: [BalanceSnapshotService],
})
export class BalanceSnapshotModule { }