<template>
  <view class="bg-[#fef8f8] min-h-screen flex flex-col relative selection:bg-primary-container selection:text-on-primary-container">
    
    <nav class="fixed top-0 w-full z-50 bg-[#fef8f8]/85 glass-header border-b border-dashed border-outline-variant/30 shadow-[0_4px_20px_rgba(255,143,163,0.08)]" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="flex items-center justify-between px-margin-page h-[48px] w-full relative">
        <view class="bouncy-tap p-2 -ml-2 text-primary flex items-center justify-center" @click="handleBack">
          <text class="material-symbols-outlined !text-[40rpx]">arrow_back_ios</text>
        </view>
        <view class="absolute left-1/2 -translate-x-1/2">
          <text class="font-headline-md text-[34rpx] text-primary font-bold">我的收藏</text>
        </view>
        <view class="w-[90px]"></view>
      </view>
    </nav>

    <scroll-view class="flex-1 w-full" scroll-y :style="{ paddingTop: (statusBarHeight + 56) + 'px' }" @scrolltolower="loadMore">
      <view class="px-margin-page pb-12 pt-4">
        
        <view class="flex items-center justify-between mb-4 px-1" v-if="postList.length > 0">
          <view class="flex items-center gap-2">
            <text class="material-symbols-outlined text-primary-container text-[36rpx]" style="font-variation-settings: 'FILL' 1;">history</text>
            <text class="font-headline-md text-[30rpx] text-on-surface font-bold">灵感档案馆</text>
          </view>
          <text class="font-label-sm text-[22rpx] text-on-surface-variant px-3 py-0.5 bg-surface-container rounded-full font-bold">共 {{ postList.length }} 篇</text>
        </view>

        <view class="flex flex-col items-center justify-center py-24 text-center animate-fade-in" v-if="postList.length === 0 && !loading">
          <view class="w-32 h-32 mb-6 relative flex items-center justify-center rounded-full bg-primary-container/10">
            <view class="absolute inset-0 bg-primary-container/20 rounded-full animate-pulse"></view>
            <text class="material-symbols-outlined !text-[80rpx] text-primary" style="font-variation-settings: 'FILL' 1;">bookmark</text>
          </view>
          <h2 class="font-headline-lg text-[32rpx] font-bold text-on-surface mb-2">暂无收藏哦</h2>
          <p class="text-body-lg text-on-surface-variant text-[26rpx]">去墙上搜罗一些你喜欢的动态吧 ✨</p>
          <button class="mt-8 px-8 py-2.5 bg-primary text-white rounded-full font-bold text-[28rpx] shadow-md bouncy-tap" @click="goToHome">
            回首页逛逛
          </button>
        </view>

        <view class="space-y-4" v-else>
          <view v-for="post in postList" :key="post.id" class="relative group" @click="goToDetail(post.id)">
            <view class="absolute inset-0 dashed-border pointer-events-none z-10"></view>
            
            <view class="bg-surface-container-lowest rounded-[32rpx] p-padding-inner sticker-shadow transition-all active:scale-[0.99]">
              <view class="flex items-center justify-between mb-3">
                <view class="flex items-center gap-3">
                  <view class="w-9 h-9 rounded-full border-2 border-white shadow-sm overflow-hidden bg-surface-container-low">
                    <image class="w-full h-full object-cover" :src="post.isAnonymous ? defaultAvatar : (post.avatar || defaultAvatar)" mode="aspectFill"></image>
                  </view>
                  <view class="flex flex-col">
                    <text class="font-headline-md text-[26rpx] font-bold text-on-surface">{{ post.isAnonymous ? '匿名用户' : (post.author || '匿名用户') }}</text>
                    <text class="text-[20rpx] text-on-surface-variant mt-0.5">{{ formatTime(post.createTime) }}</text>
                  </view>
                </view>
                
                <view class="px-3 py-1 bg-tertiary-fixed rounded-full" v-if="post.tags && post.tags.length > 0">
                  <text class="text-[20rpx] font-bold text-on-tertiary-container">#{{ post.tags[0] }}</text>
                </view>
              </view>

              <view class="mb-3">
                <text class="text-[28rpx] text-on-surface leading-relaxed line-clamp-3 block">
                  {{ post.content }}
                </text>
              </view>

              <view class="mb-3 rounded-[24rpx] overflow-hidden aspect-[16/9] bg-surface-container border-2 border-white" v-if="post.images && post.images.length > 0">
                <image class="w-full h-full object-cover" :src="post.images[0]" mode="aspectFill" @click.stop="previewImage(post.images, 0)"></image>
              </view>

              <view class="flex items-center justify-between pt-2 border-t border-surface-variant/30">
                <view class="flex items-center gap-4 text-on-surface-variant text-[24rpx]">
                  <view class="flex items-center gap-1 bouncy-tap">
                    <text class="material-symbols-outlined !text-[36rpx]">chat_bubble</text>
                    <text class="font-bold">{{ post.commentCount || 0 }}</text>
                  </view>
                  <view class="flex items-center gap-1 bouncy-tap" :class="{ 'text-primary': post.isLiked }" @click.stop="toggleLike(post)">
                    <text class="material-symbols-outlined !text-[36rpx]" :style="post.isLiked ? 'font-variation-settings:\'FILL\' 1' : ''">favorite</text>
                    <text class="font-bold">{{ post.likeCount || 0 }}</text>
                  </view>
                </view>
                
                <view class="flex items-center justify-center w-9 h-9 rounded-full bg-primary-fixed bouncy-tap" @click.stop="toggleCollect(post)">
                  <text class="material-symbols-outlined !text-[40rpx] text-primary" style="font-variation-settings: 'FILL' 1;">star</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view class="py-6 text-center text-outline-variant text-[24rpx]" v-if="loading">
          <text class="material-symbols-outlined animate-spin text-[32rpx] mr-2">sync</text>正在拉取档案馆贴纸...
        </view>
        <view class="text-center py-6 text-outline-variant text-[24rpx]" v-else-if="!hasMore && postList.length > 0">
          <view class="flex gap-2 justify-center items-center opacity-40 mb-2">
            <span class="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-secondary-container"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-tertiary-container"></span>
          </view>
          <text class="font-medium">- 已经没有珍藏的时光贴纸了 -</text>
        </view>

      </view>
    </scroll-view>

    <view class="fixed bottom-10 left-6 pointer-events-none opacity-20 z-[-1]">
      <text class="material-symbols-outlined !text-[56rpx] text-primary rotate-12">favorite</text>
    </view>
    <view class="fixed top-40 right-4 pointer-events-none opacity-20 z-[-1]">
      <text class="material-symbols-outlined !text-[48rpx] text-secondary -rotate-12">auto_awesome</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { get, post as apiPost } from '@/utils/request.js'
