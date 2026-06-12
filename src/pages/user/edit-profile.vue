<template>
  <view class="bg-background min-h-screen flex flex-col selection:bg-primary-container">
    
    <header class="sticky top-0 z-[60] bg-background/85 backdrop-blur-md flex justify-between items-center w-full px-margin-page transition-all" 
            :style="{ paddingTop: statusBarHeight + 'px', height: (statusBarHeight + 56) + 'px' }">
      <view class="bouncy-tap p-2 -ml-2 text-primary" @click="handleBack">
        <text class="material-symbols-outlined text-[56rpx]">arrow_back</text>
      </view>
      <text class="font-headline-md text-[36rpx] text-primary font-bold">编辑资料</text>
      <view class="w-10"></view>
    </header>

    <main class="flex-1 px-margin-page pb-[200rpx]">
      
      <section class="flex flex-col items-center mt-6 mb-10">
        <view class="relative group" @click="showAvatarPicker">
          <view class="w-[200rpx] h-[200rpx] rounded-full p-[6rpx] bg-white kawaii-shadow ring-4 ring-primary-fixed">
            <image :src="editForm.avatar || defaultAvatar" mode="aspectFill" class="w-full h-full object-cover rounded-full"></image>
          </view>
          <view class="absolute bottom-0 right-0 bg-secondary-container p-3 rounded-full border-[4rpx] border-white kawaii-shadow bouncy-press">
            <text class="material-symbols-outlined text-white text-[32rpx]" style="font-variation-settings: 'FILL' 1;">photo_camera</text>
          </view>
        </view>
        <text class="mt-4 font-label-sm text-[24rpx] text-on-surface-variant/70 tracking-wide">点击更换头像</text>
      </section>

      <view class="bg-surface-container-low rounded-[40rpx] overflow-hidden kawaii-shadow sticker-border p-2">
        <view class="flex items-center justify-between p-[32rpx] hover:bg-surface-variant/30 active:bg-surface-variant transition-colors group" @click="editNickname">
          <text class="text-[30rpx] font-medium text-on-surface-variant">昵称</text>
          <view class="flex items-center gap-2">
            <text class="text-[28rpx] text-on-surface">{{ editForm.nickname || '未设置' }}</text>
            <text class="material-symbols-outlined text-outline-variant">chevron_right</text>
          </view>
        </view>

        <view class="flex items-center justify-between p-[32rpx] border-t border-outline-variant/10" @click="showGenderPicker">
          <text class="text-[30rpx] font-medium text-on-surface-variant">性别</text>
          <view class="flex items-center gap-2">
            <text class="text-[28rpx] text-on-surface">{{ genderText[editForm.gender] }}</text>
            <text class="material-symbols-outlined text-outline-variant">chevron_right</text>
          </view>
        </view>

        <view class="flex items-center justify-between p-[32rpx] border-t border-outline-variant/10" @click="showSignatureEditor">
          <text class="text-[30rpx] font-medium text-on-surface-variant shrink-0">个性签名</text>
          <view class="flex items-center gap-2 overflow-hidden ml-4">
            <text class="text-[28rpx] text-on-surface truncate text-right">{{ editForm.signature || '写点什么介绍自己吧~' }}</text>
            <text class="material-symbols-outlined text-outline-variant shrink-0">chevron_right</text>
          </view>
        </view>

        <view class="flex items-center justify-between p-[32rpx] border-t border-outline-variant/10" @click="showCampusPicker">
          <text class="text-[30rpx] font-medium text-on-surface-variant">校区</text>
          <view class="flex items-center gap-2">
            <text class="text-[28rpx] text-on-surface">{{ editForm.campus || '选择校区' }}</text>
            <text class="material-symbols-outlined text-outline-variant">chevron_right</text>
          </view>
        </view>

        <view class="flex items-center justify-between p-[32rpx] border-t border-outline-variant/10" @click="showCollegePicker">
          <text class="text-[30rpx] font-medium text-on-surface-variant">院系</text>
          <view class="flex items-center gap-2">
            <text class="text-[28rpx] text-on-surface">{{ editForm.college || '选择院系' }}</text>
            <text class="material-symbols-outlined text-outline-variant">chevron_right</text>
          </view>
        </view>
      </view>
    </main>

    <view class="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-md border-t border-outline-variant/20 z-50 pb-[env(safe-area-inset-bottom)]">
      <view class="px-[32rpx] py-[24rpx]">
        <button class="w-full h-[100rpx] flex items-center justify-center rounded-[50rpx] font-bold text-[36rpx] transition-all duration-300 bouncy-spring text-white"
                :class="saving ? 'bg-[#C1C1C1]' : 'gradient-publish shadow-[0_12px_32px_rgba(255,143,163,0.3)]'"
                @click="saveUserInfo">
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
const userStore = useUserStore()

