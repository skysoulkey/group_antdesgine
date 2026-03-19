import { BankOutlined } from '@ant-design/icons';
import { Line } from '@ant-design/plots';
import { Button, Card, Col, Row, Statistic, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React from 'react';
import { useNavigate } from 'umi';

const { Text } = Typography;

// 折线图数据生成
function makeDays(values: number[]) {
  const days = ['3/13', '3/14', '3/15', '3/16', '3/17', '3/18', '3/19'];
  return values.map((v, i) => ({ date: days[i], value: v }));
}

const balanceData = makeDays([158000, 162000, 155000, 178000, 170000, 182000, 178283]);
const holdingData = makeDays([820000, 890000, 870000, 950000, 920000, 1010000, 1023450]);
const profitData = makeDays([12, -8, 25, -15, 30, 18, -5]);
const flowData = makeDays([23000, 31000, 27000, 42000, 38000, 45000, 39800]);

const lineConfig = (data: { date: string; value: number }[]) => ({
  data,
  xField: 'date',
  yField: 'value',
  shape: 'smooth',
  point: {},
  height: 200,
  autoFit: true,
});

interface TopCompany {
  ranking: number;
  masterId: string;
  masterNickname: string;
  cumulativeProfit: string;
  companyId: string;
  companyName: string;
  certEnterprises: number;
  members: number;
}

const topData: TopCompany[] = [
  { ranking: 1, masterId: 'U10023', masterNickname: '陈总', cumulativeProfit: '234,234.00', companyId: 'C001', companyName: 'UU Talk', certEnterprises: 12, members: 348 },
  { ranking: 2, masterId: 'U10089', masterNickname: '李总', cumulativeProfit: '198,021.50', companyId: 'C002', companyName: 'Hey Talk', certEnterprises: 8, members: 210 },
  { ranking: 3, masterId: 'U10145', masterNickname: '王总', cumulativeProfit: '156,890.00', companyId: 'C003', companyName: '炸雷第一波', certEnterprises: 6, members: 178 },
  { ranking: 4, masterId: 'U10201', masterNickname: '张总', cumulativeProfit: '123,450.00', companyId: 'C004', companyName: 'Cyber Bot', certEnterprises: 4, members: 132 },
  { ranking: 5, masterId: 'U10267', masterNickname: '刘总', cumulativeProfit: '98,320.00', companyId: 'C005', companyName: 'Star Tech', certEnterprises: 3, members: 98 },
];

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const topColumns: ColumnsType<TopCompany> = [
    {
      title: '总贡献排名',
      dataIndex: 'ranking',
      width: 90,
      render: (v) => {
        const colors = ['#f5222d', '#fa8c16', '#fadb14', '#595959', '#595959'];
        return <span style={{ fontWeight: 700, color: colors[v - 1], fontSize: 15 }}>{v}</span>;
      },
    },
    { title: '公司主ID', dataIndex: 'masterId', width: 90 },
    { title: '公司主昵称', dataIndex: 'masterNickname', width: 100 },
    {
      title: '公司累计盈利',
      dataIndex: 'cumulativeProfit',
      width: 130,
      render: (v) => <Text strong style={{ color: '#1677ff' }}>{v}</Text>,
    },
    { title: '公司ID', dataIndex: 'companyId', width: 80 },
    { title: '公司名称', dataIndex: 'companyName' },
    { title: '认证企业', dataIndex: 'certEnterprises', width: 80, align: 'right' },
    { title: '企业成员', dataIndex: 'members', width: 80, align: 'right' },
    {
      title: '操作',
      width: 80,
      fixed: 'right',
      render: (_, r) => (
        <Button type="link" size="small" onClick={() => navigate(`/company/detail/${r.companyId}`)}>
          公司详情
        </Button>
      ),
    },
  ];

  return (
    <div>
      {/* 顶部统计卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card bordered={false}>
            <Statistic
              title="集团余额（USDT）"
              value="178,283.09"
              valueStyle={{ color: '#1677ff', fontSize: 24 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false}>
            <Statistic
              title="下辖公司资产（USDT）"
              value="1,023,450.00"
              valueStyle={{ color: '#52c41a', fontSize: 24 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false}>
            <Statistic
              title="下辖企业数量"
              value={248}
              suffix="家"
              valueStyle={{ color: '#fa8c16', fontSize: 24 }}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表区 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card bordered={false} title="集团余额走势">
            <Line {...lineConfig(balanceData)} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card bordered={false} title="下辖公司持股估值">
            <Line {...lineConfig(holdingData)} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card bordered={false} title="下辖企业盈亏">
            <Line {...lineConfig(profitData)} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card bordered={false} title="下辖企业流水">
            <Line {...lineConfig(flowData)} />
          </Card>
        </Col>
      </Row>

      {/* TOP5 公司贡献排行 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card
            bordered={false}
            title={
              <span>
                <BankOutlined style={{ color: '#1677ff', marginRight: 8 }} />
                公司贡献 TOP 5
              </span>
            }
            extra={
              <Button type="link" size="small" onClick={() => navigate('/company/list')}>
                查看全部
              </Button>
            }
          >
            <Table
              columns={topColumns}
              dataSource={topData}
              rowKey="ranking"
              pagination={false}
              size="middle"
              scroll={{ x: 900 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
