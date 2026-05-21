import client from './client';
import type {
  AuthResult,
  BadgeListItem,
  CheckInResult,
  CheckInStatus,
  ProfileResponse,
  SubmitAnswerResult,
  WordInfo,
} from './types';

export const api = {
  auth: {
    register: (username: string, password: string, nickname?: string) =>
      client
        .post<AuthResult>('/auth/register', { username, password, nickname })
        .then((r) => r.data),
    login: (username: string, password: string) =>
      client.post<AuthResult>('/auth/login', { username, password }).then((r) => r.data),
    me: () => client.get<ProfileResponse>('/auth/me').then((r) => r.data),
    changePassword: (oldPassword: string, newPassword: string) =>
      client
        .post<{ ok: true }>('/auth/change-password', { oldPassword, newPassword })
        .then((r) => r.data),
  },
  words: {
    levels: () =>
      client
        .get<Array<{ id: string; label: string; count: number }>>(
          '/words/levels',
        )
        .then((r) => r.data),
    random: (level: string, count = 1500) =>
      client
        .get<{ level: string; words: string[] }>('/words/random', {
          params: { level, count },
        })
        .then((r) => r.data),
    info: (word: string) =>
      client.post<WordInfo>('/words/info', { word }).then((r) => r.data),
  },
  practice: {
    submit: (payload: {
      word: string;
      formType: string;
      exampleIndex: number;
      actual: string;
    }) =>
      client.post<SubmitAnswerResult>('/practice/submit', payload).then((r) => r.data),
    learned: (word: string) =>
      client.post(`/practice/learned/${encodeURIComponent(word)}`).then((r) => r.data),
    mastered: (word: string) =>
      client
        .get<Record<string, number[]>>(`/practice/mastered/${encodeURIComponent(word)}`)
        .then((r) => r.data),
    learnedWords: () =>
      client.get<string[]>('/practice/learned-words').then((r) => r.data),
  },
  checkin: {
    status: () => client.get<CheckInStatus>('/checkin/status').then((r) => r.data),
    do: () => client.post<CheckInResult>('/checkin').then((r) => r.data),
  },
  badges: {
    mine: () => client.get<BadgeListItem[]>('/badges/me').then((r) => r.data),
  },
};
