import {
  ApartmentOutlined,
  BankOutlined,
  CalendarOutlined,
  CopyOutlined,
  DeleteOutlined,
  KeyOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  StopOutlined,
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
  Tooltip,
  Tree,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useMemo, useState } from 'react';
import {
  getMockAuth, getMockRoles, isOwner, ROLE_LABELS, ROLE_ROUTES,
  GROUP_ROLES, COMPANY_ROLES,
  type Role, type GroupRole, type CompanyRole,
} from '../../../utils/auth';
import { addOperationLog } from '../../../utils/operationLog';

const isExpired = (validPeriod: string): boolean => {
  if (validPeriod === '永久有效') return false;
  return new Date(validPeriod) < new Date(new Date().toDateString());
};

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

// 路由 → 模块名映射（用于角色选择时展示模块权限）
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

/** 根据选中角色列表，合并去重后展示所有模块 Tag */
const RoleModulesPreview: React.FC<{ selectedRoles: Role[] }> = ({ selectedRoles }) => {
  if (!selectedRoles || selectedRoles.length === 0) return null;
  const modules = [...new Set(
    selectedRoles.flatMap(r => (ROLE_ROUTES[r] ?? []).map(route => MODULE_LABELS[route] ?? route))
  )];
  return (
    <div style={{ background: '#f6f8ff', border: '1px solid #d6e4ff', borderRadius: 6, padding: '8px 12px', marginTop: 8 }}>
      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>已选角色可访问的功能模块：</Text>
      <Space size={[4, 4]} wrap>
        {modules.map(m => <Tag key={m} style={{ margin: 0 }}>{m}</Tag>)}
      </Space>
    </div>
  );
};

// 随机生成符合要求的密码
function generatePassword(length = 16): string {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const special = '!@#$%^&*_-';
  const all = upper + lower + digits + special;
  const required = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
    special[Math.floor(Math.random() * special.length)],
  ];
  const rest = Array.from({ length: length - required.length }, () =>
    all[Math.floor(Math.random() * all.length)]
  );
  return [...required, ...rest].sort(() => Math.random() - 0.5).join('');
}

const STATUSES = ['启用', '停用'] as const;
type UserStatus = typeof STATUSES[number];

const GROUPS = ['UU Talk', 'Hey Talk', 'Star Game'];
const COMPANIES: Record<string, string[]> = {
  'UU Talk':   ['滴滴答答', 'UU Talk'],
  'Hey Talk':  ['Hey Talk Corp'],
  'Star Game': ['Star Tech', 'Nova Corp'],
};

interface UserRecord {
  id: string;
  username: string;
  phone: string;
  email: string;
  level: 'group' | 'company';
  group: string;
  company: string;
  roles: Role[];
  status: UserStatus;
  createdAt: string;
  ipRestrict: boolean;
  ipWhitelist: string;
  validPeriod: string;
  notifyAccounts: string;
  mfaEnabled: boolean;
}

