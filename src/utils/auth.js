/**
 * 用户认证状态管理
 * 提供统一的登录状态检查和Token管理
 */

// Token存储键名
const TOKEN_KEY = 'token'
const USER_INFO_KEY = 'userInfo'
const TOKEN_EXPIRE_KEY = 'tokenExpireTime'
const USER_ID_KEY = 'userId'  // ✅ 新增：单独保存userId

/**
 * 保存登录信息
 * @param {Object} loginData - 登录返回的数据，包含token和用户信息
 */
export const saveLoginInfo = (loginData) => {
  if (!loginData || !loginData.token) {
    console.error('保存登录信息失败：缺少token')
    return false
  }
  
  try {
    const { token, ...userInfo } = loginData
    
    // 保存token
    uni.setStorageSync(TOKEN_KEY, token)
    
    // 保存用户信息
    uni.setStorageSync(USER_INFO_KEY, userInfo)
    
    // ✅ 保存userId（方便快速访问）
    if (userInfo.id) {
      uni.setStorageSync(USER_ID_KEY, userInfo.id)
      console.log('userId保存成功:', userInfo.id)
    }
    
    // 计算并保存token过期时间（7天后）
    const expireTime = Date.now() + 7 * 24 * 60 * 60 * 1000
    uni.setStorageSync(TOKEN_EXPIRE_KEY, expireTime)
    
    console.log('登录信息保存成功')
    return true
  } catch (error) {
    console.error('保存登录信息异常:', error)
    return false
  }
}

/**
 * 获取当前token
 * @returns {String|null} token或null
 */
export const getToken = () => {
  try {
    return uni.getStorageSync(TOKEN_KEY) || null
  } catch (error) {
    console.error('获取token失败:', error)
    return null
  }
}

/**
 * 获取用户信息
 * @returns {Object|null} 用户信息或null
 */
export const getUserInfo = () => {
  try {
    return uni.getStorageSync(USER_INFO_KEY) || null
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return null
  }
}

/**
 * 检查是否已登录
 * @returns {Boolean} 是否已登录
 */
export const isLogin = () => {
  const token = getToken()
  const userInfo = getUserInfo()
  
  // 检查token和用户信息是否存在
  if (!token || !userInfo) {
    return false
  }
  
  // 检查token是否过期
  const expireTime = uni.getStorageSync(TOKEN_EXPIRE_KEY)
  if (expireTime && Date.now() > expireTime) {
    console.warn('Token已过期')
    clearLoginInfo()
    return false
  }
  
  return true
}

/**
 * 清除登录信息（退出登录）
 */
export const clearLoginInfo = () => {
  try {
    uni.removeStorageSync(TOKEN_KEY)
    uni.removeStorageSync(USER_INFO_KEY)
    uni.removeStorageSync(TOKEN_EXPIRE_KEY)
    uni.removeStorageSync(USER_ID_KEY)  // ✅ 清除userId
    console.log('登录信息已清除')
  } catch (error) {
    console.error('清除登录信息失败:', error)
  }
}

/**
 * 检查token是否需要刷新（剩余时间少于24小时）
 * @returns {Boolean} 是否需要刷新
 */
export const needRefreshToken = () => {
  const expireTime = uni.getStorageSync(TOKEN_EXPIRE_KEY)
  if (!expireTime) {
    return true
  }
  
  const remainingTime = expireTime - Date.now()
  const oneDay = 24 * 60 * 60 * 1000
  
  return remainingTime < oneDay
}

/**
 * 获取token剩余有效时间（毫秒）
 * @returns {Number} 剩余时间
 */
export const getTokenRemainingTime = () => {
  const expireTime = uni.getStorageSync(TOKEN_EXPIRE_KEY)
  if (!expireTime) {
    return 0
  }
  
  const remaining = expireTime - Date.now()
  return remaining > 0 ? remaining : 0
}

/**
 * 需要登录时的处理（显示提示并跳转登录页）
 * @param {String} message - 提示信息
 */
export const requireLogin = (message = '请先登录') => {
  uni.showToast({
    title: message,
    icon: 'none',
    duration: 2000
  })
  
  setTimeout(() => {
    uni.navigateTo({
      url: '/pages/login/login',
      fail: () => {
        // 如果navigateTo失败，尝试redirectTo
        uni.redirectTo({
          url: '/pages/login/login'
        })
      }
    })
  }, 2000)
}

/**
 * 获取当前用户ID
 * @returns {Number|null} 用户ID或null
 */
export const getCurrentUserId = () => {
  const userInfo = getUserInfo()
  return userInfo?.id || null
}

export default {
  saveLoginInfo,
  getToken,
  getUserInfo,
  isLogin,
  clearLoginInfo,
  needRefreshToken,
  getTokenRemainingTime,
  requireLogin,
  getCurrentUserId
}
