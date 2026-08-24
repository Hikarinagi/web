import type { ReaderOptions } from '@ritojs/core'
import type { ReadingPosition, ControllerOptions } from '@ritojs/kit'
import { createAnnotationStorage, createPositionStorage } from './storage'
import { isDarkBackground } from './theme'
import type { HikariReaderInput, ReaderSpreadMode, ReaderViewport } from '../types'

const RITO_TRANSITION = { stiffness: 180, damping: 22 } as const

export function createReaderOptions(
  viewport: ReaderViewport,
  input: HikariReaderInput,
): ReaderOptions {
  const settings = input.settings.value
  const vpWidth = Math.max(1, Math.round(viewport.width))
  const vpHeight = Math.max(1, Math.round(viewport.height))
  return {
    width: vpWidth,
    height: vpHeight,
    margin: getReaderMargin(vpWidth, settings.margins),
    spread: getSpreadMode(viewport.width),
    fontSize: settings.font_size,
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
