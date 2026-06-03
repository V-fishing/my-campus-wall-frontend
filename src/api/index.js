/**
 * API 接口定义
 * 统一管理所有后端接口路径
 */

// 帖子相关接口
export const postApi = {
  // 获取帖子列表
  getPostList: (params = {}) => ({
    url: '/api/v1/posts/list',
    method: 'GET',
    params
  }),
  
  // 获取热门帖子
  getHotPosts: (limit = 10, scope) => ({
    url: '/api/v1/posts/hot',
    method: 'GET',
    params: { limit, ...(scope !== undefined && scope !== null ? { scope } : {}) }
  }),

  // 获取排行榜（按浏览量排序）
  getLeaderboard: (limit = 20, scope) => ({
    url: '/api/v1/posts/leaderboard',
    method: 'GET',
    params: { limit, ...(scope !== undefined && scope !== null ? { scope } : {}) }
  }),
  
  // 获取帖子详情
  getPostDetail: (postId) => ({
    url: `/api/v1/posts/detail/${postId}`,
    method: 'GET'
  }),
  
  // 发布帖子
  publishPost: (data) => ({
    url: '/api/v1/posts/publish',
    method: 'POST',
    data
  }),
  
  // 点赞/取消点赞
  toggleLike: (postId) => ({
    url: `/api/v1/posts/like/${postId}`,
    method: 'POST'
  }),
  
  // 收藏/取消收藏
  toggleCollect: (postId) => ({
    url: `/api/v1/posts/collect/${postId}`,
    method: 'POST'
  }),
  
  // 删除帖子
  deletePost: (postId) => ({
    url: `/api/v1/posts/delete/${postId}`,
    method: 'DELETE'
  }),
  
  // 获取用户发布的帖子列表
  getUserPosts: (userId, params = {}) => ({
    url: `/api/v1/posts/user/${userId}`,
    method: 'GET',
    params
  }),
  
  // 获取用户收藏的帖子列表
  getUserCollectedPosts: (userId, params = {}) => ({
    url: `/api/v1/posts/user/${userId}/collected`,
    method: 'GET',
    params
  }),
  
  // 获取关注用户的帖子列表（支持 scope 筛选）
  getFollowingPosts: (params = {}) => ({
    url: '/api/v1/posts/following',
    method: 'GET',
    params
  }),
  
  // 增加帖子浏览量（乐观更新）
  incrementViewCount: (postId) => ({
    url: `/api/v1/posts/${postId}/view`,
    method: 'POST'
  }),

  // 举报帖子
  reportPost: (postId, data) => ({
    url: `/api/v1/posts/${postId}/report`,
    method: 'POST',
    data
  })
}

// 分类相关接口
export const categoryApi = {
  // 获取分类列表
  getCategories: () => ({
    url: '/api/v1/categories/list',
    method: 'GET'
  }),
  
  // 获取分组分类（首页分类面板使用）
  getGroups: () => ({
    url: '/api/v1/categories/groups',
    method: 'GET'
  }),

  // 获取话题列表（用于发布页选择器）
  getTopics: () => ({
    url: '/api/v1/categories/topics',
    method: 'GET'
  })
}

// 用户相关接口
export const userApi = {
  // 微信登录
  login: (code) => ({
    url: '/api/v1/users/login',
    method: 'POST',
    data: { code }
  }),
  
  // 获取当前用户信息
  getCurrentUserInfo: () => ({
    url: '/api/v1/users/me',
    method: 'GET'
  }),
  
  // 获取用户信息（查看他人主页）
  getUserInfo: (userId) => ({
    url: '/api/v1/users/info',
    method: 'GET',
    params: { userId }
  }),
  
  // 更新用户信息
  updateUserInfo: (data) => ({
    url: '/api/v1/users/update',
    method: 'PUT',
    data
  }),
  
  // 上传头像
  uploadAvatar: () => ({
    url: '/api/v1/users/uploadAvatar',
    method: 'POST'
  })
}

// 关注相关接口
export const followApi = {
  // 关注用户
  followUser: (followUserId) => ({
    url: `/api/v1/follow/${followUserId}`,
    method: 'POST'
  }),
  
  // 取消关注
  unfollowUser: (followUserId) => ({
    url: `/api/v1/follow/${followUserId}`,
    method: 'DELETE'
  }),
  
  // 检查是否已关注
  checkFollow: (followUserId) => ({
    url: `/api/v1/follow/check/${followUserId}`,
    method: 'GET'
  })
}

