import { describe, expect, it } from 'vitest'
import {
  changeLines,
  changeTitle,
  changesRoute,
  readChangesQuery,
  type WikiChange,
} from '~/features/wiki/changes'

const part = (id: number, label: string, summary: string | null, type = 'GAME') =>
  ({ id, label, type, summary, reverted_at: null }) as WikiChange['entries'][number]

describe('readChangesQuery', () => {
  it('reads the filter and page and keeps them out of the address when they are the default', () => {
    const state = readChangesQuery({ f: 'unchecked', page: '3' })
    expect(state).toMatchObject({ f: 'unchecked', page: 3 })
    expect(changesRoute(state, 12)).toBe('/create/wiki/changes/12?f=unchecked&page=3')
    expect(changesRoute(readChangesQuery({ f: 'nope', page: '-1' }))).toBe('/create/wiki/changes')
  })
})

describe('changeLines', () => {
  it('writes the summary entry by entry when the entries differ', () => {
    expect(
      changeLines({
        summary: '添加别名「つり乙」；添加别名「月乙」',
        entries: [part(1, '甲', '添加别名「つり乙」'), part(2, '乙', '添加别名「月乙」')],
      }),
    ).toEqual([
      { entry: '甲', text: '添加别名「つり乙」' },
      { entry: '乙', text: '添加别名「月乙」' },
    ])
  })

  it('writes the summary once when every entry has the same or none', () => {
    const summary = '从旧站导入'
    expect(changeLines({ summary, entries: [part(1, '甲', null), part(2, '乙', null)] })).toEqual([
      { entry: null, text: summary },
    ])
    expect(
      changeLines({ summary, entries: [part(1, '甲', summary), part(2, '乙', summary)] }),
    ).toEqual([{ entry: null, text: summary }])
  })
})

describe('changeTitle', () => {
  it('leaves characters out and counts the entries past three', () => {
    expect(
      changeTitle({
        entry_count: 2,
        entries: [part(1, '甲', null), part(9, '', null, 'CHARACTER')],
      }),
    ).toBe('甲')
    expect(
      changeTitle({
        entry_count: 4,
        entries: [
          part(1, '甲', null),
          part(2, '乙', null),
          part(3, '丙', null),
          part(4, '丁', null),
        ],
      }),
    ).toBe('甲、乙、丙等 4 个条目')
  })

  it('counts every entry of the edit when only the first ones come with it', () => {
    expect(
      changeTitle({
        entry_count: 500,
        entries: [part(1, '甲', null), part(2, '乙', null), part(3, '丙', null)],
      }),
    ).toBe('甲、乙、丙等 500 个条目')
  })
})
