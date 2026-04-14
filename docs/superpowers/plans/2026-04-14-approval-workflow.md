# 公司审批流程 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现公司审批流程，包含审批列表页、自动审批规则配置页，集成到现有财务管理模块。

**Architecture:** 事件驱动 + 状态机。新建 `/finance/approvals` 页面（两个 Tab：审批列表 + 审批规则），使用 `useSearchParams` 实现 Tab URL 联动。Mock 数据阶段，所有数据本地生成。遵循现有项目 UI 规范（Card 包裹、Radio.Button 平铺筛选、斑马纹表格）。

**Tech Stack:** React 18 + Umi 4 + Ant Design 5 + TypeScript

**Spec:** `docs/superpowers/specs/2026-04-14-approval-workflow-design.md`

---

## File Structure

| 操作 | 路径 | 职责 |
|------|------|------|
| Create | `src/pages/finance/approvals/index.tsx` | 审批管理主页面（Tab 容器 + 审批列表 Tab） |
| Create | `src/pages/finance/approvals/ApprovalRulesTab.tsx` | 审批规则 Tab（规则列表 + 新增/编辑弹窗） |
| Modify | `.umirc.ts` | 注册 `/finance/approvals` 路由 |
| Modify | `src/layouts/index.tsx` | 菜单项 + 面包屑映射 + Tab 面包屑映射 |
| Modify | `src/utils/auth.ts` | 给 company_owner / company_ops 角色添加路由权限 |
| Modify | `doc/page_map.md` | 添加审批中心页面记录 |
| Modify | `doc/changelog.md` | 添加变更记录 |

---

### Task 1: 路由、菜单、权限注册

**Files:**
- Modify: `.umirc.ts:38-46`
- Modify: `src/layouts/index.tsx:80-93` (menu), `src/layouts/index.tsx:108-130` (breadcrumb), `src/layouts/index.tsx:133-154` (tab breadcrumb)
- Modify: `src/utils/auth.ts:29-51`

- [ ] **Step 1: 在 `.umirc.ts` 注册路由**

在 `// 设置中心` 区块内（`/system/notifications` 之后）添加：

```typescript
    { path: '/finance/approvals',   component: 'finance/approvals/index' },
```

- [ ] **Step 2: 在 `src/layouts/index.tsx` 添加菜单项**

在 `allMenuItems` 的 `settings` children 中，`/system/notifications` 之后添加：

```typescript
      { key: '/finance/approvals',    label: '审批中心',  roles: ['company_owner', 'company_ops'] },
```

- [ ] **Step 3: 在 `src/layouts/index.tsx` 添加面包屑映射**

在 `breadcrumbMap` 中添加：

```typescript
  '/finance/approvals':        ['设置中心', '审批中心'],
```

在 `tabBreadcrumbMap` 中添加：

```typescript
  '/finance/approvals': {
    list:  ['设置中心', '审批中心', '审批列表'],
    rules: ['设置中心', '审批中心', '审批规则'],
  },
```

- [ ] **Step 4: 在 `src/utils/auth.ts` 添加路由权限**

在 `ROLE_ROUTES` 中给 `company_owner` 和 `company_ops` 的数组末尾添加 `'/finance/approvals'`：

```typescript
  company_owner: [
    '/dashboard/company', '/company/shareholding', '/company/revenue',
    '/enterprise/list', '/enterprise/invite', '/enterprise/detail',
    '/orders/lottery', '/commission',
    '/finance/my-wallet', '/finance/approvals', '/system/notifications', '/system/users', '/system/logs',
  ],
  company_ops: ['/dashboard/company', '/company/shareholding', '/orders/lottery', '/commission', '/system/notifications', '/finance/approvals'],
```

- [ ] **Step 5: 验证路由注册**

```bash
cd /Users/miya/Documents/Project/group-admin-web && npx umi build 2>&1 | head -20
```

预期：构建无错误，或至少不报路由相关错误（页面文件还未创建，可能会有文件找不到的警告，这是正常的）。

- [ ] **Step 6: Commit**

```bash
git add .umirc.ts src/layouts/index.tsx src/utils/auth.ts
git commit -m "feat(approvals): 注册路由、菜单、面包屑、权限"
```

---

### Task 2: 审批列表页面 — 数据定义与 Mock 数据

**Files:**
- Create: `src/pages/finance/approvals/index.tsx`

