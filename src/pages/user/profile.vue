<template>
  <view class="bg-[#F4F5F7] min-h-screen pb-24 selection:bg-primary-container relative">

    <!-- 顶部导航栏 -->
    <view class="fixed top-0 left-0 w-full z-50 transition-all duration-300"
          :class="{'bg-surface/90 backdrop-blur-md shadow-sm': scrollY > 50}">
      <view :style="{ height: statusBarHeight + 'px' }"></view>
      <view class="flex items-center px-[32rpx] w-full h-[44px]">
        <view class="flex items-center gap-2">
          <text class="material-symbols-outlined active:opacity-70 transition-colors text-[48rpx]"
                :class="scrollY > 50 ? 'text-on-surface' : 'text-white'"
                @click="handleEditProfile">settings</text>
          <text class="font-headline-md text-[36rpx] font-bold transition-opacity text-on-surface"
                :class="scrollY > 50 ? 'opacity-100' : 'opacity-0'">个人中心</text>
        </view>
      </view>
    </view>

    <!-- 未认证弹窗 -->
    <view v-if="showAuthModal" class="fixed inset-0 z-[70] flex items-center justify-center">
      <!-- 遮罩 -->
      <view class="absolute inset-0 bg-black/50 backdrop-blur-sm"></view>
      <!-- 弹窗内容 -->
      <view class="relative z-10 bg-white rounded-[40rpx] mx-8 p-8 max-w-[560rpx] shadow-2xl animate-fade-in scale-in">
        <view class="flex flex-col items-center">
          <view class="w-[120rpx] h-[120rpx] rounded-full bg-primary-container/30 flex items-center justify-center mb-5">
            <text class="material-symbols-outlined text-primary text-[64rpx]">verified_user</text>
          </view>
          <text class="text-[36rpx] font-bold text-on-surface mb-2">实名认证</text>
          <text class="text-[26rpx] text-on-surface-variant text-center leading-relaxed mb-6">
            同学你好！为了保障校园社区安全，请先完成实名认证后再使用全部功能~
          </text>

          <view class="flex gap-3 w-full">
            <view class="flex-1 h-[88rpx] flex items-center justify-center rounded-full border-2 border-outline-variant/40 text-on-surface-variant font-bold text-[28rpx] active:scale-95 transition-transform"
                  @click="closeAuthModal">
              稍后再说
            </view>
            <view class="flex-1 h-[88rpx] flex items-center justify-center rounded-full bg-gradient-to-r from-[#FF8FA3] to-[#FFB3C1] text-white font-bold text-[28rpx] shadow-md active:scale-95 transition-transform"
                  @click="goToRealNameAuth">
              去认证
            </view>
          </view>
        </view>
      </view>
    </view>

    <scroll-view scroll-y class="h-screen w-full" @scroll="onScroll">
      <view class="relative h-[560rpx] w-full overflow-hidden">
        <view class="absolute inset-0 bg-gradient-to-br from-[#FF8FA3] via-[#C5A3FF] to-[#5BA4F0] noise-bg"></view>
        <view class="absolute top-10 left-10 w-[200rpx] h-[200rpx] bg-white/20 rounded-full blur-2xl bubble-float"></view>
        <view class="absolute top-20 right-10 w-[250rpx] h-[250rpx] bg-white/10 rounded-full blur-3xl bubble-float" style="animation-delay: 2s;"></view>
        <view class="absolute bottom-0 left-0 w-full h-[120rpx] wave-bg"></view>
      </view>

      <view class="relative -mt-[140rpx] px-[32rpx] z-10 space-y-[24rpx]">

        <!-- 用户信息卡片 -->
        <view class="bg-white/90 backdrop-blur-md rounded-[40rpx] p-[32rpx] border border-white/50 kawaii-shadow">
          <view class="flex flex-col items-center -mt-[100rpx] text-center">
            <view class="flex flex-col items-center text-center" @click="handleEditProfile">
              <view class="relative mb-3">
                <image class="w-[160rpx] h-[160rpx] rounded-full border-[6rpx] border-white object-cover shadow-sm" mode="aspectFill" :src="userInfo?.avatar || defaultAvatar"></image>
                <view v-if="userInfo?.isVerified" class="absolute bottom-0 right-0 bg-[#5BA4F0] p-1 rounded-full border-[4rpx] border-white flex items-center justify-center">
                  <text class="material-symbols-outlined text-[24rpx] text-white" style="font-variation-settings: 'FILL' 1;">verified</text>
                </view>
              </view>

              <view class="flex items-center gap-1 mb-1">
                <text class="text-[40rpx] font-bold text-on-surface">{{ userInfo?.nickname || '未登录' }}</text>
                <text v-if="userInfo?.gender === 1" class="material-symbols-outlined text-[32rpx] text-[#5BA4F0]">male</text>
                <text v-else-if="userInfo?.gender === 2" class="material-symbols-outlined text-[32rpx] text-[#FF8FA3]">female</text>
              </view>

              <text class="text-[24rpx] text-on-surface-variant bg-surface-container-low px-3 py-1 rounded-full">{{ userInfo?.college || '未绑定学院' }}</text>

              <text class="text-[26rpx] text-on-surface/70 mt-3 px-4 italic line-clamp-2">
                {{ userInfo?.signature || '留下你的个性签名，让大家更好地认识你 ✍️' }}
              </text>
            </view>

            <!-- 未认证提示条 -->
            <view v-if="!userInfo?.isRealNameAuth" class="w-full mt-4">
              <view class="flex items-center justify-between px-4 py-3 rounded-full bg-gradient-to-r from-[#FFF3F0] to-[#FFEBEE] border border-dashed border-[#FF8FA3]/30 active:scale-[0.98] transition-transform"
                    @click="goToRealNameAuth">
                <view class="flex items-center gap-2">
                  <text class="material-symbols-outlined text-[#FF8FA3] text-[32rpx]">error</text>
                  <text class="text-[24rpx] text-[#E57373] font-bold">你还未进行学生认证</text>
                </view>
                <text class="material-symbols-outlined text-[#FF8FA3] text-[28rpx]">chevron_right</text>
              </view>
            </view>

            <!-- 数据看板 -->
            <view class="grid grid-cols-4 w-full mt-6 py-4 border-t border-dashed border-outline-variant/50">
              <view class="flex flex-col items-center bouncy-press">
                <text class="text-[36rpx] font-bold text-gradient-candy">{{ userInfo?.likeCount || 0 }}</text>
                <text class="text-[22rpx] text-on-surface-variant mt-1">获赞</text>
              </view>
              <view class="flex flex-col items-center bouncy-press" @click.stop="goToMyCollections">
                <text class="text-[36rpx] font-bold text-gradient-candy">{{ userInfo?.collectionCount || 0 }}</text>
                <text class="text-[22rpx] text-on-surface-variant mt-1">收藏</text>
              </view>
              <view class="flex flex-col items-center bouncy-press" @click.stop="goToMyFollowing">
                <text class="text-[36rpx] font-bold text-gradient-candy">{{ userInfo?.followCount || 0 }}</text>
                <text class="text-[22rpx] text-on-surface-variant mt-1">关注</text>
              </view>
              <view class="flex flex-col items-center bouncy-press" @click.stop="goToMyFans">
                <text class="text-[36rpx] font-bold text-gradient-candy">{{ userInfo?.fansCount || 0 }}</text>
                <text class="text-[22rpx] text-on-surface-variant mt-1">粉丝</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 快捷功能宫格 -->
        <view class="grid grid-cols-3 gap-3">
          <view class="bg-white rounded-[32rpx] p-4 flex flex-col items-center justify-center gap-2 kawaii-shadow bouncy-press" @click="handleNav('我的动态')">
            <view class="w-[80rpx] h-[80rpx] rounded-full bg-blue-50 flex items-center justify-center">
              <text class="material-symbols-outlined text-blue-500 text-[40rpx]">article</text>
            </view>
            <text class="text-[24rpx] text-on-surface font-medium">我的动态</text>
          </view>
          <view class="bg-white rounded-[32rpx] p-4 flex flex-col items-center justify-center gap-2 kawaii-shadow bouncy-press" @click="handleNav('我的收藏')">
            <view class="w-[80rpx] h-[80rpx] rounded-full bg-purple-50 flex items-center justify-center">
              <text class="material-symbols-outlined text-purple-500 text-[40rpx]">bookmark</text>
            </view>
            <text class="text-[24rpx] text-on-surface font-medium">我的收藏</text>
          </view>
          <view class="bg-white rounded-[32rpx] p-4 flex flex-col items-center justify-center gap-2 kawaii-shadow bouncy-press" @click="handleNav('浏览历史')">
            <view class="w-[80rpx] h-[80rpx] rounded-full bg-green-50 flex items-center justify-center">
              <text class="material-symbols-outlined text-green-500 text-[40rpx]">history</text>
            </view>
            <text class="text-[24rpx] text-on-surface font-medium">浏览历史</text>
          </view>
        </view>

        <!-- 课程安排 Tab -->
        <view class="bg-gradient-to-r from-[#E8F5E9] via-[#E3F2FD] to-[#FFF3E0] rounded-[32rpx] p-[32rpx] kawaii-shadow mt-4 border border-dashed border-primary/20">
          <view class="flex items-center justify-between active:opacity-60 transition-opacity" @click="handleNav('课程安排')">
            <view class="flex items-center gap-3">
              <view class="w-[80rpx] h-[80rpx] rounded-full bg-white/80 flex items-center justify-center shadow-sm">
                <text class="material-symbols-outlined text-[#FF8FA3] text-[44rpx]">calendar_month</text>
              </view>
              <view class="flex flex-col">
                <text class="text-[30rpx] text-on-surface font-bold">课程安排</text>
                <text class="text-[22rpx] text-outline-variant mt-0.5">查看本周课表与教室安排</text>
              </view>
            </view>
            <view class="flex items-center gap-2">
              <view class="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[20rpx] font-bold">敬请期待</view>
              <text class="material-symbols-outlined text-outline-variant text-[40rpx]">chevron_right</text>
            </view>
          </view>
        </view>

        <!-- 系统设置列表 -->
        <view class="bg-white rounded-[32rpx] p-[32rpx] kawaii-shadow mt-4">
          <view class="space-y-6">
            <view class="flex items-center justify-between active:opacity-60 transition-opacity" @click="handleNav('系统设置')">
              <view class="flex items-center gap-3">
                <text class="material-symbols-outlined text-on-surface-variant text-[40rpx]">settings_suggest</text>
                <text class="text-[28rpx] text-on-surface">系统设置</text>
              </view>
              <text class="material-symbols-outlined text-outline-variant text-[40rpx]">chevron_right</text>
            </view>
            <view class="flex items-center justify-between active:opacity-60 transition-opacity" @click="handleNav('意见反馈')">
              <view class="flex items-center gap-3">
                <text class="material-symbols-outlined text-on-surface-variant text-[40rpx]">feedback</text>
                <text class="text-[28rpx] text-on-surface">意见反馈</text>
              </view>
              <text class="material-symbols-outlined text-outline-variant text-[40rpx]">chevron_right</text>
            </view>
            <view class="flex items-center justify-between active:opacity-60 transition-opacity" @click="handleNav('关于校园墙')">
              <view class="flex items-center gap-3">
                <text class="material-symbols-outlined text-on-surface-variant text-[40rpx]">info</text>
                <text class="text-[28rpx] text-on-surface">关于校园墙</text>
              </view>
              <text class="material-symbols-outlined text-outline-variant text-[40rpx]">chevron_right</text>
            </view>
          </view>
        </view>

        <view class="w-full py-6 text-center mt-2 mb-8">
          <text class="text-[#FF3B30] text-[32rpx] font-bold active:opacity-60 transition-opacity" @click="handleLogout">退出登录</text>
        </view>

        <view class="flex justify-center pb-8 pt-4">
          <text class="material-symbols-outlined text-outline-variant/40 animate-pulse text-[48rpx]">colors_spark</text>
        </view>

      </view>
    </scroll-view>

    <CustomTabBar :current="4" />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { get } from "@/utils/request"
