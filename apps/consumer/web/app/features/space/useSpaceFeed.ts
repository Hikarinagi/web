import { FEED_PAGE_SIZE, type BackendFeedItem, type FeedResponse } from '~/features/feed/feed'

interface SpaceFeedBucket {
  items: BackendFeedItem[]
  nextCursor: string | null
}

export function useSpaceFeed(userId: number, initial: FeedResponse) {
  const buckets = useState<Record<string, SpaceFeedBucket>>('space:feed', () => ({}))
  const key = userId.toString()

  if (!buckets.value[key]) {
    buckets.value[key] = {
      items: [...initial.items],
      nextCursor: initial.meta.next_cursor,
    }
  }

  const bucket = computed(() => buckets.value[key]!)
  const items = computed(() => bucket.value.items)
  const nextCursor = computed(() => bucket.value.nextCursor)
  const loading = ref(false)

  async function fetchPage(cursor: string | null) {
    return hikariRequest('/api/v3/user/{id}/feed', {
      path: { id: userId },
      query: { limit: FEED_PAGE_SIZE, ...(cursor ? { cursor } : {}) },
    })
  }

  async function loadMore() {
    if (loading.value || !nextCursor.value) return
    loading.value = true
    try {
      const res = await fetchPage(nextCursor.value)
      bucket.value.items.push(...res.items)
      bucket.value.nextCursor = res.meta.next_cursor
    } finally {
      loading.value = false
    }
  }

  const auth = useAuthStore()
  watch(
    () => auth.isAuthenticated,
    async () => {
      loading.value = true
      try {
        const res = await fetchPage(null)
        buckets.value[key] = {
          items: [...res.items],
          nextCursor: res.meta.next_cursor,
        }
      } finally {
        loading.value = false
      }
    },
  )

  return { items, nextCursor, loading, loadMore }
}
