# 用户权限模块实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将权限系统从单角色 3 类（group_admin/company_admin/system_admin）重构为多角色 9 类内置角色（集团 4 + 公司 5），支持多角色并集、用户归属二选一、菜单/路由/用户管理全面适配。

**Architecture:** 核心改动在 `src/utils/auth.ts`（角色定义 + 路由映射 + 权限检查），然后逐层适配 layout（菜单过滤 + 路由守卫）、登录页（Mock 多角色存储 + 首次改密）、用户管理（过滤自己 + owner 操作权限）、角色管理（只读展示）、403 页和个人中心。

**Tech Stack:** React 18 + Ant Design 5 + Umi 4 + TypeScript

**设计文档：** `docs/superpowers/specs/用户权限模块设计.md`

---

## 文件清单

| 操作 | 文件 | 职责 |
|------|------|------|
| 重写 | `src/utils/auth.ts` | 角色类型、路由映射、权限检查、默认首页 |
| 修改 | `src/layouts/index.tsx` | 菜单 roles 标注、filterMenuByRole 适配多角色、路由守卫、角色切换器 |
| 修改 | `src/pages/login/index.tsx` | Mock 多角色存储 + 首次改密页面 |
| 修改 | `src/pages/system/users/index.tsx` | 过滤自己、owner 操作权限、角色选项更新、Mock 数据更新 |
| 重写 | `src/pages/system/roles/index.tsx` | 只读角色展示（移除增删改） |
| 修改 | `src/pages/403/index.tsx` | 适配多角色默认首页 |
| 修改 | `src/pages/system/profile/index.tsx` | 显示多角色、移除旧角色映射 |

---

### Task 1: 重写 `src/utils/auth.ts` — 角色定义与权限核心

**Files:**
- 重写: `src/utils/auth.ts`

- [ ] **Step 1: 重写整个 auth.ts**

将 `src/utils/auth.ts` 替换为以下内容：

```typescript
// ── 角色类型 ─────────────────────────────────────────────────────
export type GroupRole = 'group_owner' | 'group_finance' | 'group_ops' | 'group_audit';
export type CompanyRole = 'company_owner' | 'company_promo' | 'company_finance' | 'company_ops' | 'company_audit';
export type Role = GroupRole | CompanyRole;

export type UserAuth =
  | { level: 'group';   groupId: string; roles: GroupRole[] }
  | { level: 'company'; companyId: string; roles: CompanyRole[] };

// ── 角色显示名 ──────────────────────────────────────────────────
export const ROLE_LABELS: Record<Role, string> = {
  group_owner:    '集团主',
  group_finance:  '集团财务',
  group_ops:      '集团经营',
  group_audit:    '集团审计',
  company_owner:  '公司主',
  company_promo:  '公司推广',
  company_finance:'公司财务',
  company_ops:    '公司经营',
  company_audit:  '公司审计',
};

// ── 全部集团侧角色 / 公司侧角色 ─────────────────────────────────
export const GROUP_ROLES: GroupRole[] = ['group_owner', 'group_finance', 'group_ops', 'group_audit'];
export const COMPANY_ROLES: CompanyRole[] = ['company_owner', 'company_promo', 'company_finance', 'company_ops', 'company_audit'];
export const ALL_ROLES: Role[] = [...GROUP_ROLES, ...COMPANY_ROLES];

// ── 角色 → 路由映射 ─────────────────────────────────────────────
export const ROLE_ROUTES: Record<Role, string[]> = {
  // 集团侧
  group_owner: [
    '/dashboard', '/company/list', '/company/detail', '/company/transfer',
    '/finance/revenue', '/finance/wallet', '/finance/wallet/bind-account',
    '/system/users', '/system/logs', '/system/notifications',
  ],
  group_finance: ['/finance/revenue', '/finance/wallet', '/finance/wallet/bind-account'],
  group_ops:     ['/dashboard', '/company/list', '/company/detail', '/company/transfer'],
  group_audit:   ['/system/logs'],

  // 公司侧
  company_owner: [
    '/dashboard/company', '/company/shareholding', '/company/revenue',
    '/enterprise/list', '/enterprise/invite', '/enterprise/detail',
    '/orders/lottery', '/commission',
    '/finance/my-wallet', '/system/notifications', '/system/users', '/system/logs',
  ],
  company_promo:   ['/enterprise/list', '/enterprise/invite', '/enterprise/detail'],
  company_finance: ['/company/revenue', '/finance/my-wallet'],
  company_ops:     ['/dashboard/company', '/company/shareholding', '/orders/lottery', '/commission', '/system/notifications'],
  company_audit:   ['/system/logs'],
};

// 公共路由 — 所有角色都可访问
const PUBLIC_ROUTES = ['/system/profile'];

// ── 权限检查（多角色并集） ──────────────────────────────────────
export function hasPermission(roles: Role[], pathname: string): boolean {
  // 公共路由直接放行
  if (PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))) return true;
  // 合并所有角色的允许路由
  const allowed = roles.flatMap(role => ROLE_ROUTES[role] ?? []);
  return allowed.some(prefix => pathname === prefix || pathname.startsWith(prefix + '/'));
}

// ── 默认首页（按优先级匹配） ────────────────────────────────────
export function defaultRoute(roles: Role[]): string {
  if (roles.includes('group_owner') || roles.includes('group_ops'))     return '/dashboard';
  if (roles.includes('company_owner') || roles.includes('company_ops')) return '/dashboard/company';
  if (roles.includes('group_finance'))   return '/finance/wallet';
  if (roles.includes('company_finance')) return '/finance/my-wallet';
  if (roles.includes('group_audit') || roles.includes('company_audit')) return '/system/logs';
  if (roles.includes('company_promo'))   return '/enterprise/list';
  return '/system/profile';
}

// ── Mock 默认值 ─────────────────────────────────────────────────
export const MOCK_AUTH: UserAuth = { level: 'group', groupId: 'UU Talk', roles: ['group_owner'] };

/** 从 localStorage 读取当前用户权限（Mock 阶段） */
export function getMockAuth(): UserAuth {
  try {
    const raw = localStorage.getItem('mock_auth');
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return MOCK_AUTH;
}

/** 获取当前用户所有角色 */
export function getMockRoles(): Role[] {
  return getMockAuth().roles;
}

/** 判断是否为 owner 角色 */
export function isOwner(roles: Role[]): boolean {
  return roles.includes('group_owner') || roles.includes('company_owner');
}

/** 判断角色是集团侧还是公司侧 */
export function isGroupRole(role: Role): role is GroupRole {
  return role.startsWith('group_');
}
```

