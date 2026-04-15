import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, ConfigProvider, Descriptions, Divider, Input, Modal, Radio, Select, Space, Switch, Table, Tabs, Tag, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState, useRef, useCallback } from 'react';
import TableToolbar from '../../../components/TableToolbar';

const { Text } = Typography;

const CARD_SHADOW = '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)';

// 通知类型
const NOTIF_TYPES = ['集团下拨', '集团调回', '持股企业追加投资', '持股企业释放股份', '企业解散', '新增订阅企业', '企业认证过期', '企业续费成功', '余额不足'];

// ── 通知用户 mock ─────────────────────────────────────────────────
interface NotifUser {
  id: string;
  name: string;
  appAccount: string;
  email: string;
}

const initUsers: NotifUser[] = [
  { id: 'U1', name: 'Miya', appAccount: '@miya_miya', email: 'miya@cyberbot.sg' },
  { id: 'U2', name: 'Tom', appAccount: '@tom_admin', email: 'tom@cyberbot.sg' },
  { id: 'U3', name: 'Alice', appAccount: '@alice_finance', email: 'alice@cyberbot.sg' },
];

// ── 通知记录数据 ──────────────────────────────────────────────────
interface NotifRecord {
  id: string;
  notifTime: string;
  method: 'APP' | '邮件' | '站内';
  content: string;
  target: string;
  receipt: '已收到' | '异常' | '已读' | '未读';
  type: string;
}

const METHODS: Array<NotifRecord['method']> = ['APP', '邮件', '站内'];

const mockRecords: NotifRecord[] = Array.from({ length: 30 }, (_, i) => {
  const method = METHODS[i % 3];
  const isInApp = method === '站内';
  return {
    id: `NF${String(i + 1).padStart(7, '0')}`,
    notifTime: `2025-10-${String((i % 28) + 1).padStart(2, '0')} ${String(8 + (i % 12))}:${String(10 + (i % 50)).padStart(2, '0')}:23`,
    method,
    content: `${NOTIF_TYPES[i % NOTIF_TYPES.length]}通知，请相关人员及时处理。编号：${i + 1}`,
    target: method === '邮件' ? initUsers[i % 3].email : initUsers[i % 3].appAccount,
    receipt: isInApp
      ? (i % 5 === 0 ? '未读' : '已读')
      : (i % 7 === 0 ? '异常' : '已收到'),
    type: NOTIF_TYPES[i % NOTIF_TYPES.length],
  };
});

// ── 偏好数据（每用户一行）─────────────────────────────────────────
interface PrefRow {
  key: string;
  userId: string;
  userName: string;
  inApp: boolean;
  app: boolean;
  email: boolean;
}

const buildInitPrefs = (users: NotifUser[]): PrefRow[] =>
  users.map((u, i) => ({
    key: u.id,
    userId: u.id,
    userName: u.name,
    inApp: true,
    app: i !== 1,
    email: true,
  }));

// ── 方式 Tag 颜色 ────────────────────────────────────────────────
const methodColor = (v: string) => {
  if (v === 'APP') return 'blue';
  if (v === '站内') return 'green';
  return 'geekblue';
};

const receiptColor = (v: string) => {
  if (v === '已收到' || v === '已读') return 'success';
  if (v === '未读') return 'warning';
  return 'error';
};

