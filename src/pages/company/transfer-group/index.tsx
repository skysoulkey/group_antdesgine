import { useState } from 'react';
import { Card, Row, Col, Input, Select, Table, Tag, DatePicker, Typography, Button, Modal, Form, InputNumber, message, Space } from 'antd';
import { SearchOutlined, SwapOutlined, ArrowDownOutlined, ArrowUpOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface GroupTransferRecord {
  id: number;
  transferId: string;
  direction: 'in' | 'out';
  fromCompany: string;
  toCompany: string;
  amount: string;
  currency: 'USDT' | 'PEA';
  remark: string;
  status: 'success' | 'pending' | 'failed';
  approvalStatus: 'approved' | 'pending_approval' | 'rejected';
  approvedBy: string;
  operator: string;
  createdAt: string;
}

const statusMap = {
  success: { label: '成功', color: 'success' },
  pending: { label: '处理中', color: 'processing' },
  failed:  { label: '失败', color: 'error' },
} as const;

const approvalStatusMap = {
  approved:         { label: '已审批', color: 'success' },
  pending_approval: { label: '待审批', color: 'processing' },
  rejected:         { label: '已拒绝', color: 'error' },
} as const;

const COMPANIES = ['UU Talk', 'Hey Talk', '炸雷第一波', 'Nova Corp', 'Flash Inc'];

const mockData: GroupTransferRecord[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  transferId: `GTRF2025${String(1120001 + i).padStart(7, '0')}`,
  direction: (['in', 'out'] as const)[i % 2],
  fromCompany: i % 2 === 0 ? '集团总部' : COMPANIES[i % COMPANIES.length],
  toCompany: i % 2 === 0 ? COMPANIES[i % COMPANIES.length] : '集团总部',
  amount: (10000 + i * 15321.5).toFixed(2),
  currency: (['USDT', 'PEA'] as const)[i % 2],
  remark: ['月度下拨', '季度调回', '年度结算', '专项资金'][i % 4],
  status: (['success', 'pending', 'failed'] as const)[i % 3],
  approvalStatus: (['approved', 'pending_approval', 'rejected'] as const)[i % 3],
  approvedBy: i % 3 === 0 ? 'SuperAdmin' : '',
  operator: ['Admin', 'FinanceManager', 'SuperAdmin'][i % 3],
  createdAt: `2025-11-${String(1 + (i % 28)).padStart(2, '0')} 16:${String(i % 60).padStart(2, '0')}:00`,
}));

