<template>
  <view class="bg-[#F4F5F7] min-h-screen flex flex-col">
    <!-- 顶部导航 -->
    <view class="fixed top-0 w-full z-50 bg-[#F4F5F7]/90 backdrop-blur-md shadow-sm"
          :style="{ paddingTop: statusBarHeight + 'px', height: (statusBarHeight + 56) + 'px' }">
      <view class="relative w-full h-full flex items-center px-4">
        <view class="w-9 h-9 flex items-center justify-center active:scale-95" @click="goBack">
          <text class="material-symbols-outlined text-[32rpx]">arrow_back_ios_new</text>
        </view>
        <text class="absolute left-1/2 -translate-x-1/2 font-bold text-[32rpx] text-on-surface">AI 帮我发帖</text>
      </view>
    </view>

    <scroll-view scroll-y class="flex-1" :style="{ paddingTop: (statusBarHeight + 64) + 'px' }">
      <view class="px-4 pb-[200rpx]">

        <!-- ============ 阶段一：描述诉求 ============ -->
        <view v-if="phase === 'input'">
          <view class="bg-white rounded-[32rpx] p-5 shadow-sm">
            <view class="flex items-center gap-2 mb-3">
              <text class="material-symbols-outlined text-tertiary text-[40rpx]">smart_toy</text>
              <text class="font-bold text-[30rpx] text-on-surface">说说你想发什么，学长帮你写</text>
            </view>
            <textarea
              v-model="userText"
              class="w-full bg-[#F7F8FA] rounded-2xl p-4 text-[28rpx] text-on-surface min-h-[200rpx]"
              placeholder="例如：出一台自用 iPad Air5，9成新，要价2600可小刀；或：求一个周末兼职，时薪30以上&#10;（可附图，学长会看图识物自动补充信息）"
              maxlength="600" />

            <!-- 图片选择 -->
            <view class="grid grid-cols-4 gap-2 mt-4">
              <view v-for="(img, i) in previews" :key="i" class="relative aspect-square rounded-2xl overflow-hidden bg-surface-variant">
                <image :src="img.preview" class="w-full h-full" mode="aspectFill" />
                <view class="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center" @click="removeImage(i)">
                  <text class="material-symbols-outlined text-white text-[28rpx]">close</text>
                </view>
                <view v-if="img.status === 'uploading'" class="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <text class="material-symbols-outlined text-white animate-spin text-[36rpx]">sync</text>
                </view>
                <view v-if="img.status === 'error'" class="absolute inset-0 bg-black/50 flex items-center justify-center" @click="removeImage(i)">
                  <text class="text-white text-[22rpx]">失败·删除</text>
                </view>
              </view>
              <view v-if="previews.length < 9" class="aspect-square rounded-2xl flex flex-col items-center justify-center bg-[#F7F8FA] active:scale-95" @click="chooseImage">
                <text class="material-symbols-outlined text-outline-variant text-[48rpx]">add_photo_alternate</text>
              </view>
            </view>
          </view>

          <view class="mt-6 rounded-full h-[96rpx] flex items-center justify-center gap-2 shadow-md active:scale-[0.98]"
                :class="canGenerate ? 'bg-tertiary' : 'bg-surface-variant'"
                @click="generateDraft">
            <text v-if="!loading" class="material-symbols-outlined text-white text-[40rpx]">auto_awesome</text>
            <text v-else class="material-symbols-outlined text-white animate-spin text-[40rpx]">sync</text>
            <text class="text-white font-bold text-[30rpx]">{{ loading ? '学长正在写草稿…' : '让学长帮我写草稿' }}</text>
          </view>
        </view>

        <!-- ============ 阶段二：草稿确认/修改 ============ -->
        <view v-else-if="phase === 'draft'">
          <view class="flex items-center justify-between mb-3">
            <text class="font-bold text-[30rpx] text-on-surface">学长写好了，看看要不要改</text>
            <text v-if="roundCount > 0" class="text-[22rpx] text-outline-variant">已改 {{ roundCount }} 版</text>
          </view>

          <!-- 草稿卡片 -->
          <view class="bg-white rounded-[32rpx] p-5 shadow-sm">
            <view class="inline-flex items-center px-3 py-1 rounded-full bg-primary-container/60 mb-3">
              <text class="text-[22rpx] text-primary font-bold">{{ draft.category || '推荐' }}</text>
            </view>
            <text class="block text-[28rpx] text-on-surface leading-relaxed whitespace-pre-line">{{ draft.content }}</text>

            <!-- 图片 -->
            <view v-if="draftImages.length" class="grid grid-cols-3 gap-2 mt-3">
              <image v-for="(u, i) in draftImages" :key="i" :src="u" class="w-full aspect-square rounded-xl" mode="aspectFill" />
            </view>

            <!-- 标签 -->
            <view v-if="draft.ai_tags && draft.ai_tags.length" class="flex flex-wrap gap-2 mt-3">
              <view v-for="(t, i) in draft.ai_tags" :key="i" class="px-2.5 py-1 rounded-full bg-[#F0F2F5]">
                <text class="text-[22rpx] text-on-surface-variant">#{{ t }}</text>
              </view>
            </view>

            <!-- 板块字段摘要 -->
            <view class="mt-3 space-y-1">
              <view v-if="draft.price != null || draft.negotiable" class="flex items-center gap-1">
                <text class="material-symbols-outlined text-[26rpx] text-[#E57373]">sell</text>
                <text class="text-[24rpx] text-[#E57373] font-bold">{{ draft.price != null ? ('¥' + draft.price) : '' }}{{ draft.negotiable ? ' 可议价' : '' }}</text>
              </view>
              <view v-if="draft.salary" class="flex items-center gap-1">
                <text class="material-symbols-outlined text-[26rpx] text-tertiary">payments</text>
                <text class="text-[24rpx] text-on-surface-variant">薪资：{{ draft.salary }}</text>
              </view>
              <view v-if="draft.location" class="flex items-center gap-1">
                <text class="material-symbols-outlined text-[26rpx] text-outline">location_on</text>
                <text class="text-[24rpx] text-on-surface-variant">{{ draft.location }}</text>
              </view>
            </view>
          </view>

          <!-- 改稿输入 -->
          <view v-if="showPatch" class="bg-white rounded-[32rpx] p-4 shadow-sm mt-4">
            <textarea v-model="patchText" class="w-full bg-[#F7F8FA] rounded-2xl p-3 text-[26rpx] min-h-[120rpx]"
                      placeholder="告诉学长哪里要改，例如：价格改成2200、正文再热情点、板块换成组队" maxlength="200" />
            <view class="flex gap-2 mt-3">
              <view class="flex-1 h-[72rpx] rounded-full bg-[#F0F2F5] flex items-center justify-center active:scale-95" @click="showPatch = false">
                <text class="text-[26rpx] text-on-surface-variant">收起</text>
              </view>
              <view class="flex-1 h-[72rpx] rounded-full flex items-center justify-center active:scale-95"
                    :class="patchText.trim() && !loading ? 'bg-tertiary' : 'bg-surface-variant'" @click="submitEdit">
                <text class="text-white text-[26rpx] font-bold">{{ loading ? '修改中…' : '让学长改' }}</text>
              </view>
            </view>
          </view>

          <!-- 操作按钮 -->
          <view v-if="!showPatch" class="mt-6 space-y-3">
            <view class="h-[96rpx] rounded-full flex items-center justify-center gap-2 shadow-md active:scale-[0.98]"
                  :class="loading ? 'bg-surface-variant' : 'bg-tertiary'" @click="publish">
              <text v-if="!loading" class="material-symbols-outlined text-white text-[40rpx]">send</text>
              <text v-else class="material-symbols-outlined text-white animate-spin text-[40rpx]">sync</text>
              <text class="text-white font-bold text-[30rpx]">{{ loading ? '发布中…' : '确认发布' }}</text>
            </view>
            <view class="flex gap-3">
              <view class="flex-1 h-[88rpx] rounded-full bg-white border border-tertiary/40 flex items-center justify-center gap-1 active:scale-95" @click="showPatch = true">
                <text class="material-symbols-outlined text-tertiary text-[32rpx]">edit</text>
                <text class="text-[26rpx] text-tertiary font-bold">我要改</text>
              </view>
              <view class="flex-1 h-[88rpx] rounded-full bg-white border border-outline-variant/40 flex items-center justify-center gap-1 active:scale-95" @click="restart">
                <text class="material-symbols-outlined text-outline text-[32rpx]">refresh</text>
                <text class="text-[26rpx] text-on-surface-variant">重新描述</text>
              </view>
            </view>
          </view>
        </view>

        <!-- ============ 阶段三：发布成功 ============ -->
        <view v-else-if="phase === 'done'" class="flex flex-col items-center pt-16">
          <view class="w-20 h-20 rounded-full bg-tertiary/15 flex items-center justify-center">
            <text class="material-symbols-outlined text-tertiary text-[64rpx]">check_circle</text>
          </view>
          <text class="font-bold text-[34rpx] text-on-surface mt-4">发布成功！</text>
          <text class="text-[26rpx] text-outline-variant mt-1">学长已经帮你把帖子发出去啦</text>
          <view class="mt-8 w-full space-y-3">
            <view v-if="publishedPostId" class="h-[88rpx] rounded-full bg-tertiary flex items-center justify-center active:scale-[0.98]" @click="viewPost">
              <text class="text-white font-bold text-[28rpx]">去看看我的帖子</text>
            </view>
            <view class="h-[88rpx] rounded-full bg-white border border-outline-variant/40 flex items-center justify-center active:scale-95" @click="restart">
              <text class="text-[28rpx] text-on-surface-variant">再发一条</text>
            </view>
          </view>
        </view>

      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { request } from '@/utils/request.js'
