# 审批单改造为订单 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将投资审批模块从"审批单"视角改造为"订单"视角，新增字段、调整列顺序、隐私化名称、重新设计审批规则为企业专属规则 + 全局兜底规则。

**Architecture:** 修改现有两个文件（index.tsx + ApprovalRulesTab.tsx），不新增文件。订单列表调整数据结构和列定义，审批规则改为可增删的企业规则列表 + 不可删除的全局兜底规则。

**Tech Stack:** React + Ant Design + umi useSearchParams (已有技术栈，无新增)

---

## 变更范围

| 文件 | 操作 | 职责 |
|------|------|------|
| `src/pages/finance/approvals/index.tsx` | Modify | 订单列表：重命名、新增字段、调整列顺序、隐私化 |
| `src/pages/finance/approvals/ApprovalRulesTab.tsx` | Modify | 审批规则：企业专属规则增删 + 全局兜底规则 |

---

## Task 1: 订单列表 — 类型重命名 + 隐私化名称

**Files:**
- Modify: `src/pages/finance/approvals/index.tsx:38-43` (EVENT_LABELS)
- Modify: `src/pages/finance/approvals/index.tsx:81-86` (MOCK_ENTERPRISES)
- Modify: `src/pages/finance/approvals/index.tsx:119-120` (companyName)
- Modify: `src/pages/finance/approvals/index.tsx:130` (eventType title)
- Modify: `src/pages/finance/approvals/index.tsx:306` (列表标题)
- Modify: `src/pages/finance/approvals/index.tsx:386-388` (Tab label)

- [ ] **Step 1: 修改事件类型标签**

将 EVENT_LABELS 从审批视角改为公司视角：

```typescript
const EVENT_LABELS: Record<EventType, string> = {
  additional_investment: '追加投资',
  share_release: '增持股份',
};
```

- [ ] **Step 2: 隐私化 Mock 企业名称**

```typescript
const MOCK_ENTERPRISES = [
  { id: 'ENT001', name: '星辰科技', ownerId: 'U101', ownerUsername: 'zhang_wei', ownerNickname: '张伟' },
  { id: 'ENT002', name: '云帆网络', ownerId: 'U102', ownerUsername: 'li_na', ownerNickname: '李娜' },
  { id: 'ENT003', name: '山海集团', ownerId: 'U103', ownerUsername: 'wang_fang', ownerNickname: '王芳' },
  { id: 'ENT004', name: '天元控股', ownerId: 'U104', ownerUsername: 'chen_jie', ownerNickname: '陈杰' },
];
```

- [ ] **Step 3: 隐私化公司名称**

Mock 数据中的 companyName 从 `'滴滴答答'` 改为 `'蓝鲸投资'`。

- [ ] **Step 4: 文案统一更新**

- ALL_COLUMN_DEFS 中 `eventType` 的 title 从 `'事件类型'` 改为 `'订单类型'`
- 列表标题从 `'审批列表'` 改为 `'订单列表'`
- Tab label 从 `'审批列表'` 改为 `'订单列表'`
- 筛选器文案：`'全部类型'` 保留不变

- [ ] **Step 5: 验证编译通过**

Run: `cd /Users/miya/Documents/Project/group-admin-web && npx tsc --noEmit`

- [ ] **Step 6: Commit**

```bash
git add src/pages/finance/approvals/index.tsx
git commit -m "refactor: 审批改订单 — 类型重命名 + 隐私化名称"
```

---

## Task 2: 订单列表 — 新增字段 + 调整列顺序

**Files:**
- Modify: `src/pages/finance/approvals/index.tsx:46-78` (ApprovalRecord interface)
- Modify: `src/pages/finance/approvals/index.tsx:88-122` (MOCK_APPROVALS)
- Modify: `src/pages/finance/approvals/index.tsx:126-145` (ALL_COLUMN_DEFS)
- Modify: `src/pages/finance/approvals/index.tsx:218-237` (allColumnsMap)

### 数据模型说明

**字段语义对照（核心理解）：**

