import React, { useEffect } from 'react';
import { Drawer, Select, Tabs, Tooltip } from 'antd';
import { createStyles } from 'antd-style';
import { api } from '@/api';
import { useAuthStore } from '@/store/auth';
import { useThemeStore } from '@/store/theme';
import { useLevelStore } from '@/store/level';
import AuthPanel from '@/features/auth/AuthPanel';
import ProfilePanel from '@/features/profile/ProfilePanel';
import BadgesPanel from '@/features/profile/BadgesPanel';
import CheckInPanel from '@/features/checkin/CheckInPanel';

const SunIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
    strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);

const MoonIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
    strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const useStyles = createStyles(({ css, token }) => ({
  drawer: css({
    '.ant-drawer-body': {
      padding: 0,
    },
    '.ant-drawer-header': {
      borderBottom: `1px solid ${token.colorBorderSecondary}`,
    },
  }),
  body: css({
    padding: '0 24px 24px',
  }),
  titleRow: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  }),
  title: css({
    fontSize: 18,
    fontWeight: 600,
  }),
  subtitle: css({
    fontSize: 12,
    color: token.colorTextTertiary,
    marginTop: 2,
  }),
  themeBtn: css({
    flexShrink: 0,
    width: 36,
    height: 36,
    padding: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `1px solid ${token.colorBorderSecondary}`,
    background: token.colorBgContainer,
    color: token.colorText,
    cursor: 'pointer',
    borderRadius: 8,
    transition: 'all 0.2s ease',
    '& svg': {
      width: 18,
      height: 18,
      transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    '&:hover': {
      borderColor: token.colorBorder,
      background: token.colorBgElevated,
    },
    '&:hover svg': {
      transform: 'rotate(45deg)',
    },
  }),
  levelSection: css({
    padding: '12px 24px 0',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    fontSize: 13,
    color: token.colorTextSecondary,
  }),
  levelLabel: css({
    flexShrink: 0,
    fontWeight: 500,
  }),
  levelCount: css({
    fontSize: 11,
    color: token.colorTextTertiary,
  }),
}));

const EscOverlay: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  const { styles } = useStyles();
  const profile = useAuthStore((s) => s.profile);
  const mode = useThemeStore((s) => s.mode);
  const toggleTheme = useThemeStore((s) => s.toggle);
  const level = useLevelStore((s) => s.level);
  const levels = useLevelStore((s) => s.levels);
  const hydratedLevels = useLevelStore((s) => s.hydrated);
  const setLevel = useLevelStore((s) => s.setLevel);
  const setLevels = useLevelStore((s) => s.setLevels);
  const isLoggedIn = !!profile;

  // 抽屉首次打开时拉取词库列表（每个用户/会话仅请求一次）
  useEffect(() => {
    if (!open || hydratedLevels) return;
    api.words
      .levels()
      .then(setLevels)
      .catch(() => {
        /* 后端没起来时忽略，下次再试 */
      });
  }, [open, hydratedLevels, setLevels]);

  const activeLevelMeta = levels.find((l) => l.id === level);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={520}
      destroyOnHidden
      className={styles.drawer}
      maskClosable
      title={
        <div className={styles.titleRow}>
          <div>
            <div className={styles.title}>
              {isLoggedIn ? `欢迎，${profile.user.nickname ?? profile.user.username}` : '全屏单词'}
            </div>
            <div className={styles.subtitle}>
              {isLoggedIn ? '继续保持，每一次答题都是一次成长' : '登录后开启你的学习旅程'}
            </div>
          </div>
          <Tooltip title={mode === 'dark' ? '切换到浅色' : '切换到深色'}>
            <button
              type="button"
              className={styles.themeBtn}
              onClick={toggleTheme}
              aria-label="切换主题"
            >
              {mode === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
          </Tooltip>
        </div>
      }
    >
      <div className={styles.levelSection}>
        <span className={styles.levelLabel}>词库</span>
        <Select
          size="small"
          value={level}
          style={{ flex: 1 }}
          onChange={setLevel}
          options={(levels.length > 0
            ? levels
            : [{ id: level, label: level, count: 0 }]
          ).map((l) => ({
            value: l.id,
            label: (
              <span>
                {l.label}
                <span className={styles.levelCount}>
                  {l.count > 0 ? ` · ${l.count} 词` : ''}
                </span>
              </span>
            ),
          }))}
        />
        {activeLevelMeta && (
          <Tooltip title={`当前 ${activeLevelMeta.label} 共 ${activeLevelMeta.count} 词`}>
            <span className={styles.levelCount}>{activeLevelMeta.count}</span>
          </Tooltip>
        )}
      </div>

      <div className={styles.body}>
        {isLoggedIn ? (
          <Tabs
            defaultActiveKey="profile"
            items={[
              { key: 'profile', label: '个人中心', children: <ProfilePanel /> },
              { key: 'badges', label: '徽章', children: <BadgesPanel /> },
              { key: 'checkin', label: '打卡', children: <CheckInPanel /> },
            ]}
          />
        ) : (
          <AuthPanel onSuccess={onClose} />
        )}
      </div>
    </Drawer>
  );
};

export default EscOverlay;
