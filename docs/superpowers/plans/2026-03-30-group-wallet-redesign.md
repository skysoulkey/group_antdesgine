# 集团钱包改造 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将集团钱包页从自助转账模式改造为绑定账号+审批流模式，移除通讯录/二维码/图表/税费计算，新增两步式入金/出金弹窗（含MFA）和修改绑定账号独立页。

**Architecture:** 仅修改前端 mock，无真实 API 调用。钱包主页全量重写，新增 bind-account 子页面。入金/出金弹窗采用受控步骤（step state）实现两步流程，不依赖 Steps 组件，直接用条件渲染切换内容。

**Tech Stack:** React 18, Umi 4, Ant Design 5, TypeScript, dayjs

---

## 文件范围

| 操作 | 文件 | 说明 |
|------|------|------|
| 修改（全量重写） | `src/pages/finance/wallet/index.tsx` | 钱包主页 |
| 新增 | `src/pages/finance/wallet/bind-account.tsx` | 修改绑定账号页 |
| 修改 | `.umirc.ts` | 新增 bind-account 路由 |
| 修改 | `src/layouts/index.tsx` | 新增 bind-account 面包屑 |
| 修改 | `src/utils/auth.ts` | 新增 bind-account 权限 |

---

### Task 1: 数据类型 & Mock 数据

**Files:**
- Modify: `src/pages/finance/wallet/index.tsx`（仅顶部数据层，不动 JSX）

- [ ] **Step 1: 替换旧数据类型，定义新类型**

删除文件顶部的 `AddressItem`、`TransferRow`、`DepositRow` 接口以及对应 mock 数组（`addressBook`、`transferData`、`depositData`）、`monthlyData`、`TAX_RATE`、`TAX_EXEMPT`、`calcFee`。

替换为：

```typescript
// ── 绑定账号（从外部平台同步，mock 硬编码）────────────────────────
interface BoundAccount {
  accountId: string;
  accountName: string;
  platform: string;
  syncedAt: string;
}

const mockBoundAccount: BoundAccount = {
  accountId: 'UHBOWunhfi8974nnf',
  accountName: 'Miya（@miya_sg）',
  platform: 'UU Talk Platform',
  syncedAt: '2026-03-30 10:00:00',
};

// ── 订单记录 ──────────────────────────────────────────────────────
const ORDER_TYPES = ['入金', '出金'] as const;
const ORDER_STATUSES = ['待审批', '成功', '失败'] as const;
type OrderType = typeof ORDER_TYPES[number];
type OrderStatus = typeof ORDER_STATUSES[number];

interface OrderRecord {
  id: string;
  startTime: string;
  endTime: string;
  orderId: string;
  type: OrderType;
  currency: 'USDT' | 'PEA';
  amount: number;
  status: OrderStatus;
  remark: string;
}
```

- [ ] **Step 2: 生成 mock 订单数据（覆盖全状态）**

