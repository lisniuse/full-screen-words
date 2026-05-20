import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PracticeRecord } from './entities/practice-record.entity';
import { UserStats } from '../users/entities/user-stats.entity';
import { UsersService } from '../users/users.service';
import { BadgesService } from '../badges/badges.service';
import { WordsService } from '../words/words.service';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { comboMultiplier, computeLevel } from '../common/level.util';

const BASE_EXP_CORRECT = 10;
const BASE_EXP_WRONG = 1;

@Injectable()
export class PracticeService {
  constructor(
    @InjectRepository(PracticeRecord)
    private readonly records: Repository<PracticeRecord>,
    @InjectRepository(UserStats)
    private readonly stats: Repository<UserStats>,
    private readonly users: UsersService,
    private readonly badges: BadgesService,
    private readonly wordsService: WordsService,
  ) {}

  private normalize(text: string) {
    return (text || '')
      .toLowerCase()
      .replace(/[.,!?;:"']/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  async submit(userId: number, dto: SubmitAnswerDto) {
    const stats = await this.users.getOrCreateStats(userId);

    // 1) 从缓存按 index 取权威 expected，杜绝客户端伪造
    const cached = await this.wordsService.getCachedInfo(dto.word);
    const form = cached?.forms?.[dto.formType];
    const example = form?.examples?.[dto.exampleIndex];
    if (!example || typeof example.en !== 'string') {
      throw new BadRequestException('无效的题目');
    }
    const expected: string = example.en;

    const correct = this.normalize(dto.actual) === this.normalize(expected);

    // 2) 已经答对过的同一道题（同 word + formType + expected）不再给奖励
    const previousCorrect = correct
      ? await this.records.findOne({
          where: {
            userId,
            word: dto.word,
            formType: dto.formType,
            expected,
            correct: true,
          },
        })
      : null;
    const isRepeat = !!previousCorrect;

    const prevLevel = computeLevel(stats.totalExp).level;

    let expGained = 0;
    if (correct && !isRepeat) {
      stats.combo += 1;
      stats.maxCombo = Math.max(stats.maxCombo, stats.combo);
      expGained = Math.round(BASE_EXP_CORRECT * comboMultiplier(stats.combo));
      stats.correctAnswers += 1;
      stats.totalAnswers += 1;
      stats.totalExp += expGained;
      await this.stats.save(stats);

      await this.records.save(
        this.records.create({
          userId,
          word: dto.word,
          formType: dto.formType,
          expected,
          actual: dto.actual,
          correct: true,
          expGained,
          comboAtTime: stats.combo,
        }),
      );
    } else if (!correct) {
      // 答错：重置 combo，计入答题数，给极少 EXP 鼓励，留下流水
      stats.combo = 0;
      expGained = BASE_EXP_WRONG;
      stats.totalAnswers += 1;
      stats.totalExp += expGained;
      await this.stats.save(stats);

      await this.records.save(
        this.records.create({
          userId,
          word: dto.word,
          formType: dto.formType,
          expected,
          actual: dto.actual,
          correct: false,
          expGained,
          comboAtTime: stats.combo,
        }),
      );
    }
    // correct && isRepeat：什么都不做，不写流水、不变 stats

    const newLevelInfo = computeLevel(stats.totalExp);
    const leveledUp = newLevelInfo.level > prevLevel;
    const unlockedBadges =
      correct && !isRepeat ? await this.badges.evaluate(userId, stats) : [];

    return {
      correct,
      isRepeat,
      expGained,
      combo: stats.combo,
      leveledUp,
      level: newLevelInfo,
      unlockedBadges,
    };
  }

  /** 标记单词为已学习（首次打开 modal 时调用，重复调用幂等） */
  async markLearned(userId: number, word: string) {
    const stats = await this.users.getOrCreateStats(userId);
    const existing = await this.records.findOne({ where: { userId, word } });
    if (!existing) {
      // 写入一条 view 标记，保证下次调用幂等
      await this.records.save(
        this.records.create({
          userId,
          word,
          formType: '_view_',
          expected: '',
          actual: '',
          correct: false,
          expGained: 0,
          comboAtTime: stats.combo,
        }),
      );
      stats.wordsLearned += 1;
      await this.stats.save(stats);
      await this.badges.evaluate(userId, stats);
    }
    return { wordsLearned: stats.wordsLearned };
  }

  /**
   * 列出某用户某单词中所有已经答对过的例句索引，按 formType 分组。
   * 返回形如：{ base: [0, 1], past: [0] }
   */
  async getMasteredExamples(
    userId: number,
    word: string,
  ): Promise<Record<string, number[]>> {
    const cached = await this.wordsService.getCachedInfo(word);
    if (!cached?.forms) return {};

    const records = await this.records.find({
      where: { userId, word, correct: true },
    });

    const result: Record<string, number[]> = {};
    for (const rec of records) {
      if (rec.formType === '_view_') continue;
      const form = cached.forms?.[rec.formType];
      const examples: Array<{ en?: string }> | undefined = form?.examples;
      if (!Array.isArray(examples)) continue;
      const idx = examples.findIndex((e) => e?.en === rec.expected);
      if (idx < 0) continue;
      const list = result[rec.formType] ?? (result[rec.formType] = []);
      if (!list.includes(idx)) list.push(idx);
    }
    return result;
  }

  async listRecent(userId: number, limit = 20) {
    return this.records
      .createQueryBuilder('r')
      .where('r.userId = :userId AND r.formType != :marker', {
        userId,
        marker: '_view_',
      })
      .orderBy('r.createdAt', 'DESC')
      .take(Math.min(limit, 100))
      .getMany();
  }
}
