import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';

import { CheckInService } from './checkin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../common/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('checkin')
export class CheckInController {
  constructor(private readonly checkin: CheckInService) {}

  @Get('status')
  status(@CurrentUser() user: CurrentUserPayload) {
    return this.checkin.status(user.id);
  }

  @Post()
  doCheckIn(@CurrentUser() user: CurrentUserPayload) {
    return this.checkin.checkIn(user.id);
  }

  @Get('history')
  history(
    @CurrentUser() user: CurrentUserPayload,
    @Query('days') days?: string,
  ) {
    const n = days ? Math.min(parseInt(days, 10) || 30, 365) : 30;
    return this.checkin.history(user.id, n);
  }
}
