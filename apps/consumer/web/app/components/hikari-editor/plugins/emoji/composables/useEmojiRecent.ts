import type { ApiData } from '@hikarinagi/api-contract/v3'
import { onAuthChange } from '~/utils/auth-cleanup'

export type RecentEmoji = ApiData<'/api/v3/emoji/my-recent', 'get'>[number]

const CACHE_KEY = 'emoji-my-recent'
const moduleCache = new Map<string, RecentEmoji[]>()

onAuthChange(() => moduleCache.clear())

export function useEmojiRecent() {
  const { data, refresh, status } = useHikariApiData('/api/v3/emoji/my-recent', {
    toast: false,
    dedupe: 'defer',
    getCachedData: (_key, _nuxtApp, { cause }) => {
      if (cause === 'refresh:manual' || cause === 'refresh:hook') return undefined
      return moduleCache.get(CACHE_KEY)
    },
  })
  watch(data, val => {
    if (Array.isArray(val)) moduleCache.set(CACHE_KEY, val as RecentEmoji[])
  })

  const items = computed<RecentEmoji[]>(() => data.value ?? [])
  const loaded = computed(() => Array.isArray(data.value))
  return { items, loaded, status, refresh }
}

export function invalidateRecentCache(): void {
  moduleCache.clear()
}
