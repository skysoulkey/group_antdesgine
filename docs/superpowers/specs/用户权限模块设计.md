# 用户权限模块设计

> 日期：2026-04-09
> 状态：设计稿

---

## 1. 概述

商户管理平台采用 **RBAC（基于角色的访问控制）** 模型，按集团 / 公司两个层级定义系统内置角色，每个角色绑定若干功能模块。角色不可编辑、不可新增、不可删除。

用户可被分配**多个角色**，最终权限为所有角色权限的**并集**。

---

## 2. 组织层级

```
集团（Group）
 └── 公司（Company）
      └── 企业（Enterprise）
```

- 一个用户**只能归属集团或公司，二选一**
- 归属集团的用户只能持有集团侧角色，归属公司的用户只能持有公司侧角色，**不可混搭**
- 集团侧角色只能分配给归属该集团的用户
- 公司侧角色只能分配给归属该公司的用户

---

## 3. 角色定义

### 3.1 集团侧角色（4 个）

| 角色 ID | 角色名称 | 模块权限 |
|---------|---------|---------|
| `group_owner` | 集团主 | 所有集团侧模块 + 用户管理（本集团所有用户，含下属公司） |
| `group_finance` | 集团财务 | 集团钱包、集团收益 |
| `group_ops` | 集团经营 | 集团仪表盘、公司清单、内部划转 |
| `group_audit` | 集团审计 | 系统日志 |

### 3.2 公司侧角色（5 个）

| 角色 ID | 角色名称 | 模块权限 |
|---------|---------|---------|
| `company_owner` | 公司主 | 所有公司侧模块 + 用户管理（本公司用户） |
| `company_promo` | 公司推广 | 企业清单、邀请企业 |
| `company_finance` | 公司财务 | 公司钱包、公司收益 |
| `company_ops` | 公司经营 | 公司仪表盘、公司持股、佣金订单、东方彩票订单、通知管理 |
| `company_audit` | 公司审计 | 系统日志 |

### 3.3 公共模块

所有角色默认拥有：**个人中心**

---

## 4. 角色 → 路由权限映射

### 4.1 集团侧路由

| 路由 | 所属模块 | 允许角色 |
|------|---------|---------|
| `/dashboard` | 集团仪表盘 | `group_owner`, `group_ops` |
| `/company/list` | 公司清单 | `group_owner`, `group_ops` |
| `/company/detail/:id` | 公司详情 | `group_owner`, `group_ops` |
| `/company/transfer` | 内部划转 | `group_owner`, `group_ops` |
| `/finance/revenue` | 集团收益 | `group_owner`, `group_finance` |
| `/finance/wallet` | 集团钱包 | `group_owner`, `group_finance` |
| `/finance/wallet/bind-account` | 钱包绑定 | `group_owner`, `group_finance` |

### 4.2 公司侧路由

| 路由 | 所属模块 | 允许角色 |
|------|---------|---------|
| `/dashboard/company` | 公司仪表盘 | `company_owner`, `company_ops` |
| `/company/shareholding` | 公司持股 | `company_owner`, `company_ops` |
| `/company/revenue` | 公司收益 | `company_owner`, `company_finance` |
| `/enterprise/list` | 企业清单 | `company_owner`, `company_promo` |
| `/enterprise/invite` | 邀请企业 | `company_owner`, `company_promo` |
| `/orders/lottery` | 东方彩票订单 | `company_owner`, `company_ops` |
| `/commission` | 佣金订单 | `company_owner`, `company_ops` |
| `/finance/my-wallet` | 公司钱包 | `company_owner`, `company_finance` |
| `/system/notifications` | 通知管理 | `company_owner`, `company_ops` |

### 4.3 设置类路由

| 路由 | 所属模块 | 允许角色 |
|------|---------|---------|
| `/system/users` | 用户管理 | `group_owner`, `company_owner` |
| `/system/logs` | 系统日志 | `group_owner`, `group_audit`, `company_owner`, `company_audit` |
| `/system/profile` | 个人中心 | 所有角色 |

> 系统日志为统一模块，模块权限控制谁能进入，数据权限控制能看到什么（见第 9 节）。

---

## 5. 权限计算规则

### 5.1 多角色并集

```
用户最终权限 = 角色A的模块集合 ∪ 角色B的模块集合 ∪ ...
```

各角色的模块**不交叉**（owner 除外，owner 覆盖同侧所有模块），因此并集计算不会产生冲突。

### 5.2 权限检查流程

```
1. 获取用户所有角色列表 → [group_ops, company_finance]
2. 合并所有角色的允许路由集合
3. 当前路由是否在允许集合中？（前缀匹配）
   → 是：放行
   → 否：跳转 403
```

### 5.3 默认入口页

用户登录后根据角色确定默认首页：

