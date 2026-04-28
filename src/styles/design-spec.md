# 集团公司管理系统 · 视觉规范

> 本文档为系统统一视觉标准，所有页面开发须遵循以下规范，保证视觉一致性。
> 整体风格定位：**商务、大气、简洁**。

---

## 零、品牌资源

| 用途 | 文件路径 | 说明 |
|------|---------|------|
| 浏览器 Favicon | `public/favicon.png` | 由 `src/assets/logo.svg` 用 sharp 导出的 256x256 透明背景 PNG |
| Logo SVG 源文件 | `src/assets/logo.svg` | 蓝色聊天气泡 + 三圆点，用于 favicon 和登录页 |

**图片资源引入规范：**
- 组件使用的图片放 `src/assets/`，通过 import 引入，走 webpack 处理
- 静态公共资源放 `public/`，构建时原样复制到 `dist/` 根目录
- TypeScript 识别 `.png/.jpg/.svg` 模块需在 `src/typings.d.ts` 中声明类型

---

## 一、颜色规范

### 1.1 品牌色 / 语义色

| 名称 | 色值 | 用途 |
|------|------|------|
| Primary（主色） | `#1677ff` | 导航选中、主按钮、链接、KPI 高亮、操作按钮 |
| Primary Hover | `#4096ff` | 按钮悬停、链接悬停 |
| Primary Active | `#0958d9` | 按钮按下、选中激活态 |
| Primary Light BG | `#e6f4ff` | 蓝色系浅色背景、Segmented 容器底色 |
| Primary Light Border | `#91caff` | 蓝色系浅色边框 |
| Success（成功） | `#52c41a` | 正常状态、盈利、收益、已完成、资金下拨 |
| Warning（警告） | `#faad14` | 待处理、排名金色、注意项 |
| Error（错误） | `#ff4d4f` | 亏损、失败、撤回、错误提示、资金调回 |

### 1.2 文字色

| 层级 | 色值 | 用途 |
|------|------|------|
| 主文字 | `#141414` | 大数值、表格正文主列 |
| 次要文字 | `rgba(0,0,0,0.65)` | 表格一般列、副指标数值 |
| 辅助文字 | `rgba(0,0,0,0.45)` | KPI 卡片指标名称、子指标 label、时间戳 |
| 最弱文字 | `rgba(0,0,0,0.3)` | 占位符、禁用态、Tooltip 图标 |

### 1.3 背景色

| 名称 | 色值 | 用途 |
|------|------|------|
| 页面背景 | `#f0f2f5` | body / Layout 背景 |
| 卡片背景 | `#ffffff` | Card / Modal 背景 |
| 表格斑马纹 | `#fafafa` | 奇偶行交替背景 |

---

## 二、字体规范

| 层级 | fontSize | fontWeight | letterSpacing | 使用场景 |
|------|----------|------------|---------------|---------|
| KPI 大数值 | 30px | 700 | -0.5px | 仪表盘核心指标数值 |
| 图表卡片数值 | 26px | 700 | -0.5px | 折线图卡片顶部数值 |
| 双值卡片数值 | 24px | 700 | — | 下拨/调回金额 |
| 分区标题 | 16px | 600 | — | "资产动态"、"用户动态"等区块标题 |
| 卡片标题 | 16px | 700 | — | 表格卡片标题 |
| 指标名称 | 14px | 400 | — | KPI 卡片 label |
| 正文默认 | 14px | 400 | — | 表格正文、按钮、描述 |
| 子指标（行内） | 13px | 400 | — | KPI 卡片底部 "昨日新增 $59.83" |
| 辅助说明 | 12px | 400 | — | 数据更新时间、提示文字 |

---

## 三、卡片规范

### 3.1 基础样式

```
borderRadius:  12px
boxShadow:     0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)
bodyPadding:   20px 24px（KPI卡片、图表卡片）
               0 0 8px（含表格的卡片）
border:        none（bordered={false}）
```

### 3.2 KPI 卡片风格（简洁文字卡片）

卡片内**无图标、无彩色色块**，纯文字呈现，风格简洁商务：

```tsx
<Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW, height: '100%' }}
  styles={{ body: { padding: '20px 24px' } }}>

  {/* 标题行：左标题 + 右链接（可选） */}
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <Text style={{ fontSize: 14, color: 'rgba(0,0,0,0.45)' }}>{title}</Text>
    {link && <a style={{ fontSize: 13, color: '#1677ff' }}>{link.text} &gt;</a>}
  </div>

  {/* 核心数值 */}
  <div style={{ marginTop: 12 }}>
    <span style={{ fontSize: 30, fontWeight: 700, color: '#141414' }}>{value}</span>
  </div>

  {/* 副指标（行内展示，分隔线分隔） */}
  <Divider style={{ margin: '16px 0 12px' }} />
  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
    <Text style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>
      昨日新增 <span style={{ color: 'rgba(0,0,0,0.65)' }}>$59.83</span>
    </Text>
    <Text style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>
      今日新增 <span style={{ color: 'rgba(0,0,0,0.65)' }}>$38.34</span>
    </Text>
  </div>
</Card>
```

