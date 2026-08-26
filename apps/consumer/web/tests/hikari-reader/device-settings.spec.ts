import { describe, expect, it } from 'vitest'
import {
  HIKARI_READER_DEFAULT_DEVICE_SETTINGS,
  resolveTapZone,
} from '~/components/hikari-reader/lib/device-settings'

describe('HIKARI_READER_DEFAULT_DEVICE_SETTINGS', () => {
  it('keeps the animated swipe reader as the default experience', () => {
    expect(HIKARI_READER_DEFAULT_DEVICE_SETTINGS).toEqual({
      page_animation: true,
      tap_zones: false,
    })
  })
})

describe('resolveTapZone', () => {
  it('maps the outer thirds to page turns and the middle to the toolbar', () => {
    expect(resolveTapZone(0, 1000)).toBe('previous')
    expect(resolveTapZone(299, 1000)).toBe('previous')
    expect(resolveTapZone(300, 1000)).toBe('toolbar')
    expect(resolveTapZone(500, 1000)).toBe('toolbar')
    expect(resolveTapZone(700, 1000)).toBe('toolbar')
    expect(resolveTapZone(701, 1000)).toBe('next')
    expect(resolveTapZone(1000, 1000)).toBe('next')
  })

  it('falls back to the toolbar when the surface has not been measured yet', () => {
    expect(resolveTapZone(120, 0)).toBe('toolbar')
  })
})