// 评论相关接口
export const commentApi = {
  // 发表评论
  addComment: (data) => ({
    url: '/api/v1/comments/add',
    method: 'POST',
    data
  }),
  
  // 获取评论列表
  getCommentList: (postId, page = 1, size = 20) => ({
    url: `/api/v1/comments/list/${postId}`,
    method: 'GET',
    params: { postId, page, size }
  }),
  
  // 点赞/取消点赞评论
  toggleLike: (commentId) => ({
    url: `/api/v1/comments/like/${commentId}`,
    method: 'POST'
  }),
  
  // 删除评论
  deleteComment: (commentId) => ({
    url: `/api/v1/comments/delete/${commentId}`,
    method: 'DELETE'
  })
}

// 发现页频道相关接口
export const discoverApi = {
  // 获取发现页频道列表
  getChannels: () => ({
    url: '/api/v1/discover/channels',
    method: 'GET'
  })
};

// 消息通知相关接口
export const messageApi = {
  // 获取未读消息统计
  getUnreadStats: () => ({
    url: '/api/v1/messages/stats',
    method: 'GET'
  }),
  
  // 获取通知列表（分页）
  getNotificationList: (params = {}) => ({
    url: '/api/v1/messages/notifications',
    method: 'GET',
    params
  }),
  
  // 标记通知为已读
  markNotificationAsRead: (notificationId) => ({
    url: `/api/v1/messages/notifications/read/${notificationId}`,
    method: 'POST'
  }),
  
  // 标记所有通知为已读
  markAllNotificationsAsRead: () => ({
    url: '/api/v1/messages/notifications/read/all',
    method: 'POST'
  })
}

// 聊天相关接口
export const chatApi = {
  // 获取聊天会话列表
  getSessionList: () => ({
    url: '/api/v1/messages/chat/sessions',
    method: 'GET'
  }),
  
  // 获取聊天消息列表（分页）
  getMessageList: (sessionId, page = 1, size = 20) => ({
    url: '/api/v1/messages/chat/messages',
    method: 'GET',
    params: { sessionId, page, size }
  }),
  
  // 发送消息
  sendMessage: (data) => ({
    url: '/api/v1/messages/chat/send',
    method: 'POST',
    data
  }),
  
  // 标记聊天消息为已读
  markChatRead: (sessionId) => ({
    url: `/api/v1/messages/chat/read/${sessionId}`,
    method: 'POST'
  }),
  
  // 撤回消息
  recallMessage: (messageId) => ({
    url: `/api/v1/messages/chat/recall/${messageId}`,
    method: 'POST'
  }),
  
  // 删除聊天会话
  deleteSession: (sessionId) => ({
    url: `/api/v1/messages/chat/session/${sessionId}`,
    method: 'DELETE'
  })
}

// Emoji 相关接口
export const emojiApi = {
  // 获取 Emoji 列表（Unicode + 自定义）
  getEmojiList: () => ({
    url: '/api/v1/emojis/list',
    method: 'GET'
  })
}

// AI 学长相关接口
export const aiApi = {
  // AI 问答
  chat: (userId, question, conversationId = '') => ({
    url: '/api/v1/ai-senior/chat',
    method: 'POST',
    data: {
      userId,
      question,
      conversationId
    }
  }),
  // 获取历史会话列表
  getHistory: (userId) => ({
    url: '/api/v1/ai-senior/history/list',
    method: 'GET',
    params: {
      userId
    }
  }),
  // 获取历史会话详情
  getHistoryDetail: (sessionId) => ({
    url: '/api/v1/ai-senior/history/detail',
    method: 'GET',
    params: {
      sessionId
    }
  })
}

// 搜索相关接口
export const searchApi = {
  // 搜索帖子
  searchPosts: (params = {}) => ({
    url: '/api/v1/search/posts',
    method: 'GET',
    params
  }),
  
  // 获取热搜榜单
  getHotSearch: (limit = 10) => ({
    url: '/api/v1/search/hot',
    method: 'GET',
    params: { limit }
  }),
  
  // 记录搜索（可选）
  recordSearch: (keyword) => ({
    url: '/api/v1/search/record',
    method: 'POST',
    params: { keyword }
  })
}

