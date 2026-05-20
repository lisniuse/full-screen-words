import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { UserStats } from './entities/user-stats.entity';
import { UserBadge } from '../badges/entities/user-badge.entity';
import { computeLevel } from '../common/level.util';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(UserStats) private readonly stats: Repository<UserStats>,
    @InjectRepository(UserBadge) private readonly userBadges: Repository<UserBadge>,
  ) {}

  async findById(id: number) {
    return this.users.findOne({ where: { id } });
  }

  async getOrCreateStats(userId: number) {
    let stats = await this.stats.findOne({ where: { userId } });
    if (!stats) {
      stats = this.stats.create({ userId });
      await this.stats.save(stats);
    }
    return stats;
  }

  async getProfile(userId: number) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');
    const stats = await this.getOrCreateStats(userId);
    const badges = await this.userBadges.find({
      where: { userId },
      relations: ['badge'],
      order: { unlockedAt: 'ASC' },
    });
    return {
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        createdAt: user.createdAt,
      },
      level: computeLevel(stats.totalExp),
      stats: {
        totalExp: stats.totalExp,
        combo: stats.combo,
        maxCombo: stats.maxCombo,
        totalAnswers: stats.totalAnswers,
        correctAnswers: stats.correctAnswers,
        accuracy: stats.totalAnswers === 0 ? 0 : stats.correctAnswers / stats.totalAnswers,
        wordsLearned: stats.wordsLearned,
        streakDays: stats.streakDays,
        longestStreak: stats.longestStreak,
        lastCheckInDate: stats.lastCheckInDate,
      },
      badges: badges.map((ub) => ({
        code: ub.badgeCode,
        name: ub.badge?.name ?? ub.badgeCode,
        description: ub.badge?.description ?? '',
        icon: ub.badge?.icon ?? '🏅',
        tier: ub.badge?.tier ?? 'common',
        unlockedAt: ub.unlockedAt,
      })),
    };
  }
}
