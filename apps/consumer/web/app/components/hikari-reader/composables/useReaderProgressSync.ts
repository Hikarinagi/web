import type { TocEntry, Reader } from '@ritojs/core'
import type { ReadingPosition } from '@ritojs/kit'
import type { ShallowRef } from 'vue'
import { onBeforeUnmount, watch } from 'vue'
import { toBackendPosition } from '../lib/storage'

const DEBOUNCE_MS = 600
const FLUSH_MIN_INTERVAL_MS = 200

interface ProgressPayload {
  fingerprint: string
  position: ReadingPosition
  chapterIndex?: number
  currentChapterHref?: string
  currentChapterTitle?: string
}

interface UseReaderProgressSyncOptions {
  volumeId: number
  reader: ShallowRef<Reader | null>
  currentPosition: ShallowRef<ReadingPosition | null>
  durationTracker: {
    consume: () => number
  }
}

export function useReaderProgressSync(options: UseReaderProgressSyncOptions) {
  let pending: ProgressPayload | null = null
  let timer: ReturnType<typeof setTimeout> | null = null
  let inflight: Promise<void> | null = null
  let lastFlushAt = 0
  let lastFingerprint: string | null = null

  function stage() {
    const position = options.currentPosition.value
    if (!position) return
    const fingerprint = JSON.stringify(position)
    if (fingerprint === lastFingerprint && !pending) return

    const reader = options.reader.value
    let chapterEntry: TocEntry | undefined
    let chapterIndex: number | undefined
    if (reader) {
      chapterEntry = reader.findActiveTocEntry(position.projection.pageIndex)
      if (chapterEntry) chapterIndex = flatTocIndex(reader.toc, chapterEntry)
    }

    pending = {
      fingerprint,
      position,
      chapterIndex,
      currentChapterHref: chapterEntry?.href,
      currentChapterTitle: chapterEntry?.label,
    }

    scheduleFlush()
  }

  function scheduleFlush() {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      void flush()
    }, DEBOUNCE_MS)
  }

  async function flush() {
    if (!pending) return
    const now = Date.now()
    if (inflight) {
      await inflight
    }
    if (!pending) return

    const payload = pending
    pending = null
    lastFlushAt = now
    lastFingerprint = payload.fingerprint

    inflight = sendProgress(options.volumeId, payload, options.durationTracker.consume()).finally(
      () => {
        inflight = null
      },
    )
    await inflight
  }

  function flushSync() {
    if (!pending) return
    if (
      Date.now() - lastFlushAt < FLUSH_MIN_INTERVAL_MS &&
      lastFingerprint === pending.fingerprint
    ) {
      pending = null
      return
    }
    const payload = pending
    pending = null
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    void sendProgress(options.volumeId, payload, options.durationTracker.consume()).catch(() => {})
  }

  watch(
    () => options.currentPosition.value,
    position => {
      if (!position) return
      stage()
    },
  )

  function handlePageHide() {
    flushSync()
  }

  function handleBeforeUnload() {
    flushSync()
  }

  if (import.meta.client) {
    window.addEventListener('pagehide', handlePageHide)
    window.addEventListener('beforeunload', handleBeforeUnload)
  }

  onBeforeUnmount(() => {
    flushSync()
    if (import.meta.client) {
      window.removeEventListener('pagehide', handlePageHide)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  })

  return { flush, flushSync, stage }
}

async function sendProgress(volumeId: number, payload: ProgressPayload, durationMs: number) {
  try {
    await hikariRequest('/api/v3/reader/volumes/{volume_id}/progress', {
      method: 'patch',
      path: { volume_id: volumeId },
      body: {
        percentage: Math.round(payload.position.progress * 10000) / 100,
        position: toBackendPosition(payload.position),
        current_chapter_index: payload.chapterIndex,
        current_chapter_href: payload.currentChapterHref,
        current_chapter_title: payload.currentChapterTitle,
        duration_ms: durationMs > 0 ? durationMs : undefined,
      },
      toast: false,
    })
  } catch {
    return
  }
}

function flatTocIndex(toc: readonly TocEntry[], target: TocEntry) {
  let counter = 0
  function walk(items: readonly TocEntry[]): number | undefined {
    for (const item of items) {
      if (item === target || item.href === target.href) return counter
      counter += 1
      if (item.children.length) {
        const found = walk(item.children)
        if (found !== undefined) return found
      }
    }
    return undefined
  }
  return walk(toc)
}
