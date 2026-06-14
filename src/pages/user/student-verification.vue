<template>
  <view class="bg-[#fef8f8] min-h-screen pb-12">
    <header class="sticky top-0 z-[60] bg-surface/85 backdrop-blur-md border-b border-dashed border-outline-variant/30 flex items-center px-margin-page transition-all"
            :style="{ paddingTop: statusBarHeight + 'px', height: (statusBarHeight + 56) + 'px' }">
      <view class="bouncy-tap p-2 -ml-2 text-primary" @click="goBack">
        <text class="material-symbols-outlined text-[56rpx]">arrow_back_ios</text>
      </view>
      <text class="font-headline-md text-[36rpx] text-primary font-bold absolute left-1/2 -translate-x-1/2">学生认证</text>
    </header>

    <main class="pt-6 px-margin-page">
      <!-- 状态卡片 -->
      <view class="mochi-bg sugar-card rounded-[32rpx] p-6 mb-6">
        <view class="flex items-center gap-3 mb-3">
          <text class="text-[48rpx]">{{ statusIcon }}</text>
          <view>
            <text class="font-bold text-[32rpx] text-on-surface">{{ statusName }}</text>
            <text class="text-[24rpx] text-outline mt-0.5 block" v-if="statusRemark">{{ statusRemark }}</text>
          </view>
        </view>
        <view v-if="studentNoMask" class="mt-4 pt-4 border-t border-surface-variant/30">
          <view class="flex justify-between text-[26rpx] mb-1">
            <text class="text-outline">认证学号</text>
            <text class="text-on-surface font-medium">{{ studentNoMask }}</text>
          </view>
          <view class="flex justify-between text-[26rpx]">
            <text class="text-outline">真实姓名</text>
            <text class="text-on-surface font-medium">{{ realNameMask }}</text>
          </view>
        </view>
      </view>

      <!-- AI 审核中提示 -->
      <view v-if="isReviewing" class="mochi-bg sugar-card rounded-[32rpx] p-6 mb-6 flex flex-col items-center justify-center">
        <text class="material-symbols-outlined text-primary text-[64rpx] animate-spin">sync</text>
        <text class="text-[28rpx] font-bold text-on-surface mt-3">AI 正在识别学生证信息</text>
        <text class="text-[24rpx] text-outline mt-1">请稍候，完成后会自动更新结果</text>
      </view>

      <!-- 上传区 -->
      <view v-if="canEdit">
        <text class="text-[24rpx] font-bold text-outline ml-4 mb-2 uppercase tracking-wider">上传学生证</text>
        <view class="mochi-bg sugar-card rounded-[32rpx] p-6 mb-6">
          <view class="grid grid-cols-2 gap-4">
            <view class="aspect-[3/4] rounded-[24rpx] border-4 border-dashed border-outline-variant/30 flex items-center justify-center relative overflow-hidden bg-surface-container-low"
                  @click="handleImageClick('front')">
              <image v-if="frontUrl" :src="frontUrl" class="w-full h-full" mode="aspectFill" key="front-img" />
              <view v-if="!frontUrl" class="flex flex-col items-center justify-center absolute inset-0">
                <text class="material-symbols-outlined text-[64rpx] text-primary/60">add_photo_alternate</text>
                <text class="text-[24rpx] text-outline mt-2">点击上传正面</text>
              </view>
            </view>

            <view class="aspect-[3/4] rounded-[24rpx] border-4 border-dashed border-outline-variant/30 flex items-center justify-center relative overflow-hidden bg-surface-container-low"
                  @click="handleImageClick('back')">
              <image v-if="backUrl" :src="backUrl" class="w-full h-full" mode="aspectFill" key="back-img" />
              <view v-if="!backUrl" class="flex flex-col items-center justify-center absolute inset-0">
                <text class="material-symbols-outlined text-[64rpx] text-primary/60">add_photo_alternate</text>
                <text class="text-[24rpx] text-outline mt-2">点击上传反面</text>
              </view>
            </view>
          </view>

          <view class="mt-4 text-[22rpx] text-outline leading-relaxed">
            <text class="material-symbols-outlined text-[24rpx] align-middle mr-1">info</text>
            请确保照片清晰、信息完整。点击已上传图片可双指放大浏览。提交后 AI 将直接进行初筛。
          </view>
        </view>

        <button
          class="w-full h-[100rpx] rounded-[50rpx] bg-primary text-white font-bold text-[30rpx] bouncy-press flex items-center justify-center disabled:opacity-50"
          :disabled="!frontTempPath || !backTempPath || submitting || isReviewing"
          @click="handleSubmit"
        >
          {{ isReviewing ? 'AI 审核中...' : (submitting ? '提交认证中...' : '提交认证') }}
        </button>
      </view>

      <!-- 仅展示 -->
      <view v-else-if="status === 'manual_passed' || status === 'manual_rejected'">
        <view class="mochi-bg sugar-card rounded-[32rpx] p-6">
          <text class="text-[28rpx] font-bold text-on-surface mb-4">认证材料</text>
          <view class="grid grid-cols-2 gap-4">
            <view class="aspect-[3/4] rounded-[24rpx] overflow-hidden bg-surface-container-low flex items-center justify-center">
              <image v-if="frontUrl" :src="frontUrl" class="w-full h-full" mode="aspectFill" @click="previewImages('front')" />
            </view>
            <view class="aspect-[3/4] rounded-[24rpx] overflow-hidden bg-surface-container-low flex items-center justify-center">
              <image v-if="backUrl" :src="backUrl" class="w-full h-full" mode="aspectFill" @click="previewImages('back')" />
            </view>
          </view>
        </view>
      </view>
    </main>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onShow, onHide } from '@dcloudio/uni-app'
