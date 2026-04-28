/**
 * 【所属模块】集团管理 / 应用费用
 *
 * 【核心定位】集团端汇总展示旗下所有公司每月清账情况（一月一行汇总，不展示具体金额）
 *
 * 【业务规则（PRD V1.3）】
 * - 行粒度：一月一行（全集团合并）
 * - 资金状态：任一公司任一币种不足即"资金不足"（A1 最严档）
 * - 不展示金额数值，只看结果与状态（业务决策）
 * - 一份 PDF 覆盖一公司一月所有币种；集团端下载为全集团 PDF
 *
 * 【依赖接口】
 * - GET /api/enterprise/app-fee — 列表（待对接）
 */
import { useState } from 'react';
import { Button, Card, ConfigProvider, DatePicker, Radio, Space, Table, Typography } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { type Dayjs } from 'dayjs';
import FilterField from '../../../components/FilterField';

const { RangePicker } = DatePicker;
const { Text } = Typography;

const CARD_SHADOW = '0 1px 2px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.06)';
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

// ── 数据类型 ─────────────────────────────────────────────────────
type FundStatus = '资金充足' | '资金不足';

interface GroupAppFee {
  id: string;
  period: string;        // YYYY-MM
  orderId: string;       // 订单编号
  companyCount: number;  // 涉及公司数量
  fundStatus: FundStatus;
}

// ── Mock 12 个月（含 1 个资金不足场景）─────────────────────────────
const buildMockData = (): GroupAppFee[] => {
  const today = dayjs();
  return Array.from({ length: 12 }, (_, i) => {
    const monthStart = today.subtract(i, 'month').startOf('month');
    const period = monthStart.format('YYYY-MM');
    return {
      id: `G${period.replace('-', '')}`,
      period,
      orderId: `GBILL${period.replace('-', '')}`,
      companyCount: 8 + (i % 4),
      fundStatus: i === 3 ? '资金不足' : '资金充足',
    };
  });
};

const MOCK_DATA = buildMockData();

// 是否在本月或上月范围（PDF 下载条件）
const isDownloadable = (period: string): boolean => {
  const now = dayjs();
  const thisMonth = now.format('YYYY-MM');
  const lastMonth = now.subtract(1, 'month').format('YYYY-MM');
  return period === thisMonth || period === lastMonth;
};

const GroupAppFeePage = () => {
  const [fundStatus, setFundStatus] = useState<'all' | FundStatus>('all');
  const [range, setRange] = useState<[Dayjs, Dayjs] | null>(null);

  const filtered = MOCK_DATA.filter((b) => {
    if (fundStatus !== 'all' && b.fundStatus !== fundStatus) return false;
    if (range && range[0] && range[1]) {
      const m = dayjs(b.period + '-01');
      if (m.isBefore(range[0].startOf('month')) || m.isAfter(range[1].endOf('month'))) return false;
    }
    return true;
  });

  const columns: ColumnsType<GroupAppFee> = [
    { title: '账单周期', dataIndex: 'period', width: 110 },
    { title: '订单编号', dataIndex: 'orderId', width: 180 },
    { title: '公司数量', dataIndex: 'companyCount', width: 100, align: 'right',
      render: (v: number) => <Text style={{ color: '#141414' }}>{v}</Text> },
    { title: '资金状态', dataIndex: 'fundStatus', width: 110 },
    {
      title: '操作', width: 100, fixed: 'right' as const,
      render: (_: unknown, r: GroupAppFee) =>
        isDownloadable(r.period) ? (
          <Button
            type="link" size="small" style={{ padding: 0 }}
            icon={<DownloadOutlined />}
            onClick={() => window.open(`/enterprise/app-fee/preview/${r.orderId}`, '_blank')}
          >
            下载
          </Button>
        ) : null,
    },
  ];

  return (
    <Space direction="vertical" size={12} style={{ display: 'flex', padding: 16 }}>
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
        <Space size={16} wrap align="center">
          <FilterField label="账单周期">
            <RangePicker
              picker="month"
              placeholder={['从', '到']}
              value={range}
              onChange={(v) => setRange(v as [Dayjs, Dayjs] | null)}
            />
          </FilterField>
          <FilterField label="资金状态">
            <ConfigProvider theme={radioTheme}>
              <Radio.Group value={fundStatus} onChange={(e) => setFundStatus(e.target.value)} buttonStyle="solid">
                <Radio.Button value="all">全部</Radio.Button>
                <Radio.Button value="资金充足">资金充足</Radio.Button>
                <Radio.Button value="资金不足">资金不足</Radio.Button>
              </Radio.Group>
            </ConfigProvider>
          </FilterField>
        </Space>
      </Card>
      <Card bordered={false} style={{ borderRadius: 12, boxShadow: CARD_SHADOW }}>
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          size="middle"
          scroll={{ x: 800 }}
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
          rowClassName={(_, i) => (i % 2 === 0 ? '' : 'table-row-light')}
        />
      </Card>
    </Space>
  );
};

export default GroupAppFeePage;
