# 校园墙 Vue3 前端答辩文档

## 一、项目概述

**项目定位**：校园墙小程序前端，服务大学生群体的校园社交与信息交流平台。  
**目标平台**：微信小程序为主，同时支持 H5 端。  
**核心目标**：一套代码跨端运行，覆盖「圈子、发现、AI、私信、我的」五大核心场景。

**技术栈总览**：

| 层级 | 技术选型 | 说明 |
|------|----------|------|
| 框架 | uni-app + Vue 3.4 | 跨平台，Composition API |
| 构建 | Vite 5.2 | 快速冷启动与热更新 |
| 语言 | TypeScript 4.9 | 类型安全 |
| 状态 | Pinia 2.1 | Vue 官方推荐，替代 Vuex |
| 样式 | Tailwind CSS 3.4 + Sass | 原子化 CSS + 自定义主题 |
| 测试 | Vitest + ESLint + Prettier | 单元测试与代码规范 |
| 国际化 | vue-i18n 9.1 | 多语言预留 |

> 关键入口：`E:\Desktop_fish\Campus-Wall\campus_wall\my-campus-wall-frontend\src\main.ts`  
> 关键配置：`vite.config.ts`、`tsconfig.json`、`tailwind.config.cjs`、`src\pages.json`

---

## 二、整体架构

### 2.1 架构选型：为什么用 uni-app + Vue3？

- **一套代码，多端运行**：通过 `@dcloudio/vite-plugin-uni` 编译到微信小程序与 H5，降低维护成本。
- **Vue3 Composition API**：逻辑复用更清晰，适合复杂页面（如聊天详情、首页信息流）。
- **Vite 构建**：启动快、热更新快，开发体验好。
- **TypeScript**：配合 `@dcloudio/types` 提供 uni-app API 类型支持。

### 2.2 目录结构

```
my-campus-wall-frontend/src/
├── App.vue                    # 根组件：全局生命周期、样式、图标库
├── main.ts                    # 应用入口：createSSRApp + Pinia
├── pages.json                 # 页面路由与自定义 TabBar 配置
├── manifest.json              # uni-app 应用配置
├── tailwind.css / uni.scss    # 全局样式
│
├── pages/                     # 页面（按业务模块分组）
│   ├── index/                 # 圈子首页
│   ├── discover/              # 发现页
│   ├── ai/                    # AI 学长助手
│   ├── message/               # 消息通知与私信聊天
│   ├── user/                  # 个人中心、资料、认证
│   ├── post/                  # 帖子详情
│   ├── publish/               # 发布动态
│   ├── search/                # 搜索
│   ├── hot-posts/             # 热帖榜
│   ├── leaderboard/           # 高校人气榜
│   ├── login/                 # 微信登录
│   └── document/              # 文档页
│
├── components/                # 公共组件
│   ├── my-navbar/             # 自定义导航栏
│   ├── CustomTabBar/          # 自定义底部 TabBar
│   └── AvatarStack/           # 头像堆叠
│
├── api/                       # API 接口定义
│   ├── index.js               # 按业务模块封装的接口
│   ├── index.d.ts             # 类型声明
│   └── api.test.ts            # 接口测试
│
├── utils/                     # 工具函数
│   ├── request.js             # HTTP 请求封装
│   ├── auth.js                # 登录态与 JWT 管理
│   ├── websocket.js           # WebSocket 单例管理器
│   └── logout.js              # 退出登录
│
├── stores/                    # Pinia 全局状态
│   ├── user.ts                # 用户状态
│   └── interaction.ts         # 点赞/收藏互动状态
│
├── composables/               # 可复用逻辑
│   ├── useAuthGuard.ts        # 登录守卫
│   ├── usePagination.ts       # 分页加载
│   └── useTimeAgo.ts          # 相对时间格式化
│
├── config/                    # 环境配置
│   └── index.ts               # API 地址、超时等
│
└── static/                    # 静态资源
    ├── tabbar/                # TabBar 图标
    └── material-icons.css     # Material Symbols 图标
```

---

## 三、核心模块设计

### 3.1 路由与页面架构

**路由配置**：`src/pages.json`

- 共配置 29+ 个页面。
- 使用 **自定义 TabBar**（`CustomTabBar.vue`），5 个一级入口：圈子、发现、AI、私信、我的。
- 全局 `navigationStyle: "custom"`，通过 `my-navbar` 自定义导航栏，统一适配状态栏高度。
- **easycom 自动引入**：`^my-(.*)` 匹配 `components/my-$1/my-$1.vue`。

**路由跳转规范**：

