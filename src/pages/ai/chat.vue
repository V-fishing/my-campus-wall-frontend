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
              <text class="font-label-sm-mobile text-on-surface-variant ml-1 block mt-3">帮你发帖 ✍️（说一句，学长写好草稿你确认）</text>
              <view class="flex flex-wrap gap-2">
                <view class="px-3 py-1.5 rounded-full bg-tertiary-fixed/50 text-tertiary text-[24rpx] font-medium active:scale-95 transition-transform" @click="sendQuickMsg('帮我发个二手帖：出一台9成新iPad Air5，要价2600可小刀')">📱 发个二手</view>
                <view class="px-3 py-1.5 rounded-full bg-tertiary-fixed/50 text-tertiary text-[24rpx] font-medium active:scale-95 transition-transform" @click="sendQuickMsg('帮我发个组队帖：周末爬山，找3个同学一起')">🧗 发个组队</view>
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
            <!-- 用户随消息发送的图片 -->
            <view v-if="msg.role === 'user' && msg.images && msg.images.length" class="flex flex-wrap gap-2 justify-end">
              <image v-for="(u, i) in msg.images" :key="i" :src="u" class="user-msg-img" mode="aspectFill"
                     @click="previewImage(msg.images, i)" />
            </view>

            <view
              v-if="msg.type !== 'draft' && msg.content"
              class="p-4"
              :class="msg.role === 'user' ?
                'bubble-user text-white rounded-[40rpx] rounded-tr-none bg-tertiary' :
                'bubble-ai bg-white border-l-8 border-primary-container rounded-[40rpx] rounded-tl-none'"
            >
              <text v-if="msg.role === 'user'" class="font-body-lg-mobile block leading-relaxed text-white">{{ msg.content }}</text>
              <rich-text v-else class="font-body-lg-mobile block leading-relaxed text-on-surface" :nodes="renderMarkdown(msg.content)"></rich-text>
            </view>

            <!-- ===== AI 发帖草稿卡片（对话内联，不跳页） ===== -->
            <view v-if="msg.type === 'draft'" class="draft-card" :class="msg.status === 'superseded' ? 'draft-card--old' : ''">
              <view class="draft-head">
                <text class="draft-cat">{{ msg.draft.category || '推荐' }}</text>
                <text v-if="msg.roundCount > 0" class="draft-round">已改 {{ msg.roundCount }} 版</text>
                <text v-if="msg.status === 'published'" class="draft-badge draft-badge--ok">已发布 ✓</text>
                <text v-else-if="msg.status === 'cancelled'" class="draft-badge draft-badge--cancel">已取消</text>
              </view>

              <text class="draft-content">{{ msg.draft.content }}</text>

              <view v-if="draftImageUrls(msg.draft).length" class="draft-imgs">
                <image v-for="(u, i) in draftImageUrls(msg.draft)" :key="i" :src="u" class="draft-img" mode="aspectFill" />
              </view>

              <view v-if="msg.draft.ai_tags && msg.draft.ai_tags.length" class="draft-chips">
                <text v-for="(t, i) in msg.draft.ai_tags" :key="i" class="draft-chip">#{{ t }}</text>
              </view>

              <view class="draft-fields">
                <text v-if="msg.draft.price != null || msg.draft.negotiable" class="draft-field draft-field--price">💰 {{ msg.draft.price != null ? ('¥' + msg.draft.price) : '' }}{{ msg.draft.negotiable ? ' 可议价' : '' }}</text>
                <text v-if="msg.draft.salary" class="draft-field">💼 {{ msg.draft.salary }}</text>
                <text v-if="msg.draft.location" class="draft-field">📍 {{ msg.draft.location }}</text>
              </view>

              <view v-if="msg.error" class="draft-error">⚠ {{ msg.error }}</view>

              <template v-if="msg.status === 'awaiting'">
                <view class="draft-actions">
                  <view class="draft-btn draft-btn--publish" @click="publishDraft(msg.draftId)">确认发布</view>
                  <view class="draft-btn draft-btn--cancel" @click="cancelInlineDraft(msg.draftId)">取消</view>
                </view>
                <text class="draft-hint">想改直接在下面说，例如「价格改成 200」「换成组队板块」「正文再热情点」</text>
              </template>

              <view v-if="msg.status === 'published' && msg.postId" class="draft-btn draft-btn--view" @click="goToPostDetail(msg.postId)">去看看我的帖子 →</view>
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
      <!-- 发帖中常驻状态条：即使草稿卡片被滚走/清掉也能退出 -->
      <view v-if="activeDraftId" class="flex items-center justify-between mb-2 px-4 py-2 rounded-full bg-tertiary/10">
        <text class="text-[22rpx] text-tertiary font-medium">✍️ 发帖中 · 想改直接在下面说</text>
        <view class="px-3 py-1 rounded-full bg-white text-[22rpx] text-on-surface-variant active:scale-95" @click="exitDraftMode">退出</view>
      </view>
      <!-- 待发图片预览（点 ＋ 选的图，随下一条发帖描述一起发） -->
      <view v-if="pendingImages.length" class="flex gap-2 mb-2 px-1">
        <view v-for="(img, i) in pendingImages" :key="i" class="relative w-16 h-16 rounded-xl overflow-hidden bg-surface-variant">
          <image :src="img.preview" class="w-full h-full" mode="aspectFill" />
          <view class="absolute top-0 right-0 w-5 h-5 rounded-full bg-black/55 flex items-center justify-center" @click="removePendingImage(i)">
            <text class="material-symbols-outlined text-white text-[24rpx]">close</text>
          </view>
          <view v-if="img.status === 'uploading'" class="absolute inset-0 bg-black/40 flex items-center justify-center">
            <text class="material-symbols-outlined text-white animate-spin text-[28rpx]">sync</text>
          </view>
          <view v-if="img.status === 'error'" class="absolute inset-0 bg-black/55 flex items-center justify-center" @click="removePendingImage(i)">
            <text class="text-white text-[18rpx]">失败</text>
          </view>
        </view>
      </view>
      <view class="bg-white rounded-full h-[112rpx] flex items-center px-4 gap-3 border border-outline-variant/30">
        <view class="text-on-surface-variant active:text-primary active:scale-90 transition-all flex items-center justify-center"
              @click="choosePostImages">
          <text class="material-symbols-outlined text-[56rpx]">add_circle</text>
        </view>

        <input
          class="flex-grow bg-transparent border-none focus:ring-0 text-on-surface font-body-lg-mobile h-full"
          v-model="inputText"
          :placeholder="inputPlaceholder"
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
import { ref, computed, nextTick, onMounted } from 'vue'
import { marked } from 'marked'
import { onShow } from '@dcloudio/uni-app'
import { request, get } from '@/utils/request'
import { aiApi, fileApi } from '@/api/index'
import { config } from '@/config'
import { useUserStore } from '@/stores/user'

