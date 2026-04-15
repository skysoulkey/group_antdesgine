import { PlusOutlined } from '@ant-design/icons';
import {
  Button, Card, Form, Input, InputNumber, Modal, Select,
  Space, Switch, Table, Tag, message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState, useMemo } from 'react';

const CARD_SHADOW = '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)';
const CARD_RADIUS = 12;

// ── 数据结构 ──────────────────────────────────────────────────────
interface ApprovalRule {
  id: string;
  enterpriseId: string;
  enterpriseName: string;
  amountLimit: number;
  currency: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  companyId: string;
}

// ── Mock 企业 ─────────────────────────────────────────────────────
const MOCK_ENTERPRISES = [
  { id: 'ENT001', name: 'CyberBot' },
  { id: 'ENT002', name: 'StarLink' },
  { id: 'ENT003', name: 'QuantumPay' },
  { id: 'ENT004', name: 'NovaTech' },
];

const initialRules: ApprovalRule[] = [
  {
    id: 'RULE001', enterpriseId: 'ENT001', enterpriseName: 'CyberBot',
    amountLimit: 10000, currency: 'USDT',
    enabled: true, createdAt: '2026-04-01 10:00:00', updatedAt: '2026-04-10 14:30:00', companyId: 'COM001',
  },
  {
    id: 'RULE002', enterpriseId: 'ENT002', enterpriseName: 'StarLink',
    amountLimit: 5000, currency: 'USDT',
    enabled: true, createdAt: '2026-04-02 11:00:00', updatedAt: '2026-04-08 09:00:00', companyId: 'COM001',
  },
];

const ApprovalRulesTab: React.FC = () => {
  const [rules, setRules] = useState<ApprovalRule[]>(initialRules);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ApprovalRule | null>(null);
  const [form] = Form.useForm();

  // 已配置规则的企业 ID 集合（排除当前编辑的）
  const configuredEnterpriseIds = useMemo(() => {
    return new Set(rules.filter((r) => r.id !== editingRule?.id).map((r) => r.enterpriseId));
  }, [rules, editingRule]);

  // 可选企业（过滤掉已配置的）
  const availableEnterprises = useMemo(() => {
    return MOCK_ENTERPRISES.filter((e) => !configuredEnterpriseIds.has(e.id));
  }, [configuredEnterpriseIds]);

  const handleAdd = () => {
    if (availableEnterprises.length === 0) {
      message.warning('所有企业均已配置规则');
      return;
    }
    setEditingRule(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (rule: ApprovalRule) => {
    setEditingRule(rule);
    form.setFieldsValue({
      enterpriseId: rule.enterpriseId,
      amountLimit: rule.amountLimit,
      enabled: rule.enabled,
    });
    setModalOpen(true);
  };

  const handleDelete = (rule: ApprovalRule) => {
    Modal.confirm({
      title: '确认删除',
      content: `确认删除 ${rule.enterpriseName} 的自动审批规则？删除后该企业的事务将需要人工审批。`,
      okText: '删除',
      okButtonProps: { danger: true },
      onOk: () => {
        setRules((prev) => prev.filter((r) => r.id !== rule.id));
        message.success('已删除');
      },
    });
  };

  const handleToggle = (rule: ApprovalRule) => {
    setRules((prev) =>
      prev.map((r) =>
        r.id === rule.id
          ? { ...r, enabled: !r.enabled, updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) }
          : r,
      ),
    );
    message.success(rule.enabled ? '已停用' : '已启用');
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
      const enterprise = MOCK_ENTERPRISES.find((e) => e.id === values.enterpriseId)!;

      if (editingRule) {
        setRules((prev) =>
          prev.map((r) =>
            r.id === editingRule.id
              ? { ...r, enterpriseId: values.enterpriseId, enterpriseName: enterprise.name, amountLimit: values.amountLimit, enabled: values.enabled ?? r.enabled, updatedAt: now }
              : r,
          ),
        );
        message.success('已更新');
      } else {
        const newRule: ApprovalRule = {
          id: `RULE${String(Date.now()).slice(-6)}`,
          enterpriseId: values.enterpriseId,
          enterpriseName: enterprise.name,
          amountLimit: values.amountLimit,
          currency: 'USDT',
          enabled: values.enabled ?? true,
          createdAt: now,
          updatedAt: now,
          companyId: 'COM001',
        };
        setRules((prev) => [newRule, ...prev]);
        message.success('已创建');
      }
      setModalOpen(false);
    });
  };

  const columns: ColumnsType<ApprovalRule> = [
    { title: '创建时间', dataIndex: 'createdAt', width: 170, sorter: (a, b) => a.createdAt.localeCompare(b.createdAt) },
    { title: '更新时间', dataIndex: 'updatedAt', width: 170 },
    { title: '企业名称', dataIndex: 'enterpriseName', width: 140 },
    { title: '企业ID', dataIndex: 'enterpriseId', width: 100 },
    {
      title: '自动通过金额上限', width: 180,
      render: (_: unknown, r: ApprovalRule) => `≤ ${r.amountLimit.toLocaleString()} ${r.currency}`,
    },
    {
      title: '启用状态', dataIndex: 'enabled', width: 90,
      render: (v: boolean) => <Tag color={v ? 'success' : 'default'}>{v ? '已启用' : '已停用'}</Tag>,
    },
    {
      title: '操作', width: 180, fixed: 'right' as const,
      render: (_: unknown, record: ApprovalRule) => (
        <Space size={4}>
          <Button type="link" size="small" onClick={() => handleEdit(record)}>编辑</Button>
          <Button type="link" size="small" onClick={() => handleToggle(record)}>
            {record.enabled ? '停用' : '启用'}
          </Button>
          <Button type="link" size="small" danger onClick={() => handleDelete(record)}>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card bordered={false} style={{ borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 12, color: '#8c8c8c' }}>
            每个企业最多配置一条规则。有规则且金额 ≤ 上限自动通过，否则需人工审批。
          </span>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增规则</Button>
        </div>
        <Table
          columns={columns}
          dataSource={rules}
          rowKey="id"
          size="middle"
          scroll={{ x: 1000 }}
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
          rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
        />
      </Card>

      <Modal
        title={editingRule ? '编辑规则' : '新增规则'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        width={480}
        okText="保 存"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="enterpriseId" label="企业" rules={[{ required: true, message: '请选择企业' }]}>
            <Select
              placeholder="选择企业"
              options={
                editingRule
                  ? MOCK_ENTERPRISES.map((e) => ({ value: e.id, label: e.name }))
                  : availableEnterprises.map((e) => ({ value: e.id, label: e.name }))
              }
            />
          </Form.Item>
          <Form.Item name="amountLimit" label="自动通过金额上限（USDT）" rules={[{ required: true, message: '请输入金额上限' }]} extra="事务金额 ≤ 此值时自动通过，超过则需人工审批">
            <InputNumber placeholder="例：10000" style={{ width: '100%' }} min={1} precision={2} />
          </Form.Item>
          <Form.Item name="enabled" label="启用状态" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ApprovalRulesTab;
