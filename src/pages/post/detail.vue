<template>
  <view class="bg-background min-h-screen flex flex-col relative w-full overflow-x-hidden selection:bg-primary-container pb-[200rpx]">
    
    <view class="sticky top-0 z-50 flex items-center bg-background/85 backdrop-blur-md px-[32rpx] border-b border-outline-variant/30 transition-all duration-300"
          :style="{ paddingTop: statusBarHeight + 'px', height: (statusBarHeight + 56) + 'px' }">
      <view class="flex items-center gap-1 cursor-pointer active:opacity-70 transition-opacity" @click="goBack">
        <text class="material-symbols-outlined text-primary text-[48rpx]">arrow_back</text>
        <text class="text-primary font-bold text-headline-md leading-none">返回</text>
      </view>
      <text class="absolute left-1/2 -translate-x-1/2 text-on-surface font-bold text-headline-md">帖子详情</text>
    </view>

    <scroll-view class="flex-1" scroll-y :scroll-into-view="scrollIntoViewId" scroll-with-animation>
      
      <view class="flex items-center justify-between p-margin-page">
        <view class="flex items-center gap-3" @click="goToUserHome(post)">
          <view class="relative">
            <view class="w-[96rpx] h-[96rpx] rounded-full border-[4rpx] border-white kawaii-shadow overflow-hidden bg-surface-container">
              <image :src="post.isAnonymous ? defaultAvatar : post.avatar" mode="aspectFill" class="w-full h-full object-cover" />
            </view>
            <view class="absolute bottom-0 right-0 w-[28rpx] h-[28rpx] bg-[#4CD964] border-[4rpx] border-white rounded-full"></view>
          </view>
          
          <view class="flex flex-col">
            <view class="flex items-center gap-1">
              <text class="text-on-surface font-bold text-body-lg">{{ post.isAnonymous ? '匿名同学' : post.author }}</text>
              <text v-if="post.gender === 1" class="material-symbols-outlined text-[#4A90E2] text-[32rpx]">male</text>
              <text v-else-if="post.gender === 2" class="material-symbols-outlined text-[#FF8FA3] text-[32rpx]" style="font-variation-settings: 'FILL' 1;">female</text>
            </view>
            <text class="text-on-surface-variant text-label-sm mt-0.5">{{ post.createTime }}</text>
          </view>
        </view>

        <view class="flex items-center gap-2">
          <view v-if="!post.isAnonymous && !post.isSelf" 
                class="px-5 h-[64rpx] flex items-center justify-center rounded-full text-label-md font-bold transition-transform active:scale-105 shadow-sm"
                :class="isFollowing ? 'bg-surface-container-high text-on-surface-variant' : 'gradient-primary text-white'"
                @click="toggleFollow">
            {{ isFollowing ? '已关注' : '关注' }}
          </view>
          
          <view v-if="post.isSelf" class="text-on-surface-variant p-1 active:opacity-70 flex items-center" @click.stop="showPostMenu">
            <text class="material-symbols-outlined text-[48rpx]">more_horiz</text>
          </view>
        </view>
      </view>

      <view class="px-margin-page">
        <view class="sticker-border bg-surface-container-lowest rounded-[40rpx] p-padding-inner kawaii-shadow mb-4 relative overflow-hidden">
          <!-- 置顶标识 -->
          <view v-if="post.isTop === 1" class="dt-top-tag">
            <text class="material-symbols-outlined text-[20rpx] icon-filled mr-1">push_pin</text>置顶
          </view>

          <!-- 跨校标识 -->
          <view v-if="post.scope === 1 && post.universityName" class="flex items-center gap-1 mb-3">
            <text class="material-symbols-outlined text-primary text-[28rpx]">public</text>
            <text class="text-primary text-label-sm font-bold">{{ post.universityName }} {{ post.campusName }}</text>
          </view>

          <text class="text-on-surface text-body-lg leading-relaxed mb-4 block">{{ post.content }}</text>
          
          <view class="flex flex-wrap gap-2 mb-4" v-if="post.tags && post.tags.length > 0">
            <text v-for="tag in post.tags" :key="tag" class="px-3 py-1 rounded-full bg-secondary-container/20 text-secondary font-medium text-label-sm">
              #{{ tag }}
            </text>
          </view>

          <view v-if="post.images && post.images.length > 0" class="grid gap-2 mb-4"
                :class="post.images.length === 1 ? 'grid-cols-1' : (post.images.length === 2 || post.images.length === 4 ? 'grid-cols-2' : 'grid-cols-3')">
            <view v-for="(img, idx) in post.images" :key="idx" class="rounded-[32rpx] overflow-hidden bg-surface-container-high" :class="post.images.length === 1 ? 'max-h-[600rpx]' : 'aspect-square'">
              <image :src="img" :mode="post.images.length === 1 ? 'widthFix' : 'aspectFill'" class="w-full transition-opacity active:opacity-80" :class="post.images.length === 1 ? '' : 'h-full object-cover'" @click="previewImage(idx)"/>
            </view>
          </view>

          <!-- ===== 板块差异化展示（02~05） ===== -->
          <!-- 推广帖 Banner 大图 + [推广] 标签 -->
          <view v-if="post.boardCode === 'promotion'" class="mb-4">
            <view class="dt-promo-tag mb-2">推广</view>
            <image v-if="post.bannerImage" :src="post.bannerImage" class="w-full rounded-[24rpx]" mode="widthFix"></image>
          </view>

          <!-- 二手交易：价格 + 已售出 + 联系方式(可复制) -->
          <view v-if="post.boardCode === 'secondhand'" class="flex items-center gap-3 flex-wrap mb-4">
            <text class="text-[#FF8FA3] font-bold text-[40rpx]">{{ post.price != null ? '¥' + post.price : '面议' }}</text>
            <text v-if="post.isSold === 1" class="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-[22rpx] font-bold">已售出</text>
            <view v-if="post.contact" class="dt-contact" @click="copyContact(post.contact)">
              <text class="material-symbols-outlined text-[30rpx]">call</text>
              <text class="ml-1">{{ post.contact }}</text>
              <text class="dt-copy">复制</text>
            </view>
          </view>

          <!-- 兼职发布：薪资 + 信息费 + 联系方式 -->
          <view v-if="post.boardCode === 'parttime'" class="flex items-center gap-3 flex-wrap mb-4 text-[26rpx]">
            <text class="text-[#1677ff] font-bold">薪资：{{ post.salary || '面议' }}</text>
            <text v-if="post.infoFee" class="text-on-surface-variant">信息费：{{ post.infoFee }}</text>
            <view v-if="post.contact" class="dt-contact" @click="copyContact(post.contact)">
              <text class="material-symbols-outlined text-[30rpx]">call</text>
              <text class="ml-1">{{ post.contact }}</text>
              <text class="dt-copy">复制</text>
            </view>
          </view>

          <!-- 推广：联系方式 -->
          <view v-if="post.boardCode === 'promotion' && post.contact" class="flex items-center gap-3 flex-wrap mb-4">
            <view class="dt-contact" @click="copyContact(post.contact)">
              <text class="material-symbols-outlined text-[30rpx]">call</text>
              <text class="ml-1">{{ post.contact }}</text>
              <text class="dt-copy">复制</text>
            </view>
          </view>

          <!-- 组队：头像叠放 + X/Y 人数 + 加入组队 + 联系方式 -->
          <view v-if="post.boardCode === 'team'" class="mb-4 space-y-3">
            <view class="flex items-center justify-between gap-3">
              <view class="flex items-center gap-3">
                <AvatarStack :avatars="post.memberAvatars" :max="6" />
                <text class="text-[26rpx] text-on-surface-variant font-bold">{{ post.memberCount || 0 }}/{{ post.maxMembers || '?' }}人已加入</text>
              </view>
              <view
                class="dt-join flex items-center gap-1"
                :class="{ 'dt-joined': post.hasJoined, 'dt-full': isTeamFull }"
                :style="teamJoinLoading ? 'opacity: 0.6;' : ''"
                @click="handleTeamToggle"
              >
                <span v-if="teamJoinLoading" class="material-symbols-outlined text-[24rpx] animate-spin">progress_activity</span>
                <span v-else-if="isTeamFull">已满员</span>
                <span v-else>{{ post.hasJoined ? '已加入' : '加入组队' }}</span>
              </view>
            </view>
            <view v-if="post.contact" class="dt-contact" @click="copyContact(post.contact)">
              <text class="material-symbols-outlined text-[30rpx]">call</text>
              <text class="ml-1">{{ post.contact }}</text>
              <text class="dt-copy">复制</text>
            </view>
          </view>

          <view class="flex items-center text-on-surface-variant text-label-sm mt-2">
            <text class="material-symbols-outlined text-[28rpx] mr-1">visibility</text>
            <text>{{ post.viewCount || 0 }} 次浏览</text>
          </view>
        </view>
      </view>

      <view class="mt-6">
        <view class="px-margin-page flex items-center mb-4">
          <view class="relative">
            <text class="text-headline-md text-on-surface font-bold">全部评论 ({{ totalComments }})</text>
            <view class="absolute -bottom-1 left-0 w-full h-[12rpx] bg-tertiary-container/40 rounded-full -z-10"></view>
          </view>
        </view>

        <view class="space-y-6 px-margin-page" v-if="comments.length > 0">
          <view class="flex gap-3 transition-colors duration-500" :id="'comment-' + item.id" :class="{'bg-primary-container/10 p-2 rounded-xl': targetCommentId === item.id}" v-for="item in comments" :key="item.id">
            
            <view class="w-[72rpx] h-[72rpx] rounded-full overflow-hidden shrink-0 bg-surface-container">
              <image :src="item.avatar" class="w-full h-full object-cover" />
            </view>
            
            <view class="flex-1">
              <view class="flex justify-between items-start">
                <view>
                  <text class="text-on-surface font-bold text-label-md block">{{ item.author }}</text>
                  <text class="text-on-surface-variant text-label-sm">{{ item.time }} {{ item.location || '' }}</text>
                </view>
                <view class="flex flex-col items-center" @click.stop="toggleCommentLike(item)">
                  <text class="material-symbols-outlined transition-transform active:scale-125 text-[40rpx]" 
                        :class="item.isLiked ? 'text-primary' : 'text-outline-variant'" 
                        :style="item.isLiked ? 'font-variation-settings: \'FILL\' 1;' : ''" 
                        :id="'comment-' + item.id">
                    favorite
                  </text>
                  <text class="text-label-sm text-on-surface-variant">{{ item.likeCount || 0 }}</text>
                </view>
              </view>
              
              <text class="text-on-surface text-body-lg mt-1 block" @click.stop="handleReply(item)">{{ item.content }}</text>
              
              <view class="flex items-center gap-4 mt-2">
                <text class="text-tertiary font-bold text-label-sm active:opacity-70" @click.stop="handleReply(item)">回复</text>
                <view class="text-outline-variant active:opacity-70" @click.stop="showCommentMenu(item, $event)">
                  <text class="material-symbols-outlined text-[36rpx]">more_horiz</text>
                </view>
              </view>

              <view class="mt-3 bg-surface-container-low rounded-xl p-3 space-y-2 active:bg-surface-container transition-colors" v-if="item.replies && item.replies.length > 0" @click="showReplyDetail(item)">
                <view class="text-label-md leading-snug" v-for="reply in item.replies.slice(0, 2)" :key="reply.id">
                  <text class="font-bold text-on-surface">{{ reply.author }}</text>
                  <text class="text-on-surface-variant mx-1" v-if="reply.replyToUser">回复</text>
                  <text class="font-bold text-on-surface" v-if="reply.replyToUser">@{{ reply.replyToUser }}</text>
                  <text class="text-on-surface-variant">: {{ reply.content }}</text>
                </view>
                <text class="inline-block text-secondary font-bold text-label-sm mt-1" v-if="item.replyCount > 2">查看全部 {{ item.replyCount }} 条回复 ›</text>
              </view>

            </view>
          </view>
        </view>

        <view class="text-center py-[100rpx] text-on-surface-variant/60" v-else>
          <text class="text-[80rpx] block mb-2 opacity-50">🛋️</text>
          <text class="font-body-lg">还没有人评论，快来抢沙发吧~</text>
        </view>
      </view>
    </scroll-view>

    <view class="fixed bottom-0 left-0 right-0 z-40 flex justify-center p-4 pointer-events-none" :style="{ paddingBottom: 'calc(32rpx + env(safe-area-inset-bottom))' }">
      <view class="flex items-center gap-3 bg-white/90 backdrop-blur-xl border border-outline-variant/30 w-full px-4 py-2 rounded-full kawaii-shadow pointer-events-auto">
        <view class="flex-1 flex items-center bg-surface-container h-[80rpx] px-4 rounded-full active:opacity-70 transition-opacity" @click="focusInput">
          <text class="material-symbols-outlined text-on-surface-variant text-[36rpx] mr-2">edit</text>
          <text class="text-label-md text-on-surface-variant w-full truncate">{{ replyTarget ? '回复 @' + replyTarget.author : '说点什么吧...' }}</text>
        </view>
        
        <view class="flex items-center gap-4 px-2">
          <view class="flex flex-col items-center cursor-pointer active:scale-90 transition-transform" @click="togglePostLike">
            <text class="material-symbols-outlined text-[48rpx]" :class="post.isLiked ? 'text-primary' : 'text-outline-variant'" :style="post.isLiked ? 'font-variation-settings: \'FILL\' 1;' : ''" id="post">favorite</text>
          </view>
          <view class="flex flex-col items-center cursor-pointer active:scale-90 transition-transform" @click="togglePostCollect">
            <text class="material-symbols-outlined text-[48rpx]" :class="post.isCollected ? 'text-secondary' : 'text-outline-variant'" :style="post.isCollected ? 'font-variation-settings: \'FILL\' 1;' : ''">star</text>
          </view>
          <view class="flex flex-col items-center cursor-pointer active:scale-90 transition-transform" @click="handleShareFromMenu">
            <text class="material-symbols-outlined text-tertiary text-[48rpx]">share</text>
          </view>
        </view>
      </view>
    </view>

