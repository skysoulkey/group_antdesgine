import {
  AccountBookOutlined,
  ExportOutlined,
  FundOutlined,
  ImportOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
  StockOutlined,
  TrophyOutlined,
} from '@ant-design/icons';

import { Area } from '@ant-design/plots';
import {
  Badge,
  Button,
  Card,
  Col,
  ConfigProvider,
  Divider,
  Input,
  Radio,
  Row,
  Segmented,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'umi';

const { Text, Title } = Typography;

const CARD_SHADOW = '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)';
const CARD_RADIUS = 12;

const radioTheme = {
  components: {
    Radio: {
      buttonSolidCheckedBg: '#722ed1',
      buttonSolidCheckedHoverBg: '#9254de',
      buttonSolidCheckedActiveBg: '#531dab',
      buttonSolidCheckedColor: '#fff',
      colorPrimary: '#722ed1',
    },
  },
};

// ── 公司列表（切换用）────────────────────────────────────────────
const COMPANIES = [
  { value: '283982', label: 'UU Talk' },
  { value: '283983', label: 'Hey Talk' },
  { value: '283984', label: '炸雷第一波' },
  { value: '283985', label: 'Cyber Bot' },
  { value: '283986', label: 'Star Tech' },
];

// ── 折线图数据 ────────────────────────────────────────────────────
const months = ['2025-11', '2025-12', '2026-01', '2026-02', '2026-03', '2026-04', '2026-05'];
const mk = (vals: number[]) => vals.map((v, i) => ({ date: months[i], value: v }));

const assetData  = mk([28, 32, 35, 52, 38, 22, 18]);
const profitData = mk([20, 28, 35, 52, 40, 25, 18]);

const chartCfg = (data: { date: string; value: number }[], name: string) => ({
  data,
  xField: 'date',
  yField: 'value',
  shape: 'smooth',
  height: 220,
  autoFit: true,
  style: { fill: 'l(270) 0:rgba(114,46,209,0) 1:rgba(114,46,209,0.2)' },
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
  <Card bordered={false} style={{ borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW, height: '100%' }}
    styles={{ body: { padding: '20px 24px' } }}>
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
      <span style={{ fontSize: 28, fontWeight: 700, color: '#141414', letterSpacing: -1 }}>{value}</span>
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
  <Card bordered={false} style={{ borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW, height: '100%' }}
    styles={{ body: { padding: '20px 24px' } }}>
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

// ── TOP5 数据 ─────────────────────────────────────────────────────
interface TopRow {
  rankNum: number;
  ranking: string;
  enterpriseId: string;
  enterpriseName: string;
  cumulativeProfit: string;
  contributedProfit: string;
  certDays: number;
  memberCount: number;
  masterId: string;
  masterNickname: string;
  createdAt: string;
}

const topData: TopRow[] = [
  { rankNum: 1, ranking: '第1名', enterpriseId: '82938',  enterpriseName: 'hey',       cumulativeProfit: '873,233.23', contributedProfit: '873,233.23', certDays: 341, memberCount: 244, masterId: '73720', masterNickname: 'name1', createdAt: '2025-10-10 12:23:23' },
  { rankNum: 2, ranking: '第2名', enterpriseId: '82939',  enterpriseName: 'wow',       cumulativeProfit: '73,233.23',  contributedProfit: '73,233.23',  certDays: 200, memberCount: 120, masterId: '73721', masterNickname: 'name2', createdAt: '2025-10-10 12:23:23' },
  { rankNum: 3, ranking: '第3名', enterpriseId: '82940',  enterpriseName: 'boom',      cumulativeProfit: '63,233.23',  contributedProfit: '63,233.23',  certDays: 180, memberCount: 98,  masterId: '73722', masterNickname: 'name3', createdAt: '2025-10-10 12:23:23' },
  { rankNum: 4, ranking: '第4名', enterpriseId: '82941',  enterpriseName: 'flash',     cumulativeProfit: '53,233.23',  contributedProfit: '53,233.23',  certDays: 150, memberCount: 76,  masterId: '73723', masterNickname: 'name4', createdAt: '2025-10-10 12:23:23' },
  { rankNum: 5, ranking: '第5名', enterpriseId: '82942',  enterpriseName: 'nova',      cumulativeProfit: '43,233.23',  contributedProfit: '43,233.23',  certDays: 120, memberCount: 55,  masterId: '73724', masterNickname: 'name5', createdAt: '2025-10-10 12:23:23' },
];

// ── 集团转账 mock ─────────────────────────────────────────────────
interface GroupTransfer {
  id: string;
  orderType: string;
  orderTime: string;
  orderNo: string;
  currency: string;
  amount: string;
  remark: string;
}

const groupTransferData: GroupTransfer[] = Array.from({ length: 10 }, (_, i) => ({
  id: `GT${String(i + 1).padStart(5, '0')}`,
  orderType: i % 2 === 0 ? '集团资金下拨' : '集团资金调回',
  orderTime: `2026-03-${String(i + 1).padStart(2, '0')} 10:${String(i * 5).padStart(2, '0')}:00`,
  orderNo: `ORD${String(2026031000 + i)}`,
  currency: 'USDT',
  amount: `${(5000 + i * 2000).toLocaleString()}.00`,
  remark: i % 3 === 0 ? '季度下拨' : i % 3 === 1 ? '月度调回' : '—',
}));

const groupTransferColumns: ColumnsType<GroupTransfer> = [
  { title: '订单时间', dataIndex: 'orderTime', width: 170 },
  { title: '订单编号', dataIndex: 'orderNo', width: 160 },
  { title: '订单类型', dataIndex: 'orderType', width: 140, render: (v) => <Tag color={v === '集团资金下拨' ? 'success' : 'warning'}>{v}</Tag> },
  { title: '货币单位', dataIndex: 'currency', width: 90 },
  {
    title: '交易金额', dataIndex: 'amount', width: 130, align: 'right',
    sorter: (a, b) => parseFloat(a.amount.replace(/,/g, '')) - parseFloat(b.amount.replace(/,/g, '')),
  },
  { title: '订单备注', dataIndex: 'remark' },
];

// ── 贡献集团 mock ─────────────────────────────────────────────────
interface GroupContrib { id: string; joinTime: string; shareRatio: string; holdingValue: string; status: string }
const groupContribData: GroupContrib[] = Array.from({ length: 4 }, (_, i) => ({
  id: `GC${i + 1}`,
  joinTime: `2025-0${i + 1}-15 09:00:00`,
  shareRatio: `${(5 + i * 3).toFixed(1)}%`,
  holdingValue: `${(50000 + i * 20000).toLocaleString()}.00`,
  status: i % 3 === 2 ? '已退' : '持股',
}));
const groupContribColumns: ColumnsType<GroupContrib> = [
  { title: '首次加入时间', dataIndex: 'joinTime', width: 170 },
  { title: '持股比例', dataIndex: 'shareRatio', width: 100, align: 'right' },
  { title: '持股估值（USDT）', dataIndex: 'holdingValue', width: 160, align: 'right' },
  { title: '公司持股状态', dataIndex: 'status', width: 110, render: (v) => <Tag color={v === '持股' ? 'success' : 'default'}>{v}</Tag> },
];

// ── 持股估值 mock ─────────────────────────────────────────────────
interface HoldingValuation {
  id: string;
  enterpriseId: string;
  enterpriseName: string;
  shareRatio: string;
  status: string;   // '持股' | '已退'
  currency: string; // 'USDT' | 'PEA'
  holdingValue: string;
  totalAssets: string;
  shareRevenue: string;
  exitTime: string;
}
const ENTERPRISE_NAMES = ['UU Talk企业', 'Hey Talk企业', '炸雷一期', 'Cyber Bot', 'Star Tech', '龙虎斗基金', '东方彩票', '星海基金'];
const holdingData: HoldingValuation[] = Array.from({ length: 8 }, (_, i) => ({
  id: `HV${i + 1}`,
  enterpriseId: String(287402 + i),
  enterpriseName: ENTERPRISE_NAMES[i],
  shareRatio: `${(3 + i * 2).toFixed(2)}%`,
  status: i % 4 === 3 ? '已退' : '持股',
  currency: i % 3 === 0 ? 'PEA' : 'USDT',
  holdingValue: `${(22000 + i * 9000).toLocaleString()}.00`,
  totalAssets: `${(60000 + i * 15000).toLocaleString()}.00`,
  shareRevenue: `${(6000 + i * 1500).toLocaleString()}.00`,
  exitTime: i % 4 === 3 ? `2025-0${i + 1}-15 14:00:00` : '—',
}));
const holdingColumns: ColumnsType<HoldingValuation> = [
  { title: '企业ID',       dataIndex: 'enterpriseId',   width: 90 },
  { title: '企业名称',     dataIndex: 'enterpriseName', width: 140 },
  { title: '持股比例',     dataIndex: 'shareRatio',     width: 90,  align: 'right' },
  { title: '公司持股状态', dataIndex: 'status',         width: 110,
    render: (v) => <Tag color={v === '持股' ? 'success' : 'default'}>{v}</Tag> },
  { title: '货币单位',     dataIndex: 'currency',       width: 90 },
  { title: '持股估值',     dataIndex: 'holdingValue',   width: 130, align: 'right' },
  { title: '企业总资产快照', dataIndex: 'totalAssets',  width: 150, align: 'right' },
  { title: '股份收益',     dataIndex: 'shareRevenue',   width: 120, align: 'right' },
  { title: '最后退出时间', dataIndex: 'exitTime',       width: 170 },
];

// ── 主组件 ────────────────────────────────────────────────────────
const CompanyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currency, setCurrency] = useState('USDT');
  const [transferSearch, setTransferSearch] = useState('');
  const [transferTypeFilter, setTransferTypeFilter] = useState('全部');
  const [holdingSearch, setHoldingSearch] = useState('');
  const [holdingCurrency, setHoldingCurrency] = useState('全部');
  const [holdingStatus, setHoldingStatus] = useState('全部');

  const currentCompany = COMPANIES.find((c) => c.value === id) ?? COMPANIES[0];

  const topColumns: ColumnsType<TopRow> = [
    {
      title: '总贡献排名', dataIndex: 'rankNum', width: 110,
      render: (v: number, r: TopRow) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 6,
            background: v <= 3 ? '#faad1420' : '#f5f5f5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, color: v <= 3 ? '#faad14' : 'rgba(0,0,0,0.65)',
          }}>
            {v <= 3 ? <TrophyOutlined /> : v}
          </div>
          <span style={{ color: 'rgba(0,0,0,0.65)' }}>{r.ranking}</span>
        </div>
      ),
    },
    { title: '企业ID', dataIndex: 'enterpriseId', width: 90 },
    { title: '企业名称', dataIndex: 'enterpriseName', width: 110 },
    { title: '企业累计盈利', dataIndex: 'cumulativeProfit', width: 140, sorter: true,
      render: (v) => <span style={{ color: '#141414' }}>{v}</span> },
    { title: '累计给公司盈利', dataIndex: 'contributedProfit', width: 150, sorter: true,
      render: (v) => <span style={{ color: '#141414' }}>{v}</span> },
    { title: '认证天数', dataIndex: 'certDays', width: 90, sorter: true, align: 'right' },
    { title: '成员数量', dataIndex: 'memberCount', width: 90, sorter: true, align: 'right' },
    { title: '企业主ID', dataIndex: 'masterId', width: 90 },
    { title: '企业主昵称', dataIndex: 'masterNickname', width: 100 },
    { title: '创建时间', dataIndex: 'createdAt', width: 170 },
  ];

  // 公司概览 tab 内容
  const overviewContent = (
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
      </div>

      {/* KPI 卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            title={`公司总资产（${currency}）`}
            value="223,300.00"
            color="#722ed1"
            icon={<AccountBookOutlined />}
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
            color="#13c2c2"
            icon={<StockOutlined />}
            sub={[{ label: '持股企业', value: '2,000 家' }]}
            tooltip="公司当前持有企业资产之和"
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard
            title={`总收益（${currency}）`}
            value="2,020.00"
            color="#52c41a"
            icon={<FundOutlined />}
            sub={[
              { label: '昨日新增', value: '233,322.00' },
              { label: '今日新增', value: '233,322.00' },
            ]}
          />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <DualCard />
        </Col>
      </Row>

      {/* 折线图 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card bordered={false} style={{ borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW }}
            title={<Text style={{ fontWeight: 600 }}>公司总资产走势</Text>}>
            <Area {...chartCfg(assetData, '公司总资产')} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card bordered={false} style={{ borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW }}
            title={<Text style={{ fontWeight: 600 }}>公司盈亏走势</Text>}>
            <Area {...chartCfg(profitData, '公司盈亏')} />
          </Card>
        </Col>
      </Row>

      {/* TOP5 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card
            bordered={false}
            style={{ borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW }}
            styles={{ body: { padding: '0 0 8px' } }}
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <TrophyOutlined style={{ color: '#faad14', fontSize: 18 }} />
                <span style={{ fontWeight: 700, fontSize: 16 }}>收益贡献排行榜 TOP5</span>
                <Badge
                  count={currency}
                  style={{ backgroundColor: '#722ed1', fontWeight: 600, fontSize: 11 }}
                />
              </div>
            }
          >
            <Table
              columns={topColumns}
              dataSource={topData}
              rowKey="rankNum"
              pagination={false}
              size="middle"
              scroll={{ x: 1200 }}
              rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );

  const tabItems = [
    { key: 'overview', label: '公司概览', children: overviewContent },
    {
      key: 'groupTransfer',
      label: '集团转账',
      children: (() => {
        const filteredTransfer = groupTransferData.filter((r) => {
          const kw = transferSearch.toLowerCase();
          return (
            (transferTypeFilter === '全部' || r.orderType === transferTypeFilter) &&
            (!kw || r.orderNo.toLowerCase().includes(kw) || r.remark.toLowerCase().includes(kw))
          );
        });
        return (
          <Card bordered={false} style={{ borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW }}>
            <Space direction="vertical" size={12} style={{ display: 'flex', marginBottom: 16 }}>
              <Space size={24} wrap align="center">
                <ConfigProvider theme={radioTheme}>
                  <Radio.Group
                    value={transferTypeFilter}
                    onChange={(e) => setTransferTypeFilter(e.target.value)}
                    buttonStyle="solid"
                  >
                    <Radio.Button value="全部">全部</Radio.Button>
                    <Radio.Button value="集团资金下拨">集团资金下拨</Radio.Button>
                    <Radio.Button value="集团资金调回">集团资金调回</Radio.Button>
                  </Radio.Group>
                </ConfigProvider>
                <Input
                    suffix={<SearchOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
                    placeholder="订单编号、订单备注"
                    value={transferSearch}
                    onChange={(e) => setTransferSearch(e.target.value)}
                    allowClear
                    style={{ width: 220 }}
                  />
              </Space>
            </Space>
            <Table columns={groupTransferColumns} dataSource={filteredTransfer} rowKey="id"
              size="middle" pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
              rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')} />
          </Card>
        );
      })(),
    },
    {
      key: 'holding',
      label: '持股估值',
      children: (() => {
        const kw = holdingSearch.toLowerCase();
        const filteredHolding = holdingData.filter((r) =>
          (holdingCurrency === '全部' || r.currency === holdingCurrency) &&
          (holdingStatus === '全部' || r.status === holdingStatus) &&
          (!kw || r.enterpriseName.toLowerCase().includes(kw) || r.enterpriseId.includes(holdingSearch))
        );
        return (
          <Card bordered={false} style={{ borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW }}>
            <Space size={16} wrap align="center" style={{ marginBottom: 16 }}>
              <ConfigProvider theme={radioTheme}>
                <Radio.Group value={holdingCurrency} onChange={(e) => setHoldingCurrency(e.target.value)} buttonStyle="solid">
                  <Radio.Button value="全部">全部</Radio.Button>
                  <Radio.Button value="USDT">USDT</Radio.Button>
                  <Radio.Button value="PEA">PEA</Radio.Button>
                </Radio.Group>
              </ConfigProvider>
              <ConfigProvider theme={radioTheme}>
                <Radio.Group value={holdingStatus} onChange={(e) => setHoldingStatus(e.target.value)} buttonStyle="solid">
                  <Radio.Button value="全部">全部</Radio.Button>
                  <Radio.Button value="持股">持股</Radio.Button>
                  <Radio.Button value="已退">已退</Radio.Button>
                </Radio.Group>
              </ConfigProvider>
              <Input
                  suffix={<SearchOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
                  placeholder="企业名称、企业ID"
                  value={holdingSearch}
                  onChange={(e) => setHoldingSearch(e.target.value)}
                  allowClear
                  style={{ width: 200 }}
                />
            </Space>
            <Table columns={holdingColumns} dataSource={filteredHolding} rowKey="id"
              size="middle" scroll={{ x: 1100 }} pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
              rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')} />
          </Card>
        );
      })(),
    },
  ];

  return (
    <div>
      {/* 页面标题行 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0 }}>公司概览</Title>
        <Select
          value={currentCompany.value}
          onChange={(val) => navigate(`/company/detail/${val}`)}
          style={{ width: 180 }}
          options={COMPANIES}
          placeholder="切换公司"
        />
      </div>

      {/* Tabs */}
      <Tabs
        items={tabItems}
        defaultActiveKey="overview"
        style={{ background: 'transparent' }}
      />
    </div>
  );
};

export default CompanyDetail;
