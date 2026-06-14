<template>
  <view class="bg-[#F4F5F7] min-h-screen relative selection:bg-primary-container">
    <!-- 顶部导航栏 -->
    <view
      class="fixed top-0 left-0 w-full z-50 transition-all duration-300"
      :class="{ 'bg-surface/90 backdrop-blur-md shadow-sm': scrollY > 50 }"
    >
      <view :style="{ height: statusBarHeight + 'px' }"></view>
      <view class="flex items-center px-[32rpx] w-full h-[44px]">
        <view class="flex items-center gap-2">
          <text
            class="material-symbols-outlined active:opacity-70 transition-colors text-[48rpx]"
            :class="scrollY > 50 ? 'text-on-surface' : 'text-white'"
            @click="handleBack"
            >arrow_back</text
          >
          <text
            class="font-headline-md text-[36rpx] font-bold transition-opacity text-on-surface"
            :class="scrollY > 50 ? 'opacity-100' : 'opacity-0'"
            >用户资料</text
          >
        </view>
      </view>
    </view>

    <scroll-view scroll-y class="h-screen w-full" @scroll="onScroll">
      <view v-if="loading" class="min-h-screen flex flex-col items-center justify-center pt-[200rpx]">
        <text class="material-symbols-outlined animate-spin text-primary text-[64rpx]">sync</text>
        <text class="block text-on-surface-variant mt-2 text-[26rpx]">正在翻阅TA的个人档案...</text>
      </view>

      <view
        v-else-if="isAnonymous"
        class="min-h-screen flex flex-col items-center justify-center px-[32rpx] pt-[200rpx]"
      >
        <view class="w-32 h-32 rounded-full bg-surface-container-high flex items-center justify-center mb-4">
          <text class="text-[80rpx]">🤫</text>
        </view>
        <text class="text-[32rpx] text-on-surface font-bold mb-2">该用户选择了匿名发布</text>
        <text class="text-[26rpx] text-outline-variant text-center"
          >由于校园隐私保护政策，无法查看神秘洞主的主页哦~</text
        >
      </view>

      <view v-else-if="userInfo">
        <view class="relative h-[480rpx] w-full overflow-hidden">
          <view class="absolute inset-0 bg-[#F4F5F7] noise-bg"></view>
          <view
            class="absolute top-10 left-10 w-[200rpx] h-[200rpx] bg-white/20 rounded-full blur-2xl bubble-float"
          ></view>
          <view
            class="absolute top-20 right-10 w-[250rpx] h-[250rpx] bg-white/10 rounded-full blur-3xl bubble-float"
            style="animation-delay: 2s"
          ></view>
          <view class="absolute bottom-0 left-0 w-full h-[120rpx] wave-bg"></view>
        </view>

        <view class="relative -mt-[140rpx] px-[32rpx] z-10 space-y-[24rpx] pb-12">
          <!-- 用户信息卡片 -->
          <view class="bg-white/90 backdrop-blur-md rounded-[40rpx] p-[32rpx] border border-white/50">
            <!-- 头像 + 关注/私信 -->
            <view class="flex items-center gap-4 mb-4">
              <view class="relative shrink-0">
                <image
                  :src="userInfo.avatar || defaultAvatar"
                  mode="aspectFill"
                  class="w-[140rpx] h-[140rpx] rounded-full border-[6rpx] border-white object-cover shadow-sm"
                />
                <view
                  v-if="userInfo.college"
                  class="absolute bottom-0 right-0 bg-[#5BA4F0] p-1 rounded-full border-[4rpx] border-white flex items-center justify-center"
                >
                  <text
                    class="material-symbols-outlined text-[24rpx] text-white"
                    style="font-variation-settings: 'FILL' 1"
                    >verified</text
                  >
                </view>
              </view>
              <view class="flex-1 flex items-center justify-end">
                <view
                  class="min-w-[120rpx] h-[64rpx] px-4 rounded-full font-bold text-[26rpx] flex items-center justify-center gap-1 transition-transform active:scale-95 shadow-sm whitespace-nowrap"
                  :class="isFollowed ? 'bg-surface-container-high text-on-surface-variant' : 'bg-primary text-white'"
                  @click="toggleFollow"
                >
                  <text class="material-symbols-outlined text-[28rpx]">{{ isFollowed ? 'check' : 'add' }}</text>
                  <text class="font-bold text-[26rpx]">{{ isFollowed ? '已关注' : '关注' }}</text>
                </view>
                <view
                  class="w-[64rpx] h-[64rpx] ml-[8rpx] rounded-full bg-surface-container-high flex items-center justify-center active:scale-95 transition-transform border border-outline-variant/20"
                  @click="toPrivateMessage"
                >
                  <text class="material-symbols-outlined text-[28rpx] text-on-surface">mail</text>
                </view>
              </view>
            </view>

            <!-- 昵称/性别 -->
            <view class="flex items-center gap-2 mb-2">
              <text class="text-[40rpx] font-bold text-on-surface">{{ userInfo.nickname || '未设置昵称' }}</text>
              <text v-if="userInfo.gender === 1" class="material-symbols-outlined text-[32rpx] text-[#5BA4F0]"
                >male</text
              >
              <text v-else-if="userInfo.gender === 2" class="material-symbols-outlined text-[32rpx] text-[#FF8FA3]"
                >female</text
              >
            </view>

            <!-- 签名 -->
            <view class="flex items-start gap-1 mb-4">
              <text class="material-symbols-outlined text-[26rpx] text-outline mt-0.5">sell</text>
              <text class="text-[26rpx] text-on-surface/70 line-clamp-2">
                {{ userInfo.signature || '这个人很懒，什么都没写~ ✍️' }}
              </text>
            </view>

            <!-- 数据 -->
            <view class="flex items-center gap-6 mb-4">
              <view class="flex items-center gap-1 active:opacity-60 transition-opacity" @click="goToUserPosts">
                <text class="text-[28rpx] font-bold text-on-surface">{{ userInfo.postCount || 0 }}</text>
                <text class="text-[24rpx] text-on-surface-variant">动态</text>
              </view>
              <view class="flex items-center gap-1">
                <text class="text-[28rpx] font-bold text-on-surface">{{ userInfo.likeCount || 0 }}</text>
                <text class="text-[24rpx] text-on-surface-variant">获赞</text>
              </view>
              <view class="flex items-center gap-1">
                <text class="text-[28rpx] font-bold text-on-surface">{{ userInfo.followCount || 0 }}</text>
                <text class="text-[24rpx] text-on-surface-variant">关注</text>
              </view>
              <view class="flex items-center gap-1">
                <text class="text-[28rpx] font-bold text-on-surface">{{ userInfo.fansCount || 0 }}</text>
                <text class="text-[24rpx] text-on-surface-variant">粉丝</text>
              </view>
            </view>

            <!-- 基本信息 -->
            <view
              v-if="userInfo.campus || userInfo.gender === 1 || userInfo.gender === 2 || userInfo.college"
              class="flex flex-wrap gap-3"
            >
              <view
                v-if="userInfo.campus"
                class="flex items-center gap-1 bg-surface-container-low px-3 py-1 rounded-full"
              >
                <text class="material-symbols-outlined text-[24rpx] text-outline">location_on</text>
                <text class="text-[24rpx] text-on-surface-variant">{{ userInfo.campus }}</text>
              </view>
              <view
                v-if="userInfo.gender === 1 || userInfo.gender === 2"
                class="flex items-center gap-1 bg-surface-container-low px-3 py-1 rounded-full"
              >
                <text class="material-symbols-outlined text-[24rpx] text-outline">person</text>
                <text class="text-[24rpx] text-on-surface-variant">{{ genderText }}</text>
              </view>
              <view
                v-if="userInfo.college"
                class="flex items-center gap-1 bg-surface-container-low px-3 py-1 rounded-full"
              >
                <text class="material-symbols-outlined text-[24rpx] text-outline">school</text>
                <text class="text-[24rpx] text-on-surface-variant">{{ userInfo.college }}</text>
              </view>
            </view>
          </view>

          <!-- Ta的动态 -->
          <view>
            <view class="flex items-center justify-between mb-4 px-2">
              <text class="font-headline-md text-[30rpx] font-bold text-on-surface"
                >Ta的动态 <text class="text-primary ml-1">({{ userInfo.postCount || 0 }})</text></text
              >
              <text class="text-outline-variant text-[24rpx] font-bold active:opacity-70" @click="goToUserPosts"
                >查看全部 ›</text
              >
            </view>

            <view class="space-y-4">
              <view
                class="bg-white rounded-[40rpx] p-padding-inner relative overflow-hidden group active:scale-[0.99] transition-transform"
                v-for="post in userPosts"
                :key="post.id"
                @click="goToPostDetail(post.id)"
              >
                <view class="flex justify-between items-start mb-3">
                  <view class="flex items-center gap-2">
                    <image
                      :src="post.isAnonymous ? defaultAvatar : post.avatar || defaultAvatar"
                      mode="aspectFill"
                      class="w-9 h-9 rounded-full bg-secondary-fixed border-2 border-white shadow-sm"
                    />
                    <view>
                      <text class="font-label-md text-[26rpx] text-on-surface font-bold block">{{
                        post.isAnonymous ? '匿名用户' : post.author || '匿名用户'
                      }}</text>
                      <text class="text-[20rpx] text-outline-variant block mt-0.5">{{
                        formatTime(post.createTime)
                      }}</text>
                    </view>
                  </view>
                  <text class="material-symbols-outlined text-outline-variant text-[36rpx]">more_horiz</text>
                </view>

                <text class="text-on-surface text-[28rpx] leading-relaxed block mb-3 line-clamp-3">{{
                  post.content
                }}</text>

                <view class="flex gap-2 mb-[24rpx]" v-if="post.images && post.images.length > 0">
                  <image
                    v-for="(img, idx) in post.images.slice(0, 3)"
                    :key="idx"
                    :src="img"
                    mode="aspectFill"
                    class="w-[180rpx] h-[180rpx] rounded-[24rpx] bg-surface-container-high border-2 border-white shadow-inner"
                  />
                </view>

                <view
                  class="flex items-center gap-[32rpx] pt-3 border-t border-surface-variant/30 text-outline-variant text-[24rpx]"
                >
                  <view class="flex items-center gap-1"
                    ><text class="material-symbols-outlined text-[32rpx]">visibility</text
                    ><text>{{ post.viewCount || 0 }}</text></view
                  >
                  <view class="flex items-center gap-1"
                    ><text class="material-symbols-outlined text-[32rpx]">favorite</text
                    ><text>{{ post.likeCount || 0 }}</text></view
                  >
                  <view class="flex items-center gap-1"
                    ><text class="material-symbols-outlined text-[32rpx]">chat_bubble</text
                    ><text>{{ post.commentCount || 0 }}</text></view
                  >
                </view>
              </view>

              <view
                class="flex flex-col items-center justify-center py-12 bg-white rounded-[40rpx]"
                v-if="userPosts.length === 0"
              >
                <text class="text-[72rpx] opacity-40 mb-2">📝</text>
                <text class="text-[26rpx] text-outline-variant font-bold">该用户还没有发布过贴纸</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { get, post as apiPost, del } from '@/utils/request.js'
