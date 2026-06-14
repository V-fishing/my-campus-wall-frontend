<template>
  <view class="bg-[#F4F5F7] text-on-background min-h-screen flex flex-col relative w-full overflow-x-hidden pb-[160rpx]">
    
    <view class="bg-[#F4F5F7]/90 backdrop-blur-md sticky top-0 z-50" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="h-[88rpx] flex items-center justify-center">
        <text class="text-headline-md text-on-surface text-center font-bold">消息</text>
      </view>
    </view>

    <scroll-view scroll-y class="flex-1 overflow-y-auto hide-scrollbar px-margin-page pt-4">
      
      <view class="grid grid-cols-3 gap-gutter-card mb-8">
        <view class="bg-white rounded-[32rpx] p-4 flex flex-col items-center justify-center gap-2 kawaii-shadow active:scale-95 transition-transform relative" @click="goToInteraction('likes')">
          <view v-if="unreadStats.likes > 0" class="absolute -top-2 -right-2 bg-error text-on-error text-[20rpx] font-bold min-w-[40rpx] h-[40rpx] px-1 rounded-full flex items-center justify-center sticker-shadow z-10">{{ unreadStats.likes }}</view>
          <view class="w-[72rpx] h-[72rpx] rounded-full bg-pink-50 flex items-center justify-center">
            <text class="material-symbols-outlined text-primary text-[36rpx]" style="font-variation-settings: 'FILL' 1;">thumb_up</text>
          </view>
          <text class="text-[24rpx] text-on-surface font-medium">赞与收藏</text>
        </view>

        <view class="bg-white rounded-[32rpx] p-4 flex flex-col items-center justify-center gap-2 kawaii-shadow active:scale-95 transition-transform relative" @click="goToInteraction('comments')">
          <view v-if="unreadStats.comments > 0" class="absolute -top-2 -right-2 bg-error text-on-error text-[20rpx] font-bold min-w-[40rpx] h-[40rpx] px-1 rounded-full flex items-center justify-center sticker-shadow z-10">{{ unreadStats.comments }}</view>
          <view class="w-[72rpx] h-[72rpx] rounded-full bg-blue-50 flex items-center justify-center">
            <text class="material-symbols-outlined text-tertiary text-[36rpx]" style="font-variation-settings: 'FILL' 1;">chat_bubble</text>
          </view>
          <text class="text-[24rpx] text-on-surface font-medium">回复与@</text>
        </view>

        <view class="bg-white rounded-[32rpx] p-4 flex flex-col items-center justify-center gap-2 kawaii-shadow active:scale-95 transition-transform relative" @click="goToInteraction('system')">
          <view v-if="unreadStats.follows > 0" class="absolute -top-2 -right-2 bg-error text-on-error text-[20rpx] font-bold min-w-[40rpx] h-[40rpx] px-1 rounded-full flex items-center justify-center sticker-shadow z-10">{{ unreadStats.follows }}</view>
          <view class="w-[72rpx] h-[72rpx] rounded-full bg-yellow-50 flex items-center justify-center">
            <text class="material-symbols-outlined text-yellow-500 text-[36rpx]" style="font-variation-settings: 'FILL' 1;">star</text>
          </view>
          <text class="text-[24rpx] text-on-surface font-medium">新增粉丝</text>
        </view>
      </view>

      <view>
        <view class="flex items-center justify-between mb-4 px-2">
          <view class="flex items-center">
            <text class="text-headline-md text-on-surface font-bold">私信</text>
            <text v-if="chatList.length > 0" class="text-[24rpx] font-bold text-primary bg-primary-fixed px-3 py-0.5 rounded-full ml-2">{{ chatList.length }}</text>
          </view>
        </view>

        <view class="flex flex-col gap-3" v-if="chatList.length > 0">
          <view class="bg-white rounded-[32rpx] p-padding-inner flex items-center gap-3 kawaii-shadow active:bg-surface-container-low transition-colors" 
                v-for="chat in chatList" :key="chat.id" @click="openChat(chat)">
            
            <view class="relative shrink-0">
              <view class="w-[104rpx] h-[104rpx] rounded-full overflow-hidden bg-surface-dim">
                <image :src="chat.chatPartnerAvatar || '/static/images/default-avatar.png'" mode="aspectFill" class="w-full h-full object-cover"></image>
              </view>
            </view>
            
            <view class="flex-1 min-w-0 flex flex-col justify-center">
              <view class="flex justify-between items-baseline mb-1">
                <text class="text-body-lg font-bold text-on-surface truncate">{{ chat.chatPartnerName }}</text>
                <text class="text-[22rpx] text-outline shrink-0 ml-2">{{ formatTime(chat.lastMessageTime) }}</text>
              </view>
              <text class="text-[28rpx] text-on-surface-variant truncate block">{{ chat.lastMessage || '暂无消息' }}</text>
            </view>

            <view class="shrink-0 flex items-center gap-2">
              <view v-if="chat.unreadCount > 0" class="bg-primary text-on-primary text-label-sm font-bold min-w-[40rpx] h-[40rpx] px-1 rounded-full flex items-center justify-center sticker-shadow">{{ chat.unreadCount }}</view>
              
              <view class="w-[56rpx] h-[56rpx] flex items-center justify-center rounded-full text-outline-variant active:bg-error/10 active:text-error transition-colors" @click.stop="deleteChatSession(chat)">
                <text class="material-symbols-outlined text-[32rpx]">delete</text>
              </view>
            </view>

          </view>
        </view>

        <view class="flex flex-col items-center justify-center py-24" v-else>
          <text class="text-[120rpx] mb-4 opacity-50">💬</text>
          <text class="text-[32rpx] text-on-surface-variant font-bold mb-2">暂无聊天记录</text>
          <text class="text-[26rpx] text-outline-variant">去主页找人聊聊吧~</text>
        </view>

        <view class="flex justify-center items-center py-6 gap-2 text-primary-fixed-dim" v-if="chatList.length > 0">
          <text class="material-symbols-outlined text-[28rpx]">favorite</text>
          <text class="text-[24rpx] text-outline-variant">没有更多消息啦</text>
          <text class="material-symbols-outlined text-[28rpx]">favorite</text>
        </view>
      </view>
    </scroll-view>
