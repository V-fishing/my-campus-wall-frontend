<template>
  <view class="bg-[#F4F5F7] min-h-screen flex flex-col relative selection:bg-primary-container">
    
    <header class="fixed top-0 w-full h-[88px] z-50 bg-[#F4F5F7]/85 backdrop-blur-md flex flex-col justify-end pb-2 shadow-[0_12px_40px_rgba(255,143,163,0.12)]">
      <view class="flex items-center px-margin-page relative h-11 pr-[90px] w-full">
        <view class="bouncy-tap p-2 -ml-2 text-primary flex items-center justify-center cursor-pointer animate-fade-in" @click="goBack">
          <text class="material-symbols-outlined text-[48rpx]">arrow_back</text>
        </view>
        <h1 class="absolute left-1/2 -translate-x-1/2 font-headline-md text-[34rpx] text-primary font-bold">收到的赞</h1>
      </view>
    </header>

    <scroll-view 
      class="w-full flex-1" 
      scroll-y="true"
      :style="{ height: 'calc(100vh - 88px)', marginTop: '88px' }"
      @scrolltolower="loadMore"
      refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view class="list-container px-margin-page pt-4 pb-12">
        
        <view v-if="loading && notificationList.length === 0" class="space-y-4">
          <view class="skeleton-item bg-white rounded-[40rpx] p-padding-inner flex gap-3 animate-pulse" v-for="i in 3" :key="i">
            <view class="w-12 h-12 rounded-full bg-surface-container-high"></view>
            <view class="flex-1 space-y-2 pt-1">
              <view class="h-4 bg-surface-container-high rounded w-1/3"></view>
              <view class="h-10 bg-surface-container-high rounded-[20rpx] w-full"></view>
            </view>
          </view>
        </view>

        <view class="empty-state flex flex-col items-center justify-center py-24 text-center animate-fade-in" v-if="notificationList.length === 0 && !loading">
          <view class="empty-animation w-32 h-32 mb-6 bg-primary-container/10 rounded-full flex items-center justify-center relative">
            <text class="empty-icon text-[96rpx] opacity-80">👍</text>
          </view>
          <text class="empty-text font-bold text-[32rpx] text-on-surface mb-1">暂无收到喜欢</text>
          <text class="empty-hint text-[24rpx] text-outline-variant font-medium">有人点赞你的帖子或评论时会显示在这里哦 (◕‿◕✿)</text>
        </view>

        <view v-else class="space-y-4">
          <view 
            class="bouncy-card bg-white rounded-[40rpx] p-padding-inner shadow-[0_12px_40px_rgba(255,143,163,0.06)] relative overflow-hidden transition-all duration-300"
            v-for="(item, index) in notificationList" 
            :key="item.id"
            @click="handleNotificationClick(item)"
            :class="[!item.isRead ? 'sticker-border bg-[#fff9f9]' : 'border border-surface-variant/40']"
          >
            <view class="flex items-start gap-3">
              <view class="relative shrink-0">
                <image class="w-12 h-12 rounded-full border-2 border-white shadow-sm bg-surface-container-low object-cover" :src="item.senderAvatar || defaultAvatar" mode="aspectFill"></image>
                <view class="absolute -top-0.5 -left-0.5 w-[14rpx] h-[14rpx] bg-error rounded-full border-2 border-white pulse-dot" v-if="!item.isRead"></view>
              </view>
              
              <view class="flex-grow min-w-0">
                <view class="flex justify-between items-start mb-1 w-full">
                  <view class="truncate pr-2">
                    <text class="font-bold text-[30rpx] text-on-surface">{{ item.senderName || '神秘学友' }}</text>
                    <text class="text-[28rpx] text-on-surface-variant ml-1.5">{{ item.content ? '赞了你的评论' : '赞了你的帖子' }}</text>
                  </view>
                  <text class="text-[22rpx] text-outline-variant font-medium shrink-0 mt-0.5">{{ formatTime(item.createTime) }}</text>
                </view>

                <view class="mt-2.5 p-2 bg-primary-fixed/20 rounded-[24rpx] flex items-center gap-3 active:bg-primary-fixed/40 transition-colors"
                      :class="[item.content ? 'bg-secondary-fixed/20' : 'bg-primary-fixed/20']">
                  <image class="w-10 h-10 rounded-xl object-cover shrink-0 bg-surface-container border-2 border-white shadow-sm" 
                         v-if="getFirstImage(item.postImages)" :src="getFirstImage(item.postImages)" mode="aspectFill"></image>
                  <view class="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center text-secondary shrink-0" v-else>
                    <text class="material-symbols-outlined text-[36rpx]">text_snippet</text>
                  </view>
                  
                  <text class="text-[24rpx] font-bold truncate flex-1"
                        :class="[item.content ? 'text-on-secondary-fixed-variant' : 'text-on-primary-fixed-variant']">
                    {{ item.content ? '你的评论：' + item.content : item.postTitle || '点击调阅原纸片帖' }}
                  </text>
                </view>
                
                <view class="flex justify-end items-center mt-3 pt-1 border-t border-dashed border-outline-variant/10">
                  <view class="more-btn p-1 -mr-1 cursor-pointer bouncy-tap" @click.stop="showMoreMenu(item)">
                    <text class="more-icon font-black text-outline-variant text-[32rpx]">⋯</text>
                  </view>
                </view>

              </view>
            </view>
          </view>
        </view>

        <view class="loading-more flex justify-center items-center py-6 text-outline-variant text-[24rpx]" v-if="loading && notificationList.length > 0">
          <view class="loading-spinner mr-2"></view><text>正在收回喜欢时光盒...</text>
        </view>
        <view class="no-more text-center py-8 text-outline-variant font-label-md" v-else-if="!hasMore && notificationList.length > 0">
          <view class="flex gap-2 justify-center items-center opacity-40 mb-2">
            <span class="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-secondary-container"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-tertiary-container"></span>
          </view>
          <text class="text-[22rpx] font-medium">已经到底啦，继续收获点赞吧~ 💖</text>
        </view>

      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { get, post, del } from '@/utils/request.js'
