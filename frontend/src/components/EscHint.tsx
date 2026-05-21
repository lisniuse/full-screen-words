import React from 'react';
import { createStyles } from 'antd-style';
import { useThemeStore } from '@/store/theme';

const useStyles = createStyles(({ css }) => ({
  hint: css({
    position: 'fixed',
    right: 16,
    bottom: 16,
    zIndex: 50,
    backdropFilter: 'blur(8px)',
    padding: '6px 10px',
    borderRadius: 8,
    fontSize: 12,
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'all 0.2s ease',
  }),
  hintLight: css({
    background: 'rgba(255, 255, 255, 0.85)',
    border: '1px solid #e5e5e5',
    color: '#525252',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    '&:hover': {
      color: '#18181b',
      borderColor: '#d4d4d8',
      background: '#ffffff',
    },
  }),
  hintDark: css({
    background: 'rgba(24, 24, 27, 0.92)',
    border: '1px solid #27272a',
    color: '#d4d4d8',
    boxShadow: '0 4px 12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.02) inset',
    '&:hover': {
      color: '#fafafa',
      borderColor: '#3f3f46',
      background: 'rgba(39, 39, 42, 0.95)',
    },
  }),
  kbd: css({
    display: 'inline-block',
    padding: '1px 6px',
    borderBottomWidth: 2,
    borderRadius: 4,
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontSize: 11,
    marginRight: 6,
  }),
  kbdLight: css({
    background: '#fafafa',
    border: '1px solid #d4d4d8',
    color: '#262626',
  }),
  kbdDark: css({
    background: '#3f3f46',
    border: '1px solid #52525b',
    color: '#fafafa',
  }),
}));

const EscHint: React.FC<{ onOpen: () => void }> = ({ onOpen }) => {
  const { styles, cx } = useStyles();
  const isDark = useThemeStore((s) => s.mode === 'dark');
  return (
    <div
      className={cx(styles.hint, isDark ? styles.hintDark : styles.hintLight)}
      onClick={onOpen}
      title="按 ESC 打开面板"
    >
      <span className={cx(styles.kbd, isDark ? styles.kbdDark : styles.kbdLight)}>
        ESC
      </span>
      打开面板
    </div>
  );
};

export default EscHint;
