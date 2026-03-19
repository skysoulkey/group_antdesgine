import { MoneyCollectOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Col, Input, Row, Select, Space, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';

const { Text } = Typography;

const CARD_SHADOW = '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)';

interface CommissionOrder {
  id: string;
  createdAt: string;
  orderId: string;
  appName: string;
  enterpriseId: string;
  enterpriseName: string;
  currency: string;
  commission: string;
  bettorId: string;
  bettorName: string;
}

const APPS = ['UU Talk', 'Hey Talk', 'Star Game'];
const ENTERPRISES = ['hey', 'wow', 'boom', 'flash', 'nova'];

const mockData: CommissionOrder[] = Array.from({ length: 20 }, (_, i) => ({
  id: `CO${String(i + 1).padStart(7, '0')}`,
  createdAt: `2026-0${(i % 3) + 1}-${String(i + 1).padStart(2, '0')} ${String(10 + i % 10).padStart(2, '0')}:00:00`,
  orderId: `ORD${800000 + i}`,
  appName: APPS[i % 3],
  enterpriseId: `ENT${10000 + i}`,
  enterpriseName: ENTERPRISES[i % 5],
  currency: i % 2 === 0 ? 'USDT' : 'PEA',
  commission: `${(200 + i * 80).toLocaleString()}.00`,
  bettorId: `MB${100000 + i}`,
  bettorName: `用户${i + 1}`,
}));

const totalUsdt = mockData.filter((r) => r.currency === 'USDT').reduce((s, r) => s + parseFloat(r.commission.replace(/,/g, '')), 0);
const totalPea  = mockData.filter((r) => r.currency === 'PEA').reduce((s, r) => s + parseFloat(r.commission.replace(/,/g, '')), 0);

const CommissionPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [currency, setCurrency] = useState<string | undefined>();
  const [enterprise, setEnterprise] = useState<string | undefined>();
  const [app, setApp] = useState<string | undefined>();

  const filtered = mockData.filter((r) => {
    const kw = search.toLowerCase();
    return (
      (!kw || r.orderId.toLowerCase().includes(kw) || r.enterpriseName.toLowerCase().includes(kw)) &&
      (!currency || r.currency === currency) &&
      (!enterprise || r.enterpriseName === enterprise) &&
      (!app || r.appName === app)
    );
  });

  const columns: ColumnsType<CommissionOrder> = [
    { title: '订单时间', dataIndex: 'createdAt', width: 170 },
    { title: '订单编号', dataIndex: 'orderId', width: 110 },
    { title: '应用名称', dataIndex: 'appName', width: 100 },
    { title: '企业ID', dataIndex: 'enterpriseId', width: 100 },
    { title: '企业名称', dataIndex: 'enterpriseName', width: 100 },
    { title: '货币单位', dataIndex: 'currency', width: 80 },
    { title: '公司佣金支出', dataIndex: 'commission', width: 130, align: 'right', render: (v) => <span style={{ fontWeight: 600, color: '#141414' }}>{v}</span> },
    { title: '下注人ID', dataIndex: 'bettorId', width: 100 },
    { title: '下注人昵称', dataIndex: 'bettorName', width: 100 },
    { title: '操作', width: 80, fixed: 'right' as const, render: () => <Button type="link" size="small" style={{ padding: 0 }}>详情</Button> },
  ];

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eb2f9618', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MoneyCollectOutlined style={{ fontSize: 20, color: '#eb2f96' }} />
              </div>
              <Text style={{ fontSize: 13, color: 'rgba(0,0,0,0.55)' }}>佣金支出合计（USDT）</Text>
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#141414' }}>
              {totalUsdt.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#722ed118', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MoneyCollectOutlined style={{ fontSize: 20, color: '#722ed1' }} />
              </div>
              <Text style={{ fontSize: 13, color: 'rgba(0,0,0,0.55)' }}>佣金支出合计（PEA）</Text>
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#141414' }}>
              {totalPea.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 筛选 + 表格 */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input prefix={<SearchOutlined />} placeholder="订单编号 / 企业名称" value={search} onChange={(e) => setSearch(e.target.value)} allowClear style={{ width: 220 }} />
          <Select placeholder="货币单位" value={currency} onChange={setCurrency} allowClear style={{ width: 110 }}
            options={[{ value: 'USDT', label: 'USDT' }, { value: 'PEA', label: 'PEA' }]} />
          <Select placeholder="企业名称" value={enterprise} onChange={setEnterprise} allowClear style={{ width: 130 }}
            options={ENTERPRISES.map((e) => ({ value: e, label: e }))} />
          <Select placeholder="应用名称" value={app} onChange={setApp} allowClear style={{ width: 130 }}
            options={APPS.map((a) => ({ value: a, label: a }))} />
        </Space>
        <Table columns={columns} dataSource={filtered} rowKey="id" size="middle"
          scroll={{ x: 1200 }} pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
          rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')} />
      </Card>
    </div>
  );
};

export default CommissionPage;