import { get, post } from '@/utils/request.js'
import { verificationApi } from '@/api/index.js'

const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight || 20)

const status = ref('pending')
const statusName = ref('待提交')
const statusRemark = ref('')
const studentNoMask = ref('')
const realNameMask = ref('')
const frontUrl = ref('')
const backUrl = ref('')
const frontTempPath = ref('')
const backTempPath = ref('')
const frontObjectName = ref('')
const backObjectName = ref('')
const submitting = ref(false)
let pollTimer = null

const isReviewing = computed(() => status.value === 'submitted')

const canEdit = computed(() => {
  return ['pending', 'ai_failed', 'manual_rejected'].includes(status.value)
})

const statusIcon = computed(() => {
  switch (status.value) {
    case 'manual_passed': return '🎓'
    case 'submitted': return '📤'
    case 'ai_passed': return '🤖'
    case 'ai_failed': return '🔍'
    case 'manual_rejected': return '❌'
    default: return '📝'
  }
})

onShow(() => {
  loadStatus().then(() => {
    if (isReviewing.value) {
      startPolling()
    }
  })
})

onHide(() => {
  stopPolling()
})

const loadStatus = async () => {
  try {
    const response = await get(verificationApi.getStatus().url)
    if (response.code === 200 && response.data) {
      const data = response.data
      status.value = data.status
      statusName.value = data.statusName
      statusRemark.value = data.reviewRemark || ''
      studentNoMask.value = data.studentNoMask || ''
      realNameMask.value = data.realNameMask || ''
      frontUrl.value = data.frontUrl || ''
      backUrl.value = data.backUrl || ''
      // AI 初筛未通过时清空页面图片，方便用户重新上传
      if (status.value === 'ai_failed') {
        clearSelectedImages()
      }
      // 非编辑态时清理本地临时路径
      if (!canEdit.value) {
        frontTempPath.value = ''
        backTempPath.value = ''
      }
      // 审核完成后给出一次性提示
      if (status.value === 'ai_passed') {
        uni.showToast({ title: 'AI 初筛通过，等待人工复核', icon: 'success' })
      } else if (status.value === 'ai_failed') {
        uni.showToast({ title: data.reviewRemark || 'AI 初筛未通过，请重新上传', icon: 'none' })
      }
    }
  } catch (error) {
    console.error('加载认证状态失败:', error)
  }
}

