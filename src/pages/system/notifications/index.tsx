import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, ConfigProvider, Descriptions, Input, Modal, Radio, Space, Switch, Table, Tabs, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'umi';
import TableToolbar from '../../../components/TableToolbar';

const { Text } = Typography;

const CARD_SHADOW = '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)';
const radioTheme = { components: { Radio: { buttonSolidCheckedBg: '#1677ff', buttonSolidCheckedHoverBg: '#4096ff', buttonSolidCheckedActiveBg: '#0958d9', buttonSolidCheckedColor: '#fff', colorPrimary: '#1677ff' } } };

// 通知类型
const NOTIF_TYPES = ['集团下拨', '集团调回', '追加投资', '增持股份', '企业解散', '新增订阅企业', '企业认证过期', '企业续费成功', '余额不足', '审批操作结果'];

// ── 通知记录数据 ──────────────────────────────────────────────────
interface NotifRecord {
  id: string;
  notifTime: string;
  method: '机器人' | '邮件' | '站内';
  type: string;
  target: string;
  content: string;
}

const METHODS: Array<NotifRecord['method']> = ['机器人', '邮件', '站内'];

const mockRecords: NotifRecord[] = Array.from({ length: 30 }, (_, i) => {
  const method = METHODS[i % 3];
  const type = NOTIF_TYPES[i % NOTIF_TYPES.length];
  const targets: Record<string, string[]> = {
    '机器人': ['审批通知群', '资金变动群', '系统告警群'],
    '邮件': ['tom@bluewhale.com', 'alice@bluewhale.com', 'bob@bluewhale.com'],
    '站内': ['Tom', 'Alice', 'Bob'],
  };
  return {
    id: `NF${String(i + 1).padStart(7, '0')}`,
    notifTime: `2026-04-${String((i % 20) + 1).padStart(2, '0')} ${String(8 + (i % 12))}:${String(10 + (i % 50)).padStart(2, '0')}:23`,
    method,
    type,
    target: targets[method][i % 3],
    content: `${type}通知，请相关人员及时处理。编号：${i + 1}`,
  };
});

// ── 通知配置数据 ──────────────────────────────────────────────────
interface NotifTarget {
  id: string;
  channel: '机器人' | '邮件';
  address: string;
  enabled: boolean;
  updatedAt: string;
}

const initialTargets: NotifTarget[] = [
  { id: 'NT001', channel: '机器人', address: 'tom_admin', enabled: true, updatedAt: '2026-04-10 14:30:00' },
  { id: 'NT002', channel: '机器人', address: 'alice_wang', enabled: true, updatedAt: '2026-04-10 14:30:00' },
  { id: 'NT003', channel: '邮件', address: 'tom@bluewhale.com', enabled: true, updatedAt: '2026-04-08 09:00:00' },
  { id: 'NT004', channel: '邮件', address: 'alice@bluewhale.com', enabled: false, updatedAt: '2026-04-08 09:00:00' },
];