<!-- 评论详情弹窗 -->
    <view class="fixed inset-0 bg-black/40 z-[1000] flex items-end transition-opacity" v-if="showReplyModal" @click="closeReplyModal">
      <view class="bg-surface w-full rounded-t-[64rpx] flex flex-col max-h-[85vh] transition-transform shadow-[0_-12px_40px_rgba(0,0,0,0.08)]" @click.stop>
        
        <!-- 弹窗头部 -->
        <view class="flex justify-between items-center px-[40rpx] py-[32rpx] border-b border-outline-variant/20">
          <text class="font-headline-md text-[32rpx] font-bold text-on-surface">{{ currentComment && currentComment.id !== 0 ? '相关回复共 ' + (currentComment?.replyCount || 0) + ' 条' : '发表评论' }}</text>
          <view class="w-[64rpx] h-[64rpx] bg-surface-container flex items-center justify-center rounded-full active:scale-90 transition-transform" @click="closeReplyModal">
            <text class="material-symbols-outlined text-[40rpx] text-on-surface-variant">close</text>
          </view>
        </view>

        <!-- 弹窗滚动内容区 -->
        <scroll-view class="flex-1 px-[40rpx] py-[32rpx] overflow-y-auto" scroll-y>
          
          <!-- 原评论 -->
          <view class="flex gap-3 mb-[32rpx] pb-[32rpx] border-b border-outline-variant/20" v-if="currentComment && currentComment.id !== 0">
            <image class="w-[80rpx] h-[80rpx] rounded-full bg-surface-container shrink-0 object-cover" :src="currentComment?.avatar"></image>
            <view class="flex-1">
              <view class="flex gap-3 mb-1 items-baseline">
                <text class="font-bold text-[28rpx] text-on-surface">{{ currentComment?.author }}</text>
                <text class="text-[24rpx] text-outline-variant">{{ currentComment?.time }}</text>
              </view>
              <text class="text-[30rpx] text-on-surface leading-relaxed">{{ currentComment?.content }}</text>
            </view>
          </view>
          
          <!-- 回复列表 -->
          <view class="flex flex-col gap-6" v-if="currentComment && currentComment.replies">
            <view class="flex gap-3 border-b border-outline-variant/10 pb-6 last:border-0" v-for="reply in currentComment?.replies" :key="reply.id">
              <image class="w-[64rpx] h-[64rpx] rounded-full bg-surface-container shrink-0 object-cover" :src="reply.avatar"></image>
              <view class="flex-1">
                <view class="flex gap-3 mb-1 items-baseline">
                  <text class="font-bold text-[26rpx] text-on-surface">{{ reply.author }}</text>
                  <text class="text-[22rpx] text-outline-variant">{{ reply.time || '刚刚' }}</text>
                </view>
                <view class="text-[28rpx] leading-relaxed mb-2">
                  <text class="text-on-surface-variant" v-if="reply.replyToUser">回复 </text>
                  <text class="text-tertiary font-bold" v-if="reply.replyToUser">@{{ reply.replyToUser }}</text>
                  <text class="text-on-surface ml-1">{{ reply.content }}</text>
                </view>
                
                <!-- 回复互动区 -->
                <view class="flex items-center gap-6">
                  <view class="flex items-center gap-1 active:opacity-60 transition-opacity" @click="toggleReplyLike(reply)">
                    <text class="material-symbols-outlined text-[32rpx]" :class="reply.isLiked ? 'text-primary' : 'text-outline-variant'" :style="reply.isLiked ? 'font-variation-settings: \'FILL\' 1;' : ''" :id="'reply-' + reply.id">favorite</text>
                    <text class="text-[24rpx]" :class="reply.isLiked ? 'text-primary' : 'text-outline-variant'">{{ reply.likeCount || '赞' }}</text>
                  </view>
                  <text class="text-[24rpx] text-on-surface-variant active:opacity-60" @click.stop="handleReply(reply)">回复</text>
                  <view class="text-outline-variant active:opacity-60 ml-auto" @click.stop="showReplyMenu(reply, $event)">
                    <text class="material-symbols-outlined text-[36rpx]">more_horiz</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
        
        <!-- 弹窗底部输入框 -->
        <view class="p-[24rpx] px-[32rpx] border-t border-outline-variant/20 bg-surface" :style="{ paddingBottom: 'calc(24rpx + env(safe-area-inset-bottom))' }">
          <view class="flex gap-3 items-center">
            <input 
              class="flex-1 h-[80rpx] bg-surface-container-low border border-outline-variant/30 rounded-full px-[32rpx] text-[28rpx] text-on-surface placeholder:text-outline-variant" 
              v-model="replyContent" 
              :placeholder="replyTarget ? '回复 @' + replyTarget.author : '说点什么...'"
              :focus="showReplyModal"
              @confirm="submitReply"
            />
            <view 
              class="h-[80rpx] px-[40rpx] rounded-full flex items-center justify-center text-[28rpx] font-bold transition-all duration-300"
              :class="replyContent.trim() ? 'bg-gradient-to-br from-[#7EC8E3] to-[#5BA4F0] text-white active:scale-95 shadow-md' : 'bg-surface-container text-outline-variant'" 
              @click="submitReply"
            >发送</view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部操作菜单弹窗 (分享、复制、删除等) -->
    <view class="fixed inset-0 bg-black/40 z-[2000] flex items-end transition-opacity" v-if="showMenu" @tap="closeMenu">
      <view class="bg-surface-container-low w-full rounded-t-[64rpx] px-[32rpx] pt-[40rpx]" :style="{ paddingBottom: 'calc(32rpx + env(safe-area-inset-bottom))' }" @tap.stop @click.stop>
        
        <!-- 顶部短横线装饰 -->
        <view class="w-[80rpx] h-[8rpx] bg-outline-variant/40 rounded-full mx-auto mb-6"></view>

        <!-- 帖子操作菜单 -->
        <view class="bg-white rounded-[40rpx] overflow-hidden kawaii-shadow mb-4" v-if="showPostMenuFlag">
          <view class="flex items-center px-[40rpx] py-[32rpx] active:bg-error/10 transition-colors" @tap="handleDeletePost">
            <text class="material-symbols-outlined text-error text-[44rpx] mr-3">delete</text>
            <text class="text-error text-[32rpx] font-bold flex-1">删除帖子</text>
          </view>
        </view>
        
        <!-- 评论操作菜单 -->
        <template v-else>
          <view class="bg-white rounded-[40rpx] overflow-hidden kawaii-shadow mb-4">
            <view class="flex items-center px-[40rpx] py-[32rpx] active:bg-surface-container transition-colors" @tap="handleReplyFromMenu">
              <view class="w-[64rpx] h-[64rpx] rounded-full bg-primary-container/20 flex items-center justify-center mr-3">
                 <text class="material-symbols-outlined text-primary text-[36rpx]">chat_bubble</text>
              </view>
              <text class="text-on-surface text-[32rpx] font-bold flex-1">回复</text>
              <text class="material-symbols-outlined text-outline-variant text-[40rpx]">chevron_right</text>
            </view>
            
            <view class="h-[1px] bg-outline-variant/10 mx-[40rpx]"></view>
            
            <view class="flex items-center px-[40rpx] py-[32rpx] active:bg-surface-container transition-colors" @tap="handleShareFromMenu">
              <view class="w-[64rpx] h-[64rpx] rounded-full bg-[#86b6db]/20 flex items-center justify-center mr-3">
                <text class="material-symbols-outlined text-[#86b6db] text-[36rpx]">share</text>
              </view>
              <text class="text-on-surface text-[32rpx] font-bold flex-1">分享</text>
              <text class="material-symbols-outlined text-outline-variant text-[40rpx]">chevron_right</text>
            </view>
            
            <view class="h-[1px] bg-outline-variant/10 mx-[40rpx]"></view>
            
            <view class="flex items-center px-[40rpx] py-[32rpx] active:bg-surface-container transition-colors" @tap="handleCopyFromMenu">
              <view class="w-[64rpx] h-[64rpx] rounded-full bg-[#c5a3ff]/20 flex items-center justify-center mr-3">
                <text class="material-symbols-outlined text-[#c5a3ff] text-[36rpx]">content_copy</text>
              </view>
              <text class="text-on-surface text-[32rpx] font-bold flex-1">复制文字</text>
            </view>
          </view>
          
          <!-- 删除独立为一个模块块 -->
          <view class="bg-white rounded-[40rpx] overflow-hidden kawaii-shadow">
            <view class="flex items-center px-[40rpx] py-[32rpx] active:bg-error/10 transition-colors" @tap="handleDeleteComment">
              <view class="w-[64rpx] h-[64rpx] rounded-full bg-error/10 flex items-center justify-center mr-3">
                <text class="material-symbols-outlined text-error text-[36rpx]">delete</text>
              </view>
              <text class="text-error text-[32rpx] font-bold flex-1">删除评论</text>
            </view>
          </view>
        </template>
        
        <!-- 底部取消按钮 -->
        <view class="mt-4 pt-2 pb-2">
          <view class="w-full bg-white rounded-full py-4 flex items-center justify-center active:scale-95 transition-transform kawaii-shadow" @tap="closeMenu">
            <text class="text-[32rpx] font-bold text-on-surface-variant">取消</text>
          </view>
        </view>

      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { get, post as apiPost, del as deleteRequest } from '../../utils/request.js'
