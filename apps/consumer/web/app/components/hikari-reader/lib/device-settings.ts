/**
 * Reader preferences that describe the *device*, not the reader: an e-ink
 * tablet wants page turns to cut instantly and to be driven by fixed tap
 * zones, while the same account on a phone wants the default animated swipe.
 * Syncing these through `reader_settings` would push one device's tradeoff
 * onto every other device, so they stay in localStorage.
 */
export interface HikariReaderDeviceSettings {
  /** `false` cuts straight to the target spread instead of animating the turn. */
  page_animation: boolean
  /** `true` maps taps to fixed left/right/center zones instead of toolbar toggling. */
  tap_zones: boolean
}

export type ReaderTapZone = 'previous' | 'next' | 'toolbar'

export const HIKARI_READER_DEVICE_SETTINGS_KEY = 'hikari-reader-device-settings'

export const HIKARI_READER_DEFAULT_DEVICE_SETTINGS: HikariReaderDeviceSettings = {
  page_animation: true,
  tap_zones: false,
}

const PREVIOUS_ZONE_END = 0.3
const NEXT_ZONE_START = 0.7

/** `x` is relative to the reading surface's left edge. */
export function resolveTapZone(x: number, width: number): ReaderTapZone {
  if (width <= 0) return 'toolbar'
  const ratio = x / width
  if (ratio < PREVIOUS_ZONE_END) return 'previous'
  if (ratio > NEXT_ZONE_START) return 'next'
  return 'toolbar'
}
