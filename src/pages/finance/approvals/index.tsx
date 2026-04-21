import {
  Button, Card, ConfigProvider, DatePicker, Descriptions, Modal,
  Radio, Select, Space, Table, Tabs, Tag, Tooltip, Typography, message,
} from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import React, { useRef, useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'umi';
import TableToolbar from '../../../components/TableToolbar';
import ApprovalRulesTab from './ApprovalRulesTab';
import ApprovalPermissionsTab from './ApprovalPermissionsTab';

const { Text } = Typography;
const { RangePicker } = DatePicker;

const CARD_SHADOW = '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)';
const CARD_RADIUS = 12;
const radioTheme = { components: { Radio: { buttonSolidCheckedBg: '#1677ff', buttonSolidCheckedHoverBg: '#4096ff', buttonSolidCheckedActiveBg: '#0958d9', buttonSolidCheckedColor: '#fff', colorPrimary: '#1677ff' } } };

// ── 审批状态 ──────────────────────────────────────────────────────
type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'auto_approved' | 'timeout_rejected';

const STATUS_LABELS: Record<ApprovalStatus, string> = {
  pending: '待审批',
  approved: '已通过',
  rejected: '已拒绝',
  auto_approved: '自动通过',
  timeout_rejected: '超时拒绝',
};

const STATUS_COLORS: Record<ApprovalStatus, string> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
  auto_approved: 'processing',
  timeout_rejected: 'default',
};

type OrderStatus = 'success' | 'failed' | 'pending';

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  success: '成功',
  failed: '失败',
  pending: '待执行',
};

const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  success: 'success',
  failed: 'error',
  pending: 'default',
};

// ── 事件类型 ──────────────────────────────────────────────────────
type EventType = 'additional_investment' | 'share_release';

const EVENT_LABELS: Record<EventType, string> = {
  additional_investment: '追加投资',
  share_release: '增持股份',
};

// ── 审批单数据结构 ────────────────────────────────────────────────
interface ApprovalRecord {
  id: string;
  orderId: string;
  eventType: EventType;
  status: ApprovalStatus;
  orderStatus: OrderStatus;

  sourceCompanyId: string;
  sourceCompanyName: string;
  sourceOwnerId: string;
  sourceOwnerUsername: string;
  sourceOwnerNickname: string;

  currency: string;
  amount: number;
  totalTransactionAmount: number;
  shareRatio: number;
  historicalTotalInvest: number;
  enterpriseTotalAssets: number;

  createdAt: string;
  deadline: string;

  approvedByNickname?: string;
  approvedById?: string;
  approvedAt?: string;
  remark?: string;

  companyId: string;
  companyName: string;
}

// ── Mock 企业 ─────────────────────────────────────────────────────
const MOCK_ENTERPRISES = [
  { id: 'ENT001', name: '星辰科技', ownerId: 'U101', ownerUsername: 'zhang_wei', ownerNickname: '张伟' },
  { id: 'ENT002', name: '云帆网络', ownerId: 'U102', ownerUsername: 'li_na', ownerNickname: '李娜' },
  { id: 'ENT003', name: '山海集团', ownerId: 'U103', ownerUsername: 'wang_fang', ownerNickname: '王芳' },
  { id: 'ENT004', name: '天元控股', ownerId: 'U104', ownerUsername: 'chen_jie', ownerNickname: '陈杰' },
];

