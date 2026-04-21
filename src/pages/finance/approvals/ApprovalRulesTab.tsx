import {
  Button, Card, Form, Input, InputNumber, Modal, Select,
  Space, Switch, Table, Typography, message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useRef, useState, useCallback } from 'react';
import TableToolbar from '../../../components/TableToolbar';

const { Text } = Typography;

const CARD_SHADOW = '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)';
const CARD_RADIUS = 12;

// ── 企业专属规则 ─────────────────────────────────────────────────
interface EnterpriseRule {
  enterpriseId: string;
  enterpriseName: string;
  currency: string;
  amountLimit: number | null;
  totalInvestLimit: number | null;
  enabled: boolean;
  updatedAt: string;
}

// ── 全局兜底规则 ─────────────────────────────────────────────────
interface GlobalRuleItem {
  currency: string;
  amountLimit: number | null;
  totalInvestLimit: number | null;
}

interface GlobalRule {
  enabled: boolean;
  updatedAt: string;
  items: GlobalRuleItem[];
}

// ── Mock 数据 ────────────────────────────────────────────────────
const initialEnterpriseRules: EnterpriseRule[] = [
  {
    enterpriseId: 'ENT001', enterpriseName: '星辰科技', currency: 'USDT',
    amountLimit: 10000, totalInvestLimit: 500000,
    enabled: true, updatedAt: '2026-04-10 14:30:00',
  },
  {
    enterpriseId: 'ENT002', enterpriseName: '云帆网络', currency: 'PEA',
    amountLimit: 5000000, totalInvestLimit: 200000000,
    enabled: false, updatedAt: '2026-04-08 09:00:00',
  },
];

const initialGlobalRule: GlobalRule = {
  enabled: false,
  updatedAt: '',
  items: [
    { currency: 'PEA', amountLimit: null, totalInvestLimit: null },
    { currency: 'USDT', amountLimit: null, totalInvestLimit: null },
  ],
};

