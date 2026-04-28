/**
 * 【所属模块】公司财务 / 公司清账 / PDF 预览
 *
 * 【核心定位】模拟 PDF 下载后的样子，A4 纸样式，浏览器原生打印可导出真 PDF
 *
 * 【业务规则】
 * - 一公司一月一份 PDF（含所有币种）
 * - 模板按 PRD V1.3 §8.3：基本信息 + 应用费用按币种分组 + 扣款记录按币种→时间
 * - 视觉参考 /Users/miya/Downloads/企业账单_202604.pdf
 *
 * 【隐私】所有名称/ID 均为构造假数据，不使用真实公司/集团名
 */
import { useEffect } from 'react';
import { Button, Space, Typography } from 'antd';
import { ArrowLeftOutlined, PrinterOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'umi';

const { Text } = Typography;

// ── A4 纸样式 ────────────────────────────────────────────────────
const PAGE_WIDTH = 794; // A4 宽 210mm @96dpi ≈ 794px
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

const TABLE_STYLE: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 12,
};
const TH_STYLE: React.CSSProperties = {
  background: '#fafafa',
  padding: '8px 10px',
  textAlign: 'left',
  borderBottom: '1px solid #f0f0f0',
  fontWeight: 600,
  color: '#595959',
};
const TD_STYLE: React.CSSProperties = {
  padding: '8px 10px',
  borderBottom: '1px solid #f5f5f5',
  color: '#262626',
};
const TD_RIGHT: React.CSSProperties = { ...TD_STYLE, textAlign: 'right', fontVariantNumeric: 'tabular-nums' };

// ── 假数据构造（隐私保护：不使用真实公司/集团名）────────────────
const fmt = (v: number) => v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const buildMockBill = (billId: string) => {
  // 从 billId 反推月份；非法时回落到当前月
  const m = billId.match(/(\d{6})/);
  const period = m ? `${m[1].slice(0, 4)}-${m[1].slice(4, 6)}` : '2026-04';
  const [year, month] = period.split('-');
  return {
    billId,
    companyName: '示例公司 A', // 假数据
    period,
    generatedAt: `${year}-${month}-01 02:15:30`,
    currencies: ['USDT', 'PEA'] as const,

    // 应用费用（按币种分组）
    feeByCurrency: {
      USDT: {
        rows: [
          { game: '汇总', orderCount: 286, turnover: 8000, payout: 4200, rebate: 320, revenue: 3480, fee: 348 },
          { game: '东方彩票', orderCount: 168, turnover: 4800, payout: 2520, rebate: 192, revenue: 2088, fee: 208.8 },
          { game: '七星百家乐', orderCount: 118, turnover: 3200, payout: 1680, rebate: 128, revenue: 1392, fee: 139.2 },
        ],
      },
      PEA: {
        rows: [
          { game: '汇总', orderCount: 412, turnover: 12000, payout: 6300, rebate: 480, revenue: 5220, fee: 522 },
          { game: '东方彩票', orderCount: 240, turnover: 7200, payout: 3780, rebate: 288, revenue: 3132, fee: 313.2 },
          { game: '七星百家乐', orderCount: 172, turnover: 4800, payout: 2520, rebate: 192, revenue: 2088, fee: 208.8 },
        ],
      },
    },

    // 扣款记录（按币种 → 时间）
    deductRecords: [
      { currency: 'USDT', time: `${year}-${month}-02 00:01:18`, fee: 348.00, source: '自动月度', status: '扣款成功' },
      { currency: 'PEA',  time: `${year}-${month}-02 00:01:23`, fee: 522.00, source: '自动月度', status: '扣款成功' },
    ],
  };
};

