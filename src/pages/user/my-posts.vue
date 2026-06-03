<template>
  <view class="bg-[#fef8f8] min-h-screen flex flex-col relative selection:bg-primary-container selection:text-on-primary-container">
    
    <header class="fixed top-0 w-full z-50 bg-[#fef8f8]/85 glass-header border-b border-dashed border-outline-variant/30 h-[88px] flex flex-col justify-end pb-3">
      <view class="flex items-center justify-between px-margin-page h-[44px] w-full relative">
        <view class="bouncy-tap p-2 -ml-2 text-primary flex items-center justify-center" @click="handleBack">
          <text class="material-symbols-outlined text-[44rpx]">arrow_back_ios</text>
        </view>
        <h1 class="absolute left-1/2 -translate-x-1/2 font-headline-md text-[34rpx] text-primary font-bold">我的发布</h1>
        <view class="w-[90px]"></view>
      </view>
    </header>

    <scroll-view class="flex-1 w-full" scroll-y :style="{ paddingTop: '88px' }" @scrolltolower="loadMore">
      <view class="px-margin-page pb-12 pt-4">
        
        <view class="flex items-center justify-between mb-4 px-1" v-if="postList.length > 0">
          <view class="flex items-center gap-2">
            <text class="material-symbols-outlined text-primary-container text-[36rpx]" style="font-variation-settings: 'FILL' 1;">history</text>
            <text class="font-headline-md text-[30rpx] text-on-surface font-bold">时光轨迹</text>
          </view>
          <text class="font-label-sm text-[22rpx] text-on-surface-variant px-3 py-0.5 bg-surface-container rounded-full font-bold">共 {{ postList.length }} 篇贴纸</text>
        </view>

        <view class="flex flex-col items-center justify-center py-24 text-center animate-fade-in" v-if="postList.length === 0 && !loading">
          <view class="w-32 h-32 mb-6 bg-surface-container-high rounded-full flex items-center justify-center relative shadow-inner">
            <text class="material-symbols-outlined text-[80rpx] text-outline-variant">description</text>
            <text class="absolute top-2 right-4 text-primary-container text-[32rpx] animate-bounce">✨</text>
          </view>
          <h2 class="font-headline-lg text-[32rpx] font-bold text-primary mb-1">你还没有发布过内容哦</h2>
          <p class="text-body-lg text-on-surface-variant text-[26rpx] mb-8">点击下方纽扣，去分享你的校园灵感吧！✨</p>
          <button class="px-8 py-2.5 bg-primary text-white rounded-full font-bold text-[28rpx] shadow-md bouncy-tap" @click="handlePublish">
            去发布纸片
          </button>
        </view>

        <view class="space-y-4" v-else>
          <view v-for="post in postList" :key="post.id" class="relative p-[2rpx]" @click="goToDetail(post.id)">
            <view class="custom-dashed absolute inset-0 pointer-events-none z-10"></view>
            
            <view class="bg-surface-container-lowest rounded-[32rpx] p-padding-inner sticker-shadow transition-all active:scale-[0.99]">
              
              <header class="flex items-center justify-between mb-3">
                <view class="flex items-center gap-3">
                  <view class="w-9 h-9 rounded-full border-2 border-white shadow-sm overflow-hidden sticker-shadow bg-surface-container-low">
                    <image class="w-full h-full object-cover" :src="post.isAnonymous ? defaultAvatar : (post.avatar || defaultAvatar)" mode="aspectFill" />
                  </view>
                  <view class="flex flex-col">
                    <text class="font-headline-md text-[26rpx] font-bold text-primary">{{ post.isAnonymous ? '匿名用户' : (post.author || '匿名用户') }}</text>
                    <text class="font-label-sm text-[20rpx] text-on-surface-variant mt-0.5">{{ formatTime(post.createTime) }}</text>
                  </view>
                </view>
                
                <button class="bouncy-tap text-on-surface-variant p-1 -mr-1 bg-transparent" @click.stop="showPostMenu(post)">
                  <text class="material-symbols-outlined text-[36rpx]">more_horiz</text>
                </button>
              </header>

              <view class="mb-3">
                <text class="font-body-lg text-[28rpx] text-on-surface leading-relaxed line-clamp-3 mb-2 block">
                  {{ post.content }}
                </text>
                
                <view class="flex flex-wrap gap-2 mb-3" v-if="post.tags && post.tags.length > 0">
                  <text v-for="(tag, idx) in post.tags" :key="idx" class="px-3 py-0.5 bg-gradient-to-r from-secondary-container to-secondary rounded-full text-[20rpx] text-white font-bold">
                    #{{ tag }}
                  </text>
                </view>

                <view class="rounded-[24rpx] overflow-hidden aspect-[16/9] border border-outline-variant/60 bg-surface-container-low shadow-inner" v-if="post.images && post.images.length === 1">
                  <image class="w-full h-full object-cover" :src="post.images[0]" mode="aspectFill" @click.stop="previewImage(post.images, 0)" />
                </view>
                
                <view class="grid grid-cols-2 gap-2 h-40" v-else-if="post.images && post.images.length >= 2">
                  <view class="rounded-[24rpx] overflow-hidden border border-outline-variant/60 bg-surface-container-low shadow-inner" v-for="(img, idx) in post.images.slice(0, 2)" :key="idx">
                    <image class="w-full h-full object-cover" :src="img" mode="aspectFill" @click.stop="previewImage(post.images, idx)" />
                  </view>
                </view>
              </view>

              <footer class="flex items-center justify-between pt-3 border-t border-surface-container-highest">
                <view class="flex gap-[32rpx] text-on-surface-variant text-[24rpx] font-bold">
                  <view class="flex items-center gap-1 bouncy-tap" :class="{ 'text-primary': post.isLiked }" @click.stop="toggleLike(post)">
                    <text class="material-symbols-outlined text-[32rpx]" :style="post.isLiked ? 'font-variation-settings:\'FILL\' 1' : ''">favorite</text>
                    <text>{{ post.likeCount || 0 }}</text>
                  </view>
                  <view class="flex items-center gap-1 bouncy-tap" @click.stop="goToDetail(post.id)">
                    <text class="material-symbols-outlined text-[32rpx]">chat_bubble</text>
                    <text>{{ post.commentCount || 0 }}</text>
                  </view>
                  <view class="flex items-center gap-1 bouncy-tap" :class="{ 'text-primary': post.isCollected }" @click.stop="toggleCollect(post)">
                    <text class="material-symbols-outlined text-[32rpx]" :style="post.isCollected ? 'font-variation-settings:\'FILL\' 1' : ''">star</text>
                    <text>{{ post.isCollected ? '已收藏' : '收藏' }}</text>
                  </view>
                </view>
                
                <view class="text-on-surface-variant flex items-center">
                  <text class="material-symbols-outlined text-[32rpx] text-primary-container" style="font-variation-settings: 'FILL' 1;">auto_awesome</text>
                </view>
              </footer>

            </view>
          </view>
        </view>

        <view class="py-6 text-center text-outline-variant text-[24rpx]" v-if="loading">
          <text class="material-symbols-outlined animate-spin text-[32rpx] mr-2">sync</text>正在搜罗时光贴纸...
        </view>
        <view class="text-center py-6 text-outline-variant text-[24rpx]" v-else-if="!hasMore && postList.length > 0">
          <view class="flex gap-2 justify-center items-center opacity-40 mb-2">
            <span class="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-secondary-container"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-tertiary-container"></span>
          </view>
          <text class="font-medium">- 已经到底啦，这是你留下的所有足迹 👣 -</text>
        </view>

      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { get, post as apiPost } from '@/utils/request.js'
