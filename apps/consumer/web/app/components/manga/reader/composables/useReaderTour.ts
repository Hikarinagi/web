import type { Ref } from 'vue'
import { useReaderEducation } from '~/components/reader/composables/useReaderEducation'
import type ReaderBottom from '../bar/Bottom.vue'
import type ReaderTop from '../bar/Top.vue'
import type ReaderScrollStage from '../ScrollStage.vue'
import type ReaderStage from '../Stage.vue'
import { MANGA_READER_TOUR_KEY } from '../lib/tour'
import type { MangaTourDemo, MangaTourTurn } from '../lib/tour-plays'
import type { useReaderChrome } from './useReaderChrome'
import type { useReaderTools } from './useReaderTools'
import type { useReaderView } from './useReaderView'

interface UseReaderTourOptions {
  view: ReturnType<typeof useReaderView>
  chrome: ReturnType<typeof useReaderChrome>
  tools: ReturnType<typeof useReaderTools>
  stage: Readonly<Ref<InstanceType<typeof ReaderStage> | null>>
  scrollStage: Readonly<Ref<InstanceType<typeof ReaderScrollStage> | null>>
  top: Readonly<Ref<InstanceType<typeof ReaderTop> | null>>
  bottom: Readonly<Ref<InstanceType<typeof ReaderBottom> | null>>
}

const EDGE = 8
const PREVIEW_ROOM = 190

export function useReaderTour(options: UseReaderTourOptions) {
  const { view, chrome, tools, stage, scrollStage, top, bottom } = options
  const { reader, loader, paged } = view
  const education = useReaderEducation(MANGA_READER_TOUR_KEY)
  const motion = usePreferredReducedMotion()
  const open = ref(false)

  watchEffect(() => {
    if (!education.visible.value) open.value = false
    else if (loader.statusOf(view.visiblePage.value) === 'ready') open.value = true
  })

  const calm = () => motion.value === 'reduce'

  function canTurn(delta: MangaTourTurn) {
    const index = reader.currentIndex.value
    return delta === 1 ? !!reader.spreads.value[index + 1]?.pages.length : index > 0
  }

  function turn(delta: MangaTourTurn) {
    if (delta === 1) reader.next()
    else reader.previous()
  }

  function viewport() {
    return scrollStage.value?.viewport() ?? null
  }

  function clip(box: DOMRect | undefined) {
    if (!box) return null
    const upper = Math.max(box.top, EDGE)
    const lower = Math.min(box.bottom, window.innerHeight - EDGE)
    return { left: box.left, top: upper, width: box.width, height: Math.max(0, lower - upper) }
  }

  const demo: MangaTourDemo = {
    canTurn,
    turn,
    pull: dx => {
      if (!calm()) stage.value?.pull(dx)
    },
    release: delta => {
      const commit = canTurn(delta) ? (delta === 1 ? 'next' : 'previous') : null
      if (!calm()) {
        stage.value?.settle(commit)
        return
      }
      stage.value?.cancel()
      if (commit) turn(delta)
    },
    zoomAt: point => stage.value?.zoomAt(point, !calm()),
    pan: (dx, dy) => {
      stage.value?.panBy(dx, dy)
    },
    scroll: (dy, smooth) =>
      viewport()?.scrollBy({ top: dy, behavior: smooth && !calm() ? 'smooth' : 'instant' }),
    chrome: visible => {
      if (!visible) {
        tools.settingsOpen.value = false
        demo.jump(false)
      }
      chrome.visible.value = visible
    },
    scrub: page => bottom.value?.pager?.preview(page),
    thumb: page => bottom.value?.pager?.pointAt(page) ?? null,
    pageAt: x => bottom.value?.pager?.pageAt(x) ?? null,
    current: () => Math.max(1, ...view.shown.value),
    total: () => reader.totalPages.value,
    jump: value => {
      const pager = bottom.value?.pager
      if (pager) pager.jumpOpen = value
    },
    settings: value => {
      tools.settingsAnchor.value = top.value?.settingsButton() ?? null
      tools.settingsOpen.value = value
    },
    pageBox: () => {
      if (paged.value) return clip(stage.value?.content()?.getBoundingClientRect())
      const column = scrollStage.value?.column()?.getBoundingClientRect()
      return column
        ? {
            left: column.left,
            top: EDGE,
            width: column.width,
            height: window.innerHeight - EDGE * 2,
          }
        : null
    },
    pagerBox: () => {
      const box = bottom.value?.pager?.box()
      if (!box) return null
      const upper = Math.max(EDGE, box.top - PREVIEW_ROOM)
      return { left: box.left, top: upper, width: box.width, height: box.bottom - upper }
    },
    snapshot: () => {
      const page = reader.pageNumber.value
      const scrollTop = viewport()?.scrollTop ?? null
      return () => {
        tools.settingsOpen.value = false
        demo.jump(false)
        demo.scrub(null)
        stage.value?.cancel()
        stage.value?.resetZoom()
        if (paged.value) reader.goToPage(page)
        else if (scrollTop !== null) viewport()?.scrollTo({ top: scrollTop, behavior: 'instant' })
      }
    },
  }

  return { open, demo, replay: education.replay, dismiss: education.dismiss }
}
