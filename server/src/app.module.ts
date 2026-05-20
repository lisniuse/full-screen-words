import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { resolve } from 'path';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WordsModule } from './words/words.module';
import { PracticeModule } from './practice/practice.module';
import { CheckInModule } from './checkin/checkin.module';
import { BadgesModule } from './badges/badges.module';

import { User } from './users/entities/user.entity';
import { UserStats } from './users/entities/user-stats.entity';
import { Word } from './words/entities/word.entity';
import { PracticeRecord } from './practice/entities/practice-record.entity';
import { CheckIn } from './checkin/entities/check-in.entity';
import { Badge } from './badges/entities/badge.entity';
import { UserBadge } from './badges/entities/user-badge.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      // 全局默认：每分钟最多 120 次请求
      { name: 'default', ttl: 60_000, limit: 120 },
    ]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'better-sqlite3',
        database: resolve(config.get<string>('DATABASE_PATH') ?? './data.sqlite'),
        entities: [User, UserStats, Word, PracticeRecord, CheckIn, Badge, UserBadge],
        // synchronize 仅在非 production 启用：dev/test 自动建表方便迭代；
        // 生产环境必须通过 TypeORM 迁移管理 schema 变更，避免 ALTER/DROP 误操作。
        synchronize: (config.get<string>('NODE_ENV') ?? 'development') !== 'production',
      }),
    }),
    AuthModule,
    UsersModule,
    WordsModule,
    PracticeModule,
    CheckInModule,
    BadgesModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