import { postApi } from '@/api/index.js'
import { formatTimeAgo } from '@/composables/useTimeAgo'

const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight || 20)
const defaultAvatar = '/static/images/default-avatar.png'

const postList = ref([])
const loading = ref(false)
const hasMore = ref(true)
const currentPage = ref(1)
const pageSize = ref(10)

let userId = 0

// 初始化加载生命周期参数接驳
onLoad(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 20

  const userInfo = uni.getStorageSync('userInfo')
  if (userInfo && userInfo.id) {
    userId = userInfo.id
    fetchCollectedPosts()
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

// 分页拉取收藏记录精益引擎
const fetchCollectedPosts = async (isLoadMore = false) => {
  if (loading.value) return
  
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value
    }
    
    const response = await get(postApi.getUserCollectedPosts(userId, params).url, params)
    
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
        isCollected: item.isCollected || true,
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
    console.error('❌ 获取收藏列表失败:', error)
    uni.showToast({ title: '加载失败，请重试', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const refreshPosts = () => {
  currentPage.value = 1
  hasMore.value = true
  fetchCollectedPosts(false)
}

const loadMore = () => {
  if (!hasMore.value || loading.value) return
  currentPage.value++
  fetchCollectedPosts(true)
}

// 乐观秒换点赞回弹
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

// 移出收藏防重流控
const toggleCollect = async (postItem) => {
  try {
    const apiConfig = postApi.toggleCollect(postItem.id)
    const response = await apiPost(apiConfig.url)
    
    postItem.isCollected = response.data.isCollected
    
    // 如果用户在当前页取消了收藏，瞬间执行平滑踢出过滤机制
    if (!response.data.isCollected) {
      uni.vibrateShort()
      postList.value = postList.value.filter(item => item.id !== postItem.id)
      uni.showToast({ title: '已移出档案馆', icon: 'success' })
    }
  } catch (error) {
    console.error('❌ 收藏控制异常:', error)
  }
}

const previewImage = (images, index) => {
  if (!images || images.length === 0) return
  uni.previewImage({ current: index, urls: images })
}

const goToDetail = (postId) => {
  if (!postId) return
  uni.navigateTo({ url: `/pages/post/detail?id=${postId}` })
}

const formatTime = formatTimeAgo

const goToHome = () => uni.switchTab({ url: '/pages/index/index' })
const handleBack = () => uni.navigateBack()
</script>

<style scoped>
/* 拦截所有硬边条系统滚动纹路 */
::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  color: transparent;
}

/* 萌系高响应缩放手感反馈 */
.bouncy-tap:active {
  transform: scale(0.96);
  transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 弥散阴影卡片 */
.sticker-shadow {
  box-shadow: 0 12rpx 40rpx rgba(255, 143, 163, 0.08);
}

/* 高精度 SVG 虚线外描圈边框 */
.dashed-border {
  background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='32' ry='32' stroke='%23DAC0C3' stroke-width='2' stroke-dasharray='8%2c 8' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e");
  border-radius: 32rpx;
}

/* 多线文字溢出约束 */
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