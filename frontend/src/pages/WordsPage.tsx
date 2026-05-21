import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createStyles } from 'antd-style';
import * as randomWordsPkg from 'random-words';

import WordModal from '@/components/WordModal';
import LevelHud from '@/components/LevelHud';
import { useAuthStore } from '@/store/auth';

const generate = (randomWordsPkg as any).generate as (opts: {
  exactly: number;
}) => string[];

/**
 * 一次生成足够铺满 2K/4K 屏的单词池；
 * resize 时不再重生成，由 CSS flex-wrap 自然适配，
 * 避免 React 重 reconcile + 浏览器 reflow 双重开销。
 */
const POOL_SIZE = 1500;

const useStyles = createStyles(({ css, token }) => ({
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
  }),
}));

const WordsPage: React.FC = () => {
  const { styles } = useStyles();
  const [words, setWords] = useState<string[]>(() =>
    generate({ exactly: POOL_SIZE }),
  );
  const [selected, setSelected] = useState<string | null>(null);
  const profile = useAuthStore((s) => s.profile);

  /** 事件委托：单词上不放 onClick 闭包，由父级一个回调读 data-word */
  const handleContainerClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.target as HTMLElement;
    const w = el.dataset?.word;
    if (w) setSelected(w);
  }, []);

  /** 双击容器空白处 = 换一批单词，保留原本的"刷新换词"体验 */
  const handleDoubleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).dataset?.word) return;
    setWords(generate({ exactly: POOL_SIZE }));
  }, []);

  const items = useMemo(
    () =>
      words.map((w, i) => (
        // key 用 index 保持稳定（list 长度固定），避免单词重复时 React 报 warning
        <span key={i} className={styles.word} data-word={w}>
          {w}
        </span>
      )),
    [words, styles.word],
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
