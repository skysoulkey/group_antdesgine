# 全公司钱包 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增「全公司钱包」页面，展示余额钱包和应用钱包的双币种余额，支持钱包间划转（含 MFA），统一流水记录表含详情弹窗。

**Architecture:** 单页面组件 `src/pages/finance/all-wallet/index.tsx`，复用现有 `TableToolbar` 组件，遵循项目已有的 Card + Table + Modal 模式。需修改路由（`.umirc.ts`）、侧边栏菜单和权限配置（`src/layouts/index.tsx`、`src/utils/auth.ts`）。

**Tech Stack:** Umi 4, React 18, Ant Design 5, TypeScript, dayjs

---

## File Structure

| 操作 | 文件路径 | 职责 |
|------|---------|------|
| Create | `src/pages/finance/all-wallet/index.tsx` | 全公司钱包主页面（余额卡片 + 筛选 + 流水表 + 划转弹窗 + 详情弹窗） |
| Modify | `.umirc.ts` | 新增 `/finance/all-wallet` 路由 |
| Modify | `src/layouts/index.tsx` | 侧边栏菜单新增「全公司钱包」+ 面包屑映射 |
| Modify | `src/utils/auth.ts` | 权限配置新增 `/finance/all-wallet`（与公司钱包一致） |
| Modify | `doc/page_map.md` | 页面清单新增全公司钱包 |
| Modify | `doc/changelog.md` | 追加变更记录 |

---

### Task 1: 路由 + 菜单 + 权限配置

**Files:**
- Modify: `.umirc.ts:38-41`
- Modify: `src/layouts/index.tsx:85-88` (menu) + `src/layouts/index.tsx:123` (breadcrumb)
- Modify: `src/utils/auth.ts:41-48` (role permissions)

- [ ] **Step 1: 在 `.umirc.ts` 新增路由**

在 `// 设置中心` 区块中，`/finance/my-wallet` 下方新增一行：

```typescript
    { path: '/finance/all-wallet',      component: 'finance/all-wallet/index' },
```

完整上下文：

```typescript
    // 设置中心
    { path: '/finance/my-wallet',       component: 'finance/my-wallet/index' },
    { path: '/finance/all-wallet',      component: 'finance/all-wallet/index' },
    { path: '/finance/wallet',          component: 'finance/wallet/index' },
```

- [ ] **Step 2: 在 `src/layouts/index.tsx` 侧边栏菜单新增条目**

在 `settings` 的 `children` 数组中，`/finance/my-wallet` 下方新增：

```typescript
      { key: '/finance/all-wallet',     label: '全公司钱包', roles: ['company_owner', 'company_finance'] },
```

完整上下文：

```typescript
    children: [
      { key: '/finance/my-wallet',      label: '公司钱包',  roles: ['company_owner', 'company_finance'] },
      { key: '/finance/all-wallet',     label: '全公司钱包', roles: ['company_owner', 'company_finance'] },
      { key: '/finance/wallet',         label: '集团钱包',  roles: ['group_owner', 'group_finance'] },
```

- [ ] **Step 3: 在 `src/layouts/index.tsx` 面包屑映射新增条目**

在 `breadcrumbMap` 对象中，`/finance/my-wallet` 下方新增：

```typescript
  '/finance/all-wallet':       ['设置中心', '全公司钱包'],
```

- [ ] **Step 4: 在 `src/utils/auth.ts` 权限配置新增路由**

在 `company_owner` 的路由数组中加入 `'/finance/all-wallet'`：

```typescript
  company_owner: [
    '/dashboard/company', '/company/shareholding', '/company/revenue',
    '/enterprise/list', '/enterprise/invite', '/enterprise/detail',
    '/orders/lottery', '/commission', '/company/transfer',
    '/finance/my-wallet', '/finance/all-wallet', '/finance/approvals', '/system/profile', '/system/users', '/system/roles', '/system/notifications',
  ],
```

在 `company_finance` 的路由数组中加入 `'/finance/all-wallet'`：

```typescript
  company_finance: ['/company/revenue', '/finance/my-wallet', '/finance/all-wallet'],
```

- [ ] **Step 5: 创建空白页面占位**

创建 `src/pages/finance/all-wallet/index.tsx`：

