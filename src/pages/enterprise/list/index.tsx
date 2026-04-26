import { SearchOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  ConfigProvider,
  Input,
  Radio,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'umi';
import TableToolbar from '../../../components/TableToolbar';
import FilterField from '../../../components/FilterField';

const { Text: Txt } = Typography;

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
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRefresh = useCallback(() => { message.success('已刷新'); }, []);
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
    { title: '企业名称', dataIndex: 'name', width: 120 },
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
        <Txt style={{ color: '#141414' }}>
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
        <Txt style={{ color: '#141414' }}>
          {v.toLocaleString('en', { minimumFractionDigits: 2 })}
        </Txt>
      ),
    },
    { title: '货币单位', dataIndex: 'currency', width: 90 },
    { title: '企业状态', dataIndex: 'enterpriseStatus', width: 90 },
    { title: '归属公司', dataIndex: 'company', width: 110 },
    { title: '创建时间', dataIndex: 'createdAt', width: 110 },
    {
      title: '累计给公司盈利',
      dataIndex: 'companyProfit',
      width: 130,
      align: 'right',
      sorter: (a, b) => a.companyProfit - b.companyProfit,
      render: (v: number) => (
        <Txt style={{ color: '#141414' }}>
          {v.toLocaleString('en', { minimumFractionDigits: 2 })}
        </Txt>
      ),
    },
    {
      title: '操作',
      width: 80,
      fixed: 'right',
      render: (_, r) => (
        <Button type="link" size="small" style={{ padding: 0 }}
          onClick={() => navigate(`/enterprise/detail/${r.enterpriseId}`)}>详情</Button>
      ),
    },
  ];

  return (
    <div ref={containerRef}>
    <Space direction="vertical" size={12} style={{ display: 'flex' }}>
      {/* 筛选卡片 */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
        <Space size={16} wrap align="center">
          <FilterField label="货币单位">
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
          </FilterField>
          <FilterField label="状态">
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
          </FilterField>
          <FilterField label="归属公司">
            <Input
              suffix={<SearchOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
              placeholder="归属公司"
              value={companySearch}
              onChange={(e) => setCompanySearch(e.target.value)}
              allowClear
              style={{ width: 160 }}
            />
          </FilterField>
          <FilterField label="企业">
            <Input
              suffix={<SearchOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
              placeholder="企业ID / 企业名称 / 企业主"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              allowClear
              style={{ width: 260 }}
            />
          </FilterField>
        </Space>
      </Card>

      {/* 表格卡片 */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}
        styles={{ body: { padding: '16px 24px' } }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Txt style={{ fontSize: 14, fontWeight: 600 }}>企业清单</Txt>
          <TableToolbar onRefresh={handleRefresh} containerRef={containerRef} />
        </div>
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
          rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
        />
      </Card>
    </Space>
    </div>
  );
};

export default EnterpriseListPage;
