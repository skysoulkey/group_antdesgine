import { InfoCircleOutlined, SearchOutlined, SwapOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  ConfigProvider,
  Input,
  Row,
  Segmented,
  Space,
  Table,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';
import { useNavigate } from 'umi';

const { Text } = Typography;

// PEA 汇率模拟（mock）
const PEA_RATE = 6.8;

interface Company {
  id: number;
  companyId: string;
  name: string;
  createdAt: string;
  memberCount: number;
  certEnterprises: number;
  totalAssets: number;
  enterpriseAssets: number;
  taxRevenue: number;
  shareRevenue: number;
  gameRevenue: number;
  commissionRevenue: number;
  groupAllocated: number;
  groupRecalled: number;
}

const mockData: Company[] = Array.from({ length: 11 }, (_, i) => ({
  id: i + 1,
  companyId: String(283982 + i),
  name: ['UU Talk', 'Hey Talk', '炸雷第一波', 'Cyber Bot', 'Star Tech', 'Gold Link', 'Blue Sky', 'Red Star', 'Green Tech', 'Purple Wave', 'Orange Net'][i],
  createdAt: '2025-10-10 12:23:23',
  memberCount: [543, 23, 11, 300, 32, 128, 67, 45, 89, 12, 203][i],
  certEnterprises: [543, 23, 11, 0, 32, 128, 67, 45, 89, 12, 203][i],
  totalAssets: 873233.23 - i * 28000,
  enterpriseAssets: 560000 + i * 12000,
  taxRevenue: 12300 + i * 1500,
  shareRevenue: 45000 + i * 3200,
  gameRevenue: 88000 - i * 4000,
  commissionRevenue: 23000 + i * 800,
  groupAllocated: 873233.23 - i * 20000,
  groupRecalled: 200000 + i * 5000,
}));

// 金额格式化
const fmt = (v: number, currency: string) => {
  const val = currency === 'PEA' ? v * PEA_RATE : v;
  return val.toLocaleString('en', { minimumFractionDigits: 2 });
};

// 表头带注释图标
const ColTitle = ({ label, tip }: { label: string; tip?: string }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginRight: 8 }}>
    {label}
    {tip && (
      <Tooltip title={tip}>
        <InfoCircleOutlined style={{ fontSize: 12, color: 'rgba(0,0,0,0.35)', cursor: 'help' }} />
      </Tooltip>
    )}
  </span>
);

const CompanyListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState('');
  const [currency, setCurrency] = useState('USDT');

  const filtered = mockData.filter(
    (d) => !searchVal || d.name.includes(searchVal) || d.companyId.includes(searchVal),
  );

  const cur = currency;

  const columns: ColumnsType<Company> = [
    { title: '创建时间', dataIndex: 'createdAt', width: 170 },
    { title: '公司ID', dataIndex: 'companyId', width: 100 },
    { title: '公司名称', dataIndex: 'name', width: 130 },
    { title: '成员总数', dataIndex: 'memberCount', align: 'right', width: 90 },
    {
      title: <ColTitle label="认证企业" tip="已认证企业数量" />,
      dataIndex: 'certEnterprises',
      align: 'right',
      width: 110,
    },
    {
      title: '公司总资产',
      dataIndex: 'totalAssets',
      align: 'right',
      width: 140,
      defaultSortOrder: 'descend',
      sorter: (a, b) => a.totalAssets - b.totalAssets,
      render: (v: number) => (
        <Text style={{ color: '#722ed1' }}>{fmt(v, cur)}</Text>
      ),
    },
    {
      title: '企业总资产',
      dataIndex: 'enterpriseAssets',
      align: 'right',
      width: 140,
      sorter: (a, b) => a.enterpriseAssets - b.enterpriseAssets,
      render: (v: number) => fmt(v, cur),
    },
    {
      title: <ColTitle label="税费收益" tip="入股企业的股东释放股份、股东获取分红时，缴纳的税费" />,
      dataIndex: 'taxRevenue',
      align: 'right',
      width: 120,
      sorter: (a, b) => a.taxRevenue - b.taxRevenue,
      render: (v: number) => fmt(v, cur),
    },
    {
      title: <ColTitle label="股份收益" tip="入股企业的公司，股份的分红收益+释放股份的收益" />,
      dataIndex: 'shareRevenue',
      align: 'right',
      width: 120,
      sorter: (a, b) => a.shareRevenue - b.shareRevenue,
      render: (v: number) => fmt(v, cur),
    },
    {
      title: <ColTitle label="游戏收益" tip="公司接受企业转单时，游戏的盈亏总额" />,
      dataIndex: 'gameRevenue',
      align: 'right',
      width: 120,
      sorter: (a, b) => a.gameRevenue - b.gameRevenue,
      render: (v: number) => fmt(v, cur),
    },
    {
      title: <ColTitle label="佣金收益" tip="游戏的所有佣金收益汇总" />,
      dataIndex: 'commissionRevenue',
      align: 'right',
      width: 120,
      sorter: (a, b) => a.commissionRevenue - b.commissionRevenue,
      render: (v: number) => fmt(v, cur),
    },
    {
      title: <ColTitle label="集团资金下拨" tip="集团向该公司下拨的资金总额" />,
      dataIndex: 'groupAllocated',
      align: 'right',
      width: 140,
      sorter: (a, b) => a.groupAllocated - b.groupAllocated,
      render: (v: number) => fmt(v, cur),
    },
    {
      title: <ColTitle label="集团资金调回" tip="集团从该公司调回的资金总额" />,
      dataIndex: 'groupRecalled',
      align: 'right',
      width: 140,
      sorter: (a, b) => a.groupRecalled - b.groupRecalled,
      render: (v: number) => fmt(v, cur),
    },
    {
      title: '操作',
      width: 120,
      fixed: 'right',
      render: (_, r) => (
        <Space>
          <Button type="link" size="small" onClick={() => navigate(`/company/detail/${r.companyId}`)}>
            详情
          </Button>
          <Button
            type="link"
            size="small"
            icon={<SwapOutlined />}
            onClick={() => navigate(`/company/transfer?companyId=${r.companyId}&companyName=${encodeURIComponent(r.name)}`)}
          >
            划转
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card bordered={false} style={{ borderRadius: 8 }}>
      <Row gutter={16} style={{ marginBottom: 16 }} align="middle">
        <Col>
          <ConfigProvider theme={{ components: { Segmented: {
            trackBg: '#f9f0ff',
            itemSelectedBg: '#722ed1',
            itemSelectedColor: '#ffffff',
            itemColor: '#722ed1',
          } } }}>
            <Segmented
              options={['USDT', 'PEA']}
              value={currency}
              onChange={(v) => setCurrency(v as string)}
              style={{ fontWeight: 600 }}
            />
          </ConfigProvider>
        </Col>
        <Col flex="1">
          <Input
            prefix={<SearchOutlined />}
            placeholder="请输入公司名称或公司ID"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            allowClear
            style={{ maxWidth: 360 }}
          />
        </Col>
      </Row>

      <div style={{ marginBottom: 8 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          数据更新于 2025-11-02 12:33:02 &nbsp;|&nbsp; 总共 {filtered.length} 个项目
        </Text>
      </div>

      <Table
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        scroll={{ x: 1600 }}
        pagination={{
          total: filtered.length,
          pageSize: 10,
          showTotal: (total) => `总共 ${total} 个项目`,
          showSizeChanger: true,
        }}
        size="middle"
        rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
      />

    </Card>
  );
};

export default CompanyListPage;
