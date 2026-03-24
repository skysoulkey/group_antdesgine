# 集团公司管理系统 · 视觉规范

> 本文档为系统统一视觉标准，所有页面开发须遵循以下规范，保证视觉一致性。

---

## 零、品牌资源

| 用途 | 文件路径 | 说明 |
|------|---------|------|
| 浏览器 Favicon | `public/favicon.png` | Umi 4 自动识别，需在 `.umirc.ts` 配置 `favicon: '/favicon.png'` |
| 登录页 Logo | `src/assets/logo.png` | 组件内 `import logoImg from '../../assets/logo.png'` 引用 |

**图片资源引入规范：**
- 组件使用的图片放 `src/assets/`，通过 import 引入，走 webpack 处理
- 静态公共资源放 `public/`，构建时原样复制到 `dist/` 根目录
- TypeScript 识别 `.png/.jpg/.svg` 模块需在 `src/typings.d.ts` 中声明类型

---

## 一、颜色规范

### 1.1 品牌色 / 语义色

| 名称 | 色值 | 用途 |
|------|------|------|
| Primary（主色） | `#722ed1` | 导航选中、主按钮、链接、KPI 高亮、操作按钮、图标 |
| Success（成功） | `#52c41a` | 正常状态、盈利、收益、已完成 |
| Warning（警告） | `#faad14` | 待处理、排名金色、注意项 |
| Error（错误） | `#ff4d4f` | 亏损、失败、撤回、错误提示 |
| Purple Light（紫色浅） | `#f9f0ff` | 紫色系背景、Segmented 容器底色 |
| Cyan（青色） | `#13c2c2` | 股份相关数据 |
| Orange（橙色） | `#fa8c16` | 彩票、运营类数据 |
| Pink（粉色） | `#eb2f96` | 佣金收益类 |

### 1.2 文字色

| 层级 | 色值 | 用途 |
|------|------|------|
| 主文字 | `#141414` | 大数值、表格正文主列 |
| 次要文字 | `rgba(0,0,0,0.65)` | 表格一般列、标签文字 |
| 辅助文字 | `rgba(0,0,0,0.55)` | KPI 卡片指标名称 |
| 弱提示文字 | `rgba(0,0,0,0.45)` | 子指标 label、时间戳 |
| 最弱文字 | `rgba(0,0,0,0.35)` | 占位符、禁用态 |

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
| KPI 大数值 | 28px | 700 | -1px | 仪表盘核心指标数值 |
| 图表卡片数值 | 26px | 700 | -0.5px | 折线图卡片顶部数值 |
| 双值卡片数值 | 24px | 700 | — | 下拨/调回金额 |
| 卡片标题 | 16px | 700 | — | 表格卡片标题、区块标题 |
| 指标名称 | 14px | 500 | — | KPI 卡片 label、列表标签 |
| 正文默认 | 14px | 400 | — | 表格正文、按钮、描述 |
| 子指标数值 | 13px | 600 | — | KPI 卡片底部子数值 |
| 子指标 label | 12px | 400 | — | KPI 卡片底部标签、时间戳 |
| 辅助说明 | 12px | 400 | — | 数据更新时间、提示文字 |

---

## 三、卡片规范

```
borderRadius:  12px
boxShadow:     0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)
hover shadow:  0 4px 20px rgba(0,0,0,0.10)
bodyPadding:   20px 24px（KPI卡片、图表卡片）
               0 0 8px（含表格的卡片）
border:        none（bordered={false}）
```

---

## 四、间距规范

| 名称 | 值 | 用途 |
|------|----|------|
| 页面内边距 | 24px | Content 区 margin |
| 卡片组间距 | 16px | Row gutter / 行间 marginTop |
| 卡片内边距 | 20px 24px | Card body padding |
| 分隔线间距 | 10px | KPI 卡片内 Divider margin |
| 子项行间距 | 4px | KPI 卡片子数据 rowGap |
| 工具栏间距 | 12px | 顶部工具栏元素间 gap |

---

## 五、Icon 规范

每种业务含义对应唯一图标，不重复使用。

