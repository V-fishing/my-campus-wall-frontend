<template>
  <view class="bg-[#fef8f8] min-h-screen pb-[220rpx] selection:bg-primary-container selection:text-on-primary-container relative">
    
    <header class="fixed top-0 left-0 w-full z-50 bg-[#fef8f8]/85 backdrop-blur-md border-b-2 border-dashed border-outline-variant/30 flex items-center px-margin-page transition-all"
            :style="{ paddingTop: statusBarHeight + 'px', height: (statusBarHeight + 56) + 'px' }">
      <view class="flex items-center w-full justify-between pr-[100rpx]">
        <view class="bouncy-tap p-2 -ml-2 text-primary flex items-center justify-center" @click="goBack">
          <text class="material-symbols-outlined text-[48rpx]">arrow_back_ios</text>
        </view>
        <text class="font-headline-md text-[36rpx] text-primary font-bold absolute left-1/2 -translate-x-1/2">AI偏好设置</text>
      </view>
    </header>

    <scroll-view scroll-y class="w-full h-screen" :style="{ paddingTop: (statusBarHeight + 64) + 'px' }">
      <view class="px-margin-page space-y-8 pb-[260rpx] pt-4">
        
        <section class="animate-fade-in">
          <view class="flex items-center gap-2 mb-4">
            <text class="material-symbols-outlined text-primary text-[40rpx]" style="font-variation-settings: 'FILL' 1;">auto_awesome</text>
            <text class="font-headline-md text-[32rpx] text-on-surface-variant font-bold">AI性格</text>
          </view>
          <view class="grid grid-cols-2 gap-gutter-card">
            <view v-for="item in personalityOptions" :key="item.value"
                  @click="preference.personality = item.value"
                  class="rounded-[40rpx] p-5 flex flex-col items-center justify-center space-y-2 border-2 transition-all active:scale-95 relative"
                  :class="preference.personality === item.value ? 'peach-gradient text-white border-white sticker-stroke shadow-md' : 'bg-white border-dashed border-outline-variant/60'">
              <text class="material-symbols-outlined text-[64rpx]" :class="preference.personality === item.value ? 'text-white' : 'text-outline'">{{ item.icon }}</text>
              <text class="font-label-md text-[28rpx] font-bold">{{ item.label }}</text>
              <view v-if="preference.personality === item.value" class="absolute top-3 right-3 bg-white rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                <text class="material-symbols-outlined text-primary text-[24rpx] font-bold">check</text>
              </view>
            </view>
          </view>
        </section>

        <section class="animate-fade-in">
          <view class="flex items-center gap-2 mb-4">
            <text class="material-symbols-outlined text-primary text-[40rpx]" style="font-variation-settings: 'FILL' 1;">translate</text>
            <text class="font-headline-md text-[32rpx] text-on-surface-variant font-bold">语言风格</text>
          </view>
          <view class="bg-white rounded-[48rpx] border-2 border-dashed border-outline-variant/60 overflow-hidden kawaii-shadow">
            <view v-for="item in styleOptions" :key="item.value"
                  @click="preference.languageStyle = item.value"
                  class="flex items-center justify-between p-4 border-b border-outline-variant/20 last:border-b-0 transition-colors active:bg-surface-container-low"
                  :class="preference.languageStyle === item.value ? 'bg-tertiary-fixed/30' : ''">
              <text class="text-[30rpx]" :class="preference.languageStyle === item.value ? 'text-on-tertiary-container font-bold' : 'text-on-surface-variant'">{{ item.label }}</text>
              <view class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
                    :class="preference.languageStyle === item.value ? 'border-primary bg-primary' : 'border-outline-variant'">
                <view v-if="preference.languageStyle === item.value" class="w-2 h-2 bg-white rounded-full"></view>
              </view>
            </view>
          </view>
        </section>

        <section class="animate-fade-in">
          <view class="flex items-center gap-2 mb-4">
            <text class="material-symbols-outlined text-primary text-[40rpx]" style="font-variation-settings: 'FILL' 1;">school</text>
            <text class="font-headline-md text-[32rpx] text-on-surface-variant font-bold">擅长领域</text>
          </view>
          <view class="flex flex-wrap gap-3">
            <view v-for="item in areaOptions" :key="item.value"
                  @click="preference.expertiseArea = item.value"
                  class="px-5 py-2.5 rounded-full text-[26rpx] font-bold flex items-center gap-1 border-2 transition-all active:scale-95 cursor-pointer"
                  :class="preference.expertiseArea === item.value ? 'purple-gradient text-on-secondary-container border-white sticker-stroke shadow-sm' : 'bg-white border-outline-variant/60 text-outline'">
              <text v-if="preference.expertiseArea === item.value" class="material-symbols-outlined text-[28rpx]">check</text>
              {{ item.label }}
            </view>
          </view>
        </section>

        <section class="animate-fade-in">
          <view class="flex items-center gap-2 mb-4">
            <text class="material-symbols-outlined text-primary text-[40rpx]" style="font-variation-settings: 'FILL' 1;">short_text</text>
            <text class="font-headline-md text-[32rpx] text-on-surface-variant font-bold">回复长度</text>
          </view>
          <view class="bg-white rounded-[48rpx] p-6 border-2 border-dashed border-outline-variant/60 space-y-6 kawaii-shadow">
            <view class="relative w-full px-2">
              <slider 
                :value="getSliderValue(preference.responseLength)"
                @change="onSliderChange"
                min="0" max="2" step="1"
                activeColor="#9b4053"
                backgroundColor="#f2eced"
                block-color="#9b4053"
                block-size="20"
              />
            </view>
            <view class="flex justify-between text-[26rpx] px-2">
              <text :class="preference.responseLength === 'short' ? 'text-primary font-bold text-[30rpx]' : 'text-outline'">精简</text>
              <text :class="preference.responseLength === 'medium' ? 'text-primary font-bold text-[30rpx]' : 'text-outline'">适中</text>
              <text :class="preference.responseLength === 'long' ? 'text-primary font-bold text-[30rpx]' : 'text-outline'">详细</text>
            </view>
          </view>
        </section>

        <section class="animate-fade-in">
          <view class="flex items-center gap-2 mb-4">
            <text class="material-symbols-outlined text-primary text-[40rpx]" style="font-variation-settings: 'FILL' 1;">edit_note</text>
            <text class="font-headline-md text-[32rpx] text-on-surface-variant font-bold">自定义指令</text>
          </view>
          <view class="bg-white rounded-[48rpx] p-5 border-2 border-dashed border-outline-variant/60 relative focus-within:border-primary transition-all kawaii-shadow">
            <textarea 
              class="w-full h-32 bg-transparent border-none text-[28rpx] leading-relaxed text-on-surface placeholder:text-outline-variant/60" 
              placeholder="描述你希望AI学长如何回答... (例如：希望学长多鼓励我，使用更多颜文字 🌟)"
              v-model="preference.customPrompt"
              maxlength="500"
            ></textarea>
            <view class="text-right text-[22rpx] text-outline-variant/80 mt-2 font-medium">
              {{ preference.customPrompt ? preference.customPrompt.length : 0 }} / 500
            </view>
          </view>
        </section>
      </view>
    </scroll-view>

    <view class="fixed bottom-0 left-0 w-full z-[90] bg-gradient-to-t from-[#fef8f8] via-[#fef8f8] to-transparent pt-4 pb-[calc(24rpx+env(safe-area-inset-bottom))] flex justify-center">
      <view class="w-full px-margin-page">
        <view 
          class="w-full h-[100rpx] flex items-center justify-center rounded-[50rpx] font-bold text-[36rpx] text-white shadow-[0_12px_32px_rgba(255,143,163,0.35)] transition-all duration-300 bouncy-tap"
          style="background: linear-gradient(135deg, #ff8fa3 0%, #ffb2bd 100%);"
          @click="handleSave"
        >
          保存偏好 ✨
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { get, post } from '../../utils/request.js'
import { aiPreferenceApi } from '../../api/aiPreference.js'