import { userApi, followApi, postApi, chatApi } from '@/api/index.js'
import { formatTimeAgo } from '@/composables/useTimeAgo'

const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight || 20)
const defaultAvatar = '/static/images/default-avatar.png'
const scrollY = ref(0)

const loading = ref(false)
const userInfo = ref(null)
const isAnonymous = ref(false)
const isFollowed = ref(false)
const userPosts = ref([])

const genderText = computed(() => {
  if (!userInfo.value) return '未知'
  return userInfo.value.gender === 1 ? '男' : userInfo.value.gender === 2 ? '女' : '未知'
})

const onScroll = e => {
  scrollY.value = e.detail.scrollTop
}

let targetUserId = null
let currentUserId = null

onLoad(options => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 20

  const currentUserInfo = uni.getStorageSync('userInfo')
  if (currentUserInfo && (currentUserInfo.id || currentUserInfo.userId)) {
    currentUserId = currentUserInfo.id || currentUserInfo.userId
  }

  targetUserId = parseInt(options.userId)

  if (!targetUserId) {
    uni.showToast({ title: '用户ID无效', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 1000)
    return
  }

  if (targetUserId === 0 || targetUserId === -1) {
    isAnonymous.value = true
    return
  }

  if (targetUserId === currentUserId) {
    uni.switchTab({ url: '/pages/user/profile' })
    return
  }

  fetchUserInfo()
  fetchUserPosts()
})

