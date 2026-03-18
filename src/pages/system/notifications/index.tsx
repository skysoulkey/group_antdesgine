import { useState } from 'react';
import { Card, Row, Col, Input, Select, Table, Tag, DatePicker, Typography, Button, Modal, Form, message, Drawer, Descriptions, Space } from 'antd';
import { SearchOutlined, BellOutlined, PlusOutlined, CheckOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface NotificationRecord {
  id: number;
  notifId: string;
  type: 'system' | 'finance' | 'security' | 'operation';
  title: string;
  content: string;
  isRead: boolean;
  readAt: string;
  sender: string;
  targetRole: string;
  createdAt: string;
}

const typeMap = {
  system:    { label: '系统通知', color: 'blue' },
  finance:   { label: '财务通知', color: 'green' },
  security:  { label: '安全通知', color: 'red' },
  operation: { label: '操作通知', color: 'orange' },
} as const;

const TITLES: Record<string, string[]> = {
  system:    ['系统版本更新通知', '系统维护公告', '平台升级提醒'],
  finance:   ['集团下拨成功通知', '集团调回完成通知', '账单结算通知'],
  security:  ['异常登录提醒', 'IP白名单变更通知', '密码即将过期提醒'],
  operation: ['用户权限变更通知', '角色配置更新通知', '企业认证状态变更'],
};

const mockData: NotificationRecord[] = Array.from({ length: 20 }, (_, i) => {
  const type = (['system', 'finance', 'security', 'operation'] as const)[i % 4];
  const titles = TITLES[type];
  return {
    id: i + 1,
    notifId: `NOTIF2025${String(1120001 + i).padStart(7, '0')}`,
    type,
    title: titles[i % titles.length],
    content: `这是一条${typeMap[type].label}，详情请查看通知详情页面。通知编号：${i + 1}，请相关人员及时处理。`,
    isRead: i % 3 !== 0,
    readAt: i % 3 !== 0 ? `2025-11-${String(1 + (i % 28)).padStart(2, '0')} 12:00:00` : '',
    sender: ['系统', 'Admin', 'SuperAdmin'][i % 3],
    targetRole: ['集团管理员', '公司管理员', '平台管理员'][i % 3],
    createdAt: `2025-11-${String(1 + (i % 28)).padStart(2, '0')} 10:${String(i % 60).padStart(2, '0')}:00`,
  };
});

type ReadFilter = 'all' | 'unread' | 'read';

export default function SystemNotifications() {
  const [data, setData] = useState(mockData);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [readFilter, setReadFilter] = useState<ReadFilter>('all');
  const [sendOpen, setSendOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [current, setCurrent] = useState<NotificationRecord | null>(null);
  const [form] = Form.useForm();

  const filtered = data.filter(r => {
    const kw = search.toLowerCase();
    return (
      (!kw || r.title.toLowerCase().includes(kw) || r.notifId.toLowerCase().includes(kw)) &&
      (!typeFilter || r.type === typeFilter) &&
      (readFilter === 'all' || (readFilter === 'unread' ? !r.isRead : r.isRead))
    );
  });

  const markRead = (record: NotificationRecord) => {
    setData(prev => prev.map(r => r.id === record.id
      ? { ...r, isRead: true, readAt: new Date().toISOString().slice(0, 19).replace('T', ' ') }
      : r));
    message.success('已标记为已读');
  };

  const markAllRead = () => {
    setData(prev => prev.map(r => ({ ...r, isRead: true, readAt: r.readAt || new Date().toISOString().slice(0, 19).replace('T', ' ') })));
    message.success('全部已标记为已读');
  };

  const handleSend = () => {
    form.validateFields().then(() => {
      setSendOpen(false);
      form.resetFields();
      message.success('通知已发送');
    });
  };

  const filterTabs: { key: ReadFilter; label: string }[] = [
    { key: 'all', label: `全部 (${data.length})` },
    { key: 'unread', label: `未读 (${data.filter(r => !r.isRead).length})` },
    { key: 'read', label: `已读 (${data.filter(r => r.isRead).length})` },
  ];

  const columns: ColumnsType<NotificationRecord> = [
    {
      title: '通知类型', dataIndex: 'type', width: 110,
      render: v => <Tag color={typeMap[v as keyof typeof typeMap].color}>{typeMap[v as keyof typeof typeMap].label}</Tag>,
    },
    {
      title: '标题', dataIndex: 'title',
      render: (v, r) => <Text strong={!r.isRead}>{v}</Text>,
    },
    { title: '内容预览', dataIndex: 'content', width: 200, ellipsis: true },
    {
      title: '阅读状态', dataIndex: 'isRead', width: 90,
      render: v => <Tag color={v ? 'default' : 'blue'}>{v ? '已读' : '未读'}</Tag>,
    },
    { title: '发送方', dataIndex: 'sender', width: 100 },
    {
      title: '目标角色', dataIndex: 'targetRole', width: 120,
      render: v => <Tag color="geekblue">{v}</Tag>,
    },
    { title: '发送时间', dataIndex: 'createdAt', width: 170 },
    {
      title: '操作', key: 'action', width: 130, fixed: 'right',
      render: (_, r) => (
        <Space>
          {!r.isRead && (
            <Button type="link" size="small" icon={<CheckOutlined />} onClick={() => markRead(r)}>
              标记已读
            </Button>
          )}
          <Button type="link" size="small" onClick={() => { setCurrent(r); setDetailOpen(true); }}>
            详情
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card bordered={false}>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BellOutlined style={{ color: '#1677ff', fontSize: 18 }} />
          <Text style={{ fontSize: 16, fontWeight: 600 }}>通知管理</Text>
        </div>
        <Space>
          <Button icon={<CheckOutlined />} onClick={markAllRead}>全部标记已读</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setSendOpen(true)}>发送通知</Button>
        </Space>
      </div>

      <Space style={{ marginBottom: 16 }}>
        {filterTabs.map(tab => (
          <Tag key={tab.key}
            color={readFilter === tab.key ? 'blue' : 'default'}
            style={{ cursor: 'pointer', padding: '4px 12px', fontSize: 13 }}
            onClick={() => setReadFilter(tab.key)}>
            {tab.label}
          </Tag>
        ))}
      </Space>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col>
          <Input prefix={<SearchOutlined />} placeholder="搜索标题 / 通知编号"
            value={search} onChange={e => setSearch(e.target.value)} allowClear style={{ width: 280 }} />
        </Col>
        <Col>
          <Select placeholder="通知类型" value={typeFilter} onChange={setTypeFilter} allowClear style={{ width: 130 }}
            options={Object.entries(typeMap).map(([k, v]) => ({ label: v.label, value: k }))} />
        </Col>
        <Col><RangePicker style={{ width: 280 }} /></Col>
      </Row>

      <Table dataSource={filtered} columns={columns} rowKey="id" size="middle" scroll={{ x: 1100 }}
        pagination={{ total: filtered.length, pageSize: 10, showTotal: t => `总共 ${t} 条记录`, showSizeChanger: true }}
        rowClassName={r => !r.isRead ? 'unread-row' : ''}
      />

      <Modal title="发送通知" open={sendOpen} onOk={handleSend}
        onCancel={() => { setSendOpen(false); form.resetFields(); }} width={520}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="通知类型" name="type" rules={[{ required: true, message: '请选择通知类型' }]}>
            <Select placeholder="请选择通知类型" options={Object.entries(typeMap).map(([k, v]) => ({ label: v.label, value: k }))} />
          </Form.Item>
          <Form.Item label="通知标题" name="title" rules={[{ required: true, message: '请输入通知标题' }]}>
            <Input placeholder="请输入通知标题" />
          </Form.Item>
          <Form.Item label="通知内容" name="content" rules={[{ required: true, message: '请输入通知内容' }]}>
            <Input.TextArea rows={4} placeholder="请输入通知内容" />
          </Form.Item>
          <Form.Item label="目标角色" name="targetRoles" rules={[{ required: true, message: '请选择目标角色' }]}>
            <Select mode="multiple" placeholder="请选择目标角色"
              options={['集团管理员', '公司管理员', '平台管理员'].map(r => ({ label: r, value: r }))} />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer title="通知详情" open={detailOpen} onClose={() => setDetailOpen(false)} width={480}>
        {current && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="通知编号">{current.notifId}</Descriptions.Item>
            <Descriptions.Item label="通知类型">
              <Tag color={typeMap[current.type].color}>{typeMap[current.type].label}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="标题">{current.title}</Descriptions.Item>
            <Descriptions.Item label="内容">{current.content}</Descriptions.Item>
            <Descriptions.Item label="阅读状态">
              <Tag color={current.isRead ? 'default' : 'blue'}>{current.isRead ? '已读' : '未读'}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="读取时间">{current.readAt || '—'}</Descriptions.Item>
            <Descriptions.Item label="发送方">{current.sender}</Descriptions.Item>
            <Descriptions.Item label="目标角色">
              <Tag color="geekblue">{current.targetRole}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="发送时间">{current.createdAt}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </Card>
  );
}
