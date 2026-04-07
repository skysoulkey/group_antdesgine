import { CopyOutlined, SearchOutlined } from '@ant-design/icons';
import {
  Card,
  ConfigProvider,
  Input,
  message,
  Radio,
  Select,
  Space,
  Table,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';

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

interface FlowRecord {
  id: string;
  type: '集团下拨' | '集团调回';
  currency: string;
  amount: string;
  operator: string;
  createdAt: string;
}

const flowData: FlowRecord[] = Array.from({ length: 12 }, (_, i) => ({
  id: `FL${String(i + 1).padStart(7, '0')}`,
  type: i % 3 === 2 ? '集团调回' : '集团下拨',
  currency: i % 2 === 0 ? 'USDT' : 'PEA',
  amount: `${(5000 + i * 3800).toLocaleString()}.00`,
  operator: ['Admin', 'FinanceManager', 'SuperAdmin'][i % 3],
  createdAt: `2026-0${(i % 3) + 1}-${String(i + 1).padStart(2, '0')} ${String(9 + (i % 8)).padStart(2, '0')}:00:00`,
}));

const MyWalletPage: React.FC = () => {
  const [typeFilter, setTypeFilter] = useState<string>('全部');
  const [search, setSearch] = useState('');

  const filteredData = flowData.filter((r) => {
    const matchType = typeFilter === '全部' || r.type === typeFilter;
    const kw = search.trim();
    const matchSearch = !kw || r.id.includes(kw) || r.operator.includes(kw);
    return matchType && matchSearch;
  });

  const columns: ColumnsType<FlowRecord> = [
    { title: '流水号', dataIndex: 'id' },
    { title: '类型', dataIndex: 'type' },
    { title: '货币单位', dataIndex: 'currency' },
    { title: '金额', dataIndex: 'amount', align: 'right' },
    { title: '操作人', dataIndex: 'operator' },
    { title: '时间', dataIndex: 'createdAt' },
  ];

  return (
    <div>
      {/* 余额 + 公司信息（一行紧凑） */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW, marginBottom: 16 }}
        styles={{ body: { padding: '16px 24px' } }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <Space size={48}>
            <div>
              <Text style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>USDT 余额</Text>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#141414', marginTop: 4, whiteSpace: 'nowrap' }}>
                89,230.00
              </div>
            </div>
            <div>
              <Text style={{ fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>PEA 余额</Text>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#141414', marginTop: 4, whiteSpace: 'nowrap' }}>
                560,000.00
              </div>
            </div>
            <div style={{ borderLeft: '1px solid #f0f0f0', paddingLeft: 32 }}>
              <Space size={20}>
                <span><Text type="secondary" style={{ fontSize: 13 }}>公司名称：</Text><Text style={{ fontSize: 13, fontWeight: 600 }}>炸雷第一波</Text></span>
                <span><Text type="secondary" style={{ fontSize: 13 }}>归属集团：</Text><Text style={{ fontSize: 13, fontWeight: 600 }}>UU Talk 集团</Text></span>
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <Text type="secondary" style={{ fontSize: 13 }}>公司 ID：</Text>
                  <Text style={{ fontSize: 13, fontFamily: 'monospace' }}>43215321432</Text>
                  <CopyOutlined
                    style={{ cursor: 'pointer', color: '#1677ff', fontSize: 13, marginLeft: 6 }}
                    onClick={() => { navigator.clipboard.writeText('43215321432'); message.success('已复制'); }}
                  />
                </span>
              </Space>
            </div>
          </Space>
        </div>
      </Card>

      {/* 历史流水 */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <ConfigProvider theme={radioTheme}>
            <Radio.Group
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="全部">全部</Radio.Button>
              <Radio.Button value="集团下拨">集团下拨</Radio.Button>
              <Radio.Button value="集团调回">集团调回</Radio.Button>
            </Radio.Group>
          </ConfigProvider>
          <Input
            suffix={<SearchOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
            placeholder="流水号 / 操作人"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            style={{ width: 200 }}
          />
        </div>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          size="middle"
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
          rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
        />
      </Card>
    </div>
  );
};

export default MyWalletPage;
