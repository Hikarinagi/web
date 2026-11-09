import { describe, expect, it } from 'vitest'
import {
  changeCount,
  emptyDraft,
  emptyValue,
  operationsOf,
  valueOf,
  type EntryStatement,
} from '~/features/wiki/editor/draft'
import { propertyOf } from '~/features/wiki/editor/working'

const statement = (fields: Partial<EntryStatement>): EntryStatement =>
  ({
    ...emptyValue(),
    id: 1,
    property: 'ALIAS',
    status: 'ACTIVE',
    position: 0,
    is_public: true,
    deprecation_reason: null,
    deprecation_note: null,
    citations: [],
    editor: { id: 1, name: 'a', nickname: null, avatar: null },
    ...fields,
  }) as EntryStatement

const alias = statement({ id: 11, text: 'つり乙' })
const old = statement({ id: 12, text: '月乙', status: 'DEPRECATED' })
const game = { id: 5, statements: [alias, old] }
const index = new Map(game.statements.map(item => [item.id, { entry: 5, statement: item }]))

describe('operationsOf', () => {
  it('sends only the fields that changed, and clears an emptied field', () => {
    const draft = emptyDraft()
    draft.changed[11] = { ...valueOf(alias), text: 'つりおつ', reading: '' }
    expect(operationsOf(draft, index)).toEqual([
      { op: 'modify', statement: 11, value: { text: 'つりおつ' } },
    ])
    draft.changed[11] = { ...valueOf(alias), part: '全年龄版' }
    expect(operationsOf(draft, index)).toEqual([
      { op: 'modify', statement: 11, qualifiers: { part: '全年龄版' } },
    ])
  })

  it('creates a new entry by reference and points values at it', () => {
    const draft = emptyDraft()
    draft.created.push({ id: -1, type: 'PRODUCT' })
    draft.added.push({
      id: -2,
      entry: -1,
      property: 'INCLUDED_GAME',
      value: { ...emptyValue(), target: { id: 5, type: 'GAME', label: '甲' }, code: 'FULL' },
    })
    draft.moved[11] = -1
    const operations = operationsOf(draft, index)
    expect(operations[0]).toEqual({ op: 'create_entry', ref: 'n1', type: 'PRODUCT' })
    expect(operations[1]).toMatchObject({
      op: 'add',
      entry_ref: 'n1',
      property: 'INCLUDED_GAME',
      value: { target: 5, code: 'FULL', text: null },
      qualifiers: { versions: [] },
    })
    expect(operations[2]).toEqual({ op: 'move', statement: 11, target_ref: 'n1' })
    expect(changeCount(draft)).toBe(2)
  })

  it('leaves a value set back to what it was out of the edit', () => {
    const draft = emptyDraft()
    draft.changed[11] = valueOf(alias)
    expect(operationsOf(draft, index)).toEqual([])
  })
})

describe('propertyOf', () => {
  it('marks changed, removed and restored values and keeps the deleted ones apart', () => {
    const draft = emptyDraft()
    draft.changed[11] = { ...valueOf(alias), text: 'つりおつ' }
    let view = propertyOf(game, 5, 'ALIAS', draft, index)
    expect(view.values.map(item => [item.id, item.state, item.value.text])).toEqual([
      [11, 'changed', 'つりおつ'],
    ])
    expect(view.values[0]?.before?.text).toBe('つり乙')
    expect(view.deprecated.map(item => item.id)).toEqual([12])

    draft.removed[11] = 'DUPLICATE'
    draft.restored.push(12)
    view = propertyOf(game, 5, 'ALIAS', draft, index)
    expect(view.values.map(item => [item.id, item.state])).toEqual([
      [11, 'removed'],
      [12, 'restored'],
    ])
    expect(view.deprecated).toEqual([])
  })
})