| 方法 | 场景 |
|------|------|
| `uni.switchTab` | TabBar 页面切换 |
| `uni.navigateTo` | 普通页面跳转，保留当前页 |
| `uni.redirectTo` | 关闭当前页跳转 |
| `uni.reLaunch` | 关闭所有页跳转（如登录后） |

**页面间传参**：URL Query 为主。

```js
// 消息列表 → 聊天详情
uni.navigateTo({
  url: `/pages/message/chat-detail?sessionId=${chat.id}&name=${encodeURIComponent(chat.chatPartnerName)}`
})
```

### 3.2 状态管理（Pinia）

**`src/stores/user.ts`**：用户全局状态

- `token`、`userId`、`nickname`、`avatar` 等字段。
- `isLogin` 计算属性。
- `hydrate()`：应用启动时从 `uni.getStorageSync` 恢复状态。
- `login(code)`：微信 code 换后端 token。
- `logout()`：清空状态与 Storage。

**`src/stores/interaction.ts`**：点赞/收藏状态

- **乐观更新**：先改本地状态，再发请求，失败回滚。
- 持久化到 `uni.setStorageSync`，避免刷新后状态丢失。
- 提供 `togglePostLike`、`togglePostCollect` 统一入口。

### 3.3 网络通信

#### HTTP 层：`src/utils/request.js`

- 基于 `uni.request` 封装 Promise 风格 API。
- **请求拦截器**：自动注入 `Authorization: Bearer <token>` 和 `X-Platform`。
- **响应拦截器**：统一处理 401（清除登录态并跳转登录页）。
- **平台适配**：H5 使用 `withCredentials` 携带 HttpOnly Cookie；小程序从 Storage 取 Token。

#### API 层：`src/api/index.js`

- 按业务模块集中管理接口：`postApi`、`userApi`、`chatApi`、`commentApi`、`aiApi`、`rankApi` 等。
- 每个接口返回 `{url, method, params/data}` 配置对象，由 `request.js` 统一执行。

#### WebSocket 层：`src/utils/websocket.js`

- **单例模式**：全局唯一 `WebSocketManager` 实例。
- **消息队列**：连接未就绪时入队，就绪后批量发送。
- **自动重连**：最多 5 次，间隔 3 秒。
- **心跳机制**：30 秒发送一次 `ping`。
- **事件订阅**：`on/off/emit` 模式，支持多页面监听。

主要用于私信实时消息推送：

```js
// chat-detail.vue 生命周期内注册/注销监听
onLoad(() => wsManager.on('message', handleMessage))
onHide(() => wsManager.off('message', handleMessage))
onUnload(() => wsManager.off('message', handleMessage))
```

### 3.4 组件化设计

| 组件 | 路径 | 职责 |
|------|------|------|
| my-navbar | `components/my-navbar/my-navbar.vue` | 自定义导航栏，状态栏适配 |
| CustomTabBar | `components/CustomTabBar/CustomTabBar.vue` | 自定义底部 TabBar，带动画指示器 |
| AvatarStack | `components/AvatarStack/AvatarStack.vue` | 头像堆叠展示 |

---

## 四、关键功能实现

### 4.1 登录认证流程

**文件**：`src/pages/login/login.vue`、`src/utils/auth.js`、`src/composables/useAuthGuard.ts`

```
用户点击微信登录
  → uni.login 获取微信 code
  → POST /api/v1/users/login 换取后端 JWT
  → saveLoginInfo() 保存 token + userInfo
  → Pinia userStore 同步更新
  → 跳转首页
```

**平台感知认证**：

- **小程序**：Token 存 `uni.setStorageSync`，请求时手动带 `Authorization`。
- **H5**：Token 由后端通过 HttpOnly Cookie 下发，前端不存储，请求带 `withCredentials`。

**登录守卫**：`useAuthGuard()` 在需要登录的操作前统一判断、提示、跳转。

### 4.2 首页信息流

**文件**：`src/pages/index/index.vue`

- 顶部搜索 + 校园/关注分段控制器。
- 热帖滚动 Banner。
- 双层话题导航：一级分类 + 二级话题下拉面板。
- 帖子列表分页加载（`usePagination`）。
- 点赞/收藏通过 `interaction.ts` 乐观更新。

### 4.3 私信即时通讯

**文件**：`src/pages/message/chat-detail.vue`

- 毛玻璃导航栏 + 消息滚动区域。
- 左右气泡布局，5 分钟时间分割线。
- 快捷回复、Emoji 面板、消息撤回（2 分钟内）。
- 上拉分页加载历史消息。
- 进入页面自动标记会话已读。

**消息收发流程**：

