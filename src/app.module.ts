import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { DbModule } from './config/db/db.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes env variables available globally
      envFilePath: '.env',
    }),
    DbModule,
    UserModule,
  ],
})
export class AppModule { }
