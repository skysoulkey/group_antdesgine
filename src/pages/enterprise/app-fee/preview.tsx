/**
 * 【所属模块】集团管理 / 应用费用 / PDF 预览
 *
 * 【核心定位】集团端账单 PDF 预览，A4 纸样式，浏览器原生打印导出 PDF
 *
 * 【业务规则】
 * - 集团端账单 = 全集团一月所有公司汇总
 * - 不展示金额具体数值（按业务约束），但 PDF 必须有完整明细供审计
 * - 因此 PDF 内仍展示金额；页面表只展示状态
 *
 * 【隐私】所有名称/ID 均为构造假数据，不使用真实集团/公司名
 */
import { useEffect } from 'react';
import { Button, Space, Typography } from 'antd';
import { ArrowLeftOutlined, PrinterOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'umi';

const { Text } = Typography;

const PAGE_WIDTH = 794;
const PAPER_STYLE: React.CSSProperties = {
  width: PAGE_WIDTH,
  margin: '24px auto',
  background: '#fff',
  boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
  padding: '48px 56px',
  color: '#262626',
  fontSize: 13,
  lineHeight: 1.7,
  fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif',
};

const SECTION_TITLE: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: '#141414',
  borderLeft: '3px solid #1677ff',
  paddingLeft: 8,
  margin: '24px 0 12px',
};

const TABLE_STYLE: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 12 };
const TH_STYLE: React.CSSProperties = {
  background: '#fafafa', padding: '8px 10px', textAlign: 'left',
  borderBottom: '1px solid #f0f0f0', fontWeight: 600, color: '#595959',
};
const TD_STYLE: React.CSSProperties = {
  padding: '8px 10px', borderBottom: '1px solid #f5f5f5', color: '#262626',
};
const TD_RIGHT: React.CSSProperties = { ...TD_STYLE, textAlign: 'right', fontVariantNumeric: 'tabular-nums' };

const fmt = (v: number) => v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const buildMockBill = (billId: string) => {
  const m = billId.match(/(\d{6})/);
  const period = m ? `${m[1].slice(0, 4)}-${m[1].slice(4, 6)}` : '2026-04';
  const [year, month] = period.split('-');

  // 9 家假公司
  const companies = [
    { code: 'C001', name: '示例公司 A', usdt: 348.00, pea: 522.00, status: '资金充足' },
    { code: 'C002', name: '示例公司 B', usdt: 280.50, pea: 0,      status: '资金充足' },
    { code: 'C003', name: '示例公司 C', usdt: 612.30, pea: 980.40, status: '资金充足' },
    { code: 'C004', name: '示例公司 D', usdt: 0,      pea: 410.20, status: '资金充足' },
    { code: 'C005', name: '示例公司 E', usdt: 156.80, pea: 240.00, status: '资金充足' },
    { code: 'C006', name: '示例公司 F', usdt: 432.10, pea: 720.50, status: '资金充足' },
    { code: 'C007', name: '示例公司 G', usdt: 198.40, pea: 0,      status: '资金充足' },
    { code: 'C008', name: '示例公司 H', usdt: 540.20, pea: 880.00, status: '资金充足' },
    { code: 'C009', name: '示例公司 I', usdt: 320.00, pea: 480.10, status: '资金充足' },
  ];

  const totalUsdt = companies.reduce((a, b) => a + b.usdt, 0);
  const totalPea = companies.reduce((a, b) => a + b.pea, 0);

  return {
    billId,
    groupName: '示例集团',
    period,
    generatedAt: `${year}-${month}-01 02:18:42`,
    companyCount: companies.length,
    fundStatus: '资金充足',
    companies,
    totalUsdt,
    totalPea,
  };
};

