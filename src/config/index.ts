/**
 * 环境配置 — 统一入口
 * Vite 在构建时将 VITE_ 前缀的环境变量内联，此处聚合读取
 */
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  wsBaseUrl:  import.meta.env.VITE_WS_BASE_URL  || 'ws://localhost:8080',

  /** 上传超时（毫秒） */
  uploadTimeout: 30000,
  /** 请求超时 */
  requestTimeout: 10000,
} as const
