/**
 * 互动状态管理 (Pinia)
 * 统一点赞/收藏的乐观更新逻辑，消除各页面重复代码
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { post } from '@/utils/request'
import { postApi, commentApi } from '@/api'

interface LikeState {
  isLiked: boolean
  likeCount: number
}

export const useInteractionStore = defineStore('interaction', () => {
  const postLikes    = ref<Record<string, LikeState>>({})
  const commentLikes = ref<Record<string, LikeState>>({})
  const postCollects = ref<Record<string, { isCollected: boolean }>>({})

  const PERSIST_KEY = 'post_likes'
  const COLLECT_KEY = 'post_collects'

  function hydrate() {
    try {
      const saved = uni.getStorageSync(PERSIST_KEY)
      if (saved) postLikes.value = JSON.parse(saved)
    } catch { /* ignore */ }
  }

  function persist() {
    uni.setStorageSync(PERSIST_KEY, JSON.stringify(postLikes.value))
  }

  // --- 获取缓存的帖子点赞状态 ---
  function getPostLikeState(postId: number): LikeState | null {
    return postLikes.value[String(postId)] ?? null
  }

  // --- 点赞/取消点赞帖子（乐观更新） ---
  async function togglePostLike(postId: number, serverCount: number, serverIsLiked: boolean) {
    const key = String(postId)
    const prev = postLikes.value[key] ?? { isLiked: serverIsLiked, likeCount: serverCount }

    // 乐观更新
    postLikes.value[key] = {
      isLiked: !prev.isLiked,
      likeCount: prev.isLiked ? prev.likeCount - 1 : prev.likeCount + 1,
    }
    persist()

    try {
      const res = await post(postApi.toggleLike(postId).url)
      if (res.code === 200) {
        postLikes.value[key] = { isLiked: res.data.isLiked, likeCount: res.data.likeCount }
        persist()
        if (res.data.isLiked) uni.vibrateShort()
        return postLikes.value[key]
      }
      throw new Error(res.message || '操作失败')
    } catch {
      // 回滚
      postLikes.value[key] = prev
      persist()
      throw new Error('点赞失败')
    }
  }

  // --- 点赞/取消点赞评论 ---
  async function toggleCommentLike(commentId: number, serverCount: number) {
    const key = String(commentId)
    const prev = commentLikes.value[key] ?? { isLiked: false, likeCount: serverCount }

    commentLikes.value[key] = {
      isLiked: !prev.isLiked,
      likeCount: prev.isLiked ? prev.likeCount - 1 : prev.likeCount + 1,
    }

    try {
      const res = await post(commentApi.toggleLike(commentId).url)
      if (res.code === 200) {
        commentLikes.value[key] = { isLiked: res.data.isLiked, likeCount: res.data.likeCount }
        return commentLikes.value[key]
      }
      throw new Error(res.message || '操作失败')
    } catch {
      commentLikes.value[key] = prev
      throw new Error('点赞失败')
    }
  }

  // --- 获取缓存的收藏状态 ---
  function getPostCollectState(postId: number): { isCollected: boolean } | null {
    return postCollects.value[String(postId)] ?? null
  }

  // --- 收藏/取消收藏帖子 ---
  async function togglePostCollect(postId: number) {
    const key = String(postId)
    const prev = postCollects.value[key] ?? { isCollected: false }

    postCollects.value[key] = { isCollected: !prev.isCollected }

    try {
      const res = await post(postApi.toggleCollect(postId).url)
      if (res.code === 200) {
        postCollects.value[key] = { isCollected: res.data.isCollected }
        return postCollects.value[key]
      }
      throw new Error(res.message || '操作失败')
    } catch {
      postCollects.value[key] = prev
      throw new Error('收藏失败')
    }
  }

  hydrate()
  return { postLikes, commentLikes, postCollects, getPostLikeState, getPostCollectState, togglePostLike, togglePostCollect, toggleCommentLike, hydrate, persist }
})
