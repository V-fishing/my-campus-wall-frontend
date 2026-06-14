<template>
  <view class="bg-[#F4F5F7] min-h-screen flex flex-col relative selection:bg-primary-container selection:text-on-primary-container">
    
    <nav class="fixed top-0 w-full z-50 bg-[#F4F5F7]/85 backdrop-blur-md border-b border-dashed border-outline-variant/30 shadow-[0_4px_20px_rgba(255,143,163,0.08)]" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="flex items-center justify-between px-margin-page h-[44px] w-full relative">
        <view class="flex items-center gap-2">
          <view class="bouncy-tap p-2 -ml-2 text-primary flex items-center justify-center" @click="goBack">
            <text class="material-symbols-outlined text-[44rpx]">arrow_back_ios</text>
          </view>
          <text v-if="historyList.length > 0" class="text-on-surface-variant font-label-md text-[24rpx] bouncy-tap px-3 py-1 bg-surface-container rounded-full" @click="handleClear">清空所有</text>
        </view>
        <h1 class="absolute left-1/2 -translate-x-1/2 font-headline-md text-[34rpx] text-primary font-bold">浏览历史</h1>
        <view class="w-[80px]"></view>
      </view>
      <view class="h-2"></view>
    </nav>

    <scroll-view class="flex-1 w-full" scroll-y :style="{ paddingTop: (statusBarHeight + 56) + 'px' }" @scrolltolower="loadMore">
      <view class="px-margin-page pb-12 pt-4">
        
        <view class="flex items-center justify-between mb-4 px-1" v-if="historyList.length > 0">
          <view class="flex items-center gap-2">
            <text class="material-symbols-outlined text-primary-container text-[36rpx]" style="font-variation-settings: 'FILL' 1;">history</text>
            <text class="font-headline-md text-[30rpx] text-on-surface font-bold">浏览轨迹</text>
          </view>
          <text class="font-label-sm text-[22rpx] text-on-surface-variant px-3 py-0.5 bg-surface-container rounded-full font-bold">历史 {{ historyList.length }} 条</text>
        </view>

        <div class="flex flex-col items-center justify-center py-24 animate-fade-in" v-if="historyList.length === 0 && !loading">
          <div class="w-32 h-32 mb-6 bg-surface-container-high rounded-full flex items-center justify-center relative shadow-inner">
            <text class="material-symbols-outlined text-[100rpx] text-outline-variant">history_toggle_off</text>
            <text class="absolute top-2 right-4 text-primary-container text-[32rpx] animate-bounce">star</text>
            <text class="absolute bottom-4 left-2 text-secondary-container text-[28rpx] animate-pulse">favorite</text>
          </div>
          <p class="font-headline-md text-[32rpx] font-bold text-on-surface-variant mb-1">还没有浏览记录哦</p>
          <p class="font-label-md text-outline-variant text-[24rpx]">快去墙上看看大家分享的新鲜事吧 ✨</p>
        </div>

        <view class="space-y-3" v-else>
          <view v-for="item in historyList" :key="item.id" @click="goToPost(item.postId)"
                class="relative group bg-surface-container-lowest p-4 rounded-[40rpx] sticker-shadow border border-transparent active:border-primary-container transition-all flex items-start gap-3 bouncy-tap">
            
            <view class="flex-shrink-0 w-9 h-9 rounded-full overflow-hidden border-2 border-primary-fixed">
              <image class="w-full h-full object-cover bg-surface-container-low" :src="item.authorAvatar || defaultAvatar" mode="aspectFill"></image>
            </view>
            
            <view class="flex-grow min-w-0">
              <text class="font-body-lg text-[28rpx] font-bold text-on-surface line-clamp-2 leading-snug mb-2 block">
                {{ item.postTitle }}
              </text>
              <view class="flex items-center gap-1.5 text-outline-variant">
                <text class="material-symbols-outlined text-[24rpx]">schedule</text>
                <text class="font-label-sm text-[22rpx] font-medium">{{ formatDate(item.browseTime) }} 看过</text>
              </view>
            </view>
            
            <view class="flex-shrink-0 w-[120rpx] h-[120rpx] rounded-[24rpx] overflow-hidden bg-surface-container-high border-2 border-white ml-2 shadow-inner" v-if="getFirstImage(item.postImages)">
              <image class="w-full h-full object-cover" :src="getFirstImage(item.postImages)" mode="aspectFill"></image>
            </view>
            <view class="w-[60rpx]" v-else></view>

            <view class="absolute -top-1 -right-1">
              <text class="material-symbols-outlined text-primary-container text-[24rpx]">colors_spark</text>
            </view>
          </view>
        </view>

        <view class="py-6 text-center text-outline-variant font-label-md-mobile" v-if="loading">
          <text class="material-symbols-outlined animate-spin text-[36rpx] mr-2">sync</text>正在载入时光机...
        </view>
        <view class="text-center py-6 text-outline-variant font-label-md-mobile" v-else-if="!hasMore && historyList.length > 0">
          <view class="flex gap-2 justify-center items-center opacity-40 mb-2">
            <span class="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-secondary-container"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-tertiary-container"></span>
          </view>
          <text class="text-[22rpx] font-medium">仅保留最近 7 天的浏览历史轨迹</text>
        </view>

      </view>
    </scroll-view>

    <view class="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      <view class="absolute top-[20%] left-[10%] text-primary-fixed-dim/10 material-symbols-outlined text-[64rpx]">auto_awesome</view>
      <view class="absolute top-[65%] right-[12%] text-secondary-fixed-dim/10 material-symbols-outlined text-[56rpx]">favorite</view>
      <view class="absolute bottom-[12%] left-[18%] text-tertiary-fixed-dim/10 material-symbols-outlined text-[48rpx]">star</view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { get, del as deleteRequest } from '../../utils/request.js'
