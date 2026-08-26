import type { Ref } from 'vue'
import type { useStageZoom } from './useStageZoom'

interface UseStageGesturesOptions {
  viewport: Ref<HTMLElement | null>
  canGoNext: () => boolean
  canGoPrevious: () => boolean
  /** `false` turns the page on release without dragging or animating it. */
  animate: () => boolean
  /** `true` when the page is shown whole and pan/zoom owns the surface. */
  zoomable: () => boolean
  zoom: ReturnType<typeof useStageZoom>
  next: () => void
  previous: () => void
  onTap: (event: PointerEvent) => void
}

const TRANSITION_MS = 260
const DRAG_COMMIT_RATIO = 0.16
const DRAG_COMMIT_VELOCITY = 0.55
const DRAG_COMMIT_MIN_PX = 28
const AXIS_LOCK_PX = 6
const TAP_MAX_MOVEMENT = 8
const TAP_MAX_DURATION_MS = 350
/** A second tap inside this window is a zoom gesture, not two toggles. */
const DOUBLE_TAP_MS = 280
const DOUBLE_TAP_MAX_DISTANCE = 32

type Commit = 'next' | 'previous' | null
type Mode = 'idle' | 'pinch' | 'pan' | 'page'

export function useStageGestures(options: UseStageGesturesOptions) {
  const dragX = ref(0)
  const animating = ref(false)

  const pointers = new Map<number, { x: number; y: number }>()
  let primaryId: number | null = null
  let mode: Mode = 'idle'
  let startX = 0
  let startY = 0
  let startedAt = 0
  /** Where the paging drag began — reset when a pan hands over mid-gesture. */
  let pageStartX = 0
  let lastX = 0
  let lastY = 0
  let lastT = 0
  let velocity = 0
  let axis: 'x' | 'y' | null = null
  /** Set when the gesture already meant something other than a tap. */
  let tapSuppressed = false
  let lastTapAt = 0
  let lastTapX = 0
  let lastTapY = 0
  let tapTimer: number | null = null

  const trackStyle = computed(() => ({
    transform: `translate3d(${dragX.value}px, 0, 0)`,
    transition: animating.value
      ? `transform ${TRANSITION_MS}ms cubic-bezier(0.22, 0.61, 0.36, 1)`
      : 'none',
  }))

  function viewportWidth() {
    return options.viewport.value?.clientWidth ?? window.innerWidth
  }

  function clearTapTimer() {
    if (tapTimer === null) return
    window.clearTimeout(tapTimer)
    tapTimer = null
  }

  function axisFor(dx: number, dy: number) {
    if (Math.abs(dx) < AXIS_LOCK_PX && Math.abs(dy) < AXIS_LOCK_PX) return null
    return Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y'
  }

  function commitFor(dx: number): Commit {
    const width = viewportWidth()
    if (dx > 0) {
      const commit =
        dx > width * DRAG_COMMIT_RATIO ||
        (dx > DRAG_COMMIT_MIN_PX && velocity > DRAG_COMMIT_VELOCITY)
      return commit && options.canGoNext() ? 'next' : null
    }
    const commit =
      dx < -width * DRAG_COMMIT_RATIO ||
      (dx < -DRAG_COMMIT_MIN_PX && velocity < -DRAG_COMMIT_VELOCITY)
    return commit && options.canGoPrevious() ? 'previous' : null
  }

  function settle(commit: Commit) {
    if (!options.animate()) {
      dragX.value = 0
      if (commit === 'next') options.next()
      else if (commit === 'previous') options.previous()
      return
    }
    const width = viewportWidth()
    animating.value = true
    dragX.value = commit === 'next' ? width : commit === 'previous' ? -width : 0
    window.setTimeout(() => {
      if (commit === 'next') options.next()
      else if (commit === 'previous') options.previous()
      animating.value = false
      dragX.value = 0
    }, TRANSITION_MS)
  }

  function twoPointers() {
    const [a, b] = [...pointers.values()]
    return a && b ? ([a, b] as const) : null
  }

  function beginDrag(event: PointerEvent) {
    primaryId = event.pointerId
    startX = pageStartX = lastX = event.clientX
    startY = lastY = event.clientY
    startedAt = lastT = performance.now()
    velocity = 0
    axis = null
    tapSuppressed = false
    mode = 'idle'
  }

  function onPointerDown(event: PointerEvent) {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })

    const pair = twoPointers()
    if (pointers.size === 2 && pair && options.zoomable()) {
      // A second finger converts the gesture into a pinch; any paging drag
      // already in flight snaps back rather than committing a half-turn.
      if (mode === 'page') settle(null)
      mode = 'pinch'
      primaryId = null
      options.zoom.beginPinch(pair[0], pair[1])
      return
    }
    if (pointers.size !== 1 || animating.value) return
    beginDrag(event)
  }

  /**
   * `touch-action: none` covers the zoomable layout, but the scrolling layouts
   * still run `pan-y`, where the browser can steal an ambiguous drag and cancel
   * our pointer stream. Claiming the first horizontal touchmove keeps it ours.
   */
  function onTouchMove(event: TouchEvent) {
    if (options.zoomable() || primaryId === null || event.touches.length !== 1) return
    const touch = event.touches[0]
    if (!touch) return
    const resolved = axis ?? axisFor(touch.clientX - startX, touch.clientY - startY)
    if (resolved !== 'x') return
    if (event.cancelable) event.preventDefault()
  }

  function onPointerMove(event: PointerEvent) {
    if (!pointers.has(event.pointerId)) return
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })

    if (mode === 'pinch') {
      const pair = twoPointers()
      if (pair) options.zoom.updatePinch(pair[0], pair[1])
      return
    }
    if (event.pointerId !== primaryId) return

    const dx = event.clientX - startX
    const dy = event.clientY - startY
    if (!axis) {
      const resolved = axisFor(dx, dy)
      if (!resolved) return
      axis = resolved
      // A zoomed-in page keeps the drag until it runs out of room to pan.
      const pans = axis === 'y' ? options.zoom.zoomed.value : options.zoom.canPan(dx)
      mode = pans ? 'pan' : 'page'
      if (mode === 'page') pageStartX = event.clientX
      if (mode === 'page' && axis === 'x')
        options.viewport.value?.setPointerCapture(event.pointerId)
    }

    const stepX = event.clientX - lastX
    const stepY = event.clientY - lastY
    const now = performance.now()
    if (now > lastT) velocity = stepX / (now - lastT)
    lastX = event.clientX
    lastY = event.clientY
    lastT = now

    if (mode === 'pan') {
      const used = options.zoom.panBy(stepX, stepY)
      // Exhausted the pan on the horizontal axis — hand the rest to paging.
      if (axis === 'x' && Math.abs(used.x) < Math.abs(stepX) - 0.5) {
        mode = 'page'
        pageStartX = event.clientX
        options.viewport.value?.setPointerCapture(event.pointerId)
      }
      return
    }
    if (mode !== 'page' || axis === 'y') return

    if (!options.animate()) return
    const pageDx = event.clientX - pageStartX
    const blockedNext = pageDx > 0 && !options.canGoNext()
    const blockedPrevious = pageDx < 0 && !options.canGoPrevious()
    dragX.value = blockedNext || blockedPrevious ? pageDx * 0.25 : pageDx
  }

  function handleTap(event: PointerEvent) {
    const now = performance.now()
    const isDouble =
      options.zoomable() &&
      now - lastTapAt < DOUBLE_TAP_MS &&
      Math.hypot(event.clientX - lastTapX, event.clientY - lastTapY) <= DOUBLE_TAP_MAX_DISTANCE

    if (isDouble) {
      clearTapTimer()
      lastTapAt = 0
      options.zoom.toggleAt({ x: event.clientX, y: event.clientY })
      return
    }

    lastTapAt = now
    lastTapX = event.clientX
    lastTapY = event.clientY
    if (!options.zoomable()) {
      options.onTap(event)
      return
    }
    // Hold the toggle back long enough to tell a single tap from a double one.
    clearTapTimer()
    tapTimer = window.setTimeout(() => {
      tapTimer = null
      options.onTap(event)
    }, DOUBLE_TAP_MS)
  }

  function endPrimary(event: PointerEvent, cancelled: boolean) {
    const wasMode = mode
    const dx = event.clientX - startX
    const dy = event.clientY - startY
    const duration = performance.now() - startedAt
    primaryId = null
    mode = 'idle'

    if (wasMode === 'page') {
      settle(commitFor(cancelled ? lastX - pageStartX : event.clientX - pageStartX))
      return
    }
    dragX.value = 0
    if (wasMode === 'pan' || cancelled || tapSuppressed) return
    if (
      Math.abs(dx) <= TAP_MAX_MOVEMENT &&
      Math.abs(dy) <= TAP_MAX_MOVEMENT &&
      duration <= TAP_MAX_DURATION_MS
    ) {
      handleTap(event)
    }
  }

  function releasePointer(event: PointerEvent, cancelled: boolean) {
    if (!pointers.delete(event.pointerId)) return

    if (mode === 'pinch') {
      options.zoom.endPinch()
      mode = 'idle'
      // One finger still down: restart a drag from it so nothing jumps.
      const [remaining] = [...pointers.entries()]
      if (remaining) {
        primaryId = remaining[0]
        startX = pageStartX = lastX = remaining[1].x
        startY = lastY = remaining[1].y
        startedAt = lastT = performance.now()
        velocity = 0
        axis = null
        // Lifting the finger that survived a pinch is not a tap.
        tapSuppressed = true
      }
      return
    }
    if (event.pointerId !== primaryId) return
    endPrimary(event, cancelled)
  }

  function onPointerUp(event: PointerEvent) {
    releasePointer(event, false)
  }

  function onPointerCancel(event: PointerEvent) {
    releasePointer(event, true)
  }

  useEventListener(options.viewport, 'touchmove', onTouchMove, { passive: false })
  onBeforeUnmount(clearTapTimer)

  return {
    dragX,
    animating,
    trackStyle,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
  }
}
