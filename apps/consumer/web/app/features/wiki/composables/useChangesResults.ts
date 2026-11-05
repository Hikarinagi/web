import type { InjectionKey } from 'vue'
import { changesBff, readChangesQuery, type ChangesState } from '~/features/wiki/changes'

export const RELOAD_CHANGES: InjectionKey<() => void> = Symbol('wiki-reload-changes')

function sameState(a: ChangesState, b: ChangesState) {
  return a.f === b.f && a.page === b.page
}

export function useChangesResults<TData extends { state: ChangesState }>(initial: TData) {
  const route = useRoute()
  const nuxtApp = useNuxtApp()

  const pendingState = shallowRef<ChangesState>(readChangesQuery(route.query))
  const request = computed(() => changesBff(pendingState.value))
  const { data, error, execute } = useHikariApiData<TData>(request, {
    key: 'wiki-changes-results',
    immediate: false,
    watch: false,
  })

  const displayed = shallowRef<TData>(initial)
  const state = shallowRef<ChangesState>(pendingState.value)
  const pending = ref(false)
  let requestSeq = 0

  async function commit(next: ChangesState) {
    const seq = ++requestSeq
    pendingState.value = next
    pending.value = true
    await nuxtApp.callHook('page:loading:start')
    try {
      await execute()
      if (seq !== requestSeq || error.value || !data.value) return
      displayed.value = data.value
      state.value = next
    } catch {
      /* execute surfaces its own error toast; keep current results */
    } finally {
      if (seq === requestSeq) pending.value = false
      await nuxtApp.callHook('page:loading:end')
    }
  }

  function reload() {
    void commit(state.value)
  }

  watch(
    () => route.fullPath,
    () => {
      if (!route.path.startsWith('/create/wiki/changes')) return
      const next = readChangesQuery(route.query)
      if (!sameState(next, state.value)) void commit(next)
    },
  )

  onMounted(() => {
    if (!sameState(state.value, initial.state)) void commit(state.value)
  })

  return { displayed, state, pending, reload }
}
