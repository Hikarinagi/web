import { describe, expect, it } from 'vitest'
import { castGroupOf, castGroups, type CastFacts } from '~/features/wiki/editor/cast'
import { emptyDraft, emptyValue } from '~/features/wiki/editor/draft'
import { changedParts } from '~/features/wiki/editor/parts'
import { castOrderRows, reviewCount, type ReviewGroup } from '~/features/wiki/editor/review'
import { sameName } from '~/features/wiki/entries'

const facts = (id: number, fields: Partial<CastFacts> = {}): CastFacts => ({
  id,
  role: null,
  protagonist: false,
  capturable: false,
  order: null,
  before: null,
  ...fields,
})

describe('cast groups', () => {
  it('puts a capturable character before the protagonist and the protagonist before other leads', () => {
    expect(castGroupOf(facts(1, { role: 'MAIN', capturable: true, protagonist: true }), true)).toBe(
      'capturable',
    )
    expect(castGroupOf(facts(1, { role: 'MAIN', protagonist: true }), true)).toBe('protagonist')
    expect(castGroupOf(facts(1, { role: 'MAIN' }), true)).toBe('main')
    expect(castGroupOf(facts(1, { role: 'CAMEO' }), true)).toBe('cameo')
    expect(castGroupOf(facts(1), true)).toBe('none')
  })

  it('has no protagonist or capturable groups for light novels and manga', () => {
    const groups = castGroups([facts(1, { role: 'MAIN', capturable: true }), facts(2)], false)
    expect(groups.map(group => [group.key, group.title, group.ids])).toEqual([
      ['main', '主角', [1]],
      ['none', '定位未记录', [2]],
    ])
  })

  it('sorts a group by its order and keeps unnumbered rows after them in their first sequence', () => {
    const rows = [
      facts(1, { role: 'SUPPORTING' }),
      facts(2, { role: 'SUPPORTING', order: 5, before: 1 }),
      facts(3, { role: 'SUPPORTING', order: 2, before: 2 }),
      facts(4, { role: 'SUPPORTING' }),
    ]
    expect(castGroups(rows, true)[0]).toMatchObject({ title: '配角', ids: [3, 2, 1, 4] })
    expect(castGroups(rows, true, 'before')[0]!.ids).toEqual([2, 3, 1, 4])
  })
})

describe('cast order in the save drawer', () => {
  const row = (id: number, property: string) =>
    ({ id, property, value: emptyValue() }) as unknown as ReviewGroup['rows'][number]
  const groups: ReviewGroup[] = [
    { id: 11, type: 'APPEARANCE', created: false, rows: [row(1, 'ORDER'), row(2, 'LABEL')] },
    { id: 12, type: 'APPEARANCE', created: false, rows: [row(3, 'ORDER')] },
    { id: -1, type: 'APPEARANCE', created: true, rows: [row(-2, 'ORDER')] },
  ]

  it('counts the order changes of a work as one change', () => {
    expect(castOrderRows(groups, 'GAME').map(item => item.id)).toEqual([1, 3])
    expect(reviewCount(groups, emptyDraft(), 'GAME')).toBe(3)
    expect(reviewCount(groups, emptyDraft(), 'APPEARANCE')).toBe(4)
  })

  it('counts them once on the cast tab too', () => {
    const draft = emptyDraft()
    draft.added = [11, 12, 13].map((entry, index) => ({
      id: -1 - index,
      entry,
      property: 'ORDER' as const,
      value: { ...emptyValue(), number: index + 1 },
    }))
    draft.added.push({ id: -9, entry: 11, property: 'CAST_ROLE', value: emptyValue() })
    expect(changedParts('GAME', draft, new Map(), () => 'APPEARANCE')).toEqual({ cast: 2 })
  })
})

describe('sameName', () => {
  it('ignores spaces, middle dots and width', () => {
    expect(sameName('浅野 ゆず', '浅野ゆず')).toBe(true)
    expect(sameName('ＡＢＣ・Ｄ', 'abcd')).toBe(true)
    expect(sameName('浅野 ゆず', '浅野 ゆか')).toBe(false)
  })
})