| 字段 | 追加投资含义 | 增持股份含义 |
|------|------------|------------|
| 金额 | 公司按占股比例支付的金额 (交易总金额 × 股份比例) | 增持部分的金额 (总股本预估金额 × 增持比例) |
| 交易总金额 | 本次追加投资的总盘子 | 当前总股本预估金额 |
| 股份比例 | 公司持股比例 | 增持的股份比例 |
| 历史总投资 | 对此公司历史追加投入及释放股份投入之和 | 同左 |
| 企业总资产 | 企业当前总资产 | 同左 |

- [ ] **Step 1: 更新 ApprovalRecord interface**

新增字段：

```typescript
interface ApprovalRecord {
  id: string;
  orderId: string;
  eventType: EventType;
  status: ApprovalStatus;
  orderStatus: 'success' | 'failed' | 'pending';  // 新增：订单执行状态

  sourceCompanyId: string;
  sourceCompanyName: string;
  sourceOwnerId: string;
  sourceOwnerUsername: string;
  sourceOwnerNickname: string;

  currency: string;          // 统一货币单位字段
  amount: number;            // 金额（公司实际支付）
  totalTransactionAmount: number;  // 交易总金额
  shareRatio: number;        // 股份比例
  historicalTotalInvest: number;   // 新增：历史总投资
  enterpriseTotalAssets: number;   // 新增：企业总资产

  createdAt: string;
  deadline: string;

  approvedByNickname?: string;
  approvedById?: string;
  approvedAt?: string;
  remark?: string;

  companyId: string;
  companyName: string;
}
```

注意：移除旧的条件字段（totalInvestAmount / investCurrency / investAmount / releaseRatio / totalShareValue / releaseCurrency / releaseAmount），统一为 currency / amount / totalTransactionAmount / shareRatio。

- [ ] **Step 2: 更新 Mock 数据生成**

```typescript
const MOCK_APPROVALS: ApprovalRecord[] = Array.from({ length: 20 }, (_, i) => {
  const ent = MOCK_ENTERPRISES[i % 4];
  const isInvest = i % 2 === 0;
  const statusPool: ApprovalStatus[] = ['pending', 'approved', 'rejected', 'auto_approved', 'timeout_rejected'];
  const status = statusPool[i % 5];
  const hasApprover = status === 'approved' || status === 'rejected';
  const day = String(20 - i).padStart(2, '0');

  // 订单状态：审批通过后才有执行结果
  const orderStatusPool: Array<'success' | 'failed' | 'pending'> =
    status === 'approved' ? ['success', 'failed'] : ['pending'];
  const orderStatus = status === 'approved'
    ? (i % 3 === 0 ? 'failed' : 'success')
    : 'pending';

  const currency = i % 3 === 0 ? 'PEA' : 'USDT';
  const totalTransactionAmount = isInvest ? 100000 + i * 5000 : 200000 + i * 10000;
  const shareRatio = isInvest ? 15 + (i % 20) : 5 + (i % 15);
  const amount = Math.round(totalTransactionAmount * shareRatio / 100);
  const historicalTotalInvest = 500000 + i * 20000;
  const enterpriseTotalAssets = 2000000 + i * 50000;

  return {
    id: `APR${String(i + 1).padStart(5, '0')}`,
    orderId: `ORD${String(20000 + i).padStart(8, '0')}`,
    eventType: isInvest ? 'additional_investment' : 'share_release',
    status,
    orderStatus,

    sourceCompanyId: ent.id,
    sourceCompanyName: ent.name,
    sourceOwnerId: ent.ownerId,
    sourceOwnerUsername: ent.ownerUsername,
    sourceOwnerNickname: ent.ownerNickname,

    currency,
    amount,
    totalTransactionAmount,
    shareRatio,
    historicalTotalInvest,
    enterpriseTotalAssets,

    createdAt: `2026-04-${day} ${String(9 + (i % 10)).padStart(2, '0')}:${String(i * 3 % 60).padStart(2, '0')}:00`,
    deadline: `2026-04-${String(Math.min(28, 20 - i + 3)).padStart(2, '0')} 18:00:00`,

    ...(hasApprover
      ? { approvedByNickname: 'Tom', approvedById: 'ADM001', approvedAt: `2026-04-${day} ${String(10 + (i % 8)).padStart(2, '0')}:30:00`, remark: status === 'rejected' ? '金额异常，需核实' : '' }
      : {}),

    companyId: 'COM001',
    companyName: '蓝鲸投资',
  };
});
```