**关键规则：**
- 卡片内不放图标，不使用 color 属性区分卡片
- 副指标为行内格式（label + value 同一行），不分两行显示
- 标题色统一 `rgba(0,0,0,0.45)`
- 可选的 "查看明细 >" 链接在标题行右侧
- 分区标题（"资产动态"、"用户动态"）放在卡片外面，使用 `<Text strong style={{ fontSize: 16 }}>`

### 3.3 仪表盘布局

- KPI 卡片：**一行 4 个**（`xs={24} sm={12} xl={6}`）
- 图表卡片：一行 2 个（`xs={24} lg={12}`）
- 全宽表格：`span={24}`

---

## 四、间距规范

| 名称 | 值 | 用途 |
|------|----|------|
| 页面内边距 | 24px | Content 区 margin |
| 卡片组间距 | 16px | Row gutter / 行间 marginTop |
| 卡片内边距 | 20px 24px | Card body padding |
| 分隔线间距 | 16px 0 12px | KPI 卡片内 Divider margin |
| 分区标题间距 | 4px 0 12px / 24px 0 12px | 首个/后续分区标题 margin |
| 工具栏间距 | 12px | 顶部工具栏元素间 gap |

---

## 五、状态 Tag 规范

使用 Ant Design `<Tag>` 的语义色，不自定义背景色。

| 状态 | color | 适用场景 |
|------|-------|---------|
| `success` | 绿色 | 正常、已完成、持股中、已结算 |
| `processing` | 蓝色 | 审核中、进行中 |
| `blue` | 蓝色 | 通用蓝色标签 |
| `geekblue` | 极客蓝 | 需与 `blue` 区分的蓝色标签 |
| `warning` | 橙色 | 待处理、待结算 |
| `default` | 灰色 | 已退出、已关闭 |
| `error` | 红色 | 失败、已撤回 |

> 注意：不再使用 `color="purple"`，改用 `"blue"` 或 `"geekblue"`。

---

## 六、表格规范

### 6.1 必须统一的 Table props

所有主数据表格必须包含以下 props，不允许遗漏：

```tsx
<Table
  size="middle"
  rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
  scroll={{ x: /* 各列 width 之和 + 弹性空间 */ }}
  rowKey="id"
  pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
/>
```

| Prop | 标准值 | 说明 |
|------|--------|------|
| `size` | `"middle"` | 全局统一，子表格/Modal 内可用 `"small"` |
| `rowClassName` | 斑马纹函数 | **必须设置**，偶数行 `#fafafa` |
| `scroll` | `{{ x: number }}` | **必须设置**，防止列宽挤压 |
| `rowKey` | 字段名 | **必须设置** |
| `bordered` | 不设置 | 仅配置型小表格或 Modal 子表格可用 |
| `pagination` | `false` 或对象 | TOP5 排行等固定数据用 `false`，其余用分页对象 |

### 6.2 文字与颜色

- 表头字色：Ant Design 默认（`rgba(0,0,0,0.88)`）
- 表格正文：`color: #141414`（主列）/ `rgba(0,0,0,0.65)`（次要列）
- **不使用** `<Text type="secondary">` 或自定义蓝色高亮正文
- 金额列：`color: #141414`，**不加粗**
- 操作列：`<Button type="link">` 按钮，继承全局 `colorPrimary`（`#1677ff`），**不需要**显式写 color 样式；字重 400
- **表格正文（表头以外）一律不加粗**（`fontWeight: 400`）

### 6.3 内容样式统一规则

| 列类型 | 样式 | 说明 |
|--------|------|------|
| 名称列（企业名称、公司名称等） | 黑色纯文本 | 不用蓝色链接，点击跳转放在操作列 |
| 类型列（订单类型、交易类型、充值/转出等） | 纯文本 | 不用 Tag |
| 角色列 | 纯文本 | 不用彩色 Tag |
| 状态列（企业状态、订单状态等） | 纯文本 | 不用彩色 Tag |
| 货币单位 | 纯文本 | 不用 Tag |
| 认证状态（已订阅/已过期等） | `<Tag color="success/error">` | 语义明确的二值状态可用 Tag |
| 审批/结算状态（待审批/成功/失败等） | `<Tag>` | 流程状态可用 Tag |
| 账号状态（启用/停用/已过期） | `<Tag>` | 系统状态可用 Tag |
| 金额列 | `#141414`，右对齐 | 不加粗，不用红绿色 |
| 操作列 | `<Button type="link">` | 不用 `<a>` 标签 |

