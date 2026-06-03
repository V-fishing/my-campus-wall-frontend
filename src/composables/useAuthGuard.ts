/**
 * 登录守卫 composable
 * 统一 requireLogin 逻辑，替代各页面中重复的判断 + showToast + 跳转
 */
import { useUserStore } from '@/stores/user'

export function useAuthGuard() {
  const user = useUserStore()

  function requireLogin(): boolean {
    if (user.isLogin) return true

    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => {
      uni.navigateTo({
        url: '/pages/login/login',
        fail: () => uni.redirectTo({ url: '/pages/login/login' }),
      })
    }, 800)
    return false
  }

  return { requireLogin, isLogin: user.isLogin }
}
