import {
  ApartmentOutlined,
  BankOutlined,
  CopyOutlined,
  PlusOutlined,
  QrcodeOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons';
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
  Tree,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useMemo, useState } from 'react';
import { type Role } from '../../utils/auth';

const isExpired = (validPeriod: string): boolean => {
  if (validPeriod === '永久有效') return false;
  return new Date(validPeriod) < new Date(new Date().toDateString());
};
// 当前登录用户所属集团（mock）
const CURRENT_GROUP = 'UU Talk';

const { Text } = Typography;
const CARD_SHADOW = '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)';

const radioTheme = {
  components: {
    Radio: {
      buttonSolidCheckedBg: '#1677ff',
      buttonSolidCheckedHoverBg: '#4096ff',
      buttonSolidCheckedActiveBg: '#0958d9',
      buttonSolidCheckedColor: '#fff',
      colorPrimary: '#1677ff',
    },
  },
};

const ROLES = ['集团管理员', '公司管理员', '平台管理员'] as const;
type UserRole = typeof ROLES[number];
const STATUSES = ['启用', '停用'] as const;
type UserStatus = typeof STATUSES[number];

const GROUPS = ['UU Talk', 'Hey Talk', 'Star Game'];
const COMPANIES: Record<string, string[]> = {
  'UU Talk':   ['滴滴答答', 'UU Talk'],
  'Hey Talk':  ['Hey Talk Corp'],
  'Star Game': ['Star Tech', 'Nova Corp'],
};

const roleColors: Record<UserRole, string> = {
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
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  ipRestrict: boolean;
  ipWhitelist: string;
  validPeriod: string;
  notifyAccounts: string;
}

const initialData: UserRecord[] = [
  // U001 — 启用，永久有效，正常
  { id: 'U001', username: 'Miya', phone: '+65 8991 0293', email: 'miya@cyberbot.sg', group: 'UU Talk', company: '滴滴答答', role: '集团管理员', status: '启用', createdAt: '2025-11-23 13:56:21', ipRestrict: false, ipWhitelist: '', validPeriod: '永久有效', notifyAccounts: '@miya_miya' },
  // U002 — 启用，有效期内，正常
  { id: 'U002', username: 'Tom Admin', phone: '+65 8765 4321', email: 'tom@uutalk.com', group: 'UU Talk', company: 'UU Talk', role: '公司管理员', status: '启用', createdAt: '2025-10-01 09:00:00', ipRestrict: true, ipWhitelist: '104.28.0.0/16', validPeriod: '2026-12-31', notifyAccounts: '@tom_admin' },
  // U003 — 停用（管理员手动停用）
  { id: 'U003', username: 'Jack', phone: '+86 138 0001 0001', email: 'jack@stargame.io', group: 'Star Game', company: 'Star Tech', role: '公司管理员', status: '停用', createdAt: '2025-09-15 14:30:00', ipRestrict: false, ipWhitelist: '', validPeriod: '永久有效', notifyAccounts: '' },
  // U004 — 启用，已过期
  { id: 'U004', username: 'Alice', phone: '+1 415 555 0101', email: 'alice@heytalk.com', group: 'Hey Talk', company: 'Hey Talk Corp', role: '公司管理员', status: '启用', createdAt: '2025-08-20 11:00:00', ipRestrict: false, ipWhitelist: '', validPeriod: '2025-01-01', notifyAccounts: '@alice_finance' },
  // U005 — 启用，永久有效
  { id: 'U005', username: 'SysAdmin', phone: '+65 6888 8888', email: 'sysadmin@platform.sg', group: '全部集团', company: '全部公司', role: '平台管理员', status: '启用', createdAt: '2025-07-01 08:00:00', ipRestrict: true, ipWhitelist: '203.0.113.0/24', validPeriod: '永久有效', notifyAccounts: '' },
  // U006 — 启用，已过期
  { id: 'U006', username: 'Leo', phone: '+65 9123 4567', email: 'leo@uutalk.com', group: 'UU Talk', company: 'UU Talk', role: '公司管理员', status: '启用', createdAt: '2025-06-10 10:00:00', ipRestrict: false, ipWhitelist: '', validPeriod: '2025-03-01', notifyAccounts: '@leo_ops' },
  // U007 — 停用，已过期（停用且到期）
  { id: 'U007', username: 'Nina', phone: '+86 139 8888 7777', email: 'nina@stargame.io', group: 'Star Game', company: 'Nova Corp', role: '公司管理员', status: '停用', createdAt: '2025-05-20 09:30:00', ipRestrict: false, ipWhitelist: '', validPeriod: '2025-06-30', notifyAccounts: '' },
  // U008 — 集团管理员，启用，有效期内，正常
  { id: 'U008', username: 'Ryan', phone: '+65 8234 5678', email: 'ryan@heytalk.com', group: 'Hey Talk', company: 'Hey Talk Corp', role: '集团管理员', status: '启用', createdAt: '2025-04-15 08:00:00', ipRestrict: true, ipWhitelist: '192.168.1.0/24', validPeriod: '2027-06-30', notifyAccounts: '@ryan_admin' },
  // U009 — 平台管理员，启用，永久有效，正常
  { id: 'U009', username: 'Eve', phone: '+65 6777 9999', email: 'eve@platform.sg', group: '全部集团', company: '全部公司', role: '平台管理员', status: '启用', createdAt: '2025-03-01 12:00:00', ipRestrict: false, ipWhitelist: '', validPeriod: '永久有效', notifyAccounts: '' },
  // U010 — 启用，即将到期（2026-04-30），正常（用于对比）
  { id: 'U010', username: 'Mark', phone: '+86 188 0000 1234', email: 'mark@stargame.io', group: 'Star Game', company: 'Star Tech', role: '公司管理员', status: '启用', createdAt: '2025-02-18 15:45:00', ipRestrict: false, ipWhitelist: '', validPeriod: '2026-04-30', notifyAccounts: '@mark_ops' },
];

