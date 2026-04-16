import { useState } from 'react';
import { Card, Row, Col, ConfigProvider, Input, Radio, Select, Table, Tag, DatePicker, Typography } from 'antd';
import { SearchOutlined, FileTextOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface CompanyTaxOrder {
  id: number;
  orderId: string;
  companyName: string;
  enterpriseName: string;
  taxType: string;
  taxRate: string;
  baseAmount: string;
  taxAmount: string;
  currency: 'USDT' | 'PEA';
  status: 'settled' | 'pending' | 'cancelled';
  createdAt: string;
}

const statusMap = {
  settled:   { label: '已结算', color: 'success' },
  pending:   { label: '待结算', color: 'processing' },
  cancelled: { label: '已取消', color: 'default' },
} as const;

const TAX_TYPES = ['游戏税收', '股份税收', '参股税收'];
const COMPANIES = ['UU Talk', 'Hey Talk', '炸雷第一波'];
const ENTERPRISES = ['hey', 'wow', 'boom', 'flash', 'nova'];

const mockData: CompanyTaxOrder[] = Array.from({ length: 20 }, (_, i) => {
  const base = 12000 + i * 2890.5;
  const rate = (i % 5) + 3;
  return {
    id: i + 1,
    orderId: `CTAX2025${String(1120001 + i).padStart(7, '0')}`,
    companyName: COMPANIES[i % COMPANIES.length],
    enterpriseName: ENTERPRISES[i % ENTERPRISES.length],
    taxType: TAX_TYPES[i % TAX_TYPES.length],
    taxRate: rate.toFixed(2),
    baseAmount: base.toFixed(2),
    taxAmount: (base * rate / 100).toFixed(2),
    currency: (['USDT', 'PEA'] as const)[i % 2],
    status: (['settled', 'pending', 'cancelled'] as const)[i % 3],
    createdAt: `2025-11-${String(1 + (i % 28)).padStart(2, '0')} 11:${String(i % 60).padStart(2, '0')}:00`,
  };
});

export default function CompanyTax() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [companyFilter, setCompanyFilter] = useState<string | undefined>();

  const filtered = mockData.filter(r => {
    const kw = search.toLowerCase();
    return (
      (!kw || r.orderId.toLowerCase().includes(kw) || r.companyName.toLowerCase().includes(kw)) &&
      (!statusFilter || r.status === statusFilter) &&
      (!companyFilter || r.companyName === companyFilter)
    );
  });

  const columns: ColumnsType<CompanyTaxOrder> = [
    { title: '订单编号', dataIndex: 'orderId', width: 200, render: v => <Text code style={{ fontSize: 12 }}>{v}</Text> },
    { title: '公司名称', dataIndex: 'companyName', render: v => <Text strong>{v}</Text> },
    { title: '企业名称', dataIndex: 'enterpriseName', width: 120 },
    { title: '税收类型', dataIndex: 'taxType', width: 110 },
    { title: '税率', dataIndex: 'taxRate', width: 80, align: 'right', render: v => `${v}%` },
    {
      title: '税前金额', dataIndex: 'baseAmount', width: 160, align: 'right',
      render: (v, r) => `${Number(v).toLocaleString('en', { minimumFractionDigits: 2 })} ${r.currency}`,
    },
    {
      title: '税收金额', dataIndex: 'taxAmount', width: 160, align: 'right',
      render: (v, r) => (
        <Text strong style={{ color: '#141414' }}>
          {Number(v).toLocaleString('en', { minimumFractionDigits: 2 })} {r.currency}
        </Text>
      ),
    },
    {
      title: '状态', dataIndex: 'status', width: 100,
      render: v => <Tag color={statusMap[v as keyof typeof statusMap].color}>{statusMap[v as keyof typeof statusMap].label}</Tag>,
    },
    { title: '创建时间', dataIndex: 'createdAt', width: 170 },
  ];

  return (
    <Card bordered={false}>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <FileTextOutlined style={{ color: '#1677ff', fontSize: 18 }} />
        <Text style={{ fontSize: 16, fontWeight: 600 }}>公司税单</Text>
      </div>
      <Row gutter={[16, 12]} style={{ marginBottom: 16 }} align="middle">
        <Col>
          <Input prefix={<SearchOutlined />} placeholder="订单编号 / 公司名称"
            value={search} onChange={e => setSearch(e.target.value)} allowClear style={{ width: 280 }} />
        </Col>
        <Col>
          <Select placeholder="公司筛选" value={companyFilter} onChange={setCompanyFilter} allowClear
            style={{ width: 150 }} options={COMPANIES.map(c => ({ label: c, value: c }))} />
        </Col>
        <Col>
          <ConfigProvider theme={{ components: { Radio: { buttonSolidCheckedBg: '#1677ff', buttonSolidCheckedHoverBg: '#4096ff', buttonSolidCheckedActiveBg: '#0958d9', buttonSolidCheckedColor: '#fff', colorPrimary: '#1677ff' } } }}>
            <Radio.Group
              buttonStyle="solid"
              value={statusFilter ?? 'all'}
              onChange={(e) => setStatusFilter(e.target.value === 'all' ? undefined : e.target.value)}
            >
              {([
                { v: 'all', label: '全部' },
                { v: 'settled', label: '已结算' },
                { v: 'pending', label: '待结算' },
                { v: 'cancelled', label: '已取消' },
              ]).map(({ v, label }) => (
                <Radio.Button key={v} value={v}>{label}</Radio.Button>
              ))}
            </Radio.Group>
          </ConfigProvider>
        </Col>
        <Col><RangePicker style={{ width: 280 }} /></Col>
      </Row>
      <Table dataSource={filtered} columns={columns} rowKey="id" size="middle" scroll={{ x: 1200 }}
        rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
        pagination={{ total: filtered.length, pageSize: 10, showTotal: t => `总共 ${t} 条记录`, showSizeChanger: true }} />
    </Card>
  );
}
