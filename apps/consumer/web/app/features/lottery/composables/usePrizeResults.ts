import {
  prizeBff,
  prizeRoute,
  readPrizeQuery,
  type PrizeResultsState,
} from '~/features/lottery/results'

export function usePrizeResults<TData extends { state: PrizeResultsState }>(initial: TData) {
  const route = useRoute()
  const router = useRouter()
  const nuxtApp = useNuxtApp()

  const pendingState = shallowRef<PrizeResultsState>(readPrizeQuery(route.query))
  const request = computed(() => prizeBff(pendingState.value))
  const { data, error, execute } = useHikariApiData<TData>(request, {
    key: 'me-prize-results',
    immediate: false,
    watch: false,
  })

  const displayed = shallowRef<TData>(initial)
  const state = shallowRef<PrizeResultsState>(pendingState.value)
  const pending = ref(false)
  let requestSeq = 0
  let syncingRoute = false

  async function commit(next: PrizeResultsState, syncRoute: boolean) {
    const seq = ++requestSeq
    pendingState.value = next
    pending.value = true
    await nuxtApp.callHook('page:loading:start')
    try {
      await execute()
      if (seq !== requestSeq || error.value || !data.value) return
      if (syncRoute) {
        syncingRoute = true
        try {
          await router.push(prizeRoute(next))
          await nextTick()
        } finally {
          syncingRoute = false
        }
      }
      displayed.value = data.value
      state.value = next
    } catch {
      return
    } finally {
      if (seq === requestSeq) pending.value = false
      await nuxtApp.callHook('page:loading:end')
    }
  }

  function reload() {
    void commit(state.value, false)
  }

  watch(
    () => route.fullPath,
    () => {
      if (syncingRoute || route.path !== '/me/prizes') return
      const next = readPrizeQuery(route.query)
      if (next.page === state.value.page) return
      void commit(next, false)
    },
  )

  onMounted(() => {
    if (state.value.page !== initial.state.page) void commit(state.value, false)
  })

  return { displayed, state, pending, reload }
}