- [ ] **Step 3: 新增订单状态常量**

```typescript
type OrderStatus = 'success' | 'failed' | 'pending';

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  success: '成功',
  failed: '失败',
  pending: '待执行',
};

const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  success: 'success',
  failed: 'error',
  pending: 'default',
};
```

- [ ] **Step 4: 更新 ALL_COLUMN_DEFS — 新列顺序**

```typescript
const ALL_COLUMN_DEFS: { key: string; title: string; defaultVisible: boolean }[] = [
  { key: 'createdAt', title: '订单时间', defaultVisible: true },
  { key: 'eventType', title: '订单类型', defaultVisible: true },
  { key: 'sourceCompanyName', title: '企业名称', defaultVisible: true },
  { key: 'sourceCompanyId', title: '企业ID', defaultVisible: true },
  { key: 'currency', title: '货币单位', defaultVisible: true },
  { key: 'amount', title: '金额', defaultVisible: true },
  { key: 'historicalTotalInvest', title: '历史总投资', defaultVisible: true },
  { key: 'enterpriseTotalAssets', title: '企业总资产', defaultVisible: true },
  { key: 'totalTransactionAmount', title: '交易总金额', defaultVisible: true },
  { key: 'shareRatio', title: '股份比例', defaultVisible: true },
  { key: 'status', title: '审批状态', defaultVisible: true },
  { key: 'orderStatus', title: '订单状态', defaultVisible: true },
  // 以下为隐藏列
  { key: 'orderId', title: '订单ID', defaultVisible: false },
  { key: 'deadline', title: '审批截止', defaultVisible: false },
  { key: 'companyName', title: '归属公司', defaultVisible: false },
  { key: 'companyId', title: '归属公司ID', defaultVisible: false },
  { key: 'sourceOwnerNickname', title: '企业主昵称', defaultVisible: false },
  { key: 'sourceOwnerId', title: '企业主ID', defaultVisible: false },
  { key: 'sourceOwnerUsername', title: '企业主用户名', defaultVisible: false },
  { key: 'approvedByNickname', title: '审批人昵称', defaultVisible: false },
  { key: 'approvedById', title: '审批人ID', defaultVisible: false },
  { key: 'approvedAt', title: '审批时间', defaultVisible: false },
  { key: 'remark', title: '备注', defaultVisible: false },
];
```

- [ ] **Step 5: 更新 allColumnsMap — 新增列渲染 + Tooltip**

需要在文件顶部新增 `import { Tooltip } from 'antd'` 和 `import { QuestionCircleOutlined } from '@ant-design/icons'`。

需要辅助函数用于带 Tooltip 的表头：

```typescript
const titleWithTip = (title: string, tip: string) => (
  <span>
    {title}{' '}
    <Tooltip title={tip}><QuestionCircleOutlined style={{ color: '#bfbfbf', fontSize: 12 }} /></Tooltip>
  </span>
);
```

更新 allColumnsMap 中新增/修改的列：

