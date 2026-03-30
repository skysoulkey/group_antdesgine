# 前端开发避坑规范

> 来源项目：集团公司管理系统（group-admin-web）
> 技术栈：Umi 4 + Ant Design 5 + @ant-design/plots v2（G2 v5）
> 用途：供后续同类 PC 端项目快速对照，避免重复踩坑。

---

## 1. @ant-design/plots v2 — 折线图渲染双条线

**遇到的问题**
折线图传入 `line: { style: { stroke: '...' } }` 后，图表渲染出两条重叠线条。

**根本原因**
plots v2 中传入 `line` 属性会触发 CONFIG_SHAPE 处理，生成额外的 line 子 mark，与主线叠加。

**解决方案**
完全省略 `line` 属性，不传即可：
```tsx
// ✅ 正确
<Line data={data} xField="date" yField="value" shape="smooth" point={{}} height={220} autoFit />

// ❌ 错误
<Line data={data} xField="date" yField="value" line={{ style: { stroke: '#722ed1' } }} />
```

**如何检查**
页面渲染后观察折线图，若出现两条线（一粗一细或两条相同颜色的线）即为触发此 bug。
搜索代码中是否有 `line:` 属性传给 `<Line>` 组件。

---

## 2. @ant-design/plots v2 — 柱状图 / 条形图颜色设置

**遇到的问题**
用 `scale={{ color: { range: ['#722ed1'] } }}` 设置单系列 Bar/Column 颜色无效，柱子颜色仍为默认蓝色。

**根本原因**
`scale.color.range` 仅在定义了 `colorField` 时生效（多系列分组场景）。单系列图表没有 colorField，此配置被忽略。

**解决方案**
单系列柱状 / 条形图使用 `style` prop 直接设置填充色：
```tsx
// ✅ 正确
<Bar data={data} xField="value" yField="name" style={{ fill: '#722ed1' }} height={220} />

// ❌ 错误（无 colorField 时无效）
<Bar data={data} xField="value" yField="name" scale={{ color: { range: ['#722ed1'] } }} />
```

**如何检查**
检查所有单系列 Bar / Column 组件：若无 `colorField` 属性，颜色必须通过 `style={{ fill: '...' }}` 设置，而非 `scale.color.range`。

---

## 3. Ant Design 5 Segmented — 选中态颜色不跟随主色

**遇到的问题**
设置全局 `colorPrimary: '#722ed1'` 后，Segmented 选中项背景依然是浅灰色，未变为主色。

**根本原因**
Ant Design 5 的 Segmented 组件有独立的 component token，选中背景色不直接继承 `colorPrimary`。

**解决方案**
用局部 ConfigProvider 单独覆盖 Segmented 的 token：
```tsx
<ConfigProvider
  theme={{
    components: {
      Segmented: {
        trackBg: '#f9f0ff',         // 容器底色（浅紫）
        itemSelectedBg: '#722ed1',  // 选中项背景
        itemSelectedColor: '#fff',  // 选中项文字
        itemColor: '#722ed1',       // 未选中项文字
      },
    },
  }}
>
  <Segmented options={['USDT', 'PEA']} value={currency} onChange={setCurrency} />
</ConfigProvider>
```

**如何检查**
切换 Segmented，选中项应为紫底白字，未选中项应为浅紫底紫字。若选中态为灰色，说明缺少 component token 配置。

---

## 4. Tooltip 空气泡问题

**遇到的问题**
某些卡片无需注释，若 `tooltip` prop 为空字符串或 `undefined` 但仍渲染了 `<Tooltip title="">` 包装器，鼠标悬停会出现空白气泡。

**解决方案**
使用条件渲染，无 tooltip 时完全不渲染图标和 Tooltip 包装器：
```tsx
// ✅ 正确
{tooltip && (
  <Tooltip title={tooltip}>
    <InfoCircleOutlined style={{ fontSize: 12, color: 'rgba(0,0,0,0.35)', cursor: 'help' }} />
  </Tooltip>
)}

// ❌ 错误
<Tooltip title={tooltip ?? ''}>
  <InfoCircleOutlined />
</Tooltip>
```

**如何检查**
对所有没有传 tooltip 的卡片，鼠标移到 title 区域，不应出现任何气泡。

---

## 5. Ant Design 5 全局 colorPrimary 继承规则

**遇到的问题**
修改操作列按钮颜色时，逐个给 `<Button type="link">` 加了 `style={{ color: '#722ed1' }}`，造成冗余代码。后来排查还发现有残留的旧蓝色 `#1677ff` 硬编码。

**规则**
全局 ConfigProvider 已设置 `colorPrimary: '#722ed1'`，`type="link"` 按钮自动继承紫色，**不需要也不应该**显式写 color 样式：
```tsx
// ✅ 正确
<Button type="link" size="small" style={{ padding: 0 }}>详情</Button>

// ❌ 多余（但无害）
<Button type="link" size="small" style={{ padding: 0, color: '#722ed1' }}>详情</Button>

// ❌ 错误（覆盖了主题色）
<Button type="link" size="small" style={{ padding: 0, color: '#1677ff' }}>详情</Button>
```

