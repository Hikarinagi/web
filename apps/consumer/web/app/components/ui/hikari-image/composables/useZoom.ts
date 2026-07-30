import type { Ref } from 'vue'
import { EASE_CSS } from '~/lib/motion'
import {
  HIKARI_PREVIEW_ZOOM_DURATION_MS,
  HIKARI_PREVIEW_ZOOM_MAX_RATIO,
  HIKARI_PREVIEW_ZOOM_MIN_RATIO,
  computePreviewBaseSize,
  type HikariImageBaseSize,
} from '../layout'

export type { HikariImageBaseSize }

export interface UseHikariImageZoomOptions {
  container: Ref<HTMLElement | null>
}

export function useHikariImageZoom({ container }: UseHikariImageZoomOptions) {
  const scale = ref(1)
  const tx = ref(0)
  const ty = ref(0)
  const animated = ref(true)
  const baseSize = ref<HikariImageBaseSize | null>(null)

  const isZoomed = computed(() => scale.value > 1.001 || scale.value < 0.999)
  const transformStyle = computed(() => ({
    transform: `translate3d(${tx.value}px, ${ty.value}px, 0) scale(${scale.value})`,
    transition: animated.value
      ? `transform ${HIKARI_PREVIEW_ZOOM_DURATION_MS}ms ${EASE_CSS}`
      : 'none',
  }))

  function fitToViewport(naturalWidth: number, naturalHeight: number) {
    if (!naturalWidth || !naturalHeight) {
      baseSize.value = null
      return
    }
    baseSize.value = computePreviewBaseSize(
      naturalWidth / naturalHeight,
      window.innerWidth,
      window.innerHeight,
    )
  }

  function clearBaseSize() {
    baseSize.value = null
  }

  function reset() {
    animated.value = true
    scale.value = 1
    tx.value = 0
    ty.value = 0
  }

  function clampTranslate(nextScale: number, nextTx: number, nextTy: number) {
    const rect = container.value?.getBoundingClientRect()
    const base = baseSize.value
    if (!rect || !base) return { tx: nextTx, ty: nextTy }
    const scaledW = base.width * nextScale
    const scaledH = base.height * nextScale
    const maxX = Math.max(0, (scaledW - rect.width) / 2)
    const maxY = Math.max(0, (scaledH - rect.height) / 2)
    return {
      tx: Math.max(-maxX, Math.min(maxX, nextTx)),
      ty: Math.max(-maxY, Math.min(maxY, nextTy)),
    }
  }

  function zoomAt(
    nextScale: number,
    clientX: number,
    clientY: number,
    options: { animated?: boolean } = {},
  ) {
    const rect = container.value?.getBoundingClientRect()
    if (!rect) return
    const target = Math.max(
      HIKARI_PREVIEW_ZOOM_MIN_RATIO,
      Math.min(HIKARI_PREVIEW_ZOOM_MAX_RATIO, nextScale),
    )
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const ratio = target / scale.value
    const nextTx = (tx.value + cx - clientX) * ratio + (clientX - cx)
    const nextTy = (ty.value + cy - clientY) * ratio + (clientY - cy)
    const clamped = clampTranslate(target, nextTx, nextTy)
    animated.value = options.animated ?? true
    scale.value = target
    tx.value = clamped.tx
    ty.value = clamped.ty
  }

  function panBy(dx: number, dy: number, origin: { tx: number; ty: number }) {
    const clamped = clampTranslate(scale.value, origin.tx + dx, origin.ty + dy)
    animated.value = false
    tx.value = clamped.tx
    ty.value = clamped.ty
  }

  function settle() {
    animated.value = true
  }

  function toggleDoubleClickZoom(clientX: number, clientY: number) {
    if (isZoomed.value) reset()
    else zoomAt(2, clientX, clientY)
  }

  return {
    scale,
    tx,
    ty,
    baseSize,
    isZoomed,
    transformStyle,
    reset,
    fitToViewport,
    clearBaseSize,
    zoomAt,
    panBy,
    settle,
    toggleDoubleClickZoom,
  }
}
