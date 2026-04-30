/**
 * 【所属模块】集团管理 / 应用费用
 *
 * 【核心定位】集团端聚合展示旗下公司每月应用费用账单
 *
 * 【业务规则（PRD V1.3 + 2026-04-30 调整）】
 * - 行粒度：每月一行（多公司多游戏全部聚合）
 * - 集团不直接支付应用费用 → 不展示扣款状态、不展示订单编号
 * - 列表只展示本月+上月数据，更早数据后台保留但不展示
 * - 订单时间：账单周期次月 1 号 10:00:00（与公司端一致）
 *
 * 【依赖接口】
 * - GET /api/enterprise/app-fee — 列表（待对接）
 */
import { useState as _useState } from 'react';
import { Button, Card, Space, Table, Typography } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Text } = Typography;

const CARD_SHADOW = '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)';

// ── 数据类型 ─────────────────────────────────────────────────────
interface GroupAppFee {
  id: string;
  orderTime: string;     // 次月 1 号 10:00:00
  period: string;        // YYYY-MM
  companyCount: number;
  feeUsdt: number;       // 全集团 USDT 应用费汇总
  feePea: number;        // 全集团 PEA 应用费汇总
  remark: string;
}

// ── Mock 12 个月（后台保留），前端只展示本月+上月 ────────────────
const buildMockData = (): GroupAppFee[] => {
  const today = dayjs();
  return Array.from({ length: 12 }, (_, i) => {
    const periodStart = today.subtract(i, 'month').startOf('month');
    const period = periodStart.format('YYYY-MM');
    const yyyymm = period.replace('-', '');
    const orderTime = periodStart.add(1, 'month').format('YYYY-MM-01 10:00:00');

    // 全集团聚合：基础值 × 公司数估算（mock 演示用）
    const baseUsdt = 38000 + i * 1500;
    const basePea = i % 2 === 0 ? (38000 + i * 1500) * 1.4 : 0;
    const companyCount = 8 + (i % 4);
    const feeUsdt = +(baseUsdt * 0.1 * companyCount).toFixed(2);
    const feePea = +(basePea * 0.1 * companyCount).toFixed(2);

    return {
      id: `G${yyyymm}`,
      orderTime,
      period,
      companyCount,
      feeUsdt,
      feePea,
      remark: '',
    };
  });
};

const ALL_DATA = buildMockData();

const isVisible = (period: string): boolean => {
  const now = dayjs();
  const thisMonth = now.format('YYYY-MM');
  const lastMonth = now.subtract(1, 'month').format('YYYY-MM');
  return period === thisMonth || period === lastMonth;
};

// 默认排序：账单周期降序（新月在上）
const VISIBLE_DATA = ALL_DATA
  .filter((b) => isVisible(b.period))
  .sort((a, b) => b.period.localeCompare(a.period));

const fmt = (v: number) => v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const GroupAppFeePage = () => {
  const filtered = VISIBLE_DATA;

  // 集团端总能下载（业务约定本月+上月）
  const isDownloadable = (period: string): boolean => {
    const now = dayjs();
    return period === now.format('YYYY-MM') || period === now.subtract(1, 'month').format('YYYY-MM');
  };

  const columns: ColumnsType<GroupAppFee> = [
    {
      title: '订单时间', dataIndex: 'orderTime', width: 170,
      render: (v: string) => <span style={{ whiteSpace: 'nowrap' }}>{v}</span>,
    },
    { title: '账单周期', dataIndex: 'period', width: 110 },
    {
      title: '公司数量', dataIndex: 'companyCount', width: 100, align: 'right',
      render: (v: number) => <Text style={{ color: '#141414' }}>{v}</Text>,
    },
    {
      title: '应用费用 USDT', dataIndex: 'feeUsdt', width: 160, align: 'right',
      render: (v: number) => <Text style={{ color: '#141414' }}>{fmt(v ?? 0)}</Text>,
    },
    {
      title: '应用费用 PEA', dataIndex: 'feePea', width: 160, align: 'right',
      render: (v: number) => <Text style={{ color: '#141414' }}>{fmt(v ?? 0)}</Text>,
    },
    { title: '备注', dataIndex: 'remark', width: 180, ellipsis: true, render: (v: string) => v || '—' },
    {
      title: '操作', width: 100, fixed: 'right' as const,
      render: (_: unknown, r: GroupAppFee) =>
        isDownloadable(r.period) ? (
          <Button
            type="link" size="small" style={{ padding: 0 }}
            icon={<DownloadOutlined />}
            onClick={() => window.open(`/enterprise/app-fee/preview/GBILL${r.period.replace('-', '')}`, '_blank')}
          >
            下载
          </Button>
        ) : null,
    },
  ];

  return (
    <Space direction="vertical" size={12} style={{ display: 'flex', padding: 16 }}>
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          size="middle"
          scroll={{ x: 1100 }}
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
          rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
        />
      </Card>
    </Space>
  );
};

export default GroupAppFeePage;
