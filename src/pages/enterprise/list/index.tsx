import { SearchOutlined } from '@ant-design/icons';
import {
  Card,
  ConfigProvider,
  Input,
  Radio,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';
import { useNavigate } from 'umi';

const { Text: Txt } = Typography;

const CARD_SHADOW = '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)';

const radioTheme = {
  components: {
    Radio: {
      buttonSolidCheckedBg: '#722ed1',
      buttonSolidCheckedHoverBg: '#9254de',
      buttonSolidCheckedActiveBg: '#531dab',
      buttonSolidCheckedColor: '#fff',
      colorPrimary: '#722ed1',
    },
  },
};

interface Enterprise {
  id: number;
  enterpriseId: string;
  name: string;
  certStatus: '已订阅' | '已过期';
  certExpiry: string;
  ownerId: string;
  ownerName: string;
  totalAssets: number;
  profit: number;
  currency: 'USDT' | 'PEA';
  enterpriseStatus: '正常' | '已解散';
  company: string;
  createdAt: string;
  companyProfit: number;
}

const mockData: Enterprise[] = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  enterpriseId: String(283982 + i),
  name: ['hey', 'UUtalk', 'CyberBot', 'StarTech', 'GoldLink'][i % 5],
  certStatus: i % 4 === 3 ? '已过期' : '已订阅',
  certExpiry: i % 3 === 0 ? '2024-10-23' : i % 3 === 1 ? '2026-10-23' : '2025-06-30',
  ownerId: String(73720 + i),
  ownerName: `name${i + 1}`,
  totalAssets: Math.round((873233.23 - i * 3200) * 100) / 100,
  profit: Math.round((12340.5 + i * 800) * 100) / 100,
  currency: i % 2 === 0 ? 'USDT' : 'PEA',
  enterpriseStatus: i % 6 === 5 ? '已解散' : '正常',
  company: ['UU Talk', 'Hey Talk', '炸雷第一波'][i % 3],
  createdAt: `2025-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
  companyProfit: Math.round((5000 + i * 1200) * 100) / 100,
}));

const EnterpriseListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState('');
  const [companySearch, setCompanySearch] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = mockData.filter((d) => {
    const matchSearch =
      !searchVal ||
      d.ownerName.includes(searchVal) ||
      d.ownerId.includes(searchVal) ||
      d.name.includes(searchVal) ||
      d.enterpriseId.includes(searchVal);
    const matchCompany = !companySearch || d.company.includes(companySearch);
    const matchCurrency = currencyFilter === 'all' || d.currency === currencyFilter;
    const matchStatus = statusFilter === 'all' || d.enterpriseStatus === statusFilter;
    return matchSearch && matchCompany && matchCurrency && matchStatus;
  });

  const columns: ColumnsType<Enterprise> = [
    { title: '企业ID', dataIndex: 'enterpriseId', width: 100, fixed: 'left' },
    {
      title: '企业名称',
      dataIndex: 'name',
      width: 120,
      render: (v, r) => (
        <a onClick={() => navigate(`/enterprise/detail/${r.enterpriseId}`)}>{v}</a>
      ),
    },
    {
      title: '企业认证',
      dataIndex: 'certStatus',
      width: 90,
      render: (v: Enterprise['certStatus']) => (
        <Tag color={v === '已订阅' ? 'success' : 'error'}>{v}</Tag>
      ),
    },
    {
      title: '认证时效',
      dataIndex: 'certExpiry',
      width: 110,
      render: (v, r) => (
        <Txt type={r.certStatus === '已过期' ? 'danger' : undefined}>{v}</Txt>
      ),
    },
    { title: '企业主ID', dataIndex: 'ownerId', width: 100 },
    { title: '企业主昵称', dataIndex: 'ownerName', width: 100 },
    {
      title: '企业总资产',
      dataIndex: 'totalAssets',
      width: 130,
      align: 'right',
      sorter: (a, b) => a.totalAssets - b.totalAssets,
      render: (v) => (
        <Txt style={{ color: '#722ed1' }}>
          {v.toLocaleString('en', { minimumFractionDigits: 2 })}
        </Txt>
      ),
    },
    {
      title: '盈利',
      dataIndex: 'profit',
      width: 110,
      align: 'right',
      sorter: (a, b) => a.profit - b.profit,
      render: (v: number) => (
        <Txt style={{ color: v >= 0 ? '#52c41a' : '#ff4d4f' }}>
          {v >= 0 ? '+' : ''}{v.toLocaleString('en', { minimumFractionDigits: 2 })}
        </Txt>
      ),
    },
    {
      title: '货币单位',
      dataIndex: 'currency',
      width: 90,
      render: (v) => <Tag>{v}</Tag>,
    },
    {
      title: '企业状态',
      dataIndex: 'enterpriseStatus',
      width: 90,
      render: (v: Enterprise['enterpriseStatus']) => (
        <Tag color={v === '正常' ? 'success' : 'default'}>{v}</Tag>
      ),
    },
    { title: '归属公司', dataIndex: 'company', width: 110 },
    { title: '创建时间', dataIndex: 'createdAt', width: 110 },
    {
      title: '累计给公司盈利',
      dataIndex: 'companyProfit',
      width: 130,
      align: 'right',
      sorter: (a, b) => a.companyProfit - b.companyProfit,
      render: (v: number) => (
        <Txt style={{ color: '#fa8c16' }}>
          {v.toLocaleString('en', { minimumFractionDigits: 2 })}
        </Txt>
      ),
    },
    {
      title: '操作',
      width: 80,
      fixed: 'right',
      render: (_, r) => (
        <a onClick={() => navigate(`/enterprise/detail/${r.enterpriseId}`)}>详情</a>
      ),
    },
  ];

  return (
    <Card bordered={false} style={{ borderRadius: 8, boxShadow: CARD_SHADOW }}>
      {/* 筛选行 */}
      <Space size={16} wrap align="center" style={{ marginBottom: 16 }}>
        <ConfigProvider theme={radioTheme}>
          <Radio.Group
            value={currencyFilter}
            onChange={(e) => setCurrencyFilter(e.target.value)}
            buttonStyle="solid"
          >
            <Radio.Button value="all">全部</Radio.Button>
            <Radio.Button value="USDT">USDT</Radio.Button>
            <Radio.Button value="PEA">PEA</Radio.Button>
          </Radio.Group>
        </ConfigProvider>
        <ConfigProvider theme={radioTheme}>
          <Radio.Group
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            buttonStyle="solid"
          >
            <Radio.Button value="all">全部</Radio.Button>
            <Radio.Button value="正常">正常</Radio.Button>
            <Radio.Button value="已解散">已解散</Radio.Button>
          </Radio.Group>
        </ConfigProvider>
        <Input
          suffix={<SearchOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
          placeholder="归属公司"
          value={companySearch}
          onChange={(e) => setCompanySearch(e.target.value)}
          allowClear
          style={{ width: 160 }}
        />
        <Input
          suffix={<SearchOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
          placeholder="企业ID / 企业名称 / 企业主"
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          allowClear
          style={{ width: 230 }}
        />
      </Space>

      <Table
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        scroll={{ x: 1400 }}
        pagination={{
          total: filtered.length,
          pageSize: 10,
          showTotal: (total) => `共 ${total} 条`,
          showSizeChanger: true,
        }}
        size="middle"
      />
    </Card>
  );
};

export default EnterpriseListPage;
