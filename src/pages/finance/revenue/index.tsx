import { AccountBookOutlined, DownloadOutlined } from '@ant-design/icons';
import { Button, Card, Col, ConfigProvider, DatePicker, message, Radio, Row, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'umi';
import TableToolbar from '../../../components/TableToolbar';

const { Text } = Typography;

const CARD_SHADOW = '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)';

interface RevenueRow {
  id: string;
  billMonth: string;
  status: '未出账单' | '已出账单';
  totalRevenue: string;
  taxExempt: string;
  taxableAmount: string;
  transferable: string;
}

const mockData: RevenueRow[] = [
  { id: '1', billMonth: '2026-02', status: '已出账单', totalRevenue: '873,233.23', taxExempt: '10,000.00', taxableAmount: '43,661.66', transferable: '819,571.57' },
  { id: '2', billMonth: '2026-01', status: '已出账单', totalRevenue: '652,100.00', taxExempt: '10,000.00', taxableAmount: '32,605.00', transferable: '609,495.00' },
  { id: '3', billMonth: '2025-12', status: '已出账单', totalRevenue: '721,500.00', taxExempt: '10,000.00', taxableAmount: '36,075.00', transferable: '675,425.00' },
  { id: '4', billMonth: '2025-11', status: '已出账单', totalRevenue: '430,200.00', taxExempt: '10,000.00', taxableAmount: '21,510.00', transferable: '398,690.00' },
  { id: '5', billMonth: '2025-10', status: '未出账单', totalRevenue: '—', taxExempt: '—', taxableAmount: '—', transferable: '—' },
];

const FinanceRevenuePage: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRefresh = useCallback(() => { message.success('已刷新'); }, []);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [month, setMonth] = useState<string | undefined>();

  const filtered = mockData.filter((r) => {
    return (
      (!statusFilter || r.status === statusFilter) &&
      (!month || r.billMonth === month)
    );
  });

  const totalRevenue = mockData.filter((r) => r.status === '已出账单').reduce((s, r) => s + parseFloat(r.totalRevenue.replace(/,/g, '') || '0'), 0);
  const totalTransferable = mockData.filter((r) => r.status === '已出账单').reduce((s, r) => s + parseFloat(r.transferable.replace(/,/g, '') || '0'), 0);

  const columns: ColumnsType<RevenueRow> = [
    { title: '账单月', dataIndex: 'billMonth', width: 110 },
    {
      title: '账单状态', dataIndex: 'status', width: 110,
      render: (v) => <Tag color={v === '已出账单' ? 'success' : 'processing'}>{v}</Tag>,
    },
    { title: '本月综合收益', dataIndex: 'totalRevenue', width: 140, align: 'right', render: (v) => <span>{v}</span> },
    { title: '免征税额', dataIndex: 'taxExempt', width: 110, align: 'right' },
    { title: '应纳税额', dataIndex: 'taxableAmount', width: 110, align: 'right', render: (v) => <Text style={{ color: '#141414' }}>{v}</Text> },
    { title: '可划转收益', dataIndex: 'transferable', width: 130, align: 'right', render: (v) => <Text style={{ color: '#141414' }}>{v}</Text> },
    {
      title: '操作', width: 110, fixed: 'right' as const,
      render: (_, r) => r.status === '已出账单' ? (
        <Space size={0}>
          <Button
            type="link" size="small" style={{ padding: '0 4px' }}
            onClick={() => navigate(`/finance/revenue/detail/${r.billMonth}`)}
          >
            详细账单
          </Button>
          <Button type="link" size="small" style={{ padding: '0 4px' }} icon={<DownloadOutlined />} />
        </Space>
      ) : <Text type="secondary" style={{ fontSize: 12 }}>—</Text>,
    },
  ];

  return (
    <div ref={containerRef}>
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#1677ff18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AccountBookOutlined style={{ fontSize: 20, color: '#1677ff' }} />
              </div>
              <Text style={{ fontSize: 13, color: 'rgba(0,0,0,0.55)' }}>累计综合收益（USDT）</Text>
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#141414' }}>
              {totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#1677ff18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AccountBookOutlined style={{ fontSize: 20, color: '#1677ff' }} />
              </div>
              <Text style={{ fontSize: 13, color: 'rgba(0,0,0,0.55)' }}>累计可划转收益（USDT）</Text>
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#141414' }}>
              {totalTransferable.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 账单列表 */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
        <Space style={{ marginBottom: 16 }} wrap align="center">
          <ConfigProvider theme={{ components: { Radio: { buttonSolidCheckedBg: '#1677ff', buttonSolidCheckedHoverBg: '#4096ff', buttonSolidCheckedActiveBg: '#0958d9', buttonSolidCheckedColor: '#fff', colorPrimary: '#1677ff' } } }}>
            <Radio.Group
              buttonStyle="solid"
              value={statusFilter ?? '全部'}
              onChange={(e) => setStatusFilter(e.target.value === '全部' ? undefined : e.target.value)}
            >
              {(['全部', '未出账单', '已出账单'] as const).map((v) => (
                <Radio.Button key={v} value={v}>{v}</Radio.Button>
              ))}
            </Radio.Group>
          </ConfigProvider>
          <DatePicker picker="month" placeholder="汇算月份" onChange={(_, v) => setMonth(v as string)} style={{ width: 150 }} />
        </Space>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 14, fontWeight: 600 }}>账单列表</Text>
          <TableToolbar onRefresh={handleRefresh} containerRef={containerRef} />
        </div>
        <Table columns={columns} dataSource={filtered} rowKey="id" size="middle"
          rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }} />
      </Card>
    </div>
  );
};

export default FinanceRevenuePage;