```typescript
const allColumnsMap: Record<string, ColumnsType<ApprovalRecord>[number]> = {
  createdAt: { title: '订单时间', dataIndex: 'createdAt', width: 170, sorter: (a: ApprovalRecord, b: ApprovalRecord) => a.createdAt.localeCompare(b.createdAt) },
  eventType: { title: '订单类型', dataIndex: 'eventType', width: 120, render: (v: EventType) => EVENT_LABELS[v] },
  sourceCompanyName: { title: '企业名称', dataIndex: 'sourceCompanyName', width: 120 },
  sourceCompanyId: { title: '企业ID', dataIndex: 'sourceCompanyId', width: 100 },
  currency: { title: '货币单位', dataIndex: 'currency', width: 90 },
  amount: {
    title: '金额', dataIndex: 'amount', width: 130,
    render: (v: number) => <Text style={{ whiteSpace: 'nowrap' }}>{v?.toLocaleString() ?? '-'}</Text>,
  },
  historicalTotalInvest: {
    title: titleWithTip('历史总投资', '对此公司历史追加投入及释放股份投入之和'),
    dataIndex: 'historicalTotalInvest', width: 160,
    render: (v: number) => <Text style={{ whiteSpace: 'nowrap' }}>{v?.toLocaleString() ?? '-'}</Text>,
  },
  enterpriseTotalAssets: {
    title: '企业总资产', dataIndex: 'enterpriseTotalAssets', width: 150,
    render: (v: number) => <Text style={{ whiteSpace: 'nowrap' }}>{v?.toLocaleString() ?? '-'}</Text>,
  },
  totalTransactionAmount: {
    title: titleWithTip('交易总金额', '追加投资：本次追加投资总金额；增持股份：当前总股本预估金额'),
    dataIndex: 'totalTransactionAmount', width: 170,
    render: (v: number) => <Text style={{ whiteSpace: 'nowrap' }}>{v?.toLocaleString() ?? '-'}</Text>,
  },
  shareRatio: {
    title: '股份比例', dataIndex: 'shareRatio', width: 100,
    render: (v: number) => `${v}%`,
  },
  status: { title: '审批状态', dataIndex: 'status', width: 100, render: (v: ApprovalStatus) => <Tag color={STATUS_COLORS[v]}>{STATUS_LABELS[v]}</Tag> },
  orderStatus: {
    title: '订单状态', dataIndex: 'orderStatus', width: 100,
    render: (v: OrderStatus) => <Tag color={ORDER_STATUS_COLORS[v]}>{ORDER_STATUS_LABELS[v]}</Tag>,
  },
  // 隐藏列保持不变...
  orderId: { title: '订单ID', dataIndex: 'orderId', width: 140 },
  deadline: { title: '审批截止', dataIndex: 'deadline', width: 170 },
  companyName: { title: '归属公司', dataIndex: 'companyName', width: 100 },
  companyId: { title: '归属公司ID', dataIndex: 'companyId', width: 110 },
  sourceOwnerNickname: { title: '企业主昵称', dataIndex: 'sourceOwnerNickname', width: 100 },
  sourceOwnerId: { title: '企业主ID', dataIndex: 'sourceOwnerId', width: 90 },
  sourceOwnerUsername: { title: '企业主用户名', dataIndex: 'sourceOwnerUsername', width: 120 },
  approvedByNickname: { title: '审批人昵称', dataIndex: 'approvedByNickname', width: 100, render: (v?: string) => v || '-' },
  approvedById: { title: '审批人ID', dataIndex: 'approvedById', width: 100, render: (v?: string) => v || '-' },
  approvedAt: { title: '审批时间', dataIndex: 'approvedAt', width: 170, render: (v?: string) => v || '-' },
  remark: { title: '备注', dataIndex: 'remark', width: 140, render: (v?: string) => v || '-' },
};
```

- [ ] **Step 6: 移除旧的 getAmount / getCurrency 辅助函数**

这两个函数（lines 208-216）不再需要，因为 amount 和 currency 现在是直接字段。删除它们。

- [ ] **Step 7: 更新详情弹窗**

更新 Modal 内的 Descriptions，使用统一字段结构：

```tsx
<Descriptions.Item label="订单类型">{EVENT_LABELS[currentRecord.eventType]}</Descriptions.Item>
<Descriptions.Item label="企业名称">{currentRecord.sourceCompanyName}</Descriptions.Item>
<Descriptions.Item label="企业ID">{currentRecord.sourceCompanyId}</Descriptions.Item>
<Descriptions.Item label="货币单位">{currentRecord.currency}</Descriptions.Item>
<Descriptions.Item label="金额">{currentRecord.amount?.toLocaleString()} {currentRecord.currency}</Descriptions.Item>
<Descriptions.Item label="历史总投资">{currentRecord.historicalTotalInvest?.toLocaleString()} {currentRecord.currency}</Descriptions.Item>
<Descriptions.Item label="企业总资产">{currentRecord.enterpriseTotalAssets?.toLocaleString()} {currentRecord.currency}</Descriptions.Item>
<Descriptions.Item label="交易总金额">{currentRecord.totalTransactionAmount?.toLocaleString()} {currentRecord.currency}</Descriptions.Item>
<Descriptions.Item label="股份比例">{currentRecord.shareRatio}%</Descriptions.Item>
<Descriptions.Item label="审批状态"><Tag color={STATUS_COLORS[currentRecord.status]}>{STATUS_LABELS[currentRecord.status]}</Tag></Descriptions.Item>
<Descriptions.Item label="订单状态"><Tag color={ORDER_STATUS_COLORS[currentRecord.orderStatus]}>{ORDER_STATUS_LABELS[currentRecord.orderStatus]}</Tag></Descriptions.Item>
```

