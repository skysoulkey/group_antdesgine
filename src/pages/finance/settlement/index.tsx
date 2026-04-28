/**
 * 【所属模块】公司财务 / 公司清账
 *
 * 【核心定位】公司端展示平台向本公司收取的应用费用账单清单（按月一行）
 *
 * 【业务规则（PRD V1.3）】
 * - 多币种独立结算，跨币种不合并不汇兑
 * - 扣款全有或全无原则，无部分扣
 * - 一公司一月一份 PDF（含所有币种）
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

interface SettlementBill {
  id: string;
  orderId: string;          // 订单编号（PDF 编号）
  period: string;           // YYYY-MM
  billType: BillType;
  revenueUsdt: number;      // 游戏收益 USDT
  revenuePea: number;       // 游戏收益 PEA
  feeUsdt: number;          // 应用费用 USDT
  feePea: number;           // 应用费用 PEA
  deductTime: string;       // 扣款时间（最后一笔）
  status: DeductStatus;     // 全部币种结清才显示已扣
}

// ── Mock 12 个月（含 2 个欠费场景）────────────────────────────────
const buildMockBills = (): SettlementBill[] => {
  const today = dayjs();
  return Array.from({ length: 12 }, (_, i) => {
    const monthStart = today.subtract(i, 'month').startOf('month');
    const period = monthStart.format('YYYY-MM');
    // 第 3、7 期为欠费（待扣）；其余已扣
    const isOverdue = i === 3 || i === 7;
    // 第 5 期为手动清账
    const billType: BillType = i === 5 ? '手动清账' : '自动月度';

    const revenueUsdt = 8000 + i * 320;
    const revenuePea = i % 2 === 0 ? 12000 + i * 500 : 0; // 部分月份只有 USDT
    const feeUsdt = +(revenueUsdt * 0.1).toFixed(2);
    const feePea = +(revenuePea * 0.1).toFixed(2);

    return {
      id: `S${period.replace('-', '')}`,
      orderId: `BILL${period.replace('-', '')}001`,
      period,
      billType,
      revenueUsdt,
      revenuePea,
      feeUsdt,
      feePea,
      deductTime: isOverdue ? '—' : monthStart.add(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
      status: isOverdue ? '待扣' : '已扣',
    };
  });
};

const MOCK_BILLS = buildMockBills();

// ── 格式化工具 ────────────────────────────────────────────────────
const fmt = (v: number) => v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// 收益单元格："USDT 8,000.00 / PEA 12,000.00"；某币种无则只显示有数据的那个；都为 0 显示 —
const renderRevenue = (_: unknown, r: SettlementBill) => {
  const parts: string[] = [];
  if (r.revenueUsdt > 0) parts.push(`USDT ${fmt(r.revenueUsdt)}`);
  if (r.revenuePea > 0) parts.push(`PEA ${fmt(r.revenuePea)}`);
  return <Text style={{ color: '#141414' }}>{parts.length ? parts.join(' / ') : '—'}</Text>;
};

// 是否在本月或上月范围（PDF 下载条件）
const isDownloadable = (period: string): boolean => {
  const now = dayjs();
  const thisMonth = now.format('YYYY-MM');
  const lastMonth = now.subtract(1, 'month').format('YYYY-MM');
  return period === thisMonth || period === lastMonth;
};

const Settlement = () => {
  const [billType, setBillType] = useState<'all' | BillType>('all');
  const [status, setStatus] = useState<'all' | DeductStatus>('all');
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);

  const filtered = MOCK_BILLS.filter((b) => {
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
    {
      title: '游戏收益', dataIndex: 'revenue', width: 230,
      render: renderRevenue,
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
      render: (_: unknown, r: SettlementBill) =>
        isDownloadable(r.period) ? (
          <Button
            type="link" size="small" style={{ padding: 0 }}
            icon={<DownloadOutlined />}
            onClick={() => window.open(`/finance/settlement/preview/${r.orderId}`, '_blank')}
          >
            下载
          </Button>
        ) : null,
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
          scroll={{ x: 1300 }}
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
          rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
        />
      </Card>
    </Space>
  );
};

export default Settlement;
