import { Module, Logger } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

import { buildPinoOptions } from './common/logger.config';
import { AllExceptionsFilter } from './common/all-exceptions.filter';
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
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: buildPinoOptions,
    }),
    ThrottlerModule.forRoot([
      // 全局默认：每分钟最多 120 次请求
      { name: 'default', ttl: 60_000, limit: 120 },
    ]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const log = new Logger('Database');
        const defaultPath = join(homedir(), '.full-screen-words', 'data.sqlite');
        const dbPath = resolve(config.get<string>('DATABASE_PATH') ?? defaultPath);

        // 确保父目录存在（首次启动 ~/.full-screen-words/ 不存在）
        mkdirSync(dirname(dbPath), { recursive: true });

        // 一次性迁移：把仓库内旧位置 server/data.sqlite 搬到用户 home 目录
        const legacy = resolve(process.cwd(), 'data.sqlite');
        if (!existsSync(dbPath) && existsSync(legacy) && legacy !== dbPath) {
          copyFileSync(legacy, dbPath);
          log.log(`migrated legacy DB ${legacy} -> ${dbPath}`);
        }

        log.log(`using sqlite at ${dbPath}`);
        return {
          type: 'better-sqlite3',
          database: dbPath,
          entities: [User, UserStats, Word, PracticeRecord, CheckIn, Badge, UserBadge],
          // synchronize 仅在非 production 启用：dev/test 自动建表方便迭代；
          // 生产环境必须通过 TypeORM 迁移管理 schema 变更，避免 ALTER/DROP 误操作。
          synchronize: (config.get<string>('NODE_ENV') ?? 'development') !== 'production',
        };
      },
    }),
    AuthModule,
    UsersModule,
    WordsModule,
    PracticeModule,
    CheckInModule,
    BadgesModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
