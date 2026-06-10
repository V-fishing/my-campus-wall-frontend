<template>
  <view class="bg-surface text-on-surface min-h-screen flex flex-col relative pb-[140rpx] selection:bg-primary-container">

    <!-- 顶部固定高光导航栏 -->
    <view class="fixed top-0 w-full z-50 bg-surface/85 backdrop-blur-md border-b-2 border-dashed border-outline-variant/30 px-margin-page flex items-center justify-between shadow-[0_12px_40px_rgba(255,143,163,0.12)]" :style="{ paddingTop: statusBarHeight + 'px', height: (statusBarHeight + 48) + 'px' }">
      <view class="bouncy-tap text-primary flex items-center justify-center w-8 h-8" @click="goToSearch">
        <span class="material-symbols-outlined text-[44rpx]">search</span>
      </view>

      <!-- 中央分段控制器 -->
      <view class="flex bg-surface-container-low rounded-full p-1 border border-outline-variant/20 absolute left-1/2 -translate-x-1/2">
        <view class="px-5 py-1.5 rounded-full font-headline-md-mobile text-headline-md-mobile font-bold transition-all flex items-center"
              :class="viewMode === 'recommend' ? 'bg-primary-container text-on-primary-container shadow-sm' : 'text-on-surface-variant'"
              @click="switchViewMode('recommend')">校园</view>
        <view class="px-5 py-1.5 rounded-full font-headline-md-mobile text-headline-md-mobile font-bold transition-all flex items-center"
              :class="viewMode === 'following' ? 'bg-primary-container text-on-primary-container shadow-sm' : 'text-on-surface-variant'"
              @click="switchViewMode('following')">关注</view>
      </view>
      <view class="w-[90px]"></view>
    </view>

    <!-- 主体滚动流 -->
    <scroll-view class="flex-1 w-full" scroll-y :style="{ marginTop: (statusBarHeight + 48) + 'px' }" @scrolltolower="onReachBottom" @scroll="onScroll">
      <view class="px-margin-page space-y-gutter-card pt-2 pb-16">

        <!-- 热帖滚动 Banner -->
        <view class="hot-banner-gradient rounded-3xl p-4 flex items-center gap-3 overflow-hidden relative kawaii-shadow bouncy-tap" @click="goToHotPosts" v-if="viewMode === 'recommend' && hotPosts.length > 0">
          <view class="bg-white/20 p-2 rounded-2xl backdrop-blur-sm flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-white text-[36rpx]">trending_up</span>
          </view>
          <view class="flex-1 overflow-hidden h-6 relative">
            <swiper class="h-full w-full" :autoplay="true" :interval="3000" :duration="500" circular vertical :indicator-dots="false">
              <swiper-item v-for="(post, index) in hotPosts" :key="post.id">
                <view class="h-6 flex items-center gap-2 text-white font-label-md-mobile text-[24rpx]">
                  <span class="font-bold opacity-80">{{ String(index + 1).padStart(2, '0') }}</span>
                  <span class="truncate font-medium flex-1">{{ post.content }}</span>
                </view>
              </swiper-item>
            </swiper>
          </view>
          <span class="material-symbols-outlined text-white opacity-60 text-[36rpx]">chevron_right</span>
        </view>

        <!-- 双层话题导航体系 (Stitch 设计还原) -->
        <view class="relative z-30 space-y-2" v-if="viewMode === 'recommend'">

          <!-- 第一级话题层 -->
          <view class="relative flex items-center bg-surface-container-lowest rounded-full p-1.5 sticker-border kawaii-shadow overflow-hidden">

            <scroll-view scroll-x class="w-full hide-scrollbar pr-8" :show-scrollbar="false">
              <view class="flex gap-2 px-1 items-center">
                <view v-for="(group, gIdx) in categoryGroups" :key="group.id" @click="selectGroup(gIdx)"
                        class="px-4 py-2 rounded-full text-label-md flex-shrink-0 bouncy-tap whitespace-nowrap transition-all border-none flex items-center"
                        :class="activeGroupIndex === gIdx ? 'hot-banner-gradient text-white shadow-sm' : 'bg-surface-container text-on-surface-variant'">
                  {{ group.name }}<text class="ml-1 opacity-60 text-label-sm">({{ group.postCount || 0 }})</text>
                </view>
              </view>
            </scroll-view>



            <!-- 展开箭头 -->
            <view class="absolute right-2 top-0 bottom-0 flex items-center text-primary bouncy-tap z-20"
                  @click="toggleDropdown"
                  >
              <span class="material-symbols-outlined transition-transform duration-300 text-[42rpx]"
                    :class="[showDropdownPanel ? 'rotate-90' : 'rotate-0']"
                    >chevron_right</span>
            </view>
          </view>

          <!-- 一级面板下拉框 -->
          <view v-if="showDropdownPanel" class="bg-surface-container-lowest rounded-3xl p-4 sticker-border kawaii-shadow border-t-0 -mt-2.5 pt-6 animate-fade-in z-40 relative">
            <view class="text-on-surface-variant text-label-sm mb-3 px-2">全部分类</view>
            <view class="grid grid-cols-4 gap-2">
              <view v-for="(group, gIdx) in categoryGroups" :key="'panel-'+group.id" @click="selectGroupFromPanel(gIdx)"
                      class="bg-surface-container-high py-3 rounded-2xl text-label-sm text-on-surface border-none bouncy-tap flex items-center justify-center">
                {{ group.name }}
              </view>
            </view>
          </view>

          <!-- 第二级话题层 -->
          <view v-if="activeGroupIndex !== null && categoryGroups[activeGroupIndex]" class="flex items-center gap-2 overflow-hidden py-1 animate-fade-in">
            <view class="flex-1 flex items-center gap-2 overflow-hidden">
              <scroll-view scroll-x class="flex-1 hide-scrollbar" :show-scrollbar="false">
                <view class="flex gap-2 items-center px-1 pr-1">
                  <view v-for="child in categoryGroups[activeGroupIndex].children" :key="child.id" @click="selectCategory(child)"
                          class="text-label-sm px-3 py-1.5 rounded-full flex-shrink-0 whitespace-nowrap transition-all border flex items-center"
                          :class="currentCategoryId === child.id ? 'text-primary bg-primary/10 border-primary/20' : 'text-on-surface-variant bg-surface-container-low border-transparent'">
                    # {{ child.name }}<text class="ml-0.5 opacity-50 text-[18rpx]">({{ child.postCount || 0 }})</text>
                  </view>
                </view>
              </scroll-view>
            </view>
            <view v-if="categoryGroups[activeGroupIndex].children && categoryGroups[activeGroupIndex].children.length > 0" class="w-8 h-8 flex items-center justify-center text-on-surface-variant bg-surface-container-low rounded-xl bouncy-tap flex-shrink-0 border-none p-0" @click="openTopicPopover">
              <span class="material-symbols-outlined text-[32rpx]">menu</span>
            </view>
          </view>
        </view>

        <!-- 帖子列表 -->
        <view class="space-y-4">
          <view class="bg-surface-container-lowest rounded-3xl p-4 sticker-border kawaii-shadow space-y-3 relative overflow-hidden"
                   :class="{ 'promo-card': post.boardCode === 'promotion', 'sold-dim': post.isSold === 1 }"
                   v-for="post in displayPosts" :key="post.id">

            <!-- 推广帖专属高亮标签（极客蓝微渐变，右上角，避免欺骗感） -->
            <view v-if="post.boardCode === 'promotion'" class="promo-tag">推广</view>

            <!-- 头部作者区 -->
            <view class="flex items-center justify-between">
              <view class="flex items-center gap-3" @click="goToUserHome(post)">
                <view class="relative shrink-0">
                  <!-- 匿名头像 -->
                  <view v-if="post.isAnonymous" class="w-10 h-10 rounded-full bg-outline-variant flex items-center justify-center text-white">
                    <span class="material-symbols-outlined text-[36rpx]">person</span>
                  </view>
                  <!-- 正常头像 -->
                  <image v-else class="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm bg-surface-container-low" lazy-load mode="aspectFill" :src="post.avatar || defaultAvatar"></image>
                  <!-- 性别标识 -->
                  <view v-if="!post.isAnonymous && post.gender === 1" class="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-400 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                    <span class="material-symbols-outlined text-[10px] text-white font-bold icon-filled">male</span>
                  </view>
                  <view v-else-if="!post.isAnonymous && post.gender === 2" class="absolute -bottom-1 -right-1 w-4 h-4 bg-pink-400 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                    <span class="material-symbols-outlined text-[10px] text-white font-bold icon-filled">female</span>
                  </view>
                </view>
                <view>
                  <view class="font-headline-md-mobile text-[28rpx] font-bold text-on-surface">{{ post.isAnonymous ? '匿名小伙' : (post.author || '神秘洞主') }}</view>
                  <view class="font-label-sm-mobile text-[20rpx] text-on-surface-variant mt-0.5">{{ formatTime(post.createTime) }} • {{ post.category || '社区' }}</view>
                </view>
              </view>

              <!-- 右侧操作 -->
              <view class="text-on-surface-variant bg-transparent border-none p-0" @click.stop="openReportPopup(post)">
                <span class="material-symbols-outlined text-[36rpx]">more_horiz</span>
              </view>
            </view>

            <!-- 内容区 -->
            <view @click="goToDetail(post.id)">
              <!-- 有图帖子：正常文本 -->
              <view
                 class="font-body-lg-mobile text-[28rpx] text-on-surface block mb-3 line-clamp-3 leading-relaxed font-medium">{{ post.content }}</view>

            </view>

            <!-- 推广帖：撑满卡片宽度的横向 Banner 大图（替代三宫格特权） -->
            <image v-if="post.boardCode === 'promotion' && post.bannerImage"
                   :src="post.bannerImage" class="promo-banner" mode="aspectFill"
                   @click="goToDetail(post.id)"></image>

            <!-- 图片网格（推广帖有 Banner 时不再渲染三宫格） -->
            <view v-else-if="post.images && post.images.length > 0"
                 :class="['grid gap-2', post.images.length >= 3 ? 'grid-cols-3' : 'grid-cols-2']"
                 @click="goToDetail(post.id)">
              <view v-for="(img, i) in post.images.slice(0, post.images.length >= 3 ? 3 : 2)" :key="i"
                    :class="[post.images.length >= 3 ? 'aspect-square' : 'h-40', 'bg-surface-container-high rounded-2xl overflow-hidden relative']">
                <image class="w-full h-full object-cover opacity-0 transition-opacity duration-500"
                       :class="{ 'opacity-100': imageLoaded[img] }"
                       lazy-load mode="aspectFill" :src="img"
                       @load="() => onImageLoad(img)"></image>
                <view v-if="post.images.length >= 3 && i === 2 && post.images.length > 3"
                      class="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-headline-md-mobile font-bold text-[32rpx]">
                  +{{ post.images.length - 3 }}
                </view>
              </view>
            </view>

            <!-- 二手交易：价格(醒目) + 已售出标记 + 联系方式(可复制) -->
            <view v-if="post.boardCode === 'secondhand'" class="flex items-center gap-3 flex-wrap">
              <text class="text-[#FF8FA3] font-bold text-[34rpx]">{{ post.price != null ? '¥' + post.price : '面议' }}</text>
              <text v-if="post.isSold === 1" class="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-[20rpx] font-bold">已售出</text>
              <view v-if="post.contact" class="contact-chip" @click.stop="copyContact(post.contact)">
                <span class="material-symbols-outlined text-[28rpx]">call</span>
                <text class="ml-1">{{ post.contact }}</text>
                <text class="copy-btn">复制</text>
              </view>
            </view>

            <!-- 兼职发布：薪资 + 信息费 + 联系方式 -->
            <view v-if="post.boardCode === 'parttime'" class="flex items-center gap-3 flex-wrap text-[24rpx]">
              <text class="text-[#1677ff] font-bold">薪资：{{ post.salary || '面议' }}</text>
              <text v-if="post.infoFee" class="text-on-surface-variant">信息费：{{ post.infoFee }}</text>
              <view v-if="post.contact" class="contact-chip" @click.stop="copyContact(post.contact)">
                <span class="material-symbols-outlined text-[28rpx]">call</span>
                <text class="ml-1">{{ post.contact }}</text>
                <text class="copy-btn">复制</text>
              </view>
            </view>

            <!-- 推广：联系方式（可复制） -->
            <view v-if="post.boardCode === 'promotion' && post.contact" class="flex items-center gap-3 flex-wrap">
              <view class="contact-chip" @click.stop="copyContact(post.contact)">
                <span class="material-symbols-outlined text-[28rpx]">call</span>
                <text class="ml-1">{{ post.contact }}</text>
                <text class="copy-btn">复制</text>
              </view>
            </view>

            <!-- 组队：头像叠放（不显示数字）+ 联系方式 -->
            <view v-if="post.boardCode === 'team'" class="flex items-center gap-3 flex-wrap">
              <AvatarStack :avatars="post.memberAvatars" :max="5" />
              <view v-if="post.contact" class="contact-chip" @click.stop="copyContact(post.contact)">
                <span class="material-symbols-outlined text-[28rpx]">call</span>
                <text class="ml-1">{{ post.contact }}</text>
                <text class="copy-btn">复制</text>
              </view>
            </view>

            <!-- 话题标签 -->
            <view class="flex flex-wrap gap-2" v-if="post.tags && post.tags.length > 0">
              <span v-for="tag in post.tags.slice(0, 3)" :key="tag" @click.stop="handleTagClick(tag)"
                    class="bg-secondary-fixed text-on-secondary-fixed-variant px-3 py-1 rounded-full font-label-sm-mobile text-[22rpx] font-bold">
                #{{ tag }}
              </span>
            </view>

            <!-- 底部交互栏 -->
            <view class="flex items-center gap-5 pt-3 text-on-surface-variant">
              <view class="flex items-center gap-1.5 bouncy-tap text-label-md">
                <span class="material-symbols-outlined text-[40rpx]">visibility</span>
                <text>{{ post.viewCount || 0 }}</text>
              </view>
              <view class="flex items-center gap-1.5 bouncy-tap text-label-md" :class="[post.isLiked ? 'text-primary' : 'text-on-surface-variant']" @click.stop="toggleLike(post)">
                <span class="material-symbols-outlined text-[40rpx]" :style="post.isLiked ? 'font-variation-settings: \'FILL\' 1' : ''">favorite</span>
                <text>{{ post.likeCount || 0 }}</text>
              </view>
              <view class="flex items-center gap-1.5 bouncy-tap text-label-md" @click.stop="goToDetail(post.id)">
                <span class="material-symbols-outlined text-[40rpx]">chat_bubble</span>
                <text>{{ post.commentCount || 0 }}</text>
              </view>
              <view class="flex items-center gap-1.5 ml-auto bouncy-tap text-label-md" @click.stop="openSharePopup(post)">
                <span class="material-symbols-outlined text-[40rpx]">share</span>
              </view>
            </view>

          </view>
        </view>

        <!-- 加载状态 -->
        <view class="text-center py-6 text-outline-variant text-[24rpx] font-medium" v-if="loading">
          <text class="material-symbols-outlined animate-spin text-[32rpx] mr-2">sync</text>正在载入动态...
        </view>
        <view class="text-center py-20 bg-white rounded-[40rpx] border-2 border-dashed border-outline-variant/40 kawaii-shadow font-medium" v-else-if="postList.length === 0">
          <text class="text-[80rpx] block mb-2">🍃</text>大厅里空空如也~
        </view>
        <view class="text-center py-6 text-outline-variant text-[24rpx] font-bold" v-else-if="!hasMore">
          - 已经滑到校园大厅的尽头啦 -
        </view>

      </view>
    </scroll-view>

    <!-- 发布 FAB -->
    <view class="fixed bottom-24 right-6 w-16 h-16 hot-banner-gradient text-white rounded-full flex items-center justify-center shadow-lg border-4 border-white z-40 bouncy-tap p-0" @click="handlePublish">
      <span class="material-symbols-outlined text-[56rpx] font-bold">add</span>
      <view class="absolute -top-1 -right-1 text-yellow-300">
        <span class="material-symbols-outlined text-[24rpx] icon-filled">colors_spark</span>
      </view>
    </view>

    <!-- 举报面板 -->
    <view class="fixed inset-0 bg-black/40 z-[9998] backdrop-blur-sm transition-opacity" v-if="showReport" @click="closeReportPopup"></view>
    <view class="fixed bottom-0 left-0 w-full bg-surface rounded-t-[40px] z-[9999] transition-transform duration-300 ease-out px-margin-page pb-[calc(32rpx+env(safe-area-inset-bottom))] pt-8"
         :class="[showReport ? 'translate-y-0' : 'translate-y-full']">
      <view class="w-12 h-1.5 bg-outline-variant/30 rounded-full mx-auto mb-8"></view>
      <view class="w-full mt-2 py-4 bg-error-container rounded-full font-headline-md-mobile text-[28rpx] text-on-error font-bold border-none bouncy-tap flex items-center justify-center gap-2" @click="handleReport">
        <span class="material-symbols-outlined text-[32rpx]">report</span>
        <span>举报该帖</span>
      </view>
      <view class="w-full mt-3 py-4 bg-surface-container rounded-full font-headline-md-mobile text-[28rpx] text-on-surface-variant font-bold border-none bouncy-tap text-center" @click="closeReportPopup">取消</view>
    </view>

    <!-- 分享面板 -->
    <view class="fixed inset-0 bg-black/40 z-[9998] backdrop-blur-sm transition-opacity" v-if="showShare" @click="closeSharePopup"></view>
    <view class="fixed bottom-0 left-0 w-full bg-surface rounded-t-[40px] z-[9999] transition-transform duration-300 ease-out px-margin-page pb-[calc(32rpx+env(safe-area-inset-bottom))] pt-8"
         :class="[showShare ? 'translate-y-0' : 'translate-y-full']">
      <view class="w-12 h-1.5 bg-outline-variant/30 rounded-full mx-auto mb-8"></view>
      <view class="font-headline-lg-mobile text-[32rpx] text-center mb-8 font-extrabold block">分享瞬间 ✨</view>
      <view class="grid grid-cols-3 gap-6 text-center">
        <view class="flex flex-col items-center gap-2 bouncy-tap bg-transparent border-none p-0" @click="handleNav('分享给微信好友')">
          <view class="w-16 h-16 bg-[#07C160] rounded-3xl flex items-center justify-center text-white shadow-md">
            <span class="material-symbols-outlined text-[48rpx]">chat</span>
          </view>
          <span class="font-label-md-mobile text-[24rpx] font-bold text-on-surface-variant">微信好友</span>
        </view>
        <view class="flex flex-col items-center gap-2 bouncy-tap bg-transparent border-none p-0" @click="handleNav('生成朋友圈海报')">
          <view class="w-16 h-16 bg-[#ff8fa3] rounded-3xl flex items-center justify-center text-white shadow-md">
            <span class="material-symbols-outlined text-[48rpx]">image</span>
          </view>
          <span class="font-label-md-mobile text-[24rpx] font-bold text-on-surface-variant">生成海报</span>
        </view>
        <view class="flex flex-col items-center gap-2 bouncy-tap bg-transparent border-none p-0" @click="handleNav('分享到朋友圈')">
          <view class="w-16 h-16 bg-[#6d4ea2] rounded-3xl flex items-center justify-center text-white shadow-md">
            <span class="material-symbols-outlined text-[48rpx]">camera</span>
          </view>
          <span class="font-label-md-mobile text-[24rpx] font-bold text-on-surface-variant">朋友圈</span>
        </view>
      </view>
      <view class="w-full mt-10 py-4 bg-surface-container rounded-full font-headline-md-mobile text-[28rpx] text-on-surface-variant font-bold border-none bouncy-tap text-center" @click="closeSharePopup">取消</view>
    </view>

    <!-- 话题分类 Popover (Stitch 设计还原) -->
    <view class="fixed inset-0 bg-black/20 backdrop-blur-sm z-[80] transition-opacity duration-300"
         :class="[showTopicPopover ? 'opacity-100' : 'opacity-0 pointer-events-none']"
         @click="closeTopicPopover"></view>
    <view class="fixed left-[32rpx] right-[32rpx] top-[220px] bg-surface-container-low rounded-3xl p-6 z-[90] sticker-border kawaii-shadow border-2 border-dashed border-outline-variant/50 transition-all duration-300 transform"
         :class="[showTopicPopover ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none']">
      <view class="flex items-center justify-between mb-6">
        <view class="font-headline-md-mobile text-[28rpx] text-on-surface font-bold">全部分类</view>
        <view class="text-on-surface-variant bouncy-tap bg-transparent border-none p-0" @click="closeTopicPopover">
          <span class="material-symbols-outlined text-[36rpx]">close</span>
        </view>
      </view>
      <view class="grid grid-cols-3 gap-3">
        <view v-for="child in (categoryGroups[activeGroupIndex]?.children || [])" :key="'popover-'+child.id"
                @click="selectCategoryFromPopover(child)"
                class="bg-surface-container-highest py-3 rounded-2xl text-label-md text-on-surface-variant border-none bouncy-tap flex items-center justify-center">
          # {{ child.name }}<text class="ml-0.5 opacity-50 text-[18rpx]">({{ child.postCount || 0 }})</text>
        </view>
      </view>
    </view>

    <!-- 背景点缀氛围（防遮挡） -->
    <view class="fixed inset-0 pointer-events-none z-[-1] overflow-hidden opacity-[0.06]">
      <span class="absolute material-symbols-outlined text-[52rpx]" style="left: 52vw; top: 3vh;">star</span>
      <span class="absolute material-symbols-outlined text-[48rpx]" style="left: 11vw; top: 74vh;">favorite</span>
      <span class="absolute material-symbols-outlined text-[60rpx]" style="left: 75vw; top: 24vh;">star</span>
      <span class="absolute material-symbols-outlined text-[56rpx]" style="left: 42vw; top: 37vh;">favorite</span>
      <span class="absolute material-symbols-outlined text-[44rpx]" style="left: 46vw; top: 12vh;">star</span>
    </view>

    <CustomTabBar :current="0" />
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { onLoad, onReachBottom, onShow } from '@dcloudio/uni-app'
import { get, post } from '@/utils/request.js'
import { postApi, categoryApi } from '@/api/index.js'
import { useUserStore } from '@/stores/user'
import { useInteractionStore } from '@/stores/interaction'
import { formatTimeAgo } from '@/composables/useTimeAgo'
import { useAuthGuard } from '@/composables/useAuthGuard'

