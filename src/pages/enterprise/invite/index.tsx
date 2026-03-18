import { useState } from 'react';
import { Card, Row, Col, Input, Select, Table, Tag, DatePicker, Typography, Button, Modal, Form, InputNumber, message, Space, Tooltip } from 'antd';
import { SearchOutlined, KeyOutlined, PlusOutlined, CopyOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface InviteCode {
  id: number;
  code: string;
  status: 'unused' | 'used' | 'expired';
  usedCount: number;
  maxUses: number;
  usedBy: string;
  expiredAt: string;
  generatedBy: string;
  createdAt: string;
}

const statusMap = {
  unused:  { label: '未使用', color: 'blue' },
  used:    { label: '已使用', color: 'success' },
  expired: { label: '已过期', color: 'default' },
} as const;

const randomCode = (i: number) => `INV-${(10000000 + i * 137).toString(16).toUpperCase().slice(0, 8)}`;

const mockData: InviteCode[] = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  code: randomCode(i + 1),
  status: (['unused', 'used', 'expired'] as const)[i % 3],
  usedCount: i % 3 === 1 ? 1 : 0,
  maxUses: 1,
  usedBy: i % 3 === 1 ? ['hey Enterprise', 'Nova Corp', 'Flash Inc'][i % 3] : '',
  expiredAt: `2025-12-${String(1 + (i % 28)).padStart(2, '0')} 23:59:59`,
  generatedBy: ['Admin', 'SuperAdmin'][i % 2],
  createdAt: `2025-11-${String(1 + (i % 28)).padStart(2, '0')} 09:${String(i % 60).padStart(2, '0')}:00`,
}));

export default function EnterpriseInvite() {
  const [data, setData] = useState(mockData);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const filtered = data.filter(r => {
    const kw = search.toLowerCase();
    return (
      (!kw || r.code.toLowerCase().includes(kw) || r.usedBy.toLowerCase().includes(kw)) &&
      (!statusFilter || r.status === statusFilter)
    );
  });

  const handleGenerate = () => {
    form.validateFields().then(values => {
      const newCodes: InviteCode[] = Array.from({ length: values.count }, (_, i) => ({
        id: Date.now() + i,
        code: randomCode(Date.now() + i),
        status: 'unused',
        usedCount: 0,
        maxUses: values.maxUses || 1,
        usedBy: '',
        expiredAt: values.expiredAt ? values.expiredAt.format('YYYY-MM-DD') + ' 23:59:59' : '2025-12-31 23:59:59',
        generatedBy: 'Admin',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
      }));
      setData([...newCodes, ...data]);
      setModalOpen(false);
      form.resetFields();
      message.success(`成功生成 ${values.count} 个邀请码`);
    });
  };

  const handleVoid = (record: InviteCode) => {
    setData(prev => prev.map(r => r.id === record.id ? { ...r, status: 'expired' as const } : r));
    message.success('邀请码已作废');
  };

  const columns: ColumnsType<InviteCode> = [
    {
      title: '邀请码', dataIndex: 'code', width: 180,
      render: v => (
        <Space>
          <Text code strong>{v}</Text>
          <Tooltip title="复制邀请码">
            <Button type="text" size="small" icon={<CopyOutlined />}
              onClick={() => { navigator.clipboard.writeText(v); message.success('已复制'); }} />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: '使用状态', dataIndex: 'status', width: 100,
      render: v => <Tag color={statusMap[v as keyof typeof statusMap].color}>{statusMap[v as keyof typeof statusMap].label}</Tag>,
    },
    {
      title: '使用次数', key: 'uses', width: 100, align: 'center',
      render: (_, r) => `${r.usedCount} / ${r.maxUses}`,
    },
    { title: '使用企业', dataIndex: 'usedBy', render: v => v || <Text type="secondary">—</Text> },
    {
      title: '过期时间', dataIndex: 'expiredAt', width: 180,
      render: (v, r) => <Text type={r.status === 'expired' ? 'danger' : undefined}>{v}</Text>,
    },
    { title: '生成人', dataIndex: 'generatedBy', width: 110 },
    { title: '创建时间', dataIndex: 'createdAt', width: 170 },
    {
      title: '操作', key: 'action', width: 90, fixed: 'right',
      render: (_, r) => r.status === 'unused'
        ? <Button type="link" size="small" danger onClick={() => handleVoid(r)}>作废</Button>
        : <Text type="secondary">—</Text>,
    },
  ];

  return (
    <Card bordered={false}>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <KeyOutlined style={{ color: '#1677ff', fontSize: 18 }} />
          <Text style={{ fontSize: 16, fontWeight: 600 }}>邀请企业</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          生成邀请码
        </Button>
      </div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col>
          <Input prefix={<SearchOutlined />} placeholder="搜索邀请码 / 企业名称"
            value={search} onChange={e => setSearch(e.target.value)} allowClear style={{ width: 280 }} />
        </Col>
        <Col>
          <Select placeholder="使用状态" value={statusFilter} onChange={setStatusFilter} allowClear style={{ width: 130 }}
            options={[{ label: '未使用', value: 'unused' }, { label: '已使用', value: 'used' }, { label: '已过期', value: 'expired' }]} />
        </Col>
        <Col><RangePicker style={{ width: 280 }} /></Col>
      </Row>
      <Table dataSource={filtered} columns={columns} rowKey="id" size="middle" scroll={{ x: 1100 }}
        pagination={{ total: filtered.length, pageSize: 10, showTotal: t => `总共 ${t} 条记录`, showSizeChanger: true }} />

      <Modal title="生成邀请码" open={modalOpen} onOk={handleGenerate}
        onCancel={() => { setModalOpen(false); form.resetFields(); }} width={480}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}
          initialValues={{ count: 1, maxUses: 1 }}>
          <Form.Item label="生成数量" name="count" rules={[{ required: true, message: '请输入数量' }]}>
            <InputNumber min={1} max={100} style={{ width: '100%' }} placeholder="请输入生成数量" />
          </Form.Item>
          <Form.Item label="最大使用次数" name="maxUses" rules={[{ required: true, message: '请输入最大使用次数' }]}>
            <InputNumber min={1} max={100} style={{ width: '100%' }} placeholder="默认每码使用1次" />
          </Form.Item>
          <Form.Item label="有效期至" name="expiredAt">
            <DatePicker style={{ width: '100%' }} placeholder="请选择过期日期" />
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <Input.TextArea rows={3} placeholder="请输入备注（可选）" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
