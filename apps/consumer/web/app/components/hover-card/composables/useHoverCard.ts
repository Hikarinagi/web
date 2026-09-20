import { ref, type Ref } from 'vue'

export interface HoverCardOpenState<TData> {
  key: string
  anchor: HTMLElement
  load: () => Promise<TData | null>
}

export interface HoverCardController<TData> {
  state: Ref<HoverCardOpenState<TData> | null>
  getCached: (key: string) => TData | undefined
  fetchData: (open: HoverCardOpenState<TData>) => Promise<TData | null>
  cancelHide: () => void
  requestHide: () => void
  hideNow: () => void
}

const SHOW_DELAY_MS = 300
const HIDE_DELAY_MS = 100

export function createHoverCard<TData>() {
  const cache = new Map<string, TData>()
  const inflight = new Map<string, Promise<TData | null>>()

  async function ensure(key: string, load: () => Promise<TData | null>): Promise<TData | null> {
    const cached = cache.get(key)
    if (cached) return cached
    const pending = inflight.get(key)
    if (pending) return pending
    const promise = (async () => {
      try {
        const data = await load()
        if (data) cache.set(key, data)
        return data
      } catch {
        return null
      } finally {
        inflight.delete(key)
      }
    })()
    inflight.set(key, promise)
    return promise
  }

  return createSharedComposable(() => {
    type OpenState = HoverCardOpenState<TData>
    const state: Ref<OpenState | null> = ref(null)
    const pendingShow: Ref<OpenState | null> = ref(null)

    const { start: scheduleShow, stop: cancelShow } = useTimeoutFn(
      () => {
        if (pendingShow.value) state.value = pendingShow.value
        pendingShow.value = null
      },
      SHOW_DELAY_MS,
      { immediate: false },
    )

    const { start: scheduleHide, stop: cancelHide } = useTimeoutFn(
      () => {
        state.value = null
      },
      HIDE_DELAY_MS,
      { immediate: false },
    )

    function clearShowTimer() {
      cancelShow()
      pendingShow.value = null
    }

    function requestShow(open: OpenState) {
      cancelHide()
      if (state.value?.key === open.key) {
        clearShowTimer()
        state.value = open
        return
      }
      clearShowTimer()
      pendingShow.value = open
      scheduleShow()
    }

    function showNow(open: OpenState) {
      clearShowTimer()
      cancelHide()
      state.value = open
    }

    function requestHide() {
      clearShowTimer()
      if (state.value === null) return
      scheduleHide()
    }

    function hideNow() {
      clearShowTimer()
      cancelHide()
      state.value = null
    }

    function hideForAnchor(anchor: HTMLElement) {
      if (pendingShow.value?.anchor === anchor) clearShowTimer()
      if (state.value?.anchor === anchor) hideNow()
    }

    function getCached(key: string): TData | undefined {
      return cache.get(key)
    }

    function fetchData(open: OpenState): Promise<TData | null> {
      return ensure(open.key, open.load)
    }

    function invalidate(key: string, patch?: Partial<TData>) {
      const current = cache.get(key)
      if (current && patch) cache.set(key, { ...current, ...patch })
      else cache.delete(key)
    }

    return {
      state,
      requestShow,
      showNow,
      requestHide,
      hideNow,
      hideForAnchor,
      cancelHide,
      getCached,
      fetchData,
      invalidate,
    }
  })
}
