import { Controller, Get, UseGuards } from '@nestjs/common';

import { BadgesService } from './badges.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../common/current-user.decorator';

@Controller('badges')
export class BadgesController {
  constructor(private readonly badges: BadgesService) {}

  @Get()
  list() {
    return this.badges.listAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  mine(@CurrentUser() user: CurrentUserPayload) {
    return this.badges.listForUser(user.id);
  }
}
