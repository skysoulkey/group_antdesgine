import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Card, Descriptions, Divider, Form, Input, message, Space, Typography } from 'antd';
import React from 'react';
import { useNavigate } from 'umi';
import { CARD_SHADOW } from './constants';

const { Text } = Typography;

// mock 当前绑定账号（实际应从全局 state 或 context 读取，此处独立 mock）
const CURRENT_BOUND = { accountId: '', accountName: 'Miya（@miya_sg）', platform: '' };

const BindAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const mfa: string = values.mfa ?? '';
      if (mfa.length < 6) { message.error('请输入6位MFA验证码'); return; }
      // mock: 任意6位通过
      message.success('绑定账号已更新');
      navigate(-1);
    }).catch(() => {});
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          style={{ padding: 0, color: '#722ed1' }}
          onClick={() => navigate(-1)}
        >
          返回集团钱包
        </Button>
      </div>

      <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW, maxWidth: 560 }}>
        <Text strong style={{ fontSize: 16 }}>修改绑定账号</Text>
        <Divider style={{ margin: '16px 0' }} />

        {/* 当前绑定账号 */}
        <Descriptions bordered column={1} size="small" style={{ marginBottom: 24 }}>
          <Descriptions.Item label="当前账号">{CURRENT_BOUND.accountName}</Descriptions.Item>
          <Descriptions.Item label="账号 ID" labelStyle={{ fontFamily: 'monospace' }}>{CURRENT_BOUND.accountId}</Descriptions.Item>
          <Descriptions.Item label="所属平台">{CURRENT_BOUND.platform}</Descriptions.Item>
        </Descriptions>

        <Form form={form} layout="vertical">
          <Form.Item label="新账号 ID" name="newAccountId" rules={[{ required: true, message: '请输入新账号 ID' }]}>
            <Input placeholder="请输入新的绑定账号 ID" />
          </Form.Item>
          <Form.Item label="备注名称" name="newAccountName">
            <Input placeholder="选填，便于识别" />
          </Form.Item>
          <Divider style={{ margin: '8px 0 16px' }} />
          <Form.Item label="MFA 验证码" name="mfa" rules={[{ required: true, message: '请输入MFA验证码' }]}>
            <Input
              placeholder="请输入 6 位 MFA 验证码"
              maxLength={6}
              style={{ letterSpacing: 4, textAlign: 'center', width: 200 }}
            />
          </Form.Item>
          <Space>
            <Button onClick={() => navigate(-1)}>取消</Button>
            <Button type="primary" style={{ background: '#722ed1', borderColor: '#722ed1' }} onClick={handleSubmit}>
              保存
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
};

export default BindAccountPage;
