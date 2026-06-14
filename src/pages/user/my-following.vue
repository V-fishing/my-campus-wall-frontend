<template>
  <view class="bg-[#F4F5F7] min-h-screen flex flex-col relative selection:bg-primary-fixed">
    
    <header class="fixed top-0 left-0 w-full z-50 bg-[#F4F5F7]/85 backdrop-blur-md pt-status-bar h-[100px] flex items-center px-4 border-b border-outline-variant/20 shadow-sm">
      <view class="flex items-center w-full relative justify-between pr-capsule-safe-zone">
        <view class="bouncy-tap p-2 rounded-full -ml-2 text-primary flex items-center justify-center cursor-pointer" @click="handleBack">
          <text class="material-symbols-outlined text-[44rpx]">arrow_back_ios_new</text>
        </view>
        <h1 class="font-headline-lg-mobile text-[36rpx] text-primary font-bold tracking-tight absolute left-1/2 -translate-x-1/2">我的关注</h1>
        <view class="w-10 h-10"></view>
      </view>
    </header>

    <scroll-view class="w-full flex-1" scroll-y :style="{ height: 'calc(100vh - 100px)', marginTop: '100px' }" @scrolltolower="loadMore">
      <view class="px-margin-page pb-12 pt-4">
        
        <view class="fixed top-24 right-6 opacity-40 pointer-events-none z-[-1]">
          <text class="material-symbols-outlined text-primary text-xl" style="font-variation-settings: 'FILL' 1;">colors_spark</text>
        </view>
        <view class="fixed bottom-24 left-4 opacity-40 pointer-events-none z-[-1]">
          <text class="material-symbols-outlined text-secondary text-xl" style="font-variation-settings: 'FILL' 1;">favorite</text>
        </view>

        <view class="flex flex-col items-center justify-center py-24 text-center animate-fade-in" v-if="followList.length === 0 && !loading">
          <view class="w-32 h-32 mb-6 relative flex items-center justify-center rounded-full bg-secondary-container/10">
            <text class="material-symbols-outlined !text-[80rpx] text-secondary animate-pulse" style="font-variation-settings: 'FILL' 1;">group</text>
          </view>
          <h2 class="font-headline-lg text-[32rpx] font-bold text-on-surface mb-2">还没有关注任何人哦</h2>
          <p class="text-body-lg text-on-surface-variant text-[24rpx]">去校园广场或动态流里搜罗一些有趣的同学吧~ ✨</p>
        </view>

        <view class="flex flex-col gap-gutter-card" v-else>
          <view v-for="(item, index) in followList" :key="index" @click="goToUserHome(item.userId)"
                class="bg-surface-container-low rounded-[40rpx] p-padding-inner border-2 border-transparent hover: hover:border-primary-fixed-dim transition-all flex items-center gap-4 group">
            
            <view class="relative shrink-0">
              <image class="w-14 h-14 rounded-full bg-primary-fixed/30 border-2 border-white object-cover shadow-sm" :src="item.avatar || defaultAvatar" mode="aspectFill" />
              <view class="absolute -bottom-1 -right-1 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center border-2 border-white shadow-sm"
                    :class="item.gender === 1 ? 'bg-blue-400' : (item.gender === 2 ? 'bg-pink-400' : 'bg-on-surface-variant')">
                <text class="material-symbols-outlined text-[12rpx] font-bold">
                  {{ item.gender === 1 ? 'male' : (item.gender === 2 ? 'female' : 'visibility_off') }}
                </text>
              </view>
            </view>

            <view class="flex-1 min-w-0">
              <view class="flex items-center gap-2 flex-wrap">
                <text class="font-headline-md-mobile text-[30rpx] font-bold text-on-surface truncate max-w-[200rpx]">{{ item.nickname || '神秘洞主' }}</text>
                <view class="bg-primary-container/20 text-on-primary-container px-2.5 py-0.5 rounded-full font-label-sm-mobile text-[20rpx] font-bold border border-primary-container/10 shrink-0" v-if="item.college">
                  {{ item.college }}
                </view>
              </view>
              <text class="text-on-surface-variant font-label-md-mobile text-[24rpx] mt-1 line-clamp-1 block italic">{{ item.signature || '这个人很神秘，什么都没写~ ✍️' }}</text>
            </view>

            <button v-if="item.isFollowing" @click.stop="toggleFollow(item)"
                    class="bouncy-tap bg-surface-container-highest text-on-surface-variant font-label-md-mobile text-[24rpx] font-bold px-4 py-1.5 rounded-full border border-outline-variant shadow-sm shrink-0">
              已关注
            </button>
            <button v-else @click.stop="toggleFollow(item)"
                    class="bouncy-tap bg-primary text-white font-label-md-mobile text-[24rpx] font-bold px-4 py-1.5 rounded-full shadow-md shrink-0">
              关注
            </button>

          </view>
        </view>

        <view class="py-12 text-center text-outline-variant font-label-md" v-if="loading">
          <text class="material-symbols-outlined animate-spin text-[36rpx] mr-2">sync</text>正在调阅时光轨迹树...
        </view>
        
        <view class="mt-12 flex flex-col items-center justify-center gap-2 opacity-60" v-else-if="!hasMore && followList.length > 0">
          <text class="material-symbols-outlined text-primary-fixed-dim text-2xl animate-pulse">auto_awesome</text>
          <text class="font-label-sm-mobile text-label-sm-mobile text-on-surface-variant text-[24rpx] font-medium">已经到底啦，去发现更多精彩吧~</text>
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

