import type { ApiData } from '@hikarinagi/api-contract/v3'
import type { ReaderEngine } from './useReaderEngine'
import type { ReaderLocation } from './useReaderLocation'
import type { ReaderShell } from './useReaderShell'

export function useReaderEnd(options: {
  volumeId: () => number
  host: Readonly<Ref<HTMLElement | null>>
  engine: ReaderEngine
  location: ReaderLocation
  shell: ReaderShell
  flush: () => Promise<unknown> | undefined
}) {
  const open = ref(false)
  const stats = shallowRef<ApiData<'/api/v3/reader/volumes/{volume_id}/stats', 'get'> | null>()
  let generation = 0
  let armed = false

  function last() {
    const controller = options.engine.stack.value?.controller
    if (!controller || !options.location.laid.value) return false
    return controller.currentSpread >= controller.totalSpreads - 1
  }

  async function load() {
    const id = ++generation
    const volumeId = options.volumeId()
    await options.flush()
    const loaded = await hikariRequest('/api/v3/reader/volumes/{volume_id}/stats', {
      path: { volume_id: volumeId },
      toast: false,
    }).catch(() => null)
    if (id === generation) stats.value = loaded
  }

  function enter() {
    open.value = true
    options.shell.chrome.value = false
    void load()
  }

  function edge(forward: boolean) {
    if (open.value) {
      if (!forward) open.value = false
      return true
    }
    if (!forward || !last()) return false
    enter()
    return true
  }

  useEventListener(options.host, 'touchstart', () => (armed = last()), {
    capture: true,
    passive: true,
  })
  useSwipe(options.host, {
    onSwipeEnd: (_, direction) => {
      const controller = options.engine.stack.value?.controller
      if (direction === 'left' && armed && !open.value && !controller?.hasSelection && last())
        enter()
    },
  })

  watch(options.location.position, () => {
    if (stats.value === undefined && last()) void load()
  })

  watch(
    options.engine.stack,
    (stack, _, onCleanup) => {
      open.value = false
      stats.value = undefined
      generation += 1
      if (!stack) return
      const { controller } = stack
      onCleanup(
        controller.on('spreadChange', ({ spreadIndex }) => {
          if (spreadIndex < controller.totalSpreads - 1) open.value = false
        }),
      )
    },
    { immediate: true },
  )

  return { open, stats, edge, close: () => void (open.value = false) }
}

export type ReaderEnd = ReturnType<typeof useReaderEnd>
