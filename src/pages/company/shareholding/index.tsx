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

const CARD_SHADOW = '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)';

const radioTheme = {
  components: {
    Radio: {
      buttonBg: '#fff',
      buttonCheckedBg: '#1677ff',
      buttonColor: 'rgba(0,0,0,0.65)',
      buttonCheckedColor: '#fff',
      buttonSolidCheckedBg: '#1677ff',
      buttonSolidCheckedHoverBg: '#4096ff',
      buttonSolidCheckedActiveBg: '#0958d9',
      colorPrimary: '#1677ff',
      colorPrimaryHover: '#4096ff',
      colorPrimaryActive: '#0958d9',
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
  orderId: string;
  tradeTime: string;
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
  companyShareRatio: string;
}

const divData: DivRow[] = Array.from({ length: 12 }, (_, i) => ({
  id: `DIV${String(i + 1).padStart(5, '0')}`,
  orderId: `ORD${String(20260001 + i)}`,
  tradeTime: `2026-0${(i % 3) + 1}-${String(i + 1).padStart(2, '0')} ${String(10 + i % 6).padStart(2, '0')}:${String(i * 3 % 60).padStart(2, '0')}:00`,
  finishTime: `2026-0${(i % 3) + 1}-${String(i + 1).padStart(2, '0')} ${String(14 + i % 6).padStart(2, '0')}:${String(i * 5 % 60).padStart(2, '0')}:${String(i * 3 % 60).padStart(2, '0')}`,
  enterpriseId: `ENT${10000 + (i % 5)}`,
  enterpriseName: ENTERPRISES[i % 5],
  orderType: i % 3 !== 1 ? '分红' : '投资',
  amount: 8000 + i * 2500,
  tax: i % 3 !== 1 ? 0 : Math.round((8000 + i * 2500) * 0.05),
  currency: i % 2 === 0 ? 'USDT' : 'PEA',
  assetSnapshot: 600000 + i * 40000,
  shareholderName: ['Miya', 'Tom', 'Alice', 'Jack', 'Bob'][i % 5],
  shareholdingRatio: `${(5 + i * 2).toFixed(2)}%`,
  companyShareRatio: `${(10 + i * 3.5).toFixed(2)}%`,
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
const HoldingContent: React.FC<{ onSwitchTab: (t: string, enterprise?: string) => void }> = ({ onSwitchTab }) => {
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
      render: (v: number) => <Text style={{ color: '#141414' }}>{fmt(v)}</Text>,
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
      render: (_, r) => (
        <Space size={0}>
          <Button type="link" size="small" style={{ padding: '0 4px' }} onClick={() => onSwitchTab('trade', r.enterpriseName)}>股份交易</Button>
          <Button type="link" size="small" style={{ padding: '0 4px' }} onClick={() => onSwitchTab('dividend', r.enterpriseName)}>投资分红</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {[
          { label: `持股估值合计（${currency === 'all' ? 'USDT' : currency}）`, value: fmt(totalValuation), color: '#141414' },
          { label: `股份收益合计（${currency === 'all' ? 'USDT' : currency}）`, value: fmt(totalRevenue), color: '#141414' },
          { label: '持股企业数', value: `${holdingCount} 家`, color: '#141414' },
        ].map((s) => (
          <Col xs={24} sm={8} key={s.label}>
            <Card bordered={false} style={{ textAlign: 'center', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
            </Card>
          </Col>
        ))}
      </Row>
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <ConfigProvider theme={radioTheme}>
            <Radio.Group value={currency} onChange={(e) => setCurrency(e.target.value)} buttonStyle="solid">
              <Radio.Button value="all">全部</Radio.Button>
              <Radio.Button value="USDT">USDT</Radio.Button>
              <Radio.Button value="PEA">PEA</Radio.Button>
            </Radio.Group>
          </ConfigProvider>
          <Input
            suffix={<SearchOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
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
          rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
        />
      </Card>
    </div>
  );
};

// ── 股份交易 ──────────────────────────────────────────────────────
const TradeContent: React.FC<{ initialEnterprise?: string }> = ({ initialEnterprise }) => {
  const [orderType, setOrderType] = useState('all');
  const [currency, setCurrency] = useState('all');
  const [enterprise, setEnterprise] = useState<string | undefined>(initialEnterprise);
  const [search, setSearch] = useState('');

  React.useEffect(() => {
    setEnterprise(initialEnterprise);
  }, [initialEnterprise]);

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
    { title: '订单类型', dataIndex: 'orderType', width: 100 },
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
    <Space direction="vertical" size={12} style={{ display: 'flex' }}>
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
        <Space size={16} wrap align="center">
          <ConfigProvider theme={radioTheme}>
            <Radio.Group value={orderType} onChange={(e) => setOrderType(e.target.value)} buttonStyle="solid">
              <Radio.Button value="all">全部</Radio.Button>
              <Radio.Button value="购买股份">购买股份</Radio.Button>
              <Radio.Button value="释放股份">释放股份</Radio.Button>
            </Radio.Group>
          </ConfigProvider>
          <ConfigProvider theme={radioTheme}>
            <Radio.Group value={currency} onChange={(e) => setCurrency(e.target.value)} buttonStyle="solid">
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
            suffix={<SearchOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
            placeholder="订单编号"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            style={{ width: 180 }}
          />
        </Space>
      </Card>
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          size="middle"
          scroll={{ x: 1200 }}
          rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
        />
      </Card>
    </Space>
  );
};

// ── 投资分红 ──────────────────────────────────────────────────────
const DividendContent: React.FC<{ initialEnterprise?: string }> = ({ initialEnterprise }) => {
  const [orderType, setOrderType] = useState('all');
  const [enterprise, setEnterprise] = useState<string | undefined>(initialEnterprise);
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<DivRow | null>(null);

  React.useEffect(() => {
    setEnterprise(initialEnterprise);
  }, [initialEnterprise]);

  const filtered = divData.filter((r) => {
    const kw = search.toLowerCase();
    return (
      (orderType === 'all' || r.orderType === orderType) &&
      (!enterprise || r.enterpriseName === enterprise) &&
      (!kw || r.orderId.toLowerCase().includes(kw))
    );
  });

  // 详情弹窗子表格 mock 数据（基于父记录生成）
  const getDetailRows = (row: DivRow) =>
    Array.from({ length: 5 }, (_, i) => ({
      key: `${row.id}-${i}`,
      tradeTime: `2017-10-01 12:0${i}`,
      finishTime: `2017-10-01 12:0${i}`,
      currency: i % 2 === 0 ? 'USDT' : 'PEA',
      amount: i % 2 === 0 ? 873233.23 : 73233.23,
      shareholderName: row.shareholderName,
      shareholdingRatio: '85.00%',
    }));

  const detailSubColumns = [
    { title: '交易时间', dataIndex: 'tradeTime', width: 140 },
    { title: '完成时间', dataIndex: 'finishTime', width: 140 },
    { title: '货币单位', dataIndex: 'currency', width: 80 },
    { title: '交易金额', dataIndex: 'amount', width: 110, align: 'right' as const, render: (v: number) => fmt(v) },
    { title: '股东昵称', dataIndex: 'shareholderName', width: 90 },
    { title: '持有股份', dataIndex: 'shareholdingRatio', width: 90 },
  ];

  const columns: ColumnsType<DivRow> = [
    { title: '完成时间', dataIndex: 'finishTime', width: 175 },
    { title: '企业ID', dataIndex: 'enterpriseId', width: 100 },
    { title: '企业名称', dataIndex: 'enterpriseName', width: 110 },
    { title: '订单编号', dataIndex: 'orderId', width: 130 },
    { title: '订单类型', dataIndex: 'orderType', width: 90 },
    { title: '订单金额', dataIndex: 'amount', width: 130, align: 'right', sorter: (a, b) => a.amount - b.amount, render: (v) => fmt(v) },
    { title: '税费', dataIndex: 'tax', width: 110, align: 'right', sorter: (a, b) => a.tax - b.tax, render: (v) => fmt(v) },
    { title: '货币单位', dataIndex: 'currency', width: 90 },
    {
      title: '操作', width: 80, fixed: 'right' as const,
      render: (_, r) => <Button type="link" size="small" style={{ padding: 0 }} onClick={() => setDetail(r)}>查看</Button>,
    },
  ];

  return (
    <>
      <Space direction="vertical" size={12} style={{ display: 'flex' }}>
        <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
          <Space size={16} wrap align="center">
            <ConfigProvider theme={radioTheme}>
              <Radio.Group value={orderType} onChange={(e) => setOrderType(e.target.value)} buttonStyle="solid">
                <Radio.Button value="all">全部</Radio.Button>
                <Radio.Button value="分红">分红</Radio.Button>
                <Radio.Button value="投资">投资</Radio.Button>
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
              suffix={<SearchOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
              placeholder="订单编号"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              style={{ width: 180 }}
            />
          </Space>
        </Card>
        <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
          <Table
            columns={columns}
            dataSource={filtered}
            rowKey="id"
            size="middle"
            scroll={{ x: 1000 }}
            rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
            pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
          />
        </Card>
      </Space>

      {/* 详情弹窗 */}
      <Modal
        title="投资分红详情"
        open={!!detail}
        onCancel={() => setDetail(null)}
        footer={<Button onClick={() => setDetail(null)}>关闭</Button>}
        width={680}
        destroyOnClose
      >
        {detail && (
          <>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, marginTop: 8 }}>订单详情</div>
            <div style={{ marginBottom: 16, lineHeight: 2, fontSize: 13 }}>
              <div>订单类型：<Text strong>{detail.orderType}</Text></div>
              <div>企业总资产快照：<Text strong>{fmt(detail.assetSnapshot)}</Text></div>
              <div>公司持股比例：{detail.companyShareRatio}</div>
            </div>
            <Table
              columns={detailSubColumns}
              dataSource={getDetailRows(detail)}
              rowKey="key"
              size="small"
              pagination={false}
              scroll={{ x: 640 }}
              bordered
            />
          </>
        )}
      </Modal>
    </>
  );
};

// ── 主组件 ────────────────────────────────────────────────────────
const CompanyShareholding: React.FC = () => {
  const [activeTab, setActiveTab] = useState('holding');
  const [switchedEnterprise, setSwitchedEnterprise] = useState<string | undefined>();

  const handleSwitchTab = (tab: string, enterprise?: string) => {
    setSwitchedEnterprise(enterprise);
    setActiveTab(tab);
  };

  const tabItems = [
    {
      key: 'holding',
      label: '入股清单',
      children: <HoldingContent onSwitchTab={handleSwitchTab} />,
    },
    {
      key: 'trade',
      label: '股份交易',
      children: <TradeContent initialEnterprise={switchedEnterprise} />,
    },
    {
      key: 'dividend',
      label: '投资分红',
      children: <DividendContent initialEnterprise={switchedEnterprise} />,
    },
  ];

  return (
    <div style={{ marginTop: -16 }}>
      <Tabs
        items={tabItems}
        activeKey={activeTab}
        onChange={setActiveTab}
        tabBarStyle={{
          background: '#fff',
          margin: '0 -24px',
          padding: '0 24px',
        }}
      />
    </div>
  );
};

export default CompanyShareholding;
