<template>
  <view class="bg-[#F4F5F7] min-h-screen flex flex-col relative selection:bg-primary-container">
    
    <header class="fixed top-0 w-full h-[88px] z-50 glass-header bg-surface/85 flex flex-col justify-end pb-2 border-b border-outline-variant/20 shadow-sm">
      <view class="flex items-center justify-between px-margin-page h-[44px] relative w-full">
        <view class="w-8 h-8 flex items-center justify-center text-primary bouncy-btn cursor-pointer -ml-1" @click="goBack">
          <text class="material-symbols-outlined text-[44rpx]">arrow_back</text>
        </view>
        <h1 class="absolute left-1/2 -translate-x-1/2 font-headline-md-mobile text-[34rpx] text-on-surface font-bold">新增关注</h1>
        <view class="w-[90px]"></view>
      </view>
    </header>

    <scroll-view class="w-full flex-1" scroll-y="true" :style="{ height: 'calc(100vh - 88px)', marginTop: '88px' }" @scrolltolower="loadMore">
      <view class="px-margin-page pb-12 pt-4">
        
        <view class="flex justify-between items-center mb-4 px-2 opacity-60" v-if="fansList.length > 0">
          <text class="material-symbols-outlined text-primary-container text-[36rpx]" style="font-variation-settings: 'FILL' 1;">star</text>
          <text class="text-label-sm text-outline text-[24rpx] font-bold">最近关注你的同学</text>
          <text class="material-symbols-outlined text-tertiary-container text-[36rpx]" style="font-variation-settings: 'FILL' 1;">favorite</text>
        </view>

        <view class="flex flex-col items-center justify-center py-24 text-center animate-fade-in" v-if="fansList.length === 0 && !loading">
          <view class="w-32 h-32 mb-6 bg-primary-container/10 rounded-full flex items-center justify-center relative shadow-inner">
            <text class="material-symbols-outlined text-[80rpx] text-primary animate-bounce" style="font-variation-settings: 'FILL' 1;">celebration</text>
          </view>
          <h2 class="font-headline-lg text-[32rpx] font-bold text-primary mb-1">暂无新增关注哦</h2>
          <p class="text-body-lg text-on-surface-variant text-[26rpx]">多去发一些好玩的帖子，吸引全校关注吧 ✨</p>
        </view>

        <view v-else class="space-y-4">
          <view v-for="(item, index) in fansList" :key="index" @click="goToUserHome(item)"
                class="bg-surface-container-lowest rounded-[40rpx] p-4 flex items-center gap-3 border-2 border-white relative overflow-hidden transition-all duration-300">
            
            <view class="relative shrink-0">
              <image class="w-[100rpx] h-[100rpx] rounded-full bg-primary-fixed border-2 border-white shadow-sm object-cover" :src="item.avatar || defaultAvatar" mode="aspectFill" />
              <view class="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-outline-variant/10 flex items-center justify-center w-5 h-5" v-if="item.gender === 1 || item.gender === 2">
<text class="material-symbols-outlined icon-filled text-[14px] font-bold" 
      :class="item.gender === 1 ? 'text-tertiary' : 'text-[#FF69B4]'">
  {{ item.gender === 1 ? 'male' : 'female' }}
</text>
              </view>
            </view>

            <view class="flex-1 min-w-0 pr-1">
              <view class="flex items-center gap-1.5 mb-1 flex-wrap">
                <text class="font-bold text-[30rpx] text-on-surface truncate max-w-[180rpx]">{{ item.nickname || '未知用户' }}</text>
                <view class="bg-secondary text-white px-2.5 py-0.5 rounded-full text-[20rpx] font-bold border border-white/20 shadow-sm shrink-0" v-if="item.college">
                  {{ item.college }}
                </view>
              </view>
              <text class="text-outline text-[24rpx] truncate block italic mt-0.5">{{ item.signature || '留下你的个性签名，让大家更好地认识你 ✍️' }}</text>
            </view>

            <view class="shrink-0" @click.stop="toggleFollow(item)">
              <button v-if="item.isFollowing" class="bouncy-btn border-2 border-outline-variant text-outline px-4 py-1.5 rounded-full text-[24rpx] font-bold bg-white shadow-sm transition-all duration-300">
                已关注
              </button>
              <button v-else class="bouncy-btn bg-primary text-white px-5 py-1.5 rounded-full text-[24rpx] font-bold shadow-md transition-all duration-300">
                回关
              </button>
            </view>

          </view>
        </view>

        <view class="py-6 text-center text-outline-variant font-label-md" v-if="loading && fansList.length > 0">
          <text class="material-symbols-outlined animate-spin text-[32rpx] mr-2">sync</text>正在载入人气名册...
        </view>
        
        <view class="py-12 flex flex-col items-center justify-center opacity-40" v-else-if="!hasMore && fansList.length > 0">
          <text class="material-symbols-outlined text-6xl mb-2 text-primary-container animate-pulse" style="font-variation-settings: 'wght' 200;">celebration</text>
          <text class="text-label-md text-outline text-[24rpx] font-bold">已经到底啦，多发动态增加人气吧~ 💖</text>
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
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const statusBarHeight = ref(20)
const defaultAvatar = '/static/images/default-avatar.png'

