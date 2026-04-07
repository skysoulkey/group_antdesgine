# 站内通知功能设计说明

> 本文档记录"站内通知"功能的业务规则、数据模型及 API 接口设计。
> 前端 Mock 阶段仅实现 UI 形态，以下规则需在真实后端接入时落地。

---

## 一、功能概述

### 1.1 站内通知定义

- 系统内部消息通道，用户登录后在页面右上角铃铛图标处实时接收
- 与现有 APP 推送、邮件通知并列的第三种通知渠道
- 支持已读/未读状态管理，支持"全部已读"批量操作

### 1.2 通知类型

| 通知类型 | 触发场景 |
|---------|---------|
| 集团下拨 | 集团向公司下拨资金时 |
| 集团调回 | 集团从公司调回资金时 |
| 持股企业追加投资 | 持股企业发起追加投资时 |
| 下辖企业解散 | 下辖企业申请解散时 |
| 新增订阅企业 | 有新企业完成订阅时 |
| 下辖企业认证过期 | 下辖企业认证到期时 |

### 1.3 通知渠道

| 渠道 | 说明 |
|------|------|
| 站内通知 | 系统内铃铛下拉面板 + 通知管理页面 |
| APP 推送 | 通过 APP 端机器人（Bot）向用户推送 |
| 邮件通知 | 通过 SMTP 发件箱向用户邮箱发送 |

### 1.4 访问权限与数据隔离

#### 角色可见性

| 角色 | 可访问 | 数据范围 |
|------|--------|---------|
| 集团管理员 | 通知记录、通知配置、通知偏好 | 仅本集团产生的通知记录，仅本集团下用户的配置与偏好 |
| 公司管理员 | 通知记录、通知配置、通知偏好 | 仅本公司产生的通知记录，仅本公司下用户的配置与偏好 |

#### 后端数据隔离规则

1. **通知记录（notification_log / notification_inbox）**
   - 集团管理员：`WHERE group_id = 当前用户.group_id`
   - 公司管理员：`WHERE company_id = 当前用户.company_id`
   - 所有查询接口必须从 Token 中解析归属信息，**禁止前端传入 group_id / company_id**

2. **通知配置（通知对象：APP 账号 / 邮件地址）**
   - 集团管理员：可查看/编辑本集团下所有用户的通知接收配置
   - 公司管理员：仅可查看/编辑本公司下用户的通知接收配置
   - 配置记录需关联 `group_id` 和 `company_id`

3. **通知偏好（user_notification_preference）**
   - 集团管理员：可查看/编辑本集团下所有用户的渠道偏好
   - 公司管理员：仅可查看/编辑本公司下用户的渠道偏好
   - 用户下拉列表仅返回当前管理员权限范围内的用户

4. **铃铛站内通知（inbox）**
   - 每位用户只能看到自己的站内通知（`WHERE user_id = 当前用户.id`）
   - 未读计数同理，仅统计本人的未读数

#### 前端适配

- 通知偏好 Tab 的用户下拉列表，请求时后端根据角色自动过滤可管理用户
- 通知记录 Tab 的数据，后端根据角色自动过滤归属范围
- 前端无需传递 group_id / company_id 参数，后端从登录态获取

---

## 二、站内通知业务逻辑

### 2.1 通知生成流程

```
[业务事件触发]
      ↓
[查询 user_notification_preference 表]
  筛选 channel_in_app = true 的目标用户
      ↓
[为每个目标用户生成一条 notification_inbox 记录]
  is_read = false, is_deleted = false
      ↓
[通过 WebSocket / SSE 推送至前端]
  前端更新铃铛 Badge 未读计数
```

### 2.2 通知状态机

```
  ┌─────────┐     用户点击单条     ┌────────┐
  │  未读   │ ──────────────────→ │  已读  │
  │(is_read │     全部已读        │(is_read│
  │= false) │ ──────────────────→ │= true) │
  └─────────┘                     └────────┘
       │                               │
       │       用户手动删除             │
       └──────────────┬────────────────┘
                      ↓
               ┌─────────────┐
               │   已删除    │
               │(is_deleted  │
               │ = true)     │
               └─────────────┘
```

- 删除为软删除，数据保留在数据库中
- 前端查询时默认过滤 `is_deleted = true` 的记录

### 2.3 通知保留策略

- 默认保留 **90 天**，可在系统设置 → 通知配置中自定义
- 后台定时任务（建议每日凌晨 3:00）清理超过保留期的记录
- 清理范围：`created_at < NOW() - retention_days` 的所有记录（含已读和已删除）

