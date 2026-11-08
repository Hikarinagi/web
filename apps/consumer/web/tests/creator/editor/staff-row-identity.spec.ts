import { describe, expect, it } from 'vitest'
import type { BackendEditorField } from '~/features/creator/editor'
import { applyChangeset } from '~/features/creator/editor/applyChangeset'
import { diffSnapshot } from '~/features/creator/editor/diffSnapshot'
import type { EditorRelationRow } from '~/features/creator/editor/relation'
import { validateRelations } from '~/features/creator/editor/relation-validation'

const staffField = {
  field: 'staffs',
  kind: 'relation',
  scope: 'work.galgame.relation.entity',
  target: 'person',
  row_identity: true,
  unique_attributes: ['role'],
  attributes: [{ name: 'role', value_type: 'enum' }],
} as unknown as BackendEditorField

function row(relationId: number | undefined, role: string): EditorRelationRow {
  return {
    ...(relationId !== undefined && { relation_id: relationId }),
    target_id: 7,
    target: { name: '同一个人', cover: null },
    attributes: { role },
  }
}

describe('staff relation row identity', () => {
  it('diffs one role without collapsing another role for the same person', () => {
    const base = { staffs: [row(31, 'PRODUCER'), row(32, 'SCENARIO')] }
    const draft = { staffs: [row(31, 'PRODUCER'), row(32, 'DIRECTOR')] }

    expect(diffSnapshot(base, draft, [staffField])).toEqual([
      {
        kind: 'relation_update',
        relation: 'staffs',
        relation_id: 32,
        target_id: 7,
        target_name: '同一个人',
        target_cover: undefined,
        attributes: { role: { from: 'SCENARIO', to: 'DIRECTOR' } },
      },
    ])
  })

  it('removes only the selected role row', () => {
    const base = { staffs: [row(31, 'PRODUCER'), row(32, 'SCENARIO')] }
    const draft = { staffs: [row(31, 'PRODUCER')] }

    expect(diffSnapshot(base, draft, [staffField])).toEqual([
      {
        kind: 'relation_remove',
        relation: 'staffs',
        relation_id: 32,
        target_id: 7,
        target_name: '同一个人',
        target_cover: undefined,
      },
    ])
  })

  it('keeps independent additions for the same person', () => {
    const draft = { staffs: [row(undefined, 'PRODUCER'), row(undefined, 'SCENARIO')] }
    const changeset = diffSnapshot({ staffs: [] }, draft, [staffField])

    expect(changeset).toHaveLength(2)
    expect(changeset.map(op => ('attributes' in op ? op.attributes : undefined))).toEqual([
      { role: 'PRODUCER' },
      { role: 'SCENARIO' },
    ])
  })

  it('applies an identified update and remove to only their rows', () => {
    const base = { staffs: [row(31, 'PRODUCER'), row(32, 'SCENARIO')] }
    const result = applyChangeset(base, [
      {
        kind: 'relation_update',
        relation: 'staffs',
        relation_id: 32,
        target_id: 7,
        attributes: { role: { from: 'SCENARIO', to: 'DIRECTOR' } },
      },
      { kind: 'relation_remove', relation: 'staffs', relation_id: 31, target_id: 7 },
    ] as never)

    expect(result.staffs).toEqual([row(32, 'DIRECTOR')])
  })

  it('uses role.from to apply a legacy update to one matching row', () => {
    const base = { staffs: [row(31, 'PRODUCER'), row(32, 'SCENARIO')] }
    const result = applyChangeset(base, [
      {
        kind: 'relation_update',
        relation: 'staffs',
        target_id: 7,
        attributes: { role: { from: 'SCENARIO', to: 'DIRECTOR' } },
      },
    ] as never)

    expect(result.staffs).toEqual([row(31, 'PRODUCER'), row(32, 'DIRECTOR')])
  })

  it('appends legacy additions instead of replacing an existing role row', () => {
    const base = { staffs: [row(31, 'PRODUCER')] }
    const result = applyChangeset(base, [
      {
        kind: 'relation_add',
        relation: 'staffs',
        target_id: 7,
        target_name: '同一个人',
        attributes: { role: 'SCENARIO' },
      },
    ] as never)

    expect(result.staffs).toEqual([row(31, 'PRODUCER'), row(undefined, 'SCENARIO')])
  })

  it('reports duplicate roles for the same person before submission', () => {
    expect(
      validateRelations([staffField], {
        staffs: [row(31, 'PRODUCER'), row(undefined, 'PRODUCER')],
      }),
    ).toEqual({ staffs: '同一人物不能重复添加相同职责' })
  })
})
