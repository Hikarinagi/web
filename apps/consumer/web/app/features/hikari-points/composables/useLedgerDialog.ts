import type { PointRecord } from '../labels'

const visible = ref(false)
const records = ref<PointRecord[]>([])
const page = ref(1)
const totalPages = ref(1)
const loading = ref(false)

export function useHikariPointLedger() {
  async function fetchPage(target: number) {
    loading.value = true
    try {
      const data = await hikariRequest('/api/v3/user/me/hikari-points/records', {
        query: { page: target, page_size: 20 },
      })
      records.value = target === 1 ? data.items : [...records.value, ...data.items]
      page.value = data.meta.page
      totalPages.value = data.meta.total_pages
    } finally {
      loading.value = false
    }
  }

  function open() {
    visible.value = true
    void fetchPage(1)
  }

  function loadMore() {
    if (page.value < totalPages.value && !loading.value) void fetchPage(page.value + 1)
  }

  const hasMore = computed(() => page.value < totalPages.value)

  return { visible, records, loading, hasMore, open, loadMore }
}
