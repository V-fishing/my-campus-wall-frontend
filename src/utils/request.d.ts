/**
 * HTTP请求工具类型声明
 */

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  params?: Record<string, any>
  header?: Record<string, string>
}

interface ApiResponse<T = any> {
  code: number
  message?: string
  success?: boolean
  data: T
}

/**
 * 统一请求方法
 */
export function request(options: RequestOptions): Promise<ApiResponse>

/**
 * GET 请求
 */
export function get<T = any>(
  url: string,
  params?: Record<string, any>,
  config?: Partial<RequestOptions>
): Promise<ApiResponse<T>>

/**
 * POST 请求
 */
export function post<T = any>(
  url: string,
  data?: any,
  config?: Partial<RequestOptions>
): Promise<ApiResponse<T>>

/**
 * PUT 请求
 */
export function put<T = any>(
  url: string,
  data?: any,
  config?: Partial<RequestOptions>
): Promise<ApiResponse<T>>

/**
 * DELETE 请求
 */
export function del<T = any>(
  url: string,
  config?: Partial<RequestOptions>
): Promise<ApiResponse<T>>
