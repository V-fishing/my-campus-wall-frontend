# campus-wall-frontend - Claude Code 开发指南

## 项目概述

校园墙 C 端用户前端，面向高校学生，提供帖子社区、AI 学长问答、实时私信、个人中心。基于 **uni-app 3 + Vue 3 + TypeScript** 的多端应用，**主端为微信小程序**（同时可构建 H5）。

## 技术栈

- uni-app 3.0 + Vue 3.4 + TypeScript
- Vite 5.2 构建
- Pinia（状态管理）
- tailwindcss 3 + weapp-tailwindcss（小程序原子化 CSS）
- Sass、marked（渲染 AI 回答 Markdown）
- Vitest（单测）

## 目录结构

```
src/
├── config/
│   └── index.ts        # 环境配置统一入口：config.apiBaseUrl / config.wsBaseUrl（读 VITE_ 前缀变量）
├── utils/
│   ├── request.js      # 请求层：基址取自 config，自动注入 JWT，401 清登录态
│   ├── websocket.js    # WebSocket：ws://host/ws/chat/{userId}，心跳 + 断线重连
│   ├── auth.js         # 登录态/token 读写
│   └── logout.js       # 登出清理
├── api/
│   ├── index.js        # API 聚合导出（community / social / ai / admin 等模块统一出口）
│   ├── aiPreference.js  browseHistory.js  feedback.js
│   └── index.d.ts      # 类型声明
├── stores/
│   ├── user.ts         # 用户/登录态（Pinia）
│   └── interaction.ts  # 点赞/收藏等交互状态
├── composables/
│   ├── useAuthGuard.ts  usePagination.ts  useTimeAgo.ts
├── pages/              # 页面（按底部 5 Tab 分组，见下）
├── components/         # 公共组件
├── static/            # 静态资源
├── pages.json         # uni-app 页面/分包/Tab 配置（路由源头）
├── manifest.json      # uni-app 应用配置（小程序 appid 等）
└── main.ts            # 入口
```

## 底部 5 Tab 与页面分组

`index`(圈子/帖子列表) · `discover`(发现/分类搜索) · `ai`(AI 学长问答 + 对话内配图找帖 + 对话内联 AI 发帖草稿/历史/偏好) · `message`(私信/通知/点赞/粉丝) · `user`(个人中心/选学校/我的帖子收藏/学生认证/设置)。
其它：`post`(详情，含二手联系卖家、组队 join/leave)、`publish`(按板块表单)、`search`、`login`、`leaderboard`、`hot-posts`、`document`。

## 后端与契约

- 唯一后端是 `campus_wall`（Java，:8080）：HTTP `/api/v1/*` + WebSocket `/ws/chat/{userId}`。
- 统一响应 `Result<T> = { code, message, data }`，成功 `code === 200`。
- 鉴权：JWT，请求头 `Authorization: Bearer <token>`。
- **AI 学长入口在 `/api/v1/ai-senior/*`**（前端只调 Java 后端，不直连 AI 服务 `campus-wall-ai`:8011；旧 `/ai-senior/chat`、`/chat/stream` 已下线）：
  - `POST /agent`：问答 / 找帖（`aiApi.agent(question, conversationId, images)`）。**对话内可附图**——传图片 MinIO object name，后端 VLM「看图说话」转文本后并入检索去匹配帖子（带图问答用更长超时，VLM 慢）。
  - **对话内联 AI 发帖（草稿流）**：`POST /posts/draft` 出草稿 → `POST /posts/resume/{draftId}`（edit/publish/cancel）→ `DELETE /posts/draft/{draftId}`；`chat.vue` 内联渲染草稿卡片（已改 N 版 / 已发布 ✓ / 已取消），图片复用发帖上传管线（`/files/post/temp-images`）。
  - 历史：`/ai-senior/history/{list,detail}`。

## 常用命令

```bash
npm install
npm run dev:mp-weixin      # 开发微信小程序 → 微信开发者工具导入 dist/dev/mp-weixin
npm run build:mp-weixin    # 构建微信小程序产物
npm run dev:h5             # 开发 H5
npx vitest                 # 单测
```

## 环境变量

复制 `.env.example` → `.env.local`，配：
- `VITE_API_BASE_URL`（后端 HTTP 基址，默认 `http://localhost:8080`）
- `VITE_WS_BASE_URL`（WebSocket 基址，默认 `ws://localhost:8080`）

> 团队内网开发时指向连得到 GB10/后端的地址；**`.env.local` 含本地配置，已被忽略，勿提交**。

## 约定

- 改路由/新增页面：先动 `pages.json`（uni-app 以它为准，不是文件路径约定）。
- 网络请求统一走 `src/utils/request.js`，勿在页面里散写 `uni.request`；新接口加到 `src/api/`。
- 小程序无 `EventSource`/`fetch` 流式，AI 回答按整段返回渲染（marked）。
- 样式优先 tailwind 原子类（小程序经 weapp-tailwindcss 转换），注意小程序选择器限制。
