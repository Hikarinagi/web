import type { Ref } from 'vue'

type GestureMode = 'idle' | 'pending' | 'pan' | 'pinch' | 'navigate'

const DIRECTION_LOCK_PX = 6
const NAV_DIRECTION_BIAS = 1.2
const TAP_MAX_DISTANCE_PX = 10
const TAP_MAX_DURATION_MS = 320
const DOUBLE_TAP_MAX_DELAY_MS = 280
const DOUBLE_TAP_MAX_DISTANCE_PX = 28
const WHEEL_ZOOM_INTENSITY = 0.0022
const TRACKPAD_PINCH_ZOOM_INTENSITY = 0.0066
const TRACKPAD_PINCH_SETTLE_MS = 80

export interface UseHikariImageGestureOptions {
  stage: Ref<HTMLElement | null>
  scale: Ref<number>
  isZoomed: Ref<boolean>
  canNavigate: () => boolean
  zoomAt: (
    nextScale: number,
    clientX: number,
    clientY: number,
    options?: { animated?: boolean },
  ) => void
  panBy: (dx: number, dy: number, origin: { tx: number; ty: number }) => void
  settle: () => void
  getTranslate: () => { tx: number; ty: number }
  toggleDoubleClickZoom: (clientX: number, clientY: number) => void
  onNavigateStart: () => void
  onNavigateEnd: (info: { offset: number; velocityPxPerMs: number; width: number }) => void
  onTapOutside: () => void
  isPointInsideImage: (clientX: number, clientY: number) => boolean
}

export interface NavigationDrag {
  offset: number
  width: number
}