| 业务含义 | Icon | 组件名 |
|---------|------|--------|
| 公司 / 总资产 | 🏦 | `BankOutlined` |
| 企业（认证企业） | 🌳 | `ApartmentOutlined` |
| 持股估值 | 📈 | `StockOutlined` |
| 股份盈亏 | 💹 | `FundOutlined` |
| 税费收益 | 📒 | `AccountBookOutlined` |
| 彩票盈亏 | 🎁 | `GiftOutlined` |
| 佣金收益 | 💰 | `MoneyCollectOutlined` |
| 佣金支出 | ➖ | `MinusCircleOutlined` |
| 资金下拨 | ↑ | `RiseOutlined` |
| 资金调回 | ↓ | `FallOutlined` |
| 成员总数 | 👥 | `TeamOutlined` |
| 参与成员 | 👤+ | `UsergroupAddOutlined` |
| 活跃成员 | ⚡ | `ThunderboltOutlined` |
| 钱包 | 👛 | `WalletOutlined` |
| 通知 | 🔔 | `BellOutlined` |
| 设置 | ⚙️ | `SettingOutlined` |
| 仪表盘 | 📊 | `DashboardOutlined` |
| 排行榜 | 🏆 | `TrophyOutlined` |

---

## 六、状态 Tag 规范

使用 Ant Design `<Tag>` 的语义色，不自定义背景色。

| 状态 | color | 适用场景 |
|------|-------|---------|
| `success` | 绿色 | 正常、已完成、持股中、已结算 |
| `processing` | 蓝色 | 审核中、进行中 |
| `warning` | 橙色 | 待处理、待结算 |
| `default` | 灰色 | 已退出、已关闭 |
| `error` | 红色 | 失败、已撤回 |

---

## 七、表格规范

- 表头字色：Ant Design 默认（`rgba(0,0,0,0.88)`）
- 表格正文：`color: #141414`（主列）/ `rgba(0,0,0,0.65)`（次要列）
- **不使用** `<Text type="secondary">` 或自定义蓝色高亮正文
- 金额列：`color: #141414`，**不加粗**，视觉强调通过颜色区分（正值 `#52c41a`，负值 `#ff4d4f`）
- 操作列：`type="link"` 按钮，统一使用紫色 `#722ed1`（继承全局 `colorPrimary`，**不需要**显式写 color 样式）；字重 400，禁止加粗；字号 14px（Ant Design 默认）
- **表格正文（表头以外）一律不加粗**（`fontWeight: 400`）；仅表头、卡片标题、数值大字等结构性元素可加粗
- 斑马纹：奇偶行交替，偶数行 `background: #fafafa`（CSS class `.table-row-light td`）
- 排名前三：使用 `TrophyOutlined`（`color: #faad14`），4-5 名显示数字，文字色统一 `rgba(0,0,0,0.65)`

---

## 八、折线图规范（@ant-design/plots v2）

```tsx
// 标准配置
const chartCfg = (data, name) => ({
  data,
  xField: 'date',
  yField: 'value',
  shape: 'smooth',        // 平滑曲线
  point: false,           // 60天以上数据不显示 point，避免过密
  height: 200,            // 仪表盘折线图固定高度
  autoFit: true,
  style: { stroke: '#722ed1' },
  scale: {
    color: { range: ['#722ed1'] },
    x: { tickCount: 6 },  // X轴标签数自适应：约每10天一刻度
  },
  axis: {
    x: {
      labelFontSize: 10,
      labelAutoRotate: false,
      labelFormatter: (v) => v.slice(5), // 只显示 MM-DD，去掉年份
    },
  },
  tooltip: { items: [{ channel: 'y', name }] },
  // 注意：不传 line 属性，避免 v2 渲染双线 bug
});
```

### X 轴间隔规范

| 数据跨度 | tickCount | 标签格式 | 效果 |
|---------|-----------|---------|------|
| ≤ 7 天 | 7 | `MM-DD` | 每天1刻度 |
| 8–31 天 | 6 | `MM-DD` | 约每5天1刻度 |
| 32–90 天 | 6 | `MM-DD` | 约每10天1刻度 |
| > 90 天 | 6 | `MM-DD` 或 `MM月` | 自动分布 |

