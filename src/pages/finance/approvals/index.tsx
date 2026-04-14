import {
  Button, Card, ConfigProvider, DatePicker, Descriptions, Modal,
  Radio, Select, Space, Table, Tabs, Tag, Typography, message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'umi';
import ApprovalRulesTab from './ApprovalRulesTab';

const { Text } = Typography;
const { RangePicker } = DatePicker;

const CARD_SHADOW = '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)';
const CARD_RADIUS = 12;
const radioTheme = { components: { Radio: { colorPrimary: '#1677ff', buttonSolidCheckedBg: '#ffffff', buttonSolidCheckedColor: '#1677ff', buttonCheckedBg: '#ffffff' } } };

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

// ── 事件类型 ──────────────────────────────────────────────────────
type EventType = 'additional_investment' | 'share_release';

const EVENT_LABELS: Record<EventType, string> = {
  additional_investment: '持股企业追加投资',
  share_release: '持股企业释放股份',
};

// ── 审批单数据结构 ────────────────────────────────────────────────
interface ApprovalRecord {
  id: string;
  eventType: EventType;
  status: ApprovalStatus;

  sourceCompanyId: string;
  sourceCompanyName: string;
  sourceOwnerId: string;
  sourceOwnerUsername: string;
  sourceOwnerNickname: string;

  totalInvestAmount?: number;
  shareRatio?: number;
  investCurrency?: string;
  investAmount?: number;

  releaseRatio?: number;
  totalShareValue?: number;
  releaseCurrency?: string;
  releaseAmount?: number;

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
  { id: 'ENT001', name: 'CyberBot', ownerId: 'U101', ownerUsername: 'zhang_wei', ownerNickname: '张伟' },
  { id: 'ENT002', name: 'StarLink', ownerId: 'U102', ownerUsername: 'li_na', ownerNickname: '李娜' },
  { id: 'ENT003', name: 'QuantumPay', ownerId: 'U103', ownerUsername: 'wang_fang', ownerNickname: '王芳' },
  { id: 'ENT004', name: 'NovaTech', ownerId: 'U104', ownerUsername: 'chen_jie', ownerNickname: '陈杰' },
];

const MOCK_APPROVALS: ApprovalRecord[] = Array.from({ length: 20 }, (_, i) => {
  const ent = MOCK_ENTERPRISES[i % 4];
  const isInvest = i % 2 === 0;
  const statusPool: ApprovalStatus[] = ['pending', 'approved', 'rejected', 'auto_approved', 'timeout_rejected'];
  const status = statusPool[i % 5];
  const hasApprover = status === 'approved' || status === 'rejected';
  const day = String(20 - i).padStart(2, '0');

  return {
    id: `APR${String(i + 1).padStart(5, '0')}`,
    eventType: isInvest ? 'additional_investment' : 'share_release',
    status,

    sourceCompanyId: ent.id,
    sourceCompanyName: ent.name,
    sourceOwnerId: ent.ownerId,
    sourceOwnerUsername: ent.ownerUsername,
    sourceOwnerNickname: ent.ownerNickname,

    ...(isInvest
      ? { totalInvestAmount: 100000 + i * 5000, shareRatio: 15 + (i % 20), investCurrency: 'USDT', investAmount: 15000 + i * 750 }
      : { releaseRatio: 5 + (i % 15), totalShareValue: 200000 + i * 10000, releaseCurrency: 'USDT', releaseAmount: 10000 + i * 500 }),

    createdAt: `2026-04-${day} ${String(9 + (i % 10)).padStart(2, '0')}:${String(i * 3 % 60).padStart(2, '0')}:00`,
    deadline: `2026-04-${String(Math.min(28, 20 - i + 3)).padStart(2, '0')} 18:00:00`,

    ...(hasApprover
      ? { approvedByNickname: 'Tom', approvedById: 'ADM001', approvedAt: `2026-04-${day} ${String(10 + (i % 8)).padStart(2, '0')}:30:00`, remark: status === 'rejected' ? '金额异常，需核实' : '' }
      : {}),

    companyId: 'COM001',
    companyName: '滴滴答答',
  };
});

// ── 审批列表 Tab ──────────────────────────────────────────────────
const ApprovalListTab: React.FC = () => {
  const [eventFilter, setEventFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [companyFilter, setCompanyFilter] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[any, any] | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<ApprovalRecord | null>(null);

  const companyOptions = useMemo(() => {
    const map = new Map<string, string>();
    MOCK_APPROVALS.forEach((r) => map.set(r.sourceCompanyId, r.sourceCompanyName));
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, []);

  const filtered = useMemo(() => {
    return MOCK_APPROVALS.filter((r) => {
      if (eventFilter && r.eventType !== eventFilter) return false;
      if (statusFilter && r.status !== statusFilter) return false;
      if (companyFilter && r.sourceCompanyId !== companyFilter) return false;
      if (dateRange && dateRange[0] && dateRange[1]) {
        const start = dateRange[0].format('YYYY-MM-DD');
        const end = dateRange[1].format('YYYY-MM-DD');
        const day = r.createdAt.slice(0, 10);
        if (day < start || day > end) return false;
      }
      return true;
    });
  }, [eventFilter, statusFilter, companyFilter, dateRange]);

  const handleApprove = (record: ApprovalRecord) => {
    Modal.confirm({
      title: '确认通过',
      content: `确认通过 ${record.sourceCompanyName} 的${EVENT_LABELS[record.eventType]}申请？`,
      okText: '确认通过',
      cancelText: '取消',
      onOk: () => {
        message.success('审批已通过');
      },
    });
  };

  const handleReject = (record: ApprovalRecord) => {
    Modal.confirm({
      title: '确认拒绝',
      content: `确认拒绝 ${record.sourceCompanyName} 的${EVENT_LABELS[record.eventType]}申请？`,
      okText: '确认拒绝',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () => {
        message.success('审批已拒绝');
      },
    });
  };

  const showDetail = (record: ApprovalRecord) => {
    setCurrentRecord(record);
    setDetailOpen(true);
  };

  const businessSummary = (r: ApprovalRecord): string => {
    if (r.eventType === 'additional_investment') {
      return `总额 ${r.totalInvestAmount?.toLocaleString()} ${r.investCurrency}，占股 ${r.shareRatio}%，需投 ${r.investAmount?.toLocaleString()} ${r.investCurrency}`;
    }
    return `释放 ${r.releaseRatio}%，总股本 ${r.totalShareValue?.toLocaleString()} ${r.releaseCurrency}，金额 ${r.releaseAmount?.toLocaleString()} ${r.releaseCurrency}`;
  };

  const columns: ColumnsType<ApprovalRecord> = [
    { title: '审批开始', dataIndex: 'createdAt', width: 170, sorter: (a, b) => a.createdAt.localeCompare(b.createdAt) },
    { title: '审批截止', dataIndex: 'deadline', width: 170 },
    { title: '事件类型', dataIndex: 'eventType', width: 160, render: (v: EventType) => EVENT_LABELS[v] },
    { title: '企业名称', dataIndex: 'sourceCompanyName', width: 120 },
    { title: '企业ID', dataIndex: 'sourceCompanyId', width: 100 },
    { title: '企业主昵称', dataIndex: 'sourceOwnerNickname', width: 100 },
    { title: '企业主ID', dataIndex: 'sourceOwnerId', width: 90 },
    { title: '企业主用户名', dataIndex: 'sourceOwnerUsername', width: 120 },
    { title: '归属公司', dataIndex: 'companyName', width: 100 },
    { title: '归属公司ID', dataIndex: 'companyId', width: 110 },
    { title: '业务摘要', width: 320, render: (_: unknown, r: ApprovalRecord) => <Text style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{businessSummary(r)}</Text> },
    {
      title: '审批状态', dataIndex: 'status', width: 100,
      render: (v: ApprovalStatus) => <Tag color={STATUS_COLORS[v]}>{STATUS_LABELS[v]}</Tag>,
    },
    { title: '审批人昵称', dataIndex: 'approvedByNickname', width: 100, render: (v?: string) => v || '-' },
    { title: '审批人ID', dataIndex: 'approvedById', width: 100, render: (v?: string) => v || '-' },
    { title: '审批时间', dataIndex: 'approvedAt', width: 170, render: (v?: string) => v || '-' },
    {
      title: '操作', width: 140, fixed: 'right' as const,
      render: (_: unknown, record: ApprovalRecord) => {
        if (record.status === 'pending') {
          return (
            <Space size={4}>
              <Button type="link" size="small" onClick={() => handleApprove(record)}>通过</Button>
              <Button type="link" size="small" danger onClick={() => handleReject(record)}>拒绝</Button>
            </Space>
          );
        }
        return <Button type="link" size="small" onClick={() => showDetail(record)}>查看详情</Button>;
      },
    },
  ];

  return (
    <>
      <Card bordered={false} style={{ borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW }}>
        <Space size={16} wrap align="center" style={{ marginBottom: 16 }}>
          <ConfigProvider theme={radioTheme}>
            <Radio.Group
              value={eventFilter ?? '全部'}
              onChange={(e) => setEventFilter(e.target.value === '全部' ? undefined : e.target.value)}
              buttonStyle="outline"
            >
              {[{ value: '全部', label: '全部类型' }, ...Object.entries(EVENT_LABELS).map(([value, label]) => ({ value, label }))].map((item) => (
                <Radio.Button key={item.value} value={item.value} style={(eventFilter ?? '全部') === item.value ? { color: '#1677ff', borderColor: '#1677ff' } : {}}>
                  {item.label}
                </Radio.Button>
              ))}
            </Radio.Group>
          </ConfigProvider>
          <ConfigProvider theme={radioTheme}>
            <Radio.Group
              value={statusFilter ?? '全部'}
              onChange={(e) => setStatusFilter(e.target.value === '全部' ? undefined : e.target.value)}
              buttonStyle="outline"
            >
              {[{ value: '全部', label: '全部状态' }, ...Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }))].map((item) => (
                <Radio.Button key={item.value} value={item.value} style={(statusFilter ?? '全部') === item.value ? { color: '#1677ff', borderColor: '#1677ff' } : {}}>
                  {item.label}
                </Radio.Button>
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
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          size="middle"
          scroll={{ x: 2300 }}
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
          rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
        />
      </Card>

      <Modal
        title={`审批详情 — ${currentRecord?.id}`}
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={600}
      >
        {currentRecord && (
          <Descriptions column={1} bordered size="small" style={{ marginTop: 16 }} labelStyle={{ whiteSpace: 'nowrap', width: 120 }}>
            <Descriptions.Item label="事件类型">{EVENT_LABELS[currentRecord.eventType]}</Descriptions.Item>
            <Descriptions.Item label="企业名称">{currentRecord.sourceCompanyName}</Descriptions.Item>
            <Descriptions.Item label="企业ID">{currentRecord.sourceCompanyId}</Descriptions.Item>
            <Descriptions.Item label="企业主昵称">{currentRecord.sourceOwnerNickname}</Descriptions.Item>
            <Descriptions.Item label="企业主ID">{currentRecord.sourceOwnerId}</Descriptions.Item>
            <Descriptions.Item label="企业主用户名">{currentRecord.sourceOwnerUsername}</Descriptions.Item>

            {currentRecord.eventType === 'additional_investment' && (
              <>
                <Descriptions.Item label="追加投资总金额">{currentRecord.totalInvestAmount?.toLocaleString()} {currentRecord.investCurrency}</Descriptions.Item>
                <Descriptions.Item label="本公司占股比例">{currentRecord.shareRatio}%</Descriptions.Item>
                <Descriptions.Item label="需投资金额">{currentRecord.investAmount?.toLocaleString()} {currentRecord.investCurrency}</Descriptions.Item>
              </>
            )}
            {currentRecord.eventType === 'share_release' && (
              <>
                <Descriptions.Item label="释放股份比例">{currentRecord.releaseRatio}%</Descriptions.Item>
                <Descriptions.Item label="总股本预估金额">{currentRecord.totalShareValue?.toLocaleString()} {currentRecord.releaseCurrency}</Descriptions.Item>
                <Descriptions.Item label="释放股份金额">{currentRecord.releaseAmount?.toLocaleString()} {currentRecord.releaseCurrency}</Descriptions.Item>
              </>
            )}

            <Descriptions.Item label="审批开始">{currentRecord.createdAt}</Descriptions.Item>
            <Descriptions.Item label="审批截止">{currentRecord.deadline}</Descriptions.Item>
            <Descriptions.Item label="审批状态">
              <Tag color={STATUS_COLORS[currentRecord.status]}>{STATUS_LABELS[currentRecord.status]}</Tag>
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
    </>
  );
};

// ── 主页面 ────────────────────────────────────────────────────────
const ApprovalsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'list';

  const tabItems = [
    { key: 'list', label: '审批列表', children: <ApprovalListTab /> },
    { key: 'rules', label: '审批规则', children: <ApprovalRulesTab /> },
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
