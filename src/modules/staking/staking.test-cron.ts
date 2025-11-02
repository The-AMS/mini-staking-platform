
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StakingRound } from './entities/staking-round.entity';
import { RoundStatus } from './enums/round-status.enum';

@Injectable()
export class StakingTestCron {
    private readonly logger = new Logger(StakingTestCron.name);
    private roundCounter = 1;
    private currentRoundId: number | null = null;

    constructor(
        @InjectRepository(StakingRound)
        private stakingRoundRepository: Repository<StakingRound>,
    ) { }

    // TEST CRON: Create new round every 1 minute
    @Cron('*/1 * * * *')
    async handleTestRoundCreation() {
        this.logger.log(`TEST: Creating round ${this.roundCounter}`);

        try {
            // Complete previous round if exists
            if (this.currentRoundId) {
                const previousRound = await this.stakingRoundRepository.findOne({
                    where: { id: this.currentRoundId },
                });

                if (previousRound && previousRound.status === RoundStatus.ACTIVE) {
                    previousRound.status = RoundStatus.COMPLETED;
                    await this.stakingRoundRepository.save(previousRound);
                    this.logger.log(`TEST: Completed round ${previousRound.month}`);
                }
            }

            // Create new round
            const monthKey = `TEST-${String(this.roundCounter).padStart(3, '0')}`;

            // Check if round already exists
            const existing = await this.stakingRoundRepository.findOne({
                where: { month: monthKey },
            });

            if (existing) {
                this.logger.warn(`TEST: Round ${monthKey} already exists`);
                this.currentRoundId = existing.id;
                this.roundCounter++;
                return;
            }

            // Create fake date range (each round is conceptually 1 "month")
            const now = new Date();
            const fakeStartDate = new Date('2025-01-01');
            fakeStartDate.setDate(fakeStartDate.getDate() + (this.roundCounter - 1) * 30);

            const fakeEndDate = new Date(fakeStartDate);
            fakeEndDate.setDate(fakeEndDate.getDate() + 29); // 30 days total

            const round = this.stakingRoundRepository.create({
                month: monthKey,
                year: 2025,
                start_date: fakeStartDate,
                end_date: fakeEndDate,
                status: RoundStatus.ACTIVE,
                profit_rate: 2.0,
            });

            const saved = await this.stakingRoundRepository.save(round);
            this.currentRoundId = saved.id;

            this.logger.log(
                `TEST: Created round ${monthKey} (ID: ${saved.id}) - Duration: 1 minute`,
            );

            this.roundCounter++;
        } catch (error) {
            this.logger.error(`TEST: Round creation failed`, error);
        }
    }

    // Reset counter when needed
    resetCounter() {
        this.roundCounter = 1;
        this.currentRoundId = null;
        this.logger.log('TEST: Round counter reset to 1');
    }
}