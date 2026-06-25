/**
 * WebSocket 连接管理工具
 * 单例模式，全局唯一连接
 * 支持消息队列：连接未就绪时入队，就绪后批量发送
 */

import { config } from '@/config'

function isH5() {
  // #ifdef H5
  return true
  // #endif
  // #ifndef H5
  return false
  // #endif
}

class WebSocketManager {
  constructor() {
    this.ws = null
    this.userId = null
    this.reconnectTimer = null
    this.heartbeatTimer = null
    this.reconnectCount = 0
    this.maxReconnectCount = 5
    this.reconnectInterval = 3000
    this.heartbeatInterval = 30000
    this.listeners = {}
    this.isReady = false
    this.messageQueue = [] // 待发送消息队列
  }

  /**
   * 连接 WebSocket
   */
  connect(userId) {
    if (this.ws) {
      this.disconnect()
    }

    this.userId = userId
    const token = isH5() ? '' : (uni.getStorageSync('token') || '')
    const wsUrl = `${config.wsBaseUrl}/ws/chat/${userId}?token=${encodeURIComponent(token)}`

    const connectOptions = {
      url: wsUrl,
      fail: (error) => {
        console.error('WebSocket 连接请求失败:', error)
        this.emit('error', error)
      }
    }

    // H5 跨域携带 Cookie（用于后端 HttpOnly Token 认证）
    if (isH5()) {
      connectOptions.header = { 'X-Platform': 'h5' }
    }

    this.ws = uni.connectSocket(connectOptions)

    uni.onSocketOpen(() => {
      this.isReady = true
      this.reconnectCount = 0
      this.startHeartbeat()
      this.flushMessageQueue()
      this.emit('open')
    })

    uni.onSocketMessage((res) => {
      try {
        const data = JSON.parse(res.data)
        this.emit('message', data)
      } catch (error) {
        console.error('解析 WebSocket 消息失败:', error)
      }
    })

    uni.onSocketClose(() => {
      this.isReady = false
      this.stopHeartbeat()
      this.ws = null
      this.emit('close')
      this.reconnect()
    })

    uni.onSocketError((error) => {
      console.error('WebSocket 连接错误:', error)
      this.isReady = false
      this.emit('error', error)
      this.ws = null
    })
  }

  /**
   * 断开连接
   */
  disconnect() {
    this.stopHeartbeat()
    this.stopReconnect()
    if (this.ws) {
      uni.closeSocket()
      this.ws = null
    }
    this.isReady = false
    this.messageQueue = []
    uni.offSocketOpen()
    uni.offSocketMessage()
    uni.offSocketClose()
    uni.offSocketError()
  }

  /**
   * 发送消息
   * 连接未就绪时加入队列，就绪后自动发送
   */
  send(data) {
    if (!this.ws) {
      console.warn('WebSocket 未初始化，消息已丢弃')
      return false
    }

    if (!this.isReady) {
      this.messageQueue.push(data)
      return true
    }

    return this.doSend(data)
  }

  doSend(data) {
    uni.sendSocketMessage({
      data: JSON.stringify(data),
      success: () => {},
      fail: (error) => {
        console.error('WebSocket 发送消息失败:', error)
      }
    })
    return true
  }

  /**
   * 批量发送队列中的消息
   */
  flushMessageQueue() {
    if (this.messageQueue.length === 0) return
    const queue = [...this.messageQueue]
    this.messageQueue = []
    for (const msg of queue) {
      this.doSend(msg)
    }
  }

  reconnect() {
    if (this.reconnectCount >= this.maxReconnectCount) {
      return
    }

    this.stopReconnect()

    this.reconnectTimer = setTimeout(() => {
      this.reconnectCount++
      this.connect(this.userId)
    }, this.reconnectInterval)
  }

  stopReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  startHeartbeat() {
    this.stopHeartbeat()
    this.heartbeatTimer = setInterval(() => {
      if (this.ws) {
        this.doSend({ type: 'ping' })
      }
    }, this.heartbeatInterval)
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback)
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data))
    }
  }

  isConnected() {
    return this.ws !== null
  }
}

export default new WebSocketManager()
