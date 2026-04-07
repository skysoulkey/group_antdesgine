import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Checkbox, ConfigProvider, Descriptions, Divider, Input, Modal, Radio, Space, Table, Tabs, Tag, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';

const { Text } = Typography;

const CARD_SHADOW = '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)';

// 通知类型
const NOTIF_TYPES = ['集团下拨', '集团调回', '持股企业追加投资', '下辖企业解散', '新增订阅企业', '下辖企业认证过期'];

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
  phone?: string;
  email?: string;
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
    target: initUsers[i % 3].appAccount,
    receipt: isInApp
      ? (i % 5 === 0 ? '未读' : '已读')
      : (i % 7 === 0 ? '异常' : '已收到'),
    type: NOTIF_TYPES[i % NOTIF_TYPES.length],
    phone: method === 'APP' ? `+63899${1029384 + i}` : undefined,
    email: method === '邮件' ? `user${i}@cyberbot.sg` : undefined,
  };
});

// ── 偏好数据 ──────────────────────────────────────────────────────
interface PrefRow {
  key: string;       // `${userId}_${type}`
  userId: string;
  userName: string;
  type: string;
  inApp: boolean;
  app: boolean;
  email: boolean;
}

const buildInitPrefs = (users: NotifUser[]): PrefRow[] =>
  users.flatMap((u, ui) =>
    NOTIF_TYPES.map((t, ti) => ({
      key: `${u.id}_${t}`,
      userId: u.id,
      userName: u.name,
      type: t,
      inApp: ui === 2 ? ti % 2 === 0 : true,
      app: ui === 1 ? ti % 2 === 0 : true,
      email: ui === 1 ? ti % 3 !== 0 : true,
    })),
  );

// ── 方式 Tag 颜色 ────────────────────────────────────────────────
const methodColor = (v: string) => {
  if (v === 'APP') return 'blue';
  if (v === '站内') return 'green';
  return 'purple';
};

const receiptColor = (v: string) => {
  if (v === '已收到' || v === '已读') return 'success';
  if (v === '未读') return 'warning';
  return 'error';
};

