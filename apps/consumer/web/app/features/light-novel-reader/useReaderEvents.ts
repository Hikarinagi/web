import { toast } from '@hina-ui/vue'
import type { FootnoteEntry, Rect } from '@ritojs/core'
import type { ReaderEngine } from './useReaderEngine'
import type { ReaderHighlights } from './useReaderHighlights'
import type { ReaderJumps } from './useReaderJumps'
import type { ReaderShell } from './useReaderShell'

export function useReaderEvents(options: {
  engine: ReaderEngine
  host: Readonly<Ref<HTMLElement | null>>
  shell: ReaderShell
  jumps: ReaderJumps
  highlights: ReaderHighlights
}) {
  const { engine, host, shell, jumps, highlights } = options
  const footnote = shallowReactive({
    open: false,
    entry: null as FootnoteEntry | null,
    x: 0,
    y: 0,
  })
  const picture = shallowRef<{ src: string; alt: string; bounds: Rect } | null>(null)
  const { confirm } = useHikariConfirm()
  let point = { x: 0, y: 0 }

  useEventListener(
    host,
    'pointerdown',
    (event: PointerEvent) => (point = { x: event.clientX, y: event.clientY }),
    { capture: true, passive: true },
  )

  watch(
    engine.stack,
    (stack, _, onCleanup) => {
      footnote.open = false
      picture.value = null
      if (!stack) return
      const { controller } = stack
      let chrome = true
      shell.chrome.value = true
      const offs = [
        controller.on('transitionStart', () => {
          chrome = shell.chrome.value
          shell.chrome.value = false
          footnote.open = false
          highlights.inspector.open = false
        }),
        controller.on('transitionEnd', ({ outcome }) => {
          if (outcome === 'cancelled') shell.chrome.value = chrome
        }),
        controller.on('selectionChange', ({ hasSelection }) => {
          if (hasSelection) shell.chrome.value = false
        }),
        controller.on('annotationClick', ({ annotation, screenBounds: { x, y, width, height } }) =>
          highlights.inspect(annotation.id, {
            getBoundingClientRect: () => new DOMRect(x, y, width, height),
            contextElement: stack.canvas,
          }),
        ),
        controller.on('annotationHover', ({ annotation }) => {
          if (host.value) host.value.style.cursor = annotation ? 'pointer' : ''
        }),
        controller.on('linkClick', ({ href, type, navigate }) => {
          if (type === 'internal') {
            jumps.remember()
            navigate()
            return
          }
          confirm({
            title: '打开外部链接',
            description: href,
            confirmText: '打开',
            onConfirm: () => window.open(href, '_blank', 'noopener,noreferrer'),
          })
        }),
        controller.on('footnoteClick', ({ content }) => {
          Object.assign(footnote, { open: true, entry: content, ...point })
        }),
        controller.on('imageClick', ({ blobUrl, alt, screenBounds }) => {
          picture.value = { src: blobUrl, alt, bounds: screenBounds }
        }),
        controller.on('error', ({ source }) => {
          if (source === 'annotation-target') toast.danger('这段文字无法高亮')
        }),
      ]
      onCleanup(() => offs.forEach(off => off()))
    },
    { immediate: true },
  )

  return { footnote, picture }
}

export type ReaderEvents = ReturnType<typeof useReaderEvents>
