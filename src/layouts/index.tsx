import {
  ApartmentOutlined,
  BankOutlined,
  BellOutlined,
  DashboardOutlined,
  FileTextOutlined,
  SettingOutlined,
  StockOutlined,
} from '@ant-design/icons';
import logoImg from '../assets/logo.png';
import { Badge, Breadcrumb, Layout, Menu, Select, Space, Typography } from 'antd';
import type { MenuProps } from 'antd';
import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'umi';
import { defaultRoute, hasPermission, MOCK_ROLE, type Role } from '../utils/auth';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

// ── 角色过滤菜单 ──────────────────────────────────────────────────
type MenuItem = NonNullable<MenuProps['items']>[number] & { roles?: string[]; children?: MenuItem[] };

const allMenuItems: MenuItem[] = [
  {
    key: 'dashboard',
    icon: <DashboardOutlined />,
    label: '仪表盘',
    children: [
      { key: '/dashboard',         label: '集团仪表盘', roles: ['group_admin', 'system_admin'] },
      { key: '/dashboard/company', label: '公司仪表盘', roles: ['company_admin', 'system_admin'] },
    ],
  },
  {
    key: 'group',
    icon: <BankOutlined />,
    label: '集团管理',
    roles: ['group_admin', 'system_admin'],
    children: [
      { key: '/company/list',      label: '公司清单' },
      { key: '/company/transfer',  label: '内部划转' },
      { key: '/finance/revenue',   label: '集团收益' },
    ],
  },
  {
    key: 'company',
    icon: <StockOutlined />,
    label: '公司管理',
    roles: ['company_admin', 'system_admin'],
    children: [
      { key: '/company/shareholding', label: '公司持股' },
      { key: '/company/revenue',      label: '公司收益' },
    ],
  },
  {
    key: 'enterprise',
    icon: <ApartmentOutlined />,
    label: '企业管理',
    roles: ['company_admin', 'system_admin'],
    children: [
      { key: '/enterprise/list',   label: '企业清单' },
      { key: '/enterprise/invite', label: '邀请企业' },
    ],
  },
  {
    key: 'orders',
    icon: <FileTextOutlined />,
    label: '公司订单',
    roles: ['company_admin', 'system_admin'],
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
      { key: '/finance/wallet',         label: '集团钱包',  roles: ['group_admin', 'system_admin'] },
      { key: '/finance/company-wallet', label: '公司钱包',  roles: ['company_admin', 'system_admin'] },
      { key: '/system/profile',         label: '基础信息' },
      { key: '/system/users',           label: '用户管理' },
      { key: '/system/logs',            label: '系统日志' },
      { key: '/system/notifications',   label: '通知管理' },
    ],
  },
];

function filterMenuByRole(items: MenuItem[], role: string): MenuProps['items'] {
  return items
    .filter((item) => !item.roles || item.roles.includes(role))
    .map((item) => {
      const { roles, children, ...rest } = item as MenuItem & { roles?: string[] };
      const filtered = children ? filterMenuByRole(children, role) : undefined;
      return filtered ? { ...rest, children: filtered } : rest;
    });
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
  '/orders/lottery':         ['公司订单', '东方彩票'],
  '/commission':             ['公司订单', '佣金订单'],
  '/finance/wallet':         ['设置中心', '集团钱包'],
  '/finance/company-wallet': ['设置中心', '公司钱包'],
  '/system/profile':         ['设置中心', '基础信息'],
  '/system/users':           ['设置中心', '用户管理'],
  '/system/logs':            ['设置中心', '系统日志'],
  '/system/notifications':   ['设置中心', '通知管理'],
  '/403':                    ['错误', '无权限'],
};

function getBreadcrumb(pathname: string): string[] {
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
      pathname.startsWith('/finance/revenue')) return ['group'];
  if (pathname.startsWith('/company/')) return ['company'];
  if (pathname.startsWith('/enterprise')) return ['enterprise'];
  if (pathname.startsWith('/orders') || pathname.startsWith('/commission')) return ['orders'];
  if (pathname.startsWith('/finance') || pathname.startsWith('/system')) return ['settings'];
  return [];
}

// ── 主布局 ────────────────────────────────────────────────────────
const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const [role, setRole] = useState<Role>(
    () => (localStorage.getItem('mock_role') as Role) ?? MOCK_ROLE
  );

  const handleRoleChange = (newRole: Role) => {
    localStorage.setItem('mock_role', newRole);
    setRole(newRole);
    navigate(defaultRoute(newRole));
  };

  const menuItems = filterMenuByRole(allMenuItems, role);
  const breadcrumbs = getBreadcrumb(location.pathname);

  // 权限守卫
  useEffect(() => {
    if (!hasPermission(role, location.pathname)) {
      navigate('/403', { replace: true });
    }
  }, [location.pathname, role]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="dark"
        width={220}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0, top: 0, bottom: 0,
          zIndex: 100,
        }}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '0' : '0 20px',
          background: 'rgba(255,255,255,0.05)',
          overflow: 'hidden',
        }}>
          <img src={logoImg} alt="logo" style={{ width: 28, height: 28, flexShrink: 0 }} />
          {!collapsed && (
            <Text strong style={{ color: '#fff', fontSize: 14, marginLeft: 10, whiteSpace: 'nowrap' }}>
              集团管理系统
            </Text>
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={getDefaultOpenKeys(location.pathname)}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0, paddingBottom: 48 }}
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 220, transition: 'margin-left 0.2s' }}>
        <Header style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)',
          position: 'sticky',
          top: 0,
          zIndex: 99,
        }}>
          <Breadcrumb items={breadcrumbs.map((b) => ({ title: b }))} />

          <Space size={16}>
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
            <Space size={4}>
              <Text type="secondary" style={{ fontSize: 12 }}>余额:</Text>
              <Text strong style={{ color: '#722ed1' }}>178,283.09 USDT</Text>
            </Space>
            <Badge count={3} size="small">
              <BellOutlined
                style={{ fontSize: 18, cursor: 'pointer', color: '#595959' }}
                onClick={() => navigate('/system/notifications')}
              />
            </Badge>
          </Space>
        </Header>

        <Content style={{ margin: '24px', minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