- [ ] **Step 2: 确认编译通过**

Run: `cd /Users/miya/Documents/group-admin-web && npx tsc --noEmit --skipLibCheck 2>&1 | head -30`

预期：会有其他文件引用旧 API 的报错（`MOCK_ROLE` 不存在等），这是正常的，将在后续 Task 修复。

- [ ] **Step 3: Commit**

```bash
git add src/utils/auth.ts
git commit -m "refactor: 重写 auth.ts — 9 角色定义 + 多角色并集权限检查"
```

---

### Task 2: 改造 `src/layouts/index.tsx` — 菜单与路由守卫

**Files:**
- 修改: `src/layouts/index.tsx`

- [ ] **Step 1: 更新 import 和角色状态初始化**

替换旧的 import 和 role state：

```typescript
// 旧
import { defaultRoute, hasPermission, MOCK_ROLE, type Role } from '../utils/auth';

// 新
import {
  defaultRoute, getMockAuth, getMockRoles, hasPermission,
  isGroupRole, MOCK_AUTH, ROLE_LABELS,
  GROUP_ROLES, COMPANY_ROLES, ALL_ROLES,
  type Role, type UserAuth,
} from '../utils/auth';
```

替换 role state 和 handleRoleChange：

```typescript
// 旧
const [role, setRole] = useState<Role>(
  () => (localStorage.getItem('mock_role') as Role) ?? MOCK_ROLE
);
const handleRoleChange = (newRole: Role) => {
  localStorage.setItem('mock_role', newRole);
  setRole(newRole);
  navigate(defaultRoute(newRole));
};

// 新
const [auth, setAuth] = useState<UserAuth>(getMockAuth);
const roles = auth.roles;

const handleAuthChange = (newAuth: UserAuth) => {
  localStorage.setItem('mock_auth', JSON.stringify(newAuth));
  setAuth(newAuth);
  navigate(defaultRoute(newAuth.roles));
};
```

- [ ] **Step 2: 更新菜单项的 roles 标注**

替换整个 `allMenuItems` 数组：