移除旧的 `eventType === 'additional_investment'` / `share_release` 条件分支。

- [ ] **Step 8: 更新筛选器 — 新增订单状态筛选**

在审批状态 Radio.Group 后面增加订单状态筛选。需要新增状态：

```typescript
const [orderStatusFilter, setOrderStatusFilter] = useState<string | undefined>();
```

筛选 Radio.Group：

```tsx
<ConfigProvider theme={radioTheme}>
  <Radio.Group
    value={orderStatusFilter ?? '全部'}
    onChange={(e) => setOrderStatusFilter(e.target.value === '全部' ? undefined : e.target.value)}
    buttonStyle="solid"
  >
    {[{ value: '全部', label: '全部订单状态' }, ...Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({ value, label }))].map((item) => (
      <Radio.Button key={item.value} value={item.value}>{item.label}</Radio.Button>
    ))}
  </Radio.Group>
</ConfigProvider>
```

在 filtered useMemo 中新增过滤条件：

```typescript
if (orderStatusFilter && r.orderStatus !== orderStatusFilter) return false;
```

- [ ] **Step 9: 验证编译通过**

Run: `cd /Users/miya/Documents/Project/group-admin-web && npx tsc --noEmit`

- [ ] **Step 10: Commit**

```bash
git add src/pages/finance/approvals/index.tsx
git commit -m "feat: 订单列表 — 新增字段、调整列顺序、Tooltip 描述"
```

---

## Task 3: 审批规则改造 — 企业专属规则 + 全局兜底规则

**Files:**
- Modify: `src/pages/finance/approvals/ApprovalRulesTab.tsx` (整个文件重构)

### 设计说明

**结构：**
- 上半部分：企业专属规则列表（可新增、可删除）
- 下半部分：兜底全局规则（1 条，不可删除，默认停用）
- 全局规则支持 PEA 和 USDT 两种货币分别配置阈值
- 企业专属规则优先级高于全局兜底规则

- [ ] **Step 1: 更新数据结构**

```typescript
// 企业专属规则
interface EnterpriseRule {
  enterpriseId: string;
  enterpriseName: string;
  currency: string;
  amountLimit: number | null;
  totalInvestLimit: number | null;
  enabled: boolean;
  updatedAt: string;
}

// 全局兜底规则 — 每种货币独立配置
interface GlobalRuleItem {
  currency: string;
  amountLimit: number | null;
  totalInvestLimit: number | null;
}

interface GlobalRule {
  enabled: boolean;
  updatedAt: string;
  items: GlobalRuleItem[];
}
```

- [ ] **Step 2: 更新 Mock 数据**

```typescript
const initialEnterpriseRules: EnterpriseRule[] = [
  {
    enterpriseId: 'ENT001', enterpriseName: '星辰科技', currency: 'USDT',
    amountLimit: 10000, totalInvestLimit: 500000,
    enabled: true, updatedAt: '2026-04-10 14:30:00',
  },
  {
    enterpriseId: 'ENT002', enterpriseName: '云帆网络', currency: 'PEA',
    amountLimit: 5000000, totalInvestLimit: 200000000,
    enabled: false, updatedAt: '2026-04-08 09:00:00',
  },
];

const initialGlobalRule: GlobalRule = {
  enabled: false,
  updatedAt: '',
  items: [
    { currency: 'PEA', amountLimit: null, totalInvestLimit: null },
    { currency: 'USDT', amountLimit: null, totalInvestLimit: null },
  ],
};
```

- [ ] **Step 3: 重写组件状态**

```typescript
const ApprovalRulesTab: React.FC = () => {
  const [enterpriseRules, setEnterpriseRules] = useState<EnterpriseRule[]>(initialEnterpriseRules);
  const [globalRule, setGlobalRule] = useState<GlobalRule>(initialGlobalRule);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<EnterpriseRule | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [globalModalOpen, setGlobalModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [addForm] = Form.useForm();
  const [globalForm] = Form.useForm();
  const containerRef = useRef<HTMLDivElement>(null);
```

- [ ] **Step 4: 实现企业规则表格列定义**

