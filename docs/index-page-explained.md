# `src/pages/index/index.vue` 前端代码详解

> 文件路径：`E:/Desktop_fish/Campus-Wall/campus_wall/my-campus-wall-frontend/src/pages/index/index.vue`
>
> 框架：Vue 3 + `<script setup>` + UniApp
>
> 作用：校园墙小程序首页，承载帖子信息流、分类筛选、热帖 Banner、互动操作等核心功能。

---

## 一、整体结构

该文件是一个标准的 Vue 单文件组件（SFC），包含三部分：

1. `<template>`：页面 UI 结构
2. `<script setup>`：逻辑与数据
3. `<style scoped>`：组件级样式

页面定位是“首页”，通过 `CustomTabBar` 与底部导航联动（`:current="0"` 表示当前为首页）。

---

## 二、`<template>` 结构拆解

### 2.1 顶部固定导航栏

```vue
<view class="fixed top-0 w-full z-50 ..." :style="{ paddingTop: statusBarHeight + 'px', height: (statusBarHeight + 48) + 'px' }">
```

- 使用 `fixed` 固定顶部，并动态适配状态栏高度。
- 左侧搜索图标，点击调用 `goToSearch`。
- 中央是分段控制器（Segmented Control），切换 `viewMode`：
  - `recommend`：校园推荐流
  - `following`：关注流

切换方法为 `switchViewMode('recommend' | 'following')`。

---

### 2.2 主体滚动区域

```vue
<scroll-view class="flex-1 w-full" scroll-y :style="{ marginTop: (statusBarHeight + 48) + 'px' }" @scrolltolower="onReachBottom" @scroll="onScroll">
```

- `scroll-y` 启用纵向滚动。
- `marginTop` 避开顶部导航栏。
- `@scrolltolower` 触发触底加载更多。
- `@scroll` 用于虚拟滚动计算。

---

### 2.3 热帖滚动 Banner

```vue
<view ... @click="goToHotPosts" v-if="viewMode === 'recommend' && hotPosts.length > 0">
  <swiper ... vertical :autoplay="true" :interval="3000">
```

- 仅在“推荐”模式且热帖有数据时展示。
- 纵向轮播展示热度前 10 的帖子标题。
- 点击进入热帖排行榜页。

---

### 2.4 双层话题分类导航

#### 第一级：父分类

```vue
<scroll-view scroll-x ...>
  <view v-for="(group, gIdx) in categoryGroups" ... @click="selectGroup(gIdx)">
```

- 横向滚动展示父级分类。
- 点击后高亮，并加载该分类下的帖子。
- 右侧 `chevron_right` 箭头控制下拉面板展开/收起。

#### 一级分类下拉面板

```vue
<view v-if="showDropdownPanel" ...>
  <view v-for="(group, gIdx) in categoryGroups" ... @click="selectGroupFromPanel(gIdx)">
```

- 网格形式展示全部分类。
- `selectGroupFromPanel` 在切换分类后自动关闭面板。

#### 第二级：子话题标签

```vue
<view v-if="activeGroupIndex !== null ...">
  <scroll-view scroll-x ...>
    <view v-for="child in categoryGroups[activeGroupIndex].children" ... @click="selectCategory(child)">
```

- 展示当前父分类下的子话题。
- 点击子话题会进一步按 `tag` 筛选帖子。

#### 话题分类 Popover

```vue
<view class="fixed inset-0 bg-black/20 ..." :class="[showTopicPopover ? 'opacity-100' : 'opacity-0 pointer-events-none']">
```

- 全部分类的弹窗式选择。
- 通过 `menu` 图标触发。

---

### 2.5 校区筛选条

```vue
<view v-if="viewMode === 'recommend' && campusList.length > 1">
```

- 仅在推荐模式且校区多于一个时展示。
- 点击校区后调用 `selectCampus(campus)` 重新拉取帖子。

---

### 2.6 帖子列表

```vue
<article v-for="post in displayPosts" :key="post.id" ... :class="{ 'opacity-60 grayscale-[20%]': post.isSold === 1 }">
```

- 遍历 `displayPosts` 渲染帖子卡片。
- 已售出帖子会有置灰效果。

#### 帖子卡片内部结构

| 区域 | 说明 |
|---|---|
| 置顶标识 | `isTop === 1` 时左上角显示“置顶” |
| 作者信息 | 头像、昵称、性别角标、发布时间、分类、校区 |
| 推广商家头像 | `boardCode === 'promotion'` 时显示店铺图标 |
| 正文内容 | `post.content`，最多三行 |
| 媒体区 | 推广 Banner 或图片九宫格/双列 |
| 业务插件 | 兼职薪资、二手价格、组队头像叠层 |
| 标签 | 按不同板块差异化展示 |
| 互动栏 | 浏览数、点赞、评论、分享 |

#### 四大业务板块插件