import { postApi } from '@/api/index.js'

const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight || 20)
const defaultAvatar = '/static/images/default-avatar.png'

const postList = ref([])
const loading = ref(false)
const hasMore = ref(true)
const currentPage = ref(1)
const pageSize = ref(10)

let userId = 0

// 周期挂载接驳
onLoad(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 20

  const userInfo = uni.getStorageSync('userInfo')
  if (userInfo && userInfo.id) {
    userId = userInfo.id
    fetchUserPosts()
  } else {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => {
      uni.navigateTo({ url: '/pages/login/login' })
    }, 1000)
  }
})

onShow(() => {
  if (userId > 0) {
    refreshPosts()
  }
})

// 分页拉取动态发布流
const fetchUserPosts = async (isLoadMore = false) => {
  if (loading.value) return
  
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value
    }
    
    const response = await get(postApi.getUserPosts(userId, params).url, params)
    
    if (response.code === 200 && response.data) {
      const records = response.data.records || []
      const newPosts = records.map(item => ({
        id: item.id,
        userId: item.userId,
        author: item.author || '匿名用户',
        avatar: item.avatar || defaultAvatar,
        createTime: item.createTime,
        content: item.content,
        images: item.images || [],
        tags: item.tags || [],
        viewCount: item.viewCount || 0,
        likeCount: item.likeCount || 0,
        commentCount: item.commentCount || 0,
        isLiked: item.isLiked || false,
        isCollected: item.isCollected || false,
        isAnonymous: item.isAnonymous || false
      }))
      
      if (isLoadMore) {
        postList.value = [...postList.value, ...newPosts]
      } else {
        postList.value = newPosts
      }
      
      const total = response.data.total || 0
      hasMore.value = postList.value.length < total
    }
  } catch (error) {
    console.error('❌ 获取帖子列表失败:', error)
    uni.showToast({ title: '加载失败，请重试', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const refreshPosts = () => {
  currentPage.value = 1
  hasMore.value = true
  fetchUserPosts(false)
}

const loadMore = () => {
  if (!hasMore.value || loading.value) return
  currentPage.value++
  fetchUserPosts(true)
}

// 乐观轻触反馈点赞引擎
const toggleLike = async (postItem) => {
  const previousState = postItem.isLiked
  const previousCount = postItem.likeCount

  postItem.isLiked = !previousState
  postItem.likeCount = previousState ? previousCount - 1 : previousCount + 1

  try {
    const apiConfig = postApi.toggleLike(postItem.id)
    const response = await apiPost(apiConfig.url)
    if (response.code === 200) {
      postItem.isLiked = response.data.isLiked
      postItem.likeCount = response.data.likeCount
      if (response.data.isLiked) uni.vibrateShort()
    }
  } catch (error) {
    postItem.isLiked = previousState
    postItem.likeCount = previousCount
  }
}

// 乐观双向同步收藏开关
const toggleCollect = async (postItem) => {
  const previousState = postItem.isCollected
  postItem.isCollected = !previousState

  try {
    const apiConfig = postApi.toggleCollect(postItem.id)
    const response = await apiPost(apiConfig.url)
    if (response.code === 200) {
      postItem.isCollected = response.data.isCollected
      if (response.data.isCollected) uni.vibrateShort()
      uni.showToast({
        title: response.data.isCollected ? '珍藏成功' : '已撤销收藏',
        icon: 'success'
      })
    }
  } catch (error) {
    postItem.isCollected = previousState
  }
}

// 侧滑或长按专属操作菜单接管
const showPostMenu = (postItem) => {
  const userInfo = uni.getStorageSync('userInfo')
  const currentUserId = userInfo ? userInfo.id : 0
  
  if (postItem.userId !== currentUserId) {
    uni.showActionSheet({
      itemList: ['举报这张贴纸'],
      success: (res) => {
        if (res.tapIndex === 0) uni.showToast({ title: '举报已提交审核', icon: 'none' })
      }
    })
  } else {
    uni.showActionSheet({
      itemList: ['粉碎删除贴纸'],
      itemColor: '#ff4d4f',
      success: (res) => {
        if (res.tapIndex === 0) deletePost(postItem)
      }
    })
  }
}

// 深度异步垃圾清理闭环
const deletePost = async (postItem) => {
  uni.showModal({
    title: '销毁确认',
    content: '撕碎该张贴纸后数据将永久蒸发，确认执行吗？',
    confirmText: '销毁',
    confirmColor: '#ff4d4f',
    success: async (res) => {
      if (res.confirm) {
        try {
          const response = await apiPost(postApi.deletePost(postItem.id).url)
          if (response.code === 200 || response.success) {
            uni.showToast({ title: '粉碎成功', icon: 'success' })
            postList.value = postList.value.filter(item => item.id !== postItem.id)
          }
        } catch (error) {
          uni.showToast({ title: error.message || '网络开小差了', icon: 'none' })
        }
      }
    }
  })
}

const previewImage = (images, index) => {
  if (!images || images.length === 0) return
  uni.previewImage({ current: index, urls: images })
}

const goToDetail = (postId) => {
  if (!postId) return
  uni.navigateTo({ url: `/pages/post/detail?id=${postId}` })
}

const formatTime = (timeStr) => {
  if (!timeStr) return '刚刚'
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now - date
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  return `${date.getMonth() + 1}-${date.getDate()}`
}

const handlePublish = () => uni.navigateTo({ url: '/pages/publish/publish' })
const handleBack = () => uni.navigateBack()
</script>

<style scoped>
/* 强效压制全平台系统的僵硬滚动痕迹 */
::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  color: transparent;
}

/* 软糯果冻级按压动效阻尼感机制 */
.bouncy-tap:active {
  transform: scale(0.96);
  transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 弥散悬浮光感板阴影 */
.sticker-shadow {
  box-shadow: 0 12rpx 40rpx rgba(255, 143, 163, 0.08);
}

/* SVG 裁切虚线描框轮廓 */
.custom-dashed {
  background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='32' ry='32' stroke='%23DAC0C3' stroke-width='2' stroke-dasharray='8%2c 12' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e");
  border-radius: 32rpx;
}

/* 多行限制溢出切除 */
.line-clamp-3 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}

.animate-fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(16rpx); }
  to { opacity: 1; transform: translateY(0); }
}
</style>