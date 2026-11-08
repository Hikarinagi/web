import type { GalgameRateList, GalgameRateStatus } from './rate'

type RateSort = 'new' | 'hot'
type SpoilerFilter = 'only' | 'hide'
const PAGE_SIZE = 20

export function useGalgameRates(galgameId: number, initial: GalgameRateList) {
  const key = `galgame-rates:${galgameId}`
  const items = useState<GalgameRateList['items']>(`${key}:items`, () => initial.items)
  const page = useState(`${key}:page`, () => initial.meta.page)
  const totalPages = useState(`${key}:total-pages`, () => initial.meta.total_pages)
  const total = useState(`${key}:total`, () => initial.meta.total_items)
  const pending = useState(`${key}:pending`, () => false)

  const sort = useState<RateSort>(`${key}:sort`, () => 'hot')
  const status = useState<GalgameRateStatus | null>(`${key}:status`, () => null)
  const score = useState<number | null>(`${key}:score`, () => null)
  const spoiler = useState<SpoilerFilter | null>(`${key}:spoiler`, () => null)
  const hasDimensions = useState(`${key}:dimensions`, () => false)

  const hasMore = computed(() => page.value < totalPages.value)
  const filtered = computed(
    () =>
      Boolean(status.value) || score.value != null || Boolean(spoiler.value) || hasDimensions.value,
  )

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
          has_content: true,
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

  return {
    items,
    total,
    pending,
    hasMore,
    filtered,
    loadMore,
    sort,
    status,
    score,
    spoiler,
    hasDimensions,
  }
}