1. **兼职 `parttime`**
   - 展示薪资 `salary` 和信息费 `infoFee`
   - 联系方式可复制

2. **二手 `secondhand`**
   - 高亮价格 `price`
   - 显示“已售出”状态
   - 标签同行展示

3. **组队 `team`**
   - 使用 `AvatarStack` 组件展示成员头像叠层
   - 显示缺人数量

4. **推广 `promotion`**
   - 商家头像
   - Banner 大图
   - `support_agent` 联系方式图标

---

### 2.7 加载与空状态

```vue
<view v-if="loading">正在载入动态...</view>
<view v-else-if="postList.length === 0">大厅里空空如也~</view>
<view v-else-if="!hasMore">- 已经滑到校园大厅的尽头啦 -</view>
```

- 三种状态：加载中、空列表、无更多数据。

---

### 2.8 发布按钮（FAB）

```vue
<view class="fixed bottom-24 right-6 ..." @click="handlePublish">
```

- 固定右下角，点击发布帖子。
- 会先检查登录态 `requireLogin()`。

---

### 2.9 举报面板

```vue
<view v-if="showReport" ...>
```

- 从底部弹出的举报面板。
- 调用 `handleReport()`，展示 `uni.showActionSheet` 选择举报原因。
- 调用 `postApi.reportPost` 提交举报。

---

### 2.10 分享面板

```vue
<view v-if="showShare" ...>
```

- 底部弹出分享选项：微信好友、生成海报、朋友圈。
- 当前均为开发中提示 `handleNav`。

---

### 2.11 背景点缀

```vue
<view class="fixed inset-0 pointer-events-none z-[-1] ...">
```

- 纯装饰性背景，不响应点击。

---

### 2.12 底部自定义 TabBar

```vue
<CustomTabBar :current="0" />
```

- 当前页面索引为 0（首页）。

---

## 三、`<script setup>` 逻辑详解

### 3.1 引入依赖

```js
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { onLoad, onReachBottom, onShow } from '@dcloudio/uni-app'
import { get, post } from '@/utils/request.js'
import { postApi, categoryApi, universityApi, rankApi } from '@/api/index.js'
import { useUserStore } from '@/stores/user'
import { useInteractionStore } from '@/stores/interaction'
import { formatTimeAgo } from '@/composables/useTimeAgo'
import { useAuthGuard } from '@/composables/useAuthGuard'
import AvatarStack from '@/components/AvatarStack/AvatarStack.vue'
import CustomTabBar from "@/components/CustomTabBar/CustomTabBar.vue";
```

- Vue 3 Composition API 核心方法。
- UniApp 页面生命周期钩子。
- 网络请求、API 映射、Pinia Store、组合式函数、组件。

---

### 3.2 核心状态

```js
const viewMode = ref('recommend')          // 推荐 / 关注
const categoryGroups = ref([])             // 分类组数据
const activeGroupIndex = ref(null)         // 当前父分类索引
const currentCategoryId = ref(null)        // 当前子分类 ID
const currentCategoryName = ref('推荐')     // 当前分类名
const currentTagName = ref('')             // 当前 tag 名
const currentCampus = ref('全部')           // 当前校区
const campusList = ref(['全部'])            // 校区列表
const postList = ref([])                   // 帖子原始数据
const hotPosts = ref([])                   // 热帖数据
const loading = ref(false)                 // 加载状态
const hasMore = ref(true)                  // 是否还有更多
const currentPage = ref(1)                 // 当前页码
const pageSize = ref(10)                   // 每页条数
```

---

### 3.3 虚拟滚动

```js
const MAX_RENDER_POSTS = 80
const renderStart = ref(0)
const displayPosts = computed(() => {
  return postList.value.slice(renderStart.value, renderStart.value + MAX_RENDER_POSTS)
})

const onScroll = (e) => {
  const scrollTop = e.detail.scrollTop
  const estimatedPxPerItem = 160
  const newStart = Math.max(0, Math.floor(scrollTop / estimatedPxPerItem) - 5)
  if (Math.abs(newStart - renderStart.value) >= 5) {
    renderStart.value = newStart
  }
}
```

- 限制同时渲染的帖子数量为 80 条，防止长列表卡顿。
- 根据滚动位置估算当前应渲染的起始索引。

---

### 3.4 图片懒加载

```js
const imageLoaded = ref({})
const onImageLoad = (imgUrl) => {
  imageLoaded.value[imgUrl] = true
}
```

- 图片加载完成后添加 `opacity-100` 类，实现淡入效果。

---

### 3.5 数据获取

#### 获取分类

```js
const fetchCategories = async () => { ... }
```

- 调用 `categoryApi.getGroups()`。

#### 获取热帖

```js
const fetchHotPosts = async () => { ... }
```

- 调用 `rankApi.getHotPostRank('week', 10, 0)` 获取周热榜。

#### 获取校区

```js
const fetchCampuses = async () => { ... }
```

