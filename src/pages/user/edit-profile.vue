<template>
  <view class="bg-[#F4F5F7] min-h-screen relative selection:bg-primary-container">
    <!-- 顶部导航栏 -->
    <view
      class="fixed top-0 left-0 w-full z-50 transition-all duration-300"
      :class="{ 'bg-surface/90 backdrop-blur-md shadow-sm': scrollY > 50 }"
    >
      <view :style="{ height: statusBarHeight + 'px' }"></view>
      <view class="flex items-center justify-between px-[32rpx] w-full h-[44px]">
        <view class="flex items-center gap-2">
          <text
            class="material-symbols-outlined active:opacity-70 transition-colors text-[48rpx]"
            :class="scrollY > 50 ? 'text-on-surface' : 'text-white'"
            @click="handleBack"
            >arrow_back</text
          >
          <text
            class="font-headline-md text-[36rpx] font-bold transition-opacity text-on-surface"
            :class="scrollY > 50 ? 'opacity-100' : 'opacity-0'"
            >编辑资料</text
          >
        </view>
        <view class="w-10"></view>
      </view>
    </view>

    <scroll-view scroll-y class="h-screen w-full" @scroll="onScroll">
      <view class="relative h-[480rpx] w-full overflow-hidden">
        <view class="absolute inset-0 bg-[#F4F5F7] noise-bg"></view>
        <view
          class="absolute top-10 left-10 w-[200rpx] h-[200rpx] bg-white/20 rounded-full blur-2xl bubble-float"
        ></view>
        <view
          class="absolute top-20 right-10 w-[250rpx] h-[250rpx] bg-white/10 rounded-full blur-3xl bubble-float"
          style="animation-delay: 2s"
        ></view>
        <view class="absolute bottom-0 left-0 w-full h-[120rpx] wave-bg"></view>
      </view>

      <view class="relative -mt-[140rpx] px-[32rpx] z-10 space-y-[24rpx] pb-[200rpx]">
        <!-- 头像卡片 -->
        <view class="bg-white/90 backdrop-blur-md rounded-[40rpx] p-[32rpx] border border-white/50">
          <view class="flex flex-col items-center text-center" @click="showAvatarPicker">
            <view class="relative mb-3">
              <image
                :src="editForm.avatar || defaultAvatar"
                mode="aspectFill"
                class="w-[160rpx] h-[160rpx] rounded-full border-[6rpx] border-white object-cover shadow-sm"
              ></image>
              <view
                class="absolute bottom-0 right-0 bg-secondary-container p-3 rounded-full border-[4rpx] border-white bouncy-press"
              >
                <text
                  class="material-symbols-outlined text-white text-[32rpx]"
                  style="font-variation-settings: 'FILL' 1"
                  >photo_camera</text
                >
              </view>
            </view>
            <text class="text-[24rpx] text-on-surface-variant bg-surface-container-low px-3 py-1 rounded-full"
              >点击更换头像</text
            >
          </view>
        </view>

        <!-- 资料列表 -->
        <view class="bg-white rounded-[32rpx] p-[32rpx]">
          <view class="space-y-6">
            <view class="flex items-center justify-between active:opacity-60 transition-opacity" @click="editNickname">
              <text class="text-[28rpx] text-on-surface">昵称</text>
              <view class="flex items-center gap-2">
                <text class="text-[28rpx] text-on-surface-variant">{{ editForm.nickname || '未设置' }}</text>
                <text class="material-symbols-outlined text-outline-variant text-[40rpx]">chevron_right</text>
              </view>
            </view>
            <view
              class="flex items-center justify-between active:opacity-60 transition-opacity"
              @click="showGenderPicker"
            >
              <text class="text-[28rpx] text-on-surface">性别</text>
              <view class="flex items-center gap-2">
                <text class="text-[28rpx] text-on-surface-variant">{{ genderText[editForm.gender] }}</text>
                <text class="material-symbols-outlined text-outline-variant text-[40rpx]">chevron_right</text>
              </view>
            </view>
            <view
              class="flex items-center justify-between active:opacity-60 transition-opacity"
              @click="showSignatureEditor"
            >
              <text class="text-[28rpx] text-on-surface shrink-0">个性签名</text>
              <view class="flex items-center gap-2 overflow-hidden ml-4">
                <text class="text-[28rpx] text-on-surface-variant truncate text-right">{{
                  editForm.signature || '写点什么介绍自己吧~'
                }}</text>
                <text class="material-symbols-outlined text-outline-variant text-[40rpx] shrink-0">chevron_right</text>
              </view>
            </view>
            <view
              class="flex items-center justify-between active:opacity-60 transition-opacity"
              @click="showCampusPicker"
            >
              <text class="text-[28rpx] text-on-surface">校区</text>
              <view class="flex items-center gap-2">
                <text class="text-[28rpx] text-on-surface-variant">{{ editForm.campus || '选择校区' }}</text>
                <text class="material-symbols-outlined text-outline-variant text-[40rpx]">chevron_right</text>
              </view>
            </view>
            <view
              class="flex items-center justify-between active:opacity-60 transition-opacity"
              @click="showCollegePicker"
            >
              <text class="text-[28rpx] text-on-surface">院系</text>
              <view class="flex items-center gap-2">
                <text class="text-[28rpx] text-on-surface-variant">{{ editForm.college || '选择院系' }}</text>
                <text class="material-symbols-outlined text-outline-variant text-[40rpx]">chevron_right</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <view
      class="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-md border-t border-outline-variant/20 z-50 pb-[env(safe-area-inset-bottom)]"
    >
      <view class="px-[32rpx] py-[24rpx]">
        <button
          class="w-full h-[100rpx] flex items-center justify-center rounded-full font-bold text-[36rpx] transition-all duration-300 active:scale-95 shadow-md text-white"
          :class="saving ? 'bg-surface-variant' : 'bg-primary'"
          @click="saveUserInfo"
        >
          <text v-if="saving" class="material-symbols-outlined animate-spin text-[40rpx]">progress_activity</text>
          <text v-else>保存</text>
        </button>
      </view>
    </view>
  </view>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { userApi, fileApi } from '@/api'
