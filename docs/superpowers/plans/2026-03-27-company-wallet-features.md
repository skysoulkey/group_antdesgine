# Company Wallet Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Three coordinated changes: (1) clean blockchain features from group wallet page, (2) add "创建公司" modal to company list, (3) create a new company wallet page visible only to company_admin.

**Architecture:** All changes are frontend-only mock UI. No API calls. Each task is independent—they can be done in any order. Task 3 requires Task 4 (routing/menu/auth wiring) to be visible in the app.

**Tech Stack:** React 18, Umi 4, Ant Design 5, @ant-design/plots, TypeScript

---

## File Map

**Modified:**
- `src/pages/finance/wallet/index.tsx` — Remove chain imports, data, UI, modals
- `src/pages/company/list/index.tsx` — Add "创建公司" button + modal
- `src/layouts/index.tsx` — Add company wallet menu item + breadcrumb
- `src/utils/auth.ts` — Add `/finance/my-wallet` route permission
- `.umirc.ts` — Add company wallet route

**Created:**
- `src/pages/finance/my-wallet/index.tsx` — New company wallet page (company_admin POV)
- `docs/superpowers/specs/2026-03-27-company-creation-design.md` — First-login flow doc

---

## Task 1: Clean Up Group Wallet — Remove Blockchain Features

**Files:**
- Modify: `src/pages/finance/wallet/index.tsx`

Read `src/styles/dev-pitfalls.md` and `src/styles/design-spec.md` before making changes.

### What to remove vs keep

**Remove entirely:**
- `Pie` import from `@ant-design/plots`
- `QrcodeOutlined` import from `@ant-design/icons`
- `Popover` import from `antd`
- `pieData` constant
- `CHAIN_FEE` constant
- `depositMethod` state (`useState<'链上充值' | '平台收款'>`)
- `withdrawMethod` state (`useState<'平台转出' | '链上转出'>`)
- `fee` from `calcFee` destructure (simplify the function)
- Chain entries from `addressBook` (entries with `type: 'chain'`)
- Chain address section in `AddressBook` component (the `▾ 链上地址` block)
- Pie chart `<Col span={8}>` in the `RightContent` charts area
- QR code `<Popover>` in the header card (lines ~511–524)
- `depositMethod` selector `<Form.Item label="充值方式">` from deposit modal
- Entire chain deposit form branch (`depositMethod === '链上充值'`)
- `<Segmented>` method switcher from withdraw modal
- Chain receiver field branch (TRC20 protocol selector)
- Chain fee row `{withdrawMethod === '链上转出' && (...)}` from withdraw modal
- Chain transfer instructions from withdraw modal

**Keep and simplify:**
- `TAX_RATE`, `TAX_EXEMPT` (platform transfers still have tax)
- `withdrawAmt` state (still needed for tax calculation)
- `depositForm`, `withdrawForm`, `depositOpen`, `withdrawOpen` states
- `calcFee` — simplify to remove the `fee`/`CHAIN_FEE` calculation
- Address book user section (`▾ 平台用户`)
- Monthly column chart (expand from `span={16}` to `span={24}`)
- Both tabs (转出记录, 充值记录)
- Deposit modal — keep only the platform收款 branch as the default form
- Withdraw modal — keep platform form, keep tax section (remove only chain fee row)

- [ ] **Step 1: Simplify `calcFee`, remove `CHAIN_FEE`, update destructure**

Replace lines ~136–159:
```typescript
const TAX_RATE = 0.05;
const TAX_EXEMPT = 1000;

function calcFee(amount: number) {
  const taxable = Math.max(0, amount - TAX_EXEMPT);
  const tax = parseFloat((taxable * TAX_RATE).toFixed(2));
  return { tax, final: amount + tax };
}

// Inside WalletPage component:
const { tax, final } = calcFee(withdrawAmt);
```

- [ ] **Step 2: Remove chain address entries, simplify `AddressItem` interface**

Replace the `addressBook` and `AddressItem`:
```typescript
interface AddressItem { id: string; name: string; account: string }
const addressBook: AddressItem[] = [
  { id: '6', name: 'Miya', account: 'ji****1111' },
  { id: '7', name: 'Miya', account: 'ji****1111' },
  { id: '8', name: 'Miya', account: 'ji****1111' },
];
```

- [ ] **Step 3: Update `transferData` — remove chain method**

