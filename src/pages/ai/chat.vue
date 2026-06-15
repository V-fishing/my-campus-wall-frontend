<template>
  <view class="bg-[#F4F5F7] text-on-surface font-body-lg-mobile min-h-screen flex flex-col relative selection:bg-primary-container">

    <!-- 顶部导航栏 -->
    <view class="fixed top-0 w-full z-50 bg-[#F4F5F7]/85 backdrop-blur-md shadow-sm pr-capsule-safe-zone"
          :style="{ paddingTop: statusBarHeight + 'px', height: (statusBarHeight + 64) + 'px' }">
      <view class="relative w-full h-full flex items-center px-margin-page">
        <!-- 左侧：菜单按钮 -->
        <view class="w-10 h-10 flex items-center justify-center text-on-surface active:scale-95 transition-transform rounded-full shrink-0"
              @click="openSidebar">
          <text class="material-symbols-outlined text-[36rpx]">menu</text>
        </view>

        <!-- 中间：AI 头像（可点击）+ 名称 + 状态，绝对居中 -->
        <view class="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
          <view class="relative w-9 h-9 rounded-full bg-tertiary-container flex items-center justify-center pulse-ring active:scale-95 transition-transform"
                @click="goToPreference">
            <text class="material-symbols-outlined text-on-tertiary-container text-[36rpx]">smart_toy</text>
          </view>
          <view class="flex flex-col">
            <text class="font-headline-md-mobile text-headline-md-mobile text-primary tracking-tight font-bold">嘉应AI学长</text>
            <view class="flex items-center gap-1.5 mt-0.5">
              <view class="w-2 h-2 rounded-full bg-green-500 dot-green"></view>
              <text class="font-label-sm-mobile text-label-sm-mobile text-on-surface-variant">一直在线</text>
            </view>
          </view>
        </view>

        <!-- 右侧占位，保持平衡 -->
        <view class="w-10 h-10 shrink-0"></view>
      </view>
    </view>

    <!-- 左侧对话历史侧边栏 -->
    <view v-if="showSidebar" class="fixed inset-0 z-[60] sidebar-overlay">
      <!-- 半透明遮罩：盖住后面页面 -->
      <view class="absolute inset-0 bg-black/25 backdrop-blur-[2px] transition-opacity"
            @click="showSidebar = false"></view>

      <!-- 侧边栏面板（从左侧滑入） -->
      <view class="absolute top-0 left-0 h-full w-[72vw] max-w-[300px] bg-white/95 shadow-2xl flex flex-col sidebar-slide-in"
            :style="{ paddingTop: (statusBarHeight + 8) + 'px' }">

        <!-- 侧边栏头部 -->
        <view class="flex items-center justify-between px-5 py-4">
          <text class="font-headline-md-mobile text-[32rpx] text-on-surface font-bold">对话历史</text>
          <view class="w-9 h-9 flex items-center justify-center text-on-surface-variant active:scale-95 transition-transform rounded-full"
                @click="showSidebar = false">
            <text class="material-symbols-outlined text-[36rpx]">close</text>
          </view>
        </view>

        <!-- 新建对话按钮 -->
        <view class="px-5 pb-3">
          <view class="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white border border-[#E57373] active:scale-[0.98] transition-transform shadow-sm"
                @click="startNewChat">
            <text class="material-symbols-outlined text-[#E57373] text-[28rpx]">add</text>
            <text class="font-label-md-mobile text-[28rpx] text-[#E57373] font-bold">新建对话</text>
          </view>
        </view>

        <!-- 历史对话列表 -->
        <scroll-view scroll-y class="flex-1 px-5 py-2">
          <view v-if="sidebarLoading" class="flex flex-col items-center justify-center py-12">
            <text class="material-symbols-outlined animate-spin text-primary text-[40rpx]">sync</text>
            <text class="text-[24rpx] text-outline-variant mt-2">加载中...</text>
          </view>

          <view v-else-if="historyList.length === 0" class="flex flex-col items-center justify-center py-12">
            <text class="material-symbols-outlined text-outline-variant/50 text-[56rpx]">chat_bubble_outline</text>
            <text class="text-[26rpx] text-outline-variant mt-3">还没有对话记录</text>
          </view>

          <view v-else class="space-y-3">
            <view v-for="item in historyList" :key="item.sessionId"
                  class="flex items-start gap-3 p-3 rounded-[24rpx] transition-all active:bg-surface-container-low"
                  :class="item.sessionId === conversationId ? 'bg-[#E3F2FD]' : ''"
                  @click="switchToSession(item.sessionId)">
              <view class="w-10 h-10 rounded-full bg-[#90CAF9] flex items-center justify-center shrink-0 mt-0.5">
                <text class="material-symbols-outlined text-white text-[28rpx]">smart_toy</text>
              </view>
              <view class="flex-1 min-w-0">
                <text class="block text-[28rpx] font-bold text-on-surface truncate leading-tight">{{ item.firstQuestion || '新的对话' }}</text>
                <text class="block text-[22rpx] text-outline-variant mt-1.5">{{ item.createTime }}</text>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>


    <scroll-view
      class="flex-1 w-full box-border z-10"
      scroll-y="true"
      :scroll-into-view="scrollToMessageId"
      scroll-with-animation
      :style="{ paddingTop: (statusBarHeight + 80) + 'px' }"
    >
      <view class="px-margin-page pb-[320rpx]">

        <!-- 欢迎消息（仅在新建对话时显示） -->
        <view class="flex items-start gap-2 mb-8" id="msg-welcome" v-if="messageList.length === 0 && !conversationId">
          <view class="w-10 h-10 rounded-full bg-tertiary-container flex-shrink-0 flex items-center justify-center shadow-sm">
            <text class="material-symbols-outlined text-on-tertiary-container text-[40rpx]">smart_toy</text>
          </view>
          <view class="flex flex-col gap-2 max-w-[85%]">
            <view class="bubble-ai bg-white p-4 rounded-[40rpx] rounded-tl-none">
              <text class="font-body-lg-mobile text-on-surface block leading-relaxed">你好同学！我是嘉应AI学长。我已经学习了学校的《新生手册》、《选课指南》和近期的校园通知。有什么我可以帮你的吗？</text>
            </view>
            <view class="space-y-2 mt-2">
              <text class="font-label-sm-mobile text-on-surface-variant ml-1 block">猜你想问 ✨</text>
              <view class="flex flex-wrap gap-2">
                <view class="px-3 py-1.5 rounded-full bg-tertiary-fixed/50 text-tertiary text-[24rpx] font-medium active:scale-95 transition-transform" @click="sendQuickMsg('北区图书馆周末几点闭馆？')">📖 图书馆闭馆时间</view>
                <view class="px-3 py-1.5 rounded-full bg-tertiary-fixed/50 text-tertiary text-[24rpx] font-medium active:scale-95 transition-transform" @click="sendQuickMsg('大创项目怎么申报？')">💡 大创申报流程</view>
                <view class="px-3 py-1.5 rounded-full bg-tertiary-fixed/50 text-tertiary text-[24rpx] font-medium active:scale-95 transition-transform" @click="sendQuickMsg('宿舍宽带怎么开通？')">🌐 宽带开通指南</view>
              </view>
              <text class="font-label-sm-mobile text-on-surface-variant ml-1 block mt-3">帮你找帖子 🔍（少刷帖，直接问）</text>
              <view class="flex flex-wrap gap-2">
                <view class="px-3 py-1.5 rounded-full bg-primary-fixed/50 text-primary text-[24rpx] font-medium active:scale-95 transition-transform" @click="sendQuickMsg('有没有人捡到蓝色的书包？')">🎒 有人捡到东西吗</view>
                <view class="px-3 py-1.5 rounded-full bg-primary-fixed/50 text-primary text-[24rpx] font-medium active:scale-95 transition-transform" @click="sendQuickMsg('有没有人出售二手自行车？')">🚲 找二手好物</view>
                <view class="px-3 py-1.5 rounded-full bg-primary-fixed/50 text-primary text-[24rpx] font-medium active:scale-95 transition-transform" @click="sendQuickMsg('有没有靠谱的兼职推荐？')">💼 找兼职</view>
              </view>
            </view>
          </view>
        </view>

        <!-- 对话消息列表 -->
        <view
          v-for="(msg, index) in messageList"
          :key="msg.id || index"
          :id="'msg-' + index"
          class="mb-8 flex items-start"
          :class="msg.role === 'user' ? 'justify-end gap-2' : 'justify-start gap-2'"
        >
          <view v-if="msg.role === 'ai'" class="w-10 h-10 rounded-full bg-tertiary-container flex-shrink-0 flex items-center justify-center shadow-sm">
            <text class="material-symbols-outlined text-on-tertiary-container text-[40rpx]">smart_toy</text>
          </view>

          <view class="flex flex-col gap-2 max-w-[80%]">
            <view
              class="p-4"
              :class="msg.role === 'user' ?
                'bubble-user text-white rounded-[40rpx] rounded-tr-none bg-tertiary' :
                'bubble-ai bg-white border-l-8 border-primary-container rounded-[40rpx] rounded-tl-none'"
            >
              <text v-if="msg.role === 'user'" class="font-body-lg-mobile block leading-relaxed text-white">{{ msg.content }}</text>
              <rich-text v-else class="font-body-lg-mobile block leading-relaxed text-on-surface" :nodes="renderMarkdown(msg.content)"></rich-text>
            </view>

            <!-- 智能推荐帖子卡片（08）：AI 把匹配帖子推给你，问"是这个吗?" -->
            <view v-if="msg.role === 'ai' && msg.posts && msg.posts.length > 0" class="space-y-2 mt-1">
              <view v-for="(card, cardIndex) in msg.posts" :key="(card.post && card.post.id) || card.id || cardIndex" class="ai-post-card" @click="goToPostDetail((card.post && card.post.id) || card.id)">
                <image v-if="card.post && card.post.images && card.post.images.length" :src="card.post.images[0]" class="ai-post-thumb" mode="aspectFill"></image>
                <image v-else-if="card.images && card.images.length" :src="card.images[0]" class="ai-post-thumb" mode="aspectFill"></image>
                <view v-else class="ai-post-thumb ai-post-thumb--empty">
                  <text class="material-symbols-outlined text-[40rpx]">image</text>
                </view>
                <view class="flex-1 min-w-0">
                  <text v-if="card.matchReason" class="ai-post-reason">{{ card.matchReason }}</text>
                  <text class="ai-post-excerpt">{{ (card.post && card.post.content) || card.content || '' }}</text>
                  <view class="ai-post-cta">是这个 →</view>
                </view>
              </view>
            </view>

            <text v-if="msg.role === 'ai' && msg.source" class="font-label-sm-mobile text-outline ml-1 block">
              参考来源：{{ msg.source }}
            </text>
          </view>

          <view v-if="msg.role === 'user'" class="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm overflow-hidden bg-secondary-container">
            <image class="w-full h-full object-cover" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" mode="aspectFill"></image>
          </view>
        </view>

        <!-- AI 思考中 -->
        <view class="flex items-start gap-2 mb-8" v-if="isThinking" :id="'msg-' + messageList.length">
          <view class="w-10 h-10 rounded-full bg-tertiary-container flex-shrink-0 flex items-center justify-center shadow-sm">
            <text class="material-symbols-outlined text-on-tertiary-container text-[40rpx]">smart_toy</text>
          </view>
          <view class="bubble-ai bg-white px-6 py-4 rounded-[40rpx] rounded-tl-none flex items-center gap-2">
            <view class="w-2 h-2 rounded-full bg-primary/40 thinking-dot"></view>
            <view class="w-2 h-2 rounded-full bg-primary/60 thinking-dot"></view>
            <view class="w-2 h-2 rounded-full bg-primary/80 thinking-dot"></view>
          </view>
        </view>

      </view>
    </scroll-view>

    <!-- 底部输入区域 -->
    <view class="fixed left-0 w-full z-40 bg-[#F4F5F7] px-margin-page pb-4 pt-8" style="bottom: calc(120rpx + env(safe-area-inset-bottom));">
      <view class="bg-white rounded-full h-[112rpx] flex items-center px-4 gap-3 border border-outline-variant/30">
        <view class="text-on-surface-variant active:text-primary transition-colors flex items-center justify-center">
          <text class="material-symbols-outlined text-[56rpx]">add_circle</text>
        </view>

        <input
          class="flex-grow bg-transparent border-none focus:ring-0 text-on-surface font-body-lg-mobile h-full"
          v-model="inputText"
          placeholder="问问嘉应AI学长..."
          confirm-type="send"
          @confirm="sendMessage"
        />

        <view
          class="w-[80rpx] h-[80rpx] rounded-full flex items-center justify-center shadow-md transition-all duration-300"
          :class="inputText.trim().length > 0 ? 'bg-tertiary text-white active:scale-90' : 'bg-surface-variant text-outline-variant'"
          @click="sendMessage"
        >
          <text class="material-symbols-outlined text-[40rpx]" :style="inputText.trim().length > 0 ? 'font-variation-settings:\'FILL\' 1' : ''">send</text>
        </view>
      </view>
    </view>

    <CustomTabBar :current="2" />
  </view>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { marked } from 'marked'
