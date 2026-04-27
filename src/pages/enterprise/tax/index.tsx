/**
 * 【所属模块】公司财务 / 企业税收
 *
 * 【核心定位】展示集团下所有企业的税费订单清单（公司主、公司财务可见）
 *
 * 【依赖接口】
 * - GET /api/enterprise/tax — 列表（待对接）
 */
import { useState } from 'react';
import { Card, ConfigProvider, DatePicker, Input, Radio, Space, Table, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
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

// ── 数据类型与 mock ───────────────────────────────────────────────
type TaxType = '游戏税收' | '股份税收' | '参股税收';

interface EnterpriseTaxOrder {
  id: number;
  orderTime: string;       // 订单时间
  orderId: string;         // 订单编号
  enterpriseId: string;    // 企业ID
  enterpriseName: string;  // 企业名称
  shareholderId: string;   // 股东ID
  shareholderNickname: string; // 股东昵称
  taxType: TaxType;        // 税费类型
  currency: 'USDT' | 'PEA';// 货币单位
  orderAmount: string;     // 订单金额
  taxFreeAmount: string;   // 免税额度
  platformTaxReceived: string; // 平台实收税费
  companyTaxReceived: string;  // 公司实收税费
}

const TAX_TYPES: TaxType[] = ['游戏税收', '股份税收', '参股税收'];
const ENTERPRISES = [
  { id: 'E283982', name: 'hey' },
  { id: 'E283983', name: 'wow' },
  { id: 'E283984', name: 'boom' },
  { id: 'E283985', name: 'flash' },
  { id: 'E283986', name: 'nova' },
];
const SHAREHOLDERS = [
  { id: 'MB100001', nickname: 'Alice' },
  { id: 'MB100002', nickname: 'Bob' },
  { id: 'MB100003', nickname: 'Cathy' },
  { id: 'MB100004', nickname: 'Daniel' },
  { id: 'MB100005', nickname: 'Eva' },
];

const fmt = (v: number) => v.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const mockData: EnterpriseTaxOrder[] = Array.from({ length: 20 }, (_, i) => {
  const ent = ENTERPRISES[i % ENTERPRISES.length];
  const sh = SHAREHOLDERS[i % SHAREHOLDERS.length];
  const order = 10000 + i * 3217.5;
  const free = 1000 + (i % 5) * 200;
  const taxable = Math.max(order - free, 0);
  const platform = taxable * 0.02;
  const company = taxable * 0.05;
  return {
    id: i + 1,
    orderTime: `2025-11-${String(1 + (i % 28)).padStart(2, '0')} 10:${String(i % 60).padStart(2, '0')}:00`,
    orderId: `TAX2025${String(1120001 + i).padStart(7, '0')}`,
    enterpriseId: ent.id,
    enterpriseName: ent.name,
    shareholderId: sh.id,
    shareholderNickname: sh.nickname,
    taxType: TAX_TYPES[i % TAX_TYPES.length],
    currency: (['USDT', 'PEA'] as const)[i % 2],
    orderAmount: fmt(order),
    taxFreeAmount: fmt(free),
    platformTaxReceived: fmt(platform),
    companyTaxReceived: fmt(company),
  };
});

// ── 时间范围筛选辅助 ──────────────────────────────────────────────
const inRange = (s: string, range: [Dayjs, Dayjs] | null) => {
  if (!range) return true;
  const d = dayjs(s);
  return !d.isBefore(range[0].startOf('day')) && !d.isAfter(range[1].endOf('day'));
};

export default function EnterpriseTax() {
  const [search, setSearch] = useState('');
  const [taxTypeFilter, setTaxTypeFilter] = useState<'all' | TaxType>('all');
  const [orderTimeRange, setOrderTimeRange] = useState<[Dayjs, Dayjs] | null>(null);

  const filtered = mockData.filter((r) => {
    const kw = search.trim().toLowerCase();
    const hitKw =
      !kw ||
      r.orderId.toLowerCase().includes(kw) ||
      r.enterpriseName.toLowerCase().includes(kw) ||
      r.shareholderNickname.toLowerCase().includes(kw);
    const hitType = taxTypeFilter === 'all' || r.taxType === taxTypeFilter;
    const hitTime = inRange(r.orderTime, orderTimeRange);
    return hitKw && hitType && hitTime;
  });

  const columns: ColumnsType<EnterpriseTaxOrder> = [
    { title: '订单时间', dataIndex: 'orderTime', width: 170, render: (v) => <span style={{ whiteSpace: 'nowrap' }}>{v}</span> },
    { title: '订单编号', dataIndex: 'orderId', width: 180 },
    { title: '企业ID', dataIndex: 'enterpriseId', width: 110 },
    { title: '企业名称', dataIndex: 'enterpriseName', width: 110 },
    { title: '股东ID', dataIndex: 'shareholderId', width: 110 },
    { title: '股东昵称', dataIndex: 'shareholderNickname', width: 110 },
    { title: '税费类型', dataIndex: 'taxType', width: 100 },
    { title: '货币单位', dataIndex: 'currency', width: 90 },
    {
      title: '订单金额', dataIndex: 'orderAmount', width: 130, align: 'right',
      render: (v: string) => <Text style={{ color: '#141414' }}>{v}</Text>,
    },
    {
      title: '免税额度', dataIndex: 'taxFreeAmount', width: 130, align: 'right',
      render: (v: string) => <Text style={{ color: '#141414' }}>{v}</Text>,
    },
    {
      title: '平台实收税费', dataIndex: 'platformTaxReceived', width: 140, align: 'right',
      render: (v: string) => <Text style={{ color: '#141414' }}>{v}</Text>,
    },
    {
      title: '公司实收税费', dataIndex: 'companyTaxReceived', width: 140, align: 'right',
      fixed: 'right' as const,
      render: (v: string) => <Text style={{ color: '#141414' }}>{v}</Text>,
    },
  ];

  return (
    <Space direction="vertical" size={12} style={{ display: 'flex' }}>
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
        <Space size={16} wrap align="center">
          <FilterField label="订单编号">
            <Input
              suffix={<SearchOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
              placeholder="订单编号 / 企业名称 / 股东昵称"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              style={{ width: 280 }}
            />
          </FilterField>
          <FilterField label="税费类型">
            <ConfigProvider theme={radioTheme}>
              <Radio.Group
                buttonStyle="solid"
                value={taxTypeFilter}
                onChange={(e) => setTaxTypeFilter(e.target.value)}
              >
                <Radio.Button value="all">全部</Radio.Button>
                {TAX_TYPES.map((t) => (
                  <Radio.Button key={t} value={t}>{t}</Radio.Button>
                ))}
              </Radio.Group>
            </ConfigProvider>
          </FilterField>
          <FilterField label="订单时间">
            <RangePicker
              placeholder={['从', '到']}
              onChange={(v) => setOrderTimeRange(v as [Dayjs, Dayjs] | null)}
            />
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
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条`, showSizeChanger: true }}
          rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
        />
      </Card>
    </Space>
  );
}