// ── 主组件 ────────────────────────────────────────────────────────
const NotificationsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'records';

  const recordsContainerRef = useRef<HTMLDivElement>(null);
  const configContainerRef = useRef<HTMLDivElement>(null);
  const handleRefresh = useCallback(() => { message.success('已刷新'); }, []);

  // ── 通知记录 ────────────────────────────────────────────────────
  const [methodFilter, setMethodFilter] = useState<string | undefined>();
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [searchKw, setSearchKw] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<NotifRecord | null>(null);

  const filtered = mockRecords.filter((r) => {
    const kw = searchKw.toLowerCase();
    return (
      (!kw || r.target.toLowerCase().includes(kw) || r.content.toLowerCase().includes(kw)) &&
      (!methodFilter || r.method === methodFilter) &&
      (!typeFilter || r.type === typeFilter)
    );
  });

  const recordColumns: ColumnsType<NotifRecord> = [
    { title: '通知时间', dataIndex: 'notifTime', width: 170 },
    { title: '通知方式', dataIndex: 'method', width: 90 },
    { title: '通知类型', dataIndex: 'type', width: 130 },
    { title: '通知对象', dataIndex: 'target', width: 160 },
    { title: '通知内容', dataIndex: 'content', width: 300, ellipsis: true },
    {
      title: '操作', width: 80, fixed: 'right' as const,
      render: (_, r) => (
        <Button type="link" size="small" style={{ padding: 0 }}
          onClick={() => { setCurrentRecord(r); setDetailOpen(true); }}>
          详情
        </Button>
      ),
    },
  ];

  // ── 通知配置 ────────────────────────────────────────────────────
  const [targets, setTargets] = useState<NotifTarget[]>(initialTargets);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addChannel, setAddChannel] = useState<'机器人' | '邮件'>('机器人');
  const [addAddress, setAddAddress] = useState('');
  const [channelFilter, setChannelFilter] = useState<string | undefined>();

  const filteredTargets = channelFilter
    ? targets.filter((t) => t.channel === channelFilter)
    : targets;

  const handleToggleTarget = (record: NotifTarget) => {
    const next = !record.enabled;
    setTargets((prev) =>
      prev.map((r) =>
        r.id === record.id
          ? { ...r, enabled: next, updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) }
          : r,
      ),
    );
    message.success(next ? '已启用' : '已停用');
  };

  const handleDeleteTarget = (record: NotifTarget) => {
    Modal.confirm({
      title: '确认删除',
      content: `确认删除通知对象 ${record.address}？`,
      okText: '确认删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () => {
        setTargets((prev) => prev.filter((r) => r.id !== record.id));
        message.success('已删除');
      },
    });
  };

  const handleAddTarget = () => {
    const addr = addAddress.trim();
    if (!addr) {
      message.warning('请输入地址');
      return;
    }
    if (targets.some((t) => t.channel === addChannel && t.address === addr)) {
      message.warning('该通知对象已存在');
      return;
    }
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    setTargets((prev) => [...prev, {
      id: `NT${Date.now()}`,
      channel: addChannel,
      address: addr,
      enabled: true,
      updatedAt: now,
    }]);
    message.success('已添加');
    setAddModalOpen(false);
    setAddAddress('');
  };

  const targetColumns: ColumnsType<NotifTarget> = [
    { title: '通知类型', dataIndex: 'channel', width: 100 },
    { title: '通知地址', dataIndex: 'address', width: 200 },
    {
      title: '启用', dataIndex: 'enabled', width: 80, align: 'center' as const,
      render: (_: unknown, record: NotifTarget) => (
        <Switch size="small" checked={record.enabled} onChange={() => handleToggleTarget(record)} />
      ),
    },
    {
      title: '修改时间', dataIndex: 'updatedAt', width: 170,
      sorter: (a, b) => a.updatedAt.localeCompare(b.updatedAt),
      render: (v: string) => v || '—',
    },
    {
      title: '操作', width: 80, fixed: 'right' as const,
      render: (_: unknown, record: NotifTarget) => (
        <Button type="link" size="small" danger onClick={() => handleDeleteTarget(record)}>删除</Button>
      ),
    },
  ];

  // ── Tab 内容 ────────────────────────────────────────────────────
  const tabItems = [
    {
      key: 'records',
      label: '通知记录',
      children: (
        <div ref={recordsContainerRef}>
        <Space direction="vertical" size={12} style={{ display: 'flex' }}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
            <ConfigProvider theme={radioTheme}>
              <Space size={16} wrap align="center">
                <Radio.Group value={methodFilter ?? '全部'} onChange={(e) => setMethodFilter(e.target.value === '全部' ? undefined : e.target.value)} buttonStyle="solid">
                  {['全部', '机器人', '邮件', '站内'].map((v) => (
                    <Radio.Button key={v} value={v}>{v}</Radio.Button>
                  ))}
                </Radio.Group>
                <Radio.Group value={typeFilter ?? '全部'} onChange={(e) => setTypeFilter(e.target.value === '全部' ? undefined : e.target.value)} buttonStyle="solid">
                  {['全部', ...NOTIF_TYPES].map((v) => (
                    <Radio.Button key={v} value={v}>{v}</Radio.Button>
                  ))}
                </Radio.Group>
                <Input
                  placeholder="搜索通知对象"
                  value={searchKw}
                  onChange={(e) => setSearchKw(e.target.value)}
                  allowClear
                  style={{ width: 200 }}
                />
              </Space>
            </ConfigProvider>
          </Card>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: 600 }}>通知记录</Text>
              <TableToolbar onRefresh={handleRefresh} containerRef={recordsContainerRef} />
            </div>
            <Table
              columns={recordColumns}
              dataSource={filtered}
              rowKey="id"
              size="middle"
              scroll={{ x: 1100 }}
              pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
              rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
            />
          </Card>
        </Space>
        </div>
      ),
    },
    {
      key: 'config',
      label: '通知配置',
      children: (
        <div ref={configContainerRef}>
        <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ fontSize: 14, fontWeight: 600 }}>通知对象</Text>
            <Space>
              <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setAddModalOpen(true)}>添加</Button>
              <TableToolbar onRefresh={handleRefresh} containerRef={configContainerRef} />
            </Space>
          </div>
          <div style={{ marginBottom: 16 }}>
            <ConfigProvider theme={radioTheme}>
              <Radio.Group value={channelFilter ?? '全部'} onChange={(e) => setChannelFilter(e.target.value === '全部' ? undefined : e.target.value)} buttonStyle="solid" size="small">
                <Radio.Button value="全部">全部</Radio.Button>
                <Radio.Button value="机器人">机器人</Radio.Button>
                <Radio.Button value="邮件">邮件</Radio.Button>
              </Radio.Group>
            </ConfigProvider>
          </div>
          <div style={{ marginBottom: 16, fontSize: 12, color: '#8c8c8c' }}>
            站内通知默认发送给所有平台用户，无需配置。
          </div>
          <Table
            columns={targetColumns}
            dataSource={filteredTargets}
            rowKey="id"
            size="middle"
            pagination={false}
            rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
          />
        </Card>
        </div>
      ),
    },
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

      {/* 通知详情弹窗 */}
      <Modal
        title={currentRecord?.method === '机器人' ? '机器人通知' : currentRecord?.method === '站内' ? '站内通知' : '邮件通知'}
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={480}
      >
        {currentRecord && (
          <Descriptions column={1} bordered size="small" style={{ marginTop: 16 }}
            labelStyle={{ whiteSpace: 'nowrap', width: 90 }}>
            <Descriptions.Item label="发送时间">{currentRecord.notifTime}</Descriptions.Item>
            <Descriptions.Item label="通知方式">{currentRecord.method}</Descriptions.Item>
            <Descriptions.Item label="通知类型">{currentRecord.type}</Descriptions.Item>
            <Descriptions.Item label="通知对象">{currentRecord.target}</Descriptions.Item>
            <Descriptions.Item label="通知内容">{currentRecord.content}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* 添加通知对象弹窗 */}
      <Modal
        title="添加通知对象"
        open={addModalOpen}
        onCancel={() => { setAddModalOpen(false); setAddAddress(''); }}
        onOk={handleAddTarget}
        width={420}
      >
        <div style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 12 }}>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>通知类型</Text>
            <Radio.Group value={addChannel} onChange={(e) => { setAddChannel(e.target.value); setAddAddress(''); }}>
              <Radio.Button value="机器人">机器人</Radio.Button>
              <Radio.Button value="邮件">邮件</Radio.Button>
            </Radio.Group>
          </div>
          <div>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
              {addChannel === '机器人' ? 'APP账号名' : '邮箱地址'}
            </Text>
            <Input
              placeholder={addChannel === '机器人' ? '例：tom_admin' : '例：tom@company.com'}
              value={addAddress}
              onChange={(e) => setAddAddress(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default NotificationsPage;
