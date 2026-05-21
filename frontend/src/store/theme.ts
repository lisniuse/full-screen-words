import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark';

const KEY = 'fsw-theme';

function detectInitial(): ThemeMode {
  const stored = localStorage.getItem(KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

function applyBodyClass(mode: ThemeMode) {
  if (typeof document === 'undefined') return;
  document.body.classList.toggle('theme-dark', mode === 'dark');
}

interface ThemeState {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  toggle: () => void;
}

const initial = detectInitial();
applyBodyClass(initial);

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: initial,
  setMode(m) {
    localStorage.setItem(KEY, m);
    applyBodyClass(m);
    set({ mode: m });
  },
  toggle() {
    get().setMode(get().mode === 'dark' ? 'light' : 'dark');
  },
}));
