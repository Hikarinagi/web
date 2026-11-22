import type { HikariImageProcessingOptions } from '~/utils/media/image'

export const LOGO_PROCESSING = {
  width: 480,
  height: 192,
  quality: 90,
  fit: 'scale-down',
  format: 'auto',
} as const satisfies HikariImageProcessingOptions

export function logoRatio(
  ...sizes: ({ width?: number | null; height?: number | null } | null | undefined)[]
): number {
  for (const size of sizes) {
    if (size?.width && size.height) return Math.min(Math.max(size.width / size.height, 1), 2.4)
  }
  return 1
}