import { postApi, commentApi, followApi } from '@/api'
import { browseHistoryApi } from '@/api/browseHistory'
import { useUserStore } from '@/stores/user'
import { useInteractionStore } from '@/stores/interaction'
import { formatTimeAgo } from '@/composables/useTimeAgo'
import { useAuthGuard } from '@/composables/useAuthGuard'
import AvatarStack from '@/components/AvatarStack/AvatarStack.vue'

const userStore = useUserStore()
const interaction = useInteractionStore()
const { requireLogin } = useAuthGuard()

// 帖子详情缓存（避免短时间内重复请求）
const postCache = new Map()
const CACHE_TTL = 60_000 // 60s

function getCachedPost(id) {
  const entry = postCache.get(id)
  if (entry && Date.now() < entry.expireAt) return entry.data
  postCache.delete(id)
  return null
}

function cachePost(id, data) {
  postCache.set(id, { data, expireAt: Date.now() + CACHE_TTL })
}

const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight)
const defaultAvatar = '/static/default-avatar.png' 

// 页面参数
const postId = ref(null)
const targetCommentId = ref(null)  
const scrollIntoViewId = ref('')  
const loading = ref(false)
const teamJoinLoading = ref(false)

const post = ref({})
const isFollowing = ref(false)
const comments = ref([])

