import type { WikiSearchItem } from '~/features/wiki/entries'

type SearchType = WikiSearchItem['type']

export function useEntrySearch(keyword: () => string, types: SearchType[]) {
  const found = shallowRef<WikiSearchItem[]>([])
  const loading = ref(false)
  let sequence = 0

  watchDebounced(
    keyword,
    async value => {
      const seq = ++sequence
      const q = value.trim()
      if (!q) {
        found.value = []
        return
      }
      loading.value = true
      try {
        const items = await hikariRequest('/api/v3/wiki/entries', {
          query: { q: q.slice(0, 100), types },
          toast: false,
        })
        if (seq === sequence) found.value = items
      } catch {
        if (seq === sequence) found.value = []
      } finally {
        if (seq === sequence) loading.value = false
      }
    },
    { debounce: 250 },
  )

  return { found, loading }
}
