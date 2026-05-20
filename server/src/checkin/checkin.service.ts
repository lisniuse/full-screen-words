import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { CheckIn } from './entities/check-in.entity';
import { UserStats } from '../users/entities/user-stats.entity';
import { UsersService } from '../users/users.service';
import { BadgesService } from '../badges/badges.service';
import { computeLevel } from '../common/level.util';

const CHECKIN_BASE_EXP = 20;

@Injectable()
export class CheckInService {
  private readonly tz: string;

  constructor(
    @InjectRepository(CheckIn) private readonly checkIns: Repository<CheckIn>,
    @InjectRepository(UserStats) private readonly stats: Repository<UserStats>,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly users: UsersService,
    private readonly badges: BadgesService,
    config: ConfigService,
  ) {
    this.tz = config.get<string>('DEFAULT_TZ') ?? 'Asia/Shanghai';
  }

  /** 返回 YYYY-MM-DD，使用配置的业务时区 */
  private todayInTz(): string {
    // en-CA locale 的默认日期格式正好是 ISO YYYY-MM-DD
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: this.tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  }

  private yesterdayOf(dateStr: string): string {
    // 直接对日期字符串做日历减法，与时区无关
    const [y, m, d] = dateStr.split('-').map((s) => parseInt(s, 10));
    const dt = new Date(Date.UTC(y, m - 1, d));
    dt.setUTCDate(dt.getUTCDate() - 1);
    const yy = dt.getUTCFullYear();
    const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(dt.getUTCDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
  }

  async status(userId: number) {
    const stats = await this.users.getOrCreateStats(userId);
    const today = this.todayInTz();
    return {
      today,
      checkedInToday: stats.lastCheckInDate === today,
      streakDays: stats.streakDays,
      longestStreak: stats.longestStreak,
      lastCheckInDate: stats.lastCheckInDate,
    };
  }

  async checkIn(userId: number) {
    const stats = await this.users.getOrCreateStats(userId);
    const t = this.todayInTz();
    if (stats.lastCheckInDate === t) {
      throw new BadRequestException('今天已打卡');
    }

    if (stats.lastCheckInDate && stats.lastCheckInDate === this.yesterdayOf(t)) {
      stats.streakDays += 1;
    } else {
      stats.streakDays = 1;
    }
    stats.longestStreak = Math.max(stats.longestStreak, stats.streakDays);
    stats.lastCheckInDate = t;

    // 连续打卡奖励：streak 越长奖励越多（上限 +100%）
    const bonus = 1 + Math.min(stats.streakDays * 0.05, 1);
    const expReward = Math.round(CHECKIN_BASE_EXP * bonus);
    const prevLevel = computeLevel(stats.totalExp).level;
    stats.totalExp += expReward;

    // stats 更新 + check_in 写入必须原子：失败时 SQLite 自动回滚
    // 若已存在 (userId, date) 的 unique 约束冲突，事务也会整体回滚
    await this.dataSource.transaction(async (manager) => {
      await manager.save(stats);
      await manager.save(
        manager.create(CheckIn, { userId, date: t, expReward }),
      );
    });

    const level = computeLevel(stats.totalExp);
    const leveledUp = level.level > prevLevel;
    const unlockedBadges = await this.badges.evaluate(userId, stats);

    return {
      date: t,
      streakDays: stats.streakDays,
      longestStreak: stats.longestStreak,
      expReward,
      level,
      leveledUp,
      unlockedBadges,
    };
  }

  async history(userId: number, days = 30) {
    return this.checkIns.find({
      where: { userId },
      order: { date: 'DESC' },
      take: Math.min(days, 365),
    });
  }
}
