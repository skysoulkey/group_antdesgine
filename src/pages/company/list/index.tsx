import { PlusOutlined, SearchOutlined, SwapOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Space,
  Table,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';
import { useNavigate } from 'umi';

const { Text } = Typography;

interface Company {
  id: number;
  companyId: string;
  name: string;
  totalAssets: string;
  createdAt: string;
  certEnterprises: number;
  groupAllocated: string;
  groupRecalled: string;
  memberCount: number;
}

const mockData: Company[] = Array.from({ length: 11 }, (_, i) => ({
  id: i + 1,
  companyId: String(283982 + i),
  name: ['UU Talk', 'Hey Talk', '炸雷第一波', 'Cyber Bot', 'Star Tech', 'Gold Link', 'Blue Sky', 'Red Star', 'Green Tech', 'Purple Wave', 'Orange Net'][i],
  totalAssets: (873233.23 - i * 28000).toFixed(2),
  createdAt: '2025-10-10 12:23:23',
  certEnterprises: [543, 23, 11, 0, 32, 128, 67, 45, 89, 12, 203][i],
  groupAllocated: (873233.23 - i * 20000).toFixed(2),
  groupRecalled: (200000 + i * 5000).toFixed(2),
  memberCount: [543, 23, 11, 300, 32, 128, 67, 45, 89, 12, 203][i],
}));

const CompanyListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [form] = Form.useForm();
  const [transferForm] = Form.useForm();

  const filtered = mockData.filter(
    (d) => !searchVal || d.name.includes(searchVal) || d.companyId.includes(searchVal),
  );

  const columns: ColumnsType<Company> = [
    { title: '创建时间', dataIndex: 'createdAt', width: 170 },
    { title: '公司ID', dataIndex: 'companyId', width: 100 },
    {
      title: '公司名称',
      dataIndex: 'name',
      render: (v) => <Text>{v}</Text>,
    },
    {
      title: '公司总资产（USDT）',
      dataIndex: 'totalAssets',
      align: 'right',
      render: (v) => (
        <Text style={{ color: '#722ed1' }}>
          {Number(v).toLocaleString('en', { minimumFractionDigits: 2 })}
        </Text>
      ),
    },
    {
      title: (
        <Tooltip title="已认证企业数量">认证企业</Tooltip>
      ),
      dataIndex: 'certEnterprises',
      align: 'right',
      width: 100,
    },
    {
      title: (
        <Tooltip title="集团向该公司下拨的资金总额">集团资金下拨（USDT）</Tooltip>
      ),
      dataIndex: 'groupAllocated',
      align: 'right',
      render: (v) => Number(v).toLocaleString('en', { minimumFractionDigits: 2 }),
    },
    {
      title: (
        <Tooltip title="集团从该公司调回的资金总额">集团资金调回（USDT）</Tooltip>
      ),
      dataIndex: 'groupRecalled',
      align: 'right',
      render: (v) => Number(v).toLocaleString('en', { minimumFractionDigits: 2 }),
    },
    { title: '成员总数', dataIndex: 'memberCount', align: 'right', width: 90 },
    {
      title: '操作',
      width: 140,
      fixed: 'right',
      render: (_, r) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => navigate(`/company/detail/${r.companyId}`)}
          >
            详情
          </Button>
          <Button
            type="link"
            size="small"
            icon={<SwapOutlined />}
            onClick={() => {
              setSelectedCompany(r);
              setTransferOpen(true);
            }}
          >
            划转
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card bordered={false} style={{ borderRadius: 8 }}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col flex="1">
          <Input
            prefix={<SearchOutlined />}
            placeholder="请输入公司名称或公司ID"
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
            创建公司
          </Button>
        </Col>
      </Row>

      <div style={{ marginBottom: 8 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          数据更新于 2025-11-02 12:33:02 &nbsp;|&nbsp; 总共 {filtered.length} 个项目
        </Text>
      </div>

      <Table
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        scroll={{ x: 1200 }}
        pagination={{
          total: filtered.length,
          pageSize: 10,
          showTotal: (total) => `总共 ${total} 个项目`,
          showSizeChanger: true,
        }}
        size="middle"
      />

      {/* 创建公司 */}
      <Modal
        title="创建公司"
        open={createOpen}
        onOk={() => form.validateFields().then(() => { setCreateOpen(false); form.resetFields(); })}
        onCancel={() => { setCreateOpen(false); form.resetFields(); }}
        width={480}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="公司名称" name="name" rules={[{ required: true }]}>
            <Input placeholder="请输入公司名称" />
          </Form.Item>
          <Form.Item label="归属集团" name="group" rules={[{ required: true }]}>
            <Input placeholder="请输入归属集团" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 划转弹窗 */}
      <Modal
        title={`资金划转 - ${selectedCompany?.name || ''}`}
        open={transferOpen}
        onOk={() => transferForm.validateFields().then(() => { setTransferOpen(false); transferForm.resetFields(); })}
        onCancel={() => { setTransferOpen(false); transferForm.resetFields(); }}
        width={480}
      >
        <Form form={transferForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="划转类型" name="type" rules={[{ required: true }]}>
            <Space>
              <Button.Group>
                <Button>集团下拨</Button>
                <Button>集团调回</Button>
              </Button.Group>
            </Space>
          </Form.Item>
          <Form.Item label="划转金额（USDT）" name="amount" rules={[{ required: true }]}>
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              precision={2}
              placeholder="请输入划转金额"
            />
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <Input.TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default CompanyListPage;