> **规则**：统一使用 `tickCount: 6`（中等数据集）或 `tickCount: 7`（≤7天）；
> `labelFormatter` 格式化为 `v.slice(5)` 显示 `MM-DD`，节省横向空间，避免旋转。

> **重要**：@ant-design/plots v2 中传入 `line: { style: {...} }` 会触发 CONFIG_SHAPE 处理，
> 生成额外 line 子 mark，导致渲染双条线。**始终省略 `line` 属性**。

---

## 九、布局规范

### 整体结构
```
Sider（固定，dark 主题，width=220，collapsed=80）
  └─ Logo 区（64px 高）
  └─ Menu（一级有 icon，二级无 icon）
Header（sticky，高度 64px，白色背景）
  └─ 左：Breadcrumb
  └─ 右：余额 + BellOutlined（Badge）
Content（margin: 24px）
  └─ 页面内容
```

### 响应式断点（Ant Design Grid）
| 场景 | Col 配置 |
|------|---------|
| KPI 卡片（4列） | `xs={24} sm={12} xl={6}` |
| 图表卡片（2列） | `xs={24} lg={12}` |
| 全宽表格 | `span={24}` |

---

## 十、筛选区规范

### 10.1 可枚举选项 — 平铺 Radio.Button

当筛选项的可选值固定可枚举（≤ 6 个），必须使用 `Radio.Group + Radio.Button` 平铺展示，**不使用下拉 Select**。

```tsx
import { ConfigProvider, Radio } from 'antd';

// 主题覆盖（统一紫色选中态）
const radioTheme = {
  components: {
    Radio: {
      buttonCheckedBg: '#ffffff',
      buttonSolidCheckedBg: '#ffffff',
      buttonSolidCheckedColor: '#722ed1',
      buttonSolidCheckedHoverBg: '#ffffff',
      colorPrimary: '#722ed1',
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
        style={orderType === t ? { color: '#722ed1', borderColor: '#722ed1' } : {}}
      >
        {t}
      </Radio.Button>
    ))}
  </Radio.Group>
</ConfigProvider>
```

**选中态**：白底 + 紫色文字 + 紫色边框（`#722ed1`）
**未选中态**：白底 + 默认灰色文字 + 默认灰色边框

### 10.2 筛选区布局

- 筛选区与表格区分为**两个独立卡片**，上下排列（`Space direction="vertical" size={16}`）
- 每行筛选项用 `Space size={24} wrap` 横向排列
- 标签文字（如"订单类型："）使用 `whiteSpace: 'nowrap'` 防止折行
- 可枚举项（Radio.Button）与不可枚举项（Select / Input）可共存于同一行

### 10.3 选择方式判断规则

| 场景 | 组件 |
|------|------|
| 可选值固定，≤ 6 项 | `Radio.Button` 平铺 |
| 可选值动态或较多（> 6） | `Select` 下拉 |
| 文本搜索 | `Input` + 搜索图标 |

---

## 十一、仪表盘 KPI 卡片注释规范

每个 KPI 卡片 title 右侧须放置 `<InfoCircleOutlined>` 小图标，用 `<Tooltip>` 包裹，鼠标悬停展示数据统计口径说明。

```tsx
import { InfoCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

// KpiCard title 行
<div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
  <Text style={{ fontSize: 14, color: 'rgba(0,0,0,0.55)', fontWeight: 500 }}>{title}</Text>
  {tooltip && (
    <Tooltip title={tooltip}>
      <InfoCircleOutlined style={{ fontSize: 12, color: 'rgba(0,0,0,0.35)', cursor: 'help' }} />
    </Tooltip>
  )}
</div>
```

- 图标大小：`12px`，颜色：`rgba(0,0,0,0.35)`（最弱文字色），`cursor: help`
- 折线图卡片 title 同样加注释图标
- Tooltip 文案说明：数据统计来源、汇总口径、跳转目标（如适用）
