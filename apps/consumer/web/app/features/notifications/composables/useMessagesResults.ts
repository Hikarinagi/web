import type { LocationQueryRaw } from 'vue-router'
import {
  messagesBff,
  readMessagesQuery,
  type MessagesResultsState,
} from '~/features/notifications/results'

function sameState(a: MessagesResultsState, b: MessagesResultsState) {
  return a.type === b.type && a.page === b.page
}

export function useMessagesResults<TData extends { state: MessagesResultsState }>(initial: TData) {
  const route = useRoute()
  const router = useRouter()
  const nuxtApp = useNuxtApp()

  const pendingState = shallowRef<MessagesResultsState>(readMessagesQuery(route.query))
  const request = computed(() => messagesBff(pendingState.value))
  const { data, error, execute } = useHikariApiData<TData>(request, {
    key: 'messages-results',
    immediate: false,
    watch: false,
  })

  const displayed = shallowRef<TData>(initial)
  const state = shallowRef<MessagesResultsState>(pendingState.value)
  const pending = ref(false)

  let requestSeq = 0
  let syncingRoute = false

  async function commit(next: MessagesResultsState, syncRoute: boolean) {
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
      /* execute surfaces its own error toast; keep current results */
    } finally {
      if (seq === requestSeq) pending.value = false
      await nuxtApp.callHook('page:loading:end')
    }
  }

  async function applyRoute(next: MessagesResultsState) {
    syncingRoute = true
    try {
      const query: LocationQueryRaw = { ...route.query }
      query.type = next.type === 'all' ? undefined : next.type
      query.page = next.page > 1 ? String(next.page) : undefined
      await router.push({ query })
      await nextTick()
    } finally {
      syncingRoute = false
    }
  }

  function update(partial: Partial<MessagesResultsState>) {
    void commit({ ...state.value, ...partial, page: partial.page ?? 1 }, true)
  }

  function reload() {
    void commit(state.value, false)
  }

  watch(
    () => route.fullPath,
    () => {
      if (syncingRoute) return
      const next = readMessagesQuery(route.query)
      if (sameState(next, state.value)) return
      void commit(next, false)
    },
  )

  // 子页(通知/私信)切换会 unmount→remount,SSR 的 initial 可能与当前 URL 不一致 → 对齐一次
  onMounted(() => {
    if (!sameState(state.value, initial.state)) void commit(state.value, false)
  })

  return { displayed, state, pending, update, reload }
}
