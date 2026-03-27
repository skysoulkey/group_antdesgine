import { LockOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Descriptions,
  Divider,
  Form,
  Input,
  Modal,
  Space,
  Switch,
  Tag,
  Typography,
} from 'antd';
import React, { useState } from 'react';

const { Text } = Typography;

const CARD_SHADOW = '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)';

const ProfilePage: React.FC = () => {
  const [pwdOpen, setPwdOpen] = useState(false);
  const [pwdForm] = Form.useForm();

  const personalInfo = {
    username: 'Miya',
    role: '集团管理员',
    email: 'Miya@gmail.com',
    validPeriod: '永久有效',
    lastLoginIp: '104.28.222.12',
    lastLoginCountry: '🇸🇬 新加坡',
    lastLoginTime: '2025-11-23 13:56:21',
    createdAt: '2025-11-23 13:56:21',
    mfaEnabled: false,
  };

  return (
    <div>
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW, maxWidth: 600 }}>
        <Descriptions column={1} labelStyle={{ color: '#8c8c8c', width: 130 }} bordered>
          <Descriptions.Item label="用户名">{personalInfo.username}</Descriptions.Item>
          <Descriptions.Item label="角色">
            <Tag color="blue">{personalInfo.role}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="邮箱">{personalInfo.email}</Descriptions.Item>
          <Descriptions.Item label="账户有效期">
            <Text type="success">{personalInfo.validPeriod}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="最近登录IP">
            <Space>
              <Text style={{ fontFamily: 'monospace' }}>{personalInfo.lastLoginIp}</Text>
              <Text>{personalInfo.lastLoginCountry}</Text>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="最近登录时间">{personalInfo.lastLoginTime}</Descriptions.Item>
          <Descriptions.Item label="账号创建时间">{personalInfo.createdAt}</Descriptions.Item>
          <Descriptions.Item label="MFA 认证">
            <Switch defaultChecked={personalInfo.mfaEnabled} />
          </Descriptions.Item>
          <Descriptions.Item label="登录密码">
            <Button
              size="small"
              icon={<LockOutlined />}
              onClick={() => setPwdOpen(true)}
            >
              修改密码
            </Button>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 修改密码弹窗 */}
      <Modal
        title="修改密码"
        open={pwdOpen}
        onOk={() =>
          pwdForm.validateFields().then(() => {
            setPwdOpen(false);
            pwdForm.resetFields();
          })
        }
        onCancel={() => {
          setPwdOpen(false);
          pwdForm.resetFields();
        }}
        width={420}
      >
        <Form form={pwdForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="当前密码" name="oldPwd" rules={[{ required: true }]}>
            <Input.Password placeholder="请输入当前密码" />
          </Form.Item>
          <Form.Item label="新密码" name="newPwd" rules={[{ required: true, min: 8 }]}>
            <Input.Password placeholder="请输入新密码（至少8位）" />
          </Form.Item>
          <Form.Item
            label="确认新密码"
            name="confirmPwd"
            rules={[
              { required: true },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPwd') === value) return Promise.resolve();
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="请再次输入新密码" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProfilePage;