```typescript
const transferData: TransferRow[] = Array.from({ length: 15 }, (_, i) => ({
  id: `T${String(i + 1).padStart(7, '0')}`,
  startTime: `2025-10-10 12:23:23`,
  endTime: `2025-10-10 12:23:23`,
  orderId: String(73720 + i),
  method: '转账用户' as const,
  receiver: `Miya（@MI）`,
  currency: i % 2 === 0 ? 'USDT' : 'PEA',
  amount: i % 2 === 0 ? '873,233' : '73,233',
}));
```

Update `TransferRow.method` type: `method: '转账用户'`

- [ ] **Step 4: Update `depositData` — remove chain method**

Change mock data so all entries use `method: '平台充值'` and update `account` to platform style:
```typescript
method: '平台充值' as const,
account: `Miya（@MI）`,
```

Update `DepositRow.method` type: `method: '平台充值'`

- [ ] **Step 5: Remove `pieData`**

Delete the `pieData` array (4 lines).

- [ ] **Step 6: Remove chain imports**

From `@ant-design/plots` imports: remove `Pie`.
From `@ant-design/icons` imports: remove `QrcodeOutlined`.
From `antd` imports: remove `Popover`.

- [ ] **Step 7: Remove `depositMethod` and `withdrawMethod` states**

Delete these two `useState` lines. Also delete the `setDepositMethod` calls in the header balance row buttons (just call `setDepositOpen(true)` directly).

- [ ] **Step 8: Simplify `openWithdrawModal` — remove method parameter**

```typescript
const openWithdrawModal = (receiver?: string, note?: string) => {
  setWithdrawAmt(0);
  withdrawForm.resetFields();
  if (receiver || note) {
    setTimeout(() => {
      withdrawForm.setFieldsValue({ receiver, accountNote: note });
    }, 0);
  }
  setWithdrawOpen(true);
};
```

Update all call sites: `openWithdrawModal('平台转出', ...)` → `openWithdrawModal(...)`.

- [ ] **Step 9: Simplify `AddressBook` component**

Replace the entire `AddressBook` component body:
```tsx
const AddressBook = () => (
  <div style={{ width: 260, flexShrink: 0, borderRight: '1px solid #f0f0f0', paddingRight: 16 }}>
    <Text strong style={{ fontSize: 14 }}>地址薄</Text>
    <Input prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />} placeholder="请输入名称" size="small" style={{ margin: '10px 0', borderRadius: 6 }} />

    <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', marginBottom: 8 }}>▾ 平台用户</div>
    {addressBook.map(a => (
      <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #fafafa' }}>
        <Space size={6}>
          <Avatar size={28} icon={<UserOutlined />} style={{ background: '#e6f4ff' }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>{a.name}</div>
            <div style={{ fontSize: 11, color: '#888' }}>{a.account}</div>
          </div>
        </Space>
        <Space size={4}>
          <Button type="primary" size="small"
            style={{ fontSize: 11, height: 22, padding: '0 6px', background: '#722ed1', borderColor: '#722ed1' }}
            onClick={() => openWithdrawModal(a.account, a.name)}>转账</Button>
        </Space>
      </div>
    ))}
  </div>
);
```

- [ ] **Step 10: Remove Pie chart, expand Column chart to full width**

In `RightContent`, in the `{isTx && (...)}` charts `<Row>`:
- Delete the `<Col span={8}>` Pie block entirely
- Change `<Col span={16}>` → `<Col span={24}>`

- [ ] **Step 11: Remove QR code Popover from header card**

In the header card, find the `<Popover>` block (shows QR on hover of `QrcodeOutlined` icon). Delete the entire `<Popover>...</Popover>` block. Keep only the copy icon and ID text.

- [ ] **Step 12: Simplify deposit modal — platform only**

Replace the deposit modal `<Form>` contents:
```tsx
<Form form={depositForm} layout="vertical" style={{ marginTop: 16 }}>
  <Form.Item label={<span><span style={{ color: '#ff4d4f' }}>* </span>集团平台账户</span>}>
    <div style={{ background: '#fafafa', border: '1px solid #d9d9d9', borderRadius: 4, padding: '4px 10px', fontSize: 13 }}>
      @KjidnfHJNDO8nd
    </div>
  </Form.Item>
  <div style={{ textAlign: 'center', margin: '12px 0' }}>
    <div style={{ display: 'inline-block', padding: 12, border: '1px solid #f0f0f0', borderRadius: 8 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
        {[0,1,2,3].map(i => <QrcodeOutlined key={i} style={{ fontSize: 88, color: '#141414', display: 'block' }} />)}
      </div>
    </div>
  </div>
  <div style={{ background: '#fafafa', borderRadius: 6, padding: '10px 14px', fontSize: 12, color: 'rgba(0,0,0,0.65)' }}>
    <Text style={{ fontSize: 12 }}>收款说明：</Text>
    <div>1、使用移动端扫码可以进行转账。</div>
    <div>2、转账实时到账，到账后刷新钱包页面可以看到当前余额。</div>
  </div>
</Form>
```