const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight || 20)

// 映射核心配置选项
const personalityOptions = [
  { label: '亲和亲切', value: 'friendly', icon: 'sentiment_satisfied' },
  { label: '专业严谨', value: 'professional', icon: 'verified_user' },
  { label: '幽默风趣', value: 'humorous', icon: 'mood' },
  { label: '温柔体贴', value: 'gentle', icon: 'favorite' }
]

const styleOptions = [
  { label: '正式规范', value: 'formal' },
  { label: '随性随意', value: 'casual' },
  { label: '学术辅导', value: 'academic' },
  { label: '轻松休闲', value: 'relaxed' }
]

const areaOptions = [
  { label: '校园生活', value: 'general' },
  { label: '学术科研', value: 'academic' },
  { label: '职业发展', value: 'life' },
  { label: '技术咨询', value: 'tech' },
  { label: '情感树洞', value: 'emotion' }
]

// 响应式偏好设置实体
const preference = ref({
  personality: 'friendly',
  languageStyle: 'casual',
  expertiseArea: 'general',
  responseLength: 'medium',
  customPrompt: ''
})

onLoad(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 20
  fetchPreference()
})

// 读取偏好设置逻辑
const fetchPreference = async () => {
  try {
    const response = await get(aiPreferenceApi.getPreference().url)
    if (response.code === 200 && response.data) {
      const data = response.data
      preference.value = {
        personality: data.personality || 'friendly',
        languageStyle: data.languageStyle || 'casual',
        expertiseArea: data.expertiseArea || 'general',
        responseLength: data.responseLength || 'medium',
        customPrompt: data.customPrompt || ''
      }
    }
  } catch (error) {
    console.error('❌ 获取偏好设置失败:', error)
  }
}

