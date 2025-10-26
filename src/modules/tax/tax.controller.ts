import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { TaxService } from './tax.service';
import { UpdateTaxRateDto } from './dto/update-tax-rate.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('tax')
export class TaxController {
  constructor(private readonly taxService: TaxService) { }

  @Get('current')
  async getCurrentTaxRate() {
    const taxSetting = await this.taxService.getCurrentTaxSetting();
    return {
      tax_rate: taxSetting.tax_rate,
      updated_at: taxSetting.updated_at,
    };
  }

  @Put('rate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateTaxRate(@Body() updateTaxRateDto: UpdateTaxRateDto) {
    const updatedTaxSetting = await this.taxService.updateTaxRate(
      updateTaxRateDto,
    );
    return {
      message: 'Tax rate updated successfully',
      tax_rate: updatedTaxSetting.tax_rate,
      updated_at: updatedTaxSetting.updated_at,
    };
  }
}