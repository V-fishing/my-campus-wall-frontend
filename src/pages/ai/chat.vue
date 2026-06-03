<template>
  <view class="bg-background text-on-surface font-body-lg-mobile min-h-screen flex flex-col relative selection:bg-primary-container">
    
    <view class="fixed top-0 w-full z-50 bg-surface/85 backdrop-blur-md flex items-center justify-between px-margin-page shadow-sm shadow-[0_12px_40px_rgba(255,143,163,0.12)] pr-capsule-safe-zone" 
          :style="{ paddingTop: statusBarHeight + 'px', height: (statusBarHeight + 64) + 'px' }">
      <view class="flex items-center gap-3">
        <view class="relative w-10 h-10 rounded-full bg-tertiary-container flex items-center justify-center pulse-ring">
          <text class="material-symbols-outlined text-on-tertiary-container text-[40rpx]">smart_toy</text>
        </view>
        <view class="flex flex-col">
          <text class="font-headline-md-mobile text-headline-md-mobile text-primary tracking-tight font-bold">嘉应AI学长</text>
          <view class="flex items-center gap-1.5 mt-0.5">
            <view class="w-2 h-2 rounded-full bg-green-500 dot-green"></view>
            <text class="font-label-sm-mobile text-label-sm-mobile text-on-surface-variant">一直在线</text>
          </view>
        </view>
      </view>
      <view class="w-10 h-10 flex items-center justify-center text-on-surface-variant active:scale-95 transition-transform">

      </view>
    </view>

    <view class="fixed top-32 right-4 pointer-events-none opacity-20 rotate-12 z-0">
      <text class="material-symbols-outlined text-primary text-[80rpx]">auto_awesome</text>
    </view>
    <view class="fixed bottom-40 left-4 pointer-events-none opacity-20 -rotate-12 z-0">
      <text class="material-symbols-outlined text-secondary text-[80rpx]">favorite</text>
    </view>

    <scroll-view 
      class="flex-1 w-full box-border z-10" 
      scroll-y="true" 
      :scroll-into-view="scrollToMessageId"
      scroll-with-animation
      :style="{ paddingTop: (statusBarHeight + 80) + 'px' }"
    >
      <view class="px-margin-page pb-[320rpx]">
        
        <view class="flex items-start gap-2 mb-8" id="msg-welcome">
          <view class="w-10 h-10 rounded-full bg-tertiary-container flex-shrink-0 flex items-center justify-center shadow-sm">
            <text class="material-symbols-outlined text-on-tertiary-container text-[40rpx]">smart_toy</text>
          </view>
          <view class="flex flex-col gap-2 max-w-[85%]">
            <view class="bubble-ai bg-white p-4 kawaii-shadow rounded-[40rpx] rounded-tl-none">
              <text class="font-body-lg-mobile text-on-surface block leading-relaxed">你好同学！我是嘉应AI学长。我已经学习了学校的《新生手册》、《选课指南》和近期的校园通知。有什么我可以帮你的吗？</text>
            </view>
            <view class="space-y-2 mt-2">
              <text class="font-label-sm-mobile text-on-surface-variant ml-1 block">猜你想问 ✨</text>
              <view class="flex flex-wrap gap-2">
                <view class="px-4 py-2 rounded-full bg-gradient-to-r from-[#E0F2FE] to-[#BAE6FD] text-tertiary font-label-md-mobile shadow-sm active:scale-95 transition-transform border border-white/50" @click="sendQuickMsg('北区图书馆周末几点闭馆？')">📖 图书馆闭馆时间</view>
                <view class="px-4 py-2 rounded-full bg-gradient-to-r from-[#E0F2FE] to-[#BAE6FD] text-tertiary font-label-md-mobile shadow-sm active:scale-95 transition-transform border border-white/50" @click="sendQuickMsg('大创项目怎么申报？')">💡 大创申报流程</view>
                <view class="px-4 py-2 rounded-full bg-gradient-to-r from-[#E0F2FE] to-[#BAE6FD] text-tertiary font-label-md-mobile shadow-sm active:scale-95 transition-transform border border-white/50" @click="sendQuickMsg('宿舍宽带怎么开通？')">🌐 宽带开通指南</view>
              </view>
            </view>
          </view>
        </view>

        <view 
          v-for="(msg, index) in messageList" 
          :key="index"
          :id="'msg-' + index"
          class="mb-8 flex items-start"
          :class="msg.role === 'user' ? 'justify-end gap-2' : 'justify-start gap-2'"
        >
          <view v-if="msg.role === 'ai'" class="w-10 h-10 rounded-full bg-tertiary-container flex-shrink-0 flex items-center justify-center shadow-sm">
            <text class="material-symbols-outlined text-on-tertiary-container text-[40rpx]">smart_toy</text>
          </view>

          <view class="flex flex-col gap-2 max-w-[80%]">
            <view 
              class="p-4 kawaii-shadow"
              :class="msg.role === 'user' ? 
                'bubble-user text-white rounded-[40rpx] rounded-tr-none bg-gradient-to-br from-[#7EC8E3] to-[#5BA4F0]' : 
                'bubble-ai bg-white border-l-8 border-primary-container rounded-[40rpx] rounded-tl-none'"
            >
              <text class="font-body-lg-mobile block leading-relaxed" :class="msg.role === 'user' ? 'text-white' : 'text-on-surface'">{{ msg.content }}</text>
            </view>
            
            <text v-if="msg.role === 'ai' && msg.source" class="font-label-sm-mobile text-outline ml-1 block">
              参考来源：{{ msg.source }}
            </text>
          </view>

          <view v-if="msg.role === 'user'" class="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm overflow-hidden bg-secondary-container">
            <image class="w-full h-full object-cover" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" mode="aspectFill"></image>
          </view>
        </view>

        <view class="flex items-start gap-2 mb-8" v-if="isThinking" :id="'msg-' + messageList.length">
          <view class="w-10 h-10 rounded-full bg-tertiary-container flex-shrink-0 flex items-center justify-center shadow-sm">
            <text class="material-symbols-outlined text-on-tertiary-container text-[40rpx]">smart_toy</text>
          </view>
          <view class="bubble-ai bg-white px-6 py-4 kawaii-shadow rounded-[40rpx] rounded-tl-none flex items-center gap-2">
            <view class="w-2 h-2 rounded-full bg-primary/40 thinking-dot"></view>
            <view class="w-2 h-2 rounded-full bg-primary/60 thinking-dot"></view>
            <view class="w-2 h-2 rounded-full bg-primary/80 thinking-dot"></view>
          </view>
        </view>

      </view>
    </scroll-view>

    <view class="fixed left-0 w-full z-40 bg-gradient-to-t from-background via-background to-transparent px-margin-page pb-4 pt-8" style="bottom: calc(120rpx + env(safe-area-inset-bottom));">
      <view class="bg-white rounded-full h-[112rpx] flex items-center px-4 gap-3 kawaii-shadow border border-outline-variant/30">
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
          :class="inputText.trim().length > 0 ? 'bg-gradient-to-br from-[#7EC8E3] to-[#5BA4F0] text-white active:scale-90' : 'bg-surface-variant text-outline-variant'"
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