```typescript
const allMenuItems: MenuItem[] = [
  {
    key: 'dashboard',
    icon: <BarChartOutlined />,
    label: '仪表盘',
    roles: ['group_owner', 'group_ops', 'company_owner', 'company_ops'],
    children: [
      { key: '/dashboard',         label: '集团仪表盘', roles: ['group_owner', 'group_ops'] },
      { key: '/dashboard/company', label: '公司仪表盘', roles: ['company_owner', 'company_ops'] },
    ],
  },
  {
    key: 'group',
    icon: <BankOutlined />,
    label: '集团管理',
    roles: ['group_owner', 'group_ops', 'group_finance'],
    children: [
      { key: '/company/list',      label: '公司清单' },
      { key: '/company/transfer',  label: '内部划转' },
      { key: '/finance/revenue',   label: '集团收益', roles: ['group_owner', 'group_finance'] },
    ],
  },
  {
    key: 'company',
    icon: <StockOutlined />,
    label: '公司管理',
    roles: ['company_owner', 'company_ops', 'company_finance'],
    children: [
      { key: '/company/shareholding', label: '公司持股' },
      { key: '/company/revenue',      label: '公司收益', roles: ['company_owner', 'company_finance'] },
    ],
  },
  {
    key: 'enterprise',
    icon: <ApartmentOutlined />,
    label: '企业管理',
    roles: ['company_owner', 'company_promo'],
    children: [
      { key: '/enterprise/list',   label: '企业清单' },
      { key: '/enterprise/invite', label: '邀请企业' },
    ],
  },
  {
    key: 'orders',
    icon: <FileTextOutlined />,
    label: '公司订单',
    roles: ['company_owner', 'company_ops'],
    children: [
      { key: '/orders/lottery', label: '东方彩票' },
      { key: '/commission',     label: '佣金订单' },
    ],
  },
  {
    key: 'settings',
    icon: <SettingOutlined />,
    label: '设置中心',
    children: [
      { key: '/finance/my-wallet',      label: '公司钱包',  roles: ['company_owner', 'company_finance'] },
      { key: '/finance/wallet',         label: '集团钱包',  roles: ['group_owner', 'group_finance'] },
      { key: '/system/profile',         label: '个人中心' },
      { key: '/system/users',           label: '用户管理',  roles: ['group_owner', 'company_owner'] },
      { key: '/system/logs',            label: '系统日志',  roles: ['group_owner', 'group_audit', 'company_owner', 'company_audit'] },
      { key: '/system/notifications',   label: '通知管理',  roles: ['company_owner', 'company_ops'] },
    ],
  },
];
```

- [ ] **Step 3: 改造 filterMenuByRole 支持多角色**

```typescript
// 旧
function filterMenuByRole(items: MenuItem[], role: string): MenuProps['items'] {
  return items
    .filter((item) => !item.roles || item.roles.includes(role))
    .map((item) => {
      const { roles, children, ...rest } = item as MenuItem & { roles?: string[] };
      const filtered = children ? filterMenuByRole(children, role) : undefined;
      return filtered ? { ...rest, children: filtered } : rest;
    });
}

// 新
function filterMenuByRoles(items: MenuItem[], userRoles: Role[]): MenuProps['items'] {
  return items
    .filter((item) => !item.roles || item.roles.some((r: string) => userRoles.includes(r as Role)))
    .map((item) => {
      const { roles: _roles, children, ...rest } = item as MenuItem & { roles?: string[] };
      const filtered = children ? filterMenuByRoles(children, userRoles) : undefined;
      if (children && (!filtered || (filtered as unknown[]).length === 0)) return null;
      return filtered ? { ...rest, children: filtered } : rest;
    })
    .filter(Boolean);
}
```

- [ ] **Step 4: 更新 menuItems 调用和路由守卫**

```typescript
// 旧
const menuItems = filterMenuByRole(allMenuItems, role);

// 新
const menuItems = filterMenuByRoles(allMenuItems, roles);
```

```typescript
// 旧
useEffect(() => {
  if (!hasPermission(role, location.pathname)) {
    navigate('/403', { replace: true });
  }
}, [location.pathname, role]);

// 新
useEffect(() => {
  if (!hasPermission(roles, location.pathname)) {
    navigate('/403', { replace: true });
  }
}, [location.pathname, roles]);
```

- [ ] **Step 5: 替换 Header 中的角色切换器**

将 Header 中的 Select 角色切换器替换为一组预设角色方案的切换器：

