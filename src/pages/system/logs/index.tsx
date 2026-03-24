import { SearchOutlined } from '@ant-design/icons';
import { Card, ConfigProvider, Input, Radio, Space, Table, Tabs, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';

const radioTheme = { components: { Radio: { colorPrimary: '#722ed1', buttonSolidCheckedBg: '#ffffff', buttonSolidCheckedColor: '#722ed1', buttonCheckedBg: '#ffffff' } } };

const { Text } = Typography;

const CARD_SHADOW = '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)';

// ── 登录日志 ──────────────────────────────────────────────────────
interface LoginLog {
  id: string;
  loginTime: string;
  username: string;
  role: string;
  loginIp: string;
  country: string;
  result: '成功' | '失败';
}

const loginLogs: LoginLog[] = Array.from({ length: 20 }, (_, i) => ({
  id: `LL${String(i + 1).padStart(7, '0')}`,
  loginTime: `2025-11-${String(i + 1).padStart(2, '0')} ${String(8 + (i % 14)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}:00`,
  username: ['Miya', 'Admin', 'Jack', 'Lisa', 'Tom'][i % 5],
  role: ['集团管理员', '公司管理员', '平台管理员'][i % 3],
  loginIp: `104.${28 + (i % 10)}.${200 + (i % 55)}.${i % 255}`,
  country: ['🇸🇬 新加坡', '🇨🇳 中国', '🇺🇸 美国', '🇬🇧 英国'][i % 4],
  result: i % 6 === 0 ? '失败' : '成功',
}));

// ── 操作日志 ──────────────────────────────────────────────────────
interface OperationLog {
  id: string;
  operateTime: string;
  username: string;
  operation: string;
  module: string;
  operateIp: string;
  result: '成功' | '失败';
}

const operationLogs: OperationLog[] = Array.from({ length: 24 }, (_, i) => ({
  id: `OL${String(i + 1).padStart(7, '0')}`,
  operateTime: `2025-11-${String(i + 1).padStart(2, '0')} ${String(9 + (i % 12)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}:00`,
  username: ['Miya', 'Admin', 'Jack', 'Lisa', 'Tom'][i % 5],
  operation: ['创建企业', '修改角色权限', '下拨资金', '导出数据', '修改密码', '删除角色', '用户权限变更', '系统配置更新'][i % 8],
  module: ['用户管理', '企业管理', '角色管理', '集团金融', '系统设置'][i % 5],
  operateIp: `104.${28 + (i % 10)}.${200 + (i % 55)}.${i % 255}`,
  result: i % 8 === 0 ? '失败' : '成功',
}));

const ROLES = ['集团管理员', '公司管理员', '平台管理员'];

const SystemLogsPage: React.FC = () => {
  const [loginSearch, setLoginSearch] = useState('');
  const [loginRole, setLoginRole] = useState<string | undefined>();
  const [opSearch, setOpSearch] = useState('');

  const filteredLogin = loginLogs.filter((r) => {
    const kw = loginSearch.toLowerCase();
    return (
      (!loginRole || r.role === loginRole) &&
      (!kw || r.username.toLowerCase().includes(kw) || r.loginIp.includes(kw))
    );
  });

  const filteredOp = operationLogs.filter((r) => {
    const kw = opSearch.toLowerCase();
    return !kw || r.username.toLowerCase().includes(kw) || r.operation.includes(kw) || r.operateIp.includes(kw);
  });

  const loginColumns: ColumnsType<LoginLog> = [
    { title: '登录时间', dataIndex: 'loginTime', width: 170 },
    { title: '账号', dataIndex: 'username', width: 100 },
    {
      title: '角色', dataIndex: 'role', width: 120,
      render: (v) => <Tag color="geekblue">{v}</Tag>,
    },
    {
      title: '登录IP', dataIndex: 'loginIp', width: 200,
      render: (v, r) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontFamily: 'monospace' }}>{v}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>{r.country}</Text>
        </Space>
      ),
    },
    {
      title: '结果', dataIndex: 'result', width: 80,
      render: (v) => <Tag color={v === '成功' ? 'success' : 'error'}>{v}</Tag>,
    },
  ];

  const opColumns: ColumnsType<OperationLog> = [
    { title: '操作时间', dataIndex: 'operateTime', width: 170 },
    { title: '账号', dataIndex: 'username', width: 100 },
    { title: '操作行为', dataIndex: 'operation', width: 140 },
    { title: '所属模块', dataIndex: 'module', width: 110 },
    {
      title: '操作IP', dataIndex: 'operateIp', width: 160,
      render: (v) => <Text style={{ fontFamily: 'monospace' }}>{v}</Text>,
    },
    {
      title: '结果', dataIndex: 'result', width: 80,
      render: (v) => <Tag color={v === '成功' ? 'success' : 'error'}>{v}</Tag>,
    },
  ];

  const tabItems = [
    {
      key: 'login',
      label: '登录日志',
      children: (
        <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
          <Space direction="vertical" size={12} style={{ display: 'flex', marginBottom: 16 }}>
            <Space size={24} wrap align="center">
              <Space size={8} align="center">
                <Text style={{ whiteSpace: 'nowrap' }}>角色：</Text>
                <ConfigProvider theme={radioTheme}>
                  <Radio.Group value={loginRole ?? '全部'} onChange={(e) => setLoginRole(e.target.value === '全部' ? undefined : e.target.value)} buttonStyle="outline">
                    {['全部', ...ROLES].map((v) => (
                      <Radio.Button key={v} value={v} style={(loginRole ?? '全部') === v ? { color: '#722ed1', borderColor: '#722ed1' } : {}}>{v}</Radio.Button>
                    ))}
                  </Radio.Group>
                </ConfigProvider>
              </Space>
              <Space size={8} align="center">
                <Text style={{ whiteSpace: 'nowrap' }}>搜索：</Text>
                <Input
                  prefix={<SearchOutlined />}
                  placeholder="账号名 / 登录IP"
                  value={loginSearch}
                  onChange={(e) => setLoginSearch(e.target.value)}
                  allowClear
                  style={{ width: 240 }}
                />
              </Space>
            </Space>
          </Space>
          <Table
            columns={loginColumns}
            dataSource={filteredLogin}
            rowKey="id"
            size="middle"
            scroll={{ x: 800 }}
            pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
            rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
          />
        </Card>
      ),
    },
    {
      key: 'operation',
      label: '操作日志',
      children: (
        <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
          <Space style={{ marginBottom: 16 }}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="账号名 / 操作 / IP"
              value={opSearch}
              onChange={(e) => setOpSearch(e.target.value)}
              allowClear
              style={{ width: 240 }}
            />
          </Space>
          <Table
            columns={opColumns}
            dataSource={filteredOp}
            rowKey="id"
            size="middle"
            scroll={{ x: 900 }}
            pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
            rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
          />
        </Card>
      ),
    },
  ];

  return <Tabs items={tabItems} type="card" />;
};

export default SystemLogsPage;
