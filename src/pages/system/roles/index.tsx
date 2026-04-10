import { BankOutlined, ShopOutlined } from '@ant-design/icons';
import { Card, Col, Row, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React from 'react';
import { ROLE_LABELS, ROLE_ROUTES, GROUP_ROLES, COMPANY_ROLES, type Role } from '../../utils/auth';

const { Text } = Typography;

const CARD_SHADOW = '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)';

// 路由 → 模块名映射
const MODULE_LABELS: Record<string, string> = {
  '/dashboard':              '集团仪表盘',
  '/company/list':           '公司清单',
  '/company/detail':         '公司详情',
  '/company/transfer':       '内部划转',
  '/finance/revenue':        '集团收益',
  '/finance/wallet':         '集团钱包',
  '/finance/wallet/bind-account': '钱包绑定',
  '/dashboard/company':      '公司仪表盘',
  '/company/shareholding':   '公司持股',
  '/company/revenue':        '公司收益',
  '/enterprise/list':        '企业清单',
  '/enterprise/invite':      '邀请企业',
  '/enterprise/detail':      '企业详情',
  '/orders/lottery':         '东方彩票订单',
  '/commission':             '佣金订单',
  '/finance/my-wallet':      '公司钱包',
  '/system/notifications':   '通知管理',
  '/system/users':           '用户管理',
  '/system/logs':            '系统日志',
};

interface RoleRow {
  key: Role;
  name: string;
  modules: string[];
}

function buildRows(roleIds: readonly Role[]): RoleRow[] {
  return roleIds.map((id) => ({
    key: id,
    name: ROLE_LABELS[id],
    modules: ROLE_ROUTES[id].map((r) => MODULE_LABELS[r] ?? r),
  }));
}

const columns: ColumnsType<RoleRow> = [
  { title: '角色', dataIndex: 'name', width: 120, render: (v) => <Text strong>{v}</Text> },
  {
    title: '功能模块',
    dataIndex: 'modules',
    render: (v: string[]) => (
      <span style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {v.map((m) => <Tag key={m} style={{ margin: 0 }}>{m}</Tag>)}
      </span>
    ),
  },
];

const RoleManagePage: React.FC = () => (
  <div>
    <div style={{ background: '#f6f8ff', border: '1px solid #d6e4ff', borderRadius: 6, padding: '10px 16px', marginBottom: 16, fontSize: 12, color: '#595959', lineHeight: 1.8 }}>
      <div>1. 所有角色为系统内置，不可新增、编辑或删除</div>
      <div>2. 用户可持有多个同侧角色，权限取并集；集团/公司角色不可混搭</div>
      <div>3. 集团主/公司主拥有对应侧所有模块权限 + 用户管理权限</div>
    </div>
    <Row gutter={16}>
      <Col span={12}>
        <Card
          bordered={false}
          title={<><BankOutlined style={{ marginRight: 8, color: '#1677ff' }} />集团侧角色</>}
          style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}
        >
          <Table columns={columns} dataSource={buildRows(GROUP_ROLES)} pagination={false} size="middle" />
        </Card>
      </Col>
      <Col span={12}>
        <Card
          bordered={false}
          title={<><ShopOutlined style={{ marginRight: 8, color: '#1677ff' }} />公司侧角色</>}
          style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}
        >
          <Table columns={columns} dataSource={buildRows(COMPANY_ROLES)} pagination={false} size="middle" />
        </Card>
      </Col>
    </Row>
  </div>
);

export default RoleManagePage;
