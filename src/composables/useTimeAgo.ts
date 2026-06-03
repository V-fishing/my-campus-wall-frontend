/**
 * 时间格式化 composable
 * 替换各页面中重复的 formatTime 函数
 */
export function formatTimeAgo(timestamp: number | string | Date | null | undefined): string {
  if (!timestamp) return '刚刚'

  const now = Date.now()
  let past: number

  if (typeof timestamp === 'number') {
    // 秒级时间戳 (< 1e12) → 转换为毫秒
    past = timestamp < 1e12 ? timestamp * 1000 : timestamp
  } else {
    past = new Date(timestamp).getTime()
  }

  const diff = now - past

  if (diff < 60_000)        return '刚刚'
  if (diff < 3_600_000)     return `${Math.floor(diff / 60_000)}分钟前`
  if (diff < 86_400_000)    return `${Math.floor(diff / 3_600_000)}小时前`
  if (diff < 2_592_000_000)  return `${Math.floor(diff / 86_400_000)}天前`

  const d = new Date(past)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}
