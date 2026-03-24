import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  ConfigProvider,
  DatePicker,
  Descriptions,
  Divider,
  Form,
  Input,
  Modal,
  Radio,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';

const { Text } = Typography;
const CARD_SHADOW = '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)';

const ROLES = ['集团管理员', '公司管理员', '平台管理员'] as const;
type Role = typeof ROLES[number];
const STATUSES = ['启用', '停用'] as const;
type UserStatus = typeof STATUSES[number];

const GROUPS = ['UU Talk', 'Hey Talk', 'Star Game'];
const COMPANIES: Record<string, string[]> = {
  'UU Talk': ['滴滴答答', 'UU Talk'],
  'Hey Talk': ['Hey Talk Corp'],
  'Star Game': ['Star Tech', 'Nova Corp'],
};

const roleColors: Record<Role, string> = {
  '集团管理员': 'blue',
  '公司管理员': 'green',
  '平台管理员': 'red',
};

interface UserRecord {
  id: string;
  username: string;
  phone: string;
  email: string;
  group: string;
  company: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
  ipRestrict: boolean;
  ipWhitelist: string;
  validPeriod: string;
  notifyAccounts: string;
}

const mockData: UserRecord[] = [
  { id: 'U001', username: 'Miya', phone: '+65 8991 0293', email: 'miya@cyberbot.sg', group: 'UU Talk', company: '滴滴答答', role: '集团管理员', status: '启用', createdAt: '2025-11-23 13:56:21', ipRestrict: false, ipWhitelist: '', validPeriod: '永久有效', notifyAccounts: '@miya_miya' },
  { id: 'U002', username: 'Tom Admin', phone: '+65 8765 4321', email: 'tom@uutalk.com', group: 'UU Talk', company: 'UU Talk', role: '公司管理员', status: '启用', createdAt: '2025-10-01 09:00:00', ipRestrict: true, ipWhitelist: '104.28.0.0/16', validPeriod: '2026-12-31', notifyAccounts: '@tom_admin' },
  { id: 'U003', username: 'Jack', phone: '+86 138 0001 0001', email: 'jack@stargame.io', group: 'Star Game', company: 'Star Tech', role: '公司管理员', status: '停用', createdAt: '2025-09-15 14:30:00', ipRestrict: false, ipWhitelist: '', validPeriod: '永久有效', notifyAccounts: '' },
  { id: 'U004', username: 'Alice', phone: '+1 415 555 0101', email: 'alice@heytalk.com', group: 'Hey Talk', company: 'Hey Talk Corp', role: '公司管理员', status: '启用', createdAt: '2025-08-20 11:00:00', ipRestrict: false, ipWhitelist: '', validPeriod: '永久有效', notifyAccounts: '@alice_finance' },
  { id: 'U005', username: 'SysAdmin', phone: '+65 6888 8888', email: 'sysadmin@platform.sg', group: '全部集团', company: '全部公司', role: '平台管理员', status: '启用', createdAt: '2025-07-01 08:00:00', ipRestrict: true, ipWhitelist: '203.0.113.0/24', validPeriod: '永久有效', notifyAccounts: '' },
];

const radioTheme = { components: { Radio: { colorPrimary: '#722ed1', buttonSolidCheckedBg: '#ffffff', buttonSolidCheckedColor: '#722ed1', buttonCheckedBg: '#ffffff' } } };

