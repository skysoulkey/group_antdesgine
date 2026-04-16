# 审批流程可视化汇报页面 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 制作一个独立 HTML 长页面，可视化展示审批全流程（6 步），每步配蓝图风格页面 Mockup，用于老板汇报和管理员培训。

**Architecture:** 单个自包含 HTML 文件（内联 CSS），不依赖任何外部资源。所有 Mockup 用纯 HTML/CSS 绘制。图片资源通过相对路径引用 `assets/` 目录。

**Tech Stack:** 纯 HTML + 内联 CSS，无框架依赖

**Spec:** `docs/superpowers/specs/2026-04-16-approval-workflow-flowchart-design.md`

---

## File Structure

```
docs/flowcharts/
├── approval-workflow.html    # 主页面（单文件自包含）
└── assets/                   # 用户提供的截图
    └── (step1-app-screenshot.png)
```

只有一个 HTML 文件需要创建。按页面区域分 Task 逐步构建。

---

### Task 1: HTML 骨架 + 全局样式 + 页头

**Files:**
- Create: `docs/flowcharts/approval-workflow.html`

- [ ] **Step 1: 创建目录结构**

```bash
mkdir -p docs/flowcharts/assets
```

- [ ] **Step 2: 创建 HTML 文件骨架 + 全局 CSS + 页头区域**

创建 `docs/flowcharts/approval-workflow.html`，包含：

1. `<!DOCTYPE html>` + `<html lang="zh-CN">` + `<meta charset="UTF-8">` + `<meta name="viewport">`
2. `<title>公司审批流程</title>`
3. `<style>` 内联全局样式：
   - 字体：`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
   - 主色变量：`--primary: #1677ff; --highlight: #fa8c16; --success: #52c41a; --danger: #ff4d4f; --text: #141414; --text-secondary: #666; --bg-light: #f5f7fa; --border: #e8e8e8`
   - body: `max-width: 1100px; margin: 0 auto; padding: 40px 24px; background: #fff; color: var(--text)`
   - 通用组件类：`.step-block`（步骤区块）、`.step-number`（编号圆圈）、`.step-title`（标题）、`.step-desc`（描述文字）、`.mockup-frame`（Mockup 外框，圆角 12px + 阴影）、`.highlight-box`（橙色高亮框 2px solid #fa8c16）、`.highlight-label`（橙色标注文字）、`.arrow-down`（蓝色向下箭头）
   - 表格类：`.mock-table`（模拟 Ant Design 表格样式，斑马纹）、`.mock-table th`（背景 #fafafa）、`.mock-table td`（padding 10px 12px）、`.mock-table tr:nth-child(even)`（背景 #fafafa）
   - Radio.Button 类：`.radio-group`（flex 容器）、`.radio-btn`（灰色默认）、`.radio-btn.active`（蓝底白字 #1677ff）
   - Tag 类：`.tag`（圆角小标签）、`.tag-warning`（橙色）、`.tag-success`（绿色）、`.tag-error`（红色）、`.tag-processing`（蓝色）、`.tag-default`（灰色）
   - 打印样式：`@media print { body { max-width: 100%; } .arrow-down { break-inside: avoid; } }`
4. `<body>` 开始，页头区域：
   - `<header>` 居中，上方留白 20px
   - `<h1>` 标题「公司审批流程」，font-size 32px，color #141414
   - `<p>` 副标题「持股企业追加投资 / 释放股份 — 从业务触发到审批闭环的完整操作流程」，font-size 16px，color #666
   - 底部分隔线 `<hr>` 1px solid #e8e8e8，margin 32px 0

- [ ] **Step 3: 浏览器验证**

```bash
open docs/flowcharts/approval-workflow.html
```

确认：页面在浏览器中打开，标题和副标题正确显示，字体和颜色符合规范。

- [ ] **Step 4: Commit**

```bash
git add docs/flowcharts/approval-workflow.html docs/flowcharts/assets/
git commit -m "feat(flowchart): 创建审批流程可视化页面骨架 + 全局样式 + 页头"
```

---

### Task 2: 流程总览区域

**Files:**
- Modify: `docs/flowcharts/approval-workflow.html`（在 `<hr>` 后追加内容）

- [ ] **Step 1: 添加流程总览 section**

在页头 `<hr>` 之后追加 `<section id="overview">`，包含：

