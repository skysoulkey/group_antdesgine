import {
  Button, Card, Form, Input, Modal,
  Space, Switch, Table, Typography, message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useRef, useState, useCallback } from 'react';
import TableToolbar from '../../../components/TableToolbar';

const { Text } = Typography;

const CARD_SHADOW = '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)';
const CARD_RADIUS = 12;

// ── 数据结构 ──────────────────────────────────────────────────────
interface Approver {
  appAccount: string;
  nickname: string;
  enabled: boolean;
  updatedAt: string;
}

// ── Mock APP 账号 → 昵称映射（模拟 API） ─────────────────────────
const MOCK_ACCOUNT_MAP: Record<string, string> = {
  'tom_admin': 'Tom',
  'alice_wang': '王芳',
  'bob_zhang': '张伟',
  'carol_li': '李娜',
  'david_chen': '陈杰',
  'eve_liu': '刘洋',
};

// ── Mock 初始数据（默认预填公司主） ──────────────────────────────
const initialApprovers: Approver[] = [
  {
    appAccount: 'tom_admin',
    nickname: 'Tom',
    enabled: true,
    updatedAt: '2026-04-01 10:00:00',
  },
];

const ApprovalPermissionsTab: React.FC = () => {
  const [approvers, setApprovers] = useState<Approver[]>(initialApprovers);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingApprover, setEditingApprover] = useState<Approver | null>(null);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [lookedUpNickname, setLookedUpNickname] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  // ── 操作 ───────────────────────────────────────────────────────
  const handleToggle = (record: Approver) => {
    const next = !record.enabled;
    setApprovers((prev) =>
      prev.map((r) =>
        r.appAccount === record.appAccount
          ? { ...r, enabled: next, updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) }
          : r,
      ),
    );
    message.success(next ? '已启用' : '已停用');
  };

  const handleDelete = (record: Approver) => {
    Modal.confirm({
      title: '确认删除',
      content: `确认删除审批人 ${record.nickname}（${record.appAccount}）？`,
      okText: '确认删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () => {
        setApprovers((prev) => prev.filter((r) => r.appAccount !== record.appAccount));
        message.success('已删除');
      },
    });
  };

  const handleEdit = (record: Approver) => {
    setEditingApprover(record);
    editForm.setFieldsValue({ appAccount: record.appAccount });
    setLookedUpNickname(record.nickname);
    setEditModalOpen(true);
  };

  const handleEditSave = () => {
    editForm.validateFields().then((values) => {
      const account = values.appAccount.trim();
      const nickname = MOCK_ACCOUNT_MAP[account] || account;
      const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
      // 如果账号变了，检查是否重复
      if (account !== editingApprover!.appAccount && approvers.some((r) => r.appAccount === account)) {
        message.warning('该账号已在审批人列表中');
        return;
      }
      setApprovers((prev) =>
        prev.map((r) =>
          r.appAccount === editingApprover!.appAccount
            ? { ...r, appAccount: account, nickname, updatedAt: now }
            : r,
        ),
      );
      message.success('已保存');
      setEditModalOpen(false);
    });
  };

  const handleAccountLookup = (value: string) => {
    const account = value.trim();
    const nickname = MOCK_ACCOUNT_MAP[account];
    setLookedUpNickname(nickname || '');
  };

  const handleAdd = () => {
    addForm.validateFields().then((values) => {
      const account = values.appAccount.trim();
      if (approvers.some((r) => r.appAccount === account)) {
        message.warning('该账号已在审批人列表中');
        return;
      }
      const nickname = MOCK_ACCOUNT_MAP[account] || account;
      const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
      setApprovers((prev) => [...prev, {
        appAccount: account,
        nickname,
        enabled: true,
        updatedAt: now,
      }]);
      message.success('已添加');
      setAddModalOpen(false);
      addForm.resetFields();
      setLookedUpNickname('');
    });
  };

  const handleRefresh = useCallback(() => {
    message.success('已刷新');
  }, []);

  // ── 表格列 ─────────────────────────────────────────────────────
  const columns: ColumnsType<Approver> = [
    { title: '审批人昵称', dataIndex: 'nickname', width: 140 },
    { title: 'APP账号名', dataIndex: 'appAccount', width: 160 },
    {
      title: '状态', dataIndex: 'enabled', width: 80, align: 'center' as const,
      render: (_: unknown, record: Approver) => (
        <Switch size="small" checked={record.enabled} onChange={() => handleToggle(record)} />
      ),
    },
    {
      title: '修改时间', dataIndex: 'updatedAt', width: 170,
      sorter: (a, b) => a.updatedAt.localeCompare(b.updatedAt),
      render: (v: string) => v || '—',
    },
    {
      title: '操作', width: 120, fixed: 'right' as const,
      render: (_: unknown, record: Approver) => (
        <Space size={4}>
          <Button type="link" size="small" onClick={() => handleEdit(record)}>编辑</Button>
          <Button type="link" size="small" danger onClick={() => handleDelete(record)}>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <div ref={containerRef}>
      <Card bordered={false} style={{ borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: 600 }}>审批人列表</Text>
          <Space>
            <Button type="primary" size="small" onClick={() => { setAddModalOpen(true); setLookedUpNickname(''); }}>添加审批人</Button>
            <TableToolbar onRefresh={handleRefresh} containerRef={containerRef} />
          </Space>
        </div>
        <div style={{ marginBottom: 16, fontSize: 12, color: '#8c8c8c' }}>
          或签模式：任一启用的审批人均可审批订单。至少保留一个启用的审批人。
        </div>
        <Table
          columns={columns}
          dataSource={approvers}
          rowKey="appAccount"
          size="middle"
          scroll={{ x: 700 }}
          pagination={false}
          rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
        />
      </Card>

      {/* ── 添加审批人弹窗 ─────────────────────────────────────────── */}
      <Modal
        title="添加审批人"
        open={addModalOpen}
        onCancel={() => { setAddModalOpen(false); addForm.resetFields(); setLookedUpNickname(''); }}
        onOk={handleAdd}
        width={420}
      >
        <Form form={addForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="appAccount"
            label="APP账号名"
            rules={[{ required: true, message: '请输入APP账号名' }]}
            extra="输入账号后自动读取平台昵称"
          >
            <Input placeholder="例：alice_wang" onChange={(e) => handleAccountLookup(e.target.value)} />
          </Form.Item>
          {lookedUpNickname && (
            <div style={{ marginBottom: 16, padding: '8px 12px', background: '#fafafa', borderRadius: 6, fontSize: 13, color: '#595959' }}>
              昵称：{lookedUpNickname}
            </div>
          )}
        </Form>
      </Modal>

      {/* ── 编辑审批人弹窗 ─────────────────────────────────────────── */}
      <Modal
        title="编辑审批人"
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onOk={handleEditSave}
        width={420}
      >
        <Form form={editForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="appAccount"
            label="APP账号名"
            rules={[{ required: true, message: '请输入APP账号名' }]}
            extra="修改账号后自动读取平台昵称"
          >
            <Input onChange={(e) => handleAccountLookup(e.target.value)} />
          </Form.Item>
          {lookedUpNickname && (
            <div style={{ marginBottom: 16, padding: '8px 12px', background: '#fafafa', borderRadius: 6, fontSize: 13, color: '#595959' }}>
              昵称：{lookedUpNickname}
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default ApprovalPermissionsTab;