const initialData: UserRecord[] = [
  { id: 'U001', username: 'Miya', phone: '+65 8991 0293', email: 'miya@cyberbot.sg', level: 'group', group: 'UU Talk', company: '', roles: ['group_owner'], status: '启用', createdAt: '2025-11-23 13:56:21', ipRestrict: false, ipWhitelist: '', validPeriod: '永久有效', notifyAccounts: '@miya_miya', mfaEnabled: true },
  { id: 'U002', username: 'Tom Admin', phone: '+65 8765 4321', email: 'tom@uutalk.com', level: 'company', group: 'UU Talk', company: '滴滴答答', roles: ['company_owner'], status: '启用', createdAt: '2025-10-01 09:00:00', ipRestrict: true, ipWhitelist: '104.28.0.0/16', validPeriod: '2026-12-31', notifyAccounts: '@tom_admin', mfaEnabled: true },
  { id: 'U003', username: 'Jack', phone: '+86 138 0001 0001', email: 'jack@uutalk.com', level: 'company', group: 'UU Talk', company: 'UU Talk', roles: ['company_ops'], status: '停用', createdAt: '2025-09-15 14:30:00', ipRestrict: false, ipWhitelist: '', validPeriod: '永久有效', notifyAccounts: '', mfaEnabled: false },
  { id: 'U004', username: 'Alice', phone: '+1 415 555 0101', email: 'alice@uutalk.com', level: 'company', group: 'UU Talk', company: '滴滴答答', roles: ['company_finance'], status: '启用', createdAt: '2025-08-20 11:00:00', ipRestrict: false, ipWhitelist: '', validPeriod: '2025-01-01', notifyAccounts: '@alice_finance', mfaEnabled: true },
  { id: 'U005', username: 'Ryan', phone: '+65 8234 5678', email: 'ryan@uutalk.com', level: 'group', group: 'UU Talk', company: '', roles: ['group_finance'], status: '启用', createdAt: '2025-04-15 08:00:00', ipRestrict: true, ipWhitelist: '192.168.1.0/24', validPeriod: '2027-06-30', notifyAccounts: '@ryan_admin', mfaEnabled: true },
  { id: 'U006', username: 'Leo', phone: '+65 9123 4567', email: 'leo@uutalk.com', level: 'company', group: 'UU Talk', company: 'UU Talk', roles: ['company_promo'], status: '启用', createdAt: '2025-06-10 10:00:00', ipRestrict: false, ipWhitelist: '', validPeriod: '2025-03-01', notifyAccounts: '@leo_ops', mfaEnabled: false },
  { id: 'U007', username: 'Nina', phone: '+86 139 8888 7777', email: 'nina@uutalk.com', level: 'group', group: 'UU Talk', company: '', roles: ['group_ops'], status: '启用', createdAt: '2025-05-20 09:30:00', ipRestrict: false, ipWhitelist: '', validPeriod: '永久有效', notifyAccounts: '', mfaEnabled: true },
  { id: 'U008', username: 'Mark', phone: '+86 188 0000 1234', email: 'mark@uutalk.com', level: 'group', group: 'UU Talk', company: '', roles: ['group_audit'], status: '启用', createdAt: '2025-02-18 15:45:00', ipRestrict: false, ipWhitelist: '', validPeriod: '永久有效', notifyAccounts: '@mark_ops', mfaEnabled: false },
  { id: 'U009', username: 'Eve', phone: '+65 6777 9999', email: 'eve@uutalk.com', level: 'company', group: 'UU Talk', company: '滴滴答答', roles: ['company_ops', 'company_audit'], status: '启用', createdAt: '2025-03-01 12:00:00', ipRestrict: false, ipWhitelist: '', validPeriod: '永久有效', notifyAccounts: '', mfaEnabled: true },
];

// ── 集团-公司-管理员 树数据 ────────────────────────────────────────
const buildTreeData = (data: UserRecord[]) => {
  const groups = [...new Set(data.map((r) => r.group))];
  return groups.map((group) => {
    const groupUsers = data.filter((r) => r.group === group);
    // 集团级用户（无公司归属）
    const groupLevelUsers = groupUsers.filter((r) => r.level === 'group');
    // 公司分组
    const companies = [...new Set(groupUsers.filter((r) => r.level === 'company').map((r) => r.company))];
    return {
      title: <Text style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{group}</Text>,
      key: `g::${group}`,
      icon: <BankOutlined style={{ color: '#1677ff' }} />,
      children: [
        // 集团级用户直接挂在集团下
        ...groupLevelUsers.map((user) => ({
          title: <Text style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{user.username}</Text>,
          key: `u::${user.id}`,
          icon: <UserOutlined style={{ color: '#52c41a', fontSize: 12 }} />,
        })),
        // 公司节点
        ...companies.map((company) => ({
          title: <Text style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{company}</Text>,
          key: `c::${company}`,
          icon: <ApartmentOutlined style={{ color: '#1677ff' }} />,
          children: groupUsers
            .filter((r) => r.company === company && r.level === 'company')
            .map((user) => ({
              title: <Text style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{user.username}</Text>,
              key: `u::${user.id}`,
              icon: <UserOutlined style={{ color: '#52c41a', fontSize: 12 }} />,
            })),
        })),
      ],
    };
  });
};