import { onShow } from '@dcloudio/uni-app'
import { request, get } from '@/utils/request'
import { aiApi } from '@/api/index'
import { useUserStore } from '@/stores/user'

// 获取系统状态栏高度
const systemInfo = uni.getSystemInfoSync()
const statusBarHeight = ref(systemInfo.statusBarHeight || 20)

const inputText = ref('')
const isThinking = ref(false)
const scrollToMessageId = ref('msg-welcome')

// 初始化消息列表
const messageList = ref([])

// 会话 ID 和 当前用户 ID
const conversationId = ref('')
const userStore = useUserStore()
const currentUserId = ref(userStore.userId || 0)

// 侧边栏状态
const showSidebar = ref(false)
const historyList = ref([])
const sidebarLoading = ref(false)

// 页面加载时检查参数
onMounted(() => {
  const userInfo = uni.getStorageSync('userInfo')
  if (userInfo && (userInfo.id || userInfo.userId)) {
    currentUserId.value = userInfo.id || userInfo.userId
  }

  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options || {}

  if (options.sessionId) {
    conversationId.value = options.sessionId
    loadHistoryMessages(options.sessionId)
  } else {
    // 检查是否有从其他页面带过来的会话 ID
    const activeSessionId = uni.getStorageSync('activeSessionId')
    if (activeSessionId) {
      conversationId.value = activeSessionId
      loadHistoryMessages(activeSessionId)
      uni.removeStorageSync('activeSessionId')
    }
  }
})

