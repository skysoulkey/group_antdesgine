import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, ConfigProvider, DatePicker, Descriptions, Form, Input, Modal, Radio, Space, Table, Tag, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState, useRef, useCallback } from 'react';
import TableToolbar from '../../../components/TableToolbar';

const { Text } = Typography;

const CARD_SHADOW = '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)';
const CARD_RADIUS = 12;

const radioTheme = {
  components: {
    Radio: {
      buttonSolidCheckedBg: '#1677ff',
      buttonSolidCheckedHoverBg: '#4096ff',
      buttonSolidCheckedActiveBg: '#0958d9',
      buttonSolidCheckedColor: '#fff',
      colorPrimary: '#1677ff',
    },
  },
};

interface InviteRecord {
  id: string;
  inviteTime: string;
  authCode: string;
  codeExpiry: string;
  inviteStatus: '已接受' | '未接受';
  codeStatus: '有效' | '无效';
  invitedCount: number;
  // 详情字段（仅已接受时有值）
  enterpriseId?: string;
  enterpriseName?: string;
  ownerId?: string;
  ownerUsername?: string;
  acceptedTime?: string;
}

const MOCK_ENTERPRISE_NAMES = ['StarTech', 'GoldLink', 'CyberBot', 'UUtalk', 'hey', 'NovaPay', 'SkyNet', 'BlueWave', 'FinCore', 'TopCloud'];
const MOCK_OWNER_NAMES = ['alice', 'bob', 'charlie', 'david', 'eva', 'frank', 'grace', 'henry', 'ivy', 'jack'];

const mockData: InviteRecord[] = Array.from({ length: 18 }, (_, i) => {
  const accepted = i % 3 !== 0;
  return {
    id: `INV${String(i + 1).padStart(7, '0')}`,
    inviteTime: `2025-1${(i % 2) + 0}-${String(i + 1).padStart(2, '0')} 12:23:23`,
    authCode: String(82894 + i * 137),
    codeExpiry: i % 5 === 0 ? '永久有效' : `2025-${String(5 + (i % 7)).padStart(2, '0')}-${String(i + 1).padStart(2, '0')} 14:23:13`,
    inviteStatus: accepted ? '已接受' : '未接受',
    codeStatus: i % 4 === 3 ? '无效' : '有效',
    invitedCount: accepted ? 1 + (i % 3) : 0,
    // 详情字段
    enterpriseId: accepted ? `ENT${String(283980 + i)}` : undefined,
    enterpriseName: accepted ? MOCK_ENTERPRISE_NAMES[i % MOCK_ENTERPRISE_NAMES.length] : undefined,
    ownerId: accepted ? `UID${String(10000 + i)}` : undefined,
    ownerUsername: accepted ? MOCK_OWNER_NAMES[i % MOCK_OWNER_NAMES.length] : undefined,
    acceptedTime: accepted ? `2025-1${(i % 2) + 0}-${String(i + 2).padStart(2, '0')} 09:15:${String(30 + i).padStart(2, '0')}` : undefined,
  };
});

// 生成随机邀请码
function generateCode(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}