```typescript
// 旧的 Select
<Select
  value={role}
  onChange={handleRoleChange}
  size="small"
  style={{ width: 120 }}
  options={[
    { value: 'group_admin',   label: '集团管理员' },
    { value: 'company_admin', label: '公司管理员' },
    { value: 'system_admin',  label: '系统管理员' },
  ]}
/>

// 新的 Select — 预设方案切换
<Select
  value={JSON.stringify(auth)}
  onChange={(v) => handleAuthChange(JSON.parse(v))}
  size="small"
  style={{ width: 140 }}
  options={[
    { value: JSON.stringify({ level: 'group', groupId: 'UU Talk', roles: ['group_owner'] }), label: '集团主' },
    { value: JSON.stringify({ level: 'group', groupId: 'UU Talk', roles: ['group_finance'] }), label: '集团财务' },
    { value: JSON.stringify({ level: 'group', groupId: 'UU Talk', roles: ['group_ops'] }), label: '集团经营' },
    { value: JSON.stringify({ level: 'group', groupId: 'UU Talk', roles: ['group_audit'] }), label: '集团审计' },
    { value: JSON.stringify({ level: 'company', companyId: '滴滴答答', roles: ['company_owner'] }), label: '公司主' },
    { value: JSON.stringify({ level: 'company', companyId: '滴滴答答', roles: ['company_promo'] }), label: '公司推广' },
    { value: JSON.stringify({ level: 'company', companyId: '滴滴答答', roles: ['company_finance'] }), label: '公司财务' },
    { value: JSON.stringify({ level: 'company', companyId: '滴滴答答', roles: ['company_ops'] }), label: '公司经营' },
    { value: JSON.stringify({ level: 'company', companyId: '滴滴答答', roles: ['company_audit'] }), label: '公司审计' },
    { value: JSON.stringify({ level: 'group', groupId: 'UU Talk', roles: ['group_ops', 'group_finance'] }), label: '集团经营+财务' },
  ]}
/>
```

- [ ] **Step 6: 更新余额显示条件**

```typescript
// 旧
{role !== 'system_admin' && (

// 新 — 集团 owner/finance 显示集团余额，公司 owner/finance 显示公司余额
{(roles.includes('group_owner') || roles.includes('group_finance') ||
  roles.includes('company_owner') || roles.includes('company_finance')) && (
```

- [ ] **Step 7: Commit**

```bash
git add src/layouts/index.tsx
git commit -m "refactor: layout 菜单过滤 + 路由守卫适配多角色体系"
```

---

### Task 3: 改造 `src/pages/login/index.tsx` — Mock 多角色存储 + 首次改密

**Files:**
- 修改: `src/pages/login/index.tsx`

- [ ] **Step 1: 更新 import**

```typescript
// 在文件顶部添加
import { defaultRoute, type UserAuth } from '../../utils/auth';
```

- [ ] **Step 2: 添加首次改密步骤状态**

在 `const [step, setStep] = useState<'login' | 'mfa'>('login');` 处替换：

```typescript
const [step, setStep] = useState<'login' | 'mfa' | 'change-pwd'>('login');
const [changePwdForm] = Form.useForm();
```

- [ ] **Step 3: 更新 MFA 完成后的逻辑**

替换 `onMfaFinish` 函数：

```typescript
const onMfaFinish = (values: { otp: string }) => {
  if (!values.otp || values.otp.length !== 6) {
    message.error('请输入 6 位动态码');
    return;
  }
  setLoading(true);
  setTimeout(() => {
    localStorage.setItem('token', 'mock-token-12345');
    // Mock: 存储多角色信息
    const mockAuth: UserAuth = { level: 'group', groupId: 'UU Talk', roles: ['group_owner'] };
    localStorage.setItem('mock_auth', JSON.stringify(mockAuth));
    localStorage.setItem('userInfo', JSON.stringify({ name: 'Miya' }));

    // Mock: 检测首次登录（演示模式直接跳过）
    const mustChangePwd = false; // 后端返回
    if (mustChangePwd) {
      setLoading(false);
      setStep('change-pwd');
    } else {
      message.success('登录成功');
      navigate(defaultRoute(mockAuth.roles));
      setLoading(false);
    }
  }, 700);
};
```

- [ ] **Step 4: 添加首次改密表单 UI**

在 MFA 表单的 `</Form>` 之后，`) : (` 之前，添加改密表单条件分支。将原来的三元表达式改为：