// onShow 处理从其他页面返回时的情况（TabBar 页面 switchTab 不会触发 onMounted）
onShow(() => {
  const activeSessionId = uni.getStorageSync('activeSessionId')
  if (activeSessionId && activeSessionId !== conversationId.value) {
    conversationId.value = activeSessionId
    messageList.value = []
    loadHistoryMessages(activeSessionId)
    uni.removeStorageSync('activeSessionId')
  }
})

// 加载历史对话记录
const loadHistoryMessages = async (sessionId) => {
  if (!sessionId) return
  try {
    const response = await get(aiApi.getHistoryDetail(sessionId).url, { sessionId })

    if (response.code === 200 || response.success) {
      const records = response.data || []
      messageList.value = records.map((record, idx) => ({
        id: 'msg-' + idx,
        role: record.role === 'USER' ? 'user' : 'ai',
        content: record.content,
        source: ''
      }))

      if (messageList.value.length > 0) {
        scrollToBottom()
      }
    } else {
      uni.showToast({ title: response.message || '加载失败', icon: 'none' })
    }
  } catch (error) {
    console.error('❌ 加载历史对话失败:', error)
    uni.showToast({ title: '网络异常', icon: 'none' })
  }
}

// 打开侧边栏并加载历史记录
const openSidebar = () => {
  showSidebar.value = true
  fetchHistoryList()
}

