import { SwapOutlined } from '@ant-design/icons';
import {
  Button, Card, Col, ConfigProvider, DatePicker, Descriptions,
  Form, Input, InputNumber, message, Modal,
  Radio, Row, Space, Table, Tag, Typography, type InputRef,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import TableToolbar from '../../../components/TableToolbar';
import FilterField from '../../../components/FilterField';

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
type FlowStatus = 'success' | 'pending' | 'failed';

const WALLET_TYPE_LABELS: Record<WalletType, string> = {
  balance: '余额钱包',
  app: '应用钱包',
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

// 划转流水（页面只展示一种类型：内部划转）
interface TransferFlowRecord {
  id: string;
  flowId: string;
  createdAt: string;
  fromWallet: WalletType;
  toWallet: WalletType;
  amount: number;
  currency: 'USDT' | 'PEA';
  status: FlowStatus;
  operator: string;
  remark?: string;
}

// ── Mock 数据 ─────────────────────────────────────────────────────
const MOCK_BALANCES: WalletBalance[] = [
  { walletType: 'balance', walletName: '余额钱包', usdtBalance: 341234.00, peaBalance: 128500.00 },
  { walletType: 'app', walletName: '应用钱包', usdtBalance: 89230.00, peaBalance: 560000.00 },
];

// 仅生成划转记录（页面只保留划转流水，其他业务流水不在此页展示）
const MOCK_FLOW_DATA: TransferFlowRecord[] = Array.from({ length: 12 }, (_, i) => {
  const fromWallet: WalletType = i % 2 === 0 ? 'balance' : 'app';
  const toWallet: WalletType = fromWallet === 'balance' ? 'app' : 'balance';
  const statusPool: FlowStatus[] = ['success', 'success', 'success', 'pending', 'failed'];
  const status = statusPool[i % statusPool.length];
  const currency: 'USDT' | 'PEA' = i % 2 === 0 ? 'USDT' : 'PEA';
  const day = String(20 - i).padStart(2, '0');
  const operators = ['示例用户 A', '示例用户 B', '示例用户 C'];

  return {
    id: String(i + 1),
    flowId: `TF${String(i + 1).padStart(7, '0')}`,
    createdAt: `2026-04-${day} ${String(9 + (i % 10)).padStart(2, '0')}:${String((i * 3) % 60).padStart(2, '0')}:00`,
    fromWallet,
    toWallet,
    amount: 5000 + i * 3200,
    currency,
    status,
    operator: operators[i % 3],
    remark: i % 3 === 0 ? '月度资金划转' : '',
  };
});

// ── 主组件 ────────────────────────────────────────────────────────
const AllWalletPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRefresh = useCallback(() => { message.success('已刷新'); }, []);

  // 余额
  const [balances, setBalances] = useState<WalletBalance[]>(MOCK_BALANCES);

  // 流水数据
  const [flowData, setFlowData] = useState<TransferFlowRecord[]>(MOCK_FLOW_DATA);

  // 筛选
  const [walletFilter, setWalletFilter] = useState<string>('全部');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  const filteredData = useMemo(() => {
    return flowData.filter((r) => {
      if (walletFilter !== '全部') {
        // 钱包筛选：只要"从"或"到"任一端是该钱包，即命中
        const target: WalletType = walletFilter === '余额钱包' ? 'balance' : 'app';
        if (r.fromWallet !== target && r.toWallet !== target) return false;
      }
      if (dateRange && dateRange[0] && dateRange[1]) {
        const day = r.createdAt.slice(0, 10);
        if (day < dateRange[0].format('YYYY-MM-DD') || day > dateRange[1].format('YYYY-MM-DD')) return false;
      }
      return true;
    });
  }, [flowData, walletFilter, dateRange]);

  // 详情弹窗
  const [detailOpen, setDetailOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<TransferFlowRecord | null>(null);

  const showDetail = (record: TransferFlowRecord) => {
    setCurrentRecord(record);
    setDetailOpen(true);
  };

  // 划转弹窗
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferStep, setTransferStep] = useState<1 | 2>(1);
  const [transferForm] = Form.useForm();
  const transferMfaRef = useRef<InputRef>(null);

  const [fromWallet, setFromWallet] = useState<WalletType>('balance');
  const toWallet: WalletType = fromWallet === 'balance' ? 'app' : 'balance';

  const openTransfer = () => {
    setTransferStep(1);
    setFromWallet('balance');
    transferForm.resetFields();
    transferForm.setFieldsValue({ currency: 'USDT' });
    setTransferOpen(true);
  };

  const swapDirection = () => {
    setFromWallet((prev) => (prev === 'balance' ? 'app' : 'balance'));
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

    const currency: 'USDT' | 'PEA' = transferForm.getFieldValue('currency');
    const amount: number = transferForm.getFieldValue('amount');
    const remark: string = transferForm.getFieldValue('remark') ?? '';

    setBalances((prev) => prev.map((w) => {
      const field = currency === 'USDT' ? 'usdtBalance' : 'peaBalance';
      if (w.walletType === fromWallet) return { ...w, [field]: w[field] - amount };
      if (w.walletType === toWallet) return { ...w, [field]: w[field] + amount };
      return w;
    }));

    const ts = Date.now();
    const newFlow: TransferFlowRecord = {
      id: String(ts),
      flowId: `TF${String(ts).slice(-7)}`,
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      fromWallet,
      toWallet,
      amount,
      currency,
      status: 'success',
      operator: '当前用户',
      remark,
    };
    setFlowData((prev) => [newFlow, ...prev]);

    message.success('划转成功');
    setTransferOpen(false);
    transferForm.resetFields();
    setTransferStep(1);
  };

  // 表格列
  const columns: ColumnsType<TransferFlowRecord> = [
    {
      title: '订单时间', dataIndex: 'createdAt', width: 170,
      sorter: (a, b) => a.createdAt.localeCompare(b.createdAt),
      render: (v: string) => <span style={{ whiteSpace: 'nowrap' }}>{v}</span>,
    },
    { title: '流水号', dataIndex: 'flowId', width: 130 },
    {
      title: '划转方向', width: 200,
      render: (_: unknown, r: TransferFlowRecord) => (
        <span style={{ whiteSpace: 'nowrap', color: '#141414' }}>
          {WALLET_TYPE_LABELS[r.fromWallet]} → {WALLET_TYPE_LABELS[r.toWallet]}
        </span>
      ),
    },
    {
      title: '金额', dataIndex: 'amount', width: 130, align: 'right',
      render: (v: number) => (
        <span style={{ fontWeight: 400, color: '#141414' }}>
          {v.toLocaleString('en', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    { title: '币种', dataIndex: 'currency', width: 80 },
    { title: '操作人', dataIndex: 'operator', width: 120 },
    {
      title: '状态', dataIndex: 'status', width: 90,
      render: (v: FlowStatus) => <Tag color={FLOW_STATUS_COLORS[v]}>{FLOW_STATUS_LABELS[v]}</Tag>,
    },
    {
      title: '操作', width: 80, fixed: 'right' as const,
      render: (_: unknown, record: TransferFlowRecord) => (
        <Button type="link" size="small" onClick={() => showDetail(record)}>详情</Button>
      ),
    },
  ];

  const scrollX = columns.reduce((sum, c) => sum + ((c.width as number) || 120), 0);

  return (
    <div ref={containerRef}>
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

      {/* ── 流水记录 ──────────────────────────────────────────────────── */}
      <Card bordered={false} style={{ borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <Space size={16} wrap align="center">
            <FilterField label="钱包">
              <ConfigProvider theme={radioTheme}>
                <Radio.Group
                  value={walletFilter}
                  onChange={(e) => setWalletFilter(e.target.value)}
                  buttonStyle="solid"
                >
                  <Radio.Button value="全部">全部</Radio.Button>
                  <Radio.Button value="余额钱包">余额钱包</Radio.Button>
                  <Radio.Button value="应用钱包">应用钱包</Radio.Button>
                </Radio.Group>
              </ConfigProvider>
            </FilterField>
            <FilterField label="订单时间">
              <RangePicker placeholder={['从', '到']} onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null] | null)} />
            </FilterField>
          </Space>
          <Button type="primary" icon={<SwapOutlined />} onClick={openTransfer}>
            划转
          </Button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 14, fontWeight: 600 }}>划转流水</Text>
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

      {/* ── 详情弹窗 ──────────────────────────────────────────────────── */}
      <Modal
        title={`划转详情 — ${currentRecord?.flowId}`}
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={640}
      >
        {currentRecord && (
          <Descriptions column={1} bordered size="small" style={{ marginTop: 16 }} labelStyle={{ whiteSpace: 'nowrap', width: 140 }}>
            <Descriptions.Item label="流水号">{currentRecord.flowId}</Descriptions.Item>
            <Descriptions.Item label="订单时间">{currentRecord.createdAt}</Descriptions.Item>
            <Descriptions.Item label="转出钱包">{WALLET_TYPE_LABELS[currentRecord.fromWallet]}</Descriptions.Item>
            <Descriptions.Item label="转入钱包">{WALLET_TYPE_LABELS[currentRecord.toWallet]}</Descriptions.Item>
            <Descriptions.Item label="金额">{currentRecord.amount.toLocaleString('en', { minimumFractionDigits: 2 })} {currentRecord.currency}</Descriptions.Item>
            <Descriptions.Item label="币种">{currentRecord.currency}</Descriptions.Item>
            <Descriptions.Item label="操作人">{currentRecord.operator}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={FLOW_STATUS_COLORS[currentRecord.status]}>{FLOW_STATUS_LABELS[currentRecord.status]}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="备注">{currentRecord.remark || '—'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* ── 划转弹窗 ──────────────────────────────────────────────────── */}
      <Modal
        title={transferStep === 1 ? '划转' : '确认划转'}
        open={transferOpen}
        onCancel={() => { setTransferOpen(false); setTransferStep(1); }}
        footer={null}
        width={520}
        destroyOnClose
      >
        {transferStep === 1 ? (
          <Form form={transferForm} layout="vertical" style={{ marginTop: 16 }}
            initialValues={{ currency: 'USDT' }}>

            {/* 钱包方向选择器（左右布局） */}
            <Form.Item noStyle shouldUpdate={(prev, cur) => prev.currency !== cur.currency}>
              {({ getFieldValue }) => {
                const currency: 'USDT' | 'PEA' = getFieldValue('currency') ?? 'USDT';
                const fromBal = getBalanceForForm(fromWallet, currency);
                const toBal = getBalanceForForm(toWallet, currency);

                const walletCard = (type: 'from' | 'to', wt: WalletType, bal: number) => (
                  <div style={{
                    flex: 1,
                    background: type === 'from' ? '#fff7e6' : '#e6f7ff',
                    border: `1px solid ${type === 'from' ? '#ffd591' : '#91caff'}`,
                    borderRadius: 8,
                    padding: '12px 16px',
                  }}>
                    <Text style={{ fontSize: 12, color: type === 'from' ? '#d46b08' : '#0958d9', fontWeight: 600 }}>
                      {type === 'from' ? '转出' : '转入'}
                    </Text>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#141414', marginTop: 4 }}>
                      {WALLET_TYPE_LABELS[wt]}
                    </div>
                    <Text style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
                      {currency} 余额：{bal.toLocaleString('en', { minimumFractionDigits: 2 })}
                    </Text>
                  </div>
                );

                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    {walletCard('from', fromWallet, fromBal)}
                    <Button
                      shape="circle"
                      icon={<SwapOutlined />}
                      onClick={swapDirection}
                      style={{ flexShrink: 0, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
                    />
                    {walletCard('to', toWallet, toBal)}
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
              <Descriptions.Item label="转出钱包">{WALLET_TYPE_LABELS[fromWallet]}</Descriptions.Item>
              <Descriptions.Item label="转入钱包">{WALLET_TYPE_LABELS[toWallet]}</Descriptions.Item>
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
    </div>
  );
};

export default AllWalletPage;
