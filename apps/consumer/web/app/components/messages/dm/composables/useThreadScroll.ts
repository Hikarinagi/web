import type { ComponentPublicInstance } from 'vue'
import type { ThreadMessage } from '~/features/messages/dm'

export function useThreadScroll(opts: {
  messages: () => ThreadMessage[]
  hasMore: () => boolean
  loadingOlder: () => boolean
  peerId: () => number | null
  loadOlder: () => void
}) {
  const scroller = ref<ComponentPublicInstance | null>(null)
  const newCount = ref(0)
  let atBottom = true

  function viewport() {
    return unrefElement(scroller) as HTMLElement | undefined
  }

  function onScroll() {
    const el = viewport()
    if (!el) return
    atBottom = Math.abs(el.scrollTop) < 96
    if (atBottom) newCount.value = 0
    const distanceFromTop = el.scrollHeight - el.clientHeight - Math.abs(el.scrollTop)
    if (distanceFromTop < 120 && opts.hasMore() && !opts.loadingOlder()) opts.loadOlder()
  }

  function toBottom(smooth = false) {
    viewport()?.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' })
    newCount.value = 0
  }

  watch(opts.peerId, () => {
    newCount.value = 0
    atBottom = true
    const el = viewport()
    if (el) el.scrollTop = 0
  })

  watch(
    () => opts.messages().length,
    (len, prev) => {
      const prevLen = prev ?? 0
      if (len <= prevLen) return
      const last = opts.messages()[len - 1]
      if (last?.from_me) toBottom()
      else if (!atBottom) newCount.value += len - prevLen
    },
  )

  return { scroller, newCount, onScroll, toBottom }
}
