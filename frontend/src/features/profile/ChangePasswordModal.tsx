import React, { useState } from 'react';
import { Alert, Form, Input, Modal, message } from 'antd';
import { api } from '@/api';

const ChangePasswordModal: React.FC<{
  open: boolean;
  onClose: () => void;
}> = ({ open, onClose }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onOk = async () => {
    try {
      const vals = await form.validateFields();
      setLoading(true);
      setError(null);
      await api.auth.changePassword(vals.oldPassword, vals.newPassword);
      message.success('密码已更新');
      form.resetFields();
      onClose();
    } catch (e: any) {
      if (e?.errorFields) return; // 表单校验错误已在 UI 显示
      setError(e?.response?.data?.message || '修改失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={() => {
        form.resetFields();
        setError(null);
        onClose();
      }}
      onOk={onOk}
      okText="确认修改"
      cancelText="取消"
      confirmLoading={loading}
      title="修改密码"
      destroyOnHidden
    >
      {error && (
        <Alert type="error" message={error} showIcon style={{ marginBottom: 12 }} />
      )}
      <Form form={form} layout="vertical" preserve={false}>
        <Form.Item
          name="oldPassword"
          label="原密码"
          rules={[{ required: true, min: 6, max: 64 }]}
        >
          <Input.Password autoComplete="current-password" />
        </Form.Item>
        <Form.Item
          name="newPassword"
          label="新密码"
          rules={[
            { required: true, min: 6, max: 64 },
            {
              pattern: /^(?=.*[A-Za-z])(?=.*\d).+$/,
              message: '至少 1 位字母 + 1 位数字',
            },
          ]}
        >
          <Input.Password
            autoComplete="new-password"
            placeholder="6-64 位，含字母与数字"
          />
        </Form.Item>
        <Form.Item
          name="confirm"
          label="确认新密码"
          dependencies={['newPassword']}
          rules={[
            { required: true },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致'));
              },
            }),
          ]}
        >
          <Input.Password autoComplete="new-password" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChangePasswordModal;