```typescript
const mockOrders: OrderRecord[] = [
  { id: '1',  startTime: '2026-03-01 09:12:00', endTime: '2026-03-01 09:12:05', orderId: 'ORD0000001', type: '入金', currency: 'USDT', amount: 50000,   status: '成功',   remark: '首次入金' },
  { id: '2',  startTime: '2026-03-02 10:30:00', endTime: '2026-03-02 10:30:02', orderId: 'ORD0000002', type: '入金', currency: 'PEA',  amount: 200000,  status: '成功',   remark: '' },
  { id: '3',  startTime: '2026-03-03 14:00:00', endTime: '2026-03-03 14:00:01', orderId: 'ORD0000003', type: '入金', currency: 'USDT', amount: 10000,   status: '失败',   remark: '余额不足' },
  { id: '4',  startTime: '2026-03-05 09:00:00', endTime: '',                    orderId: 'ORD0000004', type: '出金', currency: 'USDT', amount: 30000,   status: '待审批', remark: '3月运营提现' },
  { id: '5',  startTime: '2026-03-06 11:20:00', endTime: '2026-03-07 15:00:00', orderId: 'ORD0000005', type: '出金', currency: 'PEA',  amount: 80000,   status: '成功',   remark: '' },
  { id: '6',  startTime: '2026-03-08 16:45:00', endTime: '2026-03-09 10:00:00', orderId: 'ORD0000006', type: '出金', currency: 'USDT', amount: 15000,   status: '失败',   remark: '账号异常' },
  { id: '7',  startTime: '2026-03-10 08:30:00', endTime: '2026-03-10 08:30:03', orderId: 'ORD0000007', type: '入金', currency: 'USDT', amount: 100000,  status: '成功',   remark: '' },
  { id: '8',  startTime: '2026-03-12 13:00:00', endTime: '',                    orderId: 'ORD0000008', type: '出金', currency: 'PEA',  amount: 50000,   status: '待审批', remark: '季度结算' },
  { id: '9',  startTime: '2026-03-15 10:10:00', endTime: '2026-03-15 10:10:02', orderId: 'ORD0000009', type: '入金', currency: 'PEA',  amount: 300000,  status: '成功',   remark: '追加入金' },
  { id: '10', startTime: '2026-03-18 09:00:00', endTime: '',                    orderId: 'ORD0000010', type: '出金', currency: 'USDT', amount: 25000,   status: '待审批', remark: '' },
  { id: '11', startTime: '2026-03-20 14:30:00', endTime: '2026-03-20 14:30:04', orderId: 'ORD0000011', type: '入金', currency: 'USDT', amount: 75000,   status: '成功',   remark: '月中补充' },
  { id: '12', startTime: '2026-03-22 11:00:00', endTime: '2026-03-23 09:00:00', orderId: 'ORD0000012', type: '出金', currency: 'USDT', amount: 40000,   status: '失败',   remark: '' },
];
```

- [ ] **Step 3: 保留 BALANCE 常量，更新组件 state 初始值**

保留文件顶部：
```typescript
const CARD_SHADOW = '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)';
const BALANCE_USDT = 341_234_234.00;
const BALANCE_PEA  = 341_234_234.00;
```

删除 `CURRENT_BALANCE = 178283.09`（不再用到）。

- [ ] **Step 4: 提交**

```bash
git add src/pages/finance/wallet/index.tsx
git commit -m "refactor: 钱包页数据层 — 替换为新类型和 mock 订单数据"
```

---

### Task 2: 页面结构 — 余额卡片 + 绑定账号卡片

**Files:**
- Modify: `src/pages/finance/wallet/index.tsx`（JSX 顶部区域）

- [ ] **Step 1: 更新组件 state 声明**

删除旧 state（`depositOpen`、`withdrawOpen`、`withdrawAmt`、`currencyFilter`、`transferDateRange`、`depositForm`、`withdrawForm`），替换为：

```typescript
const WalletPage: React.FC = () => {
  const navigate = useNavigate(); // import from 'umi'

  // 绑定账号（可被修改页更新，mock 用 state 持有）
  const [boundAccount, setBoundAccount] = useState<BoundAccount>(mockBoundAccount);

  // 弹窗控制
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [depositStep, setDepositStep] = useState<1 | 2>(1);
  const [withdrawStep, setWithdrawStep] = useState<1 | 2>(1);

  // 弹窗表单
  const [depositForm] = Form.useForm();
  const [withdrawForm] = Form.useForm();

  // 订单列表 state（含新增）
  const [orders, setOrders] = useState<OrderRecord[]>(mockOrders);

  // 筛选
  const [typeFilter, setTypeFilter] = useState<string>('全部');
  const [statusFilter, setStatusFilter] = useState<string>('全部');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
```

- [ ] **Step 2: 写余额卡片 + 绑定账号卡片 JSX**

`return` 内容替换为（完整 JSX，仅顶部区域，弹窗和表格后续任务补充）：

