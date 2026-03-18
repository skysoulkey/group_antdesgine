import { useState } from 'react';
import { Card, Tabs, Form, Input, InputNumber, Switch, Select, Checkbox, Button, Alert, Divider, message, Row, Col } from 'antd';
import { SecurityScanOutlined, SettingOutlined, BellOutlined } from '@ant-design/icons';

const TIMEZONES = ['Asia/Singapore', 'Asia/Shanghai', 'Asia/Tokyo', 'UTC', 'America/New_York', 'Europe/London'];
const DATE_FORMATS = ['YYYY-MM-DD HH:mm:ss', 'MM/DD/YYYY HH:mm:ss', 'DD/MM/YYYY HH:mm:ss'];
const NOTIFY_EVENTS = [
  { label: '登录失败', value: 'login_fail' },
  { label: '大额转账', value: 'large_transfer' },
  { label: '新企业注册', value: 'new_enterprise' },
  { label: '权限变更', value: 'permission_change' },
  { label: '系统错误', value: 'system_error' },
  { label: '账户锁定', value: 'account_lock' },
];

export default function SystemSettings() {
  const [securityForm] = Form.useForm();
  const [generalForm] = Form.useForm();
  const [notifForm] = Form.useForm();
  const [ipWhitelistEnabled, setIpWhitelistEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [telegramEnabled, setTelegramEnabled] = useState(false);

  const handleSaveSecurity = () => {
    securityForm.validateFields().then(() => {
      message.success('安全设置已保存');
    });
  };

  const handleSaveGeneral = () => {
    generalForm.validateFields().then(() => {
      message.success('通用设置已保存');
    });
  };

  const handleSaveNotif = () => {
    notifForm.validateFields().then(() => {
      message.success('通知配置已保存');
    });
  };

  const tabItems = [
    {
      key: 'security',
      label: (
        <span><SecurityScanOutlined style={{ marginRight: 6 }} />安全设置</span>
      ),
      children: (
        <div>
          <Alert
            type="warning"
            message="修改安全设置将立即对所有账号生效，请谨慎操作"
            showIcon
            style={{ marginBottom: 24 }}
          />
          <Form form={securityForm} layout="vertical"
            initialValues={{ loginFailMax: 5, lockoutMinutes: 30, sessionTimeoutHours: 8, passwordExpireDays: 90, mfaRequired: false, ipWhitelistEnabled: false }}>
            <Divider orientation="left">登录安全</Divider>
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item label="登录失败锁定次数" name="loginFailMax"
                  tooltip="超过此次数后账号将被临时锁定"
                  rules={[{ required: true, message: '请输入次数' }]}>
                  <InputNumber min={1} max={20} style={{ width: '100%' }} addonAfter="次" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="账号锁定时长" name="lockoutMinutes"
                  rules={[{ required: true, message: '请输入锁定时长' }]}>
                  <InputNumber min={1} style={{ width: '100%' }} addonAfter="分钟" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="会话超时时长" name="sessionTimeoutHours"
                  rules={[{ required: true, message: '请输入超时时长' }]}>
                  <InputNumber min={1} max={72} style={{ width: '100%' }} addonAfter="小时" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="密码有效期" name="passwordExpireDays"
                  tooltip="设置为 0 表示永不过期">
                  <InputNumber min={0} style={{ width: '100%' }} addonAfter="天（0=永久）" />
                </Form.Item>
              </Col>
            </Row>
            <Divider orientation="left">访问控制</Divider>
            <Form.Item label="强制 MFA 验证" name="mfaRequired" valuePropName="checked">
              <Switch checkedChildren="开启" unCheckedChildren="关闭" />
            </Form.Item>
            <Form.Item label="启用 IP 白名单" name="ipWhitelistEnabled" valuePropName="checked">
              <Switch checkedChildren="开启" unCheckedChildren="关闭"
                onChange={v => setIpWhitelistEnabled(v)} />
            </Form.Item>
            {ipWhitelistEnabled && (
              <Form.Item label="IP 白名单地址" name="ipWhitelist"
                tooltip="多个 IP 地址请换行分隔">
                <Input.TextArea rows={4} placeholder="请输入 IP 地址，每行一个&#10;例如：192.168.1.1" />
              </Form.Item>
            )}
            <Form.Item>
              <Button type="primary" onClick={handleSaveSecurity}>保存安全设置</Button>
            </Form.Item>
          </Form>
        </div>
      ),
    },
    {
      key: 'general',
      label: (
        <span><SettingOutlined style={{ marginRight: 6 }} />通用设置</span>
      ),
      children: (
        <div>
          <Alert
            type="info"
            message="通用设置修改后将影响平台整体显示与行为"
            showIcon
            style={{ marginBottom: 24 }}
          />
          <Form form={generalForm} layout="vertical"
            initialValues={{ platformName: '集团管理系统', timezone: 'Asia/Singapore', dateFormat: 'YYYY-MM-DD HH:mm:ss', currency: 'USDT', language: 'zh-CN' }}>
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item label="平台名称" name="platformName" rules={[{ required: true, message: '请输入平台名称' }]}>
                  <Input placeholder="请输入平台名称" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="系统语言" name="language">
                  <Select options={[{ label: '简体中文', value: 'zh-CN' }, { label: 'English', value: 'en-US' }]} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="系统时区" name="timezone" rules={[{ required: true, message: '请选择时区' }]}>
                  <Select options={TIMEZONES.map(t => ({ label: t, value: t }))} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="时间格式" name="dateFormat">
                  <Select options={DATE_FORMATS.map(f => ({ label: f, value: f }))} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="默认货币" name="currency">
                  <Select options={[{ label: 'USDT', value: 'USDT' }, { label: 'PEA', value: 'PEA' }]} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item>
              <Button type="primary" onClick={handleSaveGeneral}>保存通用设置</Button>
            </Form.Item>
          </Form>
        </div>
      ),
    },
    {
      key: 'notification',
      label: (
        <span><BellOutlined style={{ marginRight: 6 }} />通知配置</span>
      ),
      children: (
        <div>
          <Alert
            type="info"
            message="配置通知渠道后，系统将在指定事件发生时自动发送通知"
            showIcon
            style={{ marginBottom: 24 }}
          />
          <Form form={notifForm} layout="vertical"
            initialValues={{ emailEnabled: false, telegramEnabled: false, emailPort: 465, notifyEvents: ['login_fail', 'large_transfer'] }}>
            <Divider orientation="left">邮件通知</Divider>
            <Form.Item label="启用邮件通知" name="emailEnabled" valuePropName="checked">
              <Switch checkedChildren="开启" unCheckedChildren="关闭" onChange={v => setEmailEnabled(v)} />
            </Form.Item>
            {emailEnabled && (
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item label="SMTP 服务器" name="emailSMTP" rules={[{ required: true, message: '请输入 SMTP 地址' }]}>
                    <Input placeholder="例如：smtp.gmail.com" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="端口" name="emailPort" rules={[{ required: true, message: '请输入端口' }]}>
                    <InputNumber min={1} max={65535} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="发件人地址" name="emailSender" rules={[{ type: 'email', message: '请输入有效邮箱' }]}>
                    <Input placeholder="例如：noreply@example.com" />
                  </Form.Item>
                </Col>
              </Row>
            )}
            <Divider orientation="left">Telegram 通知</Divider>
            <Form.Item label="启用 Telegram 通知" name="telegramEnabled" valuePropName="checked">
              <Switch checkedChildren="开启" unCheckedChildren="关闭" onChange={v => setTelegramEnabled(v)} />
            </Form.Item>
            {telegramEnabled && (
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item label="Bot Token" name="telegramBotToken" rules={[{ required: true, message: '请输入 Bot Token' }]}>
                    <Input.Password placeholder="请输入 Telegram Bot Token" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Chat ID" name="telegramChatId" rules={[{ required: true, message: '请输入 Chat ID' }]}>
                    <Input placeholder="请输入 Chat ID" />
                  </Form.Item>
                </Col>
              </Row>
            )}
            <Divider orientation="left">通知事件</Divider>
            <Form.Item label="触发通知的事件" name="notifyEvents">
              <Checkbox.Group options={NOTIFY_EVENTS} style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" onClick={handleSaveNotif}>保存通知配置</Button>
            </Form.Item>
          </Form>
        </div>
      ),
    },
  ];

  return (
    <Card bordered={false}>
      <Tabs items={tabItems} size="large" />
    </Card>
  );
}