const systemInfo = uni.getSystemInfoSync()
const statusBarHeight = ref(systemInfo.statusBarHeight || 20)

const defaultAvatar = '/static/images/anonymous-avatar.png'
const showShare = ref(false)
const showReport = ref(false)
const showDropdownPanel = ref(false)
const showTopicPopover = ref(false)
const currentSharePost = ref(null)

const categoryGroups = ref([])
const activeGroupIndex = ref(null)
const currentCategoryId = ref(null)
const currentCategoryName = ref('推荐')
const currentTagName = ref('')

const postList = ref([])
const hotPosts = ref([])
const loading = ref(false)
const hasMore = ref(true)
const currentPage = ref(1)
const pageSize = ref(10)
const viewMode = ref('recommend')

// 虚拟滚动：限制最大渲染节点数，防止长列表 DOM 累积导致卡顿
const MAX_RENDER_POSTS = 80
const renderStart = ref(0)
const displayPosts = computed(() => {
  return postList.value.slice(renderStart.value, renderStart.value + MAX_RENDER_POSTS)
})

const onScroll = (e) => {
  const scrollTop = e.detail.scrollTop
  // 按平均每个帖子 320rpx（约 160px）估算当前起始索引
  const estimatedPxPerItem = 160
  const newStart = Math.max(0, Math.floor(scrollTop / estimatedPxPerItem) - 5)
  // 只有当窗口变化足够大时才更新，减少重渲染
  if (Math.abs(newStart - renderStart.value) >= 5) {
    renderStart.value = newStart
  }
}

