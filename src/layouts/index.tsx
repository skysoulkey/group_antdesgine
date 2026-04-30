import {
  ApartmentOutlined,
  BankOutlined,
  BellOutlined,
  BarChartOutlined,
  CloseOutlined,
  FileTextOutlined,
  LinkOutlined,
  LogoutOutlined,
  SettingOutlined,
  StockOutlined,
  UserOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import logoImg from '../assets/logo.svg';
import { Badge, Breadcrumb, Button, Divider, Layout, List, Menu, Popover, Select, Space, Typography, Watermark } from 'antd';
import type { MenuProps } from 'antd';
import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate, useSearchParams } from 'umi';
import {
  defaultRoute, getMockAuth, hasPermission,
  type Role, type UserAuth,
} from '../utils/auth';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

// ── 角色过滤菜单 ──────────────────────────────────────────────────
type MenuItem = NonNullable<MenuProps['items']>[number] & { roles?: string[]; children?: MenuItem[] };

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
    roles: ['group_owner', 'group_ops', 'group_finance', 'group_audit'],
    children: [
      { key: '/company/list',      label: '公司清单',  roles: ['group_owner', 'group_ops'] },
      { key: '/company/transfer',  label: '内部划转',  roles: ['group_owner', 'group_ops'] },
      { key: '/finance/revenue',   label: '集团收益',  roles: ['group_owner', 'group_finance'] },
      { key: '/enterprise/app-fee', label: '应用费用', roles: ['group_owner', 'group_finance', 'group_audit'] },
    ],
  },
  {
    key: 'company',
    icon: <StockOutlined />,
    label: '公司管理',
    roles: ['company_owner', 'company_ops', 'company_finance'],
    children: [
      { key: '/company/shareholding', label: '公司持股', roles: ['company_owner', 'company_ops'] },
      { key: '/company/revenue',      label: '公司收益', roles: ['company_owner', 'company_finance'] },
      { key: '/finance/approvals',    label: '投资审批', roles: ['company_owner', 'company_ops'] },
    ],
  },
  {
    key: 'finance',
    icon: <WalletOutlined />,
    label: '公司财务',
    roles: ['company_owner', 'company_finance', 'company_audit'],
    children: [
      { key: '/enterprise/tax',      label: '企业税收', roles: ['company_owner', 'company_finance'] },
      { key: '/finance/all-wallet',  label: '公司钱包', roles: ['company_owner', 'company_finance'] },
      { key: '/finance/settlement',  label: '公司清账', roles: ['company_owner', 'company_finance', 'company_audit'] },
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
      { key: '/finance/wallet',         label: '集团钱包',  roles: ['group_owner', 'group_finance'] },
      { key: '/system/profile',         label: '个人中心' },
      { key: '/system/users',           label: '用户管理',  roles: ['group_owner', 'company_owner'] },
      { key: '/system/logs',            label: '系统日志',  roles: ['group_owner', 'group_audit', 'company_owner', 'company_audit'] },
      { key: '/system/notifications',   label: '通知管理',  roles: ['company_owner', 'company_ops'] },
    ],
  },
];

function filterMenuByRoles(items: MenuItem[], userRoles: Role[]): MenuItem[] {
  return items
    .filter((item) => !item.roles || item.roles.some((r: string) => userRoles.includes(r as Role)))
    .map((item) => {
      const { roles: _roles, children, ...rest } = item as MenuItem & { roles?: string[] };
      const filtered = children ? filterMenuByRoles(children, userRoles) : undefined;
      if (children && (!filtered || filtered.length === 0)) return null;
      return filtered ? { ...rest, children: filtered } : rest;
    })
    .filter(Boolean) as MenuItem[];
}

