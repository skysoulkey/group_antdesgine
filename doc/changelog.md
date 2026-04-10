# 变更记录

## 2026-04-10 — 用户权限模块重构

- 角色体系从 3 个（集团管理员/公司管理员/平台管理员）重构为 9 个内置角色
  - 集团侧：集团主、集团财务、集团经营、集团审计
  - 公司侧：公司主、公司推广、公司财务、公司经营、公司审计
- 平台管理员角色移除
- 用户归属集团或公司，二选一，角色不可混搭
- 支持多角色并集，权限取并集
- 用户管理：列表不显示自己，仅 owner（集团主/公司主）可操作
- 角色管理：改为只读展示，移除增删改
- 登录页：Mock 多角色存储 + 首次改密表单预留
- MFA 强制开启（不可关闭）
- 403 页、个人中心适配多角色
- 创建/编辑用户时，选择角色后展示对应功能模块 Tag 列表
- 设计文档：`docs/superpowers/specs/用户权限模块设计.md`

## 2026-04-10 — 用户管理创建职责分离

- 集团主在用户管理中只能创建集团侧管理员（集团财务/经营/审计），不再提供公司侧选项
- 公司主账号统一在「公司清单 → 创建公司」时创建
- 去掉创建用户弹窗中的"用户层级"切换和"归属公司"选项（集团主视角）
- 更新说明文案，明确创建职责分离

---

## 2026-04-10 — 创建公司弹窗增强

- 管理员区块标题从"管理员账号"改为"公司主账号"，展示公司主角色的全部模块权限 Tag
- 新增随机密码生成按钮，生成后明文显示方便复制
- 创建成功后弹出二次确认弹窗，展示登录地址、公司信息、账号密码、角色及模块权限，支持一键复制

---

## 2026-04-09 — 403 页面返回首页修复

- `pages/403/index.tsx`：从 localStorage 读取当前角色（而非硬编码 MOCK_ROLE），跳转到对应仪表盘；加 `replace: true` 避免回退到 403

---

## 2026-04-08 — 个人中心改名 + 站内通知开关移入 + MFA 去掉

- `layouts/index.tsx`：菜单和面包屑"基础信息"改为"个人中心"
- `system/profile/index.tsx`：MFA 认证开关去掉，新增站内通知 Switch（点击即保存）
- `system/notifications/index.tsx`：站内通知开关从通知配置页移除（已移至个人中心）
- 通知配置页 APP/邮件通知保持 Switch 滑块即时保存

---

## 2026-04-08 — 通知配置交互优化

- `system/notifications/index.tsx`：
  - 站内通知从表格列改为顶部统一 Switch 开关（只控制自己账号）
  - APP/邮件通知从 Checkbox + 编辑模式改为 Switch 滑块，点击即保存
  - 去掉"编辑偏好"按钮及编辑/保存/取消流程
  - 表格去掉 bordered，Card 增加 padding

---

## 2026-04-08 — 通知管理-通知配置去掉"通知对象"字段

- `system/notifications/index.tsx`：通知记录列表、通知配置表格、详情弹窗去掉"通知对象"列/字段；编辑弹窗去掉"通知对象"列和新增输入框；按钮"编辑通知对象"改为"编辑"，弹窗标题改为"编辑通知配置"
- 全站去掉"下辖"：data-spec.md、layouts、notifications、revenue/detail 共 21 处

---

## 2026-04-08 — 公司钱包公司信息右对齐

- `finance/company-wallet/index.tsx`：公司名称、归属集团、公司ID 拆到右侧独立区域右对齐，左侧只保留余额；通知账号移除（非核心信息）

---

## 2026-04-08 — 类型/角色字段去掉 Tag，改为纯文本

14 处 Tag 改为纯文本，涉及 9 个文件：
- `company/detail` — 订单类型
- `company/transfer` — 订单类型
- `company/shareholding` — 交易类型、订单类型（2处）
- `company/revenue` — 方向类型
- `enterprise/detail` — 交易方向
- `finance/wallet` — 类型列 + 充值/转出弹窗（3处）
- `finance/company-wallet` — 类型
- `system/users` — 角色列 + 查看弹窗角色（2处）
- `system/profile` — 角色、IP限制（2处）

3 个文件清理了未使用的 Tag import。

---

## 2026-04-08 — 公司钱包布局紧凑化

- `finance/company-wallet/index.tsx`：余额（USDT/PEA）+ 公司信息（名称/ID/集团/通知账号）合并为一张卡片单行布局；去掉 WalletOutlined 图标和 Descriptions 表格；历史流水表格增加 scroll/Card padding/时间列 nowrap；金额列去掉 fontWeight: 600

---

## 2026-04-08 — 集团钱包布局紧凑化

- `finance/wallet/index.tsx`：余额（USDT/PEA）+ 绑定账号合并为一张卡片单行布局，去掉 WalletOutlined 图标和 Row/Col，充值/转出按钮右对齐

---

## 2026-04-08 — 集团钱包表格宽度调整

- `finance/wallet/index.tsx`：备注列增加 `width: 160`，scroll x 从 1100 调整为 1030，消除右侧空白