1. 标题 `<h2>` 「流程总览」
2. 竖向流程图，6 个步骤节点，每个节点结构：
   - 圆角矩形色块（背景 #f0f5ff，边框 2px solid #1677ff），内含编号 + 标题
   - 节点之间用箭头 `▼` 连接（color: #1677ff, font-size: 20px, text-align: center）
3. **步骤 3 的分叉**用 `display: flex; gap: 16px` 实现左右两列：
   - 左列（绿色边框 #52c41a）：「命中规则 → 自动通过 → 发结果通知 → 流程结束」
   - 右列（蓝色边框 #1677ff）：「未命中规则 → 待审批 → 进入人工审批」
   - 分叉前有文字「系统匹配自动审批规则」
   - 右列底部箭头连回主流程步骤 4
4. 6 个步骤节点内容：
   - ① 业务触发 — 企业 APP 端发起操作
   - ② 系统生成审批单 — 投资审批模块新增记录
   - ③ 自动审批规则匹配（分叉点）
   - ④ 三渠道通知分发（小程序 / 邮件 / 站内）
   - ⑤ 公司管理员审批操作（三条路径）
   - ⑥ 审批结果通知 — 三渠道同步

CSS 用内联 style 或追加到 `<style>` 块中。流程总览区域 `max-width: 700px; margin: 0 auto`。

- [ ] **Step 2: 浏览器验证**

```bash
open docs/flowcharts/approval-workflow.html
```

确认：流程总览显示 6 步节点 + 箭头连接，步骤 3 有清晰的左右分叉，颜色区分正确。

- [ ] **Step 3: Commit**

```bash
git add docs/flowcharts/approval-workflow.html
git commit -m "feat(flowchart): 添加流程总览区域 — 6步节点 + 步骤3分叉"
```

---

### Task 3: 步骤 1 — 业务触发（APP 截图占位）

**Files:**
- Modify: `docs/flowcharts/approval-workflow.html`（在流程总览 section 后追加）

- [ ] **Step 1: 添加步骤 1 区块**

在流程总览 section 后追加分隔箭头 + `<section id="step1" class="step-block">`：

1. 步骤编号圆圈（背景 #1677ff，白字「1」）+ 标题「业务触发 — 企业 APP 端发起操作」
2. 描述文字：「持股企业在自己的 APP 中发起追加投资或释放股份操作，系统接收到事件后开始审批流程。」
3. Mockup 区域 `.mockup-frame`：
   - 内部用 `<img>` 引用 `assets/step1-app-screenshot.png`，设置 `max-width: 400px; display: block; margin: 0 auto`
   - 图片加 `onerror` 处理：图片不存在时显示占位区域
   - 占位区域：灰色虚线框（300px × 500px），居中文字「企业 APP 截图（待提供）」，背景 #f5f5f5
4. 底部标注文字：「两种业务场景：追加投资 / 释放股份」

- [ ] **Step 2: 浏览器验证**

确认：步骤 1 区块正确显示，占位区域清晰可见（因截图尚未提供）。

- [ ] **Step 3: Commit**

```bash
git add docs/flowcharts/approval-workflow.html
git commit -m "feat(flowchart): 步骤1 — 业务触发区块 + APP截图占位"
```

---

### Task 4: 步骤 2 — 投资审批列表 Mockup

**Files:**
- Modify: `docs/flowcharts/approval-workflow.html`（在步骤 1 后追加）

- [ ] **Step 1: 添加步骤 2 区块**

追加箭头 + `<section id="step2" class="step-block">`：

