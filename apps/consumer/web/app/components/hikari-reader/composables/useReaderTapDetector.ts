import type { Ref } from 'vue'

const TAP_MAX_DISTANCE = 10
const TAP_MAX_DURATION = 320

interface UseReaderTapDetectorOptions {
  isCoarsePointer: Ref<boolean>
  isLoaded: Ref<boolean>
  toggle: () => void
  consumeSuppressedTap?: () => boolean
  shouldIgnoreTapStart?: () => boolean
}

/**
 * Distinguish a "tap" from a swipe / long-press on the reader surface.
 * Tap = touch/pointer up within 320ms and < 10px from start,
 * not on any UI overlay (`[data-reader-ui]`) or context menu.
 *
 * Touch uses bubbling `touchend` so Rito's canvas-level content interactions
 * can run first and suppress toolbar toggling for images / links / footnotes.
 */
export function useReaderTapDetector(options: UseReaderTapDetectorOptions) {
  let pointerStart: { x: number; y: number; time: number; pointerId: number } | null = null
  let touchStart: { x: number; y: number; time: number; identifier: number } | null = null

  function onPointerDown(event: PointerEvent) {
    if (!options.isCoarsePointer.value) return
    if (event.pointerType === 'touch') return
    if (options.shouldIgnoreTapStart?.()) {
      pointerStart = null
      return
    }
    pointerStart = {
      x: event.clientX,
      y: event.clientY,
      time: event.timeStamp,
      pointerId: event.pointerId,
    }
  }

  function onPointerUp(event: PointerEvent) {
    if (!options.isCoarsePointer.value) return
    if (event.pointerType === 'touch') return
    const start = pointerStart
    pointerStart = null
    if (!start || start.pointerId !== event.pointerId) return
    maybeToggle({
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
    if (!options.isCoarsePointer.value) return
    if (event.touches.length !== 1) {
      touchStart = null
      return
    }
    const touch = event.touches[0]
    if (!touch) return
    if (options.shouldIgnoreTapStart?.()) {
      touchStart = null
      return
    }
    touchStart = {
      x: touch.clientX,
      y: touch.clientY,
      time: event.timeStamp,
      identifier: touch.identifier,
    }
  }

  function onTouchEnd(event: TouchEvent) {
    if (!options.isCoarsePointer.value) return
    const start = touchStart
    touchStart = null
    if (options.consumeSuppressedTap?.()) return
    if (!start) return
    const touch = Array.from(event.changedTouches).find(
      item => item.identifier === start.identifier,
    )
    if (!touch) return
    maybeToggle({
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

  function maybeToggle(input: {
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
    options.toggle()
  }

  return {
    onPointerDown,
    onPointerUp,
    onPointerCancel,
    onTouchStart,
    onTouchEnd,
    onTouchCancel,
  }
}
