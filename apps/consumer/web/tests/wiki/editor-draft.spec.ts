import { describe, expect, it } from 'vitest'
import {
  changeCount,
  contradictingErrors,
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

  it('records a developer on the game and withdraws the same developer from a release in one edit', () => {
    const developer = statement({
      id: 31,
      property: 'CREDIT',
      text: 'Navel',
      code: 'DEVELOPER',
      target: { id: 400, type: 'ORGANIZATION', label: 'Navel' },
    })
    const draft = emptyDraft()
    draft.added.push({ id: -1, entry: 5, property: 'CREDIT', value: valueOf(developer) })
    draft.removed[31] = 'WRONG_ENTRY'
    expect(operationsOf(draft, new Map([[31, { entry: 7, statement: developer }]]))).toEqual([
      expect.objectContaining({
        op: 'add',
        entry: 5,
        property: 'CREDIT',
        value: expect.objectContaining({ text: 'Navel', code: 'DEVELOPER', target: 400 }),
      }),
      { op: 'deprecate', statement: 31, reason: 'WRONG_ENTRY' },
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

  it('sends a title logo uploaded for a language as an image value with that language', () => {
    const media = { id: 70, src: 'images/logo.webp', width: 751, height: 390 }
    const logo = statement({ id: 41, property: 'TITLE_LOGO', media } as Partial<EntryStatement>)
    const draft = emptyDraft()
    draft.added.push({
      id: -1,
      entry: 5,
      property: 'TITLE_LOGO',
      value: { ...emptyValue(), media: { ...media, id: 71 }, language: 'zh-Hans' },
    })
    draft.changed[41] = { ...valueOf(logo), language: 'en' }
    expect(operationsOf(draft, new Map([[41, { entry: 5, statement: logo }]]))).toEqual([
      expect.objectContaining({
        op: 'add',
        entry: 5,
        property: 'TITLE_LOGO',
        value: expect.objectContaining({ media_id: 71, text: null }),
        qualifiers: expect.objectContaining({ language: 'zh-Hans' }),
      }),
      { op: 'modify', statement: 41, qualifiers: { language: 'en' } },
    ])
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

  it('sends the contradicting excerpt with a value deleted as wrong and leaves it off other reasons', () => {
    const draft = emptyDraft()
    draft.removed[11] = 'CONTRADICTED'
    draft.contradicting[11] = {
      url: ' https://project-navel.com/tsukiniyorisou/outline.html ',
      excerpt: ' 略称は「つり乙」 ',
    }
    expect(operationsOf(draft, index)).toEqual([
      {
        op: 'deprecate',
        statement: 11,
        reason: 'CONTRADICTED',
        citations: [
          {
            method: 'EXCERPT',
            url: 'https://project-navel.com/tsukiniyorisou/outline.html',
            excerpt: '略称は「つり乙」',
          },
        ],
      },
    ])
    draft.removed[11] = 'DUPLICATE'
    expect(operationsOf(draft, index)).toEqual([
      { op: 'deprecate', statement: 11, reason: 'DUPLICATE' },
    ])
  })

  it('sends the places searched with a value deleted as unverifiable', () => {
    const draft = emptyDraft()
    draft.removed[11] = 'BAD_SOURCE'
    draft.searched[11] = ' 官网、Steam 商店页与发售公告均无此名称 '
    expect(operationsOf(draft, index)).toEqual([
      {
        op: 'deprecate',
        statement: 11,
        reason: 'BAD_SOURCE',
        note: '官网、Steam 商店页与发售公告均无此名称',
      },
    ])
  })
})

describe('contradictingErrors', () => {
  it('puts what the server says of a contradicting source on the input of that value', () => {
    const operations = operationsOf(
      { ...emptyDraft(), removed: { 11: 'DUPLICATE', 12: 'CONTRADICTED' } },
      index,
    )
    expect(
      contradictingErrors(operations, {
        'operations.1.citations.0.excerpt': '所附网页中未找到这段摘录',
        'operations.0.citations.0.url': '无法读取所附网页',
        note: '编辑说明不能超过 500 字',
      }),
    ).toEqual({
      '12.excerpt': '所附网页中未找到这段摘录',
      '11.url': '无法读取所附网页',
    })
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
