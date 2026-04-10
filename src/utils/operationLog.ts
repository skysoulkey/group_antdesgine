import { getMockAuth, ROLE_LABELS, type Role } from './auth';

// ── 操作日志 ─────────────────────────────────────────────────────
export interface OperationLogEntry {
  id: string;
  operateTime: string;
  username: string;
  roles: string;
  operation: string;
  module: string;
  operateIp: string;
  result: '成功' | '失败';
  detail?: Record<string, unknown>;
  level: 'group' | 'company';
  group: string;
  company: string;
}

// ── 登录日志 ─────────────────────────────────────────────────────
export type LoginAction = '登录' | '登出' | '登录失败';

export interface LoginLogEntry {
  id: string;
  loginTime: string;
  username: string;
  roles: string;
  action: LoginAction;
  loginIp: string;
  country: string;
  result: '成功' | '失败';
  level: 'group' | 'company';
  group: string;
  company: string;
}

const OP_LOG_KEY = 'operation_logs';
const LOGIN_LOG_KEY = 'login_logs';

function now(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function genId(prefix: string): string {
  return `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

/** 记录一条操作日志 */
export function addOperationLog(operation: string, module: string, result: '成功' | '失败' = '成功', detail?: Record<string, unknown>) {
  const auth = getMockAuth();
  const entry: OperationLogEntry = {
    id: genId('OL'),
    operateTime: now(),
    username: JSON.parse(localStorage.getItem('userInfo') ?? '{}').name ?? '未知',
    roles: auth.roles.map((r: Role) => ROLE_LABELS[r]).join('、'),
    operation,
    module,
    operateIp: '127.0.0.1',
    result,
    detail,
    level: auth.level,
    group: auth.level === 'group' ? (auth as { groupId: string }).groupId : '',
    company: auth.level === 'company' ? (auth as { companyId: string }).companyId : '',
  };
  const logs = getOperationLogs();
  logs.unshift(entry);
  localStorage.setItem(OP_LOG_KEY, JSON.stringify(logs));
}

/** 读取所有操作日志 */
export function getOperationLogs(): OperationLogEntry[] {
  try {
    return JSON.parse(localStorage.getItem(OP_LOG_KEY) ?? '[]');
  } catch {
    return [];
  }
}

/** 记录一条登录日志 */
export function addLoginLog(
  username: string,
  roles: Role[],
  action: LoginAction,
  result: '成功' | '失败',
  level: 'group' | 'company',
  group: string,
  company: string,
) {
  const entry: LoginLogEntry = {
    id: genId('LL'),
    loginTime: now(),
    username,
    roles: action === '登录失败' ? '-' : roles.map(r => ROLE_LABELS[r]).join('、') || '-',
    action,
    loginIp: '127.0.0.1',
    country: '🖥️ 本地网络',
    result,
    level,
    group,
    company,
  };
  const logs = getLoginLogs();
  logs.unshift(entry);
  localStorage.setItem(LOGIN_LOG_KEY, JSON.stringify(logs));
}

/** 读取所有登录日志 */
export function getLoginLogs(): LoginLogEntry[] {
  try {
    return JSON.parse(localStorage.getItem(LOGIN_LOG_KEY) ?? '[]');
  } catch {
    return [];
  }
}
