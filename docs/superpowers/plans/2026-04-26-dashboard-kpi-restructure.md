# 集团仪表盘 KPI 卡片重构 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将集团仪表盘 KPI 卡片从"资产动态 + 用户动态"两区重构为 MECE 的"资金分布 + 经营成果 + 规模指标"三区，共 12 张卡片 4×3 布局。

**Architecture:** 仅修改 `src/pages/dashboard/index.tsx` 中的 JSX 结构，将现有 KPI 卡片重新分区和重命名。KpiCard 组件、折线图、TOP5 排行榜、CSS grid 布局均不变。

**Tech Stack:** React + Ant Design + 现有 KpiCard 组件

**Spec:** `docs/superpowers/specs/2026-04-26-dashboard-kpi-restructure-design.md`

---

### Task 1: 替换"资产动态"区为"资金分布"区

**Files:**
- Modify: `src/pages/dashboard/index.tsx:260-331`

- [ ] **Step 1: 替换区块标题和全部 8 张卡片为 4 张"资金分布"卡片**

将 `src/pages/dashboard/index.tsx` 第 260-331 行的完整"资产动态"区块替换为：

```tsx
      {/* ── 资金分布 ── */}
      <Text strong style={{ fontSize: 16, display: 'block', margin: '4px 0 12px' }}>资金分布</Text>
      <div className="kpi-grid">
          <KpiCard
            title="集团钱包"
            value="$223,300.00"
            sub={[
              { label: '充值', value: '$233,322.00', tooltip: '集团累计充入金额' },
              { label: '提现', value: '$233,322.00', tooltip: '集团累计转出金额' },
            ]}
            tooltip="集团钱包当前余额"
          />
          <KpiCard
            title="公司账户"
            value="$2,020.00"
            sub={[
              { label: '下拨', value: '$233,322.00', tooltip: '集团转给公司的累计金额' },
              { label: '调回', value: '$202,320.00', tooltip: '集团从公司转回的累计金额' },
            ]}
            tooltip="集团下所有公司账户余额合计"
          />
          <KpiCard
            title="持股估值"
            value="$2,020.00"
            sub={[
              { label: '持股企业', value: '2,000 家' },
              { label: '非持股企业', value: '500 家' },
            ]}
            tooltip="公司持有企业股份按当前市价计算的估值总额"
          />
          <KpiCard
            title="企业资产"
            value="$2,020.00"
            sub={[
              { label: '昨日变动', value: '$233,322.00' },
              { label: '今日变动', value: '$233,322.00' },
            ]}
            tooltip="集团下所有企业总资产合计"
          />
      </div>
```

- [ ] **Step 2: 验证页面渲染**

Run: `npx umi dev`（如果 dev server 已启动则直接刷新浏览器）

Expected: 第一行显示"资金分布"标题 + 4 张卡片（集团钱包、公司账户、持股估值、企业资产），4 列等宽排列。

- [ ] **Step 3: Commit**

```bash
git add src/pages/dashboard/index.tsx
git commit -m "refactor(dashboard): 资产动态区 → 资金分布区（集团钱包/公司账户/持股估值/企业资产）"
```

---

### Task 2: 替换"用户动态"区为"经营成果"区 + "规模指标"区

**Files:**
- Modify: `src/pages/dashboard/index.tsx`（Task 1 之后的"用户动态"区块）

- [ ] **Step 1: 替换"用户动态"区块**

找到"用户动态"区块（`{/* ── 用户动态 ── */}` 开始，到 `</Row>` 结束，约第 333-379 行），整体替换为：

```tsx
      {/* ── 经营成果 ── */}
      <Text strong style={{ fontSize: 16, display: 'block', margin: '24px 0 12px' }}>经营成果</Text>
      <div className="kpi-grid">
          <KpiCard
            title="总收益"
            value="$202,320.00"
            sub={[
              { label: '昨日变动', value: '$233,322' },
              { label: '今日变动', value: '$233,322' },
            ]}
            tooltip="公司历史累计已实现收益总额（= 股份盈亏 + 游戏盈亏 + 税费收益）"
          />
          <KpiCard
            title="股份盈亏"
            value="$202,320.00"
            sub={[
              { label: '收入', value: '$233,322.00' },
              { label: '支出', value: '$233,322.00' },
            ]}
            tooltip="公司股份交易累计收益净额"
          />
          <KpiCard
            title="游戏盈亏"
            value="$223,300.00"
            sub={[
              { label: '昨日盈亏', value: '$233,322' },
              { label: '今日盈亏', value: '$233,322' },
            ]}
            tooltip="公司累计游戏盈亏"
          />
          <KpiCard
            title="税费收益"
            value="$202,320.00"
            sub={[
              { label: '昨日收益', value: '$233,322.00' },
              { label: '今日收益', value: '$233,322.00' },
            ]}
            tooltip="公司收到的释放股份税、分红税、保证金清退税之和"
          />
      </div>

      {/* ── 规模指标 ── */}
      <Text strong style={{ fontSize: 16, display: 'block', margin: '24px 0 12px' }}>规模指标</Text>
      <div className="kpi-grid">
          <KpiCard
            title="公司"
            value="22"
            sub={[
              { label: '参股公司', value: '12' },
              { label: '非参股公司', value: '10' },
            ]}
            tooltip="集团下公司总数"
          />
          <KpiCard
            title="企业"
            value="22"
            sub={[
              { label: '上月新增', value: '233' },
              { label: '本月新增', value: '233' },
            ]}
            tooltip="本集团下完成认证的企业总数"
          />
          <KpiCard
            title="成员"
            value="223,234"
            sub={[
              { label: '昨日新增', value: '233,322' },
              { label: '今日新增', value: '233' },
            ]}
            tooltip="本集团下所有企业成员数"
          />
          <KpiCard
            title="企业流水"
            value="$3,280,000.00"
            sub={[
              { label: '昨日', value: '$233,322' },
              { label: '今日', value: '$233,322' },
            ]}
            tooltip="集团下所有企业游戏流水之和"
          />
      </div>
```

