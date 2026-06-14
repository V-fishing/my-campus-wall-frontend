<template>
  <view class="bg-[#F4F5F7] text-on-surface font-body-lg min-h-screen flex flex-col relative selection:bg-primary-fixed overflow-hidden">
    
    <!-- 顶部固定毛玻璃高光 AppBar 导航栏 -->
    <header
      class="fixed top-0 left-0 w-full z-50 bg-[#F4F5F7]/85 backdrop-blur-md flex flex-col justify-end pb-2 border-b border-outline-variant/20 shadow-sm"
      :style="{ paddingTop: statusBarHeight + 'px', height: (statusBarHeight + 48) + 'px' }"
    >
      <view class="h-status-bar w-full"></view>
      <view class="flex items-center justify-between px-margin-page h-[48px] relative w-full pr-[180rpx]">
        <view class="bouncy-tap p-2 -ml-2 text-primary flex items-center justify-center cursor-pointer" @click="goBack">
          <text class="material-symbols-outlined text-[48rpx]">arrow_back_ios</text>
        </view>
        <h1 class="absolute left-1/2 -translate-x-1/2 font-headline-md text-[34rpx] text-primary font-bold truncate max-w-[300rpx]">{{ partnerName }}</h1>
        <view class="bouncy-tap p-2 text-primary flex items-center justify-center cursor-pointer">
        </view>
      </view>
    </header>

    <!-- 主体聊天滚动大画布 -->
    <scroll-view 
      class="flex-1 w-full" 
      scroll-y="true" 
      :scroll-into-view="scrollToMessageId"
      scroll-with-animation
      @scrolltoupper="loadMore"
      upper-threshold="50"
      :style="{ height: 'calc(100vh - ' + (statusBarHeight + 48) + 'px)', marginTop: (statusBarHeight + 48) + 'px' }"
    >
      <view class="chat-list px-margin-page pt-6 space-y-6" :class="showEmojiPanel ? 'pb-[600rpx]' : 'pb-[260rpx]'">
        
        <!-- 空状态提示 -->
        <view v-if="messageList.length === 0 && !loading" class="text-center py-24 animate-fade-in">
          <text class="text-[32rpx] text-outline block font-bold mb-1">暂无聊天记录</text>
          <text class="text-[24rpx] text-outline-variant block font-medium">给温暖的TA打个招呼吧~ ✨</text>
        </view>

        <!-- 历史轨迹加载中骨架 -->
        <view v-if="loading" class="text-center py-3 text-outline-variant text-[24rpx]">
          <text class="material-symbols-outlined animate-spin text-[32rpx] mr-2">sync</text>正在调阅时光卷轴...
        </view>

        <view 
          v-for="(msg, index) in messageList" 
          :key="msg.id || index"
          :id="'msg-' + index"
          class="w-full"
        >
          <!-- 1. 时间戳智能切线分水岭（间隔5分钟以上显示） -->
          <div class="flex items-center justify-center space-x-4 opacity-40 py-2" v-if="shouldShowTime(msg, index)">
            <div class="h-[1px] flex-1 border-t border-outline"></div>
            <span class="font-label-sm text-[22rpx] text-on-surface-variant font-medium">{{ formatMessageTime(msg.createTime) }}</span>
            <div class="h-[1px] flex-1 border-t border-outline"></div>
          </div>
          
          <!-- 2. 撤回单条消息手账贴纸提示 -->
          <div class="flex justify-center py-2 animate-fade-in" v-if="msg.isRecalled">
            <div class="px-6 py-1 border-2 border-outline-variant/50 rounded-full bg-surface-container-low/30">
              <span class="text-[24rpx] text-on-surface-variant/60 font-bold">消息已撤回 🤫</span>
            </div>
          </div>

          <!-- 3. 标准双向对话气泡排版流[cite: 17] -->
          <view v-else class="flex items-start gap-3 w-full animate-fade-in" 
                :class="[msg.role === 'me' ? 'justify-end' : 'justify-start']"
                @longpress="showMessageMenu(msg)">
            
            <!-- 对方发送：头像在左侧 -->
            <image v-if="msg.role === 'partner'" class="w-10 h-10 rounded-full bg-surface-container shrink-0 object-cover" :src="msg.senderAvatar || partnerAvatar || defaultAvatar" mode="aspectFill" />
            
            <!-- 对话核心棉花糖包裹框 -->
            <view class="max-w-[70%] p-4 text-[28rpx] leading-relaxed shadow-sm"
                  :class="[msg.role === 'me' 
                    ? 'gradient-user text-white rounded-[40rpx] rounded-tr-none shadow-[0_12px_40px_rgba(91,164,240,0.18)]' 
                    : 'bg-white text-on-surface-variant rounded-[40rpx] rounded-tl-none border border-surface-container-highest']">
              <text class="block word-break font-medium">{{ msg.content }}</text>
            </view>

            <!-- 我方发送：头像在右侧 -->
            <image v-if="msg.role === 'me'" class="w-9 h-9 rounded-full bg-surface-container shrink-0 object-cover" :src="msg.senderAvatar || defaultAvatar" mode="aspectFill" />
          </view>
        </view>

      </view>
    </scroll-view>

    <!-- 点击 Emoji 面板外部区域关闭面板 -->
    <view
      v-if="showEmojiPanel"
      class="fixed top-0 left-0 w-full h-full z-30"
      @click="closeEmojiPanel"
    ></view>

    <!-- 底部固定多维柔性输入及快捷回复大底盘[cite: 17] -->
    <footer class="fixed bottom-0 left-0 w-full z-50 bg-[#F4F5F7] pt-4">
      
      <!-- 快捷回复流（支持横向手账滑移隐藏滚动条）[cite: 17] -->
      <div class="px-margin-page pb-3" v-if="messageList.length > 0">
        <div class="flex overflow-x-auto hide-scrollbar space-x-2 py-1">
          <button v-for="reply in quickReplies" :key="reply" @click="handleQuickReply(reply)"
                  class="flex-shrink-0 px-5 py-1.5 bg-secondary-container/20 text-on-secondary-container border border-secondary-container/40 rounded-full font-bold text-[24rpx] bouncy-tap">
            {{ reply }}
          </button>
        </div>
      </div>

      <!-- 输入对话框主结构栏 -->
      <div class="bg-surface-container-low/90 backdrop-blur-md rounded-t-[48rpx] border-t border-outline-variant/60 px-padding-inner pb-[calc(24rpx+env(safe-area-inset-bottom))] pt-4">
        <div class="flex items-center space-x-3">
          <!-- 媒体加号扩展纽扣 -->
          <button class="w-10 h-10 flex items-center justify-center text-outline-variant bg-white rounded-full border-2 border-outline-variant transition-transform active:scale-95 shrink-0">
            <text class="material-symbols-outlined text-[36rpx]">add</text>
          </button>
          
          <!-- 圆枕式文本输入域 -->
          <div class="flex-1 relative flex items-center">
            <input 
              class="w-full h-10 bg-white border-none rounded-full px-5 pr-10 text-[28rpx] font-medium shadow-inner placeholder:text-on-surface-variant/30" 
              placeholder="贴纸传情，说点什么..." 
              type="text"
              v-model="inputText"
              confirm-type="send"
              @confirm="sendMessage"
              @focus="closeEmojiPanel"
              :adjust-position="true"
            />
            <button @click="toggleEmojiPanel" class="emoji-trigger absolute border-none right-3 w-6 h-6 flex items-center justify-center text-outline-variant/70 hover:text-primary transition-colors bg-transparent p-0" :class="showEmojiPanel ? 'text-primary' : ''">
              <text class="material-symbols-outlined text-[36rpx]">sentiment_satisfied</text>
            </button>
          </div>
          
          <!-- 飞翼式发送药丸纽扣[cite: 17] -->
          <button class="w-10 h-10 flex items-center justify-center bg-primary-container text-on-primary-container rounded-full shadow-lg shadow-primary/20 scale-105 active:scale-95 transition-all shrink-0 bg-transparent"
                  @click="sendMessage">
            <text class="material-symbols-outlined text-[36rpx]" style="font-variation-settings: 'FILL' 1;">send</text>
          </button>
        </div>

        <!-- Emoji 选择面板 -->
        <view v-if="showEmojiPanel" class="mt-3 transition-all">
          <view class="flex items-center space-x-5 border-b border-outline-variant/20 pb-2 mb-2">
            <text
              v-for="tab in emojiTabs"
              :key="tab.key"
              @click="activeEmojiTab = tab.key"
              :class="[
                'text-[26rpx] font-bold pb-1 border-b-2 transition-colors',
                activeEmojiTab === tab.key ? 'text-primary border-primary' : 'text-outline-variant border-transparent'
              ]"
            >{{ tab.label }}</text>
          </view>
          <scroll-view scroll-y class="h-[280rpx]">
            <view v-if="emojiLoading" class="text-center py-8 text-outline-variant text-[24rpx]">
              <text class="material-symbols-outlined animate-spin text-[32rpx] mr-1">sync</text>
              正在加载表情...
            </view>
            <view v-else-if="currentEmojis.length === 0" class="text-center py-8 text-outline-variant text-[24rpx]">
              暂无表情
            </view>
            <view v-else class="grid grid-cols-8 gap-y-2 gap-x-1 p-1">
              <view
                v-for="emoji in currentEmojis"
                :key="emoji.code"
                @click="insertEmoji(emoji)"
                class="flex items-center justify-center h-[72rpx] active:scale-90 transition-transform"
              >
                <text v-if="activeEmojiTab === 'unicode'" class="text-[44rpx]">{{ emoji.char }}</text>
                <image v-else :src="emoji.url" class="w-12 h-12" mode="aspectFit" />
              </view>
            </view>
          </scroll-view>
        </view>
      </div>
    </footer>

    <!-- 背景悬浮漫反射星星挂件 -->
    <view class="fixed top-32 right-4 opacity-[0.06] pointer-events-none select-none z-[-1]">
      <text class="material-symbols-outlined text-[80rpx]" style="font-variation-settings: 'FILL' 1;">auto_awesome</text>
    </view>
    <view class="fixed bottom-48 left-4 opacity-[0.06] pointer-events-none select-none z-[-1]">
      <text class="material-symbols-outlined text-[64rpx]" style="font-variation-settings: 'FILL' 1;">favorite</text>
    </view>

  </view>
