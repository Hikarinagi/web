import { describe, expect, it } from 'vitest'
import {
  READER_SYSTEM_THEME_INDEX,
  READER_THEME_PRESETS,
  systemThemeColors,
} from '../../app/components/hikari-reader/lib/presets'

describe('systemThemeColors', () => {
  it('maps light to the day preset', () => {
    const day = READER_THEME_PRESETS.find(p => p.index === 0)!
    expect(systemThemeColors('light')).toEqual({
      background_color: day.backgroundColor,
      text_color: day.textColor,
    })
  })

  it('maps dark to the night preset', () => {
    const night = READER_THEME_PRESETS.find(p => p.index === 5)!
    expect(systemThemeColors('dark')).toEqual({
      background_color: night.backgroundColor,
      text_color: night.textColor,
    })
  })
})

describe('READER_SYSTEM_THEME_INDEX', () => {
  it('stays within the backend @Min(0) bound so it persists', () => {
    expect(READER_SYSTEM_THEME_INDEX).toBeGreaterThanOrEqual(0)
  })

  it('does not collide with any real preset index', () => {
    expect(READER_THEME_PRESETS.some(p => p.index === READER_SYSTEM_THEME_INDEX)).toBe(false)
  })
})