```tsx
return (
  <div>
    {/* ── 余额卡片 ──────────────────────────────────────────────── */}
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
      <Col xs={24} sm={12}>
        <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: '#722ed118', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <WalletOutlined style={{ fontSize: 22, color: '#722ed1' }} />
            </div>
            <Text style={{ fontSize: 14, color: 'rgba(0,0,0,0.55)', fontWeight: 500 }}>USDT 余额</Text>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#141414', letterSpacing: -1 }}>
            {BALANCE_USDT.toLocaleString('en', { minimumFractionDigits: 2 })}
          </div>
        </Card>
      </Col>
      <Col xs={24} sm={12}>
        <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: '#722ed118', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <WalletOutlined style={{ fontSize: 22, color: '#722ed1' }} />
            </div>
            <Text style={{ fontSize: 14, color: 'rgba(0,0,0,0.55)', fontWeight: 500 }}>PEA 余额</Text>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#141414', letterSpacing: -1 }}>
            {BALANCE_PEA.toLocaleString('en', { minimumFractionDigits: 2 })}
          </div>
        </Card>
      </Col>
    </Row>

    {/* ── 绑定账号卡片 ──────────────────────────────────────────── */}
    <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Text type="secondary" style={{ fontSize: 12 }}>绑定账号</Text>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <Text style={{ fontSize: 16, fontWeight: 600 }}>{boundAccount.accountName}</Text>
            <Text type="secondary" style={{ fontSize: 12, fontFamily: 'monospace' }}>{boundAccount.accountId}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{boundAccount.platform}</Text>
          </div>
          <div style={{ marginTop: 6 }}>
            <Button
              type="link"
              size="small"
              style={{ padding: 0, fontSize: 12 }}
              onClick={() => navigate('/finance/wallet/bind-account')}
            >
              修改绑定账号 →
            </Button>
          </div>
        </div>
        <Space size={8}>
          <Button
            type="primary"
            style={{ background: '#722ed1', borderColor: '#722ed1' }}
            onClick={() => { setDepositStep(1); depositForm.resetFields(); setDepositOpen(true); }}
          >
            入金
          </Button>
          <Button
            style={{ borderColor: '#722ed1', color: '#722ed1' }}
            onClick={() => { setWithdrawStep(1); withdrawForm.resetFields(); setWithdrawOpen(true); }}
          >
            出金
          </Button>
        </Space>
      </div>
    </Card>

    {/* 订单记录卡片 — Task 3 填充 */}

    {/* 弹窗 — Task 4 & 5 填充 */}
  </div>
);
```

- [ ] **Step 3: 更新 import 列表**

文件顶部 import 替换为：

```typescript
import { WalletOutlined } from '@ant-design/icons';
import {
  Button, Card, Col, DatePicker, Descriptions, Divider,
  Form, Input, InputNumber, message, Modal, Row,
  Select, Space, Table, Tag, Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { useNavigate } from 'umi';
```

- [ ] **Step 4: 验证页面可编译，余额卡片和绑定账号卡片正常渲染**

```bash
# 确认无 TypeScript 报错
```

- [ ] **Step 5: 提交**

```bash
git add src/pages/finance/wallet/index.tsx
git commit -m "refactor: 钱包页顶部 — 余额卡片 + 绑定账号卡片"
```

---

### Task 3: 订单记录表格

**Files:**
- Modify: `src/pages/finance/wallet/index.tsx`（订单卡片区域）

- [ ] **Step 1: 计算 filteredOrders**

在组件内（`return` 之前）添加：

```typescript
const filteredOrders = orders.filter((r) => {
  const matchType = typeFilter === '全部' || r.type === typeFilter;
  const matchStatus = statusFilter === '全部' || r.status === statusFilter;
  const matchDate =
    !dateRange || !dateRange[0] || !dateRange[1] ||
    (!dayjs(r.startTime).isBefore(dateRange[0].startOf('day')) &&
     !dayjs(r.startTime).isAfter(dateRange[1].endOf('day')));
  return matchType && matchStatus && matchDate;
});
```

- [ ] **Step 2: 定义表格列**

```typescript
const statusColorMap: Record<OrderStatus, string> = {
  '待审批': 'warning',
  '成功':   'success',
  '失败':   'error',
};

const orderColumns: ColumnsType<OrderRecord> = [
  { title: '发起时间', dataIndex: 'startTime', width: 160 },
  { title: '结束时间', dataIndex: 'endTime',   width: 160, render: (v) => v || '—' },
  { title: '订单号',   dataIndex: 'orderId',   width: 120 },
  {
    title: '类型', dataIndex: 'type', width: 80,
    render: (v: OrderType) => <Tag color={v === '入金' ? 'blue' : 'orange'}>{v}</Tag>,
  },
  { title: '币种', dataIndex: 'currency', width: 70 },
  {
    title: '金额', dataIndex: 'amount', width: 130, align: 'right',
    render: (v: number) => (
      <span style={{ fontWeight: 400, color: '#141414' }}>
        {v.toLocaleString('en', { minimumFractionDigits: 2 })}
      </span>
    ),
  },
  {
    title: '状态', dataIndex: 'status', width: 90,
    render: (v: OrderStatus) => <Tag color={statusColorMap[v]}>{v}</Tag>,
  },
  { title: '备注', dataIndex: 'remark', ellipsis: true, render: (v) => v || '—' },
];
```

