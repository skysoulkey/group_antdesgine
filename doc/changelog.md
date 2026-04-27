# 变更记录

## 2026-04-26

### 重命名：应用红包 Tab → 踩雷红包

- 企业详情 `/enterprise/detail/:id?tab=redpacket` 的 Tab 显示名由「应用红包」改为「踩雷红包」
- 路由 key 保持 `redpacket`，URL 不变（兼容已存在的链接、面包屑、文档）
- 同步：`src/layouts/index.tsx` 面包屑映射（"应用红包"→"踩雷红包"），`doc/page_map.md` 表格标题
- 历史 docs/flowcharts 文件保留旧名，本次不动（非业务代码维护范围）

## 2026-04-26（同日早些时候）

### 调整：应用红包 Tab — 筛选区按规范补齐 + 详情领取时间不换行

- 筛选区改造：原本只有"状态" Radio，现按规范扩为：
  - 状态（Radio：全部/已完成/进行中/已过期）
  - 发起时间（RangePicker，placeholder 从/到）
  - 发包人/群组（Input 搜索：发包人ID、发包人昵称、群组ID、群组名称 任一字段命中即匹配）
  - 全部用 `<FilterField>` 带字段名前缀
- 详情弹窗内"企业红包领包详情"表格：领取时间列宽 150→170，并 `whiteSpace: nowrap`，不再换行
- 同步：design-spec / dev-pitfalls 已有的"全站规范"已涵盖

## 2026-04-26（同日早些时候）

### 调整：应用费用 Tab — 字段精简 + 账单周期合并

- **删除字段**：企业盈利总额 / 账单日 / 账单月
- **新增字段**：账单周期（展示为 `YYYY-MM-DD HH:mm:ss ~ YYYY-MM-DD HH:mm:ss`）
- 列数 9 → 7
- **筛选区调整**：移除「账单月」「账单日」两个 DatePicker，新增「账单周期」RangePicker（按账单周期与筛选范围**有重叠**匹配）
- mock 数据按新结构重生成（自然日账单周期）
- 同步：`doc/page_map.md` / `doc/data-spec.md`

## 2026-04-26（同日早些时候）

### 增强：企业邀请 — 生成邀请码新增"备注"字段

- **生成邀请码弹窗**：表单底部新增"备注"字段（TextArea，选填，最大 50 字，showCount + autoSize）
- **邀请记录表格**：新增"备注"列（位置：邀请企业数之后、操作之前）
  - 列宽 200，超出省略，悬停 Tooltip 显示完整内容
  - 空值显示「—」（浅灰，rgba(0,0,0,0.25)）
- 复制邀请码时不带备注（邀请码 + 有效期）
- 同步：`doc/page_map.md` 表格定义 + 弹窗表单定义

## 2026-04-26（同日早些时候）

### 改造：企业税收页面（/enterprise/tax）

- **整体样式按全站规范统一**
  - 删除顶部页面标题行（紧贴 Header）
  - 改为双层 Card（筛选区 + 表格区）
  - 删除状态 Tag（替换为纯文本展示——本次干脆删了状态字段）
  - 所有金额黑色 `#141414`，不分正负色
- **字段重做（9 列 → 12 列）**
  - 新顺序：订单时间 / 订单编号 / 企业ID / 企业名称 / 股东ID / 股东昵称 / 税费类型 / 货币单位 / 订单金额 / 免税额度 / 平台实收税费 / 公司实收税费
  - 删除：归属公司、税率、状态
  - 重命名：创建时间 → 订单时间；税收类型 → 税费类型；税前金额 → 订单金额
  - 新增：企业ID、股东ID、股东昵称、免税额度、平台实收税费、公司实收税费
  - 货币单位拆出独立列，金额单元格不再带单位后缀
- **公司实收税费 fixed: right**（最末列右侧固定）
- **筛选区**调整为 3 项：订单编号搜索（含股东昵称提示）/ 税费类型 Radio / 订单时间 RangePicker
- mock 数据按新字段结构重新生成
- 同步：`doc/page_map.md` 表格定义已更新

## 2026-04-26（同日早些时候）

### 新增一级菜单：公司财务

- **菜单结构**：新增一级菜单「公司财务」（icon `WalletOutlined`），位于「公司管理」之后、「企业管理」之前
- **子菜单（3 项）**：
  - 企业税收 `/enterprise/tax`（**重新启用**，之前路由/菜单都被隐藏了；页面源码本就在 `src/pages/enterprise/tax/index.tsx`）
  - 公司钱包 `/finance/my-wallet`（从「设置中心」迁出）
  - 全公司钱包 `/finance/all-wallet`（从「设置中心」迁出）
- **可见角色**：`company_owner` + `company_finance`（公司主 + 公司财务）
- **路由**：`.umirc.ts` 增加 `/enterprise/tax` 注册
- **权限**（`src/utils/auth.ts` ROLE_ROUTES）：
  - `company_owner` 加入 `/enterprise/tax`
  - `company_finance` 加入 `/enterprise/tax`
- **面包屑**：
  - `/enterprise/tax → ['公司财务', '企业税收']`
  - `/finance/my-wallet → ['公司财务', '公司钱包']`（原"设置中心"）
  - `/finance/all-wallet → ['公司财务', '全公司钱包']`（原"设置中心"）
- **设置中心** 移除「公司钱包」「全公司钱包」两项

## 2026-04-26（同日早些时候）

### 重大约定：筛选区控件必须带字段名前缀，时间 placeholder 统一「从/到」

