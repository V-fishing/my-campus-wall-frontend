<template>
  <view class="bg-background text-on-surface font-body-lg text-body-lg min-h-screen custom-scrollbar overflow-x-hidden pb-12">
    
    <header class="fixed top-0 left-0 w-full z-50 h-[88px] bg-background/85 backdrop-blur-md flex items-end pb-3 px-margin-page" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="flex items-center space-x-4 w-full">
        <view class="bouncy-tap p-1 -ml-1 text-primary cursor-pointer flex items-center justify-center" @click="handleBack">
          <text class="material-symbols-outlined text-[48rpx]">arrow_back_ios</text>
        </view>
        <h1 class="font-headline-md text-[34rpx] text-primary font-bold">用户资料</h1>
      </view>
    </header>

    <view class="pt-[88px]">
      
      <view class="flex flex-col items-center justify-center py-40" v-if="loading">
        <text class="material-symbols-outlined animate-spin text-primary text-[64rpx]">sync</text>
        <text class="block text-on-surface-variant mt-2 text-[26rpx]">正在翻阅TA的个人档案...</text>
      </view>

      <view class="px-margin-page pt-10 flex flex-col items-center justify-center text-center" v-else-if="isAnonymous">
        <view class="w-32 h-32 rounded-full bg-surface-container-high flex items-center justify-center mb-4 sticker-shadow">
          <text class="text-[80rpx]">🤫</text>
        </view>
        <text class="text-[32rpx] text-on-surface font-bold mb-2">该用户选择了匿名发布</text>
        <text class="text-[26rpx] text-outline-variant">由于校园隐私保护政策，无法查看神秘洞主的主页哦~</text>
      </view>

      <view v-else-if="userInfo">
        
        <view class="relative w-full h-[140px]" style="background: linear-gradient(135deg, #7EC8E3 0%, #5BA4F0 100%);">
          <view class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 20px 20px;"></view>
          <text class="material-symbols-outlined absolute top-4 right-10 text-white/40 text-[40rpx] animate-pulse">colors_spark</text>
        </view>

        <section class="px-margin-page -mt-12 relative z-10">
          <view class="bg-white/90 backdrop-blur-md rounded-[40rpx] p-padding-inner bouncy-shadow border border-white/50">
            
            <view class="flex flex-col items-center -mt-[90rpx] mb-4">
              <view class="relative">
                <image :src="userInfo.avatar || defaultAvatar" mode="aspectFill" class="w-[140rpx] h-[140rpx] rounded-full border-4 border-white bg-secondary-fixed sticker-stroke shadow-sm" />
                <view v-if="userInfo.college" class="absolute bottom-0 right-0 bg-[#5BA4F0] text-white rounded-full p-1 border-2 border-white flex items-center justify-center shadow-sm">
                  <text class="material-symbols-outlined text-[24rpx]" style="font-variation-settings: 'FILL' 1;">verified</text>
                </view>
              </view>
              
              <view class="mt-3 flex flex-col items-center w-full">
                <view class="flex items-center gap-2">
                  <text class="font-headline-lg text-[36rpx] font-bold text-on-surface">{{ userInfo.nickname || '未设置昵称' }}</text>
                  <text v-if="userInfo.gender === 1" class="material-symbols-outlined text-[#5BA4F0] text-[36rpx]">male</text>
                  <text v-else-if="userInfo.gender === 2" class="material-symbols-outlined text-[#FF8FA3] text-[36rpx]">female</text>
                </view>
                
                <view v-if="userInfo.college" class="mt-2 px-4 py-0.5 bg-secondary-container/20 text-secondary rounded-full font-label-md text-[22rpx] font-bold border border-secondary-container/10">
                  {{ userInfo.college }}
                </view>
                
                <text class="mt-3 text-on-surface-variant text-[26rpx] text-center max-w-[85%] italic line-clamp-2">
                  {{ userInfo.signature || '这个人很懒，什么都没写~ ✍️' }}
                </text>
              </view>
            </view>

            <view class="grid grid-cols-4 gap-2 py-4 border-t border-dashed border-outline-variant/30">
              <view class="flex flex-col items-center bouncy-tap" @click="goToUserPosts">
                <text class="font-headline-md text-[34rpx] blue-gradient-text font-bold">{{ userInfo.postCount || 0 }}</text>
                <text class="font-label-sm text-[22rpx] text-outline-variant mt-0.5">动态</text>
              </view>
              <view class="flex flex-col items-center">
                <text class="font-headline-md text-[34rpx] blue-gradient-text font-bold">{{ userInfo.likeCount || 0 }}</text>
                <text class="font-label-sm text-[22rpx] text-outline-variant mt-0.5">获赞</text>
              </view>
              <view class="flex flex-col items-center">
                <text class="font-headline-md text-[34rpx] blue-gradient-text font-bold">{{ userInfo.followCount || 0 }}</text>
                <text class="font-label-sm text-[22rpx] text-outline-variant mt-0.5">关注</text>
              </view>
              <view class="flex flex-col items-center">
                <text class="font-headline-md text-[34rpx] blue-gradient-text font-bold">{{ userInfo.fansCount || 0 }}</text>
                <text class="font-label-sm text-[22rpx] text-outline-variant mt-0.5">粉丝</text>
              </view>
            </view>

            <view class="flex gap-3 mt-2 w-full">
              <button class="flex-1 h-[88rpx] rounded-full text-white font-headline-md text-[28rpx] font-bold shadow-md transition-transform active:scale-95 flex items-center justify-center gap-1 border border-white/20"
                      :class="isFollowed ? 'bg-surface-container-high text-on-surface-variant' : 'bg-gradient-to-r from-primary-container to-primary'"
                      @click="toggleFollow">
                <text class="material-symbols-outlined text-[32rpx]" v-if="isFollowed">check</text>
                {{ isFollowed ? '已关注' : '关注' }}
              </button>
              
              <button class="flex-1 h-[88rpx] rounded-full bg-gradient-to-r from-[#7EC8E3] to-[#5BA4F0] text-white font-headline-md text-[28rpx] font-bold shadow-md flex items-center justify-center gap-1.5 transition-transform active:scale-95 border border-white/20"
                      @click="toPrivateMessage">
                <text class="material-symbols-outlined text-[32rpx]">chat_bubble</text>
                私信
              </button>
            </view>

          </view>
        </section>

        <section class="mt-6 px-margin-page">
          <view class="bg-surface-container-low/60 rounded-[40rpx] p-padding-inner border border-surface-variant/20 kawaii-shadow">
            <text class="font-headline-md text-[30rpx] font-bold text-on-surface mb-4 block">基本信息</text>
            <view class="space-y-4">
              <view class="flex items-center gap-3" v-if="userInfo.campus">
                <text class="material-symbols-outlined text-outline text-[36rpx]">location_on</text>
                <text class="text-on-surface-variant text-[28rpx]">校区：</text>
                <text class="text-on-surface text-[28rpx] font-bold">{{ userInfo.campus }}</text>
              </view>
              <view class="h-px bg-dashed border-t border-dashed border-outline-variant/20 w-full" v-if="userInfo.campus"></view>
              
              <view class="flex items-center gap-3">
                <text class="material-symbols-outlined text-outline text-[36rpx]">person</text>
                <text class="text-on-surface-variant text-[28rpx]">性别：</text>
                <text class="text-on-surface text-[28rpx] font-bold">{{ userInfo.gender === 1 ? '男' : (userInfo.gender === 2 ? '女' : '未知') }}</text>
              </view>
              <view class="h-px bg-dashed border-t border-dashed border-outline-variant/20 w-full"></view>
              
              <view class="flex items-center gap-3" v-if="userInfo.college">
                <text class="material-symbols-outlined text-outline text-[36rpx]">school</text>
                <text class="text-on-surface-variant text-[28rpx]">院系：</text>
                <text class="text-on-surface text-[28rpx] font-bold">{{ userInfo.college }}</text>
              </view>
            </view>
          </view>
        </section>

        <section class="mt-6 px-margin-page">
          <view class="flex items-center justify-between mb-4 px-2">
            <text class="font-headline-md text-[30rpx] font-bold text-on-surface">Ta的动态 <text class="text-primary ml-1">({{ userInfo.postCount || 0 }})</text></text>
            <text class="text-outline-variant text-[24rpx] font-bold active:opacity-70" @click="goToUserPosts">查看全部 ›</text>
          </view>

          <view class="space-y-4">
            <view class="bg-white rounded-[40rpx] p-padding-inner bouncy-shadow dashed-doodle relative overflow-hidden group active:scale-[0.99] transition-transform"
                  v-for="post in userPosts" :key="post.id" @click="goToPostDetail(post.id)">
              
              <view class="flex justify-between items-start mb-3">
                <view class="flex items-center gap-2">
                  <image :src="post.isAnonymous ? defaultAvatar : (post.avatar || defaultAvatar)" mode="aspectFill" class="w-9 h-9 rounded-full bg-secondary-fixed border-2 border-white shadow-sm" />
                  <view>
                    <text class="font-label-md text-[26rpx] text-on-surface font-bold block">{{ post.isAnonymous ? '匿名用户' : (post.author || '匿名用户') }}</text>
                    <text class="text-[20rpx] text-outline-variant block mt-0.5">{{ formatTime(post.createTime) }}</text>
                  </view>
                </view>
                <text class="material-symbols-outlined text-outline-variant text-[36rpx]">more_horiz</text>
              </view>

              <text class="text-on-surface text-[28rpx] leading-relaxed block mb-3 line-clamp-3">{{ post.content }}</text>

              <view class="flex gap-2 mb-[24rpx]" v-if="post.images && post.images.length > 0">
                <image v-for="(img, idx) in post.images.slice(0, 3)" :key="idx" :src="img" mode="aspectFill" class="w-[180rpx] h-[180rpx] rounded-[24rpx] bg-surface-container-high border-2 border-white shadow-inner" />
              </view>

              <view class="flex items-center gap-[32rpx] pt-3 border-t border-surface-variant/30 text-outline-variant text-[24rpx]">
                <view class="flex items-center gap-1"><text class="material-symbols-outlined text-[32rpx]">visibility</text><text>{{ post.viewCount || 0 }}</text></view>
                <view class="flex items-center gap-1"><text class="material-symbols-outlined text-[32rpx]">favorite</text><text>{{ post.likeCount || 0 }}</text></view>
                <view class="flex items-center gap-1"><text class="material-symbols-outlined text-[32rpx]">chat_bubble</text><text>{{ post.commentCount || 0 }}</text></view>
              </view>

            </view>

            <view class="flex flex-col items-center justify-center py-12 bg-white rounded-[40rpx] dashed-doodle" v-if="userPosts.length === 0">
              <text class="text-[72rpx] opacity-40 mb-2">📝</text>
              <text class="text-[26rpx] text-outline-variant font-bold">该用户还没有发布过贴纸</text>
            </view>
          </view>
        </section>

      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { get, post as apiPost, del } from '@/utils/request.js'
