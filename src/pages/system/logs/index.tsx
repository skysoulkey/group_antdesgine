import { SearchOutlined } from '@ant-design/icons';
import { Card, ConfigProvider, Input, Radio, Select, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useMemo, useState } from 'react';
import { getMockAuth, ROLE_LABELS, ALL_ROLES, type Role } from '../../../utils/auth';
import {
  getLoginLogs, getOperationLogs,
  type LoginLogEntry, type OperationLogEntry,
} from '../../../utils/operationLog';

const radioTheme = { components: { Radio: { colorPrimary: '#1677ff', buttonSolidCheckedBg: '#ffffff', buttonSolidCheckedColor: '#1677ff', buttonCheckedBg: '#ffffff' } } };

const { Text } = Typography;

const CARD_SHADOW = '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)';

// ── 初始 Mock 登录日志（带归属信息 + 新角色体系） ───────────────────
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

const initialLoginLogs: LoginLogEntry[] = Array.from({ length: 20 }, (_, i) => {
  const u = MOCK_USERS[i % MOCK_USERS.length];
  return {
    id: `LL${String(i + 1).padStart(7, '0')}`,
    loginTime: `2025-11-${String(20 - i).padStart(2, '0')} ${String(8 + (i % 14)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}:00`,
    username: u.name,
    roles: u.roles.map(r => ROLE_LABELS[r]).join('、'),
    loginIp: `104.${28 + (i % 10)}.${200 + (i % 55)}.${i % 255}`,
    country: COUNTRIES[i % 4],
    result: (i % 6 === 0 ? '失败' : '成功') as '成功' | '失败',
    level: u.level,
    group: u.group,
    company: u.company,
  };
});

// ── 初始 Mock 操作日志 ──────────────────────────────────────────────
const OP_ACTIONS = ['创建用户', '编辑用户角色', '创建公司', '内部划转', '导出数据', '修改密码', '编辑通知配置', '修改系统设置'];
const OP_MODULES = ['用户管理', '企业管理', '公司管理', '集团金融', '系统设置', '通知管理'];

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
    level: u.level,
    group: u.group,
    company: u.company,
  };
});

// ── 角色筛选选项 ────────────────────────────────────────────────────
const ROLE_OPTIONS = ALL_ROLES.map(r => ({ value: ROLE_LABELS[r], label: ROLE_LABELS[r] }));

const MODULE_OPTIONS = [...new Set([...OP_MODULES, ...initialOpLogs.map(l => l.module), ...getOperationLogs().map(l => l.module)])].map(m => ({ value: m, label: m }));

// ── 主组件 ──────────────────────────────────────────────────────────
const SystemLogsPage: React.FC = () => {
  const auth = getMockAuth();

  // 权限过滤函数：集团用户看本集团全部，公司用户只看本公司
  const filterByAuth = <T extends { level: string; group: string; company: string }>(list: T[]): T[] => {
    if (auth.level === 'group') {
      const groupId = (auth as { groupId: string }).groupId;
      return list.filter(r => r.group === groupId);
    }
    const companyId = (auth as { companyId: string }).companyId;
    return list.filter(r => r.level === 'company' && r.company === companyId);
  };

  // 合并 Mock + localStorage 真实记录，按时间倒序
  const allLoginLogs = useMemo(() => {
    const merged = [...getLoginLogs(), ...initialLoginLogs];
    return filterByAuth(merged).sort((a, b) => b.loginTime.localeCompare(a.loginTime));
  }, [auth.level]);

  const allOpLogs = useMemo(() => {
    const merged = [...getOperationLogs(), ...initialOpLogs];
    return filterByAuth(merged).sort((a, b) => b.operateTime.localeCompare(a.operateTime));
  }, [auth.level]);

  const [loginSearch, setLoginSearch] = useState('');
  const [loginRole, setLoginRole] = useState<string | undefined>();
  const [opSearch, setOpSearch] = useState('');
  const [opModule, setOpModule] = useState<string | undefined>();
  const [opResult, setOpResult] = useState<string | undefined>();

  const filteredLogin = allLoginLogs.filter((r) => {
    const kw = loginSearch.toLowerCase();
    return (
      (!loginRole || r.roles.includes(loginRole)) &&
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
    { title: '登录时间', dataIndex: 'loginTime', width: 170, sorter: (a, b) => a.loginTime.localeCompare(b.loginTime) },
    { title: '账号', dataIndex: 'username', width: 100 },
    { title: '角色', dataIndex: 'roles', width: 160 },
    {
      title: '登录IP', dataIndex: 'loginIp', width: 200,
      render: (v, r) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontFamily: 'monospace' }}>{v}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>{r.country}</Text>
        </Space>
      ),
    },
    {
      title: '结果', dataIndex: 'result', width: 80,
      render: (v) => <Tag color={v === '成功' ? 'success' : 'error'}>{v}</Tag>,
    },
  ];

  const opColumns: ColumnsType<OperationLogEntry> = [
    { title: '操作时间', dataIndex: 'operateTime', width: 170, sorter: (a, b) => a.operateTime.localeCompare(b.operateTime) },
    { title: '账号', dataIndex: 'username', width: 100 },
    { title: '角色', dataIndex: 'roles', width: 160 },
    { title: '操作行为', dataIndex: 'operation', width: 140 },
    { title: '所属模块', dataIndex: 'module', width: 110 },
    {
      title: '操作IP', dataIndex: 'operateIp', width: 160,
      render: (v) => <Text style={{ fontFamily: 'monospace' }}>{v}</Text>,
    },
    {
      title: '结果', dataIndex: 'result', width: 80,
      render: (v) => <Tag color={v === '成功' ? 'success' : 'error'}>{v}</Tag>,
    },
  ];

  // 权限提示
  const scopeHint = auth.level === 'group'
    ? `当前查看范围：${(auth as { groupId: string }).groupId} 集团全部日志（含下属公司）`
    : `当前查看范围：${(auth as { companyId: string }).companyId} 公司日志`;

  return (
    <div>
      <div style={{ background: '#f6f8ff', border: '1px solid #d6e4ff', borderRadius: 6, padding: '10px 16px', marginBottom: 16, fontSize: 12, color: '#595959', lineHeight: 1.8 }}>
        <div>{scopeHint}</div>
      </div>

      {/* ── 登录日志 ── */}
      <Card
        bordered={false}
        title="登录日志"
        style={{ borderRadius: 12, boxShadow: CARD_SHADOW, marginBottom: 16 }}
      >
        <Space size={24} wrap align="center" style={{ marginBottom: 16 }}>
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
      </Card>

      {/* ── 操作日志 ── */}
      <Card
        bordered={false}
        title="操作日志"
        style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}
      >
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
      </Card>
    </div>
  );
};

export default SystemLogsPage;
