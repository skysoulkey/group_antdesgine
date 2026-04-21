import { Bar, Column, Pie } from '@ant-design/plots';
import {
  CaretDownOutlined,
  CaretRightOutlined,
  CloseCircleFilled,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  ConfigProvider,
  DatePicker,
  Divider,
  Drawer,
  message,
  Radio,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  Input,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useCallback, useRef, useState } from 'react';
import TableToolbar from '../../../components/TableToolbar';

const { Text } = Typography;
const { RangePicker } = DatePicker;

const CARD_SHADOW = '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)';

const radioTheme = {
  components: {
    Radio: {
      buttonSolidCheckedBg: '#1677ff',
      buttonSolidCheckedHoverBg: '#4096ff',
      buttonSolidCheckedActiveBg: '#0958d9',
      buttonSolidCheckedColor: '#fff',
      colorPrimary: '#1677ff',
    },
  },
};

interface LotteryOrder {
  id: string;
  orderId: string;
  completedAt: string;
  startedAt: string;
  game: string;
  gamePeriod: string;
  status: '未结算' | '结算中' | '已结算';
  enterpriseId: string;
  enterpriseName: string;
  orderAmt: string;
  payoutAmt: string;
  pnl: string;
  currency: 'USDT' | 'PEA';
  bettorId: string;
  bettorName: string;
  source: '自动' | '手动';
}

const GAMES = ['百家乐', '龙虎斗', '骰子'];
const ENTERPRISES = ['滴滴答答', 'wow企业', 'boom公司', 'flash科技', 'nova集团'];

const mockData: LotteryOrder[] = Array.from({ length: 25 }, (_, i) => ({
  id: `LO${String(i + 1).padStart(7, '0')}`,
  orderId: String(73720 + i),
  completedAt: `2025-10-10 12:23:23`,
  startedAt: `2025-10-10 12:23:23`,
  game: GAMES[i % 3],
  gamePeriod: `20251201${String(440 + i)}期`,
  status: (['未结算', '结算中', '已结算'] as const)[i % 3],
  enterpriseId: String(287402 + i),
  enterpriseName: ENTERPRISES[i % 5],
  orderAmt: i % 2 === 0 ? '873,233.23' : '73,233.23',
  payoutAmt: i % 3 === 0 ? '73,233.23' : '0.00',
  pnl: i % 3 === 0 ? '-73,233.23' : '873,233.23',
  currency: (['USDT', 'PEA'] as const)[i % 2],
  bettorId: String(287402 + i),
  bettorName: `滴滴答答`,
  source: (['自动', '手动'] as const)[i % 2],
}));

// ── 图表数据（使用真实企业名称，以便图表点击联动筛选）──────────────
const top5FlowData = [
  { company: ENTERPRISES[4], value: 20 },
  { company: ENTERPRISES[3], value: 28 },
  { company: ENTERPRISES[2], value: 35 },
  { company: ENTERPRISES[1], value: 48 },
  { company: ENTERPRISES[0], value: 56 },
];

const sourceDistData = [
  { type: '自动', value: 300 },
  { type: '手动', value: 384 },
];

const pnlRankData = ENTERPRISES.map((e, i) => ({
  enterprise: e,
  value: 10 + i * 12 + (i % 2 === 1 ? 5 : 0),
}));

// ── 统计汇总 ──────────────────────────────────────────────────────
const totalEnterprises = new Set(mockData.map((r) => r.enterpriseId)).size;
const totalAmtUsdt = mockData.filter((r) => r.currency === 'USDT').reduce((s, r) => s + parseFloat(r.orderAmt.replace(/,/g, '')), 0);
const totalPnlUsdt = mockData.filter((r) => r.currency === 'USDT').reduce((s, r) => s + parseFloat(r.pnl.replace(/,/g, '')), 0);
const totalAmtPea  = mockData.filter((r) => r.currency === 'PEA').reduce((s, r) => s + parseFloat(r.orderAmt.replace(/,/g, '')), 0);
const totalPnlPea  = mockData.filter((r) => r.currency === 'PEA').reduce((s, r) => s + parseFloat(r.pnl.replace(/,/g, '')), 0);

const fmt = (n: number) => n.toLocaleString('en', { minimumFractionDigits: 2 });

// ── 订单详情 drawer ───────────────────────────────────────────────
interface DetailRecord { id: string; time: string; orderId: string; betAmt: string; bettorId: string; bettorName: string }
const detailMock: DetailRecord[] = Array.from({ length: 5 }, (_, i) => ({
  id: String(i),
  time: '2017-10-01 12:00',
  orderId: String(223242 + i),
  betAmt: i % 2 === 0 ? '873,233.23' : '73,233.23',
  bettorId: '287402',
  bettorName: '滴滴答答',
}));

const LotteryPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRefresh = useCallback(() => { message.success('已刷新'); }, []);
  const [statusFilter, setStatusFilter] = useState<string>('全部');
  const [sourceFilter, setSourceFilter] = useState<string>('全部');
  const [currencyFilter, setCurrencyFilter] = useState<string>('全部');
  const [game, setGame] = useState<string | undefined>();
  const [enterprise, setEnterprise] = useState<string | undefined>();
  const [search, setSearch] = useState('');
  const [statExpanded, setStatExpanded] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<LotteryOrder | null>(null);

  const filtered = mockData.filter((r) => {
    const kw = search.toLowerCase();
    return (
      (statusFilter === '全部' || r.status === statusFilter) &&
      (sourceFilter === '全部' || r.source === sourceFilter) &&
      (currencyFilter === '全部' || r.currency === currencyFilter) &&
      (!game || r.game === game) &&
      (!enterprise || r.enterpriseName === enterprise) &&
      (!kw || r.orderId.includes(kw) || r.bettorName.toLowerCase().includes(kw) || r.bettorId.includes(kw))
    );
  });

  // 图表点击联动 — 企业
  const handleEnterpriseClick = (name: string) => {
    setEnterprise((prev) => (prev === name ? undefined : name));
  };
  // 图表点击联动 — 来源
  const handleSourceClick = (type: string) => {
    setSourceFilter((prev) => (prev === type ? '全部' : type));
  };

  const columns: ColumnsType<LotteryOrder> = [
    { title: '发起时间', dataIndex: 'startedAt', width: 160 },
    { title: '完成时间', dataIndex: 'completedAt', width: 160 },
    { title: '订单编号', dataIndex: 'orderId', width: 90 },
    { title: '游戏', dataIndex: 'game', width: 80 },
    { title: '游戏期数', dataIndex: 'gamePeriod', width: 140 },
    { title: '转单企业ID', dataIndex: 'enterpriseId', width: 110 },
    { title: '转单企业名称', dataIndex: 'enterpriseName', width: 120 },
    {
      title: '转单来源', dataIndex: 'source', width: 90,
    },
    { title: '订单金额', dataIndex: 'orderAmt', width: 110, align: 'right' },
    { title: '赔付金额', dataIndex: 'payoutAmt', width: 110, align: 'right' },
    {
      title: '公司盈亏', dataIndex: 'pnl', width: 110, align: 'right',
      render: (v: string) => <Text style={{ color: v.startsWith('-') ? '#ff4d4f' : '#52c41a' }}>{v}</Text>,
    },
    { title: '货币单位', dataIndex: 'currency', width: 80 },
    { title: '下注人ID', dataIndex: 'bettorId', width: 100 },
    { title: '下注人昵称', dataIndex: 'bettorName', width: 100 },
    {
      title: '订单状态', dataIndex: 'status', width: 90,
      render: (v) => <Tag color={v === '已结算' ? 'success' : v === '结算中' ? 'processing' : 'warning'}>{v}</Tag>,
    },
    {
      title: '操作', width: 70, fixed: 'right' as const,
      render: (_, r) => (
        <Button type="link" size="small" style={{ padding: 0 }} onClick={() => { setSelectedOrder(r); setDetailOpen(true); }}>
          详情
        </Button>
      ),
    },
  ];

  const detailCols: ColumnsType<DetailRecord> = [
    { title: '订单生成时间', dataIndex: 'time', width: 150 },
    { title: '订单编号', dataIndex: 'orderId', width: 90 },
    { title: '下注金额', dataIndex: 'betAmt', width: 110, align: 'right' },
    { title: '下注人ID', dataIndex: 'bettorId', width: 90 },
    { title: '下注人昵称', dataIndex: 'bettorName', width: 100 },
  ];

  return (
    <div ref={containerRef}>
      {/* ── 筛选区 ── */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW, marginBottom: 12 }}>
        <Space size={24} wrap align="center" style={{ marginBottom: 14 }}>
          <ConfigProvider theme={radioTheme}>
            <Radio.Group value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} buttonStyle="solid">
              <Radio.Button value="全部">全部</Radio.Button>
              <Radio.Button value="未结算">未结算</Radio.Button>
              <Radio.Button value="结算中">结算中</Radio.Button>
              <Radio.Button value="已结算">已结算</Radio.Button>
            </Radio.Group>
          </ConfigProvider>
          <ConfigProvider theme={radioTheme}>
            <Radio.Group
              buttonStyle="solid"
              value={game ?? '全部'}
              onChange={(e) => setGame(e.target.value === '全部' ? undefined : e.target.value)}
            >
              <Radio.Button value="全部">全部</Radio.Button>
              {GAMES.map((v) => <Radio.Button key={v} value={v}>{v}</Radio.Button>)}
            </Radio.Group>
          </ConfigProvider>
          <RangePicker showTime style={{ width: 340 }} />
        </Space>

        <Space size={24} wrap align="center">
          <ConfigProvider theme={radioTheme}>
            <Radio.Group value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} buttonStyle="solid">
              <Radio.Button value="全部">全部</Radio.Button>
              <Radio.Button value="自动">自动</Radio.Button>
              <Radio.Button value="手动">手动</Radio.Button>
            </Radio.Group>
          </ConfigProvider>
          <ConfigProvider theme={radioTheme}>
            <Radio.Group value={currencyFilter} onChange={(e) => setCurrencyFilter(e.target.value)} buttonStyle="solid">
              <Radio.Button value="全部">全部</Radio.Button>
              <Radio.Button value="USDT">USDT</Radio.Button>
              <Radio.Button value="PEA">PEA</Radio.Button>
            </Radio.Group>
          </ConfigProvider>
          <Select
            placeholder="转单企业"
            value={enterprise}
            onChange={setEnterprise}
            allowClear
            style={{ width: 220 }}
            options={ENTERPRISES.map((e) => ({ value: e, label: e }))}
          />
          <Input
            suffix={<SearchOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
            placeholder="下注人昵称、下注人ID、订单ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            style={{ width: 280 }}
          />
        </Space>
      </Card>

      {/* ── 汇总统计栏 ── */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW, marginBottom: 12 }}>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}
          onClick={() => setStatExpanded(!statExpanded)}
        >
          {statExpanded ? <CaretDownOutlined style={{ color: '#8c8c8c' }} /> : <CaretRightOutlined style={{ color: '#8c8c8c' }} />}
          <Text type="secondary" style={{ fontSize: 13 }}>转单企业：<Text style={{ color: '#141414' }}>{totalEnterprises}</Text></Text>
          <Divider type="vertical" />
          <Text type="secondary" style={{ fontSize: 13 }}>订单金额（USDT）：<Text style={{ color: '#141414' }}>{fmt(totalAmtUsdt)}</Text></Text>
          <Divider type="vertical" />
          <Text type="secondary" style={{ fontSize: 13 }}>公司盈亏（USDT）：<Text style={{ color: totalPnlUsdt >= 0 ? '#52c41a' : '#ff4d4f' }}>{fmt(totalPnlUsdt)}</Text></Text>
          <Divider type="vertical" />
          <Text type="secondary" style={{ fontSize: 13 }}>订单金额（PEA）：<Text style={{ color: '#141414' }}>{fmt(totalAmtPea)}</Text></Text>
          <Divider type="vertical" />
          <Text type="secondary" style={{ fontSize: 13 }}>公司盈亏（PEA）：<Text style={{ color: totalPnlPea >= 0 ? '#52c41a' : '#ff4d4f' }}>{fmt(totalPnlPea)}</Text></Text>
        </div>
      </Card>

      {/* ── 图表区 ── */}
      {statExpanded && (
        <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
          {/* 公司流水TOP5 */}
          <Col xs={24} lg={8}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Text style={{ fontSize: 13, fontWeight: 600 }}>公司流水TOP5</Text>
                {enterprise && (
                  <Tag
                    color="blue"
                    closable
                    closeIcon={<CloseCircleFilled />}
                    onClose={() => setEnterprise(undefined)}
                    style={{ cursor: 'pointer' }}
                  >
                    {enterprise}
                  </Tag>
                )}
              </div>
              <Bar
                data={top5FlowData}
                xField="company"
                yField="value"
                colorField="company"
                height={220}
                style={{ marginTop: 8, cursor: 'pointer' }}
                scale={{ color: { range: ['#1677ff', '#36cfc9', '#597ef7', '#faad14', '#52c41a'] }, y: { domainMin: 0 }, x: { paddingInner: 0.4 } }}
                axis={{ y: false, x: { labelFontSize: 11 } }}
                legend={false}
                tooltip={{
                  title: false,
                  items: [(d: any) => ({ name: d.company, value: `${d.value}USDT` })],
                }}
                onReady={(chart: any) => {
                  chart.on('interval:click', (e: any) => {
                    const d = e.data?.data;
                    if (d?.company) handleEnterpriseClick(d.company);
                  });
                }}
              />
            </Card>
          </Col>

          {/* 转单来源分布 */}
          <Col xs={24} lg={8}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Text style={{ fontSize: 13, fontWeight: 600 }}>转单来源分布</Text>
                {sourceFilter !== '全部' && (
                  <Tag
                    color="blue"
                    closable
                    closeIcon={<CloseCircleFilled />}
                    onClose={() => setSourceFilter('全部')}
                    style={{ cursor: 'pointer' }}
                  >
                    {sourceFilter}
                  </Tag>
                )}
              </div>
              <Pie
                data={sourceDistData}
                angleField="value"
                colorField="type"
                innerRadius={0.55}
                height={220}
                style={{ marginTop: 8, cursor: 'pointer' }}
                scale={{ color: { range: ['#1677ff', '#36cfc9', '#597ef7', '#faad14', '#52c41a'] } }}
                legend={{ position: 'bottom' }}
                label={false}
                tooltip={{ items: [{ channel: 'y', name: '订单数', valueFormatter: (v: number) => `${v}单` }] }}
                onReady={(chart: any) => {
                  chart.on('interval:click', (e: any) => {
                    const d = e.data?.data;
                    if (d?.type) handleSourceClick(d.type);
                  });
                }}
              />
            </Card>
          </Col>

          {/* 公司盈亏排序 */}
          <Col xs={24} lg={8}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Text style={{ fontSize: 13, fontWeight: 600 }}>公司盈亏排序TOP5</Text>
                {enterprise && (
                  <Tag
                    color="blue"
                    closable
                    closeIcon={<CloseCircleFilled />}
                    onClose={() => setEnterprise(undefined)}
                    style={{ cursor: 'pointer' }}
                  >
                    {enterprise}
                  </Tag>
                )}
              </div>
              <Column
                data={pnlRankData}
                xField="enterprise"
                yField="value"
                colorField="enterprise"
                height={220}
                style={{ marginTop: 8, cursor: 'pointer' }}
                scale={{ color: { range: ['#1677ff', '#36cfc9', '#597ef7', '#faad14', '#52c41a'] }, y: { domainMin: 0 }, x: { paddingInner: 0.4 } }}
                axis={{ y: false, x: { labelFontSize: 11 } }}
                legend={false}
                tooltip={{
                  title: false,
                  items: [(d: any) => ({ name: d.enterprise, value: `${d.value.toLocaleString()}.00 USDT` })],
                }}
                onReady={(chart: any) => {
                  chart.on('interval:click', (e: any) => {
                    const d = e.data?.data;
                    if (d?.enterprise) handleEnterpriseClick(d.enterprise);
                  });
                }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* ── 订单列表 ── */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Space size={8}>
            <Text style={{ fontSize: 14, fontWeight: 600 }}>订单列表</Text>
            {enterprise && (
              <Tag
                color="blue"
                closable
                closeIcon={<CloseCircleFilled />}
                onClose={() => setEnterprise(undefined)}
              >
                企业：{enterprise}
              </Tag>
            )}
            {sourceFilter !== '全部' && (
              <Tag
                color="blue"
                closable
                closeIcon={<CloseCircleFilled />}
                onClose={() => setSourceFilter('全部')}
              >
                来源：{sourceFilter}
              </Tag>
            )}
          </Space>
          <TableToolbar onRefresh={handleRefresh} containerRef={containerRef} />
        </div>
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          size="middle"
          scroll={{ x: 1800 }}
          pagination={{ pageSize: 10, showTotal: (t) => `总共 ${t} 个项目`, showSizeChanger: true }}
          rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
        />
      </Card>

      {/* ── 详情 Drawer ── */}
      <Drawer
        title="详情"
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        width={640}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setDetailOpen(false)}>关闭</Button>
          </div>
        }
      >
        {selectedOrder && (
          <>
            <div style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: 600 }}>订单详情</Text>
              <div style={{ marginTop: 10, fontSize: 13, lineHeight: 2 }}>
                <div>转单企业：{selectedOrder.enterpriseName}</div>
                <div>货币单位：{selectedOrder.currency}</div>
                <div>转单来源：{selectedOrder.source}</div>
                <div>订单金额：{selectedOrder.orderAmt}</div>
                <div>公司盈亏：<Text style={{ color: selectedOrder.pnl.startsWith('-') ? '#ff4d4f' : '#52c41a' }}>{selectedOrder.pnl}</Text></div>
              </div>
            </div>
            <Divider />
            <Text style={{ fontSize: 14, fontWeight: 600 }}>来源订单详情</Text>
            <Table
              style={{ marginTop: 12 }}
              columns={detailCols}
              dataSource={detailMock}
              rowKey="id"
              size="small"
              pagination={{ pageSize: 5, showTotal: (t) => `总共 ${t} 个项目`, showSizeChanger: true }}
            />
          </>
        )}
      </Drawer>
    </div>
  );
};

export default LotteryPage;