const fetchUserInfo = async () => {
  loading.value = true
  try {
    const response = await get(userApi.getUserInfo(targetUserId).url, { userId: targetUserId })
    if (response.code === 200 && response.data) {
      userInfo.value = response.data
      isFollowed.value = response.data.isFollowed || false
    } else {
      uni.showToast({ title: response.message || '获取信息失败', icon: 'none' })
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    uni.showToast({ title: '加载失败，请重试', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const fetchUserPosts = async () => {
  try {
    const response = await get(postApi.getUserPosts(targetUserId, { page: 1, size: 3 }).url, { page: 1, size: 3 })
    if (response.code === 200 && response.data) {
      const records = response.data.records || []
      userPosts.value = records.map(item => ({
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
        isAnonymous: item.isAnonymous || false,
        // 板块差异化字段（对齐 PostVO）
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
        hasJoined: item.hasJoined || false,
      }))
    }
  } catch (error) {
    console.error('获取用户帖子失败:', error)
  }
}

const toggleFollow = async () => {
  try {
    uni.showLoading({ title: '操作中...' })
    const url = `/api/v1/follow/${targetUserId}`

    if (isFollowed.value) {
      await del(url)
      isFollowed.value = false
      if (userInfo.value) {
        userInfo.value.fansCount = Math.max(0, (userInfo.value.fansCount || 0) - 1)
      }
      uni.showToast({ title: '已取消关注', icon: 'success' })
    } else {
      await apiPost(url)
      isFollowed.value = true
      if (userInfo.value) {
        userInfo.value.fansCount = (userInfo.value.fansCount || 0) + 1
      }
      uni.vibrateShort()
      uni.showToast({ title: '关注成功', icon: 'success' })
    }
  } catch (error) {
    const msg = error.message || '操作失败，请重试'
    if (msg.includes('已经关注')) {
      isFollowed.value = true
    }
    uni.showToast({ title: msg, icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

const toPrivateMessage = async () => {
  try {
    uni.showLoading({ title: '加载聊天中...' })
    const response = await get(chatApi.getSessionList().url)

    if (response.code === 200 && response.data) {
      const existingSession = response.data.find(s => s.chatPartnerId === targetUserId)
      if (existingSession) {
        uni.navigateTo({
          url: `/pages/message/chat-detail?sessionId=${existingSession.id}&name=${encodeURIComponent(existingSession.chatPartnerName)}&avatar=${encodeURIComponent(existingSession.chatPartnerAvatar || '')}&partnerId=${existingSession.chatPartnerId}`,
        })
      } else {
        const createResponse = await apiPost(chatApi.sendMessage().url, {
          receiverId: targetUserId,
          content: '你好~',
          messageType: 1,
        })

        if (createResponse.code === 200) {
          const sessionsResponse = await get(chatApi.getSessionList().url)
          if (sessionsResponse.code === 200 && sessionsResponse.data) {
            const newSession = sessionsResponse.data.find(s => s.chatPartnerId === targetUserId)
            if (newSession) {
              uni.navigateTo({
                url: `/pages/message/chat-detail?sessionId=${newSession.id}&name=${encodeURIComponent(newSession.chatPartnerName)}&avatar=${encodeURIComponent(newSession.chatPartnerAvatar || '')}&partnerId=${newSession.chatPartnerId}`,
              })
            }
          }
        }
      }
    }
  } catch (error) {
    uni.showToast({ title: '操作失败，请重试', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

const handleBack = () => uni.navigateBack()
const goToUserPosts = () => uni.navigateTo({ url: `/pages/user/user-posts-list?userId=${targetUserId}` })
const goToPostDetail = postId => uni.navigateTo({ url: `/pages/post/detail?id=${postId}` })

const formatTime = formatTimeAgo
</script>

<style scoped lang="scss">
/* 隐藏系统的多余滚动条 */
::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  color: transparent;
}

/* 萌系Q弹点击手感 */
.bouncy-press:active {
  transform: scale(0.96);
  transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 背景噪点纹理 */
.noise-bg {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E");
}

/* 浮动气泡动画 */
@keyframes float {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-20rpx) scale(1.02);
  }
}
.bubble-float {
  animation: float 6s ease-in-out infinite;
}

/* 波浪底部 */
.wave-bg {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 120'%3E%3Cpath fill='%23F4F5F7' d='M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z'%3E%3C/path%3E%3C/svg%3E")
    no-repeat bottom;
  background-size: cover;
}

/* 限制文字溢出 */
.line-clamp-3 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
</style>
