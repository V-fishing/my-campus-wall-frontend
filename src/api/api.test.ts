import { describe, it, expect } from 'vitest'
import { postApi, categoryApi, userApi, followApi, commentApi, searchApi } from './index'

describe('postApi 接口配置', () => {
  it('getPostList 应返回正确的列表接口配置', () => {
    const config = postApi.getPostList({ page: 1, size: 10 })
    expect(config.url).toBe('/api/v1/posts/list')
    expect(config.method).toBe('GET')
    expect(config.params).toEqual({ page: 1, size: 10 })
  })

  it('getHotPosts 默认 limit 为 10', () => {
    const config = postApi.getHotPosts()
    expect(config.url).toBe('/api/v1/posts/hot')
    expect(config.params!.limit).toBe(10)
  })

  it('getPostDetail 应拼接 postId 到路径', () => {
    const config = postApi.getPostDetail(42)
    expect(config.url).toBe('/api/v1/posts/detail/42')
    expect(config.method).toBe('GET')
  })

  it('publishPost 应为 POST 方法', () => {
    const config = postApi.publishPost({ content: 'hello' })
    expect(config.url).toBe('/api/v1/posts/publish')
    expect(config.method).toBe('POST')
    expect(config.data).toEqual({ content: 'hello' })
  })

  it('toggleLike 应使用 POST', () => {
    const config = postApi.toggleLike(99)
    expect(config.url).toBe('/api/v1/posts/like/99')
    expect(config.method).toBe('POST')
  })

  it('deletePost 应使用 DELETE', () => {
    const config = postApi.deletePost(5)
    expect(config.url).toBe('/api/v1/posts/delete/5')
    expect(config.method).toBe('DELETE')
  })

  it('getFollowingPosts 应返回关注帖子接口', () => {
    const config = postApi.getFollowingPosts({ page: 1, size: 10, scope: 0 })
    expect(config.url).toBe('/api/v1/posts/following')
    expect(config.method).toBe('GET')
    expect(config.params).toEqual({ page: 1, size: 10, scope: 0 })
  })
})

describe('categoryApi 接口配置', () => {
  it('getCategories 应返回分类列表接口', () => {
    const config = categoryApi.getCategories()
    expect(config.url).toBe('/api/v1/categories/list')
    expect(config.method).toBe('GET')
  })

  it('getGroups 应返回分组分类接口', () => {
    const config = categoryApi.getGroups()
    expect(config.url).toBe('/api/v1/categories/groups')
    expect(config.method).toBe('GET')
  })

  it('getTopics 应返回话题列表接口', () => {
    const config = categoryApi.getTopics()
    expect(config.url).toBe('/api/v1/categories/topics')
    expect(config.method).toBe('GET')
  })
})

describe('userApi 接口配置', () => {
  it('login 应使用 POST 并传递 code', () => {
    const config = userApi.login('wx_code_123')
    expect(config.url).toBe('/api/v1/users/login')
    expect(config.method).toBe('POST')
    expect(config.data).toEqual({ code: 'wx_code_123' })
  })

  it('getCurrentUserInfo 应为 GET', () => {
    const config = userApi.getCurrentUserInfo()
    expect(config.url).toBe('/api/v1/users/me')
    expect(config.method).toBe('GET')
  })

  it('getUserInfo 应传递 userId 参数', () => {
    const config = userApi.getUserInfo(7)
    expect(config.url).toBe('/api/v1/users/info')
    expect(config.params).toEqual({ userId: 7 })
  })

  it('updateUserInfo 应为 PUT', () => {
    const config = userApi.updateUserInfo({ nickname: 'test' })
    expect(config.url).toBe('/api/v1/users/update')
    expect(config.method).toBe('PUT')
  })
})

describe('followApi 接口配置', () => {
  it('followUser 应为 POST', () => {
    const config = followApi.followUser(3)
    expect(config.url).toBe('/api/v1/follow/3')
    expect(config.method).toBe('POST')
  })

  it('unfollowUser 应为 DELETE', () => {
    const config = followApi.unfollowUser(3)
    expect(config.url).toBe('/api/v1/follow/3')
    expect(config.method).toBe('DELETE')
  })

  it('checkFollow 应为 GET', () => {
    const config = followApi.checkFollow(3)
    expect(config.url).toBe('/api/v1/follow/check/3')
    expect(config.method).toBe('GET')
  })
})

describe('commentApi 接口配置', () => {
  it('addComment 应为 POST', () => {
    const config = commentApi.addComment({ postId: 1, content: 'nice' })
    expect(config.url).toBe('/api/v1/comments/add')
    expect(config.method).toBe('POST')
  })

  it('getCommentList 应拼接 postId', () => {
    const config = commentApi.getCommentList(5)
    expect(config.url).toBe('/api/v1/comments/list/5')
    expect(config.params).toEqual({ postId: 5, page: 1, size: 20 })
  })
})

describe('searchApi 接口配置', () => {
  it('searchPosts 应为 GET', () => {
    const config = searchApi.searchPosts({ keyword: 'test' })
    expect(config.url).toBe('/api/v1/search/posts')
    expect(config.method).toBe('GET')
    expect(config.params).toEqual({ keyword: 'test' })
  })

  it('getHotSearch 默认 limit 为 10', () => {
    const config = searchApi.getHotSearch()
    expect(config.url).toBe('/api/v1/search/hot')
    expect(config.params!.limit).toBe(10)
  })
})
