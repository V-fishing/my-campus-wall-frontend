<template>
  <view class="bg-background text-on-surface font-body-lg min-h-screen flex flex-col selection:bg-primary-fixed selection:text-on-primary-fixed relative pb-[200rpx]">

    <header class="sticky top-0 z-[60] bg-background/85 backdrop-blur-md flex justify-between items-center w-full px-margin-page border-b border-outline-variant/20 transition-all"
            :style="{ paddingTop: statusBarHeight + 'px', height: (statusBarHeight + 56) + 'px' }">
      <view class="bouncy-tap p-2 -ml-2 text-on-surface-variant flex items-center justify-center" @click="handleCancel">
        <text class="material-symbols-outlined text-[56rpx]">close</text>
      </view>
      <text class="font-headline-lg text-[36rpx] text-primary font-bold">发布新贴</text>
      <view class="w-10"></view> </header>

    <main class="flex-1 px-margin-page pb-[200rpx]">
      <section class="mt-4 mb-6">
        <textarea
          class="w-full h-40 bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline-variant font-body-lg resize-none text-[32rpx] leading-relaxed"
          placeholder="分享此刻的校园生活... (支持 AI 润色哦)"
          v-model="content"
          :maxlength="1000"
        ></textarea>
        <view class="flex justify-end mt-2">
          <text class="font-label-sm text-[24rpx] text-outline-variant">{{ content.length }}/1000</text>
        </view>
      </section>

      <section class="grid grid-cols-3 gap-3 mb-8">
        <view class="relative aspect-square rounded-[32rpx] overflow-hidden shadow-[0_8px_20px_rgba(255,143,163,0.1)] border-[4rpx] border-white bg-surface-container" v-for="(img, index) in images" :key="index">
          <image :src="img" class="w-full h-full object-cover" mode="aspectFill" @click="previewImage(index)"></image>

          <view v-if="imageUploadStatus[index] === 'uploading'" class="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
            <text class="material-symbols-outlined text-white text-[56rpx] animate-spin">sync</text>
          </view>
          <view v-else-if="imageUploadStatus[index] === 'success'" class="absolute inset-0 bg-[#4CD964]/20 flex items-center justify-center pointer-events-none">
            <text class="material-symbols-outlined text-white text-[56rpx]" style="font-variation-settings: 'FILL' 1;">check_circle</text>
          </view>
          <view v-else-if="imageUploadStatus[index] === 'error'" class="absolute inset-0 bg-error/40 backdrop-blur-[2px] flex flex-col items-center justify-center bouncy-tap" @click.stop="retryUpload(index)">
            <text class="material-symbols-outlined text-white text-[48rpx]">error</text>
            <text class="text-white text-[22rpx] font-bold mt-1">重试</text>
          </view>

          <view class="absolute top-2 right-2 w-[48rpx] h-[48rpx] bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center bouncy-tap z-10" @click.stop="removeImage(index)">
            <text class="material-symbols-outlined text-white text-[32rpx]">close</text>
          </view>
        </view>

        <view class="aspect-square rounded-[32rpx] dashed-doodle flex flex-col items-center justify-center text-outline-variant bouncy-tap bg-surface-container-lowest" v-if="images.length < 9" @click="chooseImage">
          <text class="material-symbols-outlined text-[64rpx]">add</text>
          <text class="font-label-sm text-[24rpx] font-bold mt-1">添加图片</text>
        </view>
      </section>

      <section class="space-y-6">

        <view class="bg-surface-container-low rounded-[40rpx] p-[32rpx] shadow-[0_4px_12px_rgba(255,143,163,0.06)] border border-outline-variant/20">
          <view class="flex justify-between items-center mb-4">
            <view class="flex items-center gap-2">
              <text class="material-symbols-outlined text-primary-container text-[48rpx]" style="font-variation-settings: 'FILL' 1;">auto_awesome</text>
              <text class="font-headline-md text-[32rpx] text-on-surface font-bold">AI 智能标签</text>
            </view>
            <view class="bouncy-tap bg-primary/10 text-primary px-4 py-1.5 rounded-full font-bold text-[24rpx]" @click="generateAiTags">生成</view>
          </view>

          <view class="flex flex-wrap gap-2" v-if="aiTags.length > 0">
            <text class="bg-secondary-container/30 text-secondary px-3 py-1.5 rounded-full text-[24rpx] font-bold border border-secondary-container/20 transition-all active:scale-95" v-for="tag in aiTags" :key="tag">
              #{{ tag }}
            </text>
          </view>
          <text class="text-outline-variant text-[26rpx] block mt-2" v-else>点击右上角，让 AI 为你的文案提取个性标签 ✨</text>
        </view>

        <view class="bg-white rounded-[40rpx] p-2 shadow-sm border border-outline-variant/20">
          <!-- 分区选择 -->
          <view class="flex items-center justify-between p-4 border-b border-outline-variant/20 bouncy-tap" @click="showGroupPicker">
            <view class="flex items-center gap-3">
              <text class="material-symbols-outlined text-on-surface-variant text-[44rpx]">folder</text>
              <text class="text-on-surface text-[30rpx] font-bold">分区</text>
            </view>
            <view class="flex items-center gap-1 text-primary text-[28rpx] font-bold">
              <text class="truncate max-w-[300rpx]">{{ selectedGroup ? selectedGroup.name : '选择分区' }}</text>
              <text class="material-symbols-outlined text-[40rpx]">chevron_right</text>
            </view>
          </view>

          <!-- 标签选择 -->
          <view class="flex items-center justify-between p-4 border-b border-outline-variant/20 bouncy-tap" @click="showTagPicker">
            <view class="flex items-center gap-3">
              <text class="material-symbols-outlined text-on-surface-variant text-[44rpx]">label</text>
              <text class="text-on-surface text-[30rpx] font-bold">标签</text>
            </view>
            <view class="flex items-center gap-1 text-primary text-[28rpx] font-bold">
              <text class="truncate max-w-[300rpx]">{{ allTagLabels || '选择标签' }}</text>
              <text class="material-symbols-outlined text-[40rpx]">chevron_right</text>
            </view>
          </view>

          <view class="flex items-center justify-between p-[32rpx] border-b border-outline-variant/20">
            <view class="flex items-center gap-3 shrink-0">
              <text class="material-symbols-outlined text-on-surface-variant text-[44rpx]" style="font-variation-settings: 'FILL' 1;">location_on</text>
              <text class="text-on-surface text-[30rpx] font-bold">地点</text>
            </view>
            <view class="flex items-center justify-end flex-1 ml-4 overflow-hidden">
              <view class="bg-[#FFE1E6] text-[#9B4053] px-[24rpx] py-[12rpx] rounded-full text-[24rpx] font-bold truncate max-w-full" v-if="location">
                {{ location }}
              </view>
              <text v-else class="text-outline-variant text-[26rpx]">未获取到位置</text>
            </view>
          </view>

          <view class="flex items-center justify-between p-4">
            <view class="flex items-center gap-3">
              <text class="material-symbols-outlined text-on-surface-variant text-[44rpx]">visibility_off</text>
              <text class="text-on-surface text-[30rpx] font-bold">匿名发布</text>
            </view>
            <switch :checked="isAnonymous" @change="isAnonymous = $event.detail.value" color="#ffb2bd" style="transform:scale(0.9)" />
          </view>
        </view>

        <!-- 板块差异化字段（按所选分区 code 动态显示，02~05） -->
        <view v-if="boardFieldsVisible" class="bg-white rounded-[40rpx] p-[32rpx] shadow-sm border border-outline-variant/20 space-y-5">
          <text class="font-headline-md text-[30rpx] font-bold text-on-surface block">{{ selectedGroup.name }} · 补充信息</text>

          <!-- 二手交易：价格(必填,可面议) -->
          <block v-if="selectedBoardCode === 'secondhand'">
            <view class="bf-row">
              <text class="bf-label">价格 <text class="text-[#FF3B30]">*</text></text>
              <input v-model="price" type="digit" :disabled="negotiable" class="bf-input"
                     :placeholder="negotiable ? '面议' : '请输入出售价格(元)'" />
            </view>
            <view class="flex items-center justify-between">
              <text class="bf-label">面议（不填价格）</text>
              <switch :checked="negotiable" @change="negotiable = $event.detail.value" color="#FF8FA3" style="transform:scale(0.9)" />
            </view>
          </block>

          <!-- 兼职发布：薪资(必填) + 信息费 -->
          <block v-if="selectedBoardCode === 'parttime'">
            <view class="bf-row">
              <text class="bf-label">薪资 <text class="text-[#FF3B30]">*</text></text>
              <input v-model="salary" class="bf-input" placeholder="如:150元/天、80/小时、面议" maxlength="50" />
            </view>
            <view class="bf-row">
              <text class="bf-label">信息费</text>
              <input v-model="infoFee" class="bf-input" placeholder="如:无、50元(选填)" maxlength="50" />
            </view>
          </block>

          <!-- 推广：Banner 海报横图(单图上传) -->
          <block v-if="selectedBoardCode === 'promotion'">
            <text class="bf-label block">推广 Banner 海报（横图，建议 16:9）</text>
            <image v-if="bannerPreview" :src="bannerPreview" class="w-full rounded-2xl mt-2" mode="widthFix" @click="chooseBanner"></image>
            <view v-else class="banner-upload mt-2" @click="chooseBanner">
              <text class="material-symbols-outlined text-[56rpx]">add_photo_alternate</text>
              <text class="text-[24rpx] mt-1 font-bold">上传横向 Banner</text>
            </view>
          </block>

          <!-- 联系方式（二手/兼职/推广/组队 通用，选填，公开展示） -->
          <view class="bf-row">
            <text class="bf-label">联系方式</text>
            <input v-model="contact" class="bf-input" placeholder="微信/手机号(选填,将公开展示在帖子上)" maxlength="100" />
          </view>
        </view>
      </section>
    </main>

    <!-- 分区选择弹窗 -->
    <view class="fixed inset-0 z-[1000] flex items-end" v-if="showGroupModal" @click="closeGroupModal">
      <view class="absolute inset-0  transition-opacity"></view>

      <view class="bg-white w-full max-h-[75vh] rounded-t-[48rpx] flex flex-col shadow-2xl overflow-hidden animate-slideUp" @click.stop>

        <view class="flex justify-between items-center px-[40rpx] py-[32rpx]">
          <text class="text-[36rpx] font-bold text-on-surface">选择分区</text>
          <view class="w-[64rpx] h-[64rpx] bg-surface-container flex items-center justify-center rounded-full active:scale-90" @click="closeGroupModal">
            <text class="material-symbols-outlined text-[40rpx] text-on-surface-variant">close</text>
          </view>
        </view>

        <scroll-view scroll-y class="flex-1 w-full" style="height: 50vh;">
          <view class="px-[40rpx] pb-[80rpx] pt-2">
            <view v-for="group in categoryGroups.filter(g => g.name !== '推荐')" :key="group.id"
                  class="flex items-center justify-between p-4 mb-2 rounded-[24rpx] transition-all active:scale-95 border-[3rpx]"
                  :class="selectedGroup?.id === group.id ? 'border-primary bg-[#FFF0F3]' : 'border-transparent bg-[#F5F6F8]'"
                  @click="selectGroup(group)">
              <text class="text-[28rpx] font-bold" :class="selectedGroup?.id === group.id ? 'text-[#9B4053]' : 'text-on-surface'">{{ group.name }}</text>
              <text v-if="selectedGroup?.id === group.id" class="material-symbols-outlined text-primary text-[32rpx]">check_circle</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 标签选择弹窗 -->
    <view class="fixed inset-0 z-[1000] flex items-end" v-if="showTagModal" @click="closeTagModal">
      <view class="absolute inset-0 transition-opacity"></view>

      <view class="bg-white w-full max-h-[75vh] rounded-t-[48rpx] flex flex-col shadow-2xl overflow-hidden animate-slideUp" @click.stop>

        <view class="flex justify-between items-center px-[40rpx] py-[32rpx]">
          <text class="text-[36rpx] font-bold text-on-surface">选择标签</text>
          <view class="w-[64rpx] h-[64rpx] bg-surface-container flex items-center justify-center rounded-full active:scale-90" @click="closeTagModal">
            <text class="material-symbols-outlined text-[40rpx] text-on-surface-variant">close</text>
          </view>
        </view>

        <scroll-view scroll-y class="flex-1 w-full" style="height: 50vh;">
          <view class="px-[40rpx] pb-[80rpx]">
            <!-- 未选择分区提示 -->
            <view v-if="!selectedGroup" class="py-12 text-center">
              <text class="material-symbols-outlined text-[64rpx] text-outline-variant mb-2">folder_open</text>
              <text class="text-[28rpx] text-outline-variant block">请先选择分区</text>
            </view>

            <!-- 分区下的标签 -->
            <view v-else>
              <text class="text-[24rpx] font-bold text-outline-variant mb-4 block uppercase tracking-wide">{{ selectedGroup.name }} 标签（可多选）</text>
              <view class="flex flex-wrap gap-3">
                <view class="flex items-center gap-1.5 px-4 py-2.5 rounded-full transition-all active:scale-95 border-[3rpx]"
                      :class="selectedTopics.includes(child.name) ? 'border-primary bg-[#FFF0F3]' : 'border-transparent bg-[#F5F6F8]'"
                      v-for="child in selectedGroup.children" :key="child.id" @click="toggleTopic(child.name)">
                  <text class="text-[26rpx] font-bold" :class="selectedTopics.includes(child.name) ? 'text-[#9B4053]' : 'text-on-surface'">#{{ child.name }}</text>
                  <text class="text-[18rpx] text-outline-variant ml-1">{{ child.postCount || 0 }} 帖</text>
                </view>
              </view>
            </view>

            <!-- 自定义话题 -->
            <view class="mt-8">
              <text class="text-[24rpx] font-bold text-outline-variant mb-4 block uppercase tracking-wide">自定义话题</text>
              <view class="flex gap-3 items-center">
                <input class="flex-1 h-[88rpx] bg-[#F5F6F8] rounded-[44rpx] px-[32rpx] text-[28rpx] text-on-surface placeholder:text-outline-variant"
                       v-model="customTopic" placeholder="输入话题名称（如：期末复习）" maxlength="20" />
                <view class="h-[88rpx] px-[48rpx] rounded-[44rpx] flex items-center justify-center text-[28rpx] font-bold transition-all duration-300"
                      :class="customTopic.trim() ? 'bg-gradient-to-br from-[#FF8FA3] to-[#C5A3FF] text-white shadow-md active:scale-95' : 'bg-[#E0E0E0] text-[#999]'"
                      @click="createCustomTopic">添加</view>
              </view>

              <view class="flex flex-wrap gap-3 mt-4" v-if="customTags.length > 0">
                <view class="flex items-center gap-2 px-4 py-1.5 bg-[#FFF9F0] border-2 border-[#FFE8CC] rounded-full" v-for="(tag, idx) in customTags" :key="idx">
                  <text class="text-[26rpx] font-bold text-[#D48806]">#{{ tag }}</text>
                  <text class="text-[32rpx] text-[#D48806] ml-1 active:scale-125 transition-transform" @click="removeCustomTag(idx)">×</text>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>

    <view class="fixed bottom-0 left-0 w-full z-[70] bg-white pt-4 pb-[env(safe-area-inset-bottom)] ">
      <view class="px-[32rpx] pb-[24rpx]">
        <view
          class="w-full h-[100rpx] flex items-center justify-center rounded-[50rpx] font-bold text-[36rpx] transition-all duration-300 active:scale-95"
          :class="canPublish
            ? 'text-white shadow-[0_12px_32px_rgba(255,143,163,0.3)]'
            : 'bg-[#F4F5F7] text-[#C1C1C1] shadow-none'"
          :style="canPublish ? 'background: linear-gradient(135deg, #FF8FA3 0%, #FFB2BD 100%);' : ''"
          @click="submitPost"
        >
          发布贴纸 ✨
        </view>
      </view>
    </view>
  </view>