// AI 出草稿/改稿走 LLM(+VLM 看图)，远超 request 默认 10s
const AI_TIMEOUT = 90000

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

// 对话内联「AI 发帖」状态
const activeDraftId = ref('')          // 非空 = 正处于草稿编辑中，下一条文本走"改稿"
const pendingImages = ref([])          // ＋ 选的待发图片 [{ preview, objectName, status }]

// 输入框 placeholder 随状态变化，引导用户
const inputPlaceholder = computed(() => {
  if (activeDraftId.value) return '想怎么改直接说，或点卡片「确认发布」…'
  if (pendingImages.value.length) return '配图提问找帖，或说「帮我发个…」让学长照图发帖…'
  return '问问 / 说「帮我发个…」让学长直接发帖'
})

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
    clearInlineDraft()
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
      messageList.value = records.map((record, idx) => {
        const base = { id: 'msg-' + idx, role: record.role === 'USER' ? 'user' : 'ai' }
        const mt = record.messageType
        // 草稿卡片历史：重建为【只读】卡。awaiting 降级 superseded——MemorySaver 进程重启后 resume 已失效，
        // 不恢复可操作态/activeDraftId（点发布会拿不到 interrupt 必败）。published/cancelled 原状态展示。
        if (record.role !== 'USER' && (mt === 'post_draft' || mt === 'post_published')) {
          const meta = parseMetaObj(record.metadataJson) || {}
          let status = meta.status || (mt === 'post_published' ? 'published' : 'awaiting')
          if (status === 'awaiting') status = 'superseded'
          return {
            ...base, role: 'ai', type: 'draft',
            draftId: meta.draftId || '', draft: meta.draft || {},
            roundCount: meta.roundCount || 0, status, postId: meta.postId || null,
            content: '', error: ''
          }
        }
        // 普通文本/帖子卡片：帖子卡片存在 metadataJson 里，回放还原，避免切换会话/刷新后丢失
        return {
          ...base, content: record.content,
          posts: record.role === 'USER' ? undefined : normalizePostCards(parsePostsFromMeta(record.metadataJson)),
          source: ''
        }
      })

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
  clearInlineDraft()
  conversationId.value = sessionId
  showSidebar.value = false
  messageList.value = []
  loadHistoryMessages(sessionId)
}

