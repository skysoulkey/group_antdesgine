import { AppstoreOutlined, GiftOutlined } from '@ant-design/icons';
import { Line } from '@ant-design/plots';
import {
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React from 'react';
import { useParams } from 'umi';

const { Text } = Typography;
const { RangePicker } = DatePicker;

// ── 共用工具 ──────────────────────────────────────────────────────
const mk = (n: number) => Array.from({ length: n }, (_, i) => i);

// ── 企业概览数据 ──────────────────────────────────────────────────
const profitTrendData = [
  { date: '3/13', value: 12 }, { date: '3/14', value: -8 }, { date: '3/15', value: 25 },
  { date: '3/16', value: -15 }, { date: '3/17', value: 30 }, { date: '3/18', value: 18 }, { date: '3/19', value: -5 },
];

// ── 投资分红 ──────────────────────────────────────────────────────
interface Dividend { id: string; appName: string; game: string; startTime: string; endTime: string; members: number; totalInvest: string; totalDividend: string; totalProfit: string; status: string }
const dividendData: Dividend[] = mk(8).map((i) => ({
  id: `DIV${String(i + 1).padStart(5, '0')}`,
  appName: ['UU Talk', 'Hey Talk', 'Star Game'][i % 3],
  game: ['百家乐', '龙虎斗', '骰子'][i % 3],
  startTime: `2026-03-${String(i + 1).padStart(2, '0')} 10:00:00`,
  endTime: `2026-03-${String(i + 1).padStart(2, '0')} 22:00:00`,
  members: 12 + i * 3,
  totalInvest: `${(10000 + i * 3000).toLocaleString()}.00`,
  totalDividend: `${(8000 + i * 2500).toLocaleString()}.00`,
  totalProfit: i % 3 === 1 ? `-${(500 + i * 100).toLocaleString()}.00` : `${(1500 + i * 800).toLocaleString()}.00`,
  status: ['正常', '审核中', '已结算'][i % 3],
}));
const dividendColumns: ColumnsType<Dividend> = [
  { title: '应用名称', dataIndex: 'appName', width: 100 },
  { title: '游戏', dataIndex: 'game', width: 80 },
  { title: '发起时间', dataIndex: 'startTime', width: 170 },
  { title: '完成时间', dataIndex: 'endTime', width: 170 },
  { title: '参与成员', dataIndex: 'members', width: 80, align: 'right' },
  { title: '总投资', dataIndex: 'totalInvest', width: 120, align: 'right' },
  { title: '总分红', dataIndex: 'totalDividend', width: 120, align: 'right' },
  { title: '总盈亏', dataIndex: 'totalProfit', width: 120, align: 'right', render: (v: string) => <Text style={{ color: v.startsWith('-') ? '#ff4d4f' : '#52c41a' }}>{v}</Text> },
  { title: '状态', dataIndex: 'status', width: 90, render: (v) => <Tag color={v === '正常' ? 'success' : v === '审核中' ? 'processing' : 'default'}>{v}</Tag> },
];

// ── 股份交易 ──────────────────────────────────────────────────────
interface ShareTrade { id: string; direction: string; tradeTime: string; amount: string; shareholderId: string; shareholderName: string; shareHeld: string; expenditure: string; income: string; status: string }
const shareTradeData: ShareTrade[] = mk(6).map((i) => ({
  id: `ST${String(i + 1).padStart(5, '0')}`,
  direction: i % 2 === 0 ? '买入' : '卖出',
  tradeTime: `2026-03-${String(i + 1).padStart(2, '0')} 14:${String(i * 7).padStart(2, '0')}:00`,
  amount: `${(5000 + i * 2000).toLocaleString()}.00`,
  shareholderId: `SH${10000 + i}`,
  shareholderName: ['张三', '李四', '王五', '赵六', '孙七', '周八'][i],
  shareHeld: `${(5 + i * 2).toFixed(2)}%`,
  expenditure: i % 2 === 0 ? `${(5000 + i * 2000).toLocaleString()}.00` : '0.00',
  income: i % 2 !== 0 ? `${(5000 + i * 2000).toLocaleString()}.00` : '0.00',
  status: '已完成',
}));
const shareTradeColumns: ColumnsType<ShareTrade> = [
  { title: '交易方向', dataIndex: 'direction', width: 90, render: (v) => <Tag color={v === '买入' ? 'success' : 'error'}>{v}</Tag> },
  { title: '交易时间', dataIndex: 'tradeTime', width: 170 },
  { title: '交易金额', dataIndex: 'amount', width: 120, align: 'right' },
  { title: '股东ID', dataIndex: 'shareholderId', width: 100 },
  { title: '股东昵称', dataIndex: 'shareholderName', width: 90 },
  { title: '持有股份', dataIndex: 'shareHeld', width: 90, align: 'right' },
  { title: '股东支出', dataIndex: 'expenditure', width: 110, align: 'right' },
  { title: '股东收入', dataIndex: 'income', width: 110, align: 'right' },
  { title: '状态', dataIndex: 'status', width: 90, render: (v) => <Tag color="success">{v}</Tag> },
];

// ── 成员清单 ──────────────────────────────────────────────────────
interface Member { id: string; nickname: string; parentId: string; parentNickname: string; joinTime: string; sessions: number; invited: number; totalPnl: string; rebate: string; redPacket: string; lottery: string; status: string }
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
  status: i % 5 === 4 ? '已离开' : '正常',
}));
const memberColumns: ColumnsType<Member> = [
  { title: '成员ID', dataIndex: 'id', width: 100 },
  { title: '昵称', dataIndex: 'nickname', width: 90 },
  { title: '上级ID', dataIndex: 'parentId', width: 100 },
  { title: '上级昵称', dataIndex: 'parentNickname', width: 90 },
  { title: '加入时间', dataIndex: 'joinTime', width: 110 },
  { title: '参与场次', dataIndex: 'sessions', width: 80, align: 'right' },
  { title: '邀请人数', dataIndex: 'invited', width: 80, align: 'right' },
  { title: '总盈亏', dataIndex: 'totalPnl', width: 120, align: 'right', render: (v: string) => <Text style={{ color: v.startsWith('-') ? '#ff4d4f' : '#52c41a' }}>{v}</Text> },
  { title: '收到返佣', dataIndex: 'rebate', width: 110, align: 'right' },
  { title: '企业红包盈亏', dataIndex: 'redPacket', width: 110, align: 'right' },
  { title: '东方彩票盈亏', dataIndex: 'lottery', width: 110, align: 'right', render: (v: string) => <Text style={{ color: v.startsWith('-') ? '#ff4d4f' : '#52c41a' }}>{v}</Text> },
  { title: '状态', dataIndex: 'status', width: 90, render: (v) => <Tag color={v === '正常' ? 'success' : 'default'}>{v}</Tag> },
  { title: '操作', width: 80, fixed: 'right' as const, render: () => <Button type="link" size="small" style={{ padding: 0 }}>详情</Button> },
];

