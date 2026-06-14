<template>
  <view class="bg-[#F4F5F7] min-h-screen pb-[240rpx] selection:bg-primary-container selection:text-on-primary-container relative">
    
    <header class="fixed top-0 w-full z-50 bg-[#F4F5F7]/85 backdrop-blur-md h-[88px] flex flex-col justify-end pb-3">
      <view class="flex items-center justify-between px-margin-page h-[44px] w-full relative">
        <view class="bouncy-tap p-2 -ml-2 text-primary flex items-center justify-center" @click="goBack">
          <text class="material-symbols-outlined text-[44rpx]">arrow_back_ios</text>
        </view>
        <h1 class="absolute left-1/2 -translate-x-1/2 font-headline-md text-[34rpx] text-primary font-bold">意见反馈</h1>
        <view class="w-10"></view>
      </view>
    </header>

    <scroll-view class="w-full flex-1" scroll-y :style="{ paddingTop: '88px' }">
      <view class="px-margin-page space-y-6 pt-4 pb-[220rpx]">
        
        <section class="animate-fade-in">
          <view class="mb-3 px-1">
            <text class="font-headline-md text-[32rpx] text-on-surface font-bold block">反馈类型</text>
            <text class="text-label-md text-[24rpx] text-on-surface-variant block mt-1">请选择最符合的一项</text>
          </view>
          
          <view class="grid grid-cols-2 gap-3">
            <view v-for="item in typeOptions" :key="item.value"
                  @click="feedback.type = item.value"
                  class="bouncy-tap relative rounded-[32rpx] p-4 flex flex-col items-center justify-center space-y-2 border transition-all active:scale-95 cursor-pointer kawaii-shadow"
                  :class="feedback.type === item.value ? 'bg-primary-container/20 border-primary-container/30 text-primary' : 'bg-white border-outline-variant/20 text-on-surface-variant'">
              <text class="material-symbols-outlined text-[48rpx]" 
                    :class="feedback.type === item.value ? 'text-primary' : 'text-outline-variant'">{{ item.icon }}</text>
              <text class="text-[26rpx] font-bold" :class="feedback.type === item.value ? 'text-primary' : 'text-on-surface-variant'">{{ item.label }}</text>
              
              <view v-if="feedback.type === item.value" class="absolute top-2 right-2 bg-primary text-on-primary rounded-full w-5 h-5 flex items-center justify-center">
                <text class="material-symbols-outlined text-[20rpx]" style="font-weight: 700;">check</text>
              </view>
            </view>
          </view>
        </section>

        <section class="animate-fade-in">
          <view class="mb-3 px-1 flex items-center">
            <text class="font-headline-md text-[32rpx] text-on-surface font-bold">详细描述</text>
            <text class="text-[#ff4d4f] ml-1 font-bold text-[32rpx]">*</text>
          </view>
          <view class="relative bg-white rounded-[32rpx] p-4 kawaii-shadow">
            <textarea 
              class="w-full h-40 bg-transparent text-[28rpx] leading-relaxed text-on-surface placeholder:text-outline-variant/60" 
              placeholder="请详细描述您遇到的问题或建议，不少于 10 个字哦... (例如：嘉应AI学长的自习室开馆时间有偏差 📖)"
              v-model="feedback.content"
              maxlength="1000"
            ></textarea>
            <view class="text-right text-[22rpx] text-outline font-medium mt-1 pr-2">
              {{ feedback.content ? feedback.content.length : 0 }} / 1000
            </view>
          </view>
        </section>

        <section class="animate-fade-in">
          <text class="font-headline-md text-[32rpx] text-on-surface font-bold mb-3 px-1 block">联系方式 (选填)</text>
          <view class="bg-white rounded-[32rpx] px-6 py-3 kawaii-shadow flex items-center">
            <input
              class="w-full bg-transparent text-[28rpx] text-on-surface p-0 placeholder:text-outline-variant/60"
              placeholder="微信号、邮箱或手机号 (方便后续沟通~)"
              type="text"
              v-model="feedback.contact"
            />
          </view>
        </section>

        <section class="animate-fade-in">
          <text class="font-headline-md text-[32rpx] text-on-surface font-bold mb-3 px-1 block">上传截图 (选填)</text>
          <view class="flex flex-wrap gap-3">
            <view
              v-for="(img, idx) in tempImages"
              :key="idx"
              class="relative w-[200rpx] h-[200rpx] rounded-[32rpx] overflow-hidden border border-outline-variant/20 shadow-sm"
            >
              <image :src="img" mode="aspectFill" class="w-full h-full" @click="previewImage(idx)" />
              <view
                class="absolute top-1 right-1 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm"
                @click.stop="removeImage(idx)"
              >
                <text class="material-symbols-outlined text-white text-[20rpx]">close</text>
              </view>
            </view>

            <view
              v-if="tempImages.length < 4"
              class="w-[200rpx] h-[200rpx] rounded-[32rpx] border border-outline-variant/20 flex flex-col items-center justify-center gap-2 bouncy-tap bg-white kawaii-shadow"
              @click="chooseImage"
            >
              <text class="material-symbols-outlined text-[48rpx] text-outline-variant">photo_camera</text>
              <text class="text-[22rpx] text-outline-variant">添加截图</text>
            </view>
          </view>
        </section>

        <section class="animate-fade-in">
          <view class="bg-white rounded-[32rpx] p-5 kawaii-shadow">
            <text class="font-bold text-primary text-[30rpx] mb-2 block">💡 温馨提示</text>
            <view class="flex flex-col gap-1.5 text-[24rpx] text-on-surface-variant font-medium leading-relaxed">
              <text>1. 墙墙开发团队会认真阅读每一条反馈贴纸</text>
              <text>2. 尽量提供清晰具体的描述，以便学长更快速地定位修复</text>
              <text>3. 如有排版错误，学长将在下一版本中全量平替重构</text>
            </view>
          </view>
        </section>

      </view>
    </scroll-view>

    <view class="fixed bottom-0 left-0 w-full z-50 px-margin-page pb-[calc(24rpx+env(safe-area-inset-bottom))] pt-4 bg-[#F4F5F7]/90 backdrop-blur-md">
      <view 
        class="bouncy-tap w-full h-[100rpx] rounded-[50rpx] flex items-center justify-center text-white font-bold text-[36rpx] bg-primary active:opacity-90 transition-opacity"
        @click="handleSubmit"
      >
        提交反馈
      </view>
    </view>

  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { post } from '../../utils/request.js'
