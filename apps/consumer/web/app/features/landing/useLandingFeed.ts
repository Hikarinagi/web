import type { ApiData } from '@hikarinagi/api-contract/v3'
import { visitorId } from '~/features/recommend/session'

export type LandingFeedPath =
  | '/api/v3/landing/galgames/feed'
  | '/api/v3/landing/light-novels/feed'
  | '/api/v3/landing/mangas/feed'

export type LandingFeedItem = (
  | ApiData<'/api/v3/landing/galgames/feed', 'get'>
  | ApiData<'/api/v3/landing/light-novels/feed', 'get'>
  | ApiData<'/api/v3/landing/mangas/feed', 'get'>
)['items'][number]

export function useLandingFeed(
  path: LandingFeedPath,
  initial: { items: LandingFeedItem[]; cursor: string | null },
) {
  const items = shallowRef<LandingFeedItem[]>(initial.items)
  const cursor = ref(initial.cursor)
  const loading = ref(false)
  const failed = ref(false)
  const done = computed(() => cursor.value === null)

  async function load() {
    if (loading.value || !cursor.value) return
    loading.value = true
    failed.value = false
    try {
      const page = await hikariRequest<'/api/v3/landing/galgames/feed', 'get'>(
        path as '/api/v3/landing/galgames/feed',
        { method: 'get', query: { cursor: cursor.value, visitor: visitorId() }, toast: false },
      )
      items.value = [...items.value, ...(page.items as LandingFeedItem[])]
      cursor.value = page.cursor
    } catch {
      failed.value = true
    } finally {
      loading.value = false
    }
  }

  return { items, loading, failed, done, load }
}
