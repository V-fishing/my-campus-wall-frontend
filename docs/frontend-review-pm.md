# 校园墙小程序前端 — 项目评审与优化路线图

> 角色：项目经理视角  
> 扫描范围：`my-campus-wall-fronted/` 全部源码（36 个源文件）  
> 评审日期：2026-06-01

---

## 一、项目概况

| 维度 | 现状 |
|------|------|
| 框架 | uni-app 3.0（Vue 3 Composition API + Vite 5） |
| 目标平台 | 微信小程序（主），H5（副） |
| 页面数 | 33 页（5 个 Tab + 28 个子页面） |
| 组件数 | 2 个共享组件（CustomTabBar、my-navbar） |
| 状态管理 | 无（仅靠 localStorage + 组件内 ref） |
| 语言 | TypeScript 配置已存在，但页面全部用 JavaScript |
| UI 主题 | 两套并存：SCSS 蓝色系 + Tailwind 粉色系 |
| 代码检查 | 无 ESLint / Prettier |
| 测试 | 无 |
| CI/CD | 无 |

**结论**：功能覆盖完整（33 页覆盖社区/AI/社交/个人中心），但工程化水平处于早期阶段，距生产标准有明确差距。

---

## 二、严重问题（上线阻塞项）

### 2.1 硬编码 IP 地址（3 处）

| 位置 | 硬编码内容 | 风险 |
|------|-----------|------|
| `utils/request.js` | `BASE_URL = 'http://172.21.160.223:8080'` | 切换环境需改代码 |
| `pages/publish/publish.vue` | `http://192.168.1.185:8080`（多处） | **与 request.js 用的 IP 不同！** |
| `utils/websocket.js` | `ws://localhost:8080/ws/chat/` | 生产环境无法建连 |

**解决**：统一从 `manifest.json` 或 `.env` 读取，通过 uni-app 环境变量区分 dev/prod。

### 2.2 硬编码模拟数据

| 位置 | 内容 | 风险 |
|------|------|------|
| `pages/index/index.vue` | `categoryTabs` 默认值 | 服务端挂了时展示假数据 |
| `pages/index/index.vue` | 热门帖子 placeholder | 同上 |
| `pages/ai/chat.vue` | `currentUserId = ref(1)` | 未登录时用 ID=1 发送请求 |

### 2.3 WXSS 兼容风险

Tailwind CSS 通过 `weapp-tailwindcss` 插件编译，但微信小程序的 WXSS 选择器限制（不支持属性选择器、不支持部分伪类）意味着某些 Tailwind 类可能在真机上失效。当前未见系统性兼容测试。

---

## 三、架构层面问题

### 3.1 无状态管理方案

**现状**：全项目零 Pinia / Vuex，数据共享靠 `uni.setStorageSync` + `uni.$emit`。

**后果**：
- 点赞/收藏状态同步靠 localStorage 手动管理，4 个页面各自复制了一份"乐观更新"逻辑
- 用户信息（昵称、头像、学校）变更后，Tab 栏、个人中心、帖子列表的展示不同步
- 未读数（消息、通知）没有统一管理，各处各自拉取

**建议**：引入 Pinia（Vue 3 官方推荐，体积小，兼容 uni-app）。至少建立 3 个 Store：

| Store | 职责 |
|-------|------|
| `useUserStore` | 用户信息、登录态、token、学校选择 |
| `useInteractionStore` | 点赞/收藏状态缓存 + 乐观更新封装 |
| `useMessageStore` | 未读消息/通知计数 + WebSocket 事件消费 |

### 3.2 无 Composables 模式

**现状**：项目已使用 Vue 3 `<script setup>`，但零个共享 composable 函数。

**重复出现的逻辑**：
- `savePostLikeState` / `getPostLikeState` — 在 index、discover、post/detail 中近乎一模一样
- 时间格式化（"刚刚"、"3分钟前"）— 至少 5 个页面各自实现
- 分页加载（上拉触底加载更多）— 每个列表页各自写一遍
- 登录态检查 — 每个页面 onLoad 时各自判断

**建议**：抽取 5 个核心 composable：

```
src/composables/
  useLike.ts         — 点赞/收藏乐观更新
  usePagination.ts   — 分页加载 + 下拉刷新 + 加载更多
  useTimeAgo.ts      — 时间格式化
  useAuth.ts         — 登录态守卫
  useShare.ts        — 微信分享卡片配置
```