export function useHikariImageGesture(options: UseHikariImageGestureOptions) {
  const mode = ref<GestureMode>('idle')
  const navigationDrag = ref<NavigationDrag | null>(null)

  const pointers = new Map<number, { x: number; y: number }>()
  let pinchStartDistance = 0
  let pinchStartScale = 1
  let panOrigin = { tx: 0, ty: 0 }
  let gestureStart = { x: 0, y: 0, time: 0 }
  let lastMove = { x: 0, y: 0, time: 0 }
  let lastTap: { x: number; y: number; time: number } | null = null
  let multiPointerGesture = false
  let trackpadPinchTimer: ReturnType<typeof setTimeout> | null = null
  let suppressClick = false
  let pointerDownInsideImage = false

  function resetGestureState() {
    pointers.clear()
    pinchStartDistance = 0
    pinchStartScale = 1
    lastTap = null
    multiPointerGesture = false
    if (trackpadPinchTimer) clearTimeout(trackpadPinchTimer)
    trackpadPinchTimer = null
    mode.value = 'idle'
    navigationDrag.value = null
  }

  function clearTap() {
    lastTap = null
  }

  function isTouchTap(event: PointerEvent) {
    if (event.pointerType !== 'touch' || !pointerDownInsideImage) return false
    const distance = Math.hypot(event.clientX - gestureStart.x, event.clientY - gestureStart.y)
    const duration = event.timeStamp - gestureStart.time
    return distance <= TAP_MAX_DISTANCE_PX && duration <= TAP_MAX_DURATION_MS
  }

  function handleTouchTap(event: PointerEvent) {
    if (!isTouchTap(event)) {
      clearTap()
      return false
    }

    const tap = { x: event.clientX, y: event.clientY, time: event.timeStamp }
    const isDoubleTap =
      lastTap &&
      tap.time - lastTap.time <= DOUBLE_TAP_MAX_DELAY_MS &&
      Math.hypot(tap.x - lastTap.x, tap.y - lastTap.y) <= DOUBLE_TAP_MAX_DISTANCE_PX

    if (!isDoubleTap) {
      lastTap = tap
      return false
    }

    clearTap()
    suppressClick = true
    options.toggleDoubleClickZoom(event.clientX, event.clientY)
    return true
  }

  function onPointerDown(event: PointerEvent) {
    ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })

    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()]
      pinchStartDistance = Math.hypot(a!.x - b!.x, a!.y - b!.y)
      pinchStartScale = options.scale.value
      multiPointerGesture = true
      mode.value = 'pinch'
      navigationDrag.value = null
      clearTap()
      return
    }

    gestureStart = { x: event.clientX, y: event.clientY, time: event.timeStamp }
    lastMove = { ...gestureStart }
    suppressClick = false
    pointerDownInsideImage = options.isPointInsideImage(event.clientX, event.clientY)

    if (options.isZoomed.value) {
      if (pointerDownInsideImage) {
        panOrigin = options.getTranslate()
        mode.value = 'pan'
      } else {
        mode.value = 'idle'
      }
      return
    }

    mode.value = 'pending'
  }

  function onPointerMove(event: PointerEvent) {
    if (!pointers.has(event.pointerId)) return
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
    lastMove = { x: event.clientX, y: event.clientY, time: event.timeStamp }

    if (mode.value === 'pinch' && pointers.size === 2) {
      const [a, b] = [...pointers.values()]
      const distance = Math.hypot(a!.x - b!.x, a!.y - b!.y)
      if (!pinchStartDistance) return
      const cx = (a!.x + b!.x) / 2
      const cy = (a!.y + b!.y) / 2
      options.zoomAt((pinchStartScale * distance) / pinchStartDistance, cx, cy, {
        animated: false,
      })
      return
    }

    const dx = event.clientX - gestureStart.x
    const dy = event.clientY - gestureStart.y
    if (Math.hypot(dx, dy) > TAP_MAX_DISTANCE_PX) clearTap()

    if (mode.value === 'pan') {
      options.panBy(dx, dy, panOrigin)
      suppressClick = true
      return
    }

    if (mode.value === 'pending') {
      if (Math.hypot(dx, dy) < DIRECTION_LOCK_PX) return
      if (!options.canNavigate() || Math.abs(dx) < Math.abs(dy) * NAV_DIRECTION_BIAS) {
        mode.value = 'idle'
        return
      }
      mode.value = 'navigate'
      const stageWidth = options.stage.value?.clientWidth ?? window.innerWidth
      navigationDrag.value = { offset: 0, width: stageWidth }
      clearTap()
      options.onNavigateStart()
    }

    if (mode.value === 'navigate' && navigationDrag.value) {
      navigationDrag.value = { ...navigationDrag.value, offset: dx }
      suppressClick = true
    }
  }

  function onPointerUp(event: PointerEvent) {
    pointers.delete(event.pointerId)

    if (mode.value === 'pinch') {
      if (pointers.size < 2) {
        pinchStartDistance = 0
        pinchStartScale = 1
        options.settle()
        if (pointers.size === 0) multiPointerGesture = false
        mode.value = 'idle'
      }
      return
    }

    if (multiPointerGesture) {
      if (pointers.size === 0) {
        multiPointerGesture = false
        mode.value = 'idle'
      }
      return
    }

    if (mode.value === 'pan') {
      handleTouchTap(event)
      options.settle()
      mode.value = 'idle'
      return
    }

    if (mode.value === 'navigate' && navigationDrag.value) {
      const { offset, width } = navigationDrag.value
      const elapsed = Math.max(1, lastMove.time - gestureStart.time)
      const velocity = (lastMove.x - gestureStart.x) / elapsed
      navigationDrag.value = null
      mode.value = 'idle'
      options.onNavigateEnd({ offset, velocityPxPerMs: velocity, width })
      return
    }

    if (mode.value === 'pending') {
      mode.value = 'idle'
      if (pointerDownInsideImage) handleTouchTap(event)
      else if (!suppressClick) {
        clearTap()
        options.onTapOutside()
      }
      return
    }

    if (mode.value === 'idle' && !suppressClick && pointers.size === 0) {
      if (pointerDownInsideImage) handleTouchTap(event)
      else {
        clearTap()
        options.onTapOutside()
      }
    }
  }

  function onPointerCancel(event: PointerEvent) {
    pointers.delete(event.pointerId)
    if (mode.value === 'navigate') {
      navigationDrag.value = null
    }
    if (mode.value === 'pan') options.settle()
    clearTap()
    if (pointers.size === 0) multiPointerGesture = false
    mode.value = pointers.size === 0 ? 'idle' : mode.value
  }

  function onWheel(event: WheelEvent) {
    event.preventDefault()
    const isTrackpadPinch = event.ctrlKey
    const intensity = isTrackpadPinch ? TRACKPAD_PINCH_ZOOM_INTENSITY : WHEEL_ZOOM_INTENSITY
    const factor = Math.exp(-event.deltaY * intensity)
    options.zoomAt(options.scale.value * factor, event.clientX, event.clientY, {
      animated: !isTrackpadPinch,
    })

    if (!isTrackpadPinch) return
    if (trackpadPinchTimer) clearTimeout(trackpadPinchTimer)
    trackpadPinchTimer = setTimeout(() => {
      options.settle()
      trackpadPinchTimer = null
    }, TRACKPAD_PINCH_SETTLE_MS)
  }

  function onDoubleClick(event: MouseEvent) {
    event.preventDefault()
    options.toggleDoubleClickZoom(event.clientX, event.clientY)
  }

  function onClick(event: MouseEvent) {
    if (suppressClick) {
      event.stopPropagation()
      suppressClick = false
    }
  }

  return {
    mode,
    navigationDrag,
    resetGestureState,
    handlers: {
      onPointerdown: onPointerDown,
      onPointermove: onPointerMove,
      onPointerup: onPointerUp,
      onPointercancel: onPointerCancel,
      onWheel,
      onDblclick: onDoubleClick,
      onClick,
    },
  }
}