const totalComments = computed(() => {
  return comments.value.reduce((total, comment) => {
    return total + 1 + (comment.replies ? comment.replies.length : 0)
  }, 0)
})

const isTeamFull = computed(() => {
  if (post.value.boardCode !== 'team') return false
  const max = post.value.maxMembers
  const count = post.value.memberCount || 0
  return max != null && count >= max && !post.value.hasJoined
})

onLoad((options) => {
  if (options.id) {
    postId.value = parseInt(options.id)

    if (!postId.value || postId.value <= 0) {
      uni.showToast({ title: '帖子不存在或已删除', icon: 'none' })
      setTimeout(() => uni.navigateBack(), 1500)
      return
    }

    if (options.commentId) {
      targetCommentId.value = parseInt(options.commentId)
    }

    post.value.viewCount = (post.value.viewCount || 0) + 1

    fetchPostDetail()
    fetchCommentList()
    recordBrowseHistory()

    const apiConfig = postApi.incrementViewCount(postId.value)
    apiPost(apiConfig.url).catch(err => {
      console.error('❌ 增加浏览量失败:', err)
    })
  }
})

const fetchPostDetail = async () => {
  // 优先使用缓存
  const cached = getCachedPost(postId.value)
  if (cached) {
    post.value = cached
    return
  }
  loading.value = true
  try {
    const response = await get(postApi.getPostDetail(postId.value).url)
    if (response.code === 200 && response.data) {
      const data = response.data
      const cachedLikeState = interaction.getPostLikeState(postId.value)
      const currentUserId = userStore.userId

      post.value = {
        id: data.id,
        userId: data.userId,
        author: data.author || '匿名用户',
        avatar: data.avatar || defaultAvatar,
        gender: data.gender,
        isAnonymous: data.isAnonymous || false,
        isSelf: data.userId === currentUserId,
        isFollowing: data.isFollowing || false,
        scope: data.scope || 0,
        content: data.content,
        images: data.images || [],
        tags: data.tags || [],
        viewCount: data.viewCount || 0,
        likeCount: (cachedLikeState && cachedLikeState.likeCount !== null) ? cachedLikeState.likeCount : (data.likeCount || 0),
        commentCount: data.commentCount || 0,
        isLiked: (cachedLikeState && cachedLikeState.isLiked !== null) ? cachedLikeState.isLiked : (data.isLiked || false),
        isCollected: data.isCollected || false,
        createTime: formatTimeAgo(data.createTime),
        // 板块差异化字段（01~05）
        boardCode: data.boardCode || '',
        price: data.price,
        salary: data.salary,
        infoFee: data.infoFee,
        contact: data.contact,
        bannerImage: data.bannerImage || '',
        isTop: data.isTop || 0,
        isSold: data.isSold || 0,
        memberAvatars: data.memberAvatars || [],
        memberCount: data.memberCount || 0,
        maxMembers: data.maxMembers || null,
        hasJoined: data.hasJoined || false,
        universityName: data.universityName || '',
        campusName: data.campusName || ''
      }
      cachePost(postId.value, post.value)
      isFollowing.value = data.isFollowing || false
    }
  } catch (error) {
    console.error('❌ 获取帖子详情失败:', error)
    uni.showToast({ title: '加载帖子失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const toggleFollow = async () => {
  if (!checkLogin()) return
  
  const followUserId = post.value.userId
  if (!followUserId) {
    uni.showToast({ title: '无法关注', icon: 'none' })
    return
  }
  
  try {
    if (isFollowing.value) {
      await deleteRequest(followApi.unfollowUser(followUserId).url)
      isFollowing.value = false
      uni.showToast({ title: '已取消关注', icon: 'success' })
    } else {
      await apiPost(followApi.followUser(followUserId).url)
      isFollowing.value = true
      uni.vibrateShort()
      uni.showToast({ title: '关注成功', icon: 'success' })
    }
  } catch (error) {
    uni.showToast({ title: error.message || '操作失败，请重试', icon: 'none' })
  }
}

const fetchCommentList = async () => {
  if (!postId.value) return
  try {
    const response = await get(
        commentApi.getCommentList(postId.value, 1, 20).url,
        { postId: postId.value, page: 1, size: 20 }
    )

    if (response.code === 200) {
      const pageData = response.data || {}
      const records = pageData.records || pageData.list || (Array.isArray(pageData) ? pageData : [])

      comments.value = records.map(item => {
        const cachedCommentLike = getCommentLikeState(postId.value, item.id)
        
        return {
          id: item.id,
          userId: item.userId,
          userName: item.userName,
          userAvatar: item.userAvatar || defaultAvatar,
          content: item.content,
          likeCount: (cachedCommentLike && cachedCommentLike.likeCount !== null) ? cachedCommentLike.likeCount : (item.likeCount || 0),
          isLiked: (cachedCommentLike && cachedCommentLike.isLiked !== null) ? cachedCommentLike.isLiked : (item.isLiked || false),
          createTime: item.createTime,
          time: formatCommentTime(item.createTime),
          author: item.userName,
          avatar: item.userAvatar || defaultAvatar,
          location: item.location || '',
          replies: (item.replies || []).map(reply => {
            const cachedReplyLike = getCommentLikeState(postId.value, reply.id)
            return {
              id: reply.id,
              userId: reply.userId,
              author: reply.userName,
              replyToUser: reply.replyToUserName || '',
              content: reply.content,
              avatar: reply.userAvatar || defaultAvatar,
              likeCount: (cachedReplyLike && cachedReplyLike.likeCount !== null) ? cachedReplyLike.likeCount : (reply.likeCount || 0),
              isLiked: (cachedReplyLike && cachedReplyLike.isLiked !== null) ? cachedReplyLike.isLiked : (reply.isLiked || false),
              time: formatCommentTime(reply.createTime)
            }
          }),
          replyCount: (item.replies || []).length
        }
      })

      if (targetCommentId.value) {
        scrollToTargetComment()
      }
    }
  } catch (error) {
    console.error('❌ 获取评论列表异常:', error)
  }
}

const scrollToTargetComment = () => {
  if (!targetCommentId.value) return
  const targetId = `comment-${targetCommentId.value}`
  const exists = comments.value.some(c => c.id === targetCommentId.value)

  if (exists) {
    setTimeout(() => {
      scrollIntoViewId.value = targetId
      setTimeout(() => {
        targetCommentId.value = null
        scrollIntoViewId.value = ''
      }, 3000)
    }, 500)
  }
}

const formatTime = formatTimeAgo
const formatCommentTime = formatTimeAgo

const triggerLikeAnimation = (elementId) => {
  // Rely on CSS class switching for animation
}

const savePostLikeState = (postId, isLiked, likeCount) => {
  try {
    const key = `post_like_${postId}`
    uni.setStorageSync(key, { isLiked, likeCount })
  } catch (error) {}
}

const getPostLikeState = (postId) => {
  try {
    const key = `post_like_${postId}`
    const state = uni.getStorageSync(key)
    if (state === undefined || state === null) return null
    if (typeof state === 'boolean') return { isLiked: state, likeCount: null }
    if (typeof state === 'object' && state !== null) return { isLiked: Boolean(state.isLiked), likeCount: state.likeCount }
    return null
  } catch (error) { return null }
}

const saveCommentLikeState = (postId, commentId, isLiked, likeCount) => {
  try {
    const key = `comment_like_${postId}_${commentId}`
    uni.setStorageSync(key, { isLiked, likeCount })
  } catch (error) {}
}

const getCommentLikeState = (postId, commentId) => {
  try {
    const key = `comment_like_${postId}_${commentId}`
    const state = uni.getStorageSync(key)
    if (state === undefined || state === null) return null
    if (typeof state === 'boolean') return { isLiked: state, likeCount: null }
    if (typeof state === 'object' && state !== null) return { isLiked: Boolean(state.isLiked), likeCount: state.likeCount }
    return null
  } catch (error) { return null }
}

const goBack = () => uni.navigateBack()

// To User Profile
const goToUserHome = (postObj) => {
  if (!postObj) return;
  if (postObj.isAnonymous) {
    return uni.showToast({ title: '洞主很神秘，主页不可见哦~', icon: 'none' });
  }
  const targetUserId = postObj.userId;
  if (!targetUserId) {
    return uni.showToast({ title: '用户信息走丢了', icon: 'none' });
  }
  const currentUid = userStore.userId;
  if (!currentUid) {
    return uni.showToast({ title: '请先登录后查看用户主页', icon: 'none' });
  }
  const isOwnPost = Number(targetUserId) === Number(currentUid);
  if (isOwnPost) {
    uni.switchTab({ url: '/pages/user/profile' });
  } else {
    uni.navigateTo({
      url: `/pages/user/user-home?userId=${targetUserId}`,
      fail: () => { uni.showToast({ title: '页面开小差了,请重试', icon: 'none' }); }
    });
  }
}

const recordBrowseHistory = async () => {
  const userId = userStore.userId
  if (!userId || !postId.value) return
  try {
    await apiPost(browseHistoryApi.recordBrowse(postId.value).url, browseHistoryApi.recordBrowse(postId.value).data)
  } catch (error) {}
}

const previewImage = (index) => {
  uni.previewImage({ urls: post.value.images, current: index })
}

const togglePostCollect = async () => {
  if (!checkLogin()) return
  try {
    const response = await apiPost(postApi.toggleCollect(postId.value).url)
    if (response.code === 200) {
      post.value.isCollected = response.data.isCollected
      uni.vibrateShort()
    }
  } catch (error) {
    post.value.isCollected = !post.value.isCollected
    uni.showToast({ title: '操作失败，请重试', icon: 'none' })
  }
}

const togglePostLike = async () => {
  if (!checkLogin()) return

  const previousState = post.value.isLiked
  const previousCount = post.value.likeCount

  post.value.isLiked = !previousState
  post.value.likeCount = previousState ? previousCount - 1 : previousCount + 1

  if (post.value.isLiked) triggerLikeAnimation('post')

  savePostLikeState(postId.value, post.value.isLiked, post.value.likeCount)

  try {
    const response = await apiPost(postApi.toggleLike(postId.value).url)
    if (response.code === 200) {
      post.value.isLiked = response.data.isLiked
      post.value.likeCount = response.data.likeCount
      savePostLikeState(postId.value, response.data.isLiked, response.data.likeCount)
      uni.vibrateShort()
    } else {
      throw new Error(response.message || '业务状态码异常')
    }
  } catch (error) {
    post.value.isLiked = previousState
    post.value.likeCount = previousCount
    savePostLikeState(postId.value, previousState, previousCount)
    uni.showToast({ title: '网络开小差了，请重试', icon: 'none' })
  }
}

const toggleCommentLike = async (comment) => {
  if (!checkLogin()) return
  const previousState = comment.isLiked
  const previousCount = comment.likeCount

  comment.isLiked = !previousState;
  comment.likeCount = previousState ? previousCount - 1 : previousCount + 1;

  if (comment.isLiked) triggerLikeAnimation('comment-' + comment.id);

  try {
    const response = await apiPost(commentApi.toggleLike(comment.id).url)
    if (response.code === 200) {
      comment.isLiked = response.data.isLiked
      comment.likeCount = response.data.likeCount
      saveCommentLikeState(postId.value, comment.id, response.data.isLiked, response.data.likeCount)
    } else {
      throw new Error(response.message);
    }
  } catch (error) {
    comment.isLiked = previousState;
    comment.likeCount = previousCount;
  }
}

const toggleReplyLike = async (reply) => {
  if (!checkLogin()) return
  const previousState = reply.isLiked
  try {
    const response = await apiPost(commentApi.toggleLike(reply.id).url)
    if (response.code === 200) {
      reply.isLiked = response.data.isLiked
      reply.likeCount = response.data.likeCount
      uni.vibrateShort()
      if (response.data.isLiked) triggerLikeAnimation('reply-' + reply.id)
      saveCommentLikeState(postId.value, reply.id, response.data.isLiked, response.data.likeCount)
    }
  } catch (error) {
    reply.isLiked = previousState
    reply.likeCount = previousState ? reply.likeCount - 1 : reply.likeCount + 1
  }
}

const checkLogin = () => {
  const token = uni.getStorageSync('token')
  if (!token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => { uni.navigateTo({ url: '/pages/login/login' }) }, 1000)
    return false
  }
  return true
}

const replyTarget = ref(null)
const showReplyModal = ref(false)
const currentComment = ref(null)
const replyContent = ref('')

const showMenu = ref(false)
const showPostMenuFlag = ref(false)
const currentMenuComment = ref(null)

const showReplyDetail = (comment) => {
  currentComment.value = comment
  showReplyModal.value = true
  replyTarget.value = null
  replyContent.value = ''
}

const closeReplyModal = () => {
  showReplyModal.value = false
  currentComment.value = null
  replyTarget.value = null
  replyContent.value = ''
}

const submitReply = async () => {
  if (!replyContent.value.trim()) return
  if (!checkLogin()) return

  try {
    const isReplyToComment = currentComment.value && currentComment.value.id !== 0
    const commentData = {
      postId: postId.value,
      content: replyContent.value.trim(),
      parentId: isReplyToComment ? currentComment.value.id : null,
      replyToUserId: replyTarget.value?.userId || null
    }

    uni.showLoading({ title: '发送中...' })
    const response = await apiPost(commentApi.addComment(commentData).url, commentData)

    if (response.code === 200) {
      uni.hideLoading()
      uni.showToast({ title: '评论成功', icon: 'success' })
      replyContent.value = ''
      replyTarget.value = null
      
      await fetchCommentList()
      
      if (showReplyModal.value && currentComment.value) {
        const updated = comments.value.find(c => c.id === currentComment.value.id)
        if (updated) currentComment.value = { ...updated }
      }
    }
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: error.message || '评论失败', icon: 'none' })
  }
}

