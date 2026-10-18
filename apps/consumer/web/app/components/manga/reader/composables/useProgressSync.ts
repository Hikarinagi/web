interface UseProgressSyncOptions {
  mangaId: number
  chapterId: number
  page: () => number
  authenticated: () => boolean
}

const SYNC_DEBOUNCE_MS = 2000

export function useProgressSync(options: UseProgressSyncOptions) {
  if (import.meta.server) return

  let sent = 0
  let pending: number | null = null
  let timer: number | null = null

  async function put(page: number) {
    if (page === sent) return
    sent = page
    try {
      await hikariRequest<'/api/v3/reader/mangas/{manga_id}/progress', 'put'>(
        '/api/v3/reader/mangas/{manga_id}/progress',
        {
          method: 'put',
          path: { manga_id: options.mangaId },
          body: { chapter_id: options.chapterId, page },
          toast: false,
        },
      )
    } catch {
      /* empty */
    }
  }

  function flush() {
    if (timer !== null) {
      window.clearTimeout(timer)
      timer = null
    }
    if (pending === null) return
    const page = pending
    pending = null
    void put(page)
  }

  function queue(page: number) {
    if (!options.authenticated()) return
    pending = page
    if (timer !== null) return
    timer = window.setTimeout(() => {
      timer = null
      flush()
    }, SYNC_DEBOUNCE_MS)
  }

  watch(options.page, page => queue(page), { immediate: true })

  useEventListener(document, 'visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush()
  })

  onBeforeUnmount(flush)
}
