import { AppstoreOutlined, SearchOutlined } from '@ant-design/icons';
import { Area } from '@ant-design/plots';
import {
  Button,
  Card,
  Col,
  ConfigProvider,
  DatePicker,
  Input,
  Radio,
  Row,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import React, { useState } from 'react';
import { useParams } from 'umi';

const { Text } = Typography;
const { RangePicker } = DatePicker;

const CARD_SHADOW = '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)';

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

const mk = (n: number) => Array.from({ length: n }, (_, i) => i);

// ── 企业查找表（根据路由 id 展示基本信息）────────────────────────────
const ENTERPRISE_MAP: Record<string, { name: string; certStatus: '已订阅' | '已过期'; company: string; status: '正常' | '已解散' }> = {
  '283982': { name: 'hey',      certStatus: '已订阅', company: 'UU Talk',    status: '正常'   },
  '283983': { name: 'UUtalk',   certStatus: '已订阅', company: 'Hey Talk',   status: '正常'   },
  '283984': { name: 'CyberBot', certStatus: '已过期', company: '炸雷第一波',  status: '正常'   },
  '283985': { name: 'StarTech', certStatus: '已订阅', company: 'UU Talk',    status: '正常'   },
  '283986': { name: 'GoldLink', certStatus: '已订阅', company: 'Hey Talk',   status: '已解散' },
};

// ── 日期范围筛选辅助 ──────────────────────────────────────────────
const inRange = (dateStr: string, range: [Dayjs, Dayjs] | null) => {
  if (!range || !dateStr || dateStr === '—') return true;
  const d = dayjs(dateStr);
  return !d.isBefore(range[0].startOf('day')) && !d.isAfter(range[1].endOf('day'));
};

// ── 企业概览 KPI 数据 ──────────────────────────────────────────────
const OV_DAYS = ['2026-03-13', '2026-03-14', '2026-03-15', '2026-03-16', '2026-03-17', '2026-03-18', '2026-03-19'];
// 企业总资产趋势
const totalAssetsData = OV_DAYS.map((date, i) => ({ date, value: 220000 + i * 3200 - (i % 2) * 1800 }));
// 企业流水趋势
const flowData = OV_DAYS.map((date, i) => ({ date, value: 85000 + i * 1400 - (i % 3) * 900 }));
// 企业成员趋势
const membersData = OV_DAYS.map((date, i) => ({ date, value: 120 + i * 2 }));
// 参与成员趋势
const participantsData = OV_DAYS.map((date, i) => ({ date, value: 62 + i * 3 - (i % 2) * 4 }));

// KPI 卡片组件
const KpiCard: React.FC<{
  title: string;
  value: string | number;
  valueColor?: string;
  subs: Array<{ label: string; value: string | number }>;
}> = ({ title, value, valueColor = '#722ed1', subs }) => (
  <Card bordered={false} style={{ boxShadow: CARD_SHADOW, height: '100%' }}>
    <Text type="secondary" style={{ fontSize: 12 }}>{title}</Text>
    <div style={{ fontSize: 22, fontWeight: 600, color: valueColor, margin: '6px 0 8px', lineHeight: 1.2 }}>
      {value}
    </div>
    <Space size={16} wrap>
      {subs.map((s) => (
        <Text key={s.label} type="secondary" style={{ fontSize: 12 }}>
          {s.label}：<span style={{ color: 'rgba(0,0,0,0.65)' }}>{s.value}</span>
        </Text>
      ))}
    </Space>
  </Card>
);

// 迷你折线图组件
const MiniLineChart: React.FC<{ title: string; data: { date: string; value: number }[]; color: string }> = ({
  title,
  data,
  color,
}) => {
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const filtered = data.filter((d) => inRange(d.date, range));
  return (
    <Card
      bordered={false}
      style={{ boxShadow: CARD_SHADOW }}
      title={title}
      extra={
        <RangePicker
          size="small"
          onChange={(v) => setRange(v as [Dayjs, Dayjs] | null)}
        />
      }
    >
      <Area
        data={filtered}
        xField="date"
        yField="value"
        height={180}
        autoFit
        smooth
        style={{ fill: `l(270) 0:${color}00 1:${color}33` }}
        axis={{
          x: { labelFontSize: 11, labelFormatter: (v: string) => dayjs(v).format('M/D') },
          y: { labelFontSize: 11 },
        }}
      />
    </Card>
  );
};

// ── 成员清单 ───────────────────────────────────────────────────────
interface Member {
  id: string; nickname: string; parentId: string; parentNickname: string;
  joinTime: string; sessions: number; invited: number; totalPnl: string;
  rebate: string; redPacket: string; lottery: string; status: '正常' | '已退';
}
const memberData: Member[] = mk(10).map((i) => ({
  id: `MB${100000 + i}`,
  nickname: `用户${i + 1}`,
  parentId: `MB${90000 + i}`,
  parentNickname: `上级${i + 1}`,
  joinTime: `2025-${String(11 - (i % 3)).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`,
  sessions: 10 + i * 3,
  invited: i * 2,
  totalPnl: i % 3 === 0 ? `-${(200 + i * 50).toLocaleString()}.00` : `${(500 + i * 300).toLocaleString()}.00`,
  rebate: `${(50 + i * 30).toLocaleString()}.00`,
  redPacket: `${(100 + i * 20).toLocaleString()}.00`,
  lottery: i % 2 === 0 ? `-${(80 + i * 10)}.00` : `${(120 + i * 15)}.00`,
  status: i % 5 === 4 ? '已退' : '正常',
}));

// ── 股东清单 ───────────────────────────────────────────────────────
interface Shareholder {
  id: string; nickname: string; shares: string; ratio: string;
  joinTime: string; income: string; totalRevenue: string;
  expenditure: string; taxPaid: string; status: '正常' | '已退';
}
const shareholderData: Shareholder[] = mk(6).map((i) => ({
  id: `SH${20000 + i}`,
  nickname: `股东${i + 1}`,
  shares: `${(1000 + i * 500).toLocaleString()}`,
  ratio: `${(5 + i * 3).toFixed(2)}%`,
  joinTime: `2025-0${i + 1}-${String(i * 3 + 1).padStart(2, '0')} 10:00:00`,
  income: `${(8000 + i * 1500).toLocaleString()}.00`,
  totalRevenue: `${(12000 + i * 2000).toLocaleString()}.00`,
  expenditure: `${(3000 + i * 500).toLocaleString()}.00`,
  taxPaid: `${(600 + i * 100).toLocaleString()}.00`,
  status: i % 4 === 3 ? '已退' : '正常',
}));

// ── 投资分红 ───────────────────────────────────────────────────────
interface Dividend {
  orderId: string; orderType: '分红' | '投资'; amount: string;
  taxPaid: string; shareholderCount: number; completedAt: string;
}
const dividendData: Dividend[] = mk(8).map((i) => ({
  orderId: `DIV${String(i + 1).padStart(7, '0')}`,
  orderType: i % 2 === 0 ? '分红' : '投资',
  amount: `${(10000 + i * 3000).toLocaleString()}.00`,
  taxPaid: `${(500 + i * 150).toLocaleString()}.00`,
  shareholderCount: 12 + i * 3,
  completedAt: `2026-03-${String(i + 1).padStart(2, '0')} 22:00:00`,
}));

// ── 开通应用 ───────────────────────────────────────────────────────
interface AppItem {
  id: number; name: string; balance: string; rebateAmt: string;
  enabledAt: string; updatedAt: string; appStatus: '已开通' | '未开通';
}
const appsData: AppItem[] = [
  { id: 1, name: 'UU Talk',   balance: '12,340.00', rebateAmt: '3,200.00', enabledAt: '2025-10-01', updatedAt: '2026-02-15', appStatus: '已开通' },
  { id: 2, name: 'Hey Talk',  balance: '8,760.00',  rebateAmt: '1,800.00', enabledAt: '2025-11-15', updatedAt: '2026-03-01', appStatus: '已开通' },
  { id: 3, name: 'Star Game', balance: '0.00',      rebateAmt: '0.00',     enabledAt: '—',          updatedAt: '—',          appStatus: '未开通' },
  { id: 4, name: 'Lucky Bet', balance: '5,230.00',  rebateAmt: '920.00',   enabledAt: '2026-01-20', updatedAt: '2026-03-10', appStatus: '已开通' },
];

// ── 股份交易 ───────────────────────────────────────────────────────
interface ShareTrade {
  orderId: string; direction: '买入' | '卖出'; tradeTime: string;
  shareholderId: string; shareholderName: string;
  taxPaid: string; totalAssetsSnapshot: string; orderType: '转让' | '回购' | '增发';
}
const shareTradeData: ShareTrade[] = mk(8).map((i) => ({
  orderId: `ST${String(i + 1).padStart(7, '0')}`,
  direction: i % 2 === 0 ? '买入' : '卖出',
  tradeTime: `2026-03-${String(i + 1).padStart(2, '0')} 14:${String(i * 7).padStart(2, '0')}:00`,
  shareholderId: `SH${20000 + i}`,
  shareholderName: ['张三', '李四', '王五', '赵六', '孙七', '周八', '吴九', '郑十'][i],
  taxPaid: `${(300 + i * 80).toLocaleString()}.00`,
  totalAssetsSnapshot: `${(800000 + i * 12000).toLocaleString()}.00`,
  orderType: (['转让', '回购', '增发'] as const)[i % 3],
}));

// ── 佣金订单 ───────────────────────────────────────────────────────
interface CommissionOrder {
  orderId: string; createdAt: string; appName: string;
  game: string; commission: string;
}
const commissionData: CommissionOrder[] = mk(8).map((i) => ({
  orderId: `CO${String(i + 1).padStart(7, '0')}`,
  createdAt: `2026-03-${String(i + 1).padStart(2, '0')} 14:00:00`,
  appName: ['UU Talk', 'Hey Talk', 'Star Game'][i % 3],
  game: ['百家乐', '龙虎斗', '骰子'][i % 3],
  commission: `${(200 + i * 80).toLocaleString()}.00`,
}));

// ── 企业红包 ───────────────────────────────────────────────────────
interface RedPacket {
  id: string; startTime: string; amount: string; recipient: string;
  completedAt: string; enterpriseRevenue: string; status: '已完成' | '进行中' | '已过期';
}
const redPacketData: RedPacket[] = mk(6).map((i) => ({
  id: `RP${String(i + 1).padStart(5, '0')}`,
  startTime: `2026-03-${String(i + 1).padStart(2, '0')} 10:00:00`,
  amount: `${(100 + i * 50).toLocaleString()}.00`,
  recipient: `用户${i + 10}`,
  completedAt: i % 3 === 2 ? '—' : `2026-03-${String(i + 1).padStart(2, '0')} 12:00:00`,
  enterpriseRevenue: `${(20 + i * 10).toLocaleString()}.00`,
  status: (['已完成', '进行中', '已过期'] as const)[i % 3],
}));

// ── 东方彩票 ───────────────────────────────────────────────────────
interface LotteryOrder {
  id: string; startTime: string; bettorId: string; bettorName: string;
  game: string; period: string; orderId: string; orderAmt: string;
  completedAt: string; pnl: string; status: string; payoutAmt: string; remark: string;
}
const lotteryData: LotteryOrder[] = mk(8).map((i) => ({
  id: `LO${i}`,
  startTime: `2026-03-${String(i + 1).padStart(2, '0')} 10:00:00`,
  bettorId: `MB${100000 + i}`,
  bettorName: `用户${i + 1}`,
  game: ['百家乐', '龙虎斗', '骰子'][i % 3],
  period: `第${1000 + i}期`,
  orderId: `LO${String(i + 1).padStart(7, '0')}`,
  orderAmt: `${(500 + i * 200).toLocaleString()}.00`,
  completedAt: `2026-03-${String(i + 1).padStart(2, '0')} 22:00:00`,
  pnl: i % 3 === 0 ? `-${(80 + i * 20)}.00` : `${(100 + i * 50)}.00`,
  status: ['未结算', '结算中', '已结算'][i % 3],
  payoutAmt: i % 3 === 0 ? `${(400 + i * 180).toLocaleString()}.00` : '0.00',
  remark: i % 4 === 0 ? '异常订单' : '—',
}));

// ── 主组件 ────────────────────────────────────────────────────────
const EnterpriseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const enterpriseInfo = ENTERPRISE_MAP[id ?? ''];

  const tabItems = [
    // ── 企业概览 ─────────────────────────────────────────────────
    {
      key: 'overview',
      label: '企业概览',
      children: (
        <div>
          {/* 第一行：财务核心指标 */}
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} lg={6}>
              <KpiCard
                title="企业总资产（USDT）"
                value="234,560.00"
                valueColor="#722ed1"
                subs={[
                  { label: '昨日新增', value: '1,200.00' },
                  { label: '今日新增', value: '800.00' },
                ]}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <KpiCard
                title="总收益（USDT）"
                value="89,230.00"
                valueColor="#52c41a"
                subs={[
                  { label: '总投资', value: '233,322' },
                  { label: '总分红', value: '233' },
                ]}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <KpiCard
                title="缴纳税费（USDT）"
                value="12,340.00"
                valueColor="#fa8c16"
                subs={[
                  { label: '纳税次数', value: '233' },
                  { label: '纳税笔数', value: '37' },
                ]}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <KpiCard
                title="佣金支出（USDT）"
                value="5,680.00"
                valueColor="#1677ff"
                subs={[
                  { label: '昨日支出', value: '233,322.00' },
                  { label: '今日支出', value: '233,322.00' },
                ]}
              />
            </Col>
          </Row>

          {/* 第二行：业务盈亏 & 股东 & 认证 */}
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} lg={6}>
              <KpiCard
                title="东方彩票盈亏（USDT）"
                value="18,760.00"
                valueColor="#722ed1"
                subs={[
                  { label: '昨日盈亏', value: '233,322.00' },
                  { label: '今日盈亏', value: '233,322.00' },
                ]}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <KpiCard
                title="企业红包收益（USDT）"
                value="3,450.00"
                valueColor="#eb2f96"
                subs={[
                  { label: '昨日收益', value: '233,322.00' },
                  { label: '今日收益', value: '233,322.00' },
                ]}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <KpiCard
                title="企业股东（个）"
                value="6"
                valueColor="#1677ff"
                subs={[
                  { label: '公司已入股', value: '4' },
                  { label: '平台未入股', value: '2' },
                ]}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <KpiCard
                title="企业认证费（PEA）"
                value="200.00"
                valueColor="#fa8c16"
                subs={[
                  { label: '认证到期', value: '2025-11-23' },
                ]}
              />
            </Col>
          </Row>

          {/* 第三行：成员指标 */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <KpiCard
                title="成员总数（个）"
                value="128"
                valueColor="#722ed1"
                subs={[
                  { label: '昨日新增', value: '233,322' },
                  { label: '今日新增', value: '233,322' },
                ]}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <KpiCard
                title="今日参与（个）"
                value="74"
                valueColor="#52c41a"
                subs={[
                  { label: '昨日参与', value: '233,322' },
                  { label: '七日参与', value: '233,322' },
                ]}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <KpiCard
                title="今日活跃（个）"
                value="62"
                valueColor="#1677ff"
                subs={[
                  { label: '昨日活跃', value: '233,322' },
                  { label: '七日活跃', value: '233,322' },
                ]}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <KpiCard
                title="今日离开（个）"
                value="3"
                valueColor="#ff4d4f"
                subs={[
                  { label: '昨日离开', value: '233,322' },
                  { label: '历史离开', value: '233,322' },
                ]}
              />
            </Col>
          </Row>

          {/* 趋势图 2×2 */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <MiniLineChart title="企业总资产" data={totalAssetsData} color="#722ed1" />
            </Col>
            <Col xs={24} lg={12}>
              <MiniLineChart title="企业流水" data={flowData} color="#fa8c16" />
            </Col>
            <Col xs={24} lg={12}>
              <MiniLineChart title="企业成员" data={membersData} color="#1677ff" />
            </Col>
            <Col xs={24} lg={12}>
              <MiniLineChart title="参与成员" data={participantsData} color="#52c41a" />
            </Col>
          </Row>
        </div>
      ),
    },

    // ── 成员清单 ─────────────────────────────────────────────────
    {
      key: 'members',
      label: '成员清单',
      children: (() => {
        const [memberStatus, setMemberStatus] = useState('all');
        const [memberSearch, setMemberSearch] = useState('');

        const memberColumns: ColumnsType<Member> = [
          { title: '加入时间', dataIndex: 'joinTime', width: 120 },
          { title: '成员ID', dataIndex: 'id', width: 100 },
          { title: '成员昵称', dataIndex: 'nickname', width: 90 },
          { title: '上级ID', dataIndex: 'parentId', width: 100 },
          { title: '上级昵称', dataIndex: 'parentNickname', width: 90 },
          { title: '参与场次', dataIndex: 'sessions', width: 80, align: 'right' },
          { title: '邀请人数', dataIndex: 'invited', width: 80, align: 'right' },
          {
            title: '总盈亏', dataIndex: 'totalPnl', width: 120, align: 'right',
            render: (v: string) => <Text style={{ color: v.startsWith('-') ? '#ff4d4f' : '#52c41a' }}>{v}</Text>,
          },
          { title: '收到返佣', dataIndex: 'rebate', width: 100, align: 'right' },
          { title: '企业红包盈亏', dataIndex: 'redPacket', width: 110, align: 'right' },
          {
            title: '东方彩票盈亏', dataIndex: 'lottery', width: 110, align: 'right',
            render: (v: string) => <Text style={{ color: v.startsWith('-') ? '#ff4d4f' : '#52c41a' }}>{v}</Text>,
          },
          {
            title: '成员状态', dataIndex: 'status', width: 90,
            render: (v) => <Tag color={v === '正常' ? 'success' : 'default'}>{v}</Tag>,
          },
          {
            title: '操作', width: 80, fixed: 'right' as const,
            render: () => <Button type="link" size="small" style={{ padding: 0 }}>详情</Button>,
          },
        ];

        const filteredMembers = memberData.filter((d) => {
          const matchStatus = memberStatus === 'all' || d.status === memberStatus;
          const matchSearch = !memberSearch || d.nickname.includes(memberSearch) || d.id.includes(memberSearch);
          return matchStatus && matchSearch;
        });

        return (
          <Card bordered={false}>
            <Space size={16} wrap align="center" style={{ marginBottom: 16 }}>
              <ConfigProvider theme={radioTheme}>
                <Radio.Group
                  value={memberStatus}
                  onChange={(e) => setMemberStatus(e.target.value)}
                  buttonStyle="solid"
                >
                  <Radio.Button value="all">全部</Radio.Button>
                  <Radio.Button value="正常">正常</Radio.Button>
                  <Radio.Button value="已退">已退</Radio.Button>
                </Radio.Group>
              </ConfigProvider>
              <Input
                suffix={<SearchOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
                placeholder="搜索成员昵称 / 成员ID"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                allowClear
                style={{ width: 200 }}
              />
            </Space>
            <Table columns={memberColumns} dataSource={filteredMembers} rowKey="id" size="middle"
              scroll={{ x: 1400 }} pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }} />
          </Card>
        );
      })(),
    },

    // ── 股东清单 ─────────────────────────────────────────────────
    {
      key: 'shareholders',
      label: '股东清单',
      children: (() => {
        const [shStatus, setShStatus] = useState('all');

        const shareholderColumns: ColumnsType<Shareholder> = [
          { title: '入股时间', dataIndex: 'joinTime', width: 170 },
          { title: '股东ID', dataIndex: 'id', width: 100 },
          { title: '昵称', dataIndex: 'nickname', width: 90 },
          { title: '持股数量', dataIndex: 'shares', width: 100, align: 'right' },
          { title: '持股比例', dataIndex: 'ratio', width: 90, align: 'right' },
          { title: '股东收入', dataIndex: 'income', width: 110, align: 'right' },
          { title: '股份总收益', dataIndex: 'totalRevenue', width: 110, align: 'right' },
          { title: '股东支出', dataIndex: 'expenditure', width: 110, align: 'right' },
          { title: '已缴税费', dataIndex: 'taxPaid', width: 100, align: 'right' },
          {
            title: '状态', dataIndex: 'status', width: 90,
            render: (v) => <Tag color={v === '正常' ? 'success' : 'default'}>{v}</Tag>,
          },
        ];

        const filtered = shareholderData.filter((d) =>
          shStatus === 'all' || d.status === shStatus
        );

        return (
          <Card bordered={false}>
            <ConfigProvider theme={radioTheme}>
              <Radio.Group
                value={shStatus}
                onChange={(e) => setShStatus(e.target.value)}
                buttonStyle="solid"
                style={{ marginBottom: 16 }}
              >
                <Radio.Button value="all">全部</Radio.Button>
                <Radio.Button value="正常">正常</Radio.Button>
                <Radio.Button value="已退">已退</Radio.Button>
              </Radio.Group>
            </ConfigProvider>
            <Table columns={shareholderColumns} dataSource={filtered} rowKey="id" size="middle"
              scroll={{ x: 1000 }} pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }} />
          </Card>
        );
      })(),
    },

    // ── 投资分红 ─────────────────────────────────────────────────
    {
      key: 'dividend',
      label: '投资分红',
      children: (() => {
        const [divType, setDivType] = useState('all');
        const [divRange, setDivRange] = useState<[Dayjs, Dayjs] | null>(null);

        const dividendColumns: ColumnsType<Dividend> = [
          { title: '订单编号', dataIndex: 'orderId', width: 140 },
          {
            title: '订单类型', dataIndex: 'orderType', width: 90,
            render: (v) => <Tag color={v === '分红' ? 'purple' : 'blue'}>{v}</Tag>,
          },
          { title: '订单金额', dataIndex: 'amount', width: 120, align: 'right' },
          { title: '实缴税费', dataIndex: 'taxPaid', width: 110, align: 'right' },
          { title: '股东数量', dataIndex: 'shareholderCount', width: 80, align: 'right' },
          { title: '完成时间', dataIndex: 'completedAt', width: 170 },
        ];

        const filtered = dividendData.filter((d) =>
          (divType === 'all' || d.orderType === divType) &&
          inRange(d.completedAt, divRange)
        );

        return (
          <Card bordered={false}>
            <Space size={16} wrap align="center" style={{ marginBottom: 16 }}>
              <ConfigProvider theme={radioTheme}>
                <Radio.Group
                  value={divType}
                  onChange={(e) => setDivType(e.target.value)}
                  buttonStyle="solid"
                >
                  <Radio.Button value="all">全部</Radio.Button>
                  <Radio.Button value="分红">分红</Radio.Button>
                  <Radio.Button value="投资">投资</Radio.Button>
                </Radio.Group>
              </ConfigProvider>
              <RangePicker onChange={(v) => setDivRange(v as [Dayjs, Dayjs] | null)} />
            </Space>
            <Table columns={dividendColumns} dataSource={filtered} rowKey="orderId" size="middle"
              pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }} />
          </Card>
        );
      })(),
    },

    // ── 股份交易 ─────────────────────────────────────────────────
    {
      key: 'sharesTrade',
      label: '股份交易',
      children: (() => {
        const [stOrderType, setStOrderType] = useState('all');
        const [stSearch, setStSearch] = useState('');
        const [stShareholder, setStShareholder] = useState<string | undefined>();
        const [stRange, setStRange] = useState<[Dayjs, Dayjs] | null>(null);

        const shareTradeColumns: ColumnsType<ShareTrade> = [
          { title: '订单编号', dataIndex: 'orderId', width: 140 },
          {
            title: '交易方向', dataIndex: 'direction', width: 90,
            render: (v) => <Tag color={v === '买入' ? 'success' : 'error'}>{v}</Tag>,
          },
          { title: '订单时间', dataIndex: 'tradeTime', width: 170 },
          { title: '股东ID', dataIndex: 'shareholderId', width: 100 },
          { title: '股东昵称', dataIndex: 'shareholderName', width: 90 },
          { title: '实缴税费', dataIndex: 'taxPaid', width: 110, align: 'right' },
          { title: '企业总资产快照', dataIndex: 'totalAssetsSnapshot', width: 140, align: 'right' },
        ];

        const filtered = shareTradeData.filter((d) => {
          const matchType = stOrderType === 'all' || d.orderType === stOrderType;
          const matchSearch = !stSearch || d.orderId.includes(stSearch) || d.shareholderId.includes(stSearch);
          const matchShareholder = !stShareholder || d.shareholderId === stShareholder;
          return matchType && matchSearch && matchShareholder && inRange(d.tradeTime, stRange);
        });

        return (
          <Card bordered={false}>
            <Space size={16} wrap align="center" style={{ marginBottom: 16 }}>
              <ConfigProvider theme={radioTheme}>
                <Radio.Group
                  value={stOrderType}
                  onChange={(e) => setStOrderType(e.target.value)}
                  buttonStyle="solid"
                >
                  <Radio.Button value="all">全部</Radio.Button>
                  <Radio.Button value="转让">转让</Radio.Button>
                  <Radio.Button value="回购">回购</Radio.Button>
                  <Radio.Button value="增发">增发</Radio.Button>
                </Radio.Group>
              </ConfigProvider>
              <RangePicker onChange={(v) => setStRange(v as [Dayjs, Dayjs] | null)} />
              <Select
                placeholder="选择股东"
                style={{ width: 140 }}
                allowClear
                value={stShareholder}
                onChange={setStShareholder}
                options={shareholderData.map((s) => ({ value: s.id, label: `${s.nickname}(${s.id})` }))}
              />
              <Input
                suffix={<SearchOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
                placeholder="搜索订单编号 / 股东ID"
                value={stSearch}
                onChange={(e) => setStSearch(e.target.value)}
                allowClear
                style={{ width: 200 }}
              />
            </Space>
            <Table columns={shareTradeColumns} dataSource={filtered} rowKey="orderId" size="middle"
              scroll={{ x: 1000 }} pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }} />
          </Card>
        );
      })(),
    },

    // ── 开通应用 ─────────────────────────────────────────────────
    {
      key: 'apps',
      label: '开通应用',
      children: (() => {
        const [appRange, setAppRange] = useState<[Dayjs, Dayjs] | null>(null);

        const appColumns: ColumnsType<AppItem> = [
          {
            title: '应用名称', dataIndex: 'name', width: 120,
            render: (v) => (
              <Space size={8}>
                <AppstoreOutlined style={{ color: '#722ed1' }} />
                <Text>{v}</Text>
              </Space>
            ),
          },
          { title: '余额', dataIndex: 'balance', width: 120, align: 'right' },
          { title: '返佣金额', dataIndex: 'rebateAmt', width: 110, align: 'right' },
          { title: '开通时间', dataIndex: 'enabledAt', width: 120 },
          { title: '更新时间', dataIndex: 'updatedAt', width: 120 },
          {
            title: '应用状态', dataIndex: 'appStatus', width: 100,
            render: (v) => <Tag color={v === '已开通' ? 'success' : 'default'}>{v}</Tag>,
          },
        ];

        const filteredApps = appsData.filter((d) => inRange(d.enabledAt, appRange));

        return (
          <Card bordered={false}>
            <Space style={{ marginBottom: 16 }}>
              <RangePicker
                placeholder={['开通开始时间', '开通结束时间']}
                onChange={(v) => setAppRange(v as [Dayjs, Dayjs] | null)}
              />
            </Space>
            <Table columns={appColumns} dataSource={filteredApps} rowKey="id" size="middle"
              pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }} />
          </Card>
        );
      })(),
    },

    // ── 企业红包 ─────────────────────────────────────────────────
    {
      key: 'redpacket',
      label: '企业红包',
      children: (() => {
        const [rpStatus, setRpStatus] = useState('all');

        const redPacketColumns: ColumnsType<RedPacket> = [
          { title: '发起时间', dataIndex: 'startTime', width: 170 },
          { title: '发包金额', dataIndex: 'amount', width: 110, align: 'right' },
          { title: '领包用户', dataIndex: 'recipient', width: 100 },
          { title: '完成时间', dataIndex: 'completedAt', width: 170 },
          { title: '企业收益', dataIndex: 'enterpriseRevenue', width: 110, align: 'right' },
          {
            title: '红包状态', dataIndex: 'status', width: 90,
            render: (v) => (
              <Tag color={v === '已完成' ? 'success' : v === '进行中' ? 'processing' : 'default'}>{v}</Tag>
            ),
          },
        ];

        const filtered = redPacketData.filter((d) =>
          rpStatus === 'all' || d.status === rpStatus
        );

        return (
          <Card bordered={false}>
            <ConfigProvider theme={radioTheme}>
              <Radio.Group
                value={rpStatus}
                onChange={(e) => setRpStatus(e.target.value)}
                buttonStyle="solid"
                style={{ marginBottom: 16 }}
              >
                <Radio.Button value="all">全部</Radio.Button>
                <Radio.Button value="已完成">已完成</Radio.Button>
                <Radio.Button value="进行中">进行中</Radio.Button>
                <Radio.Button value="已过期">已过期</Radio.Button>
              </Radio.Group>
            </ConfigProvider>
            <Table columns={redPacketColumns} dataSource={filtered} rowKey="id" size="middle"
              pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }} />
          </Card>
        );
      })(),
    },

    // ── 东方彩票 ─────────────────────────────────────────────────
    {
      key: 'lottery',
      label: '东方彩票',
      children: (() => {
        const [ltStatus, setLtStatus] = useState('all');
        const [ltRange, setLtRange] = useState<[Dayjs, Dayjs] | null>(null);

        const lotteryColumns: ColumnsType<LotteryOrder> = [
          { title: '发起时间', dataIndex: 'startTime', width: 170 },
          { title: '下注人ID', dataIndex: 'bettorId', width: 100 },
          { title: '下注人昵称', dataIndex: 'bettorName', width: 100 },
          { title: '游戏', dataIndex: 'game', width: 80 },
          { title: '游戏期数', dataIndex: 'period', width: 90 },
          { title: '订单编号', dataIndex: 'orderId', width: 130 },
          { title: '订单金额', dataIndex: 'orderAmt', width: 110, align: 'right' },
          { title: '完成时间', dataIndex: 'completedAt', width: 170 },
          {
            title: '企业盈亏', dataIndex: 'pnl', width: 110, align: 'right',
            render: (v: string) => <Text style={{ color: v.startsWith('-') ? '#ff4d4f' : '#52c41a' }}>{v}</Text>,
          },
          {
            title: '订单状态', dataIndex: 'status', width: 90,
            render: (v) => (
              <Tag color={v === '已结算' ? 'success' : v === '结算中' ? 'processing' : 'warning'}>{v}</Tag>
            ),
          },
          { title: '赔付金额', dataIndex: 'payoutAmt', width: 110, align: 'right' },
          { title: '订单备注', dataIndex: 'remark', width: 100 },
        ];

        const filtered = lotteryData.filter((d) =>
          (ltStatus === 'all' || d.status === ltStatus) &&
          inRange(d.startTime, ltRange)
        );

        return (
          <Card bordered={false}>
            <Space size={16} wrap align="center" style={{ marginBottom: 16 }}>
              <ConfigProvider theme={radioTheme}>
                <Radio.Group
                  value={ltStatus}
                  onChange={(e) => setLtStatus(e.target.value)}
                  buttonStyle="solid"
                >
                  <Radio.Button value="all">全部</Radio.Button>
                  <Radio.Button value="未结算">未结算</Radio.Button>
                  <Radio.Button value="结算中">结算中</Radio.Button>
                  <Radio.Button value="已结算">已结算</Radio.Button>
                </Radio.Group>
              </ConfigProvider>
              <RangePicker onChange={(v) => setLtRange(v as [Dayjs, Dayjs] | null)} />
            </Space>
            <Table columns={lotteryColumns} dataSource={filtered} rowKey="id" size="middle"
              scroll={{ x: 1400 }} pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }} />
          </Card>
        );
      })(),
    },

    // ── 佣金订单 ─────────────────────────────────────────────────
    {
      key: 'commission',
      label: '佣金订单',
      children: (() => {
        const [commSearch, setCommSearch] = useState('');
        const [commRange, setCommRange] = useState<[Dayjs, Dayjs] | null>(null);

        const commissionColumns: ColumnsType<CommissionOrder> = [
          { title: '订单时间', dataIndex: 'createdAt', width: 170 },
          { title: '订单编号', dataIndex: 'orderId', width: 140 },
          { title: '应用名称', dataIndex: 'appName', width: 110 },
          { title: '游戏', dataIndex: 'game', width: 90 },
          { title: '企业支出佣金', dataIndex: 'commission', width: 130, align: 'right' },
          {
            title: '操作', width: 80, fixed: 'right' as const,
            render: () => <Button type="link" size="small" style={{ padding: 0 }}>详情</Button>,
          },
        ];

        const filtered = commissionData.filter((d) =>
          (!commSearch || d.orderId.includes(commSearch) || d.appName.includes(commSearch)) &&
          inRange(d.createdAt, commRange)
        );

        return (
          <Card bordered={false}>
            <Space size={16} wrap align="center" style={{ marginBottom: 16 }}>
              <RangePicker onChange={(v) => setCommRange(v as [Dayjs, Dayjs] | null)} />
              <Input
                suffix={<SearchOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
                placeholder="搜索订单编号 / 应用名称"
                value={commSearch}
                onChange={(e) => setCommSearch(e.target.value)}
                allowClear
                style={{ width: 210 }}
              />
            </Space>
            <Table columns={commissionColumns} dataSource={filtered} rowKey="orderId" size="middle"
              pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }} />
          </Card>
        );
      })(),
    },
  ];

  return (
    <div>
      <Card bordered={false} style={{ marginBottom: 16, boxShadow: CARD_SHADOW }}>
        <Space size={24} wrap>
          <Space size={4}>
            <Text type="secondary">企业 ID：</Text>
            <Text strong>{id}</Text>
          </Space>
          {enterpriseInfo && (
            <>
              <Space size={4}>
                <Text type="secondary">企业名称：</Text>
                <Text strong>{enterpriseInfo.name}</Text>
              </Space>
              <Space size={4}>
                <Text type="secondary">归属公司：</Text>
                <Text>{enterpriseInfo.company}</Text>
              </Space>
              <Tag color={enterpriseInfo.certStatus === '已订阅' ? 'success' : 'error'}>{enterpriseInfo.certStatus}</Tag>
              <Tag color={enterpriseInfo.status === '正常' ? 'success' : 'default'}>{enterpriseInfo.status}</Tag>
            </>
          )}
        </Space>
      </Card>
      <Tabs items={tabItems} type="card" />
    </div>
  );
};

export default EnterpriseDetail;
