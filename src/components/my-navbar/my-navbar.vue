<template>
  <view class="nav-container" :style="{ paddingTop: statusBarHeight + 'px' }">
    <view class="nav-content">
      <view class="icon-box" @click="handleSearch">
        <text class="iconfont">🔍</text>
      </view>
      
      <view class="tabs">
        <view class="tab active">
          <text>嘉应</text>
          <view class="active-line"></view>
        </view>
        <view class="tab">
          <text>关注</text>
        </view>
      </view>
      
      <view class="capsule-placeholder"></view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 获取手机状态栏高度，完美适配各种屏幕
const statusBarHeight = ref(20)

onMounted(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 20
})

// 点击搜索跳转
const handleSearch = () => {
  uni.navigateTo({ url: '/pages/search/search' })
}
</script>

<style scoped>
.nav-container {
  position: fixed; /* 核心：固定在顶部 */
  top: 0;
  left: 0;
  width: 100%;
  background-color: $uni-bg-color;
  z-index: 999; /* 层级最高，确保不被帖子挡住 */
}

.nav-content {
  height: 44px; /* 微信小程序标准导航栏高度 */
  display: flex;
  align-items: center;
  padding: 0 30rpx;
}

.icon-box {
  font-size: 36rpx;
  color: $uni-text-color-grey; /* 匹配你图中的灰色搜索 */
  margin-right: 20rpx;
}

.tabs {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-end; /* 让 Tabs 的字体基线对齐 */
  gap: 40rpx;
  padding-right: 40rpx; /* 微调居中位置 */
}

.tab {
  font-size: 30rpx; /* 未选中的字体大小 */
  color: $uni-text-color-grey; /* 未选中的灰色 */
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 6rpx; /* 给激活线腾出位置 */
}

.tab.active {
  font-size: 36rpx; /* 还原选中的字体加粗和变大 */
  font-weight: bold;
  color: $uni-text-color;
}

.active-line {
  width: 36rpx;
  height: 6rpx;
  background-color: $uni-color-primary;
  border-radius: 6rpx;
  margin-top: 4rpx;
}

.capsule-placeholder {
  width: 174rpx; /* 留出微信胶囊按钮的位置 */
}
</style>