import { DownloadOutlined, FundOutlined } from '@ant-design/icons';
import { Button, Card, Col, DatePicker, Descriptions, message, Row, Select, Space, Table, Tabs, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useCallback, useRef, useState } from 'react';

import TableToolbar from '../../../components/TableToolbar';

const { Text } = Typography;

const CARD_SHADOW = '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)';

// ── 月度贡献单数据 ──────────────────────────────────────────────────
interface MonthlyContrib {
  id: string;
  companyName: string;
  companyId: string;
  manager: string;
  period: string;
  totalRevenueUsdt: string;
  extractableUsdt: string;
  totalRevenuePea: string;
  extractablePea: string;
  taxUsdt: string;
  taxPea: string;
  lotteryPnl: string;
  shareholdDividend: string;
  commission: string;
  dividendTax: string;
  shareRelease: string;
  shareReleaseTax: string;
  surrenderShareTax: string;
  surrenderDividendTax: string;
}

const mockMonthly: MonthlyContrib[] = Array.from({ length: 6 }, (_, i) => ({
  id: `MC${String(i + 1).padStart(5, '0')}`,
  companyName: ['炸雷第一波', 'Nova Entertainment', 'Flash Gaming'][i % 3],
  companyId: `43215321${430 + i}`,
  manager: ['miya', 'tom', 'alice'][i % 3],
  period: `2026-0${6 - i}`,
  totalRevenueUsdt: `${(725234 + i * 50000).toLocaleString()}.00`,
  extractableUsdt: `${(680000 + i * 45000).toLocaleString()}.00`,
  totalRevenuePea: `${(150000 + i * 20000).toLocaleString()}.00`,
  extractablePea: `${(140000 + i * 18000).toLocaleString()}.00`,
  taxUsdt: `${(36261 + i * 2500).toLocaleString()}.00`,
  taxPea: `${(7500 + i * 1000).toLocaleString()}.00`,
  lotteryPnl: i % 3 === 1 ? `-${(12000 + i * 1500).toLocaleString()}.00` : `${(45000 + i * 8000).toLocaleString()}.00`,
  shareholdDividend: `${(35000 + i * 5000).toLocaleString()}.00`,
  commission: `${(8200 + i * 1200).toLocaleString()}.00`,
  dividendTax: `${(3500 + i * 500).toLocaleString()}.00`,
  shareRelease: `${(15000 + i * 2000).toLocaleString()}.00`,
  shareReleaseTax: `${(750 + i * 100).toLocaleString()}.00`,
  surrenderShareTax: `${(750 + i * 100).toLocaleString()}.00`,
  surrenderDividendTax: `${(2800 + i * 400).toLocaleString()}.00`,
}));

// ── 贡献明细单数据 ──────────────────────────────────────────────────
interface DetailRow {
  id: string;
  period: string;
  category: string;
  item: string;
  currency: string;
  amount: string;
  remark: string;
}

const mockDetail: DetailRow[] = [
  { id: 'D001', period: '2026-06', category: '彩票收益', item: '公司东方彩票盈亏', currency: 'USDT', amount: '45,000.00', remark: '' },
  { id: 'D002', period: '2026-06', category: '股份收益', item: '公司股份分红收益', currency: 'USDT', amount: '35,000.00', remark: '' },
  { id: 'D003', period: '2026-06', category: '返佣收益', item: '公司收到返佣', currency: 'USDT', amount: '8,200.00', remark: '' },
  { id: 'D004', period: '2026-06', category: '股份释放', item: '公司股份释放收益', currency: 'USDT', amount: '15,000.00', remark: '' },
  { id: 'D005', period: '2026-06', category: '税费支出', item: '公司股份分红税', currency: 'USDT', amount: '-3,500.00', remark: '' },
  { id: 'D006', period: '2026-06', category: '税费支出', item: '公司股份释放收益税', currency: 'USDT', amount: '-750.00', remark: '' },
  { id: 'D007', period: '2026-06', category: '税费支出', item: '上缴股份释放所得税', currency: 'USDT', amount: '-750.00', remark: '' },
  { id: 'D008', period: '2026-06', category: '税费支出', item: '上缴企业分红税', currency: 'USDT', amount: '-2,800.00', remark: '' },
  { id: 'D009', period: '2026-06', category: '彩票收益', item: '公司东方彩票盈亏', currency: 'PEA', amount: '18,000.00', remark: '' },
  { id: 'D010', period: '2026-06', category: '股份收益', item: '公司股份分红收益', currency: 'PEA', amount: '12,000.00', remark: '' },
];

// ── 划转收益数据 ──────────────────────────────────────────────────
interface TransferRow {
  id: string;
  transferTime: string;
  direction: '划入' | '划出';
  currency: string;
  amount: string;
  beforeBalance: string;
  afterBalance: string;
  operator: string;
  remark: string;
}

