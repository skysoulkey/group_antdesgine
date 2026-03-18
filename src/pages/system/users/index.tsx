import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Drawer,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';

const { Text } = Typography;

interface UserRecord {
  id: number;
  username: string;
  email: string;
  phone: string;
  role: string;
  organization: string;
  validPeriod: string;
  createdAt: string;
  lastLogin: string;
}

const mockData: UserRecord[] = [
  { id: 1, username: 'Miya1', email: 'miya@cyberbot.sg', phone: '+65 1234 5678', role: '公司管理员', organization: 'Hey Talk', validPeriod: '永久有效', createdAt: '2025-10-10 12:23:23', lastLogin: '2025-11-02 10:23:11' },
  { id: 2, username: 'Admin', email: 'admin@uutalk.com', phone: '+65 8765 4321', role: '集团管理员', organization: 'UU Talk', validPeriod: '永久有效', createdAt: '2025-09-01 08:00:00', lastLogin: '2025-11-02 12:33:02' },
  { id: 3, username: 'Jack', email: 'jack@cyberbot.sg', phone: '+86 138 0001 0001', role: '公司管理员', organization: 'UU Talk', validPeriod: '2026-12-31', createdAt: '2025-10-15 09:30:00', lastLogin: '2025-11-01 16:45:00' },
  { id: 4, username: 'Lisa', email: 'lisa@starcorp.com', phone: '+1 415 555 0101', role: '公司管理员', organization: '炸雷第一波', validPeriod: '永久有效', createdAt: '2025-08-20 14:00:00', lastLogin: '2025-10-30 09:12:00' },
  { id: 5, username: 'Tom', email: 'tom@goldlink.io', phone: '+44 20 7946 0958', role: '公司管理员', organization: 'Gold Link', validPeriod: '2025-12-31', createdAt: '2025-07-10 11:00:00', lastLogin: '2025-11-02 08:00:00' },
];

const roleColors: Record<string, string> = {
  '集团管理员': 'blue',
  '公司管理员': 'green',
  '平台管理员': 'red',
};

const UserManagePage: React.FC = () => {
  const [searchVal, setSearchVal] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form] = Form.useForm();

  const filtered = mockData.filter((d) => {
    const matchSearch =
      !searchVal ||
      d.username.includes(searchVal) ||
      d.email.includes(searchVal) ||
      d.phone.includes(searchVal);
    const matchRole = !roleFilter || d.role === roleFilter;
    return matchSearch && matchRole;
  });

  const columns: ColumnsType<UserRecord> = [
    { title: '用户名', dataIndex: 'username', render: (v) => <Text strong>{v}</Text> },
    { title: '邮箱', dataIndex: 'email' },
    { title: '手机号', dataIndex: 'phone' },
    {
      title: '角色',
      dataIndex: 'role',
      render: (v) => <Tag color={roleColors[v] || 'default'}>{v}</Tag>,
    },
    { title: '所属组织', dataIndex: 'organization' },
    {
      title: '账户有效期',
      dataIndex: 'validPeriod',
      render: (v) => (
        <Text type={v === '永久有效' ? 'success' : undefined}>{v}</Text>
      ),
    },
    { title: '最近登录', dataIndex: 'lastLogin', width: 170 },
    {
      title: '操作',
      width: 80,
      fixed: 'right',
      render: (_, r) => (
        <Button
          type="link"
          size="small"
          onClick={() => {
            setSelectedUser(r);
            setDrawerOpen(true);
          }}
        >
          查看
        </Button>
      ),
    },
  ];

  return (
    <Card bordered={false} style={{ borderRadius: 8 }}>
      {/* 说明 */}
      <div
        style={{
          background: '#f6f8ff',
          border: '1px solid #d6e4ff',
          borderRadius: 6,
          padding: '10px 16px',
          marginBottom: 16,
          fontSize: 12,
          color: '#595959',
          lineHeight: 1.8,
        }}
      >
        <div>• 集团管理员可查看本集团管理员账号及下属公司管理员账号</div>
        <div>• 同一公司管理员之间数据不做权限隔离，功能模块权限按照授予【角色】控制</div>
        <div>• 功能权限由【角色】进行控制</div>
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col flex="1">
          <Space>
            <Input
              prefix={<SearchOutlined />}
              placeholder="请输入用户名、邮箱、手机号"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              allowClear
              style={{ width: 280 }}
            />
            <Select
              placeholder="筛选角色"
              value={roleFilter || undefined}
              onChange={setRoleFilter}
              allowClear
              style={{ width: 140 }}
              options={[
                { label: '集团管理员', value: '集团管理员' },
                { label: '公司管理员', value: '公司管理员' },
                { label: '平台管理员', value: '平台管理员' },
              ]}
            />
          </Space>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateOpen(true)}
          >
            创建用户
          </Button>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        scroll={{ x: 900 }}
        pagination={{
          total: filtered.length,
          pageSize: 10,
          showTotal: (total) => `总共 ${total} 个项目`,
        }}
        size="middle"
      />

      {/* 用户详情抽屉 */}
      <Drawer
        title="用户详情"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={480}
      >
        {selectedUser && (
          <div style={{ lineHeight: 2.4 }}>
            {[
              ['用户名', selectedUser.username],
              ['角色', <Tag color={roleColors[selectedUser.role]}>{selectedUser.role}</Tag>],
              ['邮箱', selectedUser.email],
              ['手机号', selectedUser.phone],
              ['所属组织', selectedUser.organization],
              ['账户有效期', selectedUser.validPeriod],
              ['创建时间', selectedUser.createdAt],
              ['最近登录', selectedUser.lastLogin],
            ].map(([label, value]) => (
              <Row key={String(label)}>
                <Col span={8}>
                  <Text type="secondary">{label}</Text>
                </Col>
                <Col span={16}>
                  <Text>{value}</Text>
                </Col>
              </Row>
            ))}
            <div style={{ marginTop: 24 }}>
              <Space>
                <Button type="primary">修改密码</Button>
                <Button>编辑信息</Button>
              </Space>
            </div>
          </div>
        )}
      </Drawer>

      {/* 创建用户弹窗 */}
      <Modal
        title="创建用户"
        open={createOpen}
        onOk={() => form.validateFields().then(() => { setCreateOpen(false); form.resetFields(); })}
        onCancel={() => { setCreateOpen(false); form.resetFields(); }}
        width={520}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="用户名" name="username" rules={[{ required: true }]}>
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item label="邮箱" name="email" rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item label="手机号" name="phone">
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item label="角色" name="role" rules={[{ required: true }]}>
            <Select
              options={[
                { label: '集团管理员', value: '集团管理员' },
                { label: '公司管理员', value: '公司管理员' },
              ]}
              placeholder="请选择角色"
            />
          </Form.Item>
          <Form.Item label="所属组织" name="organization" rules={[{ required: true }]}>
            <Input placeholder="请输入所属组织" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default UserManagePage;