// 图片加载状态跟踪（用于 fade-in 动画）
const imageLoaded = ref({})
const onImageLoad = (imgUrl) => {
  imageLoaded.value[imgUrl] = true
}

const userStore = useUserStore()
const interaction = useInteractionStore()
const { requireLogin } = useAuthGuard()
const currentUserId = computed(() => userStore.userId)

const fetchCategories = async () => {
  try {
    const groupRes = await get(categoryApi.getGroups().url)
    if (groupRes.data && groupRes.data.length > 0) {
      categoryGroups.value = groupRes.data
    }
  } catch (e) {
    console.warn('获取分类失败:', e)
  }
}

const fetchHotPosts = async () => {
  try {
    const response = await get(postApi.getHotPosts(10, 0).url, { limit: 10, scope: 0 })
    if (response.data && response.data.length > 0) {
      hotPosts.value = response.data.map(item => ({
        id: item.id,
        category: item.category || '推荐',
        content: item.content,
        viewCount: item.viewCount || 0
      }))
    }
  } catch (error) {
    console.error('获取热门帖子失败:', error)
  }
}

const fetchPostList = async (refresh = false) => {
  if (loading.value && !refresh) return
  loading.value = true
  if (refresh) {
    currentPage.value = 1
    hasMore.value = true
  }

  try {
    const paramsBase = { page: currentPage.value, size: pageSize.value }
    let response
    if (viewMode.value === 'following') {
      response = await get(postApi.getFollowingPosts(paramsBase).url, paramsBase)
    } else {
      const listParams = {
        ...paramsBase,
        category: currentCategoryName.value === '推荐' ? '' : currentCategoryName.value,
        tag: currentTagName.value || '',
        scope: 0
      }
      response = await get(postApi.getPostList(listParams).url, listParams)
    }

    const data = response.data || {}
    const records = data.records || []

    const formattedData = records.map(item => {
      const cachedLikeState = interaction.getPostLikeState(item.id)
      return {
        id: item.id,
        userId: item.userId,
        author: item.author || '匿名用户',
        gender: item.gender,
        avatar: item.avatar || defaultAvatar,
        createTime: new Date(item.createTime).getTime(),
        content: item.content,
        images: item.images || [],
        tags: item.tags || [],
        viewCount: item.viewCount || 0,
        likeCount: item.likeCount || 0,
        commentCount: item.commentCount || 0,
        isLiked: (cachedLikeState && cachedLikeState.isLiked !== null) ? cachedLikeState.isLiked : (item.isLiked || false),
        isAnonymous: item.isAnonymous || false,
        // 板块差异化字段
        boardCode: item.boardCode || '',
        price: item.price,
        salary: item.salary,
        infoFee: item.infoFee,
        contact: item.contact,
        bannerImage: item.bannerImage || '',
        isTop: item.isTop || 0,
        isSold: item.isSold || 0,
        memberAvatars: item.memberAvatars || []
      }
    })

    if (refresh) postList.value = formattedData
    else postList.value = [...postList.value, ...formattedData]
    hasMore.value = data.current < data.pages
    if (hasMore.value) currentPage.value++
  } catch (error) {
    console.error('获取帖子失败:', error)
  } finally {
    loading.value = false
  }
}

