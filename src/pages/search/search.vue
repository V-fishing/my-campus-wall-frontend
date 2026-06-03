<template>
  <view class="bg-background min-h-screen flex flex-col relative w-full overflow-x-hidden selection:bg-primary-container">
    
    <view class="sticky top-0 z-50 bg-background/85 backdrop-blur-md px-margin-page border-b border-outline-variant/30 flex flex-col justify-end pb-2 transition-all" 
          :style="{ paddingTop: statusBarHeight + 'px', height: (statusBarHeight + 50) + 'px' }">
      <view class="flex items-center w-full">
        <view class="bouncy-tap mr-4 text-primary flex items-center justify-center" @click="goBack">
          <text class="material-symbols-outlined text-[56rpx]">arrow_back</text>
        </view>
        <text class="font-headline-lg-mobile text-[36rpx] font-bold text-primary tracking-tight">校园搜索</text>
        <view class="ml-auto w-[180rpx]"></view>
      </view>
    </view>

    <view class="px-margin-page mt-4">
      <view class="flex items-center gap-3">
        <view class="relative shrink-0">
          <view class="bouncy-tap flex items-center gap-1.5 px-4 py-2 bg-primary-fixed rounded-full border-[4rpx] border-white shadow-sm"
                @click="toggleScopePicker">
            <text class="text-[26rpx] font-bold text-on-primary-fixed-variant">{{ scopeLabel }}</text>
            <text class="material-symbols-outlined text-[32rpx] transition-transform duration-200"
                  :class="showScopePicker ? 'rotate-180' : ''">keyboard_arrow_down</text>
          </view>
          <view v-if="showScopePicker"
                class="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-lg border border-outline-variant/20 overflow-hidden z-50 min-w-[160rpx]">
            <view v-for="opt in scopeOptions" :key="opt.value"
                  class="px-4 py-3 text-[26rpx] font-bold flex items-center justify-between"
                  :class="searchScope === opt.value ? 'text-primary bg-primary-container/20' : 'text-on-surface'"
                  @click="selectScope(opt.value)">
              {{ opt.label }}
              <text v-if="searchScope === opt.value" class="material-symbols-outlined text-primary text-[28rpx]">check</text>
            </view>
          </view>
        </view>

        <view class="flex-1 relative flex items-center bg-surface-container-low rounded-full px-4 h-[80rpx] sticker-shadow border border-outline-variant/20 transition-all focus-within:ring-2 focus-within:ring-primary-container">
          <text class="material-symbols-outlined text-primary/60 text-[40rpx] mr-2">search</text>
          <input 
            class="flex-1 bg-transparent border-none text-on-surface font-body-lg text-[28rpx]" 
            placeholder="搜索话题、动态、用户..." 
            v-model="searchKeyword" 
            :focus="true"
            @confirm="handleSearch"
            @input="onInputChange"
          />
          <view class="w-[60rpx] h-full flex items-center justify-center active:opacity-60" v-if="searchKeyword" @click="clearInput">
            <text class="material-symbols-outlined text-outline-variant text-[40rpx]">close</text>
          </view>
        </view>
      </view>
    </view>

    <scroll-view scroll-y class="flex-1 overflow-y-auto hide-scrollbar mt-6 pb-[100rpx]">
      
      <view class="px-margin-page" v-if="showResults">
        
        <view class="text-center py-20" v-if="loading">
          <text class="material-symbols-outlined animate-spin text-primary text-[64rpx]">sync</text>
          <text class="block text-on-surface-variant mt-2 text-[26rpx]">搜索中...</text>
        </view>

        <view class="flex flex-col items-center justify-center py-20" v-else-if="resultList.length === 0">
          <text class="text-[120rpx] opacity-50 mb-4">🔍</text>
          <text class="text-on-surface-variant font-bold text-[32rpx]">未找到相关结果</text>
          <text class="text-outline-variant text-[24rpx] mt-2">换个关键词试试吧</text>
        </view>

        <view class="space-y-4" v-else>
          <view 
            class="bg-white rounded-[40rpx] p-[32rpx] kawaii-shadow border border-outline-variant/20 bouncy-tap mb-4" 
            v-for="post in resultList" :key="post.id" @click="goToDetail(post.id)">
            
            <view class="flex items-center mb-3">
              <image class="w-[72rpx] h-[72rpx] rounded-full mr-3 bg-surface-container border-[4rpx] border-white shadow-sm" :src="post.isAnonymous ? defaultAvatar : (post.avatar || defaultAvatar)" mode="aspectFill"></image>
              <view class="flex flex-col">
                <text class="font-bold text-[28rpx] text-on-surface">{{ post.isAnonymous ? '匿名用户' : (post.author || '匿名用户') }}</text>
                <text class="text-[22rpx] text-on-surface-variant">{{ formatTime(post.createTime) }}</text>
              </view>
            </view>
            
            <text class="text-[28rpx] text-on-surface leading-relaxed block mb-3 line-clamp-3">{{ post.content }}</text>
            
            <view class="flex flex-wrap gap-2 mb-3" v-if="post.tags && post.tags.length > 0">
              <text class="px-3 py-1 bg-secondary-container/20 text-secondary rounded-full text-[22rpx] font-bold" v-for="tag in post.tags.slice(0, 3)" :key="tag">
                #{{ tag }}
              </text>
            </view>

            <view class="flex justify-between items-center pt-3 border-t border-outline-variant/20">
              <text class="bg-primary-container/20 text-primary px-3 py-1 rounded-full text-[20rpx] font-bold">{{ post.category || '综合' }}</text>
              <view class="flex gap-4 text-outline-variant text-[24rpx]">
                <view class="flex items-center gap-1"><text class="material-symbols-outlined text-[28rpx]">visibility</text>{{ post.viewCount || 0 }}</view>
                <view class="flex items-center gap-1"><text class="material-symbols-outlined text-[28rpx]">favorite</text>{{ post.likeCount || 0 }}</view>
                <view class="flex items-center gap-1"><text class="material-symbols-outlined text-[28rpx]">chat_bubble</text>{{ post.commentCount || 0 }}</view>
              </view>
            </view>

          </view>
        </view>
      </view>

      <view v-else>
        <view class="px-margin-page mb-8" v-if="historyList.length > 0">
          <view class="flex justify-between items-center mb-4">
            <view class="font-headline-md-mobile text-[32rpx] font-bold text-on-surface flex items-center gap-2">
              <text class="text-[40rpx]">📜</text> 搜索历史
            </view>
            <text class="text-on-surface-variant text-[24rpx] active:text-primary transition-colors" @click="clearAllHistory">清空全部</text>
          </view>
          <view class="flex flex-wrap gap-2">
            <view 
              class="bouncy-tap flex items-center gap-2 px-4 py-1.5 bg-secondary-fixed text-on-secondary-fixed-variant rounded-full text-[24rpx] font-bold shadow-sm border-[4rpx] border-white" 
              v-for="(keyword, index) in historyList" :key="index" @click="searchByKeyword(keyword)">
              {{ keyword }}
              <view class="w-[32rpx] h-[32rpx] flex items-center justify-center bg-white/50 rounded-full active:bg-white" @click.stop="deleteHistory(index)">
                <text class="material-symbols-outlined text-[24rpx]">close</text>
              </view>
            </view>
          </view>
        </view>

        <view class="px-margin-page pb-10">
          <view class="flex justify-between items-center mb-4">
            <view class="font-headline-md-mobile text-[32rpx] font-bold text-on-surface flex items-center gap-2">
              <text class="text-[40rpx]">🔥</text> 热搜榜单
            </view>
            <text class="text-on-surface-variant text-[24rpx] active:text-primary transition-colors flex items-center" @click="refreshHotSearch">
              <text class="material-symbols-outlined text-[28rpx] mr-1">refresh</text>刷新
            </text>
          </view>
          
          <view class="bg-surface-container-lowest rounded-[40rpx] sticker-shadow doodle-border p-[32rpx] space-y-1">
            <view 
              class="bouncy-tap flex items-center gap-4 py-3 border-b border-outline-variant/30 last:border-0" 
              v-for="(item, index) in hotSearchList" :key="item.id" @click="searchByKeyword(item.keyword)">
              
              <view class="w-[44rpx] h-[44rpx] flex items-center justify-center rounded-full font-bold shadow-sm text-[22rpx]" :class="getRankClass(index)">
                {{ index + 1 }}
              </view>
              
              <text class="flex-1 text-[28rpx] text-on-surface truncate" :class="index < 3 ? 'font-bold' : ''">{{ item.keyword }}</text>
              
              <view class="flex items-center gap-1 px-2 py-0.5 rounded-full text-[20rpx] font-bold" :class="item.type === '热' ? 'bg-error-container text-on-error-container' : 'bg-tertiary-container text-on-tertiary-container'">
                <text class="material-symbols-outlined text-[24rpx]" v-if="item.type === '热'" style="font-variation-settings: 'FILL' 1;">local_fire_department</text>
                {{ item.type }}
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="fixed top-32 left-4 pointer-events-none z-[-1]">
      <text class="material-symbols-outlined text-primary-container/40 animate-pulse text-[80rpx]">auto_awesome</text>
    </view>
    <view class="fixed bottom-32 right-8 pointer-events-none z-[-1]">
      <text class="material-symbols-outlined text-secondary-container/40 animate-bounce text-[64rpx]">favorite</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { get } from '@/utils/request.js'
