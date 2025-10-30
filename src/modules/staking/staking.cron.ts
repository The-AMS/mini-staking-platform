import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { StakingService } from './staking.service';

@Injectable()
export class StakingCron {
    private readonly logger = new Logger(StakingCron.name);

    constructor(private readonly stakingService: StakingService) { }

    // Runs at 00:01 on the 1st day of every month
    @Cron('1 0 1 * *')
    async handleMonthStart() {
        this.logger.log('Cron job started: Create new staking round');
        try {
            await this.stakingService.createNewRound();
            this.logger.log('Cron job completed: New staking round created');
        } catch (error) {
            this.logger.error('Cron job failed: Create new staking round', error);
        }
    }

    // Runs at 23:59 on the last day of every month
    @Cron('59 23 28-31 * *')
    async handleMonthEnd() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        // Only complete round if tomorrow is the 1st
        if (tomorrow.getDate() === 1) {
            this.logger.log('Cron job started: Complete staking round');
            try {
                await this.stakingService.completeCurrentRound();
                this.logger.log('Cron job completed: Staking round completed');
            } catch (error) {
                this.logger.error('Cron job failed: Complete staking round', error);
            }
        }
    }
}