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
  it('sends the whole value when part of it changed, and only the qualifiers that changed', () => {
    const draft = emptyDraft()
    draft.changed[11] = { ...valueOf(alias), text: 'つりおつ', reading: '' }
    const [modify] = operationsOf(draft, index)
    expect(modify).toMatchObject({ op: 'modify', statement: 11 })
    expect(modify!.value).toMatchObject({
      text: 'つりおつ',
      reading: null,
      code: null,
      target: null,
      media_id: null,
    })
    expect(modify).not.toHaveProperty('qualifiers')
    draft.changed[11] = { ...valueOf(alias), part: '全年龄版' }
    expect(operationsOf(draft, index)).toEqual([
      { op: 'modify', statement: 11, qualifiers: { part: '全年龄版' } },
    ])
  })

  it('keeps the role and the person of a credit whose written name changed', () => {
    const credit = statement({
      id: 21,
      property: 'CREDIT',
      text: '夏野 こおり',
      code: 'VOICE',
      target: { id: 9, type: 'PERSON', label: '田口 宏子' },
    })
    const draft = emptyDraft()
    draft.changed[21] = { ...valueOf(credit), text: '夏野こおり' }
    const [modify] = operationsOf(draft, new Map([[21, { entry: 5, statement: credit }]]))
    expect(modify!.value).toMatchObject({ text: '夏野こおり', code: 'VOICE', target: 9 })
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

  it('sends whether a value is public only when it is added as not public or that changed', () => {
    const name = statement({ id: 31, property: 'NAME', text: 'アルトリア' })
    const names = new Map([[31, { entry: 7, statement: name }]])
    const draft = emptyDraft()
    draft.added.push(
      { id: -1, entry: 7, property: 'NAME', value: { ...emptyValue(), text: '騎士王' } },
      {
        id: -2,
        entry: 7,
        property: 'NAME',
        value: { ...emptyValue(), text: '真名', is_public: false },
      },
    )
    draft.changed[31] = { ...valueOf(name), is_public: false }
    const [open, hidden, modify] = operationsOf(draft, names)
    expect(open).not.toHaveProperty('is_public')
    expect(hidden).toMatchObject({ op: 'add', is_public: false })
    expect(modify).toEqual({ op: 'modify', statement: 31, is_public: false })
    expect(changeCount(draft)).toBe(3)
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
