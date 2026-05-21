import React, { useState } from 'react';
import { Button, Progress, Space, Statistic, Tag, theme as antdTheme } from 'antd';
import { createStyles } from 'antd-style';
import { useAuthStore } from '@/store/auth';
import ChangePasswordModal from './ChangePasswordModal';

const useStyles = createStyles(({ css, token }) => ({
  wrap: css({
    paddingTop: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  }),
  card: css({
    background: token.colorBgLayout,
    border: `1px solid ${token.colorBorderSecondary}`,
    borderRadius: 12,
    padding: 16,
  }),
  levelHeader: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  }),
  levelBig: css({
    fontSize: 28,
    fontWeight: 700,
    color: token.colorText,
    lineHeight: 1,
  }),
  expText: css({
    fontSize: 12,
    color: token.colorTextTertiary,
  }),
  grid: css({
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 12,
  }),
  statBox: css({
    background: token.colorBgContainer,
    border: `1px solid ${token.colorBorderSecondary}`,
    borderRadius: 10,
    padding: '12px 14px',
  }),
  logout: css({
    marginTop: 8,
  }),
}));

const ProfilePanel: React.FC = () => {
  const { styles } = useStyles();
  const { token } = antdTheme.useToken();
  const profile = useAuthStore((s) => s.profile);
  const logout = useAuthStore((s) => s.logout);
  const [pwOpen, setPwOpen] = useState(false);
  if (!profile) return null;

  const { level, stats } = profile;

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.levelHeader}>
          <div>
            <div className={styles.levelBig}>Lv. {level.level}</div>
            <div className={styles.expText}>
              {level.expInCurrentLevel} / {level.expForNextLevel} EXP · 累计 {level.totalExp}
            </div>
          </div>
          <Tag color="default">{stats.combo > 0 ? `🔥 当前 Combo ${stats.combo}` : '准备答题'}</Tag>
        </div>
        <Progress
          percent={Math.round(level.progress * 100)}
          showInfo={false}
          strokeColor={token.colorText}
        />
      </div>

      <div className={styles.grid}>
        <div className={styles.statBox}>
          <Statistic title="已学单词" value={stats.wordsLearned} />
        </div>
        <div className={styles.statBox}>
          <Statistic title="最高 Combo" value={stats.maxCombo} />
        </div>
        <div className={styles.statBox}>
          <Statistic title="累计答题" value={stats.totalAnswers} />
        </div>
        <div className={styles.statBox}>
          <Statistic
            title="正确率"
            value={Math.round(stats.accuracy * 100)}
            suffix="%"
          />
        </div>
        <div className={styles.statBox}>
          <Statistic title="连续打卡" value={stats.streakDays} suffix="天" />
        </div>
        <div className={styles.statBox}>
          <Statistic title="最长连击" value={stats.longestStreak} suffix="天" />
        </div>
      </div>

      <Space className={styles.logout} style={{ width: '100%' }} direction="vertical">
        <Button onClick={() => setPwOpen(true)} block>
          修改密码
        </Button>
        <Button onClick={logout} block danger>
          退出登录
        </Button>
      </Space>

      <ChangePasswordModal open={pwOpen} onClose={() => setPwOpen(false)} />
    </div>
  );
};

export default ProfilePanel;
