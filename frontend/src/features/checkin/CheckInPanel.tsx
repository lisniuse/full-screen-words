import React, { useEffect, useState } from 'react';
import { Button, Statistic, message } from 'antd';
import { createStyles } from 'antd-style';
import { api } from '@/api';
import type { CheckInStatus } from '@/api/types';
import { useAuthStore } from '@/store/auth';

const useStyles = createStyles(({ css }) => ({
  wrap: css({
    paddingTop: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  }),
  card: css({
    border: '1px solid #f0f0f0',
    borderRadius: 12,
    padding: 20,
    background: '#fafafa',
    textAlign: 'center',
  }),
  big: css({
    fontSize: 40,
    fontWeight: 700,
    color: '#18181b',
    lineHeight: 1,
    margin: '8px 0 4px',
  }),
  caption: css({
    color: '#737373',
    fontSize: 12,
  }),
  grid: css({
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 12,
  }),
}));

const CheckInPanel: React.FC = () => {
  const { styles } = useStyles();
  const refresh = useAuthStore((s) => s.refresh);
  const [status, setStatus] = useState<CheckInStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const load = () => api.checkin.status().then(setStatus);

  useEffect(() => {
    load();
  }, []);

  const onCheckIn = async () => {
    setLoading(true);
    try {
      const res = await api.checkin.do();
      message.success(`打卡成功！+${res.expReward} EXP，连续 ${res.streakDays} 天`);
      if (res.leveledUp) {
        message.success(`恭喜升级到 Lv.${res.level.level}！`);
      }
      if (res.unlockedBadges?.length) {
        res.unlockedBadges.forEach((b) =>
          message.info(`🎉 解锁徽章：${b.icon} ${b.name}`),
        );
      }
      await load();
      await refresh();
    } finally {
      setLoading(false);
    }
  };

  if (!status) return null;

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.caption}>今日 {status.today}</div>
        <div className={styles.big}>🔥 {status.streakDays}</div>
        <div className={styles.caption}>连续打卡天数</div>
        <div style={{ marginTop: 16 }}>
          <Button
            type="primary"
            size="large"
            block
            disabled={status.checkedInToday}
            loading={loading}
            onClick={onCheckIn}
          >
            {status.checkedInToday ? '今日已打卡' : '立即打卡'}
          </Button>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <Statistic title="最长连击" value={status.longestStreak} suffix="天" />
        </div>
        <div className={styles.card}>
          <Statistic
            title="上次打卡"
            value={status.lastCheckInDate ?? '尚未打卡'}
          />
        </div>
      </div>
    </div>
  );
};

export default CheckInPanel;
