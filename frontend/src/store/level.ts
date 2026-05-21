import { create } from 'zustand';

const KEY = 'fsw-level';
const DEFAULT_LEVEL = 'cet4';

export interface LevelMeta {
  id: string;
  label: string;
  count: number;
}

interface LevelState {
  /** 当前选中的词库 id（如 cet4 / cet6 / kaoyan...） */
  level: string;
  /** 后端返回的全部可用词库元信息 */
  levels: LevelMeta[];
  /** 后端是否已经返回过 levels */
  hydrated: boolean;
  setLevel: (id: string) => void;
  setLevels: (list: LevelMeta[]) => void;
}

function readInitial(): string {
  if (typeof localStorage === 'undefined') return DEFAULT_LEVEL;
  const v = localStorage.getItem(KEY);
  return v && v.length > 0 ? v : DEFAULT_LEVEL;
}

export const useLevelStore = create<LevelState>((set) => ({
  level: readInitial(),
  levels: [],
  hydrated: false,
  setLevel(id) {
    localStorage.setItem(KEY, id);
    set({ level: id });
  },
  setLevels(list) {
    set({ levels: list, hydrated: true });
  },
}));
