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

### 6.3 卡片包裹

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

### 响应式断点（Ant Design Grid）
| 场景 | Col 配置 |
|------|---------|
| KPI 卡片（4列） | `xs={24} sm={12} xl={6}` |
| 图表卡片（2列） | `xs={24} lg={12}` |
| 全宽表格 | `span={24}` |

---

## 九、筛选区规范

### 9.1 可枚举选项 — 平铺 Radio.Button

当筛选项的可选值固定可枚举（≤ 6 个），必须使用 `Radio.Group + Radio.Button` 平铺展示，**不使用下拉 Select**。

```tsx
import { ConfigProvider, Radio } from 'antd';

// 主题覆盖（蓝色选中态）
const radioTheme = {
  components: {
    Radio: {
      buttonCheckedBg: '#ffffff',
      buttonSolidCheckedBg: '#ffffff',
      buttonSolidCheckedColor: '#1677ff',
      buttonSolidCheckedHoverBg: '#ffffff',
      colorPrimary: '#1677ff',
      colorBorder: '#d9d9d9',
    },
  },
};

// 用法示例（订单类型 / 货币单位）
<ConfigProvider theme={radioTheme}>
  <Radio.Group
    value={orderType}
    onChange={(e) => setOrderType(e.target.value)}
    buttonStyle="outline"
  >
    {['全部', '集团下拨', '集团调回'].map((t) => (
      <Radio.Button
        key={t}
        value={t}
        style={orderType === t ? { color: '#1677ff', borderColor: '#1677ff' } : {}}
      >
        {t}
      </Radio.Button>
    ))}
  </Radio.Group>
</ConfigProvider>
```

**选中态**：白底 + 蓝色文字 + 蓝色边框（`#1677ff`）
**未选中态**：白底 + 默认灰色文字 + 默认灰色边框

### 9.2 筛选区布局

- 筛选区与表格区分为**两个独立卡片**，上下排列（`Space direction="vertical" size={16}`）
- 每行筛选项用 `Space size={24} wrap` 横向排列
- 标签文字（如"订单类型："）使用 `whiteSpace: 'nowrap'` 防止折行
- 可枚举项（Radio.Button）与不可枚举项（Select / Input）可共存于同一行

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

### 11.3 详情页权限跟随

详情页无独立菜单入口，权限跟随对应的清单页：
- `/company/detail/:id`（公司详情）→ 权限跟随公司清单（`group_owner`, `group_ops`）
- `/enterprise/detail/:id`（企业详情）→ 权限跟随企业清单（`company_owner`, `company_promo`）

### 11.4 角色切换器（Header，仅 Mock 阶段）

Header 右侧的角色切换 Select 宽度 `140px`，包含 9 个单角色预设方案。切换后 localStorage 更新 `mock_auth`，菜单和路由守卫即时生效。