```typescript
{step === 'login' ? (
  // ... 原登录表单不变 ...
) : step === 'mfa' ? (
  // ... 原 MFA 表单不变 ...
) : (
  /* ── 首次改密表单 ── */
  <Form form={changePwdForm} onFinish={(values) => {
    if (values.newPwd !== values.confirmPwd) {
      message.error('两次密码不一致');
      return;
    }
    message.success('密码修改成功，正在进入系统…');
    const auth = JSON.parse(localStorage.getItem('mock_auth') ?? '{}');
    navigate(defaultRoute(auth.roles ?? []));
  }} layout="vertical" requiredMark={false}>
    <div style={{ textAlign: 'center', marginBottom: 24 }}>
      <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>
        首次登录请修改密码
      </Text>
    </div>
    <ConfigProvider theme={{
      components: {
        Input: {
          colorBgContainer: 'rgba(255,255,255,0.07)',
          colorBorder: 'rgba(255,255,255,0.12)',
          colorText: '#fff',
          colorTextPlaceholder: 'rgba(255,255,255,0.3)',
          colorIcon: 'rgba(255,255,255,0.3)',
          hoverBorderColor: 'rgba(167,139,250,0.6)',
          activeBorderColor: '#1677ff',
        },
      },
    }}>
      <Form.Item name="newPwd" rules={[{ required: true, min: 8, message: '密码至少8位' }]}>
        <Input.Password prefix={<LockOutlined />} placeholder="请输入新密码（至少8位）" size="large" style={{ borderRadius: 8 }} />
      </Form.Item>
      <Form.Item name="confirmPwd" rules={[
        { required: true, message: '请确认新密码' },
        ({ getFieldValue }) => ({
          validator(_, value) {
            if (!value || getFieldValue('newPwd') === value) return Promise.resolve();
            return Promise.reject(new Error('两次密码不一致'));
          },
        }),
      ]}>
        <Input.Password prefix={<LockOutlined />} placeholder="请再次输入新密码" size="large" style={{ borderRadius: 8 }} />
      </Form.Item>
    </ConfigProvider>
    <Form.Item style={{ marginTop: 20, marginBottom: 0 }}>
      <Button type="primary" htmlType="submit" block size="large" style={{
        height: 46, fontSize: 15, fontWeight: 600, borderRadius: 10,
        background: 'linear-gradient(135deg, #1677ff 0%, #2f54eb 100%)',
        border: 'none', boxShadow: '0 6px 20px rgba(22,119,255,0.45)',
      }}>
        确认修改
      </Button>
    </Form.Item>
  </Form>
)}
```

- [ ] **Step 5: 更新 step 标题显示**

```typescript
// 旧
{step === 'login' ? 'USER LOGIN' : 'MFA VERIFICATION'}

// 新
{step === 'login' ? 'USER LOGIN' : step === 'mfa' ? 'MFA VERIFICATION' : 'CHANGE PASSWORD'}
```

- [ ] **Step 6: Commit**

```bash
git add src/pages/login/index.tsx
git commit -m "refactor: 登录页适配多角色存储 + 首次改密流程"
```

---

### Task 4: 改造 `src/pages/system/users/index.tsx` — 用户管理权限

**Files:**
- 修改: `src/pages/system/users/index.tsx`

- [ ] **Step 1: 更新 import 和角色常量**

```typescript
// 旧
import { type Role } from '../../utils/auth';

// 新
import { getMockAuth, getMockRoles, isOwner, ROLE_LABELS, GROUP_ROLES, COMPANY_ROLES, type Role, type GroupRole, type CompanyRole } from '../../utils/auth';
```

替换角色常量：

```typescript
// 旧
const ROLES = ['集团管理员', '公司管理员', '平台管理员'] as const;
type UserRole = typeof ROLES[number];
const STATUSES = ['启用', '停用'] as const;
type UserStatus = typeof STATUSES[number];

// 新
const STATUSES = ['启用', '停用'] as const;
type UserStatus = typeof STATUSES[number];
```

删除 `roleColors` 变量。

- [ ] **Step 2: 更新 UserRecord 接口**

```typescript
// 旧
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

// 新
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
}
```

- [ ] **Step 3: 更新 Mock 数据**

替换 `initialData` 数组：

