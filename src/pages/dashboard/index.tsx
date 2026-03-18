import {
  ApartmentOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  BankOutlined,
  RiseOutlined,
  TeamOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Row,
  Segmented,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';
import { useNavigate } from 'umi';

const { Title, Text } = Typography;

// 模拟折线图（用简单 SVG 代替 echarts，避免额外依赖）
const SimpleLine: React.FC<{ data: number[]; color: string; height?: number }> = ({
  data,
  color,
  height = 60,
}) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 300;
  const pad = 4;
  const points = data
    .map((v, i) => {
      const x = pad + (i / (data.length - 1)) * (width - pad * 2);
      const y = height - pad - ((v - min) / range) * (height - pad * 2);
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <polyline
        points={`${pad},${height} ${points} ${width - pad},${height}`}
        fill={color}
        opacity="0.1"
      />
    </svg>
  );
};

const mockRevenue7 = [12000, 18000, 14500, 22000, 19500, 25000, 23400];
const mockShib7 = [8000, 11000, 9500, 13000, 12000, 15000, 14200];
const mockPea7 = [5000, 7000, 6500, 9000, 8000, 10500, 9800];

const topCompanies = [
  { rank: 1, name: 'UU Talk', revenue: '234,234.00', currency: 'USDT', change: 12.5 },
  { rank: 2, name: 'Hey Talk', revenue: '198,021.50', currency: 'USDT', change: -3.2 },
  { rank: 3, name: '炸雷第一波', revenue: '156,890.00', currency: 'USDT', change: 8.1 },
  { rank: 4, name: 'Cyber Bot', revenue: '123,450.00', currency: 'USDT', change: 5.4 },
  { rank: 5, name: 'Star Tech', revenue: '98,320.00', currency: 'USDT', change: -1.8 },
];

const topColumns: ColumnsType<(typeof topCompanies)[0]> = [
  {
    title: '排名',
    dataIndex: 'rank',
    width: 60,
    render: (v) => {
      const colors = ['#f5222d', '#fa8c16', '#fadb14', '#595959', '#595959'];
      return (
        <span style={{ fontWeight: 700, color: colors[v - 1], fontSize: 16 }}>{v}</span>
      );
    },
  },
  { title: '公司名称', dataIndex: 'name' },
  {
    title: '收益（USDT）',
    dataIndex: 'revenue',
    align: 'right',
    render: (v) => <Text strong style={{ color: '#1677ff' }}>{v}</Text>,
  },
  {
    title: '较昨日',
    dataIndex: 'change',
    align: 'right',
    render: (v) =>
      v >= 0 ? (
        <Text style={{ color: '#52c41a' }}>
          <ArrowUpOutlined /> {v}%
        </Text>
      ) : (
        <Text style={{ color: '#ff4d4f' }}>
          <ArrowDownOutlined /> {Math.abs(v)}%
        </Text>
      ),
  },
];

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [chartTab, setChartTab] = useState<string>('USDT');

  const chartDataMap: Record<string, number[]> = {
    USDT: mockRevenue7,
    SHIB: mockShib7,
    PEA: mockPea7,
  };

  const chartColorMap: Record<string, string> = {
    USDT: '#1677ff',
    SHIB: '#fa8c16',
    PEA: '#52c41a',
  };

  return (
    <div>
      {/* 顶部统计卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <Statistic
              title={
                <Space>
                  <ApartmentOutlined style={{ color: '#1677ff' }} />
                  <span>下辖企业</span>
                </Space>
              }
              value={248}
              suffix="家"
              valueStyle={{ color: '#1677ff' }}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                今日新增 <Text style={{ color: '#52c41a' }}>+3</Text>
              </Text>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <Statistic
              title={
                <Space>
                  <RiseOutlined style={{ color: '#52c41a' }} />
                  <span>下辖企业盈亏</span>
                </Space>
              }
              value="234,234.00"
              suffix="USDT"
              valueStyle={{ color: '#52c41a' }}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                昨日 <Text style={{ color: '#52c41a' }}>+12.5%</Text>
              </Text>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <Statistic
              title={
                <Space>
                  <TeamOutlined style={{ color: '#fa8c16' }} />
                  <span>参股公司</span>
                </Space>
              }
              value={34}
              suffix="家"
              valueStyle={{ color: '#fa8c16' }}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                今日参股 <Text style={{ color: '#1677ff' }}>6</Text> 家
              </Text>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{ borderRadius: 8, cursor: 'pointer' }}
            onClick={() => navigate('/finance/wallet')}
          >
            <Statistic
              title={
                <Space>
                  <WalletOutlined style={{ color: '#722ed1' }} />
                  <span>集团余额</span>
                </Space>
              }
              value="178,283.09"
              suffix="USDT"
              valueStyle={{ color: '#722ed1' }}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                点击进入集团钱包 →
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 持股估值卡片 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 8, textAlign: 'center' }}>
            <Text type="secondary">下辖持股估值（USDT）</Text>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#1677ff', marginTop: 8 }}>
              1,234,567.89
            </div>
            <SimpleLine data={mockRevenue7} color="#1677ff" height={40} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 8, textAlign: 'center' }}>
            <Text type="secondary">昨日参股金额（USDT）</Text>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#52c41a', marginTop: 8 }}>
              23,400.00
            </div>
            <SimpleLine data={mockShib7} color="#52c41a" height={40} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 8, textAlign: 'center' }}>
            <Text type="secondary">今日参股金额（USDT）</Text>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#fa8c16', marginTop: 8 }}>
              18,920.00
            </div>
            <SimpleLine data={mockPea7} color="#fa8c16" height={40} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* 收益趋势图 */}
        <Col xs={24} lg={14}>
          <Card
            bordered={false}
            style={{ borderRadius: 8 }}
            title={
              <Space>
                <Title level={5} style={{ margin: 0 }}>
                  近7日收益趋势
                </Title>
              </Space>
            }
            extra={
              <Segmented
                options={['USDT', 'SHIB', 'PEA']}
                value={chartTab}
                onChange={(v) => setChartTab(v as string)}
                size="small"
              />
            }
          >
            <div style={{ padding: '8px 0' }}>
              <div style={{ marginBottom: 8 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  最新：
                </Text>
                <Text strong style={{ color: chartColorMap[chartTab], fontSize: 18 }}>
                  {chartDataMap[chartTab][6].toLocaleString()} {chartTab}
                </Text>
              </div>
              <SimpleLine
                data={chartDataMap[chartTab]}
                color={chartColorMap[chartTab]}
                height={160}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: 4,
                }}
              >
                {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((d) => (
                  <Text key={d} type="secondary" style={{ fontSize: 11 }}>
                    {d}
                  </Text>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 8, textAlign: 'right' }}>
              <Text type="secondary" style={{ fontSize: 11 }}>
                数据更新于 2025-11-02 12:33:02
              </Text>
            </div>
          </Card>
        </Col>

        {/* TOP 5 收益排行 */}
        <Col xs={24} lg={10}>
          <Card
            bordered={false}
            style={{ borderRadius: 8 }}
            title={
              <Space>
                <BankOutlined style={{ color: '#1677ff' }} />
                <Title level={5} style={{ margin: 0 }}>
                  公司收益 TOP 5
                </Title>
              </Space>
            }
            extra={
              <Button type="link" size="small" onClick={() => navigate('/company/list')}>
                查看全部
              </Button>
            }
          >
            <Table
              columns={topColumns}
              dataSource={topCompanies}
              rowKey="rank"
              pagination={false}
              size="small"
              showHeader={true}
            />
          </Card>
        </Col>
      </Row>

      {/* 快捷入口 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card
            bordered={false}
            style={{ borderRadius: 8 }}
            title={
              <Title level={5} style={{ margin: 0 }}>
                快捷入口
              </Title>
            }
          >
            <Space wrap size={12}>
              {[
                { label: '企业清单', path: '/enterprise/list', color: '#1677ff' },
                { label: '公司清单', path: '/company/list', color: '#52c41a' },
                { label: '公司持股', path: '/company/shareholding', color: '#fa8c16' },
                { label: '佣金订单', path: '/commission', color: '#722ed1' },
                { label: '集团钱包', path: '/finance/wallet', color: '#13c2c2' },
                { label: '集团下拨', path: '/finance/allocate', color: '#eb2f96' },
                { label: '用户管理', path: '/system/users', color: '#f5222d' },
                { label: '系统日志', path: '/system/logs', color: '#595959' },
              ].map((item) => (
                <Tag
                  key={item.path}
                  color={item.color}
                  style={{ cursor: 'pointer', padding: '6px 16px', fontSize: 14, borderRadius: 6 }}
                  onClick={() => navigate(item.path)}
                >
                  {item.label}
                </Tag>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