import { searchApi } from '@/api/index.js'

const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight || 20)
const defaultAvatar = '/static/images/anonymous-avatar.png'

// 搜索相关
const searchKeyword = ref('')
const showResults = ref(false)
const resultList = ref([])
const loading = ref(false)

// 搜索范围（0=本校，null=全部）
const searchScope = ref(0)
const showScopePicker = ref(false)
const scopeOptions = [
  { label: '本校', value: 0 },
  { label: '全部', value: null }
]
const scopeLabel = computed(() => scopeOptions.find(o => o.value === searchScope.value)?.label || '本校')

const toggleScopePicker = () => {
  showScopePicker.value = !showScopePicker.value
}

const selectScope = (value) => {
  searchScope.value = value
  showScopePicker.value = false
  if (showResults.value && searchKeyword.value.trim()) {
    handleSearch()
  }
}

// 热搜榜单
const hotSearchList = ref([])

// 搜索历史
const historyList = ref([])
const maxHistory = 10

// 页面加载
onLoad(() => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 20

  loadSearchHistory()
  loadHotSearch()  
})

// 监听输入
const onInputChange = () => {
  if (!searchKeyword.value.trim()) {
    showResults.value = false
  }
}

// 执行搜索
const handleSearch = async () => {
  const keyword = searchKeyword.value.trim()
  if (!keyword) {
    uni.showToast({ title: '请输入搜索关键词', icon: 'none' })
    return
  }

  addToHistory(keyword)
  showResults.value = true
  loading.value = true

  try {
    const params = { keyword: keyword, page: 1, size: 20, ...(searchScope.value !== null ? { scope: searchScope.value } : {}) }
    const apiConfig = searchApi.searchPosts(params)
    const response = await get(apiConfig.url, params)
    
    if (response.data && response.data.records) {
      resultList.value = response.data.records.map(item => ({
        id: item.id,
        userId: item.userId,
        author: item.author || '匿名用户',
        avatar: item.avatar || defaultAvatar,
        createTime: new Date(item.createTime).getTime(),
        content: item.content,
        category: item.category || '推荐',
        tags: item.tags || [],
        viewCount: item.viewCount || 0,
        likeCount: item.likeCount || 0,
        commentCount: item.commentCount || 0,
        isAnonymous: item.isAnonymous || false
      }))
    } else {
      resultList.value = []
    }
  } catch (error) {
    uni.showToast({ title: '搜索失败，请重试', icon: 'none' })
    resultList.value = []
  } finally {
    loading.value = false
  }
}

