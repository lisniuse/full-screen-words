import { create } from 'zustand';
import { api } from '@/api';
import { getToken, setToken, setUnauthorizedHandler } from '@/api/client';
import { useLearnedStore } from '@/store/learned';
import type { ProfileResponse } from '@/api/types';

interface AuthState {
  token: string | null;
  profile: ProfileResponse | null;
  loading: boolean;
  hydrated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, nickname?: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
  init: () => Promise<void>;
  applyLevelInfo: (next: Partial<ProfileResponse>) => void;
}

// 单飞：并发 refresh() 共享同一请求，避免多次拉取导致 profile 闪烁
let inflightRefresh: Promise<void> | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  token: getToken(),
  profile: null,
  loading: false,
  hydrated: false,

  async login(username, password) {
    set({ loading: true });
    try {
      const res = await api.auth.login(username, password);
      setToken(res.token);
      set({ token: res.token });
      await get().refresh();
    } finally {
      set({ loading: false });
    }
  },

  async register(username, password, nickname) {
    set({ loading: true });
    try {
      const res = await api.auth.register(username, password, nickname);
      setToken(res.token);
      set({ token: res.token });
      await get().refresh();
    } finally {
      set({ loading: false });
    }
  },

  logout() {
    setToken(null);
    useLearnedStore.getState().clear();
    set({ token: null, profile: null });
  },

  async refresh() {
    if (inflightRefresh) return inflightRefresh;
    if (!getToken()) {
      set({ profile: null });
      return;
    }
    inflightRefresh = (async () => {
      try {
        const profile = await api.auth.me();
        set({ profile });
      } catch {
        set({ profile: null });
      } finally {
        inflightRefresh = null;
      }
    })();
    return inflightRefresh;
  },

  async init() {
    setUnauthorizedHandler(() => {
      set({ token: null, profile: null });
    });
    await get().refresh();
    set({ hydrated: true });
  },

  applyLevelInfo(next) {
    const cur = get().profile;
    if (!cur) return;
    set({ profile: { ...cur, ...next } });
  },
}));