Note: `QrcodeOutlined` is re-added here for the QR placeholder in the deposit modal. Add it back to imports.

- [ ] **Step 13: Simplify withdraw modal — platform only**

In the withdraw modal `<Form>`:
1. Delete the `<Segmented>` method switcher block (lines ~662–673)
2. Delete the section title `<Text strong>` (line ~676)
3. Replace the `receiver` field to platform-only:
```tsx
<Form.Item label="转至账户" name="receiver" rules={[{ required: true, message: '请填写转至账户' }]}>
  <Input placeholder="@KjidnfHJNDO8nd" />
</Form.Item>
```
4. In the fee section, delete the chain fee row:
```tsx
{/* DELETE this block: */}
{withdrawMethod === '链上转出' && (
  <>
    <Text style={{ fontSize: 13, color: '#ff4d4f' }}>* 手续费</Text>
    ...
  </>
)}
```
5. Replace the instructions section at the bottom — keep only platform instructions:
```tsx
<div style={{ background: '#fafafa', borderRadius: 6, padding: '10px 14px', fontSize: 12, color: 'rgba(0,0,0,0.65)' }}>
  <div style={{ marginBottom: 4 }}>转出说明：</div>
  <div>1、使用移动端扫码可以进行转账。</div>
  <div>2、转账实时到账，到账后刷新钱包页面可以看到当前余额。</div>
</div>
```

- [ ] **Step 14: Remove `交易方式` filter from deposit records (`DepositContent`)**

In `DepositContent`, delete the entire `<Space size={8}>` block for `交易方式` filter (the Radio.Group with '全部'/'链上充值'/'平台充值').

Also delete:
- `const [depMethod, setDepMethod] = useState<string>('全部');`
- `(depMethod === '全部' || r.method === depMethod) &&` from `filteredDeposit`

- [ ] **Step 15: Simplify deposit records columns**