表格去掉 ≤ 符号，文案中"上限"已表达含义：

```typescript
const enterpriseColumns: ColumnsType<EnterpriseRule> = [
  {
    title: '更新时间', dataIndex: 'updatedAt', width: 170,
    sorter: (a, b) => a.updatedAt.localeCompare(b.updatedAt),
    render: (v: string) => v || '—',
  },
  { title: '企业名称', dataIndex: 'enterpriseName', width: 140 },
  { title: '企业ID', dataIndex: 'enterpriseId', width: 100 },
  { title: '币种', dataIndex: 'currency', width: 80 },
  {
    title: '单笔自动通过上限', width: 180,
    render: (_: unknown, r: EnterpriseRule) =>
      r.amountLimit != null ? `${r.amountLimit.toLocaleString()} ${r.currency}` : '—',
  },
  {
    title: '总投入金额上限', width: 180,
    render: (_: unknown, r: EnterpriseRule) =>
      r.totalInvestLimit != null ? `${r.totalInvestLimit.toLocaleString()} ${r.currency}` : '—',
  },
  {
    title: '启用', dataIndex: 'enabled', width: 80, align: 'center' as const,
    render: (_: unknown, record: EnterpriseRule) => (
      <Switch size="small" checked={record.enabled} onChange={() => handleToggle(record)} />
    ),
  },
  {
    title: '操作', width: 120, fixed: 'right' as const,
    render: (_: unknown, record: EnterpriseRule) => (
      <Space size={4}>
        <Button type="link" size="small" onClick={() => handleEdit(record)}>编辑</Button>
        <Button type="link" size="small" danger onClick={() => handleDelete(record)}>删除</Button>
      </Space>
    ),
  },
];
```

- [ ] **Step 5: 实现增删改操作**

```typescript
// 删除企业规则
const handleDelete = (rule: EnterpriseRule) => {
  Modal.confirm({
    title: '确认删除',
    content: `确认删除 ${rule.enterpriseName} 的审批规则？`,
    okText: '确认删除',
    okButtonProps: { danger: true },
    cancelText: '取消',
    onOk: () => {
      setEnterpriseRules((prev) => prev.filter((r) => r.enterpriseId !== rule.enterpriseId));
      message.success('已删除');
    },
  });
};

// 新增企业规则
const handleAdd = () => {
  addForm.validateFields().then((values) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const newRule: EnterpriseRule = {
      enterpriseId: values.enterpriseId,
      enterpriseName: values.enterpriseName,
      currency: values.currency,
      amountLimit: values.amountLimit,
      totalInvestLimit: values.totalInvestLimit,
      enabled: false,
      updatedAt: now,
    };
    setEnterpriseRules((prev) => [...prev, newRule]);
    message.success('已新增');
    setAddModalOpen(false);
    addForm.resetFields();
  });
};
```

- [ ] **Step 6: 实现全局兜底规则 UI**

全局规则区域放在企业规则表格下方，用单独的 Card：

```tsx
<Card
  bordered={false}
  style={{ borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW, marginTop: 16 }}
>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
    <div>
      <Text style={{ fontSize: 14, fontWeight: 600 }}>兜底全局规则</Text>
      <Text style={{ fontSize: 12, color: '#8c8c8c', marginLeft: 8 }}>
        对未配置专属规则的企业生效，不可删除
      </Text>
    </div>
    <Space>
      <Switch
        size="small"
        checked={globalRule.enabled}
        onChange={handleGlobalToggle}
      />
      <Button type="link" size="small" onClick={() => openGlobalEdit()}>编辑</Button>
    </Space>
  </div>
  <Table
    columns={globalColumns}
    dataSource={globalRule.items}
    rowKey="currency"
    size="middle"
    pagination={false}
    rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
  />
</Card>
```

全局规则表格列：

```typescript
const globalColumns: ColumnsType<GlobalRuleItem> = [
  { title: '币种', dataIndex: 'currency', width: 80 },
  {
    title: '单笔自动通过上限', width: 200,
    render: (_: unknown, r: GlobalRuleItem) =>
      r.amountLimit != null ? `${r.amountLimit.toLocaleString()} ${r.currency}` : '—',
  },
  {
    title: '总投入金额上限', width: 200,
    render: (_: unknown, r: GlobalRuleItem) =>
      r.totalInvestLimit != null ? `${r.totalInvestLimit.toLocaleString()} ${r.currency}` : '—',
  },
];
```

