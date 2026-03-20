import { EditOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  Input,
  Modal,
  Row,
  Space,
  Switch,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import React, { useState } from 'react';

const { Text, Title } = Typography;

const ProfilePage: React.FC = () => {
  const [pwdOpen, setPwdOpen] = useState(false);
  const [pwdForm] = Form.useForm();

  const companyInfo = {
    name: '炸雷第一波',
    group: 'UU Talk',
    notifyAccounts: '@Miya_miya;@Tom_admin',
    createdAt: '2025-11-23 13:56:21',
  };

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

  const tabItems = [
    {
      key: 'company',
      label: '公司信息',
      children: (
        <Card bordered={false}>
          <Descriptions column={1} labelStyle={{ color: '#8c8c8c', width: 120 }} bordered>
            <Descriptions.Item label="公司名称">
              <Text strong>{companyInfo.name}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="归属集团">
              <Tag color="blue">{companyInfo.group}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="通知账号">
              {companyInfo.notifyAccounts.split(';').map((a) => (
                <Tag key={a} style={{ marginBottom: 4 }}>
                  {a}
                </Tag>
              ))}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">{companyInfo.createdAt}</Descriptions.Item>
          </Descriptions>
          <div style={{ marginTop: 16 }}>
            <Button icon={<EditOutlined />}>编辑公司信息</Button>
          </div>
        </Card>
      ),
    },
    {
      key: 'personal',
      label: '个人设置',
      children: (
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={8}>
            <Card bordered={false} style={{ textAlign: 'center', borderRadius: 8 }}>
              <Avatar
                size={80}
                style={{ background: '#722ed1', fontSize: 32, marginBottom: 16 }}
              >
                M
              </Avatar>
              <Title level={4} style={{ margin: 0 }}>
                {personalInfo.username}
              </Title>
              <Tag color="blue" style={{ marginTop: 8 }}>
                {personalInfo.role}
              </Tag>
              <div style={{ marginTop: 16 }}>
                <Button icon={<LockOutlined />} onClick={() => setPwdOpen(true)}>
                  修改密码
                </Button>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={16}>
            <Card bordered={false} style={{ borderRadius: 8 }}>
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
                <Descriptions.Item label="最近登录时间">
                  {personalInfo.lastLoginTime}
                </Descriptions.Item>
                <Descriptions.Item label="账号创建时间">
                  {personalInfo.createdAt}
                </Descriptions.Item>
                <Descriptions.Item label="MFA 认证">
                  <Space>
                    <Switch defaultChecked={personalInfo.mfaEnabled} />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      （当前角色MFA为【可选】，可自行开启）
                    </Text>
                  </Space>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>
      ),
    },
  ];

  return (
    <div>
      <Tabs items={tabItems} defaultActiveKey="personal" />

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