---

## 2026-04-08 — 企业红包字段对齐 Axure 设计稿

- `enterprise/detail/index.tsx`：
  - 列表去掉：订单编号列、订单备注列（设计稿要求"去除订单编号，列表详情去除字段"）
  - 弹窗去掉：订单编号字段，标题改为"红包详情"
  - scroll x 从 1800 调整为 1500

---

## 2026-04-08 — 企业详情-应用红包视觉规范修正

- `enterprise/detail/index.tsx`：
  - 红包状态列：彩色 Tag → 纯文本
  - Modal 详情中红包状态：彩色 Tag → 纯文本
  - 时间列宽度 160 → 180 + whiteSpace nowrap
  - Card 增加 `styles={{ body: { padding: '16px 24px' } }}`

---

## 2026-04-08 — 企业概览折线图两两并排

- `enterprise/detail/index.tsx`：4 个折线图从 `span={24}` 改为 `xs={24} lg={12}` 两两并排

---

## 2026-04-08 — 用户管理去掉锁定功能

- `system/users/index.tsx`：移除 isLocked 字段、toggleLock 函数、锁定/解锁按钮、筛选栏"锁定"选项、状态列/查看弹窗的"已锁定"Tag、LockOutlined/UnlockOutlined/Popconfirm import

---

## 2026-04-08 — 公司概览折线图改为并排

- `company/detail/index.tsx`：两个折线图从 `span={24}` 改为 `xs={24} lg={12}` 并排显示

---

## 2026-04-08 — 企业详情-开通应用搜索框暗提示优化

- `enterprise/detail/index.tsx`：RangePicker placeholder 从"开通开始时间/开通结束时间"改为"开始时间/结束时间"

---

## 2026-04-08 — 公司概览/企业概览折线图改全宽 + 30天日级数据

- `company/detail/index.tsx`：折线图从一行两个（`lg={12}`）改为全宽（`span={24}`）；数据从 7 个月改为最近 30 天日级；X 轴 MM-DD 格式 + tickFilter 隔一显示
- `enterprise/detail/index.tsx`：同上，4 个折线图全部改为全宽；数据从 7 天改为 30 天日级；X 轴统一 MM-DD + tickFilter

---

## 2026-04-08 — 搜索框规范化

- 10 个搜索框 placeholder 去掉"搜索"二字（8 个文件）
- 企业清单搜索框宽度 230→260，确保 placeholder 完整显示
- `design-spec.md` 新增 9.3 搜索框规范

---

## 2026-04-08 — ID 字段统一黑色

- 企业概览（`enterprise/detail`）、公司概览（`company/detail`）、集团仪表盘、公司仪表盘、邀请企业 共 5 个文件，ID/认证码的 `color: '#1677ff'` → `'#141414'`
- `design-spec.md` 6.3 节补充 ID 类字段规则

---

## 2026-04-08 — 企业清单表格规范化

- `src/pages/enterprise/list/index.tsx`：
  - Card 增加 `styles={{ body: { padding: '16px 24px' } }}`
  - 企业名称列：蓝色链接 → 黑色纯文本
  - 企业状态列：彩色 Tag → 纯文本
  - 货币单位列：Tag → 纯文本
  - 操作列：`<a>` → `<Button type="link">`
- `src/styles/design-spec.md`：新增 6.3 内容样式统一规则（名称/状态/货币用纯文本，不花花绿绿）
- `CLAUDE.md`：新增已知错误记录（表格内容样式自作主张，不看其他页面统一做法）

---

## 2026-04-08 — 侧边栏底部用户信息 + 退出登录

### 改动要点

1. 侧边导航栏底部增加用户信息区：UserOutlined + 用户名（默认 Miya）+ LogoutOutlined 退出按钮
2. 展开态显示完整用户名 + 退出图标，收起态仅显示退出图标居中
3. 点击退出跳转 `/login`

### 涉及文件

| 文件 | 改动 |
|------|------|
| `src/layouts/index.tsx` | Sider 底部新增用户信息区，导入 LogoutOutlined / UserOutlined |
| `src/styles/design-spec.md` | 布局规范更新 Sider 结构说明 |

---

## 2026-04-08 — 表格统一 + favicon 替换 + 文档体系建立

### 改动要点

1. **表格斑马纹统一**：审计全站 30+ 个 Table，为 10 个缺少 `rowClassName` 的表格补上斑马纹
2. **Favicon 替换**：使用 `src/assets/logo.svg` 通过 sharp 导出透明背景 PNG，替换 `public/favicon.png`
3. **集团仪表盘**："下辖"二字全部去掉（如"下辖公司资产"→"公司资产"）
4. **design-spec.md 表格规范**：新增 6.1 必须统一的 Table props、6.3 卡片包裹标准
5. **文档体系建立**：创建 `doc/` 目录（tech_stack / project_context / page_map / changelog），`data-spec.md` 和 `dev-pitfalls.md` 从 `src/styles/` 移入 `doc/`
6. **CLAUDE.md 重写**：替换为项目级记忆体（已知错误记录 + 项目专属规则）

