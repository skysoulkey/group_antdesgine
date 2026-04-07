import { CopyOutlined } from '@ant-design/icons';
import { Button, Card, Descriptions, message, Space, Table, Typography } from 'antd';
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
  { title: '类型', dataIndex: 'type', width: 100 },
  { title: '货币单位', dataIndex: 'currency', width: 80 },
  { title: '金额', dataIndex: 'amount', width: 130, align: 'right', render: (v) => <span style={{ color: '#141414' }}>{v}</span> },
  { title: '操作人', dataIndex: 'operator', width: 120 },
  { title: '时间', dataIndex: 'createdAt', width: 180, render: (v) => <span style={{ whiteSpace: 'nowrap' }}>{v}</span> },
];

const CompanyWalletPage: React.FC = () => {
  return (
    <div>
      {/* ── 余额 + 公司信息（紧凑单行） ─────────────────────────────── */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW, marginBottom: 16 }}
        styles={{ body: { padding: '16px 24px' } }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          {/* 左侧：余额 */}
          <Space size={48}>
            <div>
              <Text style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>USDT 余额</Text>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#141414', marginTop: 4 }}>89,230.00</div>
            </div>
            <div>
              <Text style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>PEA 余额</Text>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#141414', marginTop: 4 }}>560,000.00</div>
            </div>
          </Space>
          {/* 右侧：公司信息 */}
          <Space size={24}>
            <div style={{ textAlign: 'right' }}>
              <Text style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>公司名称</Text>
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>炸雷第一波</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Text style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>归属集团</Text>
              <div style={{ fontSize: 14, marginTop: 4 }}>UU Talk 集团</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Text style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>公司 ID</Text>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 4 }}>
                <Text style={{ fontSize: 14, fontFamily: 'monospace', color: '#141414' }}>43215321432</Text>
                <CopyOutlined
                  style={{ cursor: 'pointer', color: 'rgba(0,0,0,0.35)', fontSize: 12 }}
                  onClick={() => { navigator.clipboard.writeText('43215321432'); message.success('已复制'); }}
                />
              </div>
            </div>
          </Space>
        </div>
      </Card>

      {/* ── 历史流水 ────────────────────────────────────────────────── */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}
        styles={{ body: { padding: '16px 24px' } }}>
        <Text strong style={{ fontSize: 15, display: 'block', marginBottom: 12 }}>历史流水</Text>
        <Table
          columns={columns}
          dataSource={flowData}
          rowKey="id"
          size="middle"
          scroll={{ x: 720 }}
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
          rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
        />
      </Card>
    </div>
  );
};

export default CompanyWalletPage;
