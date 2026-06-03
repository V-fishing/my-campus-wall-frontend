<template>
  <view class="bg-[#F4F5F7] min-h-screen pb-24 selection:bg-primary-container relative">
    
<view class="fixed top-0 left-0 w-full z-50 transition-all duration-300" 
          :class="{'bg-surface/90 backdrop-blur-md shadow-sm': scrollY > 50}">
      
      <view :style="{ height: statusBarHeight + 'px' }"></view>
      
      <view class="flex items-center px-[32rpx] w-full h-[44px]">
        <view class="flex items-center gap-2">
          
          <text class="material-symbols-outlined active:opacity-70 transition-colors text-[48rpx]" 
                :class="scrollY > 50 ? 'text-on-surface' : 'text-white'" 
                @click="handleEditProfile">settings</text>
          
          <text class="font-headline-md text-[36rpx] font-bold transition-opacity text-on-surface" 
                :class="scrollY > 50 ? 'opacity-100' : 'opacity-0'">个人中心</text>
                
        </view>
      </view>
    </view>
    <scroll-view scroll-y class="h-screen w-full" @scroll="onScroll">
      <view class="relative h-[560rpx] w-full overflow-hidden">
        <view class="absolute inset-0 bg-gradient-to-br from-[#FF8FA3] via-[#C5A3FF] to-[#5BA4F0] noise-bg"></view>
        
        <view class="absolute top-10 left-10 w-[200rpx] h-[200rpx] bg-white/20 rounded-full blur-2xl bubble-float"></view>
        <view class="absolute top-20 right-10 w-[250rpx] h-[250rpx] bg-white/10 rounded-full blur-3xl bubble-float" style="animation-delay: 2s;"></view>
        
        <view class="absolute bottom-0 left-0 w-full h-[120rpx] wave-bg"></view>
      </view>

      <view class="relative -mt-[140rpx] px-[32rpx] z-10 space-y-[24rpx]">
        
        <view class="bg-white/90 backdrop-blur-md rounded-[40rpx] p-[32rpx] border border-white/50 kawaii-shadow">
          <view class="flex flex-col items-center -mt-[100rpx] text-center" >
            <view class="flex flex-col items-center  text-center" @click="handleEditProfile">
            <view class="relative mb-3">
              <image class="w-[160rpx] h-[160rpx] rounded-full border-[6rpx] border-white object-cover shadow-sm" mode="aspectFill" :src="userInfo?.avatar || defaultAvatar"></image>
              <view v-if="userInfo?.isVerified" class="absolute bottom-0 right-0 bg-[#5BA4F0] p-1 rounded-full border-[4rpx] border-white flex items-center justify-center">
                <text class="material-symbols-outlined text-[24rpx] text-white" style="font-variation-settings: 'FILL' 1;">verified</text>
              </view>
            </view>
            
            <view class="flex items-center gap-1 mb-1">
              <text class="text-[40rpx] font-bold text-on-surface">{{ userInfo?.nickname || '未登录' }}</text>
              <text v-if="userInfo?.gender === 1" class="material-symbols-outlined text-[32rpx] text-[#5BA4F0]">male</text>
              <text v-else-if="userInfo?.gender === 2" class="material-symbols-outlined text-[32rpx] text-[#FF8FA3]">female</text>
            </view>
            
            <text class="text-[24rpx] text-on-surface-variant bg-surface-container-low px-3 py-1 rounded-full">{{ userInfo?.college || '未绑定学院' }}</text>
            
            <text class="text-[26rpx] text-on-surface/70 mt-3 px-4 italic line-clamp-2">
              {{ userInfo?.signature || '留下你的个性签名，让大家更好地认识你 ✍️' }}
            </text>
            </view>
            <view class="grid grid-cols-4 w-full mt-6 py-4 border-t border-dashed border-outline-variant/50">
              <view class="flex flex-col items-center bouncy-press" >
                <text class="text-[36rpx] font-bold text-gradient-candy">{{ userInfo?.likeCount || 0 }}</text>
                <text class="text-[22rpx] text-on-surface-variant mt-1">获赞</text>
              </view>
              <view class="flex flex-col items-center bouncy-press" @click.stop="goToMyCollections">
                <text class="text-[36rpx] font-bold text-gradient-candy">{{ userInfo?.collectionCount || 0 }}</text>
                <text class="text-[22rpx] text-on-surface-variant mt-1">收藏</text>
              </view>
              <view class="flex flex-col items-center bouncy-press" @click.stop="goToMyFollowing">
                <text class="text-[36rpx] font-bold text-gradient-candy">{{ userInfo?.followCount || 0 }}</text>
                <text class="text-[22rpx] text-on-surface-variant mt-1">关注</text>
              </view>
              <view class="flex flex-col items-center bouncy-press" @click.stop="goToMyFans">
                <text class="text-[36rpx] font-bold text-gradient-candy">{{ userInfo?.fansCount || 0 }}</text>
                <text class="text-[22rpx] text-on-surface-variant mt-1">粉丝</text>
              </view>
            </view>
          </view>
        </view>

        <view class="grid grid-cols-3 gap-3">
          <view class="bg-white rounded-[32rpx] p-4 flex flex-col items-center justify-center gap-2 kawaii-shadow bouncy-press" @click="handleNav('我的动态')">
            <view class="w-[80rpx] h-[80rpx] rounded-full bg-blue-50 flex items-center justify-center">
              <text class="material-symbols-outlined text-blue-500 text-[40rpx]">article</text>
            </view>
            <text class="text-[24rpx] text-on-surface font-medium">我的动态</text>
          </view>
          <view class="bg-white rounded-[32rpx] p-4 flex flex-col items-center justify-center gap-2 kawaii-shadow bouncy-press" @click="handleNav('我的收藏')">
            <view class="w-[80rpx] h-[80rpx] rounded-full bg-purple-50 flex items-center justify-center">
              <text class="material-symbols-outlined text-purple-500 text-[40rpx]">bookmark</text>
            </view>
            <text class="text-[24rpx] text-on-surface font-medium">我的收藏</text>
          </view>
          <view class="bg-white rounded-[32rpx] p-4 flex flex-col items-center justify-center gap-2 kawaii-shadow bouncy-press" @click="handleNav('浏览历史')">
            <view class="w-[80rpx] h-[80rpx] rounded-full bg-green-50 flex items-center justify-center">
              <text class="material-symbols-outlined text-green-500 text-[40rpx]">history</text>
            </view>
            <text class="text-[24rpx] text-on-surface font-medium">浏览历史</text>
          </view>
        </view>

        <view class="bg-white rounded-[32rpx] p-[32rpx] kawaii-shadow mt-4">
          <view class="flex items-center gap-2 mb-4">
            <text class="material-symbols-outlined text-primary text-[40rpx]">auto_awesome</text>
            <text class="text-[32rpx] font-bold text-on-surface">AI 助手</text>
          </view>
          <view class="space-y-4">
            <view class="flex items-center justify-between active:opacity-60 transition-opacity" @click="handleAIPreference">
              <view class="flex items-center gap-3">
                <text class="material-symbols-outlined text-on-surface-variant text-[40rpx]" >tune</text>
                <text class="text-[28rpx] text-on-surface">AI 偏好设置</text>
              </view>
              <text class="material-symbols-outlined text-outline-variant text-[40rpx]">chevron_right</text>
            </view>
            <view class="flex items-center justify-between active:opacity-60 transition-opacity" @click="handleAIDialogue">
              <view class="flex items-center gap-3">
                <text class="material-symbols-outlined text-on-surface-variant text-[40rpx]">chat_bubble_outline</text>
                <text class="text-[28rpx] text-on-surface">聊天记录</text>
              </view>
              <view class="flex items-center gap-1">
                <view class="bg-primary-container text-on-primary-container px-2 py-0.5 rounded-full text-[20rpx] font-bold">3</view>
                <text class="material-symbols-outlined text-outline-variant text-[40rpx]">chevron_right</text>
              </view>
            </view>
          </view>
        </view>

        <view class="bg-white rounded-[32rpx] p-[32rpx] kawaii-shadow mt-4">
          <view class="space-y-6">
            <view class="flex items-center justify-between active:opacity-60 transition-opacity" @click="handleNav('系统设置')">
              <view class="flex items-center gap-3">
                <text class="material-symbols-outlined text-on-surface-variant text-[40rpx]">settings_suggest</text>
                <text class="text-[28rpx] text-on-surface">系统设置</text>
              </view>
              <text class="material-symbols-outlined text-outline-variant text-[40rpx]">chevron_right</text>
            </view>
            <view class="flex items-center justify-between active:opacity-60 transition-opacity" @click="handleNav('意见反馈')">
              <view class="flex items-center gap-3">
                <text class="material-symbols-outlined text-on-surface-variant text-[40rpx]">feedback</text>
                <text class="text-[28rpx] text-on-surface">意见反馈</text>
              </view>
              <text class="material-symbols-outlined text-outline-variant text-[40rpx]">chevron_right</text>
            </view>
            <view class="flex items-center justify-between active:opacity-60 transition-opacity" @click="handleNav('关于校园墙')">
              <view class="flex items-center gap-3">
                <text class="material-symbols-outlined text-on-surface-variant text-[40rpx]">info</text>
                <text class="text-[28rpx] text-on-surface">关于校园墙</text>
              </view>
              <text class="material-symbols-outlined text-outline-variant text-[40rpx]">chevron_right</text>
            </view>
          </view>
        </view>

        <view class="w-full py-6 text-center mt-2 mb-8">
          <text class="text-[#FF3B30] text-[32rpx] font-bold active:opacity-60 transition-opacity" @click="handleLogout">退出登录</text>
        </view>

        <view class="flex justify-center pb-8 pt-4">
          <text class="material-symbols-outlined text-outline-variant/40 animate-pulse text-[48rpx]">colors_spark</text>
        </view>

      </view>
    </scroll-view>
	<CustomTabBar :current="4" />
  </view>
  <view class="h-[160rpx]"></view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { get } from "@/utils/request"
