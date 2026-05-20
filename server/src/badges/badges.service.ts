import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Badge } from './entities/badge.entity';
import { UserBadge } from './entities/user-badge.entity';
import { UserStats } from '../users/entities/user-stats.entity';
import { BADGE_SEEDS } from './badge-rules';

@Injectable()
export class BadgesService implements OnModuleInit {
  constructor(
    @InjectRepository(Badge) private readonly badges: Repository<Badge>,
    @InjectRepository(UserBadge) private readonly userBadges: Repository<UserBadge>,
  ) {}

  async onModuleInit() {
    for (const seed of BADGE_SEEDS) {
      const existing = await this.badges.findOne({ where: { code: seed.code } });
      const row = {
        code: seed.code,
        name: seed.name,
        description: seed.description,
        icon: seed.icon,
        tier: seed.tier,
        sortOrder: seed.sortOrder,
      };
      if (!existing) await this.badges.save(this.badges.create(row));
      else await this.badges.save({ ...existing, ...row });
    }
  }

  async listAll() {
    return this.badges.find({ order: { sortOrder: 'ASC' } });
  }

  async listForUser(userId: number) {
    const owned = await this.userBadges.find({ where: { userId } });
    const ownedMap = new Map(owned.map((u) => [u.badgeCode, u.unlockedAt]));
    const all = await this.listAll();
    return all.map((b) => ({
      ...b,
      unlocked: ownedMap.has(b.code),
      unlockedAt: ownedMap.get(b.code) ?? null,
    }));
  }

  /** 评估并解锁所有满足条件但未解锁的徽章。返回本次新解锁的徽章列表。 */
  async evaluate(userId: number, stats: UserStats) {
    const owned = await this.userBadges.find({ where: { userId } });
    const ownedSet = new Set(owned.map((u) => u.badgeCode));
    const unlocked: Array<{ code: string; name: string; icon: string; tier: string }> = [];

    for (const seed of BADGE_SEEDS) {
      if (ownedSet.has(seed.code)) continue;
      if (seed.check(stats)) {
        await this.userBadges.save(
          this.userBadges.create({ userId, badgeCode: seed.code }),
        );
        unlocked.push({
          code: seed.code,
          name: seed.name,
          icon: seed.icon,
          tier: seed.tier,
        });
      }
    }
    return unlocked;
  }
}