```tsx
import React from 'react';
import { Typography } from 'antd';

const AllWalletPage: React.FC = () => {
  return (
    <div>
      <Typography.Text>全公司钱包（开发中）</Typography.Text>
    </div>
  );
};

export default AllWalletPage;
```

- [ ] **Step 6: 验证路由和菜单**

Run: `npm run dev`（或项目已有的启动命令）

验证：
1. 侧边栏「设置中心」下出现「全公司钱包」菜单项
2. 点击后跳转到 `/finance/all-wallet`，显示占位文字
3. 面包屑显示「设置中心 / 全公司钱包」

- [ ] **Step 7: Commit**

```bash
git add .umirc.ts src/layouts/index.tsx src/utils/auth.ts src/pages/finance/all-wallet/index.tsx
git commit -m "feat(all-wallet): 新增全公司钱包路由、菜单、权限配置"
```

---

### Task 2: 余额卡片区

**Files:**
- Modify: `src/pages/finance/all-wallet/index.tsx`

- [ ] **Step 1: 实现余额卡片区和 Mock 数据**

替换 `src/pages/finance/all-wallet/index.tsx` 全部内容：

```tsx
import { SwapOutlined } from '@ant-design/icons';
import {
  Button, Card, Col, ConfigProvider, DatePicker, Descriptions,
  Form, Input, InputNumber, message, Modal,
  Radio, Row, Space, Table, Tag, Typography, type InputRef,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'umi';
import TableToolbar from '../../../components/TableToolbar';

const { Text } = Typography;
const { RangePicker } = DatePicker;

const CARD_SHADOW = '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)';
const CARD_RADIUS = 12;
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

// ── 类型定义 ──────────────────────────────────────────────────────
type WalletType = 'balance' | 'app';
type OrderType = 'transfer' | 'additional_investment' | 'share_release' | 'order_deduction';
type FlowStatus = 'success' | 'pending' | 'failed';

const WALLET_TYPE_LABELS: Record<WalletType, string> = {
  balance: '余额钱包',
  app: '应用钱包',
};

const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  transfer: '划转',
  additional_investment: '追加投资',
  share_release: '释放股份',
  order_deduction: '转单扣款',
};

const FLOW_STATUS_LABELS: Record<FlowStatus, string> = {
  pending: '处理中',
  success: '成功',
  failed: '失败',
};

const FLOW_STATUS_COLORS: Record<FlowStatus, string> = {
  pending: 'warning',
  success: 'success',
  failed: 'error',
};

// ── 数据结构 ──────────────────────────────────────────────────────
interface WalletBalance {
  walletType: WalletType;
  walletName: string;
  usdtBalance: number;
  peaBalance: number;
}

interface WalletFlowRecord {
  id: string;
  flowId: string;
  createdAt: string;
  walletType: WalletType;
  orderType: OrderType;
  amount: number;
  currency: 'USDT' | 'PEA';
  status: FlowStatus;

  // 划转特有
  fromWallet?: WalletType;
  toWallet?: WalletType;
  remark?: string;

  // 追加投资特有
  sourceCompanyId?: string;
  sourceCompanyName?: string;
  sourceOwnerId?: string;
  sourceOwnerUsername?: string;
  sourceOwnerNickname?: string;
  totalInvestAmount?: number;
  shareRatio?: number;
  investCurrency?: string;
  investAmount?: number;

  // 释放股份特有
  releaseRatio?: number;
  totalShareValue?: number;
  releaseCurrency?: string;
  releaseAmount?: number;

  // 转单扣款特有
  commissionOrderId?: string;
}

// ── Mock 数据 ─────────────────────────────────────────────────────
const MOCK_BALANCES: WalletBalance[] = [
  { walletType: 'balance', walletName: '余额钱包', usdtBalance: 341234.00, peaBalance: 128500.00 },
  { walletType: 'app',     walletName: '应用钱包', usdtBalance: 89230.00,  peaBalance: 560000.00 },
];

const MOCK_ENTERPRISES = [
  { id: 'ENT001', name: 'CyberBot', ownerId: 'U101', ownerUsername: 'zhang_wei', ownerNickname: '张伟' },
  { id: 'ENT002', name: 'StarLink', ownerId: 'U102', ownerUsername: 'li_na', ownerNickname: '李娜' },
  { id: 'ENT003', name: 'QuantumPay', ownerId: 'U103', ownerUsername: 'wang_fang', ownerNickname: '王芳' },
];

const MOCK_FLOW_DATA: WalletFlowRecord[] = Array.from({ length: 20 }, (_, i) => {
  const orderTypes: OrderType[] = ['transfer', 'additional_investment', 'share_release', 'order_deduction'];
  const orderType = orderTypes[i % 4];
  const walletType: WalletType = i % 2 === 0 ? 'balance' : 'app';
  const statusPool: FlowStatus[] = ['success', 'pending', 'failed'];
  const status = statusPool[i % 3];
  const currency: 'USDT' | 'PEA' = i % 2 === 0 ? 'USDT' : 'PEA';
  const day = String(20 - i).padStart(2, '0');
  const ent = MOCK_ENTERPRISES[i % 3];

  const base: WalletFlowRecord = {
    id: String(i + 1),
    flowId: `FL${String(i + 1).padStart(7, '0')}`,
    createdAt: `2026-04-${day} ${String(9 + (i % 10)).padStart(2, '0')}:${String(i * 3 % 60).padStart(2, '0')}:00`,
    walletType,
    orderType,
    amount: 5000 + i * 3200,
    currency,
    status,
  };

  if (orderType === 'transfer') {
    base.fromWallet = walletType;
    base.toWallet = walletType === 'balance' ? 'app' : 'balance';
    base.remark = i % 3 === 0 ? '月度资金划转' : '';
  } else if (orderType === 'additional_investment') {
    base.sourceCompanyId = ent.id;
    base.sourceCompanyName = ent.name;
    base.sourceOwnerId = ent.ownerId;
    base.sourceOwnerUsername = ent.ownerUsername;
    base.sourceOwnerNickname = ent.ownerNickname;
    base.totalInvestAmount = 100000 + i * 5000;
    base.shareRatio = 15 + (i % 20);
    base.investCurrency = currency;
    base.investAmount = 15000 + i * 750;
  } else if (orderType === 'share_release') {
    base.sourceCompanyId = ent.id;
    base.sourceCompanyName = ent.name;
    base.sourceOwnerId = ent.ownerId;
    base.sourceOwnerUsername = ent.ownerUsername;
    base.sourceOwnerNickname = ent.ownerNickname;
    base.releaseRatio = 5 + (i % 15);
    base.totalShareValue = 200000 + i * 10000;
    base.releaseCurrency = currency;
    base.releaseAmount = 10000 + i * 500;
  } else {
    base.commissionOrderId = `COM${String(30000 + i).padStart(8, '0')}`;
  }

  return base;
});

// ── 主组件 ────────────────────────────────────────────────────────
const AllWalletPage: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRefresh = useCallback(() => { message.success('已刷新'); }, []);

  // 余额（可被划转修改）
  const [balances, setBalances] = useState<WalletBalance[]>(MOCK_BALANCES);
  const balanceWallet = balances.find((b) => b.walletType === 'balance')!;
  const appWallet = balances.find((b) => b.walletType === 'app')!;

  return (
    <div ref={containerRef}>
      {/* ── 页面标题 + 划转按钮 ───────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button type="primary" icon={<SwapOutlined />}>
          划转
        </Button>
      </div>

      {/* ── 余额卡片区 ────────────────────────────────────────────────── */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        {balances.map((wallet) => (
          <Col span={12} key={wallet.walletType}>
            <Card bordered={false} style={{ borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW }}
              styles={{ body: { padding: '16px 24px' } }}>
              <Text style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, display: 'block' }}>
                {wallet.walletName}
              </Text>
              <Space size={48}>
                <div>
                  <Text style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>USDT 余额</Text>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#141414', marginTop: 4, whiteSpace: 'nowrap' }}>
                    {wallet.usdtBalance.toLocaleString('en', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <Text style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>PEA 余额</Text>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#141414', marginTop: 4, whiteSpace: 'nowrap' }}>
                    {wallet.peaBalance.toLocaleString('en', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 流水记录区域（Task 3 实现） */}
    </div>
  );
};

export default AllWalletPage;
```

