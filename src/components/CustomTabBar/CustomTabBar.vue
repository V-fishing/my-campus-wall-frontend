<template>
  <view class="fixed bottom-0 left-0 right-0 z-[999] tab-bar-container">
    <view class="tabs-wrapper">
      
      <view class="active-indicator" :style="{ transform: `translateX(${localCurrent * 100}%)` }">
        <view class="indicator-pill"></view>
      </view>

      <view 
        v-for="(item, index) in tabList" 
        :key="index"
        class="tab-item bouncy-press"
        @click="handleSwitch(item.pagePath, index)"
      >
        <text class="material-symbols-outlined tab-icon" 
              :style="localCurrent === index ? 'font-variation-settings: \'FILL\' 1;' : 'font-variation-settings: \'FILL\' 0;'"
              :class="localCurrent === index ? 'text-active' : 'text-inactive'">
          {{ item.icon }}
        </text>
        
        <text class="tab-text font-medium" :class="localCurrent === index ? 'text-active' : 'text-inactive'">
          {{ item.text }}
        </text>
      </view>

    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  current: {
    type: Number,
    default: 0
  }
})

// 使用本地状态控制动画，防止在跳转瞬间状态丢失
const localCurrent = ref(props.current)

// 监听父组件传入的 current 变化
watch(() => props.current, (newVal) => {
  localCurrent.value = newVal
})

// Tab 核心配置数据
const tabList = [
  { pagePath: '/pages/index/index', text: '圈子', icon: 'group' },
  { pagePath: '/pages/discover/discover', text: '发现', icon: 'explore' },
  { pagePath: '/pages/ai/chat', text: 'AI', icon: 'auto_awesome' },
  { pagePath: '/pages/message/message', text: '私信', icon: 'chat_bubble' },
  { pagePath: '/pages/user/profile', text: '我的', icon: 'person' }
]

// 切换页面的方法
// 注意：不在这里 optimistic 更新 localCurrent，完全由 props.current 驱动，
// 避免 uni.switchTab 完成前出现"指示器已过去、页面还没过去"的抖动。
const handleSwitch = (url, index) => {
  if (localCurrent.value === index) return

  uni.switchTab({
    url,
    fail: () => {
      console.error('Tab 跳转失败:', url)
    }
  })
}
</script>

<style scoped>
/* 底部栏大容器 */
.tab-bar-container {
  padding-bottom: env(safe-area-inset-bottom);
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-top-left-radius: 40rpx;
  border-top-right-radius: 40rpx;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.03);
  border-top: 1px solid rgba(218, 192, 195, 0.3);
  overflow: visible;
}

.tabs-wrapper {
  position: relative;
  display: flex;
  width: 100%;
  height: 120rpx;
  align-items: center;
  padding: 0 8rpx;
}

/* 🟢 滑动指示器外壳：占屏幕 1/5 宽度，跟随点击横向移动 */
.active-indicator {
  position: absolute;
  left: 0;
  top: 0;
  width: 20%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  /* 平滑跟随 current prop 变化，避免跳变 */
  transition: transform 0.22s cubic-bezier(0.25, 0.46, 0.45, 0.94);

  z-index: 1;
}

/* 🟢 真正的粉色胶囊本体 */
.indicator-pill {
  width: 110rpx;
  height: 96rpx;
  background-color: #FFE1E6;
  border-radius: 32rpx;
}

/* 单个 Tab 按钮基础样式 */
.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  position: relative;
  z-index: 2; /* 确保图标和文字层级高于粉色背景块 */
}

/* 文字与图标的颜色过渡 */
.text-active {
  color: #9B4053;
  transition: color 0.3s ease;
}

.text-inactive {
  color: #877274;
  transition: color 0.3s ease;
}

.tab-icon {
  font-size: 48rpx;
  margin-bottom: 2rpx;
  transition: color 0.2s ease;
}

.tab-text {
  font-size: 20rpx;
  transition: color 0.2s ease;
}

/* 底部栏取消点击缩放，避免切换时产生抖动 */
.tab-bar-container .bouncy-press:active {
  transform: none;
}
</style>