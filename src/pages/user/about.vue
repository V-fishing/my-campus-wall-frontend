<template>
  <view class="bg-[#F4F5F7] min-h-screen pb-12 selection:bg-primary-container relative overflow-x-hidden">
    
    <!-- 顶部固定高光状态栏与导航栏 -->
    <header class="fixed top-0 w-full z-50 bg-[#F4F5F7]/85 backdrop-blur-md h-[88px] flex flex-col justify-end pb-3">
      <view class="flex items-center justify-between px-margin-page h-[44px] relative w-full">
        <view class="bouncy-tap p-2 -ml-2 text-primary flex items-center justify-center" @click="goBack">
          <text class="material-symbols-outlined text-[44rpx]">arrow_back_ios_new</text>
        </view>
        <h1 class="absolute left-1/2 -translate-x-1/2 font-headline-md text-[34rpx] text-primary font-bold">关于校园墙</h1>
        <!-- 右侧小程序官方胶囊预留 -->
        <view class="w-[90px]"></view>
      </view>
    </header>

    <!-- 主体内容滚动 Canvas -->
    <scroll-view class="w-full flex-1" scroll-y :style="{ paddingTop: '88px' }">
      <view class="px-margin-page space-y-6 pt-4 pb-12">
        
        <!-- 1. 品牌展示区 -->
        <section class="bg-white w-full flex flex-col items-center justify-center relative overflow-hidden rounded-[32rpx] kawaii-shadow p-6 min-h-[220px]">
          <view class="z-10 flex flex-col items-center text-center">
            <view class="bg-primary-fixed/50 p-4 rounded-[32px] floating-element">
              <image class="w-[100rpx] h-[100rpx] object-contain" src="/static/logo.png" mode="aspectFit"></image>
            </view>
            <text class="text-on-surface font-headline-lg text-[44rpx] font-bold mt-4 tracking-tight">校园墙 Campus Wall</text>
            <text class="text-on-surface-variant text-[24rpx] font-medium tracking-wide mt-1">嘉应学院专属校园社交平台</text>
          </view>
        </section>

        <!-- 2. 产品特色：Q弹色彩异步网格 -->
        <section class="space-y-3">
          <text class="font-headline-md text-[30rpx] font-bold text-on-surface px-1 block">产品特色</text>
          <view class="grid grid-cols-2 gap-3">
            <view class="bg-white rounded-[24px] p-4 flex flex-col items-center justify-center gap-2 kawaii-shadow min-h-[140rpx] bouncy-tap">
              <text class="material-symbols-outlined text-primary text-[48rpx]">forum</text>
              <text class="text-[24rpx] font-bold text-on-surface">动态分享</text>
            </view>
            <view class="bg-white rounded-[24px] p-4 flex flex-col items-center justify-center gap-2 kawaii-shadow min-h-[140rpx] bouncy-tap">
              <text class="material-symbols-outlined text-secondary text-[48rpx]">smart_toy</text>
              <text class="text-[24rpx] font-bold text-on-surface">AI 助手</text>
            </view>
            <view class="bg-white rounded-[24px] p-4 flex flex-col items-center justify-center gap-2 kawaii-shadow min-h-[140rpx] bouncy-tap">
              <text class="material-symbols-outlined text-tertiary text-[48rpx]">newspaper</text>
              <text class="text-[24rpx] font-bold text-on-surface">校园资讯</text>
            </view>
            <view class="bg-white rounded-[24px] p-4 flex flex-col items-center justify-center gap-2 kawaii-shadow min-h-[140rpx] bouncy-tap">
              <text class="material-symbols-outlined text-primary text-[48rpx]">chat_bubble</text>
              <text class="text-[24rpx] font-bold text-on-surface">私信交流</text>
            </view>
          </view>
        </section>

        <!-- 3. 合规文档手账白描卡片群组 -->
        <section class="space-y-3">
          <text class="font-headline-md text-[30rpx] font-bold text-on-surface px-1 block">合规及法律文档</text>
          <view class="bg-white rounded-[32rpx] p-2 kawaii-shadow relative overflow-hidden">
            <view v-for="(item, idx) in docLinks" :key="item.type" @click="navigateToDocument(item.type)">
              <view class="flex items-center justify-between p-4 active:bg-surface-container-low transition-colors rounded-full bouncy-tap">
                <view class="flex items-center gap-3">
                  <view class="w-8 h-8 rounded-full bg-primary-fixed/50 flex items-center justify-center">
                    <text class="material-symbols-outlined text-primary text-[28rpx]">{{ item.icon }}</text>
                  </view>
                  <text class="text-[28rpx] font-bold text-on-surface">{{ item.title }}</text>
                </view>
                <text class="material-symbols-outlined text-outline-variant text-[40rpx]">chevron_right</text>
              </view>
              <view class="mx-4 h-px bg-outline-variant/20 last:hidden" v-if="idx < docLinks.length - 1"></view>
            </view>
          </view>
        </section>

        <!-- 4. 底部声明与更新提示板 -->
        <footer class="mt-12 flex flex-col items-center text-center opacity-40 py-4">
          <view class="flex gap-1.5 mb-2">
            <span class="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-secondary-container"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-tertiary-container"></span>
          </view>
          <text class="text-[22rpx] font-bold text-outline">当前版本: {{ currentVersion }}</text>
          <text class="text-[20rpx] text-outline mt-1">© 2026 校园墙运营团队 All Rights Reserved</text>
        </footer>

      </view>
    </scroll-view>

    </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight || 20)
const currentVersion = ref('v1.0.0')

// 手账文档节点映射配置
const docLinks = [
  { title: '关于校园墙', type: 'about', icon: 'menu_book' },
  { title: '隐私政策说明', type: 'privacy', icon: 'lock' },
  { title: '社区服务协议', type: 'terms', icon: 'description' },
  { title: '独立版权声明', type: 'copyright', icon: 'copyright' }
]

onLoad(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 20
})

// 分发跳入各个独立的合规法律文件富文本页
const navigateToDocument = (type) => {
  uni.navigateTo({
    url: `/pages/document/document?type=${type}`,
    fail: () => {
      uni.showToast({ title: '页面跳转开小差了', icon: 'none' })
    }
  })
}

const goBack = () => uni.navigateBack()
</script>

<style scoped>
/* 拦截并彻底隐藏原生系统的多余僵硬滚动条纹 */
::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  color: transparent;
}

/* 萌系Q弹纽扣触控回弹 */
.bouncy-tap:active {
  transform: scale(0.96);
  transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 弥散阴影基板 */
.kawaii-shadow {
  box-shadow: 0 12rpx 40rpx rgba(255, 143, 163, 0.08);
}

/* 品牌Logo可爱的上下微浮动律动 */
.floating-element {
  animation: floating 3s ease-in-out infinite;
}
@keyframes floating {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8rpx); }
}
</style>