const handleReply = (targetComment) => {
  replyTarget.value = targetComment
  if (showReplyModal.value) return
  
  const parentComment = comments.value.find(c => 
    c.id === targetComment.id || 
    (c.replies && c.replies.some(r => r.id === targetComment.id))
  )
  if (parentComment) {
    currentComment.value = parentComment
    showReplyModal.value = true
  }
}

const focusInput = () => {
  replyTarget.value = null
  currentComment.value = null
  showReplyModal.value = true
}

const showPostMenu = () => {
  showPostMenuFlag.value = true
  showMenu.value = true
}

const showCommentMenu = (comment, event) => {
  showPostMenuFlag.value = false
  currentMenuComment.value = comment
  showMenu.value = true
}

const showReplyMenu = (reply, event) => {
  showPostMenuFlag.value = false
  currentMenuComment.value = reply
  showMenu.value = true
}

const closeMenu = () => {
  showMenu.value = false
  showPostMenuFlag.value = false
  currentMenuComment.value = null
}

const handleReplyFromMenu = () => {
  if (!currentMenuComment.value) {
    closeMenu()
    return
  }
  const targetComment = currentMenuComment.value
  closeMenu()
  handleReply(targetComment)
}

const handleShareFromMenu = () => {
  closeMenu()
  uni.showToast({ title: '分享功能开发中', icon: 'none' })
}

