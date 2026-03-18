import {
  ApartmentOutlined,
  AppstoreOutlined,
  AuditOutlined,
  BankOutlined,
  DashboardOutlined,
  FileTextOutlined,
  LogoutOutlined,
  SettingOutlined,
  SwapOutlined,
  TeamOutlined,
  UserOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { Avatar, Breadcrumb, Dropdown, Layout, Menu, Space, Tag, Typography } from 'antd';
import type { MenuProps } from 'antd';
import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'umi';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const menuItems: MenuProps['items'] = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: '仪表盘',
  },
  {
    key: 'enterprise',
    icon: <ApartmentOutlined />,
    label: '企业管理',
    children: [
      { key: '/enterprise/list', label: '企业清单' },
      { key: '/enterprise/tax', label: '企业税收' },
      { key: '/enterprise/invite', label: '邀请企业' },
    ],
  },
  {
    key: 'company',
    icon: <BankOutlined />,
    label: '公司管理',
    children: [
      { key: '/company/list', label: '公司清单' },
      { key: '/company/shareholding', label: '公司持股' },
      { key: '/company/tax', label: '公司税单' },
      { key: '/company/transfer-in', label: '内部划转（公司）' },
      { key: '/company/transfer-group', label: '内部划转（集团）' },
    ],
  },
  {
    key: '/commission',
    icon: <FileTextOutlined />,
    label: '佣金订单',
  },
  {
    key: 'finance',
    icon: <WalletOutlined />,
    label: '集团金融',
    children: [
      { key: '/finance/wallet', label: '集团钱包' },
      { key: '/finance/revenue', label: '集团收益' },
      { key: '/finance/allocate', label: '集团下拨' },
      { key: '/finance/recall', label: '集团调回' },
    ],
  },
  {
    key: 'system',
    icon: <SettingOutlined />,
    label: '系统管理',
    children: [
      { key: '/system/users', icon: <TeamOutlined />, label: '用户管理' },
      { key: '/system/roles', icon: <AuditOutlined />, label: '角色管理' },
      { key: '/system/logs', icon: <AppstoreOutlined />, label: '系统日志' },
      { key: '/system/notifications', label: '通知管理' },
      { key: '/system/profile', icon: <UserOutlined />, label: '基础信息' },
      { key: '/system/settings', label: '设置中心' },
    ],
  },
];

// 面包屑映射
const breadcrumbMap: Record<string, string[]> = {
  '/dashboard': ['首页', '仪表盘'],
  '/enterprise/list': ['企业管理', '企业清单'],
  '/enterprise/tax': ['企业管理', '企业税收'],
  '/enterprise/invite': ['企业管理', '邀请企业'],
  '/company/list': ['公司管理', '公司清单'],
  '/company/shareholding': ['公司管理', '公司持股'],
  '/company/tax': ['公司管理', '公司税单'],
  '/company/transfer-in': ['公司管理', '内部划转（公司）'],
  '/company/transfer-group': ['公司管理', '内部划转（集团）'],
  '/commission': ['首页', '佣金订单'],
  '/finance/wallet': ['集团金融', '集团钱包'],
  '/finance/revenue': ['集团金融', '集团收益'],
  '/finance/allocate': ['集团金融', '集团下拨'],
  '/finance/recall': ['集团金融', '集团调回'],
  '/system/users': ['系统管理', '用户管理'],
  '/system/roles': ['系统管理', '角色管理'],
  '/system/logs': ['系统管理', '系统日志'],
  '/system/profile': ['系统管理', '基础信息'],
  '/system/settings': ['系统管理', '设置中心'],
  '/system/notifications': ['系统管理', '通知管理'],
};

// 获取默认展开的子菜单
function getDefaultOpenKeys(pathname: string): string[] {
  if (pathname.startsWith('/enterprise')) return ['enterprise'];
  if (pathname.startsWith('/company')) return ['company'];
  if (pathname.startsWith('/finance')) return ['finance'];
  if (pathname.startsWith('/system')) return ['system'];
  return [];
}

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '基础信息',
      onClick: () => navigate('/system/profile'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        localStorage.removeItem('token');
        navigate('/login');
      },
    },
  ];

  const breadcrumbs = breadcrumbMap[location.pathname] || ['首页'];

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
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '0' : '0 20px',
            background: 'rgba(255,255,255,0.05)',
            overflow: 'hidden',
          }}
        >
          <BankOutlined style={{ fontSize: 24, color: '#1677ff', flexShrink: 0 }} />
          {!collapsed && (
            <Text
              strong
              style={{
                color: '#fff',
                fontSize: 14,
                marginLeft: 10,
                whiteSpace: 'nowrap',
              }}
            >
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
        {/* Header */}
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,21,41,.08)',
            position: 'sticky',
            top: 0,
            zIndex: 99,
          }}
        >
          <Space>
            <Tag color="blue">集团管理员</Tag>
            <Text type="secondary" style={{ fontSize: 12 }}>
              UU Talk
            </Text>
          </Space>

          <Space size={20}>
            <Space size={4}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                余额:
              </Text>
              <Text strong style={{ color: '#1677ff' }}>
                178,283.09 USDT
              </Text>
            </Space>
            <SwapOutlined
              style={{ cursor: 'pointer', color: '#1677ff' }}
              onClick={() => navigate('/finance/wallet')}
            />
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
              <Space style={{ cursor: 'pointer' }}>
                <Avatar size={32} style={{ backgroundColor: '#1677ff' }}>
                  M
                </Avatar>
                <Text>Miya</Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* Breadcrumb */}
        <div
          style={{
            padding: '12px 24px 0',
            background: '#f0f2f5',
          }}
        >
          <Breadcrumb
            items={breadcrumbs.map((b) => ({ title: b }))}
          />
        </div>

        {/* Content */}
        <Content
          style={{
            margin: '12px 24px 24px',
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
