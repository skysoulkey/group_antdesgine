import { defineConfig } from 'umi';

export default defineConfig({
  title: '集团公司管理系统',
  npmClient: 'npm',
  routes: [
    { path: '/login', component: 'login/index' },
    {
      path: '/',
      component: '@/layouts/index',
      routes: [
        { path: '/', redirect: '/dashboard' },
        { path: '/dashboard', component: 'dashboard/index' },
        // 企业管理
        { path: '/enterprise/list', component: 'enterprise/list/index' },
        { path: '/enterprise/tax', component: 'enterprise/tax/index' },
        { path: '/enterprise/invite', component: 'enterprise/invite/index' },
        { path: '/enterprise/detail/:id', component: 'enterprise/detail/index' },
        // 公司管理
        { path: '/company/list', component: 'company/list/index' },
        { path: '/company/shareholding', component: 'company/shareholding/index' },
        { path: '/company/tax', component: 'company/tax/index' },
        { path: '/company/transfer-in', component: 'company/transfer-in/index' },
        { path: '/company/transfer-group', component: 'company/transfer-group/index' },
        { path: '/company/detail/:id', component: 'company/detail/index' },
        // 佣金订单
        { path: '/commission', component: 'commission/index' },
        // 集团金融
        { path: '/finance/wallet', component: 'finance/wallet/index' },
        { path: '/finance/revenue', component: 'finance/revenue/index' },
        { path: '/finance/allocate', component: 'finance/allocate/index' },
        { path: '/finance/recall', component: 'finance/recall/index' },
        // 系统管理
        { path: '/system/users', component: 'system/users/index' },
        { path: '/system/roles', component: 'system/roles/index' },
        { path: '/system/logs', component: 'system/logs/index' },
        { path: '/system/profile', component: 'system/profile/index' },
        { path: '/system/settings', component: 'system/settings/index' },
        { path: '/system/notifications', component: 'system/notifications/index' },
      ],
    },
  ],
  proxy: {},
});
