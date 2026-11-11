import { toast } from '@hina-ui/vue'
import type { FootnoteEntry, ReaderInteractionTarget, ReaderLocator, Rect } from '@ritojs/core'
import type { ReaderEngine } from './useReaderEngine'
import type { ReaderHighlights } from './useReaderHighlights'
import type { ReaderJumps } from './useReaderJumps'
import type { ReaderSearch } from './useReaderSearch'
import type { ReaderShell } from './useReaderShell'

export function useReaderEvents(options: {
  engine: ReaderEngine
  host: Readonly<Ref<HTMLElement | null>>
  shell: ReaderShell
  jumps: ReaderJumps
  highlights: ReaderHighlights
  search: ReaderSearch
}) {
  const { engine, host, shell, jumps, highlights, search } = options
  const footnote = shallowReactive({
    open: false,
    entry: null as FootnoteEntry | null,
    x: 0,
    y: 0,
  })
  const picture = shallowRef<{ src: string; alt: string; bounds: Rect } | null>(null)
  const { confirm } = useHikariConfirm()
  let point = { x: 0, y: 0 }
  let selected = false

  useEventListener(
    host,
    'pointerdown',
    (event: PointerEvent) => {
      point = { x: event.clientX, y: event.clientY }
      selected = Boolean(engine.view.value?.selection)
    },
    { capture: true, passive: true },
  )

  function openExternal(href: string) {
    confirm({
      title: '打开外部链接',
      description: href,
      confirmText: '打开',
      onConfirm: () => window.open(href, '_blank', 'noopener,noreferrer'),
    })
  }

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
          openExternal(href)
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

  watchEffect(() =>
    engine.view.value?.setHighlights([...highlights.layers.value, ...search.layers.value]),
  )

  watch(
    engine.view,
    (view, _, onCleanup) => {
      const stack = engine.stack.value
      footnote.open = false
      if (!view || !stack) return
      const { reader, controller } = stack
      let moved: { offset: number; extent: number } | null = null
      let image: string | undefined
      const place = () => void highlights.place(reader, controller.annotations)
      const follow = (locator: ReaderLocator | undefined) => {
        if (!locator) return
        jumps.remember()
        void view.scrollToLocator(locator)
      }
      async function showImage(target: ReaderInteractionTarget, pageIndex: number) {
        const bounds = view!.viewRects([{ pageIndex, ...target.bounds }])[0]
        const src = await reader.getImageBlobUrl(target.imageSrc!)
        if (!src || !bounds) return
        if (image) URL.revokeObjectURL(image)
        image = src
        const canvas = view!.canvas.getBoundingClientRect()
        picture.value = {
          src,
          alt: target.imageAlt ?? '',
          bounds: { ...bounds, x: canvas.left + bounds.x, y: canvas.top + bounds.y },
        }
      }
      async function showFootnote(target: ReaderInteractionTarget) {
        const entry = await reader.interactions?.getFootnote(target.footnoteKey!).catch(() => null)
        if (entry) Object.assign(footnote, { open: true, entry, ...point })
        else follow(target.targetLocator)
      }
      place()
      const offs = [
        view.on('rest', place),
        reader.onLayoutCommitted(place),
        controller.on('annotationsChange', ({ annotations }) =>
          highlights.redraw(reader, annotations),
        ),
        controller.on('error', ({ source }) => {
          if (source === 'annotation-target') toast.danger('这段文字无法高亮')
        }),
        view.on('scroll', ({ offset, extent }) => {
          const still = !moved || moved.extent !== extent || Math.abs(offset - moved.offset) <= 1
          moved = { offset, extent }
          if (still) return
          shell.chrome.value = false
          footnote.open = false
          highlights.inspector.open = false
        }),
        view.on('selection', ({ range }) => {
          if (range) shell.chrome.value = false
        }),
        view.on('highlightHover', ({ highlight }) => {
          if (host.value)
            host.value.style.cursor = highlight?.id.startsWith('annotation:') ? 'pointer' : ''
        }),
        view.on('tap', ({ point: at, target, highlight }) => {
          if (selected) return
          if (highlight?.id.startsWith('annotation:')) {
            const { x, y, width, height } = highlight.bounds
            highlights.inspect(highlight.id.slice('annotation:'.length), {
              getBoundingClientRect: () => new DOMRect(x, y, width, height),
              contextElement: view.canvas,
            })
            return
          }
          if (target?.kind === 'image' && target.imageSrc) {
            void showImage(target, at.pageIndex)
            return
          }
          if (target?.kind === 'footnote' && target.footnoteKey) {
            void showFootnote(target)
            return
          }
          if (target?.targetLocator) {
            follow(target.targetLocator)
            return
          }
          if (target?.href && /^(https?:|mailto:|tel:|\/\/)/i.test(target.href)) {
            openExternal(target.href)
            return
          }
          if (shell.phone.value) shell.chrome.value = !shell.chrome.value
        }),
      ]
      onCleanup(() => {
        offs.forEach(off => off())
        if (image) URL.revokeObjectURL(image)
      })
    },
    { immediate: true },
  )

  return { footnote, picture }
}

export type ReaderEvents = ReturnType<typeof useReaderEvents>