const GroupAppFeePreview = () => {
  const { billId = 'GBILL202604' } = useParams<{ billId: string }>();
  const navigate = useNavigate();
  const bill = buildMockBill(billId);

  useEffect(() => {
    document.title = `集团应用费用结算单 - ${bill.period}`;
  }, [bill.period]);

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', padding: '0 0 48px' }}>
      <div className="print-hide" style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: '#fff', padding: '12px 24px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>返回</Button>
        <Space>
          <Text type="secondary" style={{ fontSize: 12 }}>提示：使用浏览器打印（⌘P / Ctrl+P）可导出 PDF</Text>
          <Button type="primary" icon={<PrinterOutlined />} onClick={() => window.print()}>
            打印 / 导出 PDF
          </Button>
        </Space>
      </div>

      <div style={PAPER_STYLE} className="bill-paper">
        <div style={{ textAlign: 'center', borderBottom: '2px solid #141414', paddingBottom: 12, marginBottom: 20 }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 4, color: '#141414' }}>集团应用费用结算单</div>
          <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>Group Application Fee Settlement Statement</div>
        </div>

        <div style={SECTION_TITLE}>一、基本信息</div>
        <table style={TABLE_STYLE}>
          <tbody>
            <tr>
              <td style={{ ...TD_STYLE, width: '20%', color: '#8c8c8c' }}>集团名称</td>
              <td style={{ ...TD_STYLE, width: '30%' }}>{bill.groupName}</td>
              <td style={{ ...TD_STYLE, width: '20%', color: '#8c8c8c' }}>账单周期</td>
              <td style={{ ...TD_STYLE, width: '30%' }}>{bill.period}</td>
            </tr>
            <tr>
              <td style={{ ...TD_STYLE, color: '#8c8c8c' }}>账单编号</td>
              <td style={TD_STYLE}>{bill.billId}</td>
              <td style={{ ...TD_STYLE, color: '#8c8c8c' }}>账单生成时间</td>
              <td style={TD_STYLE}>{bill.generatedAt}</td>
            </tr>
            <tr>
              <td style={{ ...TD_STYLE, color: '#8c8c8c' }}>涉及公司数</td>
              <td style={TD_STYLE}>{bill.companyCount}</td>
              <td style={{ ...TD_STYLE, color: '#8c8c8c' }}>资金状态</td>
              <td style={TD_STYLE}>{bill.fundStatus}</td>
            </tr>
          </tbody>
        </table>

        <div style={SECTION_TITLE}>二、各公司应用费用清单</div>
        <table style={TABLE_STYLE}>
          <thead>
            <tr>
              <th style={TH_STYLE}>公司编号</th>
              <th style={TH_STYLE}>公司名称</th>
              <th style={{ ...TH_STYLE, textAlign: 'right' }}>应用费用 USDT</th>
              <th style={{ ...TH_STYLE, textAlign: 'right' }}>应用费用 PEA</th>
              <th style={TH_STYLE}>资金状态</th>
            </tr>
          </thead>
          <tbody>
            {bill.companies.map((c) => (
              <tr key={c.code}>
                <td style={TD_STYLE}>{c.code}</td>
                <td style={TD_STYLE}>{c.name}</td>
                <td style={TD_RIGHT}>{fmt(c.usdt ?? 0)}</td>
                <td style={TD_RIGHT}>{fmt(c.pea ?? 0)}</td>
                <td style={TD_STYLE}>{c.status}</td>
              </tr>
            ))}
            <tr style={{ background: '#fafcff' }}>
              <td style={{ ...TD_STYLE, fontWeight: 600 }} colSpan={2}>合计</td>
              <td style={{ ...TD_RIGHT, fontWeight: 600, color: '#141414' }}>{fmt(bill.totalUsdt)}</td>
              <td style={{ ...TD_RIGHT, fontWeight: 600, color: '#141414' }}>{fmt(bill.totalPea)}</td>
              <td style={TD_STYLE}>—</td>
            </tr>
          </tbody>
        </table>

        <div style={SECTION_TITLE}>三、说明</div>
        <div style={{ fontSize: 12, color: '#595959', lineHeight: 1.8, paddingLeft: 12 }}>
          1. 本账单按多币种独立结算，跨币种不合并、不汇兑。<br />
          2. 任一公司任一币种未结清，集团整体资金状态显示为「资金不足」（A1 最严档）。<br />
          3. 各公司详细扣款记录、按游戏分类的应用费用明细，请在对应公司端「公司清账」模块查询。<br />
          4. 本账单为系统自动生成的全集团汇总稿，仅供集团管理员/财务/审计内部对账使用。
        </div>

        <div style={{ marginTop: 40, paddingTop: 16, borderTop: '1px solid #f0f0f0', textAlign: 'center', color: '#bfbfbf', fontSize: 11 }}>
          本账单由商户管理平台系统自动生成 · 多币种独立结算 · 不分正负色 · 模板版本 V0.5-preview
        </div>
      </div>

      <style>{`
        @media print {
          body { background: #fff !important; }
          .print-hide { display: none !important; }
          .bill-paper { box-shadow: none !important; margin: 0 !important; padding: 24px 32px !important; }
        }
      `}</style>
    </div>
  );
};

export default GroupAppFeePreview;