- [ ] **Step 1: 创建文件，定义类型和常量**

```tsx
import { SearchOutlined } from '@ant-design/icons';
import {
  Button, Card, ConfigProvider, DatePicker, Descriptions, Input, Modal,
  Radio, Select, Space, Table, Tabs, Tag, Typography, message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'umi';
import ApprovalRulesTab from './ApprovalRulesTab';

const { Text } = Typography;
const { RangePicker } = DatePicker;

const CARD_SHADOW = '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)';
const CARD_RADIUS = 12;
const radioTheme = { components: { Radio: { colorPrimary: '#1677ff', buttonSolidCheckedBg: '#ffffff', buttonSolidCheckedColor: '#1677ff', buttonCheckedBg: '#ffffff' } } };

// ── 审批状态 ──────────────────────────────────────────────────────
type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'auto_approved' | 'timeout_rejected';

const STATUS_LABELS: Record<ApprovalStatus, string> = {
  pending: '待审批',
  approved: '已通过',
  rejected: '已拒绝',
  auto_approved: '自动通过',
  timeout_rejected: '超时拒绝',
};

const STATUS_COLORS: Record<ApprovalStatus, string> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
  auto_approved: 'processing',
  timeout_rejected: 'default',
};

// ── 事件类型 ──────────────────────────────────────────────────────
type EventType = 'additional_investment' | 'share_release';

const EVENT_LABELS: Record<EventType, string> = {
  additional_investment: '持股企业追加投资',
  share_release: '持股企业释放股份',
};

// ── 审批单数据结构 ────────────────────────────────────────────────
interface ApprovalRecord {
  id: string;
  eventType: EventType;
  status: ApprovalStatus;

  // 触发方
  sourceCompanyId: string;
  sourceCompanyName: string;
  sourceOwnerId: string;
  sourceOwnerUsername: string;
  sourceOwnerNickname: string;

  // 追加投资
  totalInvestAmount?: number;
  shareRatio?: number;
  investCurrency?: string;
  investAmount?: number;

  // 释放股份
  releaseRatio?: number;
  totalShareValue?: number;
  releaseCurrency?: string;
  releaseAmount?: number;

  // 时效
  createdAt: string;
  deadline: string;

  // 审批
  approvedByNickname?: string;
  approvedById?: string;
  approvedAt?: string;
  remark?: string;

  // 归属
  companyId: string;
  companyName: string;
}
```

- [ ] **Step 2: 生成 Mock 数据**

在类型定义之后添加：

```tsx
// ── Mock 企业 ─────────────────────────────────────────────────────
const MOCK_ENTERPRISES = [
  { id: 'ENT001', name: 'CyberBot', ownerId: 'U101', ownerUsername: 'zhang_wei', ownerNickname: '张伟' },
  { id: 'ENT002', name: 'StarLink', ownerId: 'U102', ownerUsername: 'li_na', ownerNickname: '李娜' },
  { id: 'ENT003', name: 'QuantumPay', ownerId: 'U103', ownerUsername: 'wang_fang', ownerNickname: '王芳' },
  { id: 'ENT004', name: 'NovaTech', ownerId: 'U104', ownerUsername: 'chen_jie', ownerNickname: '陈杰' },
];

const MOCK_APPROVALS: ApprovalRecord[] = Array.from({ length: 20 }, (_, i) => {
  const ent = MOCK_ENTERPRISES[i % 4];
  const isInvest = i % 2 === 0;
  const statusPool: ApprovalStatus[] = ['pending', 'approved', 'rejected', 'auto_approved', 'timeout_rejected'];
  const status = statusPool[i % 5];
  const hasApprover = status === 'approved' || status === 'rejected';
  const day = String(20 - i).padStart(2, '0');

  return {
    id: `APR${String(i + 1).padStart(5, '0')}`,
    eventType: isInvest ? 'additional_investment' : 'share_release',
    status,

    sourceCompanyId: ent.id,
    sourceCompanyName: ent.name,
    sourceOwnerId: ent.ownerId,
    sourceOwnerUsername: ent.ownerUsername,
    sourceOwnerNickname: ent.ownerNickname,

    ...(isInvest
      ? { totalInvestAmount: 100000 + i * 5000, shareRatio: 15 + (i % 20), investCurrency: 'USDT', investAmount: 15000 + i * 750 }
      : { releaseRatio: 5 + (i % 15), totalShareValue: 200000 + i * 10000, releaseCurrency: 'USDT', releaseAmount: 10000 + i * 500 }),

    createdAt: `2026-04-${day} ${String(9 + (i % 10)).padStart(2, '0')}:${String(i * 3 % 60).padStart(2, '0')}:00`,
    deadline: `2026-04-${String(Math.min(28, 20 - i + 3)).padStart(2, '0')} 18:00:00`,

    ...(hasApprover
      ? { approvedByNickname: 'Tom', approvedById: 'ADM001', approvedAt: `2026-04-${day} ${String(10 + (i % 8)).padStart(2, '0')}:30:00`, remark: status === 'rejected' ? '金额异常，需核实' : '' }
      : {}),

    companyId: 'COM001',
    companyName: '滴滴答答',
  };
});
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/finance/approvals/index.tsx
git commit -m "feat(approvals): 审批列表 — 类型定义与Mock数据"
```

