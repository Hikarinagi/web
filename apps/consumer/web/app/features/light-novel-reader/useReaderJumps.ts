import type { ReadingPosition } from '@ritojs/kit'
import type { ReaderEngine } from './useReaderEngine'
import type { ReaderLocation } from './useReaderLocation'

export function useReaderJumps(engine: ReaderEngine, location: ReaderLocation) {
  const trail = shallowRef<{ position: ReadingPosition; page: number | null }[]>([])
  const turned = ref(0)

  watch(
    engine.stack,
    (stack, _, onCleanup) => {
      trail.value = []
      if (!stack) return
      onCleanup(
        stack.controller.on('spreadChange', () => {
          turned.value += 1
          if (turned.value >= 3) trail.value = []
        }),
      )
    },
    { immediate: true },
  )

  function remember() {
    const stack = engine.stack.value
    const position = location.position.value
    if (!stack || !position) return
    const shown = location.laid.value
      ? stack.controller.spreads[position.projection.spreadIndex]?.pageIndexes[0]
      : undefined
    trail.value = [...trail.value, { position, page: shown == null ? null : shown + 1 }]
    turned.value = -1
  }

  function back() {
    const last = trail.value.at(-1)
    const controller = engine.stack.value?.controller
    if (!last || !controller) return
    trail.value = trail.value.slice(0, -1)
    turned.value = -1
    void controller.goToPosition(last.position)
  }

  const target = computed(() => trail.value.at(-1) ?? null)

  return { target, remember, back }
}

export type ReaderJumps = ReturnType<typeof useReaderJumps>