// 加载历史会话列表
const fetchHistoryList = async () => {
  sidebarLoading.value = true
  const userInfo = uni.getStorageSync('userInfo')
  const userId = userInfo?.id || userInfo?.userId

  if (!userId) {
    sidebarLoading.value = false
    return
  }

  try {
    const response = await get(aiApi.getHistory(userId).url, { userId })
    if (response.code === 200 || response.success) {
      historyList.value = response.data || []
    }
  } catch (error) {
    console.error('❌ 获取会话列表失败:', error)
  } finally {
    sidebarLoading.value = false
  }
}

// 切换到指定会话
const switchToSession = (sessionId) => {
  if (sessionId === conversationId.value) {
    showSidebar.value = false
    return
  }
  conversationId.value = sessionId
  showSidebar.value = false
  messageList.value = []
  loadHistoryMessages(sessionId)
}

// 新建对话
const startNewChat = () => {
  conversationId.value = ''
  showSidebar.value = false
  messageList.value = []
  uni.removeStorageSync('activeSessionId')
  scrollToMessageId.value = 'msg-welcome'
}

// 点击 AI 头像跳转偏好设置
const goToPreference = () => {
  uni.navigateTo({
    url: '/pages/ai/preference'
  })
}

// 从侧边栏跳转偏好设置
const goToPreferenceFromSidebar = () => {
  showSidebar.value = false
  setTimeout(() => {
    uni.navigateTo({
      url: '/pages/ai/preference'
    })
  }, 150)
}

// 点击快捷问题
const sendQuickMsg = (text) => {
  inputText.value = text
  sendMessage()
}

// 将 Markdown 解析为 HTML，供 rich-text 渲染
const renderMarkdown = (content) => {
  if (!content) return ''
  const html = marked.parse(content, { breaks: true, gfm: true })
  return `<div style="color: #1d1b1b; font-size: 15px; line-height: 1.625; word-break: break-word;">${html}</div>`
}

