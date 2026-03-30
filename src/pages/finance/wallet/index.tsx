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
};

export default WalletPage;