In `depositCols`, remove the `交易方式` column (it's always '平台充值' now, the column adds no value).

- [ ] **Step 16: Verify the page compiles and displays correctly**

Run: `npm run dev` (or existing dev command)

Check:
- Group wallet page loads without errors
- No chain addresses in address book
- Transfer records show only '转账用户'
- Deposit records show only '平台充值'
- Pie chart is gone; Column chart is full width
- Deposit modal shows only platform form (no method selector)
- Withdraw modal shows only platform form (no Segmented switcher, no chain fee row)
- QR code popover on wallet ID is gone

- [ ] **Step 17: Commit**

```bash
git add src/pages/finance/wallet/index.tsx
git commit -m "feat: 集团钱包去掉链上相关功能，仅保留平台充值/转账"
```

---

## Task 2: Add "创建公司" Modal to Company List

**Files:**
- Modify: `src/pages/company/list/index.tsx`

Read `src/styles/design-spec.md` before starting.

- [ ] **Step 1: Add new imports to company list**

Add to existing imports:
```typescript
import {
  Button,          // already imported
  Card,            // already imported
  Col,             // already imported
  ConfigProvider,  // already imported
  DatePicker,      // ADD
  Divider,         // ADD
  Form,            // ADD
  Input,           // ADD
  message,         // ADD
  Modal,           // ADD
  Row,             // already imported
  Segmented,       // already imported
  Select,          // ADD
  Space,           // already imported
  Switch,          // ADD
  Table,           // already imported
  Tooltip,         // already imported
  Typography,      // already imported
} from 'antd';
import { PlusOutlined, QrcodeOutlined, SearchOutlined } from '@ant-design/icons';
```

- [ ] **Step 2: Add mock data constants for the create form**

Below `mockData`, add:
```typescript
// 当前登录集团名称（mock）
const CURRENT_GROUP = 'UU Talk 集团';

// 密码复杂度校验
function validatePassword(_: unknown, value: string): Promise<void> {
  if (!value) return Promise.reject(new Error('请输入密码'));
  if (value.length < 8 || value.length > 30) return Promise.reject(new Error('密码长度为 8-30 位'));
  const types = [/[A-Z]/, /[a-z]/, /[0-9]/, /[!@#$%^&*_\-]/];
  const count = types.filter((r) => r.test(value)).length;
  if (count < 3)
    return Promise.reject(
      new Error('需包含大写字母、小写字母、数字、特殊字符（!@#$%^&*_-）中的至少 3 种'),
    );
  return Promise.resolve();
}
```

- [ ] **Step 3: Add state for the create modal**

Inside `CompanyListPage`, after existing state declarations:
```typescript
const [createOpen, setCreateOpen] = useState(false);
const [createForm] = Form.useForm();
// generated company ID shown in form (regenerated each time modal opens)
const [newCompanyId, setNewCompanyId] = useState('');
```

- [ ] **Step 4: Add helper to open the modal**

```typescript
const openCreateModal = () => {
  createForm.resetFields();
  setNewCompanyId(String(Math.floor(100000 + Math.random() * 900000)));
  setCreateOpen(true);
};
```

- [ ] **Step 5: Add the "创建公司" button to the toolbar row**

In the `<Row gutter={16}>` toolbar section, add a new `<Col>` with the button. Place it after the search input `<Col>`:
```tsx
<Col>
  <Button
    type="primary"
    icon={<PlusOutlined />}
    style={{ background: '#722ed1', borderColor: '#722ed1' }}
    onClick={openCreateModal}
  >
    创建公司
  </Button>
</Col>
```

- [ ] **Step 6: Add submit handler**

```typescript
const handleCreateSubmit = async () => {
  try {
    await createForm.validateFields();
    const values = createForm.getFieldsValue();
    // Add new company to mock data
    const newCompany: Company = {
      id: mockData.length + 1,
      companyId: newCompanyId,
      name: values.companyName,
      createdAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
      memberCount: 0,
      certEnterprises: 0,
      totalAssets: 0,
      enterpriseAssets: 0,
      taxRevenue: 0,
      shareRevenue: 0,
      gameRevenue: 0,
      commissionRevenue: 0,
      groupAllocated: 0,
      groupRecalled: 0,
    };
    mockData.push(newCompany);
    message.success('公司创建成功，管理员账号已生成');
    setCreateOpen(false);
    createForm.resetFields();
  } catch {
    // validation errors handled by form
  }
};
```

- [ ] **Step 7: Add the create company Modal (before `</Card>` closing tag)**

Add the modal after the `<Table>` and before the closing `</Card>`:
```tsx
<Modal
  title="创建公司"
  open={createOpen}
  onOk={handleCreateSubmit}
  onCancel={() => { setCreateOpen(false); createForm.resetFields(); }}
  okText="确认创建"
  cancelText="取 消"
  width={560}
  destroyOnClose
>
  <Form form={createForm} layout="vertical" style={{ marginTop: 16 }}>

    {/* ── 公司信息 ── */}
    <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 12 }}>公司信息</Text>

    <Form.Item label="公司名称" name="companyName" rules={[{ required: true, message: '请输入公司名称' }]}>
      <Input placeholder="请输入公司名称" />
    </Form.Item>

    <Row gutter={12}>
      <Col span={12}>
        <Form.Item label="公司 ID">
          <Input value={newCompanyId} disabled />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item label="所属集团">
          <Input value={CURRENT_GROUP} disabled />
        </Form.Item>
      </Col>
    </Row>

    <Divider style={{ margin: '12px 0' }} />

    {/* ── 管理员账号 ── */}
    <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 12 }}>管理员账号</Text>

    <Form.Item label="用户名" name="username" rules={[{ required: true, message: '请输入用户名' }]}>
      <Input placeholder="请输入用户名" />
    </Form.Item>

    <Form.Item
      label="登录密码"
      name="password"
      rules={[{ required: true, validator: validatePassword }]}
    >
      <Input.Password placeholder="8-30 位，需包含大/小写字母、数字、特殊字符中至少 3 种" />
    </Form.Item>

    <Form.Item
      label="再次输入密码"
      name="confirmPwd"
      rules={[
        { required: true, message: '请再次输入密码' },
        ({ getFieldValue }) => ({
          validator(_, value) {
            if (!value || getFieldValue('password') === value) return Promise.resolve();
            return Promise.reject(new Error('两次密码不一致'));
          },
        }),
      ]}
    >
      <Input.Password placeholder="请再次输入密码" />
    </Form.Item>

    <Row gutter={12}>
      <Col span={12}>
        <Form.Item label="手机号" name="phone">
          <Input placeholder="+65 8000 0000" />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item label="邮箱" name="email">
          <Input placeholder="admin@example.com" />
        </Form.Item>
      </Col>
    </Row>

    <Form.Item
      label="消息通知账号"
      name="notifyAccounts"
      rules={[{ required: true, message: '公司管理员必须配置消息通知账号' }]}
    >
      <Input placeholder="请输入 APP 用户名，如 @miya_miya" />
    </Form.Item>

    <Divider style={{ margin: '12px 0' }} />

    {/* ── 账号配置 ── */}
    <Row gutter={12}>
      <Col span={12}>
        <Form.Item label="账户有效期" name="validPeriod" initialValue="永久有效">
          <Select
            options={[
              { value: '永久有效', label: '永久有效' },
              { value: '自定义', label: '自定义' },
            ]}
            onChange={(v) => { if (v !== '自定义') createForm.setFieldValue('expireDate', undefined); }}
          />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item noStyle shouldUpdate={(p, c) => p.validPeriod !== c.validPeriod}>
          {({ getFieldValue }) =>
            getFieldValue('validPeriod') === '自定义' ? (
              <Form.Item label="到期时间" name="expireDate" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            ) : (
              <Form.Item label=" "><span /></Form.Item>
            )
          }
        </Form.Item>
      </Col>
    </Row>

    <Form.Item label="IP 限制" name="ipRestrict" valuePropName="checked">
      <Switch />
    </Form.Item>
    <Form.Item noStyle shouldUpdate={(p, c) => p.ipRestrict !== c.ipRestrict}>
      {({ getFieldValue }) =>
        getFieldValue('ipRestrict') ? (
          <Form.Item label="IP 白名单" name="ipWhitelist" rules={[{ required: true }]}>
            <Input.TextArea rows={2} placeholder="每行一个 IP 或 CIDR，如 104.28.0.0/16" />
          </Form.Item>
        ) : null
      }
    </Form.Item>

    <Divider style={{ margin: '12px 0' }} />

    {/* ── MFA 绑定（管理员首次登录时完成，此处预配置） ── */}
    <Form.Item label="绑定 MFA 设备" name="bindMfa" valuePropName="checked">
      <Switch />
    </Form.Item>
    <Form.Item noStyle shouldUpdate={(p, c) => p.bindMfa !== c.bindMfa}>
      {({ getFieldValue }) =>
        getFieldValue('bindMfa') ? (
          <div style={{ background: '#f9f0ff', border: '1px solid #d3adf7', borderRadius: 8, padding: 16, textAlign: 'center', marginBottom: 16 }}>
            <QrcodeOutlined style={{ fontSize: 64, color: '#722ed1', marginBottom: 8 }} />
            <div style={{ fontSize: 12, color: '#595959', marginBottom: 6 }}>
              请使用 Google Authenticator 或其他 TOTP 应用扫描二维码完成绑定
            </div>
            <div style={{ fontSize: 11, color: '#8c8c8c', background: '#fff', borderRadius: 4, padding: '4px 10px', display: 'inline-block', border: '1px solid #e8e8e8' }}>
              密钥：JBSWY3DPEHPK3PXP
            </div>
            <Form.Item
              name="mfaCode"
              rules={[{ required: true, len: 6, message: '请输入 6 位验证码' }]}
              style={{ marginTop: 12, marginBottom: 0 }}
            >
              <Input placeholder="输入 MFA 验证码确认绑定" maxLength={6} style={{ width: 220 }} />
            </Form.Item>
          </div>
        ) : null
      }
    </Form.Item>

  </Form>
</Modal>
```

- [ ] **Step 8: Verify the modal works**

Run dev server and check:
- "创建公司" button appears in company list toolbar (right side of search bar)
- Clicking opens the modal with company info section + admin section
- 公司 ID and 所属集团 fields are read-only / disabled
- Password validation shows error if < 8 chars or < 3 character types
- Confirm password shows error if mismatched
- 消息通知账号 is required
- 账户有效期 → 自定义 shows date picker
- IP 限制 toggle shows whitelist textarea
- MFA toggle shows QR code + secret + code input
- Submitting adds a row to the company list (mock)

- [ ] **Step 9: Commit**

```bash
git add src/pages/company/list/index.tsx
git commit -m "feat: 公司清单新增「创建公司」入口，含管理员账号表单及 MFA 配置"
```

---

## Task 3: Create Company Wallet Page (company_admin view)

**Files:**
- Create: `src/pages/finance/my-wallet/index.tsx`

Read `src/styles/design-spec.md` and `src/styles/dev-pitfalls.md` before starting.
Reference `src/pages/finance/company-wallet/index.tsx` for the existing pattern.

The new page differs from `company-wallet/index.tsx` in:
1. Adds a type filter (集团下拨 / 集团调回) on the history table
2. Uses `ConfigProvider` for `Segmented` per pitfalls doc (if Segmented is used)
3. Table amount column uses `fontWeight: 400` (no bold) per design spec

- [ ] **Step 1: Create the file with full content**

Create `src/pages/finance/my-wallet/index.tsx`:

```tsx
import { CopyOutlined, WalletOutlined } from '@ant-design/icons';
import {
  Card,
  Col,
  ConfigProvider,
  Descriptions,
  message,
  Row,
  Segmented,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';

const { Text } = Typography;

const CARD_SHADOW = '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)';

interface FlowRecord {
  id: string;
  type: '集团下拨' | '集团调回';
  currency: string;
  amount: string;
  operator: string;
  createdAt: string;
}

const flowData: FlowRecord[] = Array.from({ length: 12 }, (_, i) => ({
  id: `FL${String(i + 1).padStart(7, '0')}`,
  type: i % 3 === 2 ? '集团调回' : '集团下拨',
  currency: i % 2 === 0 ? 'USDT' : 'PEA',
  amount: `${(5000 + i * 3800).toLocaleString()}.00`,
  operator: ['Admin', 'FinanceManager', 'SuperAdmin'][i % 3],
  createdAt: `2026-0${(i % 3) + 1}-${String(i + 1).padStart(2, '0')} ${String(9 + (i % 8)).padStart(2, '0')}:00:00`,
}));

const MyWalletPage: React.FC = () => {
  const [currency, setCurrency] = useState<'USDT' | 'PEA'>('USDT');
  const [typeFilter, setTypeFilter] = useState<string>('全部');

  const filteredData = flowData.filter((r) => {
    const matchType = typeFilter === '全部' || r.type === typeFilter;
    const matchCurrency = currency === 'USDT' ? r.currency === 'USDT' : r.currency === 'PEA';
    return matchType && matchCurrency;
  });

  const columns: ColumnsType<FlowRecord> = [
    { title: '流水号', dataIndex: 'id', width: 110 },
    {
      title: '类型',
      dataIndex: 'type',
      width: 100,
      render: (v) => <Tag color={v === '集团下拨' ? 'blue' : 'orange'}>{v}</Tag>,
    },
    { title: '货币单位', dataIndex: 'currency', width: 80 },
    {
      title: '金额',
      dataIndex: 'amount',
      width: 130,
      align: 'right',
      render: (v) => <span style={{ fontWeight: 400, color: '#141414' }}>{v}</span>,
    },
    { title: '操作人', dataIndex: 'operator', width: 120 },
    { title: '时间', dataIndex: 'createdAt', width: 170 },
  ];

  const balanceMap = {
    USDT: '89,230.00',
    PEA: '560,000.00',
  };

  return (
    <div>
      {/* 余额卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#722ed118', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <WalletOutlined style={{ fontSize: 22, color: '#722ed1' }} />
              </div>
              <Text style={{ fontSize: 14, color: 'rgba(0,0,0,0.55)', fontWeight: 500 }}>USDT 余额</Text>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#141414', letterSpacing: -1 }}>
              89,230.00
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#722ed118', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <WalletOutlined style={{ fontSize: 22, color: '#722ed1' }} />
              </div>
              <Text style={{ fontSize: 14, color: 'rgba(0,0,0,0.55)', fontWeight: 500 }}>PEA 余额</Text>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#141414', letterSpacing: -1 }}>
              560,000.00
            </div>
          </Card>
        </Col>
      </Row>

      {/* 公司基础信息 */}
      <Card
        bordered={false}
        style={{ borderRadius: 12, boxShadow: CARD_SHADOW, marginBottom: 16 }}
        title="公司基础信息"
      >
        <Descriptions bordered column={{ xs: 1, sm: 2 }} size="middle">
          <Descriptions.Item label="公司名称">炸雷第一波</Descriptions.Item>
          <Descriptions.Item label="公司 ID">
            <Space>
              <Text>43215321432</Text>
              <CopyOutlined
                style={{ cursor: 'pointer', color: '#722ed1' }}
                onClick={() => {
                  navigator.clipboard.writeText('43215321432');
                  message.success('已复制');
                }}
              />
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="归属集团">UU Talk 集团</Descriptions.Item>
          <Descriptions.Item label="通知账号">@Miya_miya</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 历史流水 */}
      <Card
        bordered={false}
        style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}
        title="历史流水"
        extra={
          <Space>
            {/* 货币切换 */}
            <ConfigProvider
              theme={{
                components: {
                  Segmented: {
                    trackBg: '#f9f0ff',
                    itemSelectedBg: '#722ed1',
                    itemSelectedColor: '#ffffff',
                    itemColor: '#722ed1',
                  },
                },
              }}
            >
              <Segmented
                options={['USDT', 'PEA']}
                value={currency}
                onChange={(v) => setCurrency(v as 'USDT' | 'PEA')}
                style={{ fontWeight: 600 }}
              />
            </ConfigProvider>
            {/* 类型筛选 */}
            <Select
              value={typeFilter}
              onChange={setTypeFilter}
              style={{ width: 120 }}
              options={[
                { value: '全部', label: '全部类型' },
                { value: '集团下拨', label: '集团下拨' },
                { value: '集团调回', label: '集团调回' },
              ]}
            />
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          size="middle"
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
          rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
        />
      </Card>
    </div>
  );
};

export default MyWalletPage;
```

- [ ] **Step 2: Verify the file has no TypeScript errors**

Run: `npx tsc --noEmit` from the project root.
Expected: no errors related to the new file.

- [ ] **Step 3: Commit the new file**

```bash
git add src/pages/finance/my-wallet/index.tsx
git commit -m "feat: 新增公司钱包页面（company_admin 视角，只读余额 + 流水记录）"
```

---

## Task 4: Wire Up Routing, Menu, Auth, and Breadcrumb

**Files:**
- Modify: `.umirc.ts`
- Modify: `src/layouts/index.tsx`
- Modify: `src/utils/auth.ts`

All three changes are required for the new company wallet page to be accessible and correctly displayed.

- [ ] **Step 1: Add route to `.umirc.ts`**

In `.umirc.ts`, inside the `routes` array, after the `'/finance/wallet'` entry (line ~39), add:
```typescript
{ path: '/finance/my-wallet', component: 'finance/my-wallet/index' },
```

- [ ] **Step 2: Add menu item to `src/layouts/index.tsx`**

In `src/layouts/index.tsx`, in the `设置中心` menu children array, add the company wallet item **before** the `集团钱包` item:
```typescript
{ key: '/finance/my-wallet', label: '公司钱包', roles: ['company_admin'] },
{ key: '/finance/wallet',    label: '集团钱包', roles: ['group_admin'] },
```

This ensures each role sees only their own wallet menu item.

- [ ] **Step 3: Add breadcrumb to `src/layouts/index.tsx`**

In the `breadcrumbMap` object (around line 114), add:
```typescript
'/finance/my-wallet': ['设置中心', '公司钱包'],
```

- [ ] **Step 4: Add route permission to `src/utils/auth.ts`**

In `src/utils/auth.ts`, in the `ROUTE_PERMISSIONS` object, add:
```typescript
'/finance/my-wallet':      ['company_admin'],
```

Place it near the other `company_admin` routes for clarity.

- [ ] **Step 5: Verify the wiring works end-to-end**

Switch mock role to `company_admin` (via the role switcher in the header):
- "公司钱包" menu item appears under 设置中心
- "集团钱包" menu item does NOT appear
- Clicking "公司钱包" navigates to `/finance/my-wallet`
- Breadcrumb shows: 设置中心 > 公司钱包
- Page shows balance cards, company info, and history table with filters

Switch mock role to `group_admin`:
- "集团钱包" menu item appears under 设置中心
- "公司钱包" menu item does NOT appear
- Navigating directly to `/finance/my-wallet` redirects to `/403`

- [ ] **Step 6: Commit**

```bash
git add .umirc.ts src/layouts/index.tsx src/utils/auth.ts
git commit -m "feat: 公司钱包页面路由/菜单/权限接入，company_admin 专属可见"
```

---

## Task 5: Write First-Login Flow Design Document

**Files:**
- Create: `docs/superpowers/specs/2026-03-27-company-creation-design.md`

This documents the backend/full-stack requirements for the first-login flow that cannot be demonstrated in the frontend-only mock.

- [ ] **Step 1: Create the document**

```bash
mkdir -p docs/superpowers/specs
```

Create `docs/superpowers/specs/2026-03-27-company-creation-design.md`:

```markdown
# 公司创建与首次登录流程设计说明

> 本文档记录"创建公司"功能中，后端和全栈实现时需要遵守的业务规则及交互流程。
> 前端 Mock 阶段仅实现 UI 形态，以下流程需在真实后端接入时落地。

---

## 一、创建公司接口要求

### 创建公司时，后端需原子性完成以下操作：

1. **创建公司记录**
   - 公司 ID 由后端自动生成（不接受前端传入）
   - 归属集团 = 当前登录集团管理员所在集团（从 Token 中解析，不接受前端传入）
   - 公司钱包同步创建，初始余额为 0（USDT/PEA 各独立）

2. **创建公司管理员账号**
   - 角色固定为「公司管理员」
   - 归属公司 = 上述新建公司
   - 账号标记 `is_first_login = true`
   - 密码规则：8-30 位，须包含大写字母、小写字母、数字、特殊字符（`!@#$%^&*_-`）中的至少 3 种

3. **以上操作为同一事务，任一失败均需回滚**

---

## 二、公司管理员首次登录流程

### 流程节点

```
[输入用户名 + 初始密码]
      ↓ 登录验证通过
[后端检测 is_first_login = true]
      ↓
[前端跳转 MFA 绑定页]
      ↓
[展示 TOTP 二维码及 Base32 密钥]
  用户使用 Google Authenticator / Authy 等 TOTP App 扫码
      ↓
[用户输入 6 位 TOTP 验证码]
      ↓ 验证通过，后端绑定 MFA Secret
[进入系统主页]
      ↓ 后端检测 password_changed = false
[弹出强制修改密码弹窗（不可关闭）]
      ↓ 用户提交新密码（满足复杂度）
[后端更新密码，标记 password_changed = true]
      ↓
[正常使用系统]
```

### 后续正常登录流程

```
[输入用户名 + 密码] → [输入 6 位 TOTP 验证码] → [进入系统]
```

---

## 三、密码复杂度规则

| 规则 | 要求 |
|------|------|
| 最短长度 | 8 位 |
| 最长长度 | 30 位 |
| 字符类型 | 大写字母 / 小写字母 / 数字 / 特殊字符（`!@#$%^&*_-`）中至少满足 3 种 |
| 适用范围 | 初始密码设置（创建时）+ 首次登录修改密码 + 后续主动改密 |

---

## 四、MFA 相关实现说明

- TOTP 算法：RFC 6238，时间步长 30 秒，6 位数字
- 密钥格式：Base32 编码，后端生成并与账号关联存储
- 二维码 URI 格式：`otpauth://totp/{issuer}:{username}?secret={secret}&issuer={issuer}`
- 验证容错：允许前后 1 个时间窗口误差（共 3 个有效 code）

---

## 五、安全注意事项

1. MFA Secret 绑定成功前不可进入系统（防止跳过 MFA 绑定）
2. 密码修改弹窗不可通过 ESC 或点击遮罩关闭
3. 初始密码不能与用户名相同
4. 连续登录失败 5 次需锁定账号，等待管理员解锁

---

_文档创建时间：2026-03-27_
```

- [ ] **Step 2: Commit the document**

```bash
git add docs/superpowers/specs/2026-03-27-company-creation-design.md
git commit -m "docs: 新增公司创建与首次登录流程设计文档"
```

---

## Self-Review Checklist

### Spec coverage

| 需求 | 对应 Task |
|------|-----------|
| 集团管理员创建公司 + 同步创建管理员账号 | Task 2 |
| 密码规则 8-30 位，至少 3 种字符类型 | Task 2 Step 2 |
| 公司 ID 自动生成，归属集团自动关联 | Task 2 Step 7 |
| MFA 在首次登录时绑定（文档记录） | Task 5 |
| 首次登录流程：MFA → 进入系统 → 改密 | Task 5 |
| 公司管理员可查看公司钱包 | Task 3 + 4 |
| 公司钱包：仅查看余额 + 流水，无转账 | Task 3 |
| 公司钱包菜单权限控制 | Task 4 |
| 集团钱包去掉链上功能 | Task 1 |
| 集团钱包保留平台余额/充值/转账/历史/图表 | Task 1 |

All requirements have corresponding tasks. ✓

### Placeholder scan

No TBD, TODO, or "similar to Task N" references. ✓

### Type consistency

- `FlowRecord` in Task 3 matches the column definitions in Task 3 ✓
- `Company` interface in Task 2 matches `mockData` field usage ✓
- `openWithdrawModal` simplified signature used consistently in Task 1 ✓