const UserManagePage: React.FC = () => {
  const mockAuth = getMockAuth();
  const mockRoles = getMockRoles();
  const currentUserId = 'U001'; // Mock: 当前登录用户 ID

  // 非 Owner 无权限访问
  if (!isOwner(mockRoles)) {
    return (
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW, textAlign: 'center', padding: '80px 0' }}>
        <Text type="secondary" style={{ fontSize: 16 }}>暂无权限访问用户管理，仅集团主/公司主可操作</Text>
      </Card>
    );
  }

  // 可见范围：owner 才能进入，过滤掉自己
  const visibleData = initialData.filter((r) => {
    if (r.id === currentUserId) return false; // 不显示自己
    if (mockAuth.level === 'group') return r.group === (mockAuth as { groupId: string }).groupId;
    return r.level === 'company' && r.company === (mockAuth as { companyId: string }).companyId;
  });
  const [users, setUsers] = useState<UserRecord[]>(visibleData);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string>('全部');
  const [treeSelected, setTreeSelected] = useState<string[]>([]);

  const [viewOpen, setViewOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserRecord | null>(null);

  // 新增弹窗状态
  const [resetPwdOpen, setResetPwdOpen] = useState(false);
  const [resetMfaOpen, setResetMfaOpen] = useState(false);
  const [validPeriodOpen, setValidPeriodOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [createForm] = Form.useForm();
  const [adminPwdForm] = Form.useForm();
  const [validPeriodForm] = Form.useForm();

  // create form 联级状态
  const [createGroup, setCreateGroup] = useState<string | undefined>();
  const [createLevel, setCreateLevel] = useState<'group' | 'company'>('company');

  const [showPwd, setShowPwd] = useState(false);

  const handleGeneratePassword = () => {
    const pwd = generatePassword();
    createForm.setFieldsValue({ password: pwd, confirmPwd: pwd });
    setShowPwd(true);
  };

  // 创建成功弹窗
  const [successOpen, setSuccessOpen] = useState(false);
  const [createdInfo, setCreatedInfo] = useState<{ username: string; password: string } | null>(null);

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
      (!roleFilter || r.roles.includes(roleFilter as Role)) &&
      (!kw || r.username.toLowerCase().includes(kw) || r.email.toLowerCase().includes(kw) || r.phone.includes(kw))
    );
  });

  // ── 操作处理 ─────────────────────────────────────────────────────
  const handleToggleStatus = (r: UserRecord) => {
    const newStatus: UserStatus = r.status === '启用' ? '停用' : '启用';
    setUsers((prev) => prev.map((u) => u.id === r.id ? { ...u, status: newStatus } : u));
    addOperationLog(`${newStatus === '停用' ? '停用' : '启用'}用户：${r.username}`, '用户管理');
    message.success(`已${newStatus}`);
  };

  const handleResetPwd = () => {
    adminPwdForm.validateFields().then(() => {
      addOperationLog(`重置密码：${currentUser?.username}`, '用户管理');
      setResetPwdOpen(false);
      adminPwdForm.resetFields();
      message.success('密码已重置');
    });
  };

  const handleResetMfa = () => {
    if (!currentUser) return;
    setUsers((prev) => prev.map((u) => u.id === currentUser.id ? { ...u, mfaEnabled: false } : u));
    addOperationLog(`重置MFA：${currentUser.username}`, '用户管理');
    setResetMfaOpen(false);
    message.success('MFA 已重置');
  };

  const handleUpdateValidPeriod = () => {
    validPeriodForm.validateFields().then((values) => {
      const period = values.periodType === '永久有效' ? '永久有效' : values.expireDate?.format('YYYY-MM-DD') ?? '永久有效';
      setUsers((prev) => prev.map((u) => u.id === currentUser?.id ? { ...u, validPeriod: period } : u));
      addOperationLog(`修改有效期：${currentUser?.username} → ${period}`, '用户管理');
      setValidPeriodOpen(false);
      validPeriodForm.resetFields();
      message.success('有效期已更新');
    });
  };

  const handleDelete = () => {
    adminPwdForm.validateFields().then(() => {
      setUsers((prev) => prev.filter((u) => u.id !== currentUser?.id));
      addOperationLog(`删除用户：${currentUser?.username}`, '用户管理');
      setDeleteOpen(false);
      adminPwdForm.resetFields();
      message.success('用户已删除');
    });
  };

  const columns: ColumnsType<UserRecord> = [
    { title: '创建时间', dataIndex: 'createdAt', width: 170, sorter: (a, b) => a.createdAt.localeCompare(b.createdAt) },
    { title: '用户名', dataIndex: 'username', width: 110, render: (v) => <Text strong>{v}</Text> },
    { title: '归属集团', dataIndex: 'group', width: 100 },
    { title: '归属公司', dataIndex: 'company', width: 110, render: (v) => v || '-' },
    {
      title: '角色', dataIndex: 'roles', width: 160,
      render: (v: Role[]) => v.map(r => ROLE_LABELS[r]).join('、'),
    },
    {
      title: '状态', dataIndex: 'status', width: 100,
      render: (v: UserStatus, r: UserRecord) => {
        const canManage = mockRoles.includes('group_owner') || (mockRoles.includes('company_owner') && r.level === 'company');
        return canManage
          ? <Switch size="small" checked={v === '启用'} checkedChildren="启用" unCheckedChildren="停用" onChange={() => handleToggleStatus(r)} />
          : <Tag color={v === '启用' ? 'success' : 'default'}>{v}</Tag>;
      },
    },
    {
      title: 'MFA', dataIndex: 'mfaEnabled', width: 70,
      render: (v: boolean) => <Tag color={v ? 'success' : 'default'}>{v ? '开启' : '关闭'}</Tag>,
    },
    { title: '有效期', dataIndex: 'validPeriod', width: 120 },
    {
      title: '操作', width: 180, fixed: 'right' as const,
      render: (_: unknown, r: UserRecord) => {
        const canManage = mockRoles.includes('group_owner') || (mockRoles.includes('company_owner') && r.level === 'company');
        return (
          <Space size={4}>
            <Tooltip title="查看"><Button type="link" size="small" icon={<UserOutlined />} onClick={() => { setCurrentUser(r); setViewOpen(true); }} /></Tooltip>
            {canManage && (
              <>
                <Tooltip title="重置密码"><Button type="link" size="small" icon={<KeyOutlined />} onClick={() => { setCurrentUser(r); adminPwdForm.resetFields(); setResetPwdOpen(true); }} /></Tooltip>
                <Tooltip title="重置MFA"><Button type="link" size="small" icon={<StopOutlined />} onClick={() => { setCurrentUser(r); setResetMfaOpen(true); }} /></Tooltip>
                <Tooltip title="修改有效期"><Button type="link" size="small" icon={<CalendarOutlined />} onClick={() => { setCurrentUser(r); validPeriodForm.setFieldsValue({ periodType: r.validPeriod === '永久有效' ? '永久有效' : '自定义' }); setValidPeriodOpen(true); }} /></Tooltip>
                <Tooltip title="删除"><Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => { setCurrentUser(r); adminPwdForm.resetFields(); setDeleteOpen(true); }} /></Tooltip>
              </>
            )}
          </Space>
        );
      },
    },
  ];

  const treeData = useMemo(() => buildTreeData(users), [users]);

  // 可分配的角色列表
  const assignableRoles: Role[] = mockAuth.level === 'group'
    ? [...(GROUP_ROLES.filter(r => r !== 'group_owner') as Role[]), ...(COMPANY_ROLES.filter(r => r !== 'company_owner') as Role[])]
    : COMPANY_ROLES.filter(r => r !== 'company_owner');

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
            <div>1. 集团主可查看本集团所有用户（含下属公司），公司主可查看本公司所有用户</div>
            <div>2. 集团主在此创建集团侧管理员（集团财务/经营/审计），公司主账号通过「创建公司」时创建</div>
            <div>3. 公司主在此创建公司侧管理员（公司推广/财务/经营/审计）</div>
            <div>4. 用户列表不显示自己；一个用户可持有多个同侧角色，权限取并集</div>
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
                options={Object.entries(ROLE_LABELS).map(([k, v]) => ({ value: k, label: v }))}
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
                  setShowPwd(false);
                  if (mockAuth.level === 'group') {
                    setCreateGroup((mockAuth as { groupId: string }).groupId);
                    createForm.setFieldsValue({ group: (mockAuth as { groupId: string }).groupId });
                    setCreateLevel('group'); // 集团主只创建集团用户，公司用户通过创建公司时创建
                  } else {
                    setCreateGroup(undefined);
                    setCreateLevel('company');
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
              scroll={{ x: 1400 }}
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
              {u.company && <Descriptions.Item label="归属公司">{u.company}</Descriptions.Item>}
              <Descriptions.Item label="角色">{u.roles.map(r => ROLE_LABELS[r]).join('、')}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Space size={4} wrap>
                  <Tag color={u.status === '启用' ? 'success' : 'default'}>{u.status}</Tag>
                  {isExpired(u.validPeriod) && <Tag color="warning">已过期</Tag>}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="账户有效期">{u.validPeriod}</Descriptions.Item>
              <Descriptions.Item label="IP限制">{u.ipRestrict ? '已开启' : '未开启'}</Descriptions.Item>
              <Descriptions.Item label="MFA">{u.mfaEnabled ? '已开启' : '未开启'}</Descriptions.Item>
              {u.ipRestrict && <Descriptions.Item label="IP白名单">{u.ipWhitelist}</Descriptions.Item>}
              {u.notifyAccounts && <Descriptions.Item label="消息通知">{u.notifyAccounts}</Descriptions.Item>}
              <Descriptions.Item label="创建时间">{u.createdAt}</Descriptions.Item>
            </Descriptions>
          ) : null;
        })()}
      </Modal>

      {/* ── 重置密码弹窗（需校验管理员密码） ────────────────────── */}
      <Modal
        title={`重置密码 — ${currentUser?.username}`}
        open={resetPwdOpen}
        onOk={handleResetPwd}
        onCancel={() => { setResetPwdOpen(false); adminPwdForm.resetFields(); }}
        okText="确认重置"
        destroyOnClose
        width={400}
      >
        <Form form={adminPwdForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="请输入您的管理员密码" name="adminPassword" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password placeholder="输入当前管理员的登录密码" />
          </Form.Item>
        </Form>
        <Text type="secondary" style={{ fontSize: 12 }}>重置后将生成新的随机密码，用户下次登录需使用新密码。</Text>
      </Modal>

      {/* ── 重置 MFA 弹窗 ──────────────────────────────────────── */}
      <Modal
        title={`重置 MFA — ${currentUser?.username}`}
        open={resetMfaOpen}
        onOk={handleResetMfa}
        onCancel={() => setResetMfaOpen(false)}
        okText="确认重置"
        width={400}
      >
        <div style={{ marginTop: 16 }}>
          <Text>确认重置 <Text strong>{currentUser?.username}</Text> 的 MFA 认证？</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>重置后用户下次登录需要重新绑定 MFA 设备。</Text>
        </div>
      </Modal>

      {/* ── 修改有效期弹窗 ─────────────────────────────────────── */}
      <Modal
        title={`修改有效期 — ${currentUser?.username}`}
        open={validPeriodOpen}
        onOk={handleUpdateValidPeriod}
        onCancel={() => { setValidPeriodOpen(false); validPeriodForm.resetFields(); }}
        okText="保 存"
        destroyOnClose
        width={400}
      >
        <Form form={validPeriodForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="有效期" name="periodType" initialValue="永久有效" rules={[{ required: true }]}>
            <Select options={[{ value: '永久有效', label: '永久有效' }, { value: '自定义', label: '自定义' }]} />
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(p, c) => p.periodType !== c.periodType}>
            {({ getFieldValue }) =>
              getFieldValue('periodType') === '自定义' ? (
                <Form.Item label="到期时间" name="expireDate" rules={[{ required: true, message: '请选择到期时间' }]}>
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              ) : null
            }
          </Form.Item>
        </Form>
      </Modal>

      {/* ── 删除用户弹窗（需校验管理员密码） ────────────────────── */}
      <Modal
        title={`删除用户 — ${currentUser?.username}`}
        open={deleteOpen}
        onOk={handleDelete}
        onCancel={() => { setDeleteOpen(false); adminPwdForm.resetFields(); }}
        okText="确认删除"
        okButtonProps={{ danger: true }}
        destroyOnClose
        width={400}
      >
        <Form form={adminPwdForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="请输入您的管理员密码" name="adminPassword" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password placeholder="输入当前管理员的登录密码" />
          </Form.Item>
        </Form>
        <Text type="warning" style={{ fontSize: 12, color: '#faad14' }}>此操作不可撤销，用户 <Text strong>{currentUser?.username}</Text> 将被永久删除。</Text>
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
              level: mockAuth.level,
              group: values.group ?? '',
              company: values.company ?? '',
              roles: values.roles ?? [],
              status: values.status,
              createdAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
              ipRestrict: values.ipRestrict ?? false,
              ipWhitelist: values.ipRestrict ? (values.ipWhitelist ?? '') : '',
              validPeriod: values.validPeriod === '自定义' && values.expireDate
                ? values.expireDate.format('YYYY-MM-DD')
                : '永久有效',
              notifyAccounts: values.appUsername ?? '',
              mfaEnabled: false,
            };
            setUsers((prev) => [...prev, newUser]);
            setCreateOpen(false);
            setCreatedInfo({ username: values.username, password: values.password });
            setSuccessOpen(true);
            // 标记首次登录强制改密
            localStorage.setItem(`must_change_pwd_${values.username}`, 'true');
            // 记录操作日志
            addOperationLog('创建用户：' + values.username, '用户管理');
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
          <Form.Item
            label="登录密码"
            name="password"
            rules={[{ required: true, min: 8, message: '密码至少8位' }]}
            extra={<Text type="secondary" style={{ fontSize: 11 }}>8-30 位，需包含大/小写字母、数字、特殊字符中至少 3 种</Text>}
          >
            <Space.Compact style={{ width: '100%' }}>
              {showPwd ? (
                <Input
                  value={createForm.getFieldValue('password')}
                  onChange={(e) => {
                    createForm.setFieldsValue({ password: e.target.value });
                    setShowPwd(false);
                  }}
                  style={{ flex: 1 }}
                />
              ) : (
                <Input.Password placeholder="请输入登录密码" style={{ flex: 1 }} />
              )}
              <Button icon={<ReloadOutlined />} onClick={handleGeneratePassword}>
                随机生成
              </Button>
            </Space.Compact>
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
            {showPwd ? (
              <Input value={createForm.getFieldValue('confirmPwd')} disabled />
            ) : (
              <Input.Password placeholder="请再次输入密码" />
            )}
          </Form.Item>

          <Divider style={{ margin: '12px 0' }} />

          {/* 归属 */}
          <Form.Item label="归属集团" name="group" rules={[{ required: true, message: '请选择归属集团' }]}>
            {mockAuth.level === 'group' ? (
              <Select disabled options={[{ value: (mockAuth as { groupId: string }).groupId, label: (mockAuth as { groupId: string }).groupId }]} />
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

          {/* 归属公司 — 仅公司主创建公司用户时需要 */}
          {mockAuth.level === 'company' && (
            <Form.Item label="归属公司" name="company" rules={[{ required: true, message: '请选择归属公司' }]}>
              <Select
                placeholder={createGroup ? '请选择归属公司' : '请先选择集团'}
                disabled={!createGroup}
                options={(createGroup ? COMPANIES[createGroup] ?? [] : []).map((c) => ({ value: c, label: c }))}
              />
            </Form.Item>
          )}

          {/* 角色 — 多选；集团主只创建集团角色，公司主只创建公司角色 */}
          <Form.Item label="角色" name="roles" rules={[{ required: true, message: '请选择角色' }]}>
            <Select
              mode="multiple"
              placeholder="请选择角色"
              options={
                mockAuth.level === 'group'
                  ? GROUP_ROLES.filter(r => r !== 'group_owner').map(r => ({ value: r, label: ROLE_LABELS[r] }))
                  : COMPANY_ROLES.filter(r => r !== 'company_owner').map(r => ({ value: r, label: ROLE_LABELS[r] }))
              }
            />
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(p, c) => p.roles !== c.roles}>
            {({ getFieldValue }) => <RoleModulesPreview selectedRoles={getFieldValue('roles') ?? []} />}
          </Form.Item>

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
        <div style={{ marginTop: 12, fontSize: 12, color: '#faad14' }}>
          该用户首次登录将被要求修改密码
        </div>
      </Modal>
    </div>
  );
};

export default UserManagePage;