1. 编号「2」+ 标题「系统生成审批单 — 投资审批模块新增记录」
2. 描述：「系统自动在【投资审批】模块生成一条新的审批记录，状态为「待审批」，包含事件类型、触发企业、金额、截止时间等信息。」
3. Mockup 区域 `.mockup-frame`：
   - **模拟侧边栏 + 页面布局**：左侧窄条模拟侧边栏（背景 #001529，宽 60px），高亮「投资审批」菜单项；右侧为页面主体
   - **顶部 Tab 栏**：「审批列表」（active，蓝色下划线）和「审批规则」两个 Tab
   - **筛选栏**：
     - 事件类型 Radio.Button：「全部类型」（active 蓝底白字）、「持股企业追加投资」、「持股企业释放股份」
     - 审批状态 Radio.Button：「全部状态」（active）、「待审批」、「已通过」、「已拒绝」、「自动通过」、「超时拒绝」
   - **表格标题栏**：左侧「审批列表」粗体，右侧刷新按钮图标
   - **表格** `.mock-table`，列：订单时间 | 事件类型 | 企业名称 | 企业 ID | 金额 | 货币单位 | 归属公司 | 审批状态 | 审批人昵称 | 审批时间 | 操作
   - 5 行数据（来自 spec 6.1 节的 Mock 数据）：
     - Row 1: `2026-04-16 09:15` | 持股企业追加投资 | CyberBot | ENT001 | 15,000 | USDT | 滴滴答答 | `<span class="tag tag-warning">待审批</span>` | - | - | 详情 拒绝 通过
     - Row 2: `2026-04-15 14:30` | 持股企业释放股份 | StarLink | ENT002 | 10,500 | USDT | 滴滴答答 | `<span class="tag tag-success">已通过</span>` | Tom | 2026-04-15 15:00 | 详情
     - Row 3: `2026-04-14 11:00` | 持股企业追加投资 | QuantumPay | ENT003 | 25,000 | USDT | 滴滴答答 | `<span class="tag tag-error">已拒绝</span>` | Tom | 2026-04-14 12:30 | 详情
     - Row 4: `2026-04-13 16:45` | 持股企业释放股份 | NovaTech | ENT004 | 8,000 | USDT | 滴滴答答 | `<span class="tag tag-processing">自动通过</span>` | - | - | 详情
     - Row 5: `2026-04-12 10:20` | 持股企业追加投资 | CyberBot | ENT001 | 3,500 | USDT | 滴滴答答 | `<span class="tag tag-default">超时拒绝</span>` | - | - | 详情
   - **第一行高亮**：背景 `#fff7e6`，左侧加 2px 橙色竖线
   - **高亮标注**：第一行右侧用绝对定位放置橙色标注框 `.highlight-label`「← 新增待审批记录」，带左箭头
   - 底部分页：「共 5 条」

- [ ] **Step 2: 浏览器验证**

确认：表格样式正确、斑马纹显示、第一行高亮、橙色标注清晰可见、Tag 颜色正确。

- [ ] **Step 3: Commit**

```bash
git add docs/flowcharts/approval-workflow.html
git commit -m "feat(flowchart): 步骤2 — 投资审批列表 Mockup + 高亮新增记录"
```

---

### Task 5: 步骤 3 — 审批规则 Mockup + 分叉图

**Files:**
- Modify: `docs/flowcharts/approval-workflow.html`（在步骤 2 后追加）

- [ ] **Step 1: 添加步骤 3 区块**

追加箭头 + `<section id="step3" class="step-block">`：

1. 编号「3」（橙色背景 #fa8c16）+ 标题「自动审批规则匹配（分叉点）」
2. 描述：「系统检查该公司配置的自动审批规则。命中规则的事务自动通过，未命中的进入人工审批流程。」
3. **审批规则页面 Mockup** `.mockup-frame`：
   - 顶部 Tab 栏：「审批列表」和「审批规则」（active，蓝色下划线）
   - 表格标题栏：左侧「审批规则」粗体，右侧「+ 新增规则」蓝色按钮
   - 规则表格 `.mock-table`，列：创建时间 | 更新时间 | 规则名称 | 适用事件类型 | 适用范围 | 触发条件 | 启用状态 | 操作
   - 3 行数据（来自 spec 6.2 节）：
     - Row 1: 2026-04-10 | 2026-04-15 | 小额追加投资自动通过 | 追加投资 | 全部企业 | 金额 ≤ 10,000 | `<span class="tag tag-success">已启用</span>` | 编辑 停用 删除
     - Row 2: 2026-04-08 | 2026-04-12 | CyberBot 企业白名单 | 全部 | CyberBot | 指定企业 | `<span class="tag tag-success">已启用</span>` | 编辑 停用 删除
     - Row 3: 2026-04-05 | 2026-04-05 | StarLink 小额组合 | 释放股份 | StarLink | 金额 ≤ 5,000 且 指定企业 | `<span class="tag tag-default">已停用</span>` | 编辑 启用 删除
   - 每行的「触发条件」列用 `.highlight-box` 高亮
4. **分叉图**（Mockup 下方，margin-top 24px）：
   - 中间文字：「系统匹配规则」
   - `display: flex; gap: 20px` 左右两列：
   - **左列**（border 2px solid #52c41a, border-radius 10px, padding 16px, background #f6ffed）：
     - 顶部标签「命中规则」绿色背景白字
     - 流程：✅ 自动通过 → 发送结果通知（三渠道纯消息）→ 流程结束（绿色实心块）
   - **右列**（border 2px solid #1677ff, border-radius 10px, padding 16px, background #f0f5ff）：
     - 顶部标签「未命中规则」蓝色背景白字
     - 流程：⏳ 待审批 → 进入步骤 4（人工审批流程）（蓝色实心块）

