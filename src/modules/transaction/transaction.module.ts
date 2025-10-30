import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { Transaction } from './entities/transaction.entity';
import { User } from '../users/entities/user.entity';
import { TaxModule } from '../tax/tax.module';
import { StakingModule } from '../staking/staking.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, User]),
    TaxModule,
    StakingModule
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionModule { }