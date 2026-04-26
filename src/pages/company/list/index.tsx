import { CopyOutlined, InfoCircleOutlined, PlusOutlined, ReloadOutlined, SearchOutlined, SwapOutlined } from '@ant-design/icons';
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
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'umi';
import TableToolbar from '../../../components/TableToolbar';
import FilterField from '../../../components/FilterField';
import { ROLE_ROUTES } from '../../../utils/auth';

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

// 随机生成符合要求的密码
function generatePassword(length = 16): string {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const special = '!@#$%^&*_-';
  const all = upper + lower + digits + special;
  // 保证至少包含 3 种字符类型
  const required = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
    special[Math.floor(Math.random() * special.length)],
  ];
  const rest = Array.from({ length: length - required.length }, () =>
    all[Math.floor(Math.random() * all.length)]
  );
  // 打乱顺序
  return [...required, ...rest].sort(() => Math.random() - 0.5).join('');
}

// 公司主的模块权限展示
const OWNER_MODULES = ROLE_ROUTES.company_owner.map((route) => {
  const labels: Record<string, string> = {
    '/dashboard/company': '公司仪表盘', '/company/shareholding': '公司持股',
    '/company/revenue': '公司收益', '/enterprise/list': '企业清单',
    '/enterprise/invite': '邀请企业', '/enterprise/detail': '企业详情',
    '/orders/lottery': '东方彩票订单', '/commission': '佣金订单',
    '/finance/my-wallet': '公司钱包', '/system/notifications': '通知管理',
    '/system/users': '用户管理', '/system/logs': '系统日志',
  };
  return labels[route] ?? route;
});

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
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRefresh = useCallback(() => { message.success('已刷新'); }, []);
  const [searchVal, setSearchVal] = useState('');
  const [currency, setCurrency] = useState('USDT');
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm] = Form.useForm();
  const [newCompanyId, setNewCompanyId] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [createdInfo, setCreatedInfo] = useState<{
    companyName: string; companyId: string; username: string; password: string;
  } | null>(null);

  const openCreateModal = () => {
    createForm.resetFields();
    setNewCompanyId(String(Math.floor(100000 + Math.random() * 900000)));
    setShowPwd(false);
    setCreateOpen(true);
  };

  const handleGeneratePassword = () => {
    const pwd = generatePassword();
    createForm.setFieldsValue({ password: pwd, confirmPwd: pwd });
    setShowPwd(true);
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
      // 关闭创建弹窗，弹出二次确认弹窗
      setCreatedInfo({
        companyName: values.companyName,
        companyId: newCompanyId,
        username: values.username,
        password: values.password,
      });
      setCreateOpen(false);
      createForm.resetFields();
      setSuccessOpen(true);
    } catch {
      // validation errors handled by form
    }
  };

  const copyCreatedInfo = () => {
    if (!createdInfo) return;
    const text = [
      `登录地址：${window.location.origin}`,
      `公司名称：${createdInfo.companyName}`,
      `公司 ID：${createdInfo.companyId}`,
      `角色：公司主`,
      `用户名：${createdInfo.username}`,
      `密码：${createdInfo.password}`,
    ].join('\n');
    navigator.clipboard.writeText(text).then(() => message.success('已复制到剪贴板'));
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
    <div ref={containerRef}>
    <Space direction="vertical" size={12} style={{ display: 'flex' }}>
      {/* 筛选卡片 */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)' }}>
        <Space size={16} wrap align="center">
          <FilterField label="货币单位">
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
          </FilterField>
          <FilterField label="公司">
            <Input
              prefix={<SearchOutlined />}
              placeholder="请输入公司名称或公司ID"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              allowClear
              style={{ maxWidth: 360 }}
            />
          </FilterField>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ background: '#1677ff', borderColor: '#1677ff' }}
            onClick={openCreateModal}
          >
            创建公司
          </Button>
        </Space>
      </Card>

      {/* 表格卡片 */}
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)' }}>
        <div style={{ marginBottom: 8 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            数据更新于 2025-11-02 12:33:02 &nbsp;|&nbsp; 总共 {filtered.length} 个项目
          </Text>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 14, fontWeight: 600 }}>公司清单</Text>
          <TableToolbar onRefresh={handleRefresh} containerRef={containerRef} />
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

          {/* ── 公司主账号 ── */}
          <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 4 }}>公司主账号</Text>
          <div style={{ background: '#f6f8ff', border: '1px solid #d6e4ff', borderRadius: 6, padding: '8px 12px', marginBottom: 16 }}>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
              角色：<Text strong style={{ fontSize: 12 }}>公司主</Text> — 拥有以下功能模块权限：
            </Text>
            <Space size={[4, 4]} wrap>
              {OWNER_MODULES.map(m => <Tag key={m} style={{ margin: 0 }}>{m}</Tag>)}
            </Space>
          </div>

          <Form.Item label="用户名" name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(p, c) => p.password !== c.password}>
            {({ getFieldValue }) => (
              <Form.Item
                label="登录密码"
                name="password"
                rules={[{ required: true, validator: validatePassword }]}
                extra={<Text type="secondary" style={{ fontSize: 11 }}>8-30 位，需包含大/小写字母、数字、特殊字符中至少 3 种</Text>}
              >
                <Space.Compact style={{ width: '100%' }}>
                  {showPwd ? (
                    <Input
                      value={getFieldValue('password')}
                      onChange={(e) => {
                        createForm.setFieldsValue({ password: e.target.value });
                        setShowPwd(false);
                      }}
                      style={{ flex: 1 }}
                    />
                  ) : (
                    <Input.Password placeholder="请输入密码" style={{ flex: 1 }} />
                  )}
                  <Button icon={<ReloadOutlined />} onClick={handleGeneratePassword}>
                    随机生成
                  </Button>
                </Space.Compact>
              </Form.Item>
            )}
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(p, c) => p.confirmPwd !== c.confirmPwd}>
            {({ getFieldValue }) => (
              <Form.Item
                label="再次输入密码"
                name="confirmPwd"
                rules={[
                  { required: true, message: '请再次输入密码' },
                  () => ({
                    validator(_, value) {
                      if (!value || createForm.getFieldValue('password') === value) return Promise.resolve();
                      return Promise.reject(new Error('两次密码不一致'));
                    },
                  }),
                ]}
              >
                {showPwd ? (
                  <Input value={getFieldValue('confirmPwd')} disabled />
                ) : (
                  <Input.Password placeholder="请再次输入密码" />
                )}
              </Form.Item>
            )}
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

      {/* ── 创建成功 — 二次确认弹窗 ── */}
      <Modal
        title="创建成功"
        open={successOpen}
        onCancel={() => setSuccessOpen(false)}
        footer={
          <Space>
            <Button icon={<CopyOutlined />} type="primary" onClick={copyCreatedInfo}>复制信息</Button>
            <Button onClick={() => setSuccessOpen(false)}>关 闭</Button>
          </Space>
        }
        width={520}
      >
        {createdInfo && (
          <div style={{ marginTop: 16 }}>
            <div style={{
              padding: 16, background: '#f6f8ff', border: '1px solid #d6e4ff',
              borderRadius: 8, fontFamily: 'monospace', lineHeight: 2.2, fontSize: 13,
            }}>
              <div>登录地址：{window.location.origin}</div>
              <div>公司名称：{createdInfo.companyName}</div>
              <div>公司 ID：{createdInfo.companyId}</div>
              <Divider style={{ margin: '8px 0' }} />
              <div>角色：公司主</div>
              <div>用户名：{createdInfo.username}</div>
              <div>密码：{createdInfo.password}</div>
            </div>

            <div style={{ background: '#f6f8ff', border: '1px solid #d6e4ff', borderRadius: 6, padding: '8px 12px', marginTop: 12 }}>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>公司主拥有的功能模块：</Text>
              <Space size={[4, 4]} wrap>
                {OWNER_MODULES.map(m => <Tag key={m} style={{ margin: 0 }}>{m}</Tag>)}
              </Space>
            </div>
          </div>
        )}
      </Modal>

      </Card>
    </Space>
    </div>
  );
};

export default CompanyListPage;
