export type Role = 'group_admin' | 'company_admin' | 'system_admin';

/** Mock 当前角色 — 切换此值可测试不同权限 */
export const MOCK_ROLE: Role = 'group_admin';

/** 各路由允许访问的角色白名单（前缀匹配）*/
export const ROUTE_PERMISSIONS: Record<string, Role[]> = {
  '/dashboard/company':      ['company_admin', 'system_admin'],
  '/dashboard':              ['group_admin', 'system_admin'],
  '/company/list':           ['group_admin', 'system_admin'],
  '/finance/allocate':       ['group_admin', 'system_admin'],
  '/finance/recall':         ['group_admin', 'system_admin'],
  '/finance/revenue':        ['group_admin', 'system_admin'],
  '/company/shareholding':   ['company_admin', 'system_admin'],
  '/company/revenue':        ['company_admin', 'system_admin'],
  '/company/transfer':       ['company_admin', 'group_admin', 'system_admin'],
  '/enterprise/list':        ['company_admin', 'system_admin'],
  '/enterprise/invite':      ['company_admin', 'system_admin'],
  '/orders/lottery':         ['company_admin', 'system_admin'],
  '/commission':             ['company_admin', 'system_admin'],
  '/finance/wallet':         ['group_admin', 'system_admin'],
  '/finance/company-wallet': ['company_admin', 'system_admin'],
  '/company/detail':         ['group_admin', 'system_admin'],
  '/enterprise/detail':      ['company_admin', 'system_admin'],
};

/** 检查某角色是否有权访问某路由 */
export function hasPermission(role: Role, pathname: string): boolean {
  // 精确 + 前缀匹配（取最长前缀）
  const matched = Object.keys(ROUTE_PERMISSIONS)
    .filter((prefix) => pathname === prefix || pathname.startsWith(prefix + '/'))
    .sort((a, b) => b.length - a.length)[0];
  if (!matched) return true; // 未配置的路由默认允许
  return ROUTE_PERMISSIONS[matched].includes(role);
}

/** 根据角色返回首页路由 */
export function defaultRoute(role: Role): string {
  if (role === 'company_admin') return '/dashboard/company';
  return '/dashboard';
}
