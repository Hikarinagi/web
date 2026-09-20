import type { Ref } from 'vue'

interface UseStageZoomOptions {
  viewport: Ref<HTMLElement | null>
  /** The un-transformed element holding the current spread's pages. */
  content: () => HTMLElement | null
  enabled: () => boolean
}

export interface ZoomPoint {
  x: number
  y: number
}

const MIN_SCALE = 1
const MAX_SCALE = 4
/** Pinching may overshoot this far before springing back on release. */
const RUBBER_MIN_SCALE = 0.85
const RUBBER_MAX_SCALE = 4.5
const DOUBLE_TAP_SCALE = 2.5
const ANIMATION_MS = 220
/** Below this the page counts as un-zoomed and drags go back to paging. */
const ZOOM_EPSILON = 0.01

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

/**
 * Pan/zoom for a single manga page, mirroring the mobile reader: double tap
 * toggles 1x <-> 2.5x around the tapped point, pinch runs 1x-4x with a rubber
 * band, and while zoomed a drag pans until it hits the edge — only then does
 * the swipe fall through to paging.
 */
export function useStageZoom(options: UseStageZoomOptions) {
  const scale = ref(1)
  const tx = ref(0)
  const ty = ref(0)
  const animating = ref(false)

  let animationTimer: number | null = null
  let pinch: {
    distance: number
    scale: number
    tx: number
    ty: number
    center: ZoomPoint
  } | null = null

  const zoomed = computed(() => scale.value > MIN_SCALE + ZOOM_EPSILON)

  const style = computed(() => ({
    transform: `translate3d(${tx.value}px, ${ty.value}px, 0) scale(${scale.value})`,
    transition: animating.value
      ? `transform ${ANIMATION_MS}ms cubic-bezier(0.33, 1, 0.68, 1)`
      : 'none',
  }))

  /** Half of the overflow on each axis — the furthest the content may travel. */
  function limits(at = scale.value) {
    const view = options.viewport.value
    const content = options.content()
    if (!view || !content) return { x: 0, y: 0 }
    return {
      x: Math.max(0, (content.offsetWidth * at - view.clientWidth) / 2),
      y: Math.max(0, (content.offsetHeight * at - view.clientHeight) / 2),
    }
  }

  function clampTranslate(at = scale.value) {
    const bound = limits(at)
    tx.value = clamp(tx.value, -bound.x, bound.x)
    ty.value = clamp(ty.value, -bound.y, bound.y)
  }

  function stopAnimation() {
    if (animationTimer === null) return
    window.clearTimeout(animationTimer)
    animationTimer = null
    animating.value = false
  }

  function animate(run: () => void) {
    stopAnimation()
    animating.value = true
    run()
    animationTimer = window.setTimeout(() => {
      animationTimer = null
      animating.value = false
    }, ANIMATION_MS)
  }

  /** Offset of a client point from the viewport centre. */
  function toCentreOffset(point: ZoomPoint): ZoomPoint {
    const view = options.viewport.value
    if (!view) return { x: 0, y: 0 }
    const rect = view.getBoundingClientRect()
    return {
      x: point.x - (rect.left + rect.width / 2),
      y: point.y - (rect.top + rect.height / 2),
    }
  }

  /**
   * Re-anchor the translation so the content point currently under `focus`
   * stays under it after scaling to `next`.
   */
  function scaleAround(next: number, focus: ZoomPoint) {
    const ratio = next / scale.value
    tx.value = focus.x - (focus.x - tx.value) * ratio
    ty.value = focus.y - (focus.y - ty.value) * ratio
    scale.value = next
  }

  function reset() {
    stopAnimation()
    pinch = null
    scale.value = 1
    tx.value = 0
    ty.value = 0
  }

  function toggleAt(point: ZoomPoint) {
    if (!options.enabled()) return
    const focus = toCentreOffset(point)
    animate(() => {
      if (zoomed.value) {
        scale.value = 1
        tx.value = 0
        ty.value = 0
        return
      }
      scaleAround(DOUBLE_TAP_SCALE, focus)
      clampTranslate()
    })
  }

  function beginPinch(a: ZoomPoint, b: ZoomPoint) {
    if (!options.enabled()) return
    stopAnimation()
    pinch = {
      distance: Math.max(1, Math.hypot(b.x - a.x, b.y - a.y)),
      scale: scale.value,
      tx: tx.value,
      ty: ty.value,
      center: toCentreOffset({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }),
    }
  }

  function updatePinch(a: ZoomPoint, b: ZoomPoint) {
    const start = pinch
    if (!start) return
    const distance = Math.max(1, Math.hypot(b.x - a.x, b.y - a.y))
    const next = clamp(
      (start.scale * distance) / start.distance,
      RUBBER_MIN_SCALE,
      RUBBER_MAX_SCALE,
    )
    const centre = toCentreOffset({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })
    const ratio = next / start.scale
    scale.value = next
    tx.value = centre.x - (start.center.x - start.tx) * ratio
    ty.value = centre.y - (start.center.y - start.ty) * ratio
  }

  /** Spring back into the allowed range once the fingers leave. */
  function endPinch() {
    if (!pinch) return
    pinch = null
    const settled = clamp(scale.value, MIN_SCALE, MAX_SCALE)
    if (settled === scale.value) {
      clampTranslate()
      return
    }
    animate(() => {
      if (settled === MIN_SCALE) {
        scale.value = MIN_SCALE
        tx.value = 0
        ty.value = 0
        return
      }
      scaleAround(settled, { x: 0, y: 0 })
      clampTranslate()
    })
  }

  /**
   * Pan by a delta, returning how much was actually consumed on each axis.
   * A horizontal remainder is what lets the caller hand the drag to paging.
   */
  function panBy(dx: number, dy: number) {
    if (!zoomed.value) return { x: 0, y: 0 }
    const bound = limits()
    const nextX = clamp(tx.value + dx, -bound.x, bound.x)
    const nextY = clamp(ty.value + dy, -bound.y, bound.y)
    const usedX = nextX - tx.value
    const usedY = nextY - ty.value
    tx.value = nextX
    ty.value = nextY
    return { x: usedX, y: usedY }
  }

  /** Whether a horizontal drag of `dx` still has room to pan. */
  function canPan(dx: number) {
    if (!zoomed.value) return false
    const bound = limits()
    if (bound.x === 0) return false
    return dx > 0 ? tx.value < bound.x - 0.5 : tx.value > -bound.x + 0.5
  }

  onBeforeUnmount(stopAnimation)

  return {
    scale,
    zoomed,
    style,
    reset,
    toggleAt,
    beginPinch,
    updatePinch,
    endPinch,
    panBy,
    canPan,
    isPinching: () => pinch !== null,
  }
}
