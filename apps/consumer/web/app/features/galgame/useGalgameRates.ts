import type { GalgameRateList, GalgameRateStatus } from './rate'

type RateSort = 'new' | 'hot'
type SpoilerFilter = 'only' | 'hide'
const PAGE_SIZE = 20

export function useGalgameRates(galgameId: number, initial: GalgameRateList) {
  const items = ref<GalgameRateList['items']>(initial.items)
  const page = ref(initial.meta.page)
  const totalPages = ref(initial.meta.total_pages)
  const total = ref(initial.meta.total_items)
  const pending = ref(false)

  const sort = ref<RateSort>('hot')
  const status = ref<GalgameRateStatus | null>(null)
  const score = ref<number | null>(null)
  const spoiler = ref<SpoilerFilter | null>(null)
  const hasDimensions = ref(false)

  const hasMore = computed(() => page.value < totalPages.value)

  async function fetchPage(target: number, replace: boolean) {
    if (pending.value) return
    pending.value = true
    try {
      const res = await hikariRequest('/api/v3/galgames/{id}/rates', {
        path: { id: galgameId },
        query: {
          page: target,
          page_size: PAGE_SIZE,
          sort: sort.value,
          ...(status.value ? { status: status.value } : {}),
          ...(score.value != null ? { score: score.value } : {}),
          ...(spoiler.value ? { spoiler: spoiler.value } : {}),
          ...(hasDimensions.value ? { has_dimensions: true } : {}),
        },
      })
      items.value = replace ? res.items : [...items.value, ...res.items]
      page.value = res.meta.page
      totalPages.value = res.meta.total_pages
      total.value = res.meta.total_items
    } finally {
      pending.value = false
    }
  }

  function loadMore() {
    if (hasMore.value) void fetchPage(page.value + 1, false)
  }

  watch([sort, status, score, spoiler, hasDimensions], () => void fetchPage(1, true))

  return { items, total, pending, hasMore, loadMore, sort, status, score, spoiler, hasDimensions }
}