### 3.3 两套主题体系并存

| 体系 | 主色 | 文件 | 使用范围 |
|------|------|------|---------|
| SCSS 变量 | 蓝色 `#65BBE8` | `uni.scss` | 旧页面（部分） |
| Tailwind 类 | 粉色/玫瑰 `#9B4053` | `tailwind.config.cjs` | 新页面 |

**后果**：页面间视觉不一致，修改主题需要同时改两处。

**建议**：二选一，将 Tailwind 主题色与 SCSS 变量统一，或者直接废弃 `uni.scss`，全部走 Tailwind。

---

## 四、代码质量问题

### 4.1 TypeScript 配置存在但未使用

`tsconfig.json`、`vue-tsc` 依赖均已配置，但所有 `.vue` 文件的 `<script>` 块均为纯 JavaScript。

**建议**：分阶段迁移——
1. 新页面/组件强制 TypeScript
2. `utils/` 和 `api/` 优先改造（收益最大：类型安全 + IDE 提示）
3. 旧页面逐步覆盖，不设硬性 deadline

### 4.2 无代码规范自动化

无 ESLint、Prettier、pre-commit hook。代码风格完全依赖开发者自律。

**建议**：
```bash
npm i -D eslint @vue/eslint-config-typescript prettier eslint-config-prettier
# 配置 .eslintrc.cjs + .prettierrc + simple-git-hooks
```

推荐规则集：`@vue/eslint-config-typescript` + `eslint-config-prettier`，在 `package.json` 中加：
```json
"lint-staged": {
  "*.{vue,ts,js}": ["eslint --fix", "prettier --write"]
}
```

### 4.3 空文件

`src/utils/like.js` 为空文件（0 行），可能是计划中的 TODO 但未实现。

---

## 五、性能优化方向

### 5.1 图片加载

**现状**：帖子列表图片直接渲染原图 URL，无懒加载，无缩略图策略。

**建议**：
- 列表页使用缩略图（建议服务端生成 200x200 缩略图）
- 详情页才加载原图
- 开启 `uni-app` 的 `image` 组件 `lazy-load` 属性
- 限制列表中同时渲染的图片数量（虚拟列表或按需加载）

### 5.2 分包加载

**现状**：小程序 33 个页面全部在主包。

**建议**：按访问频率分包：
```
主包（Tab 页）：index, discover, ai/chat, message, user/profile
分包A-社区：post/detail, publish, search, hot-posts, leaderboard
分包B-社交：message/chat-detail, message/like-list, message/notification-list, message/fans-list
分包C-个人：user/* 全部子页面
分包D-其他：login, document, ai/ai-history, ai/preference
```

### 5.3 API 请求优化

**问题**：
- 首页同时发 3-4 个请求（帖子列表、热门帖子、分类列表、用户信息），无并发控制
- 搜索结果无防抖
- 同一帖子在不同页面重复请求

**建议**：
- 首页请求用 `Promise.all` 并发
- 搜索框加 300ms 防抖
- 帖子数据用 `uni.setStorage` 做简易缓存（30s 过期）
- 配合后端 ETag/Last-Modified 减少传输

### 5.4 列表性能

帖子列表在滚动加载更多时，持续拼接数组而不做虚拟化。当用户滚动到列表尾部（200+ 条），DOM 节点数激增。

**建议**：
- 短期：限制单列表最多保留 100 条，超出移除旧数据（`slice(-100)`）
- 长期：评估 `z-paging` 或 `uni-app` 的 `recycle-list` 组件

---

## 六、用户体验改进

### 6.1 离线体验

**现状**：无网络时大部分页面空白或报错。

**建议**：
- 关键页面（首页、个人中心）缓存上次成功数据，无网络时展示缓存 + "网络不可用"标识
- 点赞/收藏操作在无网时加入重试队列

### 6.2 骨架屏

**现状**：所有列表加载中显示 `uni.showLoading` 全屏遮罩。

**建议**：为核心列表（首页、发现页、消息列表）实现骨架屏组件，减少感知等待时间。

### 6.3 错误处理统一

**现状**：每个页面独自 try/catch，错误提示方式不统一（有的 `uni.showToast`，有的静默失败）。

**建议**：
- `request.js` 拦截器统一处理所有 HTTP 错误
- 页面层只处理业务错误（如"帖子已删除"）
- 定制一个全局错误展示组件（轻提示 + icon + 可选重试按钮）

