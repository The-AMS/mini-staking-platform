import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BalanceSnapshotService } from './balance-snapshot.service';
import { BalanceSnapshotTestCron } from './balance-snapshot.test-cron';
import { BalanceSnapshot } from './entities/balance-snapshot.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BalanceSnapshot, User])],
  providers: [BalanceSnapshotService, BalanceSnapshotTestCron],
  exports: [BalanceSnapshotService],
})
export class BalanceSnapshotModule { }