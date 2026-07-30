import {
  readSearchQuery,
  searchBff,
  searchRoute,
  type SearchResultsState,
} from '~/features/search/results'

function sameState(a: SearchResultsState, b: SearchResultsState) {
  return (
    a.q === b.q &&
    a.page === b.page &&
    a.types.length === b.types.length &&
    a.types.every((type, index) => type === b.types[index])
  )
}

export function useSearchResults<TData>(initial: TData) {
  const route = useRoute()
  const router = useRouter()
  const nuxtApp = useNuxtApp()

  const pendingState = shallowRef<SearchResultsState>(readSearchQuery(route.query))
  const request = computed(() => searchBff(pendingState.value))
  const { data, error, execute } = useHikariApiData<TData>(request, {
    key: 'search-results',
    immediate: false,
    watch: false,
  })

  const displayed = shallowRef<TData>(initial)
  const state = shallowRef<SearchResultsState>(pendingState.value)
  const pending = ref(false)

  let requestSeq = 0
  let syncingRoute = false

  async function commit(next: SearchResultsState, syncRoute: boolean) {
    const seq = ++requestSeq
    pendingState.value = next
    pending.value = true
    await nuxtApp.callHook('page:loading:start')
    try {
      await execute()
      if (seq !== requestSeq || error.value || !data.value) return
      if (syncRoute) await applyRoute(next)
      displayed.value = data.value
      state.value = next
    } catch {
      /* execute surfaces its own error toast; keep the current results */
    } finally {
      if (seq === requestSeq) pending.value = false
      await nuxtApp.callHook('page:loading:end')
    }
  }

  async function applyRoute(next: SearchResultsState) {
    syncingRoute = true
    try {
      await router.push(searchRoute(next))
      await nextTick()
    } finally {
      syncingRoute = false
    }
  }

  function update(partial: Partial<SearchResultsState>) {
    void commit({ ...state.value, ...partial, page: partial.page ?? 1 }, true)
  }

  watch(
    () => route.fullPath,
    () => {
      if (syncingRoute) return
      const next = readSearchQuery(route.query)
      if (sameState(next, state.value)) return
      void commit(next, false)
    },
  )

  return { displayed, state, pending, update }
}
