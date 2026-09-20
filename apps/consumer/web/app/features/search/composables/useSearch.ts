import {
  entityHref,
  searchHref,
  type SearchHit,
  type Suggestion,
  type TrendingItem,
} from '~/features/search/search'
import { useSearchHistory } from '~/features/search/composables/useSearchHistory'

type NavItem = { kind: 'keyword'; value: string } | { kind: 'hit'; hit: SearchHit }

export function useSearch() {
  const query = ref('')
  const hits = ref<SearchHit[]>([])
  const suggestions = ref<Suggestion[]>([])
  const trending = ref<TrendingItem[]>([])
  const loading = ref(false)
  const activeIndex = ref(-1)
  const history = useSearchHistory()

  const trimmed = computed(() => query.value.trim())
  const mode = computed<'idle' | 'typing'>(() => (trimmed.value ? 'typing' : 'idle'))

  const navItems = computed<NavItem[]>(() =>
    mode.value === 'typing'
      ? [
          ...suggestions.value.map(s => ({ kind: 'keyword' as const, value: s.keyword })),
          ...hits.value.map(hit => ({ kind: 'hit' as const, hit })),
          { kind: 'keyword' as const, value: query.value },
        ]
      : trending.value.map(t => ({ kind: 'keyword' as const, value: t.keyword })),
  )

  let seq = 0

  async function refreshTyped() {
    const q = trimmed.value
    if (!q) return
    const current = ++seq
    loading.value = true
    try {
      const [instant, suggest] = await Promise.all([
        hikariRequest('/api/v3/search/instant', { query: { q }, toast: false }),
        hikariRequest('/api/v3/search/suggestions', { query: { q }, toast: false }),
      ])
      if (current !== seq) return
      hits.value = instant.groups
        .flatMap(group => group.items)
        .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      suggestions.value = suggest.items
    } catch {
      if (current !== seq) return
      hits.value = []
      suggestions.value = []
    } finally {
      if (current === seq) loading.value = false
    }
  }

  const debouncedTyped = useDebounceFn(refreshTyped, 220)

  watch(trimmed, value => {
    seq += 1
    activeIndex.value = -1
    if (!value) {
      hits.value = []
      suggestions.value = []
      loading.value = false
      return
    }
    loading.value = true
    void debouncedTyped()
  })

  async function loadTrending() {
    if (trending.value.length) return
    try {
      const res = await hikariRequest('/api/v3/search/trending', { toast: false })
      trending.value = res.items
    } catch {
      trending.value = []
    }
  }

  function setQuery(value?: string) {
    query.value = value || ''
  }

  function submit(keyword?: string) {
    const value = (keyword ?? query.value).trim()
    if (!value) return
    history.add(value)
    void navigateTo(searchHref(value), { replace: true })
  }

  function moveActive(delta: number) {
    const total = navItems.value.length
    if (!total) return
    const cur = activeIndex.value
    activeIndex.value = cur < 0 ? (delta > 0 ? 0 : total - 1) : (cur + delta + total) % total
  }

  function activateActive(): boolean {
    const item = navItems.value[activeIndex.value]
    if (!item) return false
    if (item.kind === 'keyword') submit(item.value)
    else void navigateTo(entityHref(item.hit), { replace: true })
    return true
  }

  function reset() {
    seq += 1
    query.value = ''
    hits.value = []
    suggestions.value = []
    loading.value = false
    activeIndex.value = -1
  }

  return reactive({
    query,
    mode,
    hits,
    suggestions,
    trending,
    loading,
    activeIndex,
    navItems,
    recent: history.recent,
    removeRecent: history.remove,
    clearRecent: history.clear,
    loadTrending,
    setQuery,
    submit,
    moveActive,
    activateActive,
    reset,
  })
}