**原则：表格内容以简洁纯文本为主，不要花花绿绿。Tag 仅用于认证状态、审批/结算状态、账号状态等语义明确的流程/系统状态。类型、角色、货币、名称等描述性字段一律纯文本。**

**ID 类字段**（集团ID、公司ID、企业ID、认证码等）：`fontFamily: 'monospace', color: '#141414'`，不用蓝色。

### 6.4 表格工具栏

**所有主数据表格必须包含工具栏**，位于表格上方右侧，包含三个图标按钮：

| 按钮 | 图标 | 功能 |
|------|------|------|
| 刷新 | `ReloadOutlined` | 刷新表格数据 |
| 列设置 | `SettingOutlined` | 点击弹出 Popover，Checkbox 勾选控制列显示/隐藏（可选） |
| 全屏 | `FullscreenOutlined` / `FullscreenExitOutlined` | 切换表格区域全屏 |

**使用方式：** 统一使用共享组件 `src/components/TableToolbar.tsx`，不允许内联实现。

**布局规范：** 标题行 = 表格标题（左） + 工具栏（右），同一行。如有操作按钮（如「新增」），放在工具栏左边。

```
筛选条件区域（如果有）
──────────────────────────────────────
表格标题（左）  [新增按钮]   🔄 ⚙️ ⛶（右）
──────────────────────────────────────
表格内容
```

```tsx
import TableToolbar from '@/components/TableToolbar';

// 标准用法：标题左 + 工具栏右
<div ref={containerRef}>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
    <Text style={{ fontSize: 14, fontWeight: 600 }}>表格标题</Text>
    <TableToolbar onRefresh={handleRefresh} containerRef={containerRef} />
  </div>
  <Table ... />
</div>

// 带操作按钮：按钮放在工具栏左边
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
  <Space size={12}>
    <Text style={{ fontSize: 14, fontWeight: 600 }}>表格标题</Text>
    <Button type="primary" icon={<PlusOutlined />}>新增</Button>
  </Space>
  <TableToolbar onRefresh={handleRefresh} containerRef={containerRef} />
</div>
```

**样式规范：**
- 图标颜色：`#8c8c8c`
- 图标间距：`Space size={8}`
- 标题行布局：`justifyContent: 'space-between'`，标题左 + 工具栏右
- 与表格间距：`marginBottom: 12`

### 6.5 卡片包裹

- 表格外层 Card 使用 `styles={{ body: { padding: '16px 24px' } }}`（表格不顶边）
- 仪表盘 TOP5 等独立表格区使用分区标题 + Card 包裹

---

## 七、折线图规范（@ant-design/plots v2）

### 7.1 组件选型

**全项目统一使用 `Line` 组件**，渲染纯折线 + 圆形数据点标记。

```tsx
import { Line } from '@ant-design/plots';
```

### 7.2 标准配置

```tsx
const chartCfg = (data: { date: string; value: number }[], name: string) => ({
  data,
  xField: 'date',
  yField: 'value',
  shapeField: 'smooth',       // 平滑曲线
  height: 200,                // 仪表盘固定高度（详情页可用 220/180）
  autoFit: true,
  style: { stroke: '#1677ff', lineWidth: 2 },
  point: {
    shape: 'circle',
    size: 4,
    style: { fill: '#fff', stroke: '#1677ff', lineWidth: 2 },
  },
  axis: {
    x: {
      labelFontSize: 10,
      labelAutoRotate: false,
      labelFormatter: (v: string) => v.slice(5),          // 显示 MM-DD
      tickFilter: (_: string, index: number) => index % 2 === 0,
      grid: null,             // 无垂直网格线
      line: null,             // 无 X 轴线
    },
    y: {
      grid: true,
      gridLineDash: [4, 4],   // 水平虚线网格
      gridStroke: 'rgba(0,0,0,0.1)',
      line: null,             // 无 Y 轴线
      tick: null,             // 无刻度线
    },
  },
  interaction: { tooltip: { marker: { shape: 'circle' } } },
  tooltip: { items: [{ channel: 'y' as const, name }] },
});

<Line {...chartCfg(data, '图表名称')} />
```

### 7.3 视觉要点