import { userApi } from "@/api"

const statusBarHeight = ref(20)
const loading = ref(false)
const defaultAvatar = '/static/images/default-avatar.png'
const scrollY = ref(0)
const showAuthModal = ref(false)
const authChecked = ref(false)

// 用户信息
const userInfo = ref({
  id: null,
  nickname: '',
  avatar: '',
  signature: '',
  college: '',
  campus: '',
  gender: null,
  likeCount: 0,
  followCount: 0,
  fansCount: 0,
  collectionCount: 0,
  postCount: 0,
  isRealNameAuth: false,
  isVerified: false
})

// 获取当前用户信息
const fetchUserInfo = async () => {
  loading.value = true
  try {
    const response = await get(userApi.getCurrentUserInfo().url)
    if (response.code === 200 && response.data) {
      const data = response.data
      userInfo.value = {
        id: data.id,
        nickname: data.nickname || '未设置昵称',
        avatar: data.avatar || defaultAvatar,
        signature: data.signature || '这个人很懒，什么都没写~',
        college: data.college || '嘉应学院',
        campus: data.campus,
        gender: data.gender,
        likeCount: data.likeCount || 0,
        followCount: data.followCount || 0,
        fansCount: data.fansCount || 0,
        collectionCount: data.collectionCount || 0,
        postCount: data.postCount || 0,
        isRealNameAuth: data.isRealNameAuth || false,
        isVerified: data.isVerified || false
      }
      console.log('✅ 用户信息加载成功:', userInfo.value)
    }
  } catch (error) {
    console.error('❌ 获取用户信息失败:', error)
    uni.showToast({ title: '加载用户信息失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

// 页面加载时获取用户信息
onLoad(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 20

  // 检查登录状态
  const token = uni.getStorageSync('token')
  if (!token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => {
      uni.redirectTo({ url: '/pages/login/login' })
    }, 1500)
    return
  }

  // 获取用户信息
  fetchUserInfo()
})

// 页面显示时检查认证状态
onShow(() => {
  // 刷新用户信息（认证状态可能已变更）
  fetchUserInfo().then(() => {
    checkAuthStatus()
  })
})

// 检查认证状态，未认证则弹窗
const checkAuthStatus = () => {
  if (!authChecked.value && userInfo.value.id && !userInfo.value.isRealNameAuth) {
    showAuthModal.value = true
    authChecked.value = true
  }
}

// 关闭认证弹窗
const closeAuthModal = () => {
  showAuthModal.value = false
}

// 前往实名认证
const goToRealNameAuth = () => {
  showAuthModal.value = false
  uni.navigateTo({
    url: '/pages/user/student-verification',
    fail: () => {
      // 如果页面不存在，跳转到设置页
      uni.navigateTo({ url: '/pages/user/settings' })
    }
  })
}

// 滚动监听
const onScroll = (e) => {
  scrollY.value = e.detail.scrollTop
}

// 统一的页面跳转处理函数
const handleNav = (pageName) => {
  if (pageName === '我的动态') {
    uni.navigateTo({ url: '/pages/user/my-posts' })
    return
  }
  if (pageName === '我的收藏') {
    uni.navigateTo({ url: '/pages/user/my-collections' })
    return
  }
  if (pageName === '浏览历史') {
    uni.navigateTo({ url: '/pages/user/browse-history' })
    return
  }
  if (pageName === '系统设置') {
    uni.navigateTo({ url: '/pages/user/settings' })
    return
  }
  if (pageName === '关于校园墙') {
    uni.navigateTo({ url: '/pages/user/about' })
    return
  }
  if (pageName === '意见反馈') {
    uni.navigateTo({ url: '/pages/user/feedback' })
    return
  }
  if (pageName === '课程安排') {
    // 功能暂未实现，提示用户
    uni.showToast({
      title: '课程安排功能即将上线 🎒',
      icon: 'none',
      duration: 2000
    })
    return
  }

  uni.showToast({
    title: `「${pageName}」功能开发中...`,
    icon: 'none',
    duration: 1500
  })
}

// 点击信息区域 - 跳转到编辑资料页面
const handleEditProfile = () => {
  uni.navigateTo({ url: '/pages/user/edit-profile' })
}

// 点击收藏 - 跳转到我的收藏页面
const goToMyCollections = () => {
  uni.navigateTo({ url: '/pages/user/my-collections' })
}

// 点击关注 - 跳转到我的关注页面
const goToMyFollowing = () => {
  uni.navigateTo({ url: '/pages/user/my-following' })
}

// 点击粉丝 - 跳转到我的粉丝页面
const goToMyFans = () => {
  uni.navigateTo({ url: '/pages/user/my-fans' })
}

// 退出登录
const handleLogout = () => {
  uni.showModal({
    title: '确认退出',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        uni.removeStorageSync('token')
        uni.removeStorageSync('userInfo')
        uni.showToast({ title: '已退出登录', icon: 'success' })
        setTimeout(() => {
          uni.reLaunch({ url: '/pages/login/login' })
        }, 1000)
      }
    }
  })
}
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

/* 弥散阴影 */
.kawaii-shadow {
  box-shadow: 0 12rpx 40rpx rgba(255, 143, 163, 0.12);
}

/* 渐变文字 */
.text-gradient-candy {
  background: linear-gradient(135deg, #FF8FA3 0%, #C5A3FF 50%, #5BA4F0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 动画 - 淡入 */
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fade-in {
  animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
}

/* 背景噪点纹理 */
.noise-bg {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E");
}

/* 浮动气泡动画 */
@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-20rpx) scale(1.02); }
}
.bubble-float {
  animation: float 6s ease-in-out infinite;
}

/* 波浪底部 */
.wave-bg {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 120'%3E%3Cpath fill='%23F4F5F7' d='M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z'%3E%3C/path%3E%3C/svg%3E") no-repeat bottom;
  background-size: cover;
}
</style>