import { feedbackApi } from '../../api/feedback.js'
import { config } from '@/config'

const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight || 20)

// 映射反馈类型配置表
const typeOptions = [
  { label: '功能建议', value: 'suggestion', icon: 'lightbulb' },
  { label: 'BUG反馈', value: 'bug', icon: 'bug_report' },
  { label: '使用问题', value: 'feature', icon: 'shield' },
  { label: '其他内容', value: 'other', icon: 'edit' }
]

// 响应式表单实体
const feedback = ref({
  type: 'suggestion',
  content: '',
  contact: '',
  images: []
})

onLoad(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 20
})

// 图片上传相关
const tempImages = ref([])

const chooseImage = () => {
  const remain = 4 - tempImages.value.length
  if (remain <= 0) return
  uni.chooseImage({
    count: remain,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      tempImages.value = [...tempImages.value, ...res.tempFilePaths]
    }
  })
}

const removeImage = (index) => {
  tempImages.value.splice(index, 1)
}

const previewImage = (index) => {
  uni.previewImage({
    urls: tempImages.value,
    current: index
  })
}

const uploadSingleImage = (filePath) => {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token')
    uni.uploadFile({
      url: `${config.apiBaseUrl}/api/v1/files/post/temp-image`,
      filePath: filePath,
      name: 'file',
      header: { 'Authorization': `Bearer ${token}` },
      success: (res) => {
        try {
          const data = JSON.parse(res.data)
          if (data.code === 200) resolve(data.data.objectName)
          else reject(new Error(data.message || '上传失败'))
        } catch {
          reject(new Error('解析上传响应失败'))
        }
      },
      fail: (err) => { reject(new Error(err.errMsg || '网络请求失败')) }
    })
  })
}

// 深度异步提交验证引擎
const handleSubmit = async () => {
  if (!feedback.value.content.trim()) {
    uni.showToast({ title: '请填写反馈内容哦', icon: 'none' })
    return
  }

  if (feedback.value.content.trim().length < 10) {
    uni.showToast({ title: '多写几个字吧，至少10个字哦~', icon: 'none' })
    return
  }

  try {
    uni.showLoading({ title: '正在封装纸片...' })

    // 如果有截图，先上传图片
    let imageObjectNames = []
    if (tempImages.value.length > 0) {
      uni.showLoading({ title: `上传截图 0/${tempImages.value.length}` })
      for (let i = 0; i < tempImages.value.length; i++) {
        try {
          const objectName = await uploadSingleImage(tempImages.value[i])
          imageObjectNames.push(objectName)
          uni.showLoading({ title: `上传截图 ${i + 1}/${tempImages.value.length}` })
        } catch (err) {
          console.error('截图上传失败:', err)
          uni.showToast({ title: `第 ${i + 1} 张截图上传失败`, icon: 'none' })
        }
      }
    }

    // 构建提交数据
    const submitData = {
      ...feedback.value,
      images: imageObjectNames.length > 0 ? JSON.stringify(imageObjectNames) : null
    }

    // 调用后台反馈上传接口
    const apiConfig = feedbackApi.submitFeedback(submitData)
    const response = await post(apiConfig.url, apiConfig.data)

    uni.hideLoading()

    if (response.code === 200) {
      uni.vibrateShort()
      uni.showModal({
        title: '提交成功啦 🌟',
        content: '感谢你的反馈！学长们会马上处理的。',
        showCancel: false,
        confirmColor: '#9b4053',
        success: () => {
          // 清空重置表单
          feedback.value.content = ''
          feedback.value.contact = ''
          feedback.value.type = 'suggestion'
          feedback.value.images = []
          tempImages.value = []

          // 平滑回滚上一页
          setTimeout(() => {
            uni.navigateBack()
          }, 500)
        }
      })
    }
  } catch (error) {
    uni.hideLoading()
    console.error('❌ 意见反馈递交失败:', error)
    uni.showToast({ title: '提交失败，请稍后重试', icon: 'none' })
  }
}

const goBack = () => uni.navigateBack()
</script>

<style scoped>
/* 拦截屏蔽全系统设备多余的僵硬滚动条纹 */
::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  color: transparent;
}

/* 萌系Q弹纽扣高级回弹缓动机制 */
.bouncy-tap:active {
  transform: scale(0.96);
  transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 弥散阴影大背板 */
.kawaii-shadow {
  box-shadow: 0 12rpx 40rpx rgba(255, 143, 163, 0.08);
}

/* 淡化淡入动画轨迹 */
.animate-fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12rpx); }
  to { opacity: 1; transform: translateY(0); }
}
</style>