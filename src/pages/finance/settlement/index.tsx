/**
 * 【所属模块】公司财务 / 公司清账
 *
 * 【核心定位】公司端展示平台向本公司收取的应用费用账单清单（按游戏拆行）
 *
 * 【业务规则（PRD V1.3 + 2026-04-30 调整）】
 * - 行粒度：账单周期 × 公司 × 游戏（每游戏一行；多币种同行 USDT/PEA 双列）
 * - 单表，不分 Tab
 * - 列表只展示本月+上月数据，更早数据后台保留但不展示
 * - 扣款状态 3 态：待扣款 / 扣款成功 / 扣款失败
 * - PRD §7.2 先扣旧再扣新；旧月未结清，新月不会先扣
 * - 应用费金额始终展示应收口径（不因失败变 0），状态由「扣款状态」列承担
 * - 操作列：[预览账单 PDF] 始终在 + [手动扣款] 仅扣款失败显示
 *
 * 【依赖接口】
 * - GET /api/finance/settlement — 列表（待对接）
 * - POST /api/finance/settlement/{orderId}/manual-deduct — 手动扣款（待对接）
 */
import { useState } from 'react';
import { Button, Card, ConfigProvider, DatePicker, message, Radio, Space, Table, Typography } from 'antd';
import { EyeOutlined, RedoOutlined } from '@ant-design/icons';
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
type DeductStatus = '待扣款' | '扣款成功' | '扣款失败';
type GameType = '东方彩票' | '七星百家乐';

interface SettlementBill {
  id: string;
  orderId: string;          // 订单编号（游戏粒度，如 BILL202604-LO）
  orderTime: string;        // 订单生成时间
  period: string;           // YYYY-MM
  game: GameType;
  feeUsdt: number;          // 该游戏 USDT 应用费用（应收）
  feePea: number;           // 该游戏 PEA 应用费用（应收）
  status: DeductStatus;
  remark: string;           // 自由文本，后端写入前端只读
}

const GAMES: GameType[] = ['东方彩票', '七星百家乐'];

