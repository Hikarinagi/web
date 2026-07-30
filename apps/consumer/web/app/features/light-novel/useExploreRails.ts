import type { LightNovelRailsData } from '~~/server/api/pages/light-novels/rails.get'

type RailEntry = LightNovelRailsData['entries'][number]

// 无限滚动 rail 的累积状态放 app-level useState(而非组件本地 ref):切到详情页
// (含换 layout)再返回时,rail 列表 + 游标 + loading 都还在,组件重挂直接复用,
// 页面恢复到原高度,Nuxt 内建 scrollBehavior 即可精确还原 scrollY。对齐 feed 的 useFeedStream。
// loading 也放 useState,避免重挂的新实例与上一实例在途的 loadMore 撞同一 cursor 出重复 rail。
export function useExploreRails() {
  const entries = useState<RailEntry[]>('ln:explore:entries', () => [])
  const cursor = useState<number | null>('ln:explore:cursor', () => 0)
  const loading = useState('ln:explore:loading', () => false)
  const done = computed(() => cursor.value === null)

  async function loadMore() {
    if (loading.value || cursor.value === null) return
    loading.value = true
    try {
      const data = await $fetch<LightNovelRailsData>('/api/pages/light-novels/rails', {
        query: { cursor: cursor.value },
      })
      entries.value.push(...data.entries)
      cursor.value = data.next_cursor
    } catch {
      cursor.value = null
    } finally {
      loading.value = false
    }
  }

  return { entries, loading, done, loadMore }
}