- [ ] **Step 3: 在 JSX 中填充订单记录卡片**

将 `{/* 订单记录卡片 — Task 3 填充 */}` 替换为：

```tsx
{/* ── 订单记录 ────────────────────────────────────────────────── */}
<Card
  bordered={false}
  style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}
  title="订单记录"
  extra={
    <Space wrap>
      <Select
        value={typeFilter}
        onChange={setTypeFilter}
        style={{ width: 110 }}
        options={[
          { value: '全部', label: '全部类型' },
          { value: '入金', label: '入金' },
          { value: '出金', label: '出金' },
        ]}
      />
      <Select
        value={statusFilter}
        onChange={setStatusFilter}
        style={{ width: 110 }}
        options={[
          { value: '全部', label: '全部状态' },
          { value: '待审批', label: '待审批' },
          { value: '成功',   label: '成功' },
          { value: '失败',   label: '失败' },
        ]}
      />
      <DatePicker.RangePicker
        style={{ width: 240 }}
        placeholder={['开始时间', '结束时间']}
        onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null] | null)}
      />
    </Space>
  }
>
  <Table
    columns={orderColumns}
    dataSource={filteredOrders}
    rowKey="id"
    size="middle"
    scroll={{ x: 1000 }}
    pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
    rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
  />
</Card>
```

- [ ] **Step 4: 验证 12 条 mock 数据渲染正确，筛选功能可用**

- [ ] **Step 5: 提交**

```bash
git add src/pages/finance/wallet/index.tsx
git commit -m "feat: 钱包页订单记录表格 — 统一入金/出金，支持类型/状态/日期筛选"
```

---

### Task 4: 入金弹窗（两步 + MFA）

**Files:**
- Modify: `src/pages/finance/wallet/index.tsx`（弹窗区域）

- [ ] **Step 1: 将 `{/* 弹窗 — Task 4 & 5 填充 */}` 替换为入金弹窗**

```tsx
{/* ── 入金弹窗 ─────────────────────────────────────────────────── */}
<Modal
  title={depositStep === 1 ? '入金' : '确认信息'}
  open={depositOpen}
  onCancel={() => setDepositOpen(false)}
  footer={null}
  width={480}
  destroyOnClose
>
  {depositStep === 1 ? (
    <Form form={depositForm} layout="vertical" style={{ marginTop: 16 }}>
      {/* 绑定账号只读 */}
      <Form.Item label="绑定账号">
        <div style={{ background: '#fafafa', border: '1px solid #d9d9d9', borderRadius: 6, padding: '6px 12px', fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{boundAccount.accountName}（{boundAccount.accountId}）</span>
          <Button
            type="link"
            size="small"
            style={{ padding: 0, fontSize: 12 }}
            onClick={() => { setDepositOpen(false); navigate('/finance/wallet/bind-account'); }}
          >
            修改 →
          </Button>
        </div>
      </Form.Item>
      <Form.Item label="币种" name="currency" initialValue="USDT" rules={[{ required: true }]}>
        <Select options={[{ value: 'USDT', label: 'USDT' }, { value: 'PEA', label: 'PEA' }]} />
      </Form.Item>
      <Form.Item label="金额" name="amount" rules={[{ required: true, message: '请输入金额' }]}>
        <InputNumber style={{ width: '100%' }} min={0.01} precision={2} placeholder="请输入入金金额" />
      </Form.Item>
      <Form.Item label="备注" name="remark">
        <Input.TextArea rows={2} placeholder="选填，不超过50字" maxLength={50} showCount />
      </Form.Item>
      <div style={{ textAlign: 'right', marginTop: 8 }}>
        <Space>
          <Button onClick={() => setDepositOpen(false)}>取消</Button>
          <Button
            type="primary"
            style={{ background: '#722ed1', borderColor: '#722ed1' }}
            onClick={() => depositForm.validateFields().then(() => setDepositStep(2))}
          >
            下一步
          </Button>
        </Space>
      </div>
    </Form>
  ) : (
    <div style={{ marginTop: 16 }}>
      <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
        <Descriptions.Item label="绑定账号">{boundAccount.accountName}（{boundAccount.accountId}）</Descriptions.Item>
        <Descriptions.Item label="类型"><Tag color="blue">入金</Tag></Descriptions.Item>
        <Descriptions.Item label="币种">{depositForm.getFieldValue('currency')}</Descriptions.Item>
        <Descriptions.Item label="金额">
          {Number(depositForm.getFieldValue('amount') ?? 0).toLocaleString('en', { minimumFractionDigits: 2 })}
        </Descriptions.Item>
        <Descriptions.Item label="备注">{depositForm.getFieldValue('remark') || '—'}</Descriptions.Item>
      </Descriptions>
      <Form layout="vertical">
        <Form.Item label="MFA 验证码" required>
          <Input
            id="deposit-mfa"
            placeholder="请输入 6 位 MFA 验证码"
            maxLength={6}
            style={{ letterSpacing: 4, textAlign: 'center' }}
          />
        </Form.Item>
      </Form>
      <div style={{ textAlign: 'right', marginTop: 8 }}>
        <Space>
          <Button onClick={() => setDepositStep(1)}>返回修改</Button>
          <Button
            type="primary"
            style={{ background: '#722ed1', borderColor: '#722ed1' }}
            onClick={() => {
              const mfa = (document.getElementById('deposit-mfa') as HTMLInputElement)?.value;
              if (!mfa || mfa.length < 6) { message.error('请输入6位MFA验证码'); return; }
              // mock: 任意6位通过
              const newOrder: OrderRecord = {
                id: String(Date.now()),
                startTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                endTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                orderId: `ORD${String(Date.now()).slice(-7)}`,
                type: '入金',
                currency: depositForm.getFieldValue('currency'),
                amount: depositForm.getFieldValue('amount'),
                status: '成功',
                remark: depositForm.getFieldValue('remark') ?? '',
              };
              setOrders((prev) => [newOrder, ...prev]);
              message.success('入金申请已提交');
              setDepositOpen(false);
              depositForm.resetFields();
              setDepositStep(1);
            }}
          >
            确认提交
          </Button>
        </Space>
      </div>
    </div>
  )}
</Modal>

{/* 出金弹窗占位 — Task 5 填充 */}
```