import { userApi } from "@/api"

const statusBarHeight = ref(20)
const loading = ref(false)
const defaultAvatar = '/static/images/default-avatar.png'

// 用户信息（单个对象，不是数组）
const userInfo = ref({
  id: null,
  nickname: '',
  avatar: '',
  signature: '',
  college: '',
  campus: '',
  gender: null,
  likeCount: 0,
  followCount: 0,
  fansCount: 0,
  collectionCount: 0,
  postCount: 0
})

// 获取当前用户信息
const fetchUserInfo = async () => {
  loading.value = true
  try {
    const response = await get(userApi.getCurrentUserInfo().url)
    if (response.code === 200 && response.data) {
      // 后端返回的是单个UserVO对象，不是数组
      const data = response.data
      userInfo.value = {
        id: data.id,
        nickname: data.nickname || '未设置昵称',
        avatar: data.avatar || defaultAvatar,
        signature: data.signature || '这个人很懒，什么都没写~',
        college: data.college || '嘉应学院',
        campus: data.campus ,
        gender: data.gender,
        likeCount: data.likeCount || 0,
        followCount: data.followCount || 0,
        fansCount: data.fansCount || 0,
        collectionCount: data.collectionCount || 0,
        postCount: data.postCount || 0
      }
      console.log('✅ 用户信息加载成功:', userInfo.value)
    }
  } catch (error) {
    console.error('❌ 获取用户信息失败:', error)
    uni.showToast({ title: '加载用户信息失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

// 页面加载时获取用户信息
onLoad(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 20
  
  // 检查登录状态
  const token = uni.getStorageSync('token')
  if (!token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => {
      uni.redirectTo({ url: '/pages/login/login' })
    }, 1500)
    return
  }
  
  // 获取用户信息
  fetchUserInfo()
})



// 统一的页面跳转处理函数
const handleNav = (pageName) => {
  // 如果是我的发布，跳转到对应页面
  if (pageName === '我的动态') {
    uni.navigateTo({
      url: '/pages/user/my-posts',
      success: () => {
        console.log('跳转到我的动态页面')
      },
      fail: (err) => {
        console.error('跳转失败:', err)
        uni.showToast({ title: '页面跳转失败', icon: 'none' })
      }
    })
    return
  }
  
  // 如果是我的收藏，跳转到对应页面
  if (pageName === '我的收藏') {
    uni.navigateTo({
      url: '/pages/user/my-collections',
      success: () => {
        console.log('跳转到我的收藏页面')
      },
      fail: (err) => {
        console.error('跳转失败:', err)
        uni.showToast({ title: '页面跳转失败', icon: 'none' })
      }
    })
    return
  }
  if (pageName === '浏览历史') {
    uni.navigateTo({
      url: '/pages/user/browse-history',
      success: () => {
        console.log('跳转到我的浏览历史页面')
      },
      fail: (err) => {
        console.error('跳转失败:', err)
        uni.showToast({ title: '页面跳转失败', icon: 'none' })
      }
    })
    return
  }
  
  // 如果是系统设置，跳转到对应页面
  if (pageName === '系统设置') {
    uni.navigateTo({
      url: '/pages/user/settings',
      success: () => {
        console.log('跳转到系统设置页面')
      },
      fail: (err) => {
        console.error('跳转失败:', err)
        uni.showToast({ title: '页面跳转失败', icon: 'none' })
      }
    })
    return
  }
  
  // 如果是关于校园墙，跳转到独立的关于页面
  if (pageName === '关于校园墙') {
    uni.navigateTo({
      url: '/pages/user/about',
      success: () => {
        console.log('跳转到关于校园墙页面')
      },
      fail: (err) => {
        console.error('跳转失败:', err)
        uni.showToast({ title: '页面跳转失败', icon: 'none' })
      }
    })
    return
  }
  
  // 如果是意见反馈，跳转到反馈页面
  if (pageName === '意见反馈') {
    uni.navigateTo({
      url: '/pages/user/feedback',
      success: () => {
        console.log('跳转到意见反馈页面')
      },
      fail: (err) => {
        console.error('跳转失败:', err)
        uni.showToast({ title: '页面跳转失败', icon: 'none' })
      }
    })
    return
  }

  // 其他功能仍显示开发中提示
  uni.showToast({
    title: `「${pageName}」功能开发中...`,
    icon: 'none',
    duration: 1500
  })
}

// 点击AI 对话记录 - 跳转到AI对话记录页面
const handleAIDialogue = () => {
  uni.navigateTo({
    url: '/pages/ai/ai-history',
    success: () => {
      console.log('跳转到AI对话记录页面')
    },
    fail: (err) => {
      console.error('跳转失败:', err)
      uni.showToast({ title: '页面跳转失败', icon: 'none' })
    }
  })
}

// 点击AI 偏好设置 - 跳转到AI偏好设置页面
const handleAIPreference = () => {
  uni.navigateTo({
    url: '/pages/ai/preference',
    success: () => {
      console.log('跳转到AI偏好设置页面')
    },
    fail: (err) => {
      console.error('跳转失败:', err)
      uni.showToast({ title: '页面跳转失败', icon: 'none' })
    }
  })
}

// 点击信息区域 - 跳转到编辑资料页面
const handleEditProfile = () => {
  uni.navigateTo({
    url: '/pages/user/edit-profile',
    success: () => {
      console.log('跳转到编辑资料页面')
    },
    fail: (err) => {
      console.error('跳转失败:', err)
      uni.showToast({ title: '页面跳转失败', icon: 'none' })
    }
  })
}

// 点击获赞 - 跳转到获赞记录页面
const goToMyLikes = () => {
  uni.navigateTo({
    url: '/pages/user/my-likes',
    success: () => {
      console.log('跳转到获赞记录页面')
    },
    fail: (err) => {
      console.error('跳转失败:', err)
      uni.showToast({ title: '页面跳转失败', icon: 'none' })
    }
  })
}

// 点击收藏 - 跳转到我的收藏页面
const goToMyCollections = () => {
  uni.navigateTo({
    url: '/pages/user/my-collections',
    success: () => {
      console.log('跳转到我的收藏页面')
    },
    fail: (err) => {
      console.error('跳转失败:', err)
      uni.showToast({ title: '页面跳转失败', icon: 'none' })
    }
  })
}

// 点击关注 - 跳转到我的关注页面
const goToMyFollowing = () => {
  uni.navigateTo({
    url: '/pages/user/my-following',
    success: () => {
      console.log('跳转到我的关注页面')
    },
    fail: (err) => {
      console.error('跳转失败:', err)
      uni.showToast({ title: '页面跳转失败', icon: 'none' })
    }
  })
}

// 点击粉丝 - 跳转到我的粉丝页面
const goToMyFans = () => {
  uni.navigateTo({
    url: '/pages/user/my-fans',
    success: () => {
      console.log('跳转到我的粉丝页面')
    },
    fail: (err) => {
      console.error('跳转失败:', err)
      uni.showToast({ title: '页面跳转失败', icon: 'none' })
    }
  })
}

// 发布按钮点击事件
const handlePublish = () => {
  uni.navigateTo({
    url: '/pages/publish/publish'
  })
}
</script>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  background-color: $uni-bg-color-grey;
  position: relative;
}

/* 沉浸式弧形背景 */
.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 400rpx;
  background: linear-gradient(135deg, $uni-color-primary 0%, $uni-color-primary-dark 100%);
  border-bottom-left-radius: 40rpx;
  border-bottom-right-radius: 40rpx;
  z-index: 0;
}