```
发送消息
  → 乐观清空输入框
  → HTTP POST /api/v1/messages/chat/send
  → 成功后追加到本地列表
  → 失败回滚输入框内容

接收消息
  → WebSocket 长连接监听 new_message
  → 匹配 sessionId 后追加到列表
  → 自动滚动到底部
```

### 4.4 发布与互动

**文件**：`src/pages/publish/publish.vue`、`src/stores/interaction.ts`

- 发布动态支持文字、图片、话题、范围选择。
- AI 标签生成辅助。
- 点赞/收藏使用 `interaction.ts` 统一处理，本地状态即时反馈并持久化。

---

## 五、技术亮点与难点

### 5.1 跨平台适配

- **条件编译**：`// #ifdef H5`、`// #ifndef H5` 处理平台差异。
- **平台感知认证**：小程序 Storage Token vs H5 HttpOnly Cookie，兼顾安全与兼容。
- **Tailwind 小程序适配**：`weapp-tailwindcss` 插件转换类名，`corePlugins.preflight: false` 避免样式重置导致小程序报错。

### 5.2 性能优化

- **分页加载**：`usePagination` 统一封装上拉加载、下拉刷新。
- **帖子详情缓存**：`post/detail.vue` 使用 Map + TTL 避免短时间内重复请求。
- **搜索历史缓存**：`uni.setStorageSync('searchHistory')` 本地持久化。
- **WebSocket 消息队列**：连接未就绪时不丢消息，连接成功后批量发送。

### 5.3 交互体验

- **乐观更新**：点赞/收藏立即反馈，失败自动回滚。
- **自定义导航栏与 TabBar**：视觉统一，状态栏高度动态计算。
- **时间格式化**：`useTimeAgo` 输出「刚刚、X 分钟前」等友好文案。

### 5.4 工程化

- **ESLint + Prettier**：统一代码风格。
- **TypeScript 类型检查**：`npm run type-check`。
- **Vitest 单元测试**：`api.test.ts` 等测试用例。
- **Git Conventional Commits**：规范提交信息。

---

## 六、答辩常见问题预设

### Q1：为什么选择 uni-app 而不是原生小程序开发？

A：uni-app 支持一套代码编译到微信小程序、H5 甚至 App，开发效率高；同时基于 Vue3，团队技术栈统一，组件化与状态管理生态成熟。

### Q2：状态管理为什么用 Pinia 而不用 Vuex？

A：Pinia 是 Vue 官方推荐的状态管理库，API 更简洁，支持 TypeScript 更好，与 Composition API 配合更自然，且不再使用 mutations，减少了样板代码。

### Q3：私信消息如何保证实时性？

A：采用 WebSocket 长连接做实时推送，发送消息采用 HTTP 兜底。WebSocket 使用单例管理，支持自动重连、心跳保活和消息队列，避免消息丢失。

### Q4：如何处理不同平台的登录态？

A：小程序中 Token 存在 Storage，请求时手动带 Header；H5 中 Token 由后端 HttpOnly Cookie 下发，前端不存储，请求带 `withCredentials`。这样 H5 更安全，小程序更兼容。

### Q5：点赞/收藏为什么用乐观更新？

A：为了提升交互响应速度。用户点击后立即更新 UI，后台异步请求，失败时回滚并提示。这样即使网络延迟，用户也能获得即时反馈。

---

## 七、后续可扩展方向

1. **骨架屏与懒加载**：图片懒加载、列表骨架屏进一步优化首屏体验。
2. **离线能力**：利用小程序 Storage 缓存帖子列表，弱网时可阅读。
3. **消息未读红点**：全局未读数通过 WebSocket 或轮询同步到 TabBar。
4. **暗黑模式**：基于 Tailwind 主题扩展 dark mode。
5. **分包加载**：随着页面增多，可按业务模块进行分包，降低主包体积。

---

## 八、关键文件速查表

| 文件 | 说明 |
|------|------|
| `src/main.ts` | Vue 应用入口，注册 Pinia |
| `src/App.vue` | 根组件，全局样式与生命周期 |
| `src/pages.json` | 路由与 TabBar 配置 |
| `vite.config.ts` | Vite + uni-app + Tailwind 配置 |
| `tailwind.config.cjs` | Tailwind 主题定制 |
| `src/utils/request.js` | HTTP 请求封装 |
| `src/utils/auth.js` | 认证与 JWT 管理 |
| `src/utils/websocket.js` | WebSocket 单例管理 |
| `src/stores/user.ts` | 用户全局状态 |
| `src/stores/interaction.ts` | 点赞/收藏状态 |
| `src/composables/usePagination.ts` | 分页加载逻辑 |
| `src/pages/message/chat-detail.vue` | 聊天详情页 |
| `src/pages/index/index.vue` | 首页圈子 |
