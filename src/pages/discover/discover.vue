<template>
  <view class="bg-background font-body-lg text-on-surface antialiased min-h-screen pb-24 flex flex-col">
    
    <view class="fixed top-0 left-0 w-full z-50 bg-surface/80 backdrop-blur-xl flex items-center px-margin-page border-b border-primary/5 shadow-[0_4px_20px_rgba(155,64,83,0.05)]" 
          :style="{ paddingTop: statusBarHeight + 'px', height: (statusBarHeight + 54) + 'px' }">
      <view class="flex-1 flex justify-start">
        <view class="w-10 h-10 flex items-center justify-center rounded-full bg-primary-container/10 text-primary active:scale-90 transition-transform bouncy-press" @click="goToSearch">
          <text class="material-symbols-outlined text-[48rpx]">search</text>
        </view>
      </view>
      <text class="font-headline-md text-headline-md text-primary font-bold tracking-tight">发现</text>
      <view class="flex-1 flex justify-end">
        <view class="w-[90px]"></view> </view>
    </view>

    <scroll-view
      class="flex-1 px-margin-page"
      scroll-y
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="loadMore"
      :style="{ marginTop: (statusBarHeight + 64) + 'px' }"
    >
      <view class="relative w-full h-[256rpx] mystery-gradient rounded-[48rpx] mb-4 mt-2 overflow-hidden custom-shadow bouncy-press flex items-center px-6" @click="goToLeaderboard">
        <view class="absolute inset-0 shimmer"></view>
        <view class="z-10 flex items-center justify-between w-full">
          <view class="flex items-center gap-4">
            <view class="text-[80rpx] floating">🎁</view>
            <view class="flex flex-col">
              <text class="text-white font-bold text-[36rpx] leading-tight">开启今日高校盲盒</text>
              <text class="text-white/90 text-[24rpx] mt-1">随机掉落外校趣闻</text>
            </view>
          </view>
          <text class="material-symbols-outlined text-white text-[60rpx]">chevron_right</text>
        </view>
      </view>

      <view class="relative z-30 py-3 mb-2">
        <view class="relative flex items-center bg-surface-container-lowest rounded-3xl p-1.5 border border-outline-variant/10 shadow-sm overflow-hidden">
          <scroll-view scroll-x class="w-full no-scrollbar pr-8" :show-scrollbar="false">
            <view class="flex gap-2 px-1 items-center">
              <view
                v-for="(item, index) in categoryTabs"
                :key="index"
                @click="switchTab(index)"
                class="px-4 py-2 rounded-full text-label-md flex-shrink-0 bouncy-press whitespace-nowrap transition-all border-none flex items-center"
                :class="currentTab === index ? 'bg-primary text-white shadow-sm' : 'bg-surface-container text-on-surface-variant'"
              >
                <text v-if="item === '跨校漫游' && currentTab === index" class="material-symbols-outlined text-[28rpx] mr-1">explore</text>
                {{ item }}
              </view>
            </view>
          </scroll-view>

          <view class="absolute right-2 top-0 bottom-0 flex items-center text-primary bouncy-press z-10"
                @click="toggleDropdown"
          >
            <text class="material-symbols-outlined transition-transform duration-300 text-[42rpx]"
                  :class="[showDropdownPanel ? 'rotate-90' : 'rotate-0']"
            >chevron_right</text>
          </view>
        </view>

        <view v-if="showDropdownPanel" class="bg-surface-container-lowest rounded-3xl p-4 border border-outline-variant/10 shadow-sm mt-2 animate-fade-in z-40 relative"
        >
          <text class="text-on-surface-variant text-label-sm mb-3 px-2">全部频道</text>
          <view class="grid grid-cols-4 gap-2">
            <view
              v-for="(item, index) in categoryTabs"
              :key="'panel-'+index"
              @click="switchTabFromPanel(index)"
              class="bg-surface-container-high py-3 rounded-2xl text-label-sm text-on-surface border-none bouncy-press flex items-center justify-center"
              :class="currentTab === index ? 'bg-primary/10 text-primary font-bold' : ''"
            >
              {{ item }}
            </view>
          </view>
        </view>
      </view>

      <view class="space-y-gutter-card pb-10" v-if="postList.length > 0">
        <view class="bg-white rounded-[64rpx] dashed-border custom-shadow p-padding-inner mb-4" 
              v-for="post in postList" :key="post.id" @click="goToPostDetail(post)">
          
          <view class="flex flex-col gap-3">
            <view class="flex items-center gap-2 self-start" v-if="post.location">
              <view class="flex items-center gap-1 px-3 py-1 bg-surface-container-low border border-primary-fixed-dim rounded-full">
                <text class="material-symbols-outlined text-primary text-[28rpx]">location_on</text>
                <text class="text-[22rpx] font-bold text-primary">{{ post.location }}</text>
              </view>
            </view>

            <view class="flex items-center justify-between" @click.stop="goToUserHome(post)">
              <view class="flex items-center gap-3">
                <image class="w-10 h-10 rounded-full border-2 border-white shadow-sm" mode="aspectFill" lazy-load 
                       :src="post.isAnonymous ? defaultAvatar : (post.avatar || defaultAvatar)"></image>
                <view class="flex flex-col">
                  <view class="flex items-center gap-1">
                    <text class="font-bold text-[28rpx] text-on-surface">{{ post.isAnonymous ? '匿名用户' : (post.author || '匿名用户') }}</text>
                    <text class="material-symbols-outlined text-[#4A90E2] text-[28rpx]" v-if="!post.isAnonymous && post.gender === 1">male</text>
                    <text class="material-symbols-outlined text-[#E91E8C] text-[28rpx]" v-else-if="!post.isAnonymous && post.gender === 2">female</text>
                  </view>
                  <text class="text-[20rpx] text-on-surface-variant">{{ formatTime(post.createTime) }}</text>
                </view>
              </view>
              <view class="text-on-surface-variant bouncy-press p-1" @click.stop="openReportPopup(post)">
                <text class="material-symbols-outlined text-[40rpx]">more_horiz</text>
              </view>
            </view>

            <text class="text-body-lg text-on-surface leading-relaxed block">{{ post.content }}</text>

            <view v-if="post.images && post.images.length > 0" class="grid gap-2 rounded-2xl overflow-hidden mt-1"
                  :class="{
                    'grid-cols-1': post.images.length === 1,
                    'grid-cols-2': post.images.length === 2 || post.images.length === 4,
                    'grid-cols-3': post.images.length === 3 || post.images.length >= 5
                  }">
              <image
                v-for="(img, idx) in post.images"
                :key="idx"
                :src="img"
                mode="aspectFill"
                lazy-load
                class="w-full object-cover"
                :class="post.images.length === 1 ? 'h-[400rpx]' : 'aspect-square'"
                @click.stop="previewImage(post.images, idx)"
              ></image>
            </view>

            <view class="flex flex-wrap gap-2 mt-2" v-if="post.tags && post.tags.length > 0">
              <text class="text-[24rpx] text-primary bg-primary-container/20 px-3 py-1 rounded-md" v-for="(tag, idx) in post.tags" :key="idx">
                #{{ tag }}
              </text>
            </view>

            <view class="flex justify-between items-center mt-3 pt-3 border-t border-surface-variant/50">
              <view class="flex items-center gap-6">
                <view class="flex items-center gap-1 text-on-surface-variant/70 bouncy-press">
                  <text class="material-symbols-outlined text-[40rpx]">visibility</text>
                  <text class="text-[24rpx]">{{ post.viewCount || 0 }}</text>
                </view>
                <view class="flex items-center gap-1 bouncy-press" :class="post.isLiked ? 'text-primary' : 'text-on-surface-variant'" @click.stop="handleLike(post)">
                  <text class="material-symbols-outlined text-[40rpx]" :style="post.isLiked ? 'font-variation-settings:\'FILL\' 1' : ''">favorite</text>
                  <text class="text-[24rpx]">{{ post.likeCount || 0 }}</text>
                </view>
                <view class="flex items-center gap-1 text-on-surface-variant bouncy-press" @click.stop="goToComments(post.id)">
                  <text class="material-symbols-outlined text-[40rpx]">chat_bubble</text>
                  <text class="text-[24rpx]">{{ post.commentCount || 0 }}</text>
                </view>
              </view>
              <view class="material-symbols-outlined text-on-surface-variant bouncy-press text-[40rpx]" @click.stop="openSharePopup(post)">share</view>
            </view>

          </view>
        </view>
      </view>

      <view class="flex flex-col items-center justify-center py-24" v-else-if="!loading">
        <text class="text-[120rpx] mb-4 opacity-70">📭</text>
        <text class="text-[28rpx] text-on-surface-variant">暂无跨校帖子，快去发布第一条吧～</text>
      </view>

      <view class="text-center py-8 text-on-surface-variant text-[24rpx]" v-if="loading">
        <text>加载中...</text>
      </view>
      <view class="text-center py-8 text-outline-variant text-[24rpx]" v-else-if="noMore && postList.length > 0">
        <text>- 漫游的尽头 -</text>
      </view>

    </scroll-view>

    <view class="fixed bottom-28 right-6 w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-full text-white shadow-[0_8px_24px_rgba(155,64,83,0.3)] flex items-center justify-center z-40 border-2 border-white bouncy-press" @click="handlePublish">
      <text class="material-symbols-outlined text-[64rpx]">add</text>
      <view class="absolute -top-1 -right-1 text-[24rpx]">✨</view>
    </view>

    <!-- 举报面板 -->
    <view class="fixed inset-0 bg-black/40 z-[1000] backdrop-blur-sm transition-opacity" v-if="showReport" @click="closeReportPopup"></view>

    <view class="fixed bottom-0 left-0 w-full bg-surface rounded-t-[80rpx] z-[1001] transition-transform duration-300 ease-out px-margin-page pb-12 pt-8"
          :class="showReport ? 'translate-y-0' : 'translate-y-full'" @click.stop>
      <view class="w-12 h-1.5 bg-outline-variant/30 rounded-full mx-auto mb-8"></view>

      <view class="w-full mt-2 py-4 bg-error-container text-center rounded-full font-headline-md text-headline-md text-on-error bouncy-press flex items-center justify-center gap-2" @click="handleReport">
        <text class="material-symbols-outlined text-[32rpx]">report</text>
        <text>举报该帖</text>
      </view>
      <view class="w-full mt-3 py-4 bg-surface-container rounded-full font-headline-md text-headline-md text-on-surface-variant bouncy-press text-center" @click="closeReportPopup">
        取消
      </view>
    </view>

    <!-- 分享面板 -->
    <view class="fixed inset-0 bg-black/40 z-[1000] backdrop-blur-sm transition-opacity" v-if="showShare" @click="closeSharePopup"></view>

    <view class="fixed bottom-0 left-0 w-full bg-surface rounded-t-[80rpx] z-[1001] transition-transform duration-300 ease-out px-margin-page pb-12 pt-8"
          :class="showShare ? 'translate-y-0' : 'translate-y-full'" @click.stop>
      <view class="w-12 h-1.5 bg-outline-variant/30 rounded-full mx-auto mb-8"></view>
      <view class="font-headline-lg text-headline-lg text-center mb-8 block font-bold">分享瞬间 ✨</view>

      <view class="flex justify-around gap-4 text-center mb-8">
        <view class="flex flex-col items-center gap-2 bouncy-press" @click="handleShareAction('wechat')">
          <view class="w-16 h-16 bg-[#07C160] rounded-[32rpx] flex items-center justify-center text-white shadow-md">
            <text class="material-symbols-outlined text-[64rpx]">chat</text>
          </view>
          <text class="font-label-md text-label-md">微信好友</text>
        </view>
        <view class="flex flex-col items-center gap-2 bouncy-press" @click="handleShareAction('poster')">
          <view class="w-16 h-16 bg-[#ff8fa3] rounded-[32rpx] flex items-center justify-center text-white shadow-md">
            <text class="material-symbols-outlined text-[64rpx]">image</text>
          </view>
          <text class="font-label-md text-label-md">生成海报</text>
        </view>
        <view class="flex flex-col items-center gap-2 bouncy-press" @click="handleShareAction('moments')">
          <view class="w-16 h-16 bg-[#6d4ea2] rounded-[32rpx] flex items-center justify-center text-white shadow-md">
            <text class="material-symbols-outlined text-[64rpx]">camera</text>
          </view>
          <text class="font-label-md text-label-md">朋友圈</text>
        </view>
      </view>

      <view class="w-full mt-6 py-4 bg-surface-container rounded-full font-headline-md text-headline-md text-on-surface-variant bouncy-press text-center" @click="closeSharePopup">
        取消
      </view>
    </view>

  <CustomTabBar :current="1" />
    </view>