</template>

<script setup>
import { ref, nextTick, computed } from 'vue'
import { onHide, onLoad, onShow, onUnload } from '@dcloudio/uni-app'
import { get, post } from '@/utils/request.js'
import { chatApi, emojiApi } from '@/api/index.js'
import wsManager from '@/utils/websocket.js'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight || 20)
const partnerName = ref('加载中...')
const partnerAvatar = ref('')
const defaultAvatar = '/static/images/default-avatar.png'
const inputText = ref('')
const scrollToMessageId = ref('')
const sessionId = ref(null)
const partnerId = ref(null)

const quickReplies = ['好的 ᄉᄉ', '谢谢学长！✨', '回头见 🌸', '等我一下鸭 🎒']

// Emoji 面板状态
const showEmojiPanel = ref(false)
const activeEmojiTab = ref('unicode')
const emojiLoading = ref(false)
const emojiList = ref({ unicode: [], custom: [] })
const emojiTabs = [
  { key: 'unicode', label: '默认' },
  { key: 'custom', label: '自定义' }
]
const currentEmojis = computed(() => emojiList.value[activeEmojiTab.value] || [])

const messageList = ref([])
const currentPage = ref(1)
const pageSize = ref(20)
const hasMore = ref(true)
const loading = ref(false)

// 挂载周期解析参数接驳[cite: 17]
onLoad((options) => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 20

  if (options.sessionId) sessionId.value = parseInt(options.sessionId)
  if (options.name) partnerName.value = decodeURIComponent(options.name)
  if (options.avatar) partnerAvatar.value = decodeURIComponent(options.avatar)
  if (options.partnerId) partnerId.value = parseInt(options.partnerId)

  // WebSocket 单例收发通道接通注册[cite: 17]
  const currentUserId = userStore.userId
  if (currentUserId) {
    if (!wsManager.isConnected()) {
      wsManager.connect(currentUserId)
    }
    wsManager.on('message', handleWebSocketMessage)
  }

  if (sessionId.value) {
    loadMessages()
  } else {
    uni.showToast({ title: '会话信息丢失', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 1500)
  }
})