- [ ] **Step 2: 验证余额卡片区**

在浏览器中打开 `/finance/all-wallet`，确认：
1. 右上角显示蓝色「划转」按钮
2. 两张卡片并排，分别显示「余额钱包」和「应用钱包」
3. 各自显示 USDT 和 PEA 余额，数字有千分位格式
4. 卡片圆角 12px，有阴影

- [ ] **Step 3: Commit**

```bash
git add src/pages/finance/all-wallet/index.tsx
git commit -m "feat(all-wallet): 余额卡片区 — 双钱包双币种余额展示"
```

---

### Task 3: 筛选栏 + 流水记录表

**Files:**
- Modify: `src/pages/finance/all-wallet/index.tsx`

- [ ] **Step 1: 在主组件中添加筛选状态和流水数据**

在 `const appWallet = ...` 之后，`return` 之前，添加：

```tsx
  // 流水数据
  const [flowData, setFlowData] = useState<WalletFlowRecord[]>(MOCK_FLOW_DATA);

  // 筛选状态
  const [walletFilter, setWalletFilter] = useState<string>('全部');
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>('全部');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  const filteredData = useMemo(() => {
    return flowData.filter((r) => {
      if (walletFilter !== '全部' && WALLET_TYPE_LABELS[r.walletType] !== walletFilter) return false;
      if (orderTypeFilter !== '全部' && ORDER_TYPE_LABELS[r.orderType] !== orderTypeFilter) return false;
      if (dateRange && dateRange[0] && dateRange[1]) {
        const day = r.createdAt.slice(0, 10);
        if (day < dateRange[0].format('YYYY-MM-DD') || day > dateRange[1].format('YYYY-MM-DD')) return false;
      }
      return true;
    });
  }, [flowData, walletFilter, orderTypeFilter, dateRange]);

  const columns: ColumnsType<WalletFlowRecord> = [
    {
      title: '订单时间', dataIndex: 'createdAt', width: 170,
      sorter: (a, b) => a.createdAt.localeCompare(b.createdAt),
      render: (v: string) => <span style={{ whiteSpace: 'nowrap' }}>{v}</span>,
    },
    { title: '流水号', dataIndex: 'flowId', width: 130 },
    { title: '钱包类型', dataIndex: 'walletType', width: 100, render: (v: WalletType) => WALLET_TYPE_LABELS[v] },
    { title: '订单类型', dataIndex: 'orderType', width: 100, render: (v: OrderType) => ORDER_TYPE_LABELS[v] },
    {
      title: '金额', dataIndex: 'amount', width: 130, align: 'right',
      render: (v: number) => (
        <span style={{ fontWeight: 400, color: '#141414' }}>
          {v.toLocaleString('en', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    { title: '币种', dataIndex: 'currency', width: 80 },
    {
      title: '状态', dataIndex: 'status', width: 90,
      render: (v: FlowStatus) => <Tag color={FLOW_STATUS_COLORS[v]}>{FLOW_STATUS_LABELS[v]}</Tag>,
    },
    {
      title: '操作', width: 80, fixed: 'right' as const,
      render: (_: unknown, record: WalletFlowRecord) => (
        <Button type="link" size="small" onClick={() => showDetail(record)}>详情</Button>
      ),
    },
  ];

  const scrollX = columns.reduce((sum, c) => sum + ((c.width as number) || 120), 0);
```

