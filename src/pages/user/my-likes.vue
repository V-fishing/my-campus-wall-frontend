<template>
  <view class="page-container">
    <!-- 导航栏 -->
    <view class="custom-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-content">
        <view class="nav-left" @click="goBack">
          <text class="back-icon">←</text>
        </view>
        <view class="nav-title">获赞记录</view>
        <view class="nav-right"></view>
      </view>
    </view>

    <view class="content-wrapper" :style="{ paddingTop: (statusBarHeight + 44) + 'px' }">
      <!-- 加载中 -->
      <view class="loading-container" v-if="loading && notificationList.length === 0">
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 列表 -->
      <scroll-view
        scroll-y
        class="list-scroll"
        @scrolltolower="loadMore"
        v-else-if="notificationList.length > 0 || !loading"
        refresher-enabled="true"
        :refresher-triggered="refreshing"
        @refresherrefresh="onRefresh"
      >
        <view class="like-item" v-for="(item, index) in notificationList" :key="item.id || index" @click="handleNotificationClick(item)">
          <image class="avatar" :src="item.senderAvatar" mode="aspectFill"></image>

          <view class="info">
            <view class="name-row">
              <text class="name">{{ item.senderName || '未知用户' }}</text>
              <text class="time">{{ formatTime(item.createTime) }}</text>
            </view>
            <view class="action-row">
              <text class="action-text">{{ item.actionText }}</text>
            </view>
            <view class="preview-row" v-if="item.content">
              <text class="preview-text">{{ item.content }}</text>
            </view>
            <view class="source-row" v-if="item.postTitle">
              <text class="source-text">来自《{{ item.postTitle }}》</text>
            </view>
          </view>
        </view>

        <!-- 加载更多 -->
        <view class="loading-status" v-if="loading">
          <text>加载中...</text>
        </view>

        <!-- 到底提示 -->
        <view class="no-more" v-else-if="!hasMore && notificationList.length > 0">
          <text>- 没有更多了 -</text>
        </view>
      </scroll-view>

      <!-- 空状态 -->
      <view class="empty-state" v-else>
        <text class="empty-icon">❤️</text>
        <text class="empty-text">还没有人给你点赞哦</text>
        <text class="empty-tip">有人点赞你的帖子或评论时会显示在这里</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { get, post, del } from '@/utils/request.js'
import { notificationApi } from '@/api/index.js'

const statusBarHeight = ref(20)
const notificationList = ref([])
const currentPage = ref(1)
const pageSize = ref(20)
const hasMore = ref(true)
const loading = ref(false)
const refreshing = ref(false)

onLoad((options) => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 20
  loadNotifications()
})

onShow(() => {
  if (!loading.value) {
    loadNotifications(true)
  }
})

const onRefresh = async () => {
  refreshing.value = true
  try {
    await loadNotifications(true)
  } finally {
    refreshing.value = false
  }
}

const loadNotifications = async (refresh = false) => {
  if (loading.value || (!refresh && !hasMore.value)) return

  if (refresh) {
    currentPage.value = 1
    hasMore.value = true
    notificationList.value = []
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
      throw new Error(response.message || '加载失败')
    }
  } catch (error) {
    console.error('加载获赞列表异常:', error)
    uni.showToast({
      title: refresh ? '刷新失败' : '加载失败',
      icon: 'none',
      duration: 2000
    })
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  if (!hasMore.value || loading.value) return
  loadNotifications()
}

const handleNotificationClick = (item) => {
  if (!item.isRead) {
    markAsReadSilent(item.id)
  }

  // postId 必须有效（> 0），否则无法跳转
  if (!item.postId || item.postId <= 0) {
    uni.showToast({ title: '该内容暂不可查看', icon: 'none' })
    return
  }

  if (item.commentId && item.commentId > 0) {
    uni.navigateTo({
      url: `/pages/post/detail?id=${item.postId}&commentId=${item.commentId}`
    })
  } else {
    uni.navigateTo({
      url: `/pages/post/detail?id=${item.postId}`
    })
  }
}

