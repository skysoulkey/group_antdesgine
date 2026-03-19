import { GiftOutlined, SearchOutlined } from '@ant-design/icons';
import { Card, Col, Input, Row, Select, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';

const { Text } = Typography;

const CARD_SHADOW = '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)';

interface LotteryOrder {
  id: string;
  orderId: string;
  completedAt: string;
  startedAt: string;
  game: string;
  status: '未结算' | '结算中' | '已结算';
  period: string;
  enterpriseId: string;
  enterpriseName: string;
  orderAmt: string;
  payoutAmt: string;
  pnl: string;
  currency: string;
  bettorId: string;
  bettorName: string;
}

const GAMES = ['百家乐', '龙虎斗', '骰子'];
const ENTERPRISES = ['hey', 'wow', 'boom', 'flash', 'nova'];

const mockData: LotteryOrder[] = Array.from({ length: 25 }, (_, i) => ({
  id: `LO${String(i + 1).padStart(7, '0')}`,
  orderId: `ORD${900000 + i}`,
  completedAt: `2026-0${(i % 3) + 1}-${String(i + 1).padStart(2, '0')} 22:00:00`,
  startedAt: `2026-0${(i % 3) + 1}-${String(i + 1).padStart(2, '0')} 10:00:00`,
  game: GAMES[i % 3],
  status: (['未结算', '结算中', '已结算'] as const)[i % 3],
  period: `第${1000 + i}期`,
  enterpriseId: `ENT${10000 + i}`,
  enterpriseName: ENTERPRISES[i % 5],
  orderAmt: `${(500 + i * 200).toLocaleString()}.00`,
  payoutAmt: i % 3 === 0 ? `${(400 + i * 180).toLocaleString()}.00` : '0.00',
  pnl: i % 3 === 0 ? `-${(80 + i * 20)}.00` : `${(100 + i * 50)}.00`,
  currency: i % 2 === 0 ? 'USDT' : 'PEA',
  bettorId: `MB${100000 + i}`,
  bettorName: `用户${i + 1}`,
}));

const totalPnlUsdt = mockData.filter((r) => r.currency === 'USDT').reduce((s, r) => s + parseFloat(r.pnl.replace(/,/g, '')), 0);
const totalOrders = mockData.length;

const LotteryPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string | undefined>();
  const [currency, setCurrency] = useState<string | undefined>();
  const [game, setGame] = useState<string | undefined>();

  const filtered = mockData.filter((r) => {
    const kw = search.toLowerCase();
    return (
      (!kw || r.orderId.toLowerCase().includes(kw) || r.enterpriseName.toLowerCase().includes(kw)) &&
      (!status || r.status === status) &&
      (!currency || r.currency === currency) &&
      (!game || r.game === game)
    );
  });

  const columns: ColumnsType<LotteryOrder> = [
    { title: '订单编号', dataIndex: 'orderId', width: 110 },
    { title: '游戏', dataIndex: 'game', width: 80 },
    { title: '游戏期数', dataIndex: 'period', width: 90 },
    {
      title: '订单状态', dataIndex: 'status', width: 90,
      render: (v) => <Tag color={v === '已结算' ? 'success' : v === '结算中' ? 'processing' : 'warning'}>{v}</Tag>,
    },
    { title: '发起时间', dataIndex: 'startedAt', width: 170 },
    { title: '完成时间', dataIndex: 'completedAt', width: 170 },
    { title: '转单企业ID', dataIndex: 'enterpriseId', width: 110 },
    { title: '转单企业名称', dataIndex: 'enterpriseName', width: 120 },
    { title: '订单金额', dataIndex: 'orderAmt', width: 110, align: 'right' },
    { title: '赔付金额', dataIndex: 'payoutAmt', width: 110, align: 'right' },
    {
      title: '公司盈亏', dataIndex: 'pnl', width: 110, align: 'right',
      render: (v: string) => <Text style={{ color: v.startsWith('-') ? '#ff4d4f' : '#52c41a', fontWeight: 600 }}>{v}</Text>,
    },
    { title: '货币单位', dataIndex: 'currency', width: 80 },
    { title: '下注人ID', dataIndex: 'bettorId', width: 100 },
    { title: '下注人昵称', dataIndex: 'bettorName', width: 100 },
  ];

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fa8c1618', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GiftOutlined style={{ fontSize: 20, color: '#fa8c16' }} />
              </div>
              <Text style={{ fontSize: 13, color: 'rgba(0,0,0,0.55)' }}>订单总数</Text>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#141414' }}>{totalOrders}</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: (totalPnlUsdt >= 0 ? '#52c41a' : '#ff4d4f') + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GiftOutlined style={{ fontSize: 20, color: totalPnlUsdt >= 0 ? '#52c41a' : '#ff4d4f' }} />
              </div>
              <Text style={{ fontSize: 13, color: 'rgba(0,0,0,0.55)' }}>公司盈亏合计（USDT）</Text>
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: totalPnlUsdt >= 0 ? '#52c41a' : '#ff4d4f' }}>
              {totalPnlUsdt >= 0 ? '+' : ''}{totalPnlUsdt.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 筛选 + 表格 */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input prefix={<SearchOutlined />} placeholder="订单编号 / 企业名称" value={search} onChange={(e) => setSearch(e.target.value)} allowClear style={{ width: 220 }} />
          <Select placeholder="订单状态" value={status} onChange={setStatus} allowClear style={{ width: 120 }}
            options={[{ value: '未结算', label: '未结算' }, { value: '结算中', label: '结算中' }, { value: '已结算', label: '已结算' }]} />
          <Select placeholder="游戏" value={game} onChange={setGame} allowClear style={{ width: 110 }}
            options={GAMES.map((g) => ({ value: g, label: g }))} />
          <Select placeholder="货币单位" value={currency} onChange={setCurrency} allowClear style={{ width: 110 }}
            options={[{ value: 'USDT', label: 'USDT' }, { value: 'PEA', label: 'PEA' }]} />
        </Space>
        <Table columns={columns} dataSource={filtered} rowKey="id" size="middle"
          scroll={{ x: 1600 }} pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
          rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')} />
      </Card>
    </div>
  );
};

export default LotteryPage;