// ── 面包屑映射 ────────────────────────────────────────────────────
const breadcrumbMap: Record<string, string[]> = {
  '/dashboard':              ['首页', '集团仪表盘'],
  '/dashboard/company':      ['首页', '公司仪表盘'],
  '/company/list':           ['集团管理', '公司清单'],
  '/company/detail':         ['公司管理', '公司清单', '公司概览'],
  '/finance/revenue':        ['集团管理', '集团收益'],
  '/finance/revenue/detail': ['集团管理', '集团收益', '收益汇算明细'],
  '/company/shareholding':   ['公司管理', '公司持股'],
  '/company/revenue':        ['公司管理', '公司收益'],
  '/company/transfer':       ['集团管理', '内部划转'],
  '/enterprise/list':        ['企业管理', '企业清单'],
  '/enterprise/invite':      ['企业管理', '邀请企业'],
  '/enterprise/tax':         ['公司财务', '企业税收'],
  '/orders/lottery':         ['公司订单', '东方彩票'],
  '/commission':             ['公司订单', '佣金订单'],
  '/finance/my-wallet':      ['公司财务', '公司钱包（旧）'],
  '/finance/all-wallet':     ['公司财务', '公司钱包'],
  '/finance/settlement':     ['公司财务', '公司清账'],
  '/finance/settlement/preview': ['公司财务', '公司清账', '账单 PDF'],
  '/enterprise/app-fee':     ['集团管理', '应用费用'],
  '/enterprise/app-fee/preview': ['集团管理', '应用费用', '账单 PDF'],
  '/finance/wallet':             ['设置中心', '集团钱包'],
  '/finance/wallet/bind-account': ['设置中心', '集团钱包', '修改绑定账号'],
  '/system/profile':         ['设置中心', '个人中心'],
  '/system/users':           ['设置中心', '用户管理'],
  '/system/logs':            ['设置中心', '系统日志'],
  '/system/notifications':   ['设置中心', '通知管理'],
  '/finance/approvals':      ['公司管理', '投资审批'],
  '/403':                    ['错误', '无权限'],
};

// ── Tab 级面包屑映射 ─────────────────────────────────────────────
const tabBreadcrumbMap: Record<string, Record<string, string[]>> = {
  '/company/detail': {
    overview:      ['公司管理', '公司清单', '公司概览'],
    groupTransfer: ['公司管理', '公司清单', '集团转账'],
    holding:       ['公司管理', '公司清单', '持股估值'],
  },
  '/enterprise/detail': {
    overview:      ['企业管理', '企业清单', '企业概览'],
    members:       ['企业管理', '企业清单', '成员清单'],
    shareholders:  ['企业管理', '企业清单', '股东清单'],
    dividend:      ['企业管理', '企业清单', '投资分红'],
    sharesTrade:   ['企业管理', '企业清单', '股份交易'],
    apps:          ['企业管理', '企业清单', '开通应用'],
    redpacket:     ['企业管理', '企业清单', '踩雷红包'],
    lottery:       ['企业管理', '企业清单', '东方彩票'],
    commission:    ['企业管理', '企业清单', '佣金订单'],
    niuniuRedpacket: ['企业管理', '企业清单', '牛牛红包'],
    appFee:        ['企业管理', '企业清单', '应用费用'],
  },
  '/system/logs': {
    login:     ['设置中心', '系统日志', '登录日志'],
    operation: ['设置中心', '系统日志', '操作日志'],
  },
  '/finance/approvals': {
    list:  ['公司管理', '投资审批', '审批列表'],
    rules: ['公司管理', '投资审批', '审批规则'],
  },
};

function getBreadcrumb(pathname: string, tab?: string): string[] {
  // Tab 级匹配（详情页 + tab 参数）
  if (tab) {
    for (const prefix of Object.keys(tabBreadcrumbMap)) {
      if (pathname === prefix || pathname.startsWith(prefix + '/')) {
        const tabMap = tabBreadcrumbMap[prefix];
        if (tabMap[tab]) return tabMap[tab];
      }
    }
  }
  // 精确匹配
  if (breadcrumbMap[pathname]) return breadcrumbMap[pathname];
  // 前缀匹配（如详情页 /company/detail/123）
  const prefix = Object.keys(breadcrumbMap)
    .filter((k) => pathname.startsWith(k + '/'))
    .sort((a, b) => b.length - a.length)[0];
  return prefix ? breadcrumbMap[prefix] : ['首页'];
}

