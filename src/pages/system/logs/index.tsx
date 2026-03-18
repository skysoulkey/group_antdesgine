import { SearchOutlined } from '@ant-design/icons';
import { Card, Col, DatePicker, Input, Row, Select, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';

const { Text } = Typography;
const { RangePicker } = DatePicker;

interface LogRecord {
  id: number;
  logType: 'login' | 'operation' | 'system';
  operator: string;
  action: string;
  module: string;
  ip: string;
  country: string;
  result: 'success' | 'failed';
  createdAt: string;
}

const mockLogs: LogRecord[] = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  logType: (['login', 'operation', 'system', 'login', 'operation'] as const)[i % 5],
  operator: ['Miya', 'Admin', 'Jack', 'Lisa', 'Tom'][i % 5],
  action: [
    '用户登录',
    '创建企业',
    '修改角色权限',
    '用户退出',
    '下拨资金',
    '修改密码',
    '导出数据',
    '删除角色',
  ][i % 8],
  module: ['用户管理', '企业管理', '角色管理', '集团金融', '系统设置'][i % 5],
  ip: `104.${28 + (i % 10)}.${200 + (i % 55)}.${i % 255}`,
  country: ['🇸🇬 新加坡', '🇨🇳 中国', '🇺🇸 美国', '🇬🇧 英国'][i % 4],
  result: i % 6 === 0 ? 'failed' : 'success',
  createdAt: `2025-11-${String(1 + (i % 30)).padStart(2, '0')} ${String(8 + (i % 14)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}:00`,
}));

const logTypeMap = {
  login: { label: '登录日志', color: 'blue' },
  operation: { label: '操作日志', color: 'green' },
  system: { label: '系统日志', color: 'orange' },
} as const;

const SystemLogsPage: React.FC = () => {
  const [logType, setLogType] = useState<string>('');
  const [searchVal, setSearchVal] = useState('');

  const filtered = mockLogs.filter((d) => {
    const matchType = !logType || d.logType === logType;
    const matchSearch =
      !searchVal ||
      d.operator.includes(searchVal) ||
      d.action.includes(searchVal) ||
      d.ip.includes(searchVal);
    return matchType && matchSearch;
  });

  const columns: ColumnsType<LogRecord> = [
    {
      title: '日志类型',
      dataIndex: 'logType',
      width: 100,
      render: (v: LogRecord['logType']) => (
        <Tag color={logTypeMap[v].color}>{logTypeMap[v].label}</Tag>
      ),
    },
    { title: '操作人', dataIndex: 'operator', width: 90 },
    { title: '操作行为', dataIndex: 'action' },
    { title: '所属模块', dataIndex: 'module', width: 110 },
    {
      title: 'IP 地址',
      dataIndex: 'ip',
      width: 160,
      render: (v, r) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontFamily: 'monospace' }}>{v}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {r.country}
          </Text>
        </Space>
      ),
    },
    {
      title: '结果',
      dataIndex: 'result',
      width: 80,
      render: (v) =>
        v === 'success' ? (
          <Tag color="success">成功</Tag>
        ) : (
          <Tag color="error">失败</Tag>
        ),
    },
    { title: '时间', dataIndex: 'createdAt', width: 170 },
  ];

  return (
    <Card bordered={false} style={{ borderRadius: 8 }}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col>
          <Select
            placeholder="日志类型"
            value={logType || undefined}
            onChange={setLogType}
            allowClear
            style={{ width: 130 }}
            options={[
              { label: '登录日志', value: 'login' },
              { label: '操作日志', value: 'operation' },
              { label: '系统日志', value: 'system' },
            ]}
          />
        </Col>
        <Col>
          <Input
            prefix={<SearchOutlined />}
            placeholder="搜索操作人、行为、IP"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            allowClear
            style={{ width: 240 }}
          />
        </Col>
        <Col>
          <RangePicker style={{ width: 280 }} />
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        scroll={{ x: 900 }}
        pagination={{
          total: filtered.length,
          pageSize: 15,
          showTotal: (total) => `总共 ${total} 条日志`,
        }}
        size="middle"
      />
    </Card>
  );
};

export default SystemLogsPage;
