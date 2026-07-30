import type { ReaderPage } from './useMangaReader'

export type PageLoadStatus = 'idle' | 'loading' | 'ready' | 'error'

interface UsePageLoaderOptions {
  pages: () => ReaderPage[]
  refreshUrls: () => Promise<void>
}

const AHEAD_PAGES = 4
const BEHIND_PAGES = 2
const KEEP_PAGES = 12
const SILENT_RETRY_DELAY_MS = 900
const URL_REFRESH_INTERVAL_MS = 15 * 60 * 1000

export function usePageLoader(options: UsePageLoaderOptions) {
  if (import.meta.server) {
    return {
      statusOf: (): PageLoadStatus => 'loading',
      imageOf: () => null,
      ensureAround: () => {},
      retry: () => Promise.resolve(),
    }
  }

  const status = reactive<Record<number, PageLoadStatus>>({})
  const images = new Map<number, HTMLImageElement>()
  const retried = new Set<number>()
  let refreshing: Promise<void> | null = null

  function imageOf(pageNumber: number) {
    return images.get(pageNumber) ?? null
  }

  function statusOf(pageNumber: number): PageLoadStatus {
    return status[pageNumber] ?? 'idle'
  }

  function srcOf(pageNumber: number) {
    return options.pages().find(page => page.page_number === pageNumber)?.src ?? null
  }

  function load(pageNumber: number) {
    const current = status[pageNumber]
    if (current === 'loading' || current === 'ready') return
    const src = srcOf(pageNumber)
    if (!src) return
    status[pageNumber] = 'loading'
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => {
      images.set(pageNumber, image)
      status[pageNumber] = 'ready'
      retried.delete(pageNumber)
    }
    image.onerror = () => {
      if (retried.has(pageNumber)) {
        status[pageNumber] = 'error'
        return
      }
      retried.add(pageNumber)
      status[pageNumber] = 'idle'
      window.setTimeout(() => {
        void refreshUrlsOnce().finally(() => load(pageNumber))
      }, SILENT_RETRY_DELAY_MS)
    }
    image.src = src
  }

  function refreshUrlsOnce() {
    if (!refreshing) {
      refreshing = options.refreshUrls().finally(() => {
        refreshing = null
      })
    }
    return refreshing
  }

  async function retry(pageNumber: number) {
    retried.delete(pageNumber)
    status[pageNumber] = 'idle'
    await refreshUrlsOnce()
    load(pageNumber)
  }

  function ensureAround(pageNumbers: number[]) {
    if (!pageNumbers.length) return
    const all = options.pages().map(page => page.page_number)
    const min = Math.min(...pageNumbers)
    const max = Math.max(...pageNumbers)
    const wanted = all.filter(n => n >= min - BEHIND_PAGES && n <= max + AHEAD_PAGES)
    for (const pageNumber of wanted) load(pageNumber)
    if (images.size <= KEEP_PAGES) return
    const anchor = (min + max) / 2
    const evictable = [...images.keys()]
      .filter(n => n < min - BEHIND_PAGES || n > max + AHEAD_PAGES)
      .sort((a, b) => Math.abs(b - anchor) - Math.abs(a - anchor))
    for (const pageNumber of evictable.slice(0, images.size - KEEP_PAGES)) {
      images.delete(pageNumber)
      status[pageNumber] = 'idle'
    }
  }

  useIntervalFn(() => {
    void refreshUrlsOnce()
  }, URL_REFRESH_INTERVAL_MS)

  return { statusOf, imageOf, ensureAround, retry }
}