- [ ] **Step 2: 验证入金弹窗两步流程：填写 → 下一步 → 确认页 → 输入6位MFA → 提交 → 订单出现在表格**

- [ ] **Step 3: 提交**

```bash
git add src/pages/finance/wallet/index.tsx
git commit -m "feat: 入金弹窗 — 两步流程 + MFA 验证，提交后写入订单列表"
```

---

### Task 5: 出金弹窗（两步 + MFA）

**Files:**
- Modify: `src/pages/finance/wallet/index.tsx`

- [ ] **Step 1: 将 `{/* 出金弹窗占位 — Task 5 填充 */}` 替换为出金弹窗**

结构与入金弹窗完全一致，差异处标注 `// ← 出金差异`：

```tsx
{/* ── 出金弹窗 ─────────────────────────────────────────────────── */}
<Modal
  title={withdrawStep === 1 ? '出金' : '确认信息'}
  open={withdrawOpen}
  onCancel={() => setWithdrawOpen(false)}
  footer={null}
  width={480}
  destroyOnClose
>
  {withdrawStep === 1 ? (
    <Form form={withdrawForm} layout="vertical" style={{ marginTop: 16 }}>
      <Form.Item label="绑定账号">
        <div style={{ background: '#fafafa', border: '1px solid #d9d9d9', borderRadius: 6, padding: '6px 12px', fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{boundAccount.accountName}（{boundAccount.accountId}）</span>
          <Button
            type="link"
            size="small"
            style={{ padding: 0, fontSize: 12 }}
            onClick={() => { setWithdrawOpen(false); navigate('/finance/wallet/bind-account'); }}
          >
            修改 →
          </Button>
        </div>
      </Form.Item>
      <Form.Item label="币种" name="currency" initialValue="USDT" rules={[{ required: true }]}>
        <Select options={[{ value: 'USDT', label: 'USDT' }, { value: 'PEA', label: 'PEA' }]} />
      </Form.Item>
      <Form.Item label="金额" name="amount" rules={[{ required: true, message: '请输入金额' }]}>
        <InputNumber style={{ width: '100%' }} min={0.01} precision={2} placeholder="请输入出金金额" />
      </Form.Item>
      <Form.Item label="备注" name="remark">
        <Input.TextArea rows={2} placeholder="选填，不超过50字" maxLength={50} showCount />
      </Form.Item>
      <div style={{ textAlign: 'right', marginTop: 8 }}>
        <Space>
          <Button onClick={() => setWithdrawOpen(false)}>取消</Button>
          <Button
            type="primary"
            style={{ background: '#722ed1', borderColor: '#722ed1' }}
            onClick={() => withdrawForm.validateFields().then(() => setWithdrawStep(2))}
          >
            下一步
          </Button>
        </Space>
      </div>
    </Form>
  ) : (
    <div style={{ marginTop: 16 }}>
      <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
        <Descriptions.Item label="绑定账号">{boundAccount.accountName}（{boundAccount.accountId}）</Descriptions.Item>
        <Descriptions.Item label="类型"><Tag color="orange">出金</Tag></Descriptions.Item>
        <Descriptions.Item label="币种">{withdrawForm.getFieldValue('currency')}</Descriptions.Item>
        <Descriptions.Item label="金额">
          {Number(withdrawForm.getFieldValue('amount') ?? 0).toLocaleString('en', { minimumFractionDigits: 2 })}
        </Descriptions.Item>
        <Descriptions.Item label="备注">{withdrawForm.getFieldValue('remark') || '—'}</Descriptions.Item>
      </Descriptions>
      <Form layout="vertical">
        <Form.Item label="MFA 验证码" required>
          <Input
            id="withdraw-mfa"
            placeholder="请输入 6 位 MFA 验证码"
            maxLength={6}
            style={{ letterSpacing: 4, textAlign: 'center' }}
          />
        </Form.Item>
      </Form>
      <div style={{ textAlign: 'right', marginTop: 8 }}>
        <Space>
          <Button onClick={() => setWithdrawStep(1)}>返回修改</Button>
          <Button
            type="primary"
            style={{ background: '#722ed1', borderColor: '#722ed1' }}
            onClick={() => {
              const mfa = (document.getElementById('withdraw-mfa') as HTMLInputElement)?.value;
              if (!mfa || mfa.length < 6) { message.error('请输入6位MFA验证码'); return; }
              // mock: 任意6位通过；出金初始状态为「待审批」← 出金差异
              const newOrder: OrderRecord = {
                id: String(Date.now()),
                startTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                endTime: '',            // ← 出金差异：待审批时无结束时间
                orderId: `ORD${String(Date.now()).slice(-7)}`,
                type: '出金',           // ← 出金差异
                currency: withdrawForm.getFieldValue('currency'),
                amount: withdrawForm.getFieldValue('amount'),
                status: '待审批',       // ← 出金差异
                remark: withdrawForm.getFieldValue('remark') ?? '',
              };
              setOrders((prev) => [newOrder, ...prev]);
              message.success('出金申请已提交，等待审批');
              setWithdrawOpen(false);
              withdrawForm.resetFields();
              setWithdrawStep(1);
            }}
          >
            确认提交
          </Button>
        </Space>
      </div>
    </div>
  )}
</Modal>
```