const clearSelectedImages = () => {
  frontUrl.value = ''
  backUrl.value = ''
  frontTempPath.value = ''
  backTempPath.value = ''
  frontObjectName.value = ''
  backObjectName.value = ''
}

const startPolling = () => {
  stopPolling()
  pollTimer = setInterval(() => {
    loadStatus().then(() => {
      if (status.value !== 'submitted') {
        stopPolling()
      }
    })
  }, 2000)
}

const stopPolling = () => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

const handleImageClick = (side) => {
  const hasImage = side === 'front' ? frontUrl.value : backUrl.value
  if (hasImage) {
    previewImages(side)
  } else {
    chooseImage(side)
  }
}

const previewImages = (currentSide) => {
  const urls = []
  if (frontUrl.value) urls.push(frontUrl.value)
  if (backUrl.value) urls.push(backUrl.value)
  if (urls.length === 0) return
  uni.previewImage({
    urls,
    current: currentSide === 'front' ? 0 : (urls.length > 1 ? 1 : 0)
  })
}

const chooseImage = (side) => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      const tempFilePath = res.tempFilePaths?.[0] || res.tempFiles?.[0]?.path || ''
      if (!tempFilePath) {
        uni.showToast({ title: '选择图片失败', icon: 'none' })
        return
      }
      if (side === 'front') {
        frontTempPath.value = tempFilePath
        frontUrl.value = tempFilePath
        frontObjectName.value = ''
      } else {
        backTempPath.value = tempFilePath
        backUrl.value = tempFilePath
        backObjectName.value = ''
      }
    },
    fail: () => {
      uni.showToast({ title: '选择图片失败', icon: 'none' })
    }
  })
}

const uploadImageAsync = (filePath, side) => {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token')
    const apiConfig = verificationApi.uploadImage(side)
    uni.uploadFile({
      url: `${getBaseUrl()}${apiConfig.url}`,
      filePath,
      name: 'file',
      header: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        try {
          const data = JSON.parse(res.data)
          if (data.code === 200 && data.data) {
            resolve(data.data)
          } else {
            reject(new Error(data.message || '上传失败'))
          }
        } catch (e) {
          reject(new Error('上传失败'))
        }
      },
      fail: () => reject(new Error('上传失败'))
    })
  })
}

const handleSubmit = async () => {
  if (!frontTempPath.value || !backTempPath.value) {
    uni.showToast({ title: '请上传正反面图片', icon: 'none' })
    return
  }
  submitting.value = true
  uni.showLoading({ title: '上传并审核中...', mask: true })
  try {
    const [frontResult, backResult] = await Promise.all([
      uploadImageAsync(frontTempPath.value, 'front'),
      uploadImageAsync(backTempPath.value, 'back')
    ])

    frontObjectName.value = frontResult.objectName
    frontUrl.value = frontResult.url
    backObjectName.value = backResult.objectName
    backUrl.value = backResult.url

    const response = await post(verificationApi.submit({
      frontObjectName: frontObjectName.value,
      backObjectName: backObjectName.value
    }).url, {
      frontObjectName: frontObjectName.value,
      backObjectName: backObjectName.value
    })
    if (response.code === 200) {
      // 提交成功，进入 AI 审核中状态，前端轮询结果
      status.value = 'submitted'
      statusName.value = 'AI 审核中'
      frontTempPath.value = ''
      backTempPath.value = ''
      startPolling()
    } else {
      uni.showToast({ title: response.message || '提交失败', icon: 'none' })
    }
  } catch (error) {
    console.error('提交认证失败:', error)
    uni.showToast({ title: error.message || '提交失败', icon: 'none' })
  } finally {
    uni.hideLoading()
    submitting.value = false
  }
}

const getBaseUrl = () => {
  return import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8080'
}

const goBack = () => uni.navigateBack()
</script>

<style scoped>
.sugar-card {
  border: 4rpx dashed #ffb2bd;
  box-shadow: 0 12rpx 40rpx rgba(255, 143, 163, 0.12);
}
.mochi-bg { background: linear-gradient(135deg, #ffffff 0%, #fff5f6 100%); }
.bouncy-press:active { transform: scale(0.97); transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }
</style>
