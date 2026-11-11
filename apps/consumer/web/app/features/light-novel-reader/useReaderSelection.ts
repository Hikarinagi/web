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

  watch(
    engine.view,
    (view, _, onCleanup) => {
      if (!view) return
      rects.value = []
      let offset = view.offset
      const offs = [
        view.on('selection', event => {
          rects.value = event.range && !event.selecting ? event.rects : []
          if (!event.range) return
          text.value = event.text
          chapter.value = event.range.sourceLocator != null
        }),
        view.on('scroll', event => {
          if (Math.abs(event.offset - offset) < 0.5) return
          offset = event.offset
          rects.value = []
        }),
        view.on('rest', () => {
          if (view.selection) rects.value = view.selectionRects()
        }),
      ]
      onCleanup(() => offs.forEach(off => off()))
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
    const view = engine.view.value
    const canvas = view?.canvas ?? stack.canvas
    return {
      getBoundingClientRect: () => {
        const box = canvas.getBoundingClientRect()
        const scale = view ? 1 : stack.controller.renderScale
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
      contextElement: canvas,
    }
  })

  return { anchor, text, chapter }
}

export type ReaderSelection = ReturnType<typeof useReaderSelection>
