import { Line } from '@ant-design/plots';
import { SearchOutlined } from '@ant-design/icons';
import {
  Card,
  Col,
  Input,
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

// 折线图数据
const assetTrendData = [
  { date: '3/13', value: 980000 },
  { date: '3/14', value: 1020000 },
  { date: '3/15', value: 995000 },
  { date: '3/16', value: 1080000 },
  { date: '3/17', value: 1050000 },
  { date: '3/18', value: 1120000 },
  { date: '3/19', value: 1090000 },
];

const profitTrendData = [
  { date: '3/13', value: 8000 },
  { date: '3/14', value: -3000 },
  { date: '3/15', value: 12000 },
  { date: '3/16', value: -5000 },
  { date: '3/17', value: 15000 },
  { date: '3/18', value: 9000 },
  { date: '3/19', value: -2000 },
];

// 集团转账 mock
interface GroupTransfer {
  id: string;
  orderType: string;
  orderTime: string;
  orderNo: string;
  currency: string;
  amount: string;
  remark: string;
}

const groupTransferData: GroupTransfer[] = Array.from({ length: 10 }, (_, i) => ({
  id: `GT${String(i + 1).padStart(5, '0')}`,
  orderType: i % 2 === 0 ? '集团资金下拨' : '集团资金调回',
  orderTime: `2026-03-${String(i + 1).padStart(2, '0')} 10:${String(i * 5).padStart(2, '0')}:00`,
  orderNo: `ORD${String(2026031000 + i)}`,
  currency: 'USDT',
  amount: `${(5000 + i * 2000).toLocaleString()}.00`,
  remark: i % 3 === 0 ? '季度下拨' : i % 3 === 1 ? '月度调回' : '—',
}));

const groupTransferColumns: ColumnsType<GroupTransfer> = [
  {
    title: '订单类型',
    dataIndex: 'orderType',
    width: 140,
    render: (v) => (
      <Tag color={v === '集团资金下拨' ? 'success' : 'warning'}>{v}</Tag>
    ),
  },
  { title: '订单时间', dataIndex: 'orderTime', width: 170 },
  { title: '订单编号', dataIndex: 'orderNo', width: 160 },
  { title: '货币单位', dataIndex: 'currency', width: 90 },
  { title: '交易金额', dataIndex: 'amount', width: 130, align: 'right' },
  { title: '订单备注', dataIndex: 'remark' },
];

// 贡献集团 mock
interface GroupContrib {
  id: string;
  joinTime: string;
  shareRatio: string;
  holdingValue: string;
  status: string;
}

const groupContribData: GroupContrib[] = Array.from({ length: 4 }, (_, i) => ({
  id: `GC${i + 1}`,
  joinTime: `2025-0${i + 1}-15 09:00:00`,
  shareRatio: `${(5 + i * 3).toFixed(1)}%`,
  holdingValue: `${(50000 + i * 20000).toLocaleString()}.00`,
  status: i % 3 === 2 ? '已退' : '持股',
}));

const groupContribColumns: ColumnsType<GroupContrib> = [
  { title: '首次加入时间', dataIndex: 'joinTime', width: 170 },
  { title: '持股比例', dataIndex: 'shareRatio', width: 100, align: 'right' },
  { title: '持股估值（USDT）', dataIndex: 'holdingValue', width: 160, align: 'right' },
  {
    title: '公司持股状态',
    dataIndex: 'status',
    width: 110,
    render: (v) => <Tag color={v === '持股' ? 'success' : 'default'}>{v}</Tag>,
  },
];

// 持股估值 mock
interface HoldingValuation {
  id: string;
  targetEnterprise: string;
  shareRatio: string;
  investAmount: string;
  currentValue: string;
  unrealizedPnl: string;
  returnRate: string;
  status: string;
  investTime: string;
}

const holdingData: HoldingValuation[] = Array.from({ length: 6 }, (_, i) => ({
  id: `HV${i + 1}`,
  targetEnterprise: ['UU Talk企业', 'Hey Talk企业', '炸雷一期', 'Cyber Bot', 'Star Tech', '龙虎斗基金'][i],
  shareRatio: `${(3 + i * 2).toFixed(1)}%`,
  investAmount: `${(20000 + i * 8000).toLocaleString()}.00`,
  currentValue: `${(22000 + i * 9000).toLocaleString()}.00`,
  unrealizedPnl: i % 3 === 1 ? `-${(1000 + i * 200).toLocaleString()}.00` : `${(2000 + i * 1000).toLocaleString()}.00`,
  returnRate: i % 3 === 1 ? `-${(3 + i).toFixed(1)}%` : `+${(8 + i * 3).toFixed(1)}%`,
  status: i % 4 === 3 ? '已退出' : '持仓中',
  investTime: `2025-0${i + 1}-10 09:00:00`,
}));

const holdingColumns: ColumnsType<HoldingValuation> = [
  { title: '标的企业', dataIndex: 'targetEnterprise', width: 130 },
  { title: '持股比例', dataIndex: 'shareRatio', width: 90, align: 'right' },
  { title: '投入金额', dataIndex: 'investAmount', width: 120, align: 'right' },
  { title: '当前估值', dataIndex: 'currentValue', width: 120, align: 'right' },
  {
    title: '未实现盈亏',
    dataIndex: 'unrealizedPnl',
    width: 130,
    align: 'right',
    render: (v: string) => (
      <Text style={{ color: v.startsWith('-') ? '#ff4d4f' : '#52c41a' }}>{v}</Text>
    ),
  },
  {
    title: '收益率',
    dataIndex: 'returnRate',
    width: 90,
    align: 'right',
    render: (v: string) => (
      <Text style={{ color: v.startsWith('-') ? '#ff4d4f' : '#52c41a' }}>{v}</Text>
    ),
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 90,
    render: (v) => <Tag color={v === '持仓中' ? 'processing' : 'default'}>{v}</Tag>,
  },
  { title: '投入时间', dataIndex: 'investTime', width: 170 },
];

const CompanyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const tabItems = [
    {
      key: 'overview',
      label: '公司概览',
      children: (
        <div>
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} lg={8}>
              <Card bordered={false}>
                <Statistic title="公司总资产（USDT）" value="1,090,000.00" valueStyle={{ color: '#722ed1' }} />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card bordered={false}>
                <Statistic title="昨日新增（USDT）" value="23,400.00" valueStyle={{ color: '#52c41a' }} />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card bordered={false}>
                <Statistic title="今日新增（USDT）" value="18,920.00" valueStyle={{ color: '#52c41a' }} />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card bordered={false}>
                <Statistic title="持股公司数" value={12} suffix="家" valueStyle={{ color: '#fa8c16' }} />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card bordered={false}>
                <Statistic title="持股估值（USDT）" value="234,560.00" valueStyle={{ color: '#722ed1' }} />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card bordered={false}>
                <Statistic title="集团下拨资金（USDT）" value="500,000.00" valueStyle={{ color: '#13c2c2' }} />
              </Card>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card bordered={false} title="公司总资产走势">
                <Line
                  data={assetTrendData}
                  xField="date"
                  yField="value"
                  shape="smooth"
                  point={{}}
                  height={200}
                  autoFit={true}
                />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card bordered={false} title="公司盈亏走势">
                <Line
                  data={profitTrendData}
                  xField="date"
                  yField="value"
                  shape="smooth"
                  point={{}}
                  height={200}
                  autoFit={true}
                />
              </Card>
            </Col>
          </Row>
        </div>
      ),
    },
    {
      key: 'groupTransfer',
      label: '集团转账',
      children: (
        <Card bordered={false}>
          <Space style={{ marginBottom: 16 }} wrap>
            <Input
              placeholder="搜索订单编号/备注"
              prefix={<SearchOutlined />}
              style={{ width: 220 }}
              allowClear
            />
            <Select
              placeholder="订单类型"
              style={{ width: 160 }}
              allowClear
              options={[
                { value: '全部', label: '全部' },
                { value: '集团资金下拨', label: '集团资金下拨' },
                { value: '集团资金调回', label: '集团资金调回' },
              ]}
            />
          </Space>
          <Table
            columns={groupTransferColumns}
            dataSource={groupTransferData}
            rowKey="id"
            size="middle"
            pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
          />
        </Card>
      ),
    },
    {
      key: 'groupContrib',
      label: '贡献集团',
      children: (
        <Card bordered={false}>
          <Table
            columns={groupContribColumns}
            dataSource={groupContribData}
            rowKey="id"
            size="middle"
            pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
          />
        </Card>
      ),
    },
    {
      key: 'holding',
      label: '持股估值',
      children: (
        <div>
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            {[
              { label: '累计投入（USDT）', value: '188,000.00' },
              { label: '当前估值（USDT）', value: '216,000.00' },
              { label: '未实现盈亏（USDT）', value: '+28,000.00' },
            ].map((item) => (
              <Col key={item.label} xs={24} sm={8}>
                <Card bordered={false}>
                  <Statistic
                    title={item.label}
                    value={item.value}
                    valueStyle={{ color: item.value.startsWith('+') ? '#52c41a' : '#722ed1' }}
                  />
                </Card>
              </Col>
            ))}
          </Row>
          <Card bordered={false}>
            <Table
              columns={holdingColumns}
              dataSource={holdingData}
              rowKey="id"
              size="middle"
              scroll={{ x: 1000 }}
              pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
            />
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Text type="secondary">公司 ID：</Text>
        <Text strong>{id}</Text>
      </Card>
      <Tabs items={tabItems} type="card" />
    </div>
  );
};

export default CompanyDetail;
