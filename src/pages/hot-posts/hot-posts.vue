<template>
  <view class="bg-[#fef8f8] min-h-screen pb-8 selection:bg-primary-container">

    <header class="fixed top-0 w-full z-50 bg-surface/85 backdrop-blur-md flex flex-col h-[88px]">
      <view class="h-[44px] w-full"></view>
      <view class="flex items-center justify-between px-margin-page h-[44px] relative w-full">
        <view class="flex items-center w-[40px] relative z-10 text-primary bouncy-tap p-1" @click="goBack">
          <text class="material-symbols-outlined text-[48rpx]">arrow_back</text>
        </view>
        <view class="absolute inset-0 flex items-center justify-center">
          <h1 class="font-headline-lg-mobile text-[36rpx] text-primary font-bold">热帖榜单 ✨</h1>
        </view>
        <view class="w-[90px] relative z-10"></view>
      </view>
    </header>

    <section class="candy-header-v2 w-full flex items-center px-margin-page relative overflow-hidden rounded-b-[80rpx] shadow-sm pt-[88px] min-h-[360rpx] pb-6 flex-col justify-center shrink-0">
      <view class="z-10 flex items-center gap-4 mx-auto mt-4">
        <view class="bg-white/40 p-3 rounded-[32rpx] backdrop-blur-md shadow-lg border border-white/50 animate-bounce-short">
          <text class="text-[88rpx] drop-shadow-sm">🏆</text>
        </view>
        <view class="flex flex-col">
          <h2 class="text-on-primary-container font-headline-lg text-[44rpx] font-bold leading-tight flex items-center gap-1">热帖榜单 <span>🔥</span></h2>
          <p class="text-on-primary-container/80 text-[24rpx] font-medium tracking-wide mt-1">实时热度排行 · 自动过期</p>
        </view>
      </view>
      <text class="material-symbols-outlined absolute right-[-20rpx] top-[-10rpx] text-white/20 text-[160rpx] rotate-12">stars</text>
      <text class="material-symbols-outlined absolute left-1/4 bottom-[-30rpx] text-white/10 text-[112rpx] blur-[1px]">favorite</text>
    </section>

    <!-- 周期 Tab -->
    <view class="px-margin-page mt-4">
      <view class="flex p-1 bg-surface-container-low rounded-full">
        <view v-for="tab in periodTabs" :key="tab.value"
              class="flex-1 py-2 rounded-full text-center text-[26rpx] font-bold transition-all bouncy-tap"
              :class="currentPeriod === tab.value ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant'"
              @click="switchPeriod(tab.value)">
          {{ tab.label }}
        </view>
      </view>
    </view>

    <scroll-view class="w-full flex-1" scroll-y :style="{ height: 'calc(100vh - 360rpx - 80rpx)' }">
      <view class="px-4 space-y-5 pt-4 pb-12 w-full flex flex-col items-center">

        <view v-for="(item, index) in hotPosts.slice(0, 3)" :key="item.postId" @click="goToDetail(item.postId)"
              class="bg-white rounded-[48rpx] kawaii-shadow sticker-border p-5 flex flex-col gap-3 relative transition-all active:scale-[0.99] w-full">

          <view class="flex gap-3 items-start">
            <view class="rank-mochi w-12 h-12 flex-shrink-0 rounded-[36rpx] flex items-center justify-center border-2 border-white/60"
                  :class="'rank-mochi-' + (index + 1)">
              <text class="text-2xl">{{ index === 0 ? '🥇' : (index === 1 ? '🥈' : '🥉') }}</text>
            </view>
            <view class="flex-1 min-w-0">
              <view class="flex items-center gap-2 mb-1.5">
                <span class="inline-block px-3 py-0.5 rounded-full bg-secondary-container/30 text-on-secondary-container text-[22rpx] font-bold border border-secondary-container/10">
                  {{ item.post?.category || '推荐' }}
                </span>
                <span class="text-[22rpx] font-bold text-error">{{ item.score }}°</span>
              </view>
              <text class="font-bold text-on-surface text-[32rpx] leading-snug line-clamp-2 block">{{ item.post?.content }}</text>
            </view>
          </view>

          <view class="flex gap-2" v-if="item.post?.images && item.post.images.length > 0">
            <image class="w-20 h-20 rounded-2xl object-cover flex-1 bg-surface-container border border-outline-variant/20 shadow-inner"
                   v-for="(img, i) in item.post.images.slice(0, 3)" :key="i" :src="img" mode="aspectFill" />
          </view>

          <view class="flex items-center justify-between mt-1">
            <view class="flex items-center gap-2">
              <view class="w-7 h-7 rounded-full bg-primary-container flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                <image class="w-full h-full object-cover" :src="item.post?.avatar || defaultAvatar" mode="aspectFill" />
              </view>
              <text class="text-on-surface-variant font-label-md text-[24rpx] font-medium max-w-[200rpx] truncate">{{ item.post?.isAnonymous ? '匿名用户' : (item.post?.author || '匿名用户') }}</text>
            </view>
            <view class="flex items-center gap-3 text-on-surface-variant/70 text-[24rpx]">
              <view class="flex items-center gap-1">
                <text class="material-symbols-outlined text-[32rpx]">visibility</text>
                <text class="font-bold">{{ formatCount(item.viewCount) }}</text>
              </view>
              <view class="flex items-center gap-1">
                <text class="material-symbols-outlined text-[32rpx]" style="font-variation-settings: 'FILL' 1;">favorite</text>
                <text class="font-bold">{{ item.likeCount || 0 }}</text>
              </view>
              <view class="flex items-center gap-1">
                <text class="material-symbols-outlined text-[32rpx]">chat_bubble</text>
                <text class="font-bold">{{ item.commentCount || 0 }}</text>
              </view>
            </view>
          </view>

          <text class="absolute -top-2 -right-1 text-2xl rotate-12 drop-shadow-md" v-if="index === 0">✨</text>
          <text class="absolute -bottom-2 -left-2 text-2xl drop-shadow-md" v-if="index === 1">🍦</text>
        </view>

        <view v-for="(item, index) in hotPosts.slice(3)" :key="item.postId" @click="goToDetail(item.postId)"
              class="bg-white rounded-[36rpx] kawaii-shadow sticker-border p-4 flex gap-4 transition-all active:scale-[0.99] items-center w-full">
          <view class="w-11 h-11 bg-surface-container-high flex-shrink-0 rounded-[28rpx] flex items-center justify-center border-2 border-white shadow-sm">
            <text class="text-on-surface-variant font-extrabold text-[28rpx]">{{ index + 4 }}</text>
          </view>
          <view class="flex-1 min-w-0">
            <view class="flex justify-between items-center w-full">
              <text class="font-bold text-on-surface text-[28rpx] truncate flex-1 pr-2">{{ item.post?.content }}</text>
              <text class="text-error text-[22rpx] font-bold mr-2">{{ item.score }}°</text>
            </view>
            <view class="flex items-center gap-3 text-outline text-[22rpx] mt-1">
              <text class="truncate max-w-[200rpx]">{{ item.post?.isAnonymous ? '匿名发布' : (item.post?.author || '神秘洞主') }}</text>
              <text>·</text>
              <view class="flex items-center gap-1">
                <text class="material-symbols-outlined text-[24rpx]">visibility</text>
                <text>{{ formatCount(item.viewCount) }}</text>
              </view>
              <view class="flex items-center gap-1">
                <text class="material-symbols-outlined text-[24rpx]" style="font-variation-settings: 'FILL' 1;">favorite</text>
                <text>{{ item.likeCount || 0 }}</text>
              </view>
            </view>
          </view>
        </view>

        <view class="flex flex-col items-center justify-center py-20 text-center" v-if="hotPosts.length === 0 && !loading">
          <text class="text-[120rpx] block mb-4">📭</text>
          <text class="font-headline-md text-[30rpx] text-outline font-bold">暂无热门贴纸</text>
        </view>

        <view class="text-center py-12" v-if="loading">
          <text class="material-symbols-outlined animate-spin text-primary text-[48rpx]">sync</text>
          <text class="block text-outline-variant mt-2 text-[24rpx]">正在翻阅热度档案馆...</text>
        </view>

      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { get } from '@/utils/request.js'