const EnterpriseInvitePage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRefresh = useCallback(() => { message.success('已刷新'); }, []);
  const [data, setData] = useState(mockData);
  const [inviteStatus, setInviteStatus] = useState<string | undefined>();
  const [searchCode, setSearchCode] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [expiryType, setExpiryType] = useState<'permanent' | 'custom'>('custom');
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState<InviteRecord | null>(null);
  const [form] = Form.useForm();

  const filtered = data.filter((r) => {
    const kw = searchCode.trim();
    return (
      (!kw || r.authCode.includes(kw)) &&
      (!inviteStatus || r.inviteStatus === inviteStatus)
    );
  });


  const openModal = () => {
    const code = generateCode();
    setGeneratedCode(code);
    form.resetFields();
    form.setFieldsValue({ authCode: code });
    setExpiryType('custom');
    setModalOpen(true);
  };

  const handleGenerate = () => {
    form.validateFields().then((values) => {
      const expiry = expiryType === 'permanent'
        ? '永久有效'
        : values.codeExpiry
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

  const handleCopy = () => {
    const code = form.getFieldValue('authCode') || generatedCode;
    const expiryStr = expiryType === 'permanent'
      ? '永久有效'
      : form.getFieldValue('codeExpiry')
        ? form.getFieldValue('codeExpiry').format('YYYY-MM-DD HH:mm:ss')
        : '未设置';
    const text = `企业邀请码：${code}\n有效期：${expiryStr}`;
    navigator.clipboard.writeText(text).then(() => {
      message.success('已复制到剪贴板');
    });
  };

  const columns: ColumnsType<InviteRecord> = [
    { title: '创建时间', dataIndex: 'inviteTime', width: 170 },
    {
      title: '企业认证码', dataIndex: 'authCode', width: 130,
      render: (v) => <Text style={{ fontFamily: 'monospace', color: '#141414' }}>{v}</Text>,
    },
    { title: '认证码有效期', dataIndex: 'codeExpiry', width: 170 },
    {
      title: '认证码状态', dataIndex: 'codeStatus', width: 100,
      render: (v) => <Tag color={v === '有效' ? 'blue' : 'default'}>{v}</Tag>,
    },
    { title: '邀请企业数', dataIndex: 'invitedCount', width: 90, align: 'right' },
    {
      title: '操作', width: 80, align: 'center',
      render: (_, record) => (
        <Button type="link" size="small" style={{ padding: 0 }}
          onClick={() => { setDetailRecord(record); setDetailOpen(true); }}>
          详情
        </Button>
      ),
    },
  ];

  return (
    <div>
      {/* 筛选 + 表格 */}
      <div ref={containerRef}>
      <Card bordered={false} style={{ borderRadius: CARD_RADIUS, boxShadow: CARD_SHADOW }}>
        <Space size={16} wrap align="center" style={{ marginBottom: 16 }}>
          <ConfigProvider theme={radioTheme}>
            <Radio.Group
              buttonStyle="solid"
              value={inviteStatus ?? '全部'}
              onChange={(e) => setInviteStatus(e.target.value === '全部' ? undefined : e.target.value)}
            >
              <Radio.Button value="全部">全部</Radio.Button>
              <Radio.Button value="已接受">已接受</Radio.Button>
              <Radio.Button value="未接受">未接受</Radio.Button>
            </Radio.Group>
          </ConfigProvider>
          <Input
            suffix={<SearchOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
            placeholder="请输入企业认证码"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            allowClear
            style={{ width: 220 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={openModal}>
            生成邀请码
          </Button>
        </Space>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 14, fontWeight: 600 }}>邀请记录</Text>
          <TableToolbar onRefresh={handleRefresh} containerRef={containerRef} />
        </div>
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          size="middle"
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
          rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
        />
      </Card>
      </div>

      {/* 详情弹窗 */}
      <Modal
        title="邀请详情"
        open={detailOpen}
        onCancel={() => { setDetailOpen(false); setDetailRecord(null); }}
        footer={<Button onClick={() => { setDetailOpen(false); setDetailRecord(null); }}>关闭</Button>}
        width={480}
      >
        {detailRecord && (
          <Descriptions column={1} bordered size="small" style={{ marginTop: 16 }}
            labelStyle={{ width: 130, color: 'rgba(0,0,0,0.65)' }}>
            <Descriptions.Item label="企业 ID">{detailRecord.enterpriseId ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="企业名称">{detailRecord.enterpriseName ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="企业主 ID">{detailRecord.ownerId ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="企业主用户名">{detailRecord.ownerUsername ?? '—'}</Descriptions.Item>
            <Descriptions.Item label="邀请成功时间">{detailRecord.acceptedTime ?? '—'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* 生成邀请码弹窗 */}
      <Modal
        title="生成邀请码"
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        width={440}
        footer={[
          <Button key="cancel" onClick={() => { setModalOpen(false); form.resetFields(); }}>取消</Button>,
          <Button key="ok" type="primary" onClick={() => { handleCopy(); handleGenerate(); }}>生成并复制</Button>,
        ]}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            label="企业认证码"
            name="authCode"
            rules={[{ required: true, message: '请输入企业认证码' }]}
          >
            <Input
              placeholder="自动生成的邀请码"
              readOnly
              addonAfter={
                <Button type="link" size="small" style={{ padding: 0, height: 'auto' }}
                  onClick={() => { const c = generateCode(); setGeneratedCode(c); form.setFieldsValue({ authCode: c }); }}>
                  重新生成
                </Button>
              }
            />
          </Form.Item>
          <Form.Item label="有效期设置">
            <Radio.Group value={expiryType} onChange={(e) => { setExpiryType(e.target.value); form.setFieldsValue({ codeExpiry: undefined }); }}>
              <Radio value="permanent">永久有效</Radio>
              <Radio value="custom">自定义时间</Radio>
            </Radio.Group>
          </Form.Item>
          {expiryType === 'custom' && (
            <Form.Item
              label="认证码有效期至"
              name="codeExpiry"
              rules={[{ required: true, message: '请选择有效期' }]}
            >
              <DatePicker
                showTime
                style={{ width: '100%' }}
                placeholder="请选择有效期截止时间"
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default EnterpriseInvitePage;