const formatTime = formatTimeAgo

const selectGroup = (gIdx) => {
  const group = categoryGroups.value[gIdx]
  if (activeGroupIndex.value === gIdx) {
    activeGroupIndex.value = null
    currentCategoryId.value = null
    currentCategoryName.value = '推荐'
    currentTagName.value = ''
  } else {
    activeGroupIndex.value = gIdx
    showDropdownPanel.value = false
    currentCategoryId.value = null
    currentTagName.value = ''
    // 点击"推荐"显示全部；其他父类按 category 字段过滤
    currentCategoryName.value = group && group.name === '推荐' ? '推荐' : (group ? group.name : '')
  }
  fetchPostList(true)
}

// 从下拉面板选择分组：统一关闭面板，避免 inline handler 返回 false 触发 tap 警告
const selectGroupFromPanel = (gIdx) => {
  selectGroup(gIdx)
  showDropdownPanel.value = false
}

const selectCategory = (child) => {
  currentCategoryId.value = child.id
  currentTagName.value = child.name
  // 保持父级分类不变，仅通过 tag 参数进一步细化
  const group = categoryGroups.value[activeGroupIndex.value]
  currentCategoryName.value = group ? group.name : '推荐'
  fetchPostList(true)
}

const toggleDropdown = () => {
  showDropdownPanel.value = !showDropdownPanel.value
}

