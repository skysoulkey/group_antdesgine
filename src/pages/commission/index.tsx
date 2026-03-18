import { SearchOutlined } from '@ant-design/icons';
import { Card, Col, DatePicker, Input, Row, Select, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';

const { Text } = Typography;
const { RangePicker } = DatePicker;

interface CommissionOrder {
  id: number;
  orderId: string;
  enterprise: string;
  company: string;
  type: string;
  amount: string;
  currency: string;
  status: 'settled' | 'pending' | 'cancelled';
  createdAt: string;
}

const mockData: CommissionOrder[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  orderId: `CMM${String(20251120001 + i).padStart(12, '0')}`,
  enterprise: ['hey', 'UUtalk', 'CyberBot', 'StarTech', 'GoldLink'][i % 5],
  company: ['UU Talk', 'Hey Talk', '炸雷第一波'][i % 3],
  type: ['游戏收益', '股份收益', '参股收益'][i % 3],
  amount: (1234.56 + i * 892.3).toFixed(2),
  currency: ['USDT', 'PEA'][i % 2],
  status: (['settled', 'settled', 'pending', 'settled', 'cancelled'] as const)[i % 5],
  createdAt: `2025-11-${String(1 + (i % 28)).padStart(2, '0')} 10:${String(i % 60).padStart(2, '0')}:00`,
}));

const statusMap = {
  settled: { label: '已结算', color: 'success' },
  pending: { label: '待结算', color: 'processing' },
  cancelled: { label: '已取消', color: 'default' },
} as const;

const CommissionPage: React.FC = () => {
  const [searchVal, setSearchVal] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const filtered = mockData.filter((d) => {
    const matchSearch =
      !searchVal || d.enterprise.includes(searchVal) || d.orderId.includes(searchVal);
    const matchStatus = !statusFilter || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns: ColumnsType<CommissionOrder> = [
    { title: '订单编号', dataIndex: 'orderId', width: 180 },
    { title: '企业名称', dataIndex: 'enterprise' },
    { title: '归属公司', dataIndex: 'company' },
    { title: '佣金类型', dataIndex: 'type', width: 110 },
    {
      title: '佣金金额',
      dataIndex: 'amount',
      align: 'right',
      render: (v, r) => (
        <Text strong style={{ color: '#1677ff' }}>
          {Number(v).toLocaleString('en', { minimumFractionDigits: 2 })} {r.currency}
        </Text>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v: CommissionOrder['status']) => (
        <Tag color={statusMap[v].color}>{statusMap[v].label}</Tag>
      ),
    },
    { title: '创建时间', dataIndex: 'createdAt', width: 170 },
  ];

  return (
    <Card bordered={false} style={{ borderRadius: 8 }}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col>
          <Input
            prefix={<SearchOutlined />}
            placeholder="请输入企业名称或订单编号"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            allowClear
            style={{ width: 280 }}
          />
        </Col>
        <Col>
          <Select
            placeholder="订单状态"
            value={statusFilter || undefined}
            onChange={setStatusFilter}
            allowClear
            style={{ width: 130 }}
            options={[
              { label: '已结算', value: 'settled' },
              { label: '待结算', value: 'pending' },
              { label: '已取消', value: 'cancelled' },
            ]}
          />
        </Col>
        <Col>
          <RangePicker style={{ width: 280 }} />
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        pagination={{
          total: filtered.length,
          pageSize: 10,
          showTotal: (total) => `总共 ${total} 条记录`,
        }}
        size="middle"
      />
    </Card>
  );
};

export default CommissionPage;