onShow(() => {
  if (sessionId.value) markAsRead()
})

onHide(() => {
  wsManager.off('message', handleWebSocketMessage)
})

onUnload(() => {
  wsManager.off('message', handleWebSocketMessage)
  messageList.value = []
  currentPage.value = 1
  hasMore.value = true
})

const handleWebSocketMessage = (data) => {
  if (data.sessionId === sessionId.value) {
    switch (data.type) {
      case 'new_message':
        handleNewMessage(data.message)
        break
      case 'message_recalled':
        handleRecallMessage(data.messageId)
        break
    }
  }
}

const handleNewMessage = (msg) => {
  const currentUserId = userStore.userId
  const isMe = String(msg.senderId) === String(currentUserId)
  
  const newMsg = {
    id: msg.id,
    role: isMe ? 'me' : 'partner',
    content: msg.content,
    messageType: msg.messageType,
    isRecalled: msg.isRecalled || false,
    createTime: msg.createTime,
    senderName: msg.senderName,
    senderAvatar: msg.senderAvatar
  }
  
  if (!messageList.value.some(m => m.id === msg.id)) {
    messageList.value.push(newMsg)
    scrollToBottom()
    markAsRead()
  }
}

const handleRecallMessage = (messageId) => {
  const msg = messageList.value.find(m => m.id === messageId)
  if (msg) msg.isRecalled = true
}

