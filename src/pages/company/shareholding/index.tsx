import { InfoCircleOutlined, SearchOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  ConfigProvider,
  Descriptions,
  Input,
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
import React, { useState } from 'react';

const { Text } = Typography;

const radioTheme = {
  components: {
    Radio: {
      buttonBg: '#fff',
      buttonCheckedBg: '#722ed1',
      buttonColor: 'rgba(0,0,0,0.65)',
      buttonCheckedColor: '#fff',
      buttonSolidCheckedBg: '#722ed1',
      buttonSolidCheckedHoverBg: '#9254de',
      buttonSolidCheckedActiveBg: '#531dab',
      colorPrimary: '#722ed1',
      colorPrimaryHover: '#9254de',
      colorPrimaryActive: '#531dab',
    },
  },
};

const ENTERPRISES = ['hey', 'wow', 'boom', 'flash', 'nova'];

// ── 入股清单数据 ──────────────────────────────────────────────────
interface HoldingRow {
  id: string;
  enterpriseId: string;
  enterpriseName: string;
  ratio: string;
  valuation: number;
  totalAsset: number;
  revenue: number;
  currency: 'USDT' | 'PEA';
  updatedAt: string;
  status: string;
}

const holdingData: HoldingRow[] = Array.from({ length: 12 }, (_, i) => {
  const invested = 50000 + i * 12500;
  const pnlRate = ((i % 7) - 3) * 8;
  const valuation = invested * (1 + pnlRate / 100);
  const revenue = i % 3 === 0 ? -(1000 + i * 200) : 3000 + i * 1500;
  return {
    id: `SH${String(i + 1).padStart(5, '0')}`,
    enterpriseId: `ENT${10000 + i}`,
    enterpriseName: ENTERPRISES[i % 5],
    ratio: `${(5 + (i % 10) * 2.5).toFixed(2)}%`,
    valuation,
    totalAsset: 200000 + i * 30000,
    revenue,
    currency: i % 2 === 0 ? 'USDT' : 'PEA',
    updatedAt: `2026-0${(i % 3) + 1}-${String(i + 1).padStart(2, '0')} ${String(9 + i).padStart(2, '0')}:${String(i * 4).padStart(2, '0')}:${String(i * 7 % 60).padStart(2, '0')}`,
    status: i % 4 === 3 ? '已退出' : '持股中',
  };
});

// ── 股份交易数据 ──────────────────────────────────────────────────
interface TradeRow {
  id: string;
  orderId: string;
  orderTime: string;
  enterpriseId: string;
  enterpriseName: string;
  orderType: '购买股份' | '释放股份';
  changeRatio: string;
  currency: 'USDT' | 'PEA';
  amount: number;
  tax: number;
  assetSnapshot: number;
}

const tradeData: TradeRow[] = Array.from({ length: 12 }, (_, i) => ({
  id: `TR${String(i + 1).padStart(5, '0')}`,
  orderId: `ORD${String(20240001 + i)}`,
  orderTime: `2026-0${(i % 3) + 1}-${String(i + 1).padStart(2, '0')} ${String(10 + i % 8).padStart(2, '0')}:${String(i * 7 % 60).padStart(2, '0')}:00`,
  enterpriseId: `ENT${10000 + (i % 5)}`,
  enterpriseName: ENTERPRISES[i % 5],
  orderType: i % 2 === 0 ? '购买股份' : '释放股份',
  changeRatio: `${(5 + i * 2).toFixed(2)}%`,
  currency: i % 2 === 0 ? 'USDT' : 'PEA',
  amount: 5000 + i * 2000,
  tax: i % 2 === 0 ? 0 : Math.round((5000 + i * 2000) * 0.05),
  assetSnapshot: 500000 + i * 50000,
}));

// ── 投资分红数据 ──────────────────────────────────────────────────
interface DivRow {
  id: string;
  finishTime: string;
  enterpriseId: string;
  enterpriseName: string;
  orderType: '分红' | '投资';
  amount: number;
  tax: number;
  currency: 'USDT' | 'PEA';
  assetSnapshot: number;
  shareholderName: string;
  shareholdingRatio: string;
}

const divData: DivRow[] = Array.from({ length: 12 }, (_, i) => ({
  id: `DIV${String(i + 1).padStart(5, '0')}`,
  finishTime: `2026-0${(i % 3) + 1}-${String(i + 1).padStart(2, '0')} ${String(14 + i % 6).padStart(2, '0')}:${String(i * 5 % 60).padStart(2, '0')}:${String(i * 3 % 60).padStart(2, '0')}`,
  enterpriseId: `ENT${10000 + (i % 5)}`,
  enterpriseName: ENTERPRISES[i % 5],
  orderType: i % 3 !== 1 ? '分红' : '投资',
  amount: 8000 + i * 2500,
  tax: i % 3 !== 1 ? 0 : Math.round((8000 + i * 2500) * 0.05),
  currency: i % 2 === 0 ? 'USDT' : 'PEA',
  assetSnapshot: 600000 + i * 40000,
  shareholderName: `股东${i + 1}`,
  shareholdingRatio: `${(5 + i * 2).toFixed(2)}%`,
}));

const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ── Tooltip 表头辅助 ──────────────────────────────────────────────
const TipTitle: React.FC<{ title: string; tip: string }> = ({ title, tip }) => (
  <Space size={4}>
    {title}
    <Tooltip title={tip}>
      <InfoCircleOutlined style={{ color: 'rgba(0,0,0,0.35)', fontSize: 12, cursor: 'pointer' }} />
    </Tooltip>
  </Space>
);

// ── 入股清单 ──────────────────────────────────────────────────────
const HoldingContent: React.FC<{ onSwitchTab: (t: string) => void }> = ({ onSwitchTab }) => {
  const [currency, setCurrency] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = holdingData.filter((r) => {
    const kw = search.toLowerCase();
    return (
      (currency === 'all' || r.currency === currency) &&
      (!kw || r.enterpriseName.toLowerCase().includes(kw) || r.enterpriseId.toLowerCase().includes(kw))
    );
  });

  const totalValuation = filtered.reduce((s, r) => s + r.valuation, 0);
  const totalRevenue = filtered.reduce((s, r) => s + r.revenue, 0);
  const holdingCount = filtered.filter((r) => r.status === '持股中').length;

  const columns: ColumnsType<HoldingRow> = [
    { title: '更新时间', dataIndex: 'updatedAt', width: 175 },
    { title: '企业ID', dataIndex: 'enterpriseId', width: 100 },
    { title: '企业名称', dataIndex: 'enterpriseName', width: 110 },
    { title: '持股比例', dataIndex: 'ratio', width: 90, align: 'right' },
    {
      title: <TipTitle title="持股估值" tip="当前最新持股金额预估价值" />,
      dataIndex: 'valuation',
      width: 140,
      align: 'right',
      render: (v: number) => <Text style={{ color: '#722ed1' }}>{fmt(v)}</Text>,
    },
    {
      title: <TipTitle title="企业总资产" tip="当前企业最新资产" />,
      dataIndex: 'totalAsset',
      width: 140,
      align: 'right',
      render: (v: number) => fmt(v),
    },
    {
      title: <TipTitle title="股份收益" tip="历史累计的分红及股份交易获益之和减去购买股份及追加投资的支出" />,
      dataIndex: 'revenue',
      width: 120,
      align: 'right',
      render: (v: number) => <Text style={{ color: v < 0 ? '#ff4d4f' : '#52c41a' }}>{fmt(v)}</Text>,
    },
    { title: '货币单位', dataIndex: 'currency', width: 90 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (v) => <Tag color={v === '持股中' ? 'success' : 'default'}>{v}</Tag>,
    },
    {
      title: '操作',
      width: 160,
      fixed: 'right' as const,
      render: () => (
        <Space size={0}>
          <Button type="link" size="small" style={{ padding: '0 4px' }} onClick={() => onSwitchTab('trade')}>股份交易</Button>
          <Button type="link" size="small" style={{ padding: '0 4px' }} onClick={() => onSwitchTab('dividend')}>投资分红</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {[
          { label: `持股估值合计（${currency === 'all' ? 'USDT' : currency}）`, value: fmt(totalValuation), color: '#722ed1' },
          { label: `股份收益合计（${currency === 'all' ? 'USDT' : currency}）`, value: fmt(totalRevenue), color: totalRevenue >= 0 ? '#52c41a' : '#ff4d4f' },
          { label: '持股企业数', value: `${holdingCount} 家`, color: '#722ed1' },
        ].map((s) => (
          <Col xs={24} sm={8} key={s.label}>
            <Card bordered={false} style={{ textAlign: 'center', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
            </Card>
          </Col>
        ))}
      </Row>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <ConfigProvider theme={radioTheme}>
          <Radio.Group value={currency} onChange={(e) => setCurrency(e.target.value)} buttonStyle="solid" size="middle">
            <Radio.Button value="all">全部</Radio.Button>
            <Radio.Button value="USDT">USDT</Radio.Button>
            <Radio.Button value="PEA">PEA</Radio.Button>
          </Radio.Group>
        </ConfigProvider>
        <Input
          prefix={<SearchOutlined />}
          placeholder="企业名称 / 企业ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          style={{ width: 220 }}
        />
      </div>
      <Table
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        size="middle"
        scroll={{ x: 1200 }}
        pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
      />
    </div>
  );
};

// ── 股份交易 ──────────────────────────────────────────────────────
const TradeContent: React.FC = () => {
  const [orderType, setOrderType] = useState('all');
  const [currency, setCurrency] = useState('all');
  const [enterprise, setEnterprise] = useState<string | undefined>();
  const [search, setSearch] = useState('');

  const filtered = tradeData.filter((r) => {
    const kw = search.toLowerCase();
    return (
      (orderType === 'all' || r.orderType === orderType) &&
      (currency === 'all' || r.currency === currency) &&
      (!enterprise || r.enterpriseName === enterprise) &&
      (!kw || r.orderId.toLowerCase().includes(kw))
    );
  });

  const taxTip = '购买股份时，公司释放股份是不需要收取税费；释放股份时，需要缴纳得利税。';

  const columns: ColumnsType<TradeRow> = [
    { title: '订单时间', dataIndex: 'orderTime', width: 175 },
    { title: '企业ID', dataIndex: 'enterpriseId', width: 100 },
    { title: '企业名称', dataIndex: 'enterpriseName', width: 110 },
    { title: '订单编号', dataIndex: 'orderId', width: 130 },
    {
      title: '订单类型',
      dataIndex: 'orderType',
      width: 100,
      render: (v) => <Tag color={v === '购买股份' ? 'success' : 'error'}>{v}</Tag>,
    },
    { title: '变动比例', dataIndex: 'changeRatio', width: 90, align: 'right' },
    { title: '货币单位', dataIndex: 'currency', width: 90 },
    { title: '订单金额', dataIndex: 'amount', width: 130, align: 'right', sorter: (a, b) => a.amount - b.amount, render: (v) => fmt(v) },
    {
      title: <TipTitle title="税费" tip={taxTip} />,
      dataIndex: 'tax',
      width: 110,
      align: 'right',
      sorter: (a, b) => a.tax - b.tax,
      render: (v) => fmt(v),
    },
    {
      title: '企业总资产快照',
      dataIndex: 'assetSnapshot',
      width: 140,
      align: 'right',
      sorter: (a, b) => a.assetSnapshot - b.assetSnapshot,
      render: (v) => fmt(v),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <ConfigProvider theme={radioTheme}>
          <Radio.Group value={orderType} onChange={(e) => setOrderType(e.target.value)} buttonStyle="solid" size="middle">
            <Radio.Button value="all">全部</Radio.Button>
            <Radio.Button value="购买股份">购买股份</Radio.Button>
            <Radio.Button value="释放股份">释放股份</Radio.Button>
          </Radio.Group>
        </ConfigProvider>
        <ConfigProvider theme={radioTheme}>
          <Radio.Group value={currency} onChange={(e) => setCurrency(e.target.value)} buttonStyle="solid" size="middle">
            <Radio.Button value="all">全部</Radio.Button>
            <Radio.Button value="USDT">USDT</Radio.Button>
            <Radio.Button value="PEA">PEA</Radio.Button>
          </Radio.Group>
        </ConfigProvider>
        <Select
          placeholder="企业名称"
          value={enterprise}
          onChange={setEnterprise}
          allowClear
          style={{ width: 140 }}
          options={ENTERPRISES.map((e) => ({ value: e, label: e }))}
        />
        <Input
          prefix={<SearchOutlined />}
          placeholder="订单编号"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          style={{ width: 180 }}
        />
      </div>
      <Table
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        size="middle"
        scroll={{ x: 1200 }}
        pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
      />
    </div>
  );
};

// ── 投资分红 ──────────────────────────────────────────────────────
const DividendContent: React.FC = () => {
  const [currency, setCurrency] = useState('all');
  const [detail, setDetail] = useState<DivRow | null>(null);

  const filtered = divData.filter((r) => currency === 'all' || r.currency === currency);

  const columns: ColumnsType<DivRow> = [
    { title: '完成时间', dataIndex: 'finishTime', width: 175 },
    { title: '企业ID', dataIndex: 'enterpriseId', width: 100 },
    { title: '企业名称', dataIndex: 'enterpriseName', width: 110 },
    {
      title: '订单类型',
      dataIndex: 'orderType',
      width: 90,
      render: (v) => <Tag color={v === '分红' ? 'success' : 'error'}>{v}</Tag>,
    },
    { title: '订单金额', dataIndex: 'amount', width: 130, align: 'right', sorter: (a, b) => a.amount - b.amount, render: (v) => fmt(v) },
    { title: '税费', dataIndex: 'tax', width: 110, align: 'right', sorter: (a, b) => a.tax - b.tax, render: (v) => fmt(v) },
    { title: '货币单位', dataIndex: 'currency', width: 90 },
    {
      title: '操作',
      width: 80,
      fixed: 'right' as const,
      render: (_, r) => (
        <Button type="link" size="small" style={{ padding: 0 }} onClick={() => setDetail(r)}>查看</Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <ConfigProvider theme={radioTheme}>
          <Radio.Group value={currency} onChange={(e) => setCurrency(e.target.value)} buttonStyle="solid" size="middle">
            <Radio.Button value="all">全部</Radio.Button>
            <Radio.Button value="USDT">USDT</Radio.Button>
            <Radio.Button value="PEA">PEA</Radio.Button>
          </Radio.Group>
        </ConfigProvider>
      </div>
      <Table
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        size="middle"
        scroll={{ x: 900 }}
        pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
      />
      <Modal
        title="投资分红详情"
        open={!!detail}
        onCancel={() => setDetail(null)}
        footer={<Button onClick={() => setDetail(null)}>关闭</Button>}
        width={480}
        destroyOnClose
      >
        {detail && (
          <Descriptions column={1} bordered size="small" style={{ marginTop: 8 }}>
            <Descriptions.Item label="订单类型">
              <Tag color={detail.orderType === '分红' ? 'success' : 'error'}>{detail.orderType}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="企业总资产快照">{fmt(detail.assetSnapshot)} {detail.currency}</Descriptions.Item>
            <Descriptions.Item label="股东昵称">{detail.shareholderName}</Descriptions.Item>
            <Descriptions.Item label="持有股份">{detail.shareholdingRatio}</Descriptions.Item>
            <Descriptions.Item label="订单金额">{fmt(detail.amount)} {detail.currency}</Descriptions.Item>
            <Descriptions.Item label="税费">{fmt(detail.tax)} {detail.currency}</Descriptions.Item>
            <Descriptions.Item label="完成时间">{detail.finishTime}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

// ── 主组件 ────────────────────────────────────────────────────────
const CompanyShareholding: React.FC = () => {
  const [activeTab, setActiveTab] = useState('holding');

  const tabItems = [
    {
      key: 'holding',
      label: '入股清单',
      children: <HoldingContent onSwitchTab={setActiveTab} />,
    },
    {
      key: 'trade',
      label: '股份交易',
      children: <TradeContent />,
    },
    {
      key: 'dividend',
      label: '投资分红',
      children: <DividendContent />,
    },
  ];

  return <Tabs items={tabItems} type="card" activeKey={activeTab} onChange={setActiveTab} />;
};

export default CompanyShareholding;
