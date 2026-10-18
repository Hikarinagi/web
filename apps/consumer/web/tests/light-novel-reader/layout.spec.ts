import { describe, expect, it } from 'vitest'
import { locatorOf, spreadOf } from '~/features/light-novel-reader/engine'
import { accountFont, accountTheme } from '~/features/light-novel-reader/settings'
import { READER_SYSTEM_THEME, readerTheme, shellStyle } from '~/features/light-novel-reader/themes'

describe('spreadOf', () => {
  it('lays a landscape area out as two pages once each line holds 22 characters', () => {
    expect(spreadOf('auto', { width: 1200, height: 800 }, 60, 18)).toBe('double')
    expect(spreadOf('auto', { width: 1000, height: 800 }, 60, 18)).toBe('single')
  })

  it('keeps a portrait area single whatever the reader asked for', () => {
    expect(spreadOf('double', { width: 800, height: 1000 }, 0, 16)).toBe('single')
    expect(spreadOf('auto', { width: 800, height: 800 }, 0, 12)).toBe('single')
  })

  it('honours an explicit choice on a landscape area', () => {
    expect(spreadOf('double', { width: 900, height: 700 }, 120, 36)).toBe('double')
    expect(spreadOf('single', { width: 2400, height: 900 }, 0, 12)).toBe('single')
  })
})

describe('locatorOf', () => {
  it('opens at the source locator a position carries', () => {
    const sourceLocator = {
      href: 'OEBPS/Text/chapter3.xhtml',
      sourcePoint: { nodePath: [1, 4, 0], textOffset: 17 },
    }
    expect(
      locatorOf({ sourceLocator, projection: { spreadIndex: 4, pageIndex: 9 }, progress: 0.3 }),
    ).toEqual(sourceLocator)
  })

  it('turns a position saved by the previous reader into a source locator', () => {
    expect(
      locatorOf({
        locator: {
          spineIdref: 'chap03',
          manifestHref: 'OEBPS/Text/chapter3.xhtml',
          chapterProgress: 0.4,
          sourcePoint: { nodePath: [1, 2], textOffset: 5 },
        },
        projection: { spreadIndex: 0, pageIndex: 0 },
        progress: 0.1,
      }),
    ).toEqual({
      href: 'OEBPS/Text/chapter3.xhtml',
      sourcePoint: { nodePath: [1, 2], textOffset: 5 },
      progression: 0.4,
    })
  })

  it('opens at the start when nothing says where the chapter is', () => {
    expect(locatorOf(null)).toBeUndefined()
    expect(
      locatorOf({
        locator: { spineIdref: 'chap03', chapterProgress: 0.4 },
        projection: { spreadIndex: 0, pageIndex: 0 },
        progress: 0.1,
      }),
    ).toBeUndefined()
  })
})

describe('reader themes', () => {
  it('follows the system between the default and the night theme', () => {
    expect(readerTheme(READER_SYSTEM_THEME, false).label).toBe('默认')
    expect(readerTheme(READER_SYSTEM_THEME, true).label).toBe('夜间')
    expect(readerTheme(2, true).label).toBe('暖米')
  })

  it('colours the shell after the chosen theme, above the site dark mode', () => {
    const css = shellStyle(2)
    expect(css.startsWith('html:root:root{')).toBe(true)
    expect(css).toContain('--hn-surface:#f4ead4')
    expect(css).toContain('--hn-fg-default:#2d2a22')
    expect(css).toContain('color-scheme:light')
    expect(css).not.toContain('@media')
  })

  it('switches the shell with the system when following it', () => {
    const css = shellStyle(READER_SYSTEM_THEME)
    expect(css).toContain('--hn-surface:#ffffff')
    expect(css).toContain('@media (prefers-color-scheme:dark){html:root:root{color-scheme:dark')
    expect(css).toContain('--hn-surface:#1f2227')
  })

  it('reads the account theme and font, falling back for values older readers wrote', () => {
    expect(accountTheme(6)).toBe(6)
    expect(accountTheme(42)).toBe(READER_SYSTEM_THEME)
    expect(accountTheme(undefined)).toBe(READER_SYSTEM_THEME)
    expect(accountFont('kai')).toBe('kai')
    expect(accountFont('system-ui')).toBe('original')
    expect(accountFont(undefined)).toBe('original')
  })
})