const goToDetail = (id) => {
  if (!id) return
  const postItem = postList.value.find(p => p.id === id)
  if (postItem) postItem.viewCount = (postItem.viewCount || 0) + 1
  post(postApi.incrementViewCount(id).url).catch(() => {})
  uni.navigateTo({ url: `/pages/post/detail?id=${id}` })
}

const goToUserHome = (postItem) => {
  if (!postItem) return
  if (postItem.isAnonymous) {
    return uni.showToast({ title: '洞主很神秘，主页不可见哦~', icon: 'none' })
  }
  const targetUserId = postItem.userId
  if (!targetUserId) {
    return uni.showToast({ title: '用户信息走丢了', icon: 'none' })
  }
  const currentUid = currentUserId.value
  if (!currentUid) {
    return uni.showToast({ title: '请先登录后查看用户主页', icon: 'none' })
  }

  if (Number(targetUserId) === Number(currentUid)) {
    uni.switchTab({ url: '/pages/user/profile' })
  } else {
    uni.navigateTo({ url: `/pages/user/user-home?userId=${targetUserId}` })
  }
}

const handlePublish = () => {
  if (!requireLogin()) return
  uni.setStorageSync('publishScope', 0)
  uni.navigateTo({ url: '/pages/publish/publish' })
}

const handleTagClick = (tag) => {
  for (const group of categoryGroups.value) {
    const child = group.children?.find(c => c.name === tag)
    if (child) {
      currentCategoryId.value = child.id
      currentTagName.value = tag
      currentCategoryName.value = group.name
      // 自动展开对应父级分组
      const gIdx = categoryGroups.value.findIndex(g => g.id === group.id)
      if (gIdx !== -1) activeGroupIndex.value = gIdx
      fetchPostList(true)
      return
    }
  }
  // 非预置标签（用户自定义）：不可跳转筛选，仅提示（需求 01：标签纯运营预置）
  uni.showToast({ title: '该标签为自定义标签，无法跳转，请选择预置标签', icon: 'none' })
}