<view class="h-[160rpx]"></view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { get, post } from '@/utils/request.js'
import { postApi, discoverApi } from '@/api/index.js'
import { useInteractionStore } from '@/stores/interaction'
import { useAuthGuard } from '@/composables/useAuthGuard'
import { formatTimeAgo } from '@/composables/useTimeAgo'
import { useUserStore } from '@/stores/user'

// 状态栏高度
const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight || 20)
const defaultAvatar = '/static/images/anonymous-avatar.png'

// 帖子列表
const postList = ref([])

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const noMore = ref(false)
const refreshing = ref(false)

// 分类 Tabs
const currentTab = ref(0)
const categoryTabs = ref(['推荐', '跨校漫游', '树洞', '找搭子', '社团活动'])

// 弹窗
const showShare = ref(false)
const showReport = ref(false)
const currentSharePost = ref(null)

// 频道下拉面板
const showDropdownPanel = ref(false)

const toggleDropdown = () => {
  showDropdownPanel.value = !showDropdownPanel.value
}

// 当前用户
const userStore = useUserStore()
const currentUserId = ref(userStore.userId || null)
const interaction = useInteractionStore()
const { requireLogin } = useAuthGuard()

// ==================== 频道 ====================

const fetchChannels = async () => {
  try {
    const response = await get(discoverApi.getChannels().url)
    if (response.data && response.data.length > 0) {
      const channelNames = response.data.map(item => item.name)
      categoryTabs.value = ['推荐', '跨校漫游', ...channelNames]
    }
  } catch (error) {
    console.error('获取发现页频道失败，使用默认频道:', error)
  }
}