| 条件 | 默认首页 |
|------|---------|
| 持有 `group_owner` 或 `group_ops` | `/dashboard`（集团仪表盘） |
| 持有 `company_owner` 或 `company_ops` | `/dashboard/company`（公司仪表盘） |
| 仅持有 `group_finance` | `/finance/wallet`（集团钱包） |
| 仅持有 `company_finance` | `/finance/my-wallet`（公司钱包） |
| 仅持有 `group_audit` 或 `company_audit` | `/system/logs`（系统日志） |
| 仅持有 `company_promo` | `/enterprise/list`（企业清单） |

优先级：从上到下，取第一个匹配。

---

## 6. 用户管理规则

### 6.1 可见范围

| 操作者角色 | 可见用户范围 |
|-----------|-------------|
| `group_owner` | 本集团所有用户（含下属公司），**不含自己** |
| `company_owner` | 本公司所有用户，**不含自己** |

- 用户列表中**不显示自己**
- 非 owner 角色无用户管理权限

### 6.2 操作权限

| 操作 | `group_owner` | `company_owner` |
|------|:---:|:---:|
| 查看用户列表 | ✅ 本集团所有 | ✅ 本公司 |
| 创建用户 | ✅ | ✅ |
| 编辑用户角色 | ✅ | ✅（仅公司侧角色） |
| 启用/停用用户 | ✅ | ✅ |
| 重置用户密码 | ✅ | ✅ |

### 6.3 约束

- `group_owner` 可编辑下属公司用户的公司侧角色
- `company_owner` 不可编辑集团侧角色
- 不可编辑自己的角色（自己不在列表中）

---

## 7. 安全规则

### 7.1 MFA 强制开启

所有账号必须启用 MFA（多因素认证），无法关闭。不作为可选配置项。

### 7.2 首次登录强制改密

所有新建账号首次登录时必须修改密码，与角色无关。

- 后端标记 `must_change_password: true`
- 登录成功后检测该标记，强制跳转改密页面
- 改密完成后标记置为 `false`，正常进入系统

### 7.3 登录认证流程

```
手机号/邮箱 → OTP 验证码 → MFA 验证 → 首次登录？
  → 是：强制改密 → 进入系统
  → 否：直接进入系统（按角色跳转默认首页）
```

---

## 8. 菜单过滤逻辑

菜单项与模块绑定，根据用户最终权限（多角色并集）动态过滤：

- 用户无任何集团侧角色 → 不显示集团相关菜单
- 用户无任何公司侧角色 → 不显示公司相关菜单
- 子菜单全部被过滤 → 父菜单也隐藏

---

## 9. 数据隔离

| 维度 | 规则 |
|------|------|
| 集团隔离 | 集团角色只能看到本集团数据 |
| 公司隔离 | 公司角色只能看到本公司数据 |
| 横向隔离 | 同公司管理员之间**无**横向数据隔离（可看到同公司所有数据） |

### 9.1 系统日志数据权限

系统日志是典型的「模块权限 + 数据权限」分离模块：

| 角色 | 模块权限 | 数据范围 |
|------|---------|---------|
| `group_owner` | ✅ 可进入 | 本集团所有日志（含下属公司） |
| `group_audit` | ✅ 可进入 | 本集团所有日志（含下属公司） |
| `company_owner` | ✅ 可进入 | 仅本公司日志 |
| `company_audit` | ✅ 可进入 | 仅本公司日志 |

后端根据用户归属（集团/公司）过滤日志数据，前端同一页面 `/system/logs`。

---

## 10. 前端实现要点

### 10.1 角色存储

将当前用户的角色列表存储在登录态中（替代当前单一 `mock_role`）：

```typescript
type GroupRole = 'group_owner' | 'group_finance' | 'group_ops' | 'group_audit';
type CompanyRole = 'company_owner' | 'company_promo' | 'company_finance' | 'company_ops' | 'company_audit';

// 用户归属集团或公司，二选一，角色不可混搭
type UserAuth =
  | { level: 'group';   groupId: string; roles: GroupRole[] }
  | { level: 'company'; companyId: string; roles: CompanyRole[] };
```

### 10.2 权限检查函数

```typescript
function hasPermission(roles: Role[], pathname: string): boolean {
  // 1. 合并所有角色的允许路由
  const allowedRoutes = roles.flatMap(role => ROLE_ROUTES[role]);
  // 2. 前缀匹配
  return allowedRoutes.some(prefix =>
    pathname === prefix || pathname.startsWith(prefix + '/')
  );
}
```

### 10.3 需改造的文件

| 文件 | 改动 |
|------|------|
| `src/utils/auth.ts` | 角色定义重构：单角色 → 多角色，路由映射重写 |
| `src/layouts/index.tsx` | 菜单过滤和路由守卫适配多角色 |
| `src/pages/login/index.tsx` | 登录后存储角色列表 + 首次改密检测 |
| `src/pages/system/users/index.tsx` | 用户列表过滤自己、按 owner 权限控制操作 |
| `src/pages/system/roles/index.tsx` | 改为只读角色展示（移除增删改） |
| `src/pages/403/index.tsx` | 适配多角色的默认首页跳转 |
| `src/pages/system/profile/index.tsx` | 显示多角色列表 |
