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