function getDefaultOpenKeys(pathname: string): string[] {
  if (pathname.startsWith('/dashboard')) return ['dashboard'];
  if (pathname.startsWith('/company/list') || pathname.startsWith('/company/transfer') ||
      pathname.startsWith('/finance/revenue') || pathname === '/enterprise/app-fee') return ['group'];
  if (pathname.startsWith('/finance/approvals')) return ['company'];
  if (pathname.startsWith('/finance/my-wallet') || pathname.startsWith('/finance/all-wallet') ||
      pathname.startsWith('/finance/settlement') || pathname.startsWith('/enterprise/tax')) return ['finance'];
  if (pathname.startsWith('/company/')) return ['company'];
  if (pathname.startsWith('/enterprise')) return ['enterprise'];
  if (pathname.startsWith('/orders') || pathname.startsWith('/commission')) return ['orders'];
  if (pathname.startsWith('/finance') || pathname.startsWith('/system')) return ['settings'];
  return [];
}

// ── 站内通知 mock 数据 ────────────────────────────────────────────
interface InboxItem {
  id: string;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

const NOTIF_TYPES_INBOX = ['集团下拨', '集团调回', '持股企业追加投资', '企业解散', '新增订阅企业', '企业认证过期'];

const initInbox: InboxItem[] = Array.from({ length: 8 }, (_, i) => ({
  id: `INB${String(i + 1).padStart(5, '0')}`,
  title: `${NOTIF_TYPES_INBOX[i % NOTIF_TYPES_INBOX.length]}通知`,
  content: `${NOTIF_TYPES_INBOX[i % NOTIF_TYPES_INBOX.length]}操作已完成，请及时确认处理。编号：${1000 + i}`,
  type: NOTIF_TYPES_INBOX[i % NOTIF_TYPES_INBOX.length],
  isRead: i >= 5,
  createdAt: `${i < 3 ? '10分钟' : i < 5 ? '2小时' : '1天'}前`,
}));

// ── 主布局 ────────────────────────────────────────────────────────
const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const [auth, setAuth] = useState<UserAuth>(getMockAuth);
  const roles: Role[] = auth.roles;

  const handleAuthChange = (newAuth: UserAuth) => {
    localStorage.setItem('mock_auth', JSON.stringify(newAuth));
    setAuth(newAuth);
    navigate(defaultRoute(newAuth.roles));
  };

  // UU 账号绑定引导
  // TODO: 替换为真实的 UU 账号绑定状态判断
  const hasUUAccount = false;
  const [uuBannerDismissed, setUuBannerDismissed] = useState(false);
  const showUUBanner = !hasUUAccount && !uuBannerDismissed;

  // 站内通知状态
  const [inbox, setInbox] = useState<InboxItem[]>(initInbox);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const unreadCount = inbox.filter((n) => !n.isRead).length;