const followList = ref([])
const loading = ref(false)
const hasMore = ref(true)
const currentPage = ref(1)
const pageSize = ref(15)

let userId = 0

// 初始化加载生命周期
onLoad(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 20

  const userInfo = uni.getStorageSync('userInfo')
  if (userInfo && (userInfo.id || userInfo.userId)) {
    userId = userInfo.id || userInfo.userId
    fetchFollowList(false)
  } else {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => {
      uni.navigateTo({ url: '/pages/login/login' })
    }, 1000)
  }
})

// 分页流式加载关注档案
const fetchFollowList = async (isLoadMore = false) => {
  if (loading.value) return
  
  loading.value = true
  try {
    const response = await get('/api/v1/follow/following', {
      page: currentPage.value,
      size: pageSize.value
    })
    
    if (response.code === 200 && response.data) {
      const records = response.data.records || []
      const newFollows = records.map(item => ({
        id: item.userId,
        userId: item.userId,
        nickname: item.nickname,
        avatar: item.avatar,
        gender: item.gender ?? 3,
        college: item.college || '',
        signature: item.signature || '',
        isFollowing: true // 初始拉取的均为已关注对象
      }))
      
      if (isLoadMore) {
        followList.value = [...followList.value, ...newFollows]
      } else {
        followList.value = newFollows
      }
      
      const total = response.data.total || 0
      hasMore.value = followList.value.length < total
    }
  } catch (error) {
    console.error('❌ 获取关注轨迹失败:', error)
    uni.showToast({ title: '加载失败，请重试', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  if (!hasMore.value || loading.value) return
  currentPage.value++
  fetchFollowList(true)
}

// 乐观双向同步切换关注状态机制
const toggleFollow = async (item) => {
  try {
    uni.showLoading({ title: '正在处理...' })
    
    if (item.isFollowing) {
      // 取消关注 - 精准调配前端 DELETE 流
      await del(followApi.unfollowUser(item.userId).url)
      item.isFollowing = false
      uni.hideLoading()
      uni.showToast({ title: '已取消关注', icon: 'success' })
      
      // 0.5秒后自动从当前手账画卷中悄悄移除移出
      setTimeout(() => {
        followList.value = followList.value.filter(i => i.userId !== item.userId)
      }, 400)
    } else {
      // 恢复关注 - 调配 POST 接口加回
      await post(followApi.followUser(item.userId).url)
      item.isFollowing = true
      uni.hideLoading()
      uni.vibrateShort()
      uni.showToast({ title: '重新关注成功 💖', icon: 'success' })
    }
  } catch (error) {
    console.error('❌ 切换关注链路受阻:', error)
    uni.hideLoading()
    uni.showToast({ title: error.message || '操作失败，请重试', icon: 'none' })
  }
}

// 点击卡片进入他人主页
const goToUserHome = (targetUid) => {
  if (!targetUid) return
  uni.navigateTo({
    url: `/pages/user/user-home?userId=${targetUid}`
  })
}

const handleBack = () => uni.navigateBack()
</script>

<style scoped>
/* 强效压制并隐藏全系统多余的硬边框滚动痕迹 */
::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  color: transparent;
}

/* 软糯按压果冻阻尼触感机制 */
.bouncy-tap:active {
  transform: scale(0.96);
  transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 弥散悬浮大基板阴影 */

/* 标志性贴纸白描外发光边 */

/* 限定单行截断溢出 */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}

/* 淡化淡入动画指引 */
.animate-fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(16rpx); }
  to { opacity: 1; transform: translateY(0); }
}
</style>