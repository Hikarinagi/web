import {
  orgListBff,
  orgRoute,
  readOrgQuery,
  sameOrgState,
  type OrgListState,
  type OrgMedia,
} from '~/features/org/results'
import type { OrgMode } from '~/features/org/works'

export function useOrgList<TList>(
  id: number,
  mode: OrgMode,
  initial: { list: TList; state: OrgListState },
  defaultMedia: OrgMedia,
) {
  const route = useRoute()
  const router = useRouter()
  const nuxtApp = useNuxtApp()

  const pendingState = shallowRef<OrgListState>(initial.state)
  const request = computed(() => orgListBff(id, mode, pendingState.value))
  const { data, error, execute } = useHikariApiData<{ list: TList }>(request, {
    key: `org-list:${id}`,
    immediate: false,
    watch: false,
  })

  const displayed = shallowRef<TList>(initial.list)
  const state = shallowRef<OrgListState>(initial.state)
  const pending = ref(false)

  let requestSeq = 0
  let syncingRoute = false

  async function commit(next: OrgListState, syncRoute: boolean) {
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

  async function applyRoute(next: OrgListState) {
    syncingRoute = true
    try {
      await router.push(
        orgRoute(id, { ...next, media: next.media === defaultMedia ? null : next.media }),
      )
      await nextTick()
    } finally {
      syncingRoute = false
    }
  }

  function update(partial: Partial<OrgListState>) {
    void commit({ ...state.value, ...partial, page: partial.page ?? 1 }, true)
  }

  watch(
    () => route.fullPath,
    () => {
      if (syncingRoute || route.path.replace(/\/$/, '') !== `/producers/${id}`) return
      const read = readOrgQuery(route.query)
      const next = { ...read, media: read.media ?? defaultMedia }
      if (sameOrgState(next, state.value)) return
      void commit(next, false)
    },
  )

  return { displayed, state, pending, update }
}