- [ ] **Step 2: 添加详情弹窗状态（占位，Task 4 完善）**

在筛选状态之后添加：

```tsx
  // 详情弹窗
  const [detailOpen, setDetailOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<WalletFlowRecord | null>(null);

  const showDetail = (record: WalletFlowRecord) => {
    setCurrentRecord(record);
    setDetailOpen(true);
  };
```

- [ ] **Step 3: 在 JSX 中添加筛选栏 + 流水表**

将 `{/* 流水记录区域（Task 3 实现） */}` 注释替换为：

```tsx
      {/* ── 流水记录 ──────────────────────────────────────────────────── */}
      <Card bordered={false} style={{ borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW }}>
        <Space size={16} wrap align="center" style={{ marginBottom: 16 }}>
          <ConfigProvider theme={radioTheme}>
            <Radio.Group
              value={walletFilter}
              onChange={(e) => setWalletFilter(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="全部">全部钱包</Radio.Button>
              <Radio.Button value="余额钱包">余额钱包</Radio.Button>
              <Radio.Button value="应用钱包">应用钱包</Radio.Button>
            </Radio.Group>
          </ConfigProvider>
          <ConfigProvider theme={radioTheme}>
            <Radio.Group
              value={orderTypeFilter}
              onChange={(e) => setOrderTypeFilter(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="全部">全部类型</Radio.Button>
              <Radio.Button value="划转">划转</Radio.Button>
              <Radio.Button value="追加投资">追加投资</Radio.Button>
              <Radio.Button value="释放股份">释放股份</Radio.Button>
              <Radio.Button value="转单扣款">转单扣款</Radio.Button>
            </Radio.Group>
          </ConfigProvider>
          <RangePicker onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null] | null)} />
        </Space>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 14, fontWeight: 600 }}>流水记录</Text>
          <TableToolbar onRefresh={handleRefresh} containerRef={containerRef} />
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          size="middle"
          scroll={{ x: scrollX }}
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
          rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
        />
      </Card>
```

