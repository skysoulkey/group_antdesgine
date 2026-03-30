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

const { Text } = Typography;

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
  const navigate = useNavigate();

  // 绑定账号（可被修改页更新，mock 用 state 持有）
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  const filteredOrders = orders.filter((r) => {
    const matchType = typeFilter === '全部' || r.type === typeFilter;
    const matchStatus = statusFilter === '全部' || r.status === statusFilter;
    const matchDate =
      !dateRange || !dateRange[0] || !dateRange[1] ||
      (!dayjs(r.startTime).isBefore(dateRange[0].startOf('day')) &&
       !dayjs(r.startTime).isAfter(dateRange[1].endOf('day')));
    return matchType && matchStatus && matchDate;
  });

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
    </div>
  );
};

export default WalletPage;
