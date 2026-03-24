import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckCircleFilled,
  FullscreenOutlined,
  ReloadOutlined,
  SearchOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  ConfigProvider,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Select,
  Space,
  Steps,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';
import { useLocation } from 'umi';

const { Text } = Typography;

// ── 类型 ──────────────────────────────────────────────────────────
interface TransferRecord {
  id: string;
  type: '集团下拨' | '集团调回';
  orderTime: string;
  orderId: string;
  companyId: string;
  companyName: string;
  currency: string;
  amount: number;
  remark: string;
  operator: string;
  afterBalance: number;
}

// ── Mock 数据 ─────────────────────────────────────────────────────
const companies = ['滴滴答答', 'UU Talk', 'Star Tech', 'Cyber Bot', 'Nova Corp'];

const allData: TransferRecord[] = Array.from({ length: 20 }, (_, i) => ({
  id: `TR${String(i + 1).padStart(7, '0')}`,
  type: i % 2 === 0 ? '集团下拨' : '集团调回',
  orderTime: `2025-10-${String((i % 28) + 1).padStart(2, '0')} 12:23:23`,
  orderId: String(73720 + i),
  companyId: String(287402 + (i % 5)),
  companyName: companies[i % 5],
  currency: i % 3 === 0 ? 'PEA' : 'USDT',
  amount: i % 2 === 0 ? 873233.23 : 73233.23,
  remark: '我是一个备注内容',
  operator: companies[i % 5],
  afterBalance: i % 2 === 0 ? 873233.23 : 73233.23,
}));

const fmt = (v: number) => v.toLocaleString('en', { minimumFractionDigits: 2 });

// ── 三步弹窗（通用） ──────────────────────────────────────────────
interface WizardModalProps {
  mode: 'allocate' | 'recall';
  open: boolean;
  onClose: () => void;
}

const GROUP_BALANCES = { USDT: 5280000, PEA: 1200000 };
const COMPANY_BALANCES: Record<string, { USDT: number; PEA: number }> = {
  '滴滴答答': { USDT: 873233.23, PEA: 50000 },
  'UU Talk':   { USDT: 320000,    PEA: 18000 },
  'Star Tech': { USDT: 55000,     PEA: 3000  },
  'Cyber Bot': { USDT: 120000,    PEA: 8000  },
  'Nova Corp': { USDT: 98000,     PEA: 5500  },
};

