import { AppstoreOutlined, InfoCircleOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Line } from '@ant-design/plots';
import {
  Button,
  Card,
  Col,
  ConfigProvider,
  DatePicker,
  Descriptions,
  Divider,
  Input,
  Modal,
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
import dayjs, { Dayjs } from 'dayjs';
import React, { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'umi';
import FilterField from '../../../components/FilterField';

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

const mk = (n: number) => Array.from({ length: n }, (_, i) => i);

// ── 企业查找表（根据路由 id 展示基本信息）────────────────────────────
const ENTERPRISE_MAP: Record<string, { name: string; certStatus: '已订阅' | '已过期'; company: string; status: '正常' | '已解散' }> = {
  '283982': { name: 'hey',      certStatus: '已订阅', company: 'UU Talk',    status: '正常'   },
  '283983': { name: 'UUtalk',   certStatus: '已订阅', company: 'Hey Talk',   status: '正常'   },
  '283984': { name: 'CyberBot', certStatus: '已过期', company: '炸雷第一波',  status: '正常'   },
  '283985': { name: 'StarTech', certStatus: '已订阅', company: 'UU Talk',    status: '正常'   },
  '283986': { name: 'GoldLink', certStatus: '已订阅', company: 'Hey Talk',   status: '已解散' },
};

const ENTERPRISES = Object.entries(ENTERPRISE_MAP).map(([k, v]) => ({ value: k, label: v.name }));

// ── 日期范围筛选辅助 ──────────────────────────────────────────────
const inRange = (dateStr: string, range: [Dayjs, Dayjs] | null) => {
  if (!range || !dateStr || dateStr === '—') return true;
  const d = dayjs(dateStr);
  return !d.isBefore(range[0].startOf('day')) && !d.isAfter(range[1].endOf('day'));
};

// ── 企业概览折线图数据（最近30天）──────────────────────────────────
const OV_BASE = new Date('2026-04-08');
const OV_DAYS = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(OV_BASE);
  d.setDate(d.getDate() - 29 + i);
  return d.toISOString().slice(0, 10);
});
const mkOvDay = (base: number, amp: number, trend: number, phase: number) =>
  OV_DAYS.map((date, i) => ({
    date,
    value: Math.round(base + amp * Math.sin((i / 30) * Math.PI * 4 + phase) + trend * (i / 30)),
  }));
const totalAssetsData    = mkOvDay(220000, 8000, 5000, 0);
const flowData           = mkOvDay(85000, 3000, 2000, 1);
const membersData        = mkOvDay(120, 15, 10, 0.5);
const participantsData   = mkOvDay(62, 12, 8, 2);

// KPI 卡片组件（与仪表盘统一）
const KpiCard: React.FC<{
  title: string;
  value: string | number;
  valueColor?: string;
  subs: Array<{ label: string; value?: string | number }>;
  tooltip?: string;
}> = ({ title, value, subs, tooltip }) => (
  <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW, height: '100%' }}
    styles={{ body: { padding: '20px 24px' } }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <Text style={{ fontSize: 14, color: 'rgba(0,0,0,0.45)' }}>{title}</Text>
      {tooltip && (
        <Tooltip title={tooltip}>
          <InfoCircleOutlined style={{ fontSize: 12, color: 'rgba(0,0,0,0.3)', cursor: 'help' }} />
        </Tooltip>
      )}
    </div>
    <div style={{ marginTop: 12 }}>
      <span style={{ fontSize: 30, fontWeight: 700, color: '#141414', letterSpacing: -0.5 }}>{value}</span>
    </div>
    {subs.length > 0 && (
      <>
        <Divider style={{ margin: '16px 0 12px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {subs.map((s) => (
            <Text key={s.label} style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>
              {s.label} <span style={{ color: 'rgba(0,0,0,0.65)' }}>{s.value}</span>
            </Text>
          ))}
        </div>
      </>
    )}
  </Card>
);

