import type { ReadingPosition } from '@ritojs/kit'
import { positionOf } from './payload'

const IDLE_MS = 5 * 60 * 1000

interface StagedProgress {
  volumeId: number
  position: ReadingPosition
  chapter: { index?: number; href?: string; title?: string }
}

export function useReaderSync(options: {
  volumeId: () => number
  position: Readonly<Ref<ReadingPosition | null>>
  chapter: () => StagedProgress['chapter']
}) {
  let staged: StagedProgress | null = null
  let last: StagedProgress | null = null
  let timer: ReturnType<typeof setTimeout> | undefined
  let active = 0
  let lastInput = Date.now()
  let visible = true

  function tick() {
    const now = Date.now()
    if (visible) active += Math.min(now - lastInput, IDLE_MS)
    lastInput = now
  }

  function send(keepalive: boolean) {
    if (timer) clearTimeout(timer)
    timer = undefined
    tick()
    const idle = last?.volumeId === options.volumeId() && active >= 1000 ? last : null
    const progress = staged ?? idle
    if (!progress) return
    staged = null
    last = progress
    const duration = active
    active = 0
    return hikariRequest('/api/v3/reader/volumes/{volume_id}/progress', {
      method: 'patch',
      path: { volume_id: progress.volumeId },
      body: {
        percentage: Math.round(progress.position.progress * 10000) / 100,
        position: positionOf(progress.position),
        current_chapter_index: progress.chapter.index,
        current_chapter_href: progress.chapter.href,
        current_chapter_title: progress.chapter.title,
        duration_ms: duration > 0 ? duration : undefined,
      },
      keepalive,
      toast: false,
    }).catch(() => {
      active += duration
      staged ??= progress
    })
  }

  watch(options.position, position => {
    if (!position) return
    tick()
    if (staged && staged.volumeId !== options.volumeId()) send(false)
    staged = { volumeId: options.volumeId(), position, chapter: options.chapter() }
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => send(false), 600)
  })

  useEventListener(document, 'visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      tick()
      visible = false
      send(true)
    } else {
      visible = true
      lastInput = Date.now()
    }
  })
  useEventListener(window, 'pagehide', () => send(true))
  useEventListener(document, 'pointerdown', tick, { passive: true })
  useEventListener(document, 'keydown', tick, { passive: true })

  onBeforeUnmount(() => send(true))

  return { flush: () => send(false) }
}
