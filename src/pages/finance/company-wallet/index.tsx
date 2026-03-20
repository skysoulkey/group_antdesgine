import { CopyOutlined, WalletOutlined } from '@ant-design/icons';
import { Card, Col, Descriptions, message, Row, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React from 'react';

const { Text } = Typography;

const CARD_SHADOW = '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)';

interface FlowRecord {
  id: string;
  type: '集团下拨' | '集团调回';
  currency: string;
  amount: string;
  operator: string;
  createdAt: string;
}

const flowData: FlowRecord[] = Array.from({ length: 12 }, (_, i) => ({
  id: `FL${String(i + 1).padStart(7, '0')}`,
  type: i % 3 === 2 ? '集团调回' : '集团下拨',
  currency: i % 2 === 0 ? 'USDT' : 'PEA',
  amount: `${(5000 + i * 3800).toLocaleString()}.00`,
  operator: ['Admin', 'FinanceManager', 'SuperAdmin'][i % 3],
  createdAt: `2026-0${(i % 3) + 1}-${String(i + 1).padStart(2, '0')} ${String(9 + i % 8).padStart(2, '0')}:00:00`,
}));

const columns: ColumnsType<FlowRecord> = [
  { title: '流水号', dataIndex: 'id', width: 110 },
  {
    title: '类型', dataIndex: 'type', width: 100,
    render: (v) => <Tag color={v === '集团下拨' ? 'blue' : 'orange'}>{v}</Tag>,
  },
  { title: '货币单位', dataIndex: 'currency', width: 80 },
  { title: '金额', dataIndex: 'amount', width: 130, align: 'right', render: (v) => <span style={{ fontWeight: 600, color: '#141414' }}>{v}</span> },
  { title: '操作人', dataIndex: 'operator', width: 120 },
  { title: '时间', dataIndex: 'createdAt', width: 170 },
];

const CompanyWalletPage: React.FC = () => {
  return (
    <div>
      {/* 余额卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#722ed118', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <WalletOutlined style={{ fontSize: 22, color: '#722ed1' }} />
              </div>
              <Text style={{ fontSize: 14, color: 'rgba(0,0,0,0.55)', fontWeight: 500 }}>USDT 余额</Text>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#141414', letterSpacing: -1 }}>89,230.00</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#722ed118', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <WalletOutlined style={{ fontSize: 22, color: '#722ed1' }} />
              </div>
              <Text style={{ fontSize: 14, color: 'rgba(0,0,0,0.55)', fontWeight: 500 }}>PEA 余额</Text>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#141414', letterSpacing: -1 }}>560,000.00</div>
          </Card>
        </Col>
      </Row>

      {/* 公司基础信息 */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW, marginBottom: 16 }} title="公司基础信息">
        <Descriptions bordered column={{ xs: 1, sm: 2 }} size="middle">
          <Descriptions.Item label="公司名称">炸雷第一波</Descriptions.Item>
          <Descriptions.Item label="公司ID">
            <Space>
              <Text>43215321432</Text>
              <CopyOutlined
                style={{ cursor: 'pointer', color: '#722ed1' }}
                onClick={() => { navigator.clipboard.writeText('43215321432'); message.success('已复制'); }}
              />
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="归属集团">UU Talk 集团</Descriptions.Item>
          <Descriptions.Item label="通知账号">@Miya_miya</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 历史流水 */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }} title="历史流水">
        <Table
          columns={columns}
          dataSource={flowData}
          rowKey="id"
          size="middle"
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
          rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
        />
      </Card>
    </div>
  );
};

export default CompanyWalletPage;
