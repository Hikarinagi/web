import type { ApiData } from '@hikarinagi/api-contract/v3'
import { onAuthChange } from '~/utils/auth-cleanup'

export type UserCatalogSet = ApiData<'/api/v3/emoji/my-catalog', 'get'>[number]
export type Emoji = UserCatalogSet['emojis'][number]

const CACHE_KEY = 'emoji-my-catalog'
const moduleCache = new Map<string, UserCatalogSet[]>()

onAuthChange(() => moduleCache.clear())

export function useUserEmojiCatalog() {
  const { data, refresh } = useHikariApiData('/api/v3/emoji/my-catalog', {
    toast: false,
    dedupe: 'defer',
    getCachedData: (_key, _nuxtApp, { cause }) => {
      if (cause === 'refresh:manual' || cause === 'refresh:hook') return undefined
      return moduleCache.get(CACHE_KEY)
    },
  })
  watch(data, val => {
    if (Array.isArray(val)) moduleCache.set(CACHE_KEY, val as UserCatalogSet[])
  })

  const sets = computed<UserCatalogSet[]>(() => data.value ?? [])
  const loaded = computed(() => Array.isArray(data.value))
  return { sets, loaded, refresh }
}
