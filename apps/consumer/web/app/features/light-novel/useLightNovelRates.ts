import type { LightNovelRateList, LightNovelRateStatus } from './rate'

type RateSort = 'new' | 'hot'
type SpoilerFilter = 'only' | 'hide'
const PAGE_SIZE = 20

export function useLightNovelRates(lightNovelId: number, initial: LightNovelRateList) {
  const items = ref<LightNovelRateList['items']>(initial.items)
  const page = ref(initial.meta.page)
  const totalPages = ref(initial.meta.total_pages)
  const total = ref(initial.meta.total_items)
  const pending = ref(false)

  const sort = ref<RateSort>('hot')
  const status = ref<LightNovelRateStatus | null>(null)
  const score = ref<number | null>(null)
  const spoiler = ref<SpoilerFilter | null>(null)
  const hasDimensions = ref(false)

  const hasMore = computed(() => page.value < totalPages.value)
  const filtered = computed(
    () =>
      Boolean(status.value) || score.value != null || Boolean(spoiler.value) || hasDimensions.value,
  )

  async function fetchPage(target: number, replace: boolean) {
    if (pending.value) return
    pending.value = true
    try {
      const res = await hikariRequest('/api/v3/light-novels/{id}/rates', {
        path: { id: lightNovelId },
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