const MOCK_APPROVALS: ApprovalRecord[] = Array.from({ length: 20 }, (_, i) => {
  const ent = MOCK_ENTERPRISES[i % 4];
  const isInvest = i % 2 === 0;
  const statusPool: ApprovalStatus[] = ['pending', 'approved', 'rejected', 'auto_approved', 'timeout_rejected'];
  const status = statusPool[i % 5];
  const hasApprover = status === 'approved' || status === 'rejected';
  const day = String(20 - i).padStart(2, '0');

  const orderStatus: OrderStatus = status === 'approved'
    ? (i % 3 === 0 ? 'failed' : 'success')
    : 'pending';

  const currency = i % 3 === 0 ? 'PEA' : 'USDT';
  const totalTransactionAmount = isInvest ? 100000 + i * 5000 : 200000 + i * 10000;
  const shareRatio = isInvest ? 15 + (i % 20) : 5 + (i % 15);
  const amount = Math.round(totalTransactionAmount * shareRatio / 100);
  const historicalTotalInvest = 500000 + i * 20000;
  const enterpriseTotalAssets = 2000000 + i * 50000;

  return {
    id: `APR${String(i + 1).padStart(5, '0')}`,
    orderId: `ORD${String(20000 + i).padStart(8, '0')}`,
    eventType: isInvest ? 'additional_investment' : 'share_release',
    status,
    orderStatus,

    sourceCompanyId: ent.id,
    sourceCompanyName: ent.name,
    sourceOwnerId: ent.ownerId,
    sourceOwnerUsername: ent.ownerUsername,
    sourceOwnerNickname: ent.ownerNickname,

    currency,
    amount,
    totalTransactionAmount,
    shareRatio,
    historicalTotalInvest,
    enterpriseTotalAssets,

    createdAt: `2026-04-${day} ${String(9 + (i % 10)).padStart(2, '0')}:${String(i * 3 % 60).padStart(2, '0')}:00`,
    deadline: `2026-04-${String(Math.min(28, 20 - i + 3)).padStart(2, '0')} 18:00:00`,

    ...(hasApprover
      ? { approvedByNickname: 'Tom', approvedById: 'ADM001', approvedAt: `2026-04-${day} ${String(10 + (i % 8)).padStart(2, '0')}:30:00`, remark: status === 'rejected' ? '金额异常，需核实' : '' }
      : {}),

    companyId: 'COM001',
    companyName: '蓝鲸投资',
  };
});


// ── 所有列定义（含 key 标记） ─────────────────────────────────────
const ALL_COLUMN_DEFS: { key: string; title: string; defaultVisible: boolean }[] = [
  { key: 'createdAt', title: '订单时间', defaultVisible: true },
  { key: 'eventType', title: '订单类型', defaultVisible: true },
  { key: 'sourceCompanyName', title: '企业名称', defaultVisible: true },
  { key: 'sourceCompanyId', title: '企业ID', defaultVisible: true },
  { key: 'currency', title: '货币单位', defaultVisible: true },
  { key: 'amount', title: '金额', defaultVisible: true },
  { key: 'historicalTotalInvest', title: '历史总投资', defaultVisible: true },
  { key: 'enterpriseTotalAssets', title: '企业总资产', defaultVisible: true },
  { key: 'totalTransactionAmount', title: '交易总金额', defaultVisible: true },
  { key: 'shareRatio', title: '股份比例', defaultVisible: true },
  { key: 'status', title: '审批状态', defaultVisible: true },
  { key: 'orderStatus', title: '订单状态', defaultVisible: true },
  { key: 'orderId', title: '订单ID', defaultVisible: false },
  { key: 'deadline', title: '审批截止', defaultVisible: false },
  { key: 'companyName', title: '归属公司', defaultVisible: false },
  { key: 'companyId', title: '归属公司ID', defaultVisible: false },
  { key: 'sourceOwnerNickname', title: '企业主昵称', defaultVisible: false },
  { key: 'sourceOwnerId', title: '企业主ID', defaultVisible: false },
  { key: 'sourceOwnerUsername', title: '企业主用户名', defaultVisible: false },
  { key: 'approvedByNickname', title: '审批人昵称', defaultVisible: false },
  { key: 'approvedById', title: '审批人ID', defaultVisible: false },
  { key: 'approvedAt', title: '审批时间', defaultVisible: false },
  { key: 'remark', title: '备注', defaultVisible: false },
];

const DEFAULT_VISIBLE_KEYS = ALL_COLUMN_DEFS.filter((c) => c.defaultVisible).map((c) => c.key);

const titleWithTip = (title: string, tip: string) => (
  <span>
    {title}{' '}
    <Tooltip title={tip}><QuestionCircleOutlined style={{ color: '#bfbfbf', fontSize: 12 }} /></Tooltip>
  </span>
);

