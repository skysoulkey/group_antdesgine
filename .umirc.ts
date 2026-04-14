import { defineConfig } from 'umi';

export default defineConfig({
  title: '商户管理平台',
  favicons: ['/favicon.png'],
  npmClient: 'npm',
  routes: [
    { path: '/login',   component: 'login/index',   layout: false },
    { path: '/403',     component: '403/index',      layout: false },
    { path: '/',        redirect: '/dashboard' },

    // 仪表盘
    { path: '/dashboard',         component: 'dashboard/index' },
    { path: '/dashboard/company', component: 'dashboard/company/index' },

    // 集团管理
    { path: '/company/list',      component: 'company/list/index' },
    { path: '/company/detail/:id',component: 'company/detail/index' },
    { path: '/finance/allocate',  component: 'finance/allocate/index' },
    { path: '/finance/recall',    component: 'finance/recall/index' },
    { path: '/finance/revenue',              component: 'finance/revenue/index' },
    { path: '/finance/revenue/detail/:month', component: 'finance/revenue/detail' },

    // 公司管理
    { path: '/company/shareholding', component: 'company/shareholding/index' },
    { path: '/company/revenue',      component: 'company/revenue/index' },
    { path: '/company/transfer',     component: 'company/transfer/index' },

    // 企业管理
    { path: '/enterprise/list',       component: 'enterprise/list/index' },
    { path: '/enterprise/invite',     component: 'enterprise/invite/index' },
    { path: '/enterprise/detail/:id', component: 'enterprise/detail/index' },

    // 公司订单
    { path: '/orders/lottery', component: 'orders/lottery/index' },
    { path: '/commission',     component: 'commission/index' },

    // 设置中心
    { path: '/finance/my-wallet',       component: 'finance/my-wallet/index' },
    { path: '/finance/wallet',          component: 'finance/wallet/index' },
    { path: '/finance/wallet/bind-account', component: 'finance/wallet/bind-account' },
    { path: '/system/profile',          component: 'system/profile/index' },
    { path: '/system/users',            component: 'system/users/index' },
    { path: '/system/roles',            component: 'system/roles/index' },
    { path: '/system/logs',             component: 'system/logs/index' },
    { path: '/system/notifications',    component: 'system/notifications/index' },
    { path: '/finance/approvals',       component: 'finance/approvals/index' },
  ],
  proxy: {},
});
