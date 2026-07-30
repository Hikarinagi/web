import type { MaybeRefOrGetter, Ref } from 'vue'
import type { MediaValue } from '../types'

interface Options {
  container: Ref<HTMLElement | null>
  enabled: MaybeRefOrGetter<boolean>
  items: MaybeRefOrGetter<MediaValue[]>
  onPick: (picks: MediaValue[]) => void
}

const DRAG_THRESHOLD = 4

export function useMarqueeSelect({ container, enabled, items, onPick }: Options) {
  const marquee = ref<{ x: number; y: number; w: number; h: number } | null>(null)
  const previewIds = ref(new Set<number>())
  let dragOrigin: { x: number; y: number } | null = null
  let didDrag = false

  function isEnabled() {
    return toValue(enabled)
  }
  function readItems() {
    return toValue(items)
  }

  function onMouseDown(event: MouseEvent) {
    if (!isEnabled() || event.button !== 0) return
    const target = event.target as HTMLElement | null
    if (target?.closest('[data-tile-remove]')) return

    event.preventDefault()
    dragOrigin = { x: event.clientX, y: event.clientY }
    didDrag = false
    marquee.value = null
    previewIds.value = new Set()
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp, { once: true })
  }

  function onMouseMove(event: MouseEvent) {
    if (!dragOrigin || !container.value) return
    const dx = event.clientX - dragOrigin.x
    const dy = event.clientY - dragOrigin.y
    if (!marquee.value && Math.hypot(dx, dy) < DRAG_THRESHOLD) return
    didDrag = true

    const left = Math.min(dragOrigin.x, event.clientX)
    const top = Math.min(dragOrigin.y, event.clientY)
    const right = Math.max(dragOrigin.x, event.clientX)
    const bottom = Math.max(dragOrigin.y, event.clientY)

    const containerRect = container.value.getBoundingClientRect()
    marquee.value = {
      x: left - containerRect.left,
      y: top - containerRect.top,
      w: right - left,
      h: bottom - top,
    }

    const hits = new Set<number>()
    for (const tile of container.value.querySelectorAll<HTMLElement>('[data-media-tile]')) {
      const id = Number(tile.dataset.mediaId)
      if (!Number.isFinite(id)) continue
      const r = tile.getBoundingClientRect()
      if (r.right > left && r.left < right && r.bottom > top && r.top < bottom) {
        hits.add(id)
      }
    }
    previewIds.value = hits
  }

  function onMouseUp() {
    window.removeEventListener('mousemove', onMouseMove)
    if (marquee.value && previewIds.value.size) {
      const ids = previewIds.value
      const picked = readItems().filter(item => ids.has(item.id))
      if (picked.length) onPick(picked)
    }
    dragOrigin = null
    marquee.value = null
    previewIds.value = new Set()
  }

  function onClickCapture(event: MouseEvent) {
    if (didDrag) {
      event.stopPropagation()
      event.preventDefault()
      didDrag = false
    }
  }

  onBeforeUnmount(() => {
    window.removeEventListener('mousemove', onMouseMove)
  })

  return { marquee, previewIds, onMouseDown, onClickCapture }
}