- [ ] **Step 2: 验证页面渲染**

刷新浏览器，Expected:
- 第二行"经营成果"标题 + 4 张卡片（总收益、股份盈亏、游戏盈亏、税费收益）
- 第三行"规模指标"标题 + 4 张卡片（公司、企业、成员、企业流水）
- 每行 4 列等宽，和"资金分布"行一致

- [ ] **Step 3: Commit**

```bash
git add src/pages/dashboard/index.tsx
git commit -m "refactor(dashboard): 用户动态区 → 经营成果区 + 规模指标区"
```

---

### Task 3: 清理不再使用的 mock 数据变量

**Files:**
- Modify: `src/pages/dashboard/index.tsx:42-49`

- [ ] **Step 1: 检查是否有未使用的 mock 数据变量**

Task 1 删除了"资金调回"卡片，但该卡片没有折线图数据变量。检查顶部 mock 数据变量（第 42-49 行）是否都仍被折线图区域引用。

当前 8 个 mock 数据变量：
- `groupBalanceData` → 折线图"集团总资产" ✅
- `companyAssetData` → 折线图"公司资产" ✅
- `enterpriseTotal` → 折线图"企业总资产" ✅
- `holdingValData` → 折线图"持股估值" ✅
- `enterprisePnl` → 折线图"企业盈亏" ✅
- `enterpriseFlow` → 折线图"企业流水" ✅
- `enterpriseCount` → 折线图"企业数" ✅
- `enterpriseMember` → 折线图"企业成员" ✅

全部仍在使用，无需清理。跳过此 Task。

---

### Task 4: 同步规范文档

**Files:**
- Modify: `doc/data-spec.md`
- Modify: `doc/changelog.md`

- [ ] **Step 1: 更新 data-spec.md 中的 KPI 指标卡表格**

将 `doc/data-spec.md` 中"1.1 KPI 指标卡"的表格替换为：

```markdown
### 1.1 KPI 指标卡

#### 资金分布

| 指标名称 | 计算口径 | 子指标 | 备注 |
|---------|---------|--------|------|
| 集团钱包 | 集团钱包当前余额 | 充值（累计充入）/ 提现（累计转出） | |
| 公司账户 | 集团下所有公司账户余额合计 | 下拨（集团转给公司累计）/ 调回（集团从公司转回累计） | |
| 持股估值 | 公司持有企业股份按当前市价计算的估值总额 | 持股企业数 / 非持股企业数 | |
| 企业资产 | 集团下所有企业总资产合计 | 昨日变动 / 今日变动 | |

#### 经营成果

| 指标名称 | 计算口径 | 子指标 | 备注 |
|---------|---------|--------|------|
| 总收益 | 公司历史累计已实现收益总额 | 昨日变动 / 今日变动 | = 股份盈亏 + 游戏盈亏 + 税费收益 |
| 股份盈亏 | 公司股份交易累计收益净额 | 收入 / 支出 | |
| 游戏盈亏 | 公司累计游戏盈亏 | 昨日盈亏 / 今日盈亏 | |
| 税费收益 | 公司收到的释放股份税、分红税、保证金清退税之和 | 昨日收益 / 今日收益 | |

#### 规模指标

| 指标名称 | 计算口径 | 子指标 | 备注 |
|---------|---------|--------|------|
| 公司 | 集团下公司总数 | 参股公司 / 非参股公司 | |
| 企业 | 本集团下完成认证的企业总数 | 上月新增 / 本月新增 | |
| 成员 | 本集团下所有企业成员数 | 昨日新增 / 今日新增 | |
| 企业流水 | 集团下所有企业游戏流水之和 | 昨日 / 今日 | |
```

- [ ] **Step 2: 追加 changelog.md**

在 `doc/changelog.md` 顶部追加：

```markdown
## 2026-04-26

- refactor: 集团仪表盘 KPI 卡片重构 — "资产动态 + 用户动态"两区拆为 MECE 三区（资金分布 / 经营成果 / 规模指标），消除概念重叠
  - 资金分布：集团钱包、公司账户、持股估值、企业资产
  - 经营成果：总收益（= 股份盈亏 + 游戏盈亏 + 税费收益）
  - 规模指标：公司、企业、成员、企业流水
  - 删除独立"资金调回"卡片（并入公司账户子指标）
  - "集团余额"→"集团钱包"、"公司资产"→"公司账户"、"转出"→"提现"
```

- [ ] **Step 3: Commit**

```bash
git add doc/data-spec.md doc/changelog.md
git commit -m "docs: 同步 KPI 重构变更到 data-spec + changelog"
```