import { get, put } from '@/utils/request'
import { config } from '@/config'
import { getToken, getCurrentUserId } from '@/utils/auth.js'
import { useUserStore } from '@/stores/user.ts'

const defaultAvatar = '/static/images/default-avatar.png'
const saving = ref(false)
const loading = ref(true)
const statusBarHeight = ref(20)
const scrollY = ref(0)
const userStore = useUserStore()

// 滚动监听
const onScroll = e => {
  scrollY.value = e.detail.scrollTop
}

// 微信用户信息
const wechatUserInfo = ref({
  nickname: '',
  avatar: '',
})

// 性别文本映射
const genderText = {
  0: '保密',
  1: '男',
  2: '女',
  3: '保密',
}

// 校区列表（根据所选学校动态加载）
const campusOptions = ref([])

// 表单数据
const editForm = ref({
  nickname: '',
  avatar: '',
  avatarObjectName: '',
  signature: '',
  gender: 3,
  campus: '',
  college: '',
  universityId: null,
})

// 根据学校名称加载校区列表
const loadCampuses = async collegeName => {
  if (!collegeName) {
    campusOptions.value = []
    return
  }
  try {
    const res = await get('/api/v1/universities/search', { keyword: collegeName })
    if (res.code === 200 && res.data) {
      // 去重并按 campusName 收集
      const seen = new Set()
      campusOptions.value = res.data
        .filter(u => u.universityName === collegeName)
        .map(u => u.campusName || '主校区')
        .filter(name => {
          if (seen.has(name)) return false
          seen.add(name)
          return true
        })
    } else {
      campusOptions.value = []
    }
  } catch (error) {
    console.error('加载校区列表失败:', error)
    campusOptions.value = []
  }
}

