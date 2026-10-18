import type { ReaderPage } from './useMangaReader'
import { createFileKey, decryptFile } from '~/utils/media/file-crypto'

export type PageLoadStatus = 'idle' | 'loading' | 'ready' | 'error'

interface UsePageLoaderOptions {
  pages: () => ReaderPage[]
  manga: () => number
  chapter: () => number
}

const AHEAD_PAGES = 4
const BEHIND_PAGES = 2
const KEEP_PAGES = 12
const SILENT_RETRY_DELAY_MS = 900

export function usePageLoader(options: UsePageLoaderOptions) {
  if (import.meta.server) {
    return {
      statusOf: (): PageLoadStatus => 'loading',
      imageOf: () => null,
      ensureAround: () => {},
      retry: () => Promise.resolve(),
    }
  }

  const status = reactive(new Map<number, PageLoadStatus>())
  const images = new Map<number, HTMLImageElement>()
  const retried = new Set<number>()
  const pending = new Map<number, AbortController>()
  const retries = new Map<number, ReturnType<typeof setTimeout>>()
  let disposed = false

  function imageOf(pageNumber: number) {
    return images.get(pageNumber) ?? null
  }

  function statusOf(pageNumber: number): PageLoadStatus {
    return status.get(pageNumber) ?? 'idle'
  }

  async function load(pageNumber: number) {
    const current = status.get(pageNumber)
    if (disposed || current === 'loading' || current === 'ready') return
    const page = options.pages().find(page => page.page_number === pageNumber)
    if (!page) return
    const manga = options.manga()
    const chapter = options.chapter()
    const controller = new AbortController()
    pending.set(pageNumber, controller)
    status.set(pageNumber, 'loading')
    let url = ''
    try {
      const key = createFileKey()
      const data = await hikariRequest(
        '/api/v3/reader/mangas/{manga_id}/chapters/{chapter_id}/pages/{id}/content',
        {
          method: 'POST',
          path: { manga_id: manga, chapter_id: chapter, id: page.id },
          body: { p: key },
          signal: controller.signal,
          toast: false,
          responseType: 'arrayBuffer',
          decodeBinary: encrypted =>
            decryptFile(`manga:page:${manga}:${chapter}:${page.id}`, key, encrypted),
        },
      )
      controller.signal.throwIfAborted()
      url = URL.createObjectURL(new Blob([data], { type: page.mime_type ?? '' }))
      const image = new Image()
      image.decoding = 'async'
      image.src = url
      await image.decode()
      controller.signal.throwIfAborted()
      images.set(pageNumber, image)
      url = ''
      status.set(pageNumber, 'ready')
      retried.delete(pageNumber)
    } catch {
      if (controller.signal.aborted) return
      if (retried.has(pageNumber)) {
        status.set(pageNumber, 'error')
        return
      }
      retried.add(pageNumber)
      status.set(pageNumber, 'idle')
      retries.set(
        pageNumber,
        setTimeout(() => {
          retries.delete(pageNumber)
          void load(pageNumber)
        }, SILENT_RETRY_DELAY_MS),
      )
    } finally {
      if (url) URL.revokeObjectURL(url)
      if (pending.get(pageNumber) === controller) pending.delete(pageNumber)
    }
  }

  async function retry(pageNumber: number) {
    if (pending.has(pageNumber)) return
    retried.delete(pageNumber)
    clearTimeout(retries.get(pageNumber))
    retries.delete(pageNumber)
    status.set(pageNumber, 'idle')
    await load(pageNumber)
  }

  function ensureAround(pageNumbers: number[]) {
    if (!pageNumbers.length) return
    const all = options.pages().map(page => page.page_number)
    const min = Math.min(...pageNumbers)
    const max = Math.max(...pageNumbers)
    const wanted = all.filter(n => n >= min - BEHIND_PAGES && n <= max + AHEAD_PAGES)
    for (const [pageNumber, controller] of pending) {
      if (wanted.includes(pageNumber)) continue
      controller.abort()
      pending.delete(pageNumber)
      status.set(pageNumber, 'idle')
    }
    for (const [pageNumber, timer] of retries) {
      if (wanted.includes(pageNumber)) continue
      clearTimeout(timer)
      retries.delete(pageNumber)
    }
    for (const pageNumber of wanted) void load(pageNumber)
    if (images.size <= KEEP_PAGES) return
    const anchor = (min + max) / 2
    const evictable = [...images.keys()]
      .filter(n => n < min - BEHIND_PAGES || n > max + AHEAD_PAGES)
      .sort((a, b) => Math.abs(b - anchor) - Math.abs(a - anchor))
    for (const pageNumber of evictable.slice(0, images.size - KEEP_PAGES)) {
      URL.revokeObjectURL(images.get(pageNumber)!.src)
      images.delete(pageNumber)
      status.set(pageNumber, 'idle')
    }
  }

  function clear() {
    for (const controller of pending.values()) controller.abort()
    for (const timer of retries.values()) clearTimeout(timer)
    for (const image of images.values()) URL.revokeObjectURL(image.src)
    pending.clear()
    retries.clear()
    images.clear()
    retried.clear()
    status.clear()
  }

  watch(() => `${options.manga()}:${options.chapter()}`, clear)
  onScopeDispose(() => {
    disposed = true
    clear()
  })

  return { statusOf, imageOf, ensureAround, retry }
}
