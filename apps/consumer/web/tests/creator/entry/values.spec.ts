import { describe, expect, it } from 'vitest'
import { statementText } from '~/features/creator/entry/values'

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