// ==================== 帖子列表 ====================

const fetchPostList = async (isLoadMore = false) => {
  if (loading.value && !isLoadMore) return
  loading.value = true

  try {
    const page = isLoadMore ? currentPage.value + 1 : 1
    const category = currentTab.value === 0 ? '' : categoryTabs.value[currentTab.value]

    const params = {
      page,
      size: pageSize.value,
      category,
      scope: 1  // 跨校帖子
    }

    console.log('🔍 发现页请求帖子:', params)
    const apiConfig = postApi.getPostList(params)
    const response = await get(apiConfig.url, params)

    const data = response.data || {}
    const records = data.records || []

    const formattedData = records.map(item => {
      const cachedLike = interaction.getPostLikeState(item.id)
      const cachedCollect = interaction.getPostCollectState(item.id)

      return {
        id: item.id,
        userId: item.userId,
        author: item.author || '匿名用户',
        avatar: item.avatar || defaultAvatar,
        gender: item.gender,
        createTime: item.createTime,
        content: item.content,
        images: item.images || [],
        tags: item.tags || [],
        location: item.location || '',
        likeCount: cachedLike?.likeCount ?? item.likeCount ?? 0,
        commentCount: item.commentCount || 0,
        viewCount: item.viewCount || 0,
        isLiked: cachedLike?.isLiked ?? item.isLiked ?? false,
        isCollected: cachedCollect?.isCollected ?? item.isCollected ?? false,
        isAnonymous: item.isAnonymous || false,
        // 板块差异化字段
        boardCode: item.boardCode || '',
        price: item.price,
        salary: item.salary,
        infoFee: item.infoFee,
        contact: item.contact,
        bannerImage: item.bannerImage || '',
        isTop: item.isTop || 0,
        isSold: item.isSold || 0,
        memberAvatars: item.memberAvatars || [],
        memberCount: item.memberCount || 0,
        maxMembers: item.maxMembers || null,
        hasJoined: item.hasJoined || false
      }
    })

    if (isLoadMore) {
      postList.value = [...postList.value, ...formattedData]
      currentPage.value = page
    } else {
      postList.value = formattedData
      currentPage.value = 1
    }

    noMore.value = data.current >= data.pages || records.length < pageSize.value

  } catch (error) {
    console.error('加载帖子失败:', error)
    uni.showToast({ title: '加载失败，请重试', icon: 'none' })
  } finally {
    loading.value = false
  }
}

