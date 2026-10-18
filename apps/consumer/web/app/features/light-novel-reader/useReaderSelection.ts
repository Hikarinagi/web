import type { OverlayAnchor } from '@hina-ui/vue'
import type { Rect } from '@ritojs/core'
import type { ReaderEngine } from './useReaderEngine'

export function useReaderSelection(engine: ReaderEngine, host: Readonly<Ref<HTMLElement | null>>) {
  const rects = shallowRef<readonly Rect[]>([])
  const text = ref('')
  const chapter = ref(true)
  const pressed = ref(false)

  watch(
    engine.stack,
    (stack, _, onCleanup) => {
      rects.value = []
      if (!stack) return
      onCleanup(
        stack.controller.on('selectionChange', event => {
          rects.value = event.hasSelection ? event.viewportRects : []
          if (!event.hasSelection) return
          text.value = event.text
          chapter.value = event.sourceLocator !== null
        }),
      )
    },
    { immediate: true },
  )

  useEventListener(host, 'pointerdown', () => (pressed.value = true), { passive: true })
  useEventListener('pointerup', () => (pressed.value = false), { passive: true })
  useEventListener('pointercancel', () => (pressed.value = false), { passive: true })

  const anchor = computed<OverlayAnchor | null>(() => {
    const stack = engine.stack.value
    const current = rects.value
    if (!stack || pressed.value || !current.length) return null
    return {
      getBoundingClientRect: () => {
        const box = stack.canvas.getBoundingClientRect()
        const scale = stack.controller.renderScale
        const left = Math.min(...current.map(rect => rect.x))
        const top = Math.min(...current.map(rect => rect.y))
        const right = Math.max(...current.map(rect => rect.x + rect.width))
        const bottom = Math.max(...current.map(rect => rect.y + rect.height))
        return new DOMRect(
          box.left + left * scale,
          box.top + top * scale,
          (right - left) * scale,
          (bottom - top) * scale,
        )
      },
      contextElement: stack.canvas,
    }
  })

  return { anchor, text, chapter }
}

export type ReaderSelection = ReturnType<typeof useReaderSelection>
