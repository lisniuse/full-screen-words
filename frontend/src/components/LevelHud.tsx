import React, { useState } from 'react';
import { createStyles } from 'antd-style';
import { useAuthStore } from '@/store/auth';

const useStyles = createStyles(({ css }) => ({
  wrap: css({
    position: 'fixed',
    top: 0,
    right: 0,
    width: 56,
    height: 56,
    zIndex: 50,
    transition: 'width 0.25s linear, height 0.25s linear',
  }),
  wrapExpanded: css({
    width: 296,
    height: 220,
  }),
  svg: css({
    position: 'absolute',
    top: 0,
    right: 0,
    width: 56,
    height: 56,
    pointerEvents: 'none',
  }),
  arc: css({
    fill: 'none',
    stroke: '#18181b',
    strokeWidth: 1.6,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeDasharray: 60,
    strokeDashoffset: 60,
    opacity: 0,
    transition:
      'stroke-dashoffset 0.55s cubic-bezier(0.65, 0, 0.35, 1), opacity 0.2s ease',
  }),
  arcOn: css({
    strokeDashoffset: 0,
    opacity: 1,
  }),
  arrowHead: css({
    fill: 'none',
    stroke: '#18181b',
    strokeWidth: 1.6,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeDasharray: 18,
    strokeDashoffset: 18,
    opacity: 0,
    transition:
      'stroke-dashoffset 0.25s cubic-bezier(0.65, 0, 0.35, 1) 0.45s, opacity 0.2s ease 0.45s',
  }),
  arrowHeadOn: css({
    strokeDashoffset: 0,
    opacity: 1,
  }),
  hintDot: css({
    position: 'absolute',
    top: 18,
    right: 18,
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#a3a3a3',
    opacity: 0.55,
    pointerEvents: 'none',
    transition: 'opacity 0.2s ease, transform 0.2s ease',
  }),
  hintDotHidden: css({
    opacity: 0,
    transform: 'scale(0.4)',
  }),
  card: css({
    position: 'absolute',
    top: 14,
    right: 14,
    width: 268,
    background: 'rgba(255, 255, 255, 0.92)',
    backdropFilter: 'blur(10px)',
    border: '1px solid #e5e5e5',
    borderRadius: 14,
    padding: '12px 16px',
    boxShadow: '0 8px 24px -8px rgba(0,0,0,0.15)',
    opacity: 0,
    transform: 'translate(8px, -8px) scale(0.96)',
    transformOrigin: 'top right',
    pointerEvents: 'none',
    transition:
      'opacity 0.2s ease 0.45s, transform 0.25s cubic-bezier(0.34, 1.4, 0.64, 1) 0.45s',
  }),
  cardOn: css({
    opacity: 1,
    transform: 'translate(0, 0) scale(1)',
    pointerEvents: 'auto',
  }),
  row: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  }),
  level: css({
    fontSize: 16,
    fontWeight: 700,
    color: '#18181b',
    letterSpacing: 0.2,
  }),
  combo: css({
    fontSize: 12,
    color: '#ea580c',
    fontWeight: 700,
  }),
  bar: css({
    marginTop: 8,
    height: 4,
    width: '100%',
    background: '#f4f4f5',
    borderRadius: 999,
    overflow: 'hidden',
  }),
  fill: css({
    height: '100%',
    background: '#18181b',
    borderRadius: 999,
    transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  }),
  expText: css({
    marginTop: 6,
    fontSize: 11,
    color: '#737373',
  }),
  meta: css({
    marginTop: 10,
    paddingTop: 10,
    borderTop: '1px dashed #f0f0f0',
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 11,
    color: '#737373',
  }),
  metaItem: css({
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    alignItems: 'center',
  }),
  metaVal: css({
    color: '#18181b',
    fontWeight: 600,
    fontSize: 13,
  }),
}));

const LevelHud: React.FC = () => {
  const { styles, cx } = useStyles();
  const profile = useAuthStore((s) => s.profile);
  const [open, setOpen] = useState(false);

  if (!profile) return null;

  const { level, stats } = profile;
  const pct = Math.min(100, Math.round(level.progress * 100));

  return (
    <div
      className={cx(styles.wrap, open && styles.wrapExpanded)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span className={cx(styles.hintDot, open && styles.hintDotHidden)} />

      <svg className={styles.svg} viewBox="0 0 56 56" aria-hidden>
        {/* 半圆：圆心 (28, 30)，半径 18，从左端 (10,30) 经顶部到右端 (46,30) */}
        <path
          className={cx(styles.arc, open && styles.arcOn)}
          d="M 10 30 A 18 18 0 0 1 46 30"
        />
        {/* 末端箭头：在右端 (46, 30) 朝右下 */}
        <path
          className={cx(styles.arrowHead, open && styles.arrowHeadOn)}
          d="M 46 30 L 40 27 M 46 30 L 43 36"
        />
      </svg>

      <div className={cx(styles.card, open && styles.cardOn)}>
        <div className={styles.row}>
          <span className={styles.level}>Lv. {level.level}</span>
          {stats.combo > 0 ? (
            <span className={styles.combo}>🔥 x{stats.combo}</span>
          ) : (
            <span style={{ fontSize: 12, color: '#a3a3a3' }}>准备答题</span>
          )}
        </div>
        <div className={styles.bar}>
          <div className={styles.fill} style={{ width: `${pct}%` }} />
        </div>
        <div className={styles.expText}>
          {level.expInCurrentLevel} / {level.expForNextLevel} EXP · 累计 {level.totalExp}
        </div>
        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <span className={styles.metaVal}>{stats.wordsLearned}</span>
            <span>已学单词</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaVal}>{stats.maxCombo}</span>
            <span>最高连击</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaVal}>{stats.streakDays}</span>
            <span>连续打卡</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelHud;
