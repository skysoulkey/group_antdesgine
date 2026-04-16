# 页面清单

> 路由配置见 `.umirc.ts`，以下为各页面的模块归属和当前状态。

## 公共页面

| 路由 | 页面名 | 模块 | 状态 |
|------|--------|------|------|
| `/login` | 登录页 | 认证 | Mock |
| `/403` | 无权限页 | 认证 | Mock |

## 仪表盘

| 路由 | 页面名 | 模块 | 状态 |
|------|--------|------|------|
| `/dashboard` | 集团仪表盘 | 仪表盘 | Mock |
| `/dashboard/company` | 公司仪表盘 | 仪表盘 | Mock |

## 公司管理（集团管理员）

| 路由 | 页面名 | 模块 | 状态 |
|------|--------|------|------|
| `/company/list` | 公司列表 | 公司管理 | Mock |
| `/company/detail/:id` | 公司详情（概览/转账/持股） | 公司管理 | Mock |
| `/company/transfer` | 集团转账 | 公司管理 | Mock |
| `/company/shareholding` | 公司持股 | 公司管理 | Mock |
| `/company/revenue` | 公司收益 | 公司管理 | Mock |
| `/company/tax` | 公司税费 | 公司管理 | Mock |
| `/finance/approvals` | 投资审批（审批列表 + 审批规则） | 公司管理 | Mock |

## 企业管理

| 路由 | 页面名 | 模块 | 状态 |
|------|--------|------|------|
| `/enterprise/list` | 企业列表 | 企业管理 | Mock |
| `/enterprise/detail/:id` | 企业详情（概览/资产/订单/成员） | 企业管理 | Mock |
| `/enterprise/invite` | 企业邀请 | 企业管理 | Mock |
| `/enterprise/tax` | 企业税费 | 企业管理 | Mock |

## 财务中心

| 路由 | 页面名 | 模块 | 状态 |
|------|--------|------|------|
| `/finance/wallet` | 集团钱包 | 财务 | Mock |
| `/finance/wallet/bind-account` | 绑定账号 | 财务 | Mock |
| `/finance/company-wallet` | 公司钱包 | 财务 | Mock |
| `/finance/my-wallet` | 我的钱包 | 财务 | Mock |
| `/finance/allocate` | 资金下拨 | 财务 | Mock |
| `/finance/recall` | 资金调回 | 财务 | Mock |
| `/finance/revenue` | 收益明细 | 财务 | Mock |
| `/finance/revenue/detail/:month` | 月度收益详情 | 财务 | Mock |

## 公司订单

| 路由 | 页面名 | 模块 | 状态 |
|------|--------|------|------|
| `/orders/lottery` | 东方彩票订单 | 订单 | Mock |
| `/commission` | 佣金订单 | 订单 | Mock |

## 系统设置

| 路由 | 页面名 | 模块 | 状态 |
|------|--------|------|------|
| `/system/users` | 用户管理 | 系统 | Mock |
| `/system/roles` | 角色管理（只读展示） | 系统 | Mock |
| `/system/logs` | 系统日志（登录日志 + 操作日志，按集团/公司权限隔离） | 系统 | Mock |
| `/system/notifications` | 通知管理 | 系统 | Mock |
| `/system/profile` | 个人中心（多角色权限展示 + 站内通知开关） | 系统 | Mock |

## 独立文档

| 路径 | 页面名 | 类型 | 说明 |
|------|--------|------|------|
| `docs/flowcharts/approval-workflow.html` | 审批流程可视化 | 独立 HTML | 汇报/培训用流程图，浏览器直接打开 |