---

### Task 3: 审批列表页面 — 筛选 + 表格 + 详情弹窗

**Files:**
- Modify: `src/pages/finance/approvals/index.tsx`

- [ ] **Step 1: 实现主组件（筛选 + 表格 + 操作 + 详情弹窗）**

在 Mock 数据之后添加组件代码：

```tsx
// ── 审批列表 Tab ──────────────────────────────────────────────────
const ApprovalListTab: React.FC = () => {
  const [eventFilter, setEventFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [companyFilter, setCompanyFilter] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[any, any] | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<ApprovalRecord | null>(null);

  // 企业选项（去重）
  const companyOptions = useMemo(() => {
    const map = new Map<string, string>();
    MOCK_APPROVALS.forEach((r) => map.set(r.sourceCompanyId, r.sourceCompanyName));
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, []);

  const filtered = useMemo(() => {
    return MOCK_APPROVALS.filter((r) => {
      if (eventFilter && r.eventType !== eventFilter) return false;
      if (statusFilter && r.status !== statusFilter) return false;
      if (companyFilter && r.sourceCompanyId !== companyFilter) return false;
      if (dateRange && dateRange[0] && dateRange[1]) {
        const start = dateRange[0].format('YYYY-MM-DD');
        const end = dateRange[1].format('YYYY-MM-DD');
        const day = r.createdAt.slice(0, 10);
        if (day < start || day > end) return false;
      }
      return true;
    });
  }, [eventFilter, statusFilter, companyFilter, dateRange]);

  const handleApprove = (record: ApprovalRecord) => {
    Modal.confirm({
      title: '确认通过',
      content: `确认通过 ${record.sourceCompanyName} 的${EVENT_LABELS[record.eventType]}申请？`,
      okText: '确认通过',
      cancelText: '取消',
      onOk: () => {
        message.success('审批已通过');
      },
    });
  };

  const handleReject = (record: ApprovalRecord) => {
    Modal.confirm({
      title: '确认拒绝',
      content: `确认拒绝 ${record.sourceCompanyName} 的${EVENT_LABELS[record.eventType]}申请？`,
      okText: '确认拒绝',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () => {
        message.success('审批已拒绝');
      },
    });
  };

  const showDetail = (record: ApprovalRecord) => {
    setCurrentRecord(record);
    setDetailOpen(true);
  };

  const businessSummary = (r: ApprovalRecord): string => {
    if (r.eventType === 'additional_investment') {
      return `总额 ${r.totalInvestAmount?.toLocaleString()} ${r.investCurrency}，占股 ${r.shareRatio}%，需投 ${r.investAmount?.toLocaleString()} ${r.investCurrency}`;
    }
    return `释放 ${r.releaseRatio}%，总股本 ${r.totalShareValue?.toLocaleString()} ${r.releaseCurrency}，金额 ${r.releaseAmount?.toLocaleString()} ${r.releaseCurrency}`;
  };

  const columns: ColumnsType<ApprovalRecord> = [
    { title: '审批开始', dataIndex: 'createdAt', width: 170, sorter: (a, b) => a.createdAt.localeCompare(b.createdAt) },
    { title: '审批截止', dataIndex: 'deadline', width: 170 },
    { title: '事件类型', dataIndex: 'eventType', width: 160, render: (v: EventType) => EVENT_LABELS[v] },
    { title: '企业名称', dataIndex: 'sourceCompanyName', width: 120 },
    { title: '企业ID', dataIndex: 'sourceCompanyId', width: 100 },
    { title: '企业主昵称', dataIndex: 'sourceOwnerNickname', width: 100 },
    { title: '企业主ID', dataIndex: 'sourceOwnerId', width: 90 },
    { title: '企业主用户名', dataIndex: 'sourceOwnerUsername', width: 120 },
    { title: '归属公司', dataIndex: 'companyName', width: 100 },
    { title: '归属公司ID', dataIndex: 'companyId', width: 110 },
    { title: '业务摘要', width: 280, render: (_: unknown, r: ApprovalRecord) => <Text style={{ fontSize: 12 }}>{businessSummary(r)}</Text> },
    {
      title: '审批状态', dataIndex: 'status', width: 100,
      render: (v: ApprovalStatus) => <Tag color={STATUS_COLORS[v]}>{STATUS_LABELS[v]}</Tag>,
    },
    { title: '审批人昵称', dataIndex: 'approvedByNickname', width: 100, render: (v?: string) => v || '-' },
    { title: '审批人ID', dataIndex: 'approvedById', width: 100, render: (v?: string) => v || '-' },
    { title: '审批时间', dataIndex: 'approvedAt', width: 170, render: (v?: string) => v || '-' },
    {
      title: '操作', width: 140, fixed: 'right' as const,
      render: (_: unknown, record: ApprovalRecord) => {
        if (record.status === 'pending') {
          return (
            <Space size={4}>
              <Button type="link" size="small" onClick={() => handleApprove(record)}>通过</Button>
              <Button type="link" size="small" danger onClick={() => handleReject(record)}>拒绝</Button>
            </Space>
          );
        }
        return <Button type="link" size="small" onClick={() => showDetail(record)}>查看详情</Button>;
      },
    },
  ];

  return (
    <>
      <Card bordered={false} style={{ borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW }}>
        <Space size={16} wrap align="center" style={{ marginBottom: 16 }}>
          <ConfigProvider theme={radioTheme}>
            <Radio.Group
              value={eventFilter ?? '全部'}
              onChange={(e) => setEventFilter(e.target.value === '全部' ? undefined : e.target.value)}
              buttonStyle="outline"
            >
              {[{ value: '全部', label: '全部类型' }, ...Object.entries(EVENT_LABELS).map(([value, label]) => ({ value, label }))].map((item) => (
                <Radio.Button key={item.value} value={item.value} style={(eventFilter ?? '全部') === item.value ? { color: '#1677ff', borderColor: '#1677ff' } : {}}>
                  {item.label}
                </Radio.Button>
              ))}
            </Radio.Group>
          </ConfigProvider>
          <ConfigProvider theme={radioTheme}>
            <Radio.Group
              value={statusFilter ?? '全部'}
              onChange={(e) => setStatusFilter(e.target.value === '全部' ? undefined : e.target.value)}
              buttonStyle="outline"
            >
              {[{ value: '全部', label: '全部状态' }, ...Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }))].map((item) => (
                <Radio.Button key={item.value} value={item.value} style={(statusFilter ?? '全部') === item.value ? { color: '#1677ff', borderColor: '#1677ff' } : {}}>
                  {item.label}
                </Radio.Button>
              ))}
            </Radio.Group>
          </ConfigProvider>
          <Select
            placeholder="触发方企业"
            value={companyFilter}
            onChange={setCompanyFilter}
            allowClear
            style={{ width: 160 }}
            options={companyOptions}
          />
          <RangePicker onChange={(dates) => setDateRange(dates as [any, any] | null)} />
        </Space>
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          size="middle"
          scroll={{ x: 2200 }}
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
          rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
        />
      </Card>

      {/* 详情弹窗 */}
      <Modal
        title={`审批详情 — ${currentRecord?.id}`}
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={600}
      >
        {currentRecord && (
          <Descriptions column={1} bordered size="small" style={{ marginTop: 16 }} labelStyle={{ whiteSpace: 'nowrap', width: 120 }}>
            <Descriptions.Item label="事件类型">{EVENT_LABELS[currentRecord.eventType]}</Descriptions.Item>
            <Descriptions.Item label="企业名称">{currentRecord.sourceCompanyName}</Descriptions.Item>
            <Descriptions.Item label="企业ID">{currentRecord.sourceCompanyId}</Descriptions.Item>
            <Descriptions.Item label="企业主昵称">{currentRecord.sourceOwnerNickname}</Descriptions.Item>
            <Descriptions.Item label="企业主ID">{currentRecord.sourceOwnerId}</Descriptions.Item>
            <Descriptions.Item label="企业主用户名">{currentRecord.sourceOwnerUsername}</Descriptions.Item>

            {currentRecord.eventType === 'additional_investment' && (
              <>
                <Descriptions.Item label="追加投资总金额">{currentRecord.totalInvestAmount?.toLocaleString()} {currentRecord.investCurrency}</Descriptions.Item>
                <Descriptions.Item label="本公司占股比例">{currentRecord.shareRatio}%</Descriptions.Item>
                <Descriptions.Item label="需投资金额">{currentRecord.investAmount?.toLocaleString()} {currentRecord.investCurrency}</Descriptions.Item>
              </>
            )}
            {currentRecord.eventType === 'share_release' && (
              <>
                <Descriptions.Item label="释放股份比例">{currentRecord.releaseRatio}%</Descriptions.Item>
                <Descriptions.Item label="总股本预估金额">{currentRecord.totalShareValue?.toLocaleString()} {currentRecord.releaseCurrency}</Descriptions.Item>
                <Descriptions.Item label="释放股份金额">{currentRecord.releaseAmount?.toLocaleString()} {currentRecord.releaseCurrency}</Descriptions.Item>
              </>
            )}

            <Descriptions.Item label="审批开始">{currentRecord.createdAt}</Descriptions.Item>
            <Descriptions.Item label="审批截止">{currentRecord.deadline}</Descriptions.Item>
            <Descriptions.Item label="审批状态">
              <Tag color={STATUS_COLORS[currentRecord.status]}>{STATUS_LABELS[currentRecord.status]}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="审批人昵称">{currentRecord.approvedByNickname || '-'}</Descriptions.Item>
            <Descriptions.Item label="审批人ID">{currentRecord.approvedById || '-'}</Descriptions.Item>
            <Descriptions.Item label="审批时间">{currentRecord.approvedAt || '-'}</Descriptions.Item>
            <Descriptions.Item label="备注">{currentRecord.remark || '-'}</Descriptions.Item>
            <Descriptions.Item label="归属公司">{currentRecord.companyName}</Descriptions.Item>
            <Descriptions.Item label="归属公司ID">{currentRecord.companyId}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </>
  );
};
```