**重要补充**
`colorPrimary` 控制的是主按钮/选中态等，`type="link"` 按钮的颜色由 `colorLink` token 控制，两者独立。
必须在全局 ConfigProvider 同时设置：
```tsx
token: {
  colorPrimary: '#722ed1',
  colorLink: '#722ed1',   // ← 缺少这行，link 按钮仍为默认蓝色
}
```

**如何检查**
全局搜索 `color: '#1677ff'`，若出现在按钮 style 上，必须删除。
检查 `app.tsx` 的 token，`colorLink` 是否与 `colorPrimary` 保持一致。

---

## 6. 表格字体加粗规则

**遇到的问题**
在实现表格时，金额列、状态列等非表头单元格使用了 `fontWeight: 600`，违反规范被指出。

**规则**
| 位置 | 是否可加粗 |
|------|----------|
| 表头 | ✅ 可以（Ant Design 默认） |
| 表格正文（非表头） | ❌ 禁止，一律 fontWeight: 400 |
| 操作列按钮 | ❌ 禁止，fontWeight: 400 |
| KPI 大数值 | ✅ 可以（fontWeight: 700） |
| 卡片标题 | ✅ 可以（fontWeight: 600～700） |

金额列的视觉强调通过颜色区分（正值 `#52c41a`，负值 `#ff4d4f`，中性 `#141414`），不用字重。

**如何检查**
搜索表格 column render 函数内是否存在 `fontWeight: 600` 或 `fontWeight: 700`。

---

## 7. Tooltip / 注释文案来源 — 不允许自由发挥

**遇到的问题**
KPI 卡片的 Tooltip 注释文案第一次由 AI 自行推导撰写，被用户指出"不要自由发挥了"，要求全部改为设计稿中的原文。

**规则**
- Tooltip 文案必须来自**指定的产品设计稿 / Axure 标注**，逐字使用
- 没有标注的字段，`tooltip` prop 一律不传（不渲染图标），不得自行补充
- 折线图卡片若无标注，需明确告知用户，由用户确认后再写

**Axure data.js 内容提取方法**
Axure 导出的标注数据存在 `files/{页面名}/data.js`（压缩 JS，可能超过 10MB，不可直接 Read）。
提取中文内容的 bash 命令：
```bash
grep -o '"[^"]*[^\x00-\x7F][^"]*"' /path/to/data.js | head -200
```

**如何检查**
每次写 Tooltip 文案，须能指出对应来源文件和原文。若文案是 AI 自行生成，视为违规。

---

## 8. 超大压缩文件的内容提取

**场景**
需要从 Axure 导出的 `data.js`（压缩格式，单文件数十 MB）中提取标注文本。

**解决方案**
用 bash `grep` 提取含非 ASCII 字符（中文）的字符串字面量：
```bash
grep -o '"[^"]*[^\x00-\x7F][^"]*"' /path/to/data.js
```
输出所有包含中文的双引号字符串，按出现顺序排列，可通过上下文对应到具体 UI 元素。

**注意**
- 直接用 Read 工具读取超大文件会超出上下文限制，必须先用 bash 过滤
- 提取结果按文件顺序输出，需结合页面布局顺序对应到具体卡片

---

## 9. @ant-design/plots v2 — 折线图 tooltip 显示 "value" 而非字段名

**遇到的问题**
折线图鼠标悬停 tooltip 显示 "value"，而非业务含义的字段名称（如"公司总资产"、"企业盈亏"）。

**根本原因**
plots v2 默认用 `yField` 的字段名（即 `"value"`）作为 tooltip label，未配置 `tooltip.items` 时直接展示字段名。

**解决方案**
在 `chartCfg` 函数中加 `name` 参数，传入 tooltip 配置：
```tsx
const chartCfg = (data: { date: string; value: number }[], name: string) => ({
  data,
  xField: 'date',
  yField: 'value',
  shape: 'smooth',
  ...
  tooltip: { items: [{ channel: 'y' as const, name }] },  // ← 必须
});
```
每个图表调用时传入对应的中文名称：
```tsx
<Line {...chartCfg(assetData, '公司总资产')} />
<Line {...chartCfg(profitData, '公司盈亏')} />
```

**如何检查**
每次新增折线图后，鼠标悬停检查 tooltip 中显示的 label 是否为中文业务名称，而非 `"value"`。

---

## 10. 表格列头：注释图标与排序箭头间距

**遇到的问题**
表格列头中，`InfoCircleOutlined`（注释图标）与 Ant Design 自动追加的排序箭头紧挨在一起，容易误触。

**根本原因**
Ant Design Table 排序箭头渲染在列标题内容的右侧，`ColTitle` 组件自身没有预留右侧间距，导致排序区域和注释图标重叠。

**解决方案**
给 `ColTitle` 外层 `<span>` 加 `marginRight: 8`，将排序箭头推到右侧：
```tsx
const ColTitle = ({ label, tip }: { label: string; tip?: string }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginRight: 8 }}>
    {label}
    {tip && (
      <Tooltip title={tip}>
        <InfoCircleOutlined style={{ fontSize: 12, color: 'rgba(0,0,0,0.35)', cursor: 'help' }} />
      </Tooltip>
    )}
  </span>
);
```