import { rankApi } from '@/api/index.js'

const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight || 20)
const defaultAvatar = '/static/images/anonymous-avatar.png'
const hotPosts = ref([])
const loading = ref(false)

const periodTabs = [
  { label: '日榜', value: 'day' },
  { label: '周榜', value: 'week' },
  { label: '月榜', value: 'month' }
]
const currentPeriod = ref('day')

onLoad((options) => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 20

  const scope = options && options.scope !== undefined ? Number(options.scope) : 0
  fetchHotPosts(scope)
})

const switchPeriod = (period) => {
  if (currentPeriod.value === period) return
  currentPeriod.value = period
  const scope = uni.getStorageSync('hotPostScope') || 0
  fetchHotPosts(scope)
}

const fetchHotPosts = async (scope) => {
  loading.value = true
  try {
    const response = await get(rankApi.getHotPostRank(currentPeriod.value, 10, scope).url, {
      period: currentPeriod.value,
      limit: 10,
      scope
    })
    if (response.code === 200 && response.data) {
      hotPosts.value = response.data.map(item => ({
        rank: item.rank,
        postId: item.postId,
        score: item.score ? item.score.toFixed(1) : '0.0',
        viewCount: item.viewCount || 0,
        likeCount: item.likeCount || 0,
        commentCount: item.commentCount || 0,
        collectCount: item.collectCount || 0,
        post: item.post ? {
          id: item.post.id,
          author: item.post.author || '匿名用户',
          avatar: item.post.avatar || defaultAvatar,
          createTime: item.post.createTime,
          content: item.post.content,
          images: item.post.images || [],
          tags: item.post.tags || [],
          category: item.post.category || '综合',
          isAnonymous: item.post.isAnonymous || false,
          boardCode: item.post.boardCode || '',
          price: item.post.price,
          salary: item.post.salary,
          infoFee: item.post.infoFee,
          contact: item.post.contact,
          bannerImage: item.post.bannerImage || '',
          isTop: item.post.isTop || 0,
          isSold: item.post.isSold || 0,
          memberAvatars: item.post.memberAvatars || [],
          memberCount: item.post.memberCount || 0,
          maxMembers: item.post.maxMembers || null,
          hasJoined: item.post.hasJoined || false
        } : null
      }))
    }
  } catch (error) {
    console.error('❌ 拉取热榜失败:', error)
    uni.showToast({ title: '加载失败，请重试', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const formatCount = (count) => {
  if (!count) return '0'
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k'
  }
  return count.toString()
}

const goToDetail = (postId) => {
  if (!postId) return
  uni.navigateTo({ url: `/pages/post/detail?id=${postId}` })
}

const goBack = () => uni.navigateBack()
</script>

<style scoped>
/* 拦截所有横向纵向的硬系统边框条纹 */
::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  color: transparent;
}

/* 萌系Q弹纽扣触控回弹 */
.bouncy-tap:active {
  transform: scale(0.95);
  transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 弥散阴影 */
.kawaii-shadow {
  box-shadow: 0 12rpx 40rpx rgba(255, 143, 163, 0.1);
}

/* 棉花糖手账虚线圈 */
.sticker-border {
  border: 4rpx dashed rgba(155, 64, 83, 0.15);
}

/* 核心 Mochi 立体果冻高光特效色盘 */
.rank-mochi {
  box-shadow: inset 0 -4px 6px rgba(0,0,0,0.1), inset 0 4px 6px rgba(255,255,255,0.4), 0 4px 12px rgba(0,0,0,0.08);
}
.rank-mochi-1 { background: #FFD54F; }
.rank-mochi-2 { background: #E0E0E0; }
.rank-mochi-3 { background: #FFB380; }

/* 炫彩渐变大封头板 */
.candy-header-v2 {
  background: linear-gradient(135deg, #FF99A5 0%, #FFD3B6 100%);
}

/* 限制正文文本多行裁剪 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

/* Q弹单次短跳动特效 */
.animate-bounce-short {
  animation: bounceShort 1.2s ease-in-out infinite;
}
@keyframes bounceShort {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8rpx); }
}
</style>
