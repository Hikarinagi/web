export interface TopicValue {
  id: number
  name: string
}

export interface TopicOption {
  id: number
  name: string
  use_count: number
}

export interface TopicSection {
  key: string
  label: string
  items: TopicOption[]
}

export interface UseTopicsOptions {
  selected: () => TopicValue[]
  full: () => boolean
}

export function useTopics(opts: UseTopicsOptions) {
  const query = ref('')
  const loaded = ref(false)
  const loadingPool = ref(false)
  const searching = ref(false)
  const followed = ref<TopicOption[]>([])
  const hot = ref<TopicOption[]>([])
  const results = ref<TopicOption[]>([])

  const kw = computed(() => query.value.trim())
  const kwLower = computed(() => kw.value.toLowerCase())

  async function ensureLoaded() {
    if (loaded.value) return
    loaded.value = true
    loadingPool.value = true
    try {
      const [mine, all] = await Promise.allSettled([
        hikariRequest('/api/v3/user/me/topics', {
          query: { page: 1, page_size: 10 },
          toast: false,
        }),
        hikariRequest('/api/v3/topics', { query: { page: 1, page_size: 10 }, toast: false }),
      ])
      if (mine.status === 'fulfilled') followed.value = mine.value.items
      if (all.status === 'fulfilled') hot.value = all.value.items
    } finally {
      loadingPool.value = false
    }
  }

  const runSearch = useDebounceFn(async (q: string) => {
    try {
      const res = await hikariRequest('/api/v3/topics', {
        query: { page: 1, page_size: 20, search: q },
        toast: false,
      })
      results.value = res.items
    } catch {
      results.value = []
    } finally {
      searching.value = false
    }
  }, 250)

  watch(kw, q => {
    if (!q) {
      results.value = []
      searching.value = false
      return
    }
    searching.value = true
    runSearch(q)
  })

  const selectedIds = computed(() => new Set(opts.selected().map(t => t.id)))
  const followedIds = computed(() => new Set(followed.value.map(t => t.id)))
  function matchKw(t: TopicOption) {
    return t.name.toLowerCase().includes(kwLower.value)
  }
  const sections = computed<TopicSection[]>(() => {
    const list: TopicSection[] = kw.value
      ? [
          { key: 'followed', label: '已关注', items: followed.value.filter(matchKw) },
          {
            key: 'results',
            label: '搜索结果',
            items: results.value.filter(t => !followedIds.value.has(t.id)),
          },
        ]
      : [
          { key: 'followed', label: '已关注', items: followed.value },
          { key: 'hot', label: '热门', items: hot.value.filter(t => !followedIds.value.has(t.id)) },
        ]
    return list.filter(s => s.items.length)
  })
  const exactExists = computed(() =>
    [...followed.value, ...hot.value, ...results.value].some(
      t => t.name.toLowerCase() === kwLower.value,
    ),
  )
  const canCreate = computed(
    () => !!kw.value && !searching.value && !exactExists.value && !opts.full(),
  )
  const busy = computed(() => loadingPool.value || (searching.value && !sections.value.length))

  return { query, kw, busy, sections, canCreate, selectedIds, ensureLoaded }
}