- [ ] **Step 2: 实现主页面组件（Tab 容器）**

在 `ApprovalListTab` 组件之后添加：

```tsx
// ── 主页面 ────────────────────────────────────────────────────────
const ApprovalsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'list';

  const tabItems = [
    { key: 'list', label: '审批列表', children: <ApprovalListTab /> },
    { key: 'rules', label: '审批规则', children: <ApprovalRulesTab /> },
  ];

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
};

export default ApprovalsPage;
```

- [ ] **Step 3: 创建占位的 ApprovalRulesTab**

创建 `src/pages/finance/approvals/ApprovalRulesTab.tsx`：

```tsx
import { Card, Typography } from 'antd';
import React from 'react';

const CARD_SHADOW = '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)';
const CARD_RADIUS = 12;

const ApprovalRulesTab: React.FC = () => {
  return (
    <Card bordered={false} style={{ borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW }}>
      <Typography.Text type="secondary">审批规则配置（下一步实现）</Typography.Text>
    </Card>
  );
};

export default ApprovalRulesTab;
```

- [ ] **Step 4: 验证页面可访问**

```bash
cd /Users/miya/Documents/Project/group-admin-web && npx umi dev
```

在浏览器打开 `/finance/approvals`，切换角色为「公司主」，确认：
1. 侧边栏「设置中心」下出现「审批中心」菜单项
2. 审批列表 Tab 默认展示，表格有 20 条 Mock 数据
3. 筛选（事件类型、审批状态、企业下拉、日期范围）正常工作
4. 待审批记录显示「通过」「拒绝」按钮，点击弹出确认框
5. 其他状态记录显示「查看详情」，点击弹出详情弹窗
6. Tab 切换 URL 参数 `?tab=list` / `?tab=rules` 正常联动
7. 面包屑正确显示

