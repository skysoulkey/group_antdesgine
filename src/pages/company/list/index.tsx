import { InfoCircleOutlined, PlusOutlined, SearchOutlined, SwapOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  ConfigProvider,
  DatePicker,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Row,
  Segmented,
  Select,
  Space,
  Switch,
  Table,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';
import { useNavigate } from 'umi';

const { Text } = Typography;

// PEA 汇率模拟（mock）
const PEA_RATE = 6.8;

interface Company {
  id: number;
  companyId: string;
  name: string;
  createdAt: string;
  memberCount: number;
  certEnterprises: number;
  totalAssets: number;
  enterpriseAssets: number;
  taxRevenue: number;
  shareRevenue: number;
  gameRevenue: number;
  commissionRevenue: number;
  groupAllocated: number;
  groupRecalled: number;
}

const mockData: Company[] = Array.from({ length: 11 }, (_, i) => ({
  id: i + 1,
  companyId: String(283982 + i),
  name: ['UU Talk', 'Hey Talk', '炸雷第一波', 'Cyber Bot', 'Star Tech', 'Gold Link', 'Blue Sky', 'Red Star', 'Green Tech', 'Purple Wave', 'Orange Net'][i],
  createdAt: '2025-10-10 12:23:23',
  memberCount: [543, 23, 11, 300, 32, 128, 67, 45, 89, 12, 203][i],
  certEnterprises: [543, 23, 11, 0, 32, 128, 67, 45, 89, 12, 203][i],
  totalAssets: 873233.23 - i * 28000,
  enterpriseAssets: 560000 + i * 12000,
  taxRevenue: 12300 + i * 1500,
  shareRevenue: 45000 + i * 3200,
  gameRevenue: 88000 - i * 4000,
  commissionRevenue: 23000 + i * 800,
  groupAllocated: 873233.23 - i * 20000,
  groupRecalled: 200000 + i * 5000,
}));

// 当前登录集团名称（mock）
const CURRENT_GROUP = 'UU Talk 集团';

// 密码复杂度校验
function validatePassword(_: unknown, value: string): Promise<void> {
  if (!value) return Promise.reject(new Error('请输入密码'));
  if (value.length < 8 || value.length > 30) return Promise.reject(new Error('密码长度为 8-30 位'));
  const types = [/[A-Z]/, /[a-z]/, /[0-9]/, /[!@#$%^&*_\-]/];
  const count = types.filter((r) => r.test(value)).length;
  if (count < 3)
    return Promise.reject(
      new Error('需包含大写字母、小写字母、数字、特殊字符（!@#$%^&*_-）中的至少 3 种'),
    );
  return Promise.resolve();
}

// 金额格式化
const fmt = (v: number, currency: string) => {
  const val = currency === 'PEA' ? v * PEA_RATE : v;
  return val.toLocaleString('en', { minimumFractionDigits: 2 });
};

// 表头带注释图标
const ColTitle = ({ label, tip }: { label: string; tip?: string }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginRight: 8 }}>
    {label}
    {tip && (
      <Tooltip title={tip}>
        <InfoCircleOutlined style={{ fontSize: 12, color: 'rgba(0,0,0,0.35)', cursor: 'help' }} />
      </Tooltip>
    )}
  </span>
);

const CompanyListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState('');
  const [currency, setCurrency] = useState('USDT');
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm] = Form.useForm();
  const [newCompanyId, setNewCompanyId] = useState('');

  const openCreateModal = () => {
    createForm.resetFields();
    setNewCompanyId(String(Math.floor(100000 + Math.random() * 900000)));
    setCreateOpen(true);
  };

  const handleCreateSubmit = async () => {
    try {
      await createForm.validateFields();
      const values = createForm.getFieldsValue();
      const newCompany: Company = {
        id: mockData.length + 1,
        companyId: newCompanyId,
        name: values.companyName,
        createdAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
        memberCount: 0,
        certEnterprises: 0,
        totalAssets: 0,
        enterpriseAssets: 0,
        taxRevenue: 0,
        shareRevenue: 0,
        gameRevenue: 0,
        commissionRevenue: 0,
        groupAllocated: 0,
        groupRecalled: 0,
      };
      mockData.push(newCompany);
      message.success('公司创建成功，管理员账号已生成');
      setCreateOpen(false);
      createForm.resetFields();
    } catch {
      // validation errors handled by form
    }
  };

  const filtered = mockData.filter(
    (d) => !searchVal || d.name.includes(searchVal) || d.companyId.includes(searchVal),
  );

  const cur = currency;

  const columns: ColumnsType<Company> = [
    { title: '创建时间', dataIndex: 'createdAt', width: 170 },
    { title: '公司ID', dataIndex: 'companyId', width: 100 },
    { title: '公司名称', dataIndex: 'name', width: 130 },
    { title: '成员总数', dataIndex: 'memberCount', align: 'right', width: 90 },
    {
      title: <ColTitle label="认证企业" tip="已认证企业数量" />,
      dataIndex: 'certEnterprises',
      align: 'right',
      width: 110,
    },
    {
      title: '公司总资产',
      dataIndex: 'totalAssets',
      align: 'right',
      width: 140,
      defaultSortOrder: 'descend',
      sorter: (a, b) => a.totalAssets - b.totalAssets,
      render: (v: number) => (
        <Text style={{ color: '#141414' }}>{fmt(v, cur)}</Text>
      ),
    },
    {
      title: '企业总资产',
      dataIndex: 'enterpriseAssets',
      align: 'right',
      width: 140,
      sorter: (a, b) => a.enterpriseAssets - b.enterpriseAssets,
      render: (v: number) => fmt(v, cur),
    },
    {
      title: <ColTitle label="税费收益" tip="入股企业的股东释放股份、股东获取分红时，缴纳的税费" />,
      dataIndex: 'taxRevenue',
      align: 'right',
      width: 120,
      sorter: (a, b) => a.taxRevenue - b.taxRevenue,
      render: (v: number) => fmt(v, cur),
    },
    {
      title: <ColTitle label="股份收益" tip="入股企业的公司，股份的分红收益+释放股份的收益" />,
      dataIndex: 'shareRevenue',
      align: 'right',
      width: 120,
      sorter: (a, b) => a.shareRevenue - b.shareRevenue,
      render: (v: number) => fmt(v, cur),
    },
    {
      title: <ColTitle label="游戏收益" tip="公司接受企业转单时，游戏的盈亏总额" />,
      dataIndex: 'gameRevenue',
      align: 'right',
      width: 120,
      sorter: (a, b) => a.gameRevenue - b.gameRevenue,
      render: (v: number) => fmt(v, cur),
    },
    {
      title: <ColTitle label="佣金收益" tip="游戏的所有佣金收益汇总" />,
      dataIndex: 'commissionRevenue',
      align: 'right',
      width: 120,
      sorter: (a, b) => a.commissionRevenue - b.commissionRevenue,
      render: (v: number) => fmt(v, cur),
    },
    {
      title: <ColTitle label="集团资金下拨" tip="集团向该公司下拨的资金总额" />,
      dataIndex: 'groupAllocated',
      align: 'right',
      width: 140,
      sorter: (a, b) => a.groupAllocated - b.groupAllocated,
      render: (v: number) => fmt(v, cur),
    },
    {
      title: <ColTitle label="集团资金调回" tip="集团从该公司调回的资金总额" />,
      dataIndex: 'groupRecalled',
      align: 'right',
      width: 140,
      sorter: (a, b) => a.groupRecalled - b.groupRecalled,
      render: (v: number) => fmt(v, cur),
    },
    {
      title: '操作',
      width: 120,
      fixed: 'right',
      render: (_, r) => (
        <Space>
          <Button type="link" size="small" onClick={() => navigate(`/company/detail/${r.companyId}`)}>
            详情
          </Button>
          <Button
            type="link"
            size="small"
            icon={<SwapOutlined />}
            onClick={() => navigate(`/company/transfer?companyId=${r.companyId}&companyName=${encodeURIComponent(r.name)}`)}
          >
            划转
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)' }}>
      <Row gutter={16} style={{ marginBottom: 16 }} align="middle">
        <Col>
          <ConfigProvider theme={{ components: { Segmented: {
            trackBg: '#e6f4ff',
            itemSelectedBg: '#1677ff',
            itemSelectedColor: '#ffffff',
            itemColor: '#1677ff',
          } } }}>
            <Segmented
              options={['USDT', 'PEA']}
              value={currency}
              onChange={(v) => setCurrency(v as string)}
              style={{ fontWeight: 600 }}
            />
          </ConfigProvider>
        </Col>
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
            style={{ background: '#1677ff', borderColor: '#1677ff' }}
            onClick={openCreateModal}
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
        scroll={{ x: 1600 }}
        pagination={{
          total: filtered.length,
          pageSize: 10,
          showTotal: (total) => `总共 ${total} 个项目`,
          showSizeChanger: true,
        }}
        size="middle"
        rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
      />

      <Modal
        title="创建公司"
        open={createOpen}
        onOk={handleCreateSubmit}
        onCancel={() => { setCreateOpen(false); createForm.resetFields(); }}
        okText="确认创建"
        cancelText="取 消"
        width={560}
        destroyOnClose
      >
        <Form form={createForm} layout="vertical" style={{ marginTop: 16 }}>

          {/* ── 公司信息 ── */}
          <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 12 }}>公司信息</Text>

          <Form.Item label="公司名称" name="companyName" rules={[{ required: true, message: '请输入公司名称' }]}>
            <Input placeholder="请输入公司名称" />
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="公司 ID">
                <Input value={newCompanyId} disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="所属集团">
                <Input value={CURRENT_GROUP} disabled />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '12px 0' }} />

          {/* ── 管理员账号 ── */}
          <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 12 }}>管理员账号</Text>

          <Form.Item label="用户名" name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            label="登录密码"
            name="password"
            rules={[{ required: true, validator: validatePassword }]}
          >
            <Input.Password placeholder="8-30 位，需包含大/小写字母、数字、特殊字符中至少 3 种" />
          </Form.Item>

          <Form.Item
            label="再次输入密码"
            name="confirmPwd"
            rules={[
              { required: true, message: '请再次输入密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) return Promise.resolve();
                  return Promise.reject(new Error('两次密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="请再次输入密码" />
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="手机号" name="phone">
                <Input placeholder="+65 8000 0000" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="邮箱" name="email">
                <Input placeholder="admin@example.com" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="消息通知账号"
            name="notifyAccounts"
          >
            <Input placeholder="请输入 APP 用户名，如 @miya_miya" />
          </Form.Item>

          <Divider style={{ margin: '12px 0' }} />

          {/* ── 账号配置 ── */}
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="账户有效期" name="validPeriod" initialValue="永久有效">
                <Select
                  options={[
                    { value: '永久有效', label: '永久有效' },
                    { value: '自定义', label: '自定义' },
                  ]}
                  onChange={(v) => { if (v !== '自定义') createForm.setFieldValue('expireDate', undefined); }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item noStyle shouldUpdate={(p, c) => p.validPeriod !== c.validPeriod}>
                {({ getFieldValue }) =>
                  getFieldValue('validPeriod') === '自定义' ? (
                    <Form.Item label="到期时间" name="expireDate" rules={[{ required: true }]}>
                      <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                  ) : (
                    <Form.Item label=" "><span /></Form.Item>
                  )
                }
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="IP 限制" name="ipRestrict" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(p, c) => p.ipRestrict !== c.ipRestrict}>
            {({ getFieldValue }) =>
              getFieldValue('ipRestrict') ? (
                <Form.Item label="IP 白名单" name="ipWhitelist" rules={[{ required: true }]}>
                  <Input.TextArea rows={2} placeholder="每行一个 IP 或 CIDR，如 104.28.0.0/16" />
                </Form.Item>
              ) : null
            }
          </Form.Item>


        </Form>
      </Modal>

    </Card>
  );
};

export default CompanyListPage;