- [ ] **Step 4: 验证筛选和流水表**

在浏览器中确认：
1. 三组筛选器正常显示（钱包类型 Radio、订单类型 Radio、时间范围）
2. 切换筛选后表格数据正确过滤
3. 表格斑马纹、分页、排序正常
4. 「详情」按钮可点击（弹窗内容在 Task 4）

- [ ] **Step 5: Commit**

```bash
git add src/pages/finance/all-wallet/index.tsx
git commit -m "feat(all-wallet): 筛选栏 + 流水记录表"
```

---

### Task 4: 详情弹窗

**Files:**
- Modify: `src/pages/finance/all-wallet/index.tsx`

- [ ] **Step 1: 在 JSX 的 `</Card>` 结束标签后、`</div>` 最外层结束标签前，添加详情弹窗**

```tsx
      {/* ── 详情弹窗 ──────────────────────────────────────────────────── */}
      <Modal
        title={`流水详情 — ${currentRecord?.flowId}`}
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={640}
      >
        {currentRecord && (
          <Descriptions column={1} bordered size="small" style={{ marginTop: 16 }} labelStyle={{ whiteSpace: 'nowrap', width: 140 }}>
            {/* 共性字段 */}
            <Descriptions.Item label="流水号">{currentRecord.flowId}</Descriptions.Item>
            <Descriptions.Item label="订单时间">{currentRecord.createdAt}</Descriptions.Item>
            <Descriptions.Item label="钱包类型">{WALLET_TYPE_LABELS[currentRecord.walletType]}</Descriptions.Item>
            <Descriptions.Item label="订单类型">{ORDER_TYPE_LABELS[currentRecord.orderType]}</Descriptions.Item>
            <Descriptions.Item label="金额">{currentRecord.amount.toLocaleString('en', { minimumFractionDigits: 2 })} {currentRecord.currency}</Descriptions.Item>
            <Descriptions.Item label="币种">{currentRecord.currency}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={FLOW_STATUS_COLORS[currentRecord.status]}>{FLOW_STATUS_LABELS[currentRecord.status]}</Tag>
            </Descriptions.Item>

            {/* 划转特有 */}
            {currentRecord.orderType === 'transfer' && (
              <>
                <Descriptions.Item label="转出钱包">{WALLET_TYPE_LABELS[currentRecord.fromWallet!]}</Descriptions.Item>
                <Descriptions.Item label="转入钱包">{WALLET_TYPE_LABELS[currentRecord.toWallet!]}</Descriptions.Item>
                <Descriptions.Item label="备注">{currentRecord.remark || '—'}</Descriptions.Item>
              </>
            )}

            {/* 追加投资特有 */}
            {currentRecord.orderType === 'additional_investment' && (
              <>
                <Descriptions.Item label="企业名称">{currentRecord.sourceCompanyName}</Descriptions.Item>
                <Descriptions.Item label="企业ID">{currentRecord.sourceCompanyId}</Descriptions.Item>
                <Descriptions.Item label="企业主昵称">{currentRecord.sourceOwnerNickname}</Descriptions.Item>
                <Descriptions.Item label="企业主ID">{currentRecord.sourceOwnerId}</Descriptions.Item>
                <Descriptions.Item label="企业主用户名">{currentRecord.sourceOwnerUsername}</Descriptions.Item>
                <Descriptions.Item label="追加投资总金额">{currentRecord.totalInvestAmount?.toLocaleString()} {currentRecord.investCurrency}</Descriptions.Item>
                <Descriptions.Item label="本公司占股比例">{currentRecord.shareRatio}%</Descriptions.Item>
                <Descriptions.Item label="需投资货币单位">{currentRecord.investCurrency}</Descriptions.Item>
                <Descriptions.Item label="需投资金额">{currentRecord.investAmount?.toLocaleString()} {currentRecord.investCurrency}</Descriptions.Item>
              </>
            )}

            {/* 释放股份特有 */}
            {currentRecord.orderType === 'share_release' && (
              <>
                <Descriptions.Item label="企业名称">{currentRecord.sourceCompanyName}</Descriptions.Item>
                <Descriptions.Item label="企业ID">{currentRecord.sourceCompanyId}</Descriptions.Item>
                <Descriptions.Item label="企业主昵称">{currentRecord.sourceOwnerNickname}</Descriptions.Item>
                <Descriptions.Item label="企业主ID">{currentRecord.sourceOwnerId}</Descriptions.Item>
                <Descriptions.Item label="企业主用户名">{currentRecord.sourceOwnerUsername}</Descriptions.Item>
                <Descriptions.Item label="释放股份比例">{currentRecord.releaseRatio}%</Descriptions.Item>
                <Descriptions.Item label="总股本预估金额">{currentRecord.totalShareValue?.toLocaleString()} {currentRecord.releaseCurrency}</Descriptions.Item>
                <Descriptions.Item label="释放股份货币单位">{currentRecord.releaseCurrency}</Descriptions.Item>
                <Descriptions.Item label="释放股份金额">{currentRecord.releaseAmount?.toLocaleString()} {currentRecord.releaseCurrency}</Descriptions.Item>
              </>
            )}

            {/* 转单扣款特有 */}
            {currentRecord.orderType === 'order_deduction' && (
              <>
                <Descriptions.Item label="佣金订单号">{currentRecord.commissionOrderId}</Descriptions.Item>
                <Descriptions.Item label="佣金订单">
                  <Button type="link" size="small" style={{ padding: 0 }} onClick={() => { setDetailOpen(false); navigate('/commission'); }}>
                    查看佣金订单 →
                  </Button>
                </Descriptions.Item>
              </>
            )}
          </Descriptions>
        )}
      </Modal>
```

