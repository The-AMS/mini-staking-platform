import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BalanceSnapshotService } from './balance-snapshot.service';

@Injectable()
export class BalanceSnapshotCron {
    private readonly logger = new Logger(BalanceSnapshotCron.name);

    constructor(
        private readonly balanceSnapshotService: BalanceSnapshotService,
    ) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleDailySnapshot() {
        this.logger.log('Cron job started: Daily balance snapshot');
        try {
            await this.balanceSnapshotService.createDailySnapshot();
            this.logger.log('Cron job completed: Daily balance snapshot');
        } catch (error) {
            this.logger.error('Cron job failed: Daily balance snapshot', error);
        }
    }
}