**如何检查**
凡是同时带排序和注释图标的列头（如"税费收益"、"股份收益"等），注释图标和排序箭头之间应有明显间距，鼠标点击图标时不会触发排序。

---

## 11. @ant-design/plots v2 — X 轴标签过密，tickCount / ticks 无效

**遇到的问题**
折线图 X 轴日期标签每3天显示一个，60天数据共20个标签，排列密集。
尝试 `scale.x.tickCount: 3` 和 `scale.x.ticks: [...]` 均无效，标签数量不变。

**根本原因**
日期字符串在 G2 v5 中被识别为**有序分类（ordinal）轴**，`tickCount` 只是建议值，不强制生效；
`ticks` 显式数组同样不被 ordinal 轴尊重。
`labelFormatter` 返回空字符串 `''` 仅隐藏文字，刻度线仍在，会造成视觉重叠（"两个轴"假象）。

**正确解决方案**
使用 `axis.x.tickFilter`，从 G2 源码确认其签名为 `(value, index, ticks) => boolean`，
奇数 index 过滤掉，整个刻度（线 + 标签）一起移除：

```tsx
axis: {
  x: {
    labelFontSize: 10,
    labelAutoRotate: false,
    labelFormatter: (v: string) => v.slice(5),           // 显示 MM-DD
    tickFilter: (_: string, index: number) => index % 2 === 0, // 标签减半
  },
},
```

**如何检查**
所有折线图 X 轴标签间距应均匀，不出现重叠或密集排列。
`tickCount` 和 `ticks` 出现在 `scale.x` 中时视为无效配置，应删除并改用 `tickFilter`。

---

## 12. useParams 路由参数必须用于实际数据展示

**遇到的问题**
详情页通过 `useParams` 取到了路由 id，但页面上的 KPI 数据、表格、图表全部是静态 mock，未根据 id 做任何区分。实际上无论跳转哪个详情，展示的都是同一份数据。

**规则**
- 路由详情页获取到 `id`/`enterpriseId` 等参数后，**必须**将其用于：
  1. 页面头部展示对应实体的基本信息（名称、状态、归属等）
  2. 接口联调时作为请求参数，过滤并展示该实体的数据
- Mock 阶段最低要求：建立 id → 基本信息的查找表（如 `ENTERPRISE_MAP`），让头部 Banner 能显示正确的名称和状态，而非留空或写死一份
- 不允许详情页完全忽视 `useParams` 返回值

**如何检查**
每次新开发详情页时，检查：
1. 是否有 `useParams` 取到的 id
2. 该 id 是否出现在页面渲染逻辑或接口调用中（不能只是展示 id 字符串本身）
3. 至少有一个数据块（头部/表格/图表）的内容依赖于该 id

---

## 13. 筛选器组件必须接入 onChange 和筛选逻辑

**遇到的问题**
页面中放置了 `RangePicker`、`Select`、`Radio.Group`、`Input` 等筛选器组件，但 `onChange` 未绑定 state，或 state 有了但未加入数据 `filter()` 逻辑，导致操作筛选器没有任何效果，仅是 UI 摆设。

**规则**
- 每个筛选器组件上线前，必须同时满足以下三点：
  1. 绑定了 `onChange`，更新对应 state
  2. 该 state 被用于 `filter()` 或传给接口参数
  3. 筛选结果反映在表格/图表的 `dataSource` 或 `data` 上
- `RangePicker` 额外注意：`onChange` 回调的值类型为 `[Dayjs, Dayjs] | null`，需显式 cast：
  ```tsx
  onChange={(v) => setRange(v as [Dayjs, Dayjs] | null)}
  ```
- 过滤日期时使用 `dayjs` 比较，避免字符串直接对比失效：
  ```tsx
  const inRange = (dateStr: string, range: [Dayjs, Dayjs] | null) => {
    if (!range || !dateStr || dateStr === '—') return true;
    const d = dayjs(dateStr);
    return !d.isBefore(range[0].startOf('day')) && !d.isAfter(range[1].endOf('day'));
  };
  ```

**如何检查**
新增任何筛选器组件后，手动操作该组件，观察表格/图表数据是否发生变化。若无变化，必须排查以上三点，确保链路完整。

---

## 15. 规范文件体系

每个项目应维护以下规范文档，与代码保持同步：

| 文件 | 职责 |
|------|------|
| `src/styles/design-spec.md` | 视觉规范：颜色、字体、卡片、表格、图表、布局 |
| `src/styles/data-spec.md` | 数据口径规范：各指标的统计方式和计算来源 |
| `src/styles/dev-pitfalls.md` | 开发避坑：已踩过的坑、解决方案、检查方式（本文件） |

**维护原则**
- 代码改了，对应规范文档必须同步更新
- 发现规范与代码不一致时，先确认是规范错了还是代码错了，再决定改哪边
- 新项目启动前，先阅读 design-spec.md 和 dev-pitfalls.md，避免重复踩坑
