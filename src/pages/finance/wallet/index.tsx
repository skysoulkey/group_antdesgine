import { Column } from '@ant-design/plots';
import {
  CopyOutlined,
  FullscreenOutlined,
  QrcodeOutlined,
  ReloadOutlined,
  SearchOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Col,
  ConfigProvider,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Radio,
  Row,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useState } from 'react';

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

const CARD_SHADOW = '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)';
const BALANCE_USDT = 341_234_234.00;
const BALANCE_PEA  = 341_234_234.00;

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

// ── 主组件 ────────────────────────────────────────────────────────
const WalletPage: React.FC = () => {
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmt, setWithdrawAmt] = useState<number>(0);
  const [currencyFilter, setCurrencyFilter] = useState<'全部' | 'USDT' | 'PEA'>('全部');
  const [transferDateRange, setTransferDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [depositForm] = Form.useForm();
  const [withdrawForm] = Form.useForm();

  const { tax, final } = calcFee(withdrawAmt);

  // 打开转出弹窗（可从地址薄预填数据）
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

  // 表格列
  const transferCols: ColumnsType<TransferRow> = [
    { title: '发起时间', dataIndex: 'startTime', width: 160 },
    { title: '结束时间', dataIndex: 'endTime', width: 160 },
    { title: '订单编号', dataIndex: 'orderId', width: 90 },
    {
      title: '交易方式', dataIndex: 'method', width: 100,
      render: (v) => <Tag color="blue">{v}</Tag>,
    },
    { title: '接收账户', dataIndex: 'receiver', ellipsis: true },
    { title: '货币单位', dataIndex: 'currency', width: 80 },
    { title: '转出金额', dataIndex: 'amount', width: 110, align: 'right', render: (v) => <Text>{v}</Text> },
  ];


  const filteredTransfer = transferData.filter((r) => {
    const matchCurrency = currencyFilter === '全部' || r.currency === currencyFilter;
    const matchDate =
      !transferDateRange ||
      !transferDateRange[0] ||
      !transferDateRange[1] ||
      (!dayjs(r.startTime).isBefore(transferDateRange[0].startOf('day')) &&
        !dayjs(r.startTime).isAfter(transferDateRange[1].endOf('day')));
    return matchCurrency && matchDate;
  });

  // 地址薄
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

  // 右侧内容区（共用）
  const RightContent = ({ isTx }: { isTx: boolean }) => (
    <div style={{ flex: 1, overflow: 'hidden' }}>
      {/* 筛选 */}
      <Space style={{ marginBottom: 16 }} wrap>
        <Space size={0}>
          {(['全部', 'USDT', 'PEA'] as const).map(v => (
            <Button
              key={v}
              size="small"
              type={currencyFilter === v ? 'primary' : 'default'}
              style={{ borderRadius: v === '全部' ? '4px 0 0 4px' : v === 'PEA' ? '0 4px 4px 0' : '0', marginRight: 0 }}
              onClick={() => setCurrencyFilter(v)}
            >{v}</Button>
          ))}
        </Space>
        <Input placeholder="订单编号，订单备注" suffix={<SearchOutlined />} style={{ width: 200 }} />
        <RangePicker
            placeholder={['开始时间', '结束时间']}
            style={{ width: 240 }}
            onChange={(dates) => setTransferDateRange(dates as any)}
          />
      </Space>

      {/* 统计数字 */}
      {isTx && (
        <div style={{ background: '#fafafa', borderRadius: 8, padding: '10px 16px', marginBottom: 16, fontSize: 13 }}>
          <Space split={<Divider type="vertical" />}>
            <Space>
              <Text type="secondary">总转出（USDT）<Tooltip title="所有币种折算USDT之和"><span style={{ cursor: 'help' }}>ⓘ</span></Tooltip>：</Text>
              <Text>234,234,244.00</Text>
            </Space>
            <Space>
              <Text type="secondary">转出（USDT）：</Text>
              <Text>234,234,244.00</Text>
            </Space>
            <Space>
              <Text type="secondary">转出（PEA）：</Text>
              <Text>234,234,244.00</Text>
            </Space>
          </Space>
        </div>
      )}

      {/* 图表区 */}
      {isTx && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={24}>
            <Card bordered={false} style={{ borderRadius: 8, boxShadow: CARD_SHADOW }}>
              <Text style={{ fontSize: 13, fontWeight: 600 }}>每月转出总额</Text>
              <div style={{ marginTop: 8 }}>
                <Column
                  data={monthlyData}
                  xField="month"
                  yField="value"
                  colorField="type"
                  stack
                  height={333}
                  scale={{ color: { range: ['#722ed1', '#b37feb'] }, y: { domain: [0, 100], nice: false }, x: { paddingInner: 0.6 } }}
                  axis={{ x: { labelFontSize: 11 }, y: { labelFontSize: 11 } }}
                  legend={{ position: 'top-right' }}
                  tooltip={{ items: [{ channel: 'y', valueFormatter: (v: number) => `${v}次` }] }}
                />
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* 表格标题 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ fontSize: 14, fontWeight: 600 }}>{isTx ? '转出记录' : '充值记录'}</Text>
        <Space>
          <ReloadOutlined style={{ cursor: 'pointer', color: '#888' }} />
        </Space>
      </div>

      <Table
        columns={transferCols}
        dataSource={filteredTransfer}
        rowKey="id"
        size="small"
        scroll={{ x: 900 }}
        pagination={{ pageSize: 5, showTotal: (t) => `总共 ${t} 个项目`, showSizeChanger: true, pageSizeOptions: ['5', '10', '20'] }}
        rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
      />
    </div>
  );

  // ── 充值记录独立内容区 ─────────────────────────────────────────
  const [depCurrency, setDepCurrency] = useState<string>('全部');
  const [depStatus, setDepStatus] = useState<string>('全部');
  const [depSearch, setDepSearch] = useState('');
  const [depDateRange, setDepDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  const filteredDeposit = depositData.filter((r) => {
    const kw = depSearch.toLowerCase();
    const matchDate =
      !depDateRange ||
      !depDateRange[0] ||
      !depDateRange[1] ||
      (!dayjs(r.arrivalTime).isBefore(depDateRange[0].startOf('day')) &&
        !dayjs(r.arrivalTime).isAfter(depDateRange[1].endOf('day')));
    return (
      (depCurrency === '全部' || r.currency === depCurrency) &&
      (depStatus === '全部' || r.status === depStatus) &&
      matchDate &&
      (!kw || r.orderId.includes(kw) || r.account.toLowerCase().includes(kw) || r.remark.toLowerCase().includes(kw))
    );
  });

  const depositCols: ColumnsType<DepositRow> = [
    { title: '到账时间', dataIndex: 'arrivalTime', width: 160 },
    { title: '订单编号', dataIndex: 'orderId', width: 90 },
    { title: '充值账号', dataIndex: 'account', ellipsis: true },
    {
      title: '状态', dataIndex: 'status', width: 130,
      render: (v: DepositStatus) => {
        const colorMap: Record<DepositStatus, string> = { '充值成功': 'success', '充值失败': 'error' };
        return <Tag color={colorMap[v]}>{v}</Tag>;
      },
    },
    { title: '货币单位', dataIndex: 'currency', width: 80 },
    {
      title: '充值金额', dataIndex: 'amount', align: 'right', width: 120,
      sorter: (a, b) => a.amount - b.amount,
      render: (v) => v.toLocaleString('en', { minimumFractionDigits: 2 }),
    },
    {
      title: '集团余额', dataIndex: 'balance', align: 'right', width: 120,
      render: (v) => v.toLocaleString('en', { minimumFractionDigits: 2 }),
    },
    {
      title: '免税额度', dataIndex: 'taxExempt', align: 'right', width: 110,
      render: (v) => v.toLocaleString('en', { minimumFractionDigits: 2 }),
    },
    { title: '备注', dataIndex: 'remark', width: 130, ellipsis: true },
  ];

  const DepositContent = () => (
    <div>
      <Space direction="vertical" size={12} style={{ display: 'flex', marginBottom: 16 }}>
        <Space size={24} wrap align="center">
          <ConfigProvider theme={{ components: { Radio: { colorPrimary: '#722ed1', buttonSolidCheckedBg: '#ffffff', buttonSolidCheckedColor: '#722ed1', buttonCheckedBg: '#ffffff' } } }}>
            <Radio.Group value={depCurrency} onChange={(e) => setDepCurrency(e.target.value)} buttonStyle="outline">
              {['全部', 'USDT', 'PEA'].map((v) => (
                <Radio.Button key={v} value={v} style={depCurrency === v ? { color: '#722ed1', borderColor: '#722ed1' } : {}}>{v}</Radio.Button>
              ))}
            </Radio.Group>
          </ConfigProvider>
          <RangePicker
              placeholder={['开始时间', '结束时间']}
              style={{ width: 240 }}
              onChange={(dates) => setDepDateRange(dates)}
          />
        </Space>
        <Space size={24} wrap align="center">
          <ConfigProvider theme={{ components: { Radio: { colorPrimary: '#722ed1', buttonSolidCheckedBg: '#ffffff', buttonSolidCheckedColor: '#722ed1', buttonCheckedBg: '#ffffff' } } }}>
            <Radio.Group value={depStatus} onChange={(e) => setDepStatus(e.target.value)} buttonStyle="outline">
              {['全部', ...DEPOSIT_STATUSES].map((v) => (
                <Radio.Button key={v} value={v} style={depStatus === v ? { color: '#722ed1', borderColor: '#722ed1' } : {}}>{v}</Radio.Button>
              ))}
            </Radio.Group>
          </ConfigProvider>
          <Input
              placeholder="充值账号，订单编号，备注"
              value={depSearch}
              onChange={(e) => setDepSearch(e.target.value)}
              allowClear
              suffix={<SearchOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
              style={{ width: 240 }}
          />
        </Space>
      </Space>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ fontSize: 14, fontWeight: 600 }}>充值记录</Text>
        <Space>
          <ReloadOutlined style={{ cursor: 'pointer', color: '#888' }} />
          <SettingOutlined style={{ cursor: 'pointer', color: '#888' }} />
          <FullscreenOutlined style={{ cursor: 'pointer', color: '#888' }} />
        </Space>
      </div>

      <Table
        columns={depositCols}
        dataSource={filteredDeposit}
        rowKey="id"
        size="small"
        scroll={{ x: 1100 }}
        pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条`, showSizeChanger: true, pageSizeOptions: ['10', '20'] }}
        rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
      />
    </div>
  );

  const tabItems = [
    {
      key: 'transfer',
      label: '转出记录',
      children: (
        <div style={{ display: 'flex', gap: 20 }}>
          <AddressBook />
          <RightContent isTx={true} />
        </div>
      ),
    },
    {
      key: 'deposit',
      label: '充值记录',
      children: <DepositContent />,
    },
  ];

  return (
    <div>
      {/* 顶部信息 */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {/* 左：头像 + 名称 + ID */}
          <Space size={14} align="start">
            <Avatar size={52} style={{ background: '#f0f0f0', color: '#888', fontSize: 22, flexShrink: 0 }}>U</Avatar>
            <div>
              <Title level={4} style={{ margin: 0, lineHeight: 1.3 }}>UU talk</Title>
              <Space size={6} style={{ marginTop: 4 }}>
                <Text type="secondary" style={{ fontSize: 12, fontFamily: 'monospace' }}>UHBOWu...nhfi8974nnf</Text>
                <Tooltip title="复制ID">
                  <CopyOutlined style={{ fontSize: 12, color: '#722ed1', cursor: 'pointer' }}
                    onClick={() => { navigator.clipboard.writeText('UHBOWunhfi8974nnf'); message.success('已复制'); }} />
                </Tooltip>
              </Space>
            </div>
          </Space>

          {/* 右：总折合 */}
          <div style={{ textAlign: 'right' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>总结余折合（USDT）</Text>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#141414', lineHeight: 1.4 }}>
              {BALANCE_USDT.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <Divider style={{ margin: '14px 0' }} />

        {/* 余额行 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          {/* USDT */}
          <Space size={6} align="center">
            <Tag color="purple" style={{ fontSize: 13, padding: '2px 10px', marginRight: 0 }}>USDT</Tag>
            <Text style={{ fontSize: 22, fontWeight: 700 }}>
              {BALANCE_USDT.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Text>
          </Space>

          {/* PEA */}
          <Space size={6} align="center">
            <Tag color="default" style={{ fontSize: 13, padding: '2px 10px', marginRight: 0 }}>PEA</Tag>
            <Text style={{ fontSize: 22, fontWeight: 700 }}>
              {BALANCE_PEA.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Text>
          </Space>

          {/* 操作按钮 */}
          <Space size={8} align="center">
            <Button size="small" style={{ background: '#722ed1', borderColor: '#722ed1', color: '#fff' }}
              onClick={() => setDepositOpen(true)}>充值</Button>
            <Button size="small" style={{ background: '#9254de', borderColor: '#9254de', color: '#fff' }}
              onClick={() => openWithdrawModal()}>转账</Button>
          </Space>

          {/* 日期 */}
          <Text type="secondary" style={{ fontSize: 12 }}>2025-12-12 周一 12:12:12</Text>
        </div>
      </Card>

      {/* Tabs */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
        <Tabs items={tabItems} />
      </Card>

      {/* ── 充值弹窗 ─────────────────────────────────────────────── */}
      <Modal
        title="充值"
        open={depositOpen}
        onOk={() => depositForm.validateFields().then(() => { setDepositOpen(false); depositForm.resetFields(); })}
        onCancel={() => { setDepositOpen(false); depositForm.resetFields(); }}
        okText="确 定"
        cancelText="取 消"
        width={480}
      >
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
      </Modal>

      {/* ── 转出弹窗 ─────────────────────────────────────────────── */}
      <Modal
        title="转出"
        open={withdrawOpen}
        onOk={() => withdrawForm.validateFields().then(() => { setWithdrawOpen(false); withdrawForm.resetFields(); setWithdrawAmt(0); })}
        onCancel={() => { setWithdrawOpen(false); withdrawForm.resetFields(); setWithdrawAmt(0); }}
        okText="确定转出"
        cancelText="取 消"
        width={520}
      >
        <Form form={withdrawForm} layout="vertical" style={{ marginTop: 16 }}>

          <Form.Item label="账户备注" name="accountNote">
            <Input placeholder="Miya" />
          </Form.Item>

          <Form.Item label="转至账户" name="receiver" rules={[{ required: true, message: '请填写转至账户' }]}>
            <Input placeholder="@KjidnfHJNDO8nd" />
          </Form.Item>

          <Form.Item label="转出金额" name="amount" rules={[{ required: true, message: '请输入转出金额' }]}>
            <Space.Compact style={{ width: '100%' }}>
              <Select defaultValue="USDT" style={{ width: 90 }} options={[{ value: 'USDT', label: 'USDT' }, { value: 'PEA', label: 'PEA' }]} />
              <InputNumber
                style={{ flex: 1 }}
                placeholder="请输入数字"
                min={0}
                precision={2}
                onChange={(v) => setWithdrawAmt(v ?? 0)}
              />
            </Space.Compact>
            <div style={{ fontSize: 12, color: '#888', marginTop: 4, textAlign: 'right' }}>
              当前余额：{CURRENT_BALANCE.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDT
            </div>
          </Form.Item>

          {/* ─ 转账费用分段 ─ */}
          <div style={{ marginBottom: 16 }}>
            <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 12 }}>转账费用</Text>
            {/* 用 CSS Grid 保证两行输入框左对齐 */}
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', rowGap: 6, columnGap: 12, alignItems: 'center' }}>
              {/* 交易税费 */}
              <Text style={{ fontSize: 13, color: '#ff4d4f' }}>* 交易税费</Text>
              <div style={{ background: '#f5f5f5', border: '1px solid #d9d9d9', borderRadius: 4, padding: '5px 11px', fontSize: 13 }}>
                {tax.toFixed(2)} USDT
              </div>

              {/* 免税额度 + 税率同行两端对齐 */}
              <div />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary" style={{ fontSize: 12 }}>免税额度：1000.00 USDT</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>税率：5%</Text>
              </div>
            </div>
          </div>

          <Divider style={{ margin: '0 0 16px' }} />

          {/* ─ 预计最终到账 ─ */}
          <Form.Item label={<Text strong>预计最终到账</Text>}>
            <div style={{ display: 'flex', height: 32 }}>
              <Select
                defaultValue="USDT"
                style={{ width: 90, flexShrink: 0 }}
                options={[{ value: 'USDT', label: 'USDT' }]}
                disabled
              />
              <div style={{
                flex: 1,
                background: '#f5f5f5',
                border: '1px solid #d9d9d9',
                borderLeft: 'none',
                borderRadius: '0 4px 4px 0',
                padding: '0 11px',
                fontSize: 14,
                fontWeight: 600,
                color: '#722ed1',
                display: 'flex',
                alignItems: 'center',
              }}>
                {final.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 4, textAlign: 'right' }}>
              预计转出后本账户剩余：{CURRENT_BALANCE.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDT
            </div>
          </Form.Item>

          <Form.Item label="转账备注" name="remark">
            <Input.TextArea rows={3} placeholder="不超过30个字" maxLength={30} showCount />
          </Form.Item>

          {/* 说明 */}
          <div style={{ background: '#fafafa', borderRadius: 6, padding: '10px 14px', fontSize: 12, color: 'rgba(0,0,0,0.65)' }}>
            <div style={{ marginBottom: 4 }}>转出说明：</div>
            <div>1、使用移动端扫码可以进行转账。</div>
            <div>2、转账实时到账，到账后刷新钱包页面可以看到当前余额。</div>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default WalletPage;