```typescript
const initialData: UserRecord[] = [
  { id: 'U001', username: 'Miya', phone: '+65 8991 0293', email: 'miya@cyberbot.sg', level: 'group', group: 'UU Talk', company: '', roles: ['group_owner'], status: '启用', createdAt: '2025-11-23 13:56:21', ipRestrict: false, ipWhitelist: '', validPeriod: '永久有效', notifyAccounts: '@miya_miya' },
  { id: 'U002', username: 'Tom Admin', phone: '+65 8765 4321', email: 'tom@uutalk.com', level: 'company', group: 'UU Talk', company: '滴滴答答', roles: ['company_owner'], status: '启用', createdAt: '2025-10-01 09:00:00', ipRestrict: true, ipWhitelist: '104.28.0.0/16', validPeriod: '2026-12-31', notifyAccounts: '@tom_admin' },
  { id: 'U003', username: 'Jack', phone: '+86 138 0001 0001', email: 'jack@uutalk.com', level: 'company', group: 'UU Talk', company: 'UU Talk', roles: ['company_ops'], status: '停用', createdAt: '2025-09-15 14:30:00', ipRestrict: false, ipWhitelist: '', validPeriod: '永久有效', notifyAccounts: '' },
  { id: 'U004', username: 'Alice', phone: '+1 415 555 0101', email: 'alice@uutalk.com', level: 'company', group: 'UU Talk', company: '滴滴答答', roles: ['company_finance'], status: '启用', createdAt: '2025-08-20 11:00:00', ipRestrict: false, ipWhitelist: '', validPeriod: '2025-01-01', notifyAccounts: '@alice_finance' },
  { id: 'U005', username: 'Ryan', phone: '+65 8234 5678', email: 'ryan@uutalk.com', level: 'group', group: 'UU Talk', company: '', roles: ['group_finance'], status: '启用', createdAt: '2025-04-15 08:00:00', ipRestrict: true, ipWhitelist: '192.168.1.0/24', validPeriod: '2027-06-30', notifyAccounts: '@ryan_admin' },
  { id: 'U006', username: 'Leo', phone: '+65 9123 4567', email: 'leo@uutalk.com', level: 'company', group: 'UU Talk', company: 'UU Talk', roles: ['company_promo'], status: '启用', createdAt: '2025-06-10 10:00:00', ipRestrict: false, ipWhitelist: '', validPeriod: '2025-03-01', notifyAccounts: '@leo_ops' },
  { id: 'U007', username: 'Nina', phone: '+86 139 8888 7777', email: 'nina@uutalk.com', level: 'group', group: 'UU Talk', company: '', roles: ['group_ops'], status: '启用', createdAt: '2025-05-20 09:30:00', ipRestrict: false, ipWhitelist: '', validPeriod: '永久有效', notifyAccounts: '' },
  { id: 'U008', username: 'Mark', phone: '+86 188 0000 1234', email: 'mark@uutalk.com', level: 'group', group: 'UU Talk', company: '', roles: ['group_audit'], status: '启用', createdAt: '2025-02-18 15:45:00', ipRestrict: false, ipWhitelist: '', validPeriod: '永久有效', notifyAccounts: '@mark_ops' },
  { id: 'U009', username: 'Eve', phone: '+65 6777 9999', email: 'eve@uutalk.com', level: 'company', group: 'UU Talk', company: '滴滴答答', roles: ['company_ops', 'company_audit'], status: '启用', createdAt: '2025-03-01 12:00:00', ipRestrict: false, ipWhitelist: '', validPeriod: '永久有效', notifyAccounts: '' },
];
```

- [ ] **Step 4: 更新可见范围逻辑 — 过滤自己 + owner 权限**

替换组件顶部的角色获取和数据过滤逻辑：

```typescript
const UserManagePage: React.FC = () => {
  const mockAuth = getMockAuth();
  const mockRoles = getMockRoles();
  const currentUserId = 'U001'; // Mock: 当前登录用户 ID

  // 可见范围：owner 才能进入，过滤掉自己
  const visibleData = initialData.filter((r) => {
    if (r.id === currentUserId) return false; // 不显示自己
    if (mockAuth.level === 'group') return r.group === mockAuth.groupId;
    return r.company === (mockAuth as { companyId: string }).companyId;
  });
  const [users, setUsers] = useState<UserRecord[]>(visibleData);
```

- [ ] **Step 5: 更新表格列 — 角色列显示多角色**

在 columns 中更新角色列：

```typescript
// 旧
{ title: '角色', dataIndex: 'role', width: 110 },

// 新
{
  title: '角色', dataIndex: 'roles', width: 160,
  render: (v: Role[]) => v.map(r => ROLE_LABELS[r]).join('、'),
},
```

更新操作列的 canManage 判断：

```typescript
// 旧
const canManage = mockRole === 'system_admin' || (mockRole === 'group_admin' && r.role === '公司管理员');

// 新 — owner 才可操作；集团主可操作所有人，公司主只操作公司用户
const canManage = mockRoles.includes('group_owner') || (mockRoles.includes('company_owner') && r.level === 'company');
```

- [ ] **Step 6: 更新筛选栏角色下拉**

```typescript
// 旧
<Select
  placeholder="请选择角色"
  value={roleFilter}
  onChange={setRoleFilter}
  allowClear
  style={{ width: 130 }}
  options={ROLES.map((r) => ({ value: r, label: r }))}
/>

// 新
<Select
  placeholder="请选择角色"
  value={roleFilter}
  onChange={setRoleFilter}
  allowClear
  style={{ width: 130 }}
  options={Object.entries(ROLE_LABELS).map(([k, v]) => ({ value: k, label: v }))}
/>
```

同步更新 `roleFilter` 的筛选逻辑：

```typescript
// 旧
(!roleFilter || r.role === roleFilter) &&

// 新
(!roleFilter || r.roles.includes(roleFilter as Role)) &&
```

- [ ] **Step 7: 更新创建用户弹窗中的角色选择**