// 统一 AI 返回的帖子卡片格式，兼容 { post, matchReason } 与直接 post 对象两种形式
const normalizePostCards = (posts) => {
  if (!Array.isArray(posts)) return []
  return posts.filter(Boolean).map((card) => {
    if (!card) return null
    if (card.post && typeof card.post === 'object') {
      return card
    }
    if (card.id || card.content !== undefined) {
      return { post: card, matchReason: card.matchReason || '' }
    }
    return null
  }).filter(Boolean)
}

// 发送消息：单一入口，交给后端 agent 自主判断（查知识库 / 查帖子 / 两者综合）
const sendMessage = async () => {
  if (!inputText.value.trim() || isThinking.value) return

  const userText = inputText.value
  const msgId = 'msg-' + Date.now()
  messageList.value.push({ id: msgId, role: 'user', content: userText })
  inputText.value = ''

  scrollToBottom()

  isThinking.value = true

  try {
    const res = await request(aiApi.agent(userText, conversationId.value))
    isThinking.value = false

    if (res.code === 200 && res.data && res.data.success) {
      const aiData = res.data
      if (aiData.conversationId) {
        conversationId.value = aiData.conversationId
      }

      messageList.value.push({
        id: 'msg-' + Date.now(),
        role: 'ai',
        content: aiData.answer,
        posts: normalizePostCards(aiData.posts),   // agent 命中帖子时返回卡片，模板自动渲染
        source: ''
      })
    } else {
      messageList.value.push({
        id: 'msg-' + Date.now(),
        role: 'ai',
        content: '抱歉，学长暂时无法回答这个问题，请稍后再试。',
        source: ''
      })
    }

    scrollToBottom()

  } catch (error) {
    console.error('AI 助手失败:', error)
    isThinking.value = false
    messageList.value.push({
      id: 'msg-' + Date.now(),
      role: 'ai',
      content: '网络开小差了，请稍后再试~',
      source: ''
    })
    scrollToBottom()
  }
}

// 跳转帖子详情
const goToPostDetail = (id) => {
  if (!id) return
  uni.navigateTo({ url: `/pages/post/detail?id=${id}` })
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    // 根据是新消息还是思考状态确定要滚动到的 ID
    const targetIndex = isThinking.value ? messageList.value.length : messageList.value.length - 1
    scrollToMessageId.value = 'msg-' + targetIndex
  })
}
</script>

<style scoped>
/* 隐藏原生滚动条 */
::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  color: transparent;
}

/* 气泡专属圆角 */
.bubble-ai { border-radius: 40rpx 40rpx 40rpx 0; }
.bubble-user { border-radius: 40rpx 40rpx 0 40rpx; }

/* 柔和彩色弥散阴影 */

/* --- 动画组 --- */

/* 头像外圈呼吸灯 */
@keyframes pulse-blue {
  0%, 100% { box-shadow: 0 0 0 0 rgba(126, 200, 227, 0.4); }
  50% { box-shadow: 0 0 0 16rpx rgba(126, 200, 227, 0); }
}
.pulse-ring { animation: pulse-blue 2s infinite; }

/* 顶部状态绿点呼吸灯 */
@keyframes pulse-green {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}
.dot-green { animation: pulse-green 1.5s infinite; }

/* AI 思考中圆点跳动动画 */
@keyframes bounce-dot {
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-12rpx); }
}
.thinking-dot { animation: bounce-dot 1.4s infinite ease-in-out both; }
.thinking-dot:nth-child(1) { animation-delay: -0.32s; }
.thinking-dot:nth-child(2) { animation-delay: -0.16s; }

/* 侧边栏滑入动画 */
@keyframes slideInLeft {
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
.sidebar-slide-in {
  animation: slideInLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1) both;
}

/* ===== 智能推荐帖子卡片（08） ===== */
.ai-post-card {
  display: flex;
  gap: 16rpx;
  background: #fff;
  border-radius: 28rpx;
  padding: 16rpx;
  border: 2rpx solid rgba(0, 0, 0, 0.08);
}
.ai-post-thumb {
  width: 128rpx;
  height: 128rpx;
  border-radius: 20rpx;
  object-fit: cover;
  flex-shrink: 0;
  background: #f1ecec;
}
.ai-post-thumb--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0b3b5;
}
.ai-post-reason {
  display: block;
  font-size: 24rpx;
  font-weight: bold;
  color: #9B4053;
  margin-bottom: 4rpx;
}
.ai-post-excerpt {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  font-size: 24rpx;
  color: #555;
  line-height: 1.4;
}
.ai-post-cta {
  display: inline-block;
  margin-top: 10rpx;
  padding: 4rpx 20rpx;
  border-radius: 999rpx;
  background: #5BA4F0;
  color: #fff;
  font-size: 22rpx;
  font-weight: bold;
}
</style>