import { browseHistoryApi } from '../../api/browseHistory.js'

const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight || 20)
const defaultAvatar = '/static/default-avatar.png'

const historyList = ref([])
const page = ref(1)
const size = ref(20)
const loading = ref(false)
const hasMore = ref(true)

onLoad(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 20
  fetchHistoryList()
})

// 读取浏览记录异步引擎
const fetchHistoryList = async (isLoadMore = false) => {
  if (loading.value) return

  loading.value = true
  try {
    const response = await get(
      browseHistoryApi.getBrowseHistory(page.value, size.value).url,
      browseHistoryApi.getBrowseHistory(page.value, size.value).params
    )

    if (response.code === 200 && response.data) {
      const records = response.data.records || []
      
      if (isLoadMore) {
        historyList.value = [...historyList.value, ...records]
      } else {
        historyList.value = records
      }

      hasMore.value = page.value < response.data.pages
    }
  } catch (error) {
    console.error('❌ 拉取历史轨迹失败:', error)
    uni.showToast({ title: '加载轨迹失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

// 安全触底续签加载机制
const loadMore = () => {
  if (!hasMore.value || loading.value) return
  page.value++
  fetchHistoryList(true)
}

// 一键彻底清空历史弹窗手感反馈
const handleClear = () => {
  uni.showModal({
    title: '清空历史记录',
    content: '确定要清空这 7 天内的全部浏览记录吗？(◕‿◕✿)',
    confirmColor: '#9b4053',
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '正在清理粉碎...' })
          const response = await deleteRequest(browseHistoryApi.clearBrowseHistory().url)
          
          uni.hideLoading()
          if (response.code === 200) {
            uni.vibrateShort()
            uni.showToast({ title: '清理成功啦', icon: 'success' })
            historyList.value = []
            page.value = 1
            hasMore.value = false
          }
        } catch (error) {
          console.error('❌ 清空失败:', error)
          uni.hideLoading()
          uni.showToast({ title: '操作失败，请重试', icon: 'none' })
        }
      }
    }
  })
}

// 跨组件卡片导流跳详情页
const goToPost = (postId) => {
  if (!postId) return
  uni.navigateTo({
    url: `/pages/post/detail?id=${postId}`
  })
}

// 安全解析图片并提取第一张作为拍立得小封面
const getFirstImage = (imagesStr) => {
  if (!imagesStr) return null
  try {
    const list = JSON.parse(imagesStr)
    return (Array.isArray(list) && list.length > 0) ? list[0] : null
  } catch (e) {
    // 兼容如果是裸字符串数组的形式
    if (imagesStr.startsWith('[') && imagesStr.endsWith(']')) {
      return null
    }
    return imagesStr || null
  }
}

// 格式化看过的时间轴
const formatDate = (timeStr) => {
  if (!timeStr) return '刚刚'
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}-${day}`
}

const goBack = () => uni.navigateBack()
</script>

<style scoped>
/* 系统硬边框条纹强效隐藏 */
::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  color: transparent;
}

/* 萌系Q弹触能反馈 */
.bouncy-tap:active {
  transform: scale(0.97);
  transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 弥散阴影板 */
.sticker-shadow {
  box-shadow: 0 12rpx 40rpx rgba(255, 143, 163, 0.08);
}

/* 文字限定多行溢出切碎 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

/* 基础淡入特效指引 */
.animate-fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(16rpx); }
  to { opacity: 1; transform: translateY(0); }
}
</style>