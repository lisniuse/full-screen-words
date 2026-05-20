import React from 'react';
import { createStyles } from 'antd-style';

const useStyles = createStyles(({ css }) => ({
  hint: css({
    position: 'fixed',
    right: 16,
    bottom: 16,
    zIndex: 50,
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(8px)',
    border: '1px solid #e5e5e5',
    color: '#525252',
    padding: '6px 10px',
    borderRadius: 8,
    fontSize: 12,
    cursor: 'pointer',
    userSelect: 'none',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    transition: 'all 0.2s ease',
    '&:hover': {
      color: '#18181b',
      borderColor: '#d4d4d8',
      background: '#ffffff',
    },
  }),
  kbd: css({
    display: 'inline-block',
    padding: '1px 6px',
    border: '1px solid #d4d4d8',
    borderBottomWidth: 2,
    borderRadius: 4,
    background: '#fafafa',
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontSize: 11,
    marginRight: 6,
    color: '#262626',
  }),
}));

const EscHint: React.FC<{ onOpen: () => void }> = ({ onOpen }) => {
  const { styles } = useStyles();
  return (
    <div className={styles.hint} onClick={onOpen} title="按 ESC 打开面板">
      <span className={styles.kbd}>ESC</span>
      打开面板
    </div>
  );
};

export default EscHint;