// 新建对话
const startNewChat = () => {
  clearInlineDraft()
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

// ＋ 按钮：选图（可配图提问找帖，也可让学长照图发帖；直接在对话里发，不跳页）
const choosePostImages = () => {
  if (isThinking.value) return
  const remain = 9 - pendingImages.value.length
  if (remain <= 0) { uni.showToast({ title: '最多 9 张', icon: 'none' }); return }
  uni.chooseImage({
    count: remain,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      res.tempFilePaths.forEach((fp) => {
        const item = { preview: fp, objectName: '', status: 'uploading' }
        pendingImages.value.push(item)
        uploadPendingImage(fp, item)
      })
      uni.showToast({ title: '图已加，可提问找帖或发帖', icon: 'none' })
    }
  })
}

const uploadPendingImage = (filePath, item) => {
  const token = uni.getStorageSync('token')
  uni.uploadFile({
    url: `${config.apiBaseUrl}${fileApi.uploadPostTempImage().url}`,
    filePath, name: 'file',
    header: { Authorization: `Bearer ${token}` },
    success: (res) => {
      try {
        const data = JSON.parse(res.data)
        if (data.code === 200) { item.objectName = data.data.objectName; item.status = 'success' }
        else item.status = 'error'
      } catch (e) { item.status = 'error' }
    },
    fail: () => { item.status = 'error' }
  })
}

const removePendingImage = (i) => pendingImages.value.splice(i, 1)
const pendingObjectNames = () => pendingImages.value.filter(p => p.status === 'success' && p.objectName).map(p => p.objectName)

// 草稿图 objectName → 可显示 URL（小程序 HTTPS 经后端代理视图）
const draftImageUrls = (draft) => {
  const objs = (draft && draft.images) || []
  return objs.map(o => `${config.apiBaseUrl}/api/v1/files/view?objectName=${encodeURIComponent(o)}`)
}

