import { useState } from 'react';
import { Card, Row, Col, Input, Select, Table, Tag, DatePicker, Typography } from 'antd';
import { SearchOutlined, RiseOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface RevenueRecord {
  id: number;
  recordId: string;
  company: string;
  enterprise: string;
  revenueType: string;
  currency: 'USDT' | 'PEA';
  grossRevenue: string;
  taxDeducted: string;
  commissionDeducted: string;
  finalRevenue: string;
  periodDate: string;
  status: 'settled' | 'pending';
  createdAt: string;
}

const statusMap = {
  settled: { label: '已结算', color: 'success' },
  pending: { label: '待结算', color: 'processing' },
} as const;

const REVENUE_TYPES = ['游戏收益', '股份收益', '参股收益'];
const COMPANIES = ['UU Talk', 'Hey Talk', '炸雷第一波'];
const ENTERPRISES = ['hey', 'wow', 'boom', 'flash', 'nova'];

const mockData: RevenueRecord[] = Array.from({ length: 20 }, (_, i) => {
  const gross = 30000 + i * 8750.5;
  const tax = gross * 0.05;
  const commission = gross * 0.1;
  const final = gross - tax - commission;
  return {
    id: i + 1,
    recordId: `REV2025${String(1120001 + i).padStart(7, '0')}`,
    company: COMPANIES[i % COMPANIES.length],
    enterprise: ENTERPRISES[i % ENTERPRISES.length],
    revenueType: REVENUE_TYPES[i % REVENUE_TYPES.length],
    currency: (['USDT', 'PEA'] as const)[i % 2],
    grossRevenue: gross.toFixed(2),
    taxDeducted: tax.toFixed(2),
    commissionDeducted: commission.toFixed(2),
    finalRevenue: final.toFixed(2),
    periodDate: `2025-${String(1 + (i % 11)).padStart(2, '0')}`,
    status: (['settled', 'pending'] as const)[i % 2],
    createdAt: `2025-11-${String(1 + (i % 28)).padStart(2, '0')} 08:${String(i % 60).padStart(2, '0')}:00`,
  };
});

export default function FinanceRevenue() {
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState<string | undefined>();
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const filtered = mockData.filter(r => {
    const kw = search.toLowerCase();
    return (
      (!kw || r.recordId.toLowerCase().includes(kw) || r.company.toLowerCase().includes(kw)) &&
      (!companyFilter || r.company === companyFilter) &&
      (!typeFilter || r.revenueType === typeFilter) &&
      (!statusFilter || r.status === statusFilter)
    );
  });

  const totalGross = mockData.reduce((s, r) => s + Number(r.grossRevenue), 0);
  const totalTax = mockData.reduce((s, r) => s + Number(r.taxDeducted), 0);
  const totalCommission = mockData.reduce((s, r) => s + Number(r.commissionDeducted), 0);
  const totalFinal = mockData.reduce((s, r) => s + Number(r.finalRevenue), 0);

  const statsCards = [
    { label: '本月总收益（USDT）', value: totalGross, color: '#1677ff' },
    { label: '本月税收扣除（USDT）', value: totalTax, color: '#fa8c16' },
    { label: '本月佣金扣除（USDT）', value: totalCommission, color: '#722ed1' },
    { label: '本月净收益（USDT）', value: totalFinal, color: '#52c41a' },
  ];

  const columns: ColumnsType<RevenueRecord> = [
    { title: '记录编号', dataIndex: 'recordId', width: 180, render: v => <Text code style={{ fontSize: 12 }}>{v}</Text> },
    { title: '归属公司', dataIndex: 'company', render: v => <Text strong>{v}</Text> },
    { title: '企业名称', dataIndex: 'enterprise', width: 120 },
    { title: '收益类型', dataIndex: 'revenueType', width: 110 },
    { title: '币种', dataIndex: 'currency', width: 70 },
    {
      title: '毛收益', dataIndex: 'grossRevenue', width: 150, align: 'right',
      render: v => Number(v).toLocaleString('en', { minimumFractionDigits: 2 }),
    },
    {
      title: '税收扣除', dataIndex: 'taxDeducted', width: 130, align: 'right',
      render: v => <Text type="warning">-{Number(v).toLocaleString('en', { minimumFractionDigits: 2 })}</Text>,
    },
    {
      title: '佣金扣除', dataIndex: 'commissionDeducted', width: 130, align: 'right',
      render: v => <Text style={{ color: '#722ed1' }}>-{Number(v).toLocaleString('en', { minimumFractionDigits: 2 })}</Text>,
    },
    {
      title: '净收益', dataIndex: 'finalRevenue', width: 150, align: 'right',
      render: v => <Text strong style={{ color: '#52c41a' }}>{Number(v).toLocaleString('en', { minimumFractionDigits: 2 })}</Text>,
    },
    { title: '账单月份', dataIndex: 'periodDate', width: 100 },
    {
      title: '状态', dataIndex: 'status', width: 90,
      render: v => <Tag color={statusMap[v as keyof typeof statusMap].color}>{statusMap[v as keyof typeof statusMap].label}</Tag>,
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {statsCards.map(item => (
          <Col xs={24} sm={12} lg={6} key={item.label}>
            <Card bordered={false} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 8 }}>{item.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: item.color }}>
                {item.value.toLocaleString('en', { minimumFractionDigits: 2 })}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card bordered={false}>
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <RiseOutlined style={{ color: '#52c41a', fontSize: 18 }} />
          <Text style={{ fontSize: 16, fontWeight: 600 }}>集团收益</Text>
        </div>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col>
            <Input prefix={<SearchOutlined />} placeholder="搜索记录编号 / 公司名称"
              value={search} onChange={e => setSearch(e.target.value)} allowClear style={{ width: 280 }} />
          </Col>
          <Col>
            <Select placeholder="归属公司" value={companyFilter} onChange={setCompanyFilter} allowClear
              style={{ width: 150 }} options={COMPANIES.map(c => ({ label: c, value: c }))} />
          </Col>
          <Col>
            <Select placeholder="收益类型" value={typeFilter} onChange={setTypeFilter} allowClear
              style={{ width: 130 }} options={REVENUE_TYPES.map(t => ({ label: t, value: t }))} />
          </Col>
          <Col>
            <Select placeholder="状态" value={statusFilter} onChange={setStatusFilter} allowClear style={{ width: 130 }}
              options={[{ label: '已结算', value: 'settled' }, { label: '待结算', value: 'pending' }]} />
          </Col>
          <Col><RangePicker style={{ width: 280 }} /></Col>
        </Row>
        <Table dataSource={filtered} columns={columns} rowKey="id" size="middle" scroll={{ x: 1400 }}
          pagination={{ total: filtered.length, pageSize: 10, showTotal: t => `总共 ${t} 条记录`, showSizeChanger: true }} />
      </Card>
    </div>
  );
}