const handleCopyFromMenu = () => {
  if (currentMenuComment.value?.content) {
    uni.setClipboardData({
      data: currentMenuComment.value.content,
      success: () => uni.showToast({ title: '已复制', icon: 'success' })
    })
  }
  closeMenu()
}

// 一键复制联系方式（02~05 通用）
const copyContact = (text) => {
  if (!text) return
  uni.setClipboardData({
    data: String(text),
    success: () => uni.showToast({ title: '联系方式已复制', icon: 'success' })
  })
}

// 加入/退出组队（组队板块方案B）：成功后刷新成员头像与状态
const handleTeamToggle = async () => {
  if (!checkLogin()) return
  if (teamJoinLoading.value || isTeamFull.value) return

  teamJoinLoading.value = true
  try {
    if (post.value.hasJoined) {
      const res = await apiPost(postApi.leaveTeam(post.value.id).url)
      if (res.code === 200 && res.data) {
        post.value.memberAvatars = res.data.memberAvatars || []
        post.value.memberCount = res.data.memberCount ?? Math.max(0, (post.value.memberCount || 0) - 1)
        post.value.hasJoined = false
        uni.showToast({ title: '已退出组队', icon: 'success' })
      } else {
        throw new Error(res.message || '退出失败')
      }
    } else {
      const res = await apiPost(postApi.joinTeam(post.value.id).url)
      if (res.code === 200 && res.data) {
        post.value.memberAvatars = res.data.memberAvatars || post.value.memberAvatars
        post.value.memberCount = res.data.memberCount ?? post.value.memberCount
        post.value.hasJoined = true
        uni.showToast({
          title: res.data.alreadyJoined ? '你已在队伍中' : '加入成功',
          icon: 'success'
        })
      } else {
        throw new Error(res.message || '加入失败')
      }
    }
  } catch (e) {
    uni.showToast({ title: e.message || '操作失败，请重试', icon: 'none' })
  } finally {
    teamJoinLoading.value = false
  }
}

