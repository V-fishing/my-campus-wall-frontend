<template>
  <view class="bg-[#F4F5F7] text-on-surface min-h-screen flex flex-col relative pb-[140rpx] selection:bg-primary-container">

    <!-- 顶部固定高光导航栏 -->
    <view class="fixed top-0 w-full z-50 bg-[#F4F5F7]/85 backdrop-blur-md border-b-2 border-dashed border-outline-variant/30 px-margin-page flex items-center justify-between shadow-[0_12px_40px_rgba(255,143,163,0.12)]" :style="{ paddingTop: statusBarHeight + 'px', height: (statusBarHeight + 48) + 'px' }">
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

        <!-- 校区筛选条 -->
        <view v-if="viewMode === 'recommend' && campusList.length > 1" class="flex items-center py-1 animate-fade-in">
          <scroll-view scroll-x class="flex-1 hide-scrollbar" :show-scrollbar="false">
            <view class="flex gap-2 items-center px-1">
              <view v-for="campus in campusList" :key="campus" @click="selectCampus(campus)"
                    class="text-label-sm px-3 py-1.5 rounded-full flex-shrink-0 whitespace-nowrap transition-all border flex items-center"
                    :class="currentCampus === campus ? 'text-primary bg-primary/10 border-primary/20' : 'text-on-surface-variant bg-surface-container-low border-transparent'">
                {{ campus }}
              </view>
            </view>
          </scroll-view>
        </view>

        <!-- 帖子列表 -->
        <!-- 核心时光贴纸动态瀑布流卡片集群 -->
        <view class="space-y-4">
          <article
              class="bg-surface-container-lowest rounded-3xl p-4 sticker-border kawaii-shadow space-y-3 relative overflow-hidden transition-all duration-300"
              :class="{ 'opacity-60 grayscale-[20%]': post.isSold === 1 }"
              v-for="post in displayPosts" :key="post.id">

            <!-- 置顶标识（左上角） -->
            <view v-if="post.isTop === 1" class="absolute top-0 left-0 bg-gradient-to-br from-[#FFC46B] to-[#FF8FA3] text-white px-3 py-1 rounded-br-[24rpx] flex items-center gap-1 shadow-sm z-10">
              <span class="material-symbols-outlined text-[24rpx] icon-filled">push_pin</span>
              <text class="text-[20rpx] font-bold">置顶</text>
            </view>

            <!-- 卡片头部：作者核心资料与更多操作 -->
            <view class="flex items-center justify-between">
              <view class="flex items-center gap-3" @click="goToUserHome(post)">
                <!-- 推广帖特殊商家头像 -->
                <view v-if="post.boardCode === 'promotion'" class="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center shrink-0 border-2 border-white shadow-sm">
                  <span class="material-symbols-outlined text-yellow-600">store</span>
                </view>
                <!-- 普通头像区 -->
                <view v-else class="relative shrink-0">
                  <image
                    :src="post.isAnonymous ? defaultAvatar : (post.avatar || defaultAvatar)"
                    mode="aspectFill"
                    class="w-10 h-10 rounded-full bg-secondary-fixed border-2 border-white shadow-sm"
                  />
                  <!-- 性别角标（避开内联Style报错，采用专属原子类） -->
                  <view v-if="!post.isAnonymous && post.gender === 1" class="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-400 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                    <span class="material-symbols-outlined text-[10px] text-white font-bold icon-filled">male</span>
                  </view>
                  <view v-else-if="!post.isAnonymous && post.gender === 2" class="absolute -bottom-1 -right-1 w-4 h-4 bg-pink-400 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                    <span class="material-symbols-outlined text-[10px] text-white font-bold icon-filled">female</span>
                  </view>
                </view>

                <view class="min-w-0">
                  <p class="font-headline-md-mobile text-[28rpx] font-bold text-on-surface truncate">{{ post.isAnonymous ? '匿名小伙' : (post.author || '神秘洞主') }}</p>
                  <p class="font-label-sm-mobile text-[20rpx] text-on-surface-variant mt-0.5 truncate">
                    <template v-if="post.boardCode === 'promotion'">广告</template>
                    <template v-else>
                      {{ formatTime(post.createTime) }} • {{ post.category || '大厅' }}
                      <text v-if="post.scope === 0 && post.campusName" class="ml-1 text-primary">• {{ post.campusName }}</text>
                    </template>
                  </p>
                </view>
              </view>

              <view class="flex items-center gap-2">
                <!-- 推广标签 -->
                <span v-if="post.boardCode === 'promotion'" class="bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-3 py-1 rounded-lg text-[20rpx] font-bold shadow-sm">推广</span>
                <view class="bouncy-tap text-on-surface-variant bg-transparent border-none p-0 flex items-center justify-center" @click.stop="openReportPopup(post)">
                  <span class="material-symbols-outlined text-[40rpx]">more_horiz</span>
                </view>
              </view>
            </view>

            <!-- 核心正文 -->
            <view @click="goToDetail(post.id)">
              <p class="font-body-lg-mobile text-[28rpx] text-on-surface block mb-2 line-clamp-3 leading-relaxed font-medium">{{ post.content }}</p>
            </view>

            <!-- 媒体渲染矩阵：推广大 Banner 或 拍立得相册 -->
            <image v-if="post.boardCode === 'promotion' && post.bannerImage"
                   :src="post.bannerImage" class="w-full h-44 rounded-2xl shadow-sm object-cover"
                   @click="goToDetail(post.id)"></image>

            <view v-else-if="post.images && post.images.length > 0"
                  :class="['grid gap-2', post.images.length >= 3 ? 'grid-cols-3' : 'grid-cols-2']"
                  @click="goToDetail(post.id)">
              <view v-for="(img, i) in post.images.slice(0, post.images.length >= 3 ? 3 : 2)" :key="i"
                    class="bg-surface-container-high rounded-xl overflow-hidden relative shadow-inner"
                    :class="[post.images.length >= 3 ? 'aspect-square' : 'h-40']">
                <image class="w-full h-full object-cover opacity-0 transition-opacity duration-500"
                       :class="{ 'opacity-100': imageLoaded[img] }"
                       lazy-load mode="aspectFill" :src="img"
                       @load="() => onImageLoad(img)"></image>
                <view v-if="post.images.length >= 3 && i === 2 && post.images.length > 3"
                      class="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center text-white font-headline-md-mobile font-bold text-[32rpx]">
                  +{{ post.images.length - 3 }}
                </view>
              </view>
            </view>

            <!-- ======== 专属四大业务插件区 ======== -->
            <view class="flex flex-col gap-3 mt-2">

              <!-- 【1】兼职：薪资药丸 + 信息费 -->
              <view v-if="post.boardCode === 'parttime'" class="flex gap-2 px-1 text-label-sm-mobile">
                <span class="bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">薪资: {{ post.salary || '面议' }}</span>
                <span v-if="post.infoFee" class="bg-red-100 text-red-700 px-3 py-1 rounded-full font-medium">信息费: {{ post.infoFee }}</span>
              </view>

              <view v-if="post.contact && post.boardCode !== 'secondhand'" class="flex items-center justify-between px-3 bg-surface-container rounded-full max-w-[40%] h-[46rpx] cursor-pointer bouncy-tap border border-outline-variant/10" @click.stop="copyContact(post.contact)">
                <view class="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
    <span class="material-symbols-outlined text-[28rpx] shrink-0" :class="post.boardCode === 'team' ? 'text-[#6D4EA2]' : 'text-primary'">
      {{ post.boardCode === 'team' ? 'chat' : (post.boardCode === 'promotion' ? 'support_agent' : 'contact_page') }}
    </span>
                  <span class="text-label-sm-mobile text-on-surface-variant font-bold text-center truncate flex-1 min-w-0">{{ post.contact }}</span>
                </view>
                <span class="font-bold text-label-sm-mobile shrink-0 ml-1.5 px-1.5 py-0.5 rounded-full" :class="post.boardCode === 'team' ? 'text-[#6D4EA2]' : 'text-primary'">复制</span>
              </view>


              <!-- 【2】集市：标签居左 + 价格/联系胶囊居右 -->
              <view v-if="post.boardCode === 'secondhand'" class="flex items-center justify-between px-1 gap-3">
                <!-- 标签收纳至左侧 -->
                <view class="flex flex-wrap gap-1.5" v-if="post.tags && post.tags.length > 0">
                  <span v-for="tag in post.tags.slice(0, 2)" :key="tag" @click.stop="handleTagClick(tag)"
                        class="bg-secondary-fixed text-on-secondary-fixed-variant px-2 py-0.5 rounded-full text-[20rpx] font-bold">
                    #{{ tag }}
                  </span>
                </view>
                <!-- 价格 + 联系我胶囊 -->
                <view class="flex items-center shrink-0 bg-[#FFF8D6] rounded-full pl-3 pr-1 py-1 border border-[#FFE58F]/60">
                  <text class="text-[28rpx] font-extrabold italic text-orange-500">{{ post.price != null ? '￥' + post.price : '面议' }}</text>
                  <span v-if="post.isSold === 1" class="ml-2 text-[18rpx] bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-full font-bold">已售出</span>
                  <view v-if="post.contact" class="ml-2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-[22rpx] font-bold bouncy-tap" @click.stop="openContactAction(post)">
                    联系我
                  </view>
                </view>
              </view>

              <!-- 【3】组队：头像叠层 + 缺人提示 + 标签同行 -->
              <view v-if="post.boardCode === 'team'" class="flex items-center justify-between px-1">
                <view class="flex items-center gap-2 min-w-0">
                  <!-- 复用现有头像叠放组件 -->
                  <AvatarStack
                    :avatars="post.memberAvatars"
                    :max="4"
                    :missing-count="Math.max(0, (post.maxMembers || 0) - (post.memberCount || 0))"
                  />
                  <span class="text-[22rpx] text-on-surface-variant font-bold shrink-0">缺{{ Math.max(0, (post.maxMembers || 0) - (post.memberCount || 0)) }}人</span>
                </view>
                <view class="flex flex-wrap gap-1.5 justify-end" v-if="post.tags && post.tags.length > 0">
          <span v-for="tag in post.tags.slice(0, 2)" :key="tag" @click.stop="handleTagClick(tag)"
                class="bg-secondary-fixed text-on-secondary-fixed-variant px-2 py-0.5 rounded-full text-[20rpx] font-bold">
            #{{ tag }}
          </span>
                </view>
              </view>

              <!-- 【全局】非集市/非组队帖子的正常标签列 -->
              <view class="flex flex-wrap gap-2 px-1" v-if="post.tags && post.tags.length > 0 && post.boardCode !== 'secondhand' && post.boardCode !== 'team'">
        <span v-for="tag in post.tags.slice(0, 3)" :key="tag" @click.stop="handleTagClick(tag)"
              class="bg-secondary-fixed text-on-secondary-fixed-variant px-2.5 py-0.5 rounded-full text-[20rpx] font-bold">
          #{{ tag }}
        </span>
              </view>

              <!-- 底部互动操作栏 -->
              <view class="flex items-center justify-between pt-2 border-t border-dashed border-outline-variant/30 text-on-surface-variant px-1">
                <view class="flex items-center gap-5 text-[26rpx] font-medium">
                  <view class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[36rpx]">visibility</span><span class="pt-0.5">{{ post.viewCount || 0 }}</span></view>
                  <view class="flex items-center gap-1.5 bouncy-tap" :class="[post.isLiked ? 'text-primary' : '']" @click.stop="toggleLike(post)">
                    <span class="material-symbols-outlined text-[36rpx] icon-filled-like" :class="{'liked': post.isLiked}">favorite</span><span class="pt-0.5">{{ post.likeCount || 0 }}</span>
                  </view>
                  <view class="flex items-center gap-1.5 bouncy-tap" @click.stop="goToDetail(post.id)">
                    <span class="material-symbols-outlined text-[36rpx]">chat_bubble</span><span class="pt-0.5">{{ post.commentCount || 0 }}</span>
                  </view>
                </view>
                <view class="bg-transparent border-none p-0 m-0 flex items-center justify-center bouncy-tap text-on-surface-variant" @click.stop="openSharePopup(post)">
                  <span class="material-symbols-outlined text-[36rpx]">share</span>
                </view>
              </view>
            </view>
          </article>
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

    <!-- 联系卖家操作面板 -->
    <view class="fixed inset-0 bg-black/40 z-[9998] backdrop-blur-sm transition-opacity" v-if="showContactAction" @click="closeContactAction"></view>
    <view class="fixed bottom-0 left-0 w-full bg-surface rounded-t-[40px] z-[9999] transition-transform duration-300 ease-out px-margin-page pb-[calc(32rpx+env(safe-area-inset-bottom))] pt-8"
         :class="[showContactAction ? 'translate-y-0' : 'translate-y-full']">
      <view class="w-12 h-1.5 bg-outline-variant/30 rounded-full mx-auto mb-8"></view>
      <view class="font-headline-lg-mobile text-[32rpx] text-center mb-2 font-extrabold block">联系卖家</view>
      <view v-if="currentContactPost && currentContactPost.contact" class="text-center text-[24rpx] text-on-surface-variant mb-8 font-medium">
        联系方式：{{ currentContactPost.contact }}
      </view>
      <view v-else class="text-center text-[24rpx] text-on-surface-variant mb-8 font-medium">暂无联系方式</view>
      <view class="w-full mt-2 py-4 bg-primary-container rounded-full font-headline-md-mobile text-[28rpx] text-on-primary-container font-bold border-none bouncy-tap flex items-center justify-center gap-2" @click="toPrivateMessageFromPost">
        <span class="material-symbols-outlined text-[32rpx]">chat</span>
        <span>在小程序内私聊</span>
      </view>
      <view v-if="currentContactPost && currentContactPost.contact" class="w-full mt-3 py-4 bg-yellow-100 rounded-full font-headline-md-mobile text-[28rpx] text-yellow-800 font-bold border-none bouncy-tap flex items-center justify-center gap-2" @click="copyContactDetail">
        <span class="material-symbols-outlined text-[32rpx]">content_copy</span>
        <span>{{ isPhoneNumber(currentContactPost.contact) ? '复制手机号' : '复制微信号' }}</span>
      </view>
      <view class="w-full mt-3 py-4 bg-surface-container rounded-full font-headline-md-mobile text-[28rpx] text-on-surface-variant font-bold border-none bouncy-tap text-center" @click="closeContactAction">取消</view>
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
import { postApi, categoryApi, universityApi, rankApi, chatApi } from '@/api/index.js'
import { useUserStore } from '@/stores/user'
import { useInteractionStore } from '@/stores/interaction'
import { formatTimeAgo } from '@/composables/useTimeAgo'
import { useAuthGuard } from '@/composables/useAuthGuard'
import AvatarStack from '@/components/AvatarStack/AvatarStack.vue'
import CustomTabBar from "@/components/CustomTabBar/CustomTabBar.vue";