// 增量翻阅历史消息名册[cite: 17]
const loadMessages = async () => {
  if (loading.value || !hasMore.value || !sessionId.value) return
  
  loading.value = true
  try {
    const apiConfig = chatApi.getMessageList(sessionId.value, currentPage.value, pageSize.value)
    const response = await get(apiConfig.url, apiConfig.params)
    
    if (response.code === 200 && response.data) {
      const currentUserId = userStore.userId
      const records = response.data.records || []
      
      if (records.length === 0) {
        hasMore.value = false
        return
      }
      
      const newMessages = records.map(msg => {
        const isMe = String(msg.senderId) === String(currentUserId)
        return {
          id: msg.id,
          role: isMe ? 'me' : 'partner',
          content: msg.content,
          messageType: msg.messageType,
          isRecalled: msg.isRecalled || false,
          createTime: msg.createTime,
          senderName: msg.senderName || '',
          senderAvatar: msg.senderAvatar || ''
        }
      })
      
      const sortedMessages = newMessages.reverse()
      
      if (currentPage.value === 1) {
        messageList.value = sortedMessages
      } else {
        messageList.value = [...sortedMessages, ...messageList.value]
      }
      
      hasMore.value = messageList.value.length < response.data.total
      
      if (currentPage.value === 1) {
        setTimeout(() => scrollToBottom(), 100)
      }
    }
  } catch (error) {
    console.error('❌ 加载聊天历史记录异常:', error)
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  if (!hasMore.value || loading.value) return
  currentPage.value++
  loadMessages()
}

// 递交新消息文案[cite: 17]
const sendMessage = async () => {
  if (!inputText.value.trim() || !partnerId.value) return
  
  const content = inputText.value.trim()
  inputText.value = ''
  
  try {
    const response = await post(chatApi.sendMessage().url, {
      receiverId: partnerId.value,
      content: content,
      messageType: 1
    })
    
    if (response.code === 200 && response.data) {
      messageList.value.push({
        id: response.data.id,
        role: 'me',
        content: response.data.content,
        messageType: response.data.messageType,
        isRecalled: false,
        createTime: response.data.createTime,
        senderName: response.data.senderName,
        senderAvatar: response.data.senderAvatar
      })
      scrollToBottom()
    } else {
      inputText.value = content
    }
  } catch (error) {
    inputText.value = content
  }
}

// 轻触快捷便签一键发送并聚焦[cite: 17]
const handleQuickReply = (text) => {
  inputText.value = text
  sendMessage()
}

const markAsRead = async () => {
  if (!sessionId.value) return
  try { await post(chatApi.markChatRead(sessionId.value).url) } catch (e) {}
}

// 乐观双向斩断撤回消息[cite: 17]
const recallMessage = async (messageId) => {
  try {
    await post(chatApi.recallMessage(messageId).url)
    const msg = messageList.value.find(m => m.id === messageId)
    if (msg) msg.isRecalled = true
    uni.showToast({ title: '已成功撤回', icon: 'success' })
  } catch (error) {
    uni.showToast({ title: error.message || '撤回失败了', icon: 'none' })
  }
}

// 2分钟上下文长按菜单接驳[cite: 17]
const showMessageMenu = (msg) => {
  if (msg.role !== 'me' || msg.isRecalled) return
  const diffMinutes = (new Date() - new Date(msg.createTime)) / 1000 / 60
  if (diffMinutes > 2) {
    uni.showToast({ title: '超过2分钟无法撤回了哦', icon: 'none' })
    return
  }
  
  uni.showActionSheet({
    itemList: ['撤回这条消息'],
    success: (res) => {
      if (res.tapIndex === 0) recallMessage(msg.id)
    }
  })
}

const scrollToBottom = () => {
  nextTick(() => {
    scrollToMessageId.value = 'msg-' + (messageList.value.length - 1)
  })
}

const shouldShowTime = (msg, index) => {
  if (index === 0) return true
  const prevMsg = messageList.value[index - 1]
  if (!prevMsg?.createTime || !msg.createTime) return false
  return (new Date(msg.createTime).getTime() - new Date(prevMsg.createTime).getTime()) / 1000 / 60 >= 5
}

const formatMessageTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const timePart = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  
  if (msgDate.getTime() === today.getTime()) return timePart
  if (msgDate.getTime() === today.getTime() - 86400000) return `昨天 ${timePart}`
  return `${date.getMonth() + 1}月${date.getDate()}日 ${timePart}`
}