const handleDeletePost = async () => {
  if (!checkLogin()) return
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这条帖子吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '删除中...' })
          const response = await deleteRequest(postApi.deletePost(postId.value).url)
          if (response.code === 200) {
            uni.hideLoading()
            uni.showToast({ title: '删除成功', icon: 'success' })
            closeMenu()
            uni.setStorageSync('hasNewPost', true)
            setTimeout(() => uni.navigateBack(), 1500)
          }
        } catch (error) {
          uni.hideLoading()
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      } else closeMenu()
    }
  })
}

const handleDeleteComment = async () => {
  if (!currentMenuComment.value) return
  if (!checkLogin()) return
  
  const comment = currentMenuComment.value
  if (comment.userId !== userStore.userId) {
    uni.showToast({ title: '只能删除自己的评论', icon: 'none' })
    closeMenu()
    return
  }
  
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这条评论吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '删除中...' })
          const response = await deleteRequest(commentApi.deleteComment(comment.id).url)
          if (response.code === 200) {
            uni.hideLoading()
            uni.showToast({ title: '删除成功', icon: 'success' })
            closeMenu()
            await fetchCommentList()
            if (showReplyModal.value && currentComment.value) {
              const updated = comments.value.find(c => c.id === currentComment.value.id)
              if (updated) currentComment.value = updated
            }
          }
        } catch (error) {
          uni.hideLoading()
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      } else closeMenu()
    }
  })
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