| 要素 | 规范 |
|------|------|
| 线条 | `stroke: '#1677ff'`，`lineWidth: 2` |
| 数据点 | 白色实心圆 + 蓝色描边（`fill: '#fff', stroke: '#1677ff', lineWidth: 2`） |
| 曲线 | 平滑（`shapeField: 'smooth'`） |
| 水平网格 | 虚线（`gridLineDash: [4, 4]`），浅灰色 |
| 垂直网格 | 无 |
| 坐标轴线 | 无（X/Y 轴线均隐藏） |
| Tooltip 标记 | 圆形 |

### 7.4 多色折线图（企业详情等）

当图表颜色不固定时，将颜色变量传入：

```tsx
style={{ stroke: color, lineWidth: 2 }}
point={{ shape: 'circle', size: 4, style: { fill: '#fff', stroke: color, lineWidth: 2 } }}
```

### 7.5 X 轴间隔规范

| 数据跨度 | 处理方式 | 标签格式 |
|---------|---------|---------|
| ≤ 7 天 | 不过滤 | `M/D`（dayjs 格式化） |
| 8–90 天 | `tickFilter: i % 2 === 0` | `MM-DD` |
| > 90 天 | `tickFilter: i % 3 === 0` | `MM-DD` |

---

## 七-B、柱状图 / 条形图规范（@ant-design/plots v2）

### 7B.1 组件选型

| 方向 | 组件 | xField | yField |
|------|------|--------|--------|
| 纵向柱状图 | `Column` | 分类字段 | 数值字段 |
| 横向条形图 | `Bar` | 数值字段 | 分类字段 |

### 7B.2 scale 轴配置规则

**核心原则：`paddingInner` 只能放在分类轴（band scale），`domainMin` 放在值轴（linear scale）。**

| 组件 | 分类轴 | 值轴 | scale 写法 |
|------|--------|------|-----------|
| `Column` | x（横轴） | y（纵轴） | `scale={{ x: { paddingInner: 0.4 }, y: { domainMin: 0 } }}` |
| `Bar` | y（纵轴） | x（横轴） | `scale={{ x: { domainMin: 0 }, y: { paddingInner: 0.4 } }}` |

> **为什么必须设 `domainMin: 0`？**
> G2 默认开启 `nice` 算法，会自动扩展值轴域范围以获得"好看"的刻度值。
> 这会导致 0 点远离分类轴，柱条起点与坐标轴之间出现大段空白。
> 显式设置 `domainMin: 0` 可确保值轴从 0 开始、紧贴分类轴。

### 7B.3 标准配置示例

```tsx
// 横向条形图（Bar）
<Bar
  data={data}
  xField="value"
  yField="category"
  colorField="category"
  height={220}
  scale={{
    color: { range: ['#1677ff', '#36cfc9', '#597ef7', '#faad14', '#52c41a'] },
    x: { domainMin: 0 },          // 值轴：强制从 0 开始
    y: { paddingInner: 0.4 },      // 分类轴：柱条间距
  }}
  axis={{ x: { labelFontSize: 11 }, y: { labelFontSize: 11 } }}
/>

// 纵向柱状图（Column）
<Column
  data={data}
  xField="category"
  yField="value"
  colorField="category"
  height={220}
  scale={{
    color: { range: ['#1677ff', '#36cfc9', '#597ef7', '#faad14', '#52c41a'] },
    x: { paddingInner: 0.4 },      // 分类轴：柱条间距
    y: { domainMin: 0 },           // 值轴：强制从 0 开始
  }}
  axis={{ x: { labelFontSize: 10 }, y: { labelFontSize: 11 } }}
/>
```

### 7B.4 颜色 range

TOP5 排行类图表统一使用 5 色序列：

```ts
['#1677ff', '#36cfc9', '#597ef7', '#faad14', '#52c41a']
```

---

## 八、布局规范

### 整体结构
```
Sider（固定，dark 主题，width=220，collapsed=80）
  └─ Logo 区（64px 高）
  └─ Menu（一级有 icon，二级无 icon）
  └─ 底部用户区（absolute bottom，UserOutlined + 用户名 + LogoutOutlined）
      展开态：用户图标 + 用户名 + 退出图标
      收起态：仅退出图标居中
Header（sticky，高度 48px，白色背景）
  └─ 左：Breadcrumb
  └─ 右：角色切换（9 角色预设方案 + 组合方案）+ 余额（仅 owner/finance 角色显示）+ BellOutlined（Badge）
Content（padding: 16px 24px 24px）
  └─ 页面内容
```

### Tab 页面布局（重要）

带 Tabs 分栏的页面，Tabs 必须紧贴顶部 Header，中间**不允许**插入标题行、工具栏或任何其他元素。