// ==================== 下拉刷新 / 上拉加载 ====================

const onRefresh = async () => {
  refreshing.value = true
  noMore.value = false
  try {
    await fetchPostList(false)
  } finally {
    refreshing.value = false
  }
}

const loadMore = () => {
  if (loading.value || noMore.value) return
  fetchPostList(true)
}

const switchTab = (index) => {
  if (currentTab.value === index) return
  currentTab.value = index
  noMore.value = false
  fetchPostList(false)
}

// 从下拉面板选择：避免 inline handler 返回 false 触发 tap 警告
const switchTabFromPanel = (index) => {
  switchTab(index)
  showDropdownPanel.value = false
}

// ==================== 点赞 ====================

const handleLike = async (postItem) => {
  if (!requireLogin()) return
  try {
    const result = await interaction.togglePostLike(postItem.id, postItem.likeCount, postItem.isLiked)
    postItem.isLiked = result.isLiked
    postItem.likeCount = result.likeCount
    if (result.isLiked) uni.vibrateShort()
  } catch {
    uni.showToast({ title: '操作失败，请重试', icon: 'none' })
  }
}

// ==================== 收藏 ====================

const handleCollect = async (postItem) => {
  if (!requireLogin()) return
  try {
    const result = await interaction.togglePostCollect(postItem.id)
    postItem.isCollected = result.isCollected
  } catch {
    uni.showToast({ title: '操作失败，请重试', icon: 'none' })
  }
}

