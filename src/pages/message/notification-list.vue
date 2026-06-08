<template>
  <view class="bg-[#fef8f8] min-h-screen flex flex-col relative selection:bg-primary-container selection:text-on-primary-container">
    
    <header class="fixed top-0 w-full h-[88px] z-50 bg-[#fef8f8]/85 backdrop-blur-md flex flex-col justify-end pb-2 border-b border-dashed border-outline-variant/20 shadow-sm">
      <view class="flex items-center px-margin-page pr-capsule-safe-zone h-[44px] relative w-full">
        <view class="bouncy-tap text-primary flex items-center justify-center w-10 h-10 -ml-2 cursor-pointer" @click="goBack">
          <text class="material-symbols-outlined text-[48rpx]">arrow_back_ios_new</text>
        </view>
        <h1 class="absolute left-1/2 -translate-x-1/2 font-headline-md text-[34rpx] text-primary font-bold">回复与提及</h1>
        <view class="w-10 h-10"></view>
      </view>
    </header>

    <scroll-view class="w-full flex-1" scroll-y :style="{ height: 'calc(100vh - 88px)', marginTop: '88px' }" @scrolltolower="loadMore">
      
      <view class="sticky top-0 bg-[#fef8f8]/95 backdrop-blur-md z-40 flex px-margin-page py-3 gap-8 border-b border-outline-variant/10 shadow-[0_2px_10rpx_rgba(0,0,0,0.01)] shrink-0">
        <view class="relative pb-1 cursor-pointer" @click="switchTab('all')">
          <text class="font-headline-md text-[30rpx] transition-all" :class="currentTab === 'all' ? 'text-primary font-bold' : 'text-on-surface-variant'">全部</text>
          <view class="absolute bottom-0 left-0 w-full active-tab-glow" v-if="currentTab === 'all'"></view>
        </view>
        <view class="relative pb-1 cursor-pointer" @click="switchTab('at')">
          <text class="font-headline-md text-[30rpx] transition-all" :class="currentTab === 'at' ? 'text-primary font-bold' : 'text-on-surface-variant'">@我</text>
          <view class="absolute bottom-0 left-0 w-full active-tab-glow" v-if="currentTab === 'at'"></view>
        </view>
      </view>

      <view class="px-margin-page mt-4 space-y-gutter-card pb-12">
        
        <view class="flex flex-col items-center justify-center py-24 text-center animate-fade-in" v-if="notificationList.length === 0 && !loading">
          <view class="w-32 h-32 mb-6 bg-surface-container rounded-full flex items-center justify-center relative shadow-inner">
            <text class="material-symbols-outlined text-[100rpx] text-outline-variant/60">history_toggle_off</text>
            <text class="absolute top-2 right-4 text-primary-container text-[32rpx] animate-bounce">✨</text>
          </view>
          <h2 class="font-headline-lg text-[32rpx] font-bold text-on-surface-variant mb-1">暂无回复与@</h2>
          <p class="text-label-md text-outline-variant text-[24rpx]">有人在墙上引起你的注意时会显示在这里哦 (◕‿◕✿)</p>
        </view>

        <view v-else class="space-y-4">
          <view v-for="item in notificationList" :key="item.id" @click="handleNotificationClick(item)"
                class="bg-surface-container-lowest rounded-[40rpx] p-padding-inner sugar-border shadow-[0_12px_40px_rgba(255,143,163,0.08)] relative overflow-hidden transition-all duration-300">
            
            <view class="flex gap-3">
              <view class="relative shrink-0">
                <image class="w-10 h-10 rounded-full border-2 border-white shadow-sm bg-surface-container-low" :src="item.senderAvatar || defaultAvatar" mode="aspectFill"></image>
                <view class="absolute -bottom-1 -right-1 rounded-full p-0.5 border-2 border-white flex items-center justify-center shadow-sm"
                      :class="item.replyToCommentId ? 'bg-tertiary-container' : 'bg-secondary-container'">
                  <text class="material-symbols-outlined text-[18rpx] text-white" style="font-variation-settings: 'FILL' 1;">
                    {{ item.replyToCommentId ? 'chat_bubble' : 'alternate_email' }}
                  </text>
                </view>
              </view>
              
              <view class="flex-grow min-w-0">
                <view class="flex justify-between items-center w-full">
                  <text class="font-bold text-[28rpx] text-on-surface truncate max-w-[300rpx]">{{ item.senderName || '神秘同学' }}</text>
                  <text class="text-[22rpx] text-outline-variant font-medium shrink-0">{{ formatTime(item.createTime) }}</text>
                </view>
                <text class="text-[24rpx] text-tertiary font-bold mt-0.5 block">{{ item.actionText || '回复了你' }} · <text class="text-outline font-medium">来自帖子《{{ item.postTitle || '贴纸详情' }}》</text></text>
              </view>
            </view>

            <view class="mt-3 bg-surface-container/60 rounded-[24rpx] p-2.5 border border-outline-variant/10 shadow-[inset_0_2px_4rpx_rgba(0,0,0,0.01)]" v-if="item.replyToCommentId">
              <text class="text-[24rpx] text-outline-variant font-medium line-clamp-2 leading-relaxed">
                你的评论：{{ getMyCommentText(item.content) }}
              </text>
            </view>

            <view class="mt-3 px-1">
              <text class="text-[28rpx] text-on-surface-variant font-bold leading-relaxed block">
                {{ getReplyCommentText(item.content) }}
              </text>
            </view>

            <view class="mt-4 flex justify-end items-center gap-6 pt-2 border-t border-dashed border-outline-variant/10">
              <view class="bouncy-tap flex items-center gap-1 cursor-pointer" @click.stop="handleReply(item)">
                <text class="material-symbols-outlined text-primary text-[36rpx]">reply</text>
                <text class="text-primary font-black text-[24rpx]">回复</text>
              </view>
              <view class="bouncy-tap flex items-center justify-center p-1 cursor-pointer" @click.stop="handleLike(item)">
                <text class="material-symbols-outlined text-outline text-[36rpx]">favorite</text>
              </view>
              <view class="bouncy-tap p-1 -mr-1 cursor-pointer" @click.stop="showMoreMenu(item)">
                <text class="material-symbols-outlined text-outline-variant text-[36rpx]">more_vert</text>
              </view>
            </view>
            
          </view>
        </view>

        <view class="py-6 text-center text-outline-variant font-label-md-mobile" v-if="loading">
          <text class="material-symbols-outlined animate-spin text-[32rpx] mr-2">sync</text>正在收纳时光信件...
        </view>
        <view class="text-center py-6 text-outline-variant font-label-md-mobile" v-else-if="!hasMore && notificationList.length > 0">
          <view class="flex gap-2 justify-center items-center opacity-40 mb-2">
            <span class="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-secondary-container"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-tertiary-container"></span>
          </view>
          <text class="text-[22rpx] font-medium">- 所有的校园脚印都到齐啦 👣 -</text>
        </view>

      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { get, post } from '@/utils/request.js'
