/**
 * 浏览历史相关 API
 */
export const browseHistoryApi = {
  // 记录浏览历史
  recordBrowse: (postId) => ({
    url: '/api/v1/browse-history/record',
    method: 'POST',
    data: { postId }
  }),

  // 获取浏览历史列表
  getBrowseHistory: (page = 1, size = 20) => ({
    url: '/api/v1/browse-history/list',
    method: 'GET',
    params: { page, size }
  }),

  // 清空浏览历史
  clearBrowseHistory: () => ({
    url: '/api/v1/browse-history/clear',
    method: 'DELETE'
  })
}
