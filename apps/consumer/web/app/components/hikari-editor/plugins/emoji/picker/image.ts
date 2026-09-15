import type { HikariImageProcessingOptions } from '~/utils/media/image'

export const EMOJI_PICKER_IMAGE: HikariImageProcessingOptions = {
  width: 96,
  fit: 'scale-down',
  format: 'webp',
  quality: 80,
}

export const EMOJI_PREVIEW_IMAGE: HikariImageProcessingOptions = {
  width: 256,
  fit: 'scale-down',
  format: 'webp',
  quality: 85,
}