```tsx
// ✅ 正确 — Tabs 直接在顶层，紧贴 Header
return (
  <div style={{ marginTop: -16 }}>
    <Tabs
      items={tabItems}
      activeKey={activeTab}
      onChange={(key) => setSearchParams({ tab: key })}
      tabBarStyle={{
        background: '#fff',
        margin: '0 -24px',
        padding: '0 24px',
      }}
    />
  </div>
);

// ❌ 错误 — Tabs 上方多出标题行或工具栏
return (
  <div style={{ marginTop: -16 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <Text>页面标题</Text>              {/* ← 多余，面包屑已有 */}
      <TableToolbar ... />               {/* ← 应放在各 Tab 内容的 Card 中 */}
    </div>
    <Tabs ... />
  </div>
);
```

**关键规则：**
- `marginTop: -16` 让 Tab 栏视觉上与 Header 底边无缝衔接
- `tabBarStyle` 中 `margin: '0 -24px'` + `padding: '0 24px'` 让 Tab 栏撑满 Content 区宽度
- 页面标题由面包屑提供，Tab 页面内不再重复渲染标题文字
- TableToolbar（刷新/设置/全屏）属于各 Tab 内容区域，放在 Card 内部，不放在 Tabs 外面
- 参考模板：系统日志 `src/pages/system/logs/index.tsx`

### 响应式断点（Ant Design Grid）
| 场景 | Col 配置 |
|------|---------|
| KPI 卡片（4列） | `xs={24} sm={12} xl={6}` |
| 图表卡片（2列） | `xs={24} lg={12}` |
| 全宽表格 | `span={24}` |

---

## 九、筛选区规范

### 9.0 字段名前缀（强制，2026-04-26 起全站生效）

筛选区每个控件**前面必须有字段名前缀**，不允许裸放控件让用户猜含义。搜索框同此约定。

> **历史变更说明：** 早期项目存在过相反约定（"筛选控件前不加 label"），自 2026-04-26 起作废，统一改为本节规范。

视觉要求（按 Ant Design Token）：
- 颜色：`color: rgba(0, 0, 0, 0.65)`（Ant Design 主文本次色 `colorTextSecondary`）
- 字号：`fontSize: 14`（与 Form.Item label 一致）
- 末尾用中文全角冒号 `：`
- 与控件之间间隙：`marginRight: 4`（紧贴控件）
- 字段名前缀放在控件**左侧**（同行水平排），不放上方

```tsx
// ✅ 正确
<Space size={16} wrap align="center">
  <span>
    <span style={{ color: 'rgba(0,0,0,0.65)', marginRight: 4 }}>订单类型：</span>
    <Radio.Group ...>...</Radio.Group>
  </span>
  <span>
    <span style={{ color: 'rgba(0,0,0,0.65)', marginRight: 4 }}>创建时间：</span>
    <RangePicker ... />
  </span>
  <span>
    <span style={{ color: 'rgba(0,0,0,0.65)', marginRight: 4 }}>订单编号：</span>
    <Input ... />
  </span>
</Space>

// ❌ 错误（裸控件无前缀）
<Space>
  <Radio.Group ... />
  <RangePicker ... />
  <Input ... />
</Space>
```

**适用范围**：
- 适用：所有筛选区、搜索区控件（Radio / Select / DatePicker / RangePicker / Input / InputNumber / Cascader 等）
- 不适用：表单弹窗（新建 / 编辑），表单内部用 `Form.Item label` 已天然带字段名

**例外**：表格内联快速筛选（列头 filter dropdown），由 antd 内置控件管理，本规范不强制。

### 9.0.1 时间筛选 placeholder 统一约定

所有 `DatePicker.RangePicker` 的 `placeholder` 暗提示统一为 `['从', '到']`，不写「开始时间 / 结束时间」「创建开始 / 创建结束」「开始日期 / 结束日期」等冗余表述（字段名已由 9.0 节前缀承担）。

```tsx
<RangePicker placeholder={['从', '到']} ... />
```

单个 `DatePicker`（非范围）若需要 placeholder，使用字段简短名（如「账单日」「账单月」），同样由 9.0 节前缀承担字段名表达，placeholder 仅用于格式提示。

---

### 9.1 可枚举选项 — 平铺 Radio.Button（填充风格）

当筛选项的可选值固定可枚举（≤ 6 个），必须使用 `Radio.Group + Radio.Button` 平铺展示，**不使用下拉 Select**。

统一使用 `buttonStyle="solid"` **填充风格**（蓝底白字），与仪表盘 Segmented 视觉一致。

