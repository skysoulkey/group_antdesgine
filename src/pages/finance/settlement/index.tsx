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
  orderId: string;          // 订单编号（月度粒度，BILLYYYYMM）
  orderTime: string;        // 订单生成时间（账单周期次月 1 号 10:00:00）
  period: string;           // YYYY-MM（账单周期）
  feeUsdt: number;          // 该月 USDT 应用费用（应收）
  feePea: number;           // 该月 PEA 应用费用（应收）
  status: DeductStatus;
  remark: string;           // 自由文本，后端写入前端只读
}

const GAMES: GameType[] = ['东方彩票', '七星百家乐'];

// ── Mock 12 个月（后台保留），前端只展示本月+上月 ────────────────
// 业务规则：
//   - 每月一条账单（不按游戏拆，订单号 BILLYYYYMM）
//   - 订单时间 = 账单周期次月 1 号 10:00:00（N 月 1 号生成 N-1 月账单）
//   - PRD §7.2 先扣旧再扣新；旧月未结清，新月不会先扣
//   - 状态分布：本月扣款失败演示重试；上月扣款成功；早期月份待扣款
const buildMockBills = (): SettlementBill[] => {
  const today = dayjs();
  const bills: SettlementBill[] = [];

  for (let i = 0; i < 12; i += 1) {
    const periodStart = today.subtract(i, 'month').startOf('month');
    const period = periodStart.format('YYYY-MM');
    const yyyymm = period.replace('-', '');
    // 订单生成时间 = 账单周期次月 1 号 10:00:00
    const orderTime = periodStart.add(1, 'month').format('YYYY-MM-01 10:00:00');

    // 状态分布
    let status: DeductStatus;
    if (i === 0) status = '扣款失败';
    else if (i === 4 || i === 5) status = '待扣款';
    else status = '扣款成功';

    // 多游戏汇总到一条账单（应用费用合并，订单号不再带游戏后缀）
    const baseRevenue = 8000 + i * 500;
    const revenueUsdt = baseRevenue;
    const revenuePea = i % 2 === 0 ? baseRevenue * 1.5 : 0;
    const feeUsdt = +(revenueUsdt * 0.1).toFixed(2);
    const feePea = +(revenuePea * 0.1).toFixed(2);

    let remark = '';
    if (status === '扣款失败') remark = '余额不足，待重试';
    else if (status === '待扣款') remark = '待月初触发扣款';

    bills.push({
      id: `S${yyyymm}`,
      orderId: `BILL${yyyymm}`,
      orderTime,
      period,
      feeUsdt,
      feePea,
      status,
      remark,
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

// 默认排序：账单周期降序（新月在上）
const VISIBLE_BILLS = ALL_BILLS
  .filter((b) => isVisible(b.period))
  .sort((a, b) => b.period.localeCompare(a.period));

const fmt = (v: number) => v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const Settlement = () => {
  const [status, setStatus] = useState<'all' | DeductStatus>('all');
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);

  const filtered = VISIBLE_BILLS.filter((b) => {
    if (status !== 'all' && b.status !== status) return false;
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
    {
      title: '应用费用 USDT', dataIndex: 'feeUsdt', width: 140, align: 'right',
      render: (v: number) => <Text style={{ color: '#141414' }}>{fmt(v ?? 0)}</Text>,
    },
    {
      title: '应用费用 PEA', dataIndex: 'feePea', width: 140, align: 'right',
      render: (v: number) => <Text style={{ color: '#141414' }}>{fmt(v ?? 0)}</Text>,
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
