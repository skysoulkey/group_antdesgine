import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Descriptions, Divider, Form, Input, Modal, Select, Space, Table, Tabs, Tag, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';

const { Text } = Typography;

const CARD_SHADOW = '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)';

// 通知类型
const NOTIF_TYPES = ['集团下拨', '集团调回', '持股企业追加投资', '下辖企业解散', '新增订阅企业', '下辖企业认证过期'];

// ── 通知记录数据 ──────────────────────────────────────────────────
interface NotifRecord {
  id: string;
  notifTime: string;
  method: 'APP' | '邮件';
  content: string;
  target: string;
  receipt: '已收到' | '异常';
  type: string;
  phone?: string;
  email?: string;
}

const mockRecords: NotifRecord[] = Array.from({ length: 20 }, (_, i) => ({
  id: `NF${String(i + 1).padStart(7, '0')}`,
  notifTime: `2025-10-${String(i + 1).padStart(2, '0')} 12:23:23`,
  method: i % 2 === 0 ? 'APP' : '邮件',
  content: `${NOTIF_TYPES[i % NOTIF_TYPES.length]}通知，请相关人员及时处理。编号：${i + 1}`,
  target: ['@miya_miya', '@tom_admin', '@alice_finance'][i % 3],
  receipt: i % 7 === 0 ? '异常' : '已收到',
  type: NOTIF_TYPES[i % NOTIF_TYPES.length],
  phone: i % 2 === 0 ? `+63899${1029384 + i}` : undefined,
  email: i % 2 !== 0 ? `user${i}@cyberbot.sg` : undefined,
}));

// ── 通知配置数据 ──────────────────────────────────────────────────
interface ConfigItem { id: string; value: string }

const NotificationsPage: React.FC = () => {
  const [methodFilter, setMethodFilter] = useState<string | undefined>();
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [searchKw, setSearchKw] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<NotifRecord | null>(null);

  // 通知配置状态
  const [appAccounts, setAppAccounts] = useState<ConfigItem[]>([
    { id: '1', value: '@miya_miya' },
    { id: '2', value: '@tom_admin' },
  ]);
  const [emailList, setEmailList] = useState<ConfigItem[]>([
    { id: '1', value: 'miya@cyberbot.sg' },
  ]);
  const [newApp, setNewApp] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [configEditing, setConfigEditing] = useState(false);

  const filtered = mockRecords.filter((r) => {
    const kw = searchKw.toLowerCase();
    return (
      (!kw || r.target.toLowerCase().includes(kw) || r.content.toLowerCase().includes(kw)) &&
      (!methodFilter || r.method === methodFilter) &&
      (!typeFilter || r.type === typeFilter)
    );
  });

  const columns: ColumnsType<NotifRecord> = [
    { title: '通知时间', dataIndex: 'notifTime', width: 170 },
    {
      title: '通知方式', dataIndex: 'method', width: 90,
      render: (v) => <Tag color={v === 'APP' ? 'blue' : 'purple'}>{v}</Tag>,
    },
    { title: '通知内容', dataIndex: 'content', ellipsis: true },
    { title: '通知对象', dataIndex: 'target', width: 120 },
    {
      title: '消息回执', dataIndex: 'receipt', width: 90,
      render: (v) => <Tag color={v === '已收到' ? 'success' : 'error'}>{v}</Tag>,
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

  const handleSaveConfig = () => {
    setConfigEditing(false);
    message.success('通知配置已保存');
  };

  const tabItems = [
    {
      key: 'records',
      label: '通知记录',
      children: (
        <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
          <Space style={{ marginBottom: 16 }} wrap>
            <Input
              placeholder="通知对象、通知内容"
              value={searchKw}
              onChange={(e) => setSearchKw(e.target.value)}
              allowClear
              style={{ width: 220 }}
            />
            <Select
              placeholder="通知方式"
              value={methodFilter}
              onChange={setMethodFilter}
              allowClear
              style={{ width: 120 }}
              options={[{ value: 'APP', label: 'APP' }, { value: '邮件', label: '邮件' }]}
            />
            <Select
              placeholder="通知类型"
              value={typeFilter}
              onChange={setTypeFilter}
              allowClear
              style={{ width: 180 }}
              options={NOTIF_TYPES.map((t) => ({ value: t, label: t }))}
            />
          </Space>
          <Table
            columns={columns}
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
        <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW, maxWidth: 600 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ fontSize: 15, fontWeight: 600 }}>通知对象</Text>
            {!configEditing && (
              <Button onClick={() => setConfigEditing(true)}>编辑</Button>
            )}
          </div>

          {/* APP 接收 */}
          <div style={{ marginBottom: 20 }}>
            <Text strong style={{ fontSize: 13 }}>
              <span style={{ color: '#ff4d4f', marginRight: 4 }}>*</span>APP接收
            </Text>
            <div style={{ marginTop: 10 }}>
              {appAccounts.map((item) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Tag style={{ margin: 0, padding: '4px 10px', fontSize: 13 }}>{item.value}</Tag>
                  {configEditing && (
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => setAppAccounts(appAccounts.filter((a) => a.id !== item.id))}
                    />
                  )}
                </div>
              ))}
              {configEditing && (
                <Space>
                  <Input
                    placeholder="请输入APP用户名"
                    value={newApp}
                    onChange={(e) => setNewApp(e.target.value)}
                    style={{ width: 200 }}
                  />
                  <Button
                    icon={<PlusOutlined />}
                    onClick={() => {
                      if (!newApp.trim()) return;
                      setAppAccounts([...appAccounts, { id: Date.now().toString(), value: newApp.trim() }]);
                      setNewApp('');
                    }}
                  >
                    + 添加
                  </Button>
                </Space>
              )}
            </div>
          </div>

          <Divider style={{ margin: '16px 0' }} />

          {/* 邮件地址 */}
          <div style={{ marginBottom: 20 }}>
            <Text strong style={{ fontSize: 13 }}>
              <span style={{ color: '#ff4d4f', marginRight: 4 }}>*</span>邮件地址
            </Text>
            <div style={{ marginTop: 10 }}>
              {emailList.map((item) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Tag style={{ margin: 0, padding: '4px 10px', fontSize: 13 }}>{item.value}</Tag>
                  {configEditing && (
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => setEmailList(emailList.filter((e) => e.id !== item.id))}
                    />
                  )}
                </div>
              ))}
              {configEditing && (
                <Space>
                  <Input
                    placeholder="请输入邮箱地址"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    style={{ width: 220 }}
                  />
                  <Button
                    icon={<PlusOutlined />}
                    onClick={() => {
                      if (!newEmail.trim()) return;
                      setEmailList([...emailList, { id: Date.now().toString(), value: newEmail.trim() }]);
                      setNewEmail('');
                    }}
                  >
                    + 添加
                  </Button>
                </Space>
              )}
            </div>
          </div>

          {configEditing && (
            <Space style={{ marginTop: 8 }}>
              <Button type="primary" onClick={handleSaveConfig}>保 存</Button>
              <Button onClick={() => setConfigEditing(false)}>取 消</Button>
            </Space>
          )}
        </Card>
      ),
    },
  ];

  return (
    <div>
      <Tabs items={tabItems} type="card" />

      {/* 详情弹窗 */}
      <Modal
        title={currentRecord?.method === 'APP' ? 'APP通知' : '邮件通知'}
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={480}
      >
        {currentRecord && (
          <Descriptions column={1} bordered size="small" style={{ marginTop: 16 }}>
            <Descriptions.Item label="发送时间">{currentRecord.notifTime}</Descriptions.Item>
            {currentRecord.method === 'APP' ? (
              <Descriptions.Item label="电话号码">{currentRecord.phone ?? '—'}</Descriptions.Item>
            ) : (
              <Descriptions.Item label="邮件地址">{currentRecord.email ?? '—'}</Descriptions.Item>
            )}
            <Descriptions.Item label="消息回执">
              <Tag color={currentRecord.receipt === '已收到' ? 'success' : 'error'}>{currentRecord.receipt}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="通知类型">
              <Tag color="geekblue">{currentRecord.type}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="通知内容">{currentRecord.content}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default NotificationsPage;