- [ ] **Step 7: 实现全局规则编辑弹窗**

弹窗中展示 PEA 和 USDT 两组输入框：

```tsx
<Modal
  title="编辑全局兜底规则"
  open={globalModalOpen}
  onCancel={() => setGlobalModalOpen(false)}
  width={520}
  footer={[
    <Button key="cancel" onClick={() => setGlobalModalOpen(false)}>取消</Button>,
    <Button key="save" type="primary" ghost onClick={() => handleGlobalSave(false)}>保存</Button>,
    <Button key="saveAndEnable" type="primary" onClick={() => handleGlobalSave(true)}>保存并启用</Button>,
  ]}
>
  <Form form={globalForm} layout="vertical" style={{ marginTop: 16 }}>
    {globalRule.items.map((item, idx) => (
      <div key={item.currency}>
        <Text style={{ fontWeight: 600, fontSize: 13 }}>{item.currency}</Text>
        <div style={{ display: 'flex', gap: 12, marginTop: 8, marginBottom: 16 }}>
          <Form.Item
            name={['items', idx, 'amountLimit']}
            label={`单笔自动通过上限（${item.currency}）`}
            rules={[{ required: true, message: '请输入' }]}
            style={{ flex: 1 }}
          >
            <InputNumber placeholder="例：10000" style={{ width: '100%' }} min={1} precision={2} />
          </Form.Item>
          <Form.Item
            name={['items', idx, 'totalInvestLimit']}
            label={`总投入金额上限（${item.currency}）`}
            rules={[{ required: true, message: '请输入' }]}
            style={{ flex: 1 }}
          >
            <InputNumber placeholder="例：500000" style={{ width: '100%' }} min={1} precision={2} />
          </Form.Item>
        </div>
      </div>
    ))}
  </Form>
</Modal>
```

- [ ] **Step 8: 实现全局规则操作逻辑**

```typescript
const handleGlobalToggle = () => {
  const next = !globalRule.enabled;
  if (next && globalRule.items.some((item) => item.amountLimit == null || item.totalInvestLimit == null)) {
    message.warning('请先配置所有币种的规则后再启用');
    return;
  }
  setGlobalRule((prev) => ({
    ...prev,
    enabled: next,
    updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
  }));
  message.success(next ? '已启用' : '已停用');
};

const openGlobalEdit = () => {
  globalForm.setFieldsValue({
    items: globalRule.items.map((item) => ({
      amountLimit: item.amountLimit,
      totalInvestLimit: item.totalInvestLimit,
    })),
  });
  setGlobalModalOpen(true);
};

const handleGlobalSave = (andEnable = false) => {
  globalForm.validateFields().then((values) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    setGlobalRule((prev) => ({
      enabled: andEnable ? true : prev.enabled,
      updatedAt: now,
      items: prev.items.map((item, idx) => ({
        ...item,
        amountLimit: values.items[idx].amountLimit,
        totalInvestLimit: values.items[idx].totalInvestLimit,
      })),
    }));
    message.success(andEnable ? '已保存并启用' : '已保存');
    setGlobalModalOpen(false);
  });
};
```

- [ ] **Step 9: 实现新增企业规则弹窗**

```tsx
<Modal
  title="新增企业规则"
  open={addModalOpen}
  onCancel={() => { setAddModalOpen(false); addForm.resetFields(); }}
  onOk={handleAdd}
  width={480}
>
  <Form form={addForm} layout="vertical" style={{ marginTop: 16 }}>
    <Form.Item name="enterpriseId" label="企业ID" rules={[{ required: true, message: '请输入企业ID' }]}>
      <Input placeholder="例：ENT005" />
    </Form.Item>
    <Form.Item name="enterpriseName" label="企业名称" rules={[{ required: true, message: '请输入企业名称' }]}>
      <Input placeholder="例：新企业" />
    </Form.Item>
    <Form.Item name="currency" label="币种" rules={[{ required: true, message: '请选择币种' }]}>
      <Select options={[{ value: 'PEA', label: 'PEA' }, { value: 'USDT', label: 'USDT' }]} />
    </Form.Item>
    <Form.Item name="amountLimit" label="单笔自动通过上限" rules={[{ required: true, message: '请输入' }]}>
      <InputNumber placeholder="例：10000" style={{ width: '100%' }} min={1} precision={2} />
    </Form.Item>
    <Form.Item name="totalInvestLimit" label="总投入金额上限" rules={[{ required: true, message: '请输入' }]}>
      <InputNumber placeholder="例：500000" style={{ width: '100%' }} min={1} precision={2} />
    </Form.Item>
  </Form>
</Modal>
```

