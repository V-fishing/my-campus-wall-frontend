/**
 * SSE 流式请求封装（小程序 / H5）
 * 基于 uni.request enableChunked（小程序）或 fetch ReadableStream（H5）
 */

import { getToken } from './auth.js'
import { config } from '@/config'

function isH5() {
  // #ifdef H5
  return true
  // #endif
  // #ifndef H5
  return false
  // #endif
}

function arrayBufferToString(buffer) {
  const uint8 = new Uint8Array(buffer)
  return new TextDecoder('utf-8').decode(uint8)
}

class SSEParser {
  constructor() {
    this.buffer = ''
  }

  parse(chunk) {
    this.buffer += chunk
    const frames = this.buffer.split('\n\n')
    this.buffer = frames.pop() || ''

    const events = []
    for (const frame of frames) {
      if (!frame.trim()) continue

      const lines = frame.split('\n')
      let eventType = ''
      let dataLine = ''

      for (const line of lines) {
        if (line.startsWith('event:')) {
          eventType = line.slice(6).trim()
        } else if (line.startsWith('data:')) {
          dataLine = line.slice(5).trim()
        }
      }

      if (!dataLine) continue

      try {
        events.push({ event: eventType, data: JSON.parse(dataLine) })
      } catch (e) {
        console.warn('SSE JSON 解析失败:', dataLine, e)
      }
    }
    return events
  }

  flush() {
    const events = this.parse('\n\n')
    this.buffer = ''
    return events
  }
}

function buildHeaders(extraHeaders = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    'X-Platform': isH5() ? 'h5' : 'mp',
    ...extraHeaders
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

function buildFullUrl(url) {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  return config.apiBaseUrl + url
}

/**
 * 发起 SSE 流式请求
 * @param {Object} options
 * @param {string} options.url - 请求路径或完整 URL
 * @param {string} options.method - 默认 POST
 * @param {Object} options.data - 请求体
 * @param {Object} options.header - 额外请求头
 * @param {number} options.timeout - 超时时间（毫秒）
 * @param {Function} options.onEvent - (event, data) => {} 事件回调
 * @returns {{ task: Object, promise: Promise }} task 有 abort 方法
 */
export function streamRequest(options) {
  const {
    url,
    method = 'POST',
    data,
    header = {},
    timeout = config.requestTimeout || 10000,
    onEvent
  } = options

  const fullUrl = buildFullUrl(url)
  const headers = buildHeaders(header)

  if (isH5()) {
    return streamH5(fullUrl, method, data, headers, timeout, onEvent)
  }
  return streamMP(fullUrl, method, data, headers, timeout, onEvent)
}

function streamMP(url, method, data, headers, timeout, onEvent) {
  const parser = new SSEParser()
  let requestTask = null
  let chunkReceived = false
  let noChunkTimer = null

  const clearNoChunkTimer = () => {
    if (noChunkTimer) {
      clearTimeout(noChunkTimer)
      noChunkTimer = null
    }
  }

  const promise = new Promise((resolve, reject) => {
    // 小程序模拟器 enableChunked 经常收不到 chunk，8s 内没收到任何数据块则视为流式不可用
    noChunkTimer = setTimeout(() => {
      if (!chunkReceived) {
        console.warn('[SSE MP] 8s 内未收到任何 chunk，判定为流式不可用')
        requestTask && requestTask.abort()
        reject(new Error('STREAM_NO_CHUNK'))
      }
    }, 8000)

    requestTask = uni.request({
      url,
      method,
      data,
      header: headers,
      timeout,
      enableChunked: true,
      responseType: 'arraybuffer',
      success: (res) => {
        clearNoChunkTimer()
        // 处理 buffer 残留
        parser.flush().forEach(e => {
          onEvent && onEvent(e.event, e.data)
        })

        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res)
        } else {
          reject(new Error(`HTTP ${res.statusCode}`))
        }
      },
      fail: (err) => {
        clearNoChunkTimer()
        reject(err)
      },
      onChunkReceived: (res) => {
        clearNoChunkTimer()
        chunkReceived = true
        // 真机通常为 ArrayBuffer，模拟器某些版本可能给 string
        const chunk = typeof res.data === 'string' ? res.data : arrayBufferToString(res.data)
        parser.parse(chunk).forEach(e => {
          onEvent && onEvent(e.event, e.data)
        })
      }
    })
  })

  return {
    task: {
      abort: () => {
        clearNoChunkTimer()
        requestTask && requestTask.abort()
      }
    },
    promise
  }
}

function streamH5(url, method, data, headers, timeout, onEvent) {
  const controller = new AbortController()
  const parser = new SSEParser()

  const task = {
    abort: () => controller.abort()
  }

  const fetchOptions = {
    method,
    headers,
    body: JSON.stringify(data),
    signal: controller.signal
  }

  // fetch 没有 timeout 参数，用 AbortController 兜底
  const timer = timeout > 0 ? setTimeout(() => controller.abort(), timeout) : null

  const promise = fetch(url, fetchOptions)
    .then(async (response) => {
      if (timer) clearTimeout(timer)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf-8')

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        parser.parse(chunk).forEach(e => {
          onEvent && onEvent(e.event, e.data)
        })
      }

      parser.flush().forEach(e => {
        onEvent && onEvent(e.event, e.data)
      })
    })
    .catch((err) => {
      if (timer) clearTimeout(timer)
      throw err
    })

  return { task, promise }
}
