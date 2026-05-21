import { create } from 'zustand';

/**
 * 已学单词集合（用户在 practice_records 里出现过的所有 word）。
 *
 * - 登录后由 WordsPage 一次性从后端拉取
 * - WordModal 在 markLearned 成功后调用 add()
 * - logout 时 clear()，避免跨账号污染
 */
interface LearnedState {
  set: Set<string>;
  hydrated: boolean;
  has: (word: string) => boolean;
  add: (word: string) => void;
  setMany: (words: string[]) => void;
  clear: () => void;
}

export const useLearnedStore = create<LearnedState>((set, get) => ({
  set: new Set<string>(),
  hydrated: false,
  has(word) {
    return get().set.has(word);
  },
  add(word) {
    const cur = get().set;
    if (cur.has(word)) return;
    const next = new Set(cur);
    next.add(word);
    set({ set: next });
  },
  setMany(words) {
    set({ set: new Set(words), hydrated: true });
  },
  clear() {
    set({ set: new Set(), hydrated: false });
  },
}));
