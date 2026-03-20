import { SearchOutlined } from '@ant-design/icons';
import { Card, Input, Select, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';
import { MOCK_ROLE } from '../../../utils/auth';

const { Text } = Typography;

interface TransferRecord {
  id: string;
  type: '集团下拨' | '集团调回';
  orderTime: string;
  orderId: string;
  companyId: string;
  companyName: string;
  currency: string;
  amount: string;
  remark: string;
  operator: string;
  afterBalance: string;
}

const companies = ['Hey Talk', 'UU Talk', 'Star Tech', 'Cyber Bot', 'Nova Corp'];

const mkData = (type: '集团下拨' | '集团调回'): TransferRecord[] =>
  Array.from({ length: 10 }, (_, i) => ({
    id: `${type === '集团下拨' ? 'AL' : 'RC'}${String(i + 1).padStart(7, '0')}`,
    type,
    orderTime: `2026-0${(i % 3) + 1}-${String(i + 1).padStart(2, '0')} ${String(10 + i).padStart(2, '0')}:${String(i * 6).padStart(2, '0')}:00`,
    orderId: `ORD${700000 + i}`,
    companyId: `C00${(i % 5) + 1}`,
    companyName: companies[i % 5],
    currency: i % 2 === 0 ? 'USDT' : 'PEA',
    amount: `${(10000 + i * 8000).toLocaleString()}.00`,
    remark: ['月度操作', '季度结算', '临时调配'][i % 3],
    operator: ['Admin', 'FinanceManager', 'SuperAdmin'][i % 3],
    afterBalance: `${(50000 + i * 5000).toLocaleString()}.00`,
  }));

const allocateData = mkData('集团下拨');
const recallData   = mkData('集团调回');

const TransferPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('recall');
  const [search, setSearch] = useState('');
  const [currency, setCurrency] = useState<string | undefined>();
  const [company, setCompany] = useState<string | undefined>();

  const isGroupAdmin = MOCK_ROLE === 'group_admin' || MOCK_ROLE === 'system_admin';
  const source = activeTab === 'recall' ? recallData : allocateData;

  const filtered = source.filter((r) => {
    const kw = search.toLowerCase();
    return (
      (!kw || r.orderId.toLowerCase().includes(kw) || r.remark.toLowerCase().includes(kw)) &&
      (!currency || r.currency === currency) &&
      (!company || r.companyName === company)
    );
  });

  const columns: ColumnsType<TransferRecord> = [
    { title: '订单时间', dataIndex: 'orderTime', width: 170 },
    {
      title: '订单类型', dataIndex: 'type', width: 100,
      render: (v) => <Tag color={v === '集团下拨' ? 'blue' : 'orange'}>{v}</Tag>,
    },
    { title: '订单编号', dataIndex: 'orderId', width: 110 },
    { title: '公司ID', dataIndex: 'companyId', width: 80 },
    { title: '公司名称', dataIndex: 'companyName', width: 110 },
    { title: '货币单位', dataIndex: 'currency', width: 80 },
    { title: '交易金额', dataIndex: 'amount', width: 120, align: 'right', render: (v) => <span>{v}</span> },
    { title: '订单备注', dataIndex: 'remark', width: 110, ellipsis: true },
    { title: '操作人', dataIndex: 'operator', width: 120 },
    { title: '交易后公司余额', dataIndex: 'afterBalance', width: 140, align: 'right' },
  ];

  const tabItems = [
    { key: 'recall',   label: '集团调回' },
    { key: 'allocate', label: '集团下拨' },
  ];

  return (
    <Card
      bordered={false}
      tabList={tabItems}
      activeTabKey={activeTab}
      onTabChange={setActiveTab}
    >
      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          prefix={<SearchOutlined />}
          placeholder="搜索订单编号 / 备注"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          style={{ width: 240 }}
        />
        {isGroupAdmin && (
          <Select
            placeholder="公司名称"
            value={company}
            onChange={setCompany}
            allowClear
            style={{ width: 150 }}
            options={companies.map((c) => ({ value: c, label: c }))}
          />
        )}
        <Select
          placeholder="货币单位"
          value={currency}
          onChange={setCurrency}
          allowClear
          style={{ width: 110 }}
          options={[{ value: 'USDT', label: 'USDT' }, { value: 'PEA', label: 'PEA' }]}
        />
      </Space>
      <div style={{ marginBottom: 12 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>共 {filtered.length} 条记录</Text>
      </div>
      <Table
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        size="middle"
        scroll={{ x: 1200 }}
        pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
        rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
      />
    </Card>
  );
};

export default TransferPage;
