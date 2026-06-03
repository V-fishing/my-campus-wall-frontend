/**
 * 退出登录功能示例
 * 可在用户设置或个人中心页面使用
 */

import { clearLoginInfo } from '@/utils/auth.js'

/**
 * 退出登录
 */
export const logout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        // 清除登录信息
        clearLoginInfo()
        
        uni.showToast({
          title: '已退出登录',
          icon: 'success',
          duration: 1500
        })
        
        // 跳转到登录页
        setTimeout(() => {
          uni.redirectTo({
            url: '/pages/login/login'
          })
        }, 1500)
      }
    }
  })
}

export default logout
