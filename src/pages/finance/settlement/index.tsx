/**
 * 【所属模块】公司财务 / 公司清账
 *
 * 【核心定位】公司端展示平台向本公司收取的应用费用账单清单（按游戏拆行）
 *
 * 【业务规则（PRD V1.3 + 2026-04-29 调整）】
 * - 多币种独立结算，跨币种不合并不汇兑
 * - 每个游戏生成一条订单（同一个月一家公司有多条订单）
 * - 一份 PDF 覆盖一公司一月所有订单（月度合并）
 * - 每行扣款时间/状态按该游戏的币种粒度独立判定
 * - 列表只展示本月+上月数据，更早数据后台保留但不展示
 * - 公司端不展示清账状态字段（业务决策）
 *
 * 【依赖接口】
 * - GET /api/finance/settlement — 列表（待对接）
 */
import { useState } from 'react';
import { Button, Card, ConfigProvider, DatePicker, Radio, Space, Table, Typography } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { type Dayjs } from 'dayjs';
import FilterField from '../../../components/FilterField';

const { RangePicker } = DatePicker;
const { Text } = Typography;

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

// ── 数据类型 ─────────────────────────────────────────────────────
type BillType = '自动月度' | '手动清账';
type DeductStatus = '待扣' | '已扣';
type GameType = '东方彩票' | '七星百家乐';

interface SettlementBill {
  id: string;
  orderId: string;          // 订单编号（游戏粒度）
  period: string;           // YYYY-MM
  billType: BillType;
  game: GameType;
  revenueUsdt: number;      // 该游戏 USDT 收益
  revenuePea: number;       // 该游戏 PEA 收益
  feeUsdt: number;          // 该游戏 USDT 应用费用
  feePea: number;           // 该游戏 PEA 应用费用
  deductTime: string;       // 该游戏对应扣款时间（按币种粒度独立）
  status: DeductStatus;     // 该游戏所有币种是否结清
}

const GAMES: GameType[] = ['东方彩票', '七星百家乐'];

// ── Mock 12 个月（后台保留），前端只展示本月+上月 ────────────────
// 业务规则（PRD V1.3 §7.2）：先扣旧再扣新；旧月未结清，新月不会先扣
// 因此 mock 场景只能是：
//   - 全部已扣（旧→新顺序扣完）
//   - 全部待扣（旧月就欠费，新月跟着挂账）
//   - 不能出现"旧月待扣 + 新月已扣"
const buildMockBills = (): SettlementBill[] => {
  const today = dayjs();
  const bills: SettlementBill[] = [];

  for (let i = 0; i < 12; i += 1) {
    const monthStart = today.subtract(i, 'month').startOf('month');
    const period = monthStart.format('YYYY-MM');
    const yyyymm = period.replace('-', '');
    // 第 4、5 期为欠费场景；其余已扣（按月顺序，旧月不欠则新月扣得动）
    const isOverdue = i === 4 || i === 5;
    // 第 2 期为手动清账
    const billType: BillType = i === 2 ? '手动清账' : '自动月度';

    GAMES.forEach((game, gi) => {
      const baseRevenue = (game === '东方彩票' ? 4800 : 3200) + i * 200;
      const revenueUsdt = baseRevenue;
      const revenuePea = i % 2 === 0 ? baseRevenue * 1.5 : 0;
      const feeUsdt = +(revenueUsdt * 0.1).toFixed(2);
      const feePea = +(revenuePea * 0.1).toFixed(2);
      const code = game === '东方彩票' ? 'LO' : 'BAC';

      bills.push({
        id: `S${yyyymm}-${code}`,
        orderId: `BILL${yyyymm}-${code}`,
        period,
        billType,
        game,
        revenueUsdt,
        revenuePea,
        feeUsdt,
        feePea,
        deductTime: isOverdue ? '—' : monthStart.add(1, 'day').add(gi * 2, 'minute').format('YYYY-MM-DD HH:mm:ss'),
        status: isOverdue ? '待扣' : '已扣',
      });
    });
  }
  return bills;
};

const ALL_BILLS = buildMockBills();

// ── 业务规则：只展示本月+上月 ────────────────────────────────────
const isVisible = (period: string): boolean => {
  const now = dayjs();
  const thisMonth = now.format('YYYY-MM');
  const lastMonth = now.subtract(1, 'month').format('YYYY-MM');
  return period === thisMonth || period === lastMonth;
};

