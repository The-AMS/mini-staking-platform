import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { StakingService } from './staking.service';
import { SetProfitRateDto } from './dto/set-profit-rate.dto';
import { QueryStakingDto } from './dto/query-staking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('staking')
export class StakingController {
  constructor(private readonly stakingService: StakingService) { }

  @Get('current-round')
  async getCurrentRound() {
    const round = await this.stakingService.getCurrentRound();
    return {
      round,
      message: 'Current active staking round',
    };
  }

  @Get('rounds')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAllRounds(@Query() query: QueryStakingDto) {
    return await this.stakingService.getAllRounds(query.page, query.limit);
  }

  @Get('rounds/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getRoundDetails(@Param('id') id: string) {
    return await this.stakingService.getRoundProfits(+id);
  }

  @Post('rounds/:id/set-rate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async setProfitRate(
    @Param('id') id: string,
    @Body() setProfitRateDto: SetProfitRateDto,
  ) {
    const round = await this.stakingService.setProfitRateAndDistribute(
      +id,
      setProfitRateDto,
    );
    return {
      message: 'Profit rate set and profits distributed successfully',
      round,
    };
  }

  @Get('my-profits')
  @UseGuards(JwtAuthGuard)
  async getMyProfits(@Request() req, @Query() query: QueryStakingDto) {
    return await this.stakingService.getUserProfits(
      req.user.id,
      query.page,
      query.limit,
    );
  }
}