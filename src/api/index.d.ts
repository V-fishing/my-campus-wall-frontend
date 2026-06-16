/**
 * API 接口类型声明
 */

interface ApiConfig {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  params?: Record<string, any>
  data?: any
}

// 帖子相关接口类型
export interface PostApi {
  getPostList: (params?: any) => ApiConfig
  getHotPosts: (limit?: number, scope?: any) => ApiConfig
  getLeaderboard: (limit?: number, scope?: any) => ApiConfig
  getPostDetail: (postId: number) => ApiConfig
  publishPost: (data: any) => ApiConfig
  toggleLike: (postId: number) => ApiConfig
  toggleCollect: (postId: number) => ApiConfig
  deletePost: (postId: number) => ApiConfig
  getUserPosts: (userId: number, params?: any) => ApiConfig
  getUserCollectedPosts: (userId: number, params?: any) => ApiConfig
  getFollowingPosts: (params?: any) => ApiConfig
  incrementViewCount: (postId: number) => ApiConfig
  joinTeam: (postId: number) => ApiConfig
  leaveTeam: (postId: number) => ApiConfig
}

// 分类相关接口类型
export interface CategoryApi {
  getCategories: () => ApiConfig
  getGroups: () => ApiConfig
  getTopics: () => ApiConfig
}

// 用户相关接口类型
export interface UserApi {
  login: (code: string) => ApiConfig
  getCurrentUserInfo: () => ApiConfig
  getUserInfo: (userId: number) => ApiConfig
  updateUserInfo: (data: any) => ApiConfig
}

// 关注相关接口类型
export interface FollowApi {
  followUser: (followUserId: number) => ApiConfig
  unfollowUser: (followUserId: number) => ApiConfig
  checkFollow: (followUserId: number) => ApiConfig
}

// 评论相关接口类型
export interface CommentApi {
  addComment: (data: any) => ApiConfig
  getCommentList: (postId: number, page?: number, size?: number) => ApiConfig
  toggleLike: (commentId: number) => ApiConfig
  deleteComment: (commentId: number) => ApiConfig
}

// 消息通知相关接口类型
export interface MessageApi {
  getUnreadStats: () => ApiConfig
  getNotificationList: (params?: any) => ApiConfig
  markNotificationAsRead: (notificationId: number) => ApiConfig
  markAllNotificationsAsRead: () => ApiConfig
}

// 聊天相关接口类型
export interface ChatApi {
  getSessionList: () => ApiConfig
  getMessageList: (sessionId: string, page?: number, size?: number) => ApiConfig
  sendMessage: (data: any) => ApiConfig
  markChatRead: (sessionId: string) => ApiConfig
  recallMessage: (messageId: number) => ApiConfig
  deleteSession: (sessionId: string) => ApiConfig
}

// AI 学长相关接口类型
export interface AiApi {
  agent: (question: string, conversationId?: string) => ApiConfig
  getHistory: (userId: number) => ApiConfig
  getHistoryDetail: (sessionId: string) => ApiConfig
  // AI 帮我发帖（HITL）
  startDraft: (conversationId: string, text: string, images?: string[]) => ApiConfig
  resumeDraft: (draftId: string, action: 'edit' | 'publish' | 'cancel', patch?: string) => ApiConfig
  cancelDraft: (draftId: string) => ApiConfig
}

// 搜索相关接口类型
export interface SearchApi {
  searchPosts: (params?: any) => ApiConfig
  getHotSearch: (limit?: number) => ApiConfig
  recordSearch: (keyword: string) => ApiConfig
}

// 通知相关接口类型
export interface NotificationApi {
  getCommentNotifications: (params?: any) => ApiConfig
  getLikeNotifications: (params?: any) => ApiConfig
  markNotificationRead: (notificationId: number) => ApiConfig
  markAllRead: () => ApiConfig
  deleteNotification: (notificationId: number) => ApiConfig
}

// 发现页相关接口类型
export interface DiscoverApi {
  getChannels: () => ApiConfig
  getNearbyUniversities: (city?: string) => ApiConfig
}

// 高校相关接口类型
export interface UniversityApi {
  getCampuses: (universityId: number) => ApiConfig
}

// 文件上传相关接口类型
export interface FileApi {
  uploadPostTempImage: () => ApiConfig
  uploadPostTempImages: () => ApiConfig
  uploadPostImage: (postId: number) => ApiConfig
  uploadPostAttachment: (postId: number) => ApiConfig
  deletePostFile: (objectName: string) => ApiConfig
  uploadUserAvatar: (userId: number) => ApiConfig
  uploadUserBackground: (userId: number) => ApiConfig
  deleteUserFile: (objectName: string) => ApiConfig
  uploadChatImage: (sessionId: string, messageId: string) => ApiConfig
  uploadChatFile: (sessionId: string, messageId: string) => ApiConfig
  uploadChatVoice: (sessionId: string, messageId: string) => ApiConfig
  deleteChatFile: (objectName: string) => ApiConfig
  uploadAiGeneratedImage: (taskId: string) => ApiConfig
  uploadAiAnalysisFile: (userId: number, taskId: string) => ApiConfig
  deleteAiFile: (objectName: string) => ApiConfig
  uploadNotificationBanner: (noticeId: number) => ApiConfig
  uploadActivityPoster: (activityId: number) => ApiConfig
  deleteNotificationFile: (objectName: string) => ApiConfig
}

// 导出所有 API 实例
export const postApi: PostApi
export const categoryApi: CategoryApi
export const userApi: UserApi
export const followApi: FollowApi
export const commentApi: CommentApi
export const messageApi: MessageApi
export const chatApi: ChatApi
export const aiApi: AiApi
export const searchApi: SearchApi
export const notificationApi: NotificationApi
export const fileApi: FileApi
export const universityApi: UniversityApi
export const discoverApi: DiscoverApi
