import { SearchOutlined } from '@ant-design/icons';
import { ConfigProvider, Input, Modal, Radio, Select, Space, Table, Tabs, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useMemo, useState, useCallback } from 'react';
import { getMockAuth, ROLE_LABELS, ALL_ROLES, type Role } from '../../../utils/auth';
import {
  getLoginLogs, getOperationLogs,
  type LoginLogEntry, type LoginAction, type OperationLogEntry,
} from '../../../utils/operationLog';

const radioTheme = { components: { Radio: { colorPrimary: '#1677ff', buttonSolidCheckedBg: '#ffffff', buttonSolidCheckedColor: '#1677ff', buttonCheckedBg: '#ffffff' } } };

const { Text } = Typography;

// ── 初始 Mock 登录日志 ─────────────────────────────────────────────
const MOCK_USERS: { name: string; roles: Role[]; level: 'group' | 'company'; group: string; company: string }[] = [
  { name: 'Miya',  roles: ['group_owner'],   level: 'group',   group: 'UU Talk', company: '' },
  { name: 'Ryan',  roles: ['group_finance'], level: 'group',   group: 'UU Talk', company: '' },
  { name: 'Nina',  roles: ['group_ops'],     level: 'group',   group: 'UU Talk', company: '' },
  { name: 'Mark',  roles: ['group_audit'],   level: 'group',   group: 'UU Talk', company: '' },
  { name: 'Tom',   roles: ['company_owner'], level: 'company', group: 'UU Talk', company: '滴滴答答' },
  { name: 'Alice', roles: ['company_finance'], level: 'company', group: 'UU Talk', company: '滴滴答答' },
  { name: 'Jack',  roles: ['company_ops'],   level: 'company', group: 'UU Talk', company: 'UU Talk' },
  { name: 'Leo',   roles: ['company_promo'], level: 'company', group: 'UU Talk', company: 'UU Talk' },
  { name: 'Eve',   roles: ['company_ops', 'company_audit'], level: 'company', group: 'UU Talk', company: '滴滴答答' },
];

const COUNTRIES = ['🇸🇬 新加坡', '🇨🇳 中国', '🇺🇸 美国', '🇬🇧 英国'];
const LOGIN_ACTIONS: LoginAction[] = ['登录', '登出', '登录失败'];

const initialLoginLogs: LoginLogEntry[] = Array.from({ length: 24 }, (_, i) => {
  const u = MOCK_USERS[i % MOCK_USERS.length];
  const action = LOGIN_ACTIONS[i % 3];
  const isFail = action === '登录失败';
  return {
    id: `LL${String(i + 1).padStart(7, '0')}`,
    loginTime: `2025-11-${String(24 - i).padStart(2, '0')} ${String(8 + (i % 14)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}:00`,
    username: isFail ? `unknown_${i}` : u.name,
    roles: isFail ? '-' : u.roles.map(r => ROLE_LABELS[r]).join('、'),
    action,
    loginIp: `104.${28 + (i % 10)}.${200 + (i % 55)}.${i % 255}`,
    country: COUNTRIES[i % 4],
    result: (isFail ? '失败' : '成功') as '成功' | '失败',
    level: u.level,
    group: u.group,
    company: u.company,
  };
});

// ── 初始 Mock 操作日志 ──────────────────────────────────────────────
const OP_ACTIONS = ['创建用户', '编辑用户角色', '创建公司', '内部划转', '导出数据', '修改密码', '编辑通知配置', '修改系统设置'];
const OP_MODULES = ['用户管理', '企业管理', '公司管理', '集团金融', '系统设置', '通知管理'];

const MOCK_DETAILS: Record<string, unknown>[] = [
  { targetUser: 'new_user_01', assignedRoles: ['company_ops'], company: '滴滴答答' },
  { targetUser: 'Alice', oldRoles: ['company_finance'], newRoles: ['company_finance', 'company_audit'] },
  { companyName: '新星科技', region: '新加坡', currency: 'USDT' },
  { from: '集团钱包', to: '滴滴答答', amount: 50000, currency: 'USDT' },
  { exportType: '公司收益报表', dateRange: '2025-10 ~ 2025-11', format: 'xlsx' },
  { targetUser: 'Tom', action: '重置密码' },
  { notificationType: '集团下拨', enabled: true, channels: ['站内信', '邮件'] },
  { settingKey: 'session_timeout', oldValue: 30, newValue: 60, unit: 'min' },
];