const systemInfo = uni.getSystemInfoSync()
const statusBarHeight = ref(systemInfo.statusBarHeight || 20)

const defaultAvatar = '/static/images/anonymous-avatar.png'
const showShare = ref(false)
const showReport = ref(false)
const showDropdownPanel = ref(false)
const showTopicPopover = ref(false)
const showContactAction = ref(false)
const currentSharePost = ref(null)
const currentContactPost = ref(null)

const categoryGroups = ref([])
const activeGroupIndex = ref(null)
const currentCategoryId = ref(null)
const currentCategoryName = ref('推荐')
const currentTagName = ref('')

const currentCampus = ref('全部')
const campusList = ref(['全部'])

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
    const apiConfig = rankApi.getHotPostRank('week', 10, 0)
    const response = await get(apiConfig.url, apiConfig.params)
    if (response.data && response.data.length > 0) {
      hotPosts.value = response.data.map(item => ({
        id: item.postId,
        category: item.post?.category || '推荐',
        content: item.post?.content || '',
        viewCount: item.viewCount || 0
      }))
    }
  } catch (error) {
    console.error('获取周热帖失败:', error)
  }
}


const fetchCampuses = async () => {
  try {
    const userInfo = uni.getStorageSync('userInfo') || {}
    const universityId = userInfo.universityId
    if (!universityId) {
      campusList.value = ['全部']
      return
    }
    const res = await get(universityApi.getCampuses(universityId).url)
    if (res.code === 200 && res.data) {
      const list = res.data.filter(c => c && c.trim() !== '')
      campusList.value = ['全部', ...list]
    }
  } catch (e) {
    console.warn('获取校区列表失败:', e)
  }
}