import { aiApi, fileApi } from '@/api/index.js'
import { config } from '@/config'

const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight || 20)

const phase = ref('input')          // input | draft | done
const loading = ref(false)
const userText = ref('')
const previews = ref([])            // [{ preview, objectName, status }]
const draft = ref({})
const draftId = ref('')
const roundCount = ref(0)
const showPatch = ref(false)
const patchText = ref('')
const publishedPostId = ref(null)

// 复用聊天会话 id，没有就用时间戳生成（仅用于草稿归属，不影响发帖）
const conversationId = ref(uni.getStorageSync('activeSessionId') || ('draft-' + Date.now()))

const canGenerate = computed(() =>
  !loading.value && (userText.value.trim().length > 0 || uploadedObjectNames().length > 0))

const draftImages = computed(() => {
  const objs = (draft.value && draft.value.images) || []
  return objs.map(o => `${config.apiBaseUrl}/api/v1/files/view?objectName=${encodeURIComponent(o)}`)
})

function uploadedObjectNames() {
  return previews.value.filter(p => p.status === 'success' && p.objectName).map(p => p.objectName)
}

const goBack = () => uni.navigateBack({ delta: 1 })

const chooseImage = () => {
  const count = 9 - previews.value.length
  uni.chooseImage({
    count,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      res.tempFilePaths.forEach((fp) => {
        const item = { preview: fp, objectName: '', status: 'uploading' }
        previews.value.push(item)
        uploadOne(fp, item)
      })
    }
  })
}

