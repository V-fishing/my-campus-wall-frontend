<template>
  <view class="bg-[#fefcf5] min-h-screen pb-20">
    <header class="sticky top-0 z-[60] bg-surface/85 backdrop-blur-md border-b border-dashed border-outline-variant/30 flex items-center px-margin-page transition-all"
            :style="{ paddingTop: statusBarHeight + 'px', height: (statusBarHeight + 56) + 'px' }">
      <view class="bouncy-tap p-2 -ml-2 text-primary" @click="goBack">
        <text class="material-symbols-outlined text-[56rpx]">arrow_back_ios</text>
      </view>
      <text class="font-headline-md text-[36rpx] text-primary font-bold absolute left-1/2 -translate-x-1/2">设置</text>
    </header>

    <main class="pt-6 px-margin-page">
      <section class="mb-gutter-card">
        <text class="text-[24rpx] font-bold text-outline ml-4 mb-2 uppercase tracking-wider">账户设置</text>
        <view class="mochi-bg sugar-card rounded-[32rpx] overflow-hidden">
          <view class="h-[112rpx] flex items-center px-6 bouncy-press border-b border-surface-variant/30" @click="navigateTo('edit-profile')">
            <text class="text-[40rpx] mr-4">👤</text>
            <text class="flex-1 text-[30rpx] text-on-surface">个人资料</text>
            <text class="material-symbols-outlined text-outline-variant">chevron_right</text>
          </view>
          <view class="h-[112rpx] flex items-center px-6 bouncy-press border-b border-surface-variant/30" @click="navigateTo('security')">
            <text class="text-[40rpx] mr-4">🛡️</text>
            <text class="flex-1 text-[30rpx] text-on-surface">账号与隐私</text>
            <text class="material-symbols-outlined text-outline-variant">chevron_right</text>
          </view>
          <view class="h-[112rpx] flex items-center px-6 bouncy-press" @click="navigateTo('real-name-auth')">
            <text class="text-[40rpx] mr-4">✅</text>
            <text class="flex-1 text-[30rpx] text-on-surface">实名认证</text>
            <view class="flex items-center gap-2">
              <text class="text-[26rpx]" :class="authStatus ? 'text-[#4CAF50]' : 'text-outline'">{{ authStatus ? '已认证' : '未认证' }}</text>
              <text class="material-symbols-outlined text-outline-variant">chevron_right</text>
            </view>
          </view>
          <view class="h-[112rpx] flex items-center px-6 bouncy-press" @click="navigateTo('student-verification')">
            <text class="text-[40rpx] mr-4">🎓</text>
            <text class="flex-1 text-[30rpx] text-on-surface">学生认证</text>
            <view class="flex items-center gap-2">
              <text class="text-[26rpx]" :class="studentVerified ? 'text-[#4CAF50]' : 'text-outline'">{{ studentVerified ? '已认证' : '未认证' }}</text>
              <text class="material-symbols-outlined text-outline-variant">chevron_right</text>
            </view>
          </view>
        </view>
      </section>

      <section class="mb-gutter-card pt-4">
        <text class="text-[24rpx] font-bold text-outline ml-4 mb-2 uppercase tracking-wider">通用设置</text>
        <view class="mochi-bg sugar-card rounded-[32rpx] overflow-hidden">
          <view class="h-[112rpx] flex items-center px-6 bouncy-press border-b border-surface-variant/30">
            <text class="text-[40rpx] mr-4">🧹</text>
            <text class="flex-1 text-[30rpx] text-on-surface">清理缓存</text>
            <text class="text-[26rpx] text-outline mr-2">12.5 MB</text>
          </view>
          <view class="h-[112rpx] flex items-center px-6 bouncy-press border-b border-surface-variant/30">
            <text class="text-[40rpx] mr-4">🔔</text>
            <text class="flex-1 text-[30rpx] text-on-surface">消息通知</text>
            <text class="material-symbols-outlined text-outline-variant">chevron_right</text>
          </view>
          <view class="h-[112rpx] flex items-center px-6">
            <text class="text-[40rpx] mr-4">🌙</text>
            <text class="flex-1 text-[30rpx] text-on-surface">深色模式</text>
            <switch color="#ffb2bd" :checked="isDarkMode" @change="toggleTheme" />
          </view>
        </view>
      </section>

      <view class="mt-12 space-y-4">
        <button class="w-full h-[100rpx] rounded-[50rpx] border-2 border-error bg-white text-error font-bold text-[30rpx] bouncy-press flex items-center justify-center" @click="handleLogout">
          退出登录
        </button>
      </view>
    </main>

    <view class="about-modal" v-if="showAbout" @click="showAbout = false">
      <view class="modal-content" @click.stop>
        <image class="about-logo" src="/static/logo.png" mode="aspectFit"></image>
        <text class="about-title">校园墙</text>
        <text class="about-version">v2.1.0</text>
        <view class="modal-close" @click="showAbout = false">我知道了</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { clearLoginInfo } from '../../utils/auth.js'

const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight)
const authStatus = ref(false)
const studentVerified = ref(false)
const showAbout = ref(false)
const isDarkMode = ref(false)

onLoad(() => {
  const userInfo = uni.getStorageSync('userInfo')
  authStatus.value = userInfo?.isRealNameAuth || false
  studentVerified.value = userInfo?.studentVerified === 1 || userInfo?.studentVerified === true || false
})

const goBack = () => uni.navigateBack()

const navigateTo = (page) => {
  const pageMap = {
    'edit-profile': '/pages/user/edit-profile',
    'security': '/pages/user/security',
    'real-name-auth': '/pages/user/real-name-auth',
    'student-verification': '/pages/user/student-verification'
  }
  if (pageMap[page]) uni.navigateTo({ url: pageMap[page] })
  else uni.showToast({ title: '功能开发中', icon: 'none' })
}

const toggleTheme = (e) => {
  isDarkMode.value = e.detail.value
  uni.showToast({ title: '切换主题成功', icon: 'none' })
}

const handleLogout = () => {
  uni.showModal({
    title: '确认退出',
    content: '确定要退出登录吗？',
    confirmColor: '#FF3B30',
    success: (res) => {
      if (res.confirm) {
        clearLoginInfo()
        uni.redirectTo({ url: '/pages/login/login' })
      }
    }
  })
}
</script>

<style scoped>
.sugar-card {
  border: 4rpx dashed #ffb2bd;
  box-shadow: 0 12rpx 40rpx rgba(255, 143, 163, 0.12);
}
.mochi-bg { background: linear-gradient(135deg, #ffffff 0%, #fff5f6 100%); }
.bouncy-press:active { transform: scale(0.97); transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }
</style>