- 从本地 `userInfo` 读取 `universityId`。
- 调用 `universityApi.getCampuses(universityId)`。

#### 获取帖子列表

```js
const fetchPostList = async (refresh = false) => { ... }
```

- 根据 `viewMode` 决定请求接口：
  - `following`：`postApi.getFollowingPosts`
  - `recommend`：`postApi.getPostList`，带 `category`、`tag`、`scope`、`campus` 参数
- 格式化后端数据，合并点赞状态缓存。
- 更新 `postList`、`hasMore`、`currentPage`。

---

### 3.6 分类/校区筛选逻辑

```js
const selectGroup = (gIdx) => { ... }
const selectGroupFromPanel = (gIdx) => { ... }
const selectCategory = (child) => { ... }
const selectCategoryFromPopover = (child) => { ... }
const selectCampus = (campus) => { ... }
```

- 切换分类或校区后都会调用 `fetchPostList(true)` 刷新列表。
- “推荐”分类会展示全部帖子，其他按分类名过滤。

---

### 3.7 跳转方法

#### 进入帖子详情

```js
const goToDetail = (id) => {
  if (!id) return
  const postItem = postList.value.find(p => p.id === id)
  if (postItem) postItem.viewCount = (postItem.viewCount || 0) + 1
  post(postApi.incrementViewCount(id).url).catch(() => {})
  uni.navigateTo({ url: `/pages/post/detail?id=${id}` })
}
```

- 先本地增加浏览数。
- 异步调用后端增加浏览量。
- 跳转到详情页，传 `id` 参数。

#### 进入用户主页

```js
const goToUserHome = (postItem) => { ... }
```

- 匿名用户不可查看主页。
- 未登录提示登录。
- 自己跳转 `switchTab` 到个人页，他人跳转 `user-home`。

---

### 3.8 互动操作

```js
const toggleLike = async (postItem) => { ... }
const copyContact = (text) => { ... }
const handleTagClick = (tag) => { ... }
const handlePublish = () => { ... }
```

- `toggleLike`：调用 `interactionStore` 切换点赞状态，点赞成功震动。
- `copyContact`：复制联系方式到剪贴板。
- `handleTagClick`：标签点击跳转对应分类；自定义标签提示无法跳转。
- `handlePublish`：登录校验后跳转发布页。

---

### 3.9 举报与分享弹窗

```js
const openSharePopup = (post) => { ... }
const closeSharePopup = () => { ... }
const openReportPopup = (post) => { ... }
const closeReportPopup = () => { ... }
const handleReport = () => { ... }
const handleNav = (tipText) => { ... }
```

- 举报调用 `postApi.reportPost`。
- 分享目前仅展示 Toast 提示“开发中”。

---

### 3.10 视图模式切换

```js
const switchViewMode = (mode) => { ... }
```

- 切换到“关注”需要登录，未登录引导去登录页。

---

### 3.11 生命周期钩子

```js
onLoad(() => {
  fetchCategories()
  fetchHotPosts()
  fetchCampuses()
  fetchPostList(true)
})

onShow(() => {
  const hasNewPost = uni.getStorageSync('hasNewPost')
  if (hasNewPost) {
    uni.removeStorageSync('hasNewPost')
    fetchPostList(true)
  }
})

onMounted(() => {
  uni.$on('refreshPostList', refreshHandler)
})

onUnmounted(() => {
  uni.$off('refreshPostList', refreshHandler)
})

onReachBottom(() => {
  if (hasMore.value && !loading.value) {
    fetchPostList()
  }
})
```

- `onLoad`：页面首次加载，初始化所有数据。
- `onShow`：从其他页面返回时，如果有新帖子则刷新。
- `onMounted/onUnmounted`：注册/注销全局事件监听。
- `onReachBottom`：触底加载更多。

---

## 四、`<style scoped>` 样式说明

| 类名 | 作用 |
|---|---|
| `hide-scrollbar` | 隐藏滚动条 |
| `bouncy-tap:active` | 点击时缩放动画 |
| `kawaii-shadow` | 粉色阴影 |
| `sticker-border` | 虚线边框 |
| `hot-banner-gradient` | 粉橙渐变背景 |
| `line-clamp-3` | 三行文本截断 |
| `icon-filled` / `icon-filled-like` | Material Symbols 填充样式 |
| `animate-fade-in` | 淡入上移动画 |

---

## 五、关键设计点总结

1. **性能优化**：虚拟滚动 + 图片懒加载 + fade-in。
2. **状态管理**：Pinia Store 管理用户态与点赞缓存。
3. **组件复用**：`AvatarStack` 用于组队成员头像叠层。
4. **差异化渲染**：根据 `boardCode` 渲染不同业务形态。
5. **登录保护**：关注、发布、点赞等操作均校验登录。
6. **缓存联动**：点赞状态优先取本地缓存，再回源后端。
