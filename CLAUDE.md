# CLAUDE.md — 商户管理平台（group-admin-web）

> 项目级记忆体，配合全局 `~/Desktop/CLAUDE.md` 中的硬规则使用。

---

## 已知错误记录

> 每次用户指出错误后立即追加到此处。

### 2026-04-07 — 收到需求后直接写代码，未走计划流程

- **错误描述**：收到"紫色改蓝色"、"卡片改风格"等需求后，直接开始编码，未输出开工声明表和计划文档，未等用户确认
- **正确做法**：按规则 1 执行 — 先生成 `~/Desktop/plan_xxx.md`，包含开工声明表 + 执行步骤，等用户说"可以开始"再动手

### 2026-04-07 — 卡片等高问题未提前考虑

- **错误描述**：改造 KPI 卡片时，有 sub 的卡片和无 sub 的卡片高度不一致，用户后续指出后才修复
- **正确做法**：改造卡片组件时，应提前考虑同行卡片内容不同导致的高度差异，使用 flex 布局 + 始终渲染底部区域

### 2026-04-07 — dev-pitfalls.md 中颜色示例代码未同步更新

- **错误描述**：全局颜色从紫色改为蓝色后，dev-pitfalls.md 中的代码示例仍为旧的紫色 `#722ed1`
- **正确做法**：改动完成后，同步更新所有规范文档中的示例代码，保持一致

### 2026-04-08 — 改动后未主动同步文档，等用户提醒才更新

- **错误描述**：完成表格斑马纹统一、favicon 替换、去掉"下辖"等改动后，没有主动更新 design-spec.md、changelog.md、dev-pitfalls.md，直到用户提醒才补
- **正确做法**：每次改动完成后，**立即**按检查清单逐项同步文档，这是规则 2 的硬性要求，不需要用户提醒。具体做法：改完代码 → 立刻检查下方「改动后同步检查清单」的 5 项 → 逐项更新 → 才算完成

### 2026-04-08 — 表格内容样式自作主张，不看其他页面的统一做法

- **错误描述**：企业清单表格中，企业名称用蓝色链接、企业状态和货币单位用彩色 Tag，但其他页面从未这样做。改规范时只看了 props 层面，没有检查内容样式是否与全站一致
- **正确做法**：改表格前先看 2-3 个同类页面的实际做法，确保内容样式一致。具体规则：
  1. 名称列用黑色纯文本，不用蓝色链接（点击跳转放在操作列）
  2. 状态列用纯文本，不用彩色 Tag
  3. 货币单位用纯文本，不用 Tag
  4. 只有"认证状态"等语义明确的二值状态才用 Tag

### 2026-04-10 — 系统日志 Tab 导航未走 URL `?tab=` 规范，筛选未平铺

- **错误描述**：系统日志页的 Tabs 用了 `defaultActiveKey` 内部状态切换，没有走 URL `?tab=` + 面包屑联动的统一规范（企业详情/公司详情页早已采用）。登录日志的「操作类型」用了 Select 下拉框，违反了"≤6 枚举值用 Radio.Button 平铺"的筛选规范。
- **正确做法**：
  1. 任何页面新增 Tabs 时，必须用 `useSearchParams` 读写 `?tab=` 参数，并在 layout 的 `tabBreadcrumbMap` 中添加面包屑映射
  2. 筛选控件选型严格按 design-spec 9.1 规则：≤6 枚举值 → Radio.Button 平铺，>6 或动态 → Select 下拉
  3. 改动前先检查 2-3 个同类页面的写法，确认一致后再动手

### 2026-04-20 — Tab 页面多余标题行和工具栏，Tab 未紧贴顶部导航

- **错误描述**：公司持股、公司收益页面在 Tabs 上方多出了一行页面标题文字和 TableToolbar 操作按钮，导致 Tab 栏没有紧贴顶部 Header。用户指出问题后第一次只修了标题，没有同时移除工具栏和合并 Tab。
- **正确做法**：
  1. Tab 页面的 Tabs 组件必须直接紧贴顶部 Header（`marginTop: -16`），中间不放任何标题行、工具栏等元素
  2. 参考模板：系统日志（`/system/logs`）的 return 结构 — 只有 `<div style={{ marginTop: -16 }}><Tabs .../></div>`
  3. TableToolbar 属于各 Tab 内容（放在 Card 内部），不应放在 Tabs 外面的页面级
  4. 修问题时要完整检查参考页面的做法，一次性改到位，不要只改一个点

### 2026-04-26 — 错误判断规范文档不存在，差点跳过同步检查清单

- **错误描述**：实施牛牛红包模块时，用了过窄的 search 模式只在仓库根目录搜索 `data-spec.md` / `dev-pitfalls.md` / `design-spec.md`，命中 0 条，就误以为这三份规范文档不存在；实际上它们就在 `doc/` 和 `src/styles/` 目录下。差点导致改动后未同步这三份规范文档（违反规则 2 检查清单）。
- **正确做法**：
  1. 检查规范文档存在性必须按 CLAUDE.md 规定的固定路径直接读取：`src/styles/design-spec.md`、`doc/data-spec.md`、`doc/dev-pitfalls.md`，不要靠模糊搜索
  2. 哪怕项目目录里没找到，也要去 CLAUDE.md 列的固定位置 stat 一次确认，不要根据"找不到"就推断"不存在"
  3. 改动后同步检查清单的 5 项是硬性要求，不能因为"看起来文件不在"就跳过