- [ ] **Step 2: 验证详情弹窗**

在浏览器中点击不同类型流水的「详情」按钮，确认：
1. 划转类型：显示转出/转入钱包、备注
2. 追加投资类型：显示企业信息、投资金额、占股比例等
3. 释放股份类型：显示企业信息、释放比例、股本金额等
4. 转单扣款类型：显示佣金订单号、「查看佣金订单」可跳转到 `/commission`

- [ ] **Step 3: Commit**

```bash
git add src/pages/finance/all-wallet/index.tsx
git commit -m "feat(all-wallet): 详情弹窗 — 按订单类型展示特殊字段"
```

---

### Task 5: 划转弹窗

**Files:**
- Modify: `src/pages/finance/all-wallet/index.tsx`

- [ ] **Step 1: 在主组件内添加划转弹窗状态**

在详情弹窗状态之后添加：

```tsx
  // 划转弹窗
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferStep, setTransferStep] = useState<1 | 2>(1);
  const [transferForm] = Form.useForm();
  const transferMfaRef = useRef<InputRef>(null);

  const openTransfer = () => {
    setTransferStep(1);
    transferForm.resetFields();
    setTransferOpen(true);
  };

  const getBalanceForForm = (walletType: WalletType, currency: 'USDT' | 'PEA'): number => {
    const wallet = balances.find((b) => b.walletType === walletType);
    if (!wallet) return 0;
    return currency === 'USDT' ? wallet.usdtBalance : wallet.peaBalance;
  };

  const handleTransferSubmit = () => {
    const mfa = transferMfaRef.current?.input?.value ?? '';
    if (!mfa || mfa.length < 6) {
      message.error('请输入6位MFA验证码');
      return;
    }

    const fromWallet: WalletType = transferForm.getFieldValue('fromWallet');
    const toWallet: WalletType = fromWallet === 'balance' ? 'app' : 'balance';
    const currency: 'USDT' | 'PEA' = transferForm.getFieldValue('currency');
    const amount: number = transferForm.getFieldValue('amount');
    const remark: string = transferForm.getFieldValue('remark') ?? '';

    // Mock：更新余额
    setBalances((prev) => prev.map((w) => {
      const field = currency === 'USDT' ? 'usdtBalance' : 'peaBalance';
      if (w.walletType === fromWallet) return { ...w, [field]: w[field] - amount };
      if (w.walletType === toWallet)   return { ...w, [field]: w[field] + amount };
      return w;
    }));

    // Mock：添加流水记录
    const ts = Date.now();
    const newFlow: WalletFlowRecord = {
      id: String(ts),
      flowId: `FL${String(ts).slice(-7)}`,
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      walletType: fromWallet,
      orderType: 'transfer',
      amount,
      currency,
      status: 'success',
      fromWallet,
      toWallet,
      remark,
    };
    setFlowData((prev) => [newFlow, ...prev]);

    message.success('划转成功');
    setTransferOpen(false);
    transferForm.resetFields();
    setTransferStep(1);
  };
```

