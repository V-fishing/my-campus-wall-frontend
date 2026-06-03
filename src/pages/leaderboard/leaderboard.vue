<template>
  <view class="bg-[#fef8f8] min-h-screen flex flex-col relative selection:bg-primary-container">
    
    <header class="fixed top-0 w-full z-50 bg-[#fef8f8]/90 backdrop-blur-md flex items-end justify-between px-margin-page h-[88px] pb-4 border-b border-dashed border-outline-variant/20 shadow-sm">
      <view class="bouncy-tap h-10 w-10 flex items-center justify-start text-primary p-1 -ml-1" @click="goBack">
        <text class="material-symbols-outlined text-[48rpx]">arrow_back</text>
      </view>
      <h1 class="flex-1 text-center font-headline-lg text-primary font-bold text-[36rpx]">人气榜单 ✨</h1>
      <view class="w-10"></view>
    </header>

    <scroll-view class="w-full flex-1" scroll-y :style="{ height: 'calc(100vh - 88px)', marginTop: '88px' }">
      
      <section class="midnight-dream-gradient h-[180px] w-full flex flex-col items-center justify-center relative px-margin-page overflow-hidden shrink-0">
        <text class="material-symbols-outlined absolute bottom-10 right-12 text-white/10 text-[48rpx] animate-bounce-short">auto_awesome</text>
        
        <view class="flex items-center gap-4 mb-4 mt-2">
          <view class="bg-primary-container w-14 h-14 rounded-[40rpx] flex items-center justify-center fire-glow shadow-md">
            <text class="material-symbols-outlined text-on-primary-container text-[64rpx]" style="font-variation-settings: 'FILL' 1;">local_fire_department</text>
          </view>
          <view class="flex flex-col">
            <text class="text-white font-bold text-[44rpx] tracking-tight">人气帖子榜</text>
            <text class="text-white/60 text-[24rpx] font-medium mt-0.5">按浏览量实时更新排序</text>
          </view>
        </view>
        
        <div class="flex gap-3 mb-2">
          <div class="bg-secondary-fixed/95 px-5 py-2 rounded-full flex items-center gap-2 shadow-lg">
            <text class="text-on-secondary-fixed text-[24rpx] font-bold">总浏览量</text>
            <text class="text-primary font-black text-[28rpx]">{{ formatNumber(totalViews) }}</text>
          </div>
          <div class="bg-tertiary-fixed/95 px-5 py-2 rounded-full flex items-center gap-2 shadow-lg">
            <text class="text-on-tertiary-fixed text-[24rpx] font-bold">上榜动态</text>
            <text class="text-tertiary font-black text-[28rpx]">{{ leaderboardList.length }}</text>
          </div>
        </div>
      </section>

      <view class="px-margin-page -mt-6 relative z-10 space-y-gutter-card pb-12 mx-auto w-full">
        
        <view class="text-center py-20" v-if="loading && leaderboardList.length === 0">
          <text class="material-symbols-outlined animate-spin text-primary text-[56rpx]">sync</text>
          <text class="block text-outline-variant mt-2 text-[24rpx]">正在从云端调阅人气风云榜...</text>
        </view>

        <view class="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[40rpx] border-2 border-dashed border-outline-variant/60 kawaii-shadow" v-else-if="leaderboardList.length === 0">
          <text class="material-symbols-outlined text-[100rpx] text-outline-variant mb-2">📊</text>
          <text class="font-headline-md text-[28rpx] text-outline font-bold">暂无今日排行数据</text>
        </view>

        <view v-else class="space-y-4">
          <view v-for="(post, index) in leaderboardList" :key="post.id" @click="goToDetail(post.id)"
                class="bg-white rounded-[48rpx] p-5 flex gap-4 relative transition-all active:scale-[0.99] w-full"
                :class="index <= 2 ? 'kawaii-shadow dashed-border-card' : 'bg-white/60 rounded-[40rpx] dashed-border-card opacity-95'">
            
            <view class="flex flex-col items-center justify-center min-w-[96rpx] shrink-0">
              <view class="medal-bubble w-11 h-11 border-[3rpx] border-white" :class="index <= 2 ? 'shadow-md' : 'bg-surface-container-high/60 shadow-inner rounded-2xl'">
                <text class="text-3xl sticker-stroke" v-if="index === 0">🥇</text>
                <text class="text-3xl sticker-stroke" v-else-if="index === 1">🥈</text>
                <text class="text-3xl sticker-stroke" v-else-if="index === 2">🥉</text>
                <text class="text-[30rpx] font-black text-outline/60" v-else>{{ index + 1 }}</text>
              </view>
            </view>

            <view class="relative flex-1 flex gap-3 min-w-0">
              <view class="w-1.5 rounded-full view-bar-glow shrink-0 self-stretch relative overflow-hidden bg-surface-container" v-if="maxViews > 0">
                <view class="absolute bottom-0 left-0 w-full rounded-full bg-gradient-to-t from-[#86b6db] to-[#4A90E2]" 
                      :style="{ height: (post.viewCount / maxViews * 100) + '%' }"></view>
              </view>
              
              <view class="flex-1 min-w-0">
                <text class="font-bold text-on-surface text-[32rpx] leading-snug mb-3 line-clamp-2 block">{{ post.content }}</text>
                
                <view class="flex gap-2 mb-3" v-if="post.images && post.images.length > 0">
                  <image v-for="(img, i) in post.images.slice(0, 3)" :key="i" :src="img" mode="aspectFill" 
                         class="w-16 h-16 rounded-[24rpx] object-cover bg-surface-container border border-outline-variant/10 shadow-inner"
                         @click.stop="previewImage(post.images, i)" />
                </view>
                
                <view class="flex justify-between items-center w-full pt-1">
                  <view class="flex items-center gap-2 min-w-0">
                    <image class="w-6 h-6 rounded-full border border-primary-container shrink-0 bg-surface-container-low" :src="post.avatar || defaultAvatar" mode="aspectFill"></image>
                    <text class="text-[24rpx] text-on-surface-variant font-medium truncate max-w-[160rpx]">{{ post.isAnonymous ? '匿名用户' : (post.author || '神秘洞主') }}</text>
                  </view>
                  
                  <view class="flex items-center gap-3 text-[24rpx] font-bold shrink-0">
                    <view class="flex items-center gap-1 text-tertiary">
                      <text class="material-symbols-outlined text-[30rpx]">visibility</text>
                      <text>{{ formatNumber(post.viewCount) }}</text>
                    </view>
                    <view class="flex items-center gap-1 text-primary">
                      <text class="material-symbols-outlined text-[30rpx]">favorite</text>
                      <text>{{ formatNumber(post.likeCount) }}</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>

          </view>
        </view>

        <view class="flex flex-col items-center justify-center py-12 opacity-30">
          <text class="material-symbols-outlined text-primary text-5xl mb-2">auto_awesome</text>
          <text class="font-label-md font-bold text-[24rpx]">你已经刷到全校榜单的宇宙尽头啦 ~</text>
        </view>

      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { get } from '@/utils/request.js'
