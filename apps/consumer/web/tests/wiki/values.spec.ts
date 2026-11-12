import { describe, expect, it } from 'vitest'
import { qualifierText, relationPhrase, valueText } from '~/features/wiki/values'

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

  it('writes a game relation as what the holding game is to the other one', () => {
    const target = { id: 539, type: 'GAME' as const, label: 'D.C. 〜ダ・カーポ〜' }
    expect(valueText({ property: 'GAME_RELATION', code: 'SEQUEL', target })).toBe(
      '是《D.C. 〜ダ・カーポ〜》的续作',
    )
    expect(valueText({ property: 'GAME_RELATION', code: 'SAME_SERIES', target })).toBe(
      '与《D.C. 〜ダ・カーポ〜》同系列',
    )
  })
})

describe('qualifierText', () => {
  it('names what a value applies to and that it is not public', () => {
    const plain = {
      period_from: null,
      period_from_precision: null,
      period_to: null,
      period_to_precision: null,
      part: null,
    }
    expect(qualifierText(plain)).toBeNull()
    expect(qualifierText({ ...plain, is_public: true })).toBeNull()
    expect(qualifierText({ ...plain, part: '体验版', is_public: false })).toBe(
      '适用于体验版，未公开',
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
