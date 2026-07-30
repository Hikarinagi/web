import type { Ref } from 'vue'

interface UseStageGesturesOptions {
  viewport: Ref<HTMLElement | null>
  canGoNext: () => boolean
  canGoPrevious: () => boolean
  next: () => void
  previous: () => void
  onTap: (event: PointerEvent) => void
  onLongPress: () => void
}

const TRANSITION_MS = 260
const DRAG_COMMIT_RATIO = 0.16
const DRAG_COMMIT_VELOCITY = 0.55
const DRAG_COMMIT_MIN_PX = 28
const TAP_MAX_MOVEMENT = 8
const TAP_MAX_DURATION_MS = 350
const LONG_PRESS_MS = 480

export function useStageGestures(options: UseStageGesturesOptions) {
  const dragX = ref(0)
  const animating = ref(false)

  let pointerId: number | null = null
  let startX = 0
  let startY = 0
  let startedAt = 0
  let lastX = 0
  let lastT = 0
  let velocity = 0
  let axis: 'x' | 'y' | null = null
  let dragged = false
  let longPressTimer: number | null = null
  let longPressFired = false

  const trackStyle = computed(() => ({
    transform: `translate3d(${dragX.value}px, 0, 0)`,
    transition: animating.value
      ? `transform ${TRANSITION_MS}ms cubic-bezier(0.22, 0.61, 0.36, 1)`
      : 'none',
  }))

  function viewportWidth() {
    return options.viewport.value?.clientWidth ?? window.innerWidth
  }

  function clearLongPress() {
    if (longPressTimer === null) return
    window.clearTimeout(longPressTimer)
    longPressTimer = null
  }

  function settle(commit: 'next' | 'previous' | null) {
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

  function onPointerDown(event: PointerEvent) {
    if (animating.value) return
    if (event.pointerType === 'mouse' && event.button !== 0) return
    pointerId = event.pointerId
    startX = lastX = event.clientX
    startY = event.clientY
    startedAt = lastT = performance.now()
    velocity = 0
    axis = null
    dragged = false
    longPressFired = false
    if (event.pointerType !== 'mouse') {
      longPressTimer = window.setTimeout(() => {
        longPressFired = true
        options.onLongPress()
      }, LONG_PRESS_MS)
    }
  }

  function onPointerMove(event: PointerEvent) {
    if (event.pointerId !== pointerId) return
    const dx = event.clientX - startX
    const dy = event.clientY - startY
    if (!axis) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return
      axis = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y'
      if (axis === 'x') options.viewport.value?.setPointerCapture(event.pointerId)
      clearLongPress()
    }
    if (longPressFired || axis === 'y') return
    dragged = true
    const now = performance.now()
    if (now > lastT) velocity = (event.clientX - lastX) / (now - lastT)
    lastX = event.clientX
    lastT = now
    const blockedNext = dx > 0 && !options.canGoNext()
    const blockedPrevious = dx < 0 && !options.canGoPrevious()
    dragX.value = blockedNext || blockedPrevious ? dx * 0.25 : dx
  }

  function onPointerUp(event: PointerEvent) {
    if (event.pointerId !== pointerId) return
    pointerId = null
    clearLongPress()
    const dx = event.clientX - startX
    const dy = event.clientY - startY
    const duration = performance.now() - startedAt
    if (longPressFired) {
      dragX.value = 0
      return
    }
    if (axis === 'x' && dragged) {
      const width = viewportWidth()
      const commitNext =
        (dx > width * DRAG_COMMIT_RATIO ||
          (dx > DRAG_COMMIT_MIN_PX && velocity > DRAG_COMMIT_VELOCITY)) &&
        options.canGoNext()
      const commitPrevious =
        (dx < -width * DRAG_COMMIT_RATIO ||
          (dx < -DRAG_COMMIT_MIN_PX && velocity < -DRAG_COMMIT_VELOCITY)) &&
        options.canGoPrevious()
      settle(commitNext ? 'next' : commitPrevious ? 'previous' : null)
      return
    }
    dragX.value = 0
    if (
      Math.abs(dx) <= TAP_MAX_MOVEMENT &&
      Math.abs(dy) <= TAP_MAX_MOVEMENT &&
      duration <= TAP_MAX_DURATION_MS
    ) {
      options.onTap(event)
    }
  }

  function onPointerCancel(event: PointerEvent) {
    if (event.pointerId !== pointerId) return
    pointerId = null
    clearLongPress()
    if (dragged) settle(null)
    else dragX.value = 0
  }

  onBeforeUnmount(clearLongPress)

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
