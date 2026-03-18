import { useState } from 'react';
import { Card, Row, Col, Input, Select, Table, Tag, DatePicker, Typography } from 'antd';
import { SearchOutlined, SwapOutlined, ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface TransferRecord {
  id: number;
  transferId: string;
  direction: 'in' | 'out';
  fromCompany: string;
  toCompany: string;
  amount: string;
  currency: 'USDT' | 'PEA';
  remark: string;
  status: 'success' | 'pending' | 'failed';
  operator: string;
  createdAt: string;
}

const statusMap = {
  success: { label: '成功', color: 'success' },
  pending: { label: '处理中', color: 'processing' },
  failed:  { label: '失败', color: 'error' },
} as const;

const COMPANIES = ['UU Talk', 'Hey Talk', '炸雷第一波', 'Nova Corp', 'Flash Inc'];

const mockData: TransferRecord[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  transferId: `TRF2025${String(1120001 + i).padStart(7, '0')}`,
  direction: (['in', 'out'] as const)[i % 2],
  fromCompany: COMPANIES[i % COMPANIES.length],
  toCompany: COMPANIES[(i + 1) % COMPANIES.length],
  amount: (5000 + i * 8321.5).toFixed(2),
  currency: (['USDT', 'PEA'] as const)[i % 2],
  remark: ['月度内部划转', '季度资金调配', '年度结算划转', '临时资金调拨'][i % 4],
  status: (['success', 'pending', 'failed'] as const)[i % 3],
  operator: ['Admin', 'FinanceManager', 'SuperAdmin'][i % 3],
  createdAt: `2025-11-${String(1 + (i % 28)).padStart(2, '0')} 14:${String(i % 60).padStart(2, '0')}:00`,
}));

export default function CompanyTransferIn() {
  const [search, setSearch] = useState('');
  const [directionFilter, setDirectionFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const filtered = mockData.filter(r => {
    const kw = search.toLowerCase();
    return (
      (!kw || r.transferId.toLowerCase().includes(kw) || r.fromCompany.toLowerCase().includes(kw) || r.toCompany.toLowerCase().includes(kw)) &&
      (!directionFilter || r.direction === directionFilter) &&
      (!statusFilter || r.status === statusFilter)
    );
  });

  const columns: ColumnsType<TransferRecord> = [
    { title: '划转单号', dataIndex: 'transferId', width: 190, render: v => <Text code style={{ fontSize: 12 }}>{v}</Text> },
    {
      title: '方向', dataIndex: 'direction', width: 80,
      render: v => v === 'in'
        ? <Text style={{ color: '#52c41a' }}><ArrowDownOutlined /> 划入</Text>
        : <Text style={{ color: '#ff4d4f' }}><ArrowUpOutlined /> 划出</Text>,
    },
    { title: '转出方', dataIndex: 'fromCompany' },
    { title: '转入方', dataIndex: 'toCompany' },
    {
      title: '金额', dataIndex: 'amount', width: 160, align: 'right',
      render: (v, r) => (
        <Text strong style={{ color: r.direction === 'in' ? '#52c41a' : '#ff4d4f' }}>
          {r.direction === 'in' ? '+' : '-'}{Number(v).toLocaleString('en', { minimumFractionDigits: 2 })} {r.currency}
        </Text>
      ),
    },
    {
      title: '状态', dataIndex: 'status', width: 90,
      render: v => <Tag color={statusMap[v as keyof typeof statusMap].color}>{statusMap[v as keyof typeof statusMap].label}</Tag>,
    },
    { title: '备注', dataIndex: 'remark', width: 150, ellipsis: true },
    { title: '操作人', dataIndex: 'operator', width: 120 },
    { title: '创建时间', dataIndex: 'createdAt', width: 170 },
  ];

  return (
    <Card bordered={false}>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <SwapOutlined style={{ color: '#1677ff', fontSize: 18 }} />
        <Text style={{ fontSize: 16, fontWeight: 600 }}>内部划转（公司）</Text>
      </div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col>
          <Input prefix={<SearchOutlined />} placeholder="搜索划转单号 / 公司名称"
            value={search} onChange={e => setSearch(e.target.value)} allowClear style={{ width: 280 }} />
        </Col>
        <Col>
          <Select placeholder="划转方向" value={directionFilter} onChange={setDirectionFilter} allowClear style={{ width: 130 }}
            options={[{ label: '划入', value: 'in' }, { label: '划出', value: 'out' }]} />
        </Col>
        <Col>
          <Select placeholder="状态" value={statusFilter} onChange={setStatusFilter} allowClear style={{ width: 130 }}
            options={[{ label: '成功', value: 'success' }, { label: '处理中', value: 'pending' }, { label: '失败', value: 'failed' }]} />
        </Col>
        <Col><RangePicker style={{ width: 280 }} /></Col>
      </Row>
      <Table dataSource={filtered} columns={columns} rowKey="id" size="middle" scroll={{ x: 1300 }}
        pagination={{ total: filtered.length, pageSize: 10, showTotal: t => `总共 ${t} 条记录`, showSizeChanger: true }} />
    </Card>
  );
}
