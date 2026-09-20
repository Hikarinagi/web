import type { HikariImageProcessingOptions } from './image'

export interface MediaDimensions {
  width: number | null
  height: number | null
}

export interface CoverMediaLayout {
  aspectRatio: string
  width: string
  processing: HikariImageProcessingOptions
}

const FALLBACK_COVER_RATIO = 2 / 3

export function getCoverMediaLayout(media: MediaDimensions | null): CoverMediaLayout {
  const ratio = getMediaRatio(media)
  const max_height = getMaxHeight(ratio)
  const width_cap = getWidthCap(ratio)
  const max_width = Math.round(Math.max(128, Math.min(width_cap, max_height * ratio)))
  const min_width = Math.round(Math.max(118, Math.min(190, max_width * 0.72)))

  return {
    aspectRatio: media?.width && media.height ? `${media.width} / ${media.height}` : '2 / 3',
    width: `clamp(${min_width}px, ${getPreferredVw(ratio)}vw, ${max_width}px)`,
    processing: {
      width: Math.max(360, max_width * 2),
      fit: 'scale-down',
      quality: 92,
    },
  }
}

function getMediaRatio(media: MediaDimensions | null) {
  if (!media?.width || !media.height || media.width <= 0 || media.height <= 0) {
    return FALLBACK_COVER_RATIO
  }

  return media.width / media.height
}

function getMaxHeight(ratio: number) {
  if (ratio < 0.55) return 470
  if (ratio < 0.85) return 430
  if (ratio < 1.15) return 340
  if (ratio < 1.9) return 300
  return 240
}

function getWidthCap(ratio: number) {
  if (ratio < 0.55) return 230
  if (ratio < 0.85) return 280
  if (ratio < 1.15) return 330
  if (ratio < 1.9) return 430
  return 460
}

function getPreferredVw(ratio: number) {
  if (ratio < 0.55) return 46
  if (ratio < 0.85) return 56
  if (ratio < 1.15) return 64
  if (ratio < 1.9) return 78
  return 82
}
