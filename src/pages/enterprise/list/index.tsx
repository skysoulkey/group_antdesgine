import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';
import { useNavigate } from 'umi';

const { Text } = Typography;

interface Enterprise {
  id: number;
  enterpriseId: string;
  name: string;
  status: 'active' | 'expired' | 'dissolved';
  certExpiry: string;
  ownerId: string;
  ownerName: string;
  totalAssets: string;
  company: string;
}

const mockData: Enterprise[] = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  enterpriseId: String(283982 + i),
  name: ['hey', 'UUtalk', 'CyberBot', 'StarTech', 'GoldLink'][i % 5],
  status: (['active', 'expired', 'dissolved', 'active', 'active'] as const)[i % 5],
  certExpiry: i % 3 === 0 ? '2024-10-23' : i % 3 === 1 ? '2026-10-23' : '2025-06-30',
  ownerId: String(73720 + i),
  ownerName: `name${i + 1}`,
  totalAssets: (873233.23 - i * 3200).toFixed(2),
  company: ['UU Talk', 'Hey Talk', '炸雷第一波'][i % 3],
}));

const statusMap = {
  active: { label: '已订阅', color: 'success' },
  expired: { label: '已过期', color: 'error' },
  dissolved: { label: '已解散', color: 'warning' },
} as const;

const EnterpriseListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [form] = Form.useForm();

  const filtered = mockData.filter((d) => {
    const matchSearch =
      !searchVal ||
      d.ownerName.includes(searchVal) ||
      d.ownerId.includes(searchVal) ||
      d.name.includes(searchVal);
    const matchStatus = filterStatus === 'all' || d.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statusCounts = {
    all: mockData.length,
    active: mockData.filter((d) => d.status === 'active').length,
    expired: mockData.filter((d) => d.status === 'expired').length,
    dissolved: mockData.filter((d) => d.status === 'dissolved').length,
  };

  const columns: ColumnsType<Enterprise> = [
    { title: '企业ID', dataIndex: 'enterpriseId', width: 100 },
    {
      title: '企业名称',
      dataIndex: 'name',
      render: (v) => <Text>{v}</Text>,
    },
    {
      title: '企业认证',
      dataIndex: 'status',
      width: 100,
      render: (v: Enterprise['status']) => (
        <Tag color={statusMap[v].color}>{statusMap[v].label}</Tag>
      ),
    },
    {
      title: '认证时效',
      dataIndex: 'certExpiry',
      width: 130,
      render: (v, r) => (
        <Text type={r.status === 'expired' ? 'danger' : undefined}>{v}</Text>
      ),
    },
    { title: '企业主ID', dataIndex: 'ownerId', width: 100 },
    { title: '企业主昵称', dataIndex: 'ownerName', width: 110 },
    {
      title: '企业总资产',
      dataIndex: 'totalAssets',
      align: 'right',
      render: (v) => (
        <Text style={{ color: '#722ed1' }}>
          {Number(v).toLocaleString('en', { minimumFractionDigits: 2 })} USDT
        </Text>
      ),
    },
    { title: '归属公司', dataIndex: 'company', width: 120 },
    {
      title: '操作',
      width: 100,
      fixed: 'right',
      render: (_, r) => (
        <Button
          type="link"
          size="small"
          onClick={() => navigate(`/enterprise/detail/${r.enterpriseId}`)}
        >
          详情
        </Button>
      ),
    },
  ];

  return (
    <Card bordered={false} style={{ borderRadius: 8 }}>
      {/* 搜索栏 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col flex="1">
          <Input
            prefix={<SearchOutlined />}
            placeholder="请输入企业主昵称、企业主ID"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            allowClear
            style={{ maxWidth: 360 }}
          />
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateOpen(true)}
          >
            创建企业
          </Button>
        </Col>
      </Row>

      {/* 状态筛选 Tab */}
      <Space style={{ marginBottom: 16 }}>
        {[
          { key: 'all', label: `全部(${statusCounts.all})` },
          { key: 'active', label: `已订阅(${statusCounts.active})` },
          { key: 'expired', label: `已过期(${statusCounts.expired})` },
          { key: 'dissolved', label: `已解散(${statusCounts.dissolved})` },
        ].map((item) => (
          <Tag
            key={item.key}
            color={filterStatus === item.key ? 'blue' : 'default'}
            style={{ cursor: 'pointer', padding: '4px 12px' }}
            onClick={() => setFilterStatus(item.key)}
          >
            {item.label}
          </Tag>
        ))}
      </Space>

      {/* 时间戳 */}
      <div style={{ marginBottom: 8 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          数据更新于 2025-11-02 12:33:02
        </Text>
      </div>

      <Table
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        scroll={{ x: 1000 }}
        pagination={{
          total: filtered.length,
          pageSize: 10,
          showTotal: (total) => `总共 ${total} 个项目`,
          showSizeChanger: true,
        }}
        size="middle"
      />

      {/* 创建企业弹窗 */}
      <Modal
        title="创建企业"
        open={createOpen}
        onOk={() => {
          form.validateFields().then(() => {
            setCreateOpen(false);
            form.resetFields();
          });
        }}
        onCancel={() => {
          setCreateOpen(false);
          form.resetFields();
        }}
        width={520}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="企业名称" name="name" rules={[{ required: true }]}>
            <Input placeholder="请输入企业名称" />
          </Form.Item>
          <Form.Item label="企业主ID" name="ownerId" rules={[{ required: true }]}>
            <Input placeholder="请输入企业主ID" />
          </Form.Item>
          <Form.Item label="归属公司" name="company" rules={[{ required: true }]}>
            <Input placeholder="请输入归属公司" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default EnterpriseListPage;