// ── 审批列表 Tab ──────────────────────────────────────────────────
const ApprovalListTab: React.FC = () => {
  const [eventFilter, setEventFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [orderStatusFilter, setOrderStatusFilter] = useState<string | undefined>();
  const [companyFilter, setCompanyFilter] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[any, any] | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<ApprovalRecord | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<string[]>(DEFAULT_VISIBLE_KEYS);
  const [refreshKey, setRefreshKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const companyOptions = useMemo(() => {
    const map = new Map<string, string>();
    MOCK_APPROVALS.forEach((r) => map.set(r.sourceCompanyId, r.sourceCompanyName));
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, []);

  const filtered = useMemo(() => {
    return MOCK_APPROVALS.filter((r) => {
      if (eventFilter && r.eventType !== eventFilter) return false;
      if (statusFilter && r.status !== statusFilter) return false;
      if (orderStatusFilter && r.orderStatus !== orderStatusFilter) return false;
      if (companyFilter && r.sourceCompanyId !== companyFilter) return false;
      if (dateRange && dateRange[0] && dateRange[1]) {
        const start = dateRange[0].format('YYYY-MM-DD');
        const end = dateRange[1].format('YYYY-MM-DD');
        const day = r.createdAt.slice(0, 10);
        if (day < start || day > end) return false;
      }
      return true;
    });
  }, [eventFilter, statusFilter, orderStatusFilter, companyFilter, dateRange, refreshKey]);

  const handleApprove = (record: ApprovalRecord) => {
    Modal.confirm({
      title: '确认通过',
      content: `确认通过 ${record.sourceCompanyName} 的${EVENT_LABELS[record.eventType]}申请？`,
      okText: '确认通过',
      cancelText: '取消',
      onOk: () => { message.success('审批已通过'); },
    });
  };

  const handleReject = (record: ApprovalRecord) => {
    Modal.confirm({
      title: '确认拒绝',
      content: `确认拒绝 ${record.sourceCompanyName} 的${EVENT_LABELS[record.eventType]}申请？`,
      okText: '确认拒绝',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () => { message.success('审批已拒绝'); },
    });
  };

  const showDetail = (record: ApprovalRecord) => {
    setCurrentRecord(record);
    setDetailOpen(true);
  };

  const allColumnsMap: Record<string, ColumnsType<ApprovalRecord>[number]> = {
    createdAt: { title: '订单时间', dataIndex: 'createdAt', width: 170, sorter: (a: ApprovalRecord, b: ApprovalRecord) => a.createdAt.localeCompare(b.createdAt) },
    eventType: { title: '订单类型', dataIndex: 'eventType', width: 120, render: (v: EventType) => EVENT_LABELS[v] },
    sourceCompanyName: { title: '企业名称', dataIndex: 'sourceCompanyName', width: 120 },
    sourceCompanyId: { title: '企业ID', dataIndex: 'sourceCompanyId', width: 100 },
    currency: { title: '货币单位', dataIndex: 'currency', width: 90 },
    amount: {
      title: '金额', dataIndex: 'amount', width: 130,
      render: (v: number) => <Text style={{ whiteSpace: 'nowrap' }}>{v?.toLocaleString() ?? '-'}</Text>,
    },
    historicalTotalInvest: {
      title: titleWithTip('历史总投资', '对此公司历史追加投入及释放股份投入之和'),
      dataIndex: 'historicalTotalInvest', width: 160,
      render: (v: number) => <Text style={{ whiteSpace: 'nowrap' }}>{v?.toLocaleString() ?? '-'}</Text>,
    },
    enterpriseTotalAssets: {
      title: '企业总资产', dataIndex: 'enterpriseTotalAssets', width: 150,
      render: (v: number) => <Text style={{ whiteSpace: 'nowrap' }}>{v?.toLocaleString() ?? '-'}</Text>,
    },
    totalTransactionAmount: {
      title: titleWithTip('交易总金额', '追加投资：本次追加投资总金额；增持股份：当前总股本预估金额'),
      dataIndex: 'totalTransactionAmount', width: 170,
      render: (v: number) => <Text style={{ whiteSpace: 'nowrap' }}>{v?.toLocaleString() ?? '-'}</Text>,
    },
    shareRatio: {
      title: '股份比例', dataIndex: 'shareRatio', width: 100,
      render: (v: number) => `${v}%`,
    },
    status: { title: '审批状态', dataIndex: 'status', width: 100, render: (v: ApprovalStatus) => <Tag color={STATUS_COLORS[v]}>{STATUS_LABELS[v]}</Tag> },
    orderStatus: {
      title: '订单状态', dataIndex: 'orderStatus', width: 100,
      render: (v: OrderStatus) => <Tag color={ORDER_STATUS_COLORS[v]}>{ORDER_STATUS_LABELS[v]}</Tag>,
    },
    orderId: { title: '订单ID', dataIndex: 'orderId', width: 140 },
    deadline: { title: '审批截止', dataIndex: 'deadline', width: 170 },
    companyName: { title: '归属公司', dataIndex: 'companyName', width: 100 },
    companyId: { title: '归属公司ID', dataIndex: 'companyId', width: 110 },
    sourceOwnerNickname: { title: '企业主昵称', dataIndex: 'sourceOwnerNickname', width: 100 },
    sourceOwnerId: { title: '企业主ID', dataIndex: 'sourceOwnerId', width: 90 },
    sourceOwnerUsername: { title: '企业主用户名', dataIndex: 'sourceOwnerUsername', width: 120 },
    approvedByNickname: { title: '审批人昵称', dataIndex: 'approvedByNickname', width: 100, render: (v?: string) => v || '-' },
    approvedById: { title: '审批人ID', dataIndex: 'approvedById', width: 100, render: (v?: string) => v || '-' },
    approvedAt: { title: '审批时间', dataIndex: 'approvedAt', width: 170, render: (v?: string) => v || '-' },
    remark: { title: '备注', dataIndex: 'remark', width: 140, render: (v?: string) => v || '-' },
  };

  const columns: ColumnsType<ApprovalRecord> = [
    ...ALL_COLUMN_DEFS.filter((d) => visibleKeys.includes(d.key)).map((d) => allColumnsMap[d.key]),
    {
      title: '操作', width: 140, fixed: 'right' as const,
      render: (_: unknown, record: ApprovalRecord) => (
        <Space size={4}>
          <Button type="link" size="small" onClick={() => showDetail(record)}>详情</Button>
          {record.status === 'pending' && (
            <>
              <Button type="link" size="small" danger onClick={() => handleReject(record)}>拒绝</Button>
              <Button type="link" size="small" onClick={() => handleApprove(record)}>通过</Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const scrollX = columns.reduce((sum, c) => sum + ((c.width as number) || 120), 0);

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
    message.success('已刷新');
  }, []);

  return (
    <div ref={containerRef}>
      <Card bordered={false} style={{ borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW }}>
        <Space size={16} wrap align="center" style={{ marginBottom: 16 }}>
          <ConfigProvider theme={radioTheme}>
            <Radio.Group
              value={eventFilter ?? '全部'}
              onChange={(e) => setEventFilter(e.target.value === '全部' ? undefined : e.target.value)}
              buttonStyle="solid"
            >
              {[{ value: '全部', label: '全部类型' }, ...Object.entries(EVENT_LABELS).map(([value, label]) => ({ value, label }))].map((item) => (
                <Radio.Button key={item.value} value={item.value}>
                  {item.label}
                </Radio.Button>
              ))}
            </Radio.Group>
          </ConfigProvider>
          <ConfigProvider theme={radioTheme}>
            <Radio.Group
              value={statusFilter ?? '全部'}
              onChange={(e) => setStatusFilter(e.target.value === '全部' ? undefined : e.target.value)}
              buttonStyle="solid"
            >
              {[{ value: '全部', label: '全部状态' }, ...Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }))].map((item) => (
                <Radio.Button key={item.value} value={item.value}>
                  {item.label}
                </Radio.Button>
              ))}
            </Radio.Group>
          </ConfigProvider>
          <ConfigProvider theme={radioTheme}>
            <Radio.Group
              value={orderStatusFilter ?? '全部'}
              onChange={(e) => setOrderStatusFilter(e.target.value === '全部' ? undefined : e.target.value)}
              buttonStyle="solid"
            >
              {[{ value: '全部', label: '全部订单状态' }, ...Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({ value, label }))].map((item) => (
                <Radio.Button key={item.value} value={item.value}>{item.label}</Radio.Button>
              ))}
            </Radio.Group>
          </ConfigProvider>
          <Select
            placeholder="触发方企业"
            value={companyFilter}
            onChange={setCompanyFilter}
            allowClear
            style={{ width: 160 }}
            options={companyOptions}
          />
          <RangePicker onChange={(dates) => setDateRange(dates as [any, any] | null)} />
        </Space>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 14, fontWeight: 600 }}>订单列表</Text>
          <TableToolbar
            columns={ALL_COLUMN_DEFS.map((c) => ({ key: c.key, title: c.title }))}
            visibleKeys={visibleKeys}
            onVisibleKeysChange={setVisibleKeys}
            onRefresh={handleRefresh}
            containerRef={containerRef}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          size="middle"
          scroll={{ x: scrollX }}
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
          rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
        />
      </Card>

      {/* 详情弹窗 — 所有字段 */}
      <Modal
        title={`审批详情 — ${currentRecord?.id}`}
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={640}
      >
        {currentRecord && (
          <Descriptions column={1} bordered size="small" style={{ marginTop: 16 }} labelStyle={{ whiteSpace: 'nowrap', width: 120 }}>
            <Descriptions.Item label="审批单ID">{currentRecord.id}</Descriptions.Item>
            <Descriptions.Item label="订单ID">{currentRecord.orderId}</Descriptions.Item>
            <Descriptions.Item label="订单类型">{EVENT_LABELS[currentRecord.eventType]}</Descriptions.Item>
            <Descriptions.Item label="企业名称">{currentRecord.sourceCompanyName}</Descriptions.Item>
            <Descriptions.Item label="企业ID">{currentRecord.sourceCompanyId}</Descriptions.Item>
            <Descriptions.Item label="企业主昵称">{currentRecord.sourceOwnerNickname}</Descriptions.Item>
            <Descriptions.Item label="企业主ID">{currentRecord.sourceOwnerId}</Descriptions.Item>
            <Descriptions.Item label="企业主用户名">{currentRecord.sourceOwnerUsername}</Descriptions.Item>
            <Descriptions.Item label="货币单位">{currentRecord.currency}</Descriptions.Item>
            <Descriptions.Item label="金额">{currentRecord.amount?.toLocaleString()} {currentRecord.currency}</Descriptions.Item>
            <Descriptions.Item label="历史总投资">{currentRecord.historicalTotalInvest?.toLocaleString()} {currentRecord.currency}</Descriptions.Item>
            <Descriptions.Item label="企业总资产">{currentRecord.enterpriseTotalAssets?.toLocaleString()} {currentRecord.currency}</Descriptions.Item>
            <Descriptions.Item label="交易总金额">{currentRecord.totalTransactionAmount?.toLocaleString()} {currentRecord.currency}</Descriptions.Item>
            <Descriptions.Item label="股份比例">{currentRecord.shareRatio}%</Descriptions.Item>
            <Descriptions.Item label="订单时间">{currentRecord.createdAt}</Descriptions.Item>
            <Descriptions.Item label="审批截止">{currentRecord.deadline}</Descriptions.Item>
            <Descriptions.Item label="审批状态">
              <Tag color={STATUS_COLORS[currentRecord.status]}>{STATUS_LABELS[currentRecord.status]}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="订单状态">
              <Tag color={ORDER_STATUS_COLORS[currentRecord.orderStatus]}>{ORDER_STATUS_LABELS[currentRecord.orderStatus]}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="审批人昵称">{currentRecord.approvedByNickname || '-'}</Descriptions.Item>
            <Descriptions.Item label="审批人ID">{currentRecord.approvedById || '-'}</Descriptions.Item>
            <Descriptions.Item label="审批时间">{currentRecord.approvedAt || '-'}</Descriptions.Item>
            <Descriptions.Item label="备注">{currentRecord.remark || '-'}</Descriptions.Item>
            <Descriptions.Item label="归属公司">{currentRecord.companyName}</Descriptions.Item>
            <Descriptions.Item label="归属公司ID">{currentRecord.companyId}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

// ── 主页面 ────────────────────────────────────────────────────────
const ApprovalsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'list';

  const tabItems = [
    { key: 'list', label: '订单列表', children: <ApprovalListTab /> },
    { key: 'rules', label: '审批规则', children: <ApprovalRulesTab /> },
    { key: 'permissions', label: '审批权限', children: <ApprovalPermissionsTab /> },
  ];

  return (
    <div style={{ marginTop: -16 }}>
      <Tabs
        items={tabItems}
        activeKey={activeTab}
        onChange={(key) => setSearchParams({ tab: key })}
        tabBarStyle={{
          background: '#fff',
          margin: '0 -24px',
          padding: '0 24px',
        }}
      />
    </div>
  );
};

export default ApprovalsPage;