### 2026-04-27 — 越界改动仪表盘折线图配置 + 工作区脏改动跨会话漂移

- **错误描述**：用户让做投资审批模块改动时，发现 `src/pages/dashboard/company/index.tsx` 和 `src/pages/dashboard/index.tsx` 都是 `M` 状态，diff 显示折线图 chartCfg 被改：`point.size 4→2、point.lineWidth 2→1、x.line: null→true 加了 lineStroke/lineLineWidth、y.line:null→false、tick:null→false、新增 gridFilter`。这些是之前会话越界改的，没 commit / revert，挂在工作区导致用户在仪表盘看到"折线整体往上移、样式错乱"。
- **症结**：
  1. `x.line: true + lineStroke/lineStrokeOpacity/lineLineWidth` 在当前 antv 版本不识别但触发了底部轴线渲染，挤压绘图区
  2. `gridFilter` 写法对不上当前 G2 v5 API
  3. `y.line/tick: false` 与 `null` 在 antv 中布局占位行为不同
- **正确做法**：
  1. 严格守 CLAUDE.md 规则 1「不擅自扩展范围」，只改用户当前任务点名的文件
  2. **每次会话结束前必跑 `git status`**，确认工作区干净；越界改的文件当场 commit + 说明、或 git checkout 撤销，绝不留脏改动跨会话
  3. 改图表配置必须启 dev server 浏览器实测后才能保留改动，不靠"代码看起来对"判断
  4. 修复方法：`git checkout -- src/pages/dashboard/company/index.tsx src/pages/dashboard/index.tsx`，回到 `931dbcd refactor: 全局视觉风格调整` 那个基线

### 2026-04-26 — 「筛选控件不加 label」旧规则作废，统一改为「必须加字段名前缀」

- **背景**：旧反馈 `feedback_no_label_before_buttons.md` 要求筛选区控件前不加 label 文字。2026-04-26 用户提出反向新约定：筛选区每个控件必须带字段名前缀。
- **新约定（生效）**：见 `src/styles/design-spec.md` 第 9.0 节
  1. 筛选/搜索区每个控件前必须有「字段名：」前缀，不允许裸放控件
  2. 颜色 `rgba(0,0,0,0.65)`、`fontSize: 14`、中文冒号「：」、放控件左侧
  3. 表单弹窗（Form.Item）天然带 label，不在此约定范围
  4. 表格列内联快速筛选（antd 列头 filter）不强制
- **新约定（生效）**：见 `src/styles/design-spec.md` 第 9.0.1 节
  - 所有 RangePicker 的 `placeholder` 统一为 `['从', '到']`，不写「开始时间/结束时间/创建开始/创建结束/开始日期/结束日期」
- **配套**：新建共享组件 `src/components/FilterField.tsx`，所有筛选区控件用 `<FilterField label="…">…</FilterField>` 包裹
- **作废处理**：旧反馈文件已标注 `status: deprecated`、`deprecated_at: 2026-04-26`，保留历史追溯

---

## 项目专属规则

### 规范文档体系

本项目的规范文档分为两层：

| 位置 | 文件 | 职责 |
|------|------|------|
| `doc/` | `tech_stack.md` | 技术栈说明 |
| `doc/` | `project_context.md` | 项目背景、用户角色、核心业务 |
| `doc/` | `page_map.md` | 页面清单（路由 + 模块 + 状态） |
| `doc/` | `changelog.md` | 变更记录 |
| `doc/` | `data-spec.md` | 数据口径规范：各指标的统计方式和计算来源 |
| `doc/` | `dev-pitfalls.md` | 开发避坑：已踩过的坑、解决方案、检查方式 |
| `src/styles/` | `design-spec.md` | 视觉规范：颜色、字体、卡片、表格、图表、布局 |

**改动后同步检查清单（每次改动完成后立即逐项检查，不等用户提醒）：**
1. 涉及视觉样式 → 更新 `src/styles/design-spec.md`
2. 涉及数据口径 → 更新 `doc/data-spec.md`
3. 踩了新坑 → 追加 `doc/dev-pitfalls.md`
4. 新增/删除页面 → 更新 `doc/page_map.md`
5. 任何改动 → 追加 `doc/changelog.md`
6. 有用户指出错误 → 追加本文件「已知错误记录」

### 设计风格

- 整体定位：**商务、大气、简洁**
- 主色：Ant Design 标准蓝 `#1677ff`（非紫色）
- KPI 卡片：纯文字，无图标、无彩色色块
- 金额颜色：统一黑色 `#141414`，不使用红绿色区分正负
- 折线图：`Line` 组件 + 圆形数据点 + 水平虚线网格
- 详见 `src/styles/design-spec.md`
