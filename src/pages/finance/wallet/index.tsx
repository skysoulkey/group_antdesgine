import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CopyOutlined,
  QrcodeOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Segmented,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useState } from 'react';

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

interface Transaction {
  id: number;
  orderId: string;
  type: 'deposit' | 'withdraw';
  method: string;
  amount: string;
  currency: string;
  status: 'success' | 'pending' | 'failed';
  account: string;
  remark: string;
  createdAt: string;
  arrivedAt: string;
}

const mockTxns: Transaction[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  orderId: `TXN${String(20251120001 + i).padStart(12, '0')}`,
  type: i % 3 === 0 ? 'withdraw' : 'deposit',
  method: i % 2 === 0 ? '链上充值' : '平台充值',
  amount: (10000 + i * 5321.5).toFixed(2),
  currency: ['USDT', 'PEA'][i % 2],
  status: (['success', 'success', 'pending', 'success', 'failed'] as const)[i % 5],
  account: i % 3 === 0 ? 'TBA293hjHUh9020sjdio293' : 'UU Talk',
  remark: i % 4 === 0 ? '月度下拨' : '',
  createdAt: `2025-11-${String(1 + (i % 30)).padStart(2, '0')} 12:12:12`,
  arrivedAt: `2025-11-${String(1 + (i % 30)).padStart(2, '0')} 12:15:00`,
}));

const statusMap = {
  success: { label: '成功', color: 'success' },
  pending: { label: '待确认', color: 'processing' },
  failed: { label: '失败', color: 'error' },
} as const;

const WalletPage: React.FC = () => {
  const [currency, setCurrency] = useState('USDT');
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [depositForm] = Form.useForm();
  const [withdrawForm] = Form.useForm();

  const walletAddress = 'TBA293hjHUh9020sjdio293';

  const txnColumns: ColumnsType<Transaction> = [
    { title: '订单编号', dataIndex: 'orderId', width: 160 },
    {
      title: '类型',
      dataIndex: 'type',
      width: 80,
      render: (v) =>
        v === 'deposit' ? (
          <Text style={{ color: '#52c41a' }}>
            <ArrowDownOutlined /> 充值
          </Text>
        ) : (
          <Text style={{ color: '#ff4d4f' }}>
            <ArrowUpOutlined /> 转出
          </Text>
        ),
    },
    { title: '充值方式', dataIndex: 'method', width: 100 },
    {
      title: '金额',
      dataIndex: 'amount',
      align: 'right',
      render: (v, r) => (
        <Text strong style={{ color: r.type === 'deposit' ? '#52c41a' : '#ff4d4f' }}>
          {r.type === 'deposit' ? '+' : '-'}
          {Number(v).toLocaleString('en', { minimumFractionDigits: 2 })}
        </Text>
      ),
    },
    { title: '币种', dataIndex: 'currency', width: 70 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (v: Transaction['status']) => (
        <Tag color={statusMap[v].color}>{statusMap[v].label}</Tag>
      ),
    },
    { title: '账户/地址', dataIndex: 'account', ellipsis: true },
    { title: '备注', dataIndex: 'remark', ellipsis: true },
    { title: '创建时间', dataIndex: 'createdAt', width: 170 },
    { title: '到账时间', dataIndex: 'arrivedAt', width: 170 },
  ];

  return (
    <div>
      {/* 钱包信息卡 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            bordered={false}
            style={{ borderRadius: 8, background: 'linear-gradient(135deg, #1677ff 0%, #0d53d6 100%)' }}
          >
            <div style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>集团钱包余额</div>
            <div style={{ color: '#fff', fontSize: 32, fontWeight: 700, marginBottom: 16 }}>
              178,283.09
              <span style={{ fontSize: 16, marginLeft: 8, fontWeight: 400 }}>USDT</span>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Segmented
                options={['USDT-TRC20', 'PEA']}
                value={currency === 'USDT' ? 'USDT-TRC20' : 'PEA'}
                onChange={(v) => setCurrency(v === 'USDT-TRC20' ? 'USDT' : 'PEA')}
                style={{ background: 'rgba(255,255,255,0.2)' }}
              />
            </div>

            <div
              style={{
                background: 'rgba(255,255,255,0.15)',
                borderRadius: 6,
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16,
              }}
            >
              <Text style={{ color: '#fff', fontFamily: 'monospace', fontSize: 13 }}>
                {walletAddress}
              </Text>
              <Tooltip title="复制地址">
                <CopyOutlined
                  style={{ color: '#fff', cursor: 'pointer' }}
                  onClick={() => navigator.clipboard.writeText(walletAddress)}
                />
              </Tooltip>
            </div>

            <Space>
              <Button
                icon={<ArrowDownOutlined />}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff' }}
                onClick={() => setDepositOpen(true)}
              >
                充值
              </Button>
              <Button
                icon={<ArrowUpOutlined />}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff' }}
                onClick={() => setWithdrawOpen(true)}
              >
                转出
              </Button>
              <Button
                icon={<QrcodeOutlined />}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff' }}
              >
                链上充值
              </Button>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Row gutter={[12, 12]}>
            {[
              { label: '今日充值（USDT）', value: '23,400.00', color: '#52c41a' },
              { label: '今日转出（USDT）', value: '8,900.00', color: '#ff4d4f' },
              { label: '今日充值（PEA）', value: '234,234,114.00', color: '#1677ff' },
              { label: '今日转出（PEA）', value: '234,234,244.00', color: '#fa8c16' },
            ].map((item) => (
              <Col span={12} key={item.label}>
                <Card bordered={false} style={{ borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 8 }}>{item.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: item.color }}>
                    {item.value}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>

      {/* 交易记录 */}
      <Card
        bordered={false}
        style={{ borderRadius: 8, marginTop: 16 }}
        title={<Title level={5} style={{ margin: 0 }}>交易记录</Title>}
        extra={
          <Space>
            <RangePicker size="small" style={{ width: 240 }} />
            <Button size="small" icon={<ReloadOutlined />}>
              刷新
            </Button>
          </Space>
        }
      >
        <Table
          columns={txnColumns}
          dataSource={mockTxns}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            total: mockTxns.length,
            pageSize: 10,
            showTotal: (total) => `总共 ${total} 条记录`,
          }}
          size="small"
        />
      </Card>

      {/* 充值弹窗 */}
      <Modal
        title="充值"
        open={depositOpen}
        onOk={() => depositForm.validateFields().then(() => setDepositOpen(false))}
        onCancel={() => setDepositOpen(false)}
        width={480}
      >
        <Form form={depositForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="充值账号" name="account" rules={[{ required: true }]}>
            <Input placeholder="请输入充值账号" />
          </Form.Item>
          <Form.Item label="订单编号" name="orderId">
            <Input placeholder="请输入订单编号" />
          </Form.Item>
          <Form.Item label="充值金额" name="amount" rules={[{ required: true }]}>
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={2}
              placeholder="请输入充值金额"
              addonAfter={currency}
            />
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 转出弹窗 */}
      <Modal
        title="转出"
        open={withdrawOpen}
        onOk={() => withdrawForm.validateFields().then(() => setWithdrawOpen(false))}
        onCancel={() => setWithdrawOpen(false)}
        width={480}
      >
        <Form form={withdrawForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="接收账户" name="receiver" rules={[{ required: true }]}>
            <Input placeholder="请输入接收账户地址" />
          </Form.Item>
          <Form.Item label="转出金额" name="amount" rules={[{ required: true }]}>
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={2}
              placeholder="请输入转出金额"
              addonAfter={currency}
            />
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default WalletPage;