```tsx
import { ConfigProvider, Radio } from 'antd';

// 统一主题（蓝底白字填充风格）
const radioTheme = {
  components: {
    Radio: {
      buttonSolidCheckedBg: '#1677ff',
      buttonSolidCheckedHoverBg: '#4096ff',
      buttonSolidCheckedActiveBg: '#0958d9',
      buttonSolidCheckedColor: '#fff',
      colorPrimary: '#1677ff',
    },
  },
};

// 用法示例（订单类型 / 货币单位）
<ConfigProvider theme={radioTheme}>
  <Radio.Group
    value={orderType}
    onChange={(e) => setOrderType(e.target.value)}
    buttonStyle="solid"
  >
    <Radio.Button value="全部">全部</Radio.Button>
    <Radio.Button value="集团下拨">集团下拨</Radio.Button>
    <Radio.Button value="集团调回">集团调回</Radio.Button>
  </Radio.Group>
</ConfigProvider>
```

**选中态**：蓝底（`#1677ff`）+ 白色文字
**未选中态**：白底 + 默认灰色文字 + 默认灰色边框
**注意**：不需要手动给 Radio.Button 加 inline style，主题配置会自动处理选中态

### 9.2 筛选区布局（重要）

**核心规则：筛选区必须放在独立的 Card 中，与表格 Card 分离。** 两个 Card 上下排列，间距 12px。

参考模板：内部划转 `src/pages/company/transfer/index.tsx`

```tsx
// ✅ 正确 — 筛选区和表格区各自独立 Card
<Space direction="vertical" size={12} style={{ display: 'flex' }}>
  {/* 筛选卡片 */}
  <Card bordered={false}>
    <Space size={16} wrap align="center">
      <ConfigProvider theme={radioTheme}>
        <Radio.Group ... buttonStyle="solid">...</Radio.Group>
      </ConfigProvider>
      <Select ... />
      <Input suffix={<SearchOutlined />} ... />
      {/* 操作按钮也可放在筛选栏末尾 */}
      <Button type="primary">操作</Button>
    </Space>
  </Card>

  {/* 表格卡片 */}
  <Card bordered={false}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <Text style={{ fontSize: 14, fontWeight: 600 }}>表格标题</Text>
      <TableToolbar onRefresh={handleRefresh} containerRef={containerRef} />
    </div>
    <Table ... />
  </Card>
</Space>

// ❌ 错误 — 筛选区和表格挤在同一个 Card 里
<Card bordered={false}>
  <Space wrap style={{ marginBottom: 16 }}>
    <Radio.Group ... />
    <Input ... />
  </Space>
  <Table ... />
</Card>
```

**布局细节：**
- 筛选区与表格区分为**两个独立 Card**，用 `Space direction="vertical" size={12}` 或 `marginBottom: 12` 排列
- 每行筛选项用 `Space size={16} wrap align="center"` 横向排列
- 标签文字（如"订单类型："）使用 `whiteSpace: 'nowrap'` 防止折行
- 可枚举项（Radio.Button）与不可枚举项（Select / Input）可共存于同一行
- 操作按钮（如"新增"、"发起下拨"）放在筛选 Card 内的末尾位置，不放在表格 Card 内

### 9.3 搜索框规范

| 规则 | 说明 |
|------|------|
| placeholder 不含"搜索" | 直接写筛选目标，如 `"订单编号 / 公司名称"` |
| 宽度必须显示完整 placeholder | 中文 placeholder 按每字符约 14px 估算，确保不截断 |
| 图标 | 使用 `suffix={<SearchOutlined />}` 或 `prefix={<SearchOutlined />}` |

### 9.4 选择方式判断规则

| 场景 | 组件 |
|------|------|
| 可选值固定，≤ 6 项 | `Radio.Button` 平铺 |
| 可选值动态或较多（> 6） | `Select` 下拉 |
| 文本搜索 | `Input` + SearchOutlined 图标 |

### 9.5 全站筛选字段速查表

> 新增/修改筛选字段时，必须在此表中登记，防止遗漏或组件选型错误。

#### 平铺 Radio.Button（固定枚举 ≤ 6 项）

