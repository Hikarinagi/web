import { describe, expect, it } from 'vitest'
import type { ContentLimits } from '~/utils/media/image'
import { imageLimit, imageSourceSafety } from '~/utils/media/image'
import {
  appearancesOf,
  characterPath,
  galgameCast,
  namesOf,
  pickAppearance,
  profileRows,
  readWork,
  viewOf,
  voiceSummary,
  type Appearance,
} from '~/features/character/appearances'

const blankProfile = {
  gender: null,
  age: null,
  birthday: null,
  height: null,
  weight: null,
  measurements: null,
  blood_type: null,
}

const relation = (overrides: Record<string, unknown> = {}) => ({
  group: null,
  label: null,
  role: 'MAIN',
  image: null,
  intro: null,
  trans_intro: null,
  profile: blankProfile,
  ...overrides,
})

const game = (id: number, date: string | null, overrides: Record<string, unknown> = {}) => ({
  ...relation(overrides),
  actors: [],
  voices: [],
  galgame: {
    id,
    origin_title: `game${id}`,
    trans_title: null,
    covers: [],
    nsfw: false,
    release_date: date,
  },
})

const manga = (id: number, date: string | null) => ({
  ...relation(),
  manga: { id, name: `manga${id}`, name_cn: null, covers: [], nsfw: false, publication_date: date },
})

const lists = (galgames: unknown[], mangas: unknown[] = []) =>
  ({
    galgames: { items: galgames },
    light_novels: null,
    mangas: { items: mangas },
  }) as unknown as Parameters<typeof appearancesOf>[0]

const character = {
  intro: 'base',
  trans_intro: null,
  image: null,
  gender: '女',
  blood_type: 'O',
  profile: { age: null, birthday: '9月4日', height: '140cm', weight: null, measurements: null },
} as unknown as Parameters<typeof viewOf>[0]

describe('appearancesOf', () => {
  it('merges every medium into one list ordered by date', () => {
    const list = appearancesOf(lists([game(2, '2010-01-01')], [manga(1, '2005-01-01')]))
    expect(list.map(item => item.key)).toEqual(['manga:1', 'galgame:2'])
    expect(list[1]?.path).toBe('/galgames/2')
  })
})

describe('pickAppearance', () => {
  const list = appearancesOf(
    lists([game(447, '2014-01-01'), game(448, '2015-01-01')], [manga(3, '2020-01-01')]),
  )

  it('opens on the work the reader came from', () => {
    expect(pickAppearance(list, 'galgame:447')?.key).toBe('galgame:447')
    expect(pickAppearance(list, 'manga:3')?.key).toBe('manga:3')
  })

  it('opens on the latest game even when a newer manga exists', () => {
    expect(pickAppearance(list, null)?.key).toBe('galgame:448')
  })

  it('opens on the latest game when the work is not one the character appears in', () => {
    expect(pickAppearance(list, 'galgame:1')?.key).toBe('galgame:448')
    expect(pickAppearance(list, 'light-novel:447')?.key).toBe('galgame:448')
  })

  it('falls back to the latest work without a game', () => {
    const books = appearancesOf(lists([], [manga(3, '2020-01-01')]))
    expect(pickAppearance(books, null)?.key).toBe('manga:3')
  })

  it('has nothing to open without appearances', () => {
    expect(pickAppearance([], 'galgame:447')).toBeNull()
  })
})

describe('readWork', () => {
  it('reads the work key of every medium', () => {
    expect(readWork({ work: 'galgame:447' })).toBe('galgame:447')
    expect(readWork({ work: 'light-novel:12' })).toBe('light-novel:12')
    expect(readWork({ work: 'manga:3' })).toBe('manga:3')
  })

  it('takes the first of repeated values', () => {
    expect(readWork({ work: ['manga:3', 'galgame:447'] })).toBe('manga:3')
  })

  it('reads nothing when the work is missing or malformed', () => {
    expect(readWork({})).toBeNull()
    for (const work of [
      '',
      'galgame',
      'galgame:',
      'galgame:0',
      'galgame:-1',
      'galgame:1a',
      'game:1',
    ])
      expect(readWork({ work })).toBeNull()
    expect(readWork({ work: 447 })).toBeNull()
    expect(readWork({ work: [null] })).toBeNull()
  })
})

describe('characterPath', () => {
  it('links to the character without a work', () => {
    expect(characterPath(9)).toBe('/characters/9')
    expect(characterPath(9, null)).toBe('/characters/9')
  })

  it('carries the work the link comes from', () => {
    expect(characterPath(9, { kind: 'galgame', id: 447 })).toBe('/characters/9?work=galgame:447')
  })

  it('carries a work the page reads back as that appearance', () => {
    const list = appearancesOf(lists([game(447, '2014-01-01'), game(448, '2015-01-01')]))
    const url = new URL(characterPath(9, list[0]), 'https://example.com')
    const key = readWork(Object.fromEntries(url.searchParams))
    expect(pickAppearance(list, key)?.key).toBe('galgame:447')
  })
})

