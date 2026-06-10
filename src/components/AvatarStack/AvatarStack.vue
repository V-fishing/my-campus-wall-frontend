<template>
  <view class="avatar-stack">
    <image
      v-for="(a, i) in displayAvatars"
      :key="i"
      :src="a || defaultAvatar"
      class="stack-avatar"
      :style="{ marginLeft: i === 0 ? '0' : overlap, zIndex: displayAvatars.length - i }"
      mode="aspectFill"
    />
    <!-- 刻意不渲染 "+N" / "3/5" 等数字，仅叠放头像（需求 05）。空成员时显示占位提示。 -->
    <text v-if="displayAvatars.length === 0" class="empty-hint">还没有人加入，快来组队~</text>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  avatars: { type: Array, default: () => [] },
  max:     { type: Number, default: 5 },        // 最多展示几个头像
  overlap: { type: String, default: '-18rpx' }, // 叠放重叠量
})

const defaultAvatar = '/static/images/anonymous-avatar.png'
const displayAvatars = computed(() => (props.avatars || []).slice(0, props.max))
</script>

<style scoped>
.avatar-stack {
  display: flex;
  align-items: center;
}
.stack-avatar {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  border: 2rpx solid #fff;       /* 白描边突出叠放层次 */
  background: #eee;
}
.empty-hint {
  font-size: 22rpx;
  color: #9a9a9a;
}
</style>
