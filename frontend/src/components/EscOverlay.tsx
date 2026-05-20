import React from 'react';
import { Drawer, Tabs } from 'antd';
import { createStyles } from 'antd-style';
import { useAuthStore } from '@/store/auth';
import AuthPanel from '@/features/auth/AuthPanel';
import ProfilePanel from '@/features/profile/ProfilePanel';
import BadgesPanel from '@/features/profile/BadgesPanel';
import CheckInPanel from '@/features/checkin/CheckInPanel';

const useStyles = createStyles(({ css }) => ({
  drawer: css({
    '.ant-drawer-body': {
      padding: 0,
    },
    '.ant-drawer-header': {
      borderBottom: '1px solid #f5f5f5',
    },
  }),
  body: css({
    padding: '0 24px 24px',
  }),
  title: css({
    fontSize: 18,
    fontWeight: 600,
  }),
  subtitle: css({
    fontSize: 12,
    color: '#737373',
    marginTop: 2,
  }),
}));

const EscOverlay: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  const { styles } = useStyles();
  const profile = useAuthStore((s) => s.profile);
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
        <div>
          <div className={styles.title}>
            {isLoggedIn ? `欢迎，${profile.user.nickname ?? profile.user.username}` : '全屏单词'}
          </div>
          <div className={styles.subtitle}>
            {isLoggedIn ? '继续保持，每一次答题都是一次成长' : '登录后开启你的学习旅程'}
          </div>
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