### 6.4 分享能力

**现状**：未发现微信分享卡片配置。

**建议**：为帖子详情页配置 `onShareAppMessage`，分享卡片展示帖子摘要 + 作者头像 + 小程序 Logo。

---

## 七、开发流程建议

### 7.1 环境管理

**现状**：3 个硬编码 IP，无 `.env` 文件，无环境切换机制。

**建议**：
```
.env.development    →  本地开发（localhost:8080）
.env.staging        →  测试服务器
.env.production     →  生产服务器
```

配合 `vite.config.ts` 的 `import.meta.env` 注入。

### 7.2 构建与部署

**现状**：`package.json` 提供了基本脚本（`dev:mp-weixin`, `build:mp-weixin`, `dev:h5`），但无 CI/CD。

**建议**：
- GitHub Actions 或 Jenkins pipeline：
  1. Lint 检查
  2. TypeScript 类型检查
  3. Build 生产包
  4. 上传微信小程序 CI（`miniprogram-ci`）
- 配置自动版本号（从 git tag 读取）

### 7.3 测试策略

**现状**：零测试。

**建议分阶段引入**：
1. **第一阶段**：为 `utils/` 写单元测试（auth, request, formatting）
2. **第二阶段**：为 composable 写单元测试
3. **第三阶段**：为关键页面写 E2E（发布帖子、登录、AI 对话）

推荐工具：`vitest`（与 Vite 同生态）+ `@vue/test-utils`。

---

## 八、优先级路线图

### Phase 1 — 止血（1-2 周）

| # | 任务 | 优先级 | 预估工时 |
|---|------|--------|---------|
| 1 | 环境变量统一：消除 3 处硬编码 IP | P0 | 0.5d |
| 2 | 删除硬编码模拟数据（mockData / userId=1） | P0 | 0.5d |
| 3 | 配置 ESLint + Prettier + pre-commit hook | P1 | 0.5d |
| 4 | 抽取 `useTimeAgo` / `usePagination` composable | P1 | 1d |
| 5 | 统一 Tailwind 和 SCSS 主题色 | P1 | 0.5d |

### Phase 2 — 稳固（2-4 周）

| # | 任务 | 优先级 | 预估工时 |
|---|------|--------|---------|
| 6 | 引入 Pinia：userStore + interactionStore | P1 | 2d |
| 7 | 抽取 `useLike` composable（消除 4 处重复） | P1 | 1d |
| 8 | `utils/` 和 `api/` 迁移 TypeScript | P1 | 2d |
| 9 | 首页骨架屏 + 图片懒加载 | P2 | 1.5d |
| 10 | 微信小程序分包配置 | P2 | 0.5d |
| 11 | 搜索防抖 + 请求缓存 | P2 | 1d |

### Phase 3 — 优化（4-8 周）

| # | 任务 | 优先级 | 预估工时 |
|---|------|--------|---------|
| 12 | WebSocket 完善（断线重连 + 消息对账） | P2 | 2d |
| 13 | 微信分享卡片配置 | P2 | 0.5d |
| 14 | 离线缓存 + 弱网提示 | P3 | 2d |
| 15 | vitest 单元测试（utils + composables） | P2 | 2d |
| 16 | CI/CD Pipeline（Lint + Build + 上传） | P2 | 1d |
| 17 | 错误统一处理组件 | P2 | 1d |

---

## 九、总结

**优势**：
- 功能覆盖完整，33 个页面承载了社交 + AI + 社区三大核心业务
- 技术选型合理：uni-app + Vue 3 + Vite 是 2026 年小程序开发的主流方案
- 乐观更新模式已在使用（虽代码重复），交互响应速度好
- 自定义 TabBar 和 Tailwind 主题设计完成度高

**核心短板**：
- 工程化基础设施缺失（无 lint、无 test、无 CI/CD、无状态管理）
- 硬编码问题严重（IP、假数据、userId），需立即修复
- 代码复用度低（同样逻辑散落 4-5 个页面），维护成本高
- TypeScript 配置存在但全项目未使用，类型安全保障为零

**总体评价**：功能层面已具备 MVP 质量，工程化层面距团队协作尚有差距。建议按 Phase 1 → Phase 2 → Phase 3 的路线推进，前两周集中解决 P0 问题，后续逐步提升代码质量和开发效率。