// 通过关键词搜索
const searchByKeyword = (keyword) => {
  searchKeyword.value = keyword
  handleSearch()
}

// 清空输入
const clearInput = () => {
  searchKeyword.value = ''
  showResults.value = false
  resultList.value = []
}

// 获取排名背景样式
const getRankClass = (index) => {
  if (index === 0) return 'bg-gradient-to-br from-[#FFD700] to-[#FF8C00] text-white'
  if (index === 1) return 'bg-gradient-to-br from-[#E0E0E0] to-[#9E9E9E] text-white'
  if (index === 2) return 'bg-gradient-to-br from-[#CD7F32] to-[#8B4513] text-white'
  return 'bg-surface-container-high text-on-surface-variant'
}

// 刷新热搜
const refreshHotSearch = async () => {
  uni.showLoading({ title: '刷新中...' })
  try {
    await loadHotSearch()
    uni.hideLoading()
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: '刷新失败', icon: 'none' })
  }
}

// 加载热搜榜单
const loadHotSearch = async () => {
  try {
    const apiConfig = searchApi.getHotSearch(10)
    const response = await get(apiConfig.url, { limit: 10 })
    if (response.data && Array.isArray(response.data)) {
      hotSearchList.value = response.data.map((item) => ({
        id: item.id,
        keyword: item.keyword,
        type: item.type,
        searchCount: item.searchCount
      }))
    }
  } catch (error) {
    console.error('加载热搜失败:', error)
  }
}

