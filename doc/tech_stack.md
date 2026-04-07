# 技术栈说明

## 框架

| 项目 | 技术 | 版本 |
|------|------|------|
| 前端框架 | React | 18.x |
| 应用框架 | Umi | 4.3.x |
| UI 组件库 | Ant Design | 5.17.x |
| 图表库 | @ant-design/plots | 2.6.x（基于 G2 v5） |
| 图标库 | @ant-design/icons | 5.3.x |
| Pro 组件 | @ant-design/pro-components | 2.7.x |
| 日期处理 | dayjs | 1.11.x |
| 语言 | TypeScript | 5.4.x |

## 构建与包管理

| 项目 | 说明 |
|------|------|
| 包管理器 | npm |
| 构建工具 | Umi 内置（Webpack / MFSU） |
| 开发服务器 | `npm run dev`（umi dev） |
| 生产构建 | `npm run build`（umi build） |

## 项目配置

| 配置项 | 说明 |
|--------|------|
| 路由模式 | 配置式路由（`.umirc.ts` 中 `routes` 字段） |
| 全局主题 | `src/app.tsx` 中 ConfigProvider，主色 `#1677ff` |
| 全局样式 | `src/styles/global.less` |
| 布局 | `src/layouts/index.tsx`，Sider + Header + Content 三栏布局 |

## 目录结构

```
group-admin-web/
├── CLAUDE.md                  # 项目级记忆体
├── .umirc.ts                  # Umi 配置（路由、代理等）
├── doc/                       # 项目文档
├── public/                    # 静态资源（favicon 等）
├── src/
│   ├── app.tsx                # 全局 ConfigProvider + 主题配置
│   ├── layouts/index.tsx      # 全局布局（侧边栏、头部、面包屑）
│   ├── styles/
│   │   ├── global.less        # 全局 CSS
│   │   ├── design-spec.md     # 视觉规范
│   │   ├── data-spec.md       # 数据口径规范
│   │   └── dev-pitfalls.md    # 开发避坑规范
│   ├── pages/                 # 页面组件（按模块分目录）
│   ├── assets/                # 图片资源（logo、icon 等）
│   └── typings.d.ts           # 全局类型声明
└── package.json
```