export default function CompanyTransferGroup() {
  const [search, setSearch] = useState('');
  const [directionFilter, setDirectionFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [allocateOpen, setAllocateOpen] = useState(false);
  const [recallOpen, setRecallOpen] = useState(false);
  const [allocateForm] = Form.useForm();
  const [recallForm] = Form.useForm();

  const filtered = mockData.filter(r => {
    const kw = search.toLowerCase();
    return (
      (!kw || r.transferId.toLowerCase().includes(kw) || r.fromCompany.toLowerCase().includes(kw) || r.toCompany.toLowerCase().includes(kw)) &&
      (!directionFilter || r.direction === directionFilter) &&
      (!statusFilter || r.status === statusFilter)
    );
  });

  const handleAllocate = () => {
    allocateForm.validateFields().then(() => {
      setAllocateOpen(false);
      allocateForm.resetFields();
      message.success('下拨申请已提交，等待审批');
    });
  };

  const handleRecall = () => {
    recallForm.validateFields().then(() => {
      setRecallOpen(false);
      recallForm.resetFields();
      message.success('调回申请已提交，等待审批');
    });
  };

  const columns: ColumnsType<GroupTransferRecord> = [
    { title: '划转单号', dataIndex: 'transferId', width: 200, render: v => <Text code style={{ fontSize: 12 }}>{v}</Text> },
    {
      title: '方向', dataIndex: 'direction', width: 80,
      render: v => v === 'out'
        ? <Text style={{ color: '#722ed1' }}><ArrowDownOutlined /> 下拨</Text>
        : <Text style={{ color: '#fa8c16' }}><ArrowUpOutlined /> 调回</Text>,
    },
    { title: '转出方', dataIndex: 'fromCompany' },
    { title: '转入方', dataIndex: 'toCompany' },
    {
      title: '金额', dataIndex: 'amount', width: 160, align: 'right',
      render: (v, r) => (
        <Text strong style={{ color: r.direction === 'out' ? '#722ed1' : '#fa8c16' }}>
          {Number(v).toLocaleString('en', { minimumFractionDigits: 2 })} {r.currency}
        </Text>
      ),
    },
    {
      title: '状态', dataIndex: 'status', width: 90,
      render: v => <Tag color={statusMap[v as keyof typeof statusMap].color}>{statusMap[v as keyof typeof statusMap].label}</Tag>,
    },
    {
      title: '审批状态', dataIndex: 'approvalStatus', width: 100,
      render: v => <Tag color={approvalStatusMap[v as keyof typeof approvalStatusMap].color}>{approvalStatusMap[v as keyof typeof approvalStatusMap].label}</Tag>,
    },
    { title: '审批人', dataIndex: 'approvedBy', width: 100, render: v => v || <Text type="secondary">—</Text> },
    { title: '操作人', dataIndex: 'operator', width: 120 },
    { title: '备注', dataIndex: 'remark', width: 120 },
    { title: '创建时间', dataIndex: 'createdAt', width: 170 },
  ];

  return (
    <Card bordered={false}>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SwapOutlined style={{ color: '#722ed1', fontSize: 18 }} />
          <Text style={{ fontSize: 16, fontWeight: 600 }}>内部划转（集团）</Text>
        </div>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAllocateOpen(true)}>
            集团下拨
          </Button>
          <Button icon={<ArrowUpOutlined />} onClick={() => setRecallOpen(true)}>
            集团调回
          </Button>
        </Space>
      </div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col>
          <Input prefix={<SearchOutlined />} placeholder="搜索划转单号 / 公司名称"
            value={search} onChange={e => setSearch(e.target.value)} allowClear style={{ width: 280 }} />
        </Col>
        <Col>
          <Select placeholder="划转方向" value={directionFilter} onChange={setDirectionFilter} allowClear style={{ width: 130 }}
            options={[{ label: '集团下拨', value: 'out' }, { label: '集团调回', value: 'in' }]} />
        </Col>
        <Col>
          <Select placeholder="状态" value={statusFilter} onChange={setStatusFilter} allowClear style={{ width: 130 }}
            options={[{ label: '成功', value: 'success' }, { label: '处理中', value: 'pending' }, { label: '失败', value: 'failed' }]} />
        </Col>
        <Col><RangePicker style={{ width: 280 }} /></Col>
      </Row>
      <Table dataSource={filtered} columns={columns} rowKey="id" size="middle" scroll={{ x: 1500 }}
        pagination={{ total: filtered.length, pageSize: 10, showTotal: t => `总共 ${t} 条记录`, showSizeChanger: true }} />

      <Modal title="集团下拨" open={allocateOpen} onOk={handleAllocate}
        onCancel={() => { setAllocateOpen(false); allocateForm.resetFields(); }} width={480}>
        <Form form={allocateForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="目标公司" name="targetCompany" rules={[{ required: true, message: '请选择目标公司' }]}>
            <Select placeholder="请选择下拨目标公司" options={COMPANIES.map(c => ({ label: c, value: c }))} />
          </Form.Item>
          <Form.Item label="下拨金额（USDT）" name="amount" rules={[{ required: true, message: '请输入下拨金额' }]}>
            <InputNumber min={0.01} precision={2} style={{ width: '100%' }} placeholder="请输入下拨金额" addonAfter="USDT" />
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <Input.TextArea rows={3} placeholder="请输入备注（可选）" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="集团调回" open={recallOpen} onOk={handleRecall}
        onCancel={() => { setRecallOpen(false); recallForm.resetFields(); }} width={480}>
        <Form form={recallForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="来源公司" name="sourceCompany" rules={[{ required: true, message: '请选择来源公司' }]}>
            <Select placeholder="请选择调回资金的公司" options={COMPANIES.map(c => ({ label: c, value: c }))} />
          </Form.Item>
          <Form.Item label="调回金额（USDT）" name="amount" rules={[{ required: true, message: '请输入调回金额' }]}>
            <InputNumber min={0.01} precision={2} style={{ width: '100%' }} placeholder="请输入调回金额" addonAfter="USDT" />
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <Input.TextArea rows={3} placeholder="请输入备注（可选）" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
