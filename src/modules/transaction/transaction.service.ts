import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { User } from '../users/entities/user.entity';
import { TaxService } from '../tax/tax.service';
import { StakingService } from '../staking/staking.service';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
import { TransactionType } from './enums/transaction-type.enum';
import { TransactionStatus } from './enums/transaction-status.enum';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private taxService: TaxService,
    private stakingService: StakingService,
  ) { }

  async createDeposit(
    userId: number,
    createDepositDto: CreateDepositDto,
  ): Promise<Transaction> {
    console.log('🔍 DEBUG userId received:', userId);

    const user = await this.userRepository.findOne({ where: { id: userId } });

    console.log('🔍 DEBUG user found:', user);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const taxRate = await this.taxService.getCurrentRate();
    const taxAmount = (createDepositDto.amount * taxRate) / 100;
    const finalAmount = createDepositDto.amount - taxAmount;

    const transaction = this.transactionRepository.create({
      user,
      type: TransactionType.DEPOSIT,
      amount: createDepositDto.amount,
      tax_rate_applied: taxRate,
      tax_amount: taxAmount,
      final_amount: finalAmount,
      status: TransactionStatus.PENDING,
    });

    return await this.transactionRepository.save(transaction);
  }

  async createWithdrawal(
    userId: number,
    createWithdrawalDto: CreateWithdrawalDto,
  ): Promise<Transaction> {
    // Check if there's an active staking round
    const activeRound = await this.stakingService.getActiveRound();
    if (activeRound) {
      throw new BadRequestException(
        'Withdrawals are locked during active staking round. Please wait until the round ends.',
      );
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user has sufficient balance
    if (user.balance < createWithdrawalDto.amount) {
      throw new BadRequestException('Insufficient balance');
    }

    const taxRate = await this.taxService.getCurrentRate();
    const taxAmount = (createWithdrawalDto.amount * taxRate) / 100;
    const finalAmount = createWithdrawalDto.amount - taxAmount;

    const transaction = this.transactionRepository.create({
      user,
      type: TransactionType.WITHDRAWAL,
      amount: createWithdrawalDto.amount,
      tax_rate_applied: taxRate,
      tax_amount: taxAmount,
      final_amount: finalAmount,
      status: TransactionStatus.PENDING,
    });

    return await this.transactionRepository.save(transaction);
  }

  async getUserTransactions(
    userId: number,
    query: QueryTransactionDto,
  ): Promise<{ data: Transaction[]; total: number; page: number; limit: number }> {
    const { type, status, page = 1, limit = 10 } = query;

    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.userId = :userId', { userId });

    if (type) {
      queryBuilder.andWhere('transaction.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('transaction.status = :status', { status });
    }

    const [data, total] = await queryBuilder
      .orderBy('transaction.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async getPendingTransactions(): Promise<Transaction[]> {
    return await this.transactionRepository.find({
      where: { status: TransactionStatus.PENDING },
      order: { created_at: 'ASC' },
      relations: ['user'],
    });
  }

  async approveTransaction(transactionId: number): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
      relations: ['user'],
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status !== TransactionStatus.PENDING) {
      throw new BadRequestException('Transaction is not pending');
    }

    // Update user balance
    const user = transaction.user;
    if (transaction.type === TransactionType.DEPOSIT) {
      user.balance = Number(user.balance) + Number(transaction.final_amount);
    } else if (transaction.type === TransactionType.WITHDRAWAL) {
      user.balance = Number(user.balance) - Number(transaction.amount);
    }

    await this.userRepository.save(user);

    // Update transaction status
    transaction.status = TransactionStatus.APPROVED;
    transaction.approved_at = new Date();

    return await this.transactionRepository.save(transaction);
  }

  async rejectTransaction(transactionId: number): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
      relations: ['user'],
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status !== TransactionStatus.PENDING) {
      throw new BadRequestException('Transaction is not pending');
    }

    transaction.status = TransactionStatus.REJECTED;
    transaction.approved_at = new Date();

    return await this.transactionRepository.save(transaction);
  }
}