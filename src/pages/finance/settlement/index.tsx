/**
 * 【所属模块】公司财务 / 公司清账
 *
 * 【核心定位】公司端展示平台向本公司收取的应用费用账单清单
 *
 * 【业务规则（PRD V1.3 + 2026-04-30 调整）】
 * - 行粒度：账单周期 × 币种（一个账单周期内，一个货币类型生成一笔订单）
 * - 订单号格式：BILL{YYYYMM}-{CURRENCY}（如 BILL202604-USDT / BILL202604-PEA）
 * - 订单时间：账单周期次月 1 号 10:00:00（N 月 1 号 10:00 生成 N-1 月账单）
 * - 列表只展示本月+上月数据，更早数据后台保留但不展示
 * - 扣款状态 3 态：待扣款 / 扣款成功 / 扣款失败
 * - PRD §7.2 先扣旧再扣新；旧月未结清，新月不会先扣
 * - 应用费金额始终展示应收口径，状态由「扣款状态」列承担
 * - 操作列：[预览账单 PDF] 始终在 + [手动扣款] 仅扣款失败显示
 *
 * 【依赖接口】
 * - GET /api/finance/settlement — 列表（待对接）
 * - POST /api/finance/settlement/{orderId}/manual-deduct — 手动扣款（待对接）
 */
import { useState } from 'react';
import { Button, Card, ConfigProvider, message, Radio, Space, Table, Typography } from 'antd';
import { EyeOutlined, RedoOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import FilterField from '../../../components/FilterField';

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
type Currency = 'USDT' | 'PEA';

interface SettlementBill {
  id: string;
  orderId: string;          // 订单编号 BILL{YYYYMM}-{CURRENCY}
  orderTime: string;        // 订单生成时间（次月 1 号 10:00:00）
  period: string;           // YYYY-MM
  fee: number;              // 应用费用（按行的货币类型计）
  currency: Currency;       // 货币类型
  status: DeductStatus;
  remark: string;           // 自由文本，后端写入前端只读
}

const CURRENCIES: Currency[] = ['USDT', 'PEA'];

// ── Mock 12 个月（后台保留），前端只展示本月+上月 ────────────────
// 业务规则：
//   - 一个账单周期内，每个货币类型生成一笔订单（一月最多 N 行，N = 币种数）
//   - 订单时间 = 账单周期次月 1 号 10:00:00
//   - PRD §7.2 先扣旧再扣新；旧月未结清，新月不会先扣
//   - 状态分布：本月扣款失败演示重试；上月扣款成功；早期月份待扣款
const buildMockBills = (): SettlementBill[] => {
  const today = dayjs();
  const bills: SettlementBill[] = [];

  for (let i = 0; i < 12; i += 1) {
    const periodStart = today.subtract(i, 'month').startOf('month');
    const period = periodStart.format('YYYY-MM');
    const yyyymm = period.replace('-', '');
    const orderTime = periodStart.add(1, 'month').format('YYYY-MM-01 10:00:00');

    let status: DeductStatus;
    if (i === 0) status = '扣款失败';
    else if (i === 4 || i === 5) status = '待扣款';
    else status = '扣款成功';

    let remark = '';
    if (status === '扣款失败') remark = '余额不足，待重试';
    else if (status === '待扣款') remark = '待月初触发扣款';

    CURRENCIES.forEach((currency) => {
      const baseRevenue = currency === 'USDT' ? 8000 + i * 500 : (i % 2 === 0 ? (8000 + i * 500) * 1.5 : 0);
      const fee = +(baseRevenue * 0.1).toFixed(2);

      bills.push({
        id: `S${yyyymm}-${currency}`,
        orderId: `BILL${yyyymm}-${currency}`,
        orderTime,
        period,
        fee,
        currency,
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

// 默认排序：账单周期降序（新月在上），同月按币种稳定排序（USDT 在前）
const VISIBLE_BILLS = ALL_BILLS
  .filter((b) => isVisible(b.period))
  .sort((a, b) => {
    if (a.period !== b.period) return b.period.localeCompare(a.period);
    return a.currency.localeCompare(b.currency);
  });

const fmt = (v: number) => v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const Settlement = () => {
  const [status, setStatus] = useState<'all' | DeductStatus>('all');

  const filtered = VISIBLE_BILLS.filter((b) => {
    if (status !== 'all' && b.status !== status) return false;
    return true;
  });

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
      title: '应用费用', dataIndex: 'fee', width: 140, align: 'right',
      render: (v: number) => <Text style={{ color: '#141414' }}>{fmt(v ?? 0)}</Text>,
    },
    { title: '货币类型', dataIndex: 'currency', width: 100 },
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
          scroll={{ x: 1300 }}
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
          rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
        />
      </Card>
    </Space>
  );
};

export default Settlement;