---

## 三、用户通知偏好配置

### 3.1 数据模型

**表名**: `user_notification_preference`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint PK | 自增 ID |
| user_id | bigint FK → users | 用户 ID |
| notification_type | varchar(50) | 通知类型（枚举值） |
| channel_in_app | boolean | 站内通知开关，默认 true |
| channel_app | boolean | APP 推送开关，默认 true |
| channel_email | boolean | 邮件通知开关，默认 true |
| updated_at | timestamp | 最后更新时间 |

**唯一约束**: `(user_id, notification_type)`

### 3.2 业务规则

1. **新用户默认全部开启** — 创建用户时，自动为所有通知类型插入默认记录（三个渠道均为 true）
2. **管理员代配置** — 集团管理员可配置本集团下所有用户的通知偏好；公司管理员可配置本公司下用户
3. **至少一种渠道** — 前端校验：同一通知类型下，三个渠道不可同时关闭
4. **新增通知类型兼容** — 后端新增通知类型后，若用户无对应偏好记录，视为全部渠道开启（代码中 fallback 处理）

---

## 四、发件箱配置（后端）

### 4.1 SMTP 配置项

| 配置项 | 类型 | 说明 |
|--------|------|------|
| smtp_host | string | SMTP 服务器地址，例：smtp.gmail.com |
| smtp_port | int | 端口，常见值：465(SSL) / 587(TLS) |
| smtp_sender | string | 发件人地址，例：noreply@example.com |
| smtp_username | string | SMTP 登录用户名 |
| smtp_password | string | SMTP 登录密码，**AES-256 加密存储** |
| smtp_ssl | boolean | 是否启用 SSL/TLS |
| smtp_enabled | boolean | 邮件通知总开关 |

### 4.2 存储方式

- 存入 `system_config` 表，`config_key` 前缀为 `smtp_`
- 密码字段使用 AES-256-GCM 加密，密钥从环境变量 `CONFIG_ENCRYPT_KEY` 读取
- API 返回时密码字段脱敏显示为 `****`

### 4.3 连通性验证

- 保存配置前，后端先发送一封测试邮件至管理员邮箱
- 测试邮件主题：`[商户管理平台] 邮件配置验证`
- 发送成功后方可保存配置；失败则返回错误信息，不保存

### 4.4 发送失败处理

- 邮件发送失败时，记录 `notification_log`，status = `failed`，写入 `error_message`
- **重试机制**：失败后自动重试 3 次，间隔 30s → 60s → 120s（指数退避）
- 3 次重试均失败后，最终状态标记为 `failed`，不再重试

### 4.5 API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/system/config/email` | 获取邮件配置（密码脱敏） |
| PUT | `/api/system/config/email` | 更新邮件配置 |
| POST | `/api/system/config/email/test` | 发送测试邮件，返回成功/失败 |

---

## 五、APP 端机器人通知

### 5.1 概述

APP 端通知通过机器人（Bot）账号向用户推送消息，类似 Telegram Bot 或企业微信机器人。
机器人以系统身份发送，用户在 APP 端的聊天列表中接收。

### 5.2 配置项

| 配置项 | 类型 | 说明 |
|--------|------|------|
| bot_token | string | Bot API Token / API Key，**加密存储** |
| bot_name | string | Bot 展示名称，例：商户管理平台助手 |
| bot_webhook_url | string | Webhook 推送地址（如适用） |
| bot_enabled | boolean | APP 推送总开关 |

存储方式同邮件配置，`config_key` 前缀为 `bot_`。

### 5.3 推送流程

```
[业务事件触发]
      ↓
[查询 user_notification_preference]
  筛选 channel_app = true 的目标用户
      ↓
[获取用户 APP 账号标识]
  从用户表或通知配置中读取 APP username
      ↓
[构造消息体，调用 Bot API]
  POST {bot_webhook_url}/sendMessage
  Header: Authorization: Bearer {bot_token}
  Body: { target, title, content, link }
      ↓
[记录推送结果至 notification_log]
  channel = 'app', status = 'sent' | 'failed'
```

### 5.4 消息格式

```json
{
  "target": "@miya_miya",
  "title": "集团下拨通知",
  "content": "集团已向 [滴滴答答] 下拨 50,000.00 USDT，请及时确认。",
  "link": "https://admin.example.com/company/transfer?id=TF0001",
  "timestamp": "2026-04-07T10:30:00+08:00"
}
```

- **title**: 通知类型名称
- **content**: 事件详情，包含关键数据（金额、公司名等）
- **link**: Deep link，点击可跳转至管理平台对应页面
- **timestamp**: ISO 8601 格式