// 一键复制联系方式（二手/兼职/推广/组队 通用）
const copyContact = (text) => {
  if (!text) return
  uni.setClipboardData({
    data: String(text),
    success: () => uni.showToast({ title: '联系方式已复制', icon: 'success' })
  })
}

const toggleLike = async (postItem) => {
  if (!requireLogin()) return
  try {
    const result = await interaction.togglePostLike(postItem.id, postItem.likeCount, postItem.isLiked)
    postItem.isLiked = result.isLiked
    postItem.likeCount = result.likeCount
    if (result.isLiked) uni.vibrateShort()
  } catch {
    uni.showToast({ title: '操作失败，请重试', icon: 'none' })
  }
}

const openSharePopup = (post) => {
  currentSharePost.value = post
  showShare.value = true
}

const closeSharePopup = () => {
  showShare.value = false
  currentSharePost.value = null
}

const openReportPopup = (post) => {
  currentSharePost.value = post
  showReport.value = true
}

const closeReportPopup = () => {
  showReport.value = false
  currentSharePost.value = null
}

const handleNav = (tipText) => {
  uni.showToast({ title: tipText + '开发中', icon: 'none' })
}

const handleReport = () => {
  const targetPost = currentSharePost.value
  if (!targetPost) return
  closeReportPopup()
  uni.showActionSheet({
    title: '选择举报原因',
    itemList: ['色情低俗', '广告营销', '人身攻击', '违法违规', '其他'],
    success: async (res) => {
      const reasons = ['色情低俗', '广告营销', '人身攻击', '违法违规', '其他']
      const reason = reasons[res.tapIndex]
      try {
        const apiConfig = postApi.reportPost(targetPost.id, { reason })
        await post(apiConfig.url, { reason })
        uni.showToast({ title: '举报成功，我们会尽快处理', icon: 'none' })
      } catch (error) {
        console.error('举报失败:', error)
        uni.showToast({ title: '举报提交失败，请重试', icon: 'none' })
      }
    }
  })
}

