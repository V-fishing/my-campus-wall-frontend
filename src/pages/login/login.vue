<template>
  <view class="login-container min-h-screen relative flex items-center justify-center overflow-hidden selection:bg-primary-fixed">
    
    <view class="absolute inset-0 bg-gradient-login z-0">
      <view class="bokeh-particle" 
            v-for="(item, index) in particleList" 
            :key="index"
            :style="{
              width: item.size + 'rpx',
              height: item.size + 'rpx',
              left: item.left + '%',
              top: item.top + '%',
              animationDelay: item.delay + 's',
              animationDuration: item.duration + 's'
            }">
      </view>
    </view>

    <main class="relative z-10 w-full px-margin-page flex flex-col items-center justify-center animate-fade-in">
      <view class="w-full max-w-[640rpx] bg-surface-container-lowest rounded-[48rpx] p-8 shadow-2xl flex flex-col items-center space-y-8 relative">
        
        <view class="flex flex-col items-center space-y-2 scale-95 transition-transform duration-300">
          <view class="w-20 h-20 bg-primary-container rounded-[40rpx] flex items-center justify-center shadow-sm">

          </view>
          <text class="font-headline-lg-mobile text-[48rpx] text-primary font-extrabold tracking-tight mt-2">Campus Wall</text>
          <text class="font-label-md text-[26rpx] text-on-surface-variant/70 font-bold">嘉应学院校园生活社区</text>
        </view>

        <view class="w-full space-y-6">
          
          <button 
            class="wechat-gradient w-full h-[100rpx] rounded-full flex items-center justify-center space-x-2 shadow-[0_8px_24px_rgba(7,193,96,0.3)] transition-all bouncy-tap border-none text-white font-headline-md text-[32rpx] font-bold"
            @click="handleWechatLogin"
            :loading="loading"
            :disabled="loading"
          >
            <text class="text-[36rpx]" v-if="!loading">💬</text>
            <text>{{ loading ? '正在连通时光机...' : '微信一键登录' }}</text>
          </button>

          <view class="flex items-start space-x-3 group" @click="toggleAgreement">
            <view class="mt-0.5 flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center shadow-sm border transition-all"
                  :class="agreed ? 'checkbox-gradient border-transparent' : 'bg-white border-outline-variant/60'">
              <text class="material-symbols-outlined text-[24rpx] text-white font-black" v-if="agreed">check</text>
            </view>
            
            <view class="font-label-sm text-[24rpx] text-on-surface-variant leading-relaxed flex-1">
              我已阅读并同意 
              <text class="text-secondary font-bold hover:opacity-80 transition-opacity mx-0.5" @click.stop="viewAgreement('user')">《用户协议》</text> 
              和 
              <text class="text-secondary font-bold hover:opacity-80 transition-opacity mx-0.5" @click.stop="viewAgreement('privacy')">《隐私政策》</text>
            </view>
          </view>

        </view>

        <view class="absolute -top-4 -right-4 pointer-events-none opacity-80 z-20">
          <text class="material-symbols-outlined text-primary-container text-[72rpx]" style="font-variation-settings: 'FILL' 1;">favorite</text>
        </view>
        
      </view>

      <footer class="mt-16 text-center w-full px-12">
        <p class="text-white opacity-60 text-[22rpx] font-label-sm leading-relaxed font-medium">
          登录即代表您同意我们的服务条款<br>
          © 2026 Campus Wall Studio. All Rights Reserved
        </p>
      </footer>
    </main>

  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { post } from '@/utils/request.js'
import { userApi } from '@/api/index.js'
import { saveLoginInfo, isLogin } from '../../utils/auth.js' //

const loading = ref(false)
const agreed = ref(false)
const particleList = ref([])

// 周期挂载检测拦截器
onLoad(() => {
  console.log('========== 校园墙登录大厅加载 ==========')
  
  // 1. 初始化高保真非重叠浮空微粒群矩阵数据
  generateParticles()

  // 2. 统一认证工具库流控拦截机制：若属于已登录老用户直接安全重定向首页
  if (isLogin()) {
    console.log('🔄 检测到有效的持久化凭证，正在秒级跳关首页...')
    uni.switchTab({
      url: '/pages/index/index',
      fail: (err) => {
        console.error('自动重定向首页受阻:', err)
      }
    })
  }
})

