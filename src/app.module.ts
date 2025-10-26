import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { DbModule } from './config/db/db.module';
import { AuthModule } from './modules/auth/auth.module';
import { TaxModule } from './modules/tax/tax.module';
import { TransactionModule } from './modules/transaction/transaction.module';

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
  ],
})
export class AppModule { }
