import type { Ref } from 'vue'

const TAP_MAX_DISTANCE = 10
const TAP_MAX_DURATION = 320
/**
 * A tap that we handled is followed by the browser's compatibility `click`
 * (touch) or the real `click` (mouse). Anything listening for "pointer went
 * down outside the toolbar" would otherwise immediately undo the toggle.
 */
const GHOST_CLICK_WINDOW = 700

export interface ReaderTapPoint {
  x: number
  y: number
}

interface UseReaderTapDetectorOptions {
  /** Whether taps on the surface are ours to interpret at all. */
  enabled: Ref<boolean>
  isLoaded: Ref<boolean>
  onTap: (point: ReaderTapPoint) => void
  consumeSuppressedTap?: () => boolean
}

/**
 * Distinguish a "tap" from a swipe / long-press on the reader surface.
 * Tap = touch/pointer up within 320ms and < 10px from start,
 * not on any UI overlay (`[data-reader-ui]`) or context menu.
 *
 * Both release handlers must be bound on the bubble phase so Rito's
 * canvas-level content interactions run first and can suppress the tap for
 * images / links / footnotes.
 */
export function useReaderTapDetector(options: UseReaderTapDetectorOptions) {
  let pointerStart: { x: number; y: number; time: number; pointerId: number } | null = null
  let touchStart: { x: number; y: number; time: number; identifier: number } | null = null
  let handledAt = 0

  function onPointerDown(event: PointerEvent) {
    handledAt = 0
    if (!options.enabled.value) return
    if (event.pointerType === 'touch') return
    pointerStart = {
      x: event.clientX,
      y: event.clientY,
      time: event.timeStamp,
      pointerId: event.pointerId,
    }
  }

  function onPointerUp(event: PointerEvent) {
    if (!options.enabled.value) return
    if (event.pointerType === 'touch') return
    const start = pointerStart
    pointerStart = null
    if (options.consumeSuppressedTap?.()) return
    if (!start || start.pointerId !== event.pointerId) return
    maybeTap({
      clientX: event.clientX,
      clientY: event.clientY,
      target: event.target,
      timeStamp: event.timeStamp,
      x: start.x,
      y: start.y,
      time: start.time,
    })
  }

  function onPointerCancel() {
    pointerStart = null
  }

  function onTouchStart(event: TouchEvent) {
    handledAt = 0
    if (!options.enabled.value) return
    if (event.touches.length !== 1) {
      touchStart = null
      return
    }
    const touch = event.touches[0]
    if (!touch) return
    touchStart = {
      x: touch.clientX,
      y: touch.clientY,
      time: event.timeStamp,
      identifier: touch.identifier,
    }
  }

  function onTouchEnd(event: TouchEvent) {
    if (!options.enabled.value) return
    const start = touchStart
    touchStart = null
    if (options.consumeSuppressedTap?.()) return
    if (!start) return
    const touch = Array.from(event.changedTouches).find(
      item => item.identifier === start.identifier,
    )
    if (!touch) return
    maybeTap({
      clientX: touch.clientX,
      clientY: touch.clientY,
      target: event.target,
      timeStamp: event.timeStamp,
      x: start.x,
      y: start.y,
      time: start.time,
    })
  }

  function onTouchCancel() {
    touchStart = null
  }

  function maybeTap(input: {
    clientX: number
    clientY: number
    target: EventTarget | null
    timeStamp: number
    x: number
    y: number
    time: number
  }) {
    if (!options.isLoaded.value) return
    if (input.timeStamp - input.time > TAP_MAX_DURATION) return
    const dx = input.clientX - input.x
    const dy = input.clientY - input.y
    if (Math.hypot(dx, dy) > TAP_MAX_DISTANCE) return
    if (!(input.target instanceof HTMLElement)) return
    if (input.target.closest('[data-reader-ui]')) return
    if (input.target.closest('[data-reader-context-menu]')) return
    handledAt = performance.now()
    options.onTap({ x: input.clientX, y: input.clientY })
  }

  /** True once for the `click` that trails a tap this detector already acted on. */
  function consumeGhostClick() {
    if (!handledAt) return false
    const fresh = performance.now() - handledAt < GHOST_CLICK_WINDOW
    handledAt = 0
    return fresh
  }

  return {
    consumeGhostClick,
    onPointerDown,
    onPointerUp,
    onPointerCancel,
    onTouchStart,
    onTouchEnd,
    onTouchCancel,
  }
}
