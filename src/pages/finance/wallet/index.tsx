import { Column, Pie } from '@ant-design/plots';
import {
  CopyOutlined,
  QrcodeOutlined,
  ReloadOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
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
import React, { useState } from 'react';

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

const CARD_SHADOW = '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)';
const BALANCE_USDT = 341234234.00;
const BALANCE_PEA  = 341234234.00;
const CURRENT_BALANCE = 178283.09;

// ── 地址薄数据 ────────────────────────────────────────────────────
interface AddressItem { id: string; name: string; protocol: string; address: string; type: 'chain' | 'user'; account?: string }
const addressBook: AddressItem[] = [
  { id: '1', name: 'Miya', protocol: 'TRC20', address: 'TBA2838...jHid8OINS03', type: 'chain' },
  { id: '2', name: 'Miya', protocol: 'TRC20', address: 'TBA293hjHUh9020sjdio293', type: 'chain' },
  { id: '3', name: 'Miya', protocol: 'TRC20', address: 'TBA2838...jHid8OINS03', type: 'chain' },
  { id: '4', name: 'Miya', protocol: 'TRC20', address: 'TBA2838...jHid8OINS03', type: 'chain' },
  { id: '5', name: 'Miya', protocol: 'TRC20', address: 'TBA2838...jHid8OINS03', type: 'chain' },
  { id: '6', name: 'Miya', account: 'ji****1111', type: 'user' } as AddressItem,
  { id: '7', name: 'Miya', account: 'ji****1111', type: 'user' } as AddressItem,
  { id: '8', name: 'Miya', account: 'ji****1111', type: 'user' } as AddressItem,
];

// ── 转出记录数据 ──────────────────────────────────────────────────
interface TransferRow {
  id: string;
  startTime: string;
  endTime: string;
  orderId: string;
  method: '链上转出' | '转账用户';
  receiver: string;
  currency: string;
  amount: string;
}

const transferData: TransferRow[] = Array.from({ length: 15 }, (_, i) => ({
  id: `T${String(i + 1).padStart(7, '0')}`,
  startTime: `2025-10-10 12:23:23`,
  endTime: `2025-10-10 12:23:23`,
  orderId: String(73720 + i),
  method: i % 2 === 0 ? '链上转出' : '转账用户',
  receiver: i % 2 === 0 ? `地址名称（TBAnfjos99...02hidhndOU）` : `Miya（@MI）`,
  currency: i % 2 === 0 ? 'USDT' : 'PEA',
  amount: i % 2 === 0 ? '873,233' : '73,233',
}));

// ── 充值记录数据 ──────────────────────────────────────────────────
interface DepositRow {
  id: string;
  startTime: string;
  endTime: string;
  orderId: string;
  method: '链上充值' | '平台收款';
  sender: string;
  currency: string;
  amount: string;
}

const depositData: DepositRow[] = Array.from({ length: 10 }, (_, i) => ({
  id: `D${String(i + 1).padStart(7, '0')}`,
  startTime: `2025-10-${String(i + 1).padStart(2, '0')} 12:23:23`,
  endTime: `2025-10-${String(i + 1).padStart(2, '0')} 12:25:00`,
  orderId: String(83720 + i),
  method: i % 2 === 0 ? '链上充值' : '平台收款',
  sender: i % 2 === 0 ? `TBAnfjos99...02hidhndOU` : `Miya（@MI）`,
  currency: i % 2 === 0 ? 'USDT' : 'PEA',
  amount: `${(50000 + i * 8000).toLocaleString()}.00`,
}));

// ── 月度图表数据 ──────────────────────────────────────────────────
const monthlyData = [
  { month: '1月',  type: 'USDT', value: 32 }, { month: '1月',  type: 'PEA', value: 40 },
  { month: '2月',  type: 'USDT', value: 28 }, { month: '2月',  type: 'PEA', value: 18 },
  { month: '3月',  type: 'USDT', value: 45 }, { month: '3月',  type: 'PEA', value: 25 },
  { month: '4月',  type: 'USDT', value: 20 }, { month: '4月',  type: 'PEA', value: 38 },
  { month: '5月',  type: 'USDT', value: 22 }, { month: '5月',  type: 'PEA', value: 32 },
  { month: '6月',  type: 'USDT', value: 30 }, { month: '6月',  type: 'PEA', value: 35 },
  { month: '7月',  type: 'USDT', value: 42 }, { month: '7月',  type: 'PEA', value: 38 },
  { month: '8月',  type: 'USDT', value: 25 }, { month: '8月',  type: 'PEA', value: 18 },
  { month: '9月',  type: 'USDT', value: 40 }, { month: '9月',  type: 'PEA', value: 32 },
  { month: '10月', type: 'USDT', value: 43 }, { month: '10月', type: 'PEA', value: 40 },
  { month: '11月', type: 'USDT', value: 20 }, { month: '11月', type: 'PEA', value: 38 },
  { month: '12月', type: 'USDT', value: 22 }, { month: '12月', type: 'PEA', value: 20 },
];

const pieData = [
  { type: '平台转账', value: 341 },
  { type: '链上转账', value: 682 },
];

// ── 费用计算 ──────────────────────────────────────────────────────
const TAX_RATE = 0.05;
const TAX_EXEMPT = 1000;
const CHAIN_FEE = 1;

function calcFee(amount: number, method: string) {
  const taxable = Math.max(0, amount - TAX_EXEMPT);
  const tax = parseFloat((taxable * TAX_RATE).toFixed(2));
  const fee = method === '链上转出' ? CHAIN_FEE : 0;
  const final = amount + tax + fee;
  return { tax, fee, final };
}

// ── 主组件 ────────────────────────────────────────────────────────
const WalletPage: React.FC = () => {
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [depositMethod, setDepositMethod] = useState<'链上充值' | '平台收款'>('链上充值');
  const [withdrawMethod, setWithdrawMethod] = useState<'平台转出' | '链上转出'>('平台转出');
  const [withdrawAmt, setWithdrawAmt] = useState<number>(0);
  const [currencyFilter, setCurrencyFilter] = useState<'全部' | 'USDT' | 'PEA'>('全部');
  const [depositForm] = Form.useForm();
  const [withdrawForm] = Form.useForm();

  const { tax, fee, final } = calcFee(withdrawAmt, withdrawMethod);

  // 打开转出弹窗（可从地址薄预填数据）
  const openWithdrawModal = (
    method: '平台转出' | '链上转出',
    receiver?: string,
    note?: string,
  ) => {
    setWithdrawMethod(method);
    setWithdrawAmt(0);
    withdrawForm.resetFields();
    if (receiver || note) {
      setTimeout(() => {
        withdrawForm.setFieldsValue({
          method,
          receiver,
          accountNote: note,
        });
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
      render: (v) => <Tag color={v === '链上转出' ? 'purple' : 'blue'}>{v}</Tag>,
    },
    { title: '接收账户', dataIndex: 'receiver', ellipsis: true },
    { title: '货币单位', dataIndex: 'currency', width: 80 },
    { title: '转出金额', dataIndex: 'amount', width: 110, align: 'right', render: (v) => <Text>{v}</Text> },
  ];

  const depositCols: ColumnsType<DepositRow> = [
    { title: '发起时间', dataIndex: 'startTime', width: 160 },
    { title: '结束时间', dataIndex: 'endTime', width: 160 },
    { title: '订单编号', dataIndex: 'orderId', width: 90 },
    {
      title: '交易方式', dataIndex: 'method', width: 100,
      render: (v) => <Tag color={v === '链上充值' ? 'purple' : 'blue'}>{v}</Tag>,
    },
    { title: '发款账户', dataIndex: 'sender', ellipsis: true },
    { title: '货币单位', dataIndex: 'currency', width: 80 },
    { title: '充值金额', dataIndex: 'amount', width: 110, align: 'right', render: (v) => <Text style={{ color: '#52c41a' }}>{v}</Text> },
  ];

  const filteredTransfer = currencyFilter === '全部' ? transferData : transferData.filter(r => r.currency === currencyFilter);
  const filteredDeposit  = currencyFilter === '全部' ? depositData  : depositData.filter(r => r.currency === currencyFilter);

  // 地址薄
  const AddressBook = () => (
    <div style={{ width: 260, flexShrink: 0, borderRight: '1px solid #f0f0f0', paddingRight: 16 }}>
      <Text strong style={{ fontSize: 14 }}>地址薄</Text>
      <Input prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />} placeholder="请输入名称" size="small" style={{ margin: '10px 0', borderRadius: 6 }} />

      <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', marginBottom: 8 }}>▾ 链上地址</div>
      {addressBook.filter(a => a.type === 'chain').map(a => (
        <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #fafafa' }}>
          <Space size={6}>
            <Avatar size={28} style={{ background: '#f0f0f0', color: '#888', fontSize: 11 }}>T</Avatar>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{a.name} <Tag style={{ fontSize: 10, padding: '0 4px', margin: 0 }}>{a.protocol}</Tag></div>
              <div style={{ fontSize: 11, color: '#888' }}>{a.address}</div>
            </div>
          </Space>
          <Space size={4}>
            <Button type="primary" size="small"
              style={{ fontSize: 11, height: 22, padding: '0 6px', background: '#722ed1', borderColor: '#722ed1' }}
              onClick={() => openWithdrawModal('链上转出', a.address, a.name)}>转账</Button>
            <CopyOutlined style={{ fontSize: 12, color: '#722ed1', cursor: 'pointer' }} onClick={() => { navigator.clipboard.writeText(a.address ?? ''); message.success('已复制'); }} />
          </Space>
        </div>
      ))}

      <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', margin: '12px 0 8px' }}>▾ 平台用户</div>
      {addressBook.filter(a => a.type === 'user').map(a => (
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
              onClick={() => openWithdrawModal('平台转出', a.account, a.name)}>转账</Button>
            <span style={{ fontSize: 16, color: '#722ed1', cursor: 'pointer' }}>⇄</span>
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
          <Text type="secondary" style={{ marginRight: 6, fontSize: 13 }}>货币单位：</Text>
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
        <Space>
          <Text type="secondary" style={{ fontSize: 13 }}>搜索：</Text>
          <Input placeholder="订单编号，订单备注" size="small" suffix={<SearchOutlined />} style={{ width: 180 }} />
        </Space>
        <Space>
          <Text type="secondary" style={{ fontSize: 13 }}>订单时间：</Text>
          <RangePicker size="small" placeholder={['选择时间范围', '']} style={{ width: 220 }} />
        </Space>
      </Space>

      {/* 统计数字 */}
      {isTx && (
        <div style={{ background: '#fafafa', borderRadius: 8, padding: '10px 16px', marginBottom: 16, fontSize: 13 }}>
          <Space split={<Divider type="vertical" />}>
            <Space>
              <Text type="secondary">总转出（USDT）<Tooltip title="所有币种折算USDT之和"><span style={{ cursor: 'help' }}>ⓘ</span></Tooltip>：</Text>
              <Text strong>234,234,244.00</Text>
            </Space>
            <Space>
              <Text type="secondary">转出（USDT）：</Text>
              <Text strong>234,234,244.00</Text>
            </Space>
            <Space>
              <Text type="secondary">转出（PEA）：</Text>
              <Text strong>234,234,244.00</Text>
            </Space>
          </Space>
        </div>
      )}

      {/* 图表区 */}
      {isTx && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={16}>
            <Card bordered={false} style={{ borderRadius: 8, boxShadow: CARD_SHADOW }}>
              <Text style={{ fontSize: 13, fontWeight: 600 }}>每月转出总额</Text>
              <div style={{ marginTop: 8 }}>
                <Column
                  data={monthlyData}
                  xField="month"
                  yField="value"
                  colorField="type"
                  stack
                  height={500}
                  scale={{ color: { range: ['#722ed1', '#b37feb'] }, y: { domain: [0, 100], nice: false }, x: { paddingInner: 0.6 } }}
                  axis={{ x: { labelFontSize: 11 }, y: { labelFontSize: 11 } }}
                  legend={{ position: 'top-right' }}
                  tooltip={{ items: [{ channel: 'y', valueFormatter: (v: number) => `${v}次` }] }}
                />
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card bordered={false} style={{ borderRadius: 8, boxShadow: CARD_SHADOW, height: '100%' }}>
              <Text style={{ fontSize: 13, fontWeight: 600 }}>转账方式</Text>
              <Pie
                data={pieData}
                angleField="value"
                colorField="type"
                innerRadius={0.6}
                height={500}
                style={{ marginTop: 8 }}
                scale={{ color: { range: ['#722ed1', '#b37feb'] } }}
                legend={{ position: 'bottom' }}
                label={false}
                tooltip={{ items: [{ channel: 'color', name: '转账方式' }, { channel: 'y', name: '次数', valueFormatter: (v: number) => `${v}次` }] }}
              />
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
        columns={isTx ? transferCols : depositCols}
        dataSource={isTx ? filteredTransfer : filteredDeposit}
        rowKey="id"
        size="small"
        scroll={{ x: 900 }}
        pagination={{ pageSize: 5, showTotal: (t) => `总共 ${t} 个项目`, showSizeChanger: true, pageSizeOptions: ['5', '10', '20'] }}
        rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
      />
    </div>
  );

  const tabItems = [
    {
      key: 'transfer',
      label: <Badge count={1} size="small" offset={[8, -2]}>转出记录</Badge>,
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
      children: (
        <div style={{ display: 'flex', gap: 20 }}>
          <AddressBook />
          <RightContent isTx={false} />
        </div>
      ),
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
                <QrcodeOutlined style={{ fontSize: 12, color: '#722ed1', cursor: 'pointer' }} />
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
          <Space size={16} align="center">
            <Tag color="purple" style={{ fontSize: 13, padding: '2px 10px' }}>USDT</Tag>
            <Button size="small" style={{ background: '#722ed1', borderColor: '#722ed1', color: '#fff' }}
              onClick={() => { setDepositMethod('链上充值'); setDepositOpen(true); }}>充值</Button>
            <Button size="small" style={{ background: '#9254de', borderColor: '#9254de', color: '#fff' }}
              onClick={() => openWithdrawModal('平台转出')}>转账</Button>
            <Text style={{ fontSize: 22, fontWeight: 700 }}>
              {BALANCE_USDT.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Text>
          </Space>

          {/* PEA */}
          <Space size={16} align="center">
            <Tag color="default" style={{ fontSize: 13, padding: '2px 10px' }}>PEA</Tag>
            <Button size="small" style={{ background: '#722ed1', borderColor: '#722ed1', color: '#fff' }}
              onClick={() => { setDepositMethod('平台收款'); setDepositOpen(true); }}>充值</Button>
            <Button size="small" style={{ background: '#9254de', borderColor: '#9254de', color: '#fff' }}
              onClick={() => openWithdrawModal('链上转出')}>转账</Button>
            <Text style={{ fontSize: 22, fontWeight: 700 }}>
              {BALANCE_PEA.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Text>
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
          <Form.Item label="充值方式" name="method" initialValue={depositMethod} rules={[{ required: true }]}>
            <Select
              options={[{ value: '链上充值', label: '链上充值' }, { value: '平台收款', label: '平台收款' }]}
              onChange={(v) => setDepositMethod(v)}
            />
          </Form.Item>

          {depositMethod === '链上充值' ? (
            <>
              <Form.Item label={<span><span style={{ color: '#ff4d4f' }}>* </span>集团链上账户</span>}>
                <Space.Compact>
                  <div style={{ background: '#fafafa', border: '1px solid #d9d9d9', borderRadius: '4px 0 0 4px', padding: '4px 10px', fontSize: 13 }}>TRC20</div>
                  <div style={{ flex: 1, background: '#fafafa', border: '1px solid #d9d9d9', borderLeft: 'none', borderRadius: '0 4px 4px 0', padding: '4px 10px', fontSize: 13, fontFamily: 'monospace' }}>
                    wjeoifnorinorngorngirngoerngenrgoe
                  </div>
                </Space.Compact>
              </Form.Item>
              {/* QR code placeholder */}
              <div style={{ textAlign: 'center', margin: '12px 0' }}>
                <div style={{ display: 'inline-block', padding: 12, border: '1px solid #f0f0f0', borderRadius: 8 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                    {[0,1,2,3].map(i => <QrcodeOutlined key={i} style={{ fontSize: 88, color: '#141414', display: 'block' }} />)}
                  </div>
                </div>
                <div style={{ marginTop: 8 }}>
                  <Space>
                    <Text style={{ fontFamily: 'monospace', fontSize: 12 }}>wjeoifnorinorngorngirngoerngenrgoe</Text>
                    <CopyOutlined style={{ color: '#722ed1', cursor: 'pointer' }}
                      onClick={() => { navigator.clipboard.writeText('wjeoifnorinorngorngirngoerngenrgoe'); message.success('已复制'); }} />
                  </Space>
                </div>
              </div>
              <div style={{ background: '#fafafa', borderRadius: 6, padding: '10px 14px', fontSize: 12, color: 'rgba(0,0,0,0.65)' }}>
                <Text style={{ fontSize: 12 }}>充值说明：</Text>
                <div>1、转账网络为 USDT-TRC20，转账时请确认地址，否则不可到账不可找回；</div>
                <div>2、最小充值数量为 1 USDT；</div>
                <div>3、在线充值请等待5分钟到账，刷新页面后查看余额。</div>
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
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
        width={500}
      >
        <Form form={withdrawForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label={<span><span style={{ color: '#ff4d4f' }}>* </span>转出方式</span>} name="method" initialValue={withdrawMethod} rules={[{ required: true }]}>
            <Select
              options={[{ value: '平台转出', label: '平台转出' }, { value: '链上转出', label: '链上转出' }]}
              onChange={(v) => { setWithdrawMethod(v as '平台转出' | '链上转出'); setWithdrawAmt(0); withdrawForm.resetFields(['receiver', 'chainAddress', 'amount']); }}
            />
          </Form.Item>

          <Form.Item label="账户备注" name="accountNote" rules={[{ required: true, message: '请填写账户备注' }]}>
            {withdrawMethod === '链上转出' ? (
              <Input placeholder="Miya" />
            ) : (
              <Input placeholder="Miya" />
            )}
          </Form.Item>

          <Form.Item label="转至账户" name="receiver" rules={[{ required: true, message: '请填写转至账户' }]}>
            {withdrawMethod === '平台转出' ? (
              <Input placeholder="@KjidnfHJNDO8nd" />
            ) : (
              <Space.Compact style={{ width: '100%' }}>
                <Select defaultValue="TRC20" style={{ width: 90 }} options={[{ value: 'TRC20', label: 'TRC20' }]} />
                <Input placeholder="请输入..." style={{ flex: 1 }} />
              </Space.Compact>
            )}
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
            <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>当前余额: {CURRENT_BALANCE.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDT</div>
          </Form.Item>

          {/* 转账费用 */}
          <div style={{ background: '#fafafa', borderRadius: 8, padding: '12px 14px', marginBottom: 16 }}>
            <Text strong style={{ fontSize: 13 }}>转账费用</Text>
            <div style={{ marginTop: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <Text style={{ fontSize: 13, color: '#ff4d4f' }}>* 交易税费</Text>
                <Space>
                  <div style={{ background: '#fff', border: '1px solid #d9d9d9', borderRadius: 4, padding: '2px 10px', fontSize: 13, minWidth: 140, textAlign: 'center' }}>
                    {tax.toFixed(2)} USDT
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>税率: 5%</Text>
                </Space>
              </div>
              <div style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>免税额度: 1000.00USDT</div>
              {withdrawMethod === '链上转出' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={{ fontSize: 13, color: '#ff4d4f' }}>* 手续费</Text>
                  <div style={{ background: '#fff', border: '1px solid #d9d9d9', borderRadius: 4, padding: '2px 10px', fontSize: 13, minWidth: 140, textAlign: 'center' }}>
                    {CHAIN_FEE.toFixed(2)} USDT
                  </div>
                </div>
              )}
            </div>
          </div>

          <Form.Item label={<span style={{ color: '#ff4d4f' }}>* 预计最终到账</span>}>
            <Space.Compact style={{ width: '100%' }}>
              <Select defaultValue="USDT" style={{ width: 90 }} options={[{ value: 'USDT', label: 'USDT' }]} disabled />
              <div style={{ flex: 1, background: '#fafafa', border: '1px solid #d9d9d9', borderLeft: 'none', borderRadius: '0 4px 4px 0', padding: '4px 11px', fontSize: 14, fontWeight: 600 }}>
                {final.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </Space.Compact>
            <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
              转出后本账户剩余: {CURRENT_BALANCE.toLocaleString(undefined, { minimumFractionDigits: 2 })} USDT
            </div>
          </Form.Item>

          <Form.Item label="转账备注" name="remark">
            <Input.TextArea rows={3} placeholder="不超过30个字" maxLength={30} showCount />
          </Form.Item>

          {/* 说明 */}
          <div style={{ background: '#fafafa', borderRadius: 6, padding: '10px 14px', fontSize: 12, color: 'rgba(0,0,0,0.65)' }}>
            {withdrawMethod === '平台转出' ? (
              <>
                <Text style={{ fontSize: 12 }}>收款说明：</Text>
                <div>1、使用移动端扫码可以进行转账。</div>
                <div>2、转账实时到账，到账后刷新钱包页面可以看到当前余额。</div>
              </>
            ) : (
              <>
                <Text style={{ fontSize: 12 }}>转出说明：</Text>
                <div>1、转账网络为 USDT-TRC20，转账时请确认地址，否则不可到账不可找回；</div>
                <div>2、最小充币数量为 1 USDT；</div>
                <div>3、在线充值请等待5分钟到账，刷新页面后查看余额。</div>
              </>
            )}
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default WalletPage;
