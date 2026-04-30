# 变更记录

## 2026-04-29（续 2）

### 调整：去掉旧"公司钱包"菜单，"全公司钱包"改名为"公司钱包"

**变更**
- 侧边菜单：删除 `/finance/my-wallet` "公司钱包"菜单项；`/finance/all-wallet` 菜单 label 由"全公司钱包"改为"公司钱包"
- 面包屑映射：`/finance/all-wallet` → `公司财务 / 公司钱包`；`/finance/my-wallet` 保留为"公司钱包（旧）"以兼容旧链接
- 页面文件 `src/pages/finance/my-wallet/` 和路由保留（书签直链仍可访问），仅从导航入口移除

**改动文件**
- `src/layouts/index.tsx`
- `src/pages/company/list/index.tsx`
- `src/pages/system/users/index.tsx`
- `src/pages/system/profile/index.tsx`
- `src/pages/system/roles/index.tsx`
- `doc/page_map.md`

**风险**
- 用户书签 `/finance/my-wallet` 直接访问仍能打开旧页（保留态），如需彻底废弃后续可删页面文件

## 2026-04-29（续）

### 调整：集团端应用费用列表按游戏拆分 + 去掉资金状态

**变更**
- 列表字段：5 → 9 列；删除「资金状态」；新增「游戏」「游戏收益 USDT/PEA」「应用费用 USDT/PEA」
- 行粒度：一月一行 → 一月每游戏一行
- 订单编号格式：`GBILL202604` → `GBILL202604-LO` / `GBILL202604-BAC`（与公司端对齐）
- 公司数量列含义改为：本期参与该游戏的公司数（按游戏各算）
- 列表只展示本月+上月数据；超过时间数据**后台保留但不展示**
- 默认排序：账单周期升序 + 同月按游戏稳定排序
- 筛选：账单周期 + 游戏（删除「资金状态」筛选）
- PDF 仍按月度合并（所有行共享同一份月度 PDF），预览页 UI 暂保持不变（按公司维度）

**影响范围**
- `src/pages/enterprise/app-fee/index.tsx`：列定义、mock 构造、筛选逻辑
- `doc/page_map.md`：字段表更新

## 2026-04-29

### 调整：公司清账列表按游戏拆分 + 仅展示本月上月

**业务依据**：每个游戏生成独立订单（订单编号粒度变细），但 PDF 仍按月度合并（一份 PDF 覆盖一公司一月所有订单）。

**变更**
- 列表字段：4 → 11 列；新增「游戏」列（东方彩票 / 七星百家乐）；游戏收益、应用费用拆分 USDT / PEA 两列单独展示
- 订单编号格式：`BILL202604001` → `BILL202604-LO` / `BILL202604-BAC`（游戏粒度）
- 扣款时间/状态按"游戏 × 币种"粒度独立判定（每行独立）
- 列表只展示本月+上月数据；超过时间数据**后台保留但不展示**
- 数据 mock 仍保 12 个月（前端 isVisible 筛选）
- PDF 预览页 buildMockBill 兼容新订单编号格式

**影响范围**
- `src/pages/finance/settlement/index.tsx`：列定义、mock 构造、筛选逻辑
- `src/pages/finance/settlement/preview.tsx`：订单编号正则兼容
- `doc/page_map.md`：字段表更新

集团端 `/enterprise/app-fee` 保持月度汇总单行不变。

## 2026-04-28（续 3）

### 新增：公司清账模块（公司端 + 集团端）

**业务背景**
平台向公司收取应用费用（即游戏服务费）。详见 `~/Desktop/公司清账流程产品需求文档_V1.3.md`。多币种独立结算，跨币种不合并不汇兑；扣款全有或全无原则。

**公司端 `/finance/settlement` 公司清账**
- 菜单：公司财务 → 公司清账
- 角色：company_owner / company_finance / company_audit
- 单页单表 9 列：订单编号 / 账单周期 / 账单类型 / 游戏收益（多币种用 / 分隔） / 应用费用 USDT / 应用费用 PEA / 扣款时间 / 扣款状态（待扣/已扣） / 操作（下载）
- 筛选：账单周期 + 账单类型 + 扣款状态
- 下载按钮：仅本月+上月可见，PDF 占位（V0.5 上线，hover 提示）
- 公司端不展示清账状态字段（业务决策）

**集团端 `/enterprise/app-fee` 应用费用**
- 菜单：集团管理 → 应用费用
- 角色：group_owner / group_finance / group_audit
- 单页单表 5 列：账单周期 / 订单编号 / 公司数量 / 资金状态 / 操作（下载）
- 筛选：账单周期 + 资金状态
- 行粒度：一月一行（全集团合并），不展示金额数值
- 资金状态判定：任一公司任一币种不足即"资金不足"（A1 最严档）

**同步**：page_map.md / 路由白名单 / 菜单配置 / 面包屑映射

## 2026-04-28（续 2）

### 调整：牛牛红包 — 详情弹窗合并「牌面」+「领取金额」

- 详情 Modal 领取记录表「牌面」与「领取金额」两列合并为单列「牌面（领取金额）」，格式 `牛牛（2.34）`
- 同步：page_map / data-spec

## 2026-04-28（续）

### 调整：牛牛红包 — 详情弹窗去掉「到账」字段

- 详情 Modal 领取记录表删除「到账」列（原第 8 列）
- 同步：page_map / data-spec / design-spec
- NiuniuClaim 接口移除 `arrival` 字段

## 2026-04-28

### 调整：投资审批模块 — Tab/标题改名 + 表头默认列调整 + 筛选字段命名修正

- Tab 名：`订单列表` → `审批列表`（顶部 Tab 与表格上方标题同步）
- 表头默认显示列在「订单状态」后插入两列：**审批单ID（dataIndex=id）、订单ID**，两列均默认显示
- 筛选区：「触发方企业」→「企业名称」（与全站命名一致）

### 调整：牛牛红包 — 下线「返佣详情」+ 东方彩票筛选增强

**牛牛红包**
- 主表操作列移除「返佣详情」按钮，仅保留「详情」（操作列宽 140 → 80）
- 删除 `NiuniuRebate` 接口、`buildNiuniuRebates` 函数、`rebateDetail` state、返佣详情 Modal 组件
- 每条领取记录的返佣金额已合并到详情 Modal 表格的「返佣金额」列
- 同步：page_map / data-spec / dev-pitfalls / design-spec

**东方彩票**
- 筛选区改造为 FilterField 规范：
  - 新增「游戏」单选筛选（百家乐 / 龙虎斗 / 骰子）
  - 新增「下注人/订单」搜索框（命中下注人 ID、下注人昵称、订单编号）
  - 时间 RangePicker 加 `placeholder=['从','到']`
  - 全部包入 `<FilterField label="…">`，对齐全站规范

## 2026-04-26

### 调整：牛牛红包 — 操作列「订单详情」改名 + 弹窗字段调整

- 主表操作列按钮：「订单详情」→「详情」（与详情 Modal 标题一致）
- 详情 Modal 标题：「订单详情」→「详情」
- 领取记录表：
  - **新增**「返佣金额」列（最末，黑色 #141414，不做前端计算）
  - **删除**「用户IP」列
- 同步：page_map / data-spec

## 2026-04-26（同日早些时候）

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
