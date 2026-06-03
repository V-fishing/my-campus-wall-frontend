/**
 * AI 偏好设置相关 API
 */
export const aiPreferenceApi = {
  // 获取 AI 偏好设置
  getPreference: () => ({
    url: '/api/v1/ai-preference/get',
    method: 'GET'
  }),

  // 保存 AI 偏好设置
  savePreference: (data) => ({
    url: '/api/v1/ai-preference/save',
    method: 'POST',
    data
  }),

  // 获取系统提示词
  getSystemPrompt: () => ({
    url: '/api/v1/ai-preference/system-prompt',
    method: 'GET'
  })
}