### 5.5 失败处理

- 推送失败记入 `notification_log`，status = `failed`，写入 `error_message`
- **重试策略**：同邮件（3 次，30s / 60s / 120s 指数退避）
- **熔断告警**：同一 Bot 在 1 小时内连续失败超过 **10 次**，则：
  1. 暂停该 Bot 推送（bot_enabled 自动置为 false）
  2. 向所有集团管理员发送站内通知："APP 机器人推送异常，已自动暂停，请检查配置"
  3. 记录系统日志

---

## 六、数据模型

### 6.1 notification_inbox（站内通知收件箱）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint PK | 自增 ID |
| group_id | bigint FK → groups | 所属集团，用于数据隔离 |
| company_id | bigint FK → companies | 所属公司，nullable（集团级通知为空） |
| user_id | bigint FK → users | 接收用户 |
| notification_type | varchar(50) | 通知类型 |
| title | varchar(200) | 通知标题 |
| content | text | 通知正文 |
| is_read | boolean | 是否已读，默认 false |
| is_deleted | boolean | 软删除标记，默认 false |
| created_at | timestamp | 创建时间 |
| read_at | timestamp | 阅读时间，nullable |

**索引**:
- `idx_inbox_user_unread`: (user_id, is_read, is_deleted) — 加速未读查询
- `idx_inbox_group`: (group_id) — 加速按集团过滤
- `idx_inbox_company`: (company_id) — 加速按公司过滤
- `idx_inbox_created`: (created_at) — 加速过期清理

### 6.2 notification_log（通知发送记录，覆盖所有渠道）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint PK | 自增 ID |
| group_id | bigint FK → groups | 所属集团，用于数据隔离 |
| company_id | bigint FK → companies | 所属公司，nullable（集团级通知为空） |
| notification_type | varchar(50) | 通知类型 |
| channel | enum('in_app', 'app', 'email') | 发送渠道 |
| target_user_id | bigint FK → users | 目标用户 |
| target_address | varchar(200) | 目标地址（邮箱 / APP 账号 / 用户名） |
| title | varchar(200) | 通知标题 |
| content | text | 通知内容 |
| status | enum('pending', 'sent', 'failed') | 发送状态 |
| retry_count | int | 已重试次数，默认 0 |
| sent_at | timestamp | 实际发送时间 |
| error_message | text | 失败原因，nullable |
| created_at | timestamp | 记录创建时间 |

**索引**:
- `idx_log_group`: (group_id) — 加速按集团过滤
- `idx_log_company`: (company_id) — 加速按公司过滤
- `idx_log_channel_type`: (channel, notification_type) — 加速按渠道/类型筛选
- `idx_log_status`: (status) — 加速查询失败记录

---

## 七、API 接口

### 7.1 站内通知

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/notifications/inbox` | 查询站内通知列表 |
| PUT | `/api/notifications/inbox/:id/read` | 标记单条已读 |
| PUT | `/api/notifications/inbox/read-all` | 全部标记已读 |
| DELETE | `/api/notifications/inbox/:id` | 软删除单条通知 |
| GET | `/api/notifications/inbox/unread-count` | 获取未读数量 |

**GET /api/notifications/inbox 参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| page | int | 页码，默认 1 |
| size | int | 每页条数，默认 20 |
| is_read | boolean | 筛选已读/未读，可选 |
| notification_type | string | 按通知类型筛选，可选 |

### 7.2 通知偏好

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/notifications/preferences` | 获取指定用户的通知偏好 |
| PUT | `/api/notifications/preferences` | 批量更新通知偏好 |

**GET 参数**: `user_id` (required)

**PUT Body**:
```json
{
  "user_id": "U001",
  "preferences": [
    {
      "notification_type": "集团下拨",
      "channel_in_app": true,
      "channel_app": true,
      "channel_email": false
    }
  ]
}
```

### 7.3 通知发送记录

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/notifications/log` | 查询通知发送记录（扩展现有接口） |

**GET 参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| page | int | 页码 |
| size | int | 每页条数 |
| channel | string | 渠道筛选：in_app / app / email |
| notification_type | string | 通知类型筛选 |
| target | string | 通知对象关键词 |
| status | string | 发送状态筛选 |

### 7.4 Bot 配置

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/system/config/bot` | 获取 Bot 配置（token 脱敏） |
| PUT | `/api/system/config/bot` | 更新 Bot 配置 |
| POST | `/api/system/config/bot/test` | 发送测试消息 |