// 随机算法驱动散落气泡
const generateParticles = () => {
  const count = 18
  const list = []
  for (let i = 0; i < count; i++) {
    list.push({
      size: Math.floor(Math.random() * 80) + 40,
      left: Math.floor(Math.random() * 100),
      top: Math.floor(Math.random() * 100),
      delay: (Math.random() * 6).toFixed(2),
      duration: (Math.random() * 15 + 15).toFixed(2)
    })
  }
  particleList.value = list
}

const toggleAgreement = () => {
  agreed.value = !agreed.value
}

// 微信高保真登录核心流
const handleWechatLogin = async () => {
  // 协议硬拦截防御
  if (!agreed.value) {
    uni.showToast({
      title: '请先阅读并同意用户协议哦 (◕‿◕✿)',
      icon: 'none'
    })
    return
  }

  loading.value = true

  try {
    console.log('🚀 正在与微信底层打通握手...')
    
    // 1. 异步换算微信临时入场凭证 Code
    const loginRes = await new Promise((resolve, reject) => {
      uni.login({
        provider: 'weixin',
        success: (res) => resolve(res),
        fail: (err) => reject(err)
      })
    })

    if (!loginRes.code) {
      throw new Error('未获取到有效的微信登录凭证')
    }

    console.log('🔑 已成功签收 Code:', loginRes.code)

    // 2. 投递后端安全网关进行鉴权认证
    const response = await post(userApi.login(loginRes.code).url, {
      code: loginRes.code
    })

    console.log('📦 后端会话建立响应:', response)

    // 3. 多端持久化凭证同步写入缓存
    if (response.code === 200 && response.data) {
      const success = saveLoginInfo(response.data)
      
      if (!success) {
        throw new Error('写入本地加密凭证失败')
      }
      
      uni.vibrateShort()
      uni.showToast({
        title: '成功入场 ✨',
        icon: 'success',
        duration: 1500
      })

      // 4. 路由切流无缝冲入 TabBar 首页工作大厅
      setTimeout(() => {
        uni.switchTab({
          url: '/pages/index/index',
          success: () => console.log('🎉 欢迎回到校园墙大厅')
        })
      }, 1500)
    } else {
      throw new Error(response.message || '登录遇到阻碍')
    }
  } catch (error) {
    console.error('❌ 微信通道建立失败:', error)
    uni.showToast({
      title: error.message || '网关开小差了，请重试',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 协议多态查看分发
const viewAgreement = (type) => {
  uni.navigateTo({
    url: `/pages/document/document?type=${type}`,
    fail: () => {
      uni.showToast({ title: `《${type === 'user' ? '用户协议' : '隐私政策'}》正在加载中`, icon: 'none' })
    }
  })
}
</script>

<style scoped>
/* 拦截并掩埋底层系统多余的僵硬滚动条纹 */
::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  color: transparent;
}

/* 标志性全屏极光色彩大色盘 */
.bg-gradient-login {
  background: #764ba2;
}

/* 微信专属高级质感草绿渐变纽扣 */
.wechat-gradient {
  background: #06AD56;
}

/* 协议激活渐变彩色微缩复选框 */
.checkbox-gradient {
  background: #764ba2;
}

/* 软糯果冻响应颗粒按压机制类 */
.bouncy-tap:active {
  transform: scale(0.96);
  transition: transform 0.1s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 标志性棉花糖贴纸白描外高光边 */


/* 核心：高精动态多粒子矩阵微弱漂浮浮空特效 */
.bokeh-particle {
  position: absolute;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  pointer-events: none;
  animation: float linear infinite;
}

@keyframes float {
  0% { transform: translateY(0) translateX(0) scale(1); opacity: 0.2; }
  50% { transform: translateY(-160rpx) translateX(60rpx) scale(1.1); opacity: 0.4; }
  100% { transform: translateY(-320rpx) translateX(-30rpx) scale(1); opacity: 0.2; }
}

/* 卡片整体淡出特效 */
.animate-fade-in {
  animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.96) translateY(20rpx); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>