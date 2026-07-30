import type { Ref } from 'vue'

export type ResizeCorner = 'tl' | 'tr' | 'bl' | 'br'
export const RESIZE_CORNERS: readonly ResizeCorner[] = ['tl', 'tr', 'bl', 'br']

export const IMAGE_SNAP_POINTS: readonly number[] = [25, 33, 50, 66, 75, 100]
export const IMAGE_MIN_PERCENT = 20
export const IMAGE_MAX_PERCENT = 100

export function pickInitialWidthPercent(naturalWidth: number, surfaceWidth: number): number {
  if (!naturalWidth || !surfaceWidth || naturalWidth >= surfaceWidth) return IMAGE_MAX_PERCENT
  const ratio = (naturalWidth / surfaceWidth) * 100
  for (const p of IMAGE_SNAP_POINTS) {
    if (ratio <= p) return p
  }
  return IMAGE_MAX_PERCENT
}

export interface UseImageResizeOptions {
  minPercent?: number
  maxPercent?: number
  snapPoints?: readonly number[]
  snapTolerance?: number
}

export interface UseImageResizeReturn {
  startResize: (corner: ResizeCorner, event: PointerEvent) => void
}

export function useImageResize(
  figureRef: Readonly<Ref<HTMLElement | null>>,
  currentPercent: () => number,
  apply: (next: number) => void,
  options: UseImageResizeOptions = {},
): UseImageResizeReturn {
  const minPercent = options.minPercent ?? IMAGE_MIN_PERCENT
  const maxPercent = options.maxPercent ?? IMAGE_MAX_PERCENT
  const snapPoints = options.snapPoints ?? IMAGE_SNAP_POINTS
  const snapTolerance = options.snapTolerance ?? 3

  function clampSnap(p: number): number {
    const clamped = Math.max(minPercent, Math.min(maxPercent, p))
    for (const point of snapPoints) {
      if (Math.abs(clamped - point) < snapTolerance) return point
    }
    return Math.round(clamped * 10) / 10
  }

  function startResize(corner: ResizeCorner, event: PointerEvent) {
    event.preventDefault()
    event.stopPropagation()
    const figure = figureRef.value
    if (!figure?.parentElement) return
    const parentWidth = figure.parentElement.clientWidth
    if (parentWidth <= 0) return
    const startX = event.clientX
    const startPercent = currentPercent()
    const fromRight = corner === 'tr' || corner === 'br'

    function onMove(ev: PointerEvent) {
      const dx = ev.clientX - startX
      const sign = fromRight ? 1 : -1
      // center-aligned → dragging one side affects total width by 2 × delta
      const deltaPercent = ((dx * sign * 2) / parentWidth) * 100
      const next = clampSnap(startPercent + deltaPercent)
      if (next !== currentPercent()) apply(next)
    }
    function onUp() {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
  }

  return { startResize }
}