const initialOpLogs: OperationLogEntry[] = Array.from({ length: 24 }, (_, i) => {
  const u = MOCK_USERS[i % MOCK_USERS.length];
  return {
    id: `OL${String(i + 1).padStart(7, '0')}`,
    operateTime: `2025-11-${String(24 - i).padStart(2, '0')} ${String(9 + (i % 12)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}:00`,
    username: u.name,
    roles: u.roles.map(r => ROLE_LABELS[r]).join('、'),
    operation: OP_ACTIONS[i % OP_ACTIONS.length],
    module: OP_MODULES[i % OP_MODULES.length],
    operateIp: `104.${28 + (i % 10)}.${200 + (i % 55)}.${i % 255}`,
    result: (i % 8 === 0 ? '失败' : '成功') as '成功' | '失败',
    detail: MOCK_DETAILS[i % MOCK_DETAILS.length],
    level: u.level,
    group: u.group,
    company: u.company,
  };
});

// ── 筛选选项 ────────────────────────────────────────────────────────
const ROLE_OPTIONS = ALL_ROLES.map(r => ({ value: ROLE_LABELS[r], label: ROLE_LABELS[r] }));
const MODULE_OPTIONS = [...new Set([...OP_MODULES, ...getOperationLogs().map(l => l.module)])].map(m => ({ value: m, label: m }));
const ACTION_OPTIONS: { value: LoginAction; label: string }[] = [
  { value: '登录', label: '登录' },
  { value: '登出', label: '登出' },
  { value: '登录失败', label: '登录失败' },
];

