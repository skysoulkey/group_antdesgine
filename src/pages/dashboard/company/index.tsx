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

// ── 设计 token ────────────────────────────────────────────────────
const CARD_SHADOW = '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)';
const CARD_RADIUS = 12;

// ── 折线图数据（最近30天，按日展示）────────────────────────────────
const BASE_DATE = new Date('2026-03-24');
const days30 = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(BASE_DATE);
  d.setDate(d.getDate() - 29 + i);
  return d.toISOString().slice(0, 10);
});

/** 用正弦波 + 线性趋势生成确定性日级数据，避免随机抖动 */
const mkDay = (base: number, amp: number, trend: number, phase: number) =>
  days30.map((date, i) => ({
    date,
    value: Math.round(base + amp * Math.sin((i / 30) * Math.PI * 3 + phase) + trend * (i / 30)),
  }));

const charts = {
  // Tooltip 注释：展示最近30天公司总资产（企业余额+应用余额之和）变化趋势
  asset:      mkDay(2000, 400, 300, 0),
  // Tooltip 注释：展示最近30天公司综合盈亏变化趋势
  profit:     mkDay(1500, 350, 200, 1),
  // Tooltip 注释：展示最近30天本公司下所有企业总资产合计的变化趋势
  enterprise: mkDay(3000, 500, 400, 2),
  // Tooltip 注释：本公司下认证企业数量变化趋势（日度快照）
  cert:       mkDay(20, 5, 2, 0.5),
  // Tooltip 注释：展示最近30天本公司注册成员总数变化趋势
  member:     mkDay(180, 30, 20, 1.5),
  // Tooltip 注释：本日参与东方彩票游戏的成员之和
  particip:   mkDay(80, 40, 10, 2.5),
};