// 点击用户气泡里的图片预览
const previewImage = (urls, current) => {
  if (!urls || !urls.length) return
  uni.previewImage({ urls, current: urls[current] })
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

// 解析 metadataJson（Java 实体以 JSON 文本返回，也兼容已是对象的情况）为对象；失败返回 null。
const parseMetaObj = (m) => {
  if (!m) return null
  if (typeof m === 'string') { try { return JSON.parse(m) } catch (e) { return null } }
  return m
}

// 从历史记录的 metadataJson 里取出帖子卡片数组。
// 后端 metadata_json 列经 Java 实体以 JSON 文本返回（也兼容已是对象的情况），形如 { posts: [...] }。
const parsePostsFromMeta = (metadataJson) => {
  if (!metadataJson) return []
  let meta = metadataJson
  if (typeof metadataJson === 'string') {
    try {
      meta = JSON.parse(metadataJson)
    } catch (e) {
      return []
    }
  }
  return (meta && Array.isArray(meta.posts)) ? meta.posts : []
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

// 发送：按状态路由 —— 退出发帖 / 改稿 / 带图或普通问答(后端定意图：找帖/答疑/发帖)
const sendMessage = async () => {
  if (!inputText.value.trim() || isThinking.value) return
  const userText = inputText.value
  // 意图识别一律下沉后端：带不带图都走 askAgent，由后端 action 决定 找帖/答疑/发帖。
  // 带图时后端先 VLM 看图说话把描述并入检索（找帖/答疑）；若判为发帖意图则起草稿（图随草稿）。
  const hasImages = !activeDraftId.value && pendingObjectNames().length > 0

  // 带图时若图还在上传，先拦住（避免静默掉图）
  if (hasImages && pendingImages.value.some(p => p.status === 'uploading')) {
    uni.showToast({ title: '图还在上传，稍等一下再发', icon: 'none' })
    return
  }

  // 用户气泡带上本次所发图片（objectName → 后端文件视图 URL）
  const sentImages = hasImages
    ? pendingObjectNames().map(o => `${config.apiBaseUrl}/api/v1/files/view?objectName=${encodeURIComponent(o)}`)
    : []
  messageList.value.push({ id: 'msg-' + Date.now(), role: 'user', content: userText, images: sentImages })
  inputText.value = ''
  scrollToBottom()

  if (activeDraftId.value) {
    // 文本退出意图 → 直接取消，跳出"改稿模式"，不再硬路由到改稿
    if (/^(算了|不发了|不发啦|取消|退出|不改了|不想发了|结束)/.test(userText.trim())) {
      cancelInlineDraft(activeDraftId.value)
    } else {
      await editActiveDraft(userText)
    }
  } else {
    await askAgent(userText, hasImages ? pendingObjectNames() : [])
  }
}

// 普通问答 / 带图找帖：单一入口，交给后端 agent 自主判断（看图说话 → 查知识库 / 查帖子 / 综合 / 发帖）
const askAgent = async (userText, images = []) => {
  isThinking.value = true
  try {
    // 带图要走后端 VLM 看图说话，远超默认 10s，用 AI_TIMEOUT
    const res = images.length
      ? await request({ ...aiApi.agent(userText, conversationId.value, images), timeout: AI_TIMEOUT })
      : await request(aiApi.agent(userText, conversationId.value))
    const aiData = (res && res.data) || {}
    if (aiData.conversationId) conversationId.value = aiData.conversationId
    // 后端判定为发帖意图 → 起草稿（图仍在 pendingImages，startInlineDraft 会带上）
    if (res.code === 200 && aiData.action === 'create_post') {
      isThinking.value = false
      await startInlineDraft(aiData.postText || userText)
      return
    }
    // 找帖/答疑路径：图片已被"提问"消费，清掉待发图
    isThinking.value = false
    pendingImages.value = []
    if (res.code === 200 && aiData.success) {
      messageList.value.push({
        id: 'msg-' + Date.now(), role: 'ai', content: aiData.answer,
        posts: normalizePostCards(aiData.posts), source: ''
      })
    } else {
      messageList.value.push({ id: 'msg-' + Date.now(), role: 'ai', content: '抱歉，学长暂时无法回答这个问题，请稍后再试。', source: '' })
    }
    scrollToBottom()
  } catch (error) {
    console.error('AI 助手失败:', error)
    isThinking.value = false
    pendingImages.value = []
    messageList.value.push({ id: 'msg-' + Date.now(), role: 'ai', content: '网络开小差了，请稍后再试~', source: '' })
    scrollToBottom()
  }
}

// 起草稿：AI 发帖入口（对话内联弹卡片，不跳页）
const startInlineDraft = async (userText) => {
  // 草稿的 conversation_id 仅后端存在草稿行上；不要污染真实 conversationId(由问答返回时才赋值)
  const cid = conversationId.value || ('chat-' + Date.now())
  const images = pendingObjectNames()
  isThinking.value = true
  try {
    const res = await request({ ...aiApi.startDraft(cid, userText.trim(), images), timeout: AI_TIMEOUT })
    isThinking.value = false
    if (res.code === 200 && res.data && res.data.draftId) {
      activeDraftId.value = res.data.draftId
      pendingImages.value = []
      pushDraftCard(res.data.draftId, res.data.draft || {}, res.data.round_count || 0)
    } else {
      messageList.value.push({ id: 'msg-' + Date.now(), role: 'ai', content: (res.data && res.data.error) || '草稿没生成出来，换个说法再试试~', source: '' })
    }
    scrollToBottom()
  } catch (e) {
    isThinking.value = false
    messageList.value.push({ id: 'msg-' + Date.now(), role: 'ai', content: '生成草稿超时了，稍后再试~', source: '' })
    scrollToBottom()
  }
}

// 改稿：草稿编辑中，用户这条文本即"改稿指令"
const editActiveDraft = async (userText) => {
  isThinking.value = true
  try {
    const res = await request({ ...aiApi.resumeDraft(activeDraftId.value, 'edit', userText.trim()), timeout: AI_TIMEOUT })
    isThinking.value = false
    const data = (res && res.data) || {}
    if (res.code === 200 && data.status === 'published') {
      // 改到第 6 版后端会直接尝试发布
      finishPublished(activeDraftId.value, data.postId)
    } else if (res.code === 200 && data.draft) {
      // 改到第6版后端可能自动尝试发布失败→同时带 draft 与 error，把 error 透传到新卡片
      supersedeActiveDraftCards()
      pushDraftCard(activeDraftId.value, data.draft, data.round_count || 0, data.error || '')
    } else if (data.error) {
      const card = currentAwaitingCard()
      if (card) card.error = data.error
    } else {
      messageList.value.push({ id: 'msg-' + Date.now(), role: 'ai', content: '这处没改成，换个说法告诉我？', source: '' })
    }
    scrollToBottom()
  } catch (e) {
    isThinking.value = false
    messageList.value.push({ id: 'msg-' + Date.now(), role: 'ai', content: '改稿超时了，再说一次~', source: '' })
    scrollToBottom()
  }
}

// 往消息流插入一张草稿卡片
const pushDraftCard = (draftId, draft, roundCount, error = '') => {
  messageList.value.push({
    id: 'msg-' + Date.now(), role: 'ai', type: 'draft',
    draftId, draft, roundCount, status: 'awaiting', error
  })
}

// 当前 activeDraftId 的待操作卡片
const currentAwaitingCard = () =>
  messageList.value.find(m => m.type === 'draft' && m.draftId === activeDraftId.value && m.status === 'awaiting')

// 把旧的待操作草稿卡标记为 superseded（隐藏其按钮，只留最新一张可操作）
const supersedeActiveDraftCards = () => {
  messageList.value.forEach(m => {
    if (m.type === 'draft' && m.draftId === activeDraftId.value && m.status === 'awaiting') m.status = 'superseded'
  })
}

// 发布成功收尾
const finishPublished = (draftId, postId) => {
  // 当前可操作的就是 awaiting 那张；回放后卡片可能不在(找不到则只清状态+提示)
  const card = messageList.value.find(m => m.type === 'draft' && m.draftId === draftId && m.status === 'awaiting')
  if (card) { card.status = 'published'; card.postId = postId || null; card.error = '' }
  activeDraftId.value = ''
  uni.setStorageSync('hasNewPost', true)
  messageList.value.push({ id: 'msg-' + Date.now(), role: 'ai', content: '✅ 帮你发出去啦！可以在「圈子」里看到这条帖子～', source: '' })
}

// 确认发布（卡片按钮）
const publishDraft = async (draftId) => {
  if (isThinking.value) return
  isThinking.value = true
  try {
    const res = await request({ ...aiApi.resumeDraft(draftId, 'publish'), timeout: AI_TIMEOUT })
    isThinking.value = false
    const data = (res && res.data) || {}
    if (res.code === 200 && data.status === 'published') {
      finishPublished(draftId, data.postId)
    } else if (data.error) {
      const card = messageList.value.find(m => m.type === 'draft' && m.draftId === draftId && m.status === 'awaiting')
      if (card) card.error = data.error
      uni.showToast({ title: '还差点信息，看卡片提示补充', icon: 'none' })
    } else {
      uni.showToast({ title: '发布失败，请稍后再试', icon: 'none' })
    }
    scrollToBottom()
  } catch (e) {
    isThinking.value = false
    uni.showToast({ title: '发布超时，请稍后再试', icon: 'none' })
  }
}

// 取消草稿（卡片按钮 / 文本退出意图 / 输入栏退出按钮）
const cancelInlineDraft = (draftId) => {
  if (isThinking.value) return
  const card = messageList.value.find(m => m.type === 'draft' && m.draftId === draftId && m.status === 'awaiting')
  if (card) card.status = 'cancelled'
  if (activeDraftId.value === draftId) activeDraftId.value = ''
  request(aiApi.cancelDraft(draftId)).catch(() => {})
  messageList.value.push({ id: 'msg-' + Date.now(), role: 'ai', content: '好的，这条不发了。想发别的随时跟我说～', source: '' })
  scrollToBottom()
}

// 退出发帖模式（输入栏常驻入口，即使草稿卡被滚走/清掉也能退出）
const exitDraftMode = () => { if (activeDraftId.value && !isThinking.value) cancelInlineDraft(activeDraftId.value) }

// 清理对话内联草稿状态（切会话/新建/刷新时调用，best-effort 丢弃后端草稿，避免孤儿 awaiting 草稿）
const clearInlineDraft = () => {
  if (activeDraftId.value) {
    request(aiApi.cancelDraft(activeDraftId.value)).catch(() => {})
    activeDraftId.value = ''
  }
  pendingImages.value = []
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

/* 用户随消息发送的图片缩略图 */
.user-msg-img { width: 160rpx; height: 160rpx; border-radius: 20rpx; background: #f1ecec; }

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

/* ===== AI 发帖草稿卡片（对话内联） ===== */
.draft-card {
  background: #fff;
  border-radius: 28rpx;
  padding: 24rpx;
  border: 2rpx solid rgba(91, 164, 240, 0.35);
  box-shadow: 0 4rpx 16rpx rgba(91, 164, 240, 0.08);
}
.draft-card--old { opacity: 0.5; }
.draft-head { display: flex; align-items: center; gap: 12rpx; margin-bottom: 12rpx; flex-wrap: wrap; }
.draft-cat {
  display: inline-block; padding: 4rpx 18rpx; border-radius: 999rpx;
  background: rgba(91, 164, 240, 0.14); color: #2f6fb0; font-size: 22rpx; font-weight: bold;
}
.draft-round { font-size: 20rpx; color: #9aa0a6; }
.draft-badge { font-size: 22rpx; font-weight: bold; padding: 2rpx 12rpx; border-radius: 999rpx; }
.draft-badge--ok { color: #1a7f4b; background: rgba(26, 127, 75, 0.12); }
.draft-badge--cancel { color: #9aa0a6; background: rgba(0, 0, 0, 0.05); }
.draft-content { display: block; font-size: 28rpx; color: #1d1b1b; line-height: 1.6; white-space: pre-line; }
.draft-imgs { display: flex; flex-wrap: wrap; gap: 10rpx; margin-top: 14rpx; }
.draft-img { width: 150rpx; height: 150rpx; border-radius: 16rpx; background: #f1ecec; }
.draft-chips { display: flex; flex-wrap: wrap; gap: 10rpx; margin-top: 14rpx; }
.draft-chip { font-size: 22rpx; color: #5f6368; background: #f0f2f5; padding: 4rpx 16rpx; border-radius: 999rpx; }
.draft-fields { display: flex; flex-direction: column; gap: 6rpx; margin-top: 14rpx; }
.draft-field { font-size: 24rpx; color: #5f6368; }
.draft-field--price { color: #e2574c; font-weight: bold; }
.draft-error {
  margin-top: 14rpx; padding: 12rpx 16rpx; border-radius: 14rpx;
  background: rgba(226, 87, 76, 0.08); color: #c0392b; font-size: 24rpx;
}
.draft-actions { display: flex; gap: 16rpx; margin-top: 20rpx; }
.draft-btn {
  height: 76rpx; border-radius: 999rpx; display: flex; align-items: center; justify-content: center;
  font-size: 26rpx; font-weight: bold;
}
.draft-btn--publish { flex: 1; background: #5BA4F0; color: #fff; }
.draft-btn--cancel { flex: 0 0 28%; background: #f0f2f5; color: #5f6368; }
.draft-btn--view { margin-top: 16rpx; background: rgba(26, 127, 75, 0.1); color: #1a7f4b; height: 72rpx; }
.draft-hint { display: block; margin-top: 12rpx; font-size: 20rpx; color: #9aa0a6; }
</style>
