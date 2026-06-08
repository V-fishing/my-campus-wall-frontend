/**
 * 用户认证状态管理
 * 平台感知：微信小程序使用 uni.setStorageSync；H5 使用后端 HttpOnly Cookie
 */

const TOKEN_KEY = 'token'
const USER_INFO_KEY = 'userInfo'
const TOKEN_EXPIRE_KEY = 'tokenExpireTime'
const USER_ID_KEY = 'userId'

function isH5() {
  // #ifdef H5
  return true
  // #endif
  // #ifndef H5
  return false
  // #endif
}

/**
 * 解析 JWT 的 exp  claim（过期时间戳，秒级）
 * 不在 H5 中使用，因为 H5 使用 HttpOnly Cookie
 */
function parseJwtExp(token) {
  if (!token) return null
  try {
    const payloadBase64 = token.split('.')[1]
    if (!payloadBase64) return null
    const json = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'))
    const payload = JSON.parse(json)
    return payload.exp ? payload.exp * 1000 : null
  } catch (e) {
    console.warn('解析 JWT exp 失败:', e)
    return null
  }
}

/**
 * 保存登录信息
 */
export const saveLoginInfo = (loginData) => {
  if (!loginData || !loginData.token) {
    console.error('保存登录信息失败：缺少token')
    return false
  }

  try {
    const { token, ...userInfo } = loginData

    if (!isH5()) {
      // 小程序/APP：token 存本地 Storage
      uni.setStorageSync(TOKEN_KEY, token)
    }
    // H5：token 由后端通过 HttpOnly Cookie 下发，前端不存储

    uni.setStorageSync(USER_INFO_KEY, userInfo)

    if (userInfo.id) {
      uni.setStorageSync(USER_ID_KEY, userInfo.id)
    }

    // 优先读取服务端 JWT 的 exp claim，避免客户端计算与服务端不一致
    const jwtExp = parseJwtExp(token)
    const expireTime = jwtExp || (Date.now() + 7 * 24 * 60 * 60 * 1000)
    uni.setStorageSync(TOKEN_EXPIRE_KEY, expireTime)

    console.log('登录信息保存成功')
    return true
  } catch (error) {
    console.error('保存登录信息异常:', error)
    return false
  }
}

/**
 * 获取当前token（仅小程序使用；H5 由 Cookie 自动携带）
 */
export const getToken = () => {
  if (isH5()) {
    return null
  }
  try {
    return uni.getStorageSync(TOKEN_KEY) || null
  } catch (error) {
    console.error('获取token失败:', error)
    return null
  }
}

/**
 * 获取用户信息
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
 */
export const isLogin = () => {
  const userInfo = getUserInfo()

  if (!userInfo) {
    return false
  }

  if (isH5()) {
    // H5 依赖 HttpOnly Cookie，只要本地有用户信息即认为已登录
    // 后端会在接口层面校验 Cookie 有效性
    return true
  }

  const token = getToken()
  if (!token) {
    return false
  }

  const expireTime = uni.getStorageSync(TOKEN_EXPIRE_KEY)
  if (expireTime && Date.now() > expireTime) {
    console.warn('Token已过期')
    clearLoginInfo()
    return false
  }

  return true
}

/**
 * 清除登录信息
 */
export const clearLoginInfo = () => {
  try {
    if (!isH5()) {
      uni.removeStorageSync(TOKEN_KEY)
    }
    uni.removeStorageSync(USER_INFO_KEY)
    uni.removeStorageSync(TOKEN_EXPIRE_KEY)
    uni.removeStorageSync(USER_ID_KEY)
    console.log('登录信息已清除')
  } catch (error) {
    console.error('清除登录信息失败:', error)
  }
}

/**
 * 检查token是否需要刷新（剩余时间少于24小时）
 */
export const needRefreshToken = () => {
  if (isH5()) return false
  const expireTime = uni.getStorageSync(TOKEN_EXPIRE_KEY)
  if (!expireTime) {
    return true
  }
  return (expireTime - Date.now()) < 24 * 60 * 60 * 1000
}

/**
 * 获取token剩余有效时间（毫秒）
 */
export const getTokenRemainingTime = () => {
  if (isH5()) return 0
  const expireTime = uni.getStorageSync(TOKEN_EXPIRE_KEY)
  if (!expireTime) {
    return 0
  }
  const remaining = expireTime - Date.now()
  return remaining > 0 ? remaining : 0
}

/**
 * 需要登录时的处理
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
        uni.redirectTo({ url: '/pages/login/login' })
      }
    })
  }, 2000)
}

/**
 * 获取当前用户ID
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
