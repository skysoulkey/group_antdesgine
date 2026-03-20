import {
  AccountBookOutlined,
  ApartmentOutlined,
  BankOutlined,
  ExportOutlined,
  FundOutlined,
  GiftOutlined,
  ImportOutlined,
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
  Divider,
  Row,
  Segmented,
  Space,
  Table,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';
import { useNavigate } from 'umi';

const { Text } = Typography;

// ── 设计 token ────────────────────────────────────────────────────
const CARD_SHADOW = '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)';
const CARD_RADIUS = 12;

// ── 折线图数据 ────────────────────────────────────────────────────
const months = ['2025-11', '2025-12', '2026-01', '2026-02', '2026-03', '2026-04', '2026-05'];
const mk = (vals: number[]) => vals.map((v, i) => ({ date: months[i], value: v }));

const charts = {
  asset:      mk([28, 32, 35, 52, 38, 22, 18]),
  profit:     mk([20, 28, 35, 50, 40, 25, 18]),
  enterprise: mk([18, 25, 32, 48, 42, 28, 22]),
  cert:       mk([15, 22, 30, 45, 40, 25, 28]),
  member:     mk([20, 28, 35, 52, 38, 20, -5]),
  particip:   mk([10, 18, 28, 45, 35, 20, -10]),
};

const chartCfg = (data: { date: string; value: number }[]) => ({
  data,
  xField: 'date',
  yField: 'value',
  shape: 'smooth',
  point: { style: { fill: '#722ed1', stroke: '#722ed1' } },
  height: 220,
  autoFit: true,
  style: { stroke: '#722ed1' },
  scale: { color: { range: ['#722ed1'] } },
});

// ── KPI 卡片 ─────────────────────────────────────────────────────
interface Sub { label: string; value: string | number }
interface KpiCardProps {
  title: string;
  value: string | number;
  color: string;
  icon: React.ReactNode;
  sub?: Sub[];
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, color, icon, sub }) => (
  <Card
    bordered={false}
    style={{ borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW, height: '100%' }}
    styles={{ body: { padding: '20px 24px' } }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Text style={{ fontSize: 14, color: 'rgba(0,0,0,0.55)', fontWeight: 500 }}>{title}</Text>
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
      <Text style={{ fontSize: 14, color: 'rgba(0,0,0,0.55)', fontWeight: 500 }}>集团资金调回</Text>
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
}

const ChartCard: React.FC<ChartCardProps> = ({ title, value, data }) => (
  <Card
    bordered={false}
    style={{ borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW }}
    styles={{ body: { padding: '20px 24px 12px' } }}
  >
    <div style={{ marginBottom: 4 }}>
      <Text style={{ fontSize: 14, color: 'rgba(0,0,0,0.55)', fontWeight: 500 }}>{title}</Text>
    </div>
    <div style={{ marginBottom: 16 }}>
      <span style={{ fontSize: 26, fontWeight: 700, color: '#141414', letterSpacing: -0.5 }}>{value}</span>
    </div>
    <Line {...chartCfg(data)} />
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
        <Segmented
          options={['USDT', 'PEA']}
          value={currency}
          onChange={(v) => setCurrency(v as string)}
          style={{ fontWeight: 600 }}
        />
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
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            title={`持股估值（${currency}）`}
            value="2,020.00"
            color="#722ed1"
            icon={<StockOutlined />}
            sub={[{ label: '持股企业', value: '2,000 家' }]}
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
          />
        </Col>
      </Row>

      {/* ── 折线图区（6张） ── */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <ChartCard title="公司总资产" value="223,300.00" data={charts.asset} />
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard title="公司盈亏" value="202,320.00" data={charts.profit} />
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard title="企业总资产" value="234,560.00" data={charts.enterprise} />
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard title="认证企业" value="22 家" data={charts.cert} />
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard title="成员总数" value="200 人" data={charts.member} />
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard title="参与成员" value="200 人" data={charts.particip} />
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