// ==================== 分享 ====================

const openSharePopup = (post) => {
  currentSharePost.value = post
  showShare.value = true
}

const closeSharePopup = () => {
  showShare.value = false
  currentSharePost.value = null
}

const openReportPopup = (post) => {
  currentSharePost.value = post
  showReport.value = true
}

const closeReportPopup = () => {
  showReport.value = false
  currentSharePost.value = null
}

const handleShareAction = (type) => {
  uni.showToast({ title: '分享功能开发中', icon: 'none', duration: 1500 })
  closeSharePopup()
}

const handleReport = () => {
  const targetPost = currentSharePost.value
  if (!targetPost) return
  closeReportPopup()
  uni.showActionSheet({
    title: '选择举报原因',
    itemList: ['色情低俗', '广告营销', '人身攻击', '违法违规', '其他'],
    success: async (res) => {
      const reasons = ['色情低俗', '广告营销', '人身攻击', '违法违规', '其他']
      const reason = reasons[res.tapIndex]
      try {
        const apiConfig = postApi.reportPost(targetPost.id, { reason })
        await post(apiConfig.url, { reason })
        uni.showToast({ title: '举报成功，我们会尽快处理', icon: 'none' })
      } catch (error) {
        console.error('举报失败:', error)
        uni.showToast({ title: '举报提交失败，请重试', icon: 'none' })
      }
    }
  })
}

// ==================== 导航 ====================

const goToSearch = () => {
  uni.navigateTo({
    url: '/pages/search/search',
    fail: (err) => {
      console.error('跳转搜索页失败:', err)
      uni.showToast({ title: '页面跳转失败', icon: 'none' })
    }
  })
}