const chartCfg = (data: { date: string; value: number }[], name: string) => ({
  data,
  xField: 'date',
  yField: 'value',
  shapeField: 'smooth',
  height: 220,
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

    <div style={{ marginTop: 12 }}>
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
  enterpriseId: string;
  enterpriseName: string;
  currency: string;
  enterpriseProfit: string;
  profitToCompany: string;
  certDays: number;
  members: number;
  ownerId: string;
  ownerNickname: string;
  createdAt: string;
}

const topData: TopRow[] = [
  { ranking: '第1名', rankNum: 1, enterpriseId: '283982', enterpriseName: 'Hey Talk',  currency: 'USDT', enterpriseProfit: '873,233.23', profitToCompany: '123,456.00', certDays: 180, members: 543, ownerId: '73720', ownerNickname: 'name1', createdAt: '2025-10-10 12:23:23' },
  { ranking: '第2名', rankNum: 2, enterpriseId: '283983', enterpriseName: 'UU Talk',   currency: 'USDT', enterpriseProfit: '73,233.23',  profitToCompany: '23,456.00',  certDays: 120, members: 23,  ownerId: '73721', ownerNickname: 'name2', createdAt: '2025-10-10 12:23:23' },
  { ranking: '第3名', rankNum: 3, enterpriseId: '283984', enterpriseName: 'Star Tech', currency: 'USDT', enterpriseProfit: '873,233.23', profitToCompany: '93,456.00',  certDays: 90,  members: 11,  ownerId: '73722', ownerNickname: 'name3', createdAt: '2025-10-10 12:23:23' },
  { ranking: '第4名', rankNum: 4, enterpriseId: '283985', enterpriseName: 'Cyber Bot', currency: 'PEA',  enterpriseProfit: '873,233.23', profitToCompany: '73,456.00',  certDays: 60,  members: 0,   ownerId: '73723', ownerNickname: 'name4', createdAt: '2025-10-10 12:23:23' },
  { ranking: '第5名', rankNum: 5, enterpriseId: '283986', enterpriseName: 'Nova Corp', currency: 'USDT', enterpriseProfit: '873,233.23', profitToCompany: '53,456.00',  certDays: 30,  members: 32,  ownerId: '73724', ownerNickname: 'name5', createdAt: '2025-10-10 12:23:23' },
];

// ── 主组件 ────────────────────────────────────────────────────────
const CompanyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currency, setCurrency] = useState('USDT');

  const topColumns: ColumnsType<TopRow> = [
    {
      title: '总贡献排名', dataIndex: 'rankNum', width: 100,
      render: (_: number, r: TopRow) => (
        <span style={{ fontWeight: 500, color: 'rgba(0,0,0,0.65)' }}>{r.ranking}</span>
      ),
    },
    { title: '企业ID', dataIndex: 'enterpriseId', width: 90 },
    { title: '企业名称', dataIndex: 'enterpriseName', width: 110 },
    { title: '货币单位', dataIndex: 'currency', width: 90 },
    {
      title: '企业累计盈利', dataIndex: 'enterpriseProfit', width: 140, sorter: true,
      render: (v) => <span style={{ color: '#141414' }}>{v}</span>,
    },
    {
      title: '累计给公司盈利', dataIndex: 'profitToCompany', width: 150, sorter: true, defaultSortOrder: 'descend',
      render: (v) => <span style={{ color: '#141414' }}>{v}</span>,
    },
    { title: '认证天数', dataIndex: 'certDays', width: 90, align: 'right' },
    { title: '成员数量', dataIndex: 'members', width: 90, align: 'right' },
    { title: '企业主ID', dataIndex: 'ownerId', width: 90 },
    { title: '企业主昵称', dataIndex: 'ownerNickname', width: 110 },
    { title: '创建时间', dataIndex: 'createdAt', width: 170 },
    {
      title: '操作', width: 90, fixed: 'right' as const,
      render: (_: unknown, r: TopRow) => (
        <Button
          type="link" size="small" style={{ padding: 0 }}
          onClick={() => navigate(`/enterprise/detail/${r.enterpriseId}`)}
        >
          企业详情
        </Button>
      ),
    },
  ];

  return (
    <div style={{ background: 'transparent' }}>

      {/* ── 顶部工具栏 ── */}
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
          <ReloadOutlined style={{ color: '#1677ff', cursor: 'pointer', fontSize: 14 }} />
        </Space>
        <div style={{ flex: 1 }} />
        <Space size={4}>
          <Text type="secondary" style={{ fontSize: 12 }}>公司名称：</Text>
          <Text style={{ fontSize: 12, fontWeight: 600 }}>UU Talk</Text>
          <Text type="secondary" style={{ fontSize: 12, marginLeft: 12 }}>公司ID：</Text>
          <Text style={{ fontSize: 12, fontFamily: 'monospace', color: '#141414' }}>24897872938</Text>
        </Space>
      </div>

      {/* ── 资产动态 ── */}
      <Text strong style={{ fontSize: 16, display: 'block', margin: '4px 0 12px' }}>资产动态</Text>
      <div className="kpi-grid">
          <KpiCard
            title={`公司总资产（${currency}）`}
            value="$223,300.00"
            sub={[
              { label: '昨日新增', value: '$233,322.00' },
              { label: '今日新增', value: '$233,322.00' },
            ]}
            tooltip="企业余额及应用余额之和"
          />
          <KpiCard
            title={`持股估值（${currency}）`}
            value="$2,020.00"
            sub={[{ label: '持股企业', value: '2,000 家' }]}
            tooltip="公司当前持有企业资产之和"
          />
          <KpiCard
            title={`股份盈亏（${currency}）`}
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
            tooltip="股份交易税费及分红税之和"
          />
          <KpiCard
            title={`东方彩票盈亏（${currency}）`}
            value="$200.00"
            sub={[
              { label: '昨日盈亏', value: '$233,322.00' },
              { label: '今日盈亏', value: '$233,322.00' },
            ]}
            tooltip="东方彩票订单-订单赔付"
          />
          <KpiCard
            title={`佣金收益（${currency}）`}
            value="$200.00"
            sub={[
              { label: '昨日收益', value: '$233,322.00' },
              { label: '今日收益', value: '$233,322.00' },
            ]}
          />
          <KpiCard
            title={`佣金支出（${currency}）`}
            value="$200.00"
            sub={[
              { label: '昨日支出', value: '$233,322.00' },
              { label: '今日支出', value: '$233,322.00' },
            ]}
            tooltip="本公司支出佣金之和"
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
            title="认证企业（家）"
            value="22"
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
            sub={[
              { label: '昨日新增', value: '233,322' },
              { label: '今日新增', value: '233' },
            ]}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            title="活跃成员（个）"
            value="200"
            sub={[
              { label: '昨日活跃', value: '233' },
              { label: '七日留存', value: '233' },
            ]}
            tooltip="本日存在登录记录"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            title="参与成员（个）"
            value="200"
            sub={[{ label: '昨日参与', value: '33' }]}
            tooltip="参与投注或红包游戏的成员"
          />
        </Col>
      </Row>

      {/* ── 公司数据走势 ── */}
      <Text strong style={{ fontSize: 16, display: 'block', margin: '24px 0 12px' }}>公司数据走势</Text>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ChartCard title="公司总资产" value="223,300.00" data={charts.asset} tooltip="展示最近30天公司总资产（企业余额及应用余额之和）变化趋势" />
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard title="公司盈亏" value="202,320.00" data={charts.profit} tooltip="展示最近30天公司综合盈亏变化趋势" />
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard title="企业总资产" value="234,560.00" data={charts.enterprise} tooltip="展示最近30天本公司下所有企业总资产合计的变化趋势" />
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard title="认证企业" value="22 家" data={charts.cert} tooltip="本公司下认证企业数量" />
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard title="成员总数" value="200 人" data={charts.member} tooltip="展示最近30天本公司注册成员总数的变化趋势" />
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard title="参与成员" value="200 人" data={charts.particip} tooltip="本日参与东方彩票游戏的成员之和" />
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
              rowClassName={(_, index) => index % 2 === 0 ? '' : 'table-row-light'}
            />
          </Card>
        </Col>
      </Row>

    </div>
  );
};

export default CompanyDashboard;