import { userApi, followApi, postApi, chatApi } from '@/api/index.js'

const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight || 20)
const defaultAvatar = '/static/images/default-avatar.png'

const loading = ref(false)
const userInfo = ref(null)
const isAnonymous = ref(false)
const isFollowed = ref(false)
const userPosts = ref([])

let targetUserId = null
let currentUserId = null

onLoad((options) => {
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
        isAnonymous: item.isAnonymous || false
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
          url: `/pages/message/chat-detail?sessionId=${existingSession.id}&name=${encodeURIComponent(existingSession.chatPartnerName)}&avatar=${encodeURIComponent(existingSession.chatPartnerAvatar || '')}&partnerId=${existingSession.chatPartnerId}`
        })
      } else {
        const createResponse = await apiPost(chatApi.sendMessage().url, {
          receiverId: targetUserId,
          content: '你好~',
          messageType: 1
        })
        
        if (createResponse.code === 200) {
          const sessionsResponse = await get(chatApi.getSessionList().url)
          if (sessionsResponse.code === 200 && sessionsResponse.data) {
            const newSession = sessionsResponse.data.find(s => s.chatPartnerId === targetUserId)
            if (newSession) {
              uni.navigateTo({
                url: `/pages/message/chat-detail?sessionId=${newSession.id}&name=${encodeURIComponent(newSession.chatPartnerName)}&avatar=${encodeURIComponent(newSession.chatPartnerAvatar || '')}&partnerId=${newSession.chatPartnerId}`
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
const goToPostDetail = (postId) => uni.navigateTo({ url: `/pages/post/detail?id=${postId}` })

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const now = new Date()
  const time = new Date(timeStr)
  const diff = now.getTime() - time.getTime()
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  return time.toLocaleDateString('zh-CN')
}
</script>

<style scoped>
/* 隐藏长页面的多余硬滚动条 */
.custom-scrollbar::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

/* 按钮Q弹手感 */
.bouncy-tap:active {
  transform: scale(0.96);
  transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 弥散阴影 */
.bouncy-shadow {
  box-shadow: 0 12rpx 40rpx rgba(255, 143, 163, 0.12);
}

/* 贴纸白描光边 */
.sticker-stroke {
  filter: drop-shadow(0 0 2rpx #ffffff) drop-shadow(0 4rpx 10rpx rgba(0, 0, 0, 0.05));
}

/* 蓝青高级感色彩渐变 */
.blue-gradient-text {
  background: linear-gradient(135deg, #7EC8E3 0%, #5BA4F0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* 萌系手账虚线 */
.dashed-doodle {
  border: 4rpx dashed #dac0c3;
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