/* 柔和彩色弥散阴影 */
.kawaii-shadow { box-shadow: 0 12rpx 40rpx rgba(255, 143, 163, 0.12); }
/* 贴纸边框 */
.sticker-border { border: 4rpx dashed #dac0c3; }
/* 主题色渐变 */
.gradient-primary { background: linear-gradient(135deg, #ff8fa3 0%, #c5a3ff 50%, #86b6db 100%); }

/* 评论弹窗相关样式保留 */
.reply-modal {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5); z-index: 1000;
  display: flex; align-items: flex-end;
}
.modal-content {
  background: #fff; border-radius: 40rpx 40rpx 0 0; width: 100%; max-height: 80vh;
  display: flex; flex-direction: column;
}
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 32rpx 40rpx; border-bottom: 1px solid #f5f5f5;
}
.modal-title { font-size: 32rpx; font-weight: bold; color: #333; }
.modal-close { font-size: 56rpx; color: #999; line-height: 1; }
.modal-body { flex: 1; overflow-y: auto; padding: 32rpx 40rpx; }
.original-comment { display: flex; margin-bottom: 32rpx; padding-bottom: 32rpx; border-bottom: 1px solid #f5f5f5; }
.oc-avatar { width: 80rpx; height: 80rpx; border-radius: 50%; margin-right: 24rpx; }
.oc-content { flex: 1; }
.oc-header { display: flex; gap: 24rpx; margin-bottom: 16rpx; }
.oc-name { font-size: 28rpx; font-weight: bold; color: #666; }
.oc-time { font-size: 24rpx; color: #999; }
.oc-text { font-size: 30rpx; color: #333; line-height: 1.5; }
.reply-list .reply-item-detail { display: flex; margin-bottom: 32rpx; padding-bottom: 32rpx; border-bottom: 1px solid #f5f5f5; }
.reply-list .reply-item-detail:last-child { border-bottom: none; }
.ri-avatar { width: 64rpx; height: 64rpx; border-radius: 50%; margin-right: 20rpx; }
.ri-content { flex: 1; }
.ri-header { display: flex; gap: 24rpx; margin-bottom: 12rpx; }
.ri-name { font-size: 26rpx; font-weight: bold; color: #666; }
.ri-time { font-size: 24rpx; color: #999; }
.ri-body { margin-bottom: 16rpx; font-size: 28rpx; line-height: 1.5; }
.ri-action { color: #666; }
.ri-to-user { color: #4e88ff; font-weight: bold; }
.ri-text { color: #333; }
.ri-actions { display: flex; gap: 32rpx; align-items: center; }
.ri-like { display: flex; align-items: center; gap: 8rpx; font-size: 24rpx; color: #999; }
.ri-reply-btn { font-size: 24rpx; color: #999; }
.modal-footer {
  padding: 24rpx 32rpx; padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  border-top: 1px solid #f5f5f5; background: #fff;
}
.reply-input-box { display: flex; gap: 24rpx; align-items: center; }
.reply-input { flex: 1; height: 72rpx; background: #f5f6f8; border-radius: 36rpx; padding: 0 30rpx; font-size: 28rpx; }
.send-btn { height: 72rpx; padding: 0 40rpx; border-radius: 36rpx; background: #e0e0e0; color: #999; font-size: 28rpx; border: none; line-height: 72rpx; }
.send-btn.active { background: #ffd000; color: #333; }

/* 操作菜单 */
.comment-menu-mask { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.6); z-index: 2000; display: flex; align-items: flex-end; }
.comment-menu { width: 100%; background: #f5f5f5; border-radius: 32rpx 32rpx 0 0; padding: 24rpx 32rpx calc(24rpx + env(safe-area-inset-bottom)); animation: slideUp 0.3s ease-out; }
.menu-list { background: #fff; border-radius: 24rpx; overflow: hidden; }
.menu-item { display: flex; align-items: center; padding: 32rpx 40rpx; font-size: 30rpx; position: relative; }
.menu-icon { font-size: 36rpx; margin-right: 24rpx; width: 48rpx; text-align: center; }
.menu-text { flex: 1; color: #333; }
.menu-arrow { font-size: 36rpx; color: #999; margin-left: 16rpx; }
.menu-item:active { background: #f5f5f5; }
.menu-item.delete-item .menu-text, .menu-item.delete-item .menu-icon { color: #ff4d4f; }
.menu-divider { height: 1px; background: #f0f0f0; margin: 0 40rpx; }
.menu-divider-large { height: 24rpx; }

@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }

/* 活跃绿点动画 */
@keyframes pulse-green {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}

/* ===== 板块差异化展示（02~05） ===== */
.dt-promo-tag {
  display: inline-block;
  padding: 4rpx 18rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  color: #fff;
  background: linear-gradient(135deg, #1677ff, #69b1ff);
  box-shadow: 0 2rpx 8rpx rgba(22, 119, 255, 0.25);
}
.dt-contact {
  display: inline-flex;
  align-items: center;
  padding: 6rpx 18rpx;
  border-radius: 999rpx;
  background: #f1ecec;
  color: #6d4ea2;
  font-size: 26rpx;
}
.dt-copy {
  margin-left: 12rpx;
  padding: 2rpx 14rpx;
  border-radius: 999rpx;
  background: #6d4ea2;
  color: #fff;
  font-size: 22rpx;
}
.dt-join {
  padding: 10rpx 28rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #FF8FA3, #FFC46B);
  color: #fff;
  font-size: 26rpx;
  font-weight: bold;
  flex-shrink: 0;
}
.dt-join.dt-joined {
  background: #F4F5F7;
  color: #9a9a9a;
}
.dt-join.dt-full {
  background: #F4F5F7;
  color: #9a9a9a;
}
.dt-top-tag {
  display: inline-flex;
  align-items: center;
  padding: 4rpx 14rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  color: #fff;
  background: linear-gradient(135deg, #FF8FA3, #FFC46B);
  box-shadow: 0 2rpx 8rpx rgba(255, 143, 163, 0.3);
  margin-bottom: 12rpx;
}
</style>