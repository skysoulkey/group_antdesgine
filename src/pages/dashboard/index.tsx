import {
  AccountBookOutlined,
  AppstoreOutlined,
  ApartmentOutlined,
  BankOutlined,
  ClusterOutlined,
  ExportOutlined,
  FundOutlined,
  GiftOutlined,
  ImportOutlined,
  InfoCircleOutlined,
  PieChartOutlined,
  ReloadOutlined,
  ShopOutlined,
  StockOutlined,
  TeamOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { Line } from '@ant-design/plots';
import {
  Button,
  Card,
  Col,
  ConfigProvider,
  Divider,
  Row,
  Segmented,
  Space,
  Table,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';
import { useNavigate } from 'umi';

const { Text } = Typography;

const CARD_SHADOW = '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)';
const CARD_RADIUS = 12;

// ── 折线图数据 ──────────────────────────────────────────
// ── 折线图数据（最近60天，按日展示）────────────────────────────────
const BASE_DATE = new Date('2026-03-24');
const days60 = Array.from({ length: 60 }, (_, i) => {
  const d = new Date(BASE_DATE);
  d.setDate(d.getDate() - 59 + i);
  return d.toISOString().slice(0, 10);
});
const mkDay = (base: number, amp: number, trend: number, phase: number) =>
  days60.map((date, i) => ({
    date,
    value: Math.round(base + amp * Math.sin((i / 60) * Math.PI * 6 + phase) + trend * (i / 60)),
  }));

const groupBalanceData   = mkDay(5000, 800,  500,  0);
const companyAssetData   = mkDay(3000, 500,  300,  1);
const enterpriseTotal    = mkDay(8000, 1200, 800,  2);
const holdingValData     = mkDay(4000, 700,  400,  0.5);
const enterprisePnl      = mkDay(1500, 400,  200,  1.5);
const enterpriseFlow     = mkDay(2000, 500,  300,  2.5);
const enterpriseCount    = mkDay(50,   15,   5,    0.8);
const enterpriseMember   = mkDay(500,  80,   40,   1.2);

const chartCfg = (data: { date: string; value: number }[], name: string) => ({
  data,
  xField: 'date',
  yField: 'value',
  shape: 'smooth',
  point: false,
  height: 200,
  autoFit: true,
  style: { stroke: '#722ed1' },
  scale: {
    color: { range: ['#722ed1'] },
  },
  axis: {
    x: {
      labelFontSize: 10,
      labelAutoRotate: false,
      labelFormatter: (v: string) => v.slice(5),          // 显示 MM-DD
      tickFilter: (_: string, index: number) => index % 2 === 0, // 只保留偶数刻度，减半
    },
  },
  tooltip: { items: [{ channel: 'y' as const, name }] },
});

// ── KPI 卡片 ─────────────────────────────────────────────────────
interface Sub { label: string; value: string | number }
interface KpiCardProps {
  title: string;
  value: string | number;
  color: string;
  icon: React.ReactNode;
  sub?: Sub[];
  tooltip?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, color, icon, sub, tooltip }) => (
  <Card
    bordered={false}
    style={{ borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW, height: '100%' }}
    styles={{ body: { padding: '20px 24px' } }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Text style={{ fontSize: 14, color: 'rgba(0,0,0,0.55)', fontWeight: 500 }}>{title}</Text>
        {tooltip && (
          <Tooltip title={tooltip}>
            <InfoCircleOutlined style={{ fontSize: 12, color: 'rgba(0,0,0,0.35)', cursor: 'help' }} />
          </Tooltip>
        )}
      </div>
      <div style={{
        width: 44, height: 44, borderRadius: 10,
        background: `${color}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <span style={{ fontSize: 20, color }}>{icon}</span>
      </div>
    </div>

    <div style={{ marginTop: 8, marginBottom: sub ? 12 : 0 }}>
      <span style={{ fontSize: 28, fontWeight: 700, color: '#141414', letterSpacing: -1 }}>
        {value}
      </span>
    </div>

    {sub && (
      <>
        <Divider style={{ margin: '10px 0' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: 4 }}>
          {sub.map((s, i) => (
            <div key={s.label} style={{ textAlign: i % 2 === 0 ? 'left' : 'right' }}>
              <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#262626' }}>{s.value}</div>
            </div>
          ))}
        </div>
      </>
    )}
  </Card>
);

// ── 双值卡片（集团资金下拨 + 调回）────────────────────────────────
const DualCard: React.FC = () => (
  <Card
    bordered={false}
    style={{ borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW, height: '100%' }}
    styles={{ body: { padding: '20px 24px' } }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Text style={{ fontSize: 14, color: 'rgba(0,0,0,0.55)', fontWeight: 500 }}>集团资金下拨</Text>
        <Tooltip title="集团转账给公司账户金额之和">
          <InfoCircleOutlined style={{ fontSize: 12, color: 'rgba(0,0,0,0.35)', cursor: 'help' }} />
        </Tooltip>
      </div>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: '#faad1418', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ExportOutlined style={{ color: '#faad14', fontSize: 16 }} />
      </div>
    </div>
    <div style={{ fontSize: 24, fontWeight: 700, color: '#52c41a', marginBottom: 16 }}>202,320.00</div>
    <Divider style={{ margin: '0 0 12px' }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Text style={{ fontSize: 14, color: 'rgba(0,0,0,0.55)', fontWeight: 500 }}>集团资金调回</Text>
        <Tooltip title="集团从公司账户转回金额之和">
          <InfoCircleOutlined style={{ fontSize: 12, color: 'rgba(0,0,0,0.35)', cursor: 'help' }} />
        </Tooltip>
      </div>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: '#ff4d4f18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ImportOutlined style={{ color: '#ff4d4f', fontSize: 16 }} />
      </div>
    </div>
    <div style={{ fontSize: 24, fontWeight: 700, color: '#ff4d4f' }}>202,320.00</div>
  </Card>
);

// ── 折线图卡片（带总计值）────────────────────────────────────────
interface ChartCardProps {
  title: string;
  value: string;
  data: { date: string; value: number }[];
  tooltip?: string;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, value, data, tooltip }) => (
  <Card
    bordered={false}
    style={{ borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW }}
    styles={{ body: { padding: '20px 24px 12px' } }}
  >
    <div style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
      <Text style={{ fontSize: 14, color: 'rgba(0,0,0,0.55)', fontWeight: 500 }}>{title}</Text>
      {tooltip && (
        <Tooltip title={tooltip}>
          <InfoCircleOutlined style={{ fontSize: 12, color: 'rgba(0,0,0,0.35)', cursor: 'help' }} />
        </Tooltip>
      )}
    </div>
    <div style={{ marginBottom: 16 }}>
      <span style={{ fontSize: 26, fontWeight: 700, color: '#141414', letterSpacing: -0.5 }}>{value}</span>
    </div>
    <Line {...chartCfg(data, title)} />
  </Card>
);

// ── TOP5 表格 ───────────────────────────────────────────
interface TopRow {
  ranking: string;
  rankNum: number;
  companyId: string;
  companyName: string;
  cumulativeProfit: string;
  certEnterprises: number;
  members: number;
  masterId: string;
  masterNickname: string;
  createdAt: string;
}

const topData: TopRow[] = [
  { ranking: '第1名', rankNum: 1, companyId: '283982', companyName: 'Hey Talk',  cumulativeProfit: '873,233.23', certEnterprises: 543, members: 543, masterId: '73720', masterNickname: 'name1', createdAt: '2025-10-10 12:23:23' },
  { ranking: '第2名', rankNum: 2, companyId: '283983', companyName: 'UU Talk',   cumulativeProfit: '73,233.23',  certEnterprises: 23,  members: 23,  masterId: '73721', masterNickname: 'name2', createdAt: '2025-10-10 12:23:23' },
  { ranking: '第3名', rankNum: 3, companyId: '283984', companyName: 'Star Tech',  cumulativeProfit: '873,233.23', certEnterprises: 11,  members: 11,  masterId: '73722', masterNickname: 'name3', createdAt: '2025-10-10 12:23:23' },
  { ranking: '第4名', rankNum: 4, companyId: '283985', companyName: 'Cyber Bot',  cumulativeProfit: '873,233.23', certEnterprises: 0,   members: 0,   masterId: '73723', masterNickname: 'name4', createdAt: '2025-10-10 12:23:23' },
  { ranking: '第5名', rankNum: 5, companyId: '283986', companyName: 'Nova Corp',  cumulativeProfit: '873,233.23', certEnterprises: 32,  members: 32,  masterId: '73724', masterNickname: 'name5', createdAt: '2025-10-10 12:23:23' },
];

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [currency, setCurrency] = useState('USDT');

  const topColumns: ColumnsType<TopRow> = [
    {
      title: '总贡献排名', dataIndex: 'rankNum', width: 100,
      render: (v: number, r: TopRow) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 6,
            background: v <= 3 ? '#faad1420' : '#f5f5f5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: v <= 3 ? '#faad14' : 'rgba(0,0,0,0.65)',
          }}>
            {v <= 3 ? <TrophyOutlined /> : v}
          </div>
          <span style={{ fontWeight: 500, color: 'rgba(0,0,0,0.65)' }}>{r.ranking}</span>
        </div>
      ),
    },
    { title: '公司ID', dataIndex: 'companyId', width: 90 },
    { title: '公司名称', dataIndex: 'companyName', width: 110 },
    { title: '公司累计盈利', dataIndex: 'cumulativeProfit', width: 140, sorter: true, render: (v) => <span style={{ color: '#141414' }}>{v}</span> },
    { title: '认证企业', dataIndex: 'certEnterprises', width: 90, sorter: true, align: 'right' },
    { title: '企业成员', dataIndex: 'members', width: 90, sorter: true, align: 'right' },
    { title: '公司主ID', dataIndex: 'masterId', width: 90 },
    { title: '公司主昵称', dataIndex: 'masterNickname', width: 100 },
    { title: '创建时间', dataIndex: 'createdAt', width: 170 },
    {
      title: '操作', width: 90, fixed: 'right' as const,
      render: (_: unknown, r: TopRow) => (
        <Button type="link" size="small" style={{ padding: 0 }}
          onClick={() => navigate(`/company/detail/${r.companyId}`)}>
          公司详情
        </Button>
      ),
    },
  ];

  return (
    <div>
      {/* 顶部工具栏 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <ConfigProvider theme={{ components: { Segmented: {
          trackBg: '#f9f0ff',
          itemSelectedBg: '#722ed1',
          itemSelectedColor: '#ffffff',
          itemColor: '#722ed1',
        } } }}>
          <Segmented
            options={['USDT', 'PEA']}
            value={currency}
            onChange={(v) => setCurrency(v as string)}
            style={{ fontWeight: 600 }}
          />
        </ConfigProvider>
        <Space size={6}>
          <Text type="secondary" style={{ fontSize: 12 }}>数据更新时间：2025-11-02 12:33:02</Text>
          <ReloadOutlined style={{ color: '#722ed1', cursor: 'pointer', fontSize: 13 }} />
        </Space>
        <div style={{ flex: 1 }} />
        <Space size={4}>
          <Text type="secondary" style={{ fontSize: 12 }}>集团名称：</Text>
          <Text style={{ fontSize: 12, fontWeight: 600 }}>XX集团</Text>
          <Text type="secondary" style={{ fontSize: 12, marginLeft: 12 }}>集团ID：</Text>
          <Text style={{ fontSize: 12, fontFamily: 'monospace', color: '#722ed1' }}>24897872938</Text>
        </Space>
      </div>

      {/* ── 第一行 KPI 卡片 ── */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            title={`集团余额（${currency}）`}
            value="223,300.00"
            color="#722ed1"
            icon={<BankOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            title={`下辖公司资产（${currency}）`}
            value="2,020.00"
            color="#722ed1"
            icon={<ApartmentOutlined />}
            sub={[
              { label: '昨日新增', value: '233,322.00' },
              { label: '今日新增', value: '233,322.00' },
            ]}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            title={`下辖企业资产（${currency}）`}
            value="2,020.00"
            color="#13c2c2"
            icon={<AppstoreOutlined />}
            sub={[
              { label: '昨日新增', value: '233,322.00' },
              { label: '今日新增', value: '233,322.00' },
            ]}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            title={`下辖持股估值（${currency}）`}
            value="2,020.00"
            color="#52c41a"
            icon={<StockOutlined />}
            sub={[{ label: '持股企业', value: '2,000 家' }]}
            tooltip="下辖公司持有企业股份估值之和"
          />
        </Col>
      </Row>

      {/* ── 第二行 KPI 卡片 ── */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            title={`东方彩票盈亏（${currency}）`}
            value="223,300.00"
            color="#fa8c16"
            icon={<GiftOutlined />}
            sub={[
              { label: '昨日盈亏', value: '233,322' },
              { label: '今日盈亏', value: '233,322' },
            ]}
            tooltip="下辖公司东方彩票盈亏之和"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            title={`股份收益（${currency}）`}
            value="202,320.00"
            color="#eb2f96"
            icon={<FundOutlined />}
            sub={[
              { label: '收益', value: '233,322.00' },
              { label: '支出', value: '233,322.00' },
            ]}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            title={`税费收益（${currency}）`}
            value="202,320.00"
            color="#52c41a"
            icon={<AccountBookOutlined />}
            sub={[
              { label: '昨日收益', value: '233,322.00' },
              { label: '今日收益', value: '233,322.00' },
            ]}
            tooltip="下辖公司收到的股份交易税费及分红税之和"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <DualCard />
        </Col>
      </Row>

      {/* ── 第三行 KPI 卡片 ── */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            title="下辖公司（家）"
            value="22"
            color="#722ed1"
            icon={<ShopOutlined />}
            sub={[
              { label: '昨日新增', value: '233,322' },
              { label: '今日新增', value: '233,322' },
            ]}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            title="参股公司（家）"
            value="22"
            color="#722ed1"
            icon={<PieChartOutlined />}
            sub={[
              { label: '昨日参股', value: '+233,322' },
              { label: '今日参股', value: '-233,322' },
            ]}
            tooltip="本集团下参股公司数"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            title="下辖企业（家）"
            value="22"
            color="#13c2c2"
            icon={<ClusterOutlined />}
            sub={[
              { label: '昨日新增', value: '233,322' },
              { label: '今日新增', value: '233' },
            ]}
            tooltip="本集团下完成认证的企业总数"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            title="下辖成员（个）"
            value="223,234"
            color="#52c41a"
            icon={<TeamOutlined />}
            sub={[
              { label: '昨日新增', value: '233,322' },
              { label: '今日新增', value: '233' },
            ]}
            tooltip="本集团下所有企业成员数"
          />
        </Col>
      </Row>

      {/* ── 折线图区（8张） ── */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <ChartCard title="集团余额" value="223,300.00" data={groupBalanceData}
            tooltip="展示最近31天集团钱包余额变化趋势" />
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard title="下辖公司资产" value="2,020,000.00" data={companyAssetData}
            tooltip="展示最近31天集团下所有公司总资产合计的变化趋势" />
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard title="下辖企业总资产" value="1,560,000.00" data={enterpriseTotal}
            tooltip="展示最近31天集团下所有企业总资产合计的变化趋势" />
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard title="下辖持股估值" value="234,560.00" data={holdingValData}
            tooltip="展示最近31天下辖公司持有企业股份估值之和的变化趋势" />
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard title="下辖企业盈亏" value="18,320.00" data={enterprisePnl}
            tooltip="展示最近31天集团下所有企业盈亏总和的变化趋势" />
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard title="下辖企业流水" value="3,280,000.00" data={enterpriseFlow}
            tooltip="展示最近31天集团下所有企业游戏流水合计的变化趋势" />
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard title="下辖企业" value="22 家" data={enterpriseCount}
            tooltip="展示最近31天本集团下完成认证的企业数量变化趋势" />
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard title="下辖企业成员" value="223,234 人" data={enterpriseMember}
            tooltip="展示最近31天本集团下所有企业成员总数的变化趋势" />
        </Col>
      </Row>

      {/* ── TOP5 收益贡献排行榜 ── */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card
            bordered={false}
            style={{ borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW }}
            title={
              <Space>
                <TrophyOutlined style={{ color: '#faad14', fontSize: 18 }} />
                <span style={{ fontWeight: 700, fontSize: 16 }}>收益贡献排行榜 TOP 5</span>
              </Space>
            }
          >
            <Table
              columns={topColumns}
              dataSource={topData}
              rowKey="rankNum"
              pagination={false}
              size="middle"
              scroll={{ x: 1100 }}
              rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
