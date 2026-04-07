import { Bar, Column } from '@ant-design/plots';
import {
  CloseCircleFilled,
  FullscreenOutlined,
  ReloadOutlined,
  SearchOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  ConfigProvider,
  Divider,
  Drawer,
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
import React, { useState } from 'react';

const { Text } = Typography;

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

// ── 数据模型 ──────────────────────────────────────────────────────
interface CommissionOrder {
  id: string;
  createdAt: string;
  orderId: string;
  appName: string;
  game: string;
  bettorId: string;
  bettorName: string;
  enterpriseId: string;
  enterpriseName: string;
  currency: 'USDT' | 'PEA';
  commission: string;
}

const APPS = ['UU Talk', 'Hey Talk', 'Star Game'];
const GAMES = ['百家乐', '龙虎斗', '骰子'];
const ENTERPRISES = ['hey企业', 'wow公司', 'boom集团', 'flash科技', 'nova星球'];

const mockData: CommissionOrder[] = Array.from({ length: 20 }, (_, i) => ({
  id: `CO${String(i + 1).padStart(7, '0')}`,
  createdAt: `2025-10-10 12:23:23`,
  orderId: String(73720 + i),
  appName: APPS[i % 3],
  game: GAMES[i % 3],
  bettorId: String(287402 + i),
  bettorName: `滴滴答答`,
  enterpriseId: String(287402 + i),
  enterpriseName: ENTERPRISES[i % 5],
  currency: (['USDT', 'PEA'] as const)[i % 2],
  commission: i % 2 === 0 ? '873,233.23' : '73,233.23',
}));

// ── 图表数据（使用真实企业名称，以便图表点击联动筛选）──────────────
const top5CommissionData = [
  { enterprise: ENTERPRISES[4], value: 18 },
  { enterprise: ENTERPRISES[3], value: 26 },
  { enterprise: ENTERPRISES[2], value: 34 },
  { enterprise: ENTERPRISES[1], value: 45 },
  { enterprise: ENTERPRISES[0], value: 58 },
];

const orderCountData = ENTERPRISES.map((e, i) => ({
  enterprise: e,
  value: 18 + i * 9 + (i % 2 === 0 ? 4 : 0),
}));

// ── 统计 ──────────────────────────────────────────────────────────
const totalUsdt = mockData.filter((r) => r.currency === 'USDT').reduce((s, r) => s + parseFloat(r.commission.replace(/,/g, '')), 0);
const totalPea  = mockData.filter((r) => r.currency === 'PEA').reduce((s, r) => s + parseFloat(r.commission.replace(/,/g, '')), 0);

// ── 来源订单 mock ─────────────────────────────────────────────────
interface SourceOrder { id: string; time: string; orderId: string; betAmt: string; bettorId: string; bettorName: string }
const sourceMock: SourceOrder[] = Array.from({ length: 5 }, (_, i) => ({
  id: String(i),
  time: '2017-10-01 12:00',
  orderId: String(223242 + i),
  betAmt: i % 2 === 0 ? '873,233.23' : '73,233.23',
  bettorId: '287402',
  bettorName: '滴滴答答',
}));

// ── 佣金订单页面 ──────────────────────────────────────────────────
const CommissionOrderTab: React.FC = () => {
  const [currencyFilter, setCurrencyFilter] = useState<string>('全部');
  const [app, setApp] = useState<string | undefined>();
  const [game, setGame] = useState<string | undefined>();
  const [enterprise, setEnterprise] = useState<string | undefined>();
  const [search, setSearch] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<CommissionOrder | null>(null);

  const filtered = mockData.filter((r) => {
    const kw = search.toLowerCase();
    return (
      (currencyFilter === '全部' || r.currency === currencyFilter) &&
      (!app || r.appName === app) &&
      (!game || r.game === game) &&
      (!enterprise || r.enterpriseName === enterprise) &&
      (!kw || r.orderId.includes(kw))
    );
  });

  const handleEnterpriseClick = (name: string) => {
    setEnterprise((prev) => (prev === name ? undefined : name));
  };

  const columns: ColumnsType<CommissionOrder> = [
    { title: '订单时间', dataIndex: 'createdAt', width: 160 },
    { title: '订单编号', dataIndex: 'orderId', width: 90 },
    { title: '应用名称', dataIndex: 'appName', width: 100 },
    { title: '游戏', dataIndex: 'game', width: 80 },
    { title: '下注人ID', dataIndex: 'bettorId', width: 100 },
    { title: '下注人昵称', dataIndex: 'bettorName', width: 100 },
    { title: '企业ID', dataIndex: 'enterpriseId', width: 100 },
    { title: '企业名称', dataIndex: 'enterpriseName', width: 100 },
    { title: '货币单位', dataIndex: 'currency', width: 80 },
    {
      title: '公司佣金支出',
      dataIndex: 'commission',
      width: 130,
      align: 'right',
      sorter: (a, b) => parseFloat(a.commission.replace(/,/g, '')) - parseFloat(b.commission.replace(/,/g, '')),
      render: (v) => <Text style={{ color: '#141414' }}>{v}</Text>,
    },
    {
      title: '操作', width: 70, fixed: 'right' as const,
      render: (_, r) => (
        <Button type="link" size="small" style={{ padding: 0 }} onClick={() => { setSelected(r); setDetailOpen(true); }}>
          详情
        </Button>
      ),
    },
  ];

  const sourceCols: ColumnsType<SourceOrder> = [
    { title: '订单生成时间', dataIndex: 'time', width: 150 },
    { title: '订单编号', dataIndex: 'orderId', width: 90 },
    { title: '下注金额', dataIndex: 'betAmt', width: 110, align: 'right' },
    { title: '下注人ID', dataIndex: 'bettorId', width: 90 },
    { title: '下注人昵称', dataIndex: 'bettorName', width: 100 },
  ];

  return (
    <div>
      {/* 筛选区 */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW, marginBottom: 12 }}>
        <Space size={24} wrap align="center" style={{ marginBottom: 14 }}>
          <ConfigProvider theme={radioTheme}>
            <Radio.Group
              buttonStyle="solid"
              value={app ?? '全部'}
              onChange={(e) => setApp(e.target.value === '全部' ? undefined : e.target.value)}
            >
              <Radio.Button value="全部">全部</Radio.Button>
              {APPS.map((v) => <Radio.Button key={v} value={v}>{v}</Radio.Button>)}
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
            placeholder="企业名称"
            value={enterprise}
            onChange={setEnterprise}
            allowClear
            style={{ width: 160 }}
            options={ENTERPRISES.map((e) => ({ value: e, label: e }))}
          />
        </Space>
        <Space size={24} wrap align="center">
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
          <Input
            suffix={<SearchOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
            placeholder="订单编号"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            style={{ width: 200 }}
          />
        </Space>
      </Card>

      {/* 汇总统计栏 */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            佣金支出（USDT）：<Text style={{ color: '#141414' }}>{totalUsdt.toLocaleString('en', { minimumFractionDigits: 2 })}</Text>
          </Text>
          <Divider type="vertical" />
          <Text type="secondary" style={{ fontSize: 13 }}>
            佣金支出（PEA）：<Text style={{ color: '#141414' }}>{totalPea.toLocaleString('en', { minimumFractionDigits: 2 })}</Text>
          </Text>
        </div>
      </Card>

      {/* 图表区 */}
      <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
        {/* 企业佣金支出 */}
        <Col xs={24} lg={12}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Text style={{ fontSize: 13, fontWeight: 600 }}>企业佣金支出</Text>
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
            <Text type="secondary" style={{ fontSize: 11 }}>点击柱条快速筛选表格</Text>
            <Bar
              data={top5CommissionData}
              xField="value"
              yField="enterprise"
              colorField="enterprise"
              height={220}
              style={{ marginTop: 8, cursor: 'pointer' }}
              scale={{ color: { range: ['#1677ff', '#36cfc9', '#597ef7', '#faad14', '#52c41a'] }, x: { paddingInner: 0.4 } }}
              axis={{ x: { labelFontSize: 11 }, y: { labelFontSize: 11 } }}
              tooltip={{
                items: [(d: any) => ({ name: `${d.enterprise}佣金`, value: d.value })],
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

        {/* 佣金订单数量 */}
        <Col xs={24} lg={12}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Text style={{ fontSize: 13, fontWeight: 600 }}>佣金订单数量</Text>
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
            <Text type="secondary" style={{ fontSize: 11 }}>点击柱条快速筛选表格</Text>
            <Column
              data={orderCountData}
              xField="enterprise"
              yField="value"
              colorField="enterprise"
              height={220}
              style={{ marginTop: 8, cursor: 'pointer' }}
              scale={{ color: { range: ['#1677ff', '#36cfc9', '#597ef7', '#faad14', '#52c41a'] }, x: { paddingInner: 0.4 } }}
              axis={{ x: { labelFontSize: 10 }, y: { labelFontSize: 11 } }}
              tooltip={{ items: [{ channel: 'y', name: '订单数', valueFormatter: (v: number) => `${v}单` }] }}
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

      {/* 订单表格 */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Space size={8}>
            <Text style={{ fontSize: 14, fontWeight: 600 }}>佣金订单</Text>
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
          </Space>
          <Space size={8}>
            <ReloadOutlined style={{ cursor: 'pointer', color: '#8c8c8c' }} />
            <SettingOutlined style={{ cursor: 'pointer', color: '#8c8c8c' }} />
            <FullscreenOutlined style={{ cursor: 'pointer', color: '#8c8c8c' }} />
          </Space>
        </div>
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          size="middle"
          scroll={{ x: 1400 }}
          pagination={{ pageSize: 10, showTotal: (t) => `总共 ${t} 个项目`, showSizeChanger: true }}
          rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
        />
      </Card>

      {/* 详情 Drawer */}
      <Drawer
        title="详情"
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        width={660}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button type="primary" onClick={() => setDetailOpen(false)}>关闭</Button>
          </div>
        }
      >
        {selected && (
          <>
            <div style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: 600 }}>订单详情</Text>
              <div style={{ marginTop: 10, fontSize: 13, lineHeight: 2 }}>
                <div>佣金结算公司：{selected.appName}</div>
                <div>货币单位：{selected.currency}</div>
              </div>
            </div>
            <Divider />
            <Text style={{ fontSize: 14, fontWeight: 600 }}>来源订单详情</Text>
            <Table
              style={{ marginTop: 12 }}
              columns={sourceCols}
              dataSource={sourceMock}
              rowKey="id"
              size="small"
              pagination={{ pageSize: 5, showTotal: (t) => `总共 ${t} 个项目`, showSizeChanger: true, pageSizeOptions: ['5', '10'] }}
            />
          </>
        )}
      </Drawer>
    </div>
  );
};

export default CommissionOrderTab;
