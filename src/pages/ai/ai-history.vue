<template>
  <view class="bg-[#F4F5F7] min-h-screen flex flex-col relative selection:bg-primary-container selection:text-on-primary-container">
    
    <header class="fixed top-0 left-0 w-full z-50 bg-[#F4F5F7]/85 backdrop-blur-md border-b-2 border-dashed border-outline-variant/30 h-[88px] flex flex-col justify-end pb-3">
      <view class="flex items-center px-margin-page h-[44px] relative">
        <view class="flex items-center justify-center w-8 h-8 rounded-full bouncy-tap text-on-surface" @click="goBack">
          <text class="material-symbols-outlined text-[40rpx]">chevron_left</text>
        </view>
        <h1 class="absolute left-1/2 -translate-x-1/2 font-headline-lg-mobile text-[36rpx] text-primary font-extrabold tracking-tight">AI对话历史</h1>
        <div class="ml-auto w-[90px]"></div>
      </view>
    </header>

    <scroll-view scroll-y class="flex-1 w-full" :style="{ paddingTop: '88px' }">
      <view class="px-margin-page pb-10">
        
        <view class="py-6 flex flex-col items-center">
          <view class="flex items-center gap-2 mb-2">
            <text class="material-symbols-outlined text-primary-container animate-bounce text-[36rpx]" style="font-variation-settings: 'FILL' 1;">auto_awesome</text>
            <text class="text-label-md font-label-md text-on-surface-variant opacity-60 text-[26rpx]">记录你的好奇心 ✨</text>
            <text class="material-symbols-outlined text-primary-container animate-pulse text-[36rpx]" style="font-variation-settings: 'FILL' 1;">favorite</text>
          </view>
        </view>

        <view class="mt-12 flex flex-col items-center justify-center text-center px-8" v-if="!loading && historyList.length === 0">
          <view class="w-32 h-32 rounded-full bg-secondary-container/20 flex items-center justify-center mb-6 relative sticker-shadow">
            <text class="text-[80rpx]">📚</text>
            <view class="absolute -top-1 -right-1 bg-primary-container text-white p-2 rounded-full shadow-sm">
              <text class="material-symbols-outlined text-[24rpx]">edit</text>
            </view>
          </view>
          <text class="font-body-lg text-on-surface-variant text-opacity-80 leading-relaxed text-[28rpx] block mb-6">
            还没有向 AI 学长提问过哦~<br/>灵感总是值得被珍藏的。
          </text>
          <view class="w-full px-6">
            <button class="w-full h-11 bg-gradient-to-r from-[#FF8FA3] to-[#FFB3C1] text-white font-bold rounded-full shadow-md bouncy-tap flex items-center justify-center gap-2 text-[28rpx]" @click="goToNewChat">
              去问问学长 ✨
            </button>
          </view>
        </view>

        <view v-else-if="historyList.length > 0">
          <view class="bg-surface-container-lowest rounded-[40rpx] border-2 border-dashed border-outline-variant/60 p-2 shadow-sm overflow-hidden">
            <view v-for="(item, index) in historyList" :key="item.sessionId" @click="goToChatDetail(item.sessionId)">
              
              <view class="bouncy-card bg-white flex items-center p-4 rounded-[36rpx] my-1 transition-all active:bg-surface-container-low">
                <view class="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-[#E3F2FD] to-[#BBDEFB] shadow-inner shrink-0 sticker-shadow">
                  <text class="text-xl">🤖</text>
                </view>
                <view class="ml-4 flex-1 min-w-0 pr-2">
                  <text class="font-headline-md-mobile text-[30rpx] text-on-surface font-bold truncate block">{{ item.firstQuestion || '新的对话贴纸' }}</text>
                  <text class="font-label-sm-mobile text-[22rpx] text-outline-variant block mt-1">{{ item.createTime }}</text>
                </view>
                <view class="shrink-0 flex items-center">
                  <text class="material-symbols-outlined text-outline-variant text-[36rpx]">chevron_right</text>
                </view>
              </view>

              <view class="mx-4 h-px bg-outline-variant/20 my-1 last:hidden" v-if="index < historyList.length - 1"></view>
            </view>
          </view>

          <view class="text-center padding-inner pt-6">
            <text class="text-[22rpx] text-outline-variant/60 font-medium">- 仅展示最近的对话记录 -</text>
          </view>
        </view>

        <view class="text-center py-20" v-if="loading">
          <text class="material-symbols-outlined animate-spin text-primary text-[56rpx]">sync</text>
          <text class="block text-outline-variant mt-2 text-[24rpx]">正在翻阅档案袋...</text>
        </view>

      </view>
    </scroll-view>

    <view class="fixed bottom-12 right-6 pointer-events-none opacity-20">
      <text class="material-symbols-outlined text-primary text-[72rpx] animate-pulse" style="font-variation-settings: 'FILL' 1;">favorite</text>
    </view>
  </view>
</template>

<script>
import { get } from "@/utils/request";
import { aiApi } from "@/api";

export default {
  data() {
    return {
      loading: true,
      statusBarHeight: uni.getSystemInfoSync().statusBarHeight || 20,
      historyList: [] 
    };
  },
  onShow() {
    this.fetchHistoryList();
  },
  methods: {
    goBack() {
      uni.navigateBack({ delta: 1 });
    },
    async fetchHistoryList() {
      this.loading = true;
      const userInfo = uni.getStorageSync('userInfo');
      const userId = userInfo?.id || userInfo?.userId;
      
      if (!userId) {
        uni.showToast({ title: '请先登录', icon: 'none' });
        this.loading = false;
        return;
      }
      
      try {
        const response = await get(aiApi.getHistory(userId).url, { userId });
        if (response.code === 200 || response.success) {
          this.historyList = response.data || [];
        } else {
          uni.showToast({ title: response.message || '获取记录失败', icon: 'none' });
        }
      } catch (error) {
        console.error('❌ 获取会话列表失败:', error);
        uni.showToast({ title: '网络异常', icon: 'none' });
      } finally {
        this.loading = false;
      }
    },
    goToChatDetail(sessionId) {
      if (!sessionId) {
        uni.showToast({ title: '会话ID无效', icon: 'none' });
        return;
      }
      // ⚠️ chat 是 TabBar 页面，携参必须写入全局缓存，由 chat 页面在 onShow 中读取还原
      uni.setStorageSync('activeSessionId', sessionId);
      uni.switchTab({
        url: '/pages/ai/chat'
      });
    },
    goToNewChat() {
      uni.removeStorageSync('activeSessionId'); // 清除老会话，开启纯新对话
      uni.switchTab({
        url: '/pages/ai/chat'
      });
    }
  }
};
</script>

<style scoped>
/* 拦截所有平台系统的多余滚动条 */
::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  color: transparent;
}

/* 带有Q弹手感的回弹动态反馈 */
.bouncy-tap:active {
  transform: scale(0.95);
  transition: transform 0.15rpx cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 果冻卡片多层次白描外阴影 */
.sticker-shadow {
  filter: drop-shadow(0 0 2rpx #ffffff) drop-shadow(0 4rpx 12rpx rgba(255, 143, 163, 0.15));
}

/* 虚线涂鸦围栏 */
.dashed-doodle {
  border: 4rpx dashed #dac0c3;
}
</style>