- [ ] **Step 2: 验证出金弹窗：提交后表格顶部出现「待审批」状态的出金订单**

- [ ] **Step 3: 提交**

```bash
git add src/pages/finance/wallet/index.tsx
git commit -m "feat: 出金弹窗 — 两步流程 + MFA，提交后状态为待审批"
```

---

### Task 6: 修改绑定账号页面 + 路由接入

**Files:**
- Create: `src/pages/finance/wallet/bind-account.tsx`
- Modify: `.umirc.ts`
- Modify: `src/layouts/index.tsx`
- Modify: `src/utils/auth.ts`

- [ ] **Step 1: 创建 bind-account.tsx**

```tsx
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Card, Descriptions, Divider, Form, Input, message, Space, Typography } from 'antd';
import React, { useState } from 'react';
import { useNavigate } from 'umi';

const { Text } = Typography;
const CARD_SHADOW = '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)';

// mock 当前绑定账号（实际应从全局 state 或 context 读取，此处独立 mock）
const CURRENT_BOUND = { accountId: 'UHBOWunhfi8974nnf', accountName: 'Miya（@miya_sg）', platform: 'UU Talk Platform' };

const BindAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const mfa: string = values.mfa ?? '';
      if (mfa.length < 6) { message.error('请输入6位MFA验证码'); return; }
      // mock: 任意6位通过
      message.success('绑定账号已更新');
      navigate(-1);
    });
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          style={{ padding: 0, color: '#722ed1' }}
          onClick={() => navigate(-1)}
        >
          返回集团钱包
        </Button>
      </div>

      <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW, maxWidth: 560 }}>
        <Text strong style={{ fontSize: 16 }}>修改绑定账号</Text>
        <Divider style={{ margin: '16px 0' }} />

        {/* 当前绑定账号 */}
        <Descriptions bordered column={1} size="small" style={{ marginBottom: 24 }}>
          <Descriptions.Item label="当前账号">{CURRENT_BOUND.accountName}</Descriptions.Item>
          <Descriptions.Item label="账号 ID" labelStyle={{ fontFamily: 'monospace' }}>{CURRENT_BOUND.accountId}</Descriptions.Item>
          <Descriptions.Item label="所属平台">{CURRENT_BOUND.platform}</Descriptions.Item>
        </Descriptions>

        <Form form={form} layout="vertical">
          <Form.Item label="新账号 ID" name="newAccountId" rules={[{ required: true, message: '请输入新账号 ID' }]}>
            <Input placeholder="请输入新的绑定账号 ID" />
          </Form.Item>
          <Form.Item label="备注名称" name="newAccountName">
            <Input placeholder="选填，便于识别" />
          </Form.Item>
          <Divider style={{ margin: '8px 0 16px' }} />
          <Form.Item label="MFA 验证码" name="mfa" rules={[{ required: true, message: '请输入MFA验证码' }]}>
            <Input
              placeholder="请输入 6 位 MFA 验证码"
              maxLength={6}
              style={{ letterSpacing: 4, textAlign: 'center', width: 200 }}
            />
          </Form.Item>
          <Space>
            <Button onClick={() => navigate(-1)}>取消</Button>
            <Button type="primary" style={{ background: '#722ed1', borderColor: '#722ed1' }} onClick={handleSubmit}>
              保存
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
};

export default BindAccountPage;
```