// 通知相关接口（回复与@）
export const notificationApi = {
  // 获取评论通知列表（回复与@）
  getCommentNotifications: (params = {}) => ({
    url: '/api/v1/notifications/comments',
    method: 'GET',
    params
  }),
  
  // 获取点赞通知列表（收到喜欢）
  getLikeNotifications: (params = {}) => ({
    url: '/api/v1/notifications/likes',
    method: 'GET',
    params
  }),
  
  // 标记通知为已读
  markNotificationRead: (notificationId) => ({
    url: `/api/v1/notifications/${notificationId}/read`,
    method: 'POST'
  }),
  
  // 标记所有通知为已读
  markAllRead: () => ({
    url: '/api/v1/notifications/read-all',
    method: 'POST'
  }),
  
  // 删除通知（忽略通知）
  deleteNotification: (notificationId) => ({
    url: `/api/v1/notifications/${notificationId}`,
    method: 'DELETE'
  })
}

// 文件上传相关接口
export const fileApi = {
  // 单张预上传帖子图片（发帖前）
  uploadPostTempImage: () => ({
    url: '/api/v1/files/post/temp-image',
    method: 'POST'
  }),
  
  // 批量预上传帖子图片（发帖前）
  uploadPostTempImages: () => ({
    url: '/api/v1/files/post/temp-images',
    method: 'POST'
  }),
  
  // 上传帖子图片（发布时）
  uploadPostImage: (postId) => ({
    url: `/api/v1/files/post/image/${postId}`,
    method: 'POST'
  }),
  
  // 上传帖子附件
  uploadPostAttachment: (postId) => ({
    url: `/api/v1/files/post/attachment/${postId}`,
    method: 'POST'
  }),
  
  // 删除帖子文件
  deletePostFile: (objectName) => ({
    url: `/api/v1/files/post/${objectName}`,
    method: 'DELETE'
  }),
  
  // 上传用户头像
  uploadUserAvatar: (userId) => ({
    url: `/api/v1/files/user/avatar/${userId}`,
    method: 'POST'
  }),
  
  // 上传用户背景图
  uploadUserBackground: (userId) => ({
    url: `/api/v1/files/user/background/${userId}`,
    method: 'POST'
  }),
  
  // 删除用户文件
  deleteUserFile: (objectName) => ({
    url: `/api/v1/files/user/${objectName}`,
    method: 'DELETE'
  }),
  
  // 上传聊天图片
  uploadChatImage: (sessionId, messageId) => ({
    url: `/api/v1/files/chat/image/${sessionId}/${messageId}`,
    method: 'POST'
  }),
  
  // 上传聊天文件
  uploadChatFile: (sessionId, messageId) => ({
    url: `/api/v1/files/chat/file/${sessionId}/${messageId}`,
    method: 'POST'
  }),
  
  // 上传聊天语音
  uploadChatVoice: (sessionId, messageId) => ({
    url: `/api/v1/files/chat/voice/${sessionId}/${messageId}`,
    method: 'POST'
  }),
  
  // 删除聊天文件
  deleteChatFile: (objectName) => ({
    url: `/api/v1/files/chat/${objectName}`,
    method: 'DELETE'
  }),
  
  // 上传AI生成图片
  uploadAiGeneratedImage: (taskId) => ({
    url: `/api/v1/files/ai/generated/${taskId}`,
    method: 'POST'
  }),
  
  // 上传AI分析文件
  uploadAiAnalysisFile: (userId, taskId) => ({
    url: `/api/v1/files/ai/uploads/${userId}/${taskId}`,
    method: 'POST'
  }),
  
  // 删除AI文件
  deleteAiFile: (objectName) => ({
    url: `/api/v1/files/ai/${objectName}`,
    method: 'DELETE'
  }),
  
  // 上传通知横幅
  uploadNotificationBanner: (noticeId) => ({
    url: `/api/v1/files/notification/banner/${noticeId}`,
    method: 'POST'
  }),
  
  // 上传活动海报
  uploadActivityPoster: (activityId) => ({
    url: `/api/v1/files/notification/poster/${activityId}`,
    method: 'POST'
  }),
  
  // 删除通知文件
  deleteNotificationFile: (objectName) => ({
    url: `/api/v1/files/notification/${objectName}`,
    method: 'DELETE'
  })
}
