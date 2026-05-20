/**
 * 内置徽章定义与解锁规则
 */
import type { UserStats } from '../users/entities/user-stats.entity';

export interface BadgeSeed {
  code: string;
  name: string;
  description: string;
  icon: string;
  tier: 'common' | 'rare' | 'epic' | 'legendary';
  sortOrder: number;
  check: (s: UserStats) => boolean;
}

export const BADGE_SEEDS: BadgeSeed[] = [
  {
    code: 'first_word',
    name: '初识',
    description: '首次查询一个单词',
    icon: '🌱',
    tier: 'common',
    sortOrder: 10,
    check: (s) => s.wordsLearned >= 1,
  },
  {
    code: 'words_10',
    name: '词汇启蒙',
    description: '查询过 10 个单词',
    icon: '📖',
    tier: 'common',
    sortOrder: 20,
    check: (s) => s.wordsLearned >= 10,
  },
  {
    code: 'words_50',
    name: '词海初游',
    description: '查询过 50 个单词',
    icon: '📚',
    tier: 'rare',
    sortOrder: 30,
    check: (s) => s.wordsLearned >= 50,
  },
  {
    code: 'words_100',
    name: '词汇达人',
    description: '查询过 100 个单词',
    icon: '🎓',
    tier: 'epic',
    sortOrder: 40,
    check: (s) => s.wordsLearned >= 100,
  },
  {
    code: 'combo_5',
    name: '小试身手',
    description: '连续答对 5 题',
    icon: '🔥',
    tier: 'common',
    sortOrder: 110,
    check: (s) => s.maxCombo >= 5,
  },
  {
    code: 'combo_20',
    name: '一气呵成',
    description: '连续答对 20 题',
    icon: '⚡',
    tier: 'rare',
    sortOrder: 120,
    check: (s) => s.maxCombo >= 20,
  },
  {
    code: 'combo_50',
    name: '神之手感',
    description: '连续答对 50 题',
    icon: '🌟',
    tier: 'legendary',
    sortOrder: 130,
    check: (s) => s.maxCombo >= 50,
  },
  {
    code: 'streak_3',
    name: '坚持就是胜利',
    description: '连续打卡 3 天',
    icon: '📅',
    tier: 'common',
    sortOrder: 210,
    check: (s) => s.longestStreak >= 3,
  },
  {
    code: 'streak_7',
    name: '七日不辍',
    description: '连续打卡 7 天',
    icon: '🗓️',
    tier: 'rare',
    sortOrder: 220,
    check: (s) => s.longestStreak >= 7,
  },
  {
    code: 'streak_30',
    name: '月度大师',
    description: '连续打卡 30 天',
    icon: '👑',
    tier: 'legendary',
    sortOrder: 230,
    check: (s) => s.longestStreak >= 30,
  },
  {
    code: 'answers_100',
    name: '勤学不倦',
    description: '累计回答 100 题',
    icon: '✍️',
    tier: 'rare',
    sortOrder: 310,
    check: (s) => s.totalAnswers >= 100,
  },
  {
    code: 'accuracy_90',
    name: '稳如磐石',
    description: '答题超过 50 题且正确率 ≥ 90%',
    icon: '🎯',
    tier: 'epic',
    sortOrder: 320,
    check: (s) => s.totalAnswers >= 50 && s.correctAnswers / s.totalAnswers >= 0.9,
  },
];
