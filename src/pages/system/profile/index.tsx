import { LockOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  Modal,
  Space,
  Switch,
  Tag,
  Typography,
  message,
} from 'antd';
import React, { useState } from 'react';
import { getMockAuth, ROLE_LABELS, ROLE_ROUTES, type Role } from '../../../utils/auth';

const { Text } = Typography;

const CARD_SHADOW = '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)';

// 路由 → 模块名映射
const MODULE_LABELS: Record<string, string> = {
  '/dashboard':              '集团仪表盘',
  '/company/list':           '公司清单',
  '/company/detail':         '公司详情',
  '/company/transfer':       '内部划转',
  '/finance/revenue':        '集团收益',
  '/finance/wallet':         '集团钱包',
  '/finance/wallet/bind-account': '钱包绑定',
  '/dashboard/company':      '公司仪表盘',
  '/company/shareholding':   '公司持股',
  '/company/revenue':        '公司收益',
  '/enterprise/list':        '企业清单',
  '/enterprise/invite':      '邀请企业',
  '/enterprise/detail':      '企业详情',
  '/orders/lottery':         '东方彩票订单',
  '/commission':             '佣金订单',
  '/finance/my-wallet':      '公司钱包',
  '/system/notifications':   '通知管理',
  '/system/users':           '用户管理',
  '/system/logs':            '系统日志',
};

const ProfilePage: React.FC = () => {
  const [pwdOpen, setPwdOpen] = useState(false);
  const [pwdForm] = Form.useForm();

  const auth = getMockAuth();
  const roles = auth.roles;

  const personalInfo = {
    username: 'Miya',
    validPeriod: '永久有效',
    ipRestrict: false,
    ipWhitelist: '',
    lastLoginIp: '104.28.222.12',
    lastLoginCountry: '🇸🇬 新加坡',
    lastLoginTime: '2025-11-23 13:56:21',
    createdAt: '2025-11-23 13:56:21',
  };

  const [inAppEnabled, setInAppEnabled] = useState(true);
  const handleInAppToggle = (checked: boolean) => {
    setInAppEnabled(checked);
    message.success(checked ? '站内通知已开启' : '站内通知已关闭');
  };

  return (
    <div>
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW, maxWidth: 680 }}>
        <Descriptions column={1} labelStyle={{ color: '#8c8c8c', width: 130, whiteSpace: 'nowrap' }} bordered>
          <Descriptions.Item label="用户名">{personalInfo.username}</Descriptions.Item>
          {auth.level === 'group' && (
            <Descriptions.Item label="归属集团">{(auth as { groupId: string }).groupId}</Descriptions.Item>
          )}
          {auth.level === 'company' && (
            <Descriptions.Item label="归属公司">{(auth as { companyId: string }).companyId}</Descriptions.Item>
          )}

          {/* ── 角色 ── */}
          <Descriptions.Item label="角色">
            <Space size={[4, 4]} wrap>
              {roles.map((role: Role) => (
                <Tag key={role} style={{ margin: 0 }}>{ROLE_LABELS[role]}</Tag>
              ))}
            </Space>
          </Descriptions.Item>

          {/* ── 模块权限 ── */}
          <Descriptions.Item label="模块权限">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {roles.map((role: Role) => {
                const modules = (ROLE_ROUTES[role] ?? []).map(r => MODULE_LABELS[r] ?? r);
                return (
                  <div key={role}>
                    <Text type="secondary" style={{ fontSize: 12 }}>{ROLE_LABELS[role]}：</Text>
                    <div style={{ marginTop: 4 }}>
                      <Space size={[4, 4]} wrap>
                        {modules.map(m => <Tag key={m} style={{ margin: 0 }}>{m}</Tag>)}
                      </Space>
                    </div>
                  </div>
                );
              })}
            </div>
          </Descriptions.Item>

          <Descriptions.Item label="账户有效期">
            <Text type="success">{personalInfo.validPeriod}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="IP 限制">
            {personalInfo.ipRestrict ? '已开启' : '未开启'}
          </Descriptions.Item>
          <Descriptions.Item label="最近登录 IP">
            <Space>
              <Text style={{ fontFamily: 'monospace' }}>{personalInfo.lastLoginIp}</Text>
              <Text>{personalInfo.lastLoginCountry}</Text>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="最近登录时间">{personalInfo.lastLoginTime}</Descriptions.Item>
          <Descriptions.Item label="账号创建时间">{personalInfo.createdAt}</Descriptions.Item>
          <Descriptions.Item label="站内通知">
            <Switch checked={inAppEnabled} onChange={handleInAppToggle} />
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