| 模块 | 页面 | 字段 | 选项 |
|------|------|------|------|
| 集团收益 | 账单列表 | 账单状态 | 全部 / 未出账单 / 已出账单 |
| 集团钱包 | 订单记录 | 订单类型 | 全部 / 充值 / 转出 |
| 集团钱包 | 订单记录 | 订单状态 | 全部 / 待审批 / 成功 / 失败 |
| 资金下拨 | 下拨记录 | 到账状态 | 全部 / 已到账 / 失败 |
| 资金调回 | 调回记录 | 到账状态 | 全部 / 已到账 / 失败 |
| 企业收益 | 贡献明细单 | 收益类别 | 全部 / 彩票收益 / 股份收益 / 返佣收益 / 股份释放 / 税费支出 |
| 企业收益 | 贡献明细单 | 货币单位 | 全部 / USDT / PEA |
| 内部划转 | 划转记录 | 划转方向 | 全部 / 集团下拨 / 集团调回 |
| 内部划转 | 划转记录 | 划转状态 | 全部 / 成功 / 处理中 / 失败 |
| 企业转账 | 转账记录 | 订单类型 | 全部 / 集团下拨 / 集团调回 |
| 企业转账 | 转账记录 | 货币单位 | 全部 / USDT / PEA |
| 企业持仓 | 入股清单 | 币种 | 全部 / USDT / PEA |
| 企业持仓 | 股份交易 | 订单类型 | 全部 / 购买股份 / 释放股份 |
| 企业持仓 | 股份交易 | 币种 | 全部 / USDT / PEA |
| 企业持仓 | 投资分红 | 订单类型 | 全部 / 分红 / 投资 |
| 企业税费 | 税费清单 | 状态 | 全部 / 已结算 / 待结算 / 已取消 |
| 彩票订单 | 订单列表 | 订单状态 | 全部 / 未结算 / 结算中 / 已结算 |
| 彩票订单 | 订单列表 | 游戏 | 全部 / 百家乐 / 龙虎斗 / 骰子 |
| 彩票订单 | 订单列表 | 转单来源 | 全部 / 自动 / 手动 |
| 彩票订单 | 订单列表 | 货币单位 | 全部 / USDT / PEA |
| 佣金管理 | 佣金列表 | 应用名称 | 全部 / UU Talk / Hey Talk / Star Game |
| 佣金管理 | 佣金列表 | 货币单位 | 全部 / USDT / PEA |
| 佣金管理 | 佣金列表 | 游戏 | 全部 / 百家乐 / 龙虎斗 / 骰子 |
| 系统日志 | 登录日志 | 操作类型 | 全部类型 / 登录 / 登出 / 登录失败 |
| 系统日志 | 操作日志 | 操作结果 | 全部结果 / 成功 / 失败 |
| 通知中心 | 通知记录 | 通知方式 | 全部 / 小程序 / 邮件 / 站内 |
| 投资审批 | 审批列表 | 事件类型 | 全部类型 / 持股企业追加投资 / 持股企业释放股份 |
| 投资审批 | 审批列表 | 审批状态 | 全部状态 / 待审批 / 已通过 / 已拒绝 / 自动通过 / 超时拒绝 |

#### 下拉 Select（实体列表 / 动态数据 / > 6 项）

| 模块 | 页面 | 字段 | 数据来源 |
|------|------|------|----------|
| 资金下拨 | 下拨记录 | 目标公司 | 静态公司列表（会随业务增长） |
| 资金调回 | 调回记录 | 来源公司 | 静态公司列表（会随业务增长） |
| 企业收益 | 贡献明细单 | 公司名称 | 从数据中提取去重 |
| 企业转账 | 转账记录 | 公司 | 静态公司列表（会随业务增长） |
| 企业持仓 | 股份交易 | 企业名称 | 静态企业列表（会随业务增长） |
| 企业持仓 | 投资分红 | 企业名称 | 静态企业列表（会随业务增长） |
| 企业税费 | 税费清单 | 公司筛选 | 静态公司列表（会随业务增长） |
| 彩票订单 | 订单列表 | 转单企业 | 静态企业列表（会随业务增长） |
| 佣金管理 | 佣金列表 | 企业名称 | 静态企业列表（会随业务增长） |
| 系统日志 | 登录日志 | 角色 | ROLE_OPTIONS 常量 |
| 系统日志 | 操作日志 | 模块 | MODULE_OPTIONS 常量 |
| 通知中心 | 通知记录 | 通知类型 | NOTIF_TYPES 常量 |
| 投资审批 | 审批列表 | 触发方企业 | 从数据中提取去重 |

#### Segmented（页面级切换，非筛选）

| 模块 | 页面 | 字段 | 选项 |
|------|------|------|------|
| 集团仪表盘 | 仪表盘 | 币种 | USDT / PEA |
| 企业清单 | 企业列表 | 币种 | USDT / PEA |

---

## 十、仪表盘 KPI 卡片注释规范

当卡片 title 需要说明统计口径时，右侧放置 `<InfoCircleOutlined>` 小图标，用 `<Tooltip>` 包裹。

```tsx
import { InfoCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

<div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
  <Text style={{ fontSize: 14, color: 'rgba(0,0,0,0.45)' }}>{title}</Text>
  {tooltip && (
    <Tooltip title={tooltip}>
      <InfoCircleOutlined style={{ fontSize: 12, color: 'rgba(0,0,0,0.3)', cursor: 'help' }} />
    </Tooltip>
  )}
</div>
```