// ── 集团-公司-管理员 树数据 ────────────────────────────────────────
const buildTreeData = (data: UserRecord[]) => {
  const groups = [...new Set(data.map((r) => r.group))];
  return groups.map((group) => ({
    title: <Text style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{group}</Text>,
    key: `g::${group}`,
    icon: <BankOutlined style={{ color: '#1677ff' }} />,
    children: [...new Set(data.filter((r) => r.group === group).map((r) => r.company))].map(
      (company) => ({
        title: <Text style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{company}</Text>,
        key: `c::${company}`,
        icon: <ApartmentOutlined style={{ color: '#1677ff' }} />,
        children: data
          .filter((r) => r.group === group && r.company === company)
          .map((user) => ({
            title: <Text style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{user.username}</Text>,
            key: `u::${user.id}`,
            icon: <UserOutlined style={{ color: '#52c41a', fontSize: 12 }} />,
          })),
      }),
    ),
  }));
};

const UserManagePage: React.FC = () => {
  const mockRole = (localStorage.getItem('mock_role') ?? 'group_admin') as Role;
  const visibleData = mockRole === 'system_admin'
    ? initialData
    : initialData.filter((r) => r.group === CURRENT_GROUP && r.role !== '集团管理员');
  const [users, setUsers] = useState<UserRecord[]>(visibleData);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string>('全部');
  const [treeSelected, setTreeSelected] = useState<string[]>([]);

  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserRecord | null>(null);

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // create form 联级状态
  const [createRole, setCreateRole] = useState<string>('');
  const [createGroup, setCreateGroup] = useState<string | undefined>();

  const [editIpRestrict, setEditIpRestrict] = useState(false);

  // 创建成功弹窗
  const [successOpen, setSuccessOpen] = useState(false);
  const [createdInfo, setCreatedInfo] = useState<{ username: string; password: string } | null>(null);

  const APP_USERNAME_REGEX = /^@[a-zA-Z0-9_]{2,30}$/;

  const copyCreatedInfo = () => {
    if (!createdInfo) return;
    const text = `登录地址：${window.location.origin}\n用户名：${createdInfo.username}\n密码：${createdInfo.password}`;
    navigator.clipboard.writeText(text).then(() => message.success('已复制到剪贴板'));
  };

  // 树筛选
  const treeFilteredBase = useMemo(() => {
    if (treeSelected.length === 0) return users;
    const key = treeSelected[0];
    if (key.startsWith('g::')) return users.filter((r) => r.group === key.slice(3));
    if (key.startsWith('c::')) return users.filter((r) => r.company === key.slice(3));
    if (key.startsWith('u::')) return users.filter((r) => r.id === key.slice(3));
    return users;
  }, [treeSelected, users]);

  const filtered = treeFilteredBase.filter((r) => {
    const kw = search.toLowerCase();
    const statusMatch =
      statusFilter === '全部'   ? true :
      statusFilter === '已过期' ? isExpired(r.validPeriod) :
      r.status === statusFilter;
    return (
      statusMatch &&
      (!roleFilter || r.role === roleFilter) &&
      (!kw || r.username.toLowerCase().includes(kw) || r.email.toLowerCase().includes(kw) || r.phone.includes(kw))
    );
  });

  const openEdit = (r: UserRecord) => {
    setCurrentUser(r);
    setEditIpRestrict(r.ipRestrict);
    editForm.setFieldsValue({ role: r.role, status: r.status, validPeriod: r.validPeriod, ipRestrict: r.ipRestrict, ipWhitelist: r.ipWhitelist });
    setEditOpen(true);
  };

  const columns: ColumnsType<UserRecord> = [
    { title: '创建时间', dataIndex: 'createdAt', width: 170, sorter: (a, b) => a.createdAt.localeCompare(b.createdAt) },
    { title: '用户名', dataIndex: 'username', width: 110, render: (v) => <Text strong>{v}</Text> },
    { title: '归属集团', dataIndex: 'group', width: 100 },
    { title: '归属公司', dataIndex: 'company', width: 110 },
    { title: '角色', dataIndex: 'role', width: 110 },
    {
      title: '状态', dataIndex: 'status', width: 130,
      render: (v: UserStatus, r: UserRecord) => (
        <Space size={4} wrap>
          <Tag color={v === '启用' ? 'success' : 'default'}>{v}</Tag>
          {isExpired(r.validPeriod) && <Tag color="warning">已过期</Tag>}
        </Space>
      ),
    },
    { title: '有效期', dataIndex: 'validPeriod', width: 120 },
    {
      title: '操作', width: 170, fixed: 'right' as const,
      render: (_, r) => {
        // 集团管理员只能操作公司管理员
        const canManage = mockRole === 'system_admin' || (mockRole === 'group_admin' && r.role === '公司管理员');
        return (
          <Space size={0}>
            <Button type="link" size="small" style={{ padding: '0 4px' }} onClick={() => { setCurrentUser(r); setViewOpen(true); }}>查看</Button>
            {canManage && (
              <Button type="link" size="small" style={{ padding: '0 4px' }} onClick={() => openEdit(r)}>编辑</Button>
            )}
          </Space>
        );
      },
    },
  ];

  const treeData = useMemo(() => buildTreeData(users), [users]);

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>
      {/* ── 账号目录树 ─────────────────────────────────────────────── */}
      <div style={{ width: 240, flexShrink: 0 }}>
        <Card
          bordered={false}
          style={{ borderRadius: 12, boxShadow: CARD_SHADOW, height: '100%' }}
          styles={{ body: { padding: '12px 8px' } }}
        >
          <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', fontWeight: 600, padding: '0 8px 10px', letterSpacing: 0.5 }}>
            账号目录
          </div>
          <Tree
            showIcon
            treeData={treeData}
            selectedKeys={treeSelected}
            defaultExpandAll
            onSelect={(keys) => setTreeSelected(keys as string[])}
            style={{ fontSize: 13 }}
          />
        </Card>
      </div>

      {/* ── 主内容区 ─────────────────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Space direction="vertical" size={16} style={{ display: 'flex' }}>
          {/* 说明 */}
          <div style={{ background: '#f6f8ff', border: '1px solid #d6e4ff', borderRadius: 6, padding: '10px 16px', fontSize: 12, color: '#595959', lineHeight: 1.8 }}>
            <div>1. 集团管理员可查看本集团管理员账号及下属公司管理员账号</div>
            <div>2. 同一公司管理员之间数据不做权限隔离，功能模块权限按照授予【角色】控制</div>
            <div>3. 数据权限由【归属集团】和【归属公司】进行控制，功能权限由【角色】进行控制</div>
          </div>

          {/* 筛选 + 操作 */}
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
            <Space size={16} wrap align="center" style={{ marginBottom: 16 }}>
              <ConfigProvider theme={radioTheme}>
                <Radio.Group value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} buttonStyle="solid">
                  <Radio.Button value="全部">全部</Radio.Button>
                  <Radio.Button value="启用">启用</Radio.Button>
                  <Radio.Button value="停用">停用</Radio.Button>
                  <Radio.Button value="已过期">已过期</Radio.Button>
                </Radio.Group>
              </ConfigProvider>
              <Select
                placeholder="请选择角色"
                value={roleFilter}
                onChange={setRoleFilter}
                allowClear
                style={{ width: 130 }}
                options={ROLES.map((r) => ({ value: r, label: r }))}
              />
              <Input
                suffix={<SearchOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
                placeholder="用户名、邮箱、手机号"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                allowClear
                style={{ width: 220 }}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  createForm.resetFields();
                  if (mockRole === 'group_admin') {
                    setCreateRole('公司管理员');
                    setCreateGroup(CURRENT_GROUP);
                    createForm.setFieldsValue({ role: '公司管理员', group: CURRENT_GROUP });
                  } else {
                    setCreateRole('');
                    setCreateGroup(undefined);
                  }
                  setCreateOpen(true);
                }}
              >
                创建用户
              </Button>
            </Space>

            <Table
              columns={columns}
              dataSource={filtered}
              rowKey="id"
              size="middle"
              scroll={{ x: 1200 }}
              pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
              rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
            />
          </Card>
        </Space>
      </div>

      {/* ── 查看弹窗 ─────────────────────────────────────────────── */}
      <Modal
        title="用户详情"
        open={viewOpen}
        onCancel={() => setViewOpen(false)}
        footer={<Button onClick={() => setViewOpen(false)}>关 闭</Button>}
        width={520}
      >
          {(() => {
          const u = users.find((x) => x.id === currentUser?.id) ?? currentUser;
          return u ? (
            <Descriptions column={1} bordered size="small" style={{ marginTop: 16 }}
              labelStyle={{ whiteSpace: 'nowrap' }}>
              <Descriptions.Item label="用户名">{u.username}</Descriptions.Item>
              <Descriptions.Item label="手机号">{u.phone}</Descriptions.Item>
              <Descriptions.Item label="邮箱">{u.email}</Descriptions.Item>
              <Descriptions.Item label="归属集团">{u.group}</Descriptions.Item>
              <Descriptions.Item label="归属公司">{u.company}</Descriptions.Item>
              <Descriptions.Item label="角色">{u.role}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Space size={4} wrap>
                  <Tag color={u.status === '启用' ? 'success' : 'default'}>{u.status}</Tag>
                  {isExpired(u.validPeriod) && <Tag color="warning">已过期</Tag>}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="账户有效期">{u.validPeriod}</Descriptions.Item>
              <Descriptions.Item label="IP限制">{u.ipRestrict ? '已开启' : '未开启'}</Descriptions.Item>
              {u.ipRestrict && <Descriptions.Item label="IP白名单">{u.ipWhitelist}</Descriptions.Item>}
              {u.notifyAccounts && <Descriptions.Item label="消息通知">{u.notifyAccounts}</Descriptions.Item>}
              <Descriptions.Item label="创建时间">{u.createdAt}</Descriptions.Item>
            </Descriptions>
          ) : null;
        })()}
      </Modal>

      {/* ── 编辑弹窗 ─────────────────────────────────────────────── */}
      <Modal
        title="编辑用户"
        open={editOpen}
        onOk={() =>
          editForm.validateFields().then((values) => {
            setUsers((prev) =>
              prev.map((u) =>
                u.id === currentUser?.id
                  ? { ...u, role: values.role, status: values.status, validPeriod: values.validPeriod, ipRestrict: values.ipRestrict ?? false, ipWhitelist: values.ipRestrict ? (values.ipWhitelist ?? '') : '' }
                  : u,
              ),
            );
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
          {mockRole === 'system_admin' ? (
            <Form.Item label="角色" name="role" rules={[{ required: true }]}>
              <Select options={ROLES.map((r) => ({ value: r, label: r }))} />
            </Form.Item>
          ) : (
            <Form.Item label="角色" name="role">
              <Select disabled options={[{ value: currentUser?.role, label: currentUser?.role }]} />
            </Form.Item>
          )}
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="状态" name="status" rules={[{ required: true }]}>
                <Select options={STATUSES.map((s) => ({ value: s, label: s }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="账户有效期" name="validPeriod">
                <Select options={[{ value: '永久有效', label: '永久有效' }, { value: '自定义', label: '自定义' }]} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="IP限制" name="ipRestrict" valuePropName="checked">
            <Switch onChange={setEditIpRestrict} />
          </Form.Item>
          {editIpRestrict && (
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
          createForm.validateFields().then((values) => {
            const newId = `U${String(Date.now()).slice(-4)}`;
            const newUser: UserRecord = {
              id: newId,
              username: values.username,
              phone: '',
              email: '',
              group: values.group ?? '全部集团',
              company: values.company ?? '全部公司',
              role: values.role,
              status: values.status,
              createdAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
              ipRestrict: values.ipRestrict ?? false,
              ipWhitelist: values.ipRestrict ? (values.ipWhitelist ?? '') : '',
              validPeriod: values.validPeriod === '自定义' && values.expireDate
                ? values.expireDate.format('YYYY-MM-DD')
                : '永久有效',
              notifyAccounts: values.appUsername ?? '',
              isLocked: false,
            };
            setUsers((prev) => [...prev, newUser]);
            setCreateOpen(false);
            setCreatedInfo({ username: values.username, password: values.password });
            setSuccessOpen(true);
            createForm.resetFields();
          })
        }
        onCancel={() => setCreateOpen(false)}
        okText="创 建"
        cancelText="取 消"
        width={520}
        destroyOnClose
        styles={{ body: { maxHeight: '65vh', overflowY: 'auto', paddingRight: 4 } }}
      >
        <Form form={createForm} layout="vertical" style={{ marginTop: 16 }}>
          {/* 账号信息 */}
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

          {/* 角色（先选角色，再联级选归属） */}
          <Form.Item label="角色" name="role" rules={[{ required: true, message: '请选择角色' }]}>
            {mockRole === 'group_admin' ? (
              <Select disabled options={[{ value: '公司管理员', label: '公司管理员' }]} />
            ) : (
              <Select
                placeholder="请选择角色"
                options={ROLES.map((r) => ({ value: r, label: r }))}
                onChange={(v) => {
                  setCreateRole(v);
                  setCreateGroup(undefined);
                  createForm.resetFields(['group', 'company']);
                }}
              />
            )}
          </Form.Item>

          {/* 联级归属：集团管理员 → 仅选集团 */}
          {createRole === '集团管理员' && (
            <>
              <Form.Item label="归属集团" name="group" rules={[{ required: true, message: '请选择归属集团' }]}>
                <Select
                  placeholder="请选择归属集团"
                  options={GROUPS.map((g) => ({ value: g, label: g }))}
                />
              </Form.Item>
              {mockRole === 'system_admin' && (
                <Form.Item
                  label="APP 用户名"
                  name="appUsername"
                  rules={[
                    { required: true, message: '请输入 APP 用户名' },
                    {
                      validator: (_, value) => {
                        if (!value) return Promise.resolve();
                        if (!APP_USERNAME_REGEX.test(value)) {
                          return Promise.reject(new Error('格式：@字母/数字/下划线，2-30位，如 @miya_admin'));
                        }
                        if (users.some((u) => u.notifyAccounts === value)) {
                          return Promise.reject(new Error('该 APP 用户名已被使用'));
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input placeholder="请输入 APP 用户名，如 @miya_admin" />
                </Form.Item>
              )}
            </>
          )}

          {/* 联级归属：公司管理员 → 先选集团，再选公司 */}
          {createRole === '公司管理员' && (
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item label="归属集团" name="group" rules={[{ required: true, message: '请选择归属集团' }]}>
                  {mockRole === 'group_admin' ? (
                    <Select disabled options={[{ value: CURRENT_GROUP, label: CURRENT_GROUP }]} />
                  ) : (
                    <Select
                      placeholder="请选择归属集团"
                      options={GROUPS.map((g) => ({ value: g, label: g }))}
                      onChange={(v) => {
                        setCreateGroup(v);
                        createForm.resetFields(['company']);
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="归属公司" name="company" rules={[{ required: true, message: '请选择归属公司' }]}>
                  <Select
                    placeholder={createGroup ? '请选择归属公司' : '请先选择集团'}
                    disabled={!createGroup}
                    options={(createGroup ? COMPANIES[createGroup] ?? [] : []).map((c) => ({ value: c, label: c }))}
                  />
                </Form.Item>
              </Col>
            </Row>
          )}

          {/* 平台管理员：无需归属 */}

          <Divider style={{ margin: '12px 0' }} />

          {/* 状态 & 有效期 & IP */}
          <Form.Item label="状态" name="status" initialValue="启用" rules={[{ required: true }]}>
            <Select options={STATUSES.map((s) => ({ value: s, label: s }))} />
          </Form.Item>
          <Form.Item label="账户有效期" name="validPeriod" initialValue="永久有效">
            <Select
              options={[{ value: '永久有效', label: '永久有效' }, { value: '自定义', label: '自定义' }]}
              onChange={(v) => { if (v !== '自定义') createForm.setFieldValue('expireDate', undefined); }}
            />
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(p, c) => p.validPeriod !== c.validPeriod}>
            {({ getFieldValue }) =>
              getFieldValue('validPeriod') === '自定义' ? (
                <Form.Item label="到期时间" name="expireDate" rules={[{ required: true }]}>
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              ) : null
            }
          </Form.Item>
          <Form.Item label="IP限制" name="ipRestrict" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(p, c) => p.ipRestrict !== c.ipRestrict}>
            {({ getFieldValue }) =>
              getFieldValue('ipRestrict') ? (
                <Form.Item label="IP白名单" name="ipWhitelist" rules={[{ required: true }]}>
                  <Input.TextArea rows={2} placeholder="每行一个 IP 或 CIDR" />
                </Form.Item>
              ) : null
            }
          </Form.Item>

        </Form>
      </Modal>

      {/* ── 创建成功弹窗 ─────────────────────────────────────────── */}
      <Modal
        title="创建成功"
        open={successOpen}
        onCancel={() => setSuccessOpen(false)}
        footer={
          <Space>
            <Button icon={<CopyOutlined />} type="primary" onClick={copyCreatedInfo}>复制信息</Button>
            <Button onClick={() => setSuccessOpen(false)}>关 闭</Button>
          </Space>
        }
        width={480}
      >
        {createdInfo && (
          <div style={{
            marginTop: 16, padding: 16, background: '#f6f8ff',
            border: '1px solid #d6e4ff', borderRadius: 8, fontFamily: 'monospace', lineHeight: 2,
          }}>
            <div>登录地址：{window.location.origin}</div>
            <div>用户名：{createdInfo.username}</div>
            <div>密码：{createdInfo.password}</div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserManagePage;
