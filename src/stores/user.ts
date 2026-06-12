/**
 * 用户状态管理 (Pinia)
 * 统一管理登录态、用户信息，替代分散的 uni.getStorageSync 调用
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { get } from '@/utils/request'
import { userApi } from '@/api'

export const useUserStore = defineStore('user', () => {
  // --- 状态 ---
  const token    = ref<string | null>(null)
  const userId   = ref<number | null>(null)
  const nickname = ref('')
  const avatar   = ref('')
  const gender   = ref(0)
  const college  = ref('')
  const campus   = ref('')
  const universityId   = ref<number | null>(null)
  const universityName = ref('')

  // --- 计算属性 ---
  const isLogin = computed(() => !!token.value && !!userId.value)

  // --- 从 Storage 恢复 ---
  function hydrate() {
    token.value = uni.getStorageSync('token') || null
    try {
      const info = uni.getStorageSync('userInfo')
      if (info) {
        userId.value   = info.id ?? null
        nickname.value = info.nickname ?? ''
        avatar.value   = info.avatar ?? ''
        gender.value   = info.gender ?? 0
        college.value  = info.college ?? ''
        campus.value   = info.campus ?? ''
        universityId.value   = info.universityId ?? null
        universityName.value = info.universityName ?? ''
      }
    } catch { /* ignore */ }
  }

  // --- 登录 ---
  async function login(code: string) {
    const { post } = await import('@/utils/request')
    const res = await post(userApi.login(code).url, { code })
    if (res.code === 200 && res.data) {
      const d = res.data
      token.value    = d.token
      userId.value   = d.id
      nickname.value = d.nickname ?? ''
      avatar.value   = d.avatar ?? ''
      gender.value   = d.gender ?? 0
      college.value  = d.college ?? ''
      campus.value   = d.campus ?? ''
      universityId.value   = d.universityId ?? null
      universityName.value = d.universityName ?? ''

      uni.setStorageSync('token', d.token)
      uni.setStorageSync('userInfo', d)
      return true
    }
    return false
  }

  // --- 退出 ---
  function logout() {
    token.value    = null
    userId.value   = null
    nickname.value = ''
    avatar.value   = ''
    college.value  = ''
    campus.value   = ''
    universityId.value   = null
    universityName.value = ''
    uni.removeStorageSync('token')
    uni.removeStorageSync('userInfo')
  }

  // --- 拉取最新信息 ---
  async function fetchProfile() {
    try {
      const res = await get(userApi.getCurrentUserInfo().url)
      if (res.code === 200 && res.data) {
        const d = res.data
        userId.value   = d.id
        nickname.value = d.nickname ?? ''
        avatar.value   = d.avatar ?? ''
        gender.value   = d.gender ?? 0
        college.value  = d.college ?? ''
        campus.value   = d.campus ?? ''
        universityId.value   = d.universityId ?? null
        universityName.value = d.universityName ?? ''
        uni.setStorageSync('userInfo', d)
      }
    } catch (e) {
      console.error('fetchProfile failed', e)
    }
  }

  hydrate()
  return { token, userId, nickname, avatar, gender, college, campus, universityId, universityName, isLogin, login, logout, fetchProfile, hydrate }
})