const uploadOne = (filePath, item) => {
  const token = uni.getStorageSync('token')
  uni.uploadFile({
    url: `${config.apiBaseUrl}${fileApi.uploadPostTempImage().url}`,
    filePath,
    name: 'file',
    header: { Authorization: `Bearer ${token}` },
    success: (res) => {
      try {
        const data = JSON.parse(res.data)
        if (data.code === 200) {
          item.objectName = data.data.objectName
          item.status = 'success'
        } else {
          item.status = 'error'
        }
      } catch (e) {
        item.status = 'error'
      }
    },
    fail: () => { item.status = 'error' }
  })
}

const removeImage = (i) => previews.value.splice(i, 1)

const generateDraft = async () => {
  if (!canGenerate.value) {
    uni.showToast({ title: '先描述一下或加张图片', icon: 'none' })
    return
  }
  if (previews.value.some(p => p.status === 'uploading')) {
    uni.showToast({ title: '图片还在上传，稍等一下', icon: 'none' })
    return
  }
  loading.value = true
  try {
    const res = await request(aiApi.startDraft(conversationId.value, userText.value.trim(), uploadedObjectNames()))
    if (res.code === 200 && res.data && res.data.draftId) {
      draftId.value = res.data.draftId
      draft.value = res.data.draft || {}
      roundCount.value = res.data.round_count || 0
      phase.value = 'draft'
    } else {
      uni.showToast({ title: (res.data && res.data.error) || '生成草稿失败', icon: 'none' })
    }
  } catch (e) {
    uni.showToast({ title: '网络开小差了，稍后再试', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const submitEdit = async () => {
  if (!patchText.value.trim() || loading.value) return
  loading.value = true
  try {
    const res = await request(aiApi.resumeDraft(draftId.value, 'edit', patchText.value.trim()))
    if (res.code === 200 && res.data && res.data.draft) {
      draft.value = res.data.draft
      roundCount.value = res.data.round_count || roundCount.value + 1
      patchText.value = ''
      showPatch.value = false
    } else {
      uni.showToast({ title: '修改失败，换个说法试试', icon: 'none' })
    }
  } catch (e) {
    uni.showToast({ title: '网络开小差了', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const publish = async () => {
  if (loading.value) return
  loading.value = true
  try {
    const res = await request(aiApi.resumeDraft(draftId.value, 'publish'))
    const data = res.data || {}
    if (res.code === 200 && data.status === 'published') {
      publishedPostId.value = data.postId || null
      phase.value = 'done'
    } else if (data.error) {
      // 校验未过（如二手缺价格），停在草稿页提示用户补充
      uni.showModal({ title: '还差一点', content: data.error + '\n点「我要改」补充后再发布', showCancel: false })
    } else {
      uni.showToast({ title: '发布失败，请稍后再试', icon: 'none' })
    }
  } catch (e) {
    uni.showToast({ title: '网络开小差了', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const restart = () => {
  if (draftId.value) { aiApi.cancelDraft && request(aiApi.cancelDraft(draftId.value)).catch(() => {}) }
  phase.value = 'input'
  userText.value = ''
  previews.value = []
  draft.value = {}
  draftId.value = ''
  roundCount.value = 0
  showPatch.value = false
  patchText.value = ''
  publishedPostId.value = null
}

const viewPost = () => {
  if (publishedPostId.value) uni.navigateTo({ url: `/pages/post/detail?id=${publishedPostId.value}` })
  else uni.navigateBack()
}
</script>