// ── Mock 12 个月（后台保留），前端只展示本月+上月 ────────────────
// 业务规则（PRD §7.2）：先扣旧再扣新；旧月未结清，新月不会先扣
// 本期场景：本月 2026-04 扣款失败（业务正常），上月 2026-03 扣款成功
const buildMockBills = (): SettlementBill[] => {
  const today = dayjs();
  const bills: SettlementBill[] = [];

  for (let i = 0; i < 12; i += 1) {
    const monthStart = today.subtract(i, 'month').startOf('month');
    const period = monthStart.format('YYYY-MM');
    const yyyymm = period.replace('-', '');

    // 状态分布：
    //   i === 0（本月）→ 扣款失败（演示重试场景）
    //   i === 4 / 5（早期）→ 待扣款（演示欠费跨月）
    //   其余 → 扣款成功
    let status: DeductStatus;
    if (i === 0) status = '扣款失败';
    else if (i === 4 || i === 5) status = '待扣款';
    else status = '扣款成功';

    GAMES.forEach((game, gi) => {
      const baseRevenue = (game === '东方彩票' ? 4800 : 3200) + i * 200;
      const revenueUsdt = baseRevenue;
      const revenuePea = i % 2 === 0 ? baseRevenue * 1.5 : 0;
      const feeUsdt = +(revenueUsdt * 0.1).toFixed(2);
      const feePea = +(revenuePea * 0.1).toFixed(2);
      const code = game === '东方彩票' ? 'LO' : 'BAC';
      const orderTime = monthStart.add(1, 'day').add(gi * 2, 'minute').format('YYYY-MM-DD HH:mm:ss');

      // 备注（mock 演示用，真实由后端写）
      let remark = '';
      if (status === '扣款失败') remark = '余额不足，待重试';
      else if (status === '待扣款') remark = '待月初触发扣款';

      bills.push({
        id: `S${yyyymm}-${code}`,
        orderId: `BILL${yyyymm}-${code}`,
        orderTime,
        period,
        game,
        feeUsdt,
        feePea,
        status,
        remark,
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

// 默认排序：账单周期降序（新月在上，符合常规列表习惯）；同月按游戏稳定排序
const VISIBLE_BILLS = ALL_BILLS
  .filter((b) => isVisible(b.period))
  .sort((a, b) => {
    if (a.period !== b.period) return b.period.localeCompare(a.period);
    return a.game.localeCompare(b.game);
  });

const fmt = (v: number) => v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const Settlement = () => {
  const [status, setStatus] = useState<'all' | DeductStatus>('all');
  const [game, setGame] = useState<'all' | GameType>('all');
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);

  const filtered = VISIBLE_BILLS.filter((b) => {
    if (status !== 'all' && b.status !== status) return false;
    if (game !== 'all' && b.game !== game) return false;
    if (range && range[0] && range[1]) {
      const m = dayjs(b.period + '-01');
      if (m.isBefore(range[0].startOf('month')) || m.isAfter(range[1].endOf('month'))) return false;
    }
    return true;
  });

  // 手动扣款（占位）
  const handleManualDeduct = (r: SettlementBill) => {
    message.info(`已发起手动扣款（${r.orderId}），待后端联调`);
  };

  const columns: ColumnsType<SettlementBill> = [
    {
      title: '订单时间', dataIndex: 'orderTime', width: 170,
      render: (v: string) => <span style={{ whiteSpace: 'nowrap' }}>{v}</span>,
    },
    { title: '订单号', dataIndex: 'orderId', width: 170 },
    { title: '账单周期', dataIndex: 'period', width: 110 },
    { title: '游戏', dataIndex: 'game', width: 110 },
    {
      title: '应用费用 USDT', dataIndex: 'feeUsdt', width: 140, align: 'right',
      render: (v: number) => <Text style={{ color: '#141414' }}>{v > 0 ? fmt(v) : '—'}</Text>,
    },
    {
      title: '应用费用 PEA', dataIndex: 'feePea', width: 140, align: 'right',
      render: (v: number) => <Text style={{ color: '#141414' }}>{v > 0 ? fmt(v) : '—'}</Text>,
    },
    { title: '扣款状态', dataIndex: 'status', width: 100 },
    { title: '备注', dataIndex: 'remark', width: 180, ellipsis: true,
      render: (v: string) => v || '—' },
    {
      title: '操作', width: 180, fixed: 'right' as const,
      render: (_: unknown, r: SettlementBill) => (
        <Space size={8}>
          <Button
            type="link" size="small" style={{ padding: 0 }}
            icon={<EyeOutlined />}
            onClick={() => window.open(`/finance/settlement/preview/${r.orderId}`, '_blank')}
          >
            预览账单
          </Button>
          {r.status === '扣款失败' && (
            <Button
              type="link" size="small" style={{ padding: 0 }}
              icon={<RedoOutlined />}
              onClick={() => handleManualDeduct(r)}
            >
              手动扣款
            </Button>
          )}
        </Space>
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
          <FilterField label="游戏">
            <ConfigProvider theme={radioTheme}>
              <Radio.Group value={game} onChange={(e) => setGame(e.target.value)} buttonStyle="solid">
                <Radio.Button value="all">全部</Radio.Button>
                {GAMES.map((g) => (
                  <Radio.Button key={g} value={g}>{g}</Radio.Button>
                ))}
              </Radio.Group>
            </ConfigProvider>
          </FilterField>
          <FilterField label="扣款状态">
            <ConfigProvider theme={radioTheme}>
              <Radio.Group value={status} onChange={(e) => setStatus(e.target.value)} buttonStyle="solid">
                <Radio.Button value="all">全部</Radio.Button>
                <Radio.Button value="待扣款">待扣款</Radio.Button>
                <Radio.Button value="扣款成功">扣款成功</Radio.Button>
                <Radio.Button value="扣款失败">扣款失败</Radio.Button>
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