// 页面加载时获取当前用户信息
onLoad(async () => {
  // 获取状态栏高度
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 20

  // 监听学校选择事件
  uni.$on('schoolSelected', data => {
    editForm.value.college = data.college
    editForm.value.campus = data.campus
    editForm.value.universityId = data.universityId || null
    loadCampuses(data.college)
    saveUserInfo() // 自动保存
  })

  try {
    const response = await get(userApi.getCurrentUserInfo().url)

    if (response.code === 200 && response.data) {
      const user = response.data
      editForm.value = {
        nickname: user.nickname || '',
        avatar: user.avatar || '',
        avatarObjectName: user.avatarObjectName || '',
        signature: user.signature || '',
        gender: user.gender !== undefined ? user.gender : 3,
        campus: user.campus || '',
        college: user.college || '',
        universityId: user.universityId || null,
      }
      await loadCampuses(user.college)
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
})

// 页面卸载时移除事件监听
onUnmounted(() => {
  uni.$off('schoolSelected')
})

// ==================== 导航相关 ====================

// 返回上一页
const handleBack = () => {
  uni.navigateBack()
}

// 保存用户信息
const saveUserInfo = async () => {
  // 验证昵称
  if (!editForm.value.nickname || editForm.value.nickname.trim() === '') {
    uni.showToast({ title: '昵称不能为空', icon: 'none' })
    return
  }

  saving.value = true // 显示加载状态
  try {
    const response = await put(userApi.updateUserInfo().url, {
      nickname: editForm.value.nickname.trim(),
      avatar: editForm.value.avatar,
      avatarObjectName: editForm.value.avatarObjectName,
      signature: editForm.value.signature.trim(),
      gender: editForm.value.gender,
      campus: editForm.value.campus,
      college: editForm.value.college,
      universityId: editForm.value.universityId,
    })

    if (response.code === 200 && response.data) {
      uni.showToast({ title: '保存成功', icon: 'success' })

      // 更新本地表单数据为服务器返回的数据
      const updatedUser = response.data
      editForm.value = {
        nickname: updatedUser.nickname || '',
        avatar: updatedUser.avatar || '',
        avatarObjectName: updatedUser.avatarObjectName || '',
        signature: updatedUser.signature || '',
        gender: updatedUser.gender !== undefined ? updatedUser.gender : 3,
        campus: updatedUser.campus || '',
        college: updatedUser.college || '',
        universityId: updatedUser.universityId || null,
      }

      // 同步 Pinia store 与本地缓存，确保其他页面立即展示新头像
      userStore.avatar = updatedUser.avatar || ''
      const storedInfo = uni.getStorageSync('userInfo') || {}
      uni.setStorageSync('userInfo', { ...storedInfo, ...updatedUser })
    } else {
      uni.showToast({ title: response.message || '保存失败', icon: 'none' })
    }
  } catch (error) {
    console.error('保存失败:', error)
    uni.showToast({ title: '保存失败', icon: 'none' })
  } finally {
    saving.value = false // 隐藏加载状态
  }
}

// ==================== 头像相关 ====================

// 显示头像选择弹窗
const showAvatarPicker = () => {
  uni.showActionSheet({
    itemList: ['用微信头像', '从相册选择', '拍照'],
    success: res => {
      if (res.tapIndex === 0) {
        // 使用微信头像
        useWechatAvatar()
      } else if (res.tapIndex === 1) {
        // 从相册选择
        chooseFromAlbum()
      } else if (res.tapIndex === 2) {
        // 拍照
        takePhoto()
      }
    },
  })
}

// 使用微信头像
const useWechatAvatar = () => {
  if (wechatUserInfo.value.avatar) {
    editForm.value.avatar = wechatUserInfo.value.avatar
    editForm.value.avatarObjectName = ''
    uni.showToast({ title: '已使用微信头像', icon: 'success' })
    saveUserInfo()
  } else {
    uni.showToast({ title: '未获取到微信头像', icon: 'none' })
  }
}

// 从相册选择
const chooseFromAlbum = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album'],
    success: res => {
      uploadAvatar(res.tempFilePaths[0])
    },
  })
}

// 拍照
const takePhoto = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['camera'],
    success: res => {
      uploadAvatar(res.tempFilePaths[0])
    },
  })
}

