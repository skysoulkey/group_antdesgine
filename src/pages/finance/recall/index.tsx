import { useState } from 'react';
import { Card, Row, Col, Input, Select, Table, Tag, DatePicker, Typography, Button, Modal, Form, InputNumber, message } from 'antd';
import { SearchOutlined, ArrowUpOutlined, SwapOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface RecallRecord {
  id: number;
  orderId: string;
  sourceCompany: string;
  amount: string;
  currency: 'USDT' | 'PEA';
  remark: string;
  status: 'success' | 'pending' | 'failed';
  operator: string;
  createdAt: string;
  arrivedAt: string;
}

const statusMap = {
  success: { label: '已到账', color: 'success' },
  pending: { label: '处理中', color: 'processing' },
  failed:  { label: '失败', color: 'error' },
} as const;

const COMPANIES = ['UU Talk', 'Hey Talk', '炸雷第一波', 'Nova Corp', 'Flash Inc'];

const mockData: RecallRecord[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  orderId: `RECALL2025${String(1120001 + i).padStart(7, '0')}`,
  sourceCompany: COMPANIES[i % COMPANIES.length],
  amount: (15000 + i * 12350.5).toFixed(2),
  currency: (['USDT', 'PEA'] as const)[i % 2],
  remark: ['月度调回', '季度结算', '年度回收', '临时调回'][i % 4],
  status: (['success', 'pending', 'failed'] as const)[i % 3],
  operator: ['Admin', 'FinanceManager', 'SuperAdmin'][i % 3],
  createdAt: `2025-11-${String(1 + (i % 28)).padStart(2, '0')} 14:${String(i % 60).padStart(2, '0')}:00`,
  arrivedAt: i % 3 === 0 ? `2025-11-${String(1 + (i % 28)).padStart(2, '0')} 14:${String((i + 5) % 60).padStart(2, '0')}:00` : '',
}));

export default function FinanceRecall() {
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const filtered = mockData.filter(r => {
    const kw = search.toLowerCase();
    return (
      (!kw || r.orderId.toLowerCase().includes(kw) || r.sourceCompany.toLowerCase().includes(kw)) &&
      (!companyFilter || r.sourceCompany === companyFilter) &&
      (!statusFilter || r.status === statusFilter)
    );
  });

  const monthTotal = mockData.filter(r => r.status === 'success').reduce((s, r) => s + Number(r.amount), 0);
  const monthCount = mockData.filter(r => r.status === 'success').length;

  const handleSubmit = () => {
    form.validateFields().then(() => {
      setModalOpen(false);
      form.resetFields();
      message.success('调回申请已提交');
    });
  };

  const columns: ColumnsType<RecallRecord> = [
    { title: '订单编号', dataIndex: 'orderId', width: 210, render: v => <Text code style={{ fontSize: 12 }}>{v}</Text> },
    { title: '来源公司', dataIndex: 'sourceCompany', render: v => <Text strong>{v}</Text> },
    {
      title: '调回金额', dataIndex: 'amount', width: 170, align: 'right',
      render: (v, r) => (
        <Text strong style={{ color: '#fa8c16' }}>
          {Number(v).toLocaleString('en', { minimumFractionDigits: 2 })} {r.currency}
        </Text>
      ),
    },
    {
      title: '状态', dataIndex: 'status', width: 100,
      render: v => <Tag color={statusMap[v as keyof typeof statusMap].color}>{statusMap[v as keyof typeof statusMap].label}</Tag>,
    },
    { title: '操作人', dataIndex: 'operator', width: 120 },
    { title: '备注', dataIndex: 'remark', width: 130, ellipsis: true },
    { title: '创建时间', dataIndex: 'createdAt', width: 170 },
    { title: '到账时间', dataIndex: 'arrivedAt', width: 170, render: v => v || <Text type="secondary">—</Text> },
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12}>
          <Card bordered={false} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 8 }}>本月调回总额（USDT）</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#fa8c16' }}>
              {monthTotal.toLocaleString('en', { minimumFractionDigits: 2 })}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card bordered={false} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 8 }}>本月调回次数</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#722ed1' }}>{monthCount}</div>
          </Card>
        </Col>
      </Row>

      <Card bordered={false}>
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ArrowUpOutlined style={{ color: '#fa8c16', fontSize: 18 }} />
            <Text style={{ fontSize: 16, fontWeight: 600 }}>集团调回</Text>
          </div>
          <Button icon={<SwapOutlined />} onClick={() => setModalOpen(true)}>
            发起调回
          </Button>
        </div>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col>
            <Input prefix={<SearchOutlined />} placeholder="搜索订单编号 / 公司名称"
              value={search} onChange={e => setSearch(e.target.value)} allowClear style={{ width: 280 }} />
          </Col>
          <Col>
            <Select placeholder="来源公司" value={companyFilter} onChange={setCompanyFilter} allowClear
              style={{ width: 150 }} options={COMPANIES.map(c => ({ label: c, value: c }))} />
          </Col>
          <Col>
            <Select placeholder="状态" value={statusFilter} onChange={setStatusFilter} allowClear style={{ width: 130 }}
              options={[{ label: '已到账', value: 'success' }, { label: '处理中', value: 'pending' }, { label: '失败', value: 'failed' }]} />
          </Col>
          <Col><RangePicker style={{ width: 280 }} /></Col>
        </Row>
        <Table dataSource={filtered} columns={columns} rowKey="id" size="middle" scroll={{ x: 1200 }}
          pagination={{ total: filtered.length, pageSize: 10, showTotal: t => `总共 ${t} 条记录`, showSizeChanger: true }} />
      </Card>

      <Modal title="发起集团调回" open={modalOpen} onOk={handleSubmit}
        onCancel={() => { setModalOpen(false); form.resetFields(); }} width={480}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="来源公司" name="sourceCompany" rules={[{ required: true, message: '请选择来源公司' }]}>
            <Select placeholder="请选择调回资金的公司" options={COMPANIES.map(c => ({ label: c, value: c }))} />
          </Form.Item>
          <Form.Item label="调回金额" name="amount" rules={[{ required: true, message: '请输入调回金额' }]}>
            <InputNumber min={0.01} precision={2} style={{ width: '100%' }} placeholder="请输入调回金额" addonAfter="USDT" />
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <Input.TextArea rows={3} placeholder="请输入备注（可选）" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