const goBack = () => uni.navigateBack()

// Emoji 面板展开/收起
const toggleEmojiPanel = () => {
  showEmojiPanel.value = !showEmojiPanel.value
  if (showEmojiPanel.value && emojiList.value.unicode.length === 0) {
    loadEmojis()
  }
}

const closeEmojiPanel = () => {
  showEmojiPanel.value = false
}

// 加载 Emoji 列表
const loadEmojis = async () => {
  if (emojiLoading.value) return
  emojiLoading.value = true
  try {
    const apiConfig = emojiApi.getEmojiList()
    const response = await get(apiConfig.url)
    if (response.code === 200 && response.data) {
      emojiList.value.unicode = response.data.unicode || []
      emojiList.value.custom = response.data.custom || []
    }
  } catch (error) {
    console.error('加载表情失败:', error)
  } finally {
    emojiLoading.value = false
  }
}

// 点击 Emoji 插入输入框
const insertEmoji = (emoji) => {
  if (activeEmojiTab.value === 'unicode') {
    inputText.value += emoji.char || ''
  } else {
    inputText.value += `[${emoji.code}]`
  }
}
</script>

<style scoped>
/* 强效遮罩全平台硬边系统滚动条纹 */
::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  color: transparent;
}

/* 移除表情按钮默认边框（小程序 button::after） */
button.emoji-trigger::after {
  border: none;
}

/* 隐藏横向滚动轴 */
.hide-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

/* 软糯果冻响应触控回弹原子机制 */
.bouncy-tap:active {
  transform: scale(0.96);
  transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 标志性棉花糖贴纸白描框轮廓 */

/* 专属天空治愈青色用户气泡背景[cite: 17] */
.gradient-user {
  background: #5BA4F0;
}

/* 多行溢出字长切断 */
.word-break {
  word-break: break-all;
}

/* 动画浅入淡出指引 */
.animate-fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12rpx); }
  to { opacity: 1; transform: translateY(0); }
}
</style>