const openTopicPopover = () => {
  showTopicPopover.value = true
}

const closeTopicPopover = () => {
  showTopicPopover.value = false
}

const selectCategoryFromPopover = (child) => {
  currentCategoryId.value = child.id
  currentTagName.value = child.name
  const group = categoryGroups.value[activeGroupIndex.value]
  currentCategoryName.value = group ? group.name : '推荐'
  fetchPostList(true)
  closeTopicPopover()
}

const switchViewMode = (mode) => {
  if (viewMode.value === mode) return
  const token = uni.getStorageSync('token')
  if (!token && mode === 'following') {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => uni.navigateTo({ url: '/pages/login/login' }), 1000)
    return
  }
  viewMode.value = mode
  currentPage.value = 1
  hasMore.value = true
  currentTagName.value = ''
  fetchPostList(true)
}

onLoad(() => {
  fetchCategories()
  fetchHotPosts()
  fetchPostList(true)
})

onShow(() => {
  const hasNewPost = uni.getStorageSync('hasNewPost')
  if (hasNewPost) {
    uni.removeStorageSync('hasNewPost')
    fetchPostList(true)
  }
})

const refreshHandler = () => fetchPostList(true)

onMounted(() => {
  uni.$on('refreshPostList', refreshHandler)
})

onUnmounted(() => {
  uni.$off('refreshPostList', refreshHandler)
})

