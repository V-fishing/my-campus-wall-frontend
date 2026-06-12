<template>
  <view class="avatar-stack">
    <view
      v-for="(item, i) in stackItems"
      :key="i"
      class="stack-item"
      :class="[item.type === 'placeholder' ? 'stack-placeholder' : '', item.type === 'badge' ? 'stack-badge' : '']"
      :style="{ marginLeft: i === 0 ? '0' : overlap, zIndex: i + 1 }"
    >
      <image
        v-if="item.type === 'avatar'"
        :src="item.src || defaultAvatar"
        class="stack-avatar"
        mode="aspectFill"
      />
      <span v-else-if="item.type === 'placeholder'" class="material-symbols-outlined text-[28rpx] text-white">person</span>
      <text v-else-if="item.type === 'badge'" class="badge-text">+{{ item.count }}</text>
    </view>

    <text v-if="stackItems.length === 0" class="empty-hint">还没有人加入，快来组队~</text>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  avatars: { type: Array, default: () => [] },
  max:     { type: Number, default: 5 },        // 最多展示几个头像（含占位/溢出角标）
  overlap: { type: String, default: '-18rpx' }, // 叠放重叠量
  missingCount: { type: Number, default: 0 },   // 缺人占位数量
})

const defaultAvatar = '/static/images/anonymous-avatar.png'

const stackItems = computed(() => {
  const list = []
  // 若需要展示缺人占位/溢出角标，预留一个槽位
  const realMax = props.missingCount > 0 ? Math.max(0, props.max - 1) : props.max
  const overflow = Math.max(0, (props.avatars || []).length - realMax)
  const shownAvatars = (props.avatars || []).slice(0, realMax)

  shownAvatars.forEach((src) => {
    list.push({ type: 'avatar', src })
  })

  if (overflow > 0) {
    list.push({ type: 'badge', count: overflow })
  } else if (props.missingCount === 1) {
    list.push({ type: 'placeholder' })
  } else if (props.missingCount > 1) {
    list.push({ type: 'badge', count: props.missingCount })
  }

  return list
})
</script>

<style scoped>
.avatar-stack {
  display: flex;
  align-items: center;
}
.stack-item {
  position: relative;
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  border: 2rpx solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stack-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #eee;
}
.stack-placeholder {
  background: #bdbdbd;
}
.stack-badge {
  background: #FF8FA3;
}
.badge-text {
  color: #fff;
  font-size: 22rpx;
  font-weight: bold;
}
.empty-hint {
  font-size: 22rpx;
  color: #9a9a9a;
}
</style>
