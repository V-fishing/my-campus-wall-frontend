<template>
  <view class="bg-[#fef8f8] min-h-screen flex flex-col relative selection:bg-primary-fixed">
    
    <header class="fixed top-0 left-0 w-full z-50 bg-[#fef8f8]/85 backdrop-blur-md flex items-center px-4 pt-status-bar h-[100px] border-b border-dashed border-outline-variant/20 shadow-sm">
      <view class="flex items-center w-full justify-between pr-capsule-safe-zone">
        <view class="w-10 h-10 flex items-center justify-center rounded-full bouncy-tap text-primary cursor-pointer -ml-2" @click="handleBack">
          <text class="material-symbols-outlined text-[44rpx]">arrow_back_ios_new</text>
        </view>
        <h1 class="font-headline-lg-mobile text-[36rpx] text-primary font-bold tracking-tight absolute left-1/2 -translate-x-1/2">我的粉丝</h1>
        <view class="w-10 h-10"></view>
      </view>
    </header>

    <scroll-view class="w-full flex-1" scroll-y :style="{ height: 'calc(100vh - 100px)', marginTop: '100px' }" @scrolltolower="loadMore">
      <view class="px-margin-page pb-12 pt-4">
        
        <view class="mb-6 flex items-center justify-between px-2" v-if="fansList.length > 0">
          <view class="flex items-center gap-2">
            <text class="text-on-surface-variant font-label-md text-[26rpx] font-bold">共 {{ fansList.length }} 位粉丝</text>
            <text class="text-primary-container animate-pulse text-[26rpx]">✨</text>
          </view>
        </view>

        <view class="flex flex-col items-center justify-center py-24 text-center animate-fade-in" v-if="fansList.length === 0 && !loading">
          <view class="w-32 h-32 mb-6 relative flex items-center justify-center rounded-full bg-primary-container/10">
            <text class="material-symbols-outlined !text-[80rpx] text-primary animate-bounce">star</text>
          </view>
          <h2 class="font-headline-lg text-[32rpx] font-bold text-on-surface mb-2">还没有粉丝哦</h2>
          <p class="text-body-lg text-on-surface-variant text-[24rpx]">别灰心！多发优质的校园动态去召唤粉丝吧~ 🌸</p>
        </view>

        <view class="space-y-4" v-else>
          <view v-for="(item, index) in fansList" :key="index" @click="goToUserHome(item.userId)"
                class="bg-surface-container-low/80 p-padding-inner rounded-[40rpx] flex items-center gap-4 kawaii-shadow border-2 border-dashed border-outline-variant/30 active:scale-[0.98] transition-all duration-200">
            
            <view class="relative shrink-0">
              <image class="w-[100rpx] h-[100rpx] rounded-full border-2 border-white shadow-sm bg-white object-cover" :src="item.avatar || defaultAvatar" mode="aspectFill"></image>
            </view>
            
            <view class="flex-1 min-w-0">
              <view class="flex items-center gap-1.5 mb-1 flex-wrap">
                <text class="font-bold text-[30rpx] text-on-surface truncate max-w-[200rpx]">{{ item.nickname || '未知用户' }}</text>
                <view class="purple-gradient text-[20rpx] px-2.5 py-0.5 rounded-full text-on-secondary-container font-bold border border-white/20 shadow-sm shrink-0" v-if="item.college">
                  {{ item.college }}
                </view>
              </view>
              <text class="text-[24rpx] text-outline truncate block mt-0.5">{{ item.signature || '这个人很神秘，什么都没写~ ✍️' }}</text>
            </view>
            
            <view class="shrink-0" @click.stop="toggleFollow(item)">
              <button v-if="item.isFollowing" class="bg-white border-2 border-outline-variant/60 text-outline-variant/80 px-4 py-1.5 rounded-full text-[24rpx] font-bold bouncy-tap transition-all shadow-sm">
                已关注
              </button>
              <button v-else class="pink-gradient text-white px-4 py-1.5 rounded-full text-[24rpx] font-bold shadow-md bouncy-tap transition-all">
                回关
              </button>
            </view>

          </view>
        </view>

        <view class="py-12 text-center text-outline-variant font-label-md" v-if="loading">
          <text class="material-symbols-outlined animate-spin text-[36rpx] mr-2">sync</text>正在收纳时光贴纸...
        </view>
        
        <view class="py-12 flex flex-col items-center justify-center opacity-40" v-else-if="!hasMore && fansList.length > 0">
          <view class="flex gap-2 mb-4">
            <text class="material-symbols-outlined text-primary text-[40rpx]">favorite</text>
            <text class="material-symbols-outlined text-secondary text-[32rpx] -rotate-12">star</text>
            <text class="material-symbols-outlined text-primary text-[40rpx]">favorite</text>
          </view>
          <text class="text-label-md font-bold text-outline text-[24rpx]">已经到底啦，去发现更多有趣的人吧 ~</text>
        </view>

      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { get, post, del } from '@/utils/request.js'
