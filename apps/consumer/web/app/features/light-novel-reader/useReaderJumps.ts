import type { ReadingPosition } from '@ritojs/kit'
import type { ReaderEngine } from './useReaderEngine'
import type { ReaderLocation } from './useReaderLocation'

export function useReaderJumps(engine: ReaderEngine, location: ReaderLocation) {
  const trail = shallowRef<{ position: ReadingPosition; page: number | null }[]>([])
  const turned = ref(0)

  function moved() {
    turned.value += 1
    if (turned.value >= 3) trail.value = []
  }

  watch(
    engine.stack,
    (stack, _, onCleanup) => {
      trail.value = []
      if (!stack) return
      onCleanup(stack.controller.on('spreadChange', moved))
    },
    { immediate: true },
  )
  watch(
    engine.view,
    (view, _, onCleanup) => {
      if (view) onCleanup(view.on('window', moved))
    },
    { immediate: true },
  )

  function remember() {
    const position = location.position.value
    if (!engine.stack.value || !position) return
    const shown = location.laid.value
      ? engine.spreads()[position.projection.spreadIndex]?.pageIndexes[0]
      : undefined
    trail.value = [...trail.value, { position, page: shown == null ? null : shown + 1 }]
    turned.value = -1
  }

  function back() {
    const last = trail.value.at(-1)
    if (!last || !engine.stack.value) return
    trail.value = trail.value.slice(0, -1)
    turned.value = -1
    void engine.goTo(last.position)
  }

  const target = computed(() => trail.value.at(-1) ?? null)

  return { target, remember, back }
}

export type ReaderJumps = ReturnType<typeof useReaderJumps>
