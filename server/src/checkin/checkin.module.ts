import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CheckIn } from './entities/check-in.entity';
import { UserStats } from '../users/entities/user-stats.entity';
import { CheckInService } from './checkin.service';
import { CheckInController } from './checkin.controller';
import { UsersModule } from '../users/users.module';
import { BadgesModule } from '../badges/badges.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CheckIn, UserStats]),
    UsersModule,
    BadgesModule,
  ],
  providers: [CheckInService],
  controllers: [CheckInController],
})
export class CheckInModule {}