const selectCampus = (campus) => {
  if (currentCampus.value === campus) return
  currentCampus.value = campus
  fetchPostList(true)
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
        scope: 0,
        ...(currentCampus.value !== '全部' ? { campus: currentCampus.value } : {})
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
        isFollowing: item.isFollowing || false,
        scope: item.scope || 0,
        // 板块差异化字段
        boardCode: item.boardCode || '',
        price: item.price,
        salary: item.salary,
        infoFee: item.infoFee,
        contact: item.contact,
        bannerImage: item.bannerImage || '',
        isTop: item.isTop || 0,
        isSold: item.isSold || 0,
        memberAvatars: item.memberAvatars || [],
        memberCount: item.memberCount || 0,
        maxMembers: item.maxMembers || null,
        hasJoined: item.hasJoined || false,
        universityName: item.universityName || '',
        campusName: item.campusName || '',
        campuses: item.campuses || []
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

const isPhoneNumber = (text) => /^1[3-9]\d{9}$/.test(String(text).trim())

const openContactAction = (post) => {
  currentContactPost.value = post
  showContactAction.value = true
}

const closeContactAction = () => {
  showContactAction.value = false
  currentContactPost.value = null
}

const copyContactDetail = () => {
  const post = currentContactPost.value
  if (!post || !post.contact) return
  copyContact(post.contact)
  closeContactAction()
}

const toPrivateMessageFromPost = async () => {
  const post = currentContactPost.value
  if (!post || !post.userId) {
    uni.showToast({ title: '无法发起私聊', icon: 'none' })
    return
  }
  if (!requireLogin()) return
  closeContactAction()
  try {
    uni.showLoading({ title: '加载聊天中...' })
    const response = await get(chatApi.getSessionList().url)
    if (response.code === 200 && response.data) {
      const existingSession = response.data.find(s => s.chatPartnerId === post.userId)
      if (existingSession) {
        uni.navigateTo({
          url: `/pages/message/chat-detail?sessionId=${existingSession.id}&name=${encodeURIComponent(existingSession.chatPartnerName)}&avatar=${encodeURIComponent(existingSession.chatPartnerAvatar || '')}&partnerId=${existingSession.chatPartnerId}`
        })
      } else {
        const createResponse = await post(chatApi.sendMessage().url, {
          receiverId: post.userId,
          content: '你好~',
          messageType: 1
        })
        if (createResponse.code === 200) {
          const sessionsResponse = await get(chatApi.getSessionList().url)
          if (sessionsResponse.code === 200 && sessionsResponse.data) {
            const newSession = sessionsResponse.data.find(s => s.chatPartnerId === post.userId)
            if (newSession) {
              uni.navigateTo({
                url: `/pages/message/chat-detail?sessionId=${newSession.id}&name=${encodeURIComponent(newSession.chatPartnerName)}&avatar=${encodeURIComponent(newSession.chatPartnerAvatar || '')}&partnerId=${newSession.chatPartnerId}`
              })
            }
          }
        }
      }
    }
  } catch (error) {
    uni.showToast({ title: '操作失败，请重试', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
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
  fetchCampuses()
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