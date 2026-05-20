import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Badge } from './entities/badge.entity';
import { UserBadge } from './entities/user-badge.entity';
import { BadgesService } from './badges.service';
import { BadgesController } from './badges.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Badge, UserBadge])],
  providers: [BadgesService],
  controllers: [BadgesController],
  exports: [BadgesService, TypeOrmModule],
})
export class BadgesModule {}
