/**
 * HTTP请求封装工具
 * 基于uni.request封装，提供统一的请求处理
 */

import { getToken, clearLoginInfo } from './auth.js'
import { config } from '@/config'

const BASE_URL = config.apiBaseUrl

// 防止多个请求同时 401 时重复跳转登录页
let isRedirectingToLogin = false

function isH5() {
  // #ifdef H5
  return true
  // #endif
  // #ifndef H5
  return false
  // #endif
}

// 请求拦截器
const requestInterceptor = (cfg) => {
  // H5 使用后端 HttpOnly Cookie，Authorization 头部由浏览器自动携带 Cookie
  // 小程序/APP 继续使用本地 Storage 中的 Token
  const token = getToken()
  if (token) {
    cfg.header = {
      ...cfg.header,
      'Authorization': `Bearer ${token}`
    }
  }

  // 标识平台，供后端判断是否设置 HttpOnly Cookie
  cfg.header = {
    ...cfg.header,
    'X-Platform': isH5() ? 'h5' : 'mp'
  }

  // H5 跨域携带 Cookie
  if (isH5()) {
    cfg.withCredentials = true
  }

  // 设置Content-Type
  if (!cfg.header['Content-Type']) {
    cfg.header['Content-Type'] = 'application/json'
  }

  return cfg
}

// 响应拦截器
const responseInterceptor = (response) => {
  const { statusCode, data } = response
  
  // 处理HTTP状态码
  if (statusCode === 200) {
    // 成功响应
    if (data.code === 200 || data.success) {
      return data
    } else {
      // 业务错误
      uni.showToast({
        title: data.message || '请求失败',
        icon: 'none'
      })
      return Promise.reject(data)
    }
  } else if (statusCode === 401) {
    // 未授权，清除登录信息并跳转登录
    console.warn('Token无效或已过期，清除登录状态')
    clearLoginInfo()

    if (!isRedirectingToLogin) {
      isRedirectingToLogin = true
      uni.showToast({
        title: '登录已过期，请重新登录',
        icon: 'none',
        duration: 2000
      })

      setTimeout(() => {
        isRedirectingToLogin = false
        uni.navigateTo({
          url: '/pages/login/login',
          fail: () => {
            uni.redirectTo({ url: '/pages/login/login' })
          }
        })
      }, 2000)
    }

    return Promise.reject(response)
  } else {
    // 其他HTTP错误
    uni.showToast({
      title: `请求错误: ${statusCode}`,
      icon: 'none'
    })
    return Promise.reject(response)
  }
}

// 统一请求方法
export const request = (options) => {
  return new Promise((resolve, reject) => {
    // 处理GET请求参数
    let url = BASE_URL + options.url
    if (options.method === 'GET' && options.params) {
      const queryString = Object.keys(options.params)
        .filter(key => options.params[key] !== '' && options.params[key] !== null && options.params[key] !== undefined)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(options.params[key])}`)
        .join('&')
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString
      }
    }
    
    // 打印请求信息用于调试
    console.log('📤 发起请求:', {
      method: options.method || 'GET',
      url: url,
      data: options.data
    })
    
    // 应用请求拦截器
    const requestConfig = requestInterceptor({
      url: url,
      method: options.method || 'GET',
      data: options.data || {},
      header: options.header || {},
      timeout: options.timeout || config.requestTimeout || 10000,
      success: (res) => {
        // 打印响应信息
        console.log('📥 收到响应:', {
          statusCode: res.statusCode,
          data: res.data
        })

        // 应用响应拦截器
        const result = responseInterceptor(res)
        if (result instanceof Promise) {
          result.then(resolve).catch(reject)
        } else {
          resolve(result)
        }
      },
      fail: (err) => {
        console.error('❌ 网络请求失败:', err)
        uni.showToast({
          title: '网络请求失败，请检查网络连接',
          icon: 'none',
          duration: 2000
        })
        reject(err)
      }
    })

    // 发送请求
    uni.request(requestConfig)
  })
}

// 导出便捷方法
export const get = (url, params = {}, config = {}) => {
  return request({ ...config, url, method: 'GET', params })
}

export const post = (url, data = {}, config = {}) => {
  return request({ ...config, url, method: 'POST', data })
}

export const put = (url, data = {}, config = {}) => {
  return request({ ...config, url, method: 'PUT', data })
}

export const del = (url, config = {}) => {
  return request({ ...config, url, method: 'DELETE' })
}