- [ ] **Step 2: 浏览器验证**

确认：规则表格显示正确、触发条件列高亮、分叉图左右两列清晰、颜色区分明确。

- [ ] **Step 3: Commit**

```bash
git add docs/flowcharts/approval-workflow.html
git commit -m "feat(flowchart): 步骤3 — 审批规则 Mockup + 命中/未命中分叉图"
```

---

### Task 6: 步骤 4 — 三渠道通知 Mockup

**Files:**
- Modify: `docs/flowcharts/approval-workflow.html`（在步骤 3 后追加）

- [ ] **Step 1: 添加步骤 4 区块**

追加箭头 + `<section id="step4" class="step-block">`：

1. 编号「4」+ 标题「三渠道通知分发 — 同时触达公司管理员」
2. 描述：「系统同时通过小程序、邮件、站内三个渠道向公司管理员发送审批通知。小程序渠道带 Inline Keyboard 操作按钮，管理员可直接审批。」
3. **大框容器**（border 2px dashed #91caff, border-radius 12px, padding 20px, background #e6f4ff）：
   - 顶部居中标签「三渠道同步推送」
   - `display: flex; gap: 16px` 三列并排：

   **小程序通知 Mockup**（flex 1, background #fff, border-radius 10px, padding 16px）：
   - 标题栏：📱 小程序通知
   - 模拟聊天界面：深色顶栏（#1a1a2e）「HeyTalk Bot」
   - 消息气泡（background #fff, border-radius 8px, padding 12px, border 1px solid #e8e8e8）：
     - 「【CyberBot】通知」加粗
     - 「您管辖的企业有一条待处理事项，请10分钟内处理～」
   - Inline Keyboard 按钮区域（margin-top 8px, display flex, gap 8px）：
     - 「✅ 同意」按钮（background #1677ff, color #fff, border-radius 6px, padding 8px 16px, flex 1）
     - 「❌ 拒绝」按钮（background #ff4d4f, color #fff, border-radius 6px, padding 8px 16px, flex 1）
   - 按钮区域外加 `.highlight-box` 橙色框 + 标注「可直接在小程序内审批」

   **邮件通知 Mockup**（flex 1, background #fff, border-radius 10px, padding 16px）：
   - 标题栏：📧 邮件通知
   - 模拟邮件界面：
     - 顶部：From: noreply@heytalk.com，To: miya@cyberbot.sg
     - Subject: 消息通知：持股企业追加投资
     - 分隔线
     - 正文（font-size 12px, line-height 1.8）：
       - 「尊敬的用户，」
       - 「【CyberBot】是一家您持有股权利益的企业。该公司已启动额外投资流程。」
       - 「所需程序尚未完成。请登录系统，在 10 分钟内完成必要的操作。」
       - 「如果在指定时间内未完成所需操作，额外投资订单将自动失效并终止。」
     - 蓝色按钮「前往审批页面 →」（模拟跳转链接）

   **站内通知 Mockup**（flex 1, background #fff, border-radius 10px, padding 16px）：
   - 标题栏：🔔 站内通知
   - 模拟通知列表：
     - 第一条（background #e6f4ff, border-left 3px solid #1677ff, font-weight bold）：
       - 「【CyberBot】已启动额外投资流程，所需程序尚未完成，请在 10 分钟内登录系统处理。」
       - 右侧「未读」蓝色小点
       - 底部：2026-04-16 09:15
     - 第二条（普通样式，color #999）：
       - 「【StarLink】的释放股份申请已通过…」
       - 底部：2026-04-15 14:35

- [ ] **Step 2: 浏览器验证**

确认：大框正确包裹三个渠道、三列并排等宽、小程序 Inline Keyboard 按钮区域有橙色高亮标注、邮件文案正确、站内通知第一条有未读高亮。

- [ ] **Step 3: Commit**

```bash
git add docs/flowcharts/approval-workflow.html
git commit -m "feat(flowchart): 步骤4 — 三渠道通知分发 Mockup（小程序/邮件/站内）"
```

---

### Task 7: 步骤 5 — 三条审批路径 Mockup

