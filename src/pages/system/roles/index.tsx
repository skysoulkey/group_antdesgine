import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Drawer,
  Form,
  Input,
  Popconfirm,
  Row,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';
import { useNavigate } from 'umi';

const { Text, Title } = Typography;

interface Role {
  id: number;
  roleId: string;
  name: string;
  createdAt: string;
  accountCount: number;
  permissions: string[];
}

const mockRoles: Role[] = [
  {
    id: 1,
    roleId: '1',
    name: '平台管理员',
    createdAt: '2025-10-10 12:23:23',
    accountCount: 10,
    permissions: ['用户管理', '角色管理', '系统日志', '设置中心', '所有模块'],
  },
  {
    id: 2,
    roleId: '12',
    name: '集团管理员',
    createdAt: '2025-10-10 12:23:23',
    accountCount: 12,
    permissions: ['仪表盘', '企业管理', '公司管理', '佣金订单', '集团金融', '用户管理', '基础信息'],
  },
  {
    id: 3,
    roleId: '728379',
    name: '公司管理员',
    createdAt: '2025-10-10 12:23:23',
    accountCount: 32,
    permissions: ['仪表盘', '企业管理', '佣金订单', '基础信息'],
  },
  {
    id: 4,
    roleId: '728380',
    name: '财务专员',
    createdAt: '2025-10-12 09:00:00',
    accountCount: 16,
    permissions: ['集团金融', '佣金订单'],
  },
];

const RoleManagePage: React.FC = () => {
  const navigate = useNavigate();
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [form] = Form.useForm();

  const columns: ColumnsType<Role> = [
    { title: '角色ID', dataIndex: 'roleId', width: 90 },
    {
      title: '角色名称',
      dataIndex: 'name',
      render: (v) => <Text strong>{v}</Text>,
    },
    { title: '创建时间', dataIndex: 'createdAt', width: 170 },
    {
      title: '关联账号数',
      dataIndex: 'accountCount',
      align: 'right',
      width: 110,
      render: (v) => (
        <Button
          type="link"
          size="small"
          onClick={() => navigate('/system/users')}
        >
          {v}
        </Button>
      ),
    },
    {
      title: '权限概览',
      dataIndex: 'permissions',
      render: (v: string[]) => (
        <Space wrap size={4}>
          {v.slice(0, 4).map((p) => (
            <Tag key={p} style={{ margin: 0 }}>
              {p}
            </Tag>
          ))}
          {v.length > 4 && <Tag>+{v.length - 4}</Tag>}
        </Space>
      ),
    },
    {
      title: '操作',
      width: 140,
      fixed: 'right',
      render: (_, r) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedRole(r);
              form.setFieldsValue(r);
              setEditOpen(true);
            }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除此角色？"
            description="删除后将影响关联账号的权限"
            okText="确认"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card bordered={false} style={{ borderRadius: 8 }}>
      <div
        style={{
          background: '#fff7e6',
          border: '1px solid #ffe7ba',
          borderRadius: 6,
          padding: '10px 16px',
          marginBottom: 16,
          fontSize: 12,
          color: '#595959',
          lineHeight: 1.8,
        }}
      >
        <div>• 编辑操作相关角色后，会对使用的账号权限立即生效</div>
        <div>• 若当前使用该角色的账号正在登录，则重新登录后生效</div>
        <div>• 点击关联账号数，跳转账号管理并筛选当前角色</div>
      </div>

      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setSelectedRole(null);
            form.resetFields();
            setEditOpen(true);
          }}
        >
          创建角色
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={mockRoles}
        rowKey="id"
        pagination={{
          total: mockRoles.length,
          pageSize: 10,
          showTotal: (total) => `总共 ${total} 个项目`,
        }}
        size="middle"
      />

      {/* 编辑/创建角色 Drawer */}
      <Drawer
        title={selectedRole ? `编辑角色 - ${selectedRole.name}` : '创建角色'}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        width={560}
        footer={
          <Space style={{ float: 'right' }}>
            <Button onClick={() => setEditOpen(false)}>取消</Button>
            <Button
              type="primary"
              onClick={() =>
                form.validateFields().then(() => setEditOpen(false))
              }
            >
              保存
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item label="角色名称" name="name" rules={[{ required: true }]}>
            <Input placeholder="请输入角色名称" />
          </Form.Item>

          <Form.Item label="IP 白名单" name="ipWhitelist">
            <Input.TextArea
              rows={3}
              placeholder="请输入IP白名单，例如：192.168.1.1,192.168.1.1-192.168.1.255,192.168.1.0/24"
            />
          </Form.Item>

          <Form.Item label="MFA 认证">
            <Tag color="orange">可选</Tag>
            <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
              角色MFA认证为【可选】时，账号可在个人设置中自行控制
            </Text>
          </Form.Item>

          <Form.Item>
            <Title level={5}>功能权限配置</Title>
            <div
              style={{
                border: '1px solid #d9d9d9',
                borderRadius: 6,
                padding: 16,
              }}
            >
              {[
                { label: '仪表盘', key: 'dashboard' },
                { label: '企业管理', key: 'enterprise' },
                { label: '公司管理', key: 'company' },
                { label: '佣金订单', key: 'commission' },
                { label: '集团金融', key: 'finance' },
                { label: '用户管理', key: 'users' },
                { label: '角色管理', key: 'roles' },
                { label: '系统日志', key: 'logs' },
                { label: '基础信息', key: 'profile' },
                { label: '设置中心', key: 'settings' },
              ].map((item) => (
                <Tag
                  key={item.key}
                  color={
                    selectedRole?.permissions.includes(item.label) ? 'blue' : 'default'
                  }
                  style={{ cursor: 'pointer', margin: 4 }}
                >
                  {item.label}
                </Tag>
              ))}
            </div>
          </Form.Item>
        </Form>
      </Drawer>
    </Card>
  );
};

export default RoleManagePage;
