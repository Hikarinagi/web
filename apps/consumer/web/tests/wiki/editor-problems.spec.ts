import { describe, expect, it } from 'vitest'
import {
  emptyDraft,
  emptyValue,
  type EntryDefinition,
  type EntryStatement,
} from '~/features/wiki/editor/draft'
import { problemsOf } from '~/features/wiki/editor/problems'

const definition = {
  type: 'PRODUCT',
  label: '发行版本',
  properties: [
    { property: 'TITLE', shape: 'verbatim', required: true },
    { property: 'JAN', shape: 'identifier', required: false },
    { property: 'RELEASE_DATE', shape: 'date', required: false },
    { property: 'CREDIT', shape: 'credit', required: false },
  ],
} as unknown as EntryDefinition
const definitions = new Map([['PRODUCT' as const, definition]])
const title = {
  ...emptyValue(),
  id: 11,
  property: 'TITLE',
  status: 'ACTIVE',
  position: 0,
  text: '通常版',
} as EntryStatement
const product = { id: 5, statements: [title] }
const index = new Map([[11, { entry: 5, statement: title }]])
const messages = (draft: ReturnType<typeof emptyDraft>) =>
  problemsOf(draft, [{ id: 5, type: 'PRODUCT', entry: product }], definitions, index).map(
    item => item.message,
  )

describe('problemsOf', () => {
  it('stops a save that empties a required value or leaves a deleted value without a reason', () => {
    const draft = emptyDraft()
    draft.removed[11] = null
    expect(messages(draft)).toEqual(['必填项为空', '请选择删除原因'])
    draft.removed[11] = 'DUPLICATE'
    expect(messages(draft)).toEqual(['必填项为空'])
  })

  it('checks the form of new values', () => {
    const draft = emptyDraft()
    draft.added.push(
      { id: -1, entry: 5, property: 'JAN', value: { ...emptyValue(), text: '45821729' } },
      { id: -2, entry: 5, property: 'RELEASE_DATE', value: { ...emptyValue(), date: '秋' } },
      { id: -3, entry: 5, property: 'CREDIT', value: { ...emptyValue(), text: '甲' } },
    )
    expect(messages(draft)).toEqual([
      'JAN 应为 13 位数字',
      '日期应写成 2026-10-04、2026-10 或 2026',
      '制作信息缺职责',
    ])
  })

  it('passes a change that only fixes a value', () => {
    const draft = emptyDraft()
    draft.changed[11] = { ...emptyValue(), text: '初回限定版' }
    expect(messages(draft)).toEqual([])
  })
})