// 上传头像到 MinIO
const uploadAvatar = async filePath => {
  const userId = getCurrentUserId()
  if (!userId) {
    uni.showToast({ title: '用户未登录', icon: 'none' })
    return
  }

  uni.showLoading({ title: '上传中...', mask: true })

  try {
    let data
    let uploadRes

    // #ifndef H5
    const token = getToken()
    uploadRes = await new Promise((resolve, reject) => {
      uni.uploadFile({
        url: `${config.apiBaseUrl}${fileApi.uploadUserAvatar(userId).url}`,
        filePath,
        name: 'file',
        header: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'X-Platform': 'mp',
        },
        success: resolve,
        fail: reject,
      })
    })
    data = JSON.parse(uploadRes.data)
    // #endif

    // #ifdef H5
    const blob = await fetch(filePath).then(r => r.blob())
    const formData = new FormData()
    formData.append('file', blob, `avatar_${Date.now()}.jpg`)
    uploadRes = await fetch(`${config.apiBaseUrl}${fileApi.uploadUserAvatar(userId).url}`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    })
    data = await uploadRes.json()
    // #endif

    if (data.code === 200 && data.data) {
      editForm.value.avatar = data.data.url || ''
      editForm.value.avatarObjectName = data.data.objectName || ''
      uni.showToast({ title: '上传成功', icon: 'success' })
      await saveUserInfo()
    } else {
      throw new Error(data.message || '上传失败')
    }
  } catch (error) {
    console.error('上传头像失败:', error)
    uni.showToast({ title: error.message || '上传失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

// ==================== 昵称相关 ====================

// 显示昵称选择弹窗
const showNicknamePicker = () => {
  uni.showActionSheet({
    itemList: ['用微信昵称', '自由编辑'],
    success: res => {
      if (res.tapIndex === 0) {
        // 使用微信昵称
        useWechatNickname()
      } else if (res.tapIndex === 1) {
        // 自由编辑
        editNickname()
      }
    },
  })
}

// 使用微信昵称
const useWechatNickname = () => {
  if (wechatUserInfo.value.nickname) {
    editForm.value.nickname = wechatUserInfo.value.nickname
    uni.showToast({ title: '已使用微信昵称', icon: 'success' })
    saveUserInfo() // 立即保存
  } else {
    uni.showToast({ title: '未获取到微信昵称', icon: 'none' })
  }
}

// 自由编辑昵称
const editNickname = () => {
  uni.showModal({
    title: '编辑昵称',
    editable: true,
    placeholderText: '请输入昵称',
    content: editForm.value.nickname,
    success: res => {
      if (res.confirm && res.content.trim()) {
        editForm.value.nickname = res.content.trim()
        saveUserInfo() // 立即保存
      }
    },
  })
}

// ==================== 性别相关 ====================

// 显示性别选择弹窗
const showGenderPicker = () => {
  uni.showActionSheet({
    itemList: ['男', '女', '保密'],
    success: res => {
      const genderMap = { 0: 1, 1: 2, 2: 3 }
      editForm.value.gender = genderMap[res.tapIndex]
      uni.showToast({ title: `已选择${genderText[editForm.value.gender]}`, icon: 'success' })
      saveUserInfo() // 立即保存
    },
  })
}

// ==================== 签名相关 ====================

// 显示签名编辑器
const showSignatureEditor = () => {
  uni.showModal({
    title: '编辑个性签名',
    editable: true,
    placeholderText: '写下你的个性签名...',
    content: editForm.value.signature,
    success: res => {
      if (res.confirm) {
        editForm.value.signature = res.content
        saveUserInfo() // 立即保存
      }
    },
  })
}

// ==================== 校区相关 ====================

// 显示校区选择弹窗
const showCampusPicker = () => {
  if (!editForm.value.college) {
    uni.showToast({ title: '请先选择学校', icon: 'none' })
    return
  }
  if (campusOptions.value.length === 0) {
    uni.showToast({ title: '未找到可用校区', icon: 'none' })
    return
  }
  uni.showActionSheet({
    itemList: campusOptions.value,
    success: res => {
      editForm.value.campus = campusOptions.value[res.tapIndex]
      uni.showToast({ title: `已选择${editForm.value.campus}`, icon: 'success' })
      saveUserInfo() // 立即保存
    },
  })
}

// ==================== 学院相关 ====================

// 显示学院选择弹窗
const showCollegePicker = () => {
  // 构建跳转参数，传递当前已选择的学校和校区信息
  const params = []
  if (editForm.value.college) {
    params.push(`college=${encodeURIComponent(editForm.value.college)}`)
  }
  if (editForm.value.campus) {
    params.push(`campus=${encodeURIComponent(editForm.value.campus)}`)
  }

  const queryString = params.length > 0 ? `?${params.join('&')}` : ''

  // 跳转到选择学校页面
  uni.navigateTo({
    url: `/pages/user/select-school${queryString}`,
    fail: err => {
      console.error('跳转失败:', err)
      uni.showToast({ title: '页面跳转失败', icon: 'none' })
    },
  })
}
</script>

<style scoped lang="scss">
/* 隐藏系统的多余滚动条 */
::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  color: transparent;
}

/* 萌系Q弹点击手感 */
.bouncy-press:active {
  transform: scale(0.96);
  transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 背景噪点纹理 */
.noise-bg {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E");
}

/* 浮动气泡动画 */
@keyframes float {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-20rpx) scale(1.02);
  }
}
.bubble-float {
  animation: float 6s ease-in-out infinite;
}

/* 波浪底部 */
.wave-bg {
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 120'%3E%3Cpath fill='%23F4F5F7' d='M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z'%3E%3C/path%3E%3C/svg%3E")
    no-repeat bottom;
  background-size: cover;
}
</style>
