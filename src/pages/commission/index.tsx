import { Bar, Column } from '@ant-design/plots';
import {
  FullscreenOutlined,
  ReloadOutlined,
  SearchOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  ConfigProvider,
  Divider,
  Drawer,
  Radio,
  Row,
  Select,
  Space,
  Table,
  Typography,
  Input,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';

const { Text } = Typography;

const CARD_SHADOW = '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)';

// ── 数据模型 ──────────────────────────────────────────────────────
interface CommissionOrder {
  id: string;
  createdAt: string;
  orderId: string;
  appName: string;
  game: string;
  bettorId: string;
  bettorName: string;
  enterpriseId: string;
  enterpriseName: string;
  currency: 'USDT' | 'PEA';
  commission: string;
}

const APPS = ['UU Talk', 'Hey Talk', 'Star Game'];
const GAMES = ['百家乐', '龙虎斗', '骰子'];
const ENTERPRISES = ['hey企业', 'wow公司', 'boom集团', 'flash科技', 'nova星球'];

const mockData: CommissionOrder[] = Array.from({ length: 20 }, (_, i) => ({
  id: `CO${String(i + 1).padStart(7, '0')}`,
  createdAt: `2025-10-10 12:23:23`,
  orderId: String(73720 + i),
  appName: APPS[i % 3],
  game: GAMES[i % 3],
  bettorId: String(287402 + i),
  bettorName: `滴滴答答`,
  enterpriseId: String(287402 + i),
  enterpriseName: ENTERPRISES[i % 5],
  currency: (['USDT', 'PEA'] as const)[i % 2],
  commission: i % 2 === 0 ? '873,233.23' : '73,233.23',
}));

// ── 图表数据 ──────────────────────────────────────────────────────
const top5CommissionData = [
  { enterprise: '企业名称5', value: 18 },
  { enterprise: '企业名称4', value: 26 },
  { enterprise: '企业名称3', value: 34 },
  { enterprise: '企业名称2', value: 45 },
  { enterprise: '企业名称1', value: 58 },
];

const orderCountData = ENTERPRISES.map((e, i) => ({
  enterprise: e,
  value: 18 + i * 9 + (i % 2 === 0 ? 4 : 0),
}));

// ── 统计 ──────────────────────────────────────────────────────────
const totalUsdt = mockData.filter((r) => r.currency === 'USDT').reduce((s, r) => s + parseFloat(r.commission.replace(/,/g, '')), 0);
const totalPea  = mockData.filter((r) => r.currency === 'PEA').reduce((s, r) => s + parseFloat(r.commission.replace(/,/g, '')), 0);

// ── 来源订单 mock ─────────────────────────────────────────────────
interface SourceOrder { id: string; time: string; orderId: string; betAmt: string; bettorId: string; bettorName: string }
const sourceMock: SourceOrder[] = Array.from({ length: 5 }, (_, i) => ({
  id: String(i),
  time: '2017-10-01 12:00',
  orderId: String(223242 + i),
  betAmt: i % 2 === 0 ? '873,233.23' : '73,233.23',
  bettorId: '287402',
  bettorName: '滴滴答答',
}));

// ── 佣金订单 Tab ──────────────────────────────────────────────────
const CommissionOrderTab: React.FC = () => {
  const [currencyFilter, setCurrencyFilter] = useState<string>('全部');
  const [app, setApp] = useState<string | undefined>();
  const [game, setGame] = useState<string | undefined>();
  const [enterprise, setEnterprise] = useState<string | undefined>();
  const [search, setSearch] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<CommissionOrder | null>(null);

  const filtered = mockData.filter((r) => {
    const kw = search.toLowerCase();
    return (
      (currencyFilter === '全部' || r.currency === currencyFilter) &&
      (!app || r.appName === app) &&
      (!game || r.game === game) &&
      (!enterprise || r.enterpriseName === enterprise) &&
      (!kw || r.orderId.includes(kw))
    );
  });

  const columns: ColumnsType<CommissionOrder> = [
    { title: '订单时间', dataIndex: 'createdAt', width: 160 },
    { title: '订单编号', dataIndex: 'orderId', width: 90 },
    { title: '应用名称', dataIndex: 'appName', width: 100 },
    { title: '游戏', dataIndex: 'game', width: 80 },
    { title: '下注人ID', dataIndex: 'bettorId', width: 100 },
    { title: '下注人昵称', dataIndex: 'bettorName', width: 100 },
    { title: '企业ID', dataIndex: 'enterpriseId', width: 100 },
    { title: '企业名称', dataIndex: 'enterpriseName', width: 100 },
    { title: '货币单位', dataIndex: 'currency', width: 80 },
    {
      title: '公司佣金支出',
      dataIndex: 'commission',
      width: 130,
      align: 'right',
      sorter: (a, b) => parseFloat(a.commission.replace(/,/g, '')) - parseFloat(b.commission.replace(/,/g, '')),
      render: (v) => <Text style={{ color: '#141414' }}>{v}</Text>,
    },
    {
      title: '操作', width: 70, fixed: 'right' as const,
      render: (_, r) => (
        <Button type="link" size="small" style={{ padding: 0 }} onClick={() => { setSelected(r); setDetailOpen(true); }}>
          详情
        </Button>
      ),
    },
  ];

  const sourceCols: ColumnsType<SourceOrder> = [
    { title: '订单生成时间', dataIndex: 'time', width: 150 },
    { title: '订单编号', dataIndex: 'orderId', width: 90 },
    { title: '下注金额', dataIndex: 'betAmt', width: 110, align: 'right' },
    { title: '下注人ID', dataIndex: 'bettorId', width: 90 },
    { title: '下注人昵称', dataIndex: 'bettorName', width: 100 },
  ];

  return (
    <div>
      {/* 筛选区 */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 14, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Text type="secondary" style={{ fontSize: 13, whiteSpace: 'nowrap' }}>应用名称：</Text>
            <ConfigProvider theme={{ components: { Radio: { colorPrimary: '#722ed1', buttonSolidCheckedBg: '#ffffff', buttonSolidCheckedColor: '#722ed1', buttonCheckedBg: '#ffffff' } } }}>
              <Radio.Group buttonStyle="outline" value={app ?? '全部'}
                onChange={e => setApp(e.target.value === '全部' ? undefined : e.target.value)}>
                {(['全部', ...APPS]).map((v) => (
                  <Radio.Button key={v} value={v}
                    style={(app ?? '全部') === v ? { color: '#722ed1', borderColor: '#722ed1' } : {}}>
                    {v}
                  </Radio.Button>
                ))}
              </Radio.Group>
            </ConfigProvider>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Text type="secondary" style={{ fontSize: 13, whiteSpace: 'nowrap' }}>货币单位：</Text>
            <Space size={0}>
              {(['全部', 'USDT', 'PEA']).map((s) => (
                <Button key={s} size="small"
                  type={currencyFilter === s ? 'primary' : 'default'}
                  style={{ borderRadius: s === '全部' ? '4px 0 0 4px' : s === 'PEA' ? '0 4px 4px 0' : '0' }}
                  onClick={() => setCurrencyFilter(s)}>{s}</Button>
              ))}
            </Space>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Text type="secondary" style={{ fontSize: 13, whiteSpace: 'nowrap' }}>企业名称：</Text>
            <Select placeholder="请选择" value={enterprise} onChange={setEnterprise} allowClear style={{ width: 160 }}
              options={ENTERPRISES.map((e) => ({ value: e, label: e }))} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Text type="secondary" style={{ fontSize: 13, whiteSpace: 'nowrap' }}>搜索：</Text>
            <Input prefix={<SearchOutlined />} placeholder="订单编号"
              value={search} onChange={(e) => setSearch(e.target.value)} allowClear style={{ width: 200 }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Text type="secondary" style={{ fontSize: 13, whiteSpace: 'nowrap' }}>游戏：</Text>
            <ConfigProvider theme={{ components: { Radio: { colorPrimary: '#722ed1', buttonSolidCheckedBg: '#ffffff', buttonSolidCheckedColor: '#722ed1', buttonCheckedBg: '#ffffff' } } }}>
              <Radio.Group buttonStyle="outline" value={game ?? '全部'}
                onChange={e => setGame(e.target.value === '全部' ? undefined : e.target.value)}>
                {(['全部', ...GAMES]).map((v) => (
                  <Radio.Button key={v} value={v}
                    style={(game ?? '全部') === v ? { color: '#722ed1', borderColor: '#722ed1' } : {}}>
                    {v}
                  </Radio.Button>
                ))}
              </Radio.Group>
            </ConfigProvider>
          </div>
        </div>
      </Card>

      {/* 汇总统计栏 */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Text type="secondary" style={{ fontSize: 13 }}>佣金支出（USDT）：
            <Text style={{ color: '#141414' }}>{totalUsdt.toLocaleString('en', { minimumFractionDigits: 2 })}</Text>
          </Text>
          <Divider type="vertical" />
          <Text type="secondary" style={{ fontSize: 13 }}>佣金支出（PEA）：
            <Text style={{ color: '#141414' }}>{totalPea.toLocaleString('en', { minimumFractionDigits: 2 })}</Text>
          </Text>
        </div>
      </Card>

      {/* 图表区 */}
      <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
        <Col xs={24} lg={12}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
            <Text style={{ fontSize: 13, fontWeight: 600 }}>企业佣金支出</Text>
            <Bar
              data={top5CommissionData}
              xField="value"
              yField="enterprise"
              height={220}
              style={{ fill: '#722ed1', marginTop: 8 }}
              scale={{ color: { range: ['#722ed1'] }, x: { paddingInner: 0.4 } }}
              axis={{ x: { labelFontSize: 11 }, y: { labelFontSize: 11 } }}
              tooltip={{ items: [{ channel: 'x', name: '佣金支出', valueFormatter: (v: number) => `${v.toLocaleString()}.00  USDT` }] }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
            <Text style={{ fontSize: 13, fontWeight: 600 }}>佣金订单数量</Text>
            <Column
              data={orderCountData}
              xField="enterprise"
              yField="value"
              height={220}
              style={{ fill: '#722ed1', marginTop: 8 }}
              scale={{ color: { range: ['#722ed1'] }, x: { paddingInner: 0.4 } }}
              axis={{ x: { labelFontSize: 10 }, y: { labelFontSize: 11 } }}
              tooltip={{ items: [{ channel: 'y', name: '订单数', valueFormatter: (v: number) => `${v}单` }] }}
            />
          </Card>
        </Col>
      </Row>

      {/* 订单表格 */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 14, fontWeight: 600 }}>佣金订单</Text>
          <Space size={8}>
            <ReloadOutlined style={{ cursor: 'pointer', color: '#8c8c8c' }} />
            <SettingOutlined style={{ cursor: 'pointer', color: '#8c8c8c' }} />
            <FullscreenOutlined style={{ cursor: 'pointer', color: '#8c8c8c' }} />
          </Space>
        </div>
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          size="middle"
          scroll={{ x: 1400 }}
          pagination={{ pageSize: 10, showTotal: (t) => `总共 ${t} 个项目`, showSizeChanger: true }}
          rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
        />
      </Card>

      {/* 详情 Drawer */}
      <Drawer
        title="详情"
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        width={660}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button type="primary" onClick={() => setDetailOpen(false)}>关闭</Button>
          </div>
        }
      >
        {selected && (
          <>
            <div style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: 600 }}>订单详情</Text>
              <div style={{ marginTop: 10, fontSize: 13, lineHeight: 2 }}>
                <div>佣金结算公司：{selected.appName}</div>
                <div>货币单位：{selected.currency}</div>
              </div>
            </div>
            <Divider />
            <Text style={{ fontSize: 14, fontWeight: 600 }}>来源订单详情</Text>
            <Table
              style={{ marginTop: 12 }}
              columns={sourceCols}
              dataSource={sourceMock}
              rowKey="id"
              size="small"
              pagination={{ pageSize: 5, showTotal: (t) => `总共 ${t} 个项目`, showSizeChanger: true, pageSizeOptions: ['5', '10'] }}
            />
          </>
        )}
      </Drawer>
    </div>
  );
};

export default CommissionOrderTab;