**Files:**
- Modify: `docs/flowcharts/approval-workflow.html`（在步骤 4 后追加）

- [ ] **Step 1: 添加步骤 5 区块**

追加箭头 + `<section id="step5" class="step-block">`：

1. 编号「5」+ 标题「公司管理员审批操作（三条路径）」
2. 描述：「管理员可通过小程序直接审批、Web 端审批中心操作，或不操作等待超时自动拒绝。」
3. `display: flex; gap: 16px` 三列并排：

   **路径 A — 小程序直接审批**（flex 1, border 2px solid #1677ff, border-radius 10px, padding 16px）：
   - 顶部标签「路径 A」蓝色
   - 标题：📱 小程序直接审批

   - **Mockup 1：操作前**（标题「操作前」灰色小字）
     - 复用步骤 4 的小程序聊天气泡样式
     - 消息内容 + 两个可点击按钮（蓝色「✅ 同意」、红色「❌ 拒绝」）

   - 中间箭头 ▼ + 文字「点击「✅ 同意」」

   - **Mockup 2：操作后**（标题「操作后」灰色小字）
     - 同样的消息气泡
     - 按钮变为灰色（background #d9d9d9, color #999），文字变为「已同意 ✓」（单个灰色按钮，另一个按钮消失）

   - 中间箭头 ▼ + 文字「聊天室收到结果通知」

   - **Mockup 3：结果通知**（标题「二次结果通知」灰色小字）
     - 新的消息气泡：「【审批结果】【CyberBot】的追加投资申请已通过。操作人：Miya，操作时间：2026-04-16 09:18。」
     - 气泡加绿色左边框 3px solid #52c41a

   **路径 B — Web 端审批**（flex 1, border 2px solid #1677ff, border-radius 10px, padding 16px）：
   - 顶部标签「路径 B」蓝色
   - 标题：🖥️ Web 端审批

   - **Mockup 1：审批列表**（标题「审批列表页」灰色小字）
     - 简化版表格（3 列：企业名称 | 审批状态 | 操作）
     - 第一行：CyberBot | 待审批 | 「拒绝」红色链接 + 「通过」蓝色链接
     - 「通过」链接加 `.highlight-box` 高亮 + 标注「← 点击操作」

   - 中间箭头 ▼ + 文字「点击「通过」」

   - **Mockup 2：确认弹窗**（标题「二次确认弹窗」灰色小字）
     - 模拟 Modal（background #fff, border-radius 8px, box-shadow, padding 20px, max-width 400px）
     - 标题：「确认通过」
     - 内容：「确认通过 CyberBot 的持股企业追加投资申请？」
     - 备注输入框：placeholder「备注（选填）」
     - 底部按钮：「取消」灰色 +「确认通过」蓝色
     - 弹窗外层半透明遮罩（background rgba(0,0,0,0.15)）

   **路径 C — 超时未处理**（flex 1, border 2px solid #ff4d4f, border-radius 10px, padding 16px）：
   - 顶部标签「路径 C」红色
   - 标题：⏰ 超时未处理

   - **Mockup：超时状态**
     - 消息气泡（同小程序样式）
     - 消息内容正常显示
     - 按钮区域已移除
     - 消息底部追加红色文字「⏰ 已超时 — 系统自动拒绝」（color #ff4d4f, font-size 12px）

   - 下方文字说明：「截止时间内无人操作，系统自动将审批状态变为「超时拒绝」，并发送超时通知。」

- [ ] **Step 2: 浏览器验证**

确认：三列并排、路径 A 有操作前/后/结果通知三个 Mockup、路径 B 有表格+弹窗、路径 C 有超时状态、高亮标注清晰。

- [ ] **Step 3: Commit**

```bash
git add docs/flowcharts/approval-workflow.html
git commit -m "feat(flowchart): 步骤5 — 三条审批路径 Mockup（小程序/Web/超时）"
```

---

### Task 8: 步骤 6 — 审批结果通知

**Files:**
- Modify: `docs/flowcharts/approval-workflow.html`（在步骤 5 后追加）

- [ ] **Step 1: 添加步骤 6 区块**

追加箭头 + `<section id="step6" class="step-block">`：