import { notificationApi } from '@/api/index.js'
import { formatMessageTime } from '@/composables/useTimeAgo'

const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight || 20)
const formatTime = formatMessageTime
const defaultAvatar = '/static/images/default-avatar.png'

const currentTab = ref('all')
const notificationList = ref([])
const currentPage = ref(1)
const pageSize = ref(15)
const hasMore = ref(true)
const loading = ref(false)

onLoad((options) => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 20
  
  if (options.type === 'at') {
    currentTab.value = 'at'
  }
  loadNotifications(true)
})

onShow(() => {
  // 保持记录是最新的，切回时静默清算
  loadNotifications(true)
})

// 分页异步加载通知机制核心引擎
const loadNotifications = async (refresh = false) => {
  if (loading.value || (!refresh && !hasMore.value)) return
  
  if (refresh) {
    currentPage.value = 1
    hasMore.value = true
  }
  
  loading.value = true
  try {
    const params = {
      type: currentTab.value,
      page: currentPage.value,
      size: pageSize.value
    }
    
    const response = await get(notificationApi.getCommentNotifications(params).url, params)
    
    if (response.code === 200 && response.data) {
      const records = response.data.records || []
      if (refresh) {
        notificationList.value = records
      } else {
        notificationList.value = [...notificationList.value, ...records]
      }
      hasMore.value = notificationList.value.length < response.data.total
      currentPage.value++
    }
  } catch (error) {
    console.error('❌ 获取通知轨迹树失败:', error)
    uni.showToast({ title: '拉取通知失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const switchTab = (tab) => {
  if (currentTab.value === tab) return
  currentTab.value = tab
  loadNotifications(true)
}

const loadMore = () => {
  if (!hasMore.value || loading.value) return
  loadNotifications(false)
}

// 高保真解析：后端拼接的评论文本（前部为本人，后部为回复人）
const getMyCommentText = (content) => {
  if (!content) return ''
  const parts = content.split('\n')
  return parts[0] || ''
}

const getReplyCommentText = (content) => {
  if (!content) return ''
  const parts = content.split('\n')
  return parts[1] || content
}

// 跨页导流详情页精准降落
const handleNotificationClick = (item) => {
  if (!item.postId) return
  uni.navigateTo({
    url: `/pages/post/detail?id=${item.postId}&commentId=${item.commentId}`
  })
}

const handleReply = (item) => {
  uni.showToast({ title: '小窗回复功能升级中', icon: 'none' })
}

const handleLike = (item) => {
  uni.vibrateShort()
  uni.showToast({ title: '点赞成功 💖', icon: 'none' })
}

// 时光管理单条操作单面板
const showMoreMenu = (item) => {
  uni.showActionSheet({
    itemList: ['标记该张贴纸为已读', '从列表中悄悄移除'],
    success: (res) => {
      if (res.tapIndex === 0) {
        markAsRead(item.id)
      } else if (res.tapIndex === 1) {
        notificationList.value = notificationList.value.filter(n => n.id !== item.id)
        uni.showToast({ title: '移除成功', icon: 'success' })
      }
    }
  })
}

const markAsRead = async (notificationId) => {
  try {
    await post(notificationApi.markNotificationRead(notificationId).url)
    const target = notificationList.value.find(n => n.id === notificationId)
    if (target) target.isRead = true
    uni.showToast({ title: '已阅 ✨', icon: 'success' })
  } catch (error) {
    console.error('❌ 签收已读异常:', error)
  }
}

const goBack = () => uni.navigateBack()
</script>

<style scoped>
/* 拦截并掩埋底层系统自带的坚硬滚动条纹 */
::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  color: transparent;
}

/* 软糯果冻颗粒按压缩放阻尼反馈 */
.bouncy-tap:active {
  transform: scale(0.96);
  transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 萌系手账虚线外框圈 */
.sugar-border {
  border: 4rpx dashed rgba(255, 143, 163, 0.25);
}

/* 炫彩渐变 Tab 底部激活呼吸线 */
.active-tab-glow {
  background: linear-gradient(90deg, #c5a3ff 0%, #86b6db 100%);
  height: 6rpx;
  border-radius: 3rpx;
}

/* 卡片发光双叠白外描阴影 */
.sticker-shadow {
  box-shadow: 0 0 0 4rpx #ffffff, 0 8px 24px rgba(255, 143, 163, 0.15);
}

/* 文字线长限定截断 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

/* 内容淡入特效 */
.animate-fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(16rpx); }
  to { opacity: 1; transform: translateY(0); }
}
</style>