import { postApi } from '@/api/index.js'

const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight || 20)
const defaultAvatar = '/static/images/anonymous-avatar.png'
const leaderboardList = ref([])
const loading = ref(false)

// 挂载接驳
onLoad((options) => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 20
  
  const scope = options && options.scope ? Number(options.scope) : null
  fetchLeaderboard(scope)
})

// 异步拉取排行数据核心引擎
const fetchLeaderboard = async (scope) => {
  loading.value = true
  try {
    const apiConfig = postApi.getLeaderboard(20, scope)
    const response = await get(apiConfig.url, { limit: 20, ...(scope !== null && scope !== undefined ? { scope } : {}) })

    if (response.code === 200 && response.data) {
      leaderboardList.value = response.data.map(item => ({
        id: item.id,
        author: item.author || '匿名用户',
        avatar: item.avatar || defaultAvatar,
        createTime: item.createTime,
        content: item.content,
        images: item.images || [],
        tags: item.tags || [],
        viewCount: item.viewCount || 0,
        likeCount: item.likeCount || 0,
        commentCount: item.commentCount || 0,
        isAnonymous: item.isAnonymous || false
      }))
    }
  } catch (error) {
    console.error('❌ 拉取排行榜数据异常:', error)
    uni.showToast({ title: '加载榜单失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

// 计算当前列表最大峰值与总体计数看板
const maxViews = computed(() => {
  if (leaderboardList.value.length === 0) return 0
  return Math.max(...leaderboardList.value.map(p => p.viewCount))
})

const totalViews = computed(() => {
  return leaderboardList.value.reduce((sum, p) => sum + (p.viewCount || 0), 0)
})

// 智能大数压缩器（如 12.5k / 2.3w）
const formatNumber = (num) => {
  if (!num) return '0'
  if (num >= 10000) return (num / 10000).toFixed(1) + 'w'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
  return String(num)
}

const goToDetail = (postId) => {
  if (!postId) return
  uni.navigateTo({ url: `/pages/post/detail?id=${postId}` })
}

const previewImage = (images, currentIndex) => {
  uni.previewImage({ urls: images, current: currentIndex })
}

const goBack = () => uni.navigateBack()
</script>

<style scoped>
/* 强力隔离隐藏底层系统滚动条痕迹 */
::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  color: transparent;
}

/* 软糯按压阻尼感反馈机制 */
.bouncy-tap:active {
  transform: scale(0.96);
  transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 弥散阴影大基板 */
.bouncy-shadow {
  box-shadow: 0 12rpx 40rpx rgba(255, 143, 163, 0.1);
}

/* 手账虚线裁切外边框 */
.dashed-border-card {
  border: 4rpx dashed #dac0c3;
}

/* 火焰气泡流光溢彩 */
.fire-glow {
  filter: drop-shadow(0 0 12rpx rgba(255, 143, 163, 0.6));
}

/* 勋章独立悬浮圆形容器 */
.medal-bubble {
  background: #ffffff;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.04);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88rpx;
  height: 88rpx;
}

/* 渐变长条发光遮罩 */
.view-bar-glow {
  background: linear-gradient(to bottom, #86b6db, rgba(134, 182, 219, 0.05));
  box-shadow: 0 0 8rpx rgba(134, 182, 219, 0.2);
}

/* 沉浸式极光梦夜渐变色盘盘口 */
.midnight-dream-gradient {
  background: linear-gradient(180deg, #3a3a7b 0%, #2a1b3d 100%);
}

/* 规律性浮动微动效指引 */
.animate-bounce-short {
  animation: bounceShort 2s infinite ease-in-out;
}
@keyframes bounceShort {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6rpx); }
}

/* 限制多行文字裁剪 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

/* 贴纸文字白描高光外边缘 */
.sticker-stroke {
  filter: drop-shadow(0 0 2rpx #ffffff);
}
</style>