</template>
<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { post, get } from '@/utils/request.js'
import { postApi, categoryApi, fileApi, userApi } from '@/api/index.js'
import { config } from '@/config'

const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight)

// 表单数据
const content = ref('')
const images = ref([])
const uploadedObjectNames = ref([])
const imageUploadStatus = ref({})
const aiTags = ref([])
const selectedTopics = ref([])
const customTags = ref([])
const location = ref('')
const isAnonymous = ref(false)
const uploadingCount = ref(0)

// 板块差异化字段（02~05）
const price = ref('')
const negotiable = ref(false)
const salary = ref('')
const infoFee = ref('')
const contact = ref('')
const bannerObjectName = ref('')   // 推广 Banner 的 MinIO objectName
const bannerPreview = ref('')      // 本地预览路径

const MAX_TAGS = 5

// 分区/标签相关
const showGroupModal = ref(false)
const showTagModal = ref(false)
const categoryGroups = ref([])
const topicList = ref([])
const customTopic = ref('')
const selectedGroup = ref(null)

const totalTagsCount = computed(() => {
  return aiTags.value.length + selectedTopics.value.length + customTags.value.length
})

const allTagLabels = computed(() => {
  const tags = [...selectedTopics.value, ...customTags.value]
  return tags.join(', ')
})

