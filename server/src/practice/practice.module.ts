import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PracticeRecord } from './entities/practice-record.entity';
import { UserStats } from '../users/entities/user-stats.entity';
import { PracticeService } from './practice.service';
import { PracticeController } from './practice.controller';
import { UsersModule } from '../users/users.module';
import { BadgesModule } from '../badges/badges.module';
import { WordsModule } from '../words/words.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PracticeRecord, UserStats]),
    UsersModule,
    BadgesModule,
    WordsModule,
  ],
  providers: [PracticeService],
  controllers: [PracticeController],
})
export class PracticeModule {}