1. 编号「6」（绿色背景 #52c41a）+ 标题「审批结果通知 — 三渠道同步」
2. 描述：「不论通过哪条路径完成审批，系统都自动向所有通知对象发送结果通知。路径 A（小程序审批）的结果通知直接以新消息形式出现在聊天室中。」
3. `display: flex; gap: 16px` 三列并排：

   **已通过**（flex 1, border 2px solid #52c41a, border-radius 10px, padding 16px, background #f6ffed）：
   - 顶部标签 ✅ 已通过（绿色）
   - 小程序消息气泡：「【审批结果】【CyberBot】的追加投资申请已通过。操作人：Miya，操作时间：2026-04-16 09:18。」
   - 邮件摘要：Subject「消息通知：审批操作结果」，正文摘要「...申请已由 Miya 审批通过。相关流程将继续执行...」
   - 站内信摘要：「【CyberBot】的追加投资申请已通过，操作人：Miya。」

   **已拒绝**（flex 1, border 2px solid #ff4d4f, border-radius 10px, padding 16px, background #fff1f0）：
   - 顶部标签 ❌ 已拒绝（红色）
   - 小程序消息气泡：「【审批结果】【CyberBot】的追加投资申请已被拒绝。操作人：Tom，操作时间：2026-04-16 09:20。」
   - 邮件摘要：Subject「消息通知：审批操作结果」，正文摘要「...申请已由 Tom 拒绝。如有疑问，请联系...」
   - 站内信摘要：「【CyberBot】的追加投资申请已被拒绝，操作人：Tom。」

   **超时拒绝**（flex 1, border 2px solid #8c8c8c, border-radius 10px, padding 16px, background #fafafa）：
   - 顶部标签 ⏰ 超时拒绝（灰色）
   - 小程序消息气泡：「【审批结果】【CyberBot】的追加投资申请已超时自动拒绝。」
   - 邮件摘要：Subject「消息通知：审批操作超时」，正文摘要「...申请因未在规定时间内处理，已自动失效并终止...」
   - 站内信摘要：「【CyberBot】的追加投资申请已超时自动拒绝。」

4. 页脚分隔线 + 底部文字居中：「— 流程结束 —」

- [ ] **Step 2: 浏览器验证**

确认：三种结果并排、颜色区分正确（绿/红/灰）、通知文案与需求文档一致。

- [ ] **Step 3: Commit**

```bash
git add docs/flowcharts/approval-workflow.html
git commit -m "feat(flowchart): 步骤6 — 审批结果通知（三种结果 × 三渠道）"
```

---

### Task 9: 最终打磨 + 文档同步

**Files:**
- Modify: `docs/flowcharts/approval-workflow.html`（整体检查调整）
- Modify: `doc/page_map.md`（新增流程图条目）
- Modify: `doc/changelog.md`（追加变更记录）

- [ ] **Step 1: 整体浏览器检查**

```bash
open docs/flowcharts/approval-workflow.html
```

逐项检查：
- 页头标题和副标题
- 流程总览 6 步节点 + 步骤 3 分叉
- 步骤 1 占位区域
- 步骤 2 表格 + 高亮行
- 步骤 3 规则表格 + 分叉图
- 步骤 4 三渠道大框
- 步骤 5 三路径并排
- 步骤 6 三种结果
- 整体滚动流畅性
- 步骤间箭头连接视觉连贯性

修复发现的任何对齐、间距、颜色问题。

- [ ] **Step 2: 打印预览检查**

浏览器中 Cmd+P 打印预览，确认：分页位置合理、没有被截断的 Mockup。如果有问题，在关键元素上添加 `page-break-inside: avoid`。

- [ ] **Step 3: 更新 page_map.md**

在 `doc/page_map.md` 中追加：

```markdown
| docs/flowcharts/approval-workflow.html | 审批流程可视化 | 独立 HTML | 汇报/培训用流程图 |
```

- [ ] **Step 4: 更新 changelog.md**

在 `doc/changelog.md` 顶部追加：

```markdown
### 2026-04-16 — 审批流程可视化汇报页面

- 新增 `docs/flowcharts/approval-workflow.html`，独立 HTML 长页面
- 覆盖审批全流程 6 步：业务触发 → 生成审批单 → 规则匹配 → 三渠道通知 → 审批操作 → 结果通知
- 蓝图风格 Mockup，关键区域高亮标注
- 用途：老板汇报 + 公司管理员培训
```

- [ ] **Step 5: Commit**

```bash
git add docs/flowcharts/approval-workflow.html doc/page_map.md doc/changelog.md
git commit -m "feat(flowchart): 审批流程可视化页面完成 — 打磨 + 文档同步"
```