const ApprovalRulesTab: React.FC = () => {
  const [enterpriseRules, setEnterpriseRules] = useState<EnterpriseRule[]>(initialEnterpriseRules);
  const [globalRule, setGlobalRule] = useState<GlobalRule>(initialGlobalRule);

  // 编辑企业规则
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<EnterpriseRule | null>(null);
  const [form] = Form.useForm();

  // 新增企业规则
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm] = Form.useForm();

  // 编辑全局规则
  const [globalModalOpen, setGlobalModalOpen] = useState(false);
  const [globalForm] = Form.useForm();

  const containerRef = useRef<HTMLDivElement>(null);

  // ── 企业规则操作 ───────────────────────────────────────────────
  const handleEdit = (rule: EnterpriseRule) => {
    setEditingRule(rule);
    form.setFieldsValue({
      amountLimit: rule.amountLimit,
      totalInvestLimit: rule.totalInvestLimit,
    });
    setModalOpen(true);
  };

  const handleSave = (andEnable = false) => {
    form.validateFields().then((values) => {
      const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
      setEnterpriseRules((prev) =>
        prev.map((r) =>
          r.enterpriseId === editingRule!.enterpriseId
            ? { ...r, amountLimit: values.amountLimit, totalInvestLimit: values.totalInvestLimit, updatedAt: now, ...(andEnable ? { enabled: true } : {}) }
            : r,
        ),
      );
      message.success(andEnable ? '已保存并启用' : '已保存');
      setModalOpen(false);
    });
  };

  const handleToggle = (rule: EnterpriseRule) => {
    const next = !rule.enabled;
    if (next && (rule.amountLimit == null || rule.totalInvestLimit == null)) {
      message.warning('请先配置规则后再启用');
      return;
    }
    setEnterpriseRules((prev) =>
      prev.map((r) =>
        r.enterpriseId === rule.enterpriseId
          ? { ...r, enabled: next, updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) }
          : r,
      ),
    );
    message.success(next ? '已启用' : '已停用');
  };

  const handleDelete = (rule: EnterpriseRule) => {
    Modal.confirm({
      title: '确认删除',
      content: `确认删除 ${rule.enterpriseName} 的审批规则？`,
      okText: '确认删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () => {
        setEnterpriseRules((prev) => prev.filter((r) => r.enterpriseId !== rule.enterpriseId));
        message.success('已删除');
      },
    });
  };

  const handleAdd = () => {
    addForm.validateFields().then((values) => {
      const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
      const exists = enterpriseRules.some((r) => r.enterpriseId === values.enterpriseId);
      if (exists) {
        message.warning('该企业已存在规则');
        return;
      }
      const newRule: EnterpriseRule = {
        enterpriseId: values.enterpriseId,
        enterpriseName: values.enterpriseName,
        currency: values.currency,
        amountLimit: values.amountLimit,
        totalInvestLimit: values.totalInvestLimit,
        enabled: false,
        updatedAt: now,
      };
      setEnterpriseRules((prev) => [...prev, newRule]);
      message.success('已新增');
      setAddModalOpen(false);
      addForm.resetFields();
    });
  };

  // ── 全局规则操作 ───────────────────────────────────────────────
  const handleGlobalToggle = () => {
    const next = !globalRule.enabled;
    if (next && globalRule.items.some((item) => item.amountLimit == null || item.totalInvestLimit == null)) {
      message.warning('请先配置所有币种的规则后再启用');
      return;
    }
    setGlobalRule((prev) => ({
      ...prev,
      enabled: next,
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    }));
    message.success(next ? '已启用' : '已停用');
  };

  const openGlobalEdit = () => {
    globalForm.setFieldsValue({
      items: globalRule.items.map((item) => ({
        amountLimit: item.amountLimit,
        totalInvestLimit: item.totalInvestLimit,
      })),
    });
    setGlobalModalOpen(true);
  };

  const handleGlobalSave = (andEnable = false) => {
    globalForm.validateFields().then((values) => {
      const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
      setGlobalRule((prev) => ({
        enabled: andEnable ? true : prev.enabled,
        updatedAt: now,
        items: prev.items.map((item, idx) => ({
          ...item,
          amountLimit: values.items[idx].amountLimit,
          totalInvestLimit: values.items[idx].totalInvestLimit,
        })),
      }));
      message.success(andEnable ? '已保存并启用' : '已保存');
      setGlobalModalOpen(false);
    });
  };

  const handleRefresh = useCallback(() => {
    message.success('已刷新');
  }, []);

  // ── 企业规则表格列 ─────────────────────────────────────────────
  const enterpriseColumns: ColumnsType<EnterpriseRule> = [
    {
      title: '更新时间', dataIndex: 'updatedAt', width: 170,
      sorter: (a, b) => a.updatedAt.localeCompare(b.updatedAt),
      render: (v: string) => v || '—',
    },
    { title: '企业名称', dataIndex: 'enterpriseName', width: 140 },
    { title: '企业ID', dataIndex: 'enterpriseId', width: 100 },
    { title: '币种', dataIndex: 'currency', width: 80 },
    {
      title: '单笔自动通过上限', width: 180,
      render: (_: unknown, r: EnterpriseRule) =>
        r.amountLimit != null ? `${r.amountLimit.toLocaleString()} ${r.currency}` : '—',
    },
    {
      title: '总投入金额上限', width: 180,
      render: (_: unknown, r: EnterpriseRule) =>
        r.totalInvestLimit != null ? `${r.totalInvestLimit.toLocaleString()} ${r.currency}` : '—',
    },
    {
      title: '启用', dataIndex: 'enabled', width: 80, align: 'center' as const,
      render: (_: unknown, record: EnterpriseRule) => (
        <Switch size="small" checked={record.enabled} onChange={() => handleToggle(record)} />
      ),
    },
    {
      title: '操作', width: 120, fixed: 'right' as const,
      render: (_: unknown, record: EnterpriseRule) => (
        <Space size={4}>
          <Button type="link" size="small" onClick={() => handleEdit(record)}>编辑</Button>
          <Button type="link" size="small" danger onClick={() => handleDelete(record)}>删除</Button>
        </Space>
      ),
    },
  ];

  // ── 全局规则表格列 ─────────────────────────────────────────────
  const globalColumns: ColumnsType<GlobalRuleItem> = [
    { title: '币种', dataIndex: 'currency', width: 80 },
    {
      title: '单笔自动通过上限', width: 200,
      render: (_: unknown, r: GlobalRuleItem) =>
        r.amountLimit != null ? `${r.amountLimit.toLocaleString()} ${r.currency}` : '—',
    },
    {
      title: '总投入金额上限', width: 200,
      render: (_: unknown, r: GlobalRuleItem) =>
        r.totalInvestLimit != null ? `${r.totalInvestLimit.toLocaleString()} ${r.currency}` : '—',
    },
  ];

  return (
    <div ref={containerRef}>
      {/* ── 企业专属规则 ─────────────────────────────────────────── */}
      <Card bordered={false} style={{ borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: 600 }}>企业专属规则</Text>
          <Space>
            <Button type="primary" size="small" onClick={() => setAddModalOpen(true)}>新增规则</Button>
            <TableToolbar onRefresh={handleRefresh} containerRef={containerRef} />
          </Space>
        </div>
        <div style={{ marginBottom: 16, fontSize: 12, color: '#8c8c8c' }}>
          每个企业一条规则，优先级高于全局兜底规则。单笔申请金额在上限内时自动通过；累计投入超过总投入上限后，所有申请均需人工审批。
        </div>
        <Table
          columns={enterpriseColumns}
          dataSource={enterpriseRules}
          rowKey="enterpriseId"
          size="middle"
          scroll={{ x: 1100 }}
          pagination={false}
          rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
        />
      </Card>

      {/* ── 兜底全局规则 ─────────────────────────────────────────── */}
      <Card bordered={false} style={{ borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW, marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <Text style={{ fontSize: 14, fontWeight: 600 }}>兜底全局规则</Text>
            <Text style={{ fontSize: 12, color: '#8c8c8c', marginLeft: 8 }}>
              对未配置专属规则的企业生效，不可删除
            </Text>
          </div>
          <Space>
            <Switch size="small" checked={globalRule.enabled} onChange={handleGlobalToggle} />
            <Button type="link" size="small" onClick={openGlobalEdit}>编辑</Button>
          </Space>
        </div>
        {globalRule.updatedAt && (
          <div style={{ marginBottom: 8, fontSize: 12, color: '#8c8c8c' }}>
            最近更新：{globalRule.updatedAt}
          </div>
        )}
        <Table
          columns={globalColumns}
          dataSource={globalRule.items}
          rowKey="currency"
          size="middle"
          pagination={false}
          rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
        />
      </Card>

      {/* ── 编辑企业规则弹窗 ─────────────────────────────────────── */}
      <Modal
        title="编辑规则"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        width={480}
        footer={[
          <Button key="cancel" onClick={() => setModalOpen(false)}>取消</Button>,
          <Button key="save" type="primary" ghost onClick={() => handleSave(false)}>保存</Button>,
          <Button key="saveAndEnable" type="primary" onClick={() => handleSave(true)}>保存并启用</Button>,
        ]}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 16, padding: '8px 12px', background: '#fafafa', borderRadius: 6, fontSize: 13, color: '#595959' }}>
            企业：{editingRule?.enterpriseName}（{editingRule?.enterpriseId}）&nbsp;&nbsp;币种：{editingRule?.currency}
          </div>
          <Form.Item
            name="amountLimit"
            label={`单笔自动通过上限（${editingRule?.currency ?? ''}）`}
            rules={[{ required: true, message: '请输入单笔金额上限' }]}
            extra="单笔申请金额在此上限内时自动通过，超过则需人工审批"
          >
            <InputNumber placeholder="例：10000" style={{ width: '100%' }} min={1} precision={2} />
          </Form.Item>
          <Form.Item
            name="totalInvestLimit"
            label={`总投入金额上限（${editingRule?.currency ?? ''}）`}
            rules={[{ required: true, message: '请输入总投入金额上限' }]}
            extra="累计投入达到此上限后，后续申请均需人工审批"
          >
            <InputNumber placeholder="例：500000" style={{ width: '100%' }} min={1} precision={2} />
          </Form.Item>
        </Form>
      </Modal>

      {/* ── 新增企业规则弹窗 ─────────────────────────────────────── */}
      <Modal
        title="新增企业规则"
        open={addModalOpen}
        onCancel={() => { setAddModalOpen(false); addForm.resetFields(); }}
        onOk={handleAdd}
        width={480}
      >
        <Form form={addForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="enterpriseId" label="企业ID" rules={[{ required: true, message: '请输入企业ID' }]}>
            <Input placeholder="例：ENT005" />
          </Form.Item>
          <Form.Item name="enterpriseName" label="企业名称" rules={[{ required: true, message: '请输入企业名称' }]}>
            <Input placeholder="例：新企业" />
          </Form.Item>
          <Form.Item name="currency" label="币种" rules={[{ required: true, message: '请选择币种' }]}>
            <Select options={[{ value: 'PEA', label: 'PEA' }, { value: 'USDT', label: 'USDT' }]} />
          </Form.Item>
          <Form.Item name="amountLimit" label="单笔自动通过上限" rules={[{ required: true, message: '请输入' }]}>
            <InputNumber placeholder="例：10000" style={{ width: '100%' }} min={1} precision={2} />
          </Form.Item>
          <Form.Item name="totalInvestLimit" label="总投入金额上限" rules={[{ required: true, message: '请输入' }]}>
            <InputNumber placeholder="例：500000" style={{ width: '100%' }} min={1} precision={2} />
          </Form.Item>
        </Form>
      </Modal>

      {/* ── 编辑全局兜底规则弹窗 ─────────────────────────────────── */}
      <Modal
        title="编辑全局兜底规则"
        open={globalModalOpen}
        onCancel={() => setGlobalModalOpen(false)}
        width={520}
        footer={[
          <Button key="cancel" onClick={() => setGlobalModalOpen(false)}>取消</Button>,
          <Button key="save" type="primary" ghost onClick={() => handleGlobalSave(false)}>保存</Button>,
          <Button key="saveAndEnable" type="primary" onClick={() => handleGlobalSave(true)}>保存并启用</Button>,
        ]}
      >
        <Form form={globalForm} layout="vertical" style={{ marginTop: 16 }}>
          {globalRule.items.map((item, idx) => (
            <div key={item.currency}>
              <Text style={{ fontWeight: 600, fontSize: 13 }}>{item.currency}</Text>
              <div style={{ display: 'flex', gap: 12, marginTop: 8, marginBottom: 16 }}>
                <Form.Item
                  name={['items', idx, 'amountLimit']}
                  label={`单笔自动通过上限（${item.currency}）`}
                  rules={[{ required: true, message: '请输入' }]}
                  style={{ flex: 1, marginBottom: 0 }}
                >
                  <InputNumber placeholder="例：10000" style={{ width: '100%' }} min={1} precision={2} />
                </Form.Item>
                <Form.Item
                  name={['items', idx, 'totalInvestLimit']}
                  label={`总投入金额上限（${item.currency}）`}
                  rules={[{ required: true, message: '请输入' }]}
                  style={{ flex: 1, marginBottom: 0 }}
                >
                  <InputNumber placeholder="例：500000" style={{ width: '100%' }} min={1} precision={2} />
                </Form.Item>
              </div>
            </div>
          ))}
        </Form>
      </Modal>
    </div>
  );
};

export default ApprovalRulesTab;
