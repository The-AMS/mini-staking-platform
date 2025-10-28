import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaxSetting } from './entities/tax-setting.entity';
import { UpdateTaxRateDto } from './dto/update-tax-rate.dto';

@Injectable()
export class TaxService {
  constructor(
    @InjectRepository(TaxSetting)
    private taxSettingRepository: Repository<TaxSetting>,
  ) { }

  // Using in TransactionService
  async getCurrentRate(): Promise<number> {
    const activeTaxSetting = await this.taxSettingRepository.findOne({
      where: { is_active: true },
    });

    if (!activeTaxSetting) {
      // Create default tax setting if none exists
      const defaultTaxSetting = this.taxSettingRepository.create({
        tax_rate: 2.0,
        is_active: true,
      });
      const saved = await this.taxSettingRepository.save(defaultTaxSetting);
      return saved.tax_rate;
    }

    return activeTaxSetting.tax_rate;
  }

  // Public
  async getCurrentTaxSetting(): Promise<TaxSetting> {
    const activeTaxSetting = await this.taxSettingRepository.findOne({
      where: { is_active: true },
    });

    if (!activeTaxSetting) {
      const defaultTaxSetting = this.taxSettingRepository.create({
        tax_rate: 2.0,
        is_active: true,
      });
      return await this.taxSettingRepository.save(defaultTaxSetting);
    }

    return activeTaxSetting;
  }

  // Admin
  async updateTaxRate(updateTaxRateDto: UpdateTaxRateDto): Promise<TaxSetting> {
    // Deactivate all existing tax settings
    await this.taxSettingRepository.update(
      { is_active: true },
      { is_active: false },
    );

    // Create new active tax setting
    const newTaxSetting = this.taxSettingRepository.create({
      tax_rate: updateTaxRateDto.tax_rate,
      is_active: true,
    });

    return await this.taxSettingRepository.save(newTaxSetting);
  }
}