import { notificationApi } from '@/api/index.js'
import { formatMessageTime } from '@/composables/useTimeAgo'

const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight || 20)
const defaultAvatar = '/static/images/anonymous-avatar.png'

const notificationList = ref([])
const currentPage = ref(1)
const pageSize = ref(20)
const hasMore = ref(true)
const loading = ref(false)
const refreshing = ref(false)

onLoad(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 20
  loadNotifications()
})

onShow(() => {
  if (!loading.value) {
    loadNotifications(true)
  }
})

// 下拉重置刷新流
const onRefresh = async () => {
  refreshing.value = true
  try {
    await loadNotifications(true)
  } finally {
    refreshing.value = false
  }
}

// 分页流式异步加载点赞信息引擎
const loadNotifications = async (refresh = false) => {
  if (loading.value || (!refresh && !hasMore.value)) return
  
  if (refresh) {
    currentPage.value = 1
    hasMore.value = true
  }
  
  loading.value = true
  try {
    const params = {
      type: 'like',
      page: currentPage.value,
      size: pageSize.value
    }
    
    const response = await get(notificationApi.getLikeNotifications(params).url, params)

    if (response.code === 200 && response.data) {
      const records = response.data.records || []
      if (refresh) {
        notificationList.value = records
      } else {
        notificationList.value = [...notificationList.value, ...records]
      }
      hasMore.value = notificationList.value.length < response.data.total
      currentPage.value++
    } else {
      throw new Error(response.message || '业务逻辑出错')
    }
  } catch (error) {
    console.error('❌ 加载收到喜欢列表异常:', error)
    uni.showToast({ title: '加载喜欢列表失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  if (!hasMore.value || loading.value) return
  loadNotifications()
}

// 跨组件卡片导流详情降落并静默核销已读
const handleNotificationClick = (item) => {
  if (!item.isRead) {
    markAsReadSilent(item.id)
  }

  if (!item.postId || item.postId <= 0) {
    uni.showToast({ title: '该张时光卡片被风吹走了', icon: 'none' })
    return
  }

  uni.navigateTo({
    url: item.commentId && item.commentId > 0 
      ? `/pages/post/detail?id=${item.postId}&commentId=${item.commentId}`
      : `/pages/post/detail?id=${item.postId}`
  })
}

// 专属多态忽略与核销操作单
const showMoreMenu = (item) => {
  const itemList = item.isRead ? ['从时光盒悄悄移除'] : ['标记该张贴纸为已读', '从时光盒悄悄移除']
  uni.showActionSheet({
    itemList: itemList,
    success: (res) => {
      if (!item.isRead && res.tapIndex === 0) {
        markAsRead(item.id)
      } else if ((item.isRead && res.tapIndex === 0) || (!item.isRead && res.tapIndex === 1)) {
        ignoreNotification(item)
      }
    }
  })
}

const markAsReadSilent = async (notificationId) => {
  try {
    await post(notificationApi.markNotificationRead(notificationId).url)
    const target = notificationList.value.find(n => n.id === notificationId)
    if (target) target.isRead = true
  } catch (error) {
    console.error('静默已阅失效:', error)
  }
}

const markAsRead = async (notificationId) => {
  try {
    await post(notificationApi.markNotificationRead(notificationId).url)
    const target = notificationList.value.find(n => n.id === notificationId)
    if (target) target.isRead = true
    uni.vibrateShort()
    uni.showToast({ title: '已阅 ✨', icon: 'success' })
  } catch (error) {
    uni.showToast({ title: '操作失败', icon: 'none' })
  }
}

// 调配异步 DELETE 请求闭环粉碎忽略单项
const ignoreNotification = async (item) => {
  uni.showModal({
    title: '确认从时光盒移除',
    content: '确定要把这条喜欢动态悄悄过滤移出吗？(◕‿◕✿)',
    confirmColor: '#9b4053',
    success: async (res) => {
      if (res.confirm) {
        try {
          const response = await del(notificationApi.deleteNotification(item.id).url)
          if (response.code === 200) {
            notificationList.value = notificationList.value.filter(n => n.id !== item.id)
            uni.showToast({ title: '已平滑移出', icon: 'success' })
          } else {
            throw new Error(response.message || '移除失败')
          }
        } catch (error) {
          uni.showToast({ title: '操作失败，请重试', icon: 'none' })
        }
      }
    }
  })
}

// 抽取封面首图
const getFirstImage = (imagesStr) => {
  if (!imagesStr) return null
  try {
    const list = JSON.parse(imagesStr)
    return (Array.isArray(list) && list.length > 0) ? list[0] : null
  } catch (e) {
    return imagesStr || null
  }
}

const formatTime = formatMessageTime

const goBack = () => uni.navigateBack()
</script>

<style scoped>
/* 屏蔽全平台系统长页面硬分割线滚动条纹痕迹 */
::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  color: transparent;
}

/* 软糯果冻响应缩放阻尼点击动效机制 */
.bouncy-card:active {
  transform: scale(0.98);
  transition: transform 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.bouncy-tap:active {
  transform: scale(0.9);
  transition: transform 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

/* 棉花糖手账虚线圈 */
.sticker-border {
  border: 4rpx dashed rgba(255, 143, 163, 0.3);
}

/* 核心未读指示灯环高频率呼吸动效 */
.pulse-dot {
  animation: pulseRing 1.5s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
}
@keyframes pulseRing {
  0% { transform: scale(0.7); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.7; }
  100% { transform: scale(0.7); opacity: 1; }
}

/* 旋转缓冲骨架指示 */
.loading-spinner {
  width: 32rpx;
  height: 32rpx;
  border: 4rpx solid #f3f3f3;
  border-top: 4rpx solid #9b4053;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 空状态漂浮阻尼动效 */
.empty-animation {
  animation: float 3s ease-in-out infinite;
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-16rpx); }
}

/* 内容渐隐淡出 */
.animate-fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12rpx); }
  to { opacity: 1; transform: translateY(0); }
}
</style>