onReachBottom(() => {
  if (hasMore.value && !loading.value) {
    fetchPostList()
  }
})

const goToSearch = () => uni.navigateTo({ url: '/pages/search/search' })
const goToHotPosts = () => uni.navigateTo({ url: '/pages/hot-posts/hot-posts?scope=0' })
</script>

<style scoped>
::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  color: transparent;
}
.hide-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.bouncy-tap:active {
  transform: scale(0.96);
  transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.kawaii-shadow {
  box-shadow: 0 12rpx 40rpx rgba(255, 143, 163, 0.12);
}

.sticker-border {
  border: 4rpx dashed rgba(218, 192, 195, 0.5);
}

.hot-banner-gradient {
  background: linear-gradient(135deg, #FF8FA3 0%, #FFC46B 100%);
}

/* ===== 板块差异化（02~05） ===== */
/* 推广帖 [推广] 高亮标签（极客蓝微渐变，右上角） */
.promo-tag {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  padding: 4rpx 16rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  color: #fff;
  background: linear-gradient(135deg, #1677ff, #69b1ff);
  box-shadow: 0 2rpx 8rpx rgba(22, 119, 255, 0.25);
  z-index: 2;
}
/* 推广帖 Banner 大图 */
.promo-banner {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 16rpx;
  display: block;
}
/* 推广帖整卡视觉差异化（边框 + 顶部底色，避免欺骗感） */
.promo-card {
  border: 2rpx solid rgba(22, 119, 255, 0.3);
  background: linear-gradient(180deg, rgba(22, 119, 255, 0.05), transparent 40%);
}
/* 二手已售出置灰 */
.sold-dim {
  opacity: 0.6;
  filter: grayscale(0.4);
}
/* 联系方式胶囊（可点复制） */
.contact-chip {
  display: inline-flex;
  align-items: center;
  padding: 4rpx 14rpx;
  border-radius: 999rpx;
  background: var(--surface-container-high, #f1ecec);
  color: #6d4ea2;
  font-size: 24rpx;
}
.copy-btn {
  margin-left: 10rpx;
  padding: 0 10rpx;
  border-radius: 999rpx;
  background: #6d4ea2;
  color: #fff;
  font-size: 20rpx;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}

.icon-filled {
  font-variation-settings: 'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24 !important;
}
.icon-filled-like {
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.icon-filled-like.liked {
  font-variation-settings: 'FILL' 1, 'wght' 400 !important;
}

.animate-fade-in {
  animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8rpx); }
  to { opacity: 1; transform: translateY(0); }
}
</style>