- [ ] **Step 2: 将页面顶部「划转」按钮绑定到 openTransfer**

将：

```tsx
        <Button type="primary" icon={<SwapOutlined />}>
          划转
        </Button>
```

替换为：

```tsx
        <Button type="primary" icon={<SwapOutlined />} onClick={openTransfer}>
          划转
        </Button>
```

- [ ] **Step 3: 在详情弹窗 `</Modal>` 之后添加划转弹窗 JSX**

```tsx
      {/* ── 划转弹窗 ──────────────────────────────────────────────────── */}
      <Modal
        title={transferStep === 1 ? '划转' : '确认划转'}
        open={transferOpen}
        onCancel={() => { setTransferOpen(false); setTransferStep(1); }}
        footer={null}
        width={480}
        destroyOnClose
      >
        {transferStep === 1 ? (
          <Form form={transferForm} layout="vertical" style={{ marginTop: 16 }}
            initialValues={{ fromWallet: 'balance', currency: 'USDT' }}>
            <Form.Item label="转出钱包" name="fromWallet" rules={[{ required: true }]}>
              <Radio.Group>
                <Radio value="balance">余额钱包</Radio>
                <Radio value="app">应用钱包</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item noStyle shouldUpdate={(prev, cur) => prev.fromWallet !== cur.fromWallet || prev.currency !== cur.currency}>
              {({ getFieldValue }) => {
                const from: WalletType = getFieldValue('fromWallet') ?? 'balance';
                const to: WalletType = from === 'balance' ? 'app' : 'balance';
                const currency: 'USDT' | 'PEA' = getFieldValue('currency') ?? 'USDT';
                return (
                  <div style={{ background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 8, padding: '12px 16px', marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text style={{ fontSize: 13 }}>转出：{WALLET_TYPE_LABELS[from]}</Text>
                      <Text style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>
                        {currency} 余额：{getBalanceForForm(from, currency).toLocaleString('en', { minimumFractionDigits: 2 })}
                      </Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 13 }}>转入：{WALLET_TYPE_LABELS[to]}</Text>
                      <Text style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>
                        {currency} 余额：{getBalanceForForm(to, currency).toLocaleString('en', { minimumFractionDigits: 2 })}
                      </Text>
                    </div>
                  </div>
                );
              }}
            </Form.Item>

            <Form.Item label="币种" name="currency" rules={[{ required: true }]}>
              <Radio.Group>
                <Radio value="USDT">USDT</Radio>
                <Radio value="PEA">PEA</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item label="划转金额" name="amount" rules={[{ required: true, message: '请输入划转金额' }]}>
              <InputNumber style={{ width: '100%' }} min={0.01} precision={2} placeholder="请输入划转金额" />
            </Form.Item>

            <Form.Item label="备注" name="remark">
              <Input.TextArea rows={2} placeholder="选填，不超过50字" maxLength={50} showCount />
            </Form.Item>

            <div style={{ textAlign: 'right', marginTop: 8 }}>
              <Space>
                <Button onClick={() => setTransferOpen(false)}>取消</Button>
                <Button type="primary" onClick={() => transferForm.validateFields().then(() => setTransferStep(2)).catch(() => {})}>
                  下一步
                </Button>
              </Space>
            </div>
          </Form>
        ) : (
          <div style={{ marginTop: 16 }}>
            <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="转出钱包">{WALLET_TYPE_LABELS[transferForm.getFieldValue('fromWallet')]}</Descriptions.Item>
              <Descriptions.Item label="转入钱包">{WALLET_TYPE_LABELS[transferForm.getFieldValue('fromWallet') === 'balance' ? 'app' : 'balance']}</Descriptions.Item>
              <Descriptions.Item label="币种">{transferForm.getFieldValue('currency')}</Descriptions.Item>
              <Descriptions.Item label="划转金额">
                {Number(transferForm.getFieldValue('amount') ?? 0).toLocaleString('en', { minimumFractionDigits: 2 })}
              </Descriptions.Item>
              <Descriptions.Item label="备注">{transferForm.getFieldValue('remark') || '—'}</Descriptions.Item>
            </Descriptions>
            <Form layout="vertical">
              <Form.Item label="MFA 验证码" required>
                <Input
                  ref={transferMfaRef}
                  placeholder="请输入 6 位 MFA 验证码"
                  maxLength={6}
                  style={{ letterSpacing: 4, textAlign: 'center' }}
                />
              </Form.Item>
            </Form>
            <div style={{ textAlign: 'right', marginTop: 8 }}>
              <Space>
                <Button onClick={() => {
                  if (transferMfaRef.current?.input) transferMfaRef.current.input.value = '';
                  setTransferStep(1);
                }}>返回修改</Button>
                <Button type="primary" onClick={handleTransferSubmit}>
                  确认划转
                </Button>
              </Space>
            </div>
          </div>
        )}
      </Modal>
```

