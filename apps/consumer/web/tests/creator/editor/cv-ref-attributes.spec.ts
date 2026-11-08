import { describe, expect, it } from 'vitest'
import type { BackendEditorField } from '~/features/creator/editor'
import { applyChangeset } from '~/features/creator/editor/applyChangeset'
import { diffSnapshot } from '~/features/creator/editor/diffSnapshot'
import type { EditorRelationRow } from '~/features/creator/editor/relation'

const charactersField = {
  field: 'characters',
  kind: 'relation',
  scope: 'work.galgame.relation.entity',
  target: 'character',
  attributes: [{ name: 'role', value_type: 'string' }],
  ref_attributes: [{ name: 'actors', ref_target: 'person', multiple: true }],
} as unknown as BackendEditorField

function row(
  id: number,
  role: string,
  actors: { id: number; name?: string; cover?: string | null }[],
): EditorRelationRow {
  return {
    target_id: id,
    target: { name: `Char${id}`, cover: null },
    attributes: { role },
    ref_attributes: {
      actors: actors.map(a => ({ id: a.id, name: a.name ?? `P${a.id}`, cover: a.cover ?? null })),
    },
  }
}

describe('diffSnapshot — CV ref attribute', () => {
  it('emits a CV-only relation_update with empty scalar attributes', () => {
    const base = { characters: [row(5, '主角', [{ id: 4 }])] }
    const draft = { characters: [row(5, '主角', [{ id: 4 }, { id: 9 }])] }
    const changeset = diffSnapshot(base, draft, [charactersField])
    expect(changeset).toHaveLength(1)
    expect(changeset[0]).toMatchObject({
      kind: 'relation_update',
      relation: 'characters',
      target_id: 5,
      attributes: {},
      ref_attributes: { actors: { from: [{ id: 4 }], to: [{ id: 4 }, { id: 9 }] } },
    })
  })

  it('combines a role change and a CV change in one relation_update', () => {
    const base = { characters: [row(5, '配角', [{ id: 4 }])] }
    const draft = { characters: [row(5, '主角', [])] }
    const changeset = diffSnapshot(base, draft, [charactersField])
    expect(changeset[0]).toMatchObject({
      kind: 'relation_update',
      attributes: { role: { from: '配角', to: '主角' } },
      ref_attributes: { actors: { from: [{ id: 4 }], to: [] } },
    })
  })

  it('carries CV actors on a relation_add', () => {
    const base = { characters: [] as EditorRelationRow[] }
    const draft = { characters: [row(5, '主角', [{ id: 4, name: '声优A' }])] }
    const changeset = diffSnapshot(base, draft, [charactersField])
    expect(changeset[0]).toMatchObject({
      kind: 'relation_add',
      target_id: 5,
      attributes: { role: '主角' },
      ref_attributes: { actors: [{ id: 4, name: '声优A' }] },
    })
  })

  it('ignores CV reordering when the id set is unchanged', () => {
    const base = { characters: [row(5, '主角', [{ id: 4 }, { id: 9 }])] }
    const draft = { characters: [row(5, '主角', [{ id: 9 }, { id: 4 }])] }
    expect(diffSnapshot(base, draft, [charactersField])).toEqual([])
  })

  it('omits ref_attributes on a relation_add with no CV', () => {
    const base = { characters: [] as EditorRelationRow[] }
    const draft = { characters: [row(5, '主角', [])] }
    const changeset = diffSnapshot(base, draft, [charactersField])
    expect(changeset[0]).toMatchObject({ kind: 'relation_add', target_id: 5 })
    expect((changeset[0] as { ref_attributes?: unknown }).ref_attributes).toBeUndefined()
  })
})

describe('applyChangeset — CV ref attribute', () => {
  it('applies a CV-only relation_update onto the base row', () => {
    const base = { characters: [row(5, '主角', [{ id: 4 }])] }
    const payload = [
      {
        kind: 'relation_update',
        relation: 'characters',
        target_id: 5,
        attributes: {},
        ref_attributes: {
          actors: { from: [{ id: 4 }], to: [{ id: 4 }, { id: 9, name: '声优B' }] },
        },
      },
    ]
    const result = applyChangeset(base, payload as never)
    const rows = result.characters as EditorRelationRow[]
    // id 4 came in bare (no name) → name backfilled from the base row; id 9 carried its own name.
    expect(rows[0]?.ref_attributes?.actors).toEqual([
      { id: 4, name: 'P4', cover: null },
      { id: 9, name: '声优B', cover: null },
    ])
  })

  it('carries CV actors onto a relation_add row', () => {
    const base = { characters: [] as EditorRelationRow[] }
    const payload = [
      {
        kind: 'relation_add',
        relation: 'characters',
        target_id: 5,
        target_name: 'Char5',
        attributes: { role: '主角' },
        ref_attributes: { actors: [{ id: 4, name: '声优A', cover: 'a.webp' }] },
      },
    ]
    const result = applyChangeset(base, payload as never)
    const rows = result.characters as EditorRelationRow[]
    expect(rows[0]?.ref_attributes?.actors).toEqual([{ id: 4, name: '声优A', cover: 'a.webp' }])
  })
})