// ── 主组件 ──────────────────────────────────────────────────────────
const SystemLogsPage: React.FC = () => {
  const auth = getMockAuth();

  const filterByAuth = <T extends { level: string; group: string; company: string }>(list: T[]): T[] => {
    if (auth.level === 'group') {
      const groupId = (auth as { groupId: string }).groupId;
      return list.filter(r => r.group === groupId);
    }
    const companyId = (auth as { companyId: string }).companyId;
    return list.filter(r => r.level === 'company' && r.company === companyId);
  };

  const allLoginLogs = useMemo(() => {
    const merged = [...getLoginLogs(), ...initialLoginLogs];
    return filterByAuth(merged).sort((a, b) => b.loginTime.localeCompare(a.loginTime));
  }, [auth.level]);

  const allOpLogs = useMemo(() => {
    const merged = [...getOperationLogs(), ...initialOpLogs];
    return filterByAuth(merged).sort((a, b) => b.operateTime.localeCompare(a.operateTime));
  }, [auth.level]);

  // 登录日志筛选
  const [loginSearch, setLoginSearch] = useState('');
  const [loginRole, setLoginRole] = useState<string | undefined>();
  const [loginAction, setLoginAction] = useState<LoginAction | undefined>();

  // 操作日志筛选
  const [opSearch, setOpSearch] = useState('');
  const [opModule, setOpModule] = useState<string | undefined>();
  const [opResult, setOpResult] = useState<string | undefined>();

  const filteredLogin = allLoginLogs.filter((r) => {
    const kw = loginSearch.toLowerCase();
    return (
      (!loginRole || r.roles.includes(loginRole)) &&
      (!loginAction || r.action === loginAction) &&
      (!kw || r.username.toLowerCase().includes(kw) || r.loginIp.includes(kw))
    );
  });

  const filteredOp = allOpLogs.filter((r) => {
    const kw = opSearch.toLowerCase();
    return (
      (!opModule || r.module === opModule) &&
      (!opResult || r.result === opResult) &&
      (!kw || r.username.toLowerCase().includes(kw) || r.operation.includes(kw) || r.operateIp.includes(kw))
    );
  });

  const loginColumns: ColumnsType<LoginLogEntry> = [
    { title: '时间', dataIndex: 'loginTime', width: 170, sorter: (a, b) => a.loginTime.localeCompare(b.loginTime) },
    { title: '账号', dataIndex: 'username', width: 100 },
    { title: '角色', dataIndex: 'roles', width: 160 },
    {
      title: '操作', dataIndex: 'action', width: 100,
      render: (v: LoginAction) => {
        const colorMap: Record<LoginAction, string> = { '登录': 'processing', '登出': 'default', '登录失败': 'error' };
        return <Tag color={colorMap[v]}>{v}</Tag>;
      },
    },
    {
      title: '登录IP', dataIndex: 'loginIp', width: 200,
      render: (v: string, r: LoginLogEntry) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontFamily: 'monospace' }}>{v}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>{r.country}</Text>
        </Space>
      ),
    },
    {
      title: '结果', dataIndex: 'result', width: 80,
      render: (v: string) => <Tag color={v === '成功' ? 'success' : 'error'}>{v}</Tag>,
    },
  ];

  const showDetail = useCallback((record: OperationLogEntry) => {
    Modal.info({
      title: `操作详情 — ${record.id}`,
      width: 560,
      content: (
        <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 8, fontSize: 13, maxHeight: 400, overflow: 'auto', marginTop: 12 }}>
          {JSON.stringify(record.detail ?? {}, null, 2)}
        </pre>
      ),
      okText: '关闭',
    });
  }, []);

  const opColumns: ColumnsType<OperationLogEntry> = [
    { title: '时间', dataIndex: 'operateTime', width: 170, sorter: (a, b) => a.operateTime.localeCompare(b.operateTime) },
    { title: '账号', dataIndex: 'username', width: 100 },
    { title: '角色', dataIndex: 'roles', width: 160 },
    { title: '操作行为', dataIndex: 'operation', width: 140 },
    { title: '所属模块', dataIndex: 'module', width: 110 },
    {
      title: '操作IP', dataIndex: 'operateIp', width: 160,
      render: (v: string) => <Text style={{ fontFamily: 'monospace' }}>{v}</Text>,
    },
    {
      title: '结果', dataIndex: 'result', width: 80,
      render: (v: string) => <Tag color={v === '成功' ? 'success' : 'error'}>{v}</Tag>,
    },
    {
      title: '操作', width: 80, fixed: 'right',
      render: (_: unknown, record: OperationLogEntry) => (
        <a onClick={() => showDetail(record)}>详情</a>
      ),
    },
  ];

  const scopeHint = auth.level === 'group'
    ? `当前查看范围：${(auth as { groupId: string }).groupId} 集团全部日志（含下属公司）`
    : `当前查看范围：${(auth as { companyId: string }).companyId} 公司日志`;

  return (
    <div>
      <div style={{ background: '#f6f8ff', border: '1px solid #d6e4ff', borderRadius: 6, padding: '10px 16px', marginBottom: 16, fontSize: 12, color: '#595959', lineHeight: 1.8 }}>
        <div>{scopeHint}</div>
      </div>

      <Tabs
        defaultActiveKey="login"
        items={[
          {
            key: 'login',
            label: '登录日志',
            children: (
              <>
                <Space size={24} wrap align="center" style={{ marginBottom: 16 }}>
                  <Select
                    placeholder="操作类型"
                    value={loginAction}
                    onChange={setLoginAction}
                    allowClear
                    style={{ width: 120 }}
                    options={ACTION_OPTIONS}
                  />
                  <Select
                    placeholder="筛选角色"
                    value={loginRole}
                    onChange={setLoginRole}
                    allowClear
                    style={{ width: 140 }}
                    options={ROLE_OPTIONS}
                  />
                  <Input
                    prefix={<SearchOutlined />}
                    placeholder="账号名 / 登录IP"
                    value={loginSearch}
                    onChange={(e) => setLoginSearch(e.target.value)}
                    allowClear
                    style={{ width: 240 }}
                  />
                </Space>
                <Table
                  columns={loginColumns}
                  dataSource={filteredLogin}
                  rowKey="id"
                  size="middle"
                  scroll={{ x: 800 }}
                  pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
                  rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
                />
              </>
            ),
          },
          {
            key: 'operation',
            label: '操作日志',
            children: (
              <>
                <Space size={24} wrap align="center" style={{ marginBottom: 16 }}>
                  <Select
                    placeholder="筛选模块"
                    value={opModule}
                    onChange={setOpModule}
                    allowClear
                    style={{ width: 140 }}
                    options={MODULE_OPTIONS}
                  />
                  <ConfigProvider theme={radioTheme}>
                    <Radio.Group value={opResult ?? '全部'} onChange={(e) => setOpResult(e.target.value === '全部' ? undefined : e.target.value)} buttonStyle="outline">
                      {['全部', '成功', '失败'].map((v) => (
                        <Radio.Button key={v} value={v} style={(opResult ?? '全部') === v ? { color: '#1677ff', borderColor: '#1677ff' } : {}}>{v === '全部' ? '全部结果' : v}</Radio.Button>
                      ))}
                    </Radio.Group>
                  </ConfigProvider>
                  <Input
                    prefix={<SearchOutlined />}
                    placeholder="账号名 / 操作 / IP"
                    value={opSearch}
                    onChange={(e) => setOpSearch(e.target.value)}
                    allowClear
                    style={{ width: 240 }}
                  />
                </Space>
                <Table
                  columns={opColumns}
                  dataSource={filteredOp}
                  rowKey="id"
                  size="middle"
                  scroll={{ x: 900 }}
                  pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
                  rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
                />
              </>
            ),
          },
        ]}
      />
    </div>
  );
};

export default SystemLogsPage;