// 页面加载时检查是否有 sessionId 参数
onMounted(() => {
  const userInfo = uni.getStorageSync('userInfo');
  if (userInfo && (userInfo.id || userInfo.userId)) {
    currentUserId.value = userInfo.id || userInfo.userId;
  }
  
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = currentPage.options || {};
  
  if (options.sessionId) {
    conversationId.value = options.sessionId;
    loadHistoryMessages(options.sessionId);
  }
})

// 加载历史对话记录
const loadHistoryMessages = async (sessionId) => {
  try {
    const response = await get(aiApi.getHistoryDetail(sessionId).url, { sessionId });
    
    if (response.code === 200 || response.success) {
      const records = response.data || [];
      messageList.value = records.map(record => ({
        role: record.role === 'USER' ? 'user' : 'ai',
        content: record.content,
        source: '' 
      }));
      
      if (messageList.value.length > 0) {
        scrollToBottom();
      }
    } else {
      uni.showToast({ title: response.message || '加载失败', icon: 'none' });
    }
  } catch (error) {
    console.error('❌ 加载历史对话失败:', error);
    uni.showToast({ title: '网络异常', icon: 'none' });
  }
}

// 点击快捷问题
const sendQuickMsg = (text) => {
  inputText.value = text
  sendMessage()
}

// 发送消息
const sendMessage = async () => {
  if (!inputText.value.trim() || isThinking.value) return

  const userText = inputText.value
  messageList.value.push({ role: 'user', content: userText })
  inputText.value = '' 
  
  scrollToBottom()

  isThinking.value = true
  
  try {
    const res = await request(aiApi.chat(currentUserId.value, userText, conversationId.value))
    isThinking.value = false
    
    if (res.code === 200 && res.data.success) {
      const aiData = res.data
      if (aiData.conversationId) {
        conversationId.value = aiData.conversationId
      }
      
      let sourceText = ''
      if (aiData.sources && aiData.sources.length > 0) {
        sourceText = aiData.sources.map(s => s.title).join('、')
      }
      
      messageList.value.push({ 
        role: 'ai', 
        content: aiData.answer,
        source: sourceText 
      })
    } else {
      messageList.value.push({ 
        role: 'ai', 
        content: '抱歉，学长暂时无法回答这个问题，请稍后再试。',
        source: '' 
      })
    }
    
    scrollToBottom()
    
  } catch (error) {
    console.error('AI 问答失败:', error)
    isThinking.value = false
    messageList.value.push({ 
      role: 'ai', 
      content: '网络开小差了，请稍后再试~',
      source: '' 
    })
    scrollToBottom()
  }
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    // 根据是新消息还是思考状态确定要滚动到的 ID
    const targetIndex = isThinking.value ? messageList.value.length : messageList.value.length - 1;
    scrollToMessageId.value = 'msg-' + targetIndex;
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
.kawaii-shadow { box-shadow: 0 12rpx 40rpx rgba(255, 143, 163, 0.12); }

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
</style>