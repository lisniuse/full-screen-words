/**
 * 等级换算公式：累计 EXP -> 等级 / 当前等级内进度
 *
 * 设计：升级所需 EXP 随等级线性递增
 *   level n -> n+1 所需 EXP = BASE + STEP * (n - 1)
 * 默认：BASE = 100, STEP = 50
 *   Lv1->2 需 100, Lv2->3 需 150, Lv3->4 需 200, ...
 */
const BASE = 100;
const STEP = 50;

export function expRequiredFor(level: number): number {
  return BASE + STEP * (level - 1);
}

export interface LevelInfo {
  level: number;
  totalExp: number;
  expInCurrentLevel: number;
  expForNextLevel: number;
  progress: number; // 0~1
}

export function computeLevel(totalExp: number): LevelInfo {
  let level = 1;
  let remaining = Math.max(0, totalExp | 0);
  while (true) {
    const need = expRequiredFor(level);
    if (remaining < need) {
      return {
        level,
        totalExp,
        expInCurrentLevel: remaining,
        expForNextLevel: need,
        progress: need === 0 ? 0 : remaining / need,
      };
    }
    remaining -= need;
    level += 1;
  }
}

/** combo 加成：每 5 连击 +10% EXP，最高 +100% */
export function comboMultiplier(combo: number): number {
  const tier = Math.floor(combo / 5);
  return 1 + Math.min(tier * 0.1, 1.0);
}