// ── 主组件 ────────────────────────────────────────────────────────
const NotificationsPage: React.FC = () => {
  const recordsContainerRef = useRef<HTMLDivElement>(null);
  const configContainerRef = useRef<HTMLDivElement>(null);
  const handleRefresh = useCallback(() => { message.success('已刷新'); }, []);

  // 通知记录
  const [methodFilter, setMethodFilter] = useState<string | undefined>();
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [searchKw, setSearchKw] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<NotifRecord | null>(null);

  // 通知配置
  const [users, setUsers] = useState<NotifUser[]>(initUsers);
  const [prefRows, setPrefRows] = useState<PrefRow[]>(() => buildInitPrefs(initUsers));

  // 编辑通知对象弹窗
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editUsers, setEditUsers] = useState<NotifUser[]>([]);
  const [newUserName, setNewUserName] = useState('');
  const [newUserApp, setNewUserApp] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');

  // ── 通知记录 ────────────────────────────────────────────────────
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
    {
      title: '消息回执', dataIndex: 'receipt', width: 90,
      render: (v) => <Tag color={receiptColor(v)}>{v}</Tag>,
    },
    { title: '通知类型', dataIndex: 'type', width: 160 },
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

  // ── 偏好操作（Switch 即时保存）────────────────────────────────────
  const handlePrefToggle = (key: string, channel: 'app' | 'email', checked: boolean) => {
    setPrefRows((prev) => prev.map((r) => {
      if (r.key !== key) return r;
      return { ...r, [channel]: checked };
    }));
    message.success('已保存');
  };

  const prefColumns: ColumnsType<PrefRow> = [
    {
      title: 'APP 用户名', width: 160,
      render: (_, r) => {
        const u = users.find((x) => x.id === r.userId);
        return <Text style={{ fontSize: 13 }}>{u?.appAccount ?? '—'}</Text>;
      },
    },
    {
      title: '邮箱', width: 200,
      render: (_, r) => {
        const u = users.find((x) => x.id === r.userId);
        return <Text style={{ fontSize: 13 }}>{u?.email ?? '—'}</Text>;
      },
    },
    {
      title: 'APP 通知', dataIndex: 'app', width: 100, align: 'center',
      render: (v, r) => <Switch size="small" checked={v} onChange={(checked) => handlePrefToggle(r.key, 'app', checked)} />,
    },
    {
      title: '邮件通知', dataIndex: 'email', width: 100, align: 'center',
      render: (v, r) => <Switch size="small" checked={v} onChange={(checked) => handlePrefToggle(r.key, 'email', checked)} />,
    },
  ];

  // ── 编辑通知对象弹窗 ────────────────────────────────────────────
  const openUserModal = () => {
    setEditUsers(JSON.parse(JSON.stringify(users)));
    setNewUserName('');
    setNewUserApp('');
    setNewUserEmail('');
    setUserModalOpen(true);
  };

  const handleUserModalSave = () => {
    // 校验重复
    const appSet = new Set<string>();
    const emailSet = new Set<string>();
    for (const u of editUsers) {
      if (appSet.has(u.appAccount)) { message.warning(`APP 用户名 "${u.appAccount}" 重复`); return; }
      if (emailSet.has(u.email)) { message.warning(`邮箱 "${u.email}" 重复`); return; }
      appSet.add(u.appAccount);
      emailSet.add(u.email);
    }
    setUsers(editUsers);
    // 同步偏好：保留已有偏好，新用户默认全开，已删用户移除
    const prefMap = new Map(prefRows.map((r) => [r.userId, r]));
    const newRows = editUsers.map((u) => {
      const existing = prefMap.get(u.id);
      if (existing) return { ...existing, userName: u.name };
      return { key: u.id, userId: u.id, userName: u.name, inApp: true, app: true, email: true };
    });
    setPrefRows(newRows);
    setUserModalOpen(false);
    message.success('通知对象已更新');
  };

  const handleAddUser = () => {
    if (!newUserName.trim() || !newUserApp.trim() || !newUserEmail.trim()) {
      message.warning('请填写完整信息');
      return;
    }
    if (editUsers.some((u) => u.appAccount === newUserApp.trim())) {
      message.warning('APP 用户名已存在');
      return;
    }
    if (editUsers.some((u) => u.email === newUserEmail.trim())) {
      message.warning('邮箱已存在');
      return;
    }
    setEditUsers([...editUsers, { id: `U${Date.now()}`, name: newUserName.trim(), appAccount: newUserApp.trim(), email: newUserEmail.trim() }]);
    setNewUserName('');
    setNewUserApp('');
    setNewUserEmail('');
  };

  const handleEditUserField = (id: string, field: keyof NotifUser, value: string) => {
    setEditUsers((prev) => prev.map((u) => u.id === id ? { ...u, [field]: value } : u));
  };

  // ── Tab 内容 ────────────────────────────────────────────────────
  const tabItems = [
    {
      key: 'records',
      label: '通知记录',
      children: (
        <div ref={recordsContainerRef}>
        <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
          <ConfigProvider theme={{ components: { Radio: { colorPrimary: '#1677ff', buttonSolidCheckedBg: '#ffffff', buttonSolidCheckedColor: '#1677ff', buttonCheckedBg: '#ffffff' } } }}>
            <Space direction="vertical" size={12} style={{ display: 'flex', marginBottom: 16 }}>
              <Space size={24} wrap align="center">
                <Radio.Group value={methodFilter ?? '全部'} onChange={(e) => setMethodFilter(e.target.value === '全部' ? undefined : e.target.value)} buttonStyle="outline">
                  {['全部', 'APP', '邮件', '站内'].map((v) => (
                    <Radio.Button key={v} value={v} style={(methodFilter ?? '全部') === v ? { color: '#1677ff', borderColor: '#1677ff' } : {}}>{v}</Radio.Button>
                  ))}
                </Radio.Group>
                <Select
                  value={typeFilter ?? '全部'}
                  onChange={(v) => setTypeFilter(v === '全部' ? undefined : v)}
                  style={{ width: 200 }}
                  options={['全部', ...NOTIF_TYPES].map((v) => ({ label: v, value: v }))}
                />
                <Input
                  placeholder="通知对象"
                  value={searchKw}
                  onChange={(e) => setSearchKw(e.target.value)}
                  allowClear
                  style={{ width: 200 }}
                />
              </Space>
            </Space>
          </ConfigProvider>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <TableToolbar onRefresh={handleRefresh} containerRef={recordsContainerRef} />
          </div>
          <Table
            columns={recordColumns}
            dataSource={filtered}
            rowKey="id"
            size="middle"
            scroll={{ x: 1000 }}
            pagination={{ pageSize: 10, showTotal: (t) => `总共 ${t} 个项目` }}
            rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
          />
        </Card>
        </div>
      ),
    },
    {
      key: 'config',
      label: '通知配置',
      children: (
        <div ref={configContainerRef}>
        <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}
          styles={{ body: { padding: '16px 24px' } }}>
          {/* 通知对象配置 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 15, fontWeight: 600 }}>通知对象</Text>
            <Button icon={<EditOutlined />} onClick={openUserModal}>编辑</Button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <TableToolbar onRefresh={handleRefresh} containerRef={configContainerRef} />
          </div>
          <Table
            columns={prefColumns}
            dataSource={prefRows}
            rowKey="key"
            size="middle"
            pagination={false}
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
        tabBarStyle={{
          background: '#fff',
          margin: '0 -24px',
          padding: '0 24px',
        }}
      />

      {/* 详情弹窗 */}
      <Modal
        title={currentRecord?.method === 'APP' ? 'APP通知' : currentRecord?.method === '站内' ? '站内通知' : '邮件通知'}
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
            {currentRecord.method === '站内' ? (
              <Descriptions.Item label="阅读状态">
                <Tag color={currentRecord.receipt === '已读' ? 'success' : 'warning'}>{currentRecord.receipt}</Tag>
              </Descriptions.Item>
            ) : (
              <Descriptions.Item label="消息回执">
                <Tag color={receiptColor(currentRecord.receipt)}>{currentRecord.receipt}</Tag>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="通知内容">{currentRecord.content}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* 编辑弹窗 */}
      <Modal
        title="编辑通知配置"
        open={userModalOpen}
        onOk={handleUserModalSave}
        onCancel={() => setUserModalOpen(false)}
        width={640}
        okText="保 存"
      >
        <div style={{ marginTop: 16 }}>
          <Table
            dataSource={editUsers}
            rowKey="id"
            size="small"
            pagination={false}
            bordered
            columns={[
              {
                title: 'APP 用户名', dataIndex: 'appAccount', width: 160,
                render: (v, r) => (
                  <Input size="small" value={v} onChange={(e) => handleEditUserField(r.id, 'appAccount', e.target.value)} />
                ),
              },
              {
                title: '邮箱', dataIndex: 'email', width: 200,
                render: (v, r) => (
                  <Input size="small" value={v} onChange={(e) => handleEditUserField(r.id, 'email', e.target.value)} />
                ),
              },
              {
                title: '操作', width: 60, align: 'center',
                render: (_, r) => (
                  <Button type="text" size="small" danger icon={<DeleteOutlined />}
                    onClick={() => setEditUsers(editUsers.filter((u) => u.id !== r.id))} />
                ),
              },
            ]}
          />
          <Divider style={{ margin: '12px 0' }} />
          <Space>
            <Input placeholder="APP 用户名" value={newUserApp} onChange={(e) => setNewUserApp(e.target.value)} style={{ width: 140 }} />
            <Input placeholder="邮箱" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} style={{ width: 180 }} />
            <Button icon={<PlusOutlined />} onClick={handleAddUser}>添加</Button>
          </Space>
        </div>
      </Modal>
    </div>
  );
};

export default NotificationsPage;