- [ ] **Step 2: 在 `.umirc.ts` 添加路由**

在 `/finance/wallet` 路由条目后添加：

```typescript
{ path: '/finance/wallet/bind-account', component: 'finance/wallet/bind-account' },
```

- [ ] **Step 3: 在 `src/utils/auth.ts` 添加权限**

在 `ROUTE_PERMISSIONS` 中添加：

```typescript
'/finance/wallet/bind-account': ['group_admin'],
```

- [ ] **Step 4: 在 `src/layouts/index.tsx` 添加面包屑**

在 `breadcrumbMap` 中添加：

```typescript
'/finance/wallet/bind-account': ['设置中心', '集团钱包', '修改绑定账号'],
```

- [ ] **Step 5: 验证完整流程**

1. 集团钱包页点「修改绑定账号 →」跳转到 bind-account 页，面包屑显示正确
2. 入金/出金弹窗第一步点「修改 →」关闭弹窗并跳转 bind-account 页
3. bind-account 页填写新账号 + 6位MFA → 保存 → 返回钱包页
4. 筛选功能：类型/状态/日期范围均正常过滤

- [ ] **Step 6: 提交**

```bash
git add src/pages/finance/wallet/bind-account.tsx .umirc.ts src/layouts/index.tsx src/utils/auth.ts
git commit -m "feat: 修改绑定账号独立页面 + 路由/权限/面包屑接入"
```

---

## 验证清单

完成所有 Task 后，按以下步骤端到端验证：

1. **余额卡片**：USDT / PEA 双卡片各占 50% 宽度
2. **绑定账号卡片**：账号信息只读，[入金][出金] 按钮可点击
3. **入金流程**：填写 → 下一步 → 确认页 → 输入任意6位数字 → 提交 → 表格第一行出现「入金/成功」订单
4. **出金流程**：同上 → 提交 → 表格第一行出现「出金/待审批」订单，结束时间为空（显示「—」）
5. **修改绑定账号**：从钱包页和弹窗内均可跳转，保存后返回
6. **筛选**：选「出金」只显示出金，选「待审批」只显示待审批订单，日期范围正常过滤
7. **旧功能确认移除**：页面无通讯录、二维码、月度图表、税费计算相关内容