  const handleMarkAllRead = () => {
    setInbox((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleMarkRead = (id: string) => {
    setInbox((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
  };

  const notificationContent = (
    <div style={{ width: 360 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
        <Text strong style={{ fontSize: 15 }}>站内通知</Text>
        {unreadCount > 0 && (
          <Button type="link" size="small" style={{ padding: 0, fontSize: 12 }} onClick={handleMarkAllRead}>
            全部已读
          </Button>
        )}
      </div>
      <Divider style={{ margin: '8px 0' }} />
      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
        <List
          dataSource={inbox}
          renderItem={(item) => (
            <List.Item
              style={{ padding: '10px 0', cursor: 'pointer', opacity: item.isRead ? 0.6 : 1 }}
              onClick={() => handleMarkRead(item.id)}
            >
              <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                {!item.isRead && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1677ff', marginTop: 6, flexShrink: 0 }} />
                )}
                {item.isRead && <div style={{ width: 8, flexShrink: 0 }} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong={!item.isRead} style={{ fontSize: 13 }}>{item.title}</Text>
                    <Text type="secondary" style={{ fontSize: 11, flexShrink: 0, marginLeft: 8 }}>{item.createdAt}</Text>
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }} ellipsis>{item.content}</Text>
                </div>
              </div>
            </List.Item>
          )}
        />
      </div>
      <Divider style={{ margin: '8px 0' }} />
      <div style={{ textAlign: 'center' }}>
        <Button type="link" size="small" onClick={() => { setPopoverOpen(false); navigate('/system/notifications'); }}>
          查看全部通知
        </Button>
      </div>
    </div>
  );

  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') || '';

  const menuItems = filterMenuByRoles(allMenuItems, roles);
  const breadcrumbs = getBreadcrumb(location.pathname, tab);

  // 权限守卫
  useEffect(() => {
    if (!hasPermission(roles, location.pathname)) {
      navigate('/403', { replace: true });
    }
  }, [location.pathname, roles]);

  const username = JSON.parse(localStorage.getItem('userInfo') ?? '{}').name ?? '用户';
  const todayStr = `${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;

  return (
    <Watermark content={`${username} ${todayStr}`} gap={[80, 80]} font={{ fontSize: 14, color: 'rgba(0,0,0,0.04)' }}>
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        theme="dark"
        width={220}
        style={{
          height: '100vh',
          position: 'fixed',
          left: 0, top: 0, bottom: 0,
          zIndex: 100,
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* 顶部 logo + 折叠按钮 */}
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: collapsed ? '0 12px' : '0 12px 0 20px',
          background: 'rgba(255,255,255,0.05)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', minWidth: 0, overflow: 'hidden' }}>
            <img src={logoImg} alt="logo" style={{ width: 28, height: 28, flexShrink: 0 }} />
            {!collapsed && (
              <Text strong style={{ color: '#fff', fontSize: 14, marginLeft: 10, whiteSpace: 'nowrap' }}>
                商户管理平台
              </Text>
            )}
          </div>
          <div
            onClick={() => setCollapsed(!collapsed)}
            style={{
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.65)',
              fontSize: 16,
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 4,
              flexShrink: 0,
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            {collapsed ? '»' : '«'}
          </div>
        </div>

        {/* 菜单区域（可滚动） */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            defaultOpenKeys={getDefaultOpenKeys(location.pathname)}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{ borderRight: 0 }}
          />
        </div>

        {/* 底部用户信息 */}
        <div style={{
          flexShrink: 0,
          padding: collapsed ? '12px 0' : '12px 20px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          gap: 8,
        }}>
          {collapsed ? (
            <LogoutOutlined
              style={{ color: 'rgba(255,255,255,0.65)', fontSize: 16, cursor: 'pointer' }}
              onClick={() => navigate('/login')}
            />
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <UserOutlined style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, flexShrink: 0 }} />
                <Text style={{ color: '#fff', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Miya</Text>
              </div>
              <LogoutOutlined
                style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, cursor: 'pointer', flexShrink: 0 }}
                onClick={() => navigate('/login')}
              />
            </>
          )}
        </div>
        </div>
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 220, transition: 'margin-left 0.2s' }}>
        <Header style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 99,
          height: 48,
          lineHeight: '48px',
          borderBottom: '1px solid #f0f0f0',
        }}>
          <Breadcrumb items={breadcrumbs.map((b) => ({ title: b }))} />

          {showUUBanner && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '0 12px',
                height: 28,
                borderRadius: 14,
                background: '#e6f4ff',
                border: '1px solid #bae0ff',
                fontSize: 12,
                whiteSpace: 'nowrap',
              }}
            >
              <LinkOutlined style={{ fontSize: 12, color: '#1677ff' }} />
              <Text style={{ fontSize: 12, color: '#141414' }}>请绑定 UU 账号以接收通知</Text>
              <a
                style={{ fontSize: 12, color: '#1677ff', fontWeight: 500 }}
                onClick={() => navigate('/system/profile')}
              >
                前往绑定
              </a>
              <CloseOutlined
                style={{ fontSize: 10, color: 'rgba(0,0,0,0.25)', cursor: 'pointer', marginLeft: 2 }}
                onClick={() => setUuBannerDismissed(true)}
              />
            </div>
          )}

          <Space size={16}>
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
              ]}
            />
            {(roles.includes('group_owner') || roles.includes('group_finance') ||
              roles.includes('company_owner') || roles.includes('company_finance')) && (
              <Space size={4}>
                <Text type="secondary" style={{ fontSize: 12 }}>余额:</Text>
                <Text strong style={{ color: '#1677ff' }}>178,283.09 USDT</Text>
              </Space>
            )}
            <Popover
              content={notificationContent}
              trigger="click"
              placement="bottomRight"
              open={popoverOpen}
              onOpenChange={setPopoverOpen}
              arrow={false}
              overlayInnerStyle={{ padding: '12px 16px' }}
            >
              <Badge count={unreadCount} size="small">
                <BellOutlined style={{ fontSize: 18, cursor: 'pointer', color: '#595959' }} />
              </Badge>
            </Popover>
          </Space>
        </Header>

        <Content style={{ padding: '16px 24px 24px', minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
    </Watermark>
  );
};

export default MainLayout;