// ── 主组件 ────────────────────────────────────────────────────────
const NotificationsPage: React.FC = () => {
  // 通知记录
  const [methodFilter, setMethodFilter] = useState<string | undefined>();
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [searchKw, setSearchKw] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<NotifRecord | null>(null);

  // 通知配置 — 偏好矩阵
  const [users, setUsers] = useState<NotifUser[]>(initUsers);
  const [prefRows, setPrefRows] = useState<PrefRow[]>(() => buildInitPrefs(initUsers));
  const [prefEditing, setPrefEditing] = useState(false);
  const [prefSnapshot, setPrefSnapshot] = useState<PrefRow[] | null>(null);

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
    {
      title: '通知方式', dataIndex: 'method', width: 90,
      render: (v) => <Tag color={methodColor(v)}>{v}</Tag>,
    },
    { title: '通知对象', dataIndex: 'target', width: 120 },
    {
      title: '消息回执', dataIndex: 'receipt', width: 90,
      render: (v) => <Tag color={receiptColor(v)}>{v}</Tag>,
    },
    {
      title: '通知类型', dataIndex: 'type', width: 160,
      render: (v) => <Tag color="geekblue">{v}</Tag>,
    },
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

  // ── 偏好操作 ────────────────────────────────────────────────────
  const handlePrefToggle = (key: string, channel: 'inApp' | 'app' | 'email', checked: boolean) => {
    setPrefRows((prev) => prev.map((r) => {
      if (r.key !== key) return r;
      const updated = { ...r, [channel]: checked };
      if (!updated.inApp && !updated.app && !updated.email) {
        message.warning('至少保留一种通知渠道');
        return r;
      }
      return updated;
    }));
  };

  const handlePrefSave = () => {
    setPrefEditing(false);
    setPrefSnapshot(null);
    message.success('通知配置已保存');
  };

  const handlePrefCancel = () => {
    if (prefSnapshot) setPrefRows(prefSnapshot);
    setPrefEditing(false);
    setPrefSnapshot(null);
  };

  // rowSpan 计算
  const typeCount = NOTIF_TYPES.length;

  const prefColumns: ColumnsType<PrefRow> = [
    {
      title: '通知对象', dataIndex: 'userName', width: 120,
      onCell: (_, index) => {
        if (index === undefined) return {};
        if (index % typeCount === 0) return { rowSpan: typeCount };
        return { rowSpan: 0 };
      },
      render: (v, r) => {
        const u = users.find((x) => x.id === r.userId);
        return (
          <div>
            <div style={{ fontWeight: 600 }}>{v}</div>
            <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.45)' }}>{u?.appAccount}</div>
          </div>
        );
      },
    },
    { title: '通知类型', dataIndex: 'type', width: 180, render: (v) => <Tag color="geekblue">{v}</Tag> },
    {
      title: '站内', dataIndex: 'inApp', width: 80, align: 'center',
      render: (v, r) => <Checkbox checked={v} disabled={!prefEditing} onChange={(e) => handlePrefToggle(r.key, 'inApp', e.target.checked)} />,
    },
    {
      title: 'APP', dataIndex: 'app', width: 80, align: 'center',
      render: (v, r) => <Checkbox checked={v} disabled={!prefEditing} onChange={(e) => handlePrefToggle(r.key, 'app', e.target.checked)} />,
    },
    {
      title: '邮件', dataIndex: 'email', width: 80, align: 'center',
      render: (v, r) => <Checkbox checked={v} disabled={!prefEditing} onChange={(e) => handlePrefToggle(r.key, 'email', e.target.checked)} />,
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
    setUsers(editUsers);
    // 同步偏好数据：新用户补默认偏好，删除的用户移除偏好
    const existingIds = new Set(prefRows.map((r) => r.userId));
    const newRows = editUsers.flatMap((u) => {
      if (existingIds.has(u.id)) {
        // 保留已有偏好，更新 userName
        return prefRows.filter((r) => r.userId === u.id).map((r) => ({ ...r, userName: u.name }));
      }
      // 新用户：默认全开
      return NOTIF_TYPES.map((t) => ({
        key: `${u.id}_${t}`,
        userId: u.id,
        userName: u.name,
        type: t,
        inApp: true,
        app: true,
        email: true,
      }));
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
        <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
          <ConfigProvider theme={{ components: { Radio: { colorPrimary: '#722ed1', buttonSolidCheckedBg: '#ffffff', buttonSolidCheckedColor: '#722ed1', buttonCheckedBg: '#ffffff' } } }}>
            <Space direction="vertical" size={12} style={{ display: 'flex', marginBottom: 16 }}>
              <Space size={24} wrap align="center">
                <Radio.Group value={methodFilter ?? '全部'} onChange={(e) => setMethodFilter(e.target.value === '全部' ? undefined : e.target.value)} buttonStyle="outline">
                  {['全部', 'APP', '邮件', '站内'].map((v) => (
                    <Radio.Button key={v} value={v} style={(methodFilter ?? '全部') === v ? { color: '#722ed1', borderColor: '#722ed1' } : {}}>{v}</Radio.Button>
                  ))}
                </Radio.Group>
                <Input
                  placeholder="通知对象"
                  value={searchKw}
                  onChange={(e) => setSearchKw(e.target.value)}
                  allowClear
                  style={{ width: 200 }}
                />
              </Space>
              <Radio.Group value={typeFilter ?? '全部'} onChange={(e) => setTypeFilter(e.target.value === '全部' ? undefined : e.target.value)} buttonStyle="outline">
                {['全部', ...NOTIF_TYPES].map((v) => (
                  <Radio.Button key={v} value={v} style={(typeFilter ?? '全部') === v ? { color: '#722ed1', borderColor: '#722ed1' } : {}}>{v}</Radio.Button>
                ))}
              </Radio.Group>
            </Space>
          </ConfigProvider>
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
      ),
    },
    {
      key: 'config',
      label: '通知配置',
      children: (
        <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 15, fontWeight: 600 }}>通知配置</Text>
            <Space>
              <Button icon={<EditOutlined />} onClick={openUserModal}>编辑通知对象</Button>
              {!prefEditing ? (
                <Button type="primary" onClick={() => { setPrefEditing(true); setPrefSnapshot(JSON.parse(JSON.stringify(prefRows))); }}>
                  编辑偏好
                </Button>
              ) : (
                <>
                  <Button type="primary" onClick={handlePrefSave}>保 存</Button>
                  <Button onClick={handlePrefCancel}>取 消</Button>
                </>
              )}
            </Space>
          </div>
          <Table
            columns={prefColumns}
            dataSource={prefRows}
            rowKey="key"
            size="middle"
            pagination={false}
            bordered
          />
        </Card>
      ),
    },
  ];

  return (
    <div>
      <Tabs items={tabItems} type="card" />

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
            {currentRecord.method === 'APP' && (
              <Descriptions.Item label="电话号码">{currentRecord.phone ?? '—'}</Descriptions.Item>
            )}
            {currentRecord.method === '邮件' && (
              <Descriptions.Item label="邮件地址">{currentRecord.email ?? '—'}</Descriptions.Item>
            )}
            {currentRecord.method === '站内' ? (
              <Descriptions.Item label="阅读状态">
                <Tag color={currentRecord.receipt === '已读' ? 'success' : 'warning'}>{currentRecord.receipt}</Tag>
              </Descriptions.Item>
            ) : (
              <Descriptions.Item label="消息回执">
                <Tag color={receiptColor(currentRecord.receipt)}>{currentRecord.receipt}</Tag>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="通知类型">
              <Tag color="geekblue">{currentRecord.type}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="通知内容">{currentRecord.content}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* 编辑通知对象弹窗 */}
      <Modal
        title="编辑通知对象"
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
                title: '姓名', dataIndex: 'name', width: 120,
                render: (v, r) => (
                  <Input size="small" value={v} onChange={(e) => handleEditUserField(r.id, 'name', e.target.value)} />
                ),
              },
              {
                title: 'APP 账号', dataIndex: 'appAccount', width: 160,
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
            <Input placeholder="姓名" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} style={{ width: 100 }} />
            <Input placeholder="APP 账号" value={newUserApp} onChange={(e) => setNewUserApp(e.target.value)} style={{ width: 140 }} />
            <Input placeholder="邮箱" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} style={{ width: 180 }} />
            <Button icon={<PlusOutlined />} onClick={handleAddUser}>添加</Button>
          </Space>
        </div>
      </Modal>
    </div>
  );
};

export default NotificationsPage;
