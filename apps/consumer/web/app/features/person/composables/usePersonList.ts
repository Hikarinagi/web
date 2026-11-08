import {
  personListBff,
  personRoute,
  readPersonQuery,
  samePersonState,
  type PersonListState,
} from '~/features/person/results'

export function usePersonList<TList>(
  id: number,
  initial: { list: TList; state: PersonListState },
  defaultTab: string,
) {
  const route = useRoute()
  const router = useRouter()
  const nuxtApp = useNuxtApp()

  const pendingState = shallowRef<PersonListState>(initial.state)
  const request = computed(() => personListBff(id, pendingState.value))
  const { data, error, execute } = useHikariApiData<{ list: TList }>(request, {
    key: `person-list:${id}`,
    immediate: false,
    watch: false,
  })

  const displayed = shallowRef<TList>(initial.list)
  const state = shallowRef<PersonListState>(initial.state)
  const pending = ref(false)

  let requestSeq = 0
  let syncingRoute = false

  async function commit(next: PersonListState, syncRoute: boolean) {
    const seq = ++requestSeq
    pendingState.value = next
    pending.value = true
    await nuxtApp.callHook('page:loading:start')
    try {
      await execute()
      if (seq !== requestSeq || error.value || !data.value) return
      if (syncRoute) await applyRoute(next)
      displayed.value = data.value.list
      state.value = next
    } catch {
      return
    } finally {
      if (seq === requestSeq) pending.value = false
      await nuxtApp.callHook('page:loading:end')
    }
  }

  async function applyRoute(next: PersonListState) {
    syncingRoute = true
    try {
      await router.push(
        personRoute(id, { ...next, tab: next.tab === defaultTab ? null : next.tab }),
      )
      await nextTick()
    } finally {
      syncingRoute = false
    }
  }

  function update(partial: Partial<PersonListState>) {
    void commit({ ...state.value, ...partial, page: partial.page ?? 1 }, true)
  }

  watch(
    () => route.fullPath,
    () => {
      if (syncingRoute || route.path.replace(/\/$/, '') !== `/people/${id}`) return
      const read = readPersonQuery(route.query)
      const next = { ...read, tab: read.tab ?? defaultTab }
      if (samePersonState(next, state.value)) return
      void commit(next, false)
    },
  )

  return { displayed, state, pending, update }
}
