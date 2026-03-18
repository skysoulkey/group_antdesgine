import { useState } from 'react';
import { Card, Row, Col, Input, Select, Table, Tag, DatePicker, Typography, Button } from 'antd';
import { SearchOutlined, RiseOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface ShareholdingRecord {
  id: number;
  recordId: string;
  company: string;
  targetEnterprise: string;
  shareRatio: string;
  investedAmount: string;
  currentValuation: string;
  unrealizedPnl: string;
  pnlRate: string;
  currency: 'USDT' | 'PEA';
  status: 'active' | 'exited' | 'pending';
  investedAt: string;
}

const statusMap = {
  active:  { label: '持仓中', color: 'success' },
  exited:  { label: '已退出', color: 'default' },
  pending: { label: '待确认', color: 'processing' },
} as const;

const COMPANIES = ['UU Talk', 'Hey Talk', '炸雷第一波'];
const ENTERPRISES = ['hey', 'wow', 'boom', 'flash', 'nova'];

const mockData: ShareholdingRecord[] = Array.from({ length: 15 }, (_, i) => {
  const invested = 50000 + i * 12500;
  const pnlRate = ((i % 7) - 3) * 8;
  const valuation = invested * (1 + pnlRate / 100);
  const pnl = valuation - invested;
  return {
    id: i + 1,
    recordId: `SH2025${String(1120001 + i).padStart(7, '0')}`,
    company: COMPANIES[i % COMPANIES.length],
    targetEnterprise: ENTERPRISES[i % ENTERPRISES.length],
    shareRatio: (5 + (i % 10) * 2.5).toFixed(2),
    investedAmount: invested.toFixed(2),
    currentValuation: valuation.toFixed(2),
    unrealizedPnl: (pnl >= 0 ? '+' : '') + pnl.toFixed(2),
    pnlRate: (pnlRate >= 0 ? '+' : '') + pnlRate.toFixed(2),
    currency: 'USDT',
    status: (['active', 'exited', 'pending'] as const)[i % 3],
    investedAt: `2025-0${1 + (i % 9)}-${String(1 + (i % 28)).padStart(2, '0')} 10:00:00`,
  };
});

export default function CompanyShareholding() {
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const filtered = mockData.filter(r => {
    const kw = search.toLowerCase();
    return (
      (!kw || r.recordId.toLowerCase().includes(kw) || r.targetEnterprise.toLowerCase().includes(kw)) &&
      (!companyFilter || r.company === companyFilter) &&
      (!statusFilter || r.status === statusFilter)
    );
  });

  const totalValuation = mockData.reduce((s, r) => s + Number(r.currentValuation), 0);
  const totalInvested = mockData.reduce((s, r) => s + Number(r.investedAmount), 0);
  const totalPnl = totalValuation - totalInvested;

  const statsCards = [
    { label: '总持股估值（USDT）', value: totalValuation, color: '#1677ff' },
    { label: '累计投入（USDT）', value: totalInvested, color: '#fa8c16' },
    { label: '未实现盈亏（USDT）', value: totalPnl, color: totalPnl >= 0 ? '#52c41a' : '#ff4d4f' },
  ];

  const columns: ColumnsType<ShareholdingRecord> = [
    { title: '记录编号', dataIndex: 'recordId', width: 170, render: v => <Text code style={{ fontSize: 12 }}>{v}</Text> },
    { title: '持股公司', dataIndex: 'company', render: v => <Text strong>{v}</Text> },
    { title: '标的企业', dataIndex: 'targetEnterprise', width: 120, render: v => <Text strong>{v}</Text> },
    { title: '持股比例', dataIndex: 'shareRatio', width: 100, align: 'right', render: v => `${v}%` },
    {
      title: '投入金额', dataIndex: 'investedAmount', width: 160, align: 'right',
      render: (v, r) => `${Number(v).toLocaleString('en', { minimumFractionDigits: 2 })} ${r.currency}`,
    },
    {
      title: '当前估值', dataIndex: 'currentValuation', width: 160, align: 'right',
      render: (v, r) => (
        <Text strong style={{ color: '#1677ff' }}>
          {Number(v).toLocaleString('en', { minimumFractionDigits: 2 })} {r.currency}
        </Text>
      ),
    },
    {
      title: '未实现盈亏', dataIndex: 'unrealizedPnl', width: 160, align: 'right',
      render: (v, r) => {
        const isPositive = !r.unrealizedPnl.startsWith('-');
        return (
          <Text strong style={{ color: isPositive ? '#52c41a' : '#ff4d4f' }}>
            {isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            {' '}{Number(v).toLocaleString('en', { minimumFractionDigits: 2 })} {r.currency}
          </Text>
        );
      },
    },
    {
      title: '收益率', dataIndex: 'pnlRate', width: 90, align: 'right',
      render: v => {
        const isPos = !String(v).startsWith('-');
        return <Text style={{ color: isPos ? '#52c41a' : '#ff4d4f' }}>{v}%</Text>;
      },
    },
    {
      title: '状态', dataIndex: 'status', width: 90,
      render: v => <Tag color={statusMap[v as keyof typeof statusMap].color}>{statusMap[v as keyof typeof statusMap].label}</Tag>,
    },
    { title: '投入时间', dataIndex: 'investedAt', width: 170 },
    {
      title: '操作', key: 'action', width: 80, fixed: 'right',
      render: () => <Button type="link" size="small">详情</Button>,
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {statsCards.map(item => (
          <Col xs={24} sm={8} key={item.label}>
            <Card bordered={false} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 8 }}>{item.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: item.color }}>
                {item.value.toLocaleString('en', { minimumFractionDigits: 2 })}
              </div>
            </Card>
          </Col>
        ))}
      </Row>
      <Card bordered={false}>
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <RiseOutlined style={{ color: '#1677ff', fontSize: 18 }} />
          <Text style={{ fontSize: 16, fontWeight: 600 }}>公司持股</Text>
        </div>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col>
            <Input prefix={<SearchOutlined />} placeholder="搜索记录编号 / 企业名称"
              value={search} onChange={e => setSearch(e.target.value)} allowClear style={{ width: 280 }} />
          </Col>
          <Col>
            <Select placeholder="持股公司" value={companyFilter} onChange={setCompanyFilter} allowClear
              style={{ width: 150 }} options={COMPANIES.map(c => ({ label: c, value: c }))} />
          </Col>
          <Col>
            <Select placeholder="状态" value={statusFilter} onChange={setStatusFilter} allowClear style={{ width: 130 }}
              options={[{ label: '持仓中', value: 'active' }, { label: '已退出', value: 'exited' }, { label: '待确认', value: 'pending' }]} />
          </Col>
          <Col><RangePicker style={{ width: 280 }} /></Col>
        </Row>
        <Table dataSource={filtered} columns={columns} rowKey="id" size="middle" scroll={{ x: 1400 }}
          pagination={{ total: filtered.length, pageSize: 10, showTotal: t => `总共 ${t} 条记录`, showSizeChanger: true }} />
      </Card>
    </div>
  );
}
