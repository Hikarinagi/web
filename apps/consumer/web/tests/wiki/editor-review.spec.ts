import { describe, expect, it } from 'vitest'
import {
  emptyDraft,
  emptyValue,
  type EntryDefinition,
  type EntryStatement,
} from '~/features/wiki/editor/draft'
import { reviewCount, reviewOf } from '~/features/wiki/editor/review'

const statement = (fields: Partial<EntryStatement>): EntryStatement =>
  ({
    ...emptyValue(),
    id: 1,
    property: 'WEBSITE',
    status: 'ACTIVE',
    position: 0,
    is_public: true,
    deprecation_reason: null,
    deprecation_note: null,
    citations: [],
    editor: { id: 1, name: 'a', nickname: null, avatar: null },
    ...fields,
  }) as EntryStatement

const media = { id: 7, path: 'a.webp', width: 1, height: 1, sexual: 0, violence: 0 }
const sites = [1, 2, 3].map(id => statement({ id, text: `https://example.com/${id}` }))
const image = statement({ id: 9, property: 'SAMPLE_IMAGE', media } as Partial<EntryStatement>)
const game = { id: 5, type: 'GAME' as const, entry: { id: 5, statements: [...sites, image] } }
const index = new Map(game.entry.statements.map(item => [item.id, { entry: 5, statement: item }]))
const definitions = new Map([
  [
    'GAME' as const,
    {
      type: 'GAME',
      label: '游戏',
      properties: [
        { property: 'WEBSITE', label: '作品官网', shape: 'url' },
        { property: 'SAMPLE_IMAGE', label: '示例 CG 与截图', shape: 'image' },
      ],
    } as unknown as EntryDefinition,
  ],
])

describe('reviewOf', () => {
  it('lists a changed rating and counts a reordering once for its property', () => {
    const draft = emptyDraft()
    draft.rated[7] = { sexual: 2, violence: 0 }
    draft.positions = { 1: 1, 2: 0, 3: 2 }
    const groups = reviewOf(draft, [game], definitions, index)
    const rows = groups[0]!.rows
    expect(rows.map(row => [row.label, row.ordered.length, Boolean(row.rating)])).toEqual([
      ['作品官网', 3, false],
      ['示例 CG 与截图', 0, true],
    ])
    expect(rows[1]!.rating).toEqual({
      before: { sexual: 0, violence: 0 },
      after: { sexual: 2, violence: 0 },
    })
    expect(reviewCount(groups, draft)).toBe(2)
  })

  it('shows nothing and counts nothing when the draft is back where it started', () => {
    expect(reviewCount(reviewOf(emptyDraft(), [game], definitions, index), emptyDraft())).toBe(0)
  })
})