// 长按触发更多操作
const showMoreMenu = (item) => {
  const itemList = item.isRead ? ['忽略此通知'] : ['标记为已读', '忽略此通知']

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
    const notification = notificationList.value.find(n => n.id === notificationId)
    if (notification) {
      notification.isRead = true
    }
  } catch (error) {
    console.error('标记已读失败:', error)
  }
}

const markAsRead = async (notificationId) => {
  try {
    await post(notificationApi.markNotificationRead(notificationId).url)
    const notification = notificationList.value.find(n => n.id === notificationId)
    if (notification) {
      notification.isRead = true
    }
    uni.showToast({ title: '已标记为已读', icon: 'success' })
  } catch (error) {
    console.error('标记已读失败:', error)
    uni.showToast({ title: '操作失败', icon: 'none' })
  }
}

const ignoreNotification = async (item) => {
  uni.showModal({
    title: '确认忽略',
    content: '确定要忽略这条通知吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          const response = await del(notificationApi.deleteNotification(item.id).url)

          if (response.code === 200) {
            const index = notificationList.value.findIndex(n => n.id === item.id)
            if (index !== -1) {
              notificationList.value.splice(index, 1)
            }
            uni.showToast({ title: '已忽略', icon: 'success' })
          } else {
            throw new Error(response.message || '删除失败')
          }
        } catch (error) {
          console.error('删除通知失败:', error)
          uni.showToast({ title: '操作失败', icon: 'none' })
        }
      }
    }
  })
}

const goBack = () => {
  uni.navigateBack()
}

const formatTime = (timeStr) => {
  if (!timeStr) return ''

  const date = new Date(timeStr)
  const now = new Date()
  const diff = now - date

  if (diff < 60 * 1000) return '刚刚'
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}分钟前`

  if (diff < 24 * 60 * 60 * 1000 && date.getDate() === now.getDate()) {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }

  if (diff < 48 * 60 * 60 * 1000) {
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    if (date.getDate() === yesterday.getDate()) {
      return `昨天 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    }
  }

  return `${date.getMonth() + 1}月${date.getDate()}日`
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: #F4F5F7;
}

/* 导航栏 */
.custom-nav {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #ffffff;
  z-index: 100;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.03);
}

.nav-content {
  height: 44px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30rpx;
}

.nav-left, .nav-right {
  width: 80rpx;
}

.back-icon {
  font-size: 32rpx;
  color: #333;
}

.nav-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.content-wrapper {
  min-height: 100vh;
}

/* 加载 */
.loading-container {
  display: flex;
  justify-content: center;
  padding: 100rpx 0;
}

.loading-text {
  font-size: 28rpx;
  color: #999;
}

/* 列表 */
.list-scroll {
  height: calc(100vh - 88px);
}

.like-item {
  display: flex;
  padding: 26rpx 30rpx;
  background-color: #ffffff;
  border-bottom: 1rpx solid #f0f0f0;
}

.avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 12rpx;
  margin-right: 24rpx;
  flex-shrink: 0;
  background-color: #f5f5f5;
}

.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
}

.name-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.name {
  font-size: 30rpx;
  color: #1a1a1a;
  font-weight: 500;
}

.time {
  font-size: 22rpx;
  color: #b2b2b2;
  flex-shrink: 0;
  margin-left: 16rpx;
}

.action-row {
  margin-bottom: 6rpx;
}

.action-text {
  font-size: 25rpx;
  color: #888;
}

.preview-row {
  margin-bottom: 6rpx;
}

.preview-text {
  font-size: 25rpx;
  color: #999;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}

.source-row {
  margin-top: 4rpx;
}

.source-text {
  font-size: 24rpx;
  color: #b2b2b2;
}

/* 加载状态 */
.loading-status {
  text-align: center;
  padding: 30rpx 0;
  font-size: 26rpx;
  color: #999;
}

/* 到底提示 */
.no-more {
  text-align: center;
  padding: 40rpx 0;
  font-size: 24rpx;
  color: #ccc;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 16rpx;
}

.empty-tip {
  font-size: 24rpx;
  color: #ccc;
}
</style>