// 迷你折线图组件
const MiniLineChart: React.FC<{ title: string; data: { date: string; value: number }[] }> = ({
  title,
  data,
}) => {
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const filtered = data.filter((d) => inRange(d.date, range));
  return (
    <Card
      bordered={false}
      style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}
      title={title}
      extra={
        <RangePicker
          size="small"
          onChange={(v) => setRange(v as [Dayjs, Dayjs] | null)}
        />
      }
    >
      <Line
        data={filtered}
        xField="date"
        yField="value"
        shapeField="smooth"
        height={180}
        autoFit
        style={{ stroke: '#1677ff', lineWidth: 2 }}
        point={{ shape: 'circle', size: 4, style: { fill: '#fff', stroke: '#1677ff', lineWidth: 2 } }}
        axis={{
          x: { labelFontSize: 10, labelAutoRotate: false, labelFormatter: (v: string) => v.slice(5), tickFilter: (_: string, index: number) => index % 2 === 0, grid: null, line: null },
          y: { labelFontSize: 11, grid: true, gridLineDash: [4, 4], gridStroke: 'rgba(0,0,0,0.1)', line: null, tick: null },
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
  enabledAt: string; updatedAt: string; appStatus: '已订阅' | '取消订阅';
}
const appsData: AppItem[] = [
  { id: 1, name: 'UU Talk',   balance: '12,340.00', rebateAmt: '3,200.00', enabledAt: '2025-10-01', updatedAt: '2026-02-15', appStatus: '已订阅' },
  { id: 2, name: 'Hey Talk',  balance: '8,760.00',  rebateAmt: '1,800.00', enabledAt: '2025-11-15', updatedAt: '2026-03-01', appStatus: '已订阅' },
  { id: 3, name: 'Star Game', balance: '0.00',      rebateAmt: '0.00',     enabledAt: '—',          updatedAt: '—',          appStatus: '取消订阅' },
  { id: 4, name: 'Lucky Bet', balance: '5,230.00',  rebateAmt: '920.00',   enabledAt: '2026-01-20', updatedAt: '2026-03-10', appStatus: '已订阅' },
];

// ── 股份交易 ───────────────────────────────────────────────────────
type ShareTradeType = '购买股份' | '释放股份' | '转让股份';
interface ShareTrade {
  orderId: string;
  orderTime: string;
  orderType: ShareTradeType;
  initiator: string;      // 交易方显示名（发起者）
  initiatorType: 'platform' | 'shareholder';
  receiver: string;       // 受让方显示名（被动方）
  receiverType: 'platform' | 'shareholder';
  changeRatio: string;   // 变动比例
  amount: string;        // 金额
  actualTax: string;     // 实缴税费
  assetSnapshot: string; // 企业总资产快照
}
const COMPANY_NAME = '环球集团';
const shareTradeData: ShareTrade[] = [
  ...mk(3).map((i): ShareTrade => ({
    orderId: `ST${String(i + 1).padStart(7, '0')}`,
    orderTime: `2026-03-${String(i + 1).padStart(2, '0')} 14:${String(i * 7).padStart(2, '0')}:00`,
    orderType: '购买股份',
    initiator: `${['张三', '李四', '王五'][i]}(user_${20000 + i})`,
    initiatorType: 'shareholder',
    receiver: COMPANY_NAME,
    receiverType: 'platform',
    changeRatio: `${(2 + i * 0.5).toFixed(1)}%`,
    amount: `${(50000 + i * 12000).toLocaleString()}.00`,
    actualTax: `${(300 + i * 80).toLocaleString()}.00`,
    assetSnapshot: `${(800000 + i * 12000).toLocaleString()}.00`,
  })),
  ...mk(3).map((i): ShareTrade => ({
    orderId: `ST${String(i + 4).padStart(7, '0')}`,
    orderTime: `2026-03-${String(i + 5).padStart(2, '0')} 10:${String(i * 12).padStart(2, '0')}:00`,
    orderType: '释放股份',
    initiator: `${['赵六', '孙七', '周八'][i]}(user_${20003 + i})`,
    initiatorType: 'shareholder',
    receiver: COMPANY_NAME,
    receiverType: 'platform',
    changeRatio: `${(1.5 + i * 0.8).toFixed(1)}%`,
    amount: `${(30000 + i * 8000).toLocaleString()}.00`,
    actualTax: `${(200 + i * 60).toLocaleString()}.00`,
    assetSnapshot: `${(810000 + i * 15000).toLocaleString()}.00`,
  })),
  ...mk(2).map((i): ShareTrade => ({
    orderId: `ST${String(i + 7).padStart(7, '0')}`,
    orderTime: `2026-03-${String(i + 9).padStart(2, '0')} 16:${String(i * 20).padStart(2, '0')}:00`,
    orderType: '转让股份',
    initiator: `${['张三', '李四'][i]}(user_${20000 + i})`,
    initiatorType: 'shareholder',
    receiver: `${['孙七', '周八'][i]}(user_${20004 + i})`,
    receiverType: 'shareholder',
    changeRatio: `${(1.0 + i * 0.3).toFixed(1)}%`,
    amount: `${(20000 + i * 5000).toLocaleString()}.00`,
    actualTax: `${(150 + i * 40).toLocaleString()}.00`,
    assetSnapshot: `${(820000 + i * 10000).toLocaleString()}.00`,
  })),
];

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

// ── 踩雷红包 ───────────────────────────────────────────────────────
interface RedPacket {
  id: string; startTime: string; orderId: string; senderId: string; senderNickname: string;
  groupId: string; groupName: string; amount: string; quantity: number; mineCount: number;
  payoutAmt: string; recipient: number; enterpriseRevenue: string;
  completedAt: string; status: '已完成' | '进行中' | '已过期'; remark: string;
}
const redPacketData: RedPacket[] = mk(6).map((i) => ({
  id: `RP${String(i + 1).padStart(5, '0')}`,
  startTime: `2026-03-${String(i + 1).padStart(2, '0')} 10:00:00`,
  orderId: `RPO${String(2026030100 + i)}`,
  senderId: `MB${100000 + i}`,
  senderNickname: `用户${i + 1}`,
  groupId: `GRP${1000 + i}`,
  groupName: `群组${i + 1}`,
  amount: `${(100 + i * 50).toLocaleString()}.00`,
  quantity: 5 + i,
  mineCount: i % 3 + 1,
  payoutAmt: `${(80 + i * 30).toLocaleString()}.00`,
  recipient: 3 + (i % 4),
  enterpriseRevenue: `${(20 + i * 10).toLocaleString()}.00`,
  completedAt: i % 3 === 2 ? '—' : `2026-03-${String(i + 1).padStart(2, '0')} 12:00:00`,
  status: (['已完成', '进行中', '已过期'] as const)[i % 3],
  remark: i % 2 === 0 ? '常规红包' : '—',
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

// ── 牛牛红包 ───────────────────────────────────────────────────────
// 三层数据：主订单（NiuniuOrder） → 领取记录（NiuniuClaim） / 返佣记录（NiuniuRebate）
// 返佣链路：庄家发起红包 → 下级用户领取 → 系统按比例返佣给该下级的「上级」（推荐人）
type NiuniuPlay = '庄比' | '通比';
type NiuniuStatus = '已开奖' | '未开奖';
type NiuniuFace = '牛牛' | '牛一' | '牛八';

interface NiuniuOrder {
  id: string;
  startTime: string;
  orderId: string;
  status: NiuniuStatus;
  baseBet: string;
  packetCount: number;
  play: NiuniuPlay;
  odds: string;
  validDuration: 30 | 60; // 秒，仅 30 / 60
  payoutAmt: string;
  rakeAmt: string;
  rebateAmt: string;
  bankerNickname: string;
  bankerId: string;
  completedAt: string;
}

interface NiuniuClaim {
  claimId: string;
  claimTime: string;
  claimOrderId: string;
  userNickname: string;
  userId: string;
  userIp: string;
  claimAmount: string;
  face: NiuniuFace;
  roundPnl: string; // 本局盈亏（原"牌面盈亏"）
  arrival: string;  // 到账
  rake: string;     // 抽水
}

interface NiuniuRebate {
  rebateId: string;
  createdAt: string;
  rebateUserNickname: string;
  rebateUserId: string;
  parentNickname: string;
  parentId: string;
  rebateAmt: string;
}

const NIUNIU_PLAYS: NiuniuPlay[] = ['庄比', '通比'];
const NIUNIU_FACES: NiuniuFace[] = ['牛牛', '牛一', '牛八'];
const NIUNIU_ODDS = ['平倍', '高倍', '超倍'] as const;
const NIUNIU_VALID_DURATIONS: (30 | 60)[] = [30, 60];

const niuniuData: NiuniuOrder[] = mk(10).map((i) => ({
  id: `NN${String(i + 1).padStart(5, '0')}`,
  startTime: `2026-04-${String(i + 1).padStart(2, '0')} 10:${String(15 + i).padStart(2, '0')}:00`,
  orderId: `NNO${String(2026040100 + i)}`,
  status: i % 3 === 0 ? '未开奖' : '已开奖',
  baseBet: `${(10 + i * 5).toLocaleString()}.00`,
  packetCount: 5 + (i % 5),
  play: NIUNIU_PLAYS[i % 2],
  odds: NIUNIU_ODDS[i % 3],
  validDuration: NIUNIU_VALID_DURATIONS[i % 2],
  payoutAmt: `${(80 + i * 30).toLocaleString()}.00`,
  rakeAmt: `${(5 + i * 2).toLocaleString()}.00`,
  rebateAmt: `${(8 + i * 3).toLocaleString()}.00`,
  bankerNickname: `庄家${i + 1}`,
  bankerId: `MB${200000 + i}`,
  completedAt: i % 3 === 0 ? '—' : `2026-04-${String(i + 1).padStart(2, '0')} 10:${String(15 + i + 1).padStart(2, '0')}:00`,
}));

const buildNiuniuClaims = (order: NiuniuOrder): NiuniuClaim[] =>
  Array.from({ length: order.packetCount }, (_, i) => ({
    claimId: `NC${order.id}-${i + 1}`,
    claimTime: order.startTime.replace(/(\d{2}):(\d{2}):00/, (_m, h, _mm) => `${h}:${String(15 + i + 1).padStart(2, '0')}:00`),
    claimOrderId: `NCO${order.orderId.slice(-7)}${String(i + 1).padStart(2, '0')}`,
    userNickname: `用户${i + 10}`,
    userId: `MB${300000 + i}`,
    userIp: `104.${28 + i}.${200 + i}.${i + 10}`,
    claimAmount: `${(Number(order.baseBet.replace(/,/g, '')) / order.packetCount).toFixed(2)}`,
    face: NIUNIU_FACES[i % 3],
    roundPnl: i % 2 === 0 ? `${(20 + i * 5).toFixed(2)}` : `-${(15 + i * 4).toFixed(2)}`,
    arrival: `${(Number(order.baseBet.replace(/,/g, '')) / order.packetCount * 1.5).toFixed(2)}`,
    rake: `${(0.5 + i * 0.2).toFixed(2)}`,
  }));

const buildNiuniuRebates = (order: NiuniuOrder): NiuniuRebate[] =>
  Array.from({ length: 3 }, (_, i) => ({
    rebateId: `NR${order.id}-${i + 1}`,
    createdAt: order.completedAt === '—' ? order.startTime : order.completedAt,
    rebateUserNickname: `用户${i + 10}（${i % 2 === 0 ? '庄' : '闲'}）`,
    rebateUserId: `MB${300000 + i}`,
    parentNickname: `上级${i + 1}`,
    parentId: `MB${400000 + i}`,
    rebateAmt: `${(2 + i * 1.5).toFixed(2)}`,
  }));

// ── 应用费用 ───────────────────────────────────────────────────────
// 三项明细枚举：东方彩票、七星百家乐、企业红包
type AppFeeOrderType = '应用结算' | '主动分红';
interface AppFeeBreakdown {
  lottery: number;       // 东方彩票
  baccarat: number;      // 七星百家乐
  redpacket: number;     // 企业红包
}
interface AppFeeOrder {
  id: string;
  createdAt: string;
  orderId: string;
  orderType: AppFeeOrderType;
  appFeeTotal: number;
  enterpriseProfitDetail: AppFeeBreakdown;
  appFeeDetail: AppFeeBreakdown;
  billingPeriodStart: string; // YYYY-MM-DD HH:mm:ss
  billingPeriodEnd: string;   // YYYY-MM-DD HH:mm:ss
}

const APP_FEE_TYPES: AppFeeOrderType[] = ['应用结算', '主动分红'];

const appFeeData: AppFeeOrder[] = mk(12).map((i) => {
  const day = String((i % 28) + 1).padStart(2, '0');
  const month = i % 2 === 0 ? '03' : '04';
  // 上一日的 00:00:00 ~ 当日的 00:00:00（自然日账单周期）
  const prevDay = String(((i % 28) + 1) === 1 ? 28 : (i % 28)).padStart(2, '0');
  const prevMonth = ((i % 28) + 1) === 1 ? (i % 2 === 0 ? '02' : '03') : month;
  const profit: AppFeeBreakdown = {
    lottery: 1000 + i * 80,
    baccarat: 600 + i * 50,
    redpacket: 200 + i * 30,
  };
  const fee: AppFeeBreakdown = {
    lottery: profit.lottery * 0.05,
    baccarat: profit.baccarat * 0.05,
    redpacket: profit.redpacket * 0.05,
  };
  return {
    id: `AF${String(i + 1).padStart(5, '0')}`,
    createdAt: `2026-${month}-${day} 09:${String(15 + i).padStart(2, '0')}:00`,
    orderId: `AF${String(20260301 + i)}`,
    orderType: APP_FEE_TYPES[i % 2],
    appFeeTotal: fee.lottery + fee.baccarat + fee.redpacket,
    enterpriseProfitDetail: profit,
    appFeeDetail: fee,
    billingPeriodStart: `2026-${prevMonth}-${prevDay} 00:00:00`,
    billingPeriodEnd: `2026-${month}-${day} 00:00:00`,
  };
});

const formatMoney = (v: number) => v.toFixed(2);
const formatBreakdown = (b: AppFeeBreakdown) =>
  `东方彩票 ${formatMoney(b.lottery)} / 七星百家乐 ${formatMoney(b.baccarat)} / 企业红包 ${formatMoney(b.redpacket)}`;

// ── 主组件 ────────────────────────────────────────────────────────
const EnterpriseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const enterpriseInfo = ENTERPRISE_MAP[id ?? ''];
  const [currency, setCurrency] = useState('USDT');
  const currentEnterprise = ENTERPRISES.find((e) => e.value === id) ?? ENTERPRISES[0];

  const tabItems = [
    // ── 企业概览 ─────────────────────────────────────────────────
    {
      key: 'overview',
      label: '企业概览',
      children: (
        <div>
          {/* 顶部工具栏 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            <Space size={6}>
              <Text type="secondary" style={{ fontSize: 12 }}>数据更新时间：2025-11-02 12:33:02</Text>
              <ReloadOutlined style={{ color: '#1677ff', cursor: 'pointer', fontSize: 13 }} />
            </Space>
            <div style={{ flex: 1 }} />
            <Space size={4}>
              <Text type="secondary" style={{ fontSize: 12 }}>企业ID：</Text>
              <Text style={{ fontSize: 12, fontFamily: 'monospace', color: '#141414' }}>{id}</Text>
              <Text type="secondary" style={{ fontSize: 12, marginLeft: 12 }}>企业名称：</Text>
              <Text style={{ fontSize: 12, fontWeight: 600 }}>{enterpriseInfo?.name}</Text>
              <Text type="secondary" style={{ fontSize: 12, marginLeft: 12 }}>归属公司：</Text>
              <Text style={{ fontSize: 12, fontWeight: 600 }}>{enterpriseInfo?.company}</Text>
              {enterpriseInfo && (
                <Tag color={enterpriseInfo.status === '正常' ? 'success' : 'default'} style={{ marginLeft: 8 }}>{enterpriseInfo.status}</Tag>
              )}
            </Space>
          </div>

          {/* KPI 卡片 */}
          <div className="kpi-grid" style={{ marginBottom: 16 }}>
              <KpiCard title="企业总资产（USDT）" value="234,560.00"
                subs={[{ label: '昨日新增', value: '1,200.00' }, { label: '今日新增', value: '800.00' }]} />
              <KpiCard title="总收益（USDT）" value="89,230.00"
                subs={[{ label: '总投资', value: '233,322' }, { label: '总分红', value: '233' }]} />
              <KpiCard title="缴纳税费（USDT）" value="12,340.00"
                subs={[{ label: '纳税次数', value: '233' }, { label: '纳税笔数', value: '37' }]} />
              <KpiCard title="佣金支出（USDT）" value="5,680.00"
                subs={[{ label: '昨日支出', value: '233,322.00' }, { label: '今日支出', value: '233,322.00' }]} />
              <KpiCard title="东方彩票盈亏（USDT）" value="18,760.00"
                subs={[{ label: '昨日盈亏', value: '233,322.00' }, { label: '今日盈亏', value: '233,322.00' }]} />
              <KpiCard title="企业红包收益（USDT）" value="3,450.00"
                subs={[{ label: '昨日收益', value: '233,322.00' }, { label: '今日收益', value: '233,322.00' }]} />
              <KpiCard title="企业股东（个）" value="6"
                subs={[{ label: '公司已入股' }, { label: '平台未入股' }]} />
              <KpiCard title="企业认证费（PEA）" value="200.00"
                subs={[{ label: '认证到期', value: '2025-11-23' }]} />
              <KpiCard title="成员总数（个）" value="128"
                subs={[{ label: '昨日新增', value: '233,322' }, { label: '今日新增', value: '233,322' }]} />
              <KpiCard title="今日参与（个）" value="74"
                subs={[{ label: '昨日参与', value: '233,322' }, { label: '七日参与', value: '233,322' }]} />
              <KpiCard title="今日活跃（个）" value="62"
                subs={[{ label: '昨日活跃', value: '233,322' }, { label: '七日活跃', value: '233,322' }]} />
              <KpiCard title="今日离开（个）" value="3"
                subs={[{ label: '昨日离开', value: '233,322' }, { label: '历史离开', value: '233,322' }]} />
          </div>

          {/* 趋势图（两两并排） */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <MiniLineChart title="企业总资产" data={totalAssetsData} />
            </Col>
            <Col xs={24} lg={12}>
              <MiniLineChart title="企业流水" data={flowData} />
            </Col>
            <Col xs={24} lg={12}>
              <MiniLineChart title="企业成员" data={membersData} />
            </Col>
            <Col xs={24} lg={12}>
              <MiniLineChart title="参与成员" data={participantsData} />
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
          { title: '参与场次', dataIndex: 'sessions', width: 90, align: 'right', sorter: (a, b) => a.sessions - b.sessions },
          {
            title: '成员状态', dataIndex: 'status', width: 90,
            render: (v) => <Tag color={v === '正常' ? 'success' : 'default'}>{v}</Tag>,
          },
          { title: '总盈亏', dataIndex: 'totalPnl', width: 120, align: 'right', sorter: true },
          { title: '收到返佣', dataIndex: 'rebate', width: 100, align: 'right', sorter: true },
          { title: '邀请人数', dataIndex: 'invited', width: 90, align: 'right' },
          { title: '上级ID', dataIndex: 'parentId', width: 100 },
          { title: '上级昵称', dataIndex: 'parentNickname', width: 90 },
        ];

        const filteredMembers = memberData.filter((d) => {
          const matchStatus = memberStatus === 'all' || d.status === memberStatus;
          const matchSearch = !memberSearch || d.nickname.includes(memberSearch) || d.id.includes(memberSearch);
          return matchStatus && matchSearch;
        });

        return (
          <Space direction="vertical" size={12} style={{ display: 'flex' }}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
              <Space size={16} wrap align="center">
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
                  placeholder="成员昵称 / 成员ID"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  allowClear
                  style={{ width: 200 }}
                />
              </Space>
            </Card>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
              <Table columns={memberColumns} dataSource={filteredMembers} rowKey="id" size="middle"
                scroll={{ x: 1400 }} pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
                rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')} />
            </Card>
          </Space>
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
          { title: '加入时间', dataIndex: 'joinTime', width: 170 },
          { title: '股东ID', dataIndex: 'id', width: 100 },
          { title: '股东昵称', dataIndex: 'nickname', width: 90 },
          {
            title: '股东状态', dataIndex: 'status', width: 90,
            render: (v) => <Tag color={v === '正常' ? 'success' : 'default'}>{v}</Tag>,
          },
          { title: '持股比例', dataIndex: 'ratio', width: 90, align: 'right', sorter: true },
          { title: '股东支出', dataIndex: 'expenditure', width: 110, align: 'right' },
          { title: '股东收入', dataIndex: 'income', width: 110, align: 'right' },
          { title: '股份总收益', dataIndex: 'totalRevenue', width: 110, align: 'right' },
          { title: '已缴税费', dataIndex: 'taxPaid', width: 100, align: 'right' },
          {
            title: '操作', width: 100, fixed: 'right' as const,
            render: (_: unknown, r: Shareholder) => (
              <Button type="link" size="small" style={{ padding: 0 }}
                onClick={() => setSearchParams({ tab: 'sharesTrade', shareholder: r.id })}>
                交易记录
              </Button>
            ),
          },
        ];

        const filtered = shareholderData.filter((d) =>
          shStatus === 'all' || d.status === shStatus
        );

        return (
          <Space direction="vertical" size={12} style={{ display: 'flex' }}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
              <ConfigProvider theme={radioTheme}>
                <Radio.Group
                  value={shStatus}
                  onChange={(e) => setShStatus(e.target.value)}
                  buttonStyle="solid"
                >
                  <Radio.Button value="all">全部</Radio.Button>
                  <Radio.Button value="正常">正常</Radio.Button>
                  <Radio.Button value="已退">已退</Radio.Button>
                </Radio.Group>
              </ConfigProvider>
            </Card>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
              <Table columns={shareholderColumns} dataSource={filtered} rowKey="id" size="middle"
                scroll={{ x: 1000 }} pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
                rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')} />
            </Card>
          </Space>
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
          { title: '完成时间', dataIndex: 'completedAt', width: 170 },
          { title: '订单编号', dataIndex: 'orderId', width: 140 },
          {
            title: '订单类型', dataIndex: 'orderType', width: 90,
          },
          { title: '订单金额', dataIndex: 'amount', width: 120, align: 'right' },
          { title: '股东数量', dataIndex: 'shareholderCount', width: 80, align: 'right' },
          { title: '实缴税费', dataIndex: 'taxPaid', width: 110, align: 'right' },
        ];

        const filtered = dividendData.filter((d) =>
          (divType === 'all' || d.orderType === divType) &&
          inRange(d.completedAt, divRange)
        );

        return (
          <Space direction="vertical" size={12} style={{ display: 'flex' }}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
              <Space size={16} wrap align="center">
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
            </Card>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
              <Table columns={dividendColumns} dataSource={filtered} rowKey="orderId" size="middle"
                pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
                rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')} />
            </Card>
          </Space>
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
        const [stRange, setStRange] = useState<[Dayjs, Dayjs] | null>(null);

        const shareTradeColumns: ColumnsType<ShareTrade> = [
          { title: '订单时间', dataIndex: 'orderTime', width: 170 },
          { title: '订单编号', dataIndex: 'orderId', width: 150 },
          { title: '交易类型', dataIndex: 'orderType', width: 100 },
          { title: <span>交易方 <Tooltip title="交易发起者"><InfoCircleOutlined style={{ fontSize: 12, color: 'rgba(0,0,0,0.35)', cursor: 'help' }} /></Tooltip></span>, dataIndex: 'initiator', width: 160 },
          { title: '受让方', dataIndex: 'receiver', width: 160 },
          { title: '变动比例', dataIndex: 'changeRatio', width: 100, align: 'right' },
          { title: '金额', dataIndex: 'amount', width: 130, align: 'right' },
          { title: '实缴税费', dataIndex: 'actualTax', width: 120, align: 'right' },
          { title: '企业总资产快照', dataIndex: 'assetSnapshot', width: 150, align: 'right' },
        ];

        const filtered = shareTradeData.filter((d) => {
          const matchType = stOrderType === 'all' || d.orderType === stOrderType;
          const matchSearch = !stSearch || d.orderId.includes(stSearch) || d.initiator.includes(stSearch) || d.receiver.includes(stSearch);
          return matchType && matchSearch && inRange(d.orderTime, stRange);
        });

        return (
          <Space direction="vertical" size={12} style={{ display: 'flex' }}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
              <Space size={16} wrap align="center">
                <ConfigProvider theme={radioTheme}>
                  <Radio.Group
                    value={stOrderType}
                    onChange={(e) => setStOrderType(e.target.value)}
                    buttonStyle="solid"
                  >
                    <Radio.Button value="all">全部</Radio.Button>
                    <Radio.Button value="购买股份">购买股份</Radio.Button>
                    <Radio.Button value="释放股份">释放股份</Radio.Button>
                    <Radio.Button value="转让股份">转让股份</Radio.Button>
                  </Radio.Group>
                </ConfigProvider>
                <RangePicker onChange={(v) => setStRange(v as [Dayjs, Dayjs] | null)} />
                <Input
                  suffix={<SearchOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
                  placeholder="昵称 / 用户名 / 订单编号"
                  value={stSearch}
                  onChange={(e) => setStSearch(e.target.value)}
                  allowClear
                  style={{ width: 220 }}
                />
              </Space>
            </Card>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
              <Table columns={shareTradeColumns} dataSource={filtered} rowKey="orderId" size="middle"
                scroll={{ x: 1200 }} pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
                rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')} />
            </Card>
          </Space>
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
          { title: '开通时间', dataIndex: 'enabledAt', width: 120 },
          { title: '应用名称', dataIndex: 'name', width: 120 },
          { title: '更新时间', dataIndex: 'updatedAt', width: 120 },
          { title: '余额', dataIndex: 'balance', width: 120, align: 'right' },
          { title: '返佣金额', dataIndex: 'rebateAmt', width: 110, align: 'right' },
          {
            title: '应用状态', dataIndex: 'appStatus', width: 130,
            render: (v) => <Tag color={v === '已订阅' ? 'success' : 'default'}>{v}</Tag>,
          },
        ];

        const filteredApps = appsData.filter((d) => inRange(d.enabledAt, appRange));

        return (
          <Space direction="vertical" size={12} style={{ display: 'flex' }}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
              <RangePicker
                placeholder={['从', '到']}
                onChange={(v) => setAppRange(v as [Dayjs, Dayjs] | null)}
              />
            </Card>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
              <Table columns={appColumns} dataSource={filteredApps} rowKey="id" size="middle"
                pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
                rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')} />
            </Card>
          </Space>
        );
      })(),
    },

    // ── 踩雷红包 ─────────────────────────────────────────────────
    {
      key: 'redpacket',
      label: '踩雷红包',
      children: (() => {
        const [rpStatus, setRpStatus] = useState('all');
        const [rpRange, setRpRange] = useState<[Dayjs, Dayjs] | null>(null);
        const [rpSearch, setRpSearch] = useState('');
        const [rpDetail, setRpDetail] = useState<RedPacket | null>(null);

        const redPacketColumns: ColumnsType<RedPacket> = [
          { title: '发起时间', dataIndex: 'startTime', width: 180, render: (v) => <span style={{ whiteSpace: 'nowrap' }}>{v}</span> },
          { title: '发包人ID', dataIndex: 'senderId', width: 100 },
          { title: '发包人昵称', dataIndex: 'senderNickname', width: 100 },
          { title: '群组ID', dataIndex: 'groupId', width: 100 },
          { title: '群组名称', dataIndex: 'groupName', width: 100 },
          { title: '发包金额', dataIndex: 'amount', width: 100, align: 'right' },
          { title: '红包数量', dataIndex: 'quantity', width: 80, align: 'right' },
          { title: '中雷数量', dataIndex: 'mineCount', width: 80, align: 'right' },
          { title: '赔付金额', dataIndex: 'payoutAmt', width: 100, align: 'right' },
          { title: '领包用户', dataIndex: 'recipient', width: 80, align: 'right' },
          { title: '企业收益', dataIndex: 'enterpriseRevenue', width: 100, align: 'right' },
          { title: '完成时间', dataIndex: 'completedAt', width: 180, render: (v) => <span style={{ whiteSpace: 'nowrap' }}>{v}</span> },
          { title: '状态', dataIndex: 'status', width: 80 },
          {
            title: '操作', width: 80, fixed: 'right' as const,
            render: (_: unknown, r: RedPacket) => (
              <Button type="link" size="small" style={{ padding: 0 }} onClick={() => setRpDetail(r)}>详情</Button>
            ),
          },
        ];

        const filtered = redPacketData.filter((d) => {
          const kw = rpSearch.trim();
          const hitKw =
            !kw ||
            d.senderId.includes(kw) ||
            d.senderNickname.includes(kw) ||
            d.groupId.includes(kw) ||
            d.groupName.includes(kw);
          return (
            (rpStatus === 'all' || d.status === rpStatus) &&
            inRange(d.startTime, rpRange) &&
            hitKw
          );
        });

        return (
          <>
            <Space direction="vertical" size={12} style={{ display: 'flex' }}>
              <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
                <Space size={16} wrap align="center">
                  <FilterField label="状态">
                    <ConfigProvider theme={radioTheme}>
                      <Radio.Group
                        value={rpStatus}
                        onChange={(e) => setRpStatus(e.target.value)}
                        buttonStyle="solid"
                      >
                        <Radio.Button value="all">全部</Radio.Button>
                        <Radio.Button value="已完成">已完成</Radio.Button>
                        <Radio.Button value="进行中">进行中</Radio.Button>
                        <Radio.Button value="已过期">已过期</Radio.Button>
                      </Radio.Group>
                    </ConfigProvider>
                  </FilterField>
                  <FilterField label="发起时间">
                    <RangePicker
                      placeholder={['从', '到']}
                      onChange={(v) => setRpRange(v as [Dayjs, Dayjs] | null)}
                    />
                  </FilterField>
                  <FilterField label="发包人/群组">
                    <Input
                      suffix={<SearchOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
                      placeholder="发包人ID/昵称 或 群组ID/名称"
                      value={rpSearch}
                      onChange={(e) => setRpSearch(e.target.value)}
                      allowClear
                      style={{ width: 260 }}
                    />
                  </FilterField>
                </Space>
              </Card>
              <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}
                styles={{ body: { padding: '16px 24px' } }}>
                <Table columns={redPacketColumns} dataSource={filtered} rowKey="id" size="middle"
                  scroll={{ x: 1500 }}
                  pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
                  rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')} />
              </Card>
            </Space>
            <Modal title="详情" open={!!rpDetail} onCancel={() => setRpDetail(null)} footer={null} width={680}>
              {rpDetail && (
                <>
                  <Text strong style={{ fontSize: 14, display: 'block', marginTop: 16, marginBottom: 8 }}>红包详情</Text>
                  <div style={{ fontSize: 13, color: 'rgba(0,0,0,0.65)', lineHeight: 2 }}>
                    <div>已领取{rpDetail.recipient}/{rpDetail.quantity}，共{rpDetail.amount}USDT</div>
                    <div>赔率{rpDetail.mineCount}，雷{rpDetail.mineCount + 1}</div>
                  </div>

                  <Text strong style={{ fontSize: 14, display: 'block', marginTop: 20, marginBottom: 12 }}>企业红包领包详情</Text>
                  <Table
                    size="small"
                    pagination={{ pageSize: 5, showTotal: (t) => `总共 ${t} 个项目`, showSizeChanger: true }}
                    rowKey="claimId"
                    rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
                    columns={[
                      { title: '领取时间', dataIndex: 'claimTime', width: 170, render: (v) => <span style={{ whiteSpace: 'nowrap' }}>{v}</span> },
                      { title: '领包人ID', dataIndex: 'claimerId', width: 90 },
                      { title: '领包人昵称', dataIndex: 'claimerName', width: 100 },
                      { title: '领包金额', dataIndex: 'claimAmount', width: 110, align: 'right' },
                      {
                        title: '状态', dataIndex: 'mineStatus', width: 80,
                        render: (v: string) => <Tag color={v === '中雷' ? 'error' : 'success'}>{v}</Tag>,
                      },
                      { title: '赔付金额', dataIndex: 'payoutAmt', width: 100, align: 'right' },
                    ]}
                    dataSource={Array.from({ length: rpDetail.recipient }, (_, i) => ({
                      claimId: `CL${i + 1}`,
                      claimTime: rpDetail.startTime.replace(/10:00:00/, `${String(10 + i).padStart(2, '0')}:${String(i * 12).padStart(2, '0')}:00`),
                      claimerId: `MB${100000 + i}`,
                      claimerName: `用户${i + 10}`,
                      claimAmount: `${(Number(rpDetail.amount.replace(/,/g, '')) / rpDetail.quantity).toFixed(2)}`,
                      mineStatus: i < rpDetail.mineCount ? '中雷' : '未中雷',
                      payoutAmt: i < rpDetail.mineCount ? rpDetail.payoutAmt : '0.00',
                    }))}
                  />
                </>
              )}
            </Modal>
          </>
        );
      })(),
    },

    // ── 牛牛红包 ─────────────────────────────────────────────────
    {
      key: 'niuniuRedpacket',
      label: '牛牛红包',
      children: (() => {
        const [nnStatus, setNnStatus] = useState('all');
        const [nnPlay, setNnPlay] = useState('all');
        const [nnRange, setNnRange] = useState<[Dayjs, Dayjs] | null>(null);
        const [nnSearch, setNnSearch] = useState('');
        const [orderDetail, setOrderDetail] = useState<NiuniuOrder | null>(null);
        const [rebateDetail, setRebateDetail] = useState<NiuniuOrder | null>(null);

        const niuniuColumns: ColumnsType<NiuniuOrder> = [
          { title: '发起时间', dataIndex: 'startTime', width: 170, render: (v) => <span style={{ whiteSpace: 'nowrap' }}>{v}</span> },
          { title: '订单ID', dataIndex: 'orderId', width: 140 },
          {
            title: '订单状态', dataIndex: 'status', width: 90,
            render: (v: NiuniuStatus) => <Text style={{ color: '#141414' }}>{v}</Text>,
          },
          { title: '底注', dataIndex: 'baseBet', width: 100, align: 'right' },
          { title: '红包数量', dataIndex: 'packetCount', width: 90, align: 'right' },
          { title: '玩法', dataIndex: 'play', width: 80 },
          { title: '赔率', dataIndex: 'odds', width: 90 },
          {
            title: '有效时长', dataIndex: 'validDuration', width: 90, align: 'right',
            render: (v: number) => `${v}秒`,
          },
          {
            title: '赔付金额', dataIndex: 'payoutAmt', width: 110, align: 'right',
            render: (v: string) => <Text style={{ color: '#141414' }}>{v}</Text>,
          },
          {
            title: '抽水金额', dataIndex: 'rakeAmt', width: 110, align: 'right',
            render: (v: string) => <Text style={{ color: '#141414' }}>{v}</Text>,
          },
          {
            title: '返佣金额', dataIndex: 'rebateAmt', width: 110, align: 'right',
            render: (v: string) => <Text style={{ color: '#141414' }}>{v}</Text>,
          },
          { title: '庄家昵称', dataIndex: 'bankerNickname', width: 110 },
          { title: '庄家ID', dataIndex: 'bankerId', width: 100 },
          { title: '完成时间', dataIndex: 'completedAt', width: 170, render: (v) => <span style={{ whiteSpace: 'nowrap' }}>{v}</span> },
          {
            title: '操作', width: 140, fixed: 'right' as const,
            render: (_: unknown, r: NiuniuOrder) => (
              <Space size={4}>
                <Button type="link" size="small" style={{ padding: 0 }} onClick={() => setOrderDetail(r)}>订单详情</Button>
                <Button type="link" size="small" style={{ padding: 0 }} onClick={() => setRebateDetail(r)}>返佣详情</Button>
              </Space>
            ),
          },
        ];

        const filtered = niuniuData.filter((d) =>
          (nnStatus === 'all' || d.status === nnStatus) &&
          (nnPlay === 'all' || d.play === nnPlay) &&
          inRange(d.startTime, nnRange) &&
          (!nnSearch || d.bankerNickname.includes(nnSearch) || d.bankerId.includes(nnSearch))
        );

        return (
          <>
            <Space direction="vertical" size={12} style={{ display: 'flex' }}>
              <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
                <Space size={16} wrap align="center">
                  <FilterField label="订单状态">
                    <ConfigProvider theme={radioTheme}>
                      <Radio.Group value={nnStatus} onChange={(e) => setNnStatus(e.target.value)} buttonStyle="solid">
                        <Radio.Button value="all">全部</Radio.Button>
                        <Radio.Button value="已开奖">已开奖</Radio.Button>
                        <Radio.Button value="未开奖">未开奖</Radio.Button>
                      </Radio.Group>
                    </ConfigProvider>
                  </FilterField>
                  <FilterField label="玩法">
                    <ConfigProvider theme={radioTheme}>
                      <Radio.Group value={nnPlay} onChange={(e) => setNnPlay(e.target.value)} buttonStyle="solid">
                        <Radio.Button value="all">全部</Radio.Button>
                        <Radio.Button value="庄比">庄比</Radio.Button>
                        <Radio.Button value="通比">通比</Radio.Button>
                      </Radio.Group>
                    </ConfigProvider>
                  </FilterField>
                  <FilterField label="发起时间">
                    <RangePicker placeholder={['从', '到']} onChange={(v) => setNnRange(v as [Dayjs, Dayjs] | null)} />
                  </FilterField>
                  <FilterField label="庄家">
                    <Input
                      suffix={<SearchOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
                      placeholder="庄家昵称 / 庄家ID"
                      value={nnSearch}
                      onChange={(e) => setNnSearch(e.target.value)}
                      allowClear
                      style={{ width: 220 }}
                    />
                  </FilterField>
                </Space>
              </Card>
              <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
                <Table
                  columns={niuniuColumns}
                  dataSource={filtered}
                  rowKey="id"
                  size="middle"
                  scroll={{ x: 1800 }}
                  pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
                  rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
                />
              </Card>
            </Space>

            {/* 订单详情 Modal：顶部概要区 + 领取记录表 */}
            <Modal
              title="订单详情"
              open={!!orderDetail}
              onCancel={() => setOrderDetail(null)}
              footer={null}
              width={1000}
            >
              {orderDetail && (
                <>
                  <div style={{
                    background: '#fafafa',
                    borderRadius: 8,
                    padding: '12px 16px',
                    marginTop: 12,
                    marginBottom: 16,
                    display: 'flex',
                    gap: 32,
                    alignItems: 'center',
                  }}>
                    <Text style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>
                      玩法 <span style={{ color: '#141414', marginLeft: 4 }}>{orderDetail.play}</span>
                    </Text>
                    <Text style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>
                      赔率 <span style={{ color: '#141414', marginLeft: 4 }}>{orderDetail.odds}</span>
                    </Text>
                    <Text style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>
                      订单状态 <span style={{ color: '#141414', marginLeft: 4 }}>{orderDetail.status}</span>
                    </Text>
                  </div>
                  <Table
                    size="small"
                    rowKey="claimId"
                    pagination={{ pageSize: 5, showTotal: (t) => `共 ${t} 条` }}
                    rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
                    scroll={{ x: 1100 }}
                    columns={[
                      { title: '领取时间', dataIndex: 'claimTime', width: 160 },
                      { title: '领取订单号', dataIndex: 'claimOrderId', width: 150 },
                      { title: '用户昵称', dataIndex: 'userNickname', width: 100 },
                      { title: '用户ID', dataIndex: 'userId', width: 100 },
                      { title: '用户IP', dataIndex: 'userIp', width: 130 },
                      {
                        title: '领取金额', dataIndex: 'claimAmount', width: 100, align: 'right',
                        render: (v: string) => <Text style={{ color: '#141414' }}>{v}</Text>,
                      },
                      { title: '牌面', dataIndex: 'face', width: 80 },
                      {
                        title: '本局盈亏', dataIndex: 'roundPnl', width: 100, align: 'right',
                        render: (v: string) => <Text style={{ color: '#141414' }}>{v}</Text>,
                      },
                      {
                        title: '到账', dataIndex: 'arrival', width: 100, align: 'right',
                        render: (v: string) => <Text style={{ color: '#141414' }}>{v}</Text>,
                      },
                      {
                        title: '抽水', dataIndex: 'rake', width: 100, align: 'right',
                        render: (v: string) => <Text style={{ color: '#141414' }}>{v}</Text>,
                      },
                    ]}
                    dataSource={buildNiuniuClaims(orderDetail)}
                  />
                </>
              )}
            </Modal>

            {/* 返佣详情 Modal：返佣链路 庄家 → 下级领取者 → 上级（推荐人） */}
            <Modal
              title="返佣详情"
              open={!!rebateDetail}
              onCancel={() => setRebateDetail(null)}
              footer={null}
              width={800}
            >
              {rebateDetail && (
                <Table
                  size="small"
                  rowKey="rebateId"
                  pagination={{ pageSize: 5, showTotal: (t) => `共 ${t} 条` }}
                  rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
                  style={{ marginTop: 12 }}
                  columns={[
                    { title: '创建时间', dataIndex: 'createdAt', width: 160 },
                    { title: '返佣任务ID', dataIndex: 'rebateId', width: 130 },
                    { title: '用户昵称', dataIndex: 'rebateUserNickname', width: 130 },
                    { title: '用户ID', dataIndex: 'rebateUserId', width: 120 },
                    { title: '上级昵称', dataIndex: 'parentNickname', width: 100 },
                    { title: '上级ID', dataIndex: 'parentId', width: 100 },
                    {
                      title: '返佣金额', dataIndex: 'rebateAmt', width: 110, align: 'right',
                      render: (v: string) => <Text style={{ color: '#141414' }}>{v}</Text>,
                    },
                  ]}
                  dataSource={buildNiuniuRebates(rebateDetail)}
                />
              )}
            </Modal>
          </>
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
            render: (v: string) => <Text style={{ color: '#141414' }}>{v}</Text>,
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
          <Space direction="vertical" size={12} style={{ display: 'flex' }}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
              <Space size={16} wrap align="center">
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
            </Card>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
              <Table columns={lotteryColumns} dataSource={filtered} rowKey="id" size="middle"
                scroll={{ x: 1400 }} pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
                rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')} />
            </Card>
          </Space>
        );
      })(),
    },

    // ── 应用费用 ─────────────────────────────────────────────────
    {
      key: 'appFee',
      label: '应用费用',
      children: (() => {
        const [afType, setAfType] = useState('all');
        const [afCreatedRange, setAfCreatedRange] = useState<[Dayjs, Dayjs] | null>(null);
        const [afBillingRange, setAfBillingRange] = useState<[Dayjs, Dayjs] | null>(null);
        const [afSearch, setAfSearch] = useState('');

        const appFeeColumns: ColumnsType<AppFeeOrder> = [
          { title: '创建时间', dataIndex: 'createdAt', width: 170, render: (v) => <span style={{ whiteSpace: 'nowrap' }}>{v}</span> },
          { title: '订单编号', dataIndex: 'orderId', width: 140 },
          { title: '订单类型', dataIndex: 'orderType', width: 100 },
          {
            title: '应用费用总额', dataIndex: 'appFeeTotal', width: 130, align: 'right',
            render: (v: number) => <Text style={{ color: '#141414' }}>{formatMoney(v)}</Text>,
          },
          {
            title: '企业盈利明细', dataIndex: 'enterpriseProfitDetail', width: 360,
            render: (b: AppFeeBreakdown) => <span style={{ whiteSpace: 'nowrap' }}>{formatBreakdown(b)}</span>,
          },
          {
            title: '应用费用明细', dataIndex: 'appFeeDetail', width: 360,
            render: (b: AppFeeBreakdown) => <span style={{ whiteSpace: 'nowrap' }}>{formatBreakdown(b)}</span>,
          },
          {
            title: '账单周期', width: 320,
            render: (_: unknown, r: AppFeeOrder) => (
              <span style={{ whiteSpace: 'nowrap' }}>{r.billingPeriodStart} ~ {r.billingPeriodEnd}</span>
            ),
          },
        ];

        const filtered = appFeeData.filter((d) => {
          // 账单周期与筛选范围是否有重叠
          let billingHit = true;
          if (afBillingRange) {
            const [from, to] = afBillingRange;
            const start = dayjs(d.billingPeriodStart);
            const end = dayjs(d.billingPeriodEnd);
            billingHit = !start.isAfter(to.endOf('day')) && !end.isBefore(from.startOf('day'));
          }
          return (
            (afType === 'all' || d.orderType === afType) &&
            inRange(d.createdAt, afCreatedRange) &&
            billingHit &&
            (!afSearch || d.orderId.includes(afSearch))
          );
        });

        return (
          <Space direction="vertical" size={12} style={{ display: 'flex' }}>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
              <Space size={16} wrap align="center">
                <FilterField label="订单类型">
                  <ConfigProvider theme={radioTheme}>
                    <Radio.Group value={afType} onChange={(e) => setAfType(e.target.value)} buttonStyle="solid">
                      <Radio.Button value="all">全部</Radio.Button>
                      <Radio.Button value="应用结算">应用结算</Radio.Button>
                      <Radio.Button value="主动分红">主动分红</Radio.Button>
                    </Radio.Group>
                  </ConfigProvider>
                </FilterField>
                <FilterField label="创建时间">
                  <RangePicker
                    placeholder={['从', '到']}
                    onChange={(v) => setAfCreatedRange(v as [Dayjs, Dayjs] | null)}
                  />
                </FilterField>
                <FilterField label="账单周期">
                  <RangePicker
                    placeholder={['从', '到']}
                    onChange={(v) => setAfBillingRange(v as [Dayjs, Dayjs] | null)}
                  />
                </FilterField>
                <FilterField label="订单编号">
                  <Input
                    suffix={<SearchOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
                    placeholder="订单编号"
                    value={afSearch}
                    onChange={(e) => setAfSearch(e.target.value)}
                    allowClear
                    style={{ width: 200 }}
                  />
                </FilterField>
              </Space>
            </Card>
            <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
              <Table
                columns={appFeeColumns}
                dataSource={filtered}
                rowKey="id"
                size="middle"
                scroll={{ x: 1700 }}
                pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
                rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
              />
            </Card>
          </Space>
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
        const [commDetail, setCommDetail] = useState<CommissionOrder | null>(null);

        const commissionColumns: ColumnsType<CommissionOrder> = [
          { title: '订单时间', dataIndex: 'createdAt', width: 170 },
          { title: '订单编号', dataIndex: 'orderId', width: 140 },
          { title: '应用名称', dataIndex: 'appName', width: 110 },
          { title: '游戏', dataIndex: 'game', width: 90 },
          { title: '企业支出佣金', dataIndex: 'commission', width: 130, align: 'right' },
          {
            title: '操作', width: 80, fixed: 'right' as const,
            render: (_: unknown, r: CommissionOrder) => (
              <Button type="link" size="small" style={{ padding: 0 }} onClick={() => setCommDetail(r)}>详情</Button>
            ),
          },
        ];

        const filtered = commissionData.filter((d) =>
          (!commSearch || d.orderId.includes(commSearch) || d.appName.includes(commSearch)) &&
          inRange(d.createdAt, commRange)
        );

        return (
          <>
            <Space direction="vertical" size={12} style={{ display: 'flex' }}>
              <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
                <Space size={16} wrap align="center">
                  <RangePicker onChange={(v) => setCommRange(v as [Dayjs, Dayjs] | null)} />
                  <Input
                    suffix={<SearchOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
                    placeholder="订单编号 / 应用名称"
                    value={commSearch}
                    onChange={(e) => setCommSearch(e.target.value)}
                    allowClear
                    style={{ width: 210 }}
                  />
                </Space>
              </Card>
              <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
                <Table columns={commissionColumns} dataSource={filtered} rowKey="orderId" size="middle"
                  pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
                  rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')} />
              </Card>
            </Space>
            <Modal title="佣金订单详情" open={!!commDetail} onCancel={() => setCommDetail(null)} footer={null} width={520}>
              {commDetail && (
                <Descriptions column={2} bordered size="small" style={{ marginTop: 16 }}>
                  <Descriptions.Item label="订单编号">{commDetail.orderId}</Descriptions.Item>
                  <Descriptions.Item label="订单时间">{commDetail.createdAt}</Descriptions.Item>
                  <Descriptions.Item label="应用名称">{commDetail.appName}</Descriptions.Item>
                  <Descriptions.Item label="游戏">{commDetail.game}</Descriptions.Item>
                  <Descriptions.Item label="企业支出佣金" span={2}>{commDetail.commission}</Descriptions.Item>
                </Descriptions>
              )}
            </Modal>
          </>
        );
      })(),
    },
  ];

  return (
    <div style={{ marginTop: -16 }}>
      <Tabs
        items={tabItems}
        activeKey={activeTab}
        onChange={(key) => setSearchParams({ tab: key })}
        tabBarStyle={{
          background: '#fff',
          margin: '0 -24px',
          padding: '0 24px',
        }}
        tabBarExtraContent={
          <Space size={12}>
            <Select
              value={currentEnterprise.value}
              onChange={(val) => navigate(`/enterprise/detail/${val}?tab=${activeTab}`)}
              style={{ width: 180 }}
              options={ENTERPRISES}
              placeholder="切换企业"
            />
            <Button type="primary" onClick={() => navigate('/enterprise/list')}>返回</Button>
          </Space>
        }
      />
    </div>
  );
};

export default EnterpriseDetail;