const UserManagePage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState<string | undefined>();
  const [companyFilter, setCompanyFilter] = useState<string | undefined>();
  const [roleFilter, setRoleFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string>('全部');

  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserRecord | null>(null);

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [ipRestrict, setIpRestrict] = useState(false);

  const filtered = mockData.filter((r) => {
    const kw = search.toLowerCase();
    return (
      (statusFilter === '全部' || r.status === statusFilter) &&
      (!groupFilter || r.group === groupFilter) &&
      (!companyFilter || r.company === companyFilter) &&
      (!roleFilter || r.role === roleFilter) &&
      (!kw || r.username.toLowerCase().includes(kw) || r.email.toLowerCase().includes(kw) || r.phone.includes(kw))
    );
  });

  const openEdit = (r: UserRecord) => {
    setCurrentUser(r);
    setIpRestrict(r.ipRestrict);
    editForm.setFieldsValue({
      role: r.role,
      status: r.status,
      validPeriod: r.validPeriod,
      ipRestrict: r.ipRestrict,
      ipWhitelist: r.ipWhitelist,
    });
    setEditOpen(true);
  };

  const columns: ColumnsType<UserRecord> = [
    { title: '用户名', dataIndex: 'username', width: 110, render: (v) => <Text strong>{v}</Text> },
    { title: '手机号', dataIndex: 'phone', width: 150 },
    { title: '邮箱', dataIndex: 'email', width: 170, ellipsis: true },
    { title: '归属集团', dataIndex: 'group', width: 100 },
    { title: '归属公司', dataIndex: 'company', width: 110 },
    {
      title: '角色', dataIndex: 'role', width: 110,
      render: (v: Role) => <Tag color={roleColors[v]}>{v}</Tag>,
    },
    {
      title: '状态', dataIndex: 'status', width: 80,
      render: (v: UserStatus) => <Tag color={v === '启用' ? 'success' : 'default'}>{v}</Tag>,
    },
    { title: '创建时间', dataIndex: 'createdAt', width: 160 },
    {
      title: '操作', width: 110, fixed: 'right' as const,
      render: (_, r) => (
        <Space size={0}>
          <Button type="link" size="small" style={{ padding: '0 4px' }}
            onClick={() => { setCurrentUser(r); setViewOpen(true); }}>查看</Button>
          <Button type="link" size="small" style={{ padding: '0 4px' }}
            onClick={() => openEdit(r)}>编辑</Button>
        </Space>
      ),
    },
  ];

  const statsData = [
    { label: '启用', count: mockData.filter(r => r.status === '启用').length, color: '#52c41a' },
    { label: '停用', count: mockData.filter(r => r.status === '停用').length, color: '#8c8c8c' },
  ];

  return (
    <Space direction="vertical" size={16} style={{ display: 'flex' }}>
      {/* 统计条 */}
      <Row gutter={[12, 12]}>
        {statsData.map((s) => (
          <Col key={s.label} xs={12} sm={6}>
            <Card bordered={false} style={{ borderRadius: 10, boxShadow: CARD_SHADOW }}>
              <Text type="secondary" style={{ fontSize: 12 }}>{s.label}账户</Text>
              <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.count}</div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 说明 */}
      <div style={{ background: '#f6f8ff', border: '1px solid #d6e4ff', borderRadius: 6, padding: '10px 16px', fontSize: 12, color: '#595959', lineHeight: 1.8 }}>
        <div>1. 集团管理员可查看本集团管理员账号及下属公司管理员账号</div>
        <div>2. 同一公司管理员之间数据不做权限隔离，功能模块权限按照授予【角色】控制</div>
        <div>3. 数据权限由【归属集团】和【归属公司】进行控制，功能权限由【角色】进行控制</div>
      </div>

      {/* 筛选 + 操作 */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
        <Space direction="vertical" size={12} style={{ display: 'flex', marginBottom: 16 }}>
          <Space size={24} wrap align="center">
            <Space size={8} align="center">
              <Text style={{ whiteSpace: 'nowrap' }}>状态：</Text>
              <ConfigProvider theme={radioTheme}>
                <Radio.Group value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} buttonStyle="outline">
                  {['全部', '启用', '停用'].map((v) => (
                    <Radio.Button key={v} value={v} style={statusFilter === v ? { color: '#722ed1', borderColor: '#722ed1' } : {}}>{v}</Radio.Button>
                  ))}
                </Radio.Group>
              </ConfigProvider>
            </Space>
            <Space size={8} align="center">
              <Text style={{ whiteSpace: 'nowrap' }}>搜索：</Text>
              <Input
                prefix={<SearchOutlined />}
                placeholder="用户名、邮箱、手机号"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                allowClear
                style={{ width: 220 }}
              />
            </Space>
          </Space>
          <Space size={16} wrap align="center">
            <Space size={8} align="center">
              <Text style={{ whiteSpace: 'nowrap' }}>归属集团：</Text>
              <Select placeholder="请选择" value={groupFilter} onChange={(v) => { setGroupFilter(v); setCompanyFilter(undefined); }} allowClear style={{ width: 160 }}
                options={GROUPS.map(g => ({ value: g, label: g }))} />
            </Space>
            <Space size={8} align="center">
              <Text style={{ whiteSpace: 'nowrap' }}>归属公司：</Text>
              <Select placeholder="请选择" value={companyFilter} onChange={setCompanyFilter} allowClear style={{ width: 160 }}
                options={(groupFilter ? COMPANIES[groupFilter] ?? [] : Object.values(COMPANIES).flat()).map(c => ({ value: c, label: c }))} />
            </Space>
            <Space size={8} align="center">
              <Text style={{ whiteSpace: 'nowrap' }}>角色：</Text>
              <Select placeholder="请选择" value={roleFilter} onChange={setRoleFilter} allowClear style={{ width: 140 }}
                options={ROLES.map(r => ({ value: r, label: r }))} />
            </Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { createForm.resetFields(); setSelectedRole(''); setIpRestrict(false); setCreateOpen(true); }}>
              创建用户
            </Button>
          </Space>
        </Space>

        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          size="middle"
          scroll={{ x: 1100 }}
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
          rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
        />
      </Card>

      {/* ── 查看弹窗 ─────────────────────────────────────────────── */}
      <Modal
        title="用户详情"
        open={viewOpen}
        onCancel={() => setViewOpen(false)}
        footer={<Button onClick={() => setViewOpen(false)}>关 闭</Button>}
        width={520}
      >
        {currentUser && (
          <Descriptions column={1} bordered size="small" style={{ marginTop: 16 }}>
            <Descriptions.Item label="用户名">{currentUser.username}</Descriptions.Item>
            <Descriptions.Item label="手机号">{currentUser.phone}</Descriptions.Item>
            <Descriptions.Item label="邮箱">{currentUser.email}</Descriptions.Item>
            <Descriptions.Item label="归属集团">{currentUser.group}</Descriptions.Item>
            <Descriptions.Item label="归属公司">{currentUser.company}</Descriptions.Item>
            <Descriptions.Item label="角色"><Tag color={roleColors[currentUser.role]}>{currentUser.role}</Tag></Descriptions.Item>
            <Descriptions.Item label="状态"><Tag color={currentUser.status === '启用' ? 'success' : 'default'}>{currentUser.status}</Tag></Descriptions.Item>
            <Descriptions.Item label="账户有效期">{currentUser.validPeriod}</Descriptions.Item>
            <Descriptions.Item label="IP限制">{currentUser.ipRestrict ? '已开启' : '未开启'}</Descriptions.Item>
            {currentUser.ipRestrict && (
              <Descriptions.Item label="IP白名单">{currentUser.ipWhitelist}</Descriptions.Item>
            )}
            {currentUser.notifyAccounts && (
              <Descriptions.Item label="消息通知">{currentUser.notifyAccounts}</Descriptions.Item>
            )}
            <Descriptions.Item label="创建时间">{currentUser.createdAt}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* ── 编辑弹窗（仅可改角色/状态/有效期/IP限制）────────────── */}
      <Modal
        title="编辑用户"
        open={editOpen}
        onOk={() =>
          editForm.validateFields().then(() => {
            setEditOpen(false);
            message.success('保存成功');
          })
        }
        onCancel={() => setEditOpen(false)}
        okText="保 存"
        cancelText="取 消"
        width={480}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="角色" name="role" rules={[{ required: true }]}>
            <Select options={ROLES.map(r => ({ value: r, label: r }))} />
          </Form.Item>
          <Form.Item label="状态" name="status" rules={[{ required: true }]}>
            <Select options={STATUSES.map(s => ({ value: s, label: s }))} />
          </Form.Item>
          <Form.Item label="账户有效期" name="validPeriod">
            <Select options={[{ value: '永久有效', label: '永久有效' }, { value: '自定义', label: '自定义' }]} />
          </Form.Item>
          <Form.Item label="IP限制" name="ipRestrict" valuePropName="checked">
            <Switch onChange={setIpRestrict} />
          </Form.Item>
          {ipRestrict && (
            <Form.Item label="IP白名单" name="ipWhitelist" rules={[{ required: true, message: '请输入IP白名单' }]}>
              <Input.TextArea rows={2} placeholder="每行一个 IP 或 CIDR，例如：104.28.0.0/16" />
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* ── 创建用户弹窗 ─────────────────────────────────────────── */}
      <Modal
        title="创建用户"
        open={createOpen}
        onOk={() =>
          createForm.validateFields().then(() => {
            setCreateOpen(false);
            message.success('用户创建成功');
          })
        }
        onCancel={() => setCreateOpen(false)}
        okText="创 建"
        cancelText="取 消"
        width={520}
        destroyOnClose
      >
        <Form form={createForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="用户名" name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item label="登录密码" name="password" rules={[{ required: true, min: 8, message: '密码至少8位' }]}>
            <Input.Password placeholder="请输入登录密码（至少8位）" />
          </Form.Item>
          <Form.Item
            label="再次输入密码"
            name="confirmPwd"
            rules={[
              { required: true },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) return Promise.resolve();
                  return Promise.reject(new Error('两次密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="请再次输入密码" />
          </Form.Item>

          <Divider style={{ margin: '12px 0' }} />

          <Form.Item label="归属集团" name="group" rules={[{ required: true }]}>
            <Select placeholder="请选择归属集团" options={[...GROUPS, '全部集团'].map(g => ({ value: g, label: g }))} />
          </Form.Item>
          <Form.Item label="归属公司" name="company" rules={[{ required: true }]}>
            <Select placeholder="请选择归属公司" options={[...Object.values(COMPANIES).flat(), '全部公司'].map(c => ({ value: c, label: c }))} />
          </Form.Item>
          <Form.Item label="角色" name="role" rules={[{ required: true }]}>
            <Select placeholder="请选择角色" options={ROLES.map(r => ({ value: r, label: r }))} onChange={setSelectedRole} />
          </Form.Item>
          <Form.Item label="状态" name="status" initialValue="启用" rules={[{ required: true }]}>
            <Select options={STATUSES.map(s => ({ value: s, label: s }))} />
          </Form.Item>

          <Divider style={{ margin: '12px 0' }} />

          <Form.Item label="账户有效期" name="validPeriod" initialValue="永久有效">
            <Select options={[{ value: '永久有效', label: '永久有效' }, { value: '自定义', label: '自定义' }]}
              onChange={(v) => { if (v !== '自定义') createForm.setFieldValue('expireDate', undefined); }} />
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.validPeriod !== cur.validPeriod}>
            {({ getFieldValue }) => getFieldValue('validPeriod') === '自定义' ? (
              <Form.Item label="到期时间" name="expireDate" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            ) : null}
          </Form.Item>

          <Form.Item label="IP限制" name="ipRestrict" valuePropName="checked">
            <Switch onChange={setIpRestrict} />
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.ipRestrict !== cur.ipRestrict}>
            {({ getFieldValue }) => getFieldValue('ipRestrict') ? (
              <Form.Item label="IP白名单" name="ipWhitelist" rules={[{ required: true }]}>
                <Input.TextArea rows={2} placeholder="每行一个 IP 或 CIDR" />
              </Form.Item>
            ) : null}
          </Form.Item>

          {selectedRole === '公司管理员' && (
            <Form.Item label="消息通知账号" name="notifyAccounts" rules={[{ required: true, message: '公司管理员必须配置消息通知账号' }]}>
              <Input placeholder="请输入APP用户名，如 @miya_miya" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </Space>
  );
};

export default UserManagePage;