// 加载搜索历史
const loadSearchHistory = () => {
  const history = uni.getStorageSync('searchHistory')
  if (history) historyList.value = history
}

// 保存搜索历史
const addToHistory = (keyword) => {
  const index = historyList.value.indexOf(keyword)
  if (index > -1) historyList.value.splice(index, 1)
  historyList.value.unshift(keyword)
  if (historyList.value.length > maxHistory) {
    historyList.value = historyList.value.slice(0, maxHistory)
  }
  uni.setStorageSync('searchHistory', historyList.value)
}

// 删除单条历史
const deleteHistory = (index) => {
  historyList.value.splice(index, 1)
  uni.setStorageSync('searchHistory', historyList.value)
}

// 清空所有历史
const clearAllHistory = () => {
  uni.showModal({
    title: '提示',
    content: '确定要清空所有搜索历史吗？',
    confirmColor: '#FF3B30',
    success: (res) => {
      if (res.confirm) {
        historyList.value = []
        uni.setStorageSync('searchHistory', [])
        uni.showToast({ title: '已清空', icon: 'success' })
      }
    }
  })
}

// 时间格式化
const formatTime = (timestamp) => {
  if (!timestamp) return '刚刚'
  const now = Date.now()
  const diff = now - timestamp
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
  const date = new Date(timestamp)
  return date.getMonth() + 1 + '月' + date.getDate() + '日'
}

const goToDetail = (postId) => {
  if (!postId) return
  uni.navigateTo({
    url: `/pages/post/detail?id=${postId}`,
    fail: () => uni.showToast({ title: '页面跳转失败', icon: 'none' })
  })
}

const goBack = () => uni.navigateBack()
</script>

<style scoped>
/* 隐藏滚动条 */
.hide-scrollbar::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  color: transparent;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* 按钮点击回弹效果 */
.bouncy-tap:active {
  transform: scale(0.95);
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 柔和彩色弥散阴影 */
.kawaii-shadow {
  box-shadow: 0 12rpx 40rpx rgba(255, 143, 163, 0.12);
}

/* 输入框与贴纸组件的外发光阴影 */
.sticker-shadow {
  box-shadow: 0 0 0 4rpx #ffffff, 0 8rpx 24rpx rgba(255, 143, 163, 0.2);
}

/* 虚线边框 */
.doodle-border {
  border: 4rpx dashed rgba(155, 64, 83, 0.2);
}

/* 文本超出行省略 */
.line-clamp-3 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}
</style>