const SettlementPreview = () => {
  const { billId = 'BILL202604001' } = useParams<{ billId: string }>();
  const navigate = useNavigate();
  const bill = buildMockBill(billId);

  useEffect(() => {
    document.title = `应用费用结算账单 - ${bill.period}`;
  }, [bill.period]);

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', padding: '0 0 48px' }}>
      {/* 工具栏：打印时隐藏 */}
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

      {/* A4 纸 */}
      <div style={PAPER_STYLE} className="bill-paper">
        {/* 标题 */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid #141414', paddingBottom: 12, marginBottom: 20 }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 4, color: '#141414' }}>应用费用结算账单</div>
          <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>Application Fee Settlement Statement</div>
        </div>

        {/* 一、基本信息 */}
        <div style={SECTION_TITLE}>一、基本信息</div>
        <table style={TABLE_STYLE}>
          <tbody>
            <tr>
              <td style={{ ...TD_STYLE, width: '20%', color: '#8c8c8c' }}>公司名称</td>
              <td style={{ ...TD_STYLE, width: '30%' }}>{bill.companyName}</td>
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
              <td style={{ ...TD_STYLE, color: '#8c8c8c' }}>涉及币种</td>
              <td style={TD_STYLE} colSpan={3}>{bill.currencies.join('、')}</td>
            </tr>
          </tbody>
        </table>

        {/* 二、应用费用（按币种分组） */}
        <div style={SECTION_TITLE}>二、应用费用（按币种分组）</div>
        {bill.currencies.map((cur) => {
          const data = bill.feeByCurrency[cur];
          return (
            <div key={cur} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1677ff', margin: '12px 0 6px' }}>
                【币种：{cur}】
              </div>
              <table style={TABLE_STYLE}>
                <thead>
                  <tr>
                    <th style={TH_STYLE}>游戏类型</th>
                    <th style={{ ...TH_STYLE, textAlign: 'right' }}>订单数</th>
                    <th style={{ ...TH_STYLE, textAlign: 'right' }}>流水金额</th>
                    <th style={{ ...TH_STYLE, textAlign: 'right' }}>赔付金额</th>
                    <th style={{ ...TH_STYLE, textAlign: 'right' }}>返佣支出</th>
                    <th style={{ ...TH_STYLE, textAlign: 'right' }}>游戏收益</th>
                    <th style={{ ...TH_STYLE, textAlign: 'right' }}>应用费用</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((r, i) => (
                    <tr key={i} style={r.game === '汇总' ? { background: '#fafcff' } : {}}>
                      <td style={{ ...TD_STYLE, fontWeight: r.game === '汇总' ? 600 : 400 }}>{r.game}</td>
                      <td style={TD_RIGHT}>{r.orderCount}</td>
                      <td style={TD_RIGHT}>{fmt(r.turnover)}</td>
                      <td style={TD_RIGHT}>{fmt(r.payout)}</td>
                      <td style={TD_RIGHT}>{fmt(r.rebate)}</td>
                      <td style={TD_RIGHT}>{fmt(r.revenue)}</td>
                      <td style={{ ...TD_RIGHT, fontWeight: r.game === '汇总' ? 600 : 400, color: r.game === '汇总' ? '#141414' : '#262626' }}>
                        {fmt(r.fee)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}

        {/* 三、扣款记录 */}
        <div style={SECTION_TITLE}>三、扣款记录（按币种 → 时间）</div>
        <table style={TABLE_STYLE}>
          <thead>
            <tr>
              <th style={TH_STYLE}>币种</th>
              <th style={TH_STYLE}>扣款时间</th>
              <th style={{ ...TH_STYLE, textAlign: 'right' }}>应用费用</th>
              <th style={TH_STYLE}>扣款触发源</th>
              <th style={TH_STYLE}>扣款状态</th>
            </tr>
          </thead>
          <tbody>
            {bill.deductRecords.map((r, i) => (
              <tr key={i}>
                <td style={TD_STYLE}>{r.currency}</td>
                <td style={TD_STYLE}>{r.time}</td>
                <td style={TD_RIGHT}>{fmt(r.fee)}</td>
                <td style={TD_STYLE}>{r.source}</td>
                <td style={TD_STYLE}>{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 页脚 */}
        <div style={{ marginTop: 40, paddingTop: 16, borderTop: '1px solid #f0f0f0', textAlign: 'center', color: '#bfbfbf', fontSize: 11 }}>
          本账单由商户管理平台系统自动生成 · 多币种独立结算 · 不分正负色 · 模板版本 V0.5-preview
        </div>
      </div>

      {/* 打印样式 */}
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

export default SettlementPreview;