const fansList = ref([])
const loading = ref(false)
const hasMore = ref(true)
const currentPage = ref(1)
const pageSize = ref(20)
const currentUserId = ref(null)  //

// 挂载接驳生命周期
onLoad(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 20

  // 使用 Pinia store 获取当前用户ID
  currentUserId.value = userStore.userId
  console.log('👤 粉丝通知页面加载完成, currentUserId:', currentUserId.value)
  
  if (!currentUserId.value) {
    // 备用兜底本地检索
    const userInfo = uni.getStorageSync('userInfo')
    if (userInfo && (userInfo.id || userInfo.userId)) {
      currentUserId.value = userInfo.id || userInfo.userId
    }
  }
  
  if (currentUserId.value) {
    fetchFansList()
  } else {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1000)
  }
})

// 分页异步拉取最新粉丝大列表
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
        nickname: item.nickname || '未知用户',
        avatar: item.avatar || defaultAvatar,
        gender: item.gender,  //
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
    } else {
      throw new Error(response.message || '网络开小差了')
    }
  } catch (error) {
    console.error('❌ 拉取粉丝通知树失败:', error)
    uni.showToast({ title: '数据档案拉取失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  if (!hasMore.value || loading.value) return
  currentPage.value++
  fetchFansList(true)
}

// 乐观双向互关/取消关注转换
const toggleFollow = async (item) => {
  try {
    uni.showLoading({ title: '正在处理...' })
    
    if (item.isFollowing) {
      // 取消关注 - 优雅调用异步 DELETE 闭环
      await del(followApi.unfollowUser(item.userId).url)
      item.isFollowing = false
      uni.hideLoading()
      uni.showToast({ title: '已取消关注', icon: 'success' })
    } else {
      // 恢复关注 - 优雅调用异步 POST 闭环加回并伴随短震动
      await post(followApi.followUser(item.userId).url)
      item.isFollowing = true
      uni.hideLoading()
      uni.vibrateShort()
      uni.showToast({ title: '重新互关成功 💖', icon: 'success' })
    }
    
  } catch (error) {
    console.error('❌ 互关链路阻断:', error)
    uni.hideLoading()
    uni.showToast({ title: error.message || '操作失败，请重试', icon: 'none' })
  }
}

// 跨组件主板卡片引流目标主页并执行本异地拦截
const goToUserHome = (item) => {
  if (!item || !item.userId) {
    return uni.showToast({ title: '用户信息走丟了', icon: 'none' })
  }
  
  // 确保类型一致后再进行中控校验（Number型）
  const isOwnPost = Number(item.userId) === Number(currentUserId.value)
    
  if (isOwnPost) {
    // 拦截：如果刚好点到了自己在新增列表里的信息，无阻跳 TabBar 个人页
    uni.switchTab({ url: '/pages/user/profile' })
  } else {
    // 导入他人主页（普通多级子页面）
    uni.navigateTo({
      url: `/pages/user/user-home?userId=${item.userId}`,
      fail: (err) => {
        console.error('跳转用户主页失败:', err)
        uni.showToast({ title: '页面开小差了，请重试', icon: 'none' })
      }
    })
  }
}

const goBack = () => uni.navigateBack()
</script>

<style scoped>
/* 拦截压制全平台系统的僵硬滚动痕迹条纹 */
::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  color: transparent;
}

/* 软糯果冻级按压缩放阻尼缓动原子机制 */
.bouncy-btn:active {
  transform: scale(0.96);
  transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 弥散阴影大基板 */

/* 模糊毛玻璃滤镜头部 */
.glass-header {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* 标志性棉花糖贴纸白描外高光发光边 */

/* 淡化淡入特效 */
.animate-fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12rpx); }
  to { opacity: 1; transform: translateY(0); }
}
</style>