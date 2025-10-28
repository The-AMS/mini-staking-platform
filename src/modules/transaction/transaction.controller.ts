import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('transaction')
@UseGuards(JwtAuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) { }

  // User
  @Post('deposit')
  async createDeposit(@Request() req, @Body() createDepositDto: CreateDepositDto) {
    const transaction = await this.transactionService.createDeposit(
      req.user.id,
      createDepositDto,
    );
    return {
      message: 'Deposit request created successfully',
      transaction,
    };
  }

  // User
  @Post('withdrawal')
  async createWithdrawal(
    @Request() req,
    @Body() createWithdrawalDto: CreateWithdrawalDto,
  ) {
    const transaction = await this.transactionService.createWithdrawal(
      req.user.id,
      createWithdrawalDto,
    );
    return {
      message: 'Withdrawal request created successfully',
      transaction,
    };
  }

  // User
  @Get('my-transactions')
  async getMyTransactions(@Request() req, @Query() query: QueryTransactionDto) {
    return await this.transactionService.getUserTransactions(req.user.id, query);
  }

  // Admin
  @Get('pending')
  @UseGuards(RolesGuard)
  async getPendingTransactions() {
    const transactions = await this.transactionService.getPendingTransactions();
    return {
      total: transactions.length,
      transactions,
    };
  }

  // Admin
  @Patch(':id/approve')
  @UseGuards(RolesGuard)
  async approveTransaction(@Param('id') id: string) {
    const transaction = await this.transactionService.approveTransaction(+id);
    return {
      message: 'Transaction approved successfully',
      transaction,
    };
  }

  // Admin
  @Patch(':id/reject')
  @UseGuards(RolesGuard)
  async rejectTransaction(@Param('id') id: string) {
    const transaction = await this.transactionService.rejectTransaction(+id);
    return {
      message: 'Transaction rejected successfully',
      transaction,
    };
  }
}