const goToPostDetail = (post) => {
  if (!post || !post.id) return

  const item = postList.value.find(p => p.id === post.id)
  if (item) item.viewCount = (item.viewCount || 0) + 1

  const apiConfig = postApi.incrementViewCount(post.id)
  post(apiConfig.url).catch(err => console.error('增加浏览量失败:', err))

  uni.navigateTo({
    url: `/pages/post/detail?id=${post.id}`,
    fail: (err) => {
      console.error('跳转详情失败:', err)
      uni.showToast({ title: '页面跳转失败', icon: 'none' })
    }
  })
}

const goToComments = (postId) => {
  uni.navigateTo({
    url: `/pages/post/detail?id=${postId}&tab=comments`
  })
}

const goToUserHome = (post) => {
  if (!post) return
  if (post.isAnonymous) {
    return uni.showToast({ title: '洞主很神秘，主页不可见哦~', icon: 'none' })
  }
  const targetUserId = post.userId
  if (!targetUserId) {
    return uni.showToast({ title: '用户信息走丢了', icon: 'none' })
  }

  const currentUid = currentUserId.value
  if (!currentUid) {
    return uni.showToast({ title: '请先登录后查看用户主页', icon: 'none' })
  }

  if (Number(targetUserId) === Number(currentUid)) {
    uni.switchTab({ url: '/pages/user/profile' })
  } else {
    uni.navigateTo({
      url: `/pages/user/user-home?userId=${targetUserId}`,
      fail: () => uni.showToast({ title: '页面开小差了,请重试', icon: 'none' })
    })
  }
}

const goToLeaderboard = () => {
  uni.navigateTo({
    url: '/pages/leaderboard/leaderboard?scope=1',
    fail: (err) => {
      console.error('跳转排行榜失败:', err)
      uni.showToast({ title: '排行榜开发中', icon: 'none' })
    }
  })
}

const handlePublish = () => {
  const token = uni.getStorageSync('token')
  if (!token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  // 标记从发现页发布（跨校帖）
  uni.setStorageSync('publishScope', 1)
  uni.navigateTo({ url: '/pages/publish/publish' })
}

// ==================== 工具 ====================

const formatTime = formatTimeAgo

const previewImage = (images, currentIndex) => {
  uni.previewImage({ urls: images, current: currentIndex })
}

// ==================== 生命周期 ====================

onLoad(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 20
  fetchChannels()
  fetchPostList()
})

onShow(() => {
  const hasNewPost = uni.getStorageSync('hasNewPost')
  if (hasNewPost) {
    uni.removeStorageSync('hasNewPost')
    fetchPostList(false)
  }

  const uid = userStore.userId
  if (uid && uid !== currentUserId.value) {
    currentUserId.value = uid
    fetchPostList(false)
  }
})
</script>

<style scoped>
/* 隐藏原生滚动条 */
.no-scrollbar::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  color: transparent;
}

/* 按钮点击回弹效果 */
.bouncy-press:active {
  transform: scale(0.95);
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 盲盒流光溢彩背景 */
.mystery-gradient {
  background: linear-gradient(135deg, #c5a3ff, #ff8fa3, #86b6db);
  background-size: 200% 200%;
  animation: gradientMove 6s ease infinite;
}
@keyframes gradientMove {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* 盲盒高光扫过动画 */
.shimmer {
  background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%);
  background-size: 200% 100%;
  animation: shimmer 3s infinite;
}
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* 图标呼吸悬浮动画 */
.floating {
  animation: floating 3s ease-in-out infinite;
}
@keyframes floating {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10rpx); }
  100% { transform: translateY(0px); }
}

/* 虚线边框设计 */
.dashed-border {
  border: 4rpx dashed #dac0c3;
}

/* 柔和彩色弥散阴影 */
.custom-shadow {
  box-shadow: 0 24rpx 80rpx rgba(255, 143, 163, 0.12);
}

/* 淡入动画 */
.animate-fade-in {
  animation: fadeIn 0.3s ease both;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8rpx); }
  to { opacity: 1; transform: translateY(0); }
}
</style>