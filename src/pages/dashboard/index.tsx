import {
  InfoCircleOutlined,
  ReloadOutlined,
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
// ── 折线图数据（最近30天，按日展示）────────────────────────────────
const BASE_DATE = new Date('2026-03-24');
const days30 = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(BASE_DATE);
  d.setDate(d.getDate() - 29 + i);
  return d.toISOString().slice(0, 10);
});
const mkDay = (base: number, amp: number, trend: number, phase: number) =>
  days30.map((date, i) => ({
    date,
    value: Math.round(base + amp * Math.sin((i / 30) * Math.PI * 3 + phase) + trend * (i / 30)),
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
  shapeField: 'smooth',
  height: 200,
  autoFit: true,
  style: { stroke: '#1677ff', lineWidth: 2 },
  point: { shape: 'circle', size: 4, style: { fill: '#fff', stroke: '#1677ff', lineWidth: 2 } },
  axis: {
    x: {
      labelFontSize: 10,
      labelAutoRotate: false,
      labelFormatter: (v: string) => v.slice(5),
      tickFilter: (_: string, index: number) => index % 2 === 0,
      grid: null,
      line: null,
    },
    y: {
      grid: true,
      gridLineDash: [4, 4],
      gridStroke: 'rgba(0,0,0,0.1)',
      line: null,
      tick: null,
    },
  },
  interaction: { tooltip: { marker: { shape: 'circle' } } },
  tooltip: { items: [{ channel: 'y' as const, name }] },
});

// ── KPI 卡片 ─────────────────────────────────────────────────────
interface Sub { label: string; value: string | number }
interface KpiCardProps {
  title: string;
  value: string | number;
  sub?: Sub[];
  tooltip?: string;
  link?: { text: string; onClick: () => void };
  color?: string;
  icon?: React.ReactNode;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, sub, tooltip, link }) => (
  <Card
    bordered={false}
    style={{ borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW, height: '100%' }}
    styles={{ body: { padding: '20px 24px' } }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Text style={{ fontSize: 14, color: 'rgba(0,0,0,0.45)' }}>{title}</Text>
        {tooltip && (
          <Tooltip title={tooltip}>
            <InfoCircleOutlined style={{ fontSize: 12, color: 'rgba(0,0,0,0.3)', cursor: 'help' }} />
          </Tooltip>
        )}
      </div>
      {link && (
        <a onClick={link.onClick} style={{ fontSize: 13, color: '#1677ff', cursor: 'pointer', whiteSpace: 'nowrap' }}>
          {link.text} &gt;
        </a>
      )}
    </div>

    <div style={{ marginTop: 12, marginBottom: sub ? 0 : 0 }}>
      <span style={{ fontSize: 30, fontWeight: 700, color: '#141414', letterSpacing: -0.5 }}>
        {value}
      </span>
    </div>

    {sub && (
      <>
        <Divider style={{ margin: '16px 0 12px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {sub.map((s) => (
            <Text key={s.label} style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>
              {s.label} <span style={{ color: 'rgba(0,0,0,0.65)' }}>{s.value}</span>
            </Text>
          ))}
        </div>
      </>
    )}
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
      render: (_: number, r: TopRow) => (
        <span style={{ fontWeight: 500, color: 'rgba(0,0,0,0.65)' }}>{r.ranking}</span>
      ),
    },
    { title: '公司ID', dataIndex: 'companyId', width: 90 },
    { title: '公司名称', dataIndex: 'companyName', width: 110 },
    { title: '公司累计盈利', dataIndex: 'cumulativeProfit', width: 140, sorter: true, defaultSortOrder: 'descend', render: (v) => <span style={{ color: '#141414' }}>{v}</span> },
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
          trackBg: '#e6f4ff',
          itemSelectedBg: '#1677ff',
          itemSelectedColor: '#ffffff',
          itemColor: '#1677ff',
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
          <ReloadOutlined style={{ color: '#1677ff', cursor: 'pointer', fontSize: 13 }} />
        </Space>
        <div style={{ flex: 1 }} />
        <Space size={4}>
          <Text type="secondary" style={{ fontSize: 12 }}>集团名称：</Text>
          <Text style={{ fontSize: 12, fontWeight: 600 }}>XX集团</Text>
          <Text type="secondary" style={{ fontSize: 12, marginLeft: 12 }}>集团ID：</Text>
          <Text style={{ fontSize: 12, fontFamily: 'monospace', color: '#141414' }}>24897872938</Text>
        </Space>
      </div>

      {/* ── 资产动态 ── */}
      <Text strong style={{ fontSize: 16, display: 'block', margin: '4px 0 12px' }}>资产动态</Text>
      <div className="kpi-grid">
          <KpiCard
            title={`集团余额（${currency}）`}
            value="$223,300.00"
            sub={[
              { label: '昨日新增', value: '$233,322.00' },
              { label: '今日新增', value: '$233,322.00' },
            ]}
          />
          <KpiCard
            title={`公司资产（${currency}）`}
            value="$2,020.00"
            sub={[
              { label: '昨日新增', value: '$233,322.00' },
              { label: '今日新增', value: '$233,322.00' },
            ]}
          />
          <KpiCard
            title={`企业资产（${currency}）`}
            value="$2,020.00"
            sub={[
              { label: '昨日新增', value: '$233,322.00' },
              { label: '今日新增', value: '$233,322.00' },
            ]}
          />
          <KpiCard
            title={`持股估值（${currency}）`}
            value="$2,020.00"
            sub={[{ label: '持股企业', value: '2,000 家' }]}
            tooltip="公司持有企业股份估值之和"
          />
          <KpiCard
            title={`东方彩票盈亏（${currency}）`}
            value="$223,300.00"
            sub={[
              { label: '昨日盈亏', value: '$233,322' },
              { label: '今日盈亏', value: '$233,322' },
            ]}
            tooltip="公司东方彩票盈亏之和"
          />
          <KpiCard
            title={`股份收益（${currency}）`}
            value="$202,320.00"
            sub={[
              { label: '收益', value: '$233,322.00' },
              { label: '支出', value: '$233,322.00' },
            ]}
          />
          <KpiCard
            title={`税费收益（${currency}）`}
            value="$202,320.00"
            sub={[
              { label: '昨日收益', value: '$233,322.00' },
              { label: '今日收益', value: '$233,322.00' },
            ]}
            tooltip="公司收到的股份交易税费及分红税之和"
          />
          <KpiCard
            title={`资金调回（${currency}）`}
            value="$202,320.00"
            sub={[
              { label: '资金下拨', value: '$202,320.00' },
            ]}
            tooltip="集团从公司账户转回金额之和"
          />
      </div>

      {/* ── 用户动态 ── */}
      <Text strong style={{ fontSize: 16, display: 'block', margin: '24px 0 12px' }}>用户动态</Text>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            title="公司（家）"
            value="22"
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
            sub={[
              { label: '昨日参股', value: '233,322' },
              { label: '今日参股', value: '233,322' },
            ]}
            tooltip="本集团下参股公司数"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            title="企业（家）"
            value="22"
            sub={[
              { label: '昨日新增', value: '233,322' },
              { label: '今日新增', value: '233' },
            ]}
            tooltip="本集团下完成认证的企业总数"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            title="成员（个）"
            value="223,234"
            sub={[
              { label: '昨日新增', value: '233,322' },
              { label: '今日新增', value: '233' },
            ]}
            tooltip="本集团下所有企业成员数"
          />
        </Col>
      </Row>

      {/* ── 集团数据走势 ── */}
      <Text strong style={{ fontSize: 16, display: 'block', margin: '24px 0 12px' }}>集团数据走势</Text>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ChartCard title="集团余额" value="223,300.00" data={groupBalanceData}
            tooltip="展示最近30天集团钱包余额变化趋势" />
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard title="公司资产" value="2,020,000.00" data={companyAssetData}
            tooltip="展示最近30天集团下所有公司总资产合计的变化趋势" />
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard title="企业总资产" value="1,560,000.00" data={enterpriseTotal}
            tooltip="展示最近30天集团下所有企业总资产合计的变化趋势" />
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard title="持股估值" value="234,560.00" data={holdingValData}
            tooltip="展示最近30天公司持有企业股份估值之和的变化趋势" />
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard title="企业盈亏" value="18,320.00" data={enterprisePnl}
            tooltip="展示最近30天集团下所有企业盈亏总和的变化趋势" />
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard title="企业流水" value="3,280,000.00" data={enterpriseFlow}
            tooltip="展示最近30天集团下所有企业游戏流水合计的变化趋势" />
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard title="企业" value="22 家" data={enterpriseCount}
            tooltip="展示最近30天本集团下完成认证的企业数量变化趋势" />
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard title="企业成员" value="223,234 人" data={enterpriseMember}
            tooltip="展示最近30天本集团下所有企业成员总数的变化趋势" />
        </Col>
      </Row>

      {/* ── 收益贡献 TOP5 ── */}
      <Text strong style={{ fontSize: 16, display: 'block', margin: '24px 0 12px' }}>收益贡献 TOP5</Text>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            bordered={false}
            style={{ borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW }}
            styles={{ body: { padding: '16px 24px' } }}
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