### 涉及文件

| 文件 | 改动 |
|------|------|
| `public/favicon.png` | 替换为 logo.svg 的透明背景 PNG |
| `src/styles/design-spec.md` | 品牌资源表更新 + 表格规范新增 6.1/6.3 |
| `src/pages/dashboard/index.tsx` | 去掉"下辖" |
| 10 个页面文件 | 补斑马纹 rowClassName |
| `CLAUDE.md` | 重写为项目级记忆体 |
| `doc/*` | 新建 6 个文档 |

---

## 2026-04-07 — 全局视觉风格调整

### 改动文件清单

| 文件路径 | 改动说明 |
|---------|---------|
| `src/app.tsx` | colorPrimary/colorLink 从 `#722ed1` 改为 `#1677ff` |
| `src/styles/global.less` | `.amount-text` 颜色改蓝 |
| `src/layouts/index.tsx` | 通知圆点、余额文字颜色改蓝 |
| `src/pages/dashboard/index.tsx` | KPI 卡片重构（无图标、flex 等高、分区标题）、Area→Line、DualCard 金额改黑 |
| `src/pages/dashboard/company/index.tsx` | 同上，公司仪表盘同步改造 |
| `src/pages/company/detail/index.tsx` | Area→Line、颜色改蓝 |
| `src/pages/company/revenue/index.tsx` | 所有金额颜色改为黑色 `#141414` |
| `src/pages/company/shareholding/index.tsx` | 顶部统计卡片颜色改为黑色 |
| `src/pages/company/list/index.tsx` | 紫色→蓝色 |
| `src/pages/company/transfer/index.tsx` | 紫色→蓝色（含边框、背景） |
| `src/pages/company/transfer-group/index.tsx` | 紫色→蓝色 |
| `src/pages/company/transfer-in/index.tsx` | 紫色→蓝色 |
| `src/pages/company/tax/index.tsx` | 紫色→蓝色 |
| `src/pages/enterprise/list/index.tsx` | 紫色→蓝色 |
| `src/pages/enterprise/detail/index.tsx` | Area→Line、紫色→蓝色、Tag purple→geekblue |
| `src/pages/enterprise/tax/index.tsx` | 紫色→蓝色 |
| `src/pages/enterprise/invite/index.tsx` | 紫色→蓝色 |
| `src/pages/orders/lottery/index.tsx` | 紫色→蓝色、Tag purple→blue |
| `src/pages/commission/index.tsx` | 紫色→蓝色、Tag purple→blue |
| `src/pages/finance/wallet/index.tsx` | 紫色→蓝色 |
| `src/pages/finance/wallet/bind-account.tsx` | 紫色→蓝色 |
| `src/pages/finance/company-wallet/index.tsx` | 紫色→蓝色 |
| `src/pages/finance/my-wallet/index.tsx` | 紫色→蓝色 |
| `src/pages/finance/allocate/index.tsx` | 紫色→蓝色 |
| `src/pages/finance/revenue/index.tsx` | 紫色→蓝色 |
| `src/pages/finance/revenue/detail.tsx` | 紫色→蓝色 |
| `src/pages/finance/recall/index.tsx` | 紫色→蓝色 |
| `src/pages/login/index.tsx` | 紫色→蓝色（含渐变 rgba） |
| `src/pages/system/users/index.tsx` | 紫色→蓝色 |
| `src/pages/system/notifications/index.tsx` | 紫色→蓝色、Tag purple→geekblue |
| `src/pages/system/logs/index.tsx` | 紫色→蓝色 |
| `src/styles/design-spec.md` | 视觉规范全面更新（蓝色系、Line 图表、简洁卡片） |
| `src/assets/favicon-preview.svg` | 新增蓝色系 IM 管理后台 icon 设计稿 |

### 改动要点

1. **颜色系统**：紫色（`#722ed1` 系列）→ Ant Design 标准蓝（`#1677ff` 系列），全局 0 残留
2. **KPI 卡片**：去掉图标色块，纯文字商务风；flex 布局保证同行等高；副指标行内展示
3. **折线图**：Area → Line，圆形数据点 + 水平虚线网格 + 隐藏坐标轴线
4. **金额颜色**：仪表盘 DualCard、公司收益、公司持股统一改为黑色 `#141414`
5. **仪表盘布局**：新增分区标题（资产动态/用户动态/公司数据走势/收益贡献 TOP5），表格不顶边

### TODO_Backlog

- [ ] `dev-pitfalls.md` 中的代码示例仍引用旧紫色 `#722ed1`，需同步更新为 `#1677ff`
- [ ] favicon-preview.svg 需导出为 PNG 替换 `public/favicon.png`
- [ ] 数据阶段从 Mock 过渡到 API 对接时，需更新 page_map.md 状态列

### Context 摘要

商户管理平台完成紫→蓝全局换色 + 仪表盘商务风卡片重构 + 折线图 Line 化。当前 Mock 阶段，30+ 文件已改，0 紫色残留。规范文档 design-spec.md 已同步，doc/ 目录体系已建立。