describe('viewOf', () => {
  it('lets the work override the profile and keeps the rest of the character', () => {
    const list = appearancesOf(
      lists([game(1, '2001-01-01', { profile: { ...blankProfile, height: '150cm' } })]),
    )
    const view = viewOf(character, list, list[0] ?? null)
    expect(view.profile).toMatchObject({ height: '150cm', birthday: '9月4日', gender: '女' })
  })

  it('borrows the intro of the nearest work and says which one', () => {
    const list = appearancesOf(
      lists([
        game(1, '2005-01-01', { intro: 'old' }),
        game(2, '2010-01-01'),
        game(3, '2014-01-01', { intro: 'new' }),
      ]),
    )
    const view = viewOf(character, list, list[1] ?? null)
    expect(view.intro).toBe('old')
    expect(view.introFrom?.id).toBe(1)
  })

  it('uses the character intro when no work has one', () => {
    const list = appearancesOf(lists([game(1, '2001-01-01')]))
    const view = viewOf(character, list, list[0] ?? null)
    expect(view.intro).toBe('base')
    expect(view.introFrom).toBeNull()
  })

  it('prefers the translated intro and marks the original', () => {
    const list = appearancesOf(lists([game(1, '2001-01-01', { intro: 'ja', trans_intro: 'zh' })]))
    expect(viewOf(character, list, list[0] ?? null)).toMatchObject({
      intro: 'zh',
      original: false,
    })
  })

  it('falls back to the image of the character with its own rating', () => {
    const limits: ContentLimits = {
      sexual_1_limit: 'JUST_SHOW',
      sexual_2_limit: 'SHOW_WITH_SPOILER',
      violence_1_limit: 'JUST_SHOW',
      violence_2_limit: 'JUST_SHOW',
    }
    const image = (fields: { nsfw: boolean; sexual: number }) => ({
      id: 7,
      src: 'characters/7.webp',
      width: null,
      height: null,
      thumb_hash: null,
      violence: 0,
      ...fields,
    })
    const list = appearancesOf(lists([game(1, '2001-01-01')]))
    const limitOf = (fields: { nsfw: boolean; sexual: number }) => {
      const own = { ...character, image: image(fields) } as Parameters<typeof viewOf>[0]
      return imageLimit(imageSourceSafety(viewOf(own, list, list[0] ?? null).image), limits)
    }
    expect(limitOf({ nsfw: false, sexual: 0 })).toBe('JUST_SHOW')
    expect(limitOf({ nsfw: true, sexual: 0 })).toBe('SHOW_WITH_SPOILER')
    expect(limitOf({ nsfw: false, sexual: 2 })).toBe('SHOW_WITH_SPOILER')
  })
})

describe('namesOf', () => {
  it('drops spellings of the name itself and takes the matching kana as the reading', () => {
    expect(
      namesOf({
        name: '朝武 芳乃',
        reading: null,
        aliases: ['朝武  芳乃', '朝武芳乃', 'Tomotake Yoshino', 'ともたけ よしの'],
      }),
    ).toEqual({ reading: 'ともたけ よしの', aliases: ['Tomotake Yoshino'] })
  })

  it('keeps a kana nickname as an alias', () => {
    expect(
      namesOf({
        name: '芳乃 さくら',
        reading: null,
        aliases: ['芳乃樱', 'さくらんぼ', 'よしの さくら'],
      }),
    ).toEqual({ reading: 'よしの さくら', aliases: ['芳乃樱', 'さくらんぼ'] })
  })

  it('does not guess when several kana names could be the reading', () => {
    expect(
      namesOf({ name: '朝武芳乃', reading: null, aliases: ['ともたけよしの', 'よしのん'] }),
    ).toEqual({ reading: null, aliases: ['ともたけよしの', 'よしのん'] })
  })

  it('prefers a recorded reading', () => {
    expect(namesOf({ name: '朝武芳乃', reading: 'ともたけよしの', aliases: [] }).reading).toBe(
      'ともたけよしの',
    )
  })
})

describe('voiceSummary', () => {
  it('counts one person across credited names and shows the most used name', () => {
    const list = [
      { date: '2001', voices: [{ text: '北都南', person_id: 1 }] },
      { date: '2002', voices: [{ text: '北都 南', person_id: 1 }] },
      { date: '2003', voices: [{ text: '北都 南', person_id: 1 }] },
      { date: '2004', voices: [{ text: '千春', person_id: null }] },
    ] as Appearance[]
    expect(voiceSummary(list).map(voice => [voice.text, voice.count])).toEqual([
      ['北都 南', 3],
      ['千春', 1],
    ])
  })
})

describe('profileRows', () => {
  it('formats the values and drops the empty ones', () => {
    expect(
      profileRows({
        ...blankProfile,
        birthday: '9月4日',
        height: '140cm',
        measurements: 'B68/W51/H72',
      }),
    ).toEqual([
      { label: '生日', value: '9 月 4 日' },
      { label: '身高', value: '140 cm' },
      { label: '三围', value: 'B68 W51 H72' },
    ])
  })
})

describe('galgameCast', () => {
  it('leaves out appearances only the work itself records', () => {
    const rows = [
      { character: { id: 1, name: 'a', image: null }, appearance: { hidden: false, image: null } },
      { character: { id: 2, name: 'b', image: null }, appearance: { hidden: true, image: null } },
    ] as unknown as Parameters<typeof galgameCast>[0]
    expect(galgameCast(rows).map(member => member.id)).toEqual([1])
  })
})
