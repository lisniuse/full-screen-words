export interface AuthResult {
  token: string;
  user: { id: number; username: string; nickname: string | null };
}

export interface LevelInfo {
  level: number;
  totalExp: number;
  expInCurrentLevel: number;
  expForNextLevel: number;
  progress: number;
}

export interface BadgeUnlocked {
  code: string;
  name: string;
  icon: string;
  tier: string;
}

export interface ProfileResponse {
  user: { id: number; username: string; nickname: string | null; createdAt: string };
  level: LevelInfo;
  stats: {
    totalExp: number;
    combo: number;
    maxCombo: number;
    totalAnswers: number;
    correctAnswers: number;
    accuracy: number;
    wordsLearned: number;
    streakDays: number;
    longestStreak: number;
    lastCheckInDate: string | null;
  };
  badges: Array<{
    code: string;
    name: string;
    description: string;
    icon: string;
    tier: string;
    unlockedAt: string;
  }>;
}

export interface WordExample {
  en: string;
  zh: string;
}

export interface WordForm {
  value: string;
  examples: WordExample[];
}

export interface WordInfo {
  forms: Partial<Record<string, WordForm | null>>;
}

export interface SubmitAnswerResult {
  correct: boolean;
  isRepeat: boolean;
  expGained: number;
  combo: number;
  leveledUp: boolean;
  level: LevelInfo;
  unlockedBadges: BadgeUnlocked[];
}

export interface CheckInStatus {
  today: string;
  checkedInToday: boolean;
  streakDays: number;
  longestStreak: number;
  lastCheckInDate: string | null;
}

export interface CheckInResult {
  date: string;
  streakDays: number;
  longestStreak: number;
  expReward: number;
  level: LevelInfo;
  leveledUp: boolean;
  unlockedBadges: BadgeUnlocked[];
}

export interface BadgeListItem {
  code: string;
  name: string;
  description: string;
  icon: string;
  tier: string;
  sortOrder: number;
  unlocked: boolean;
  unlockedAt: string | null;
}