const canPublish = computed(() => {
  return content.value.trim().length > 0 || images.value.length > 0
})

// 所选板块 code（recommend/secondhand/parttime/promotion/team）
const selectedBoardCode = computed(() => selectedGroup.value?.code || '')
// 哪些板块需要展示补充信息字段区
const boardFieldsVisible = computed(() =>
  ['secondhand', 'parttime', 'promotion', 'team'].includes(selectedBoardCode.value)
)

// 加载用户信息
const loadUserInfo = async () => {
  try {
    const response = await get(userApi.getCurrentUserInfo().url)
    if (response.code === 200 && response.data) {
      const userInfo = response.data
      if (userInfo.college && userInfo.campus) {
        location.value = `${userInfo.college} ${userInfo.campus}`
      } else if (userInfo.college) {
        location.value = userInfo.college
      } else {
        location.value = ''
      }
    }
  } catch (error) {
    location.value = ''
  }
}

onShow(() => {
  loadUserInfo()
})

loadUserInfo()

const handleCancel = () => {
  uni.showModal({
    title: '提示',
    content: '内容尚未发布，确定要退出吗？',
    confirmColor: '#FF3B30',
    success: (res) => {
      if (res.confirm) {
        uni.navigateBack()
      }
    }
  })
}

const chooseImage = async () => {
  const count = 9 - images.value.length
  uni.chooseImage({
    count: count,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      const tempFilePaths = res.tempFilePaths
      images.value = [...images.value, ...tempFilePaths]
      await uploadTempImages(tempFilePaths)
    }
  })
}