import { followApi } from '@/api/index.js'

const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight || 20)
const defaultAvatar = '/static/images/default-avatar.png'

const fansList = ref([])
const loading = ref(false)
const hasMore = ref(true)
const currentPage = ref(1)
const pageSize = ref(15)

let userId = 0

// 初始化接驳生命周期
onLoad(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 20

  const userInfo = uni.getStorageSync('userInfo')
  if (userInfo && (userInfo.id || userInfo.userId)) {
    userId = userInfo.id || userInfo.userId
    fetchFansList(false)
  } else {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => {
      uni.navigateTo({ url: '/pages/login/login' })
    }, 1000)
  }
})

// 分页拉取粉丝列表核心引擎
const fetchFansList = async (isLoadMore = false) => {
  if (loading.value) return
  
  loading.value = true
  try {
    const response = await get('/api/v1/follow/followers', {
      page: currentPage.value,
      size: pageSize.value
    })
    
    if (response.code === 200 && response.data) {
      const records = response.data.records || []
      const newFans = records.map(item => ({
        id: item.userId,
        userId: item.userId,
        nickname: item.nickname,
        avatar: item.avatar,
        college: item.college || '',
        signature: item.signature || '',
        isFollowing: item.isFollowing || false
      }))
      
      if (isLoadMore) {
        fansList.value = [...fansList.value, ...newFans]
      } else {
        fansList.value = newFans
      }
      
      const total = response.data.total || 0
      hasMore.value = fansList.value.length < total
    }
  } catch (error) {
    console.error('❌ 获取粉丝轨迹树崩溃:', error)
    uni.showToast({ title: '加载失败，请重试', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  if (!hasMore.value || loading.value) return
  currentPage.value++
  fetchFansList(true)
}

// 乐观双向同步互关与取关处理逻辑
const toggleFollow = async (item) => {
  try {
    uni.showLoading({ title: '操作中...' })
    
    if (item.isFollowing) {
      // 取消关注 - 优雅调用 DELETE 接口闭环
      await del(followApi.unfollowUser(item.userId).url)
      item.isFollowing = false
      uni.hideLoading()
      uni.showToast({ title: '已取消关注', icon: 'success' })
    } else {
      // 关注 - 优雅调用 POST 接口闭环并伴随物理震动
      await post(followApi.followUser(item.userId).url)
      item.isFollowing = true
      uni.hideLoading()
      uni.vibrateShort()
      uni.showToast({ title: '关注成功 💖', icon: 'success' })
    }
  } catch (error) {
    console.error('❌ 双向互关链路阻断:', error)
    uni.hideLoading()
    uni.showToast({ title: error.message || '操作失败，请重试', icon: 'none' })
  }
}

// 跨组件卡片引流至对方主页
const goToUserHome = (targetUid) => {
  if (!targetUid) return
  uni.navigateTo({
    url: `/pages/user/user-home?userId=${targetUid}`
  })
}

const handleBack = () => uni.navigateBack()
</script>

<style scoped>
/* 强效掩埋隐藏全平台系统的硬边框滚动纹路 */
::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  color: transparent;
}

/* 软糯果冻阻尼手感原子类机制 */
.bouncy-tap:active {
  transform: scale(0.96);
  transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 弥散悬浮板底阴影 */
.kawaii-shadow {
  box-shadow: 0 12rpx 40rpx rgba(255, 143, 163, 0.08);
}

/* 贴纸白描拼贴高光外边 */
.sticker-shadow {
  box-shadow: 0 4rpx 12rpx rgba(255, 143, 163, 0.15), 0 0 0 4rpx white;
}

/* 粉黄、紫粉核心三大色盘色彩体系 */
.pink-gradient {
  background: linear-gradient(135deg, #ff8fa3 0%, #ffb2bd 100%);
}
.purple-gradient {
  background: linear-gradient(135deg, #c5a3ff 0%, #ecdcff 100%);
}

/* 淡入渐隐动画 */
.animate-fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(16rpx); }
  to { opacity: 1; transform: translateY(0); }
}
</style>