.scroll-content {
  position: relative;
  z-index: 1;
  padding: 0 30rpx;
}

/* 通用卡片样式 */
.card-style {
  background-color: $uni-bg-color;
  border-radius: 20rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.02);
}

/* 用户信息卡片 */
.user-card {
  background-color: $uni-bg-color;
  border-radius: 20rpx;
  padding: 40rpx 30rpx 30rpx;
  margin-top: 20rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 10rpx 30rpx rgba(101, 187, 232, 0.1);
}

.user-info-top {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
}

.avatar { width: 130rpx; height: 130rpx; border-radius: 50%; margin-right: 30rpx; border: 4rpx solid #fff; box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.1); }
.info-right { flex: 1; }
.name-box { display: flex; flex-direction: column; align-items: flex-start; margin-bottom: 12rpx; }
.nickname-row { display: flex; align-items: center; margin-bottom: 8rpx; }
.nickname { font-size: 40rpx; font-weight: bold; color: $uni-text-color; }
.gender-male {
  font-size: 20px;
  margin-left: 8rpx;
  color: #4A90E2;
}
.gender-female {
  font-size: 20px;
  margin-left: 8rpx;
  color: #E91E8C;
}

/* 校园认证标签 */
.verify-tag { display: flex; align-items: center; background-color: $uni-color-primary-bg; color: $uni-color-primary; padding: 4rpx 16rpx; border-radius: 20rpx; font-size: 20rpx; font-weight: bold; }
.verify-icon { font-size: 22rpx; margin-right: 6rpx; }
.verify-text { font-size: 20rpx; margin-left: 20rpx;}

.bio { font-size: 26rpx; color: $uni-text-color-grey; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 1; overflow: hidden; }

/* 数据看板 */
.stats-board { display: flex; justify-content: space-around; }
.stat-item { 
  display: flex; 
  flex-direction: column; 
  align-items: center;
  padding: 10rpx 20rpx;
  border-radius: 16rpx;
  transition: all 0.3s;
}
.stat-item:active {
  background-color: $uni-color-primary-bg;
  transform: scale(0.95);
}
.num { font-size: 36rpx; font-weight: bold; color: $uni-text-color; margin-bottom: 6rpx; }
.label { font-size: 24rpx; color: $uni-text-color-grey; }

/* 互动资产宫格 */
.action-grid { display: flex; justify-content: space-around; padding: 30rpx 0; }
.grid-item { display: flex; flex-direction: column; align-items: center; }
.grid-icon { font-size: 50rpx; margin-bottom: 12rpx; }
.grid-text { font-size: 26rpx; color: $uni-text-color; }

/* 图标颜色调整 */
.text-blue { color: $uni-color-primary; }
.text-orange { color: #FFB04C; }
.text-green { color: #4CD964; }
.text-purple { color: #B57DFF; }

/* 列表样式 */
.ai-feature-card { padding: 30rpx; }
.card-title { font-size: 30rpx; font-weight: bold; color: $uni-text-color; margin-bottom: 20rpx; padding-bottom: 20rpx; border-bottom: 1px solid $uni-border-color; }

.basic-service { padding: 10rpx 30rpx; }

.menu-item { display: flex; justify-content: space-between; align-items: center; padding: 30rpx 0; border-bottom: 1px solid $uni-bg-color-light; }
.menu-item.border-none { border-bottom: none; }
.menu-left { display: flex; align-items: center; }
.menu-icon { font-size: 36rpx; margin-right: 20rpx; }
.menu-text { font-size: 28rpx; color: $uni-text-color; }
.menu-right { display: flex; align-items: center; }
.sub-text { font-size: 24rpx; color: $uni-text-color-grey; margin-right: 10rpx; }
.arrow { color: $uni-border-color-light; font-weight: bold; }

.bottom-spacer { height: 120rpx; }

/* 悬浮发布按钮 */
.fab-btn {
  position: fixed;
  right: 30rpx;
  bottom: 160rpx; /* 调整高度，避免被TabBar遮挡 */
  width: 100rpx;
  height: 100rpx;
  background: $uni-btn-primary;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(255, 208, 0, 0.4);
  z-index: 999;
  transition: all 0.3s;
}

.fab-btn:active {
  transform: scale(0.95);
}

.fab-btn .icon {
  font-size: 60rpx;
  color: #fff;
  font-weight: 300;
  line-height: 1;
}
</style>