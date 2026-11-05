import { describe, expect, it } from 'vitest'
import { relationPhrase, valueText } from '~/features/wiki/values'

describe('valueText', () => {
  it('names the song of a song credit and whether it is a theme or insert song', () => {
    expect(
      valueText({
        property: 'CREDIT',
        text: '美郷あき',
        code: 'VOCALS',
        song: 'DESIRE',
        song_kind: 'THEME',
      }),
    ).toBe('美郷あき（歌曲演唱：DESIRE，主题歌）')
    expect(valueText({ property: 'CREDIT', text: '西又葵', code: 'ORIGINAL_ART' })).toBe(
      '西又葵（原画）',
    )
  })

  it('writes a date at its precision and an unknown value as such', () => {
    expect(
      valueText({ property: 'RELEASE_DATE', date: '2026-10-01', date_precision: 'MONTH' }),
    ).toBe('2026 年 10 月')
    expect(valueText({ property: 'RELEASE_DATE', value_kind: 'UNKNOWN' })).toBe('存在，但值未知')
  })

  it('names the site an external link or channel code belongs to', () => {
    expect(valueText({ property: 'EXTERNAL_LINK', code: 'BANGUMI', text: '1744' })).toBe(
      'Bangumi 1744',
    )
    expect(valueText({ property: 'CHANNEL_CODE', code: 'STEAM', text: '1066300' })).toBe(
      'Steam 1066300',
    )
  })
})

describe('relationPhrase', () => {
  it('writes a relation from the point of view of this work', () => {
    expect(relationPhrase('GAME_RELATION', 'SEQUEL', 'other')).toBe('它是本作的续作')
    expect(relationPhrase('GAME_RELATION', 'SEQUEL', 'self')).toBe('本作是它的续作')
    expect(relationPhrase('GAME_RELATION', 'SAME_SERIES', 'other')).toBe('它与本作同系列')
  })
})
