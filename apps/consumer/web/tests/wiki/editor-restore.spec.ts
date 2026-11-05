import { describe, expect, it } from 'vitest'
import { emptyDraft, emptyValue, type EntryStatement } from '~/features/wiki/editor/draft'
import { restoreInto } from '~/features/wiki/editor/restore'
import type { ComparedStatement } from '~/features/wiki/values'

const statement = (fields: Partial<EntryStatement>) =>
  ({
    ...emptyValue(),
    property: 'ALIAS',
    status: 'ACTIVE',
    position: 0,
    citations: [],
    ...fields,
  }) as EntryStatement

describe('restoreInto', () => {
  it('fills the editor with an old version: changed back, brought back and taken out', () => {
    const current = {
      id: 5,
      revision: 4,
      statements: [
        statement({ id: 1, text: 'つりおつ' }),
        statement({ id: 2, text: '月乙', status: 'DEPRECATED' }),
        statement({ id: 3, text: '後から足した別名' }),
        statement({ id: 4, text: '同じ' }),
      ],
    }
    const version = [
      statement({ id: 1, text: 'つり乙' }),
      statement({ id: 2, text: '月乙' }),
      statement({ id: 4, text: '同じ' }),
    ] as unknown as ComparedStatement[]
    const draft = emptyDraft()
    restoreInto(draft, current, version)
    expect(draft.base).toEqual({ 5: 4 })
    expect(Object.keys(draft.changed)).toEqual(['1'])
    expect(draft.changed[1]?.text).toBe('つり乙')
    expect(draft.restored).toEqual([2])
    expect(draft.removed).toEqual({ 3: null })
  })
})
