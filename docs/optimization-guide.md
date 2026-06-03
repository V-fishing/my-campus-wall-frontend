# 校园墙小程序前端 — 优化实现手册

> 基于项目实际代码的逐项优化方案，每项包含目标、步骤、代码片段

---

## 目录

1. [环境配置修复（P0）](#1-环境配置修复)
2. [引入 Pinia 状态管理](#2-引入-pinia-状态管理)
3. [抽取共享 Composables](#3-抽取共享-composables)
4. [消除请求层硬编码](#4-消除请求层硬编码)
5. [代码规范自动化](#5-代码规范自动化)
6. [TypeScript 迁移](#6-typescript-迁移)
7. [分包加载](#7-分包加载)
8. [性能优化](#8-性能优化)

---

## 1. 环境配置修复

### 目标

消除 3 处硬编码 IP，实现 dev/staging/prod 一键切换。

### 步骤

#### 1.1 创建环境变量文件

```bash
# 项目根目录下创建（my-campus-wall-fronted/）

# .env.development
VITE_API_BASE_URL = 'http://localhost:8080'
VITE_WS_BASE_URL = 'ws://localhost:8080'

# .env.production
VITE_API_BASE_URL = 'https://api.campus-wall.cn'
VITE_WS_BASE_URL = 'wss://api.campus-wall.cn'
```

#### 1.2 创建配置模块

新建 `src/config/index.ts`：

```typescript
// src/config/index.ts
// 统一读取环境变量，提供默认值

export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  wsBaseUrl:  import.meta.env.VITE_WS_BASE_URL  || 'ws://localhost:8080',
  
  // 上传文件超时（毫秒）
  uploadTimeout: 30000,
  
  // 请求超时
  requestTimeout: 10000,
} as const
```

#### 1.3 Vite 配置补充

在 `vite.config.ts` 中添加环境变量类型提示：

```typescript
// vite.config.ts 顶部追加
/// <reference types="vite/client" />
```

创建 `src/env.d.ts`（如已存在则合并）：

```typescript
// src/env.d.ts
/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_WS_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

#### 1.4 修复 `request.js` — 用 config 替换硬编码

```javascript
// src/utils/request.js — 修改第 12 行
// ❌ 旧代码
// const BASE_URL = 'http://172.21.160.223:8080'

// ✅ 新代码
import { config } from '@/config'

const BASE_URL = config.apiBaseUrl
```

#### 1.5 修复 `publish.vue` — 图片上传

`src/pages/publish/publish.vue` 第 295 行和第 347 行有两处硬编码 IP：

```javascript
// ❌ 旧代码 (第 295 行)
const uploadRes = await fetch(`http://192.168.1.185:8080${apiUrl}`, {

// ❌ 旧代码 (第 347 行)
url: `http://192.168.1.185:8080${apiUrl}`,
```

修改 `publish.vue` 的 `<script setup>` 顶部：

```javascript
// ✅ 新增导入
import { config } from '@/config'

// ✅ 第 295 行改为
const uploadRes = await fetch(`${config.apiBaseUrl}${apiUrl}`, {

// ✅ 第 347 行改为
url: `${config.apiBaseUrl}${apiUrl}`,
```

#### 1.6 修复 `websocket.js` — WebSocket URL

```javascript
// src/utils/websocket.js — 修改 connect 方法中第 31 行
// ❌ 旧代码
// const wsUrl = `ws://localhost:8080/ws/chat/${userId}`

// ✅ 新代码
import { config } from '@/config'

// 在 connect 方法中：
const wsUrl = `${config.wsBaseUrl}/ws/chat/${userId}`
```

---

## 2. 引入 Pinia 状态管理

### 目标

用 Pinia 替代分散的 `uni.setStorageSync` 管理用户状态和互动状态，消除 4 个页面间的点赞状态同步问题。

### 步骤

#### 2.1 安装 Pinia

```bash
cd my-campus-wall-fronted
npm install pinia
# 如需要持久化插件（推荐）：
npm install pinia-plugin-persistedstate
```

#### 2.2 注册 Pinia

修改 `src/main.ts`：

```typescript
// src/main.ts
import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

export function createApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()
  app.use(pinia)
  return { app, pinia }
}
```

#### 2.3 创建 userStore

新建 `src/stores/user.ts`：

```typescript
// src/stores/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { get, post } from '@/utils/request'
import { userApi } from '@/api/index'

export const useUserStore = defineStore('user', () => {
  // --- 状态 ---
  const token    = ref<string | null>(uni.getStorageSync('token') || null)
  const userId   = ref<number | null>(null)
  const nickname = ref('')
  const avatar   = ref('')
  const gender   = ref(0)
  const college  = ref('')
  const campus   = ref('')
  const schoolId = ref<number | null>(null)
  const isLogin  = computed(() => !!token.value)

  // --- 从 Storage 恢复 ---
  function hydrate() {
    const info = uni.getStorageSync('userInfo')
    if (info) {
      userId.value   = info.id ?? null
      nickname.value = info.nickname ?? ''
      avatar.value   = info.avatar ?? ''
      gender.value   = info.gender ?? 0
      college.value  = info.college ?? ''
      campus.value   = info.campus ?? ''
    }
  }

  // --- 登录 ---
  async function login(code: string) {
    const res = await post(userApi.login(code).url, { code })
    if (res.code === 200) {
      token.value  = res.data.token
      userId.value = res.data.id
      nickname.value = res.data.nickname
      avatar.value   = res.data.avatar
      gender.value   = res.data.gender
      college.value  = res.data.college
      campus.value   = res.data.campus

      // 持久化
      uni.setStorageSync('token', res.data.token)
      uni.setStorageSync('userInfo', res.data)
      return true
    }
    return false
  }

  // --- 退出 ---
  function logout() {
    token.value = null
    userId.value = null
    nickname.value = ''
    avatar.value   = ''
    uni.removeStorageSync('token')
    uni.removeStorageSync('userInfo')
  }

  // --- 拉取最新用户信息 ---
  async function fetchProfile() {
    try {
      const res = await get(userApi.getCurrentUserInfo().url)
      if (res.code === 200 && res.data) {
        const d = res.data
        userId.value   = d.id
        nickname.value = d.nickname
        avatar.value   = d.avatar
        gender.value   = d.gender
        college.value  = d.college
        campus.value   = d.campus
        schoolId.value = d.universityId
        uni.setStorageSync('userInfo', d)
      }
    } catch (e) {
      console.error('fetchProfile failed', e)
    }
  }

  // --- 初始化时恢复 ---
  hydrate()

  return { token, userId, nickname, avatar, gender, college, campus, schoolId, isLogin, login, logout, fetchProfile, hydrate }
})
```

#### 2.4 创建 interactionStore（统一点赞/收藏）

新建 `src/stores/interaction.ts`：

```typescript
// src/stores/interaction.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { post } from '@/utils/request'
import { postApi, commentApi } from '@/api/index'

interface LikeState {
  isLiked: boolean
  likeCount: number
}

export const useInteractionStore = defineStore('interaction', () => {
  // 帖子点赞状态缓存  { [postId: number]: LikeState }
  const postLikes  = ref<Record<number, LikeState>>({})
  // 评论点赞状态缓存
  const commentLikes = ref<Record<number, LikeState>>({})

  // --- 从本地存储恢复 ---
  function hydrate() {
    try {
      const saved = uni.getStorageSync('post_likes')
      if (saved) postLikes.value = JSON.parse(saved)
    } catch {}
  }

  // --- 持久化到本地存储 ---
  function persist() {
    uni.setStorageSync('post_likes', JSON.stringify(postLikes.value))
  }

  // --- 获取帖子点赞状态 ---
  function getPostLikeState(postId: number): LikeState | null {
    return postLikes.value[postId] ?? null
  }

  // --- 点赞/取消点赞帖子（乐观更新） ---
  async function togglePostLike(postId: number, serverLikeCount: number, serverIsLiked: boolean) {
    const prev = postLikes.value[postId] ?? { isLiked: serverIsLiked, likeCount: serverLikeCount }
    const isCurrentlyLiked = prev.isLiked

    // 乐观更新
    const optimistic: LikeState = {
      isLiked: !isCurrentlyLiked,
      likeCount: isCurrentlyLiked ? prev.likeCount - 1 : prev.likeCount + 1,
    }
    postLikes.value[postId] = optimistic
    persist()

    try {
      const res = await post(postApi.toggleLike(postId).url)
      if (res.code === 200) {
        // 以后端真实数据校准
        const truth: LikeState = { isLiked: res.data.isLiked, likeCount: res.data.likeCount }
        postLikes.value[postId] = truth
        persist()
        if (res.data.isLiked) uni.vibrateShort()
        return truth
      }
      throw new Error(res.message)
    } catch {
      // 回滚
      postLikes.value[postId] = prev
      persist()
      throw new Error('点赞失败')
    }
  }

  // --- 点赞评论 ---
  async function toggleCommentLike(commentId: number, serverLikeCount: number) {
    const prev = commentLikes.value[commentId] ?? { isLiked: false, likeCount: serverLikeCount }
    const optimistic: LikeState = {
      isLiked: !prev.isLiked,
      likeCount: prev.isLiked ? prev.likeCount - 1 : prev.likeCount + 1,
    }
    commentLikes.value[commentId] = optimistic

    try {
      const res = await post(commentApi.toggleLike(commentId).url)
      if (res.code === 200) {
        commentLikes.value[commentId] = { isLiked: res.data.isLiked, likeCount: res.data.likeCount }
        return commentLikes.value[commentId]
      }
      throw new Error(res.message)
    } catch {
      commentLikes.value[commentId] = prev
      throw new Error('点赞失败')
    }
  }

  hydrate()
  return { postLikes, commentLikes, getPostLikeState, togglePostLike, toggleCommentLike, hydrate, persist }
})
```

#### 2.5 在页面中使用 store（改造 index.vue 点赞逻辑）

```typescript
// index.vue <script setup> 中
// ❌ 旧：savePostLikeState / getPostLikeState 自己管理 localStorage
// ✅ 新：一行调用

import { useInteractionStore } from '@/stores/interaction'

const interaction = useInteractionStore()

const toggleLike = async (postItem: any) => {
  try {
    const result = await interaction.togglePostLike(
      postItem.id,
      postItem.likeCount,   // 后端给的当前点赞数
      postItem.isLiked      // 后端给的当前点赞状态
    )
    postItem.isLiked  = result.isLiked
    postItem.likeCount = result.likeCount
  } catch {
    uni.showToast({ title: '网络开小差了，请重试', icon: 'none' })
  }
}
```

删除 index.vue 中的 `savePostLikeState` 和 `getPostLikeState` 两个函数（约 40 行）。

同样的模式改造 discover.vue、post/detail.vue、hot-posts.vue 中的点赞逻辑。

---

## 3. 抽取共享 Composables

### 目标

将散落在 5+ 页面中的重复逻辑抽取为可复用的 composition function。

### 3.1 usePagination — 分页加载

新建 `src/composables/usePagination.ts`：

```typescript
// src/composables/usePagination.ts
import { ref } from 'vue'
import { get } from '@/utils/request'

interface PaginationOptions {
  url: string
  pageSize?: number
  onSuccess?: (records: any[]) => any[]  // 可选：格式化每条数据
}

export function usePagination(options: PaginationOptions) {
  const list      = ref<any[]>([])
  const page      = ref(1)
  const loading   = ref(false)
  const hasMore   = ref(true)
  const refreshing = ref(false)
  const pageSize   = options.pageSize ?? 10

  async function loadMore() {
    if (loading.value || !hasMore.value) return
    loading.value = true
    try {
      const res = await get(options.url, { page: page.value, size: pageSize })
      const data = res.data || {}
      const records = data.records || []
      const formatted = options.onSuccess ? options.onSuccess(records) : records
      list.value.push(...formatted)
      page.value++
      hasMore.value = (data.current ?? 0) < (data.pages ?? 0)
    } catch (e) {
      console.error('加载失败', e)
    } finally {
      loading.value = false
      refreshing.value = false
    }
  }

  async function refresh() {
    refreshing.value = true
    page.value = 1
    hasMore.value = true
    list.value = []
    await loadMore()
  }

  return { list, loading, hasMore, refreshing, loadMore, refresh }
}
```

### 3.2 useTimeAgo — 时间格式化

新建 `src/composables/useTimeAgo.ts`：

```typescript
// src/composables/useTimeAgo.ts

export function formatTimeAgo(timestamp: number | string | Date): string {
  if (!timestamp) return '刚刚'

  const now = Date.now()
  const past = typeof timestamp === 'number' && timestamp < 1e12
    ? timestamp * 1000   // 秒级时间戳 → 毫秒
    : new Date(timestamp).getTime()
  const diff = now - past

  if (diff < 60_000)       return '刚刚'
  if (diff < 3_600_000)    return `${Math.floor(diff / 60_000)}分钟前`
  if (diff < 86_400_000)   return `${Math.floor(diff / 3_600_000)}小时前`
  if (diff < 2_592_000_000) return `${Math.floor(diff / 86_400_000)}天前`

  const d = new Date(past)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}
```

各页面中删除自己写的 `formatTime` 函数，改为：

```typescript
import { formatTimeAgo } from '@/composables/useTimeAgo'
// 模板中直接使用 formatTimeAgo
```

### 3.3 useAuthGuard — 登录守卫

新建 `src/composables/useAuthGuard.ts`：

```typescript
// src/composables/useAuthGuard.ts
import { useUserStore } from '@/stores/user'

export function useAuthGuard() {
  const user = useUserStore()

  /**
   * 需要登录才能执行的操作。
   * @returns true = 已登录, false = 已跳转登录页
   */
  function requireLogin(): boolean {
    if (user.isLogin) return true

    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => {
      uni.navigateTo({
        url: '/pages/login/login',
        fail: () => uni.redirectTo({ url: '/pages/login/login' }),
      })
    }, 800)
    return false
  }

  return { requireLogin, isLogin: user.isLogin }
}
```

页面中使用（替换重复的判断 pattern）：

```typescript
// index.vue 的 handlePublish / toggleLike 中
import { useAuthGuard } from '@/composables/useAuthGuard'

const { requireLogin } = useAuthGuard()

const handlePublish = () => {
  if (!requireLogin()) return   // 一行替代原来的 15 行
  // ... 业务逻辑
}
```

---

## 4. 消除请求层硬编码

### 4.1 删除 AI 标签模拟数据

`src/pages/publish/publish.vue` 第 377 行：

```javascript
// ❌ 旧代码
const newTags = ['技术交流', 'AI学长', '日常水帖', '兼职']  // 假数据！

// ✅ 新代码 — 调用真实 AI 接口
const generateAiTags = async () => {
  if (!content.value) return uni.showToast({ title: '请先输入帖子内容', icon: 'none' })
  if (totalTagsCount.value >= MAX_TAGS) return uni.showToast({ title: `最多${MAX_TAGS}个标签`, icon: 'none' })

  uni.showLoading({ title: 'AI 提取中...' })
  try {
    const res = await post('/api/v1/ai/tags/generate', { text: content.value })
    if (res.code === 200 && res.data) {
      const newTags = res.data.tags || []
      const remainingSlots = MAX_TAGS - totalTagsCount.value
      aiTags.value = newTags.slice(0, remainingSlots)
      uni.showToast({ title: aiTags.value.length > 0 ? '提取成功' : '未识别到标签', icon: 'none' })
    }
  } catch {
    uni.showToast({ title: 'AI 服务暂不可用', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}
```

### 4.2 修复 `userId=1` 占位

`src/pages/ai/chat.vue` 第 148 行：

```javascript
// ❌ 旧代码
const currentUserId = ref(1)

// ✅ 新代码
import { useUserStore } from '@/stores/user'
const userStore = useUserStore()
const currentUserId = computed(() => userStore.userId || 0)
```

### 4.3 删除首页模拟热门数据

`src/pages/index/index.vue` 第 250-254 行的 fallback mock 数据：

```javascript
// ❌ 删除这个 catch 分支
// } catch (error) {
//   hotPosts.value = [
//     { id: 1, content: '...' },
//     ...
//   ]
// }

// ✅ 改为静默降级
} catch (error) {
  console.error('获取热门帖子失败', error)
  // 静默失败，页面不展示热帖 banner 即可
}
```

---

## 5. 代码规范自动化

### 目标

配置 ESLint + Prettier，让机器而不是人工保证代码风格。

### 步骤

#### 5.1 安装依赖

```bash
cd my-campus-wall-fronted
npm install -D eslint prettier eslint-plugin-vue @vue/eslint-config-typescript eslint-config-prettier
```

#### 5.2 创建 ESLint 配置

新建 `.eslintrc.cjs`：

```javascript
// .eslintrc.cjs
module.exports = {
  root: true,
  env: { browser: true, es2021: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    '@vue/eslint-config-typescript',
    'prettier', // 必须在最后，覆盖样式规则
  ],
  parserOptions: { ecmaVersion: 'latest' },
  rules: {
    'vue/multi-word-component-names': 'off', // uni-app 页面是单文件名
    'vue/no-v-html': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
  globals: {
    uni: 'readonly',
    getApp: 'readonly',
    wx: 'readonly',
  },
}
```

#### 5.3 创建 Prettier 配置

新建 `.prettierrc`：

```json
{
  "printWidth": 120,
  "tabWidth": 2,
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

#### 5.4 添加 npm 脚本

在 `package.json` 的 `scripts` 中添加：

```json
{
  "lint": "eslint src/ --ext .vue,.ts,.js --fix",
  "format": "prettier --write \"src/**/*.{vue,ts,js,css,scss}\"",
  "lint:check": "eslint src/ --ext .vue,.ts,.js"
}
```

#### 5.5 首次执行格式化

```bash
npm run format
npm run lint
```

---

## 6. TypeScript 迁移

### 策略

分三层渐进式迁移，不改功能只加类型。

### 第 1 层：工具函数（收益最大，1d）

`auth.js` → `auth.ts`：

```typescript
// src/utils/auth.ts
interface LoginData {
  token: string
  id: number
  nickname: string
  avatar: string
  gender: number
  college: string
  campus: string
  [key: string]: any
}

export function saveLoginInfo(loginData: LoginData): boolean {
  // ... 逻辑不变，加类型标注
}

export function getToken(): string | null {
  try {
    return uni.getStorageSync('token') || null
  } catch {
    return null
  }
}

export function getUserInfo(): LoginData | null {
  try {
    return uni.getStorageSync('userInfo') || null
  } catch {
    return null
  }
}
```

`request.js` → `request.ts`：

```typescript
// src/utils/request.ts
interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: Record<string, any>
  params?: Record<string, any>
  header?: Record<string, string>
}

interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  success?: boolean
}

export function request<T = any>(options: RequestOptions): Promise<ApiResponse<T>> {
  return new Promise((resolve, reject) => {
    // ... 逻辑不变
  })
}

export function get<T = any>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
  return request<T>({ url, method: 'GET', params })
}

export function post<T = any>(url: string, data?: Record<string, any>): Promise<ApiResponse<T>> {
  return request<T>({ url, method: 'POST', data })
}
```

### 第 2 层：API 定义（0.5d）

`api/index.js` → `api/index.ts` — 为每个 API 返回对象添加类型：

```typescript
// src/api/index.ts
interface ApiConfig {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  params?: Record<string, any>
  data?: Record<string, any>
}

interface PostListParams {
  page?: number
  size?: number
  category?: string
  scope?: number
}

export const postApi = {
  getPostList: (params: PostListParams = {}): ApiConfig => ({
    url: '/api/v1/posts/list',
    method: 'GET',
    params,
  }),
  // ... 其余 API 同理
}
```

### 第 3 层：新页面/组件（按需）

新建 `.vue` 文件时 `<script setup lang="ts">`，旧页面不强制改造，自然淘汰。

---

## 7. 分包加载

### 修改 `pages.json`

```json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": { "navigationStyle": "custom" }
    },
    {
      "path": "pages/discover/discover",
      "style": { "navigationStyle": "custom" }
    },
    {
      "path": "pages/ai/chat",
      "style": { "navigationStyle": "custom" }
    },
    {
      "path": "pages/message/message",
      "style": { "navigationStyle": "custom" }
    },
    {
      "path": "pages/user/profile",
      "style": { "navigationStyle": "custom" }
    }
  ],
  "subPackages": [
    {
      "root": "pages/community",
      "pages": [
        { "path": "post/detail" },
        { "path": "publish/publish" },
        { "path": "search/search" },
        { "path": "hot-posts/hot-posts" },
        { "path": "leaderboard/leaderboard" }
      ]
    },
    {
      "root": "pages/social",
      "pages": [
        { "path": "message/chat-detail" },
        { "path": "message/like-list" },
        { "path": "message/notification-list" },
        { "path": "message/fans-list" }
      ]
    },
    {
      "root": "pages/mine",
      "pages": [
        { "path": "user/user-home" },
        { "path": "user/edit-profile" },
        { "path": "user/select-school" },
        { "path": "user/my-posts" },
        { "path": "user/my-collections" },
        { "path": "user/my-likes" },
        { "path": "user/my-following" },
        { "path": "user/my-fans" },
        { "path": "user/browse-history" },
        { "path": "user/settings" },
        { "path": "user/feedback" },
        { "path": "user/about" }
      ]
    },
    {
      "root": "pages/etc",
      "pages": [
        { "path": "login/login" },
        { "path": "document/document" },
        { "path": "ai/ai-history" },
        { "path": "ai/preference" }
      ]
    }
  ],
  "preloadRule": {
    "pages/index/index": {
      "network": "all",
      "packages": ["pages/community"]
    }
  }
}
```

> 注意：分包后页面路径会变化，需同步更新所有 `uni.navigateTo` 中的 URL。建议用脚本批量替换。

---

## 8. 性能优化

### 8.1 图片懒加载

在帖子列表的 `<image>` 标签上统一添加：

```html
<image :src="img" mode="aspectFill" lazy-load />
<!-- 添加 lazy-load 属性 -->
```

### 8.2 搜索防抖

`src/pages/search/search.vue` 中的搜索输入增加防抖：

```typescript
import { ref, watch } from 'vue'

const keyword = ref('')
let debounceTimer: ReturnType<typeof setTimeout> | null = null

function onSearchInput(value: string) {
  keyword.value = value
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    performSearch(value)
  }, 300) // 300ms 防抖
}

function performSearch(kw: string) {
  if (!kw.trim()) return
  // 执行搜索请求
}
```

### 8.3 帖子详情缓存

`src/pages/post/detail.vue` 中增加简易缓存：

```typescript
const CACHE_PREFIX = 'post_detail_cache_'
const CACHE_TTL   = 60_000 // 60s

function cachePost(postId: number, data: any) {
  uni.setStorageSync(CACHE_PREFIX + postId, {
    data,
    expireAt: Date.now() + CACHE_TTL,
  })
}

function getCachedPost(postId: number): any | null {
  const cached = uni.getStorageSync(CACHE_PREFIX + postId)
  if (cached && Date.now() < cached.expireAt) {
    return cached.data
  }
  uni.removeStorageSync(CACHE_PREFIX + postId)
  return null
}
```

### 8.4 消息列表过旧数据裁剪

在 scroll-view 的加载更多逻辑中：

```typescript
async function loadMore() {
  // ... 加载数据
  list.value.push(...newRecords)

  // 保留最近 200 条，避免 DOM 节点过多
  if (list.value.length > 200) {
    list.value = list.value.slice(-200)
  }
}
```

---

## 整体实施顺序

```
第 1 天 上午: [1.1-1.6] 环境配置修复          ← 30 分钟见效
第 1 天 下午: [5.1-5.5] ESLint + Prettier     ← 1 小时
第 1 天 下午: [3.2] useTimeAgo 抽取           ← 30 分钟
第 2 天 上午: [2.1-2.5] Pinia store 创建      ← 2 小时
第 2 天 下午: [3.1] usePagination 抽取        ← 1.5 小时
第 2 天 下午: [3.3] useAuthGuard 抽取         ← 30 分钟
第 3 天 上午: [2.5] 改造 index.vue + discover  ← 1.5 小时
第 3 天 下午: [4.1-4.3] 消除模拟数据          ← 1 小时
第 4 天 上午: [6.x] TypeScript 迁移 utils/api  ← 2 小时
第 4 天 下午: [8.1-8.4] 性能优化              ← 1.5 小时
第 5 天:        [7.x] 分包 + 测试              ← 2 小时
```

> 预计总工时：**4-5 人天**。建议由 1 人负责，减少合并冲突。