// ── 股东清单 ──────────────────────────────────────────────────────
interface Shareholder { id: string; nickname: string; shares: string; ratio: string; joinTime: string; status: string }
const shareholderData: Shareholder[] = mk(6).map((i) => ({
  id: `SH${20000 + i}`,
  nickname: `股东${i + 1}`,
  shares: `${(1000 + i * 500).toLocaleString()}`,
  ratio: `${(5 + i * 3).toFixed(2)}%`,
  joinTime: `2025-0${i + 1}-${String(i * 3 + 1).padStart(2, '0')} 10:00:00`,
  status: i % 4 === 3 ? '已退出' : '持股中',
}));
const shareholderColumns: ColumnsType<Shareholder> = [
  { title: '股东ID', dataIndex: 'id', width: 100 },
  { title: '昵称', dataIndex: 'nickname', width: 90 },
  { title: '持股数量', dataIndex: 'shares', width: 110, align: 'right' },
  { title: '持股比例', dataIndex: 'ratio', width: 90, align: 'right' },
  { title: '入股时间', dataIndex: 'joinTime', width: 170 },
  { title: '状态', dataIndex: 'status', width: 90, render: (v) => <Tag color={v === '持股中' ? 'success' : 'default'}>{v}</Tag> },
];

// ── 开通应用 ──────────────────────────────────────────────────────
const appsData = [
  { name: 'UU Talk', enabled: true,  enabledAt: '2025-10-01' },
  { name: 'Hey Talk', enabled: true,  enabledAt: '2025-11-15' },
  { name: 'Star Game', enabled: false, enabledAt: '—' },
  { name: 'Lucky Bet', enabled: true,  enabledAt: '2026-01-20' },
];