将创建用户弹窗中的角色 Select 改为根据当前用户归属层级显示对应角色列表：

```typescript
// 旧 — 创建按钮 onClick
if (mockRole === 'group_admin') {
  setCreateRole('公司管理员');
  setCreateGroup(CURRENT_GROUP);
  createForm.setFieldsValue({ role: '公司管理员', group: CURRENT_GROUP });
}

// 新
if (mockAuth.level === 'group') {
  setCreateGroup(mockAuth.groupId);
  createForm.setFieldsValue({ group: mockAuth.groupId });
}
```

更新角色 Select 组件：

```typescript
// 旧
<Form.Item label="角色" name="role" rules={[{ required: true, message: '请选择角色' }]}>
  {mockRole === 'group_admin' ? (
    <Select disabled options={[{ value: '公司管理员', label: '公司管理员' }]} />
  ) : (
    <Select ... />
  )}
</Form.Item>

// 新 — 多选，集团主可分配集团角色+公司角色，公司主只能分配公司角色
<Form.Item label="角色" name="roles" rules={[{ required: true, message: '请选择角色' }]}>
  <Select
    mode="multiple"
    placeholder="请选择角色"
    options={
      mockAuth.level === 'group'
        ? [...GROUP_ROLES.filter(r => r !== 'group_owner'), ...COMPANY_ROLES.filter(r => r !== 'company_owner')].map(r => ({ value: r, label: ROLE_LABELS[r] }))
        : COMPANY_ROLES.filter(r => r !== 'company_owner').map(r => ({ value: r, label: ROLE_LABELS[r] }))
    }
  />
</Form.Item>
```

- [ ] **Step 8: 更新说明文案**

```typescript
// 旧
<div>1. 集团管理员可查看本集团管理员账号及下属公司管理员账号</div>
<div>2. 同一公司管理员之间数据不做权限隔离，功能模块权限按照授予【角色】控制</div>
<div>3. 数据权限由【归属集团】和【归属公司】进行控制，功能权限由【角色】进行控制</div>

// 新
<div>1. 集团主可查看本集团所有用户（含下属公司），公司主可查看本公司所有用户</div>
<div>2. 用户列表不显示自己，不可编辑自己的角色</div>
<div>3. 同一公司管理员之间数据不做权限隔离，功能模块权限按角色控制</div>
<div>4. 一个用户可持有多个角色，权限取并集；集团/公司角色不可混搭</div>
```

- [ ] **Step 9: Commit**

```bash
git add src/pages/system/users/index.tsx
git commit -m "refactor: 用户管理页适配多角色 — 过滤自己 + owner 权限控制"
```

---

### Task 5: 重写 `src/pages/system/roles/index.tsx` — 只读角色展示

**Files:**
- 重写: `src/pages/system/roles/index.tsx`

- [ ] **Step 1: 重写整个文件**

替换为只读的角色展示页面：

```typescript
import { BankOutlined, ShopOutlined } from '@ant-design/icons';
import { Card, Col, Row, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React from 'react';
import { ROLE_LABELS, ROLE_ROUTES, GROUP_ROLES, COMPANY_ROLES, type Role } from '../../utils/auth';

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

interface RoleRow {
  key: Role;
  name: string;
  modules: string[];
}

function buildRows(roleIds: Role[]): RoleRow[] {
  return roleIds.map((id) => ({
    key: id,
    name: ROLE_LABELS[id],
    modules: ROLE_ROUTES[id].map((r) => MODULE_LABELS[r] ?? r),
  }));
}

const columns: ColumnsType<RoleRow> = [
  { title: '角色', dataIndex: 'name', width: 120, render: (v) => <Text strong>{v}</Text> },
  {
    title: '功能模块',
    dataIndex: 'modules',
    render: (v: string[]) => (
      <span style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {v.map((m) => <Tag key={m} style={{ margin: 0 }}>{m}</Tag>)}
      </span>
    ),
  },
];

const RoleManagePage: React.FC = () => (
  <Row gutter={16}>
    <Col span={12}>
      <Card
        bordered={false}
        title={<><BankOutlined style={{ marginRight: 8, color: '#1677ff' }} />集团侧角色</>}
        style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}
      >
        <Table columns={columns} dataSource={buildRows(GROUP_ROLES)} pagination={false} size="middle" />
      </Card>
    </Col>
    <Col span={12}>
      <Card
        bordered={false}
        title={<><ShopOutlined style={{ marginRight: 8, color: '#1677ff' }} />公司侧角色</>}
        style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}
      >
        <Table columns={columns} dataSource={buildRows(COMPANY_ROLES)} pagination={false} size="middle" />
      </Card>
    </Col>
  </Row>
);

export default RoleManagePage;
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/system/roles/index.tsx
git commit -m "refactor: 角色管理页改为只读展示 — 移除增删改"
```

