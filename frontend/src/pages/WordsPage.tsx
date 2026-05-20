import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createStyles } from 'antd-style';
import * as randomWordsPkg from 'random-words';

import WordModal from '@/components/WordModal';
import LevelHud from '@/components/LevelHud';
import { useAuthStore } from '@/store/auth';

const generate = (randomWordsPkg as any).generate as (opts: {
  exactly: number;
}) => string[];

const useStyles = createStyles(({ css }) => ({
  page: css({
    width: '100%',
    minHeight: '100vh',
    padding: '16px 16px 80px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
    alignContent: 'flex-start',
    background: '#fafafa',
  }),
  word: css({
    fontSize: 14,
    color: '#737373',
    padding: '4px 10px',
    borderRadius: 999,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    userSelect: 'none',
    '&:hover': {
      color: '#18181b',
      background: '#e8e8e8',
    },
  }),
}));

const WordsPage: React.FC = () => {
  const { styles } = useStyles();
  const [words, setWords] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const profile = useAuthStore((s) => s.profile);

  const computeCount = useCallback(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const perRow = Math.max(6, Math.floor(w / 100));
    const rows = Math.ceil(h / 30);
    return perRow * rows;
  }, []);

  const refresh = useCallback(() => {
    const n = computeCount();
    setWords(generate({ exactly: n }));
  }, [computeCount]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    let timer: number | null = null;
    const onResize = () => {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(refresh, 400);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [refresh]);

  const items = useMemo(
    () =>
      words.map((w, i) => (
        <span
          key={`${w}-${i}`}
          className={styles.word}
          onClick={() => setSelected(w)}
        >
          {w}
        </span>
      )),
    [words, styles.word],
  );

  return (
    <>
      <div className={styles.page} ref={containerRef}>
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