- [ ] **Step 5: Commit**

```bash
git add src/pages/finance/approvals/index.tsx src/pages/finance/approvals/ApprovalRulesTab.tsx
git commit -m "feat(approvals): 审批列表页 — 筛选+表格+详情弹窗+Tab容器"
```

---

### Task 4: 审批规则 Tab — 规则列表 + 新增/编辑弹窗

**Files:**
- Modify: `src/pages/finance/approvals/ApprovalRulesTab.tsx`

- [ ] **Step 1: 实现完整的审批规则 Tab**

替换 `ApprovalRulesTab.tsx` 全部内容：

```tsx
import { PlusOutlined } from '@ant-design/icons';
import {
  Button, Card, ConfigProvider, Form, Input, Modal, Radio, Select,
  Space, Switch, Table, Tag, message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';

const CARD_SHADOW = '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)';
const CARD_RADIUS = 12;
const radioTheme = { components: { Radio: { colorPrimary: '#1677ff', buttonSolidCheckedBg: '#ffffff', buttonSolidCheckedColor: '#1677ff', buttonCheckedBg: '#ffffff' } } };

type EventType = 'additional_investment' | 'share_release';
type TriggerConditionType = 'amount' | 'company' | 'amount_and_company';

const EVENT_LABELS: Record<EventType, string> = {
  additional_investment: '持股企业追加投资',
  share_release: '持股企业释放股份',
};

const TRIGGER_LABELS: Record<TriggerConditionType, string> = {
  amount: '金额',
  company: '企业',
  amount_and_company: '金额+企业',
};

interface ApprovalRule {
  id: string;
  name: string;
  eventType: EventType;
  scope: string;
  triggerType: TriggerConditionType;
  conditions: { field: string; operator: string; value: string }[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  companyId: string;
}

// ── Mock 规则 ─────────────────────────────────────────────────────
const MOCK_ENTERPRISES_FOR_RULES = [
  { id: 'ENT001', name: 'CyberBot' },
  { id: 'ENT002', name: 'StarLink' },
  { id: 'ENT003', name: 'QuantumPay' },
  { id: 'ENT004', name: 'NovaTech' },
];

const initialRules: ApprovalRule[] = [
  {
    id: 'RULE001', name: '小额投资自动通过', eventType: 'additional_investment',
    scope: '全部企业', triggerType: 'amount',
    conditions: [{ field: 'investAmount', operator: '≤', value: '10000' }],
    enabled: true, createdAt: '2026-04-01 10:00:00', updatedAt: '2026-04-10 14:30:00', companyId: 'COM001',
  },
  {
    id: 'RULE002', name: 'CyberBot自动通过', eventType: 'share_release',
    scope: 'CyberBot', triggerType: 'company',
    conditions: [{ field: 'sourceCompanyId', operator: '=', value: 'ENT001' }],
    enabled: true, createdAt: '2026-04-02 11:00:00', updatedAt: '2026-04-08 09:00:00', companyId: 'COM001',
  },
  {
    id: 'RULE003', name: 'StarLink小额释放自动通过', eventType: 'share_release',
    scope: 'StarLink', triggerType: 'amount_and_company',
    conditions: [
      { field: 'sourceCompanyId', operator: '=', value: 'ENT002' },
      { field: 'releaseAmount', operator: '≤', value: '5000' },
    ],
    enabled: false, createdAt: '2026-04-05 16:00:00', updatedAt: '2026-04-05 16:00:00', companyId: 'COM001',
  },
];

const ApprovalRulesTab: React.FC = () => {
  const [rules, setRules] = useState<ApprovalRule[]>(initialRules);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ApprovalRule | null>(null);
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingRule(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (rule: ApprovalRule) => {
    setEditingRule(rule);
    form.setFieldsValue({
      name: rule.name,
      eventType: rule.eventType,
      triggerType: rule.triggerType,
      amountOperator: rule.conditions.find((c) => c.field.includes('Amount'))?.operator || '≤',
      amountValue: rule.conditions.find((c) => c.field.includes('Amount'))?.value || '',
      companyIds: rule.conditions.filter((c) => c.field === 'sourceCompanyId').map((c) => c.value),
      enabled: rule.enabled,
    });
    setModalOpen(true);
  };

  const handleDelete = (rule: ApprovalRule) => {
    Modal.confirm({
      title: '确认删除',
      content: `确认删除规则「${rule.name}」？`,
      okText: '删除',
      okButtonProps: { danger: true },
      onOk: () => {
        setRules((prev) => prev.filter((r) => r.id !== rule.id));
        message.success('已删除');
      },
    });
  };

  const handleToggle = (rule: ApprovalRule) => {
    setRules((prev) =>
      prev.map((r) =>
        r.id === rule.id
          ? { ...r, enabled: !r.enabled, updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) }
          : r,
      ),
    );
    message.success(rule.enabled ? '已停用' : '已启用');
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
      const conditions: { field: string; operator: string; value: string }[] = [];
      const amountField = values.eventType === 'additional_investment' ? 'investAmount' : 'releaseAmount';

      if (values.triggerType === 'amount' || values.triggerType === 'amount_and_company') {
        conditions.push({ field: amountField, operator: values.amountOperator, value: values.amountValue });
      }
      if (values.triggerType === 'company' || values.triggerType === 'amount_and_company') {
        (values.companyIds || []).forEach((cid: string) => {
          conditions.push({ field: 'sourceCompanyId', operator: '=', value: cid });
        });
      }

      const scopeNames = (values.companyIds || [])
        .map((cid: string) => MOCK_ENTERPRISES_FOR_RULES.find((e) => e.id === cid)?.name)
        .filter(Boolean)
        .join('、');

      if (editingRule) {
        setRules((prev) =>
          prev.map((r) =>
            r.id === editingRule.id
              ? { ...r, name: values.name, eventType: values.eventType, triggerType: values.triggerType, conditions, scope: scopeNames || '全部企业', enabled: values.enabled ?? r.enabled, updatedAt: now }
              : r,
          ),
        );
        message.success('已更新');
      } else {
        const newRule: ApprovalRule = {
          id: `RULE${String(rules.length + 1).padStart(3, '0')}`,
          name: values.name,
          eventType: values.eventType,
          triggerType: values.triggerType,
          scope: scopeNames || '全部企业',
          conditions,
          enabled: values.enabled ?? true,
          createdAt: now,
          updatedAt: now,
          companyId: 'COM001',
        };
        setRules((prev) => [newRule, ...prev]);
        message.success('已创建');
      }
      setModalOpen(false);
    });
  };

  const triggerTypeValue = Form.useWatch('triggerType', form);

  const columns: ColumnsType<ApprovalRule> = [
    { title: '创建时间', dataIndex: 'createdAt', width: 170, sorter: (a, b) => a.createdAt.localeCompare(b.createdAt) },
    { title: '更新时间', dataIndex: 'updatedAt', width: 170 },
    { title: '规则名称', dataIndex: 'name', width: 180 },
    { title: '适用事件类型', dataIndex: 'eventType', width: 160, render: (v: EventType) => EVENT_LABELS[v] },
    { title: '适用范围', dataIndex: 'scope', width: 140 },
    { title: '触发条件', dataIndex: 'triggerType', width: 120, render: (v: TriggerConditionType) => TRIGGER_LABELS[v] },
    {
      title: '启用状态', dataIndex: 'enabled', width: 90,
      render: (v: boolean) => <Tag color={v ? 'success' : 'default'}>{v ? '已启用' : '已停用'}</Tag>,
    },
    {
      title: '操作', width: 180, fixed: 'right' as const,
      render: (_: unknown, record: ApprovalRule) => (
        <Space size={4}>
          <Button type="link" size="small" onClick={() => handleEdit(record)}>编辑</Button>
          <Button type="link" size="small" onClick={() => handleToggle(record)}>
            {record.enabled ? '停用' : '启用'}
          </Button>
          <Button type="link" size="small" danger onClick={() => handleDelete(record)}>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card bordered={false} style={{ borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <div />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增规则</Button>
        </div>
        <Table
          columns={columns}
          dataSource={rules}
          rowKey="id"
          size="middle"
          scroll={{ x: 1200 }}
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
          rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
        />
      </Card>

      <Modal
        title={editingRule ? '编辑规则' : '新增规则'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        width={560}
        okText="保 存"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="规则名称" rules={[{ required: true, message: '请输入规则名称' }]}>
            <Input placeholder="例：小额投资自动通过" />
          </Form.Item>
          <Form.Item name="eventType" label="适用事件类型" rules={[{ required: true, message: '请选择事件类型' }]}>
            <Radio.Group>
              <Radio value="additional_investment">持股企业追加投资</Radio>
              <Radio value="share_release">持股企业释放股份</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="triggerType" label="触发条件类型" rules={[{ required: true, message: '请选择触发条件' }]}>
            <Radio.Group>
              <Radio value="amount">按金额</Radio>
              <Radio value="company">按企业</Radio>
              <Radio value="amount_and_company">按金额+企业</Radio>
            </Radio.Group>
          </Form.Item>

          {(triggerTypeValue === 'amount' || triggerTypeValue === 'amount_and_company') && (
            <Form.Item label="金额条件">
              <Space>
                <Form.Item name="amountOperator" noStyle initialValue="≤">
                  <Select style={{ width: 80 }} options={[{ value: '≤', label: '≤' }, { value: '≥', label: '≥' }]} />
                </Form.Item>
                <Form.Item name="amountValue" noStyle rules={[{ required: true, message: '请输入金额' }]}>
                  <Input placeholder="金额" style={{ width: 160 }} suffix="USDT" />
                </Form.Item>
              </Space>
            </Form.Item>
          )}

          {(triggerTypeValue === 'company' || triggerTypeValue === 'amount_and_company') && (
            <Form.Item name="companyIds" label="适用企业" rules={[{ required: true, message: '请选择企业' }]}>
              <Select
                mode="multiple"
                placeholder="选择企业"
                options={MOCK_ENTERPRISES_FOR_RULES.map((e) => ({ value: e.id, label: e.name }))}
              />
            </Form.Item>
          )}

          <Form.Item name="enabled" label="启用状态" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ApprovalRulesTab;
```