- **新规范** `src/styles/design-spec.md` 第 9.0 节 / 9.0.1 节
- **作废规则**：旧 feedback「筛选控件前不加 label」（位于 `~/.claude/projects/-Users-miya/memory/feedback_no_label_before_buttons.md`），自本日起停止执行；该文件已标注作废
- **新建组件**：`src/components/FilterField.tsx`
- **全站改造**：本次涉及 27 个页面文件的筛选区改造（牛牛红包、应用费用、列表/详情/订单/财务/设置等所有带筛选区的页面）
  - 每个 Radio.Group / Select / DatePicker / RangePicker / Input 用 `<FilterField label="…">` 包裹
  - 所有 RangePicker 的 placeholder 统一为 `['从', '到']`
  - 单 DatePicker 的 placeholder 用字段简短名
- **保持不动**：表单 Form.Item（天然带 label）、表格列内联 filter、Modal/Drawer 表单、行内编辑控件
- **同步**：`CLAUDE.md` 已知错误记录追加；`src/styles/design-spec.md` 第 9.0 / 9.0.1 章

## 2026-04-26（同日早些时候改动）

### 调整：应用费用 Tab — 创建时间 placeholder 改为「从 / 到」

- 应用费用 Tab 的创建时间 RangePicker 暗提示由「创建开始 / 创建结束」改为「从 / 到」
- 同步 `src/styles/design-spec.md` 第十五章

### 新增：企业详情 → 应用费用 Tab

- 位置：东方彩票 Tab 之后、佣金订单 Tab 之前
- URL：`/enterprise/detail/:id?tab=appFee`
- 字段（9 列，无操作列）：创建时间 / 订单编号 / 订单类型 / 企业盈利总额 / 应用费用总额 / 企业盈利明细 / 应用费用明细 / 账单日 / 账单月
- 订单类型枚举：应用结算 / 主动分红
- 明细字段格式：单行展示「东方彩票 X / 七星百家乐 X / 企业红包 X」
- 金额：精确到小数点后 2 位
- 筛选：订单类型 Radio + 创建时间 RangePicker + 账单月 + 账单日 + 订单编号搜索
- 同步文档：`src/layouts/index.tsx`（面包屑） / `doc/page_map.md` / `doc/data-spec.md` / `src/styles/design-spec.md`

### 调整：牛牛红包 — 订单状态改纯文本

- 主表「订单状态」列：去掉 Tag，改为黑色纯文本（已开奖 / 未开奖）
- 订单详情 Modal 顶部概要区的「订单状态」：同步改为纯文本
- 同步文档：`doc/page_map.md` / `src/styles/design-spec.md`

### 调整：牛牛红包 Tab 二轮调整

- 字段值枚举化：
  - 赔率：由数值改为枚举（平倍 / 高倍 / 超倍）
  - 有效时长：由整数改为枚举（30 秒 / 60 秒），类型 `30 | 60`
- Tab 顺序：将「牛牛红包」从「佣金订单」之后移到「应用红包」之后（位于「东方彩票」之前）
- 返佣详情字段改名：
  - 「返佣用户昵称」→「用户昵称」
  - 「返佣用户ID」→「用户ID」
- 返佣详情用户昵称展示格式：`名字（庄）` 或 `名字（闲）`，括号内为该用户在本局的角色
- 同步文档：`doc/page_map.md` / `doc/data-spec.md`

### 调整：牛牛红包 Tab 去掉「货币类型」字段

- 主表去掉第 4 列「货币类型」，列数由 15 改为 14
- 筛选区去掉「货币类型」Radio.Button 组（USDT / PEA）
- `NiuniuOrder` 接口移除 `currency` 字段，mock 数据同步移除
- Table `scroll x` 从 1900 调整为 1800
- 同步文档：`doc/page_map.md` / `doc/data-spec.md` / `src/styles/design-spec.md` 全部移除货币类型相关条目

### 新增：企业详情 → 牛牛红包 Tab

- **位置**：`src/pages/enterprise/detail/index.tsx` 追加 type / mock 数据 / Tab 项
- **URL**：`/enterprise/detail/:id?tab=niuniuRedpacket`
- **面包屑**：在 `src/layouts/index.tsx` 的 `tabBreadcrumbMap['/enterprise/detail']` 中追加 `niuniuRedpacket: ['企业管理', '企业清单', '牛牛红包']`
- **主表 15 列**：发起时间 / 订单ID / 订单状态 / 货币类型 / 底注 / 红包数量 / 玩法 / 赔率 / 有效时长 / 赔付金额 / 抽水金额 / 返佣金额 / 庄家昵称 / 庄家ID / 完成时间
- **筛选区**：状态（已开奖/未开奖）+ 玩法（庄比/通比）+ 货币（USDT/PEA）+ 时间范围 + 庄家昵称/ID 搜索；筛选控件前不带 label
- **订单详情 Modal**（width 1000px）：顶部概要区（玩法/赔率/状态）+ 10 列领取记录表
- **返佣详情 Modal**（width 800px）：7 列返佣记录表
- **数据策略**：本模块仅展示数据，金额字段直接展示后端返回值，不做前端计算
- **返佣链路**：庄家发起红包 → 下级用户领取 → 系统按比例返佣给该下级的「上级」（推荐人）
- **同步文档**：
  - `doc/page_map.md` 追加表格规范
  - `doc/data-spec.md` 追加「四、企业详情 — 牛牛红包」章节
  - `doc/dev-pitfalls.md` 追加「返佣链路（领取者与上级是不同实体）」「排查规范文档存在性」两节
  - `src/styles/design-spec.md` 追加「十三、详情弹窗 — 顶部概要区」「十四、企业详情 → 牛牛红包 Tab」两节
  - `CLAUDE.md` 追加「2026-04-26 — 错误判断规范文档不存在」错误记录
