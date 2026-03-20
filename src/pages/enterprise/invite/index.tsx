import { KeyOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Col, DatePicker, Form, Input, Modal, Row, Select, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { message } from 'antd';
import React, { useState } from 'react';

const { Text } = Typography;

const CARD_SHADOW = '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)';

interface InviteRecord {
  id: string;
  inviteTime: string;
  authCode: string;
  codeExpiry: string;
  inviteStatus: '已接受' | '未接受';
  codeStatus: '有效' | '无效';
  invitedCount: number;
}

const mockData: InviteRecord[] = Array.from({ length: 18 }, (_, i) => ({
  id: `INV${String(i + 1).padStart(7, '0')}`,
  inviteTime: `2025-1${(i % 2) + 0}-${String(i + 1).padStart(2, '0')} 12:23:23`,
  authCode: String(82894 + i * 137),
  codeExpiry: `2025-${String(5 + (i % 7)).padStart(2, '0')}-${String(i + 1).padStart(2, '0')} 14:23:13`,
  inviteStatus: i % 3 === 0 ? '未接受' : '已接受',
  codeStatus: i % 4 === 3 ? '无效' : '有效',
  invitedCount: i % 3 === 0 ? 0 : 1 + (i % 3),
}));

const EnterpriseInvitePage: React.FC = () => {
  const [data, setData] = useState(mockData);
  const [inviteStatus, setInviteStatus] = useState<string | undefined>();
  const [searchCode, setSearchCode] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const filtered = data.filter((r) => {
    const kw = searchCode.trim();
    return (
      (!kw || r.authCode.includes(kw)) &&
      (!inviteStatus || r.inviteStatus === inviteStatus)
    );
  });

  const acceptedCount = data.filter((r) => r.inviteStatus === '已接受').length;
  const pendingCount = data.filter((r) => r.inviteStatus === '未接受').length;

  const handleGenerate = () => {
    form.validateFields().then((values) => {
      const expiry = values.codeExpiry
        ? values.codeExpiry.format('YYYY-MM-DD HH:mm:ss')
        : new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 19).replace('T', ' ');

      const newRecord: InviteRecord = {
        id: `INV${String(Date.now()).slice(-7)}`,
        inviteTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
        authCode: values.authCode,
        codeExpiry: expiry,
        inviteStatus: '未接受',
        codeStatus: '有效',
        invitedCount: 0,
      };
      setData([newRecord, ...data]);
      setModalOpen(false);
      form.resetFields();
      message.success('邀请码已生成');
    });
  };

  const columns: ColumnsType<InviteRecord> = [
    { title: '邀请时间', dataIndex: 'inviteTime', width: 170 },
    {
      title: '企业认证码', dataIndex: 'authCode', width: 130,
      render: (v) => <Text style={{ fontFamily: 'monospace', color: '#722ed1' }}>{v}</Text>,
    },
    { title: '认证码有效期', dataIndex: 'codeExpiry', width: 170 },
    {
      title: '邀请状态', dataIndex: 'inviteStatus', width: 100,
      render: (v) => <Tag color={v === '已接受' ? 'success' : 'processing'}>{v}</Tag>,
    },
    {
      title: '认证码状态', dataIndex: 'codeStatus', width: 100,
      render: (v) => <Tag color={v === '有效' ? 'blue' : 'default'}>{v}</Tag>,
    },
    { title: '邀请企业数', dataIndex: 'invitedCount', width: 90, align: 'right' },
  ];

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#722ed118', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <KeyOutlined style={{ fontSize: 20, color: '#722ed1' }} />
              </div>
              <Text style={{ fontSize: 13, color: 'rgba(0,0,0,0.55)' }}>邀请记录</Text>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#141414' }}>{data.length}</div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#52c41a18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <KeyOutlined style={{ fontSize: 20, color: '#52c41a' }} />
              </div>
              <Text style={{ fontSize: 13, color: 'rgba(0,0,0,0.55)' }}>已接受邀请</Text>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#52c41a' }}>{acceptedCount}</div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fa8c1618', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <KeyOutlined style={{ fontSize: 20, color: '#fa8c16' }} />
              </div>
              <Text style={{ fontSize: 13, color: 'rgba(0,0,0,0.55)' }}>未接受邀请</Text>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#fa8c16' }}>{pendingCount}</div>
          </Card>
        </Col>
      </Row>

      {/* 筛选 + 表格 */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <Space wrap>
            <Input
              placeholder="请输入企业认证码"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              allowClear
              style={{ width: 200 }}
            />
            <Select
              placeholder="邀请状态"
              value={inviteStatus}
              onChange={setInviteStatus}
              allowClear
              style={{ width: 130 }}
              options={[
                { value: '已接受', label: `已接受 (${acceptedCount})` },
                { value: '未接受', label: `未接受 (${pendingCount})` },
              ]}
            />
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            生成邀请码
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          size="middle"
          pagination={{ pageSize: 10, showTotal: (t) => `总共 ${t} 个项目` }}
          rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
        />
      </Card>

      {/* 生成邀请码弹窗 */}
      <Modal
        title="生成邀请码"
        open={modalOpen}
        onOk={handleGenerate}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        width={440}
        okText="确 定"
        cancelText="取 消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            label="企业认证码"
            name="authCode"
            rules={[{ required: true, message: '请输入企业认证码' }]}
          >
            <Input placeholder="请输入企业认证码" maxLength={20} />
          </Form.Item>
          <Form.Item
            label="认证码有效期至"
            name="codeExpiry"
            rules={[{ required: true, message: '请选择有效期' }]}
            extra="默认7天有效期"
          >
            <DatePicker
              showTime
              style={{ width: '100%' }}
              placeholder="请选择有效期截止时间"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EnterpriseInvitePage;
