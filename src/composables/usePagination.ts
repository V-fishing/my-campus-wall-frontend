/**
 * 分页加载 composable
 * 统一上拉触底 / 下拉刷新 / 加载更多的模式
 */
import { ref } from 'vue'
import { get } from '@/utils/request'

interface PaginationOptions {
  url: string
  pageSize?: number
  defaultParams?: Record<string, any>
  onFormat?: (record: any) => any
}

export function usePagination(options: PaginationOptions) {
  const list      = ref<any[]>([])
  const page      = ref(1)
  const loading   = ref(false)
  const hasMore   = ref(true)
  const refreshing = ref(false)
  const pageSize   = options.pageSize ?? 10

  async function loadMore() {
    if (loading.value || !hasMore.value) return
    loading.value = true
    try {
      const params = { page: page.value, size: pageSize, ...options.defaultParams }
      const res = await get(options.url, params)
      const data = res.data || {}
      const records = data.records || []
      const formatted = options.onFormat ? records.map(options.onFormat) : records
      list.value.push(...formatted)
      page.value++
      hasMore.value = (data.current ?? 0) < (data.pages ?? 0)
    } catch (e) {
      console.error('分页加载失败', e)
    } finally {
      loading.value = false
      refreshing.value = false
    }
  }

  async function refresh() {
    refreshing.value = true
    page.value = 1
    hasMore.value = true
    list.value = []
    await loadMore()
  }

  return { list, loading, hasMore, refreshing, loadMore, refresh }
}
