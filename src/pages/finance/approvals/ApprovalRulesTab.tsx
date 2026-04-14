import { PlusOutlined } from '@ant-design/icons';
import {
  Button, Card, Form, Input, Modal, Radio, Select,
  Space, Switch, Table, Tag, message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';

const CARD_SHADOW = '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)';
const CARD_RADIUS = 12;

type EventType = 'additional_investment' | 'share_release';
type TriggerConditionType = 'amount' | 'company' | 'amount_and_company';

const EVENT_LABELS: Record<EventType, string> = {
  additional_investment: '持股企业追加投资',
  share_release: '持股企业释放股份',
};

const TRIGGER_LABELS: Record<TriggerConditionType, string> = {
  amount: '金额',
  company: '企业',
  amount_and_company: '金额+企业',
};

interface ApprovalRule {
  id: string;
  name: string;
  eventType: EventType;
  scope: string;
  triggerType: TriggerConditionType;
  conditions: { field: string; operator: string; value: string }[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  companyId: string;
}

// ── Mock 企业 ─────────────────────────────────────────────────────
const MOCK_ENTERPRISES_FOR_RULES = [
  { id: 'ENT001', name: 'CyberBot' },
  { id: 'ENT002', name: 'StarLink' },
  { id: 'ENT003', name: 'QuantumPay' },
  { id: 'ENT004', name: 'NovaTech' },
];

const initialRules: ApprovalRule[] = [
  {
    id: 'RULE001', name: '小额投资自动通过', eventType: 'additional_investment',
    scope: '全部企业', triggerType: 'amount',
    conditions: [{ field: 'investAmount', operator: '≤', value: '10000' }],
    enabled: true, createdAt: '2026-04-01 10:00:00', updatedAt: '2026-04-10 14:30:00', companyId: 'COM001',
  },
  {
    id: 'RULE002', name: 'CyberBot自动通过', eventType: 'share_release',
    scope: 'CyberBot', triggerType: 'company',
    conditions: [{ field: 'sourceCompanyId', operator: '=', value: 'ENT001' }],
    enabled: true, createdAt: '2026-04-02 11:00:00', updatedAt: '2026-04-08 09:00:00', companyId: 'COM001',
  },
  {
    id: 'RULE003', name: 'StarLink小额释放自动通过', eventType: 'share_release',
    scope: 'StarLink', triggerType: 'amount_and_company',
    conditions: [
      { field: 'sourceCompanyId', operator: '=', value: 'ENT002' },
      { field: 'releaseAmount', operator: '≤', value: '5000' },
    ],
    enabled: false, createdAt: '2026-04-05 16:00:00', updatedAt: '2026-04-05 16:00:00', companyId: 'COM001',
  },
];

const ApprovalRulesTab: React.FC = () => {
  const [rules, setRules] = useState<ApprovalRule[]>(initialRules);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ApprovalRule | null>(null);
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingRule(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (rule: ApprovalRule) => {
    setEditingRule(rule);
    form.setFieldsValue({
      name: rule.name,
      eventType: rule.eventType,
      triggerType: rule.triggerType,
      amountOperator: rule.conditions.find((c) => c.field.includes('Amount'))?.operator || '≤',
      amountValue: rule.conditions.find((c) => c.field.includes('Amount'))?.value || '',
      companyIds: rule.conditions.filter((c) => c.field === 'sourceCompanyId').map((c) => c.value),
      enabled: rule.enabled,
    });
    setModalOpen(true);
  };

  const handleDelete = (rule: ApprovalRule) => {
    Modal.confirm({
      title: '确认删除',
      content: `确认删除规则「${rule.name}」？`,
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
      const conditions: { field: string; operator: string; value: string }[] = [];
      const amountField = values.eventType === 'additional_investment' ? 'investAmount' : 'releaseAmount';

      if (values.triggerType === 'amount' || values.triggerType === 'amount_and_company') {
        conditions.push({ field: amountField, operator: values.amountOperator, value: values.amountValue });
      }
      if (values.triggerType === 'company' || values.triggerType === 'amount_and_company') {
        (values.companyIds || []).forEach((cid: string) => {
          conditions.push({ field: 'sourceCompanyId', operator: '=', value: cid });
        });
      }

      const scopeNames = (values.companyIds || [])
        .map((cid: string) => MOCK_ENTERPRISES_FOR_RULES.find((e) => e.id === cid)?.name)
        .filter(Boolean)
        .join('、');

      if (editingRule) {
        setRules((prev) =>
          prev.map((r) =>
            r.id === editingRule.id
              ? { ...r, name: values.name, eventType: values.eventType, triggerType: values.triggerType, conditions, scope: scopeNames || '全部企业', enabled: values.enabled ?? r.enabled, updatedAt: now }
              : r,
          ),
        );
        message.success('已更新');
      } else {
        const newRule: ApprovalRule = {
          id: `RULE${String(rules.length + 1).padStart(3, '0')}`,
          name: values.name,
          eventType: values.eventType,
          triggerType: values.triggerType,
          scope: scopeNames || '全部企业',
          conditions,
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

  const triggerTypeValue = Form.useWatch('triggerType', form);

  const columns: ColumnsType<ApprovalRule> = [
    { title: '创建时间', dataIndex: 'createdAt', width: 170, sorter: (a, b) => a.createdAt.localeCompare(b.createdAt) },
    { title: '更新时间', dataIndex: 'updatedAt', width: 170 },
    { title: '规则名称', dataIndex: 'name', width: 180 },
    { title: '适用事件类型', dataIndex: 'eventType', width: 160, render: (v: EventType) => EVENT_LABELS[v] },
    { title: '适用范围', dataIndex: 'scope', width: 140 },
    { title: '触发条件', dataIndex: 'triggerType', width: 120, render: (v: TriggerConditionType) => TRIGGER_LABELS[v] },
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
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <div />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增规则</Button>
        </div>
        <Table
          columns={columns}
          dataSource={rules}
          rowKey="id"
          size="middle"
          scroll={{ x: 1200 }}
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
          rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
        />
      </Card>

      <Modal
        title={editingRule ? '编辑规则' : '新增规则'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        width={560}
        okText="保 存"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="规则名称" rules={[{ required: true, message: '请输入规则名称' }]}>
            <Input placeholder="例：小额投资自动通过" />
          </Form.Item>
          <Form.Item name="eventType" label="适用事件类型" rules={[{ required: true, message: '请选择事件类型' }]}>
            <Radio.Group>
              <Radio value="additional_investment">持股企业追加投资</Radio>
              <Radio value="share_release">持股企业释放股份</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="triggerType" label="触发条件类型" rules={[{ required: true, message: '请选择触发条件' }]}>
            <Radio.Group>
              <Radio value="amount">按金额</Radio>
              <Radio value="company">按企业</Radio>
              <Radio value="amount_and_company">按金额+企业</Radio>
            </Radio.Group>
          </Form.Item>

          {(triggerTypeValue === 'amount' || triggerTypeValue === 'amount_and_company') && (
            <Form.Item label="金额条件">
              <Space>
                <Form.Item name="amountOperator" noStyle initialValue="≤">
                  <Select style={{ width: 80 }} options={[{ value: '≤', label: '≤' }, { value: '≥', label: '≥' }]} />
                </Form.Item>
                <Form.Item name="amountValue" noStyle rules={[{ required: true, message: '请输入金额' }]}>
                  <Input placeholder="金额" style={{ width: 160 }} suffix="USDT" />
                </Form.Item>
              </Space>
            </Form.Item>
          )}

          {(triggerTypeValue === 'company' || triggerTypeValue === 'amount_and_company') && (
            <Form.Item name="companyIds" label="适用企业" rules={[{ required: true, message: '请选择企业' }]}>
              <Select
                mode="multiple"
                placeholder="选择企业"
                options={MOCK_ENTERPRISES_FOR_RULES.map((e) => ({ value: e.id, label: e.name }))}
              />
            </Form.Item>
          )}

          <Form.Item name="enabled" label="启用状态" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ApprovalRulesTab;