- [ ] **Step 4: 验证划转弹窗**

在浏览器中操作：
1. 点击「划转」按钮，弹窗打开
2. 选择转出钱包，确认转入钱包自动填充且余额显示正确
3. 切换币种，余额数字跟随变化
4. 填写金额 → 下一步 → 显示摘要 + MFA 输入
5. 输入 6 位验证码 → 确认划转 → 成功提示
6. 卡片余额更新，流水表新增一条划转记录

- [ ] **Step 5: Commit**

```bash
git add src/pages/finance/all-wallet/index.tsx
git commit -m "feat(all-wallet): 划转弹窗 — 双步骤表单 + MFA 验证"
```

---

### Task 6: 文档更新

**Files:**
- Modify: `doc/page_map.md`
- Modify: `doc/changelog.md`

- [ ] **Step 1: 更新 `doc/page_map.md`**

在设置中心区块中，公司钱包下方新增：

```markdown
| `/finance/all-wallet` | 全公司钱包 | 设置中心 | ✅ 已完成 | 余额钱包+应用钱包余额展示，双向划转（MFA），统一流水记录表+详情弹窗 |
```

- [ ] **Step 2: 更新 `doc/changelog.md`**

在最新条目前追加：

```markdown
### 2026-04-20 — 全公司钱包模块

- 新增「全公司钱包」页面（`/finance/all-wallet`），设置中心菜单
- 余额钱包 + 应用钱包双卡片，USDT / PEA 双币种余额展示
- 钱包间划转功能（两步弹窗 + MFA 验证）
- 统一流水记录表：划转、追加投资、释放股份、转单扣款四种类型
- 详情弹窗：共性字段 + 按类型展示特殊字段，转单扣款可跳转佣金订单
- 权限与公司钱包一致（company_owner, company_finance）
```

- [ ] **Step 3: Commit**

```bash
git add doc/page_map.md doc/changelog.md
git commit -m "docs: 更新 page_map + changelog — 全公司钱包模块"
```
