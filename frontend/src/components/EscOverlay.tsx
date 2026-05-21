import React from 'react';
import { Drawer, Tabs, Tooltip } from 'antd';
import { createStyles } from 'antd-style';
import { useAuthStore } from '@/store/auth';
import { useThemeStore } from '@/store/theme';
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
}));

const EscOverlay: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  const { styles } = useStyles();
  const profile = useAuthStore((s) => s.profile);
  const mode = useThemeStore((s) => s.mode);
  const toggleTheme = useThemeStore((s) => s.toggle);
  const isLoggedIn = !!profile;

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
