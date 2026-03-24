import {
  AccountBookOutlined,
  ApartmentOutlined,
  BankOutlined,
  ExportOutlined,
  FundOutlined,
  GiftOutlined,
  ImportOutlined,
  InfoCircleOutlined,
  MinusCircleOutlined,
  MoneyCollectOutlined,
  ReloadOutlined,
  StockOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons';
import { Line } from '@ant-design/plots';
import {
  Badge,
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

// ── 设计 token ────────────────────────────────────────────────────
const CARD_SHADOW = '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)';
const CARD_RADIUS = 12;

// ── 折线图数据（最近60天，按日展示）────────────────────────────────
const BASE_DATE = new Date('2026-03-24');
const days60 = Array.from({ length: 60 }, (_, i) => {
  const d = new Date(BASE_DATE);
  d.setDate(d.getDate() - 59 + i);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
});

/** 用正弦波 + 线性趋势生成确定性日级数据，避免随机抖动 */
const mkDay = (base: number, amp: number, trend: number, phase: number) =>
  days60.map((date, i) => ({
    date,
    value: Math.round(base + amp * Math.sin((i / 60) * Math.PI * 6 + phase) + trend * (i / 60)),
  }));

const charts = {
  // Tooltip 注释：展示最近60天公司总资产（企业余额+应用余额之和）变化趋势
  asset:      mkDay(2000, 400, 300, 0),
  // Tooltip 注释：展示最近60天公司综合盈亏变化趋势
  profit:     mkDay(1500, 350, 200, 1),
  // Tooltip 注释：展示最近60天本公司下所有企业总资产合计的变化趋势
  enterprise: mkDay(3000, 500, 400, 2),
  // Tooltip 注释：本公司下认证企业数量变化趋势（日度快照）
  cert:       mkDay(20, 5, 2, 0.5),
  // Tooltip 注释：展示最近60天本公司注册成员总数变化趋势
  member:     mkDay(180, 30, 20, 1.5),
  // Tooltip 注释：本日参与东方彩票游戏的成员之和
  particip:   mkDay(80, 40, 10, 2.5),
};

const chartCfg = (data: { date: string; value: number }[], name: string) => ({
  data,
  xField: 'date',
  yField: 'value',
  shape: 'smooth',
  point: false,
  height: 220,
  autoFit: true,
  style: { stroke: '#722ed1' },
  scale: {
    color: { range: ['#722ed1'] },
  },
  axis: {
    x: {
      labelFontSize: 10,
      labelAutoRotate: false,
      labelFormatter: (v: string) => v.slice(5),
      tickFilter: (_: string, index: number) => index % 2 === 0,
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
          {sub.map((s) => (
            <div key={s.label}>
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
      <Text style={{ fontSize: 14, color: 'rgba(0,0,0,0.55)', fontWeight: 500 }}>集团资金下拨</Text>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: '#faad1418', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ExportOutlined style={{ color: '#faad14', fontSize: 16 }} />
      </div>
    </div>
    <div style={{ fontSize: 24, fontWeight: 700, color: '#52c41a', marginBottom: 16 }}>202,320.00</div>
    <Divider style={{ margin: '0 0 12px' }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Text style={{ fontSize: 14, color: 'rgba(0,0,0,0.55)', fontWeight: 500 }}>集团资金调回</Text>
        <Tooltip title="集团从公司账户转出金额之和">
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

// ── 图表卡片 ─────────────────────────────────────────────────────
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

// ── TOP5 表格 ────────────────────────────────────────────────────
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

// ── 主组件 ────────────────────────────────────────────────────────
const CompanyDashboard: React.FC = () => {
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
    {
      title: '公司累计盈利', dataIndex: 'cumulativeProfit', width: 140, sorter: true,
      render: (v) => <span style={{ color: '#141414' }}>{v}</span>,
    },
    { title: '认证企业', dataIndex: 'certEnterprises', width: 90, sorter: true, align: 'right' },
    { title: '企业成员', dataIndex: 'members', width: 90, sorter: true, align: 'right' },
    { title: '公司主ID', dataIndex: 'masterId', width: 90 },
    { title: '公司主昵称', dataIndex: 'masterNickname', width: 110 },
    { title: '创建时间', dataIndex: 'createdAt', width: 170 },
    {
      title: '操作', width: 90, fixed: 'right' as const,
      render: (_: unknown, r: TopRow) => (
        <Button
          type="link" size="small" style={{ padding: 0 }}
          onClick={() => navigate(`/company/detail/${r.companyId}`)}
        >
          公司详情
        </Button>
      ),
    },
  ];

  return (
    <div style={{ background: 'transparent' }}>

      {/* ── 顶部工具栏 ── */}
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
          <ReloadOutlined style={{ color: '#722ed1', cursor: 'pointer', fontSize: 14 }} />
        </Space>
        <div style={{ flex: 1 }} />
        <Space size={4}>
          <Text type="secondary" style={{ fontSize: 12 }}>公司名称：</Text>
          <Text style={{ fontSize: 12, fontWeight: 600 }}>UU Talk</Text>
          <Text type="secondary" style={{ fontSize: 12, marginLeft: 12 }}>公司ID：</Text>
          <Text style={{ fontSize: 12, fontFamily: 'monospace', color: '#722ed1' }}>24897872938</Text>
        </Space>
      </div>

      {/* ── 第一行：资产类 KPI ── */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            title={`公司总资产（${currency}）`}
            value="223,300.00"
            color="#722ed1"
            icon={<BankOutlined />}
            sub={[
              { label: '昨日新增', value: '233,322.00' },
              { label: '今日新增', value: '233,322.00' },
            ]}
            tooltip="企业余额及应用余额之和"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            title={`持股估值（${currency}）`}
            value="2,020.00"
            color="#722ed1"
            icon={<StockOutlined />}
            sub={[{ label: '持股企业', value: '2,000 家' }]}
            tooltip="公司当前持有企业资产之和"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            title={`股份盈亏（${currency}）`}
            value="202,320.00"
            color="#13c2c2"
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
            tooltip="股份交易税费及分红税之和"
          />
        </Col>
      </Row>

      {/* ── 第二行：运营类 KPI ── */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            title={`东方彩票盈亏（${currency}）`}
            value="200.00"
            color="#fa8c16"
            icon={<GiftOutlined />}
            sub={[
              { label: '昨日盈亏', value: '233,322.00' },
              { label: '今日盈亏', value: '233,322.00' },
            ]}
            tooltip="东方彩票订单-订单赔付"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            title={`佣金收益（${currency}）`}
            value="200.00"
            color="#eb2f96"
            icon={<MoneyCollectOutlined />}
            sub={[
              { label: '昨日收益', value: '233,322.00' },
              { label: '今日收益', value: '233,322.00' },
            ]}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            title={`佣金支出（${currency}）`}
            value="200.00"
            color="#ff4d4f"
            icon={<MinusCircleOutlined />}
            sub={[
              { label: '昨日支出', value: '233,322.00' },
              { label: '今日支出', value: '233,322.00' },
            ]}
            tooltip="本公司支出佣金之和"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <DualCard />
        </Col>
      </Row>

      {/* ── 第三行：成员类 KPI ── */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            title="认证企业（家）"
            value="22 家"
            color="#722ed1"
            icon={<ApartmentOutlined />}
            sub={[
              { label: '昨日新增', value: '233,322' },
              { label: '今日新增', value: '233,322' },
            ]}
            tooltip="本公司下完成认证的企业总数"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            title="成员总数（个）"
            value="200"
            color="#52c41a"
            icon={<TeamOutlined />}
            sub={[
              { label: '昨日新增', value: '233,322' },
              { label: '今日新增', value: '233' },
            ]}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            title="参与成员（个）"
            value="200"
            color="#fa8c16"
            icon={<UsergroupAddOutlined />}
            sub={[{ label: '昨日参与', value: '33' }]}
            tooltip="参与投注或红包游戏的成员"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            title="活跃成员（个）"
            value="200"
            color="#722ed1"
            icon={<ThunderboltOutlined />}
            sub={[
              { label: '昨日活跃', value: '233' },
              { label: '七日留存', value: '233' },
            ]}
            tooltip="本日存在登录记录"
          />
        </Col>
      </Row>

      {/* ── 折线图区（6张） ── */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <ChartCard title="公司总资产" value="223,300.00" data={charts.asset} tooltip="展示最近60天公司总资产（企业余额及应用余额之和）变化趋势" />
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard title="公司盈亏" value="202,320.00" data={charts.profit} tooltip="展示最近60天公司综合盈亏变化趋势" />
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard title="企业总资产" value="234,560.00" data={charts.enterprise} tooltip="展示最近60天本公司下所有企业总资产合计的变化趋势" />
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard title="认证企业" value="22 家" data={charts.cert} tooltip="本公司下认证企业数量" />
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard title="成员总数" value="200 人" data={charts.member} tooltip="展示最近60天本公司注册成员总数的变化趋势" />
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard title="参与成员" value="200 人" data={charts.particip} tooltip="本日参与东方彩票游戏的成员之和" />
        </Col>
      </Row>

      {/* ── TOP5 收益贡献排行榜 ── */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card
            bordered={false}
            style={{ borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW }}
            styles={{ body: { padding: '0 0 8px' } }}
            title={
              <div style={{ padding: '4px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
                <TrophyOutlined style={{ color: '#faad14', fontSize: 18 }} />
                <span style={{ fontWeight: 700, fontSize: 16 }}>
                  收益贡献排行榜 TOP 5
                </span>
                <Badge
                  count={`${currency}`}
                  style={{ backgroundColor: '#722ed1', fontWeight: 600, fontSize: 11 }}
                />
              </div>
            }
          >
            <Table
              columns={topColumns}
              dataSource={topData}
              rowKey="ranking"
              pagination={false}
              size="middle"
              scroll={{ x: 1100 }}
              rowClassName={(_, index) => index % 2 === 0 ? '' : 'table-row-light'}
            />
          </Card>
        </Col>
      </Row>

    </div>
  );
};

export default CompanyDashboard;