// 异步保存处理
const handleSave = async () => {
  try {
    uni.showLoading({ title: '保存贴纸中...' })
    const apiConfig = aiPreferenceApi.savePreference(preference.value)
    const response = await post(apiConfig.url, apiConfig.data)
    
    uni.hideLoading()
    if (response.code === 200) {
      uni.vibrateShort()
      uni.showToast({ title: '配置已生效', icon: 'success' })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: '保存失败，请重试', icon: 'none' })
  }
}

// Slider 滑块状态映射机
const getSliderValue = (length) => {
  const map = { short: 0, medium: 1, long: 2 }
  return map[length] ?? 1
}

const onSliderChange = (e) => {
  const map = { 0: 'short', 1: 'medium', 2: 'long' }
  preference.value.responseLength = map[e.detail.value] ?? 'medium'
  uni.vibrateShort()
}

const goBack = () => uni.navigateBack()
</script>

<style scoped>
/* 隐藏系统的硬性滚动条 */
::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  color: transparent;
}

/* 萌系Q弹点击手感机制 */
.bouncy-tap:active {
  transform: scale(0.96);
  transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 弥散阴影 */
.kawaii-shadow {
  box-shadow: 0 12rpx 40rpx rgba(255, 143, 163, 0.12);
}

/* 贴纸高光边缘过滤 */
.sticker-stroke {
  filter: drop-shadow(0 0 2rpx #ffffff) drop-shadow(0 4rpx 8rpx rgba(255, 143, 163, 0.15));
}

/* 三大核心粉紫渐变色盘体系 */
.peach-gradient {
  background: linear-gradient(135deg, #ff8fa3 0%, #ffb2bd 100%);
}
.purple-gradient {
  background: linear-gradient(135deg, #c5a3ff 0%, #ecdcff 100%);
}

/* 淡化动画 */
.animate-fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10rpx); }
  to { opacity: 1; transform: translateY(0); }
}
</style>