const uploadTempImages = async (filePaths) => {
  if (!filePaths || filePaths.length === 0) return

  const startIndex = images.value.length - filePaths.length
  uploadingCount.value = filePaths.length

  for (let i = 0; i < filePaths.length; i++) {
    imageUploadStatus.value[startIndex + i] = 'uploading'
  }

  uni.showLoading({ title: `上传中 0/${filePaths.length}` })

  try {
    const token = uni.getStorageSync('token')
    const newObjectNames = []

    // #ifndef H5
    for (let i = 0; i < filePaths.length; i++) {
      try {
        const objectName = await uploadSingleImage(filePaths[i], token)
        newObjectNames.push(objectName)
        imageUploadStatus.value[startIndex + i] = 'success'
        uploadingCount.value--
        uni.showLoading({ title: `上传中 ${i + 1}/${filePaths.length}` })
      } catch (error) {
        imageUploadStatus.value[startIndex + i] = 'error'
        uni.showToast({ title: `第 ${i + 1} 张图片上传失败`, icon: 'none' })
      }
    }
    // #endif

    // #ifdef H5
    const apiUrl = fileApi.uploadPostTempImages().url
    const formData = new FormData()
    for (let i = 0; i < filePaths.length; i++) {
      const response = await fetch(filePaths[i])
      const blob = await response.blob()
      formData.append('files', blob, `image_${Date.now()}_${i}.jpg`)
    }

    const uploadRes = await fetch(`${config.apiBaseUrl}${apiUrl}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    })
    const result = await uploadRes.json()
    if (result.code === 200 && result.data) {
      newObjectNames.push(...result.data.map(item => item.objectName))
      for (let i = 0; i < filePaths.length; i++) {
        imageUploadStatus.value[startIndex + i] = 'success'
      }
    } else {
      throw new Error(result.message || '上传失败')
    }
    // #endif

    uploadedObjectNames.value = [...uploadedObjectNames.value, ...newObjectNames]
    uni.hideLoading()

  } catch (error) {
    uni.hideLoading()
    for (let i = 0; i < filePaths.length; i++) {
      if (imageUploadStatus.value[startIndex + i] === 'uploading') {
        imageUploadStatus.value[startIndex + i] = 'error'
      }
    }
    uni.showToast({ title: '图片上传失败', icon: 'none' })
  } finally {
    uploadingCount.value = 0
  }
}

const retryUpload = async (index) => {
  const filePath = images.value[index]
  if (!filePath) return

  imageUploadStatus.value[index] = 'uploading'
  try {
    const token = uni.getStorageSync('token')
    const objectName = await uploadSingleImage(filePath, token)
    uploadedObjectNames.value[index] = objectName
    imageUploadStatus.value[index] = 'success'
  } catch (error) {
    imageUploadStatus.value[index] = 'error'
    uni.showToast({ title: '重试失败', icon: 'none' })
  }
}

const uploadSingleImage = (filePath, token) => {
  return new Promise((resolve, reject) => {
    const apiUrl = fileApi.uploadPostTempImage().url
    uni.uploadFile({
      url: `${config.apiBaseUrl}${apiUrl}`,
      filePath: filePath,
      name: 'file',
      header: { 'Authorization': `Bearer ${token}` },
      success: (res) => {
        const data = JSON.parse(res.data)
        if (data.code === 200) resolve(data.data.objectName)
        else reject(new Error(data.message || '上传失败'))
      },
      fail: (err) => { reject(new Error(err.errMsg || '网络请求失败')) }
    })
  })
}

// 推广 Banner 单图上传（复用 uploadSingleImage）
const chooseBanner = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      const filePath = res.tempFilePaths[0]
      bannerPreview.value = filePath
      uni.showLoading({ title: '上传 Banner...' })
      try {
        const token = uni.getStorageSync('token')
        bannerObjectName.value = await uploadSingleImage(filePath, token)
        uni.showToast({ title: 'Banner 上传成功', icon: 'success' })
      } catch (e) {
        bannerPreview.value = ''
        uni.showToast({ title: 'Banner 上传失败', icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    }
  })
}

const previewImage = (index) => {
  uni.previewImage({ urls: images.value, current: index })
}

const removeImage = (index) => {
  images.value.splice(index, 1)
  uploadedObjectNames.value.splice(index, 1)
}

const generateAiTags = async () => {
  if (!content.value) return uni.showToast({ title: '请先输入帖子内容', icon: 'none' })
  if (totalTagsCount.value >= MAX_TAGS) return uni.showToast({ title: `最多${MAX_TAGS}个标签`, icon: 'none' })

  uni.showLoading({ title: 'AI 提取中...' })
  try {
    const res = await post('/api/v1/ai/tags/generate', { text: content.value })
    if (res.code === 200 && res.data) {
      const newTags = res.data.tags || []
      const remainingSlots = MAX_TAGS - totalTagsCount.value
      aiTags.value = newTags.slice(0, remainingSlots)
      uni.showToast({
        title: aiTags.value.length > 0 ? '提取成功' : '未识别到标签',
        icon: 'none',
      })
    } else {
      throw new Error(res.message || '提取失败')
    }
  } catch {
    uni.showToast({ title: 'AI 服务暂不可用', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

const showGroupPicker = async () => {
  showGroupModal.value = true
  if (categoryGroups.value.length === 0) {
    try {
      const response = await get(categoryApi.getGroups().url)
      if (response.code === 200 && response.data) {
        categoryGroups.value = response.data
        topicList.value = response.data.flatMap(g => g.children || [])
      }
    } catch (error) {
      uni.showToast({ title: '加载分区失败', icon: 'none' })
    }
  }
}

const selectGroup = (group) => {
  selectedGroup.value = group
  closeGroupModal()
}

const closeGroupModal = () => {
  showGroupModal.value = false
}

const showTagPicker = async () => {
  showTagModal.value = true
  if (categoryGroups.value.length === 0) {
    try {
      const response = await get(categoryApi.getGroups().url)
      if (response.code === 200 && response.data) {
        categoryGroups.value = response.data
        topicList.value = response.data.flatMap(g => g.children || [])
      }
    } catch (error) {
      uni.showToast({ title: '加载标签失败', icon: 'none' })
    }
  }
}

const closeTagModal = () => {
  showTagModal.value = false
  customTopic.value = ''
}

const toggleTopic = (topicName) => {
  const index = selectedTopics.value.indexOf(topicName)
  if (index > -1) {
    selectedTopics.value.splice(index, 1)
  } else {
    if (totalTagsCount.value >= MAX_TAGS) return uni.showToast({ title: `最多${MAX_TAGS}个标签`, icon: 'none' })
    selectedTopics.value.push(topicName)
  }
}

const createCustomTopic = () => {
  if (!customTopic.value.trim()) return uni.showToast({ title: '请输入话题名称', icon: 'none' })
  if (totalTagsCount.value >= MAX_TAGS) return uni.showToast({ title: `最多${MAX_TAGS}个标签`, icon: 'none' })

  const newTag = customTopic.value.trim()
  if (customTags.value.includes(newTag)) return uni.showToast({ title: '该话题已添加', icon: 'none' })

  customTags.value.push(newTag)
  customTopic.value = ''
}

const removeCustomTag = (index) => {
  customTags.value.splice(index, 1)
}

const submitPost = async () => {
  if (!canPublish.value) return
  if (uploadingCount.value > 0) return uni.showToast({ title: '图片上传中，请稍候', icon: 'none' })

  // 板块必填校验（与后端 BoardType 校验对齐）
  const boardCode = selectedBoardCode.value
  if (boardCode === 'secondhand' && !negotiable.value && (!price.value || Number(price.value) < 0)) {
    return uni.showToast({ title: '二手交易帖请填写价格，或勾选"面议"', icon: 'none' })
  }
  if (boardCode === 'parttime' && !salary.value.trim()) {
    return uni.showToast({ title: '兼职帖请填写薪资', icon: 'none' })
  }

  uni.showLoading({ title: '发布中...' })

  try {
    const postData = {
      category: selectedGroup.value?.name || '日常',
      content: content.value,
      images: uploadedObjectNames.value,
      aiTags: [...selectedTopics.value, ...customTags.value],
      customTags: customTags.value,
      location: location.value,
      isAnonymous: isAnonymous.value,
      scope: uni.getStorageSync('publishScope') ?? 0,
      // 板块差异化字段（后端按 BoardType 取用，无关字段忽略）
      price: (boardCode === 'secondhand' && !negotiable.value && price.value) ? Number(price.value) : null,
      negotiable: boardCode === 'secondhand' ? negotiable.value : false,
      salary: boardCode === 'parttime' ? salary.value : null,
      infoFee: boardCode === 'parttime' ? infoFee.value : null,
      contact: contact.value || null,
      bannerImage: boardCode === 'promotion' ? bannerObjectName.value : null
    }

    const response = await post(postApi.publishPost(postData).url, postData)

    if (response.code === 200) {
      uni.hideLoading()
      uni.showToast({ title: '发布成功', icon: 'success' })
      uploadedObjectNames.value = []
      const returnScope = uni.getStorageSync('publishScope') || 0
      uni.removeStorageSync('publishScope')
      uni.setStorageSync('hasNewPost', true)

      setTimeout(() => {
        uni.switchTab({
          url: returnScope === 1 ? '/pages/discover/discover' : '/pages/index/index'
        })
      }, 1500)
    } else {
      throw new Error(response.message || '发布失败')
    }
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: error.message || '发布失败，请重试', icon: 'none' })
  }
}
</script>

<style scoped>
/* 隐藏滚动条 */
::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  color: transparent;
}

/* 按钮点击回弹效果 */
.bouncy-tap:active {
  transform: scale(0.95);
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.bouncy-spring:active {
  transform: scale(1.05);
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
.animate-slideUp {
  animation: slideUp 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

/* 涂鸦虚线边框，使用 base64 svg 让虚线更圆润可爱 */
.dashed-doodle {
  background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='16' ry='16' stroke='%23DAC0C3' stroke-width='2' stroke-dasharray='8%2c 8' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e");
}

.hide-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

/* 板块差异化字段区 */
.bf-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}
.bf-label {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  width: 160rpx;
  flex-shrink: 0;
}
.bf-input {
  flex: 1;
  height: 80rpx;
  background: #f5f6f8;
  border-radius: 40rpx;
  padding: 0 28rpx;
  font-size: 28rpx;
  color: #333;
}
.banner-upload {
  width: 100%;
  height: 220rpx;
  border-radius: 24rpx;
  background: #f5f6f8;
  border: 4rpx dashed #DAC0C3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #b0a0a3;
}

</style>
