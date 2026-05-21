import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createStyles } from 'antd-style';

import WordModal from '@/components/WordModal';
import LevelHud from '@/components/LevelHud';
import { api } from '@/api';
import { useAuthStore } from '@/store/auth';
import { useLevelStore } from '@/store/level';
import { useLearnedStore } from '@/store/learned';
import { useThemeStore } from '@/store/theme';

/**
 * 一次性铺满 2K/4K 屏的单词池；level 变化时重新从后端拉取。
 * resize 不再触发任何 React 更新——CSS flex-wrap 自然适配，避免 reflow 双重开销。
 */
const POOL_SIZE = 1500;

const useStyles = createStyles(
  ({ css, token }, { isDark }: { isDark: boolean }) => ({
    page: css({
      width: '100%',
      minHeight: '100vh',
      padding: '16px 16px 80px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: 12,
      alignContent: 'flex-start',
      background: token.colorBgLayout,
      overflow: 'hidden',
      contain: 'layout style',
    }),
    word: css({
      fontSize: 14,
      color: token.colorTextTertiary,
      padding: '4px 10px',
      borderRadius: 999,
      cursor: 'pointer',
      transition: 'background-color 0.15s ease, color 0.15s ease',
      userSelect: 'none',
      '&:hover': {
        color: token.colorText,
        background: token.colorBgElevated,
      },
      // 已学过的单词：浅色用淡绿背景，深色用半透明绿色——hover 时仍能加深
      '&[data-learned="1"]': {
        color: isDark ? '#86efac' : '#16a34a',
        background: isDark ? 'rgba(34, 197, 94, 0.18)' : '#dcfce7',
      },
      '&[data-learned="1"]:hover': {
        color: isDark ? '#bbf7d0' : '#15803d',
        background: isDark ? 'rgba(34, 197, 94, 0.28)' : '#bbf7d0',
      },
    }),
  }),
);

const WordsPage: React.FC = () => {
  const isDark = useThemeStore((s) => s.mode === 'dark');
  const { styles } = useStyles({ isDark });
  const [words, setWords] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const profile = useAuthStore((s) => s.profile);
  const level = useLevelStore((s) => s.level);
  const learnedSet = useLearnedStore((s) => s.set);
  const setManyLearned = useLearnedStore((s) => s.setMany);
  const learnedHydrated = useLearnedStore((s) => s.hydrated);

  const reload = useCallback(() => {
    api.words
      .random(level, POOL_SIZE)
      .then(({ words }) => setWords(words))
      .catch(() => setWords([]));
  }, [level]);

  useEffect(() => {
    reload();
  }, [reload]);

  // 登录态下首次拉取已学单词集合
  useEffect(() => {
    if (!profile) return;
    if (learnedHydrated) return;
    api.practice
      .learnedWords()
      .then(setManyLearned)
      .catch(() => {
        /* 拉失败下次再来 */
      });
  }, [profile, learnedHydrated, setManyLearned]);

  /** 事件委托：单词上不放 onClick 闭包，由父级一个回调读 data-word */
  const handleContainerClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = e.target as HTMLElement;
      const w = el.dataset?.word;
      if (w) setSelected(w);
    },
    [],
  );

  /** 双击容器空白处 = 换一批单词 */
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement).dataset?.word) return;
      reload();
    },
    [reload],
  );

  const items = useMemo(
    () =>
      words.map((w, i) => (
        <span
          key={i}
          className={styles.word}
          data-word={w}
          data-learned={learnedSet.has(w) ? '1' : undefined}
        >
          {w}
        </span>
      )),
    [words, styles.word, learnedSet],
  );

  return (
    <>
      <div
        className={styles.page}
        onClick={handleContainerClick}
        onDoubleClick={handleDoubleClick}
        title="双击空白处换一批单词"
      >
        {items}
      </div>

      {profile && <LevelHud />}

      <WordModal
        word={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
};

export default WordsPage;