- [ ] **Step 10: 组装完整 return JSX**

企业规则区域需要工具栏包含"新增"按钮：

```tsx
return (
  <div ref={containerRef}>
    <Card bordered={false} style={{ borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ fontSize: 14, fontWeight: 600 }}>企业专属规则</Text>
        <Space>
          <Button type="primary" size="small" onClick={() => setAddModalOpen(true)}>新增规则</Button>
          <TableToolbar onRefresh={handleRefresh} containerRef={containerRef} />
        </Space>
      </div>
      <div style={{ marginBottom: 16, fontSize: 12, color: '#8c8c8c' }}>
        每个企业一条规则，优先级高于全局兜底规则。单笔申请金额在上限内时自动通过；累计投入超过总投入上限后，所有申请均需人工审批。
      </div>
      <Table
        columns={enterpriseColumns}
        dataSource={enterpriseRules}
        rowKey="enterpriseId"
        size="middle"
        scroll={{ x: 1100 }}
        pagination={false}
        rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
      />
    </Card>

    {/* 全局兜底规则 */}
    {/* ... Step 6 的 Card */}

    {/* 编辑企业规则弹窗 — 保持现有逻辑 */}
    {/* 新增企业规则弹窗 — Step 9 */}
    {/* 全局规则编辑弹窗 — Step 7 */}
  </div>
);
```

- [ ] **Step 11: 更新说明文案，去掉 ≤ 符号**

规则说明从：
> 每个企业仅一条规则，金额以企业绑定币种为单位。单笔申请金额 ≤ 单笔上限时自动通过；累计投入超过总投入上限后，所有申请均需人工审批。未配置金额的企业无法启用。

改为：
> 每个企业一条规则，优先级高于全局兜底规则。单笔申请金额在上限内时自动通过；累计投入超过总投入上限后，所有申请均需人工审批。

- [ ] **Step 12: 需要额外 import**

文件顶部新增：

```typescript
import {
  Button, Card, Form, Input, InputNumber, Modal, Select,
  Space, Switch, Table, Typography, message,
} from 'antd';
```

- [ ] **Step 13: 验证编译通过**

Run: `cd /Users/miya/Documents/Project/group-admin-web && npx tsc --noEmit`

- [ ] **Step 14: Commit**

```bash
git add src/pages/finance/approvals/ApprovalRulesTab.tsx
git commit -m "feat: 审批规则改造 — 企业专属规则增删 + 全局兜底规则(PEA/USDT)"
```

---

## Task 4: 文档同步

**Files:**
- Modify: `doc/page_map.md`
- Modify: `doc/changelog.md`

- [ ] **Step 1: 更新 page_map.md**

更新投资审批页面的字段清单，反映新的列顺序和字段名。Tab 名称从"审批列表"改为"订单列表"。

- [ ] **Step 2: 更新 changelog.md**

追加条目：

```markdown
### 2026-04-21 — 投资审批改造为订单模块

- 审批列表 → 订单列表：新增历史总投资、企业总资产、交易总金额、股份比例、订单状态字段
- 订单类型重命名：持股企业追加投资 → 追加投资，持股企业释放股份 → 增持股份
- 历史总投资、交易总金额列表头增加 Tooltip 字段描述
- 审批规则改造：支持企业专属规则新增/删除 + 全局兜底规则（PEA/USDT 分别配置）
- 全局兜底规则不可删除、默认停用，企业专属规则优先级更高
- 规则展示去掉 ≤ 符号
- 隐私化：企业和公司名称改为虚构名称
```

- [ ] **Step 3: Commit**

```bash
git add doc/page_map.md doc/changelog.md
git commit -m "docs: 同步订单改造变更到 page_map + changelog"
```
