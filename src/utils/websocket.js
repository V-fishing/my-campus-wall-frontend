/**
 * WebSocket 连接管理工具
 * 单例模式，全局唯一连接
 */

import { config } from '@/config'

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
    this.listeners = {} // 事件监听器
  }

  /**
   * 连接 WebSocket
   * @param {Number} userId 用户ID
   */
  connect(userId) {
    // 检查是否已连接
    if (this.ws) {
      console.log('WebSocket 已存在连接实例')
      return
    }

    this.userId = userId
    const wsUrl = `${config.wsBaseUrl}/ws/chat/${userId}`
    
    console.log('正在连接 WebSocket:', wsUrl)
    
    // 使用 uni-app 的 WebSocket API
    this.ws = uni.connectSocket({
      url: wsUrl,
      success: () => {
        console.log('WebSocket 连接请求已发送')
      },
      fail: (error) => {
        console.error('WebSocket 连接请求失败:', error)
        this.emit('error', error)
      }
    })

    // 监听连接打开
    uni.onSocketOpen(() => {
      console.log('WebSocket 连接成功')
      this.reconnectCount = 0
      this.startHeartbeat()
      this.emit('open')
    })

    // 监听消息接收
    uni.onSocketMessage((res) => {
      try {
        const data = JSON.parse(res.data)
        console.log('收到 WebSocket 消息:', data)
        this.emit('message', data)
      } catch (error) {
        console.error('解析 WebSocket 消息失败:', error)
      }
    })

    // 监听连接关闭
    uni.onSocketClose(() => {
      console.log('WebSocket 连接关闭')
      this.stopHeartbeat()
      this.ws = null
      this.emit('close')
      this.reconnect()
    })

    // 监听连接错误
    uni.onSocketError((error) => {
      console.error('WebSocket 连接错误:', error)
      this.emit('error', error)
      this.ws = null
    })
  }

  /**
   * 断开连接
   */
  disconnect() {
    if (this.ws) {
      uni.closeSocket()
      this.ws = null
    }
    this.stopHeartbeat()
    this.stopReconnect()
  }

  /**
   * 发送消息
   */
  send(data) {
    if (this.ws) {
      uni.sendSocketMessage({
        data: JSON.stringify(data),
        success: () => {
          // 发送成功
        },
        fail: (error) => {
          console.error('WebSocket 发送消息失败:', error)
        }
      })
    } else {
      console.warn('WebSocket 未连接，无法发送消息')
    }
  }

  /**
   * 重连机制
   */
  reconnect() {
    if (this.reconnectCount >= this.maxReconnectCount) {
      console.log('达到最大重连次数，停止重连')
      return
    }

    this.stopReconnect()
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectCount++
      console.log(`尝试第 ${this.reconnectCount} 次重连...`)
      this.connect(this.userId)
    }, this.reconnectInterval)
  }

  stopReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  /**
   * 心跳机制
   */
  startHeartbeat() {
    this.stopHeartbeat()
    this.heartbeatTimer = setInterval(() => {
      if (this.ws) {
        uni.sendSocketMessage({
          data: JSON.stringify({ type: 'ping' })
        })
      }
    }, this.heartbeatInterval)
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  /**
   * 事件监听
   */
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

  /**
   * 获取连接状态
   */
  isConnected() {
    return this.ws !== null
  }
}

// 导出单例
export default new WebSocketManager()