const mockTransfer: TransferRow[] = Array.from({ length: 8 }, (_, i) => ({
  id: `TR${String(i + 1).padStart(7, '0')}`,
  transferTime: `2026-0${(i % 3) + 1}-${String(i + 1).padStart(2, '0')} 14:00:00`,
  direction: i % 3 === 2 ? '划出' : '划入',
  currency: i % 2 === 0 ? 'USDT' : 'PEA',
  amount: `${(10000 + i * 8000).toLocaleString()}.00`,
  beforeBalance: `${(80000 + i * 5000).toLocaleString()}.00`,
  afterBalance: `${(90000 + i * 5000).toLocaleString()}.00`,
  operator: ['Admin', 'FinanceManager', 'SuperAdmin'][i % 3],
  remark: i % 2 === 0 ? '月度收益划转' : '集团指令',
}));

// ── 统计卡片组件 ──────────────────────────────────────────────────
const StatCard: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color = '#141414' }) => (
  <Card bordered={false} size="small" style={{ borderRadius: 8, background: '#fafafa' }}>
    <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 18, fontWeight: 700, color }}>{value}</div>
  </Card>
);

// ── 主组件 ────────────────────────────────────────────────────────
const CompanyRevenuePage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRefresh = useCallback(() => { message.success('已刷新'); }, []);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2026-06');
  const [detailPeriod, setDetailPeriod] = useState<string | undefined>();

  const current = mockMonthly.find((r) => r.period === selectedPeriod) ?? mockMonthly[0];

  const detailFiltered = mockDetail.filter((r) => !detailPeriod || r.period === detailPeriod);

  const detailColumns: ColumnsType<DetailRow> = [
    { title: '汇算周期', dataIndex: 'period', width: 110 },
    { title: '收益类别', dataIndex: 'category', width: 100 },
    { title: '明细项目', dataIndex: 'item', width: 200 },
    { title: '货币单位', dataIndex: 'currency', width: 80 },
    {
      title: '金额', dataIndex: 'amount', width: 130, align: 'right',
      render: (v: string) => (
        <Text style={{ color: '#141414' }}>{v}</Text>
      ),
    },
    { title: '备注', dataIndex: 'remark', width: 120 },
  ];

  const transferColumns: ColumnsType<TransferRow> = [
    { title: '划转时间', dataIndex: 'transferTime', width: 170 },
    { title: '方向', dataIndex: 'direction', width: 80 },
    { title: '货币单位', dataIndex: 'currency', width: 80 },
    { title: '划转金额', dataIndex: 'amount', width: 130, align: 'right', render: (v) => <Text>{v}</Text> },
    { title: '划转前余额', dataIndex: 'beforeBalance', width: 130, align: 'right' },
    { title: '划转后余额', dataIndex: 'afterBalance', width: 130, align: 'right' },
    { title: '操作人', dataIndex: 'operator', width: 120 },
    { title: '备注', dataIndex: 'remark', width: 120 },
  ];

  const tabItems = [
    {
      key: 'monthly',
      label: '月度贡献单',
      children: (
        <div>
          {/* 基础信息 + 操作栏 */}
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <Descriptions column={{ xs: 1, sm: 3 }} size="small">
                <Descriptions.Item label="公司名称">{current.companyName}</Descriptions.Item>
                <Descriptions.Item label="公司ID">{current.companyId}</Descriptions.Item>
                <Descriptions.Item label="公司负责人">{current.manager}</Descriptions.Item>
              </Descriptions>
              <Space>
                <DatePicker
                  picker="month"
                  placeholder="汇算周期"
                  defaultValue={undefined}
                  onChange={(_, v) => setSelectedPeriod(v as string)}
                  style={{ width: 140 }}
                />
                <Button icon={<DownloadOutlined />} type="primary">导出</Button>
              </Space>
            </div>
          </Card>

          {/* 公司贡献盈亏汇总 */}
          <Card
            bordered={false}
            style={{ borderRadius: 12, boxShadow: CARD_SHADOW, marginBottom: 16 }}
            title={<span style={{ fontSize: 14, fontWeight: 600 }}>公司贡献盈亏汇总</span>}
            extra={<Text type="secondary" style={{ fontSize: 12 }}>汇算周期：{current.period}</Text>}
          >
            <Row gutter={[12, 12]}>
              <Col xs={12} sm={6}>
                <StatCard label="本月综合收益（USDT）" value={current.totalRevenueUsdt} color="#141414" />
              </Col>
              <Col xs={12} sm={6}>
                <StatCard label="公司可提取收益（USDT）" value={current.extractableUsdt} color="#141414" />
              </Col>
              <Col xs={12} sm={6}>
                <StatCard label="本月综合收益（PEA）" value={current.totalRevenuePea} color="#141414" />
              </Col>
              <Col xs={12} sm={6}>
                <StatCard label="公司可提取收益（PEA）" value={current.extractablePea} color="#141414" />
              </Col>
            </Row>

            <div style={{ marginTop: 16, padding: '12px 0', borderTop: '1px solid #f0f0f0' }}>
              <Row gutter={[12, 8]}>
                {[
                  { label: '公司东方彩票盈亏', value: current.lotteryPnl, colored: true },
                  { label: '公司股份分红收益', value: current.shareholdDividend },
                  { label: '公司收到返佣', value: current.commission },
                  { label: '公司股份释放收益', value: current.shareRelease },
                ].map((item) => (
                  <Col xs={12} sm={6} key={item.label}>
                    <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>{item.label}</div>
                    <div style={{
                      fontSize: 15, fontWeight: 600,
                      color: '#141414',
                    }}>{item.value}</div>
                  </Col>
                ))}
              </Row>
            </div>
          </Card>

          {/* 企业上缴税费贡献汇总 */}
          <Card
            bordered={false}
            style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}
            title={<span style={{ fontSize: 14, fontWeight: 600 }}>企业上缴税费贡献汇总</span>}
          >
            <Row gutter={[12, 12]}>
              <Col xs={12} sm={6}>
                <StatCard label="纳税支出（USDT）" value={current.taxUsdt} color="#141414" />
              </Col>
              <Col xs={12} sm={6}>
                <StatCard label="纳税支出（PEA）" value={current.taxPea} color="#141414" />
              </Col>
            </Row>
            <div style={{ marginTop: 16, padding: '12px 0', borderTop: '1px solid #f0f0f0' }}>
              <Row gutter={[12, 8]}>
                {[
                  { label: '公司股份分红税', value: current.dividendTax },
                  { label: '公司股份释放收益税', value: current.shareReleaseTax },
                  { label: '上缴股份释放所得税', value: current.surrenderShareTax },
                  { label: '上缴企业分红税', value: current.surrenderDividendTax },
                ].map((item) => (
                  <Col xs={12} sm={6} key={item.label}>
                    <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>{item.label}</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#141414' }}>{item.value}</div>
                  </Col>
                ))}
              </Row>
            </div>
          </Card>
        </div>
      ),
    },
    {
      key: 'detail',
      label: '贡献明细单',
      children: (
        <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
          <Space style={{ marginBottom: 16 }} wrap>
            <Select
              placeholder="公司名称"
              allowClear
              style={{ width: 160 }}
              options={[...new Set(mockMonthly.map((r) => r.companyName))].map((n) => ({ value: n, label: n }))}
            />
            <DatePicker picker="month" placeholder="汇算周期" onChange={(_, v) => setDetailPeriod(v as string)} style={{ width: 140 }} />
            <Select
              placeholder="收益类别"
              allowClear
              style={{ width: 130 }}
              options={['彩票收益', '股份收益', '返佣收益', '股份释放', '税费支出'].map((c) => ({ value: c, label: c }))}
            />
            <Select
              placeholder="货币单位"
              allowClear
              style={{ width: 110 }}
              options={[{ value: 'USDT', label: 'USDT' }, { value: 'PEA', label: 'PEA' }]}
            />
          </Space>
          <Table
            columns={detailColumns}
            dataSource={detailFiltered}
            rowKey="id"
            size="middle"
            pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
            rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
          />
        </Card>
      ),
    },
    {
      key: 'transfer',
      label: '划转收益',
      children: (
        <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
            <Card bordered={false} size="small" style={{ borderRadius: 8, background: '#f0f7ff', minWidth: 180 }}>
              <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', marginBottom: 4 }}>累计划入（USDT）</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#141414' }}>
                {mockTransfer.filter((r) => r.direction === '划入' && r.currency === 'USDT')
                  .reduce((s, r) => s + parseFloat(r.amount.replace(/,/g, '')), 0)
                  .toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
            </Card>
            <Card bordered={false} size="small" style={{ borderRadius: 8, background: '#fff7e6', minWidth: 180 }}>
              <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', marginBottom: 4 }}>累计划出（USDT）</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#141414' }}>
                {mockTransfer.filter((r) => r.direction === '划出' && r.currency === 'USDT')
                  .reduce((s, r) => s + parseFloat(r.amount.replace(/,/g, '')), 0)
                  .toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
            </Card>
          </div>
          <Table
            columns={transferColumns}
            dataSource={mockTransfer}
            rowKey="id"
            size="middle"
            scroll={{ x: 1000 }}
            pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
            rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
          />
        </Card>
      ),
    },
  ];

  return (
    <div ref={containerRef} style={{ marginTop: -16 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <TableToolbar onRefresh={handleRefresh} containerRef={containerRef} />
      </div>
      <Tabs
        items={tabItems}
        tabBarStyle={{
          background: '#fff',
          margin: '0 -24px',
          padding: '0 24px',
        }}
      />
    </div>
  );
};

export default CompanyRevenuePage;
