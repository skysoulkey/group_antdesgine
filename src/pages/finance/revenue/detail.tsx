import { ArrowLeftOutlined, DownloadOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'umi';

const { Text, Title } = Typography;

const CARD_SHADOW = '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)';

// ── Mock 数据 ─────────────────────────────────────────────────────
const MONTHS = ['2026-02', '2026-01', '2025-12', '2025-11', '2025-10'];

interface CompanyContrib {
  key: string;
  company: string;
  transferRevenue: string;
  shareRevenue: string;
  gameRevenue: string;
  commissionRevenue: string;
  total: string;
}

const companyContribData: CompanyContrib[] = [
  { key: '1', company: '公司一', transferRevenue: '200,000.00', shareRevenue: '50,000.00', gameRevenue: '80,000.00', commissionRevenue: '20,000.00', total: '350,000.00' },
  { key: '2', company: '公司二', transferRevenue: '180,000.00', shareRevenue: '45,000.00', gameRevenue: '60,000.00', commissionRevenue: '18,000.00', total: '303,000.00' },
  { key: '3', company: '公司三', transferRevenue: '150,000.00', shareRevenue: '30,000.00', gameRevenue: '40,000.00', commissionRevenue: '12,000.00', total: '232,000.00' },
  { key: '4', company: '公司四', transferRevenue: '120,000.00', shareRevenue: '25,000.00', gameRevenue: '35,000.00', commissionRevenue: '10,000.00', total: '190,000.00' },
  { key: 'total', company: '总计贡献', transferRevenue: '650,000.00', shareRevenue: '150,000.00', gameRevenue: '215,000.00', commissionRevenue: '60,000.00', total: '1,075,000.00' },
];

interface RevenueDetail {
  key: string;
  type: string;
  amount: string;
  currency: string;
  month: string;
}

const revenueDetailData: RevenueDetail[] = [
  { key: '1', type: '公司东方彩票盈亏', amount: '215,000.00', currency: 'USDT', month: '2026-02' },
  { key: '2', type: '公司股份分红收益', amount: '150,000.00', currency: 'USDT', month: '2026-02' },
  { key: '3', type: '公司收到返佣', amount: '60,000.00', currency: 'USDT', month: '2026-02' },
  { key: '4', type: '公司股份分红税', amount: '-7,500.00', currency: 'USDT', month: '2026-02' },
  { key: '5', type: '公司股份释放收益', amount: '280,000.00', currency: 'USDT', month: '2026-02' },
  { key: '6', type: '公司股份释放收益税', amount: '-14,000.00', currency: 'USDT', month: '2026-02' },
  { key: '7', type: '企业东方彩票盈亏', amount: '45,000.00', currency: 'USDT', month: '2026-02' },
  { key: '8', type: '企业股份释放所得税', amount: '-9,000.00', currency: 'USDT', month: '2026-02' },
  { key: '9', type: '企业分红税', amount: '-6,000.00', currency: 'USDT', month: '2026-02' },
];

const FinanceRevenueDetail: React.FC = () => {
  const navigate = useNavigate();
  const { month: paramMonth } = useParams<{ month: string }>();
  const [selectedMonth, setSelectedMonth] = useState(paramMonth ?? '2026-02');

  // ── 公司月度贡献列 ────────────────────────────────────────────
  const contribCols: ColumnsType<CompanyContrib> = [
    {
      title: '公司',
      dataIndex: 'company',
      width: 120,
      render: (v, r) => r.key === 'total'
        ? <Text strong>{v}</Text>
        : <Text>{v}</Text>,
    },
    { title: '划转收益', dataIndex: 'transferRevenue', align: 'right', width: 130, render: (v) => <Text>{v}</Text> },
    { title: '股份分红收益', dataIndex: 'shareRevenue', align: 'right', width: 130 },
    { title: '游戏盈亏', dataIndex: 'gameRevenue', align: 'right', width: 130 },
    { title: '返佣收益', dataIndex: 'commissionRevenue', align: 'right', width: 130 },
    {
      title: '月度合计',
      dataIndex: 'total',
      align: 'right',
      width: 140,
      render: (v, r) => (
        <Text strong style={{ color: r.key === 'total' ? '#722ed1' : '#141414' }}>{v}</Text>
      ),
    },
  ];

  // ── 收益明细列 ────────────────────────────────────────────────
  const detailCols: ColumnsType<RevenueDetail> = [
    { title: '收益类型', dataIndex: 'type', width: 200 },
    {
      title: '金额', dataIndex: 'amount', align: 'right', width: 150,
      render: (v) => {
        const neg = v.startsWith('-');
        return <Text style={{ color: neg ? '#ff4d4f' : '#141414' }}>{v}</Text>;
      },
    },
    { title: '货币单位', dataIndex: 'currency', width: 90 },
    { title: '收益月份', dataIndex: 'month', width: 110 },
    {
      title: '操作', width: 80, fixed: 'right' as const,
      render: () => <Button type="link" size="small" style={{ padding: 0 }}>详情</Button>,
    },
  ];

  return (
    <div>
      {/* 返回 + 标题 */}
      <Space style={{ marginBottom: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          type="text"
          onClick={() => navigate('/finance/revenue')}
          style={{ padding: '4px 0' }}
        >
          返回
        </Button>
      </Space>

      {/* 集团信息 */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW, marginBottom: 16 }}>
        <Title level={5} style={{ margin: '0 0 12px' }}>汇算明细</Title>
        <Descriptions column={4} size="small">
          <Descriptions.Item label="集团名称">集团</Descriptions.Item>
          <Descriptions.Item label="下辖企业">12 家</Descriptions.Item>
          <Descriptions.Item label="下辖公司">4 家</Descriptions.Item>
          <Descriptions.Item label="集团负责人">Admin</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 月度概览 */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={5} style={{ margin: 0 }}>月度公司贡献盈亏汇总</Title>
          <Space>
            <Text type="secondary" style={{ fontSize: 13 }}>汇算月份：</Text>
            <Select
              value={selectedMonth}
              onChange={setSelectedMonth}
              style={{ width: 120 }}
              options={MONTHS.map((m) => ({ value: m, label: m }))}
            />
          </Space>
        </div>

        {/* 概览指标 */}
        <Row gutter={[16, 12]} style={{ marginBottom: 20 }}>
          {[
            { label: '汇算周期', value: `${selectedMonth}-01 至 ${selectedMonth}-31`, color: '#141414' },
            { label: '状态', value: '已出账', isTag: true },
            { label: '本月综合收益', value: '873,233.23 USDT', color: '#722ed1' },
            { label: '应纳税额', value: '43,661.66 USDT', color: '#fa8c16' },
            { label: '免征税额', value: '10,000.00 USDT', color: '#141414' },
            { label: '待提取收益', value: '819,571.57 USDT', color: '#52c41a' },
          ].map((item) => (
            <Col key={item.label} xs={12} sm={8} md={4}>
              <div style={{ background: '#fafafa', borderRadius: 8, padding: '12px 16px' }}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>{item.label}</Text>
                {item.isTag
                  ? <Tag color="success">已出账</Tag>
                  : <Text strong style={{ fontSize: 14, color: item.color }}>{item.value}</Text>}
              </div>
            </Col>
          ))}
        </Row>

        {/* 公司月度贡献详情表 */}
        <Title level={5} style={{ margin: '0 0 12px' }}>公司月度贡献详情</Title>
        <Table
          columns={contribCols}
          dataSource={companyContribData}
          rowKey="key"
          size="middle"
          pagination={false}
          rowClassName={(r) => r.key === 'total' ? 'table-row-light' : ''}
          scroll={{ x: 700 }}
        />
      </Card>

      {/* 公司收益明细 */}
      <Card
        bordered={false}
        style={{ borderRadius: 12, boxShadow: CARD_SHADOW, marginBottom: 16 }}
        title={<Text strong>公司收益明细</Text>}
        extra={
          <Button icon={<DownloadOutlined />} size="small">下载账单</Button>
        }
      >
        <Table
          columns={detailCols}
          dataSource={revenueDetailData}
          rowKey="key"
          size="middle"
          pagination={false}
          scroll={{ x: 700 }}
          rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
        />
      </Card>

      {/* 集团月度所得汇算 */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
        <Title level={5} style={{ margin: '0 0 16px' }}>集团月度所得汇算</Title>
        <Row gutter={[16, 12]}>
          {[
            { label: '公司东方彩票盈亏', value: '215,000.00', currency: 'USDT' },
            { label: '公司股份分红收益', value: '150,000.00', currency: 'USDT' },
            { label: '公司收到返佣', value: '60,000.00', currency: 'USDT' },
            { label: '公司股份分红税', value: '-7,500.00', currency: 'USDT', negative: true },
            { label: '公司股份释放收益', value: '280,000.00', currency: 'USDT' },
            { label: '公司股份释放收益税', value: '-14,000.00', currency: 'USDT', negative: true },
            { label: '企业东方彩票盈亏', value: '45,000.00', currency: 'USDT' },
            { label: '企业股份释放所得税', value: '-9,000.00', currency: 'USDT', negative: true },
            { label: '企业分红税', value: '-6,000.00', currency: 'USDT', negative: true },
          ].map((item) => (
            <Col key={item.label} xs={24} sm={12} md={8}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#fafafa', borderRadius: 6 }}>
                <Text type="secondary" style={{ fontSize: 13 }}>{item.label}</Text>
                <Text strong style={{ fontSize: 13, color: item.negative ? '#ff4d4f' : '#141414' }}>
                  {item.value} <Text type="secondary" style={{ fontSize: 11 }}>{item.currency}</Text>
                </Text>
              </div>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
};

export default FinanceRevenueDetail;
