import React, { useState } from 'react';
import { Alert, Button, Form, Input, Tabs } from 'antd';
import { createStyles } from 'antd-style';
import { useAuthStore } from '@/store/auth';

const useStyles = createStyles(({ css }) => ({
  wrap: css({
    paddingTop: 16,
  }),
  hint: css({
    marginTop: 16,
    fontSize: 12,
    color: '#737373',
    textAlign: 'center',
  }),
}));

const LoginForm: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);
  const [error, setError] = useState<string | null>(null);

  const onFinish = async (vals: { username: string; password: string }) => {
    setError(null);
    try {
      await login(vals.username, vals.password);
      onDone();
    } catch (e: any) {
      setError(e?.response?.data?.message || '登录失败');
    }
  };

  return (
    <Form layout="vertical" onFinish={onFinish}>
      {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 12 }} />}
      <Form.Item
        label="用户名"
        name="username"
        rules={[{ required: true, min: 3, max: 32, message: '用户名 3-32 位' }]}
      >
        <Input placeholder="请输入用户名" autoComplete="username" />
      </Form.Item>
      <Form.Item
        label="密码"
        name="password"
        rules={[{ required: true, min: 6, max: 64, message: '密码 6-64 位' }]}
      >
        <Input.Password placeholder="请输入密码" autoComplete="current-password" />
      </Form.Item>
      <Button type="primary" htmlType="submit" block loading={loading}>
        登录
      </Button>
    </Form>
  );
};

const RegisterForm: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const register = useAuthStore((s) => s.register);
  const loading = useAuthStore((s) => s.loading);
  const [error, setError] = useState<string | null>(null);

  const onFinish = async (vals: {
    username: string;
    password: string;
    nickname?: string;
  }) => {
    setError(null);
    try {
      await register(vals.username, vals.password, vals.nickname);
      onDone();
    } catch (e: any) {
      setError(e?.response?.data?.message || '注册失败');
    }
  };

  return (
    <Form layout="vertical" onFinish={onFinish}>
      {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 12 }} />}
      <Form.Item
        label="用户名"
        name="username"
        rules={[
          { required: true, min: 3, max: 32 },
          {
            pattern: /^[a-zA-Z0-9_-]+$/,
            message: '仅允许字母、数字、下划线和短横线',
          },
        ]}
      >
        <Input placeholder="3-32 位，字母/数字/_/-" autoComplete="username" />
      </Form.Item>
      <Form.Item label="昵称（可选）" name="nickname" rules={[{ max: 32 }]}>
        <Input placeholder="显示在个人中心" />
      </Form.Item>
      <Form.Item
        label="密码"
        name="password"
        rules={[
          { required: true, min: 6, max: 64 },
          {
            pattern: /^(?=.*[A-Za-z])(?=.*\d).+$/,
            message: '至少 1 位字母 + 1 位数字',
          },
        ]}
      >
        <Input.Password placeholder="6-64 位，含字母与数字" autoComplete="new-password" />
      </Form.Item>
      <Button type="primary" htmlType="submit" block loading={loading}>
        注册并登录
      </Button>
    </Form>
  );
};

const AuthPanel: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const { styles } = useStyles();
  return (
    <div className={styles.wrap}>
      <Tabs
        centered
        defaultActiveKey="login"
        items={[
          { key: 'login', label: '登录', children: <LoginForm onDone={onSuccess} /> },
          { key: 'register', label: '注册', children: <RegisterForm onDone={onSuccess} /> },
        ]}
      />
      <div className={styles.hint}>登录后即可解锁等级、Combo、打卡和徽章系统</div>
    </div>
  );
};

export default AuthPanel;
