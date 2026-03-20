import { ArrowDownOutlined, ArrowUpOutlined, SearchOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Input,
  Row,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';

const { Text } = Typography;

const ENTERPRISES = ['hey', 'wow', 'boom', 'flash', 'nova'];

// ── 入股清单数据 ──────────────────────────────────────────────────
interface HoldingRow {
  id: string;
  enterpriseId: string;
  enterpriseName: string;
  ratio: string;
  valuation: string;
  totalAsset: string;
  revenue: string;
  currency: string;
  updatedAt: string;
  status: string;
}

const holdingData: HoldingRow[] = Array.from({ length: 12 }, (_, i) => {
  const invested = 50000 + i * 12500;
  const pnlRate = ((i % 7) - 3) * 8;
  const valuation = (invested * (1 + pnlRate / 100)).toFixed(2);
  return {
    id: `SH${String(i + 1).padStart(5, '0')}`,
    enterpriseId: `ENT${10000 + i}`,
    enterpriseName: ENTERPRISES[i % 5],
    ratio: `${(5 + (i % 10) * 2.5).toFixed(2)}%`,
    valuation: Number(valuation).toLocaleString() + '.00',
    totalAsset: `${(200000 + i * 30000).toLocaleString()}.00`,
    revenue: i % 3 === 0 ? `-${(1000 + i * 200)}.00` : `${(3000 + i * 1500).toLocaleString()}.00`,
    currency: i % 2 === 0 ? 'USDT' : 'PEA',
    updatedAt: `2026-0${(i % 3) + 1}-${String(i + 1).padStart(2, '0')}`,
    status: i % 4 === 3 ? '已退出' : '持股中',
  };
});

// ── 股份交易数据 ──────────────────────────────────────────────────
interface TradeRow { id: string; direction: string; tradeTime: string; amount: string; enterpriseName: string; shareRatio: string; expenditure: string; income: string; status: string }
const tradeData: TradeRow[] = Array.from({ length: 8 }, (_, i) => ({
  id: `TR${String(i + 1).padStart(5, '0')}`,
  direction: i % 2 === 0 ? '买入' : '卖出',
  tradeTime: `2026-0${(i % 3) + 1}-${String(i + 1).padStart(2, '0')} 14:${String(i * 7).padStart(2, '0')}:00`,
  amount: `${(5000 + i * 2000).toLocaleString()}.00`,
  enterpriseName: ENTERPRISES[i % 5],
  shareRatio: `${(5 + i * 2).toFixed(2)}%`,
  expenditure: i % 2 === 0 ? `${(5000 + i * 2000).toLocaleString()}.00` : '0.00',
  income: i % 2 !== 0 ? `${(5000 + i * 2000).toLocaleString()}.00` : '0.00',
  status: '已完成',
}));

// ── 投资分红数据 ──────────────────────────────────────────────────
interface DivRow { id: string; appName: string; game: string; startTime: string; endTime: string; members: number; totalInvest: string; totalDividend: string; totalProfit: string; status: string }
const divData: DivRow[] = Array.from({ length: 8 }, (_, i) => ({
  id: `DIV${String(i + 1).padStart(5, '0')}`,
  appName: ['UU Talk', 'Hey Talk', 'Star Game'][i % 3],
  game: ['百家乐', '龙虎斗', '骰子'][i % 3],
  startTime: `2026-0${(i % 3) + 1}-${String(i + 1).padStart(2, '0')} 10:00:00`,
  endTime: `2026-0${(i % 3) + 1}-${String(i + 1).padStart(2, '0')} 22:00:00`,
  members: 12 + i * 3,
  totalInvest: `${(10000 + i * 3000).toLocaleString()}.00`,
  totalDividend: `${(8000 + i * 2500).toLocaleString()}.00`,
  totalProfit: i % 3 === 1 ? `-${(500 + i * 100).toLocaleString()}.00` : `${(1500 + i * 800).toLocaleString()}.00`,
  status: ['正常', '审核中', '已结算'][i % 3],
}));

// ── 主组件 ────────────────────────────────────────────────────────
const CompanyShareholding: React.FC = () => {
  const [activeTab, setActiveTab] = useState('holding');
  const [search, setSearch] = useState('');
  const [currency, setCurrency] = useState<string | undefined>();
  const [enterprise, setEnterprise] = useState<string | undefined>();

  const filteredHoldings = holdingData.filter((r) => {
    const kw = search.toLowerCase();
    return (
      (!kw || r.enterpriseName.toLowerCase().includes(kw) || r.enterpriseId.includes(kw)) &&
      (!currency || r.currency === currency) &&
      (!enterprise || r.enterpriseName === enterprise)
    );
  });

  const holdingColumns: ColumnsType<HoldingRow> = [
    { title: '更新时间', dataIndex: 'updatedAt', width: 170 },
    { title: '企业ID', dataIndex: 'enterpriseId', width: 100 },
    { title: '企业名称', dataIndex: 'enterpriseName', width: 110 },
    { title: '持股比例', dataIndex: 'ratio', width: 90, align: 'right' },
    { title: '持股估值', dataIndex: 'valuation', width: 130, align: 'right', render: (v, r) => <Text style={{ color: '#722ed1' }}>{v} {r.currency}</Text> },
    { title: '企业总资产', dataIndex: 'totalAsset', width: 130, align: 'right' },
    { title: '股份收益', dataIndex: 'revenue', width: 120, align: 'right', render: (v: string) => <Text style={{ color: v.startsWith('-') ? '#ff4d4f' : '#52c41a' }}>{v}</Text> },
    { title: '货币单位', dataIndex: 'currency', width: 80 },
    { title: '状态', dataIndex: 'status', width: 90, render: (v) => <Tag color={v === '持股中' ? 'success' : 'default'}>{v}</Tag> },
    {
      title: '操作', width: 160, fixed: 'right' as const,
      render: () => (
        <Space size={0}>
          <Button type="link" size="small" style={{ padding: '0 4px' }} onClick={() => setActiveTab('trade')}>股份交易</Button>
          <Button type="link" size="small" style={{ padding: '0 4px' }} onClick={() => setActiveTab('dividend')}>投资分红</Button>
        </Space>
      ),
    },
  ];

  const tradeColumns: ColumnsType<TradeRow> = [
    { title: '交易时间', dataIndex: 'tradeTime', width: 170 },
    { title: '交易方向', dataIndex: 'direction', width: 90, render: (v) => <Tag color={v === '买入' ? 'success' : 'error'}>{v}</Tag> },
    { title: '企业名称', dataIndex: 'enterpriseName', width: 110 },
    { title: '交易金额', dataIndex: 'amount', width: 130, align: 'right' },
    { title: '持有股份', dataIndex: 'shareRatio', width: 90, align: 'right' },
    { title: '股东支出', dataIndex: 'expenditure', width: 120, align: 'right' },
    { title: '股东收入', dataIndex: 'income', width: 120, align: 'right' },
    { title: '状态', dataIndex: 'status', width: 90, render: (v) => <Tag color="success">{v}</Tag> },
  ];

  const divColumns: ColumnsType<DivRow> = [
    { title: '发起时间', dataIndex: 'startTime', width: 170 },
    { title: '应用名称', dataIndex: 'appName', width: 100 },
    { title: '游戏', dataIndex: 'game', width: 80 },
    { title: '完成时间', dataIndex: 'endTime', width: 170 },
    { title: '参与成员', dataIndex: 'members', width: 80, align: 'right' },
    { title: '总投资', dataIndex: 'totalInvest', width: 130, align: 'right' },
    { title: '总分红', dataIndex: 'totalDividend', width: 130, align: 'right' },
    { title: '总盈亏', dataIndex: 'totalProfit', width: 130, align: 'right', render: (v: string) => <Text style={{ color: v.startsWith('-') ? '#ff4d4f' : '#52c41a' }}>{v}</Text> },
    { title: '状态', dataIndex: 'status', width: 90, render: (v) => <Tag color={v === '正常' ? 'success' : v === '审核中' ? 'processing' : 'default'}>{v}</Tag> },
  ];

  // 汇总统计
  const totalValuation = holdingData.reduce((s, r) => s + parseFloat(r.valuation.replace(/,/g, '')), 0);
  const totalRevenue   = holdingData.reduce((s, r) => s + parseFloat(r.revenue.replace(/,/g, '').replace('-', '')), 0);

  const tabItems = [
    {
      key: 'holding',
      label: '入股清单',
      children: (
        <div>
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            {[
              { label: '持股估值合计（USDT）', value: totalValuation.toLocaleString(undefined, { maximumFractionDigits: 0 }), color: '#722ed1', icon: <ArrowUpOutlined /> },
              { label: '股份收益合计（USDT）', value: totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 }), color: '#52c41a', icon: <ArrowUpOutlined /> },
              { label: '持股企业数', value: `${holdingData.filter(r => r.status === '持股中').length} 家`, color: '#722ed1', icon: null },
            ].map((s) => (
              <Col xs={24} sm={8} key={s.label}>
                <Card bordered={false} style={{ textAlign: 'center', borderRadius: 8 }}>
                  <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', marginBottom: 6 }}>{s.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
                </Card>
              </Col>
            ))}
          </Row>
          <Space style={{ marginBottom: 16 }} wrap>
            <Input prefix={<SearchOutlined />} placeholder="企业名称 / 企业ID" value={search} onChange={(e) => setSearch(e.target.value)} allowClear style={{ width: 220 }} />
            <Select placeholder="货币单位" value={currency} onChange={setCurrency} allowClear style={{ width: 110 }}
              options={[{ value: 'USDT', label: 'USDT' }, { value: 'PEA', label: 'PEA' }]} />
            <Select placeholder="企业名称" value={enterprise} onChange={setEnterprise} allowClear style={{ width: 140 }}
              options={ENTERPRISES.map((e) => ({ value: e, label: e }))} />
          </Space>
          <Table columns={holdingColumns} dataSource={filteredHoldings} rowKey="id" size="middle"
            scroll={{ x: 1200 }} pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }} />
        </div>
      ),
    },
    {
      key: 'trade',
      label: '股份交易',
      children: (
        <Table columns={tradeColumns} dataSource={tradeData} rowKey="id" size="middle"
          scroll={{ x: 900 }} pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }} />
      ),
    },
    {
      key: 'dividend',
      label: '投资分红',
      children: (
        <Table columns={divColumns} dataSource={divData} rowKey="id" size="middle"
          scroll={{ x: 1000 }} pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }} />
      ),
    },
  ];

  return <Tabs items={tabItems} type="card" activeKey={activeTab} onChange={setActiveTab} />;
};

export default CompanyShareholding;