// ── 企业红包 ──────────────────────────────────────────────────────
interface RedPacket { id: string; amount: string; sender: string; status: string; createdAt: string }
const redPacketData: RedPacket[] = mk(6).map((i) => ({
  id: `RP${String(i + 1).padStart(5, '0')}`,
  amount: `${(100 + i * 50).toLocaleString()}.00`,
  sender: `用户${i + 10}`,
  status: ['已领取', '未领取', '已过期'][i % 3],
  createdAt: `2026-03-${String(i + 1).padStart(2, '0')} 12:00:00`,
}));
const redPacketColumns: ColumnsType<RedPacket> = [
  { title: '红包ID', dataIndex: 'id', width: 100 },
  { title: '金额', dataIndex: 'amount', width: 110, align: 'right' },
  { title: '发放人', dataIndex: 'sender', width: 90 },
  { title: '领取状态', dataIndex: 'status', width: 90, render: (v) => <Tag color={v === '已领取' ? 'success' : v === '未领取' ? 'processing' : 'default'}>{v}</Tag> },
  { title: '发放时间', dataIndex: 'createdAt', width: 170 },
];

// ── 东方彩票 ──────────────────────────────────────────────────────
interface LotteryOrder { id: string; game: string; period: string; status: string; startTime: string; endTime: string; orderAmt: string; payoutAmt: string; pnl: string; currency: string; bettorId: string; bettorName: string }
const lotteryData: LotteryOrder[] = mk(8).map((i) => ({
  id: `LO${String(i + 1).padStart(7, '0')}`,
  game: ['百家乐', '龙虎斗', '骰子'][i % 3],
  period: `第${1000 + i}期`,
  status: ['未结算', '结算中', '已结算'][i % 3],
  startTime: `2026-03-${String(i + 1).padStart(2, '0')} 10:00:00`,
  endTime: `2026-03-${String(i + 1).padStart(2, '0')} 22:00:00`,
  orderAmt: `${(500 + i * 200).toLocaleString()}.00`,
  payoutAmt: i % 3 === 0 ? `${(400 + i * 180).toLocaleString()}.00` : '0.00',
  pnl: i % 3 === 0 ? `-${(80 + i * 20)}.00` : `${(100 + i * 50)}.00`,
  currency: i % 2 === 0 ? 'USDT' : 'PEA',
  bettorId: `MB${100000 + i}`,
  bettorName: `用户${i + 1}`,
}));
const lotteryColumns: ColumnsType<LotteryOrder> = [
  { title: '订单编号', dataIndex: 'id', width: 120 },
  { title: '游戏', dataIndex: 'game', width: 80 },
  { title: '游戏期数', dataIndex: 'period', width: 90 },
  { title: '订单状态', dataIndex: 'status', width: 90, render: (v) => <Tag color={v === '已结算' ? 'success' : v === '结算中' ? 'processing' : 'warning'}>{v}</Tag> },
  { title: '发起时间', dataIndex: 'startTime', width: 170 },
  { title: '完成时间', dataIndex: 'endTime', width: 170 },
  { title: '订单金额', dataIndex: 'orderAmt', width: 110, align: 'right' },
  { title: '赔付金额', dataIndex: 'payoutAmt', width: 110, align: 'right' },
  { title: '公司盈亏', dataIndex: 'pnl', width: 110, align: 'right', render: (v: string) => <Text style={{ color: v.startsWith('-') ? '#ff4d4f' : '#52c41a' }}>{v}</Text> },
  { title: '货币单位', dataIndex: 'currency', width: 80 },
  { title: '下注人ID', dataIndex: 'bettorId', width: 100 },
  { title: '下注人昵称', dataIndex: 'bettorName', width: 100 },
];

// ── 佣金订单 ──────────────────────────────────────────────────────
interface CommissionOrder { id: string; createdAt: string; appName: string; enterpriseId: string; enterpriseName: string; currency: string; commission: string; bettorId: string; bettorName: string }
const commissionData: CommissionOrder[] = mk(8).map((i) => ({
  id: `CO${String(i + 1).padStart(7, '0')}`,
  createdAt: `2026-03-${String(i + 1).padStart(2, '0')} 14:00:00`,
  appName: ['UU Talk', 'Hey Talk', 'Star Game'][i % 3],
  enterpriseId: `ENT${10000 + i}`,
  enterpriseName: `企业${i + 1}`,
  currency: i % 2 === 0 ? 'USDT' : 'PEA',
  commission: `${(200 + i * 80).toLocaleString()}.00`,
  bettorId: `MB${100000 + i}`,
  bettorName: `用户${i + 1}`,
}));
const commissionColumns: ColumnsType<CommissionOrder> = [
  { title: '订单时间', dataIndex: 'createdAt', width: 170 },
  { title: '订单编号', dataIndex: 'id', width: 120 },
  { title: '应用名称', dataIndex: 'appName', width: 100 },
  { title: '企业ID', dataIndex: 'enterpriseId', width: 100 },
  { title: '企业名称', dataIndex: 'enterpriseName', width: 100 },
  { title: '货币单位', dataIndex: 'currency', width: 80 },
  { title: '公司佣金支出', dataIndex: 'commission', width: 120, align: 'right' },
  { title: '下注人ID', dataIndex: 'bettorId', width: 100 },
  { title: '下注人昵称', dataIndex: 'bettorName', width: 100 },
  { title: '操作', width: 80, fixed: 'right' as const, render: () => <Button type="link" size="small" style={{ padding: 0 }}>详情</Button> },
];