// 微信用户信息
const wechatUserInfo = ref({
  nickname: '',
  avatar: ''
})

// 性别文本映射
const genderText = {
  0: '保密',
  1: '男',
  2: '女',
  3: '保密'
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
  universityId: null
})

// 根据学校名称加载校区列表
const loadCampuses = async (collegeName) => {
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
  uni.$on('schoolSelected', (data) => {
    console.log('接收到学校选择数据:', data)
    editForm.value.college = data.college
    editForm.value.campus = data.campus
    editForm.value.universityId = data.universityId || null
    loadCampuses(data.college)
    saveUserInfo()  // 自动保存
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
        universityId: user.universityId || null
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

  saving.value = true  // 显示加载状态
  try {
    const response = await put(userApi.updateUserInfo().url, {
      nickname: editForm.value.nickname.trim(),
      avatar: editForm.value.avatar,
      avatarObjectName: editForm.value.avatarObjectName,
      signature: editForm.value.signature.trim(),
      gender: editForm.value.gender,
      campus: editForm.value.campus,
      college: editForm.value.college,
      universityId: editForm.value.universityId
    })

    if (response.code === 200 && response.data) {
      uni.showToast({ title: '保存成功', icon: 'success' })
      console.log('✅ 保存成功，返回数据:', response.data)

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
        universityId: updatedUser.universityId || null
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
    saving.value = false  // 隐藏加载状态
  }
}

// ==================== 头像相关 ====================

// 显示头像选择弹窗
const showAvatarPicker = () => {
  uni.showActionSheet({
    itemList: ['用微信头像', '从相册选择', '拍照'],
    success: (res) => {
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
    }
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
    success: (res) => {
      uploadAvatar(res.tempFilePaths[0])
    }
  })
}

// 拍照
const takePhoto = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['camera'],
    success: (res) => {
      uploadAvatar(res.tempFilePaths[0])
    }
  })
}

// 上传头像到 MinIO
const uploadAvatar = async (filePath) => {
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
          'X-Platform': 'mp'
        },
        success: resolve,
        fail: reject
      })
    })
    data = JSON.parse(uploadRes.data)
    // #endif

    // #ifdef H5
    const blob = await fetch(filePath).then((r) => r.blob())
    const formData = new FormData()
    formData.append('file', blob, `avatar_${Date.now()}.jpg`)
    uploadRes = await fetch(`${config.apiBaseUrl}${fileApi.uploadUserAvatar(userId).url}`, {
      method: 'POST',
      credentials: 'include',
      body: formData
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
    success: (res) => {
      if (res.tapIndex === 0) {
        // 使用微信昵称
        useWechatNickname()
      } else if (res.tapIndex === 1) {
        // 自由编辑
        editNickname()
      }
    }
  })
}

// 使用微信昵称
const useWechatNickname = () => {
  if (wechatUserInfo.value.nickname) {
    editForm.value.nickname = wechatUserInfo.value.nickname
    uni.showToast({ title: '已使用微信昵称', icon: 'success' })
    saveUserInfo()  // 立即保存
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
    success: (res) => {
      if (res.confirm && res.content.trim()) {
        editForm.value.nickname = res.content.trim()
        saveUserInfo()  // 立即保存
      }
    }
  })
}

// ==================== 性别相关 ====================

// 显示性别选择弹窗
const showGenderPicker = () => {
  uni.showActionSheet({
    itemList: ['男', '女', '保密'],
    success: (res) => {
      const genderMap = { 0: 1, 1: 2, 2: 3 }
      editForm.value.gender = genderMap[res.tapIndex]
      uni.showToast({ title: `已选择${genderText[editForm.value.gender]}`, icon: 'success' })
      saveUserInfo()  // 立即保存
    }
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
    success: (res) => {
      if (res.confirm) {
        editForm.value.signature = res.content
        saveUserInfo()  // 立即保存
      }
    }
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
    success: (res) => {
      editForm.value.campus = campusOptions.value[res.tapIndex]
      uni.showToast({ title: `已选择${editForm.value.campus}`, icon: 'success' })
      saveUserInfo()  // 立即保存
    }
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
    success: () => {
      console.log('跳转到选择学校页面')
    },
    fail: (err) => {
      console.error('跳转失败:', err)
      uni.showToast({ title: '页面跳转失败', icon: 'none' })
    }
  })
}
</script>


<style scoped>
/* 引入你在 App.vue 定义的全局工具类 */
.kawaii-shadow { box-shadow: 0 12rpx 40rpx rgba(255, 143, 163, 0.12); }
.sticker-border { border: 2rpx dashed rgba(218, 192, 195, 0.5); }
.bouncy-press:active { transform: scale(0.95); transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }
.bouncy-spring:active { transform: scale(0.95); transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }
.gradient-publish { background: linear-gradient(135deg, #FF8FA3 0%, #FFB2BD 100%); }
</style>