// 账户余额面板
const BalancePanel: React.FC<{
  label: string;
  name?: string;
  selector?: React.ReactNode;
  balances: { USDT: number; PEA: number } | null;
  placeholder?: string;
  highlight?: boolean;
}> = ({ label, name, selector, balances, placeholder, highlight }) => (
  <div style={{
    flex: 1,
    background: highlight ? '#f9f0ff' : '#fafafa',
    border: `1px solid ${highlight ? '#d3adf7' : '#e8e8e8'}`,
    borderRadius: 8,
    padding: '12px 14px',
    minWidth: 0,
    boxSizing: 'border-box',
  }}>
    {label && <div style={{ fontSize: 11, color: '#8c8c8c', marginBottom: 6 }}>{label}</div>}
    {selector
      ? <div style={{ marginBottom: 8 }}>{selector}</div>
      : <div style={{ fontSize: 13, fontWeight: 600, color: '#141414', marginBottom: 8 }}>{name}</div>
    }
    {balances ? (
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
          <span style={{ color: '#8c8c8c' }}>USDT</span>
          <span style={{ fontWeight: 500 }}>{fmt(balances.USDT)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
          <span style={{ color: '#8c8c8c' }}>PEA</span>
          <span style={{ fontWeight: 500 }}>{fmt(balances.PEA)}</span>
        </div>
      </>
    ) : (
      <div style={{ fontSize: 12, color: '#bfbfbf' }}>{placeholder ?? '—'}</div>
    )}
  </div>
);

const WizardModal: React.FC<WizardModalProps> = ({ mode, open, onClose }) => {
  const [step, setStep] = useState(0);
  const [form] = Form.useForm();
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const isAllocate = mode === 'allocate';

  // 自动刷新公司余额（requirement 2）
  const selectedCompany = Form.useWatch('company', form);
  const companyBal = COMPANY_BALANCES[selectedCompany] ?? null;

  const title = isAllocate ? '集团下拨' : '集团调回';
  const steps = [
    { title: `填写${isAllocate ? '下拨' : '调回'}信息` },
    { title: `确认${isAllocate ? '下拨' : '调回'}信息` },
    { title: `完成${isAllocate ? '下拨' : '调回'}` },
  ];

  const handleClose = () => {
    setStep(0);
    form.resetFields();
    setFormValues({});
    onClose();
  };

  const handleNext = () => {
    form.validateFields().then((values) => {
      setFormValues(values);
      setStep(1);
    });
  };

  const handleConfirm = () => {
    form.validateFields(['mfa']).then((mfaVals) => {
      setFormValues((prev) => ({ ...prev, ...mfaVals }));
      setStep(2);
    });
  };

  // 弹窗底部按钮
  const footer = (() => {
    if (step === 0) return [
      <Button key="cancel" onClick={handleClose}>
        {isAllocate ? '取消下拨' : '取消调回'}
      </Button>,
      <Button key="next" type="primary" onClick={handleNext}>下一步</Button>,
    ];
    if (step === 1) return [
      <Button key="back" onClick={() => setStep(0)}>上一步</Button>,
      <Button key="confirm" type="primary" onClick={handleConfirm}>立即转账</Button>,
    ];
    return [
      <Button key="detail" onClick={handleClose}>查看公司详情</Button>,
      <Button key="again" type="primary" onClick={() => { setStep(0); form.resetFields(); setFormValues({}); }}>
        再转一笔
      </Button>,
    ];
  })();

  // 划转后余额计算
  const amt = formValues.amount ?? 0;
  const cur = (formValues.currency ?? 'USDT') as 'USDT' | 'PEA';
  const savedCompanyBal = COMPANY_BALANCES[formValues.company] ?? null;

  return (
    <Modal
      title={title}
      open={open}
      onCancel={handleClose}
      footer={footer}
      width={580}
      destroyOnClose
    >
      <Steps items={steps} current={step} size="small" style={{ margin: '20px 0 28px' }} />

      {/* 第一步：填写信息 */}
      {step === 0 && (
        <Form form={form} layout="vertical">
          {/* 方向可视化 + 账户选择（公司 Select 嵌入右侧卡片）*/}
          <div style={{ display: 'flex', alignItems: 'stretch', gap: 10, marginBottom: 20 }}>
            <BalancePanel
              label=""
              name="集团余额账户"
              balances={GROUP_BALANCES}
              highlight={isAllocate}
            />
            <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              {isAllocate ? (
                <>
                  <ArrowRightOutlined style={{ fontSize: 18, color: '#722ed1' }} />
                  <ArrowRightOutlined style={{ fontSize: 18, color: '#722ed1', opacity: 0.4 }} />
                </>
              ) : (
                <>
                  <ArrowLeftOutlined style={{ fontSize: 18, color: '#fa8c16' }} />
                  <ArrowLeftOutlined style={{ fontSize: 18, color: '#fa8c16', opacity: 0.4 }} />
                </>
              )}
            </div>
            <BalancePanel
              label="公司余额账户"
              selector={
                <Form.Item
                  name="company"
                  rules={[{ required: true, message: `请选择${isAllocate ? '下拨' : '调回'}公司` }]}
                  style={{ margin: 0 }}
                >
                  <Select
                    placeholder={`请选择${isAllocate ? '下拨' : '调回'}公司`}
                    options={companies.map((c) => ({ value: c, label: c }))}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              }
              balances={companyBal}
              placeholder="选择公司后显示余额"
              highlight={!isAllocate}
            />
          </div>

          {/* 划转金额（requirement 3：货币文案展示全）*/}
          <Form.Item
            label="划转金额"
            name="amount"
            rules={[{ required: true, message: '请输入划转金额' }]}
          >
            <InputNumber
              min={0.01}
              precision={2}
              style={{ width: '100%' }}
              placeholder="请输入"
              addonAfter={
                <Form.Item name="currency" noStyle initialValue="USDT">
                  <Select
                    style={{ width: 100 }}
                    options={[
                      { value: 'USDT', label: 'USDT' },
                      { value: 'PEA',  label: 'PEA'  },
                    ]}
                  />
                </Form.Item>
              }
            />
          </Form.Item>

          <Form.Item label="划转备注" name="remark">
            <Input placeholder="请输入备注（选填）" />
          </Form.Item>

          {/* 说明文案（requirement 7）*/}
          <div style={{
            padding: '10px 12px',
            background: '#f6f6f6',
            borderRadius: 6,
            fontSize: 12,
            color: '#8c8c8c',
            lineHeight: '1.8',
          }}>
            <div>说明：</div>
            <div>1. 集团余额账户资金下拨公司余额账户</div>
            <div>2. 一次划转只允许划转一种货币</div>
          </div>
        </Form>
      )}

      {/* 第二步：确认信息 + MFA（requirement 5）*/}
      {step === 1 && (
        <>
          <Descriptions column={1} bordered size="small" style={{ marginBottom: 16 }}>
            <Descriptions.Item label={isAllocate ? '付款集团账户' : '调回公司账户'}>
              {isAllocate ? '集团余额账户' : formValues.company}
            </Descriptions.Item>
            <Descriptions.Item label={isAllocate ? '收款公司账户' : '收款集团账户'}>
              {isAllocate ? formValues.company : '集团余额账户'}
            </Descriptions.Item>
            <Descriptions.Item label="划转金额">
              <Text style={{ color: '#722ed1', fontWeight: 600 }}>
                {fmt(formValues.amount ?? 0)} {formValues.currency ?? 'USDT'}
              </Text>
            </Descriptions.Item>
            {formValues.remark && (
              <Descriptions.Item label="备注">{formValues.remark}</Descriptions.Item>
            )}
          </Descriptions>
          <div style={{
            marginBottom: 16, padding: '10px 12px',
            background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 6,
            fontSize: 13, color: '#8c6a00',
          }}>
            确认划转后，资金将直接{isAllocate ? '打入对方账户' : '调回本账户'}。
          </div>
          <Form form={form} layout="vertical">
            <Form.Item
              label="MFA 验证码"
              name="mfa"
              rules={[{ required: true, message: '请输入 MFA 验证码' }]}
            >
              <Input placeholder="请输入 6 位 MFA 验证码" maxLength={6} style={{ width: 200 }} />
            </Form.Item>
          </Form>
        </>
      )}

      {/* 第三步：完成（requirement 6：有备注才展示）*/}
      {step === 2 && (
        <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
          <CheckCircleFilled style={{ fontSize: 52, color: '#52c41a', marginBottom: 12 }} />
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>操作成功</div>
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="当前已到账">
              <Text style={{ color: '#52c41a', fontWeight: 600 }}>
                {fmt(amt)} {cur}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="当前公司账户余额">
              {savedCompanyBal
                ? fmt(isAllocate ? savedCompanyBal[cur] + amt : savedCompanyBal[cur] - amt)
                : '—'} {cur}
            </Descriptions.Item>
            <Descriptions.Item label="当前集团账户余额">
              {fmt(isAllocate
                ? GROUP_BALANCES[cur] - amt
                : GROUP_BALANCES[cur] + amt
              )} {cur}
            </Descriptions.Item>
            {formValues.remark && (
              <Descriptions.Item label="备注">{formValues.remark}</Descriptions.Item>
            )}
          </Descriptions>
        </div>
      )}
    </Modal>
  );
};

// ── 主页面 ────────────────────────────────────────────────────────
const radioTheme = {
  components: {
    Radio: {
      buttonCheckedBg: '#ffffff',
      buttonSolidCheckedBg: '#ffffff',
      buttonSolidCheckedColor: '#722ed1',
      buttonSolidCheckedHoverBg: '#ffffff',
      colorPrimary: '#722ed1',
      colorBorder: '#d9d9d9',
    },
  },
};

const TransferPage: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initCompany = params.get('companyName') ?? undefined;

  const [orderType, setOrderType] = useState('全部');
  const [currency, setCurrency] = useState('全部');
  const [company, setCompany] = useState<string | undefined>(initCompany);
  const [search, setSearch] = useState('');
  const [wizardMode, setWizardMode] = useState<'allocate' | 'recall' | null>(null);

  const filtered = allData.filter((r) => {
    const kw = search.toLowerCase();
    return (
      (orderType === '全部' || r.type === orderType) &&
      (currency === '全部' || r.currency === currency) &&
      (!company || r.companyName === company) &&
      (!kw || r.orderId.includes(kw) || r.remark.toLowerCase().includes(kw))
    );
  });

  const columns: ColumnsType<TransferRecord> = [
    { title: '订单时间', dataIndex: 'orderTime', width: 170 },
    { title: '订单编号', dataIndex: 'orderId', width: 100 },
    { title: '公司ID', dataIndex: 'companyId', width: 90 },
    { title: '公司名称', dataIndex: 'companyName', width: 120 },
    {
      title: '订单类型', dataIndex: 'type', width: 100,
      render: (v) => (
        <Tag color={v === '集团下拨' ? 'blue' : 'orange'} style={{ marginInlineEnd: 0 }}>{v}</Tag>
      ),
    },
    { title: '货币单位', dataIndex: 'currency', width: 90 },
    {
      title: '交易金额', dataIndex: 'amount', align: 'right', width: 130,
      sorter: (a, b) => a.amount - b.amount,
      render: (v) => fmt(v),
    },
    {
      title: '交易后公司余额', dataIndex: 'afterBalance', align: 'right', width: 150,
      sorter: (a, b) => a.afterBalance - b.afterBalance,
      render: (v) => fmt(v),
    },
    { title: '操作人用户名', dataIndex: 'operator', width: 130 },
    { title: '订单备注', dataIndex: 'remark', width: 140, ellipsis: true },
  ];

  return (
    <Space direction="vertical" size={16} style={{ display: 'flex' }}>
      {/* 筛选区 */}
      <Card bordered={false}>
        <Space direction="vertical" size={16} style={{ display: 'flex' }}>
          <Space size={24} wrap align="center">
            <Space size={8} align="center">
              <Text style={{ whiteSpace: 'nowrap' }}>订单类型：</Text>
              <ConfigProvider theme={radioTheme}>
                <Radio.Group value={orderType} onChange={(e) => setOrderType(e.target.value)} buttonStyle="outline">
                  {['全部', '集团下拨', '集团调回'].map((t) => (
                    <Radio.Button key={t} value={t} style={orderType === t ? { color: '#722ed1', borderColor: '#722ed1' } : {}}>
                      {t}
                    </Radio.Button>
                  ))}
                </Radio.Group>
              </ConfigProvider>
            </Space>
            <Space size={8} align="center">
              <Text style={{ whiteSpace: 'nowrap' }}>公司名称：</Text>
              <Select
                placeholder="请选择" value={company} onChange={setCompany} allowClear style={{ width: 200 }}
                options={companies.map((c) => ({ value: c, label: c }))}
              />
            </Space>
            <Space size={8} align="center">
              <Text style={{ whiteSpace: 'nowrap' }}>搜索：</Text>
              <Input
                suffix={<SearchOutlined style={{ color: 'rgba(0,0,0,0.25)' }} />}
                placeholder="订单编号，订单备注"
                value={search} onChange={(e) => setSearch(e.target.value)} allowClear style={{ width: 240 }}
              />
            </Space>
          </Space>
          <Space size={8} align="center">
            <Text style={{ whiteSpace: 'nowrap' }}>货币单位：</Text>
            <ConfigProvider theme={radioTheme}>
              <Radio.Group value={currency} onChange={(e) => setCurrency(e.target.value)} buttonStyle="outline">
                {['全部', 'USDT', 'PEA'].map((c) => (
                  <Radio.Button key={c} value={c} style={currency === c ? { color: '#722ed1', borderColor: '#722ed1' } : {}}>
                    {c}
                  </Radio.Button>
                ))}
              </Radio.Group>
            </ConfigProvider>
          </Space>
        </Space>
      </Card>

      {/* 表格区 */}
      <Card
        bordered={false}
        title={<Text strong>内部划转记录</Text>}
        extra={
          <Space size={8}>
            <Button type="primary" onClick={() => setWizardMode('recall')}>集团调回</Button>
            <Button type="primary" onClick={() => setWizardMode('allocate')}>集团下拨</Button>
            <Button icon={<ReloadOutlined />} type="text" />
            <Button icon={<SettingOutlined />} type="text" />
            <Button icon={<FullscreenOutlined />} type="text" />
          </Space>
        }
      >
        <Table
          columns={columns} dataSource={filtered} rowKey="id" size="middle"
          scroll={{ x: 1300 }}
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
          rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
        />
      </Card>

      {/* 三步弹窗 */}
      {wizardMode && (
        <WizardModal
          mode={wizardMode}
          open
          onClose={() => setWizardMode(null)}
        />
      )}
    </Space>
  );
};

export default TransferPage;