- [ ] **Step 2: 验证规则 Tab**

在浏览器中访问 `/finance/approvals?tab=rules`，确认：
1. 规则列表展示 3 条 Mock 数据
2. 列顺序：创建时间、更新时间、规则名称、适用事件类型、适用范围、触发条件、启用状态、操作
3. 点击「新增规则」弹出表单弹窗
4. 选择触发条件类型后，动态显示对应的条件输入区域
5. 编辑、启用/停用、删除操作正常
6. 面包屑显示「设置中心 / 审批中心 / 审批规则」

- [ ] **Step 3: Commit**

```bash
git add src/pages/finance/approvals/ApprovalRulesTab.tsx
git commit -m "feat(approvals): 审批规则Tab — 规则列表+新增编辑弹窗"
```

---

### Task 5: 文档同步

**Files:**
- Modify: `doc/page_map.md`
- Modify: `doc/changelog.md`

- [ ] **Step 1: 更新 page_map.md**

在财务模块区域添加：

```markdown
| `/finance/approvals` | 审批中心 | 财务 | Mock |
```

- [ ] **Step 2: 更新 changelog.md**

在文件顶部追加：

```markdown
## 2026-04-14
- **新增**：审批中心页面（`/finance/approvals`）
  - 审批列表 Tab：筛选（事件类型 Radio + 审批状态 Radio + 企业 Select + 日期范围）、表格展示完整审批单字段、通过/拒绝操作、详情弹窗
  - 审批规则 Tab：公司级自动审批规则配置，支持按金额/企业/组合条件，新增/编辑/启用停用/删除
  - Tab URL 联动 `?tab=list|rules`，面包屑映射
  - 权限配置：company_owner、company_ops 可访问
```

- [ ] **Step 3: Commit**

```bash
git add doc/page_map.md doc/changelog.md
git commit -m "docs: 审批中心 — 更新页面清单与变更记录"
```

---

## Self-Review Checklist

1. **Spec coverage**: 设计文档 9 个章节全部覆盖 —— 事件模型(Task2)、审批单结构(Task2)、状态机(Task2+3)、通知模版(Mock阶段不实现通知发送，仅展示状态)、自动审批规则(Task4)、Web审批页面(Task3)、IM机器人交互(不在Web端实现范围)、权限(Task1)、完整流程(通过Mock数据体现)
2. **Placeholder scan**: 无 TBD/TODO，所有步骤含完整代码
3. **Type consistency**: `ApprovalStatus`、`EventType`、`ApprovalRecord` 类型在 Task2 定义，Task3 使用一致；`ApprovalRule` 在 Task4 独立定义（独立文件），字段名一致