const VISIBLE_BILLS = ALL_BILLS
  .filter((b) => isVisible(b.period))
  // 按账单周期升序排列（旧月在上，符合"先扣旧再扣新"扣款顺序）；同月内按游戏稳定排序
  .sort((a, b) => {
    if (a.period !== b.period) return a.period.localeCompare(b.period);
    return a.game.localeCompare(b.game);
  });

// ── 工具 ─────────────────────────────────────────────────────────
const fmt = (v: number) => v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const Settlement = () => {
  const [billType, setBillType] = useState<'all' | BillType>('all');
  const [status, setStatus] = useState<'all' | DeductStatus>('all');
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);

  const filtered = VISIBLE_BILLS.filter((b) => {
    if (billType !== 'all' && b.billType !== billType) return false;
    if (status !== 'all' && b.status !== status) return false;
    if (range && range[0] && range[1]) {
      const m = dayjs(b.period + '-01');
      if (m.isBefore(range[0].startOf('month')) || m.isAfter(range[1].endOf('month'))) return false;
    }
    return true;
  });

  const columns: ColumnsType<SettlementBill> = [
    { title: '订单编号', dataIndex: 'orderId', width: 170 },
    { title: '账单周期', dataIndex: 'period', width: 110 },
    { title: '账单类型', dataIndex: 'billType', width: 110 },
    { title: '游戏', dataIndex: 'game', width: 110 },
    {
      title: '游戏收益 USDT', dataIndex: 'revenueUsdt', width: 140, align: 'right',
      render: (v: number) => <Text style={{ color: '#141414' }}>{v > 0 ? fmt(v) : '—'}</Text>,
    },
    {
      title: '游戏收益 PEA', dataIndex: 'revenuePea', width: 140, align: 'right',
      render: (v: number) => <Text style={{ color: '#141414' }}>{v > 0 ? fmt(v) : '—'}</Text>,
    },
    {
      title: '应用费用 USDT', dataIndex: 'feeUsdt', width: 140, align: 'right',
      render: (v: number) => <Text style={{ color: '#141414' }}>{v > 0 ? fmt(v) : '—'}</Text>,
    },
    {
      title: '应用费用 PEA', dataIndex: 'feePea', width: 140, align: 'right',
      render: (v: number) => <Text style={{ color: '#141414' }}>{v > 0 ? fmt(v) : '—'}</Text>,
    },
    {
      title: '扣款时间', dataIndex: 'deductTime', width: 180,
      render: (v: string) => <span style={{ whiteSpace: 'nowrap' }}>{v}</span>,
    },
    { title: '扣款状态', dataIndex: 'status', width: 90 },
    {
      title: '操作', width: 100, fixed: 'right' as const,
      render: (_: unknown, r: SettlementBill) => (
        <Button
          type="link" size="small" style={{ padding: 0 }}
          icon={<DownloadOutlined />}
          onClick={() => window.open(`/finance/settlement/preview/${r.orderId}`, '_blank')}
        >
          下载
        </Button>
      ),
    },
  ];

  return (
    <Space direction="vertical" size={12} style={{ display: 'flex', padding: 16 }}>
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
        <Space size={16} wrap align="center">
          <FilterField label="账单周期">
            <RangePicker
              picker="month"
              placeholder={['从', '到']}
              value={range}
              onChange={(v) => setRange(v as [Dayjs, Dayjs] | null)}
            />
          </FilterField>
          <FilterField label="账单类型">
            <ConfigProvider theme={radioTheme}>
              <Radio.Group value={billType} onChange={(e) => setBillType(e.target.value)} buttonStyle="solid">
                <Radio.Button value="all">全部</Radio.Button>
                <Radio.Button value="自动月度">自动月度</Radio.Button>
                <Radio.Button value="手动清账">手动清账</Radio.Button>
              </Radio.Group>
            </ConfigProvider>
          </FilterField>
          <FilterField label="扣款状态">
            <ConfigProvider theme={radioTheme}>
              <Radio.Group value={status} onChange={(e) => setStatus(e.target.value)} buttonStyle="solid">
                <Radio.Button value="all">全部</Radio.Button>
                <Radio.Button value="待扣">待扣</Radio.Button>
                <Radio.Button value="已扣">已扣</Radio.Button>
              </Radio.Group>
            </ConfigProvider>
          </FilterField>
        </Space>
      </Card>
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          size="middle"
          scroll={{ x: 1500 }}
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
          rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
        />
      </Card>
    </Space>
  );
};

export default Settlement;
