import { SearchOutlined } from '@ant-design/icons';
import { Card, ConfigProvider, Input, Modal, Radio, Select, Space, Table, Tabs, Tag, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useMemo, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'umi';
import TableToolbar from '../../../components/TableToolbar';
import { getMockAuth, ROLE_LABELS, ALL_ROLES, type Role } from '../../../utils/auth';
import {
  getLoginLogs, getOperationLogs,
  type LoginLogEntry, type LoginAction, type OperationLogEntry,
} from '../../../utils/operationLog';

const radioTheme = { components: { Radio: { buttonSolidCheckedBg: '#1677ff', buttonSolidCheckedHoverBg: '#4096ff', buttonSolidCheckedActiveBg: '#0958d9', buttonSolidCheckedColor: '#fff', colorPrimary: '#1677ff' } } };

const CARD_SHADOW = '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)';
const CARD_RADIUS = 12;

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
const OP_ACTIONS = [
  '创建用户', '编辑用户', '删除用户', '禁用/启用用户', '重置密码',
  '创建公司', '编辑公司信息',
  '资金下拨', '资金调回', '钱包充值', '钱包转出',
  '绑定出金账号', '修改出金账号', '绑定入金账号', '修改入金账号',
  '生成邀请码', '解散企业',
  '添加通知对象', '编辑通知对象', '删除通知对象', '修改通知渠道开关',
  '保存安全设置', '保存通用设置', '保存通知配置',
  '修改密码', '修改站内通知开关',
  '导出数据',
];
const OP_MODULES = ['用户管理', '公司管理', '集团金融', '企业管理', '通知管理', '系统设置'];

// 统一 key：targetName / targetId / targetRole / company / oldValue / newValue
// from / to / amount / currency / walletType / bindAccount / inviteCode
// appUsername / email / changes / reportName / dateRange / exportFormat
const MOCK_DETAILS: Record<string, unknown>[] = [
  // 用户管理 (5)
  { targetName: 'new_user_01', targetRole: '公司经营', company: '滴滴答答' },
  { targetName: 'Alice', oldValue: '公司财务', newValue: '公司财务、公司审计' },
  { targetName: 'Jack', targetRole: '公司经营', company: '滴滴答答' },
  { targetName: 'Leo', oldValue: '启用', newValue: '禁用' },
  { targetName: 'Tom' },
  // 公司管理 (3)
  { targetName: '新星科技', currency: 'USDT', bindAccount: 'Leo' },
  { targetName: '滴滴答答', oldValue: 'old@example.com', newValue: 'new@example.com' },
  // 集团金融 (8)
  { from: '集团钱包', to: '滴滴答答', amount: 50000, currency: 'USDT' },
  { from: '滴滴答答', to: '集团钱包', amount: 20000, currency: 'USDT' },
  { walletType: 'TRC-20', amount: 100000, currency: 'USDT' },
  { walletType: 'TRC-20', amount: 30000, currency: 'USDT', bindAccount: 'TXyz...abc' },
  { walletType: 'TRC-20', bindAccount: 'TRbc...def' },
  { walletType: 'TRC-20', oldValue: 'TRbc...def', newValue: 'TRnew...xyz' },
  { walletType: 'ERC-20', bindAccount: '0xAbc...123' },
  { walletType: 'ERC-20', oldValue: '0xAbc...123', newValue: '0xNew...456' },
  // 企业管理 (2)
  { inviteCode: 'INV20251120' },
  { targetName: 'CyberBot', targetId: '283984' },
  // 通知管理 (4)
  { targetName: 'Tom', appUsername: 'tom_app', email: 'tom@example.com' },
  { targetName: 'Tom', oldValue: 'tom@old.com', newValue: 'tom@new.com' },
  { targetName: 'Tom' },
  { targetName: 'Tom', oldValue: '关闭', newValue: '开启' },
  // 系统设置 (3)
  { changes: [{ name: '会话超时时长', oldValue: '30分钟', newValue: '60分钟' }, { name: '强制MFA', oldValue: '关闭', newValue: '开启' }] },
  { changes: [{ name: '时区', oldValue: 'UTC+8', newValue: 'UTC+0' }] },
  { changes: [{ name: '邮件通知', oldValue: '关闭', newValue: '开启' }] },
  // 个人中心→系统设置 (2)
  { targetName: 'Miya' },
  { targetName: 'Miya', oldValue: '开启', newValue: '关闭' },
  // 导出数据 (1)
  { reportName: '公司收益报表', dateRange: '2025-10 ~ 2025-11', exportFormat: 'xlsx' },
];

// 操作行为 → 所属模块映射（与 OP_ACTIONS 一一对应，共 28 条）
const OP_ACTION_MODULE: string[] = [
  '用户管理', '用户管理', '用户管理', '用户管理', '用户管理',
  '公司管理', '公司管理',
  '集团金融', '集团金融', '集团金融', '集团金融',
  '集团金融', '集团金融', '集团金融', '集团金融',
  '企业管理', '企业管理',
  '通知管理', '通知管理', '通知管理', '通知管理',
  '系统设置', '系统设置', '系统设置',
  '系统设置', '系统设置',
  '集团金融',
];

const initialOpLogs: OperationLogEntry[] = Array.from({ length: 24 }, (_, i) => {
  const u = MOCK_USERS[i % MOCK_USERS.length];
  const actionIdx = i % OP_ACTIONS.length;
  return {
    id: `OL${String(i + 1).padStart(7, '0')}`,
    operateTime: `2025-11-${String(24 - i).padStart(2, '0')} ${String(9 + (i % 12)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}:00`,
    username: u.name,
    roles: u.roles.map(r => ROLE_LABELS[r]).join('、'),
    operation: OP_ACTIONS[actionIdx],
    module: OP_ACTION_MODULE[actionIdx],
    operateIp: `104.${28 + (i % 10)}.${200 + (i % 55)}.${i % 255}`,
    result: (i % 8 === 0 ? '失败' : '成功') as '成功' | '失败',
    detail: MOCK_DETAILS[actionIdx],
    level: u.level,
    group: u.group,
    company: u.company,
  };
});

// ── 筛选选项 ────────────────────────────────────────────────────────
const ROLE_OPTIONS = ALL_ROLES.map(r => ({ value: ROLE_LABELS[r], label: ROLE_LABELS[r] }));
const MODULE_OPTIONS = [...new Set([...OP_MODULES, ...OP_ACTION_MODULE, ...getOperationLogs().map(l => l.module)])].map(m => ({ value: m, label: m }));

// ── 主组件 ──────────────────────────────────────────────────────────
const SystemLogsPage: React.FC = () => {
  const auth = getMockAuth();
  const loginContainerRef = useRef<HTMLDivElement>(null);
  const opContainerRef = useRef<HTMLDivElement>(null);
  const handleRefresh = useCallback(() => { message.success('已刷新'); }, []);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'login';

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
  const [loginAction, setLoginAction] = useState<string | undefined>();

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

  const tabItems = [
    {
      key: 'login',
      label: '登录日志',
      children: (
        <>
        <div style={{ background: '#f6f8ff', border: '1px solid #d6e4ff', borderRadius: 6, padding: '10px 16px', marginBottom: 16, fontSize: 12, color: '#595959', lineHeight: 1.8 }}>
          {scopeHint}
        </div>
        <div ref={loginContainerRef}>
        <Card bordered={false} style={{ borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW }}>
          <Space size={16} wrap align="center" style={{ marginBottom: 16 }}>
            <ConfigProvider theme={radioTheme}>
              <Radio.Group
                value={loginAction ?? '全部'}
                onChange={(e) => setLoginAction(e.target.value === '全部' ? undefined : e.target.value)}
                buttonStyle="solid"
              >
                {['全部', '登录', '登出', '登录失败'].map((v) => (
                  <Radio.Button key={v} value={v}>{v === '全部' ? '全部类型' : v}</Radio.Button>
                ))}
              </Radio.Group>
            </ConfigProvider>
            <Select
              placeholder="筛选角色"
              value={loginRole}
              onChange={setLoginRole}
              allowClear
              style={{ width: 140 }}
              options={ROLE_OPTIONS}
            />
            <Input
              suffix={<SearchOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
              placeholder="账号名 / 登录IP"
              value={loginSearch}
              onChange={(e) => setLoginSearch(e.target.value)}
              allowClear
              style={{ width: 240 }}
            />
          </Space>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: 600 }}>登录日志</Text>
            <TableToolbar onRefresh={handleRefresh} containerRef={loginContainerRef} />
          </div>
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
        </div>
        </>
      ),
    },
    {
      key: 'operation',
      label: '操作日志',
      children: (
        <>
        <div style={{ background: '#f6f8ff', border: '1px solid #d6e4ff', borderRadius: 6, padding: '10px 16px', marginBottom: 16, fontSize: 12, color: '#595959', lineHeight: 1.8 }}>
          {scopeHint}
        </div>
        <div ref={opContainerRef}>
        <Card bordered={false} style={{ borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW }}>
          <Space size={16} wrap align="center" style={{ marginBottom: 16 }}>
            <Select
              placeholder="筛选模块"
              value={opModule}
              onChange={setOpModule}
              allowClear
              style={{ width: 140 }}
              options={MODULE_OPTIONS}
            />
            <ConfigProvider theme={radioTheme}>
              <Radio.Group value={opResult ?? '全部'} onChange={(e) => setOpResult(e.target.value === '全部' ? undefined : e.target.value)} buttonStyle="solid">
                {['全部', '成功', '失败'].map((v) => (
                  <Radio.Button key={v} value={v}>{v === '全部' ? '全部结果' : v}</Radio.Button>
                ))}
              </Radio.Group>
            </ConfigProvider>
            <Input
              suffix={<SearchOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
              placeholder="账号名 / 操作 / IP"
              value={opSearch}
              onChange={(e) => setOpSearch(e.target.value)}
              allowClear
              style={{ width: 240 }}
            />
          </Space>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: 600 }}>操作日志</Text>
            <TableToolbar onRefresh={handleRefresh} containerRef={opContainerRef} />
          </div>
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
        </>
      ),
    },
  ];

  return (
    <div style={{ marginTop: -16 }}>
      <Tabs
        items={tabItems}
        activeKey={activeTab}
        onChange={(key) => setSearchParams({ tab: key })}
        tabBarStyle={{
          background: '#fff',
          margin: '0 -24px',
          padding: '0 24px',
        }}
      />
    </div>
  );
};

export default SystemLogsPage;
