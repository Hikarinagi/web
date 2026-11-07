import { describe, expect, it } from 'vitest'
import {
  appearancesOf,
  defaultAppearance,
  galgameCast,
  profileRows,
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

  it('opens on the latest game even when a newer manga exists', () => {
    const list = appearancesOf(
      lists([game(1, '2001-01-01'), game(2, '2010-01-01')], [manga(3, '2020-01-01')]),
    )
    expect(defaultAppearance(list)?.key).toBe('galgame:2')
  })

  it('falls back to the latest work without a game', () => {
    const list = appearancesOf(lists([], [manga(3, '2020-01-01')]))
    expect(defaultAppearance(list)?.key).toBe('manga:3')
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
