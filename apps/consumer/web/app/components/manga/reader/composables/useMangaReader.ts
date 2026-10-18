import type { MangaReadPageData } from '~~/server/api/pages/mangas/reader/[id]/[chapterId].get'
import type { MangaReaderLayout } from '../lib/settings'

export type ReaderPage = MangaReadPageData['manifest']['pages'][number]

export interface ReaderSpread {
  index: number
  pages: ReaderPage[]
}

interface UseMangaReaderOptions {
  pages: () => ReaderPage[]
  layout: () => MangaReaderLayout
  initialPage: number | null
  hasNext: () => boolean
  onEnterInterlude: () => void
  onAdvancePastInterlude: () => void
}

const INTERLUDE_INPUT_LOCK_MS = 300

export function useMangaReader(options: UseMangaReaderOptions) {
  const pageNumber = ref(options.initialPage ?? 1)
  const atInterlude = ref(false)
  let lockedUntil = 0

  const spreads = computed<ReaderSpread[]>(() => {
    const pages = options.pages()
    const groups: ReaderPage[][] = []
    if (options.layout() === 'single') {
      for (const page of pages) groups.push([page])
    } else {
      let buffer: ReaderPage[] = []
      const flush = () => {
        if (buffer.length) {
          groups.push(buffer)
          buffer = []
        }
      }
      pages.forEach((page, index) => {
        const landscape = !!page.width && !!page.height && page.width > page.height
        if (index === 0 || landscape) {
          flush()
          groups.push([page])
          return
        }
        buffer.push(page)
        if (buffer.length === 2) flush()
      })
      flush()
    }
    const list = groups.map((pages, index) => ({ index, pages }))
    list.push({ index: list.length, pages: [] })
    return list
  })

  const totalPages = computed(() => options.pages().length)

  const currentIndex = computed(() => {
    const list = spreads.value
    if (atInterlude.value) return list.length - 1
    const found = list.findIndex(spread =>
      spread.pages.some(page => page.page_number === pageNumber.value),
    )
    return found >= 0 ? found : 0
  })

  const currentSpread = computed(() => spreads.value[currentIndex.value] ?? null)

  const maxVisiblePage = computed(() => {
    if (atInterlude.value) return totalPages.value
    const spread = currentSpread.value
    if (!spread || !spread.pages.length) return pageNumber.value
    return Math.max(...spread.pages.map(page => page.page_number))
  })

  const canGoPrevious = computed(() => currentIndex.value > 0)
  const canGoNext = computed(() =>
    atInterlude.value ? options.hasNext() : currentIndex.value < spreads.value.length - 1,
  )

  function locked() {
    return performance.now() < lockedUntil
  }

  function goToSpread(index: number) {
    const list = spreads.value
    const target = list[Math.max(0, Math.min(index, list.length - 1))]
    if (!target) return
    if (!target.pages.length) {
      if (atInterlude.value) return
      atInterlude.value = true
      lockedUntil = performance.now() + INTERLUDE_INPUT_LOCK_MS
      options.onEnterInterlude()
      return
    }
    atInterlude.value = false
    const first = target.pages[0]
    if (first) pageNumber.value = first.page_number
  }

  function next() {
    if (locked()) return
    if (atInterlude.value) {
      options.onAdvancePastInterlude()
      return
    }
    goToSpread(currentIndex.value + 1)
  }

  function previous() {
    if (locked()) return
    goToSpread(currentIndex.value - 1)
  }

  function goToPage(target: number) {
    const page = options.pages().find(item => item.page_number === target)
    if (!page) return
    atInterlude.value = false
    pageNumber.value = page.page_number
  }

  return {
    spreads,
    currentIndex,
    currentSpread,
    pageNumber,
    atInterlude,
    totalPages,
    maxVisiblePage,
    canGoNext,
    canGoPrevious,
    next,
    previous,
    goToPage,
  }
}
