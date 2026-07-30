import type { ReaderOptions } from '@ritojs/core/web'
import type { ReadingPosition } from '@ritojs/core/position'
import type { ControllerOptions } from '@ritojs/kit'
import { createAnnotationStorage, createPositionStorage } from './storage'
import { isDarkBackground } from './theme'
import type { HikariReaderInput, ReaderSpreadMode, ReaderViewport } from '../types'

const RITO_TRANSITION = { stiffness: 180, damping: 22 } as const
const READER_BASE_FONT_SIZE = 16

/**
 * Map a UI font_size (px) to a Rito zoom scale.
 *
 * Rito implements visual font zoom through `setRenderScale` plus a re-pagination at
 * `viewport / scale`, not through `setTypography({ fontSize })`. The latter only
 * shifts rem-derived layout dimensions and rarely changes the rendered text size
 * users perceive. Following the official `apps/reader` demo, we treat font_size
 * as a zoom factor over a 16px baseline.
 */
export function fontSizeToZoomScale(fontSize: number) {
  if (!Number.isFinite(fontSize) || fontSize <= 0) return 1
  return fontSize / READER_BASE_FONT_SIZE
}

export function createReaderOptions(
  viewport: ReaderViewport,
  input: HikariReaderInput,
): ReaderOptions {
  const settings = input.settings.value
  const scale = fontSizeToZoomScale(settings.font_size)
  const vpWidth = Math.max(1, Math.round(viewport.width / scale))
  const vpHeight = Math.max(1, Math.round(viewport.height / scale))
  return {
    width: vpWidth,
    height: vpHeight,
    margin: getReaderMargin(vpWidth, settings.margins),
    spread: getSpreadMode(viewport.width),
    backgroundColor: settings.background_color,
    foregroundColor: isDarkBackground(settings.background_color) ? settings.text_color : undefined,
    lineBreaking: 'greedy',
    lineHeight: settings.line_height,
    lineHeightForce: true,
    fontFamily: settings.font_family || undefined,
    fontFamilyForce: false,
  }
}

export function createControllerOptions(input: HikariReaderInput): ControllerOptions {
  return {
    transition: RITO_TRANSITION,
    renderScale: fontSizeToZoomScale(input.settings.value.font_size),
    positionStorage: createPositionStorage({
      volumeId: input.volumeId,
      initialPosition:
        (input.state.progress?.position as ReadingPosition | null | undefined) ?? null,
    }),
    annotationStorage: createAnnotationStorage({
      initialAnnotations: input.state.annotations,
    }),
    a11y: { enabled: true },
  }
}

export function getSpreadMode(width: number): ReaderSpreadMode {
  return width >= 1080 ? 'double' : 'single'
}

export function getReaderMargin(width: number, preferred?: number) {
  if (typeof preferred === 'number' && preferred > 0) return preferred
  if (width < 640) return 48
  if (width < 1024) return 64
  return 72
}
