import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { DbModule } from './config/db/db.module';
import { AuthModule } from './modules/auth/auth.module';
import { TaxModule } from './modules/tax/tax.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { AdminModule } from './modules/admin/admin.module';
import { StakingModule } from './modules/staking/staking.module';
import { BalanceSnapshotModule } from './modules/balance-snapshot/balance-snapshot.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DbModule,
    UsersModule,
    AuthModule,
    TaxModule,
    TransactionModule,
    AdminModule,
    StakingModule,
    BalanceSnapshotModule,
    ScheduleModule.forRoot(),
  ],
})
export class AppModule { }
