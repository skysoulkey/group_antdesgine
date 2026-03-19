import { ReloadOutlined } from '@ant-design/icons';
import { Line } from '@ant-design/plots';
import {
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

// ── 折线图数据 ──────────────────────────────────────────
const months = ['2025-11', '2025-12', '2026-01', '2026-02', '2026-03', '2026-04', '2026-05'];
const mk = (vals: number[]) => vals.map((v, i) => ({ date: months[i], value: v }));

const groupBalanceData   = mk([28, 32, 35, 52, 38, 22, 18]);
const companyAssetData   = mk([30, 28, 35, 50, 32, 20, 16]);
const enterpriseTotal    = mk([18, 25, 32, 48, 30, 18, 22]);
const holdingValData     = mk([22, 30, 38, 55, 42, 28, 15]);
const enterprisePnl      = mk([20, 28, 35, 50, 28, 15, 10]);
const enterpriseFlow     = mk([25, 32, 38, 52, 35, 22, 18]);
const enterpriseCount    = mk([5, -5, 15, 60, -20, -40, -50]);
const enterpriseMember   = mk([0, -10, 20, 55, -15, -35, -45]);

const chartCfg = (data: { date: string; value: number }[]) => ({
  data,
  xField: 'date',
  yField: 'value',
  shape: 'smooth',
  point: {},
  height: 200,
  autoFit: true,
});

// ── 统一 stat 卡片 ──────────────────────────────────────
interface Sub { label: string; value: string | number }
interface StatCardProps {
  title: string;
  value: string | number;
  suffix?: string;
  sub?: Sub[];
}
const StatCard: React.FC<StatCardProps> = ({ title, value, suffix, sub }) => (
  <Card bordered={false} style={{ height: '100%' }}>
    <Text type="secondary" style={{ fontSize: 13 }}>{title}</Text>
    <div style={{ fontSize: 26, fontWeight: 700, margin: '4px 0 8px', letterSpacing: -0.5 }}>
      {value}
      {suffix && <Text type="secondary" style={{ fontSize: 14, fontWeight: 400, marginLeft: 4 }}>{suffix}</Text>}
    </div>
    {sub && (
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {sub.map((s) => (
          <div key={s.label}>
            <div><Text type="secondary" style={{ fontSize: 12 }}>{s.label}</Text></div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{s.value}</div>
          </div>
        ))}
      </div>
    )}
  </Card>
);

// ── TOP5 表格 ───────────────────────────────────────────
interface TopRow {
  ranking: string;
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
  { ranking: '第1名', companyId: '283982', companyName: 'hey', cumulativeProfit: '873,233.23', certEnterprises: 543, members: 543, masterId: '73720', masterNickname: 'name1', createdAt: '2025-10-10 12:23:23' },
  { ranking: '第2名', companyId: '283982', companyName: 'hey', cumulativeProfit: '73,233.23',  certEnterprises: 23,  members: 23,  masterId: '73720', masterNickname: 'name2', createdAt: '2025-10-10 12:23:23' },
  { ranking: '第3名', companyId: '283982', companyName: 'hey', cumulativeProfit: '873,233.23', certEnterprises: 11,  members: 11,  masterId: '73720', masterNickname: 'name3', createdAt: '2025-10-10 12:23:23' },
  { ranking: '第4名', companyId: '283982', companyName: 'hey', cumulativeProfit: '873,233.23', certEnterprises: 0,   members: 0,   masterId: '73720', masterNickname: 'name4', createdAt: '2025-10-10 12:23:23' },
  { ranking: '第5名', companyId: '283982', companyName: 'hey', cumulativeProfit: '873,233.23', certEnterprises: 32,  members: 32,  masterId: '73720', masterNickname: 'name5', createdAt: '2025-10-10 12:23:23' },
];

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [currency, setCurrency] = useState('USDT');

  const topColumns: ColumnsType<TopRow> = [
    { title: '总贡献排名', dataIndex: 'ranking', width: 100 },
    { title: '公司ID', dataIndex: 'companyId', width: 90 },
    { title: '公司名称', dataIndex: 'companyName', width: 100 },
    { title: '公司累计盈利', dataIndex: 'cumulativeProfit', width: 130, sorter: true, render: (v) => <Text strong style={{ color: '#1677ff' }}>{v}</Text> },
    { title: '认证企业', dataIndex: 'certEnterprises', width: 90, sorter: true, align: 'right' },
    { title: '企业成员', dataIndex: 'members', width: 90, sorter: true, align: 'right' },
    { title: '公司主ID', dataIndex: 'masterId', width: 90 },
    { title: '公司主昵称', dataIndex: 'masterNickname', width: 100 },
    { title: '创建时间', dataIndex: 'createdAt', width: 170 },
    {
      title: '操作',
      width: 90,
      fixed: 'right',
      render: (_, r) => (
        <Button type="link" size="small" style={{ color: '#722ed1', padding: 0 }}
          onClick={() => navigate(`/company/detail/${r.companyId}`)}>
          公司详情
        </Button>
      ),
    },
  ];

  return (
    <div>
      {/* 顶部工具栏 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <Segmented
          options={['USDT', 'PEA']}
          value={currency}
          onChange={(v) => setCurrency(v as string)}
          style={{ fontWeight: 600 }}
        />
        <Space size={6}>
          <Text type="secondary" style={{ fontSize: 12 }}>数据更新时间：2025-11-02 12:33:02</Text>
          <ReloadOutlined style={{ color: '#1677ff', cursor: 'pointer', fontSize: 13 }} />
        </Space>
      </div>

      {/* ── 第一行 stat 卡片 ── */}
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title={`集团余额（${currency}）`} value="223,300.00" />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title={`下辖公司资产（${currency}）`}
            value="2,020.00"
            sub={[
              { label: '昨日新增', value: '233,322.00' },
              { label: '今日新增', value: '233,322.00' },
            ]}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title={`下辖企业资产（${currency}）`}
            value="2,020.00"
            sub={[
              { label: '昨日新增', value: '233,322.00' },
              { label: '今日新增', value: '233,322.00' },
            ]}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title={`下辖持股估值（${currency}）`}
            value="2,020.00"
            sub={[{ label: '持股企业', value: '2000家' }]}
          />
        </Col>
      </Row>

      {/* ── 第二行 stat 卡片 ── */}
      <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title={`东方彩票盈亏（${currency}）`}
            value="223,300.00"
            sub={[
              { label: '昨日盈亏', value: '233,322' },
              { label: '今日盈亏', value: '233,322' },
            ]}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title={`股份收益（${currency}）`}
            value="202,320.00"
            sub={[
              { label: '收益', value: '233,322.00' },
              { label: '支出', value: '233,322.00' },
            ]}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title={`税费收益（${currency}）`}
            value="202,320.00"
            sub={[
              { label: '昨日收益', value: '233,322.00' },
              { label: '今日收益', value: '233,322.00' },
            ]}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ height: '100%' }}>
            <Text type="secondary" style={{ fontSize: 13 }}>集团资金下拨</Text>
            <div style={{ fontSize: 22, fontWeight: 700, margin: '4px 0 8px' }}>202,320.00</div>
            <Divider style={{ margin: '8px 0' }} />
            <Text type="secondary" style={{ fontSize: 13 }}>集团资金调回</Text>
            <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>202,320.00</div>
          </Card>
        </Col>
      </Row>

      {/* ── 第三行 stat 卡片 ── */}
      <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="下辖公司（家）"
            value="22"
            sub={[
              { label: '昨日新增', value: '233,322' },
              { label: '今日新增', value: '233,322' },
            ]}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="参股公司（家）"
            value="22"
            sub={[
              { label: '昨日参股', value: '+233,322' },
              { label: '今日参股', value: '-233,322' },
            ]}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="下辖企业（家）"
            value="22"
            sub={[
              { label: '昨日新增', value: '233,322' },
              { label: '今日新增', value: '233' },
            ]}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="下辖成员（个）"
            value="223,234"
            sub={[
              { label: '昨日新增', value: '233,322' },
              { label: '今日新增', value: '233' },
            ]}
          />
        </Col>
      </Row>

      {/* ── 折线图区（8张） ── */}
      <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
        <Col xs={24} lg={12}>
          <Card bordered={false} title="集团余额">
            <Line {...chartCfg(groupBalanceData)} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card bordered={false} title="下辖公司资产">
            <Line {...chartCfg(companyAssetData)} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card bordered={false} title="下辖企业总资产">
            <Line {...chartCfg(enterpriseTotal)} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card bordered={false} title="下辖持股估值">
            <Line {...chartCfg(holdingValData)} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card bordered={false} title="下辖企业盈亏">
            <Line {...chartCfg(enterprisePnl)} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card bordered={false} title="下辖企业流水">
            <Line {...chartCfg(enterpriseFlow)} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card bordered={false} title="下辖企业">
            <Line {...chartCfg(enterpriseCount)} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card bordered={false} title="下辖企业成员">
            <Line {...chartCfg(enterpriseMember)} />
          </Card>
        </Col>
      </Row>

      {/* ── TOP5 收益贡献排行榜 ── */}
      <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
        <Col span={24}>
          <Card
            bordered={false}
            title={`收益贡献排行榜TOP5（${currency}）`}
          >
            <Table
              columns={topColumns}
              dataSource={topData}
              rowKey="ranking"
              pagination={false}
              size="middle"
              scroll={{ x: 1100 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
