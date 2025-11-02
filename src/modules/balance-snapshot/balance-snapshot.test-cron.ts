import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BalanceSnapshot } from './entities/balance-snapshot.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class BalanceSnapshotTestCron {
    private readonly logger = new Logger(BalanceSnapshotTestCron.name);
    private dayCounter = 1;

    constructor(
        @InjectRepository(BalanceSnapshot)
        private balanceSnapshotRepository: Repository<BalanceSnapshot>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    // TEST CRON: Runs every 2 minutes
    @Cron('*/2 * * * *')
    async handleTestSnapshot() {
        this.logger.log(`TEST: Creating snapshot for Day ${this.dayCounter}`);

        try {
            const users = await this.userRepository.find();

            // Create fake date for this snapshot (incrementing days)
            const fakeDate = new Date('2025-01-01');
            fakeDate.setDate(fakeDate.getDate() + this.dayCounter - 1);
            fakeDate.setHours(0, 0, 0, 0);

            const snapshots = users.map((user) =>
                this.balanceSnapshotRepository.create({
                    user,
                    balance: user.balance || 0,
                    snapshot_date: fakeDate,
                }),
            );

            await this.balanceSnapshotRepository.save(snapshots);

            this.logger.log(
                `TEST: Snapshot Day ${this.dayCounter} completed - ${snapshots.length} users recorded`,
            );

            this.dayCounter++;
        } catch (error) {
            this.logger.error(`TEST: Snapshot failed on Day ${this.dayCounter}`, error);
        }
    }

    // Reset counter when needed (call this manually or via endpoint)
    resetCounter() {
        this.dayCounter = 1;
        this.logger.log('TEST: Day counter reset to 1');
    }
}