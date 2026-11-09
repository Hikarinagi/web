import { describe, expect, it } from 'vitest'
import { emptyDraft, emptyValue, type ValueDraft } from '~/features/wiki/editor/draft'
import { changedParts } from '~/features/wiki/editor/parts'
import { relationRows } from '~/features/wiki/editor/relations'
import type { WorkingValue } from '~/features/wiki/editor/working'

const game = (id: number, label: string) => ({ id, type: 'GAME' as const, label })
const root = game(1, 'D.C.')
const sequel = game(2, 'D.C.II')
const fandisc = game(3, 'D.C.P.C.')
const value = (
  id: number,
  target: NonNullable<ValueDraft['target']>,
  code: string,
  state: WorkingValue['state'] = 'same',
): WorkingValue => ({
  id,
  property: 'GAME_RELATION',
  value: { ...emptyValue(), target, code },
  before: null,
  state,
  reason: null,
  moved: null,
})
const incoming = (statement_id: number, entry: typeof sequel, code: string) => ({
  statement_id,
  code,
  entry,
  period_from: null,
  period_from_precision: null,
  period_to: null,
  period_to_precision: null,
})

describe('relation rows', () => {
  it('lists the relations the work records and the ones other works record about it', () => {
    const rows = relationRows(
      root,
      [value(10, fandisc, 'FAN_DISC')],
      [incoming(20, sequel, 'SEQUEL')],
      new Map(),
    )
    expect(rows.map(row => [row.side, row.holder, row.other.id, row.code, row.state])).toEqual([
      ['held', 1, 3, 'FAN_DISC', 'same'],
      ['given', 2, 2, 'SEQUEL', 'same'],
    ])
  })

  it('reads a relation recorded by another work from that work once it is borrowed', () => {
    const rows = relationRows(
      root,
      [],
      [incoming(20, sequel, 'SEQUEL')],
      new Map([[2, { entry: sequel, values: [value(20, root, 'SIDE_STORY', 'changed')] }]]),
    )
    expect(rows).toMatchObject([
      { side: 'given', id: 20, code: 'SIDE_STORY', state: 'changed', undo: [20] },
    ])
  })

  it('shows a relation moved to the other work as one flipped row that undoes both changes', () => {
    const rows = relationRows(
      root,
      [value(10, sequel, 'SEQUEL', 'removed')],
      [],
      new Map([[2, { entry: sequel, values: [value(-1, root, 'SEQUEL', 'added')] }]]),
    )
    expect(rows).toMatchObject([
      { side: 'given', holder: 2, id: -1, other: { id: 2 }, state: 'flipped', undo: [-1, 10] },
    ])
  })

  it('keeps a plain deletion and a new relation on another work apart', () => {
    const rows = relationRows(
      root,
      [value(10, sequel, 'SEQUEL', 'removed')],
      [],
      new Map([[3, { entry: fandisc, values: [value(-1, root, 'FAN_DISC', 'added')] }]]),
    )
    expect(rows.map(row => [row.other.id, row.state])).toEqual([
      [2, 'removed'],
      [3, 'added'],
    ])
  })
})

describe('relation part counts', () => {
  it('counts a change to a relation another game records under the related works part', () => {
    const draft = { ...emptyDraft(), borrowed: [2], removed: { 20: null } }
    const statements = new Map([
      [
        20,
        {
          entry: 2,
          statement: { id: 20, property: 'GAME_RELATION' } as never,
        },
      ],
    ])
    expect(changedParts('GAME', draft, statements, () => 'GAME')).toEqual({ relations: 1 })
  })
})
