export const HIKARI_PREVIEW_TARGET_VW = 0.72
export const HIKARI_PREVIEW_TARGET_VH = 0.72
export const HIKARI_PREVIEW_MIN_VW = 0.45
export const HIKARI_PREVIEW_MIN_VH = 0.4
export const HIKARI_PREVIEW_MAX_VW = 0.9
export const HIKARI_PREVIEW_MAX_VH = 0.86

export const HIKARI_PREVIEW_COMPACT_BREAKPOINT = 640
export const HIKARI_PREVIEW_COMPACT_TARGET_VW = 0.96
export const HIKARI_PREVIEW_COMPACT_TARGET_VH = 0.84
export const HIKARI_PREVIEW_COMPACT_MAX_VW = 1

export const HIKARI_PREVIEW_ZOOM_MIN_RATIO = 0.4
export const HIKARI_PREVIEW_ZOOM_MAX_RATIO = 5

export const HIKARI_PREVIEW_STRIP_DURATION_MS = 500
export const HIKARI_PREVIEW_ZOOM_DURATION_MS = 180

export function wrapIndex(index: number, length: number): number {
  if (length <= 0) return 0
  return ((index % length) + length) % length
}

export interface HikariImageBaseSize {
  width: number
  height: number
}

export function computePreviewBaseSize(
  aspect: number,
  vw: number,
  vh: number,
): HikariImageBaseSize | null {
  if (!aspect || !vw || !vh) return null

  const compact = vw < HIKARI_PREVIEW_COMPACT_BREAKPOINT
  const targetW = vw * (compact ? HIKARI_PREVIEW_COMPACT_TARGET_VW : HIKARI_PREVIEW_TARGET_VW)
  const targetH = vh * (compact ? HIKARI_PREVIEW_COMPACT_TARGET_VH : HIKARI_PREVIEW_TARGET_VH)
  const targetRatio = targetW / targetH

  let width: number
  let height: number
  if (aspect > targetRatio) {
    width = targetW
    height = targetW / aspect
  } else {
    height = targetH
    width = targetH * aspect
  }

  const maxW = vw * (compact ? HIKARI_PREVIEW_COMPACT_MAX_VW : HIKARI_PREVIEW_MAX_VW)
  const maxH = vh * HIKARI_PREVIEW_MAX_VH
  if (width > maxW || height > maxH) {
    const shrink = Math.min(maxW / width, maxH / height)
    width *= shrink
    height *= shrink
  }

  const minW = vw * HIKARI_PREVIEW_MIN_VW
  const minH = vh * HIKARI_PREVIEW_MIN_VH
  if (width < minW && height < minH) {
    const grow = Math.max(minW / width, minH / height)
    const cap = Math.min(maxW / width, maxH / height)
    const factor = Math.min(grow, cap)
    width *= factor
    height *= factor
  }

  return { width, height }
}
