import { Line } from '@ant-design/plots';
import {
  Card,
  Col,
  DatePicker,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React from 'react';
import { useParams } from 'umi';

const { Text } = Typography;
const { RangePicker } = DatePicker;

const profitTrendData = [
  { date: '3/13', value: 12 },
  { date: '3/14', value: -8 },
  { date: '3/15', value: 25 },
  { date: '3/16', value: -15 },
  { date: '3/17', value: 30 },
  { date: '3/18', value: 18 },
  { date: '3/19', value: -5 },
];

interface Dividend {
  id: string;
  appName: string;
  game: string;
  startTime: string;
  endTime: string;
  members: number;
  totalInvest: string;
  totalDividend: string;
  totalProfit: string;
  status: string;
}

const dividendData: Dividend[] = Array.from({ length: 8 }, (_, i) => ({
  id: `DIV${String(i + 1).padStart(5, '0')}`,
  appName: ['UU Talk', 'Hey Talk', 'Star Game'][i % 3],
  game: ['百家乐', '龙虎斗', '骰子'][i % 3],
  startTime: `2026-03-${String(i + 1).padStart(2, '0')} 10:00:00`,
  endTime: `2026-03-${String(i + 1).padStart(2, '0')} 22:00:00`,
  members: 12 + i * 3,
  totalInvest: `${(10000 + i * 3000).toLocaleString()}.00`,
  totalDividend: `${(8000 + i * 2500).toLocaleString()}.00`,
  totalProfit: i % 3 === 1 ? `-${(500 + i * 100).toLocaleString()}.00` : `${(1500 + i * 800).toLocaleString()}.00`,
  status: ['正常', '审核中', '已结算'][i % 3],
}));

const dividendColumns: ColumnsType<Dividend> = [
  { title: '应用名称', dataIndex: 'appName', width: 100 },
  { title: '游戏', dataIndex: 'game', width: 80 },
  { title: '发起时间', dataIndex: 'startTime', width: 170 },
  { title: '完成时间', dataIndex: 'endTime', width: 170 },
  { title: '参与成员', dataIndex: 'members', width: 80, align: 'right' },
  { title: '总投资', dataIndex: 'totalInvest', width: 120, align: 'right' },
  { title: '总分红', dataIndex: 'totalDividend', width: 120, align: 'right' },
  {
    title: '总盈亏',
    dataIndex: 'totalProfit',
    width: 120,
    align: 'right',
    render: (v: string) => (
      <Text style={{ color: v.startsWith('-') ? '#ff4d4f' : '#52c41a' }}>{v}</Text>
    ),
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 90,
    render: (v) => (
      <Tag color={v === '正常' ? 'success' : v === '审核中' ? 'processing' : 'default'}>{v}</Tag>
    ),
  },
];

interface ShareTrade {
  id: string;
  direction: string;
  tradeTime: string;
  amount: string;
  shareholderId: string;
  shareholderName: string;
  shareHeld: string;
  expenditure: string;
  income: string;
  status: string;
}

const shareTradeData: ShareTrade[] = Array.from({ length: 6 }, (_, i) => ({
  id: `ST${String(i + 1).padStart(5, '0')}`,
  direction: i % 2 === 0 ? '买入' : '卖出',
  tradeTime: `2026-03-${String(i + 1).padStart(2, '0')} 14:${String(i * 7).padStart(2, '0')}:00`,
  amount: `${(5000 + i * 2000).toLocaleString()}.00`,
  shareholderId: `SH${10000 + i}`,
  shareholderName: ['张三', '李四', '王五', '赵六', '孙七', '周八'][i],
  shareHeld: `${(5 + i * 2).toFixed(2)}%`,
  expenditure: i % 2 === 0 ? `${(5000 + i * 2000).toLocaleString()}.00` : '0.00',
  income: i % 2 !== 0 ? `${(5000 + i * 2000).toLocaleString()}.00` : '0.00',
  status: '已完成',
}));

const shareTradeColumns: ColumnsType<ShareTrade> = [
  {
    title: '交易方向',
    dataIndex: 'direction',
    width: 90,
    render: (v) => <Tag color={v === '买入' ? 'success' : 'error'}>{v}</Tag>,
  },
  { title: '交易时间', dataIndex: 'tradeTime', width: 170 },
  { title: '交易金额', dataIndex: 'amount', width: 120, align: 'right' },
  { title: '股东ID', dataIndex: 'shareholderId', width: 100 },
  { title: '股东昵称', dataIndex: 'shareholderName', width: 90 },
  { title: '持有股份', dataIndex: 'shareHeld', width: 90, align: 'right' },
  { title: '股东支出', dataIndex: 'expenditure', width: 110, align: 'right' },
  { title: '股东收入', dataIndex: 'income', width: 110, align: 'right' },
  {
    title: '状态',
    dataIndex: 'status',
    width: 90,
    render: (v) => <Tag color="success">{v}</Tag>,
  },
];

interface TaxRecord {
  id: string;
  taxType: string;
  taxRate: string;
  preTaxAmount: string;
  taxAmount: string;
  currency: string;
  status: string;
  createdAt: string;
}

const taxData: TaxRecord[] = Array.from({ length: 5 }, (_, i) => ({
  id: `TAX${String(i + 1).padStart(5, '0')}`,
  taxType: ['增值税', '所得税', '印花税', '流水税', '资本利得税'][i],
  taxRate: `${(3 + i * 2).toFixed(1)}%`,
  preTaxAmount: `${(50000 + i * 10000).toLocaleString()}.00`,
  taxAmount: `${(1500 + i * 800).toLocaleString()}.00`,
  currency: 'USDT',
  status: i % 2 === 0 ? '已结算' : '待结算',
  createdAt: `2026-03-${String(i + 1).padStart(2, '0')} 09:00:00`,
}));

const taxColumns: ColumnsType<TaxRecord> = [
  { title: '税收类型', dataIndex: 'taxType', width: 120 },
  { title: '税率', dataIndex: 'taxRate', width: 80, align: 'right' },
  { title: '税前金额', dataIndex: 'preTaxAmount', width: 130, align: 'right' },
  { title: '税收金额', dataIndex: 'taxAmount', width: 130, align: 'right' },
  { title: '币种', dataIndex: 'currency', width: 80 },
  {
    title: '状态',
    dataIndex: 'status',
    width: 90,
    render: (v) => <Tag color={v === '已结算' ? 'success' : 'warning'}>{v}</Tag>,
  },
  { title: '创建时间', dataIndex: 'createdAt', width: 170 },
];

const EnterpriseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const tabItems = [
    {
      key: 'overview',
      label: '企业概览',
      children: (
        <div>
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={8}>
              <Card bordered={false}>
                <Statistic title="企业总资产（USDT）" value="234,560.00" valueStyle={{ color: '#1677ff' }} />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card bordered={false}>
                <Statistic title="企业成员数" value={128} suffix="人" valueStyle={{ color: '#52c41a' }} />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card bordered={false}>
                <Statistic title="企业流水（USDT）" value="89,230.00" valueStyle={{ color: '#fa8c16' }} />
              </Card>
            </Col>
          </Row>
          <Card bordered={false} title="企业盈亏走势" extra={<RangePicker size="small" />}>
            <Line
              data={profitTrendData}
              xField="date"
              yField="value"
              shape="smooth"
              point={{}}
              height={240}
              autoFit={true}
            />
          </Card>
        </div>
      ),
    },
    {
      key: 'dividend',
      label: '投资分红',
      children: (
        <Card bordered={false}>
          <Space style={{ marginBottom: 16 }} wrap>
            <Select
              placeholder="应用名称"
              style={{ width: 140 }}
              allowClear
              options={[
                { value: 'UU Talk', label: 'UU Talk' },
                { value: 'Hey Talk', label: 'Hey Talk' },
                { value: 'Star Game', label: 'Star Game' },
              ]}
            />
            <Select
              placeholder="状态"
              style={{ width: 120 }}
              allowClear
              options={[
                { value: '正常', label: '正常' },
                { value: '审核中', label: '审核中' },
                { value: '已结算', label: '已结算' },
              ]}
            />
            <Select
              placeholder="游戏"
              style={{ width: 120 }}
              allowClear
              options={[
                { value: '百家乐', label: '百家乐' },
                { value: '龙虎斗', label: '龙虎斗' },
                { value: '骰子', label: '骰子' },
              ]}
            />
          </Space>

          <Row gutter={[16, 8]} style={{ marginBottom: 16 }}>
            {[
              { label: '总分红', value: '62,000.00 USDT' },
              { label: '总投资', value: '76,000.00 USDT' },
              { label: '总盈亏', value: '+12,300.00 USDT' },
              { label: '参与成员数', value: '84 人' },
              { label: '参与场次', value: '8 场' },
            ].map((item) => (
              <Col key={item.label} xs={12} sm={8} md={5}>
                <div style={{ background: '#f5f5f5', borderRadius: 6, padding: '8px 12px' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>{item.label}</Text>
                  <div style={{ fontWeight: 600, fontSize: 14, marginTop: 2 }}>{item.value}</div>
                </div>
              </Col>
            ))}
          </Row>

          <Table
            columns={dividendColumns}
            dataSource={dividendData}
            rowKey="id"
            size="middle"
            scroll={{ x: 1100 }}
            pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
          />
        </Card>
      ),
    },
    {
      key: 'sharesTrade',
      label: '股份交易',
      children: (
        <Card bordered={false}>
          <Table
            columns={shareTradeColumns}
            dataSource={shareTradeData}
            rowKey="id"
            size="middle"
            scroll={{ x: 1000 }}
            pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
          />
        </Card>
      ),
    },
    {
      key: 'tax',
      label: '纳税汇总',
      children: (
        <Card bordered={false}>
          <Table
            columns={taxColumns}
            dataSource={taxData}
            rowKey="id"
            size="middle"
            pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
          />
        </Card>
      ),
    },
  ];

  return (
    <div>
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Text type="secondary">企业 ID：</Text>
        <Text strong>{id}</Text>
      </Card>
      <Tabs items={tabItems} type="card" />
    </div>
  );
};

export default EnterpriseDetail;
