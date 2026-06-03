/**
 * 意见反馈 API
 */
export const feedbackApi = {
  // 提交反馈
  submitFeedback: (data) => ({
    url: '/api/v1/feedback/submit',
    method: 'POST',
    data
  })
}
