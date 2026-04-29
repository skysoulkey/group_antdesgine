/**
 * 【所属模块】集团管理 / 应用费用
 *
 * 【核心定位】集团端汇总展示旗下公司每月按游戏拆分的应用费用
 *
 * 【业务规则（PRD V1.3 + 2026-04-29 调整）】
 * - 行粒度：一月每游戏一行（每月按游戏拆 N 行）
 * - 订单编号：`GBILL{YYYYMM}-{GAME_CODE}`（与公司端对齐）
 * - 公司数量：本期参与该游戏的公司数（按游戏各算各的）
 * - 列表只展示本月+上月数据，更早数据后台保留但不展示
 * - 下载按钮：所有行共享一份月度全集团 PDF（不按游戏拆 PDF）
 *
 * 【依赖接口】
 * - GET /api/enterprise/app-fee — 列表（待对接）
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
type GameType = '东方彩票' | '七星百家乐';

interface GroupAppFee {
  id: string;
  period: string;        // YYYY-MM
  orderId: string;       // GBILL{YYYYMM}-{CODE}
  game: GameType;
  companyCount: number;  // 本期参与该游戏的公司数
  revenueUsdt: number;
  revenuePea: number;
  feeUsdt: number;
  feePea: number;
}

const GAMES: GameType[] = ['东方彩票', '七星百家乐'];

// ── Mock 12 个月（后台保留），前端只展示本月+上月 ────────────────
const buildMockData = (): GroupAppFee[] => {
  const today = dayjs();
  const rows: GroupAppFee[] = [];

  for (let i = 0; i < 12; i += 1) {
    const monthStart = today.subtract(i, 'month').startOf('month');
    const period = monthStart.format('YYYY-MM');
    const yyyymm = period.replace('-', '');

    GAMES.forEach((game) => {
      const code = game === '东方彩票' ? 'LO' : 'BAC';
      const baseRevenue = (game === '东方彩票' ? 38000 : 25000) + i * 1500;
      const revenueUsdt = baseRevenue;
      const revenuePea = i % 2 === 0 ? baseRevenue * 1.4 : 0;
      const feeUsdt = +(revenueUsdt * 0.1).toFixed(2);
      const feePea = +(revenuePea * 0.1).toFixed(2);

      rows.push({
        id: `G${yyyymm}-${code}`,
        period,
        orderId: `GBILL${yyyymm}-${code}`,
        game,
        companyCount: game === '东方彩票' ? 8 + (i % 3) : 6 + (i % 3),
        revenueUsdt,
        revenuePea,
        feeUsdt,
        feePea,
      });
    });
  }
  return rows;
};

const ALL_DATA = buildMockData();

// ── 业务规则：只展示本月+上月，按账单周期升序排列 ───────────────
const isVisible = (period: string): boolean => {
  const now = dayjs();
  const thisMonth = now.format('YYYY-MM');
  const lastMonth = now.subtract(1, 'month').format('YYYY-MM');
  return period === thisMonth || period === lastMonth;
};

const VISIBLE_DATA = ALL_DATA
  .filter((b) => isVisible(b.period))
  .sort((a, b) => {
    if (a.period !== b.period) return a.period.localeCompare(b.period);
    return a.game.localeCompare(b.game);
  });

const fmt = (v: number) => v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const GroupAppFeePage = () => {
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [game, setGame] = useState<'all' | GameType>('all');

  const filtered = VISIBLE_DATA.filter((b) => {
    if (game !== 'all' && b.game !== game) return false;
    if (range && range[0] && range[1]) {
      const m = dayjs(b.period + '-01');
      if (m.isBefore(range[0].startOf('month')) || m.isAfter(range[1].endOf('month'))) return false;
    }
    return true;
  });

  const columns: ColumnsType<GroupAppFee> = [
    { title: '账单周期', dataIndex: 'period', width: 110 },
    { title: '订单编号', dataIndex: 'orderId', width: 170 },
    {
      title: '公司数量', dataIndex: 'companyCount', width: 100, align: 'right',
      render: (v: number) => <Text style={{ color: '#141414' }}>{v}</Text>,
    },
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
      title: '操作', width: 100, fixed: 'right' as const,
      render: (_: unknown, r: GroupAppFee) => (
        <Button
          type="link" size="small" style={{ padding: 0 }}
          icon={<DownloadOutlined />}
          onClick={() => window.open(`/enterprise/app-fee/preview/${r.orderId}`, '_blank')}
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

export default GroupAppFeePage;