// ── 主组件 ────────────────────────────────────────────────────────
const EnterpriseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const tabItems = [
    {
      key: 'overview',
      label: '企业概览',
      children: (
        <div>
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={6}>
              <Card bordered={false}><Statistic title="企业总资产（USDT）" value="234,560.00" valueStyle={{ color: '#1677ff' }} /></Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card bordered={false}><Statistic title="企业总流水（USDT）" value="89,230.00" valueStyle={{ color: '#fa8c16' }} /></Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card bordered={false}><Statistic title="企业成员数" value={128} suffix="人" valueStyle={{ color: '#52c41a' }} /></Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card bordered={false}><Statistic title="参与成员数" value={248} suffix="人" valueStyle={{ color: '#722ed1' }} /></Card>
            </Col>
          </Row>
          <Card bordered={false} title="企业盈亏走势" extra={<RangePicker size="small" />}>
            <Line data={profitTrendData} xField="date" yField="value" shape="smooth" point={{}} height={240} autoFit />
          </Card>
        </div>
      ),
    },
    {
      key: 'members',
      label: '成员清单',
      children: (
        <Card bordered={false}>
          <Space style={{ marginBottom: 16 }} wrap>
            <DatePicker picker="month" placeholder="加入月份" size="small" />
            <Select placeholder="成员状态" style={{ width: 120 }} allowClear size="small"
              options={[{ value: '正常', label: '正常' }, { value: '已离开', label: '已离开' }]} />
          </Space>
          <Table columns={memberColumns} dataSource={memberData} rowKey="id" size="middle"
            scroll={{ x: 1400 }} pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }} />
        </Card>
      ),
    },
    {
      key: 'shareholders',
      label: '股东清单',
      children: (
        <Card bordered={false}>
          <Table columns={shareholderColumns} dataSource={shareholderData} rowKey="id" size="middle"
            pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }} />
        </Card>
      ),
    },
    {
      key: 'dividend',
      label: '投资分红',
      children: (
        <Card bordered={false}>
          <Space style={{ marginBottom: 16 }} wrap>
            <Select placeholder="应用名称" style={{ width: 140 }} allowClear size="small"
              options={[{ value: 'UU Talk', label: 'UU Talk' }, { value: 'Hey Talk', label: 'Hey Talk' }, { value: 'Star Game', label: 'Star Game' }]} />
            <Select placeholder="状态" style={{ width: 120 }} allowClear size="small"
              options={[{ value: '正常', label: '正常' }, { value: '审核中', label: '审核中' }, { value: '已结算', label: '已结算' }]} />
          </Space>
          <Row gutter={[12, 8]} style={{ marginBottom: 16 }}>
            {[{ label: '总分红', value: '62,000.00 USDT' }, { label: '总投资', value: '76,000.00 USDT' }, { label: '总盈亏', value: '+12,300.00 USDT' }, { label: '参与成员数', value: '84 人' }, { label: '参与场次', value: '8 场' }].map((item) => (
              <Col key={item.label} xs={12} sm={5}>
                <div style={{ background: '#f5f5f5', borderRadius: 6, padding: '8px 12px' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>{item.label}</Text>
                  <div style={{ fontWeight: 600, fontSize: 14, marginTop: 2 }}>{item.value}</div>
                </div>
              </Col>
            ))}
          </Row>
          <Table columns={dividendColumns} dataSource={dividendData} rowKey="id" size="middle"
            scroll={{ x: 1100 }} pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }} />
        </Card>
      ),
    },
    {
      key: 'sharesTrade',
      label: '股份交易',
      children: (
        <Card bordered={false}>
          <Table columns={shareTradeColumns} dataSource={shareTradeData} rowKey="id" size="middle"
            scroll={{ x: 1000 }} pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }} />
        </Card>
      ),
    },
    {
      key: 'apps',
      label: '开通应用',
      children: (
        <Row gutter={[16, 16]}>
          {appsData.map((app) => (
            <Col key={app.name} xs={24} sm={12} lg={6}>
              <Card bordered={false} style={{ textAlign: 'center', borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.03),0 4px 16px rgba(0,0,0,0.06)' }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: app.enabled ? '#1677ff18' : '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <AppstoreOutlined style={{ fontSize: 26, color: app.enabled ? '#1677ff' : '#bfbfbf' }} />
                </div>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>{app.name}</div>
                <Tag color={app.enabled ? 'success' : 'default'}>{app.enabled ? '已开通' : '未开通'}</Tag>
                {app.enabled && <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', marginTop: 8 }}>开通时间：{app.enabledAt}</div>}
              </Card>
            </Col>
          ))}
        </Row>
      ),
    },
    {
      key: 'redpacket',
      label: '企业红包',
      children: (
        <Card bordered={false}>
          <Row gutter={[12, 8]} style={{ marginBottom: 16 }}>
            {[{ label: '总发放金额', value: '1,800.00 USDT' }, { label: '已领取', value: '4 个' }, { label: '未领取', value: '1 个' }, { label: '已过期', value: '1 个' }].map((s) => (
              <Col key={s.label} xs={12} sm={6}>
                <div style={{ background: '#f5f5f5', borderRadius: 6, padding: '8px 12px' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>{s.label}</Text>
                  <div style={{ fontWeight: 600, fontSize: 14, marginTop: 2 }}>{s.value}</div>
                </div>
              </Col>
            ))}
          </Row>
          <Space style={{ marginBottom: 12 }}>
            <Select placeholder="领取状态" style={{ width: 130 }} allowClear size="small"
              options={[{ value: '已领取', label: '已领取' }, { value: '未领取', label: '未领取' }, { value: '已过期', label: '已过期' }]} />
          </Space>
          <Table columns={redPacketColumns} dataSource={redPacketData} rowKey="id" size="middle"
            pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }} />
        </Card>
      ),
    },
    {
      key: 'lottery',
      label: (
        <span><GiftOutlined style={{ marginRight: 4 }} />东方彩票</span>
      ),
      children: (
        <Card bordered={false}>
          <Space style={{ marginBottom: 16 }} wrap>
            <Select placeholder="订单状态" style={{ width: 120 }} allowClear size="small"
              options={[{ value: '未结算', label: '未结算' }, { value: '结算中', label: '结算中' }, { value: '已结算', label: '已结算' }]} />
            <Select placeholder="游戏" style={{ width: 120 }} allowClear size="small"
              options={[{ value: '百家乐', label: '百家乐' }, { value: '龙虎斗', label: '龙虎斗' }, { value: '骰子', label: '骰子' }]} />
            <Select placeholder="货币单位" style={{ width: 110 }} allowClear size="small"
              options={[{ value: 'USDT', label: 'USDT' }, { value: 'PEA', label: 'PEA' }]} />
          </Space>
          <Table columns={lotteryColumns} dataSource={lotteryData} rowKey="id" size="middle"
            scroll={{ x: 1400 }} pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }} />
        </Card>
      ),
    },
    {
      key: 'commission',
      label: '佣金订单',
      children: (
        <Card bordered={false}>
          <Space style={{ marginBottom: 16 }} wrap>
            <Select placeholder="货币单位" style={{ width: 110 }} allowClear size="small"
              options={[{ value: 'USDT', label: 'USDT' }, { value: 'PEA', label: 'PEA' }]} />
            <Select placeholder="应用名称" style={{ width: 140 }} allowClear size="small"
              options={[{ value: 'UU Talk', label: 'UU Talk' }, { value: 'Hey Talk', label: 'Hey Talk' }, { value: 'Star Game', label: 'Star Game' }]} />
          </Space>
          <div style={{ marginBottom: 12 }}>
            <Badge count="佣金支出合计" style={{ backgroundColor: '#1677ff' }} />
            <Text strong style={{ marginLeft: 8, fontSize: 16 }}>234,234,244.00 USDT</Text>
          </div>
          <Table columns={commissionColumns} dataSource={commissionData} rowKey="id" size="middle"
            scroll={{ x: 1200 }} pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }} />
        </Card>
      ),
    },
  ];

  return (
    <div>
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Space>
          <Text type="secondary">企业 ID：</Text>
          <Text strong>{id}</Text>
        </Space>
      </Card>
      <Tabs items={tabItems} type="card" />
    </div>
  );
};

export default EnterpriseDetail;