---

### Task 6: 改造 `src/pages/403/index.tsx` — 适配多角色

**Files:**
- 修改: `src/pages/403/index.tsx`

- [ ] **Step 1: 替换整个文件内容**

```typescript
import { Button, Result } from 'antd';
import React from 'react';
import { useNavigate } from 'umi';
import { defaultRoute, getMockRoles } from '../../utils/auth';

const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();
  const roles = getMockRoles();
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <Result
        status="403"
        title="403"
        subTitle="抱歉，您没有权限访问此页面。"
        extra={
          <Button type="primary" onClick={() => navigate(defaultRoute(roles), { replace: true })}>
            返回首页
          </Button>
        }
      />
    </div>
  );
};

export default ForbiddenPage;
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/403/index.tsx
git commit -m "refactor: 403 页适配多角色默认首页"
```

---

### Task 7: 改造 `src/pages/system/profile/index.tsx` — 显示多角色

**Files:**
- 修改: `src/pages/system/profile/index.tsx`

- [ ] **Step 1: 更新 import**

```typescript
// 旧
import { MOCK_ROLE, type Role } from '../../../utils/auth';

// 新
import { getMockAuth, ROLE_LABELS } from '../../../utils/auth';
```

- [ ] **Step 2: 替换角色相关代码**

删除 `roleLabel` 常量。替换角色获取：

```typescript
// 旧
const role = ((localStorage.getItem('mock_role') as Role) ?? MOCK_ROLE);

// 新
const auth = getMockAuth();
const roles = auth.roles;
```

更新 personalInfo：

```typescript
// 旧
role: roleLabel[role],

// 新
role: roles.map(r => ROLE_LABELS[r]).join('、'),
```

- [ ] **Step 3: 更新归属显示条件**

```typescript
// 旧
{(role === 'group_admin' || role === 'company_admin') && (
  <Descriptions.Item label="归属集团">UU Talk 集团</Descriptions.Item>
)}
{role === 'company_admin' && (
  <Descriptions.Item label="归属公司">炸雷第一波</Descriptions.Item>
)}

// 新
{auth.level === 'group' && (
  <Descriptions.Item label="归属集团">{auth.groupId}</Descriptions.Item>
)}
{auth.level === 'company' && (
  <>
    <Descriptions.Item label="归属公司">{auth.companyId}</Descriptions.Item>
  </>
)}
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/system/profile/index.tsx
git commit -m "refactor: 个人中心显示多角色 + 适配归属层级"
```

---

### Task 8: 全局验证 + 文档同步

**Files:**
- 检查: 所有已改文件
- 更新: `doc/changelog.md`
- 更新: `src/styles/design-spec.md`（如有角色相关内容）
- 更新: `doc/page_map.md`（角色管理页变更）

- [ ] **Step 1: 编译检查**

Run: `cd /Users/miya/Documents/group-admin-web && npx tsc --noEmit --skipLibCheck 2>&1 | head -50`

预期：无错误。如有报错则逐个修复。

- [ ] **Step 2: 启动开发服务器验证**

Run: `cd /Users/miya/Documents/group-admin-web && npx umi dev`

手动检查：
1. 使用角色切换器切换到每个预设角色
2. 确认菜单正确过滤
3. 确认无权限路由跳转 403
4. 确认 403 返回首页跳到正确页面
5. 确认个人中心显示正确角色和归属
6. 确认角色管理页为只读展示
7. 确认用户管理页过滤了自己

- [ ] **Step 3: 更新 doc/changelog.md**

追加：

```markdown
### 2026-04-09 — 用户权限模块重构

- 角色体系从 3 个（集团管理员/公司管理员/平台管理员）重构为 9 个内置角色
  - 集团侧：集团主、集团财务、集团经营、集团审计
  - 公司侧：公司主、公司推广、公司财务、公司经营、公司审计
- 用户归属集团或公司，二选一，角色不可混搭
- 支持多角色并集，权限取并集
- 用户管理：列表不显示自己，仅 owner 可操作
- 角色管理：改为只读展示，移除增删改
- MFA 强制开启，首次登录强制改密（前端预留）
- 403 页、个人中心适配多角色
```

- [ ] **Step 4: 更新 doc/page_map.md**

更新角色管理页描述为"只读角色展示"。

- [ ] **Step 5: Commit**

```bash
git add doc/changelog.md doc/page_map.md
git commit -m "docs: 权限重构变更记录 + 页面清单同步更新"
```
