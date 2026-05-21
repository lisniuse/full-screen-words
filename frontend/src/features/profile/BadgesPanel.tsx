import React, { useEffect, useState } from 'react';
import { Empty, Spin, Tooltip } from 'antd';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';

import { api } from '@/api';
import type { BadgeListItem } from '@/api/types';
import BadgeIcon from '@/components/BadgeIcon';

const useStyles = createStyles(({ css, token }) => ({
  wrap: css({
    paddingTop: 16,
  }),
  grid: css({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: 12,
  }),
  card: css({
    border: `1px solid ${token.colorBorderSecondary}`,
    borderRadius: 12,
    padding: '16px 12px',
    textAlign: 'center',
    background: token.colorBgContainer,
    transition: 'all 0.2s ease',
    cursor: 'default',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  }),
  cardLocked: css({
    background: token.colorBgLayout,
  }),
  iconWrap: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: 56,
  }),
  name: css({
    marginTop: 8,
    fontWeight: 600,
    fontSize: 14,
    color: token.colorText,
  }),
  tier: css({
    marginTop: 4,
    fontSize: 11,
    color: token.colorTextTertiary,
  }),
}));

const tierLabel: Record<string, string> = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
};

const BadgesPanel: React.FC = () => {
  const { styles, cx } = useStyles();
  const [items, setItems] = useState<BadgeListItem[] | null>(null);

  useEffect(() => {
    api.badges.mine().then(setItems).catch(() => setItems([]));
  }, []);

  if (!items) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <Spin />
      </div>
    );
  }
  if (items.length === 0) {
    return <Empty description="暂无徽章" />;
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.grid}>
        {items.map((b) => (
          <Tooltip
            key={b.code}
            title={
              <>
                <div>{b.description}</div>
                {b.unlockedAt && (
                  <div style={{ fontSize: 11, marginTop: 4, opacity: 0.85 }}>
                    解锁于 {dayjs(b.unlockedAt).format('YYYY-MM-DD')}
                  </div>
                )}
              </>
            }
          >
            <div className={cx(styles.card, !b.unlocked && styles.cardLocked)}>
              <div className={styles.iconWrap}>
                <BadgeIcon
                  code={b.code}
                  tier={b.tier}
                  unlocked={b.unlocked}
                  size={56}
                />
              </div>
              <div className={styles.name}>{b.name}</div>
              <div className={styles.tier}>{tierLabel[b.tier] ?? b.tier}</div>
            </div>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};

export default BadgesPanel;
