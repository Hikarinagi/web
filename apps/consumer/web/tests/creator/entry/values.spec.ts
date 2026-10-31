import { describe, expect, it } from 'vitest'
import { accessedText, linkOf, sourcesOf, statementText } from '~/features/creator/entry/values'

describe('statementText', () => {
  it('names the song of a song credit and whether it is a theme or insert song', () => {
    expect(
      statementText({
        property: 'CREDIT',
        text: '美郷あき',
        code: 'VOCALS',
        song: 'DESIRE',
        song_kind: 'THEME',
      }),
    ).toBe('美郷あき（歌曲演唱：DESIRE，主题歌）')
    expect(
      statementText({ property: 'CREDIT', text: '橋本みゆき', code: 'VOCALS', song: 'SHINY MOON' }),
    ).toBe('橋本みゆき（歌曲演唱：SHINY MOON）')
    expect(statementText({ property: 'CREDIT', text: '西又葵', code: 'ORIGINAL_ART' })).toBe(
      '西又葵（原画）',
    )
  })
})

describe('statementText for prices and text', () => {
  it('notes whether a price includes tax', () => {
    const price = { property: 'PRICE' as const, amount: '9800.00', currency: 'JPY' }
    expect(statementText({ ...price, tax_included: false })).toBe('¥9,800（不含税）')
    expect(statementText({ ...price, tax_included: true })).toBe('¥9,800（含税）')
    expect(statementText({ ...price, tax_included: null })).toBe('¥9,800')
  })

  it('turns Windows line endings into plain line breaks', () => {
    expect(statementText({ property: 'ORIGINAL_INTRO', text: 'a\r\nb\rc' })).toBe('a\nb\nc')
  })
})

describe('linkOf', () => {
  it('links an official site, a site identifier and a store page', () => {
    expect(linkOf({ property: 'WEBSITE', text: 'https://example.jp/' } as never)).toBe(
      'https://example.jp/',
    )
    expect(linkOf({ property: 'EXTERNAL_LINK', code: 'VNDB', text: 'v10680' } as never)).toBe(
      'https://vndb.org/v10680',
    )
    expect(linkOf({ property: 'EXTERNAL_LINK', code: 'BANGUMI', text: '44123' } as never)).toBe(
      'https://bgm.tv/subject/44123',
    )
    expect(
      linkOf({ property: 'EXTERNAL_LINK', code: 'STORE', text: 'https://shop.example/1' } as never),
    ).toBe('https://shop.example/1')
    expect(linkOf({ property: 'ALIAS', text: 'つり乙' } as never)).toBeNull()
  })
})

describe('sourcesOf', () => {
  it('keeps only supporting citations that are real sources', () => {
    const citation = (method: string, role = 'SUPPORT') => ({ method, role }) as never
    const statement = {
      citations: [
        citation('IMPORT'),
        citation('MEMBER'),
        citation('EXCERPT'),
        citation('EXCERPT', 'CONTRADICT'),
        citation('RECORD'),
      ],
    } as never
    expect(sourcesOf(statement).map((item: { method: string }) => item.method)).toEqual([
      'EXCERPT',
      'RECORD',
    ])
  })
})

describe('accessedText', () => {
  it('writes the full date and time when asked', () => {
    const value = new Date(2025, 9, 21, 9, 5).toISOString()
    expect(accessedText(value, true)).toBe('2025 年 10 月 21 日 09:05')
    expect(accessedText(value)).toBe('2025 年 10 月 21 日')
    expect(accessedText(null)).toBeNull()
  })
})