- 图标大小：`12px`，颜色：`rgba(0,0,0,0.3)`，`cursor: help`
- 折线图卡片 title 同样可加注释图标
- Tooltip 文案说明：数据统计来源、汇总口径

---

## 十一、权限相关页面规范

### 11.1 角色管理页（只读展示）

角色管理页为只读展示，不可新增、编辑、删除。集团侧和公司侧角色分两个 Card 并排展示（`Col span={12}`），每个 Card 内一个 Table 列出角色名及对应功能模块（Tag 平铺）。

### 11.2 角色选择 + 模块预览

用户管理的创建/编辑弹窗中，角色 Select 为 `mode="multiple"`（多选）。选中角色后，下方显示浅蓝色面板（`background: #f6f8ff`，`border: 1px solid #d6e4ff`），列出所选角色的全部功能模块 Tag（多角色自动合并去重）。

### 11.3 角色切换器（Header，仅 Mock 阶段）

Header 右侧的角色切换 Select 宽度 `140px`，包含 9 个单角色预设方案。切换后 localStorage 更新 `mock_auth`，菜单和路由守卫即时生效。

---

## 十二、全局水印

- 组件：Ant Design `<Watermark>`，包裹整个 Layout
- 内容：`{用户名} {MM-DD}`，如 `Miya 04-10`
- 字号 14px，颜色 `rgba(0,0,0,0.04)`
- 间距：`gap={[80, 80]}`（水平 80px、垂直 80px）

---

## 十三、详情弹窗 — 顶部概要区（Modal Summary Bar）

适用：在 Modal 详情中需要回显主表关键状态信息时（如牛牛红包订单详情的「玩法 / 赔率 / 状态」）。

视觉规范：
- 背景色：`#fafafa`
- 圆角：`8px`
- 内边距：`12px 16px`
- 上外边距：`12px`（紧贴 Modal 标题下方）
- 下外边距：`16px`（与下方主体内容拉开）
- 排布：`display: flex` + `gap: 32`，水平排列各概要项
- 概要项格式：浅灰 label（`fontSize: 13`，`color: rgba(0,0,0,0.45)`）+ 间距 4px + 黑色值（`#141414`）；状态类用 Tag 紧跟其后

参考实现：`src/pages/enterprise/detail/index.tsx` 牛牛红包 Tab 的订单详情 Modal。

```tsx
<div style={{
  background: '#fafafa',
  borderRadius: 8,
  padding: '12px 16px',
  marginTop: 12,
  marginBottom: 16,
  display: 'flex',
  gap: 32,
  alignItems: 'center',
}}>
  <Text style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>
    玩法 <span style={{ color: '#141414', marginLeft: 4 }}>{play}</span>
  </Text>
  {/* ... 其他概要项 */}
</div>
```

---

## 十四、企业详情 → 牛牛红包 Tab（视觉约定）

- Tab 紧贴 Header（沿用第六章「Tab 页面规范」）
- 主表 14 列 + 操作列（`fixed: right`），`scroll x=1800`
- 操作列按钮：单一「详情」按钮（`<Button type="link" size="small" style={{ padding: 0 }}>`）。原"返佣详情"按钮已下线，每条领取记录的返佣金额合并到 Modal 内表格
- 订单状态列：黑色纯文本（已开奖 / 未开奖），不使用 Tag
- 玩法、底注、红包数量等纯文本列：黑色文本，不滥用 Tag
- 金额列（赔付金额 / 抽水金额 / 返佣金额 / 本局盈亏 / 抽水）：黑色 `#141414`，不分正负色
- 完成时间：未开奖时显示 `—`
- 详情 Modal：宽度 1000px，含「概要区 + 领取记录表（含返佣金额列）」

---

## 十五、企业详情 → 应用费用 Tab（视觉约定）

- 位置：东方彩票 Tab 之后、佣金订单 Tab 之前
- 主表 9 列，无操作列；`scroll x=1700`
- 订单类型列：黑色纯文本（应用结算 / 主动分红），不使用 Tag
- 总额列（企业盈利总额 / 应用费用总额）：黑色 `#141414`，右对齐，固定 2 位小数
- 明细列（企业盈利明细 / 应用费用明细）：黑色，列宽 360，单行展示「东方彩票 X / 七星百家乐 X / 企业红包 X」，整体 `whiteSpace: nowrap`
- 筛选区控件顺序：订单类型 Radio → 创建时间 RangePicker（placeholder `['从', '到']`） → 账单月 DatePicker(month) → 账单日 DatePicker → 订单编号 Input