<CustomTabBar :current="3" />
  </view>
  <view class="h-[160rpx]"></view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { get, del, post } from '@/utils/request.js'
import { messageApi, chatApi, notificationApi } from '@/api/index.js'
import { formatMessageTime } from '@/composables/useTimeAgo'

// 状态栏适配
const statusBarHeight = ref(20)
onLoad(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 20
})

// 页面显示时刷新数据
onShow(() => {
  fetchUnreadStats()
  fetchChatList()
})

// 未读消息统计
const unreadStats = ref({
  likes: 0,
  comments: 0,
  follows: 0,
  system: false
})

// 聊天会话列表
const chatList = ref([])

// 获取未读消息统计
const fetchUnreadStats = async () => {
  try {
    const response = await get(messageApi.getUnreadStats().url)
    if (response.code === 200 && response.data) {
      unreadStats.value = {
        likes: response.data.likesAndCollects || 0,
        comments: response.data.comments || 0,
        follows: response.data.follows || 0,
        system: response.data.system > 0
      }
    }
  } catch (error) {
    console.error('获取未读消息统计失败:', error)
  }
}

// 获取聊天会话列表
const fetchChatList = async () => {
  try {
    const response = await get(chatApi.getSessionList().url)
    if (response.code === 200 && response.data) {
      chatList.value = response.data
    }
  } catch (error) {
    console.error('获取聊天会话列表失败:', error)
  }
}

const formatTime = formatMessageTime

// 交互方法
const goToInteraction = async (type) => {
  console.log('跳转到互动详情页：', type)
  
  let url = ''
  if (type === 'likes') {
    url = '/pages/message/like-list'
  } else if (type === 'comments') {
    url = '/pages/message/notification-list'
  } else if (type === 'system') {
    url = '/pages/message/fans-list'
  } else {
    return
  }
  
  // 标记对应类型的消息为已读
  if (type === 'likes' || type === 'comments' || type === 'system') {
    try {
      const apiConfig1 = messageApi.markAllNotificationsAsRead()
      await post(apiConfig1.url)
      
      const apiConfig2 = notificationApi.markAllRead()
      await post(apiConfig2.url)

      const apiConfig3 = notificationApi.markAllRead()
      await post(apiConfig3.url)
      
      console.log('标记消息和通知已读成功')
    } catch (err) {
      console.error('标记已读失败:', err)
    }
  }
  
  uni.navigateTo({ url: url })
}

const openChat = (chat) => {
  uni.navigateTo({
    url: `/pages/message/chat-detail?sessionId=${chat.id}&name=${encodeURIComponent(chat.chatPartnerName)}&avatar=${encodeURIComponent(chat.chatPartnerAvatar || '')}&partnerId=${chat.chatPartnerId}`
  })
}

// 删除聊天会话
const deleteChatSession = (chat) => {
  uni.showModal({
    title: '提示',
    content: `确定要删除与「${chat.chatPartnerName}」的聊天会话吗？`,
    confirmColor: '#FF3B30',
    success: async (res) => {
      if (res.confirm) {
        try {
          const response = await del(chatApi.deleteSession(chat.id).url)
          if (response.code === 200) {
            chatList.value = chatList.value.filter(item => item.id !== chat.id)
            uni.showToast({ title: '已删除', icon: 'success' })
          } else {
            uni.showToast({ title: response.message || '删除失败', icon: 'none' })
          }
        } catch (error) {
          uni.showToast({ title: '删除失败，请重试', icon: 'none' })
        }
      }
    }
  })
}

// 发布按钮点击事件 (备用)
const handlePublish = () => {
  uni.navigateTo({ url: '/pages/publish/publish' })
}
</script>

<style scoped>
/* 隐藏滚动条 */
.hide-scrollbar::-webkit-scrollbar { 
  display: none; 
  width: 0;
  height: 0;
  color: transparent;
}
.hide-scrollbar { 
  -ms-overflow-style: none; 
  scrollbar-width: none; 
}

/* 核心阴影与特效 */
.bouncy-shadow { 
  box-shadow: 0 24rpx 80rpx rgba(255, 143, 163, 0.12); 
}
.kawaii-shadow { 
  box-shadow: 0 12rpx 40rpx rgba(255, 143, 163, 0.12); 
}
.sticker-shadow { 
  box-shadow: 0 0 0 4rpx #ffffff, 0 8rpx 24rpx rgba(255, 143, 163, 0.2); 
}
</style>